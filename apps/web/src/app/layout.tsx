import type { Metadata } from "next";
import { SiteAnalytics } from "@/components/site-analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://forexmax.com"),
  title: { default: "ForexMax — Financial Research & Trading Intelligence", template: "%s | ForexMax" },
  description: "Independent financial research, trading intelligence and educational analysis covering markets, brokers and proprietary trading firms.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<SiteAnalytics /></body></html>;
}
