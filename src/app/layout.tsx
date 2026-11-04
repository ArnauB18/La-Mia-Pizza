import type { Metadata, Viewport } from "next";
import "@fontsource/caveat-brush";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { AddedToast } from "@/components/AddedToast";
import { Footer } from "@/components/Footer";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="min-h-dvh font-sans antialiased">
        <CartProvider>
          {/* Enllaç per saltar directament al contingut (accessibilitat amb teclat) */}
          <a
            href="#contingut"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
          >
            Salta al contingut
          </a>
          <div className="bg-ink px-4 py-1.5 text-center text-xs text-white print:hidden">{t.common.prototypeBanner}</div>
          <Header />
          <main id="contingut" className="mx-auto max-w-3xl px-4 pb-16 pt-6 lg:max-w-5xl">
            {children}
          </main>
          <Footer />
          <AddedToast />
        </CartProvider>
      </body>
    </html>
  );
}
