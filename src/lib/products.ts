/**
 * Accés als productes.
 *
 * Fase 1: llegeix el fitxer de mostra.
 * Fase 2: aquestes funcions passaran a consultar Postgres i les pàgines no canviaran.
 */
import { SAMPLE_PRODUCTS } from "@/data/sample-data";
import type { Product } from "./types";

export function getProducts(): Product[] {
  return SAMPLE_PRODUCTS.filter((p) => p.active);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}
