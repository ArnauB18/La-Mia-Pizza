/**
 * ⚠️  DADES DE MOSTRA: CONFIRMAR AMB EN LUTTY ABANS D'ENSENYAR-LES COM A REALS  ⚠️
 *
 * Noms, preus, pesos, ingredients, al·lèrgens, vida útil i instruccions
 * són INVENTATS per al prototip. Cap d'aquestes dades prové de l'obrador.
 *
 * Aquest és l'ÚNIC fitxer on cal tocar-les durant la fase 1.
 * (A la fase 3 es podran editar des de l'admin.)
 *
 * Preu de referència per a proves: ~8 € per pizza, IVA inclòs. Bases: preu inventat.
 */
import type { Product } from "@/lib/types";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    // Pizza real de la carta (nom, ingredients principals i foto facilitats pel client).
    // ⚠️ Preu, pes, llista d'ingredients completa, al·lèrgens i vida útil: DE MOSTRA.
    // ⚠️ Pendent: com es fa l'ou en la versió envasada al buit (cru no és viable).
    id: "p-turo",
    slug: "turo",
    name: "Turó",
    category: "pizza",
    shortDescription: "Base de carbonara, mozzarella, ceba caramel·litzada, bacó i ou.",
    description:
      "Una de les especialitats de la casa: base cremosa de carbonara, mozzarella, ceba caramel·litzada, bacó i un ou al centre.",
    priceCents: 900,
    weightGrams: 480,
    ingredients:
      "Farina de BLAT, aigua, salsa carbonara (nata de LLET, formatge (LLET), rovell d'OU), mozzarella (LLET), bacó (porc, sal, dextrosa, conservant E-250), ceba caramel·litzada (ceba, sucre, oli), OU, oli d'oliva, llevat, sal.",
    allergens: ["gluten", "milk", "eggs"],
    mayContain: ["soy", "mustard"],
    shelfLifeDays: 14,
    storage: "refrigerated",
    preparation: "Forn preescalfat a 220 °C, 9–11 minuts directament sobre la reixa.",
    imageUrl: "/img/pizzes/turo.webp",
    placeholderColor: "#e8b54a",
    active: true,
  },
  {
    // Pizza real de la carta (foto facilitada pel client). Resta de dades: DE MOSTRA.
    id: "p-pernil",
    slug: "pernil",
    name: "Pernil",
    category: "pizza",
    shortDescription: "Tomàquet, mozzarella i pernil cuit. La bàsica que mai falla.",
    description:
      "La pizza de pernil de tota la vida: base de tomàquet, mozzarella ben gratinada i pernil cuit.",
    priceCents: 800,
    weightGrams: 450,
    ingredients:
      "Farina de BLAT, aigua, tomàquet, mozzarella (LLET), pernil cuit (porc, sal, dextrosa, antioxidant E-301, conservant E-250), oli d'oliva, llevat, sal, orenga.",
    allergens: ["gluten", "milk"],
    mayContain: ["soy", "mustard"],
    shelfLifeDays: 18,
    storage: "refrigerated",
    preparation: "Forn preescalfat a 220 °C, 8–10 minuts directament sobre la reixa.",
    imageUrl: "/img/pizzes/pernil.webp",
    placeholderColor: "#c86b5a",
    active: true,
  },
  // ── A partir d'aquí: pizzes d'exemple INVENTADES, sense foto. Substituir per les reals. ──
  {
    id: "p-margarita",
    slug: "margarita",
    name: "Margarita",
    category: "pizza",
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
    id: "p-quatre-formatges",
    slug: "quatre-formatges",
    name: "Quatre formatges",
    category: "pizza",
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
    category: "pizza",
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

  // ── Bases per fer la pizza a casa (producte real; dades DE MOSTRA) ──
  {
    id: "b-massa",
    slug: "massa-estirada",
    name: "Massa estirada",
    category: "base",
    shortDescription: "La nostra massa, ja estirada. Posa-hi els ingredients que vulguis.",
    description:
      "La mateixa massa que fem servir a les pizzeries, estirada i envasada al buit. Només cal afegir-hi els teus ingredients i coure-la.",
    priceCents: 350,
    weightGrams: 280,
    ingredients: "Farina de BLAT, aigua, oli d'oliva verge extra, llevat, sal.",
    allergens: ["gluten"],
    mayContain: ["soy", "mustard", "milk"],
    shelfLifeDays: 21,
    storage: "refrigerated",
    preparation:
      "Afegeix-hi els ingredients i cou-la al forn preescalfat a 230 °C durant 8–10 minuts, directament sobre la reixa.",
    placeholderToppings: false,
    active: true,
  },
  {
    id: "b-massa-tomaquet",
    slug: "massa-amb-tomaquet",
    name: "Massa amb tomàquet",
    category: "base",
    shortDescription: "Massa estirada amb la nostra salsa de tomàquet. Tu hi poses la resta.",
    description:
      "La base estirada amb la salsa de tomàquet de la casa ja posada. Afegeix-hi formatge i els ingredients que més t'agradin.",
    priceCents: 450,
    weightGrams: 340,
    ingredients: "Farina de BLAT, aigua, tomàquet, oli d'oliva verge extra, llevat, sal, orenga.",
    allergens: ["gluten"],
    mayContain: ["soy", "mustard", "milk"],
    shelfLifeDays: 18,
    storage: "refrigerated",
    preparation:
      "Afegeix-hi els ingredients i cou-la al forn preescalfat a 230 °C durant 8–10 minuts, directament sobre la reixa.",
    placeholderColor: "#c8402a",
    placeholderToppings: false,
    active: true,
  },
];
