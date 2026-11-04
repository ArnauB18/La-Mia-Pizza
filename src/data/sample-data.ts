/**
 * ⚠️  DADES DE MOSTRA: CONFIRMAR AMB EN LUTTY ABANS D'ENSENYAR-LES COM A REALS  ⚠️
 *
 * Noms, preus, pesos, ingredients, al·lèrgens, vida útil i instruccions
 * són INVENTATS per al prototip. Cap d'aquestes dades prové de l'obrador.
 *
 * Aquest és l'ÚNIC fitxer on cal tocar-les durant la fase 1.
 * (A la fase 3 es podran editar des de l'admin.)
 *
 * Preu de referència per a proves: ~8 € per pizza, IVA inclòs.
 */
import type { Product } from "@/lib/types";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "p-margarita",
    slug: "margarita",
    name: "Margarita",
    shortDescription: "Tomàquet, mozzarella i alfàbrega. La de sempre.",
    description:
      "La clàssica de la casa, envasada al buit just després de fer-la a l'obrador. Només cal acabar-la al forn de casa.",
    priceCents: 750,
    weightGrams: 420,
    ingredients:
      "Farina de BLAT, aigua, tomàquet, mozzarella (LLET), oli d'oliva verge extra, llevat, sal, alfàbrega, orenga.",
    allergens: ["gluten", "milk"],
    mayContain: ["soy", "mustard"],
    shelfLifeDays: 21,
    storage: "refrigerated",
    preparation: "Forn preescalfat a 220 °C, 8–10 minuts directament sobre la reixa.",
    placeholderColor: "#d9412b",
    active: true,
  },
  {
    id: "p-prosciutto",
    slug: "prosciutto",
    name: "Prosciutto",
    shortDescription: "Tomàquet, mozzarella i pernil cuit.",
    description:
      "Base de tomàquet i mozzarella amb pernil cuit de qualitat. Una aposta segura per a tota la família.",
    priceCents: 800,
    weightGrams: 450,
    ingredients:
      "Farina de BLAT, aigua, tomàquet, mozzarella (LLET), pernil cuit (porc, sal, dextrosa, antioxidant E-301, conservant E-250), oli d'oliva, llevat, sal, orenga.",
    allergens: ["gluten", "milk"],
    mayContain: ["soy", "mustard"],
    shelfLifeDays: 18,
    storage: "refrigerated",
    preparation: "Forn preescalfat a 220 °C, 8–10 minuts directament sobre la reixa.",
    placeholderColor: "#c86b5a",
    active: true,
  },
  {
    id: "p-quatre-formatges",
    slug: "quatre-formatges",
    name: "Quatre formatges",
    shortDescription: "Mozzarella, gorgonzola, parmesà i emmental.",
    description:
      "Per als amants del formatge: quatre varietats que es fonen juntes al forn. Sense tomàquet.",
    priceCents: 850,
    weightGrams: 430,
    ingredients:
      "Farina de BLAT, aigua, mozzarella (LLET), gorgonzola (LLET), parmesà (LLET, OU — lisozim), emmental (LLET), oli d'oliva, llevat, sal.",
    allergens: ["gluten", "milk", "eggs"],
    mayContain: ["soy", "mustard"],
    shelfLifeDays: 21,
    storage: "refrigerated",
    preparation: "Forn preescalfat a 210 °C, 9–11 minuts directament sobre la reixa.",
    placeholderColor: "#e0a531",
    active: true,
  },
  {
    id: "p-vegetal",
    slug: "vegetal",
    name: "Vegetal",
    shortDescription: "Tomàquet, mozzarella, carbassó, pebrot i ceba.",
    description:
      "Verdures de temporada rostides sobre una base de tomàquet i mozzarella. Apta per a vegetarians.",
    priceCents: 800,
    weightGrams: 460,
    ingredients:
      "Farina de BLAT, aigua, tomàquet, mozzarella (LLET), carbassó, pebrot vermell, ceba, oli d'oliva, llevat, sal, orenga.",
    allergens: ["gluten", "milk"],
    mayContain: ["soy", "mustard", "celery"],
    shelfLifeDays: 14,
    storage: "refrigerated",
    preparation: "Forn preescalfat a 220 °C, 9–11 minuts directament sobre la reixa.",
    placeholderColor: "#4f8a3c",
    active: true,
  },
];
