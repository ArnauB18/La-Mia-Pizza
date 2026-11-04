"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { BUSINESS } from "@/config/business";
import { t } from "@/messages";

export function Header() {
  const { totalUnits, ready } = useCart();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label={BUSINESS.brandName}>
          <Image src={BUSINESS.logo.src} alt="" width={BUSINESS.logo.width} height={BUSINESS.logo.height} className="h-11 w-auto" priority />
          <span className="font-display text-2xl leading-none">{BUSINESS.brandName}</span>
        </Link>
        <Link
          href="/cistella"
          className="relative flex items-center gap-2 rounded-full border border-ink/70 px-3 py-1.5 text-sm font-medium"
          aria-label={`${t.nav.cart}: ${t.cart.units(totalUnits)}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="20" r="1.3" />
            <circle cx="17" cy="20" r="1.3" />
          </svg>
          <span className="hidden min-[380px]:inline">{t.nav.cart}</span>
          {ready && totalUnits > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-paper">
              {totalUnits}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
