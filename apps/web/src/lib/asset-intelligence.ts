export type AssetIntelligenceProfile = {
  slug: "gold-macro-drivers" | "eurusd" | "usdjpy" | "us-10y" | "sp500" | "nasdaq-composite" | "wti";
  title: string;
  eyebrow: string;
  description: string;
  overview: string;
  tapeIds: string[];
  macroIds: Array<"us-cpi" | "us-unemployment" | "us-10y" | "us-public-debt">;
  driverAsset?: "XAUUSD" | "EURUSD" | "USDJPY" | "US10Y" | "SP500" | "WTI";
  eventIds: string[];
  limitations: string;
};

export const assetIntelligenceProfiles: AssetIntelligenceProfile[] = [
  {
    slug: "gold-macro-drivers", title: "Gold macro drivers", eyebrow: "GOLD / MACRO CONTEXT",
    description: "Source-aware gold macro context: published U.S. rates, real yields, broad-dollar and inflation observations with explicit price-data boundaries.",
    overview: "Gold research needs an asset-specific price record alongside its macro context. The current desk has verified rate, real-yield, broad-dollar and U.S. inflation observations, but no active eligible gold-price series. It therefore presents the dated macro record without a gold price, target, performance calculation or directional Gold/XAUUSD assessment.",
    tapeIds: ["us-10y", "us-10y-real", "broad-usd"], macroIds: ["us-cpi", "us-unemployment", "us-10y"], driverAsset: "XAUUSD", eventIds: ["us-cpi", "us-employment-situation", "fed-policy"],
    limitations: "No active gold-price contract is connected. The historical FRED LBMA gold series was removed from FRED, so no substitute is shown. A public gold assessment requires an eligible price source, a defined comparison period, documented evidence and editorial review."
  },
  {
    slug: "eurusd", title: "EUR/USD macro context", eyebrow: "FX / EURUSD",
    description: "Published EUR/USD, broad U.S. dollar and U.S. rate observations with source dates, prior records and central-bank source boundaries.",
    overview: "EUR/USD is shown as the published U.S. dollars-per-euro observation from the named FRED/H.10 series, beside the broad U.S. dollar and U.S. rate context. Each market row is a dated official observation rather than a live FX quote or directional view.",
    tapeIds: ["eurusd", "broad-usd", "us-10y", "us-10y-real"], macroIds: ["us-cpi", "us-10y"], driverAsset: "EURUSD", eventIds: ["us-cpi", "fed-policy"],
    limitations: "No ECB event record, euro-area macro series or policy-rate differential is connected. The desk does not convert U.S.-side context into a EUR/USD directional conclusion."
  },
  {
    slug: "usdjpy", title: "USD/JPY macro context", eyebrow: "FX / USDJPY",
    description: "Published USD/JPY, broad U.S. dollar and U.S. rate observations with explicit Japanese-policy and macro-data boundaries.",
    overview: "USD/JPY is displayed as the dated Japanese-yen-per-U.S.-dollar observation in the named FRED/H.10 series. The page connects it to equally dated U.S. dollar and rate observations, not to an intraday quote, a Bank of Japan policy inference or a trade view.",
    tapeIds: ["usdjpy", "broad-usd", "us-10y", "us-10y-real"], macroIds: ["us-cpi", "us-10y"], driverAsset: "USDJPY", eventIds: ["us-cpi", "fed-policy"],
    limitations: "No Bank of Japan event record or Japanese macro series is connected. The desk therefore does not infer a policy differential or classify the exchange-rate record as supportive or pressuring."
  },
  {
    slug: "us-10y", title: "U.S. 10-year Treasury yields", eyebrow: "RATES / US10Y",
    description: "Published nominal and real 10-year Treasury observations with inflation, labor and fiscal source context.",
    overview: "The desk presents the latest valid nominal and real 10-year constant-maturity observations with the prior valid records, reference dates, publisher links and retrieval time. It does not convert selected records into a rate forecast or a trade recommendation.",
    tapeIds: ["us-10y", "us-10y-real", "broad-usd"], macroIds: ["us-cpi", "us-unemployment", "us-10y", "us-public-debt"], driverAsset: "US10Y", eventIds: ["us-cpi", "us-employment-situation", "fed-policy"],
    limitations: "This is selected rate context, not a complete yield curve. Inflation expectations, auctions, Treasury term-premium estimates and policy projections need separately approved source contracts."
  },
  {
    slug: "sp500", title: "S&P 500 risk context", eyebrow: "EQUITIES / SPX",
    description: "Published S&P 500 and VIX observations beside U.S. rate and macro-release context, with visible source and delay boundaries.",
    overview: "The page holds a dated S&P 500 index observation beside a dated VIX observation and U.S. rates. It does not infer market causes, returns, valuation or a risk-on/risk-off regime from these limited records.",
    tapeIds: ["sp500", "vix", "us-10y", "us-10y-real"], macroIds: ["us-cpi", "us-unemployment", "us-10y"], driverAsset: "SP500", eventIds: ["us-cpi", "us-employment-situation", "fed-policy"],
    limitations: "The public desk does not yet contain earnings, sector composition, breadth, options-flow, constituent or real-time equity data contracts."
  },
  {
    slug: "nasdaq-composite", title: "NASDAQ Composite context", eyebrow: "EQUITIES / NASDAQ",
    description: "Published NASDAQ Composite, S&P 500 and VIX observations with U.S. rates and official macro-release context.",
    overview: "The page presents the latest published NASDAQ Composite closing observation from the named FRED series alongside dated broad-equity, volatility and rate context. It is not an intraday quote, earnings analysis, valuation view or directional assessment.",
    tapeIds: ["nasdaq-composite", "sp500", "vix", "us-10y", "us-10y-real"], macroIds: ["us-cpi", "us-unemployment", "us-10y"], eventIds: ["us-cpi", "us-employment-situation", "fed-policy"],
    limitations: "The public desk does not yet contain Nasdaq constituent data, earnings, sector composition, breadth, options-flow or real-time equity data contracts."
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
