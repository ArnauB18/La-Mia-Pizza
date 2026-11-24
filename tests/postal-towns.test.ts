import { describe, expect, it } from "vitest";
import { getDeliveryOptions } from "@/lib/orders";
import { POSTAL_CODE_TOWNS } from "@/data/postal-codes-cat";

describe("població a partir del codi postal", () => {
  it("coneix els pobles de les pizzeries i les capitals", () => {
    expect(POSTAL_CODE_TOWNS["08480"]).toEqual(["L'Ametlla del Vallès"]);
    expect(POSTAL_CODE_TOWNS["08187"]).toEqual(["Santa Eulàlia de Ronçana"]);
    expect(POSTAL_CODE_TOWNS["17003"]).toEqual(["Girona"]);
    expect(POSTAL_CODE_TOWNS["25001"]).toEqual(["Lleida"]);
    expect(POSTAL_CODE_TOWNS["43001"]).toEqual(["Tarragona"]);
  });

  it("només conté codis de Catalunya", () => {
    expect(Object.keys(POSTAL_CODE_TOWNS).every((c) => /^(08|17|25|43)\d{3}$/.test(c))).toBe(true);
  });

  it("torna les poblacions amb les opcions d'entrega", async () => {
    const one = await getDeliveryOptions("08530", []);
    expect(one.ok && one.towns).toEqual(["La Garriga"]);
    const several = Object.entries(POSTAL_CODE_TOWNS).find(([, v]) => v.length > 1)!;
    const many = await getDeliveryOptions(several[0], []);
    expect(many.ok && many.towns.length).toBeGreaterThan(1);
    // Codi general sense carrers a l'INE: la zona s'accepta igualment i el client escriu la població
    const unknown = await getDeliveryOptions("08400", []);
    expect(unknown.ok && unknown.towns).toEqual([]);
  });
});
