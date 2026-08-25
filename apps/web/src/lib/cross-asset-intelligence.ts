import { getMacroSnapshot, type MacroObservation, type YieldObservation } from "@/lib/macro-data";
import { getMarketTapeSnapshot, type MarketTapeItem } from "@/lib/market-tape";
import type { MarketObservation } from "@/lib/market-observation";

export type CrossAssetSnapshot = {
  retrievedAt: string;
  observations: Array<MarketTapeItem | MacroObservation>;
  tape: MarketTapeItem[];
  macro: MacroObservation[];
  tenYearSeries: YieldObservation[];
  failures: string[];
};

export function deduplicateObservations<T extends MarketObservation>(observations: T[]) {
  const observed = new Map<string, T>();
  observations.forEach((observation) => {
    if (!observed.has(observation.id)) observed.set(observation.id, observation);
  });
  return [...observed.values()];
}

export async function getCrossAssetSnapshot(): Promise<CrossAssetSnapshot> {
  const [tapeSnapshot, macroSnapshot] = await Promise.all([getMarketTapeSnapshot(), getMacroSnapshot()]);
  return {
    retrievedAt: tapeSnapshot.retrievedAt,
    observations: deduplicateObservations([...tapeSnapshot.items, ...macroSnapshot.observations]),
    tape: tapeSnapshot.items,
    macro: macroSnapshot.observations,
    tenYearSeries: macroSnapshot.tenYearSeries,
    failures: [...tapeSnapshot.failures, ...macroSnapshot.failures],
  };
}
