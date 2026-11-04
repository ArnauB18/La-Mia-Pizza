"use client";

import Link from "next/link";
import { useCart, MAX_QTY_PER_LINE } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { PizzaImage } from "@/components/PizzaImage";
import { t } from "@/messages";

export default function CartPage() {
  const { ready, lines, totalUnits, subtotalCents, setQuantity, remove } = useCart();

  // Abans de llegir el localStorage no sabem què hi ha: no mostrem "buida" per error.
  if (!ready) return <p className="text-ink-soft">…</p>;

  if (lines.length === 0) {
    return (
      <div className="py-12 text-center">
        <h1 className="font-display text-2xl font-bold">{t.cart.title}</h1>
        <p className="mt-3 text-ink-soft">{t.cart.empty}</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-tomato px-6 py-3 font-semibold text-white">
          {t.cart.goToCatalog}
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold">{t.cart.title}</h1>
      <p className="text-sm text-ink-soft">{t.cart.units(totalUnits)}</p>

      <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
        {lines.map(({ product, quantity, lineTotalCents }) => (
          <li key={product.id} className="flex gap-3 p-3">
            <PizzaImage product={product} className="h-16 w-16 shrink-0 rounded-lg" showLabel={false} />
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/producte/${product.slug}`} className="font-semibold leading-tight">
                  {product.name}
                </Link>
                <span className="font-semibold">{formatPrice(lineTotalCents)}</span>
              </div>
              <span className="text-xs text-ink-soft">{formatPrice(product.priceCents)} / u.</span>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center rounded-full border border-line">
                  <QtyButton label={t.cart.decrease} onClick={() => setQuantity(product.id, quantity - 1)}>
                    −
                  </QtyButton>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                  <QtyButton
                    label={t.cart.increase}
                    onClick={() => setQuantity(product.id, quantity + 1)}
                    disabled={quantity >= MAX_QTY_PER_LINE}
                  >
                    +
                  </QtyButton>
                </div>
                <button type="button" onClick={() => remove(product.id)} className="text-xs text-ink-soft underline">
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
          <dd className="font-semibold">{formatPrice(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between text-ink-soft">
          <dt>{t.cart.shipping}</dt>
          <dd>{t.cart.shippingNext}</dd>
        </div>
      </dl>

      {/* Fase 2: aquest botó portarà a /comanda (adreça, dia d'entrega i pagament). */}
      <button
        type="button"
        disabled
        className="mt-5 w-full cursor-not-allowed rounded-full bg-tomato/50 px-6 py-3.5 font-semibold text-white"
      >
        {t.cart.checkout}
      </button>
      <p className="mt-2 text-center text-xs text-ink-soft">{t.cart.checkoutSoon}</p>
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
      className="h-9 w-9 text-lg font-semibold disabled:opacity-30"
    >
      {children}
    </button>
  );
}
