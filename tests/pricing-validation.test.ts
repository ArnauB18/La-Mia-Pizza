import { describe, expect, it } from "vitest";
import { computeTotals } from "@/lib/pricing";
import { checkoutSchema, normalizePhone } from "@/lib/validation";

const zone = { deliveryFeeCents: 350, freeShippingFromCents: 3000, minOrderCents: 1500 };

describe("computeTotals", () => {
  it("cobra l'enviament per sota del llindar", () => {
    const t = computeTotals([{ unitPriceCents: 800, quantity: 2 }], zone);
    expect(t).toMatchObject({ subtotalCents: 1600, deliveryFeeCents: 350, totalCents: 1950, missingForMinimumCents: 0, missingForFreeShippingCents: 1400 });
  });
  it("enviament gratuït a partir del llindar", () => {
    expect(computeTotals([{ unitPriceCents: 1000, quantity: 3 }], zone).deliveryFeeCents).toBe(0);
  });
  it("detecta la comanda mínima", () => {
    expect(computeTotals([{ unitPriceCents: 800, quantity: 1 }], zone).missingForMinimumCents).toBe(700);
  });
});

describe("validació", () => {
  const valid = {
    items: [{ productId: "p-turo", quantity: 2 }],
    postalCode: "08480",
    deliveryDate: "2026-11-10",
    timeSlot: "17:00–19:00",
    customer: { name: "Maria Puig", phone: "+34 612 34 56 78", email: " Maria@Example.com " },
    address: { line: "Carrer Major, 1", town: "L'Ametlla del Vallès" },
    acceptTerms: true,
    payment: { cardNumber: "4242 4242 4242 4242" },
  };

  it("normalitza telèfon i correu", () => {
    const r = checkoutSchema.parse(valid);
    expect(r.customer.phone).toBe("612345678");
    expect(r.customer.email).toBe("maria@example.com");
    expect(normalizePhone("0034 912-345-678")).toBe("912345678");
  });

  it("rebutja dades incorrectes", () => {
    const r = checkoutSchema.safeParse({ ...valid, postalCode: "84", acceptTerms: false, customer: { ...valid.customer, phone: "123" } });
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["postalCode", "acceptTerms", "customer.phone"]));
  });
});
