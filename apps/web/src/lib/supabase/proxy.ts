import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!config) {
    if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("config", "missing");
      login.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next({ request });
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items, headers) => { items.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); Object.entries(headers).forEach(([header, value]) => response.headers.set(header, value)); } } });
  const { data } = await supabase.auth.getClaims();
  if (request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login" && !data?.claims.sub) { const login = request.nextUrl.clone(); login.pathname = "/admin/login"; login.searchParams.set("callbackUrl", request.nextUrl.pathname); return NextResponse.redirect(login); }
  return response;
}
