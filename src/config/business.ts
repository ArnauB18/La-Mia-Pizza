/**
 * Configuració de negoci: decisions OBERTES.
 *
 * Res d'aquí està acordat amb en Lutty. Els valors `PENDENT` es mostren tal
 * qual o no s'usen en cap càlcul. Quan es decideixin, només cal canviar-los aquí.
 */

export const PENDING = "PENDENT" as const;

export const BUSINESS = {
  brandName: "La Mia Pizza",

  /**
   * Logo facilitat pel client (nov. 2026). Ús condicionat a l'acord amb en Lutty
   * sobre la titularitat de la marca: si cal retirar-lo, substituir aquest fitxer.
   */
  logo: { src: "/img/marca/logo.png", width: 451, height: 512 },

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
