import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getProducts, getProductsByCategory } from "@/lib/products";
import { formatPrice, formatWeight } from "@/lib/format";
import { PizzaImage } from "@/components/PizzaImage";
import { StickyAddBar } from "@/components/StickyAddBar";
import { ZoomableImage } from "@/components/ZoomableImage";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { AllergenList } from "@/components/AllergenList";
import { t } from "@/messages";

type Props = { params: Promise<{ slug: string }> };

// Fase 1: pàgines estàtiques generades a partir del fitxer de mostra.
export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  return { title: product ? product.name : t.product.notFound };
}

export default async function ProductPage({ params }: Props) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();

  const p = product;
  // Suggeriments: altres productes de la mateixa categoria
  const related = getProductsByCategory(p.category)
    .filter((x) => x.id !== p.id)
    .slice(0, 2);

  return (
    <article className="pb-20 sm:pb-0">
      <Link
        href="/"
        className="group mb-4 inline-flex items-center gap-1 text-sm text-ink-soft transition hover:text-ink"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span> {t.common.back}
      </Link>

      {/* Mòbil: una columna. Ordinador: foto fixa a l'esquerra i informació a la dreta */}
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <div className="md:sticky md:top-20 md:self-start">
          <ZoomableImage className="animate-fade-up rounded-2xl shadow-lg shadow-ink/10">
            <PizzaImage product={p} className="aspect-square w-full" priority sizes="(min-width: 768px) 360px, 100vw" />
          </ZoomableImage>
        </div>

        <div>
          <header className="mt-5 md:mt-0">
            <h1 className="font-display text-5xl leading-none">{p.name}</h1>
            <p className="mt-2 text-ink-soft">{p.description}</p>
            <p className="mt-4 text-2xl font-bold">
              {formatPrice(p.priceCents)}{" "}
              <span className="text-sm font-normal text-ink-soft">
                {t.common.vatIncluded} ({t.common.vatPending})
              </span>
            </p>
          </header>

          <div className="mt-5">
            <StickyAddBar product={p} />
          </div>

          {/* Fitxa amb la informació que ha d'aparèixer a l'etiqueta */}
          <dl className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <InfoBox label={t.product.weight} value={formatWeight(p.weightGrams)} />
            <InfoBox label={t.product.shelfLife} value={t.product.shelfLifeValue(p.shelfLifeDays)} />
            <InfoBox
              label={t.product.storage}
              value={p.storage === "frozen" ? t.product.storageFrozen : t.product.storageRefrigerated}
              wide
            />
          </dl>

          <Section title={t.product.allergens}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{t.product.contains}</p>
            <AllergenList allergens={p.allergens} />
            {p.mayContain.length > 0 && (
              <>
                <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {t.product.mayContain}
                </p>
                <AllergenList allergens={p.mayContain} tone="soft" />
              </>
            )}
          </Section>

          <Section title={t.product.ingredients}>
            <p className="text-sm leading-relaxed">{p.ingredients}</p>
          </Section>

          <Section title={t.product.preparation}>
            <p className="text-sm leading-relaxed">{p.preparation}</p>
          </Section>

          <Section title={`${t.product.lot} · ${t.product.bestBefore.toLowerCase()}`}>
            {p.lot || p.bestBefore ? (
              <p className="text-sm">
                {p.lot && `${t.product.lot}: ${p.lot}`} {p.bestBefore && `· ${t.product.bestBefore}: ${p.bestBefore}`}
              </p>
            ) : (
              <p className="text-sm text-ink-soft">{t.product.lotPending}</p>
            )}
          </Section>

          <p className="mt-8 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-900">
            ⚠️ {t.product.sampleDataNotice}
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <SectionTitle className="text-3xl">{t.product.related}</SectionTitle>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-5">
            {related.map((r, i) => (
              <ProductCard key={r.id} product={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function InfoBox({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-line bg-card p-3 transition hover:border-ink/25 ${wide ? "col-span-2" : ""}`}
    >
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}
