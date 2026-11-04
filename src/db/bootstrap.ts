/**
 * Creació de taules (idempotent: es pot executar tantes vegades com calgui).
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
    time_slot text NOT NULL,
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
  `CREATE TABLE IF NOT EXISTS daily_stock (
    product_id text NOT NULL,
    date text NOT NULL,
    capacity integer NOT NULL,
    PRIMARY KEY (product_id, date)
  )`,
];
