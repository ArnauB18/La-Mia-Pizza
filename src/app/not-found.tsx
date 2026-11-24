import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/config/business";
import { t } from "@/messages";

/** Adreça que no existeix (fora de la botiga i de l'admin). */
export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <Image src={BUSINESS.logo.src} alt={BUSINESS.brandName} width={BUSINESS.logo.width} height={BUSINESS.logo.height} unoptimized className="mx-auto h-24 w-auto" />
      <p className="mt-6 text-ink-soft">Aquesta pàgina no existeix.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">
        {t.cart.goToCatalog}
      </Link>
    </main>
  );
}
