import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { t } from "@/messages";

export default function HomePage() {
  const products = getProducts();
  return (
    <>
      <section className="mb-6">
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{t.home.title}</h1>
        <p className="mt-2 text-ink-soft">{t.home.subtitle}</p>
      </section>

      <section aria-label={t.nav.catalog} className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </section>

      <section className="mt-10 rounded-2xl bg-crust p-5">
        <h2 className="font-display text-xl font-bold">{t.home.howTitle}</h2>
        <ol className="mt-3 space-y-2">
          {t.home.howSteps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tomato text-sm font-bold text-white">
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
