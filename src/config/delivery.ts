/**
 * ⚠️  CONFIGURACIÓ D'ENTREGA: VALORS DE MOSTRA, PENDENTS D'ACORDAR AMB EN LUTTY  ⚠️
 *
 * Zones, codis postals, cost d'enviament, comanda mínima, dies, hora límit i
 * franges. Tot es pot canviar des d'aquest únic fitxer (a la fase 3, des de l'admin).
 *
 * Model de pre-comanda: per rebre la comanda el dia D cal demanar-la abans de
 * `cutoffTime` del dia D − `leadDays` (hora de Catalunya).
 *
 * Proposta inicial: una zona per cada població on hi ha pizzeria.
 * Els codis postals s'han de verificar (alguns municipis en tenen més d'un).
 */

export interface DeliveryZone {
  id: string;
  /** Nom que veu el client. */
  name: string;
  /** Codis postals que cobreix la zona. */
  postalCodes: string[];
  /** Població per defecte en l'adreça (el client la pot canviar). */
  town: string;
  active: boolean;
  /** Cost d'enviament en cèntims. */
  deliveryFeeCents: number;
  /** A partir d'aquest subtotal l'enviament és gratuït (null = mai). */
  freeShippingFromCents: number | null;
  /** Subtotal mínim per poder fer la comanda. */
  minOrderCents: number;
  /** Dies d'entrega: 0 = diumenge, 1 = dilluns … 6 = dissabte. */
  deliveryWeekdays: number[];
  /** Hora límit per demanar ("HH:MM", hora de Catalunya). */
  cutoffTime: string;
  /** Dies d'antelació: 2 = cal demanar-ho dos dies abans de l'entrega. */
  leadDays: number;
  /** Franges horàries d'entrega. */
  timeSlots: string[];
}

/** Valors comuns de mostra (PENDENT). Cada zona els pot sobreescriure. */
const DEFAULTS = {
  active: true,
  deliveryFeeCents: 350,
  freeShippingFromCents: 3000,
  minOrderCents: 1500,
  deliveryWeekdays: [2, 5], // dimarts i divendres
  cutoffTime: "20:00",
  leadDays: 2,
  timeSlots: ["17:00–19:00", "19:00–21:00"],
} satisfies Partial<DeliveryZone>;

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "sant-feliu-de-codines", name: "Sant Feliu de Codines", town: "Sant Feliu de Codines", postalCodes: ["08182"], ...DEFAULTS },
  { id: "centelles", name: "Centelles", town: "Centelles", postalCodes: ["08540"], ...DEFAULTS },
  { id: "ametlla-del-valles", name: "L'Ametlla del Vallès", town: "L'Ametlla del Vallès", postalCodes: ["08480"], ...DEFAULTS },
  { id: "la-garriga", name: "La Garriga", town: "La Garriga", postalCodes: ["08530"], ...DEFAULTS },
  { id: "parets-del-valles", name: "Parets del Vallès", town: "Parets del Vallès", postalCodes: ["08150"], ...DEFAULTS },
  { id: "bigues-i-riells", name: "Bigues i Riells del Fai", town: "Bigues i Riells del Fai", postalCodes: ["08415"], ...DEFAULTS },
  { id: "santa-eulalia-de-roncana", name: "Santa Eulàlia de Ronçana", town: "Santa Eulàlia de Ronçana", postalCodes: ["08187"], ...DEFAULTS },
];

/** Quants dies d'entrega com a màxim s'ofereixen al client. */
export const MAX_DELIVERY_OPTIONS = 6;

/**
 * Capacitat de l'obrador per defecte: unitats de cada producte per dia d'entrega.
 * PENDENT: capacitat real de l'obrador. Es podrà ajustar per dia (taula `daily_stock`).
 */
export const DEFAULT_DAILY_STOCK_PER_PRODUCT = 30;

export function findZoneByPostalCode(postalCode: string): DeliveryZone | undefined {
  const pc = postalCode.trim();
  return DELIVERY_ZONES.find((z) => z.active && z.postalCodes.includes(pc));
}

export function getZone(id: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => z.id === id);
}
