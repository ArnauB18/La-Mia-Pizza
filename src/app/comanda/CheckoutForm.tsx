"use client";

/**
 * Procés de comanda en una sola pàgina, en 4 passos:
 *   1. Codi postal → comprovem si hi arribem (zona)
 *   2. Dia i franja d'entrega (segons zona i estoc)
 *   3. Dades de contacte i adreça
 *   4. Pagament (simulat) i acceptació de condicions
 *
 * El formulari valida al moment amb el mateix esquema que el servidor, però qui
 * decideix és el servidor (`submitOrder`), que ho torna a comprovar tot.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { computeTotals } from "@/lib/pricing";
import { formatDateParts, formatLongDate } from "@/lib/dates";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import type { DeliveryOptionsResult } from "@/lib/orders";
import { PizzaImage } from "@/components/PizzaImage";
import { SectionTitle } from "@/components/SectionTitle";
import { Field, Input, Spinner, StepHeader, Textarea } from "@/components/ui";
import { fetchDeliveryOptions, submitOrder } from "./actions";
import { t } from "@/messages";

const REMEMBER_KEY = "lmp-customer-v1";
const TEST_CARD = "4242 4242 4242 4242";

type Customer = { name: string; phone: string; email: string };
type Address = { line: string; extra: string; town: string; notes: string };

/** Clau d'error ("customer.email") → id del camp ("customer-email") */
const fieldId = (key: string) => key.replace(/\./g, "-");

function formatCard(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function CheckoutForm() {
  const router = useRouter();
  const { ready, lines, clear } = useCart();

  const [postalCode, setPostalCode] = useState("");
  const [delivery, setDelivery] = useState<DeliveryOptionsResult | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", email: "" });
  const [address, setAddress] = useState<Address>({ line: "", extra: "", town: "", notes: "" });
  const [remember, setRemember] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [card, setCard] = useState({ number: TEST_CARD, expiry: "12/30", cvc: "123" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");
  const [submitting, startSubmit] = useTransition();
  const [completed, setCompleted] = useState(false);
  const lastZoneTown = useRef("");

  const items = useMemo(() => lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })), [lines]);
  const itemsKey = JSON.stringify(items);
  const zone = delivery?.ok ? delivery.zone : undefined;
  const totals = computeTotals(
    lines.map((l) => ({ unitPriceCents: l.product.priceCents, quantity: l.quantity })),
    zone,
  );

  // Recuperar les dades desades d'altres comandes (si el client ho va permetre)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY) ?? "null");
      if (saved?.customer) setCustomer((c) => ({ ...c, ...saved.customer }));
      if (saved?.address) setAddress((a) => ({ ...a, ...saved.address }));
      if (typeof saved?.postalCode === "string") setPostalCode(saved.postalCode);
    } catch {
      /* sense dades desades */
    }
  }, []);

  // Cada cop que canvia el codi postal (5 xifres) o la cistella, demanem zona i dies
  useEffect(() => {
    if (!/^\d{5}$/.test(postalCode) || items.length === 0) {
      setDelivery(postalCode.length === 5 ? { ok: false, reason: "invalid" } : null);
      return;
    }
    let cancelled = false;
    setLoadingOptions(true);
    fetchDeliveryOptions(postalCode, items)
      .then((res) => {
        if (cancelled) return;
        setDelivery(res);
        if (res.ok) {
          // Mantenim la tria si encara és vàlida; si no, proposem el primer dia lliure
          setDeliveryDate((current) =>
            res.options.some((o) => o.date === current && o.available)
              ? current
              : (res.options.find((o) => o.available)?.date ?? ""),
          );
          setTimeSlot((current) => (res.zone.timeSlots.includes(current) ? current : res.zone.timeSlots[0]));
          // Omplim la població si està buida o era la de la zona anterior
          setAddress((a) => (a.town === "" || a.town === lastZoneTown.current ? { ...a, town: res.zone.town } : a));
          lastZoneTown.current = res.zone.town;
          // Els camps que acabem d'omplir automàticament ja no tenen error
          setErrors((e) => ({ ...e, postalCode: "", deliveryDate: "", timeSlot: "", "address.town": "" }));
        }
      })
      .catch(() => !cancelled && setFormMessage(t.checkout.genericError))
      .finally(() => !cancelled && setLoadingOptions(false));
    return () => {
      cancelled = true;
    };
    // itemsKey resumeix `items` (evita repetir la crida per una nova referència d'array)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode, itemsKey]);

  const clearError = (key: string) => setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormMessage("");
    const payload = {
      items,
      postalCode,
      deliveryDate,
      timeSlot,
      customer,
      address,
      acceptTerms,
      payment: { cardNumber: card.number },
    };

    // Validació immediata al navegador (el servidor ho tornarà a fer)
    const parsed = checkoutSchema.safeParse(payload);
    const clientErrors = parsed.success ? {} : fieldErrors(parsed.error);
    if (!zone) clientErrors.postalCode ??= t.checkout.zoneFirst;
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setFormMessage(t.checkout.fixErrors);
      focusFirstError(clientErrors);
      return;
    }

    startSubmit(async () => {
      const res = await submitOrder(payload);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormMessage(res.message);
        if (res.fieldErrors) focusFirstError(res.fieldErrors);
        // L'estoc o els dies poden haver canviat: refresquem les opcions
        if (res.fieldErrors?.deliveryDate || res.message.includes("unitats")) {
          fetchDeliveryOptions(postalCode, items).then(setDelivery);
        }
        return;
      }
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, JSON.stringify({ customer, address, postalCode }));
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* no passa res si no es pot desar */
      }
      setCompleted(true);
      router.replace(`/comanda/${res.number}?t=${encodeURIComponent(res.token)}`);
      clear();
    });
  }

  function focusFirstError(errs: Record<string, string>) {
    const first = Object.keys(errs).find((k) => errs[k]);
    if (!first) return;
    const el = document.getElementById(fieldId(first)) ?? document.getElementById(`${fieldId(first)}-group`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
  }

  // ───────── Estats especials ─────────
  if (!ready) return <p className="py-12 text-center text-ink-soft">…</p>;
  if (lines.length === 0 && !completed) {
    return (
      <div className="animate-fade-up py-12 text-center">
        <SectionTitle as="h1">{t.checkout.emptyTitle}</SectionTitle>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">
          {t.cart.goToCatalog}
        </Link>
      </div>
    );
  }

  const step1Done = Boolean(zone);
  const step2Done = Boolean(deliveryDate && timeSlot);
  const busy = submitting || completed;

  return (
    <form onSubmit={handleSubmit} noValidate className="relative">
      <Link href="/cistella" className="group mb-4 inline-flex items-center gap-1 text-sm text-ink-soft transition hover:text-ink">
        <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span> {t.checkout.back}
      </Link>
      <SectionTitle as="h1">{t.checkout.title}</SectionTitle>

      <div className="mt-8 lg:grid lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-8">
        <div className="space-y-10">
          {/* ───── 1. Zona ───── */}
          <section aria-labelledby="step-zone" className="animate-fade-up">
            <StepHeader n={1} title={t.checkout.steps.zone} done={step1Done} />
            <Field label={t.checkout.postalCode} htmlFor="postalCode" error={errors.postalCode}>
              <div className="relative max-w-48">
                <Input
                  id="postalCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  placeholder={t.checkout.postalCodePlaceholder}
                  value={postalCode}
                  invalid={Boolean(errors.postalCode)}
                  onChange={(e) => {
                    setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5));
                    clearError("postalCode");
                  }}
                  className="pr-10 text-lg tracking-widest"
                />
                {loadingOptions && <Spinner className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />}
              </div>
            </Field>
            <div aria-live="polite" className="mt-3">
              {delivery?.ok && (
                <p className="animate-fade-up flex items-center gap-2 rounded-xl bg-basil/10 px-3 py-2.5 text-sm font-medium text-basil">
                  <span aria-hidden="true">✓</span> {t.checkout.zoneOk(delivery.zone.name)}
                </p>
              )}
              {delivery && !delivery.ok && delivery.reason === "out_of_area" && (
                <div className="animate-fade-up rounded-xl border border-line bg-card px-3 py-2.5 text-sm">
                  <p className="font-semibold">{t.checkout.zoneOut}</p>
                  <p className="mt-1 text-ink-soft">{t.checkout.zoneOutHelp}</p>
                </div>
              )}
            </div>
          </section>

          {/* ───── 2. Dia i franja ───── */}
          <section aria-labelledby="step-date" id="deliveryDate-group" className={step1Done ? "" : "pointer-events-none opacity-40"}>
            <StepHeader n={2} title={t.checkout.steps.date} done={step1Done && step2Done} />
            {zone && <p className="-mt-2 mb-4 text-sm text-ink-soft">{t.checkout.preorderInfo(zone.leadDays, zone.cutoffTime)}</p>}

            {delivery?.ok && delivery.options.length === 0 && <p className="text-sm">{t.checkout.noDates}</p>}

            {delivery?.ok && delivery.options.length > 0 && (
              <div role="radiogroup" aria-label={t.checkout.steps.date} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {delivery.options.map((o, i) => {
                  const p = formatDateParts(o.date);
                  const selected = o.date === deliveryDate;
                  return (
                    <button
                      key={o.date}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={!o.available}
                      title={o.available ? formatLongDate(o.date) : t.checkout.soldOutDetail(o.soldOut.join(", "))}
                      onClick={() => {
                        setDeliveryDate(o.date);
                        clearError("deliveryDate");
                      }}
                      style={{ animationDelay: `${i * 40}ms` }}
                      className={`animate-fade-up flex flex-col items-center rounded-2xl border-2 px-2 py-2.5 transition duration-200 ${
                        selected
                          ? "border-ink bg-ink text-paper shadow-lg shadow-ink/20"
                          : "border-line bg-card hover:-translate-y-0.5 hover:border-ink/50"
                      } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0`}
                    >
                      <span className="text-xs uppercase tracking-wide opacity-75">{p.weekday}</span>
                      <span className="font-display text-3xl leading-none">{p.day}</span>
                      <span className="text-xs">{o.available ? p.month : t.checkout.soldOut}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.deliveryDate && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{errors.deliveryDate}</p>}

            {zone && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold">{t.checkout.slot}</p>
                <div role="radiogroup" aria-label={t.checkout.slot} className="flex flex-wrap gap-2">
                  {zone.timeSlots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={s === timeSlot}
                      onClick={() => {
                        setTimeSlot(s);
                        clearError("timeSlot");
                      }}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-semibold tabular-nums transition ${
                        s === timeSlot ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-ink/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {deliveryDate && (
                  <p className="animate-fade-up mt-3 text-sm text-ink-soft" key={deliveryDate + timeSlot}>
                    📦 <span className="font-medium text-ink first-letter:uppercase">{formatLongDate(deliveryDate)}</span>, {timeSlot}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* ───── 3. Dades i adreça ───── */}
          <section aria-labelledby="step-contact">
            <StepHeader n={3} title={t.checkout.steps.contact} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.checkout.name} htmlFor="customer-name" error={errors["customer.name"]} className="sm:col-span-2">
                <Input
                  id="customer-name"
                  autoComplete="name"
                  value={customer.name}
                  invalid={Boolean(errors["customer.name"])}
                  onChange={(e) => {
                    setCustomer({ ...customer, name: e.target.value });
                    clearError("customer.name");
                  }}
                />
              </Field>
              <Field label={t.checkout.phone} htmlFor="customer-phone" error={errors["customer.phone"]} help={t.checkout.phoneHelp}>
                <Input
                  id="customer-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={customer.phone}
                  invalid={Boolean(errors["customer.phone"])}
                  onChange={(e) => {
                    setCustomer({ ...customer, phone: e.target.value });
                    clearError("customer.phone");
                  }}
                />
              </Field>
              <Field label={t.checkout.email} htmlFor="customer-email" error={errors["customer.email"]} help={t.checkout.emailHelp}>
                <Input
                  id="customer-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={customer.email}
                  invalid={Boolean(errors["customer.email"])}
                  onChange={(e) => {
                    setCustomer({ ...customer, email: e.target.value });
                    clearError("customer.email");
                  }}
                />
              </Field>
              <Field label={t.checkout.address} htmlFor="address-line" error={errors["address.line"]} className="sm:col-span-2">
                <Input
                  id="address-line"
                  autoComplete="address-line1"
                  placeholder={t.checkout.addressPlaceholder}
                  value={address.line}
                  invalid={Boolean(errors["address.line"])}
                  onChange={(e) => {
                    setAddress({ ...address, line: e.target.value });
                    clearError("address.line");
                  }}
                />
              </Field>
              <Field label={t.checkout.addressExtra} htmlFor="address-extra">
                <Input
                  id="address-extra"
                  autoComplete="address-line2"
                  value={address.extra}
                  onChange={(e) => setAddress({ ...address, extra: e.target.value })}
                />
              </Field>
              <Field label={t.checkout.town} htmlFor="address-town" error={errors["address.town"]}>
                <Input
                  id="address-town"
                  autoComplete="address-level2"
                  value={address.town}
                  invalid={Boolean(errors["address.town"])}
                  onChange={(e) => {
                    setAddress({ ...address, town: e.target.value });
                    clearError("address.town");
                  }}
                />
              </Field>
              <Field label={t.checkout.notes} htmlFor="address-notes" className="sm:col-span-2">
                <Textarea
                  id="address-notes"
                  rows={2}
                  maxLength={300}
                  placeholder={t.checkout.notesPlaceholder}
                  value={address.notes}
                  onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                />
              </Field>
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-ink" />
              {t.checkout.remember}
            </label>
          </section>

          {/* ───── 4. Pagament ───── */}
          <section aria-labelledby="step-payment">
            <StepHeader n={4} title={t.checkout.steps.payment} />
            <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
              <p className="mb-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                🧪 {t.checkout.testCards}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t.checkout.cardNumber} htmlFor="payment-cardNumber" error={errors["payment.cardNumber"]} className="col-span-2">
                  <Input
                    id="payment-cardNumber"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.number}
                    invalid={Boolean(errors["payment.cardNumber"])}
                    onChange={(e) => {
                      setCard({ ...card, number: formatCard(e.target.value) });
                      clearError("payment.cardNumber");
                    }}
                    className="font-mono tracking-wider"
                  />
                </Field>
                <Field label={t.checkout.cardExpiry} htmlFor="payment-expiry">
                  <Input
                    id="payment-expiry"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    className="font-mono"
                  />
                </Field>
                <Field label={t.checkout.cardCvc} htmlFor="payment-cvc">
                  <Input
                    id="payment-cvc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    className="font-mono"
                  />
                </Field>
              </div>
            </div>

            <div id="acceptTerms-group" className="mt-4">
              <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    clearError("acceptTerms");
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                />
                <span>
                  {t.checkout.acceptTerms}{" "}
                  <Link href="/legal/condicions" target="_blank" className="font-semibold underline underline-offset-2">
                    {t.checkout.termsLink}
                  </Link>{" "}
                  {t.checkout.andThe}{" "}
                  <Link href="/legal/privacitat" target="_blank" className="font-semibold underline underline-offset-2">
                    {t.checkout.privacyLink}
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptTerms && <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">{errors.acceptTerms}</p>}
            </div>
          </section>
        </div>

        {/* ───── Resum (a la dreta a l'ordinador, a sota al mòbil) ───── */}
        <aside className="mt-10 lg:sticky lg:top-20 lg:mt-0">
          <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-2xl">{t.checkout.summary}</h2>
              <Link href="/cistella" className="text-xs text-ink-soft underline underline-offset-2 hover:text-ink">
                {t.checkout.edit}
              </Link>
            </div>
            <ul className="space-y-2.5">
              {lines.map((l) => (
                <li key={l.product.id} className="flex items-center gap-3 text-sm">
                  <span className="relative">
                    <PizzaImage product={l.product} className="h-11 w-11 rounded-lg" showLabel={false} sizes="44px" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-paper">
                      {l.quantity}
                    </span>
                  </span>
                  <span className="flex-1 leading-tight">{l.product.name}</span>
                  <span className="tabular-nums">{formatPrice(l.lineTotalCents)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt>{t.cart.subtotal}</dt>
                <dd className="tabular-nums">{formatPrice(totals.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{t.cart.shipping}</dt>
                <dd className="tabular-nums">
                  {!zone ? (
                    <span className="text-ink-soft">{t.checkout.shippingPending}</span>
                  ) : totals.deliveryFeeCents === 0 ? (
                    <span className="font-semibold text-basil">{t.checkout.freeShipping}</span>
                  ) : (
                    formatPrice(totals.deliveryFeeCents)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
                <dt>{t.checkout.total}</dt>
                <dd className="tabular-nums">{formatPrice(totals.totalCents)}</dd>
              </div>
            </dl>
            {zone && totals.missingForFreeShippingCents !== null && totals.missingForMinimumCents === 0 && (
              <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-xs">
                🛵 {t.checkout.freeShippingHint(formatPrice(totals.missingForFreeShippingCents))}
              </p>
            )}
            {zone && totals.missingForMinimumCents > 0 && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                {t.checkout.minimumHint(formatPrice(zone.minOrderCents))}
              </p>
            )}

            {formMessage && (
              <p role="alert" className="animate-fade-up mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                {formMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || (zone !== undefined && totals.missingForMinimumCents > 0)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-brand-dark hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {busy ? (
                <>
                  <Spinner /> {t.checkout.processing}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  {t.checkout.pay(formatPrice(totals.totalCents))}
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-ink-soft">{t.checkout.secure}</p>
          </div>
        </aside>
      </div>

      {/* Capa mentre es processa el pagament: evita dobles clics i dona feedback clar */}
      {busy && (
        <div className="animate-fade-up fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-paper/85 backdrop-blur-sm" role="status">
          <Spinner className="h-10 w-10" />
          <p className="font-display text-3xl">{t.checkout.processing}</p>
        </div>
      )}
    </form>
  );
}
