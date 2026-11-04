"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { t } from "@/messages";

/** Botó d'afegir amb confirmació visual breu. `compact` per a les targetes del catàleg. */
export function AddToCartButton({ productId, compact = false }: { productId: string; compact?: boolean }) {
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
      className={`rounded-full font-semibold text-white transition active:scale-95 ${
        justAdded ? "bg-basil" : "bg-tomato hover:bg-tomato-dark"
      } ${compact ? "px-4 py-2 text-sm" : "w-full px-6 py-3.5 text-base"}`}
      aria-live="polite"
    >
      {justAdded ? t.product.added : compact ? t.product.add : t.product.addToCart}
    </button>
  );
}
