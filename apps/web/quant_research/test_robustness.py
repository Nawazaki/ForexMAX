"""Deterministic safety tests for bounded research robustness diagnostics."""

from __future__ import annotations

import unittest

import numpy as np
import pandas as pd

from .contracts import ExecutionConfig
from .engine import ExecutionSimulator
from .robustness import temporal_oos_split, trade_order_monte_carlo


def fixture_frame(rows: int = 200) -> pd.DataFrame:
    index = pd.date_range("2023-01-02", periods=rows, freq="B")
    close = 100 + np.sin(np.arange(rows) / 4) * 10 + np.arange(rows) * 0.05
    return pd.DataFrame({"Open": close - 0.2, "High": close + 1, "Low": close - 1, "Close": close, "Volume": np.full(rows, 1000.0)}, index=index)


class RobustnessTest(unittest.TestCase):
    def test_oos_split_has_non_overlapping_censor_gap(self) -> None:
        frame = fixture_frame()
        in_sample, oos, metadata = temporal_oos_split(frame, [1] * len(frame), oos_fraction=0.25, censor_bars=5)
        self.assertLess(in_sample[0].index[-1], oos[0].index[0])
        self.assertEqual(metadata["censorBars"], 5)

    def test_monte_carlo_is_deterministic_for_seed(self) -> None:
        frame = fixture_frame(rows=20)
        signals = [1] * 7 + [-1] * 7 + [1] * 6
        result = ExecutionSimulator().run(frame, signals, ExecutionConfig(20_000, 1, 0.0, 0.0, 1.0))
        first = trade_order_monte_carlo(result, iterations=20, seed=11)
        second = trade_order_monte_carlo(result, iterations=20, seed=11)
        self.assertEqual(first, second)


if __name__ == "__main__":
    unittest.main()
