"use client";

/**
 * Cistella del client.
 *
 * Decisió: la cistella viu al navegador (localStorage). Només guardem
 * `productId` + quantitat, mai el preu: el preu es llegeix sempre del catàleg
 * actual, i el servidor el torna a calcular en crear la comanda (el client no
 * pot "triar" el preu).
 *
 * El localStorage es tracta com un magatzem extern (`useSyncExternalStore`):
 * és el patró que recomana React, evita repintats dobles en carregar i, de
 * propina, manté la cistella sincronitzada entre pestanyes.
 */
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { Product } from "./types";
import { MAX_QTY_PER_LINE } from "./limits";

export { MAX_QTY_PER_LINE };

const STORAGE_KEY = "lmp-cart-v1";

type CartLines = Readonly<Record<string, number>>; // productId -> quantitat

// ───────────── Magatzem (localStorage) ─────────────

const EMPTY: CartLines = Object.freeze({});
let cache: { raw: string | null; value: CartLines } | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLines {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY;
    const clean: Record<string, number> = {};
    for (const [id, qty] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof qty === "number" && qty > 0) clean[id] = Math.min(Math.floor(qty), MAX_QTY_PER_LINE);
    }
    return clean;
  } catch {
    return EMPTY; // dades corruptes: cistella buida
  }
}

/** Snapshot estable: només canvia d'objecte si el contingut desat ha canviat. */
function getSnapshot(): CartLines {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    /* navegació privada sense localStorage: treballem només en memòria */
    return cache?.value ?? EMPTY;
  }
  if (!cache || cache.raw !== raw) cache = { raw, value: parse(raw) };
  return cache.value;
}

function write(next: CartLines) {
  const raw = JSON.stringify(next);
  cache = { raw, value: next };
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* si no es pot desar, la cistella funciona igualment durant la visita */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Canvis fets en una altra pestanya
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

// ───────────── Context ─────────────

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
  /** false al servidor i durant la hidratació: encara no sabem què hi ha desat. */
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

/**
 * `products`: el catàleg actiu, que ve del servidor (layout). Així la cistella
 * sempre mostra els preus actuals i ignora productes que s'hagin desactivat.
 */
export function CartProvider({ children, products }: { children: React.ReactNode; products: Product[] }) {
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  // true només al navegador, un cop hidratat (al servidor és false)
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [lastAdded, setLastAdded] = useState<LastAdded | null>(null);

  const setQuantity = useCallback((productId: string, qty: number) => {
    const next = { ...getSnapshot() };
    const q = Math.min(Math.max(0, Math.floor(qty)), MAX_QTY_PER_LINE);
    if (q === 0) delete next[productId];
    else next[productId] = q;
    write(next);
  }, []);

  const add = useCallback(
    (productId: string, qty = 1) => {
      const current = getSnapshot();
      write({ ...current, [productId]: Math.min((current[productId] ?? 0) + qty, MAX_QTY_PER_LINE) });
      const product = byId.get(productId);
      if (product) setLastAdded({ product, at: Date.now() });
    },
    [byId],
  );

  const dismissLastAdded = useCallback(() => setLastAdded(null), []);
  const remove = useCallback((productId: string) => setQuantity(productId, 0), [setQuantity]);
  const clear = useCallback(() => write(EMPTY), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = [];
    for (const [id, quantity] of Object.entries(items)) {
      const product = byId.get(id); // productes desactivats o desconeguts: s'ignoren
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
  }, [items, ready, lastAdded, dismissLastAdded, add, setQuantity, remove, clear, byId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart s'ha de fer servir dins de <CartProvider>");
  return ctx;
}
