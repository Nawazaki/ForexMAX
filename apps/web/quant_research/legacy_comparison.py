"""Characterize, rather than conceal, differences between the modern engine and AlphaBacktest baseline."""

from __future__ import annotations

import json
import random

import pandas as pd

from alphabacktest_py.providers import YahooProvider
from alphabacktest_py.strategy import SmaCrossoverBacktest

from .analytics import result_metrics
from .datasets import DatasetRegistry
from .dsl import parse_strategy
from .engine import ExecutionSimulator
from .strategy import compile_sma_crossover


REQUEST = {"asset": "SP500", "periodYears": 1, "capital": 20_000.0, "fees": 0.00005, "slippage": 0.0001, "leverage": 1.0, "units": 1, "fast": 20, "slow": 60}


def _strategy_payload() -> dict[str, object]:
    return {
        "schemaVersion": "1", "strategyType": "SMA_CROSSOVER", "asset": REQUEST["asset"], "frequency": "DAILY_SOURCE_REFERENCE",
        "indicators": {"fastSmaWindow": REQUEST["fast"], "slowSmaWindow": REQUEST["slow"]},
        "entry": {"rule": "FAST_ABOVE_SLOW_LONG__FAST_BELOW_SLOW_SHORT"}, "exit": {"rule": "SIGNAL_FLIP"},
        "positionSizing": {"type": "FIXED_UNITS", "units": REQUEST["units"]},
        "execution": {"feesRate": REQUEST["fees"], "slippageRate": REQUEST["slippage"], "leverage": REQUEST["leverage"]},
    }


def characterize_modern_delta() -> dict[str, object]:
    """Run both engines against their current Yahoo adapters and expose the accounting comparison.

    This function intentionally does not assert equality: the typed modern engine has
    documented ledger/accounting changes and must not inherit the older integration's
    exact-match claim without a dedicated behavior-parity implementation.
    """
    legacy_dataset = YahooProvider().fetch(REQUEST["asset"], REQUEST["periodYears"])
    random.seed(20260826)
    legacy = SmaCrossoverBacktest(
        asset_label=legacy_dataset.asset.label, data=legacy_dataset.frame, initial_time=legacy_dataset.reference_start,
        fast_window=REQUEST["fast"], slow_window=REQUEST["slow"], position_size=REQUEST["units"],
        slippage=REQUEST["slippage"], leverage=REQUEST["leverage"], fees=REQUEST["fees"], capital=REQUEST["capital"],
    )

    dataset = DatasetRegistry().fetch(provider_id="YAHOO_DAILY_RESEARCH", asset_id=REQUEST["asset"], period_years=REQUEST["periodYears"])
    strategy = parse_strategy(_strategy_payload())
    start = dataset.frame.index.get_loc(pd.Timestamp(dataset.evaluation_start))
    if not isinstance(start, int):
        raise RuntimeError("Modern evaluation start could not be resolved safely.")
    frame = dataset.frame.iloc[start:]
    signals = compile_sma_crossover(strategy, dataset.frame)[start:]
    modern = ExecutionSimulator().run(frame, signals, strategy.execution_config(REQUEST["capital"]))
    modern_metrics = result_metrics(modern)

    legacy_value = float(legacy.total_value)
    modern_value = float(modern_metrics["portfolioValue"] or 0.0)
    legacy_fees = float(legacy.costs_fees)
    modern_fees = float(modern_metrics["feesPaid"])
    return {
        "status": "DOCUMENTED_DELTA",
        "legacy": {"engine": "AlphaBacktest 1.0.0", "dataset": legacy_dataset.data_version, "referencePeriod": [legacy_dataset.reference_start, legacy_dataset.reference_end], "orders": int(legacy.orders.shape[0]), "trades": int(legacy.trades.shape[0]), "closedPositions": int(legacy.closed_positions.shape[0]), "portfolioValue": legacy_value, "feesPaid": legacy_fees},
        "modern": {"engine": modern.engine_version, "dataset": dataset.reference.version, "referencePeriod": [dataset.evaluation_start, dataset.reference.coverage_end], "orders": len(modern.orders), "fills": len(modern.fills), "closedPositions": int(modern_metrics["closedPositions"]), "portfolioValue": modern_value, "feesPaid": modern_fees},
        "differences": {
            "portfolioValue": modern_value - legacy_value,
            "feesPaid": modern_fees - legacy_fees,
            "reason": "The modern engine uses explicit cash, margin, fill and typed-position records, whereas AlphaBacktest updates free balance, asset value, on-hold collateral and borrowed-book balances through its legacy portfolio implementation. Exact accounting parity is not asserted while the modern accounting-parity work remains unfinished.",
        },
        "baselineIntegrity": "The separate original-vs-wrapper regression harness remains the MATCHED fidelity proof for the preserved AlphaBacktest execution path.",
    }


if __name__ == "__main__":
    print(json.dumps(characterize_modern_delta(), sort_keys=True))
