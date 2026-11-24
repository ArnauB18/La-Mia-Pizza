import { redirect } from "next/navigation";
import { isAdmin, isWeakPassword } from "@/lib/admin-auth";
import { getDbMode } from "@/db";
import { AdminNav } from "./AdminNav";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

/** Marc comú de l'administració: protecció per contrasenya, menú i avisos. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const dbMode = await getDbMode();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3 sm:justify-between print:hidden">
        <AdminNav />
        <form action={logout}>
          <button className="rounded-full border border-ink/60 px-4 py-2 text-sm transition hover:bg-ink hover:text-paper">
            Sortir
          </button>
        </form>
      </div>
      {dbMode === "pglite-memory" && (
        <p className="mb-6 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-900 print:hidden">
          ⚠️ Base de dades temporal (en memòria): els canvis i les comandes es perden quan Vercel reinicia el servidor.
          Connecta Neon perquè es guardin (vegeu el README).
        </p>
      )}
      {isWeakPassword() && (
        <p className="mb-6 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-900 print:hidden">
          🔐 La contrasenya de l&apos;administració és curta. Abans d&apos;obrir la botiga, posa&apos;n una de 14 caràcters o
          més a Vercel (Settings → Environment Variables → ADMIN_PASSWORD) i torna a desplegar.
        </p>
      )}
      {children}
    </div>
  );
}
