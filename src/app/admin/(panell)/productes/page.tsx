import Link from "next/link";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/catalog";
import { formatPrice, formatWeight } from "@/lib/format";
import { PizzaImage } from "@/components/PizzaImage";
import { SectionTitle } from "@/components/SectionTitle";
import { toggleProduct } from "../../catalog-actions";

export const metadata: Metadata = { title: "Admin · Productes", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ desat?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  const { desat } = await searchParams;
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle as="h1">Productes</SectionTitle>
        <Link
          href="/admin/productes/nou"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          + Nou producte
        </Link>
      </div>
      <p className="mt-3 text-sm text-ink-soft">
        Els canvis es veuen a la botiga al moment. Els productes desactivats no surten a la botiga, però es mantenen a les
        comandes antigues.
      </p>

      {desat && (
        <p role="status" className="animate-fade-up mt-4 rounded-lg bg-basil/10 px-3 py-2 text-sm font-medium text-basil">
          ✓ «{desat}» desat.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {products.map((p) => (
          <li
            key={p.id}
            className={`flex items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm ${p.active ? "" : "opacity-60"}`}
          >
            <PizzaImage product={p} className="h-16 w-16 shrink-0 rounded-xl" showLabel={false} sizes="64px" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">
                {p.name}{" "}
                <span className="ml-1 rounded-full bg-paper px-2 py-0.5 text-xs font-normal text-ink-soft">
                  {p.category === "pizza" ? "Pizza" : "Massa"}
                </span>
                {!p.active && (
                  <span className="ml-1 rounded-full bg-stone-200 px-2 py-0.5 text-xs font-normal">Desactivat</span>
                )}
              </p>
              <p className="text-sm text-ink-soft">
                {formatPrice(p.priceCents)} · {formatWeight(p.weightGrams)} · {p.shelfLifeDays} dies
                {!p.imageUrl && " · sense foto"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
              <Link
                href={`/admin/productes/${p.id}`}
                className="rounded-full border border-ink/60 px-3 py-1.5 text-center text-sm font-semibold transition hover:bg-ink hover:text-paper"
              >
                Editar
              </Link>
              <form action={toggleProduct}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="active" value={String(!p.active)} />
                <button className="w-full rounded-full px-3 py-1.5 text-sm text-ink-soft underline-offset-2 transition hover:text-ink hover:underline">
                  {p.active ? "Desactivar" : "Activar"}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
