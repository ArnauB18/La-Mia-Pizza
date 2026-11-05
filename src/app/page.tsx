import Image from "next/image";
import { getProductsByCategory } from "@/lib/products";
import { CATEGORIES } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { BUSINESS } from "@/config/business";
import { t } from "@/messages";

export default function HomePage() {
  return (
    <>
      {/* Capçalera a l'estil de la referència: logo + nom manuscrit sobre beix */}
      <section className="mb-10 flex items-center gap-4 sm:gap-6">
        <Image
          src={BUSINESS.logo.src}
          unoptimized
          alt={BUSINESS.brandName}
          width={BUSINESS.logo.width}
          height={BUSINESS.logo.height}
          className="animate-scooter-in h-28 w-auto shrink-0 sm:h-36"
          priority
        />
        <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
          <h1 className="font-display text-4xl leading-none sm:text-5xl">{t.home.title}</h1>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">{t.home.subtitle}</p>
        </div>
      </section>

      {/* Una secció per categoria: pizzes fetes i bases */}
      {CATEGORIES.map((category, sectionIndex) => {
        const products = getProductsByCategory(category);
        if (products.length === 0) return null;
        const section = t.home.sections[category];
        return (
          <section key={category} aria-labelledby={`cat-${category}`} className="mb-12 scroll-mt-20">
            <SectionTitle id={`cat-${category}`}>{section.title}</SectionTitle>
            <p className="mb-5 mt-2 text-sm text-ink-soft">{section.intro}</p>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} priority={sectionIndex === 0 && i === 0} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
        <SectionTitle className="text-3xl">{t.home.howTitle}</SectionTitle>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {t.home.howSteps.map((step, i) => (
            <li key={i} className="flex gap-3 sm:flex-col sm:gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink font-display text-xl leading-none">
                {i + 1}
              </span>
              <span className="text-sm leading-snug sm:text-base">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
