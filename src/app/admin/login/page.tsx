import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminPassword, isAdmin } from "@/lib/admin-auth";
import { SectionTitle } from "@/components/SectionTitle";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Accés personal" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const enabled = adminPassword() !== null;
  const usingDevDefault = !process.env.ADMIN_PASSWORD && enabled;

  return (
    <div className="mx-auto max-w-sm py-8">
      <SectionTitle as="h1">Accés personal</SectionTitle>
      <p className="mb-6 mt-3 text-sm text-ink-soft">Comandes, repartiment i estat de cada entrega.</p>
      {enabled ? (
        <>
          <LoginForm />
          {usingDevDefault && (
            <p className="mt-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-900">
              Mode local: la contrasenya és <code className="font-bold">lamia</code>. A Vercel cal definir ADMIN_PASSWORD.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
          L&apos;administració està desactivada: cal definir la variable d&apos;entorn <code>ADMIN_PASSWORD</code> a Vercel.
        </p>
      )}
    </div>
  );
}
