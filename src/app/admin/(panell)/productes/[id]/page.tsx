import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/catalog";
import { SectionTitle } from "@/components/SectionTitle";
import type { Product } from "@/lib/types";
import { ProductForm } from "./ProductForm";

export const metadata: Metadata = { title: "Admin · Editar producte", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

/** Edició d'un producte existent, o creació si l'adreça és /admin/productes/nou. */
export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const all = await getAllProducts();
  const isNew = id === "nou";
  const product: Product | undefined = isNew ? undefined : all.find((p) => p.id === id);
  if (!isNew && !product) notFound();
  const nextOrder = Math.max(0, ...all.map((p) => p.sortOrder ?? 0)) + 10;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/productes" className="group mb-4 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <span className="transition-transform group-hover:-translate-x-1">←</span> Productes
      </Link>
      <SectionTitle as="h1">{isNew ? "Nou producte" : product!.name}</SectionTitle>
      <ProductForm product={product} defaultSortOrder={nextOrder} />
    </div>
  );
}
