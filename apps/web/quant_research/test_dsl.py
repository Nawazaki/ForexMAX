"""Validation and no-code-execution tests for the Strategy DSL compiler."""

from __future__ import annotations

import unittest

import pandas as pd

from .dsl import parse_strategy
from .strategy import compile_sma_crossover


def valid_dsl() -> dict[str, object]:
    return {
        "schemaVersion": "1",
        "strategyType": "SMA_CROSSOVER",
        "asset": "SP500",
        "frequency": "DAILY_SOURCE_REFERENCE",
        "indicators": {"fastSmaWindow": 2, "slowSmaWindow": 5},
        "entry": {"rule": "FAST_ABOVE_SLOW_LONG__FAST_BELOW_SLOW_SHORT"},
        "exit": {"rule": "SIGNAL_FLIP"},
        "positionSizing": {"type": "FIXED_UNITS", "units": 1},
        "execution": {"feesRate": 0.00005, "slippageRate": 0.0001, "leverage": 1},
    }


class StrategyDslTest(unittest.TestCase):
    def test_rejects_unknown_fields_rather_than_accepting_code(self) -> None:
        candidate = valid_dsl()
        candidate["python"] = "__import__('os').system('bad')"
        with self.assertRaises(ValueError):
            parse_strategy(candidate)

    def test_compiler_waits_for_full_sma_warmup(self) -> None:
        strategy = parse_strategy(valid_dsl())
        frame = pd.DataFrame({"Close": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0]})
        signals = compile_sma_crossover(strategy, frame)
        self.assertEqual(signals[:4], [0, 0, 0, 0])
        self.assertEqual(signals[4:], [1, 1, 1])

    def test_rejects_unapproved_entry_semantics(self) -> None:
        candidate = valid_dsl()
        candidate["entry"] = {"rule": "eval(user_expression)"}
        with self.assertRaises(ValueError):
            parse_strategy(candidate)


if __name__ == "__main__":
    unittest.main()
