import type { Metadata, Viewport } from "next";
import "@fontsource/caveat-brush";
import "./globals.css";
import { BUSINESS } from "@/config/business";
import { DEFAULT_LOCALE, t } from "@/messages";

export const metadata: Metadata = {
  // Les pàgines només posen el seu títol: "Turó · La Mia Pizza"
  title: { default: `${BUSINESS.brandName} · ${t.home.title}`, template: `%s · ${BUSINESS.brandName}` },
  description: t.home.subtitle,
  robots: { index: false, follow: false }, // prototip: que no l'indexin els cercadors
  openGraph: { siteName: BUSINESS.brandName, locale: "ca_ES", type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4e3c7",
};

/**
 * Marc comú mínim. Cada part de la web té el seu:
 *   - botiga: src/app/(botiga)/layout.tsx (capçalera, cistella, peu)
 *   - administració: src/app/admin/layout.tsx (barra compacta)
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
