"""Dataset registry and current bounded Yahoo historical research adapter."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from hashlib import sha256

import pandas as pd
from pandas_datareader import data as pdr
import yfinance as yf

from .contracts import Dataset, DatasetRef
from .quality import validate_daily_ohlcv


@dataclass(frozen=True)
class AssetDefinition:
    asset_id: str
    label: str
    yahoo_symbol: str
    source_url: str


ASSET_REGISTRY: dict[str, AssetDefinition] = {
    "SP500": AssetDefinition("SP500", "S&P 500 index", "^GSPC", "https://finance.yahoo.com/quote/%5EGSPC/history/"),
    "EURUSD": AssetDefinition("EURUSD", "EUR/USD", "EURUSD=X", "https://finance.yahoo.com/quote/EURUSD=X/history/"),
    "USDJPY": AssetDefinition("USDJPY", "USD/JPY", "JPY=X", "https://finance.yahoo.com/quote/JPY%3DX/history/"),
}


class YahooDailyResearchProvider:
    """Preview research adapter, not an approved production market-data contract."""

    provider_id = "YAHOO_DAILY_RESEARCH"
    warmup_observations = 500

    def fetch(self, asset_id: str, period_years: int) -> Dataset:
        if asset_id not in ASSET_REGISTRY:
            raise ValueError("Unsupported research asset.")
        if period_years not in {1, 3, 5}:
            raise ValueError("Unsupported historical period.")

        asset = ASSET_REGISTRY[asset_id]
        retrieved_at = datetime.now(UTC)
        fetch_start = (retrieved_at - timedelta(days=(period_years + 3) * 366)).date()
        fetch_end = (retrieved_at + timedelta(days=1)).date()
        provider_route = "Yahoo Finance via pandas_datareader"
        try:
            raw = pdr.get_data_yahoo(asset.yahoo_symbol, start=fetch_start, end=fetch_end)
        except Exception:
            raw = yf.download(asset.yahoo_symbol, start=fetch_start, end=fetch_end, interval="1d", auto_adjust=False, progress=False, threads=False)
            if isinstance(raw.columns, pd.MultiIndex):
                raw.columns = raw.columns.get_level_values(0)
            provider_route = "Yahoo Finance via yfinance compatibility fallback"

        if raw.empty:
            raise RuntimeError("Yahoo Finance returned no historical observations.")
        missing = [column for column in ("Open", "High", "Low", "Close", "Volume") if column not in raw.columns]
        if missing:
            raise RuntimeError(f"Yahoo Finance response lacks required OHLCV fields: {', '.join(missing)}.")

        frame = raw.loc[:, ["Open", "High", "Low", "Close", "Volume"]].copy()
        frame.index = pd.to_datetime(frame.index).tz_localize(None)
        frame = frame.astype(float)
        target_start = pd.Timestamp((retrieved_at - timedelta(days=period_years * 366)).date())
        candidates = frame.index[frame.index >= target_start]
        if candidates.empty:
            raise RuntimeError("Dataset does not reach the requested reference window.")
        evaluation_start = candidates[0]
        quality = validate_daily_ohlcv(frame, warmup_observations=self.warmup_observations)
        if quality.status != "PASSED":
            raise RuntimeError("Dataset failed data-quality gate: " + " ".join(quality.failures))
        position = frame.index.get_loc(evaluation_start)
        if isinstance(position, slice) or position < self.warmup_observations:
            raise RuntimeError("Dataset does not contain the required warm-up before the evaluation window.")

        fingerprint = sha256(frame.to_csv().encode("utf-8")).hexdigest()[:16]
        reference = DatasetRef(
            dataset_id=f"{self.provider_id}:{asset.yahoo_symbol}:{fingerprint}",
            asset_id=asset.asset_id,
            label=asset.label,
            provider=provider_route,
            source_url=asset.source_url,
            symbol=asset.yahoo_symbol,
            frequency="DAILY_SOURCE_REFERENCE",
            timezone="PROVIDER_DAILY_DATE",
            coverage_start=frame.index[0].date().isoformat(),
            coverage_end=frame.index[-1].date().isoformat(),
            retrieved_at=retrieved_at.isoformat(),
            version=f"YAHOO:{asset.yahoo_symbol}:{fingerprint}",
            adjustment_policy="UNADJUSTED_RETURNED_OHLCV; auto_adjust=False",
            information_cutoff=frame.index[-1].date().isoformat(),
            limitations=(
                "Yahoo/yfinance historical OHLCV is Preview research reference data, not an approved production feed.",
                "Provider-side historical revisions and adjustment conventions may affect reproducibility.",
            ),
        )
        return Dataset(reference=reference, frame=frame, quality=quality, evaluation_start=evaluation_start.date().isoformat())


class DatasetRegistry:
    """Allowlisted registry. New providers must implement the same explicit contract."""

    def __init__(self) -> None:
        self._providers = {YahooDailyResearchProvider.provider_id: YahooDailyResearchProvider()}

    def capabilities(self) -> list[dict[str, object]]:
        return [
            {
                "provider": YahooDailyResearchProvider.provider_id,
                "assets": [asset.asset_id for asset in ASSET_REGISTRY.values()],
                "frequency": "DAILY_SOURCE_REFERENCE",
                "status": "PREVIEW_RESEARCH_ONLY",
                "limitations": "No intraday, event, multi-asset or licensed production feed is active.",
            }
        ]

    def fetch(self, *, provider_id: str, asset_id: str, period_years: int) -> Dataset:
        if provider_id not in self._providers:
            raise ValueError("Unsupported dataset provider.")
        return self._providers[provider_id].fetch(asset_id, period_years)
