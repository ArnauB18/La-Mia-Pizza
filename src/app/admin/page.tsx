import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { listDeliveryDatesWithOrders, listOrders, zoneName, type OrderWithItems } from "@/lib/orders";
import { getDbMode } from "@/db";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { DELIVERY_ZONES } from "@/config/delivery";
import { formatPhone, formatPrice } from "@/lib/format";
import { formatLongDate, isIsoDate, madridNow } from "@/lib/dates";
import { SectionTitle } from "@/components/SectionTitle";
import { changeStatus, logout } from "./actions";
import { t } from "@/messages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Comandes", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ date?: string; zone?: string; status?: string }> };

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-stone-200 text-stone-700",
  paid: "bg-amber-100 text-amber-900",
  preparing: "bg-sky-100 text-sky-900",
  out_for_delivery: "bg-violet-100 text-violet-900",
  delivered: "bg-basil/15 text-basil",
  cancelled: "bg-red-100 text-red-800 line-through",
};

export default async function AdminPage({ searchParams }: Props) {
  if (!(await isAdmin())) redirect("/admin/login");

  const sp = await searchParams;
  const date = sp.date && isIsoDate(sp.date) ? sp.date : "";
  const zone = DELIVERY_ZONES.some((z) => z.id === sp.zone) ? sp.zone! : "";
  const status = sp.status === "all" ? undefined : ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : "active";
  const today = madridNow().date;

  const [orders, dates, dbMode] = await Promise.all([
    listOrders({ date: date || undefined, fromDate: date ? undefined : today, zoneId: zone || undefined, status }),
    listDeliveryDatesWithOrders(),
    getDbMode(),
  ]);

  // Llista de producció per a l'obrador: unitats de cada producte (comandes no cancel·lades)
  const production = new Map<string, number>();
  for (const o of orders) if (o.status !== "cancelled") for (const i of o.items) production.set(i.productName, (production.get(i.productName) ?? 0) + i.quantity);
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totalCents, 0);
  const byDate = Map.groupBy(orders, (o) => o.deliveryDate);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle as="h1">Comandes</SectionTitle>
        <div className="flex items-center gap-2 text-sm">
          {date && (
            <Link
              href={`/admin/repartiment?date=${date}${zone ? `&zone=${zone}` : ""}`}
              className="rounded-full bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand-dark"
            >
              🛵 Full de repartiment
            </Link>
          )}
          <form action={logout}>
            <button className="rounded-full border border-ink/60 px-4 py-2 transition hover:bg-ink hover:text-paper">Sortir</button>
          </form>
        </div>
      </div>

      {dbMode === "pglite-memory" && (
        <p className="mt-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-900">
          ⚠️ Base de dades temporal (en memòria): les comandes es perden quan Vercel reinicia el servidor. Connecta Neon
          perquè es guardin (vegeu el README).
        </p>
      )}

      {/* Filtres: formulari GET, funciona sense JavaScript */}
      <form className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-card p-3 sm:grid-cols-4">
        <Select name="date" label="Dia d'entrega" defaultValue={date}>
          <option value="">Propers dies</option>
          {dates.map((d) => (
            <option key={d.date} value={d.date}>
              {formatLongDate(d.date)} ({d.count})
            </option>
          ))}
        </Select>
        <Select name="zone" label="Zona" defaultValue={zone}>
          <option value="">Totes</option>
          {DELIVERY_ZONES.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </Select>
        <Select name="status" label="Estat" defaultValue={sp.status ?? "active"}>
          <option value="active">Actives</option>
          <option value="all">Totes</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t.status[s]}
            </option>
          ))}
        </Select>
        <button className="self-end rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-black">Filtrar</button>
      </form>

      {/* Resum */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Comandes" value={String(orders.length)} />
        <Stat label="Import" value={formatPrice(revenue)} />
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">A preparar</p>
          {production.size === 0 ? (
            <p className="mt-1 text-sm text-ink-soft">—</p>
          ) : (
            <ul className="mt-1 text-sm">
              {[...production].sort((a, b) => b[1] - a[1]).map(([name, n]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span className="font-bold tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {orders.length === 0 && <p className="mt-10 text-center text-ink-soft">No hi ha comandes amb aquests filtres.</p>}

      {[...byDate].map(([d, list]) => (
        <section key={d} className="mt-8">
          <h2 className="mb-3 flex items-baseline justify-between font-display text-3xl first-letter:uppercase">
            {formatLongDate(d)}
            {!date && (
              <Link href={`/admin?date=${d}`} className="font-sans text-xs text-ink-soft underline underline-offset-2">
                Veure només aquest dia
              </Link>
            )}
          </h2>
          <div className="space-y-3">
            {list.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function OrderCard({ order: o }: { order: OrderWithItems }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-bold">{o.number}</p>
          <p className="text-lg font-semibold leading-tight">{o.customerName}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>{t.status[o.status]}</span>
      </div>
      <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <p>
          🕒 {o.timeSlot} · <span className="text-ink-soft">{zoneName(o.zoneId)}</span>
        </p>
        <p>
          📞{" "}
          <a href={`tel:${o.phone}`} className="underline underline-offset-2">
            {formatPhone(o.phone)}
          </a>{" "}
          · <span className="break-all text-ink-soft">{o.email}</span>
        </p>
        <p className="sm:col-span-2">
          📍 {o.addressLine}
          {o.addressExtra && `, ${o.addressExtra}`} — {o.postalCode} {o.town}
        </p>
        {o.deliveryNotes && <p className="text-ink-soft sm:col-span-2">💬 {o.deliveryNotes}</p>}
      </div>
      <p className="mt-2 text-sm">
        {o.items.map((i) => `${i.quantity}× ${i.productName}`).join(" · ")}{" "}
        <span className="font-bold tabular-nums">· {formatPrice(o.totalCents)}</span>
      </p>
      <form action={changeStatus} className="mt-3 flex items-center gap-2">
        <input type="hidden" name="id" value={o.id} />
        <label className="sr-only" htmlFor={`status-${o.id}`}>
          Estat
        </label>
        <select
          id={`status-${o.id}`}
          name="status"
          defaultValue={o.status}
          className="rounded-lg border border-line bg-paper px-2 py-1.5 text-sm"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t.status[s]}
            </option>
          ))}
        </select>
        <button className="rounded-lg border border-ink/60 px-3 py-1.5 text-sm font-semibold transition hover:bg-ink hover:text-paper">
          Desar
        </button>
      </form>
    </article>
  );
}

function Select({ name, label, defaultValue, children }: { name: string; label: string; defaultValue: string; children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold">
      {label}
      <select name={name} defaultValue={defaultValue} className="mt-1 block w-full rounded-xl border border-line bg-paper px-2 py-2 text-sm font-normal">
        {children}
      </select>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-4xl leading-none tabular-nums">{value}</p>
    </div>
  );
}
