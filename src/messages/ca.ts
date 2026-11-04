/**
 * Textos de la web en català.
 *
 * Per afegir el castellà: crear `es.ts` amb la mateixa estructura
 * (TypeScript avisarà si falta alguna clau) i registrar-lo a `src/messages/index.ts`.
 */
export const ca = {
  common: {
    prototypeBanner: "Prototip de demostració · Dades i preus de mostra · No es fan comandes reals",
    vatIncluded: "IVA inclòs",
    vatPending: "IVA pendent de confirmar",
    back: "Tornar",
  },
  nav: {
    catalog: "Catàleg",
    cart: "Cistella",
  },
  home: {
    title: "Pizzes envasades al buit",
    sections: {
      pizza: { title: "Pizzes", intro: "Fetes i envasades al buit. Només cal acabar-les al forn." },
      base: {
        title: "Fes-la a casa",
        intro: "La nostra massa ja estirada, sola o amb tomàquet. Tu hi poses els ingredients.",
      },
    },
    subtitle: "Fetes al nostre obrador del Vallès Oriental. Te les portem a casa i només cal acabar-les al forn.",
    howTitle: "Com funciona",
    howSteps: [
      "Tria pizzes fetes o bases per fer-les a casa.",
      "Digues-nos on i quin dia te les portem.",
      "Guarda-les a la nevera i fes-les al forn quan vulguis.",
    ],
  },
  product: {
    add: "Afegir",
    addToCart: "Afegir a la cistella",
    added: "Afegida ✓",
    weight: "Pes",
    shelfLife: "Vida útil",
    shelfLifeValue: (days: number) => `${days} dies des de l'envasat`,
    storage: "Conservació",
    storageRefrigerated: "Nevera (0–4 °C)",
    storageFrozen: "Congelador (−18 °C)",
    ingredients: "Ingredients",
    allergens: "Al·lèrgens",
    contains: "Conté",
    mayContain: "Pot contenir traces de",
    preparation: "Preparació",
    lot: "Lot",
    bestBefore: "Consumir preferentment abans de",
    lotPending: "Es mostrarà el lot i la data de caducitat de cada pack.",
    sampleDataNotice: "Informació de mostra pendent de validar per l'obrador.",
    notFound: "Aquesta pizza no existeix.",
  },
  cart: {
    title: "La teva cistella",
    empty: "Encara no hi has afegit cap producte.",
    goToCatalog: "Veure el catàleg",
    subtotal: "Subtotal",
    shipping: "Enviament",
    shippingNext: "Es calcula al pas següent",
    remove: "Treure",
    checkout: "Continuar",
    checkoutSoon: "El pas d'enviament i pagament arriba a la fase 2 del prototip.",
    units: (n: number) => (n === 1 ? "1 producte" : `${n} productes`),
    decrease: "Treure una unitat",
    increase: "Afegir una unitat",
  },
  allergens: {
    gluten: "Gluten",
    crustaceans: "Crustacis",
    eggs: "Ou",
    fish: "Peix",
    peanuts: "Cacauets",
    soy: "Soja",
    milk: "Llet",
    nuts: "Fruits de closca",
    celery: "Api",
    mustard: "Mostassa",
    sesame: "Sèsam",
    sulphites: "Sulfits",
    lupin: "Tramussos",
    molluscs: "Mol·luscs",
  },
  footer: {
    legalPending: "Avís legal, privacitat i condicions de compra: pendents de redactar.",
  },
};

export type Messages = typeof ca;
