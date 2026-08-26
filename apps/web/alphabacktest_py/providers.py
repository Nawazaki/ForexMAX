"""Allowlisted historical-data providers for the AlphaBacktest wrapper."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import pandas as pd
from pandas_datareader import data as pdr
import yfinance as yf


@dataclass(frozen=True)
class AssetDefinition:
    id: str
    label: str
    yahoo_ticker: str
    source_url: str


ASSETS: dict[str, AssetDefinition] = {
    "SP500": AssetDefinition("SP500", "S&P 500 index", "^GSPC", "https://finance.yahoo.com/quote/%5EGSPC/history/"),
    "EURUSD": AssetDefinition("EURUSD", "EUR/USD", "EURUSD=X", "https://finance.yahoo.com/quote/EURUSD=X/history/"),
    "USDJPY": AssetDefinition("USDJPY", "USD/JPY", "JPY=X", "https://finance.yahoo.com/quote/JPY%3DX/history/"),
}


@dataclass(frozen=True)
class HistoricalDataset:
    asset: AssetDefinition
    frame: pd.DataFrame
    reference_start: str
    reference_end: str
    retrieval_timestamp: str
    provider: str
    frequency: str
    data_version: str


class YahooProvider:
    """Original AlphaBacktest data path, bounded for request-scoped execution."""

    name = "Yahoo Finance via pandas_datareader"
    frequency = "DAILY_SOURCE_REFERENCE"

    def fetch(self, asset_id: str, period_years: int) -> HistoricalDataset:
        if asset_id not in ASSETS:
            raise ValueError("Unsupported asset.")
        if period_years not in {1, 3, 5}:
            raise ValueError("Unsupported historical window.")

        asset = ASSETS[asset_id]
        retrieved_at = datetime.now(UTC)
        # AlphaBacktest requires 500 observations before the requested test period.
        fetch_start = (retrieved_at - timedelta(days=(period_years + 3) * 366)).date()
        fetch_end = (retrieved_at + timedelta(days=1)).date()
        provider = "Yahoo Finance via pandas_datareader"
        try:
            raw = pdr.get_data_yahoo(asset.yahoo_ticker, start=fetch_start, end=fetch_end)
        except Exception as original_provider_error:
            # pandas_datareader is the original AlphaBacktest path. Yahoo's current response
            # can break that legacy reader, so use a transparent compatibility fallback.
            try:
                raw = yf.download(asset.yahoo_ticker, start=fetch_start, end=fetch_end, interval="1d", auto_adjust=False, progress=False, threads=False)
                if isinstance(raw.columns, pd.MultiIndex):
                    raw.columns = raw.columns.get_level_values(0)
                provider = "Yahoo Finance via yfinance compatibility fallback"
            except Exception as fallback_error:
                raise RuntimeError("Yahoo Finance could not be retrieved through the original reader or compatibility fallback.") from fallback_error
        if raw.empty:
            raise RuntimeError("Yahoo Finance returned no historical observations.")

        required = ["Open", "High", "Low", "Close", "Volume"]
        if any(column not in raw.columns for column in required):
            raise RuntimeError("Yahoo Finance response does not contain required OHLCV columns.")

        frame = raw.loc[:, required].dropna().copy()
        frame.index = pd.to_datetime(frame.index).strftime("%Y-%m-%d")
        if frame.index.duplicated().any() or not frame.index.is_monotonic_increasing:
            raise RuntimeError("Yahoo Finance response has invalid reference-date ordering.")

        target_start = (retrieved_at - timedelta(days=period_years * 366)).date().isoformat()
        start_index = next((index for index, date in enumerate(frame.index) if date >= target_start), None)
        if start_index is None or start_index < 500:
            raise RuntimeError("Dataset does not contain the 500-observation warm-up required by AlphaBacktest.")

        selected = frame.iloc[:].astype(float)
        data_version = f"YAHOO:{asset.yahoo_ticker}:{selected.index[0]}:{selected.index[-1]}"
        return HistoricalDataset(
            asset=asset,
            frame=selected,
            reference_start=selected.index[start_index],
            reference_end=selected.index[-1],
            retrieval_timestamp=retrieved_at.isoformat(),
            provider=provider,
            frequency=self.frequency,
            data_version=data_version,
        )
