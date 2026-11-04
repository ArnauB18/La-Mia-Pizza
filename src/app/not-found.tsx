import Link from "next/link";
import { t } from "@/messages";

export default function NotFound() {
  return (
    <div className="py-12 text-center">
      <p className="text-ink-soft">{t.product.notFound}</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">
        {t.cart.goToCatalog}
      </Link>
    </div>
  );
}
