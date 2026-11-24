/**
 * Catàleg: productes, zones d'entrega i configuració (només servidor).
 *
 * Tot es llegeix de la base de dades i s'edita des de l'admin. Les lectures
 * passen per una memòria cau de Next (`unstable_cache`) amb l'etiqueta "catalog":
 * la botiga no consulta la base de dades a cada visita, i quan l'admin desa un
 * canvi es crida `invalidateCatalog()` perquè tot es regeneri al moment.
 */
import "server-only";
import { asc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getDb, schema } from "@/db";
import { SETTING_DEFAULT_STOCK } from "@/db/seed";
import { matchZone, SEED_DEFAULT_DAILY_STOCK, type DeliveryZone } from "@/config/delivery";
import type { Allergen, Category, Product, Storage } from "./types";

const TAG = "catalog";

/** A les proves (Vitest) no hi ha el motor de Next: llavors no fem servir la memòria cau. */
function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string): (...args: A) => Promise<R> {
  if (process.env.VITEST) return fn;
  return unstable_cache(fn, [key], { tags: [TAG], revalidate: 3600 });
}

type ProductRow = typeof schema.products.$inferSelect;

function toProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category as Category,
    shortDescription: r.shortDescription,
    description: r.description,
    priceCents: r.priceCents,
    weightGrams: r.weightGrams,
    ingredients: r.ingredients,
    allergens: r.allergens as Allergen[],
    mayContain: r.mayContain as Allergen[],
    shelfLifeDays: r.shelfLifeDays,
    storage: r.storage as Storage,
    preparation: r.preparation,
    lot: r.lot ?? undefined,
    bestBefore: r.bestBefore ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
    placeholderColor: r.placeholderColor ?? undefined,
    placeholderToppings: r.placeholderToppings,
    sortOrder: r.sortOrder,
    active: r.active,
  };
}

// ───────────── Productes ─────────────

/** Tots els productes (també els desactivats), en l'ordre del catàleg. */
export const getAllProducts = cached(async (): Promise<Product[]> => {
  const db = await getDb();
  const rows = await db.select().from(schema.products).orderBy(asc(schema.products.sortOrder), asc(schema.products.name));
  return rows.map(toProduct);
}, "all-products");

/** Productes visibles a la botiga. */
export async function getProducts(): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.active);
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.category === category);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

/** Producte actiu per id (el que es pot comprar). */
export async function getProductById(id: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.id === id);
}

// ───────────── Zones ─────────────

export const getZones = cached(async (): Promise<DeliveryZone[]> => {
  const db = await getDb();
  const rows = await db.select().from(schema.deliveryZones).orderBy(asc(schema.deliveryZones.sortOrder));
  return rows.map((z) => ({
    id: z.id,
    name: z.name,
    postalCodePrefixes: z.postalCodePrefixes,
    active: z.active,
    deliveryFeeCents: z.deliveryFeeCents,
    freeShippingFromCents: z.freeShippingFromCents,
    minOrderCents: z.minOrderCents,
    deliveryWeekdays: z.deliveryWeekdays,
    cutoffTime: z.cutoffTime,
    leadDays: z.leadDays,
  }));
}, "zones");

export async function findZoneByPostalCode(postalCode: string): Promise<DeliveryZone | undefined> {
  return matchZone(await getZones(), postalCode);
}

export async function getZone(id: string): Promise<DeliveryZone | undefined> {
  return (await getZones()).find((z) => z.id === id);
}

// ───────────── Configuració ─────────────

export const getDefaultDailyStock = cached(async (): Promise<number> => {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, SETTING_DEFAULT_STOCK)).limit(1);
  const n = Number(row?.value);
  return Number.isFinite(n) && n >= 0 ? n : SEED_DEFAULT_DAILY_STOCK;
}, "default-stock");

/** Després d'un canvi a l'admin: buida la memòria cau i regenera les pàgines de la botiga. */
export function invalidateCatalog(): void {
  if (process.env.VITEST) return;
  revalidateTag(TAG);
  revalidatePath("/", "layout");
}
