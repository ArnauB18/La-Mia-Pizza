/**
 * ⚠️  CONFIGURACIÓ D'ENTREGA: VALORS DE MOSTRA, PENDENTS D'ACORDAR AMB EN LUTTY  ⚠️
 *
 * L'entrega és a DOMICILI, a l'adreça que posa el client (no hi ha recollida).
 * Àmbit: tota Catalunya. Una zona per província, reconeguda pel prefix del codi
 * postal (08 Barcelona, 17 Girona, 25 Lleida, 43 Tarragona). Cada zona pot tenir
 * el seu cost d'enviament, mínim, dies i hora límit. No hi ha franja horària:
 * el client només tria el dia d'entrega.
 *
 * Model de pre-comanda: per rebre la comanda el dia D cal demanar-la abans de
 * `cutoffTime` del dia D − `leadDays` (hora de Catalunya).
 */

export interface DeliveryZone {
  id: string;
  /** Nom que veu el client. */
  name: string;
  /** Prefixos de codi postal que cobreix la zona (p. ex. "08" = tota la província de Barcelona). */
  postalCodePrefixes: string[];
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
} satisfies Partial<DeliveryZone>;

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "barcelona", name: "Barcelona", postalCodePrefixes: ["08"], ...DEFAULTS },
  { id: "girona", name: "Girona", postalCodePrefixes: ["17"], ...DEFAULTS },
  { id: "lleida", name: "Lleida", postalCodePrefixes: ["25"], ...DEFAULTS },
  { id: "tarragona", name: "Tarragona", postalCodePrefixes: ["43"], ...DEFAULTS },
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
  if (!/^\d{5}$/.test(pc)) return undefined;
  return DELIVERY_ZONES.find((z) => z.active && z.postalCodePrefixes.some((prefix) => pc.startsWith(prefix)));
}

export function getZone(id: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => z.id === id);
}
