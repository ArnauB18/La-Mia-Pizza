import Image from "next/image";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { getDbMode } from "@/db";
import { BUSINESS } from "@/config/business";
import { redirect } from "next/navigation";
import { AdminNav } from "./AdminNav";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

/**
 * Barra compacta de l'administració: logo, menú i sortir.
 * Mòbil: logo i sortir a dalt, i les 4 pestanyes a sota ocupant tota l'amplada.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbMode = await getDbMode();

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 print:hidden">
        <Link href="/admin" className="flex items-center gap-2" aria-label="Inici de l'administració">
          <Image src={BUSINESS.logo.src} alt="" width={BUSINESS.logo.width} height={BUSINESS.logo.height} unoptimized className="h-9 w-auto" />
          <span className="font-display text-xl leading-none">Admin</span>
        </Link>
        <div className="order-last w-full sm:order-none sm:w-auto">
          <AdminNav />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/"
            target="_blank"
            className="rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-ink/10 hover:text-ink"
            title="Obrir la botiga en una pestanya nova"
          >
            Botiga ↗
          </Link>
          <form action={logout}>
            <button
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-ink/10 hover:text-ink"
              title="Sortir de l'administració"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sortir
            </button>
          </form>
        </div>
      </header>
      {dbMode === "pglite-memory" && (
        <p className="mb-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-2.5 text-xs text-amber-900 print:hidden">
          ⚠️ Base de dades temporal: els canvis i les comandes es perden quan Vercel reinicia el servidor. Connecta Neon.
        </p>
      )}
      {children}
    </div>
  );
}
