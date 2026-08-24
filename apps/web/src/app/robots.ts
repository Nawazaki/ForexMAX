import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://forexmax.com";
export default function robots(): MetadataRoute.Robots { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/admin/login", "/preview/", "/drafts/", "/private/"] }], sitemap: new URL("/sitemap.xml", site).toString() }; }
