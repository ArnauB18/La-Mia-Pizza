/**
 * Creació i actualització de taules (idempotent: es pot executar tantes vegades com calgui).
 *
 * Decisió: per a un prototip, un SQL "CREATE TABLE IF NOT EXISTS" que s'executa
 * en arrencar és més simple i robust a Vercel que un sistema de migracions.
 * Quan el projecte creixi, substituir-ho per `drizzle-kit generate/migrate`.
 */
export const BOOTSTRAP_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS orders (
    id serial PRIMARY KEY,
    number text NOT NULL,
    access_token text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    zone_id text NOT NULL,
    delivery_date text NOT NULL,
    customer_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    address_line text NOT NULL,
    address_extra text NOT NULL DEFAULT '',
    postal_code text NOT NULL,
    town text NOT NULL,
    delivery_notes text NOT NULL DEFAULT '',
    subtotal_cents integer NOT NULL,
    delivery_fee_cents integer NOT NULL,
    total_cents integer NOT NULL,
    payment_provider text NOT NULL,
    payment_ref text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  // Les bases de dades creades abans de treure la franja horària encara tenen aquesta columna
  `ALTER TABLE orders DROP COLUMN IF EXISTS time_slot`,
  `CREATE UNIQUE INDEX IF NOT EXISTS orders_number_idx ON orders (number)`,
  `CREATE INDEX IF NOT EXISTS orders_delivery_idx ON orders (delivery_date, zone_id)`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id serial PRIMARY KEY,
    order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id text NOT NULL,
    product_name text NOT NULL,
    unit_price_cents integer NOT NULL,
    quantity integer NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id)`,
  `CREATE TABLE IF NOT EXISTS products (
    id text PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    category text NOT NULL,
    short_description text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    price_cents integer NOT NULL,
    weight_grams integer NOT NULL,
    ingredients text NOT NULL DEFAULT '',
    allergens text[] NOT NULL DEFAULT '{}',
    may_contain text[] NOT NULL DEFAULT '{}',
    shelf_life_days integer NOT NULL,
    storage text NOT NULL DEFAULT 'refrigerated',
    preparation text NOT NULL DEFAULT '',
    lot text,
    best_before text,
    image_url text,
    placeholder_color text,
    placeholder_toppings boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS delivery_zones (
    id text PRIMARY KEY,
    name text NOT NULL,
    postal_code_prefixes text[] NOT NULL,
    active boolean NOT NULL DEFAULT true,
    delivery_fee_cents integer NOT NULL,
    free_shipping_from_cents integer,
    min_order_cents integer NOT NULL,
    delivery_weekdays integer[] NOT NULL,
    cutoff_time text NOT NULL,
    lead_days integer NOT NULL,
    sort_order integer NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key text PRIMARY KEY,
    value text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS images (
    id text PRIMARY KEY,
    content_type text NOT NULL,
    data bytea NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    key text PRIMARY KEY,
    failures integer NOT NULL DEFAULT 0,
    window_start timestamptz NOT NULL DEFAULT now(),
    locked_until timestamptz
  )`,
  `CREATE TABLE IF NOT EXISTS app_meta (
    id integer PRIMARY KEY,
    schema_version integer NOT NULL
  )`,
  // Neteja de coses que ja no es fan servir (bases de dades de versions anteriors).
  // Va al final: les taules a què fa referència ja existeixen segur.
  `DROP TABLE IF EXISTS daily_stock`,
  `DELETE FROM settings WHERE key = 'default_daily_stock'`,
];

/**
 * Versió actual de l'esquema. Puja-la quan afegeixis taules o columnes: les bases
 * de dades existents (Neon, local) s'actualitzaran soles en la següent arrencada.
 *   1: comandes i línies (i estoc, ja eliminat)
 *   2: productes, zones, configuració i imatges editables des de l'admin
 *   3: intents d'entrada a l'admin (protecció contra força bruta)
 *   4: sense estoc (producció a demanda): s'esborra daily_stock
 */
export const SCHEMA_VERSION = 4;
