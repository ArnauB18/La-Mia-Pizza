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

/** Full imprimible per al repartidor: ordenat per zona i franja, amb casella per marcar. */
export default async function DeliverySheetPage({ searchParams }: Props) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { date, zone } = await searchParams;
  if (!date || !isIsoDate(date)) redirect("/admin");

  const orders = await listOrders({ date, zoneId: zone || undefined, status: "active" });
  const units = orders.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);

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

      {orders.length === 0 ? (
        <p className="text-ink-soft">No hi ha entregues aquest dia.</p>
      ) : (
        <ol className="space-y-2">
          {orders.map((o, i) => (
            <li key={o.id} className="flex gap-3 break-inside-avoid rounded-xl border border-line bg-card p-3 text-sm print:rounded-none print:border-x-0 print:border-t-0 print:bg-white">
              <span className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-ink" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold">
                  {i + 1}. {o.timeSlot} · {zoneName(o.zoneId)} · <span className="font-mono">{o.number}</span>
                </p>
                <p>
                  {o.customerName} · {formatPhone(o.phone)}
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
