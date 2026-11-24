"use client";

import { useActionState, useState } from "react";
import { saveStock } from "@/app/admin/catalog-actions";
import type { StockCell } from "@/lib/orders";
import { formatDateParts } from "@/lib/dates";
import { Spinner } from "@/components/ui";

export function StockForm({
  defaultStock,
  dates,
  products,
  cells,
}: {
  defaultStock: number;
  dates: string[];
  products: { id: string; name: string }[];
  cells: Record<string, StockCell>;
}) {
  const [state, action, pending] = useActionState(saveStock, undefined);
  const [def, setDef] = useState(String(defaultStock));
  const defNum = Number(def) || 0;

  return (
    <form action={action} className="mt-6 space-y-5" noValidate>
      <label className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-4 shadow-sm">
        <span className="font-semibold">Capacitat per defecte</span>
        <input
          name="defaultStock"
          type="number"
          min={0}
          value={def}
          onChange={(e) => setDef(e.target.value)}
          className="w-24 rounded-xl border border-line bg-paper px-3 py-2 text-center font-semibold"
        />
        <span className="text-sm text-ink-soft">unitats de cada producte per dia</span>
      </label>

      {dates.length === 0 ? (
        <p className="text-ink-soft">No hi ha cap zona activa amb dies de repartiment.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="sticky left-0 bg-card p-3 text-left font-semibold">Producte</th>
                {dates.map((d) => {
                  const p = formatDateParts(d);
                  return (
                    <th key={d} className="p-2 text-center font-normal">
                      <span className="block text-xs uppercase text-ink-soft">{p.weekday}</span>
                      <span className="font-display text-2xl leading-none">{p.day}</span>
                      <span className="block text-xs text-ink-soft">{p.month}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="border-b border-line/60 last:border-0">
                  <th scope="row" className="sticky left-0 bg-card p-3 text-left font-semibold">
                    {prod.name}
                  </th>
                  {dates.map((d) => {
                    const cell = cells[`${prod.id}|${d}`] ?? { capacity: null, sold: 0 };
                    const cap = cell.capacity ?? defNum;
                    const left = cap - cell.sold;
                    return (
                      <td key={d} className="p-1.5 text-center align-top">
                        <input
                          name={`cap|${prod.id}|${d}`}
                          type="number"
                          min={0}
                          defaultValue={cell.capacity ?? ""}
                          placeholder={String(defNum)}
                          aria-label={`${prod.name}, ${d}: capacitat`}
                          className="w-16 rounded-lg border border-line bg-paper px-1 py-1.5 text-center font-semibold placeholder:font-normal placeholder:text-ink-soft/60"
                        />
                        <span
                          className={`mt-1 block text-[11px] ${left <= 0 ? "font-bold text-red-700" : left <= 3 ? "font-semibold text-amber-700" : "text-ink-soft"}`}
                        >
                          {cell.sold} ven. · {Math.max(0, left)} queden
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {pending && <Spinner />} Desar l&apos;estoc
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
