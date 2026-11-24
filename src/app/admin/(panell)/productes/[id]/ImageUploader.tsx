"use client";

/**
 * Pujada de la foto d'un producte.
 * Al mòbil obre la càmera o la galeria. Abans d'enviar-la, el navegador la redueix
 * (màx. 1600 px, JPEG): una foto de mòbil de 5 MB passa a uns 300 KB i puja ràpid.
 */
import Image from "next/image";
import { useRef, useState } from "react";
import { uploadProductImage } from "@/app/admin/catalog-actions";
import { Spinner } from "@/components/ui";

async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file; // format que el navegador no sap llegir: l'enviem tal qual i el servidor ho intenta
  }
}

export function ImageUploader({ value, onChange, name }: { value: string; onChange: (url: string) => void; name: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const data = new FormData();
      const small = await shrink(file);
      data.set("file", new File([small], "foto.jpg", { type: small.type || file.type }));
      const res = await uploadProductImage(data);
      if (res.ok) onChange(res.url);
      else setError(res.message);
    } catch {
      setError("No s'ha pogut pujar la foto. Torna-ho a provar.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-paper">
        {value ? (
          <Image src={value} alt={name} fill sizes="160px" className="object-cover" />
        ) : (
          <span className="px-3 text-center text-xs text-ink-soft">Sense foto (es mostra el dibuix de mostra)</span>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/80">
            <Spinner className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          id="photo"
          onChange={(e) => handle(e.target.files?.[0])}
        />
        <label
          htmlFor="photo"
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-black ${
            busy ? "pointer-events-none opacity-60" : ""
          }`}
        >
          📷 {value ? "Canviar la foto" : "Pujar una foto"}
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="ml-2 text-sm text-ink-soft underline underline-offset-2 hover:text-ink">
            Treure la foto
          </button>
        )}
        <p className="text-xs text-ink-soft">JPG, PNG o WebP. Millor quadrada i feta des de dalt. Es redueix sola.</p>
        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {value && <p className="text-xs text-ink-soft">Recorda prémer «Desar canvis» per aplicar-la.</p>}
      </div>
    </div>
  );
}
