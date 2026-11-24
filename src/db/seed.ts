/**
 * Dades inicials: el primer cop que s'arrenca amb una base de dades buida,
 * s'hi carreguen els productes i les zones dels fitxers de mostra.
 * Després tot s'edita des de l'admin (els fitxers ja no es tornen a llegir).
 */
import { SAMPLE_PRODUCTS } from "@/data/sample-data";
import { SEED_ZONES, SEED_DEFAULT_DAILY_STOCK } from "@/config/delivery";
import type { Db } from "./index";
import { deliveryZones, products, settings } from "./schema";

export const SETTING_DEFAULT_STOCK = "default_daily_stock";

export async function seed(db: Pick<Db, "insert">): Promise<void> {
  await db
    .insert(products)
    .values(
      SAMPLE_PRODUCTS.map((p, i) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        shortDescription: p.shortDescription,
        description: p.description,
        priceCents: p.priceCents,
        weightGrams: p.weightGrams,
        ingredients: p.ingredients,
        allergens: p.allergens,
        mayContain: p.mayContain,
        shelfLifeDays: p.shelfLifeDays,
        storage: p.storage,
        preparation: p.preparation,
        lot: p.lot ?? null,
        bestBefore: p.bestBefore ?? null,
        imageUrl: p.imageUrl ?? null,
        placeholderColor: p.placeholderColor ?? null,
        placeholderToppings: p.placeholderToppings ?? true,
        sortOrder: i * 10,
        active: p.active,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(deliveryZones)
    .values(SEED_ZONES.map((z, i) => ({ ...z, sortOrder: i * 10 })))
    .onConflictDoNothing();

  await db
    .insert(settings)
    .values({ key: SETTING_DEFAULT_STOCK, value: String(SEED_DEFAULT_DAILY_STOCK) })
    .onConflictDoNothing();
}
