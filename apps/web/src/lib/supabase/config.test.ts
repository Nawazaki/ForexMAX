import { describe, expect, it } from "vitest";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

describe("Supabase public configuration", () => {
  it("requires both the project URL and publishable key", () => {
    expect(hasSupabasePublicConfig({})).toBe(false);
    expect(hasSupabasePublicConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" })).toBe(false);
    expect(hasSupabasePublicConfig({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example" })).toBe(false);
    expect(hasSupabasePublicConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example" })).toBe(true);
  });
});
