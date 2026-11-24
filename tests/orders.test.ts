/**
 * Prova d'integració: procés de comanda complet contra Postgres real (PGlite en memòria).
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { getDeliveryOptions, getOrderForCustomer, listOrders, placeOrder } from "@/lib/orders";

// Dijous 5/11/2026 al matí: el primer dia possible és dimarts 10/11
const NOW = new Date("2026-11-05T09:00:00Z");

const base = {
  postalCode: "08480",
  deliveryDate: "2026-11-10",
  customer: { name: "Maria Puig", phone: "612345678", email: "maria@example.com" },
  address: { line: "Carrer Major, 1", town: "L'Ametlla del Vallès" },
  acceptTerms: true,
  payment: { cardNumber: "4242424242424242" },
};

beforeAll(() => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
});

describe("comandes", () => {
  it("ofereix dies d'entrega per a un codi postal de la zona", async () => {
    const res = await getDeliveryOptions("08480");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.options[0]).toEqual({ date: "2026-11-10" });
    expect((await getDeliveryOptions("28001")).ok).toBe(false);
  });

  it("crea la comanda amb preus del servidor i la recupera amb el token", async () => {
    const res = await placeOrder({ ...base, items: [{ productId: "p-turo", quantity: 2 }] });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.number).toMatch(/^LMP-[2-9A-Z]{5}$/);
    const order = await getOrderForCustomer(res.number, res.token);
    expect(order).toMatchObject({ status: "paid", subtotalCents: 1800, deliveryFeeCents: 350, totalCents: 2150 });
    expect(order!.items).toHaveLength(1);
    expect(await getOrderForCustomer(res.number, "token-incorrecte")).toBeNull();
  });

  it("producció a demanda: no hi ha límit d'unitats per dia", async () => {
    const res = await placeOrder({ ...base, items: [{ productId: "p-turo", quantity: 20 }] });
    expect(res.ok).toBe(true);
  });

  it("si el pagament falla, la comanda queda cancel·lada", async () => {
    const items = [{ productId: "p-turo", quantity: 1 }, { productId: "p-pernil", quantity: 1 }];
    const declined = await placeOrder({ ...base, items, payment: { cardNumber: "4000000000000002" } });
    expect(declined.ok).toBe(false);
    const cancelled = await listOrders({ date: "2026-11-10", status: "cancelled" });
    expect(cancelled).toHaveLength(1);
    const ok = await placeOrder({ ...base, items });
    expect(ok.ok).toBe(true);
  });

  it("rebutja dies no disponibles, zones de fora i comandes per sota del mínim", async () => {
    expect((await placeOrder({ ...base, deliveryDate: "2026-11-06", items: [{ productId: "p-pernil", quantity: 2 }] })).ok).toBe(false);
    expect((await placeOrder({ ...base, postalCode: "28001", items: [{ productId: "p-pernil", quantity: 2 }] })).ok).toBe(false);
    expect((await placeOrder({ ...base, items: [{ productId: "p-pernil", quantity: 1 }] })).ok).toBe(false);
  });

  it("troba comandes pel número, el nom, el telèfon o el correu", async () => {
    const [first] = await listOrders({ date: "2026-11-10", status: "active" });
    expect((await listOrders({ search: first.number.toLowerCase() })).map((o) => o.id)).toContain(first.id);
    expect((await listOrders({ search: "puig" })).length).toBeGreaterThan(0);
    expect((await listOrders({ search: "612 34" })).length).toBeGreaterThan(0);
    expect((await listOrders({ search: "maria@example" })).length).toBeGreaterThan(0);
    expect((await listOrders({ search: "ametlla" })).length).toBeGreaterThan(0);
    expect(await listOrders({ search: "ningú%" })).toHaveLength(0);
  });

  it("llista les comandes actives del dia per a l'admin", async () => {
    const list = await listOrders({ date: "2026-11-10", status: "active" });
    expect(list).toHaveLength(3); // la cancel·lada no hi surt
  });
});
