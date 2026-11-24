import { describe, expect, it } from "vitest";
import { findZoneByPostalCode } from "@/lib/catalog";

describe("zones d'entrega (tota Catalunya)", () => {
  it("accepta qualsevol codi postal català", async () => {
    expect((await findZoneByPostalCode("08480"))?.id).toBe("barcelona");
    expect((await findZoneByPostalCode("08001"))?.id).toBe("barcelona");
    expect((await findZoneByPostalCode("17001"))?.id).toBe("girona");
    expect((await findZoneByPostalCode("25001"))?.id).toBe("lleida");
    expect((await findZoneByPostalCode("43001"))?.id).toBe("tarragona");
  });
  it("rebutja codis de fora de Catalunya o mal escrits", async () => {
    expect((await findZoneByPostalCode("28001"))).toBeUndefined();
    expect((await findZoneByPostalCode("46001"))).toBeUndefined();
    expect((await findZoneByPostalCode("0848"))).toBeUndefined();
  });
});
