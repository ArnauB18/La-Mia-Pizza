"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { PizzaImage } from "./PizzaImage";
import { t } from "@/messages";

/**
 * Avís flotant que apareix uns segons quan s'afegeix un producte.
 * Sobretot útil al mòbil, on el comptador de la capçalera pot no estar a la vista.
 */
export function AddedToast() {
  const { lastAdded, dismissLastAdded } = useCart();
  const pathname = usePathname();

  // S'amaga sol al cap de 2,5 s. Cada clic nou (canvia `at`) reinicia el compte.
  useEffect(() => {
    if (!lastAdded) return;
    const id = setTimeout(dismissLastAdded, 2500);
    return () => clearTimeout(id);
  }, [lastAdded, dismissLastAdded]);

  if (!lastAdded || pathname === "/cistella") return null;

  return (
    <div
      key={lastAdded.at}
      role="status"
      className={`animate-toast-in fixed left-1/2 ${
        // A la fitxa del mòbil hi ha la barra fixa d'afegir: l'avís es col·loca just a sobre
        pathname.startsWith("/producte") ? "bottom-24 sm:bottom-4" : "bottom-4"
      } z-40 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl bg-ink p-2.5 pr-3 text-paper shadow-2xl`}
    >
      <PizzaImage product={lastAdded.product} className="h-11 w-11 shrink-0 rounded-lg" showLabel={false} sizes="44px" />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-xs text-paper/70">✓ {t.cart.addedToast}</p>
        <p className="truncate font-semibold">{lastAdded.product.name}</p>
      </div>
      <Link
        href="/cistella"
        onClick={dismissLastAdded}
        className="shrink-0 rounded-full bg-paper px-3.5 py-2 text-sm font-semibold text-ink transition hover:bg-white active:scale-95"
      >
        {t.cart.viewCart}
      </Link>
    </div>
  );
}
