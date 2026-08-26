import type { BacktestBar, DatasetProvenance, StrategyBacktestRequest } from "@/lib/backtest-contract";

type DatasetDefinition = Omit<DatasetProvenance, "asset" | "retrievalTimestamp" | "referencePeriodStart" | "referencePeriodEnd" | "dataVersion"> & { asset: StrategyBacktestRequest["asset"] };

const FRED_GRAPH_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=";

export const approvedBacktestDatasets: Record<StrategyBacktestRequest["asset"], DatasetDefinition> = {
  SP500: { asset: "SP500", label: "S&P 500 index", seriesId: "SP500", publisher: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/SP500", frequency: "DAILY", marketTimestampPolicy: "SOURCE_DATE_ONLY", releaseTimestamp: null, adjustmentPolicy: "AS_PUBLISHED_REFERENCE_SERIES" },
  EURUSD: { asset: "EURUSD", label: "EUR/USD", seriesId: "DEXUSEU", publisher: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DEXUSEU", frequency: "DAILY", marketTimestampPolicy: "SOURCE_DATE_ONLY", releaseTimestamp: null, adjustmentPolicy: "AS_PUBLISHED_REFERENCE_SERIES" },
  USDJPY: { asset: "USDJPY", label: "USD/JPY", seriesId: "DEXJPUS", publisher: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DEXJPUS", frequency: "DAILY", marketTimestampPolicy: "SOURCE_DATE_ONLY", releaseTimestamp: null, adjustmentPolicy: "AS_PUBLISHED_REFERENCE_SERIES" },
};

function isoDate(date: Date) { return date.toISOString().slice(0, 10); }

function windowStart(years: number, referenceDate: Date) {
  const start = new Date(referenceDate);
  start.setUTCFullYear(start.getUTCFullYear() - years);
  return isoDate(start);
}

function fredUrl(definition: DatasetDefinition, years: number, referenceDate: Date) {
  return `${FRED_GRAPH_URL}${definition.seriesId}&cosd=${windowStart(years, referenceDate)}&coed=${isoDate(referenceDate)}`;
}

export function parseFredBacktestCsv(csv: string): BacktestBar[] {
  return csv.split(/\r?\n/).slice(1).map((line) => {
    const [referenceDate, rawClose] = line.split(",");
    return { referenceDate: referenceDate?.trim(), close: Number(rawClose) };
  }).filter((bar): bar is BacktestBar => Boolean(bar.referenceDate) && /^\d{4}-\d{2}-\d{2}$/.test(bar.referenceDate) && Number.isFinite(bar.close) && bar.close > 0)
    .sort((left, right) => left.referenceDate.localeCompare(right.referenceDate));
}

export async function loadApprovedBacktestDataset(input: Pick<StrategyBacktestRequest, "asset" | "periodYears">, options?: { fetcher?: typeof fetch; referenceDate?: Date }) {
  const definition = approvedBacktestDatasets[input.asset];
  const fetcher = options?.fetcher ?? fetch;
  const referenceDate = options?.referenceDate ?? new Date();
  const retrievedAt = new Date().toISOString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetcher(fredUrl(definition, input.periodYears, referenceDate), { next: { revalidate: 900 }, signal: controller.signal });
    if (!response.ok) throw new Error(`Dataset request failed with HTTP ${response.status}.`);
    const bars = parseFredBacktestCsv(await response.text());
    if (bars.length < 125) throw new Error("Approved source returned fewer than 125 valid daily observations.");
    return {
      bars,
      provenance: {
        ...definition,
        retrievalTimestamp: retrievedAt,
        referencePeriodStart: bars[0].referenceDate,
        referencePeriodEnd: bars.at(-1)?.referenceDate ?? bars[0].referenceDate,
        dataVersion: `FRED:${definition.seriesId}:${bars[0].referenceDate}:${bars.at(-1)?.referenceDate ?? bars[0].referenceDate}`,
      } satisfies DatasetProvenance,
    };
  } finally {
    clearTimeout(timeout);
  }
}
