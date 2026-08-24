const canonicalOrigin = "https://www.forexmax.com";

/**
 * ForexMax serves the apex domain as a redirect to www. Keep public discovery
 * URLs on the destination host so crawlers do not receive a canonical chain.
 */
export function getCanonicalSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return canonicalOrigin;

  try {
    const url = new URL(configured);
    if (url.hostname === "forexmax.com") url.hostname = "www.forexmax.com";
    return url.origin;
  } catch {
    return canonicalOrigin;
  }
}
