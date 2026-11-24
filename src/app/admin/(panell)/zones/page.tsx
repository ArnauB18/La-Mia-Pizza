import type { Metadata } from "next";
import { getZones } from "@/lib/catalog";
import { SectionTitle } from "@/components/SectionTitle";
import { ZoneForm } from "./ZoneForm";

export const metadata: Metadata = { title: "Admin · Zones", robots: { index: false, follow: false } };

export default async function AdminZonesPage() {
  const zones = await getZones();
  return (
    <div>
      <SectionTitle as="h1">Zones d&apos;entrega</SectionTitle>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft">
        Entrega a domicili per províncies, segons el codi postal del client. Aquí es decideix el cost, la comanda mínima,
        quins dies es reparteix i fins quan es pot demanar. Els canvis s&apos;apliquen a la botiga al moment.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {zones.map((z) => (
          <ZoneForm key={z.id} zone={z} />
        ))}
      </div>
    </div>
  );
}
