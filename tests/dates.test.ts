import { describe, expect, it } from "vitest";
import { addDays, canOrderFor, madridNow, upcomingDeliveryDates, weekday } from "@/lib/dates";
import type { DeliveryZone } from "@/config/delivery";

const zone: DeliveryZone = {
  id: "z", name: "Z", town: "Z", postalCodes: ["08480"], active: true,
  deliveryFeeCents: 350, freeShippingFromCents: 3000, minOrderCents: 1500,
  deliveryWeekdays: [2, 5], cutoffTime: "20:00", leadDays: 2, timeSlots: ["17:00–19:00"],
};

describe("dates", () => {
  it("converteix a hora de Catalunya (UTC+1 a l'hivern)", () => {
    // 23:30 UTC del 3/11 = 00:30 del 4/11 a Barcelona
    expect(madridNow(new Date("2026-11-03T23:30:00Z"))).toEqual({ date: "2026-11-04", minutes: 30 });
  });

  it("suma dies i calcula el dia de la setmana", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(weekday("2026-11-10")).toBe(2); // dimarts
  });

  it("aplica l'hora límit del dia D − leadDays", () => {
    // Entrega dimarts 10/11 → límit diumenge 8/11 a les 20:00 (19:00 UTC)
    expect(canOrderFor(zone, "2026-11-10", new Date("2026-11-08T18:59:00Z"))).toBe(true);
    expect(canOrderFor(zone, "2026-11-10", new Date("2026-11-08T19:00:00Z"))).toBe(false);
    expect(canOrderFor(zone, "2026-11-11", new Date("2026-11-01T10:00:00Z"))).toBe(false); // dimecres: no es reparteix
  });

  it("proposa només dies de repartiment futurs", () => {
    const dates = upcomingDeliveryDates(zone, new Date("2026-11-04T10:00:00Z"), 3);
    expect(dates).toEqual(["2026-11-06", "2026-11-10", "2026-11-13"]);
  });
});
