/**
 * Pagament SIMULAT (prototip). No es cobra res ni es desa cap dada de targeta.
 *
 * Targetes de prova (com les de Stripe en mode test):
 *   4242 4242 4242 4242 → pagament acceptat
 *   4000 0000 0000 0002 → pagament denegat
 *
 * Per passar a Stripe: substituir `chargeOrder` per la creació d'una sessió de
 * Stripe Checkout (mode test) i confirmar la comanda des del webhook.
 */
import "server-only";
import { randomBytes } from "node:crypto";

export const PAYMENT_PROVIDER = "simulated";

export type PaymentResult = { ok: true; ref: string } | { ok: false; message: string };

/** Comprovació de Luhn: detecta errors en teclejar el número de targeta. */
export function isValidCardNumber(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export async function chargeOrder(input: { amountCents: number; cardNumber: string }): Promise<PaymentResult> {
  // Simula la latència d'una passarel·la real
  await new Promise((r) => setTimeout(r, 700));
  if (input.cardNumber === "4000000000000002") {
    return { ok: false, message: "El banc ha denegat el pagament (targeta de prova de rebuig)." };
  }
  return { ok: true, ref: `SIM-${randomBytes(6).toString("hex").toUpperCase()}` };
}
