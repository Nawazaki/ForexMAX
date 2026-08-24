import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) throw new Error("SUPABASE_NOT_CONFIGURED");
  return createBrowserClient(config.url, config.key);
}
