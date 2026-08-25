import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/site-url";

const site = getCanonicalSiteUrl();
export default function robots(): MetadataRoute.Robots { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/admin/login", "/preview/", "/drafts/", "/private/"] }], sitemap: new URL("/sitemap.xml", site).toString() }; }
