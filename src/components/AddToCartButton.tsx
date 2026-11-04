"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { t } from "@/messages";

/**
 * Botó d'afegir amb confirmació visual breu (✓ que "salta").
 * `compact` per a les targetes del catàleg.
 */
export function AddToCartButton({
  productId,
  compact = false,
  short = false,
}: {
  productId: string;
  compact?: boolean;
  /** Mida gran però amb el text curt ("Afegir"): per a la barra fixa del mòbil. */
  short?: boolean;
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const id = setTimeout(() => setJustAdded(false), 1200);
    return () => clearTimeout(id);
  }, [justAdded]);

  return (
    <button
      type="button"
      onClick={() => {
        add(productId);
        setJustAdded(true);
      }}
      className={`group/btn inline-flex whitespace-nowrap items-center justify-center gap-1.5 rounded-full font-semibold text-white shadow-sm transition duration-200 hover:shadow-md active:scale-95 ${
        justAdded ? "bg-basil" : "bg-brand hover:-translate-y-px hover:bg-brand-dark"
      } ${compact ? "px-4 py-2 text-sm" : "w-full px-6 py-3.5 text-base"}`}
      aria-live="polite"
    >
      {justAdded ? (
        <svg key="check" viewBox="0 0 24 24" className="animate-pop h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-90"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      )}
      {justAdded ? t.product.added : compact || short ? t.product.add : t.product.addToCart}
    </button>
  );
}
