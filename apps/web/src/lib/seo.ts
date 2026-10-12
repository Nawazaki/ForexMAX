import type { Metadata } from "next";
import { getCanonicalSiteUrl } from "@/lib/site-url";

const siteUrl = getCanonicalSiteUrl();

export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const canonical = new URL(input.path, siteUrl).toString();
  const normalizedTitle = normalizePublicTitle(input.title);
  const absoluteTitle = /\bForexMax\b/i.test(normalizedTitle) ? normalizedTitle : `${normalizedTitle} | ForexMax`;
  return {
    title: { absolute: absoluteTitle },
    description: input.description,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: absoluteTitle,
      description: input.description,
      url: canonical,
      images: input.image ? [{ url: input.image }] : undefined,
    },
    twitter: {
      card: input.image ? "summary_large_image" : "summary",
      title: absoluteTitle,
      description: input.description,
      images: input.image ? [input.image] : undefined,
    },
  };
}

export function jsonLd(value: Record<string, unknown>) {
  return { __html: JSON.stringify(value).replace(/</g, "\\u003c") };
}
export function normalizePublicTitle(title: string): string {
  return title.trim().replace(/(?:\s*\|\s*ForexMax(?:\s+[^|]+)?)+$/i, "").trim();
}
