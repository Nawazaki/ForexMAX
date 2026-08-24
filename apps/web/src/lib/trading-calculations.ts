export function calculatePositionSize(balanceInput: string | number, riskInput: string | number, stopPipsInput: string | number, pipValueInput: string | number) {
  const balance = Number(balanceInput); const riskPercent = Number(riskInput); const stopPips = Number(stopPipsInput); const pipValue = Number(pipValueInput);
  const money = balance * riskPercent / 100;
  const units = money / (stopPips * pipValue);
  return { money: Number.isFinite(money) && money >= 0 ? money : 0, units: Number.isFinite(units) && units >= 0 ? units : 0 };
}

export function hasValidPositionInputs(balanceInput: string | number, riskInput: string | number, stopPipsInput: string | number, pipValueInput: string | number) {
  return [balanceInput, riskInput, stopPipsInput, pipValueInput].map(Number).every((value) => Number.isFinite(value) && value > 0);
}

export function calculateRiskReward(entryInput: string | number, stopInput: string | number, targetInput: string | number) {
  const entry = Number(entryInput); const stop = Number(stopInput); const target = Number(targetInput);
  const downside = Math.abs(entry - stop); const upside = Math.abs(target - entry);
  const ratio = downside > 0 && Number.isFinite(upside) ? upside / downside : 0;
  return { ratio: Number.isFinite(ratio) && ratio >= 0 ? ratio : 0, breakEvenPercent: ratio > 0 ? 100 / (1 + ratio) : 0 };
}

export function hasValidRiskRewardInputs(entryInput: string | number, stopInput: string | number, targetInput: string | number) {
  const [entry, stop, target] = [entryInput, stopInput, targetInput].map(Number);
  return [entry, stop, target].every(Number.isFinite) && entry !== stop;
}

export function formatUtcClock(date: Date) { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(date); }
