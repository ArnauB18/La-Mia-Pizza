import type { Metadata, Viewport } from "next";
import "@fontsource/caveat-brush";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { BUSINESS } from "@/config/business";
import { DEFAULT_LOCALE, t } from "@/messages";

export const metadata: Metadata = {
  title: `${BUSINESS.brandName} · ${t.home.title}`,
  description: t.home.subtitle,
  robots: { index: false, follow: false }, // prototip: que no l'indexin els cercadors
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
          <div className="bg-ink px-4 py-1.5 text-center text-xs text-white">{t.common.prototypeBanner}</div>
          <Header />
          <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">{children}</main>
          <footer className="mx-auto max-w-3xl px-4 pb-10 text-xs text-ink-soft">
            <p>{t.footer.legalPending}</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
