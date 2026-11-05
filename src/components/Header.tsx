"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { BUSINESS } from "@/config/business";
import { t } from "@/messages";

export function Header() {
  const { totalUnits, ready, lastAdded } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Ombra suau a la capçalera només quan s'ha fet scroll (sensació de profunditat)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onCart = pathname === "/cistella";

  return (
    <header
      className={`sticky top-0 z-20 border-b bg-paper/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "border-line shadow-[0_6px_20px_-12px_rgba(28,26,23,0.35)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 lg:max-w-5xl">
        <Link href="/" className="group flex items-center gap-2" aria-label={BUSINESS.brandName}>
          <Image
            src={BUSINESS.logo.src}
            unoptimized
            alt=""
            width={BUSINESS.logo.width}
            height={BUSINESS.logo.height}
            className="h-11 w-auto transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
            priority
          />
          <span className="font-display text-2xl leading-none">{BUSINESS.brandName}</span>
        </Link>
        <Link
          href="/cistella"
          aria-current={onCart ? "page" : undefined}
          className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition duration-200 active:scale-95 ${
            onCart ? "border-ink bg-ink text-paper" : "border-ink/70 hover:bg-ink hover:text-paper"
          }`}
          aria-label={`${t.nav.cart}: ${t.cart.units(totalUnits)}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="20" r="1.3" />
            <circle cx="17" cy="20" r="1.3" />
          </svg>
          <span className="hidden min-[380px]:inline">{t.nav.cart}</span>
          {ready && totalUnits > 0 && (
            // La `key` canvia a cada afegit → el comptador torna a fer el "salt"
            <span
              key={lastAdded?.at ?? 0}
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold tabular-nums ${
                lastAdded ? "animate-bump" : ""
              } ${onCart ? "bg-paper text-ink" : "bg-brand text-paper group-hover:bg-paper group-hover:text-ink"}`}
            >
              {totalUnits}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
