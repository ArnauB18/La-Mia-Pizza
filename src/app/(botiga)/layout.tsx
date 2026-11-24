import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { AddedToast } from "@/components/AddedToast";
import { Footer } from "@/components/Footer";
import { getProducts } from "@/lib/catalog";
import { t } from "@/messages";

/** Marc de la botiga: avís de prototip, capçalera amb cistella, peu i avís d'"afegit". */
export default async function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Catàleg actiu per a la cistella (preus actuals; surt de la memòria cau, no de la BD a cada visita)
  const products = await getProducts();
  return (
    <CartProvider products={products}>
      {/* Enllaç per saltar directament al contingut (accessibilitat amb teclat) */}
      <a
        href="#contingut"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Salta al contingut
      </a>
      <div className="bg-ink px-4 py-1.5 text-center text-xs text-white print:hidden">{t.common.prototypeBanner}</div>
      <Header />
      <main id="contingut" className="mx-auto max-w-3xl px-4 pb-16 pt-6 lg:max-w-5xl print:max-w-none print:p-0">
        {children}
      </main>
      <Footer />
      <AddedToast />
    </CartProvider>
  );
}
