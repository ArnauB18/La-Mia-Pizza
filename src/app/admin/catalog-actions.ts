"use server";

/**
 * Accions de l'admin per editar el catàleg: productes, fotos i zones.
 * Totes comproven la sessió i validen les dades al servidor. Després de desar,
 * `invalidateCatalog()` fa que la botiga mostri els canvis al moment.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { getDb, schema } from "@/db";
import { invalidateCatalog } from "@/lib/catalog";
import { storeProductImage, type UploadResult } from "@/lib/images";
import { ALLERGENS, CATEGORIES } from "@/lib/types";
import { isIsoDate } from "@/lib/dates";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined;

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** "8,50", "8.50" o "8" → 850 cèntims. Null si el text és buit o no és un import vàlid. */
function parseEuros(v: string): number | null {
  const n = Number(v.trim().replace(",", "."));
  return v.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= 10000 ? Math.round(n * 100) : null;
}

/** Import obligatori en euros → cèntims. */
const euros = (label: string) =>
  z.string().transform((v, ctx) => {
    const c = parseEuros(v);
    if (c === null) {
      ctx.addIssue({ code: "custom", message: v.trim() === "" ? `Escriu ${label}.` : "Import no vàlid (p. ex. 8,50)." });
      return z.NEVER;
    }
    return c;
  });

/** Import opcional: buit → null. */
const optionalEuros = () =>
  z.string().transform((v, ctx) => {
    if (v.trim() === "") return null;
    const c = parseEuros(v);
    if (c === null) {
      ctx.addIssue({ code: "custom", message: "Import no vàlid (p. ex. 30)." });
      return z.NEVER;
    }
    return c;
  });

const int = (label: string, min: number, max: number) =>
  z.coerce.number({ error: `${label}: escriu un número.` }).int(`${label}: ha de ser un número enter.`).min(min, `${label}: mínim ${min}.`).max(max, `${label}: màxim ${max}.`);

function errorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/l·l/g, "ll")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// ───────────── Productes ─────────────

const productSchema = z.object({
  name: z.string().trim().min(2, "Escriu el nom.").max(80),
  slug: z.string().trim().max(60),
  category: z.enum(CATEGORIES, { error: "Tria la categoria." }),
  shortDescription: z.string().trim().max(160),
  description: z.string().trim().max(1000),
  price: euros("el preu"),
  weightGrams: int("Pes", 1, 10000),
  ingredients: z.string().trim().max(2000),
  allergens: z.array(z.enum(ALLERGENS)),
  mayContain: z.array(z.enum(ALLERGENS)),
  shelfLifeDays: int("Vida útil", 1, 3650),
  storage: z.enum(["refrigerated", "frozen"]),
  preparation: z.string().trim().max(500),
  lot: z.string().trim().max(60),
  bestBefore: z.string().trim().refine((v) => v === "" || isIsoDate(v), "Data no vàlida."),
  imageUrl: z.string().trim().max(300).refine((v) => v === "" || v.startsWith("/"), "Enllaç d'imatge no vàlid."),
  sortOrder: int("Ordre", -1000, 100000),
  active: z.boolean(),
});

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = productSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    category: formData.get("category") ?? "",
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price") ?? "",
    weightGrams: formData.get("weightGrams") ?? "",
    ingredients: formData.get("ingredients") ?? "",
    allergens: formData.getAll("allergens").map(String),
    mayContain: formData.getAll("mayContain").map(String),
    shelfLifeDays: formData.get("shelfLifeDays") ?? "",
    storage: formData.get("storage") ?? "refrigerated",
    preparation: formData.get("preparation") ?? "",
    lot: formData.get("lot") ?? "",
    bestBefore: formData.get("bestBefore") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    sortOrder: formData.get("sortOrder") || "0",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { message: "Revisa els camps marcats.", errors: errorsOf(parsed.error) };
  const d = parsed.data;

  const slug = slugify(d.slug || d.name);
  if (!slug) return { message: "Revisa els camps marcats.", errors: { slug: "L'adreça no és vàlida." } };

  const db = await getDb();
  const clash = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(id ? and(eq(schema.products.slug, slug), ne(schema.products.id, id)) : eq(schema.products.slug, slug))
    .limit(1);
  if (clash.length) return { message: "Revisa els camps marcats.", errors: { slug: "Ja hi ha un altre producte amb aquesta adreça." } };

  const values = {
    slug,
    name: d.name,
    category: d.category,
    shortDescription: d.shortDescription,
    description: d.description,
    priceCents: d.price,
    weightGrams: d.weightGrams,
    ingredients: d.ingredients,
    allergens: d.allergens,
    mayContain: d.mayContain.filter((a) => !d.allergens.includes(a)),
    shelfLifeDays: d.shelfLifeDays,
    storage: d.storage,
    preparation: d.preparation,
    lot: d.lot || null,
    bestBefore: d.bestBefore || null,
    imageUrl: d.imageUrl || null,
    sortOrder: d.sortOrder,
    active: d.active,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(schema.products).set(values).where(eq(schema.products.id, id));
  } else {
    await db.insert(schema.products).values({ id: `p-${slug}`, ...values, placeholderColor: "#c86b5a" });
  }
  invalidateCatalog();
  revalidatePath("/admin/productes");
  redirect(`/admin/productes?desat=${encodeURIComponent(d.name)}`);
}

export async function toggleProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  const db = await getDb();
  await db.update(schema.products).set({ active, updatedAt: new Date() }).where(eq(schema.products.id, id));
  invalidateCatalog();
  revalidatePath("/admin/productes");
}

export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, message: "No s'ha rebut cap foto." };
  return storeProductImage(file);
}

// ───────────── Zones ─────────────

const zoneSchema = z.object({
  id: z.string().min(1),
  active: z.boolean(),
  deliveryFee: euros("el cost d'enviament"),
  freeShippingFrom: optionalEuros(),
  minOrder: euros("la comanda mínima"),
  deliveryWeekdays: z.array(z.coerce.number().int().min(0).max(6)).min(1, "Tria almenys un dia de repartiment."),
  cutoffTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora no vàlida (HH:MM)."),
  leadDays: int("Dies d'antelació", 0, 14),
});

export async function saveZone(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = zoneSchema.safeParse({
    id: formData.get("id") ?? "",
    active: formData.get("active") === "on",
    deliveryFee: formData.get("deliveryFee") ?? "",
    freeShippingFrom: formData.get("freeShippingFrom") ?? "",
    minOrder: formData.get("minOrder") ?? "",
    deliveryWeekdays: formData.getAll("deliveryWeekdays").map(String),
    cutoffTime: formData.get("cutoffTime") ?? "",
    leadDays: formData.get("leadDays") ?? "",
  });
  if (!parsed.success) return { message: "Revisa els camps marcats.", errors: errorsOf(parsed.error) };
  const d = parsed.data;
  const db = await getDb();
  await db
    .update(schema.deliveryZones)
    .set({
      active: d.active,
      deliveryFeeCents: d.deliveryFee,
      freeShippingFromCents: d.freeShippingFrom,
      minOrderCents: d.minOrder,
      deliveryWeekdays: [...new Set(d.deliveryWeekdays)].sort(),
      cutoffTime: d.cutoffTime,
      leadDays: d.leadDays,
    })
    .where(eq(schema.deliveryZones.id, d.id));
  invalidateCatalog();
  revalidatePath("/admin/zones");
  return { ok: true, message: "Desat." };
}
