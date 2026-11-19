import { describe, expect, it } from "vitest";
import { findZoneByPostalCode } from "@/config/delivery";

describe("zones d'entrega (tota Catalunya)", () => {
  it("accepta qualsevol codi postal català", () => {
    expect(findZoneByPostalCode("08480")?.id).toBe("barcelona");
    expect(findZoneByPostalCode("08001")?.id).toBe("barcelona");
    expect(findZoneByPostalCode("17001")?.id).toBe("girona");
    expect(findZoneByPostalCode("25001")?.id).toBe("lleida");
    expect(findZoneByPostalCode("43001")?.id).toBe("tarragona");
  });
  it("rebutja codis de fora de Catalunya o mal escrits", () => {
    expect(findZoneByPostalCode("28001")).toBeUndefined();
    expect(findZoneByPostalCode("46001")).toBeUndefined();
    expect(findZoneByPostalCode("0848")).toBeUndefined();
  });
});
