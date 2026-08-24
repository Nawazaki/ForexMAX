export function shouldTrackAnalyticsUrl(url: string) {
  const pathname = new URL(url, "https://forexmax.com").pathname;
  return !pathname.startsWith("/admin") && !pathname.startsWith("/api/");
}
