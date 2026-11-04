/**
 * Tipus de domini compartits.
 *
 * A la fase 1 els productes surten de `src/data/sample-data.ts`.
 * A la fase 2 aquests mateixos tipus es correspondran amb les taules de
 * Postgres (Drizzle), de manera que els components no hauran de canviar.
 */

/** Els 14 al·lèrgens de declaració obligatòria (Reglament UE 1169/2011, annex II). */
export const ALLERGENS = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
] as const;

export type Allergen = (typeof ALLERGENS)[number];

/** Com es conserva el producte. Pendent de confirmar: refrigerat o congelat. */
export type Storage = "refrigerated" | "frozen";

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Descripció curta per a la targeta del catàleg. */
  shortDescription: string;
  /** Descripció llarga per a la fitxa. */
  description: string;
  /** Preu en cèntims, IVA inclòs (tipus d'IVA pendent de confirmar). */
  priceCents: number;
  weightGrams: number;
  /** Llista d'ingredients tal com ha d'aparèixer a l'etiqueta. */
  ingredients: string;
  /** Al·lèrgens que conté. */
  allergens: Allergen[];
  /** Al·lèrgens que pot contenir per contaminació creuada ("pot contenir traces de"). */
  mayContain: Allergen[];
  /** Vida útil des de l'envasat, en dies. */
  shelfLifeDays: number;
  storage: Storage;
  /** Instruccions de preparació (forn, temps...). */
  preparation: string;
  /** Lot i caducitat: es mostraran quan l'obrador els informi (fase 3). */
  lot?: string;
  bestBefore?: string; // ISO date
  /** URL d'imatge. Si és buida es mostra un marcador de posició. */
  imageUrl?: string;
  /** Color del marcador de posició mentre no hi hagi fotos reals. */
  placeholderColor: string;
  active: boolean;
}
