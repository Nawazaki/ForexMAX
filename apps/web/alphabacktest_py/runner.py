"""Validated execution boundary for the original AlphaBacktest engine."""

from __future__ import annotations

import random
from dataclasses import asdict, dataclass

from .providers import ASSETS, YahooProvider
from .serialization import result_payload
from .strategy import SmaCrossoverBacktest


@dataclass(frozen=True)
class BacktestRequest:
    asset: str
    strategy: str
    periodYears: int
    fastWindow: int
    slowWindow: int
    positionSize: int
    capital: float
    fees: float
    slippage: float
    leverage: float


ALLOWED_KEYS = set(BacktestRequest.__annotations__.keys())


def validate_request(payload: object) -> BacktestRequest:
    if not isinstance(payload, dict) or set(payload) != ALLOWED_KEYS:
        raise ValueError("Request fields do not match the approved AlphaBacktest contract.")
    request = BacktestRequest(**payload)
    if request.asset not in ASSETS:
        raise ValueError("Unsupported asset.")
    if request.strategy != "SMA_CROSSOVER":
        raise ValueError("Unsupported strategy.")
    if request.periodYears not in {1, 3, 5}:
        raise ValueError("Unsupported historical period.")
    if not (2 <= request.fastWindow <= 100 and 5 <= request.slowWindow <= 250 and request.fastWindow < request.slowWindow):
        raise ValueError("Invalid SMA windows.")
    if not (1 <= request.positionSize <= 10_000):
        raise ValueError("Invalid position size.")
    if not (1_000 <= request.capital <= 10_000_000):
        raise ValueError("Invalid capital.")
    if not (0 <= request.fees <= 0.1 and 0 <= request.slippage <= 0.1 and 1 <= request.leverage <= 20):
        raise ValueError("Invalid cost or leverage setting.")
    return request


def capabilities() -> dict[str, object]:
    return {
        "engine": "AlphaBacktest 1.0.0",
        "execution": "PRESERVED_PYTHON_ENGINE",
        "strategies": [{"id": "SMA_CROSSOVER", "label": "SMA crossover wrapper strategy"}],
        "assets": [{"id": item.id, "label": item.label, "provider": "Yahoo Finance via pandas_datareader"} for item in ASSETS.values()],
        "originalIndicators": ["SMA", "EMA", "RSI", "Bollinger Bands", "MACD"],
        "activeIndicators": [],
        "researchMode": {"status": "BLOCKED", "reason": "Verified event timestamp and information-cutoff provenance are not connected."},
    }


def run_request(payload: object) -> dict[str, object]:
    request = validate_request(payload)
    dataset = YahooProvider().fetch(request.asset, request.periodYears)
    # The original engine generates random position/order IDs. Seeding only makes regression comparisons repeatable.
    random.seed(20260826)
    engine = SmaCrossoverBacktest(
        asset_label=dataset.asset.label,
        data=dataset.frame,
        initial_time=dataset.reference_start,
        fast_window=request.fastWindow,
        slow_window=request.slowWindow,
        position_size=request.positionSize,
        slippage=request.slippage,
        leverage=request.leverage,
        fees=request.fees,
        capital=request.capital,
    )
    return result_payload(engine, dataset, asdict(request))
