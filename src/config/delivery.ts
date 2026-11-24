/**
 * ZONES D'ENTREGA: tipus i VALORS INICIALS.
 *
 * Aquests valors només es fan servir per omplir la base de dades el primer cop.
 * Després es modifiquen des de l'admin (/admin/zones). Valors de mostra, PENDENTS
 * d'acordar amb en Lutty.
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

/** Valors comuns de mostra (PENDENT). */
const DEFAULTS = {
  active: true,
  deliveryFeeCents: 350,
  freeShippingFromCents: 3000,
  minOrderCents: 1500,
  deliveryWeekdays: [2, 5], // dimarts i divendres
  cutoffTime: "20:00",
  leadDays: 2,
} satisfies Partial<DeliveryZone>;

/** Zones inicials (es copien a la BD el primer cop; després s'editen a l'admin). */
export const SEED_ZONES: DeliveryZone[] = [
  { id: "barcelona", name: "Barcelona", postalCodePrefixes: ["08"], ...DEFAULTS },
  { id: "girona", name: "Girona", postalCodePrefixes: ["17"], ...DEFAULTS },
  { id: "lleida", name: "Lleida", postalCodePrefixes: ["25"], ...DEFAULTS },
  { id: "tarragona", name: "Tarragona", postalCodePrefixes: ["43"], ...DEFAULTS },
];

/** Capacitat inicial de l'obrador: unitats de cada producte per dia (PENDENT; editable a l'admin). */
export const SEED_DEFAULT_DAILY_STOCK = 30;

/** Quants dies d'entrega com a màxim s'ofereixen al client. */
export const MAX_DELIVERY_OPTIONS = 6;

/** Zona activa que correspon a un codi postal (funció pura: rep la llista de zones). */
export function matchZone(zones: DeliveryZone[], postalCode: string): DeliveryZone | undefined {
  const pc = postalCode.trim();
  if (!/^\d{5}$/.test(pc)) return undefined;
  return zones.find((z) => z.active && z.postalCodePrefixes.some((prefix) => pc.startsWith(prefix)));
}
