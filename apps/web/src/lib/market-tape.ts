export type MarketTapeGroup = "RATES" | "USD_FX" | "ENERGY" | "EQUITIES" | "RISK";
export type MarketTapeState = "CURRENT" | "STALE" | "UNAVAILABLE";
export type MarketTapePoint = { date: string; value: number };

type TapeDefinition = {
  id: string;
  group: MarketTapeGroup;
  label: string;
  seriesId: string;
  sourceName: string;
  sourceUrl: string;
  unit: "PERCENT" | "INDEX" | "FX" | "USD_PER_BARREL" | "POINTS";
  precision: number;
  note: string;
};

export type MarketTapeItem = Omit<TapeDefinition, "seriesId" | "precision"> & {
  latest: MarketTapePoint;
  previous: MarketTapePoint;
  change: number;
  changeLabel: string;
  valueLabel: string;
  state: MarketTapeState;
  staleAfterDays: number;
};

export type MarketTapeSnapshot = { retrievedAt: string; items: MarketTapeItem[]; failures: string[] };

const FRED_GRAPH_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=";
const DEFAULT_STALE_AFTER_DAYS = 10;

function fredWindowStart(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setUTCDate(start.getUTCDate() - 45);
  return start.toISOString().slice(0, 10);
}

function fredSeriesUrl(seriesId: string, referenceDate?: Date) {
  return `${FRED_GRAPH_URL}${seriesId}&cosd=${fredWindowStart(referenceDate)}`;
}

const tapeDefinitions: TapeDefinition[] = [
  { id: "us-10y", group: "RATES", label: "U.S. 10-year Treasury rate", seriesId: "DGS10", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DGS10", unit: "PERCENT", precision: 2, note: "Daily constant-maturity-rate observation; not an intraday quote." },
  { id: "us-10y-real", group: "RATES", label: "U.S. 10-year real yield", seriesId: "DFII10", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DFII10", unit: "PERCENT", precision: 2, note: "Daily inflation-indexed constant-maturity-rate observation." },
  { id: "broad-usd", group: "USD_FX", label: "Broad U.S. dollar index", seriesId: "DTWEXBGS", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DTWEXBGS", unit: "INDEX", precision: 2, note: "Trade-weighted dollar index observation; index level is not a forecast." },
  { id: "eurusd", group: "USD_FX", label: "EUR/USD", seriesId: "DEXUSEU", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DEXUSEU", unit: "FX", precision: 4, note: "U.S. dollars per euro, as published in the H.10/FRED series." },
  { id: "gbpusd", group: "USD_FX", label: "GBP/USD", seriesId: "DEXUSUK", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DEXUSUK", unit: "FX", precision: 4, note: "U.S. dollars per pound sterling, as published in the H.10/FRED series." },
  { id: "usdjpy", group: "USD_FX", label: "USD/JPY", seriesId: "DEXJPUS", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DEXJPUS", unit: "FX", precision: 2, note: "Japanese yen per U.S. dollar, as published in the H.10/FRED series." },
  { id: "wti", group: "ENERGY", label: "WTI crude oil", seriesId: "DCOILWTICO", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DCOILWTICO", unit: "USD_PER_BARREL", precision: 2, note: "Daily WTI spot-price observation; non-business-day gaps are preserved." },
  { id: "sp500", group: "EQUITIES", label: "S&P 500 index", seriesId: "SP500", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/SP500", unit: "POINTS", precision: 2, note: "Daily index observation; not an investable performance claim." },
  { id: "vix", group: "RISK", label: "CBOE VIX index", seriesId: "VIXCLS", sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/VIXCLS", unit: "POINTS", precision: 2, note: "Daily published volatility-index observation; it is not a probability forecast." },
];

async function readOfficialText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url, { next: { revalidate: 900 }, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function parseFredSeriesCsv(csv: string): MarketTapePoint[] {
  return csv.split(/\r?\n/).slice(1).map((line) => {
    const [date, rawValue] = line.split(",");
    return { date: date?.trim(), value: Number(rawValue) };
  }).filter((point): point is MarketTapePoint => Boolean(point.date) && Number.isFinite(point.value));
}

function formatValue(value: number, definition: TapeDefinition) {
  if (definition.unit === "PERCENT") return `${value.toFixed(definition.precision)}%`;
  if (definition.unit === "USD_PER_BARREL") return `USD ${value.toFixed(definition.precision)}`;
  if (definition.unit === "POINTS") return value.toFixed(definition.precision);
  return value.toFixed(definition.precision);
}

function formatChange(change: number, definition: TapeDefinition) {
  const signed = `${change > 0 ? "+" : ""}${change.toFixed(definition.precision)}`;
  if (definition.unit === "PERCENT") return `${signed} percentage points`;
  if (definition.unit === "USD_PER_BARREL") return `USD ${signed}`;
  return signed;
}

export function marketTapeItemFromPoints(definition: TapeDefinition, points: MarketTapePoint[], retrievedAt = new Date().toISOString()): MarketTapeItem {
  const latest = points.at(-1);
  const previous = points.at(-2);
  if (!latest || !previous) throw new Error(`${definition.seriesId} needs two valid observations`);
  const ageInDays = Math.floor((new Date(retrievedAt).getTime() - new Date(`${latest.date}T00:00:00Z`).getTime()) / 86_400_000);
  return { ...definition, latest, previous, change: latest.value - previous.value, changeLabel: formatChange(latest.value - previous.value, definition), valueLabel: formatValue(latest.value, definition), state: ageInDays > DEFAULT_STALE_AFTER_DAYS ? "STALE" : "CURRENT", staleAfterDays: DEFAULT_STALE_AFTER_DAYS };
}

export async function getMarketTapeSnapshot(): Promise<MarketTapeSnapshot> {
  const retrievedAt = new Date().toISOString();
  const responses = await Promise.allSettled(tapeDefinitions.map((definition) => readOfficialText(fredSeriesUrl(definition.seriesId))));
  const items: MarketTapeItem[] = [];
  const failures: string[] = [];
  responses.forEach((response, index) => {
    const definition = tapeDefinitions[index];
    if (response.status !== "fulfilled") { failures.push(`${definition.label}: ${response.reason instanceof Error ? response.reason.message : "request failed"}`); return; }
    try { items.push(marketTapeItemFromPoints(definition, parseFredSeriesCsv(response.value), retrievedAt)); }
    catch (error) { failures.push(`${definition.label}: ${error instanceof Error ? error.message : "invalid response"}`); }
  });
  return { retrievedAt, items, failures };
}

export const marketTapeGroups: Array<{ id: MarketTapeGroup; label: string; description: string }> = [
  { id: "RATES", label: "Rates", description: "Nominal and real-rate observations." },
  { id: "USD_FX", label: "Dollar & FX", description: "Published dollar-index and bilateral exchange-rate observations." },
  { id: "ENERGY", label: "Energy", description: "Published WTI observation." },
  { id: "EQUITIES", label: "Equities", description: "Published broad-equity index observation." },
  { id: "RISK", label: "Risk", description: "Published implied-volatility index observation." },
];
