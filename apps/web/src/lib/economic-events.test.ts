import { describe, expect, it } from "vitest";
import { presentEconomicEventFields, type EconomicEvent } from "@/lib/economic-events";

describe("economic-event display contract", () => {
  it("shows only fields actually present in the source record", () => {
    const event: EconomicEvent = { id: "cpi", event: "CPI", country: "United States", institution: "BLS", sourceUrl: "https://www.bls.gov/cpi/", referencePeriod: "July 2026", actual: "333.918", sourceState: "RETRIEVED" };
    expect(presentEconomicEventFields(event)).toEqual([{ label: "Reference period", value: "July 2026" }, { label: "Actual", value: "333.918" }]);
  });
});
