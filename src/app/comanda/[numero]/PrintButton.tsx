"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-ink/70 px-6 py-3 font-semibold transition hover:bg-ink hover:text-paper"
    >
      {label}
    </button>
  );
}
