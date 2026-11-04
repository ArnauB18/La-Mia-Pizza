/**
 * Esquema de la base de dades (Drizzle ORM, Postgres).
 *
 * Els productes encara viuen a `src/data/sample-data.ts` (fase 3: passaran a BD).
 * Per això les línies de comanda guarden una CÒPIA del nom i del preu: si demà
 * canvia el catàleg, les comandes antigues no es modifiquen.
 *
 * ⚠️ Si canvies alguna taula, actualitza també `bootstrap.ts` (SQL de creació).
 */
import { index, integer, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const ORDER_STATUSES = ["pending", "paid", "preparing", "out_for_delivery", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    /** Número que veu el client: LMP-XXXXX */
    number: text("number").notNull(),
    /** Secret per veure la confirmació sense compte d'usuari (va a l'enllaç). */
    accessToken: text("access_token").notNull(),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),

    zoneId: text("zone_id").notNull(),
    deliveryDate: text("delivery_date").notNull(), // "YYYY-MM-DD"
    timeSlot: text("time_slot").notNull(),

    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),

    addressLine: text("address_line").notNull(),
    addressExtra: text("address_extra").notNull().default(""),
    postalCode: text("postal_code").notNull(),
    town: text("town").notNull(),
    deliveryNotes: text("delivery_notes").notNull().default(""),

    subtotalCents: integer("subtotal_cents").notNull(),
    deliveryFeeCents: integer("delivery_fee_cents").notNull(),
    totalCents: integer("total_cents").notNull(),

    paymentProvider: text("payment_provider").notNull(), // "simulated" | "stripe" (futur)
    paymentRef: text("payment_ref"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("orders_number_idx").on(t.number), index("orders_delivery_idx").on(t.deliveryDate, t.zoneId)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/**
 * Capacitat de l'obrador per producte i dia d'entrega.
 * Si no hi ha fila, s'aplica DEFAULT_DAILY_STOCK_PER_PRODUCT (config/delivery.ts).
 * Disponible = capacitat − unitats ja venudes (comandes no cancel·lades).
 */
export const dailyStock = pgTable(
  "daily_stock",
  {
    productId: text("product_id").notNull(),
    date: text("date").notNull(),
    capacity: integer("capacity").notNull(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.date] })],
);

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
