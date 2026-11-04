import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, formatWeight } from "@/lib/format";
import { PizzaImage } from "./PizzaImage";
import { AddToCartButton } from "./AddToCartButton";

/**
 * Targeta del catàleg.
 * En passar el ratolí: la targeta s'aixeca una mica i la foto s'amplia suaument.
 * `index` serveix per escalonar l'animació d'entrada.
 */
export function ProductCard({ product, priority = false, index = 0 }: { product: Product; priority?: boolean; index?: number }) {
  return (
    <article
      style={{ animationDelay: `${index * 70}ms` }}
      className="animate-fade-up group flex overflow-hidden rounded-2xl border border-line bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-ink/25 hover:shadow-xl hover:shadow-ink/10 sm:flex-col"
    >
      <Link href={`/producte/${product.slug}`} className="block w-32 shrink-0 overflow-hidden sm:w-full" tabIndex={-1} aria-hidden="true">
        <PizzaImage
          product={product}
          className="h-full min-h-32 w-full sm:aspect-[4/3] sm:h-auto"
          sizes="(min-width: 640px) 360px, 128px"
          priority={priority}
          hoverZoom
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <Link href={`/producte/${product.slug}`} className="self-start">
          <h3 className="font-display text-2xl leading-tight decoration-2 underline-offset-4 group-hover:underline">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-ink-soft">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-lg font-bold tabular-nums">{formatPrice(product.priceCents)}</p>
            <p className="text-xs text-ink-soft">{formatWeight(product.weightGrams)}</p>
          </div>
          <AddToCartButton productId={product.id} compact />
        </div>
      </div>
    </article>
  );
}
