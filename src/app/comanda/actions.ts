"use server";

/**
 * Accions de servidor del procés de comanda. Són l'única porta d'entrada des del
 * navegador: tot el que arriba aquí es torna a validar a `lib/orders.ts`.
 */
import { getDeliveryOptions, placeOrder, type DeliveryOptionsResult, type PlaceOrderResult } from "@/lib/orders";

type CartItem = { productId: string; quantity: number };

function sanitizeItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i): i is CartItem => typeof i?.productId === "string" && Number.isInteger(i?.quantity) && i.quantity > 0)
    .slice(0, 30);
}

export async function fetchDeliveryOptions(postalCode: string, items: unknown): Promise<DeliveryOptionsResult> {
  return getDeliveryOptions(String(postalCode ?? ""), sanitizeItems(items));
}

export async function submitOrder(input: unknown): Promise<PlaceOrderResult> {
  return placeOrder(input);
}
