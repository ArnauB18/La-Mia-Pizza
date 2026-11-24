"use server";

/**
 * Accions de servidor del procés de comanda. Són l'única porta d'entrada des del
 * navegador: tot el que arriba aquí es torna a validar a `lib/orders.ts`.
 */
import { getDeliveryOptions, placeOrder, type DeliveryOptionsResult, type PlaceOrderResult } from "@/lib/orders";

export async function fetchDeliveryOptions(postalCode: string): Promise<DeliveryOptionsResult> {
  return getDeliveryOptions(String(postalCode ?? "").slice(0, 10));
}

export async function submitOrder(input: unknown): Promise<PlaceOrderResult> {
  return placeOrder(input);
}
