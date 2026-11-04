import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, formatWeight } from "@/lib/format";
import { PizzaImage } from "./PizzaImage";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="flex overflow-hidden rounded-2xl border border-line bg-card shadow-sm sm:flex-col">
      <Link href={`/producte/${product.slug}`} className="block w-32 shrink-0 sm:w-full">
        <PizzaImage
          product={product}
          className="h-full min-h-32 w-full sm:aspect-[4/3] sm:h-auto"
          sizes="(min-width: 640px) 360px, 128px"
          priority={priority}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <Link href={`/producte/${product.slug}`}>
          <h2 className="font-display text-2xl leading-tight">{product.name}</h2>
        </Link>
        <p className="line-clamp-2 text-sm text-ink-soft">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-lg font-bold">{formatPrice(product.priceCents)}</p>
            <p className="text-xs text-ink-soft">{formatWeight(product.weightGrams)}</p>
          </div>
          <AddToCartButton productId={product.id} compact />
        </div>
      </div>
    </article>
  );
}
