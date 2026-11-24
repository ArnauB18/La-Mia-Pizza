/**
 * Serveix les fotos pujades des de l'admin. Cada foto nova té un id nou, així que
 * es poden guardar a la memòria cau "per sempre" (navegador i CDN de Vercel).
 */
import { readImage } from "@/lib/images";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const image = await readImage((await params).id);
  if (!image) return new Response("No trobada", { status: 404 });
  return new Response(Buffer.from(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
