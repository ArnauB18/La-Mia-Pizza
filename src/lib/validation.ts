/**
 * Validació de la comanda amb zod.
 * El mateix esquema es fa servir al formulari (errors immediats) i al servidor
 * (que torna a validar-ho tot: el navegador no és de fiar).
 */
import { z } from "zod";
import { MAX_QTY_PER_LINE } from "./limits";

const trimmed = (max: number) => z.string().trim().max(max);

/** Telèfon espanyol: 9 xifres que comencen per 6, 7, 8 o 9 (accepta +34 i espais). */
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s.\-()]/g, "").replace(/^(\+34|0034)/, "");
}

export const checkoutSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE) }))
    .min(1, "La cistella és buida.")
    .max(30),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Codi postal de 5 xifres."),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tria un dia d'entrega."),
  timeSlot: z.string().min(1, "Tria una franja horària.").max(40),
  customer: z.object({
    name: trimmed(80).min(2, "Escriu el teu nom i cognoms."),
    phone: z
      .string()
      .transform(normalizePhone)
      .pipe(z.string().regex(/^[6789]\d{8}$/, "Telèfon de 9 xifres (p. ex. 612 345 678).")),
    email: z.string().trim().toLowerCase().pipe(z.email("Correu electrònic no vàlid.")),
  }),
  address: z.object({
    line: trimmed(120).min(4, "Escriu el carrer i el número."),
    extra: trimmed(80).optional().default(""),
    town: trimmed(80).min(2, "Escriu la població."),
    notes: trimmed(300).optional().default(""),
  }),
  acceptTerms: z.literal(true, { error: "Cal acceptar les condicions de compra." }),
  /** Només per al pagament SIMULAT. No es desa mai. */
  payment: z.object({ cardNumber: z.string().transform((s) => s.replace(/\s/g, "")) }),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

/** Converteix els errors de zod a { "customer.email": "missatge" } per al formulari. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
