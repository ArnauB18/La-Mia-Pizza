/**
 * Configuració de negoci: decisions OBERTES.
 *
 * Res d'aquí està acordat amb en Lutty. Els valors `PENDENT` es mostren tal
 * qual o no s'usen en cap càlcul. Quan es decideixin, només cal canviar-los aquí.
 */

export const PENDING = "PENDENT" as const;

export const BUSINESS = {
  /** Nom de treball. No fem servir logotips reals sense permís. */
  brandName: "La Mia Pizza",

  /** Qui factura la venda online (obrador, societat nova, cada pizzeria...). */
  billingEntity: PENDING,

  /** Tipus d'IVA aplicat. Cal confirmar amb el gestor. Només informatiu. */
  vatRateLabel: PENDING,

  /** Qui fa el repartiment (propi, pizzeries, transportista amb fred). */
  deliveryProvider: PENDING,

  /** Moneda i locale per formatar preus. */
  currency: "EUR",
  locale: "ca-ES",
} as const;
