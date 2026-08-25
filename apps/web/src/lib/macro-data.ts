export type MacroObservation = {
  id: "us-cpi" | "us-unemployment" | "us-10y";
  label: string;
  value: number;
  valueLabel: string;
  referencePeriod: string;
  sourceName: string;
  sourceUrl: string;
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

const BLS_CPI_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0?latest=true";
const BLS_UNEMPLOYMENT_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/LNS14000000?latest=true";
const FRED_DGS10_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10";

type BlsPoint = { year?: string; period?: string; periodName?: string; value?: string; footnotes?: Array<{ code?: string; text?: string }> };
type BlsPayload = { status?: string; Results?: { series?: Array<{ data?: BlsPoint[] }> } };

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

function latestBlsPoint(payload: BlsPayload) {
  if (payload.status !== "REQUEST_SUCCEEDED") throw new Error("BLS request was not successful");
  const point = payload.Results?.series?.[0]?.data?.[0];
  if (!point?.value || !point.year || !point.periodName) throw new Error("BLS response did not include a latest observation");
  const value = Number(point.value);
  if (!Number.isFinite(value)) throw new Error("BLS observation value was not numeric");
  return { value, period: `${point.periodName} ${point.year}`, footnote: point.footnotes?.find((item) => item.text)?.text };
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
  const [cpiResponse, unemploymentResponse, yieldResponse] = await Promise.allSettled([readText(BLS_CPI_URL), readText(BLS_UNEMPLOYMENT_URL), readText(FRED_DGS10_URL)]);
  const observations: MacroObservation[] = [];
  const failures: string[] = [];
  let tenYearSeries: YieldObservation[] = [];

  if (cpiResponse.status === "fulfilled") {
    try {
      const point = latestBlsPoint(JSON.parse(cpiResponse.value) as BlsPayload);
      observations.push({ id: "us-cpi", label: "U.S. CPI-U", value: point.value, valueLabel: point.value.toFixed(3), referencePeriod: point.period, sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: "https://www.bls.gov/cpi/", sourceApiUrl: BLS_CPI_URL, note: point.footnote ?? "All items, U.S. city average; index level." });
    } catch (error) { failures.push(asFailure("BLS CPI", error)); }
  } else { failures.push(asFailure("BLS CPI", cpiResponse.reason)); }

  if (unemploymentResponse.status === "fulfilled") {
    try {
      const point = latestBlsPoint(JSON.parse(unemploymentResponse.value) as BlsPayload);
      observations.push({ id: "us-unemployment", label: "U.S. unemployment rate", value: point.value, valueLabel: `${point.value.toFixed(1)}%`, referencePeriod: point.period, sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: "https://www.bls.gov/cps/", sourceApiUrl: BLS_UNEMPLOYMENT_URL, note: point.footnote ?? "Civilian unemployment rate, seasonally adjusted." });
    } catch (error) { failures.push(asFailure("BLS unemployment", error)); }
  } else { failures.push(asFailure("BLS unemployment", unemploymentResponse.reason)); }

  if (yieldResponse.status === "fulfilled") {
    try {
      tenYearSeries = parseFredYieldCsv(yieldResponse.value);
      const latest = tenYearSeries.at(-1);
      if (!latest) throw new Error("FRED response did not include a numeric DGS10 observation");
      observations.push({ id: "us-10y", label: "U.S. 10-year Treasury rate", value: latest.value, valueLabel: `${latest.value.toFixed(2)}%`, referencePeriod: latest.date, sourceName: "Federal Reserve Bank of St. Louis / FRED", sourceUrl: "https://fred.stlouisfed.org/series/DGS10", sourceApiUrl: FRED_DGS10_URL, note: "Daily 10-year Treasury constant-maturity-rate observation." });
    } catch (error) { failures.push(asFailure("FRED DGS10", error)); }
  } else { failures.push(asFailure("FRED DGS10", yieldResponse.reason)); }

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
