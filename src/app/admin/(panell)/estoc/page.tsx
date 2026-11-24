import type { Metadata } from "next";
import { getDefaultDailyStock, getProducts, getZones } from "@/lib/catalog";
import { getStockGrid } from "@/lib/orders";
import { upcomingDeliveryDates } from "@/lib/dates";
import { SectionTitle } from "@/components/SectionTitle";
import { StockForm } from "./StockForm";

export const metadata: Metadata = { title: "Admin · Estoc", robots: { index: false, follow: false } };

/** Quants dies d'entrega es mostren a la graella. */
const DAYS_SHOWN = 8;

export default async function AdminStockPage() {
  const [products, zones, defaultStock] = await Promise.all([getProducts(), getZones(), getDefaultDailyStock()]);
  // Dies en què alguna zona activa reparteix (sense repetir), els més propers primer
  const dates = [...new Set(zones.filter((z) => z.active).flatMap((z) => upcomingDeliveryDates(z, new Date(), DAYS_SHOWN)))]
    .sort()
    .slice(0, DAYS_SHOWN);
  const grid = await getStockGrid(dates, products.map((p) => p.id));

  return (
    <div>
      <SectionTitle as="h1">Estoc</SectionTitle>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft">
        Quantes unitats de cada producte pot preparar l&apos;obrador per a cada dia d&apos;entrega. Quan s&apos;esgota, aquell
        dia surt com a «Exhaurit» a la botiga. Deixa una casella buida per fer servir la capacitat per defecte.
      </p>
      <StockForm
        defaultStock={defaultStock}
        dates={dates}
        products={products.map((p) => ({ id: p.id, name: p.name }))}
        cells={Object.fromEntries(grid)}
      />
    </div>
  );
}
