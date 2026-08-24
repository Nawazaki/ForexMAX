export type SupabasePublicEnvironment = Record<string, string | undefined>;
export type SupabasePublicConfig = { url: string; key: string };

export function getSupabasePublicConfig(environment: SupabasePublicEnvironment = process.env): SupabasePublicConfig | null {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL;
  const key = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export function hasSupabasePublicConfig(environment: SupabasePublicEnvironment = process.env): boolean {
  return getSupabasePublicConfig(environment) !== null;
}
