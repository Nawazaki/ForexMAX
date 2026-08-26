"""Characterization tests for the modern research data and execution primitives."""

from __future__ import annotations

import unittest

import numpy as np
import pandas as pd

from .contracts import ExecutionConfig
from .engine import ExecutionSimulator
from .quality import validate_daily_ohlcv


def fixture_frame(rows: int = 565) -> pd.DataFrame:
    index = pd.date_range("2023-01-02", periods=rows, freq="B")
    close = np.linspace(100.0, 140.0, rows)
    return pd.DataFrame({"Open": close - 0.5, "High": close + 1, "Low": close - 1, "Close": close, "Volume": np.full(rows, 1000.0)}, index=index)


class QualityGateTest(unittest.TestCase):
    def test_accepts_ordered_complete_daily_ohlcv(self) -> None:
        report = validate_daily_ohlcv(fixture_frame(), warmup_observations=500)
        self.assertEqual(report.status, "PASSED")

    def test_rejects_duplicate_reference_dates(self) -> None:
        frame = fixture_frame()
        frame.index = frame.index.where(frame.index != frame.index[1], frame.index[0])
        report = validate_daily_ohlcv(frame, warmup_observations=500)
        self.assertEqual(report.status, "BLOCKED")
        self.assertTrue(any("duplicates" in failure for failure in report.failures))


class ExecutionSimulatorTest(unittest.TestCase):
    def test_queues_signal_to_next_open_without_lookahead_fill(self) -> None:
        frame = fixture_frame(rows=6)
        signals = [0, 1, 1, -1, -1, 0]
        result = ExecutionSimulator().run(frame, signals, ExecutionConfig(20_000, 1, 0.0, 0.0, 1.0))
        self.assertEqual(result.orders[0].reference_date, "2023-01-03")
        self.assertEqual(result.fills[0].reference_date, "2023-01-04")
        self.assertEqual(result.fills[0].price, float(frame.iloc[2]["Open"]))

    def test_rejects_invalid_execution_configuration(self) -> None:
        with self.assertRaises(ValueError):
            ExecutionSimulator().run(fixture_frame(rows=6), [0] * 6, ExecutionConfig(99.0, 1, 0.0, 0.0, 1.0))


if __name__ == "__main__":
    unittest.main()
