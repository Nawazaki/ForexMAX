"""Dataset quality checks that block unsafe research runs instead of repairing data silently."""

from __future__ import annotations

import pandas as pd

from .contracts import QualityReport


REQUIRED_OHLCV = ("Open", "High", "Low", "Close", "Volume")


def validate_daily_ohlcv(frame: pd.DataFrame, *, warmup_observations: int, required_test_observations: int = 60) -> QualityReport:
    checks: list[str] = []
    failures: list[str] = []

    if not isinstance(frame.index, pd.DatetimeIndex):
        failures.append("Reference index must be a DatetimeIndex.")
    else:
        if frame.index.tz is not None:
            failures.append("Daily source references must be normalized to a timezone-free provider date index.")
        if frame.index.has_duplicates:
            failures.append("Reference dates contain duplicates.")
        if not frame.index.is_monotonic_increasing:
            failures.append("Reference dates are not strictly increasing.")
        if frame.index.isna().any():
            failures.append("Reference dates contain null values.")
        checks.append("reference_date_order")

    missing_columns = [column for column in REQUIRED_OHLCV if column not in frame.columns]
    if missing_columns:
        failures.append(f"Missing required OHLCV fields: {', '.join(missing_columns)}.")
    else:
        numeric = frame.loc[:, REQUIRED_OHLCV].apply(pd.to_numeric, errors="coerce")
        if numeric.isna().any().any():
            failures.append("OHLCV contains missing or non-numeric observations.")
        if (numeric[["Open", "High", "Low", "Close"]] <= 0).any().any():
            failures.append("OHLC prices must be positive.")
        if (numeric["Volume"] < 0).any():
            failures.append("Volume cannot be negative.")
        if (numeric["High"] < numeric[["Open", "Close", "Low"]].max(axis=1)).any():
            failures.append("High is below an open, close or low value.")
        if (numeric["Low"] > numeric[["Open", "Close", "High"]].min(axis=1)).any():
            failures.append("Low is above an open, close or high value.")
        checks.append("ohlcv_integrity")

    minimum_rows = warmup_observations + required_test_observations + 1
    if len(frame) < minimum_rows:
        failures.append(f"Dataset requires at least {minimum_rows} rows for warm-up, a test window and next-period execution.")
    checks.append("coverage_and_warmup")

    return QualityReport(
        status="BLOCKED" if failures else "PASSED",
        checks=tuple(checks),
        failures=tuple(failures),
        row_count=len(frame),
        warmup_observations=warmup_observations,
    )
