import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/config/business";
import { t } from "@/messages";

const LEGAL = ["condicions", "enviaments", "devolucions", "privacitat"] as const;

export function Footer() {
  return (
    <footer className="mt-8 border-t border-line print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 lg:max-w-5xl sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={BUSINESS.logo.src}
            unoptimized
            alt=""
            width={BUSINESS.logo.width}
            height={BUSINESS.logo.height}
            className="h-12 w-auto opacity-80"
          />
          <div>
            <p className="font-display text-2xl leading-none">{BUSINESS.brandName}</p>
            <p className="mt-1 text-xs text-ink-soft">Vallès Oriental</p>
          </div>
        </div>
        <nav aria-label={t.footer.legal}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {LEGAL.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/legal/${slug}`}
                  className="text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
                >
                  {t.footer.links[slug]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin"
                className="text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
              >
                {t.footer.staff}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-3xl px-4 pb-8 text-xs lg:max-w-5xl text-ink-soft">{t.footer.rights}</p>
    </footer>
  );
}
