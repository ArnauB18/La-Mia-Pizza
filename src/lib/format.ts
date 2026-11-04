import { BUSINESS } from "@/config/business";

const priceFormatter = new Intl.NumberFormat(BUSINESS.locale, {
  style: "currency",
  currency: BUSINESS.currency,
});

/** Formata cèntims com a preu: 750 → "7,50 €". Treballem sempre en cèntims per evitar errors d'arrodoniment. */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

/** 612345678 → "612 34 56 78" (format habitual a Espanya). */
export function formatPhone(phone: string): string {
  return /^\d{9}$/.test(phone) ? phone.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4") : phone;
}

export function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString(BUSINESS.locale)} kg` : `${grams} g`;
}
