import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://forexmax.com";

export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const canonical = new URL(input.path, siteUrl).toString();
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: input.title,
      description: input.description,
      url: canonical,
      images: input.image ? [{ url: input.image }] : undefined,
    },
    twitter: {
      card: input.image ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      images: input.image ? [input.image] : undefined,
    },
  };
}

export function jsonLd(value: Record<string, unknown>) {
  return { __html: JSON.stringify(value).replace(/</g, "\\u003c") };
}
