import Image from "next/image";
import type { Product } from "@/lib/types";

/**
 * Imatge del producte.
 * - Si el producte té `imageUrl`, mostra la foto (Next optimitza la mida per a cada pantalla).
 * - Si no, dibuixa un marcador de posició amb el color de la pizza.
 *
 * `sizes` indica l'amplada aproximada en què es mostrarà, perquè el mòbil no baixi la foto gran.
 */
export function PizzaImage({
  product,
  className = "",
  showLabel = true,
  sizes = "(min-width: 768px) 600px, 100vw",
  priority = false,
  hoverZoom = false,
}: {
  product: Product;
  className?: string;
  /** Amagar l'etiqueta "Imatge de mostra" a les miniatures petites. */
  showLabel?: boolean;
  sizes?: string;
  /** Carregar de seguida (la imatge principal d'una pàgina). */
  priority?: boolean;
  /** Ampliar la imatge quan el ratolí passa per sobre del contenidor `group` (targetes). */
  hoverZoom?: boolean;
}) {
  const zoom = hoverZoom ? "transition-transform duration-500 ease-out group-hover:scale-[1.07]" : "";
  if (product.imageUrl) {
    return (
      <div className={`relative overflow-hidden bg-crust ${className}`}>
        <Image src={product.imageUrl} alt={product.name} fill sizes={sizes} priority={priority} className={`object-cover ${zoom}`} />
      </div>
    );
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-crust ${className}`}
      role="img"
      aria-label={`${product.name} (imatge de mostra)`}
    >
      <svg viewBox="0 0 100 100" className={`h-3/4 w-3/4 ${zoom} ${hoverZoom ? "group-hover:rotate-12" : ""}`} aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="#d9b77e" />
        {/* Sense color: massa sola (la base) */}
        <circle cx="50" cy="50" r="39" fill={product.placeholderColor ?? "#ecd3a4"} />
        {product.placeholderToppings !== false && (
          <>
            <circle cx="36" cy="38" r="5" fill="#fff6e0" opacity="0.85" />
            <circle cx="61" cy="34" r="4" fill="#fff6e0" opacity="0.85" />
            <circle cx="58" cy="60" r="6" fill="#fff6e0" opacity="0.85" />
            <circle cx="38" cy="62" r="4" fill="#fff6e0" opacity="0.85" />
            <circle cx="50" cy="48" r="3" fill="#2f5d27" opacity="0.8" />
          </>
        )}
      </svg>
      {showLabel && (
        <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          Foto pendent
        </span>
      )}
    </div>
  );
}
