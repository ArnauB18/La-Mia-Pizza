/**
 * Lògica de comandes (només servidor).
 *
 * Regla d'or: el servidor ho recalcula i ho valida TOT (preus, zona, dia).
 * Del navegador només ens creiem quins productes i quantes unitats vol.
 * No hi ha estoc: es produeix a demanda (l'admin mostra què cal preparar).
 */
import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gte, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Order, OrderItem, OrderStatus } from "@/db/schema";
import type { DeliveryZone } from "@/config/delivery";
import { findZoneByPostalCode, getProductById, getZone, getZones } from "./catalog";
import { canOrderFor, upcomingDeliveryDates } from "./dates";
import { computeTotals } from "./pricing";
import { POSTAL_CODE_TOWNS } from "@/data/postal-codes-cat";
import { checkoutSchema, fieldErrors } from "./validation";
import { chargeOrder, isValidCardNumber, PAYMENT_PROVIDER } from "./payments";

const { orders, orderItems } = schema;

// ───────────────────────── Dies d'entrega ─────────────────────────

export interface DeliveryOption {
  date: string;
}

export type DeliveryOptionsResult =
  | {
      ok: true;
      zone: Pick<
        DeliveryZone,
        "id" | "name" | "deliveryFeeCents" | "freeShippingFromCents" | "minOrderCents" | "cutoffTime" | "leadDays"
      >;
      options: DeliveryOption[];
      /** Poblacions d'aquest codi postal (INE). Buit si no el tenim: el client l'escriu a mà. */
      towns: string[];
    }
  | { ok: false; reason: "invalid" | "out_of_area" };

export async function getDeliveryOptions(postalCode: string): Promise<DeliveryOptionsResult> {
  if (!/^\d{5}$/.test(postalCode.trim())) return { ok: false, reason: "invalid" };
  const zone = await findZoneByPostalCode(postalCode);
  if (!zone) return { ok: false, reason: "out_of_area" };

  const options = upcomingDeliveryDates(zone).map((date) => ({ date }));

  const { id, name, deliveryFeeCents, freeShippingFromCents, minOrderCents, cutoffTime, leadDays } = zone;
  return {
    ok: true,
    zone: { id, name, deliveryFeeCents, freeShippingFromCents, minOrderCents, cutoffTime, leadDays },
    options,
    towns: POSTAL_CODE_TOWNS[postalCode.trim()] ?? [],
  };
}

// ───────────────────────── Crear comanda ─────────────────────────

export type PlaceOrderResult =
  | { ok: true; number: string; token: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** LMP-XXXXX amb lletres i xifres que no es confonen (sense 0/O, 1/I/L). */
function newOrderNumber(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = randomBytes(5);
  return "LMP-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function placeOrder(raw: unknown): Promise<PlaceOrderResult> {
  // 1. Validació de format
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Revisa els camps marcats.", fieldErrors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  // 2. Regles de negoci
  const zone = await findZoneByPostalCode(data.postalCode);
  if (!zone)
    return {
      ok: false,
      message: "De moment no fem entregues a aquest codi postal.",
      fieldErrors: { postalCode: "Fora de la zona d'entrega." },
    };
  if (!canOrderFor(zone, data.deliveryDate)) {
    return {
      ok: false,
      message: "Aquest dia d'entrega ja no està disponible. Tria'n un altre.",
      fieldErrors: { deliveryDate: "Ja no està disponible." },
    };
  }

  // Agrupem línies repetides i preus des del catàleg (mai des del client)
  const merged = new Map<string, number>();
  for (const i of data.items) merged.set(i.productId, (merged.get(i.productId) ?? 0) + i.quantity);
  const lines: { productId: string; productName: string; unitPriceCents: number; quantity: number }[] = [];
  for (const [productId, quantity] of merged) {
    const product = await getProductById(productId);
    if (!product)
      return { ok: false, message: "Algun producte de la cistella ja no està disponible. Revisa la cistella." };
    lines.push({ productId, productName: product.name, unitPriceCents: product.priceCents, quantity });
  }
  const totals = computeTotals(lines, zone);
  if (totals.missingForMinimumCents > 0)
    return { ok: false, message: "La comanda no arriba al mínim per a l'enviament." };

  if (!isValidCardNumber(data.payment.cardNumber)) {
    return {
      ok: false,
      message: "Número de targeta no vàlid.",
      fieldErrors: { "payment.cardNumber": "Número de targeta no vàlid." },
    };
  }

  // 3. Creació de la comanda i les seves línies en una transacció (o tot o res)
  const db = await getDb();
  let created: { id: number; number: string; token: string } | null = null;
  try {
    for (let attempt = 0; attempt < 3 && !created; attempt++) {
      const number = newOrderNumber();
      const token = randomBytes(18).toString("base64url");
      try {
        created = await db.transaction(async (tx) => {
          const [order] = await tx
            .insert(orders)
            .values({
              number,
              accessToken: token,
              status: "pending",
              zoneId: zone.id,
              deliveryDate: data.deliveryDate,
              customerName: data.customer.name,
              phone: data.customer.phone,
              email: data.customer.email,
              addressLine: data.address.line,
              addressExtra: data.address.extra,
              postalCode: data.postalCode,
              town: data.address.town,
              deliveryNotes: data.address.notes,
              subtotalCents: totals.subtotalCents,
              deliveryFeeCents: totals.deliveryFeeCents,
              totalCents: totals.totalCents,
              paymentProvider: PAYMENT_PROVIDER,
            })
            .returning({ id: orders.id });
          await tx.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));
          return { id: order.id, number, token };
        });
      } catch (err) {
        // Col·lisió de número de comanda (molt improbable): ho tornem a provar
        if (String(err).includes("orders_number_idx") && attempt < 2) continue;
        throw err;
      }
    }
  } catch (err) {
    console.error("placeOrder", err);
    return { ok: false, message: "No hem pogut desar la comanda. Torna-ho a provar d'aquí a una estona." };
  }
  if (!created) return { ok: false, message: "No hem pogut desar la comanda." };

  // 4. Cobrament (simulat). Si falla, la comanda queda cancel·lada.
  const payment = await chargeOrder({ amountCents: totals.totalCents, cardNumber: data.payment.cardNumber });
  await db
    .update(orders)
    .set({
      status: payment.ok ? "paid" : "cancelled",
      paymentRef: payment.ok ? payment.ref : null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, created.id));
  if (!payment.ok)
    return { ok: false, message: payment.message, fieldErrors: { "payment.cardNumber": payment.message } };

  return { ok: true, number: created.number, token: created.token };
}

// ───────────────────────── Consultes ─────────────────────────

export type OrderWithItems = Order & { items: OrderItem[] };

async function withItems(rows: Order[]): Promise<OrderWithItems[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((r) => r.id),
      ),
    );
  return rows.map((r) => ({ ...r, items: items.filter((i) => i.orderId === r.id) }));
}

/** Comanda per a la pàgina de confirmació: cal el número I el token secret. */
export async function getOrderForCustomer(number: string, token: string): Promise<OrderWithItems | null> {
  if (!number || !token) return null;
  const db = await getDb();
  const [row] = await db.select().from(orders).where(eq(orders.number, number.toUpperCase())).limit(1);
  if (!row) return null;
  const a = Buffer.from(row.accessToken);
  const b = Buffer.from(token);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return (await withItems([row]))[0];
}

export async function listOrders(filter: {
  date?: string;
  fromDate?: string;
  zoneId?: string;
  status?: OrderStatus | "active";
  /** Cerca lliure: número de comanda, nom, telèfon, correu o població. */
  search?: string;
}): Promise<OrderWithItems[]> {
  const db = await getDb();
  const conditions = [];
  if (filter.date) conditions.push(eq(orders.deliveryDate, filter.date));
  if (filter.fromDate) conditions.push(gte(orders.deliveryDate, filter.fromDate));
  if (filter.zoneId) conditions.push(eq(orders.zoneId, filter.zoneId));
  if (filter.status === "active") conditions.push(and(ne(orders.status, "cancelled"), ne(orders.status, "pending")));
  else if (filter.status) conditions.push(eq(orders.status, filter.status));
  const q = filter.search?.trim();
  if (q) {
    // Escapem % i _ perquè es busquin com a text normal
    const like = `%${q.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
    const digits = q.replace(/\D/g, "");
    conditions.push(
      or(
        ilike(orders.number, like),
        ilike(orders.customerName, like),
        ilike(orders.email, like),
        ilike(orders.town, like),
        ...(digits.length >= 3 ? [ilike(orders.phone, `%${digits}%`)] : []),
      )!,
    );
  }
  const rows = await db
    .select()
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orders.deliveryDate, orders.zoneId, orders.postalCode, desc(orders.createdAt))
    .limit(500);
  return withItems(rows);
}

/** Dates d'entrega amb comandes (per al selector de l'admin). */
export async function listDeliveryDatesWithOrders(): Promise<{ date: string; count: number }[]> {
  const db = await getDb();
  const rows = await db
    .select({ date: orders.deliveryDate, count: sql<number>`cast(count(*) as integer)` })
    .from(orders)
    .where(ne(orders.status, "cancelled"))
    .groupBy(orders.deliveryDate)
    .orderBy(desc(orders.deliveryDate))
    .limit(60);
  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  const db = await getDb();
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
}

/** Nom de la zona (província). Les comandes antigues del prototip poden tenir ids de zones que ja no existeixen. */
export async function zoneNames(): Promise<Record<string, string>> {
  return Object.fromEntries((await getZones()).map((z) => [z.id, z.name]));
}

export async function zoneName(zoneId: string): Promise<string> {
  return (await getZone(zoneId))?.name ?? zoneId;
}
