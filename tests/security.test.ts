/**
 * Proves de seguretat: injecció SQL i protecció contra provar contrasenyes.
 * Es fan contra un Postgres real (PGlite en memòria).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { getDeliveryOptions, getOrderForCustomer, listOrders, placeOrder } from "@/lib/orders";
import { readImage } from "@/lib/images";
import { checkLoginAllowed, LOGIN_POLICY, recordLoginFailure, recordLoginSuccess } from "@/lib/login-guard";

const PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE orders; --",
  "\" OR 1=1 --",
  "%' OR 1=1 --",
  "1; DELETE FROM products",
  "') UNION SELECT access_token FROM orders --",
  "\\'; truncate orders; --",
];

async function count(table: string): Promise<number> {
  const db = await getDb();
  const r = (await db.execute(sql.raw(`select count(*)::int as n from ${table}`))) as unknown as { rows?: { n: number }[] } & { n: number }[];
  return Number((r.rows ?? r)[0].n);
}

describe("injecció SQL", () => {
  let realNumber = "";
  beforeAll(async () => {
    const res = await placeOrder({
      items: [{ productId: "p-turo", quantity: 2 }],
      postalCode: "08480",
      deliveryDate: (await getDeliveryOptions("08480")).ok
        ? ((await getDeliveryOptions("08480")) as { options: { date: string }[] }).options[0].date
        : "",
      // Les dades malicioses s'han de desar com a text normal
      customer: { name: "Robert'); DROP TABLE orders;--", phone: "612345678", email: "x@example.com" },
      address: { line: "Carrer ' OR 1=1 --, 1", town: "Ametlla" },
      acceptTerms: true,
      payment: { cardNumber: "4242424242424242" },
    });
    expect(res.ok).toBe(true);
    if (res.ok) realNumber = res.number;
  });

  it("desa el text maliciós tal qual, sense executar-lo", async () => {
    const [o] = await listOrders({ search: realNumber });
    expect(o.customerName).toBe("Robert'); DROP TABLE orders;--");
    expect(o.addressLine).toBe("Carrer ' OR 1=1 --, 1");
    expect(await count("orders")).toBe(1);
  });

  it("el cercador de l'admin tracta els atacs com a text", async () => {
    for (const p of PAYLOADS) expect(await listOrders({ search: p })).toHaveLength(0);
    expect(await count("orders")).toBe(1);
    expect(await count("products")).toBeGreaterThan(0);
  });

  it("la pàgina de confirmació no es pot obrir sense el token correcte", async () => {
    for (const p of PAYLOADS) {
      expect(await getOrderForCustomer(p, p)).toBeNull();
      expect(await getOrderForCustomer(realNumber, p)).toBeNull();
    }
  });

  it("el codi postal i les imatges rebutgen entrades estranyes", async () => {
    for (const p of PAYLOADS) {
      expect((await getDeliveryOptions(p)).ok).toBe(false);
      expect(await readImage(p)).toBeNull();
    }
  });

  it("les comandes amb dades malicioses es rebutgen per validació", async () => {
    for (const p of PAYLOADS) {
      const r = await placeOrder({ items: [{ productId: p, quantity: 1 }], postalCode: p, deliveryDate: p });
      expect(r.ok).toBe(false);
    }
    expect(await count("orders")).toBe(1);
  });
});

describe("protecció contra provar contrasenyes", () => {
  it(`bloqueja una IP després de ${LOGIN_POLICY.perIp.maxFailures} errors i no afecta les altres`, async () => {
    const ip = "203.0.113.7";
    for (let i = 0; i < LOGIN_POLICY.perIp.maxFailures - 1; i++) {
      await recordLoginFailure(ip);
      expect((await checkLoginAllowed(ip)).allowed).toBe(true);
    }
    await recordLoginFailure(ip);
    const status = await checkLoginAllowed(ip);
    expect(status.allowed).toBe(false);
    if (!status.allowed) expect(status.retryAfterMinutes).toBeGreaterThanOrEqual(14);
    expect((await checkLoginAllowed("198.51.100.1")).allowed).toBe(true);
  });

  it("una entrada correcta reinicia el comptador de la IP", async () => {
    const ip = "203.0.113.8";
    for (let i = 0; i < LOGIN_POLICY.perIp.maxFailures - 1; i++) await recordLoginFailure(ip);
    await recordLoginSuccess(ip);
    await recordLoginFailure(ip);
    expect((await checkLoginAllowed(ip)).allowed).toBe(true);
  });

  it("bloqueja tothom si hi ha massa errors des de moltes IP (atac repartit)", async () => {
    for (let i = 0; i < LOGIN_POLICY.global.maxFailures; i++) await recordLoginFailure(`192.0.2.${i}`);
    expect((await checkLoginAllowed("192.0.2.250")).allowed).toBe(false);
  });
});
