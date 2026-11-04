import Link from "next/link";
import type { Metadata } from "next";
import { getOrderForCustomer } from "@/lib/orders";
import { formatPhone, formatPrice } from "@/lib/format";
import { formatLongDate } from "@/lib/dates";
import { SectionTitle } from "@/components/SectionTitle";
import { PrintButton } from "./PrintButton";
import { t } from "@/messages";

type Props = { params: Promise<{ numero: string }>; searchParams: Promise<{ t?: string }> };

// Dades personals: mai a la memòria cau ni als cercadors
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: t.confirmation.title, robots: { index: false, follow: false } };

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { numero } = await params;
  const { t: token } = await searchParams;
  const order = await getOrderForCustomer(decodeURIComponent(numero), token ?? "");

  if (!order) {
    return (
      <div className="animate-fade-up py-12 text-center">
        <SectionTitle as="h1">{t.confirmation.notFoundTitle}</SectionTitle>
        <p className="mt-3 text-ink-soft">{t.confirmation.notFoundText}</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">
          {t.confirmation.backHome}
        </Link>
      </div>
    );
  }

  const firstName = order.customerName.split(" ")[0];

  return (
    <article className="mx-auto max-w-xl">
      <header className="animate-fade-up text-center">
        {/* Check animat */}
        <svg viewBox="0 0 52 52" className="mx-auto mb-4 h-16 w-16 text-basil" aria-hidden="true">
          <circle cx="26" cy="26" r="24" fill="currentColor" opacity="0.12" />
          <path
            d="M15 27l7 7 15-16"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw"
          />
        </svg>
        <SectionTitle as="h1">{t.confirmation.title}</SectionTitle>
        <p className="mt-3 text-ink-soft">{t.confirmation.thanks(firstName)}</p>
      </header>

      <div className="animate-fade-up mt-8 rounded-2xl border-2 border-dashed border-ink/30 bg-card p-5 text-center" style={{ animationDelay: "120ms" }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">{t.confirmation.number}</p>
        <p className="mt-1 font-mono text-3xl font-bold tracking-wider">{order.number}</p>
        <p className="mt-2 inline-block rounded-full bg-basil/10 px-3 py-1 text-xs font-semibold text-basil">
          {t.confirmation.statusLabel}: {t.status[order.status]}
        </p>
      </div>

      <div className="animate-fade-up mt-6 grid gap-3 sm:grid-cols-2" style={{ animationDelay: "200ms" }}>
        <InfoCard title={t.confirmation.delivery}>
          <p className="font-semibold first-letter:uppercase">{formatLongDate(order.deliveryDate)}</p>
          <p>{order.timeSlot}</p>
        </InfoCard>
        <InfoCard title={t.confirmation.address}>
          <p>{order.addressLine}</p>
          {order.addressExtra && <p>{order.addressExtra}</p>}
          <p>
            {order.postalCode} {order.town}
          </p>
        </InfoCard>
        <InfoCard title={t.confirmation.contact} className="sm:col-span-2">
          <p>
            {order.customerName} · {formatPhone(order.phone)} · {order.email}
          </p>
          {order.deliveryNotes && <p className="mt-1 text-ink-soft">“{order.deliveryNotes}”</p>}
        </InfoCard>
      </div>

      <section className="animate-fade-up mt-6 rounded-2xl border border-line bg-card p-4" style={{ animationDelay: "280ms" }}>
        <h2 className="mb-3 font-display text-2xl">{t.confirmation.items}</h2>
        <ul className="divide-y divide-line text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between py-2">
              <span>
                <span className="font-semibold tabular-nums">{i.quantity}×</span> {i.productName}
              </span>
              <span className="tabular-nums">{formatPrice(i.unitPriceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-1 border-t border-line pt-2 text-sm">
          <Row label={t.cart.subtotal} value={formatPrice(order.subtotalCents)} />
          <Row
            label={t.cart.shipping}
            value={order.deliveryFeeCents === 0 ? t.checkout.freeShipping : formatPrice(order.deliveryFeeCents)}
          />
          <Row label={t.confirmation.paid} value={formatPrice(order.totalCents)} strong />
        </dl>
      </section>

      <p className="mt-6 text-center text-xs text-ink-soft">{t.confirmation.keepLink}</p>
      <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row print:hidden">
        <PrintButton label={t.confirmation.print} />
        <Link
          href="/"
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-brand-dark"
        >
          {t.confirmation.backHome}
        </Link>
      </div>
    </article>
  );
}

function InfoCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-card p-4 text-sm ${className}`}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "pt-1 text-base font-bold" : ""}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
