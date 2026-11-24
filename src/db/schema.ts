/**
 * Esquema de la base de dades (Drizzle ORM, Postgres).
 *
 * Productes, zones i configuració s'editen des de l'admin. El primer cop es
 * carreguen amb les dades inicials (`src/data/sample-data.ts`, `src/config/delivery.ts`).
 * Les línies de comanda guarden una CÒPIA del nom i del preu: si demà canvia el
 * catàleg, les comandes antigues no es modifiquen.
 *
 * ⚠️ Si canvies alguna taula, actualitza també `bootstrap.ts` (SQL de creació).
 */
import {
  boolean,
  customType,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

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
 * Si no hi ha fila, s'aplica la capacitat per defecte (taula `settings`, editable a l'admin).
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

/** Catàleg de productes (editable des de l'admin). Mai s'esborren: es desactiven. */
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "pizza" | "base"
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  weightGrams: integer("weight_grams").notNull(),
  ingredients: text("ingredients").notNull().default(""),
  allergens: text("allergens").array().notNull().default([]),
  mayContain: text("may_contain").array().notNull().default([]),
  shelfLifeDays: integer("shelf_life_days").notNull(),
  storage: text("storage").notNull().default("refrigerated"),
  preparation: text("preparation").notNull().default(""),
  lot: text("lot"),
  bestBefore: text("best_before"),
  imageUrl: text("image_url"),
  placeholderColor: text("placeholder_color"),
  placeholderToppings: boolean("placeholder_toppings").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Zones d'entrega (una per província). */
export const deliveryZones = pgTable("delivery_zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  postalCodePrefixes: text("postal_code_prefixes").array().notNull(),
  active: boolean("active").notNull().default(true),
  deliveryFeeCents: integer("delivery_fee_cents").notNull(),
  freeShippingFromCents: integer("free_shipping_from_cents"),
  minOrderCents: integer("min_order_cents").notNull(),
  deliveryWeekdays: integer("delivery_weekdays").array().notNull(),
  cutoffTime: text("cutoff_time").notNull(),
  leadDays: integer("lead_days").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Configuració clau → valor (p. ex. capacitat per defecte de l'obrador). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({ dataType: () => "bytea" });

/**
 * Fotos pujades des de l'admin. Es guarden a la mateixa base de dades (ja
 * reduïdes a WebP d'uns 150 KB): no cal cap servei d'emmagatzematge extra.
 */
export const images = pgTable("images", {
  id: text("id").primaryKey(),
  contentType: text("content_type").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Intents d'entrada fallits a l'admin (protecció contra provar contrasenyes).
 * `key`: "ip:<empremta SHA-256 de la IP>" o "global". Mai es desa la IP en clar.
 */
export const loginAttempts = pgTable("login_attempts", {
  key: text("key").primaryKey(),
  failures: integer("failures").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

/** Versió de l'esquema: permet actualitzar bases de dades existents en arrencar. */
export const appMeta = pgTable("app_meta", {
  id: integer("id").primaryKey(),
  schemaVersion: integer("schema_version").notNull(),
});

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
