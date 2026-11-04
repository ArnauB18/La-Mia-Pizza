"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Pantalla d'error amable (en lloc de la pàgina en blanc per defecte). */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-16 text-center">
      <p className="font-display text-4xl">Vaja, alguna cosa ha fallat</p>
      <p className="mt-3 text-ink-soft">Torna-ho a provar d&apos;aquí a un moment.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark">
          Tornar-ho a provar
        </button>
        <Link href="/" className="rounded-full border border-ink/70 px-6 py-3 font-semibold transition hover:bg-ink hover:text-paper">
          Inici
        </Link>
      </div>
    </div>
  );
}
