/**
 * Fotos de productes pujades des de l'admin.
 *
 * Decisió: es guarden a la mateixa base de dades (Neon), no en un servei a part.
 * El navegador ja les redueix abans de pujar-les i aquí es tornen a processar:
 * WebP, màxim 1200 px, sense dades EXIF (ubicació GPS, etc.) → uns 100-200 KB.
 */
import "server-only";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { getDb, schema } from "@/db";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export type UploadResult = { ok: true; url: string } | { ok: false; message: string };

export async function storeProductImage(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, message: "No s'ha rebut cap foto." };
  if (file.size > MAX_INPUT_BYTES) return { ok: false, message: "La foto és massa gran (màxim 8 MB)." };
  if (file.type && !ACCEPTED.includes(file.type)) return { ok: false, message: "Format no admès. Fes servir JPG, PNG o WebP." };

  let webp: Buffer;
  try {
    webp = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
      .rotate() // respecta l'orientació de la foto del mòbil
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return { ok: false, message: "No s'ha pogut llegir la foto. Prova amb una altra." };
  }

  const id = randomBytes(12).toString("base64url");
  const db = await getDb();
  await db.insert(schema.images).values({ id, contentType: "image/webp", data: new Uint8Array(webp) });
  return { ok: true, url: `/api/imatges/${id}` };
}

export async function readImage(id: string): Promise<{ contentType: string; data: Uint8Array } | null> {
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(id)) return null;
  const db = await getDb();
  const [row] = await db.select().from(schema.images).where(eq(schema.images.id, id)).limit(1);
  return row ? { contentType: row.contentType, data: row.data } : null;
}
