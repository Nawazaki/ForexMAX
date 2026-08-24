"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { shouldTrackAnalyticsUrl } from "@/lib/analytics";

export function SiteAnalytics() {
  return <Analytics beforeSend={(event: BeforeSendEvent) => shouldTrackAnalyticsUrl(event.url) ? event : null} />;
}
