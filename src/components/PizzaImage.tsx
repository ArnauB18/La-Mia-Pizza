import type { Product } from "@/lib/types";

/**
 * Imatge del producte. Mentre no tinguem fotos reals (no en fem servir sense
 * permís), dibuixa un marcador de posició amb el color de cada pizza.
 */
export function PizzaImage({
  product,
  className = "",
  showLabel = true,
}: {
  product: Product;
  className?: string;
  /** Amagar l'etiqueta "Imatge de mostra" a les miniatures petites. */
  showLabel?: boolean;
}) {
  if (product.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.imageUrl} alt={product.name} className={`object-cover ${className}`} />;
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-crust ${className}`}
      role="img"
      aria-label={`${product.name} (imatge de mostra)`}
    >
      <svg viewBox="0 0 100 100" className="h-3/4 w-3/4" aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill="#e8c48a" />
        <circle cx="50" cy="50" r="39" fill={product.placeholderColor} />
        <circle cx="36" cy="38" r="5" fill="#fff6e0" opacity="0.85" />
        <circle cx="61" cy="34" r="4" fill="#fff6e0" opacity="0.85" />
        <circle cx="58" cy="60" r="6" fill="#fff6e0" opacity="0.85" />
        <circle cx="38" cy="62" r="4" fill="#fff6e0" opacity="0.85" />
        <circle cx="50" cy="48" r="3" fill="#2f5d27" opacity="0.8" />
      </svg>
      {showLabel && (
        <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          Imatge de mostra
        </span>
      )}
    </div>
  );
}
