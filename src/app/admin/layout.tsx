import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Marc de l'administració (també la pàgina d'entrada): sense la capçalera ni el peu de la botiga. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-3 pb-16 pt-3 sm:px-4 sm:pt-5 print:max-w-none print:p-0">{children}</div>;
}
