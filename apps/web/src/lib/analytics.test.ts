import { describe, expect, it } from "vitest";
import { shouldTrackAnalyticsUrl } from "@/lib/analytics";

describe("analytics privacy policy", () => {
  it("keeps public content and UTM campaign URLs measurable", () => {
    expect(shouldTrackAnalyticsUrl("https://forexmax.com/articles?utm_source=instagram&utm_campaign=research-launch")).toBe(true);
    expect(shouldTrackAnalyticsUrl("/tools?utm_source=youtube&utm_medium=video")).toBe(true);
  });

  it("excludes administrative and API traffic", () => {
    expect(shouldTrackAnalyticsUrl("https://forexmax.com/admin/articles/new")).toBe(false);
    expect(shouldTrackAnalyticsUrl("/api/search?q=forex")).toBe(false);
  });
});
