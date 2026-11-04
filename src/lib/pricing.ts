/**
 * Càlcul d'imports. Funció pura, compartida entre client (per mostrar) i servidor
 * (que és qui mana: sempre recalcula a partir del catàleg, mai es fia del client).
 */
import type { DeliveryZone } from "@/config/delivery";

export interface PricedLine {
  unitPriceCents: number;
  quantity: number;
}

export interface Totals {
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  /** Quant falta per arribar a la comanda mínima (0 si ja hi arriba). */
  missingForMinimumCents: number;
  /** Quant falta per tenir l'enviament gratuït (null si no aplica o ja és gratuït). */
  missingForFreeShippingCents: number | null;
}

/** Només calen les dades econòmiques de la zona (el client també les rep). */
export type ZonePricing = Pick<DeliveryZone, "deliveryFeeCents" | "freeShippingFromCents" | "minOrderCents">;

export function computeTotals(lines: PricedLine[], zone?: ZonePricing): Totals {
  const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  if (!zone) {
    return { subtotalCents, deliveryFeeCents: 0, totalCents: subtotalCents, missingForMinimumCents: 0, missingForFreeShippingCents: null };
  }
  const free = zone.freeShippingFromCents !== null && subtotalCents >= zone.freeShippingFromCents;
  const deliveryFeeCents = free ? 0 : zone.deliveryFeeCents;
  return {
    subtotalCents,
    deliveryFeeCents,
    totalCents: subtotalCents + deliveryFeeCents,
    missingForMinimumCents: Math.max(0, zone.minOrderCents - subtotalCents),
    missingForFreeShippingCents:
      zone.freeShippingFromCents !== null && !free ? zone.freeShippingFromCents - subtotalCents : null,
  };
}
