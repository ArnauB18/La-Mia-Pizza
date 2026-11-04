/**
 * Connexió a la base de dades.
 *
 * - Amb `DATABASE_URL` (Vercel + Neon, o qualsevol Postgres): driver postgres.js.
 * - Sense `DATABASE_URL`: PGlite, un Postgres complet dins del procés (WebAssembly).
 *     · En local es desa a `.data/pglite` → funciona sense instal·lar res.
 *     · A Vercel només viu en memòria: serveix per provar, però les comandes es perden.
 *       Per a la demo a Vercel, connecta Neon (vegeu README).
 *
 * Tots dos són Postgres, així que l'esquema i les consultes són idèntics.
 */
import "server-only";
import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { BOOTSTRAP_STATEMENTS } from "./bootstrap";

export type Db = PostgresJsDatabase<typeof schema>;

export type DbMode = "postgres" | "pglite-file" | "pglite-memory";

// Una sola connexió per procés (també sobreviu a les recàrregues en desenvolupament)
const globalForDb = globalThis as unknown as { __lmpDb?: Promise<{ db: Db; mode: DbMode }> };

async function connect(): Promise<{ db: Db; mode: DbMode }> {
  const url = process.env.DATABASE_URL;
  let db: Db;
  let mode: DbMode;

  if (url) {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    // max: 1 i prepare: false → recomanat per a funcions serverless i poolers (Neon)
    db = drizzle(postgres(url, { max: 1, prepare: false }), { schema });
    mode = "postgres";
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const onVercel = Boolean(process.env.VERCEL);
    let client;
    if (onVercel) client = new PGlite();
    else {
      const dir = `${process.cwd()}/.data/pglite`;
      (await import("node:fs")).mkdirSync(dir, { recursive: true });
      client = new PGlite(dir);
    }
    // Mateixa API en temps d'execució; només difereixen els tipus genèrics
    db = drizzle(client, { schema }) as unknown as Db;
    mode = onVercel ? "pglite-memory" : "pglite-file";
    if (onVercel) console.warn("[db] Sense DATABASE_URL: base de dades EN MEMÒRIA. Les comandes es perdran. Connecta Neon.");
  }

  for (const statement of BOOTSTRAP_STATEMENTS) await db.execute(sql.raw(statement));
  return { db, mode };
}

export async function getDb(): Promise<Db> {
  globalForDb.__lmpDb ??= connect().catch((err) => {
    globalForDb.__lmpDb = undefined; // permet tornar-ho a provar a la següent petició
    throw err;
  });
  return (await globalForDb.__lmpDb).db;
}

export async function getDbMode(): Promise<DbMode> {
  await getDb();
  return (await globalForDb.__lmpDb!).mode;
}

export { schema };
