"""Original-vs-integrated regression check for the preserved AlphaBacktest engine."""

from __future__ import annotations

import json
import random
from typing import Any

import numpy as np
import pandas as pd

from .compat import apply_pandas_append_compatibility
from .providers import YahooProvider
from .strategy import SmaCrossoverBacktest

apply_pandas_append_compatibility()
from .vendor import Backtest


REQUEST: dict[str, Any] = {
    "asset": "SP500",
    "strategy": "SMA_CROSSOVER",
    "periodYears": 1,
    "fastWindow": 20,
    "slowWindow": 60,
    "positionSize": 1,
    "capital": 20_000.0,
    "fees": 0.00005,
    "slippage": 0.0001,
    "leverage": 1.0,
}


class DirectOriginalSmaCrossover(Backtest):
    """A direct subclass of the preserved upstream `Backtest` public API."""

    def __init__(self, *, data: pd.DataFrame, initial_time: str):
        super().__init__(
            sym="S&P 500 index",
            initial_time=initial_time,
            final_time="last",
            dateformat="%Y-%m-%d",
            ticker=None,
            indicators=False,
            slippage=REQUEST["slippage"],
            leverage=REQUEST["leverage"],
            fees=REQUEST["fees"],
            capital=REQUEST["capital"],
            save_results=False,
            plot_results=False,
            data=data,
        )

    def strategy(self, _open, close, high, low, vol, dtime):
        fast = sum(close[-REQUEST["fastWindow"]:]) / REQUEST["fastWindow"]
        slow = sum(close[-REQUEST["slowWindow"]:]) / REQUEST["slowWindow"]
        desired_side = "LONG" if fast > slow else "SHORT" if fast < slow else None
        if desired_side is None:
            return
        if not self.has_positions():
            if desired_side == "LONG":
                self.long_order(self.symbol, REQUEST["positionSize"], dtime, close[-1])
            else:
                self.short_order(self.symbol, REQUEST["positionSize"], dtime, close[-1])
            return
        position_id = self.user_positions.index[0]
        current_side = "LONG" if float(self.user_positions.loc[position_id, "Amount"]) > 0 else "SHORT"
        if current_side != desired_side:
            self.closing_order(position_id, dtime, close[-1])


def _assert_frame_equal(name: str, original: pd.DataFrame, integrated: pd.DataFrame, tolerance: float) -> None:
    if original.columns.tolist() != integrated.columns.tolist() or original.shape != integrated.shape:
        raise AssertionError(f"{name}: schema or row count differs.")
    for column in original.columns:
        first = original[column].reset_index(drop=True)
        second = integrated[column].reset_index(drop=True)
        if pd.api.types.is_numeric_dtype(first):
            if not np.allclose(first.astype(float), second.astype(float), rtol=tolerance, atol=tolerance, equal_nan=True):
                raise AssertionError(f"{name}.{column}: numeric values differ.")
        elif first.astype(str).tolist() != second.astype(str).tolist():
            raise AssertionError(f"{name}.{column}: values differ.")


def run_regression() -> dict[str, object]:
    dataset = YahooProvider().fetch(REQUEST["asset"], REQUEST["periodYears"])

    random.seed(20260826)
    original = DirectOriginalSmaCrossover(data=dataset.frame, initial_time=dataset.reference_start)
    random.seed(20260826)
    integrated = SmaCrossoverBacktest(
        asset_label=dataset.asset.label,
        data=dataset.frame,
        initial_time=dataset.reference_start,
        fast_window=REQUEST["fastWindow"],
        slow_window=REQUEST["slowWindow"],
        position_size=REQUEST["positionSize"],
        slippage=REQUEST["slippage"],
        leverage=REQUEST["leverage"],
        fees=REQUEST["fees"],
        capital=REQUEST["capital"],
    )

    tolerance = 1e-9
    _assert_frame_equal("orders", original.orders, integrated.orders, tolerance)
    _assert_frame_equal("trades", original.trades, integrated.trades, tolerance)
    _assert_frame_equal("closed_positions", original.closed_positions, integrated.closed_positions, tolerance)
    _assert_frame_equal("pnl_history", original.pnl_history, integrated.pnl_history, tolerance)
    if not np.isclose(original.total_value, integrated.total_value, rtol=tolerance, atol=tolerance):
        raise AssertionError("portfolio value differs.")
    if not np.isclose(original.costs_fees, integrated.costs_fees, rtol=tolerance, atol=tolerance):
        raise AssertionError("fees differ.")

    return {
        "status": "MATCHED",
        "tolerance": tolerance,
        "dataset": dataset.data_version,
        "referencePeriod": [dataset.reference_start, dataset.reference_end],
        "orders": int(original.orders.shape[0]),
        "trades": int(original.trades.shape[0]),
        "closedPositions": int(original.closed_positions.shape[0]),
        "portfolioValue": float(original.total_value),
        "feesPaid": float(original.costs_fees),
    }


if __name__ == "__main__":
    print(json.dumps(run_regression(), sort_keys=True))
