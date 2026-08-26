"""Server-side research-run contract tests that do not call a market-data provider."""

from __future__ import annotations

import unittest

from .service import run_research


def valid_dsl() -> dict[str, object]:
    return {
        "schemaVersion": "1", "strategyType": "SMA_CROSSOVER", "asset": "SP500", "frequency": "DAILY_SOURCE_REFERENCE",
        "indicators": {"fastSmaWindow": 20, "slowSmaWindow": 60},
        "entry": {"rule": "FAST_ABOVE_SLOW_LONG__FAST_BELOW_SLOW_SHORT"}, "exit": {"rule": "SIGNAL_FLIP"},
        "positionSizing": {"type": "FIXED_UNITS", "units": 1},
        "execution": {"feesRate": 0.00005, "slippageRate": 0.0001, "leverage": 1},
    }


class ResearchRunContractTest(unittest.TestCase):
    def test_rejects_run_that_does_not_match_reviewed_plan_before_provider_fetch(self) -> None:
        with self.assertRaisesRegex(ValueError, "does not match the reviewed research plan"):
            run_research(
                question="Evaluate a constrained S&P 500 method.", reviewed_plan_id="manual-wrong", provider_id="YAHOO_DAILY_RESEARCH",
                period_years=1, capital=20_000, strategy_payload=valid_dsl(),
            )


if __name__ == "__main__":
    unittest.main()
