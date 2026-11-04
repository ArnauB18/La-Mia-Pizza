import Image from "next/image";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { BUSINESS } from "@/config/business";
import { t } from "@/messages";

export default function HomePage() {
  const products = getProducts();
  return (
    <>
      {/* Capçalera a l'estil de la referència: logo + nom manuscrit sobre beix */}
      <section className="mb-8 flex items-center gap-4 sm:gap-6">
        <Image
          src={BUSINESS.logo.src}
          alt={BUSINESS.brandName}
          width={BUSINESS.logo.width}
          height={BUSINESS.logo.height}
          className="h-28 w-auto shrink-0 sm:h-36"
          priority
        />
        <div>
          <h1 className="font-display text-4xl leading-none sm:text-5xl">{t.home.title}</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">{t.home.subtitle}</p>
        </div>
      </section>

      <section aria-label={t.nav.catalog} className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 2} />
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-display text-3xl">{t.home.howTitle}</h2>
        <ol className="mt-3 space-y-2">
          {t.home.howSteps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-paper">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
