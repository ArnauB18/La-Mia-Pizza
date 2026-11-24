"use client";

/**
 * Formulari d'edició de producte. Totes les dades que es veuen a la fitxa de la
 * botiga (preu, al·lèrgens, vida útil...) es poden canviar aquí.
 */
import { useActionState, useEffect, useState } from "react";
import { saveProduct } from "@/app/admin/catalog-actions";
import { Field, Input, Spinner, Textarea } from "@/components/ui";
import { ALLERGENS, type Product } from "@/lib/types";
import { t } from "@/messages";
import { ImageUploader } from "./ImageUploader";

const centsToText = (c?: number) => (c === undefined ? "" : (c / 100).toFixed(2).replace(".", ","));

export function ProductForm({ product, defaultSortOrder }: { product?: Product; defaultSortOrder: number }) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [allergens, setAllergens] = useState<string[]>(product?.allergens ?? []);
  // Els errors s'amaguen en tornar a editar i reapareixen si el següent intent també falla
  const [showErrors, setShowErrors] = useState(true);
  useEffect(() => setShowErrors(true), [state]);
  const e = showErrors ? (state?.errors ?? {}) : {};

  return (
    <form action={action} className="mt-6 space-y-8" noValidate onChange={() => setShowErrors(false)}>
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {/* ── Foto ── */}
      <Section title="Foto">
        <ImageUploader value={imageUrl} onChange={setImageUrl} name={product?.name ?? ""} />
        {e.imageUrl && <p className="mt-1 text-sm text-red-700">{e.imageUrl}</p>}
      </Section>

      {/* ── Dades bàsiques ── */}
      <Section title="Dades bàsiques">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom" htmlFor="name" error={e.name} className="sm:col-span-2">
            <Input id="name" name="name" defaultValue={product?.name} required invalid={!!e.name} />
          </Field>
          <Field label="Categoria" htmlFor="category" error={e.category}>
            <select
              id="category"
              name="category"
              defaultValue={product?.category ?? "pizza"}
              className="w-full rounded-xl border border-line bg-card px-3.5 py-3"
            >
              <option value="pizza">Pizza</option>
              <option value="base">La nostra massa</option>
            </select>
          </Field>
          <Field label="Preu (€, IVA inclòs)" htmlFor="price" error={e.price}>
            <Input id="price" name="price" inputMode="decimal" placeholder="8,50" defaultValue={centsToText(product?.priceCents)} invalid={!!e.price} />
          </Field>
          <Field label="Pes (grams)" htmlFor="weightGrams" error={e.weightGrams}>
            <Input id="weightGrams" name="weightGrams" type="number" min={1} defaultValue={product?.weightGrams} invalid={!!e.weightGrams} />
          </Field>
          <Field label="Vida útil (dies des de l'envasat)" htmlFor="shelfLifeDays" error={e.shelfLifeDays}>
            <Input id="shelfLifeDays" name="shelfLifeDays" type="number" min={1} defaultValue={product?.shelfLifeDays} invalid={!!e.shelfLifeDays} />
          </Field>
          <Field label="Conservació" htmlFor="storage">
            <select
              id="storage"
              name="storage"
              defaultValue={product?.storage ?? "refrigerated"}
              className="w-full rounded-xl border border-line bg-card px-3.5 py-3"
            >
              <option value="refrigerated">{t.product.storageRefrigerated}</option>
              <option value="frozen">{t.product.storageFrozen}</option>
            </select>
          </Field>
          <Field label="Ordre al catàleg" htmlFor="sortOrder" error={e.sortOrder} help="Número més petit = surt abans.">
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? defaultSortOrder} invalid={!!e.sortOrder} />
          </Field>
          <label className="flex items-center gap-2.5 self-end pb-3 text-sm font-semibold">
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-5 w-5 accent-ink" />
            Visible a la botiga
          </label>
        </div>
      </Section>

      {/* ── Textos ── */}
      <Section title="Textos">
        <div className="space-y-4">
          <Field label="Descripció curta (targeta del catàleg)" htmlFor="shortDescription" error={e.shortDescription}>
            <Input id="shortDescription" name="shortDescription" maxLength={160} defaultValue={product?.shortDescription} />
          </Field>
          <Field label="Descripció (fitxa del producte)" htmlFor="description" error={e.description}>
            <Textarea id="description" name="description" rows={3} maxLength={1000} defaultValue={product?.description} />
          </Field>
          <Field label="Preparació" htmlFor="preparation" error={e.preparation}>
            <Textarea id="preparation" name="preparation" rows={2} maxLength={500} defaultValue={product?.preparation} />
          </Field>
        </div>
      </Section>

      {/* ── Etiquetatge ── */}
      <Section title="Etiquetatge i al·lèrgens">
        <div className="space-y-5">
          <Field
            label="Ingredients"
            htmlFor="ingredients"
            error={e.ingredients}
            help="Tal com surten a l'etiqueta. Escriu els al·lèrgens en MAJÚSCULES (p. ex. Farina de BLAT, LLET)."
          >
            <Textarea id="ingredients" name="ingredients" rows={3} maxLength={2000} defaultValue={product?.ingredients} />
          </Field>
          <AllergenGroup
            name="allergens"
            title="Conté"
            selected={allergens}
            onChange={setAllergens}
          />
          <AllergenGroup
            name="mayContain"
            title="Pot contenir traces de"
            selected={product?.mayContain ?? []}
            disabled={allergens}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lot (opcional)" htmlFor="lot" error={e.lot}>
              <Input id="lot" name="lot" maxLength={60} defaultValue={product?.lot} />
            </Field>
            <Field label="Consumir preferentment abans de (opcional)" htmlFor="bestBefore" error={e.bestBefore}>
              <Input id="bestBefore" name="bestBefore" type="date" defaultValue={product?.bestBefore} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Adreça web ── */}
      <Section title="Adreça a la web">
        <Field
          label="Adreça (opcional)"
          htmlFor="slug"
          error={e.slug}
          help="Es fa sola a partir del nom. Si la canvies, l'enllaç antic deixarà de funcionar."
        >
          <div className="flex items-center gap-1 text-sm">
            <span className="text-ink-soft">/producte/</span>
            <Input id="slug" name="slug" defaultValue={product?.slug} placeholder="turo" invalid={!!e.slug} />
          </div>
        </Field>
      </Section>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        {showErrors && state?.message && (
          <p role="alert" className="mb-2 text-sm font-medium text-red-700">
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
        >
          {pending && <Spinner />} {product ? "Desar canvis" : "Crear producte"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

/** Caselles dels 14 al·lèrgens oficials. A "traces" es desactiven els que ja "conté". */
function AllergenGroup({
  name,
  title,
  selected,
  onChange,
  disabled = [],
}: {
  name: string;
  title: string;
  selected: string[];
  onChange?: (v: string[]) => void;
  disabled?: string[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      <div className="flex flex-wrap gap-1.5">
        {ALLERGENS.map((a) => {
          const off = disabled.includes(a);
          return (
            <label
              key={a}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper ${
                off ? "pointer-events-none opacity-30" : "border-line bg-paper hover:border-ink/50"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={a}
                defaultChecked={selected.includes(a) && !off}
                disabled={off}
                onChange={(ev) => onChange?.(ev.target.checked ? [...selected, a] : selected.filter((x) => x !== a))}
                className="sr-only"
              />
              {t.allergens[a]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
