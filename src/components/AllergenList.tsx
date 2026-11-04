import type { Allergen } from "@/lib/types";
import { t } from "@/messages";

/** Llista d'al·lèrgens en format "xip", ben visible (és informació obligatòria). */
export function AllergenList({ allergens, tone = "strong" }: { allergens: Allergen[]; tone?: "strong" | "soft" }) {
  if (allergens.length === 0) return <p className="text-sm text-ink-soft">—</p>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {allergens.map((a) => (
        <li
          key={a}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            tone === "strong" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-700"
          }`}
        >
          {t.allergens[a]}
        </li>
      ))}
    </ul>
  );
}
