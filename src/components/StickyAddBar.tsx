"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";

/**
 * Botó principal d'afegir + barra fixa a baix (només mòbil) que apareix
 * quan el botó principal surt de la pantalla en fer scroll per la fitxa.
 */
export function StickyAddBar({ product }: { product: Product }) {
  const anchor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    // Visible només quan el botó principal ha quedat per sobre de la pantalla
    const io = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={anchor}>
        <AddToCartButton productId={product.id} />
      </div>
      <div
        aria-hidden={!visible}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 sm:hidden ${
          visible ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-display text-2xl">{product.name}</p>
            <p className="text-sm font-bold">{formatPrice(product.priceCents)}</p>
          </div>
          <div className="w-36 shrink-0">
            <AddToCartButton productId={product.id} short />
          </div>
        </div>
      </div>
    </>
  );
}
