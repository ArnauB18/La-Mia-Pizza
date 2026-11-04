/**
 * Dates d'entrega.
 *
 * Totes les regles de negoci (hora límit, dies d'entrega) van en hora de Catalunya,
 * però el servidor de Vercel funciona en UTC. Per evitar errors de fus horari:
 *  - "ara" es converteix a data i minuts de Europe/Madrid amb Intl
 *  - les dates d'entrega es tracten com a text "YYYY-MM-DD" (sense hora ni fus)
 */
import type { DeliveryZone } from "@/config/delivery";
import { MAX_DELIVERY_OPTIONS } from "@/config/delivery";

export const TIME_ZONE = "Europe/Madrid";

/** Data (YYYY-MM-DD) i minuts del dia a Catalunya per a un instant donat. */
export function madridNow(now: Date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** Suma dies a una data "YYYY-MM-DD" (aritmètica en UTC: no hi ha canvis d'hora). */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Dia de la setmana (0 = diumenge) d'una data "YYYY-MM-DD". */
export function weekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * És possible demanar per a aquesta data d'entrega ara mateix?
 * Regla: abans de `cutoffTime` del dia (entrega − leadDays).
 */
export function canOrderFor(zone: DeliveryZone, deliveryDate: string, now: Date = new Date()): boolean {
  if (!isIsoDate(deliveryDate) || !zone.deliveryWeekdays.includes(weekday(deliveryDate))) return false;
  const deadlineDate = addDays(deliveryDate, -zone.leadDays);
  const { date: today, minutes } = madridNow(now);
  if (today < deadlineDate) return true;
  if (today > deadlineDate) return false;
  return minutes < timeToMinutes(zone.cutoffTime);
}

/** Properes dates d'entrega possibles per a una zona (sense mirar l'estoc). */
export function upcomingDeliveryDates(zone: DeliveryZone, now: Date = new Date(), max = MAX_DELIVERY_OPTIONS): string[] {
  const { date: today } = madridNow(now);
  const result: string[] = [];
  // Mirem fins a 6 setmanes endavant: de sobres per trobar `max` dates
  for (let i = 0; i < 42 && result.length < max; i++) {
    const d = addDays(today, i);
    if (canOrderFor(zone, d, now)) result.push(d);
  }
  return result;
}

/** Data límit per demanar (per mostrar-la: "Demana abans de dg. 8 de nov. a les 20:00"). */
export function orderDeadline(zone: DeliveryZone, deliveryDate: string): { date: string; time: string } {
  return { date: addDays(deliveryDate, -zone.leadDays), time: zone.cutoffTime };
}

/** "dimarts, 10 de novembre" */
export function formatLongDate(date: string, locale = "ca-ES"): string {
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

/** { weekday: "dt.", day: "10", month: "nov." } per a les targetes de dia */
export function formatDateParts(date: string, locale = "ca-ES") {
  const d = new Date(`${date}T00:00:00Z`);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...o, timeZone: "UTC" }).format(d);
  return { weekday: f({ weekday: "short" }), day: f({ day: "numeric" }), month: f({ month: "short" }) };
}
