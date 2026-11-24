/**
 * Protecció de l'entrada a l'admin contra qui prova contrasenyes una rere l'altra.
 *
 *   - Per IP: 5 errors en 15 min → aquella IP queda bloquejada 15 min.
 *   - Global: 30 errors en 15 min (de qualsevol IP) → l'entrada es bloqueja per
 *     a tothom 15 min. Atura atacs repartits entre moltes IP.
 *   - El bloqueig es comprova ABANS de mirar la contrasenya: mentre dura, no es
 *     pot provar res. Una entrada correcta reinicia el comptador d'aquella IP.
 *
 * Es desa a la base de dades (a Vercel cada petició pot anar a un servidor
 * diferent, així que un comptador en memòria no serviria). La IP es desa com
 * a empremta SHA-256, mai en clar.
 */
import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";

export const LOGIN_POLICY = {
  perIp: { maxFailures: 5, windowMinutes: 15, lockMinutes: 15 },
  global: { maxFailures: 30, windowMinutes: 15, lockMinutes: 15 },
} as const;

const { loginAttempts } = schema;

/** IP del client. A Vercel, x-forwarded-for el posa la plataforma (no el pot falsejar el client). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "desconeguda";
}

function ipKey(ip: string): string {
  // La contrasenya fa de "sal": sense ella, l'empremta no permet tornar a la IP
  const salt = process.env.ADMIN_PASSWORD ?? "lamia";
  return "ip:" + createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 32);
}

export type GuardStatus = { allowed: true } | { allowed: false; retryAfterMinutes: number };

/** Es pot intentar entrar ara des d'aquesta IP? */
export async function checkLoginAllowed(ip: string): Promise<GuardStatus> {
  const db = await getDb();
  const rows = await db
    .select({ key: loginAttempts.key, lockedUntil: loginAttempts.lockedUntil })
    .from(loginAttempts)
    .where(sql`${loginAttempts.key} in (${ipKey(ip)}, 'global') and ${loginAttempts.lockedUntil} > now()`);
  if (rows.length === 0) return { allowed: true };
  const until = Math.max(...rows.map((r) => new Date(r.lockedUntil!).getTime()));
  return { allowed: false, retryAfterMinutes: Math.max(1, Math.ceil((until - Date.now()) / 60_000)) };
}

/**
 * Suma un error a un comptador. Si la finestra ha caducat, torna a començar;
 * si arriba al màxim, bloqueja. Tot en una sola sentència (segura amb peticions simultànies).
 */
async function bump(key: string, p: { maxFailures: number; windowMinutes: number; lockMinutes: number }) {
  const db = await getDb();
  await db.execute(sql`
    insert into login_attempts (key, failures, window_start, locked_until)
    values (${key}, 1, now(), null)
    on conflict (key) do update set
      failures = case when login_attempts.window_start < now() - make_interval(mins => ${p.windowMinutes})
                      then 1 else login_attempts.failures + 1 end,
      window_start = case when login_attempts.window_start < now() - make_interval(mins => ${p.windowMinutes})
                          then now() else login_attempts.window_start end,
      locked_until = case when login_attempts.window_start >= now() - make_interval(mins => ${p.windowMinutes})
                               and login_attempts.failures + 1 >= ${p.maxFailures}
                          then now() + make_interval(mins => ${p.lockMinutes})
                          else login_attempts.locked_until end`);
}

export async function recordLoginFailure(ip: string): Promise<void> {
  await Promise.all([bump(ipKey(ip), LOGIN_POLICY.perIp), bump("global", LOGIN_POLICY.global)]);
  // Queda als registres de Vercel (Logs), sense la IP en clar
  console.warn(`[admin] Intent d'entrada fallit (${ipKey(ip)})`);
}

export async function recordLoginSuccess(ip: string): Promise<void> {
  const db = await getDb();
  await db.delete(loginAttempts).where(eq(loginAttempts.key, ipKey(ip)));
}
