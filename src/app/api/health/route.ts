/**
 * Diagnòstic del desplegament: diu QUINES variables veu el servidor (sí/no),
 * mai els seus valors. Útil per comprovar la configuració de Vercel.
 */
import { NextResponse } from "next/server";
import { getDbMode } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let db: string;
  try {
    db = await getDbMode();
  } catch {
    db = "error";
  }
  return NextResponse.json(
    {
      ok: true,
      env: process.env.VERCEL_ENV ?? "local", // production | preview | development
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      region: process.env.VERCEL_REGION ?? null,
      adminPasswordSet: Boolean(process.env.ADMIN_PASSWORD?.trim()),
      databaseUrlSet: Boolean(process.env.DATABASE_URL),
      db,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
