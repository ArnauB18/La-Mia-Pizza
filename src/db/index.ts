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
import { BOOTSTRAP_STATEMENTS, SCHEMA_VERSION } from "./bootstrap";
import { seed } from "./seed";

export type Db = PostgresJsDatabase<typeof schema>;

export type DbMode = "postgres" | "pglite-file" | "pglite-memory";

// Una sola connexió per procés (també sobreviu a les recàrregues en desenvolupament)
const globalForDb = globalThis as unknown as { __lmpDb?: Promise<{ db: Db; mode: DbMode }> };

async function connect(): Promise<{ db: Db; mode: DbMode }> {
  // La integració Neon de Vercel crea DATABASE_URL; segons com es connecti, també POSTGRES_URL
  const url = databaseUrl();
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
    // En memòria: a Vercel sense Neon, o mentre es compila (els processos de compilació
    // en paral·lel no poden obrir tots alhora la mateixa carpeta de dades)
    const building = process.env.NEXT_PHASE === "phase-production-build";
    const onVercel = Boolean(process.env.VERCEL) || building;
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
    if (onVercel && !building) console.warn("[db] Sense DATABASE_URL: base de dades EN MEMÒRIA. Les comandes es perdran. Connecta Neon.");
  }

  await migrate(db);
  return { db, mode };
}

/** Files d'un `db.execute` (postgres.js torna un array; PGlite, un objecte amb `rows`). */
function rowsOf<T>(result: unknown): T[] {
  return (Array.isArray(result) ? result : (result as { rows: T[] }).rows) as T[];
}

/**
 * Posa l'esquema al dia. En el cas habitual és UNA consulta (la versió ja és l'actual),
 * cosa que importa en cada arrencada en fred d'una funció de Vercel.
 * Si cal actualitzar, ho fa en una transacció amb bloqueig: si dos servidors
 * arrenquen alhora, el segon espera i no fa res.
 */
async function migrate(db: Db): Promise<void> {
  const current = async (executor: Pick<Db, "execute">) => {
    try {
      const rows = rowsOf<{ v: number }>(await executor.execute(sql`select schema_version as v from app_meta where id = 1`));
      return Number(rows[0]?.v ?? 0);
    } catch {
      return 0; // la taula encara no existeix
    }
  };
  if ((await current(db)) >= SCHEMA_VERSION) return;

  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(727274)`);
    for (const statement of BOOTSTRAP_STATEMENTS) await tx.execute(sql.raw(statement));
    if ((await current(tx)) >= SCHEMA_VERSION) return; // un altre servidor ja ho ha fet
    await seed(tx);
    await tx.execute(
      sql`insert into app_meta (id, schema_version) values (1, ${SCHEMA_VERSION})
          on conflict (id) do update set schema_version = excluded.schema_version`,
    );
  });
}

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
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
