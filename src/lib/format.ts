import { BUSINESS } from "@/config/business";

const priceFormatter = new Intl.NumberFormat(BUSINESS.locale, {
  style: "currency",
  currency: BUSINESS.currency,
});

/** Formata cèntims com a preu: 750 → "7,50 €". Treballem sempre en cèntims per evitar errors d'arrodoniment. */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

export function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString(BUSINESS.locale)} kg` : `${grams} g`;
}
