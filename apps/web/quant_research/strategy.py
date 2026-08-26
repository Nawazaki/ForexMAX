"""Approved deterministic strategy compiler for the first Strategy DSL version."""

from __future__ import annotations

import pandas as pd

from .dsl import SmaCrossoverDsl


def compile_sma_crossover(strategy: SmaCrossoverDsl, frame: pd.DataFrame) -> list[int]:
    """Return close-known regime signals; simulator delays execution to the next open."""
    if "Close" not in frame.columns:
        raise ValueError("Dataset lacks Close observations required for SMA strategy compilation.")
    close = pd.to_numeric(frame["Close"], errors="coerce")
    if close.isna().any():
        raise ValueError("Dataset contains invalid Close observations.")
    fast = close.rolling(window=strategy.fast_window, min_periods=strategy.fast_window).mean()
    slow = close.rolling(window=strategy.slow_window, min_periods=strategy.slow_window).mean()
    signals: list[int] = []
    for fast_value, slow_value in zip(fast, slow, strict=True):
        if pd.isna(fast_value) or pd.isna(slow_value) or fast_value == slow_value:
            signals.append(0)
        elif fast_value > slow_value:
            signals.append(1)
        else:
            signals.append(-1)
    return signals
