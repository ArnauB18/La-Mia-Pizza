"use client";

import { useActionState } from "react";
import { saveZone } from "@/app/admin/catalog-actions";
import type { DeliveryZone } from "@/config/delivery";
import { Field, Input, Spinner } from "@/components/ui";

const DAYS = [
  { n: 1, label: "Dl" },
  { n: 2, label: "Dt" },
  { n: 3, label: "Dc" },
  { n: 4, label: "Dj" },
  { n: 5, label: "Dv" },
  { n: 6, label: "Ds" },
  { n: 0, label: "Dg" },
];

const euros = (c: number | null) => (c === null ? "" : (c / 100).toFixed(2).replace(".", ","));

export function ZoneForm({ zone }: { zone: DeliveryZone }) {
  const [state, action, pending] = useActionState(saveZone, undefined);
  const e = state?.errors ?? {};
  const id = (f: string) => `${zone.id}-${f}`;

  return (
    <form action={action} className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5" noValidate>
      <input type="hidden" name="id" value={zone.id} />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl leading-none">{zone.name}</h2>
          <p className="mt-1 text-xs text-ink-soft">Codis postals que comencen per {zone.postalCodePrefixes.join(", ")}</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="active" defaultChecked={zone.active} className="h-5 w-5 accent-ink" />
          Activa
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Enviament (€)" htmlFor={id("fee")} error={e.deliveryFee}>
          <Input id={id("fee")} name="deliveryFee" inputMode="decimal" defaultValue={euros(zone.deliveryFeeCents)} invalid={!!e.deliveryFee} />
        </Field>
        <Field label="Gratis des de (€)" htmlFor={id("free")} error={e.freeShippingFrom} help="Buit = mai">
          <Input id={id("free")} name="freeShippingFrom" inputMode="decimal" defaultValue={euros(zone.freeShippingFromCents)} invalid={!!e.freeShippingFrom} />
        </Field>
        <Field label="Comanda mínima (€)" htmlFor={id("min")} error={e.minOrder}>
          <Input id={id("min")} name="minOrder" inputMode="decimal" defaultValue={euros(zone.minOrderCents)} invalid={!!e.minOrder} />
        </Field>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-semibold">Dies de repartiment</legend>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((d) => (
            <label
              key={d.n}
              className="flex h-10 w-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-paper text-sm font-semibold transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper"
            >
              <input type="checkbox" name="deliveryWeekdays" value={d.n} defaultChecked={zone.deliveryWeekdays.includes(d.n)} className="sr-only" />
              {d.label}
            </label>
          ))}
        </div>
        {e.deliveryWeekdays && <p className="mt-1 text-sm text-red-700">{e.deliveryWeekdays}</p>}
      </fieldset>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="Hora límit per demanar" htmlFor={id("cutoff")} error={e.cutoffTime}>
          <Input id={id("cutoff")} name="cutoffTime" type="time" defaultValue={zone.cutoffTime} invalid={!!e.cutoffTime} />
        </Field>
        <Field label="Dies d'antelació" htmlFor={id("lead")} error={e.leadDays} help="2 = fins a l'hora límit de 2 dies abans">
          <Input id={id("lead")} name="leadDays" type="number" min={0} max={14} defaultValue={zone.leadDays} invalid={!!e.leadDays} />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {pending && <Spinner className="h-4 w-4" />} Desar {zone.name}
        </button>
        {state?.message && (
          <p role="status" className={`text-sm font-medium ${state.ok ? "text-basil" : "text-red-700"}`}>
            {state.ok ? "✓ " : ""}
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
