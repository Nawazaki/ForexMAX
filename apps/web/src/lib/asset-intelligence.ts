export type AssetIntelligenceProfile = {
  slug: "gold-macro-drivers" | "eurusd" | "us-10y" | "sp500" | "wti";
  title: string;
  eyebrow: string;
  description: string;
  overview: string;
  tapeIds: string[];
  macroIds: Array<"us-cpi" | "us-unemployment" | "us-10y" | "us-public-debt">;
  driverAsset?: string;
  eventIds: string[];
  limitations: string;
};

export const assetIntelligenceProfiles: AssetIntelligenceProfile[] = [
  {
    slug: "gold-macro-drivers", title: "Gold macro drivers", eyebrow: "GOLD / MACRO CONTEXT",
    description: "Source-aware context for gold macro drivers, including U.S. rates, real yields, dollar observations and inflation releases.",
    overview: "This page examines observable macro inputs that can matter to gold research. It deliberately does not display a gold price, price target or directional Gold/XAUUSD assessment because a named current gold-price data contract has not been activated.",
    tapeIds: ["us-10y", "us-10y-real", "broad-usd"], macroIds: ["us-cpi", "us-unemployment", "us-10y"], driverAsset: "XAUUSD", eventIds: ["us-cpi", "us-employment-situation", "fed-policy"],
    limitations: "The visible factors are context, not a causal model. A public gold assessment requires an eligible gold-price source, a defined comparison period, documented evidence and editorial review."
  },
  {
    slug: "eurusd", title: "EUR/USD macro context", eyebrow: "FX / EURUSD",
    description: "Published EUR/USD, broad U.S. dollar and U.S. rate observations with central-bank and event-source context.",
    overview: "EUR/USD is shown as the published U.S. dollars-per-euro observation from the named FRED/H.10 series, alongside U.S. rate and broad-dollar context. It is not an intraday FX quote or a directional view.",
    tapeIds: ["eurusd", "broad-usd", "us-10y", "us-10y-real"], macroIds: ["us-cpi", "us-10y"], driverAsset: "EURUSD", eventIds: ["us-cpi", "fed-policy"],
    limitations: "The current desk has not connected an ECB release-calendar event stream or a euro-area data series. No policy-differential or directional conclusion is presented."
  },
  {
    slug: "us-10y", title: "U.S. 10-year Treasury yields", eyebrow: "RATES / US10Y",
    description: "Published nominal and real 10-year Treasury observations with macro-release context and source lineage.",
    overview: "The desk presents the latest valid nominal and real 10-year constant-maturity observations and the reference dates supplied by FRED. It does not convert these records into an interest-rate forecast or a trade recommendation.",
    tapeIds: ["us-10y", "us-10y-real", "broad-usd"], macroIds: ["us-cpi", "us-unemployment", "us-10y", "us-public-debt"], eventIds: ["us-cpi", "us-employment-situation", "fed-policy"],
    limitations: "This is a selected rates context, not a complete yield curve. Inflation expectations, auction results and policy projections require separately approved contracts."
  },
  {
    slug: "sp500", title: "S&P 500 risk context", eyebrow: "EQUITIES / SPX",
    description: "Published S&P 500 and VIX observations set beside U.S. rates and scheduled official macro-release sources.",
    overview: "The page holds a dated S&P 500 index observation alongside a dated VIX observation and U.S. rate context. It does not infer equity-market causes, returns, valuation, or a risk-on/risk-off regime from these limited records.",
    tapeIds: ["sp500", "vix", "us-10y", "us-10y-real"], macroIds: ["us-cpi", "us-unemployment", "us-10y"], eventIds: ["us-cpi", "us-employment-situation", "fed-policy"],
    limitations: "The public desk does not yet contain earnings, sector composition, breadth, options-flow or real-time equity data contracts."
  },
  {
    slug: "wti", title: "WTI crude oil context", eyebrow: "ENERGY / WTI",
    description: "Published WTI observations with source-aware energy, macro and positioning research requirements.",
    overview: "The WTI line is a dated FRED observation. It is displayed with its source record and placed beside selected macro and risk context; it is not a futures quote, supply-demand forecast or trading assessment.",
    tapeIds: ["wti", "broad-usd", "vix"], macroIds: ["us-cpi", "us-10y"], driverAsset: "WTI", eventIds: ["us-cpi", "fed-policy"],
    limitations: "EIA inventory and CFTC positioning integrations require an exact public report/series contract, unit handling and report-date policy before they can support a public oil assessment."
  },
];

export function getAssetIntelligenceProfile(slug: string) {
  return assetIntelligenceProfiles.find((profile) => profile.slug === slug);
}
