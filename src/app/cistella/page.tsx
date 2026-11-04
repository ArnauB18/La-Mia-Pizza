"use client";

import Link from "next/link";
import { useCart, MAX_QTY_PER_LINE } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import { PizzaImage } from "@/components/PizzaImage";
import { SectionTitle } from "@/components/SectionTitle";
import { BUSINESS } from "@/config/business";
import { t } from "@/messages";

export default function CartPage() {
  const { ready, lines, totalUnits, subtotalCents, setQuantity, remove } = useCart();

  // Abans de llegir el localStorage no sabem què hi ha: no mostrem "buida" per error.
  if (!ready) return <p className="text-ink-soft">…</p>;

  if (lines.length === 0) {
    return (
      <div className="animate-fade-up py-10 text-center">
        {/* El logo (la moto) en gris suau: "encara no hi ha res per repartir" */}
        <Image
          src={BUSINESS.logo.src}
          alt=""
          width={BUSINESS.logo.width}
          height={BUSINESS.logo.height}
          className="mx-auto mb-6 h-32 w-auto opacity-25"
        />
        <SectionTitle as="h1">{t.cart.title}</SectionTitle>
        <p className="mt-3 text-ink-soft">{t.cart.empty}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-brand-dark hover:shadow-md active:scale-95"
        >
          {t.cart.goToCatalog}
        </Link>
      </div>
    );
  }

  return (
    <>
      <SectionTitle as="h1">{t.cart.title}</SectionTitle>
      <p className="mt-2 text-sm text-ink-soft">{t.cart.units(totalUnits)}</p>

      <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-card">
        {lines.map(({ product, quantity, lineTotalCents }) => (
          <li key={product.id} className="animate-fade-up flex gap-3 p-3">
            <PizzaImage product={product} className="h-16 w-16 shrink-0 rounded-lg" showLabel={false} sizes="64px" />
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/producte/${product.slug}`}
                  className="font-semibold leading-tight underline-offset-4 hover:underline"
                >
                  {product.name}
                </Link>
                <span className="font-semibold tabular-nums">{formatPrice(lineTotalCents)}</span>
              </div>
              <span className="text-xs text-ink-soft">{formatPrice(product.priceCents)} / u.</span>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center rounded-full border border-line">
                  <QtyButton label={t.cart.decrease} onClick={() => setQuantity(product.id, quantity - 1)}>
                    −
                  </QtyButton>
                  <span key={quantity} className="animate-pop w-8 text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <QtyButton
                    label={t.cart.increase}
                    onClick={() => setQuantity(product.id, quantity + 1)}
                    disabled={quantity >= MAX_QTY_PER_LINE}
                  >
                    +
                  </QtyButton>
                </div>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="text-xs text-ink-soft underline underline-offset-2 transition hover:text-ink"
                >
                  {t.cart.remove}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2 rounded-2xl bg-crust p-4 text-sm">
        <div className="flex justify-between">
          <dt>{t.cart.subtotal}</dt>
          <dd className="font-semibold tabular-nums">{formatPrice(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between text-ink-soft">
          <dt>{t.cart.shipping}</dt>
          <dd>{t.cart.shippingNext}</dd>
        </div>
      </dl>

      <Link
        href="/comanda"
        className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-brand-dark hover:shadow-md active:scale-[0.98]"
      >
        {t.cart.checkout}
        <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
          →
        </span>
      </Link>
      <p className="mt-2 text-center text-xs text-ink-soft">{t.cart.checkoutHint}</p>
    </>
  );
}

function QtyButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="h-9 w-9 rounded-full text-lg font-semibold transition hover:bg-ink/10 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
