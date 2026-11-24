"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Comandes", icon: "📋", match: (p: string) => p === "/admin" || p.startsWith("/admin/repartiment") },
  { href: "/admin/productes", label: "Productes", icon: "🍕", match: (p: string) => p.startsWith("/admin/productes") },
  { href: "/admin/estoc", label: "Estoc", icon: "📦", match: (p: string) => p.startsWith("/admin/estoc") },
  { href: "/admin/zones", label: "Zones", icon: "🛵", match: (p: string) => p.startsWith("/admin/zones") },
];

/** Pestanyes de l'administració. Al mòbil es poden lliscar horitzontalment. */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administració" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-1.5 rounded-full border border-line bg-card p-1 shadow-sm">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-ink text-paper shadow" : "hover:bg-ink/10"
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
