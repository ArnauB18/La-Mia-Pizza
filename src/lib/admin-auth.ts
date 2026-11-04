/**
 * Accés a l'administració amb una contrasenya única (prototip, sense comptes).
 *
 * - La contrasenya va a la variable d'entorn ADMIN_PASSWORD.
 * - En local, si no n'hi ha, es fa servir "lamia" perquè es pugui provar de seguida.
 * - En producció (Vercel), sense ADMIN_PASSWORD l'admin queda DESACTIVADA.
 *
 * La galeta de sessió conté una signatura HMAC (no la contrasenya), és httpOnly
 * i dura 7 dies. Si es canvia la contrasenya, totes les sessions caduquen.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "lmp_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? null : "lamia";
}

function sign(expires: number, password: string): string {
  return createHmac("sha256", password).update(`admin:${expires}`).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(candidate: string): boolean {
  const pw = adminPassword();
  return pw !== null && safeEqual(candidate, pw);
}

export async function startAdminSession(): Promise<void> {
  const pw = adminPassword();
  if (!pw) return;
  const expires = Date.now() + MAX_AGE * 1000;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, pw)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const pw = adminPassword();
  if (!pw) return false;
  const value = (await cookies()).get(COOKIE)?.value ?? "";
  const [exp, sig] = value.split(".");
  const expires = Number(exp);
  if (!expires || !sig || expires < Date.now()) return false;
  return safeEqual(sig, sign(expires, pw));
}
