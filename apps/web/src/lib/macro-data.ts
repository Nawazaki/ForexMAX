import { createMarketObservation, type MarketObservation } from "@/lib/market-observation";

export type MacroObservation = MarketObservation & {
  id: "us-cpi" | "us-unemployment" | "us-10y" | "us-public-debt";
  label: string;
  valueLabel: string;
  compactValueLabel?: string;
  sourceName: string;
  sourceApiUrl: string;
  note: string;
};

export type YieldObservation = { date: string; value: number };
export type MacroSnapshot = {
  retrievedAt: string;
  observations: MacroObservation[];
  tenYearSeries: YieldObservation[];
  failures: string[];
};

const BLS_CPI_SERIES_ID = "CUUR0000SA0";
const BLS_UNEMPLOYMENT_SERIES_ID = "LNS14000000";
const FRED_DGS10_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10";
const TREASURY_DEBT_URL = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?fields=record_date,tot_pub_debt_out_amt&sort=-record_date&page%5Bsize%5D=2";

type BlsPoint = { year?: string; period?: string; periodName?: string; value?: string; footnotes?: Array<{ code?: string; text?: string }> };
type BlsPayload = { status?: string; Results?: { series?: Array<{ data?: BlsPoint[] }> } };
type TreasuryDebtPayload = { data?: Array<{ record_date?: string; tot_pub_debt_out_amt?: string }> };

async function readText(url: string) {
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

function blsSeriesUrl(seriesId: string, referenceDate = new Date()) {
  const endYear = referenceDate.getUTCFullYear();
  return `https://api.bls.gov/publicAPI/v2/timeseries/data/${seriesId}?startyear=${endYear - 1}&endyear=${endYear}`;
}

function latestBlsPoints(payload: BlsPayload) {
  if (payload.status !== "REQUEST_SUCCEEDED") throw new Error("BLS request was not successful");
  const points = (payload.Results?.series?.[0]?.data ?? []).map((point) => {
    const value = Number(point.value);
    const month = point.period?.match(/^M(\d{2})$/)?.[1];
    if (!Number.isFinite(value) || !point.year || !month) return null;
    return { value, period: `${point.year}-${month}`, footnote: point.footnotes?.find((item) => item.text)?.text };
  }).filter((point): point is { value: number; period: string; footnote: string | undefined } => point !== null)
    .sort((a, b) => a.period.localeCompare(b.period));
  const latest = points.at(-1);
  const previous = points.at(-2);
  if (!latest || !previous) throw new Error("BLS response did not include two valid observations");
  return { latest, previous };
}

function formatExactUsd(raw: string) {
  const [whole, decimal] = raw.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `USD ${grouped}${decimal ? `.${decimal}` : ""}`;
}

export function parseTreasuryDebtPayload(payload: TreasuryDebtPayload) {
  const point = payload.data?.[0];
  const rawValue = point?.tot_pub_debt_out_amt?.trim();
  if (!point?.record_date || !rawValue || !/^\d+(?:\.\d+)?$/.test(rawValue)) {
    throw new Error("Treasury response did not include a numeric public-debt observation");
  }
  const value = Number(rawValue);
  if (!Number.isFinite(value)) throw new Error("Treasury public-debt observation was not numeric");
  return { date: point.record_date, value, rawValue };
}

export function parseTreasuryDebtRecords(payload: TreasuryDebtPayload) {
  return (payload.data ?? []).map((record) => parseTreasuryDebtPayload({ data: [record] }));
}

export function parseFredYieldCsv(csv: string): YieldObservation[] {
  return csv.split(/\r?\n/).slice(1).map((line) => {
    const [date, rawValue] = line.split(",");
    const value = Number(rawValue);
    return { date: date?.trim(), value };
  }).filter((item): item is YieldObservation => Boolean(item.date) && Number.isFinite(item.value)).slice(-12);
}

function asFailure(source: string, error: unknown) {
  return `${source}: ${error instanceof Error ? error.message : "request failed"}`;
}

export async function getMacroSnapshot(): Promise<MacroSnapshot> {
  const retrievedAt = new Date().toISOString();
  const cpiUrl = blsSeriesUrl(BLS_CPI_SERIES_ID);
  const unemploymentUrl = blsSeriesUrl(BLS_UNEMPLOYMENT_SERIES_ID);
  const [cpiResponse, unemploymentResponse, yieldResponse, treasuryDebtResponse] = await Promise.allSettled([
    readText(cpiUrl),
    readText(unemploymentUrl),
    readText(FRED_DGS10_URL),
    readText(TREASURY_DEBT_URL),
  ]);
  const observations: MacroObservation[] = [];
  const failures: string[] = [];
  let tenYearSeries: YieldObservation[] = [];

  if (cpiResponse.status === "fulfilled") {
    try {
      const points = latestBlsPoints(JSON.parse(cpiResponse.value) as BlsPayload);
      observations.push({
        ...createMarketObservation({ id: "us-cpi", asset: "MACRO", metric: "U.S. CPI-U", value: points.latest.value, previousValue: points.previous.value, calculateChangePercent: true, referencePeriod: points.latest.period, publishedAt: null, retrievedAt, source: "U.S. Bureau of Labor Statistics", sourceUrl: "https://www.bls.gov/cpi/", staleAfterDays: 75 }),
        id: "us-cpi", label: "U.S. CPI-U", valueLabel: points.latest.value.toFixed(3), sourceName: "U.S. Bureau of Labor Statistics", sourceApiUrl: cpiUrl, note: points.latest.footnote ?? "All items, U.S. city average; index level.",
      });
    } catch (error) { failures.push(asFailure("BLS CPI", error)); }
  } else { failures.push(asFailure("BLS CPI", cpiResponse.reason)); }

  if (unemploymentResponse.status === "fulfilled") {
    try {
      const points = latestBlsPoints(JSON.parse(unemploymentResponse.value) as BlsPayload);
      observations.push({
        ...createMarketObservation({ id: "us-unemployment", asset: "MACRO", metric: "U.S. unemployment rate", value: points.latest.value, previousValue: points.previous.value, calculateChangePercent: false, referencePeriod: points.latest.period, publishedAt: null, retrievedAt, source: "U.S. Bureau of Labor Statistics", sourceUrl: "https://www.bls.gov/cps/", staleAfterDays: 75 }),
        id: "us-unemployment", label: "U.S. unemployment rate", valueLabel: `${points.latest.value.toFixed(1)}%`, sourceName: "U.S. Bureau of Labor Statistics", sourceApiUrl: unemploymentUrl, note: points.latest.footnote ?? "Civilian unemployment rate, seasonally adjusted.",
      });
    } catch (error) { failures.push(asFailure("BLS unemployment", error)); }
  } else { failures.push(asFailure("BLS unemployment", unemploymentResponse.reason)); }

  if (yieldResponse.status === "fulfilled") {
    try {
      tenYearSeries = parseFredYieldCsv(yieldResponse.value);
      const latest = tenYearSeries.at(-1);
      const previous = tenYearSeries.at(-2);
      if (!latest || !previous) throw new Error("FRED response did not include two numeric DGS10 observations");
      observations.push({
        ...createMarketObservation({ id: "us-10y", asset: "RATES", metric: "U.S. 10-year Treasury rate", value: latest.value, previousValue: previous.value, calculateChangePercent: false, referencePeriod: latest.date, publishedAt: null, retrievedAt, source: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DGS10", staleAfterDays: 10 }),
        id: "us-10y", label: "U.S. 10-year Treasury rate", valueLabel: `${latest.value.toFixed(2)}%`, sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceApiUrl: FRED_DGS10_URL, note: "Daily 10-year Treasury constant-maturity-rate observation.",
      });
    } catch (error) { failures.push(asFailure("FRED DGS10", error)); }
  } else { failures.push(asFailure("FRED DGS10", yieldResponse.reason)); }

  if (treasuryDebtResponse.status === "fulfilled") {
    try {
      const [latest, previous] = parseTreasuryDebtRecords(JSON.parse(treasuryDebtResponse.value) as TreasuryDebtPayload);
      if (!latest || !previous) throw new Error("Treasury response did not include two valid debt records");
      observations.push({
        ...createMarketObservation({ id: "us-public-debt", asset: "FISCAL", metric: "U.S. total public debt outstanding", value: latest.value, previousValue: previous.value, calculateChangePercent: false, referencePeriod: latest.date, publishedAt: null, retrievedAt, source: "U.S. Treasury Fiscal Data", sourceUrl: "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny", staleAfterDays: 10 }),
        id: "us-public-debt", label: "U.S. total public debt outstanding", valueLabel: formatExactUsd(latest.rawValue), compactValueLabel: `USD ${(latest.value / 1_000_000_000_000).toFixed(2)}T`, sourceName: "U.S. Treasury Fiscal Data", sourceApiUrl: TREASURY_DEBT_URL, note: "Treasury fiscal balance-sheet record; not a Treasury yield, price, policy forecast or market signal.",
      });
    } catch (error) { failures.push(asFailure("Treasury public debt", error)); }
  } else { failures.push(asFailure("Treasury public debt", treasuryDebtResponse.reason)); }

  return { retrievedAt, observations, tenYearSeries, failures };
}

export function sparklinePoints(series: YieldObservation[], width = 260, height = 70) {
  if (!series.length) return "";
  const values = series.map((item) => item.value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low || 1;
  return series.map((item, index) => {
    const x = series.length === 1 ? width / 2 : (index / (series.length - 1)) * width;
    const y = height - ((item.value - low) / span) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}
