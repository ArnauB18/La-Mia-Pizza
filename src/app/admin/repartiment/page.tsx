import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { listOrders, zoneName } from "@/lib/orders";
import { formatLongDate, isIsoDate } from "@/lib/dates";
import { formatPhone, formatPrice } from "@/lib/format";
import { PrintButton } from "@/app/comanda/[numero]/PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Full de repartiment", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ date?: string; zone?: string }> };

/** Full imprimible per al repartidor: ordenat per codi postal, amb casella per marcar. */
export default async function DeliverySheetPage({ searchParams }: Props) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { date, zone } = await searchParams;
  if (!date || !isIsoDate(date)) redirect("/admin");

  // Ordre de ruta: per codi postal (pobles propers queden junts)
  const orders = (await listOrders({ date, zoneId: zone || undefined, status: "active" })).sort(
    (a, b) => a.postalCode.localeCompare(b.postalCode) || a.town.localeCompare(b.town),
  );
  const units = orders.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);
  // Càrrega del dia: unitats de cada producte que han de sortir de l'obrador
  const load = new Map<string, number>();
  for (const o of orders) for (const i of o.items) load.set(i.productName, (load.get(i.productName) ?? 0) + i.quantity);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2 print:hidden">
        <Link href={`/admin?date=${date}`} className="text-sm text-ink-soft hover:text-ink">
          ← Comandes
        </Link>
        <PrintButton label="Imprimir" />
      </div>
      <h1 className="font-display text-4xl first-letter:uppercase">Repartiment · {formatLongDate(date)}</h1>
      <p className="mb-5 text-sm text-ink-soft">
        {orders.length} entregues · {units} unitats{zone ? ` · ${zoneName(zone)}` : ""}
      </p>

      {load.size > 0 && (
        <section className="mb-5 rounded-xl border-2 border-ink p-3 break-inside-avoid">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-widest">Càrrega del dia</h2>
          <ul className="grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
            {[...load].sort((x, y) => y[1] - x[1]).map(([name, n]) => (
              <li key={name} className="flex justify-between border-b border-dotted border-ink/30 py-0.5">
                <span>{name}</span>
                <b className="tabular-nums">{n}</b>
              </li>
            ))}
          </ul>
        </section>
      )}

      {orders.length === 0 ? (
        <p className="text-ink-soft">No hi ha entregues aquest dia.</p>
      ) : (
        <ol className="space-y-2">
          {orders.map((o, i) => (
            <li key={o.id} className="flex gap-3 break-inside-avoid rounded-xl border border-line bg-card p-3 text-sm print:rounded-none print:border-x-0 print:border-t-0 print:bg-white">
              <span className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-ink" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold">
                  {i + 1}. {o.town} · <span className="font-mono">{o.number}</span>
                </p>
                <p>
                  {o.customerName} · <b>{formatPhone(o.phone)}</b>
                </p>
                <p>
                  {o.addressLine}
                  {o.addressExtra && `, ${o.addressExtra}`} — {o.postalCode} {o.town}
                </p>
                {o.deliveryNotes && <p className="italic">“{o.deliveryNotes}”</p>}
                <p className="mt-1">
                  {o.items.map((it) => `${it.quantity}× ${it.productName}`).join(" · ")} — <b>{formatPrice(o.totalCents)}</b> (pagat)
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
