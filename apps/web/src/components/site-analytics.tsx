"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

export function SiteAnalytics() {
  return <Analytics beforeSend={(event: BeforeSendEvent) => event.url.includes("/admin") || event.url.includes("/api/") ? null : event} />;
}
