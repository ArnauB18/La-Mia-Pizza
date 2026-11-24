import Link from "next/link";
import type { Metadata } from "next";
import { listDeliveryDatesWithOrders, listOrders, zoneNames, type OrderWithItems } from "@/lib/orders";
import { getZones } from "@/lib/catalog";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";
import { formatPhone, formatPrice } from "@/lib/format";
import { formatDateParts, formatLongDate, isIsoDate, madridNow } from "@/lib/dates";
import { changeStatus } from "../actions";
import { t } from "@/messages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Comandes", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ date?: string; zone?: string; status?: string; q?: string }> };

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-stone-200 text-stone-700",
  paid: "bg-amber-100 text-amber-900",
  preparing: "bg-sky-100 text-sky-900",
  out_for_delivery: "bg-violet-100 text-violet-900",
  delivered: "bg-basil/15 text-basil",
  cancelled: "bg-red-100 text-red-800 line-through",
};

/** Estats en què l'obrador encara ha de preparar la comanda. */
const TO_PREPARE: OrderStatus[] = ["paid", "preparing"];

/** El pas següent de cada estat: un sol toc per avançar la comanda. */
const NEXT_STEP: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  paid: { to: "preparing", label: "Començar a preparar" },
  preparing: { to: "out_for_delivery", label: "Sortir a repartir" },
  out_for_delivery: { to: "delivered", label: "Marcar lliurada" },
};

export default async function AdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const date = sp.date && isIsoDate(sp.date) ? sp.date : "";
  const [zones, names] = await Promise.all([getZones(), zoneNames()]);
  const zone = zones.some((z) => z.id === sp.zone) ? sp.zone! : "";
  const search = (sp.q ?? "").trim().slice(0, 80);
  const statusParam = sp.status === "all" || ORDER_STATUSES.includes(sp.status as OrderStatus) ? sp.status! : "";
  const status = statusParam === "all" ? undefined : statusParam ? (statusParam as OrderStatus) : "active";
  const today = madridNow().date;

  const [orders, dates] = await Promise.all([
    // Amb cerca, es busca a tots els dies (també els passats) i a tots els estats
    listOrders({
      date: date || undefined,
      fromDate: date || search ? undefined : today,
      zoneId: zone || undefined,
      status: search && !statusParam ? undefined : status,
      search,
    }),
    listDeliveryDatesWithOrders(),
  ]);

  // Totals de les comandes que es mostren (sense les cancel·lades)
  const live = orders.filter((o) => o.status !== "cancelled" && o.status !== "pending");
  const units = live.reduce((n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0), 0);
  const revenue = live.reduce((s, o) => s + o.totalCents, 0);

  // «A preparar»: NOMÉS el que l'obrador encara ha de fer (pagades i en preparació).
  // Les que ja han sortit a repartir o s'han lliurat ja estan fetes.
  const production = new Map<string, number>();
  for (const o of orders)
    if (TO_PREPARE.includes(o.status))
      for (const i of o.items) production.set(i.productName, (production.get(i.productName) ?? 0) + i.quantity);
  const toPrepareUnits = [...production.values()].reduce((a, b) => a + b, 0);
  const byDate = Map.groupBy(orders, (o) => o.deliveryDate);

  // Etiquetes dels filtres actius, cadascuna amb l'enllaç per treure-la
  const params = { q: search, date, zone, status: statusParam };
  const without = (key: keyof typeof params) => {
    const qs = new URLSearchParams(Object.entries({ ...params, [key]: "" }).filter(([, v]) => v) as [string, string][]);
    return `/admin${qs.size ? `?${qs}` : ""}`;
  };
  const chips = [
    date && { key: "date" as const, label: `📅 ${formatLongDate(date)}` },
    zone && { key: "zone" as const, label: `📍 ${names[zone] ?? zone}` },
    statusParam && {
      key: "status" as const,
      label: statusParam === "all" ? "Tots els estats" : t.status[statusParam as OrderStatus],
    },
  ].filter(Boolean) as { key: keyof typeof params; label: string }[];

  return (
    <div>
      {/* ── Cerca + filtres plegats ── */}
      <form className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Cercar: número, nom, telèfon, població…"
            aria-label="Cercar comanda"
            className="min-w-0 flex-1 rounded-full border border-line bg-card px-4 py-2.5 text-sm shadow-sm"
          />
          <button className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper">Cercar</button>
        </div>
        <details className="group rounded-2xl border border-line bg-card shadow-sm open:pb-3" open={false}>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <span className="transition-transform group-open:rotate-90">›</span> Filtres
            {chips.length > 0 && (
              <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-paper">{chips.length}</span>
            )}
          </summary>
          <div className="grid grid-cols-2 gap-2 px-3 sm:grid-cols-4">
            <Select name="date" label="Dia d'entrega" defaultValue={date}>
              <option value="">Propers dies</option>
              {dates.map((d) => (
                <option key={d.date} value={d.date}>
                  {formatLongDate(d.date)} ({d.count})
                </option>
              ))}
            </Select>
            <Select name="zone" label="Província" defaultValue={zone}>
              <option value="">Totes</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </Select>
            <Select name="status" label="Estat" defaultValue={statusParam}>
              <option value="">Actives</option>
              <option value="all">Totes</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t.status[s]}
                </option>
              ))}
            </Select>
            <button className="self-end rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper">Aplicar</button>
          </div>
        </details>
      </form>

      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <Link
              key={c.key}
              href={without(c.key)}
              className="flex items-center gap-1 rounded-full border border-ink/30 bg-card px-3 py-1 text-xs font-semibold first-letter:uppercase hover:border-ink"
              aria-label={`Treure el filtre ${c.label}`}
            >
              {c.label} <span aria-hidden="true">✕</span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Resum en una línia + producció plegada ── */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          <b>{orders.length}</b> comand{orders.length === 1 ? "a" : "es"} · <b>{units}</b> unitats ·{" "}
          <b>{formatPrice(revenue)}</b>
          {search && (
            <>
              {" "}
              per «{search}» ·{" "}
              <Link href="/admin" className="underline underline-offset-2">
                treure
              </Link>
            </>
          )}
        </p>
        {date && (
          <Link
            href={`/admin/repartiment?date=${date}${zone ? `&zone=${zone}` : ""}`}
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            🛵 Full de repartiment
          </Link>
        )}
      </div>
      {live.length > 0 && production.size === 0 && (
        <p className="mt-2 rounded-2xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-basil shadow-sm">
          ✓ Tot preparat
        </p>
      )}
      {production.size > 0 && (
        <details className="mt-2 rounded-2xl border border-line bg-card px-4 py-2.5 text-sm shadow-sm">
          <summary className="cursor-pointer font-semibold">
            📦 A preparar <span className="font-normal text-ink-soft">· {toPrepareUnits} unitats</span>
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
            {[...production]
              .sort((a, b) => b[1] - a[1])
              .map(([name, n]) => (
                <li key={name} className="flex justify-between border-b border-dotted border-line py-0.5">
                  <span>{name}</span>
                  <b className="tabular-nums">{n}</b>
                </li>
              ))}
          </ul>
        </details>
      )}

      {orders.length === 0 && <p className="mt-10 text-center text-ink-soft">No hi ha comandes amb aquests filtres.</p>}

      {/* ── Comandes per dia ── */}
      {[...byDate].map(([d, list]) => {
        const p = formatDateParts(d);
        return (
          <section key={d} className="mt-6">
            <h2 className="mb-2 flex items-baseline justify-between gap-2">
              <span className="font-display text-2xl first-letter:uppercase">
                {p.weekday} {p.day} {p.month}
              </span>
              {!date && (
                <Link href={`/admin?date=${d}`} className="text-xs text-ink-soft underline underline-offset-2">
                  Només aquest dia
                </Link>
              )}
            </h2>
            <div className="space-y-2">
              {list.map((o) => (
                <OrderCard key={o.id} order={o} zoneName={names[o.zoneId] ?? o.zoneId} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Comanda en 3 línies: qui i estat · on · què. Accions: trucar i passar al pas següent. */
function OrderCard({ order: o, zoneName }: { order: OrderWithItems; zoneName: string }) {
  const next = NEXT_STEP[o.status];
  const others = ORDER_STATUSES.filter((s) => s !== o.status && s !== next?.to && s !== "pending");
  return (
    <article className="rounded-2xl border border-line bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 leading-tight">
          <span className="font-semibold">{o.customerName}</span>{" "}
          <span className="font-mono text-xs text-ink-soft">{o.number}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>
            {t.status[o.status]}
          </span>
          {/* Altres canvis d'estat (tornar enrere, cancel·lar) i el correu, plegats */}
          <details className="relative">
            <summary
              className="-my-1 flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-full text-lg text-ink-soft hover:bg-ink/10 [&::-webkit-details-marker]:hidden"
              aria-label="Més opcions"
            >
              ⋯
            </summary>
            <div className="absolute right-0 z-10 mt-1 w-56 rounded-xl border border-line bg-card p-2 text-sm shadow-xl">
              <p className="break-all px-2 pb-2 text-xs text-ink-soft">✉️ {o.email}</p>
              {others.map((s) => (
                <form key={s} action={changeStatus}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    className={`w-full rounded-lg px-2 py-1.5 text-left hover:bg-ink/10 ${s === "cancelled" ? "text-red-700" : ""}`}
                  >
                    Passar a «{t.status[s]}»
                  </button>
                </form>
              ))}
            </div>
          </details>
        </div>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        {o.addressLine}
        {o.addressExtra && `, ${o.addressExtra}`} · {o.postalCode} {o.town}
        {o.town.toLowerCase() !== zoneName.toLowerCase() && ` (${zoneName})`}
      </p>
      <p className="mt-1 text-sm">
        {o.items.map((i) => `${i.quantity}× ${i.productName}`).join(" · ")} ·{" "}
        <b className="tabular-nums">{formatPrice(o.totalCents)}</b>
      </p>
      {o.deliveryNotes && <p className="mt-1 text-sm text-ink-soft">💬 {o.deliveryNotes}</p>}

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <a
          href={`tel:${o.phone}`}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm transition hover:border-ink"
          aria-label={`Trucar a ${o.customerName}`}
        >
          📞 <span className="tabular-nums">{formatPhone(o.phone)}</span>
        </a>
        {next && (
          <form action={changeStatus}>
            <input type="hidden" name="id" value={o.id} />
            <input type="hidden" name="status" value={next.to} />
            <button className="rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-paper transition hover:bg-black">
              {next.label} →
            </button>
          </form>
        )}
      </div>
    </article>
  );
}

function Select({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-xs font-semibold">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-xl border border-line bg-paper px-2 py-2 text-sm font-normal"
      >
        {children}
      </select>
    </label>
  );
}
