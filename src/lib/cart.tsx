"use client";

/**
 * Cistella del client.
 *
 * Decisió: a la fase 1 la cistella viu al navegador (localStorage).
 * Només guardem `productId` + quantitat, mai el preu: el preu es torna a
 * llegir sempre del catàleg, i a la fase 2 el servidor el recalcularà en
 * crear la comanda (el client no pot "triar" el preu).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "./types";

const STORAGE_KEY = "lmp-cart-v1";
import { MAX_QTY_PER_LINE } from "./limits";
export { MAX_QTY_PER_LINE };

type CartLines = Record<string, number>; // productId -> quantitat

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotalCents: number;
}

/** Últim producte afegit: serveix per mostrar l'avís ("toast") i animar el comptador. */
export interface LastAdded {
  product: Product;
  /** Marca de temps: canvia a cada clic, encara que sigui el mateix producte. */
  at: number;
}

interface CartContextValue {
  /** false fins que s'ha llegit el localStorage (evita parpelleigs i errors d'hidratació). */
  ready: boolean;
  lines: CartLine[];
  totalUnits: number;
  subtotalCents: number;
  lastAdded: LastAdded | null;
  dismissLastAdded: () => void;
  add: (productId: string, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(getProductById: (id: string) => Product | undefined): CartLines {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    // Netegem: només productes que existeixen i quantitats vàlides.
    const clean: CartLines = {};
    for (const [id, qty] of Object.entries(parsed as Record<string, unknown>)) {
      if (getProductById(id) && typeof qty === "number" && qty > 0) {
        clean[id] = Math.min(Math.floor(qty), MAX_QTY_PER_LINE);
      }
    }
    return clean;
  } catch {
    return {}; // navegació privada o dades corruptes: cistella buida
  }
}

/**
 * `products`: el catàleg actiu, que ve del servidor (layout). Així la cistella
 * sempre mostra els preus actuals i ignora productes que s'hagin desactivat.
 */
export function CartProvider({ children, products }: { children: React.ReactNode; products: Product[] }) {
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const getProductById = useCallback((id: string) => byId.get(id), [byId]);
  const [items, setItems] = useState<CartLines>({});
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<LastAdded | null>(null);

  useEffect(() => {
    setItems(readStorage(getProductById));
    setReady(true);
    // Només en carregar: llegim la cistella desada una vegada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* si no es pot guardar, la cistella funciona igualment durant la visita */
    }
  }, [items, ready]);

  const setQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      const next = { ...prev };
      const q = Math.min(Math.max(0, Math.floor(qty)), MAX_QTY_PER_LINE);
      if (q === 0) delete next[productId];
      else next[productId] = q;
      return next;
    });
  }, []);

  const add = useCallback((productId: string, qty = 1) => {
    setItems((prev) => ({
      ...prev,
      [productId]: Math.min((prev[productId] ?? 0) + qty, MAX_QTY_PER_LINE),
    }));
    const product = getProductById(productId);
    if (product) setLastAdded({ product, at: Date.now() });
  }, [getProductById]);

  const dismissLastAdded = useCallback(() => setLastAdded(null), []);

  const remove = useCallback((productId: string) => setQuantity(productId, 0), [setQuantity]);
  const clear = useCallback(() => setItems({}), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = [];
    for (const [id, quantity] of Object.entries(items)) {
      const product = getProductById(id);
      if (!product) continue;
      lines.push({ product, quantity, lineTotalCents: product.priceCents * quantity });
    }
    return {
      ready,
      lines,
      totalUnits: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((n, l) => n + l.lineTotalCents, 0),
      lastAdded,
      dismissLastAdded,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [items, ready, lastAdded, dismissLastAdded, add, setQuantity, remove, clear, getProductById]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart s'ha de fer servir dins de <CartProvider>");
  return ctx;
}
