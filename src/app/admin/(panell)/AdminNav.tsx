"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Comandes", icon: "📋", match: (p: string) => p === "/admin" || p.startsWith("/admin/repartiment") },
  { href: "/admin/productes", label: "Productes", icon: "🍕", match: (p: string) => p.startsWith("/admin/productes") },
  { href: "/admin/estoc", label: "Estoc", icon: "📦", match: (p: string) => p.startsWith("/admin/estoc") },
  { href: "/admin/zones", label: "Zones", icon: "🛵", match: (p: string) => p.startsWith("/admin/zones") },
];

/**
 * Pestanyes de l'administració.
 * Mòbil: 4 botons iguals que omplen l'amplada (icona a sobre, nom a sota), sense lliscar.
 * Ordinador: una sola fila en forma de pastilla.
 */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administració" className="w-full sm:w-auto">
      <ul className="grid grid-cols-4 gap-1 rounded-2xl border border-line bg-card p-1 shadow-sm sm:flex sm:gap-1.5 sm:rounded-full">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-xs font-semibold transition sm:flex-row sm:gap-1.5 sm:whitespace-nowrap sm:rounded-full sm:px-4 sm:text-sm ${
                  active ? "bg-ink text-paper shadow" : "hover:bg-ink/10"
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none sm:text-base">
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
