import type { NextConfig } from "next";
import legacyContent from "./src/content/legacy-content.json";

type LegacyRecord = { legacyUrl: string; route: string; slug: string };
const redirectRecords = legacyContent as LegacyRecord[];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "xvhjsbakmokmgymwrldo.supabase.co", pathname: "/storage/v1/object/public/media/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "X-Frame-Options", value: "DENY" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }] }];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [{ source: "/api/quant-research", destination: "/api/quant_research" }];
    return [
      { source: "/api/alphabacktest", destination: "http://127.0.0.1:8010/api/alphabacktest" },
      { source: "/api/quant-research", destination: "http://127.0.0.1:8010/api/quant_research" },
    ];
  },
  async redirects() {
    const pageRedirects = redirectRecords.filter((record) => record.route !== "/" && !["author-card", "template"].includes(record.slug)).map((record) => ({ source: new URL(record.legacyUrl).pathname, destination: record.route, statusCode: 301 }));
    return [
      { source: "/index.html", destination: "/", statusCode: 301 },
      ...pageRedirects,
    ];
  },
};

export default nextConfig;
