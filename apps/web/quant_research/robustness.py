"""Bounded robustness tools. They are resampling/sensitivity diagnostics, never forecasts."""

from __future__ import annotations

from dataclasses import replace
import math
import random

import numpy as np
import pandas as pd

from .analytics import closed_trade_pnl, result_metrics
from .contracts import ExecutionConfig, SimulationResult
from .dsl import SmaCrossoverDsl
from .engine import ExecutionSimulator
from .strategy import compile_sma_crossover


MAX_PARAMETER_VARIANTS = 12
MAX_MONTE_CARLO_ITERATIONS = 200


def temporal_oos_split(frame: pd.DataFrame, signals: list[int], *, oos_fraction: float = 0.25, censor_bars: int = 5) -> tuple[tuple[pd.DataFrame, list[int]], tuple[pd.DataFrame, list[int]], dict[str, object]]:
    if not 0.15 <= oos_fraction <= 0.4:
        raise ValueError("OOS fraction must be between 15% and 40%.")
    if not 1 <= censor_bars <= 20:
        raise ValueError("Censor gap must be between 1 and 20 source observations.")
    if len(frame) != len(signals) or len(frame) < 160:
        raise ValueError("Dataset is too short for the approved in-sample/OOS split.")
    oos_rows = max(60, math.floor(len(frame) * oos_fraction))
    in_sample_end = len(frame) - oos_rows - censor_bars
    if in_sample_end < 60:
        raise ValueError("Dataset is too short after applying the OOS censor gap.")
    in_sample = (frame.iloc[:in_sample_end].copy(), signals[:in_sample_end])
    oos = (frame.iloc[in_sample_end + censor_bars :].copy(), signals[in_sample_end + censor_bars :])
    return in_sample, oos, {
        "inSampleStart": frame.index[0].date().isoformat(),
        "inSampleEnd": frame.index[in_sample_end - 1].date().isoformat(),
        "censorStart": frame.index[in_sample_end].date().isoformat(),
        "censorEnd": frame.index[in_sample_end + censor_bars - 1].date().isoformat(),
        "oosStart": frame.index[in_sample_end + censor_bars].date().isoformat(),
        "oosEnd": frame.index[-1].date().isoformat(),
        "censorBars": censor_bars,
    }


def parameter_sensitivity(frame: pd.DataFrame, strategy: SmaCrossoverDsl, initial_capital: float) -> list[dict[str, object]]:
    candidate_pairs = [
        (strategy.fast_window, strategy.slow_window),
        (max(2, strategy.fast_window - 5), strategy.slow_window),
        (strategy.fast_window + 5, strategy.slow_window),
        (strategy.fast_window, max(strategy.fast_window + 1, strategy.slow_window - 10)),
        (strategy.fast_window, min(250, strategy.slow_window + 10)),
    ]
    unique_pairs = [(fast, slow) for fast, slow in dict.fromkeys(candidate_pairs) if 2 <= fast <= 100 and 5 <= slow <= 250 and fast < slow]
    rows: list[dict[str, object]] = []
    for fast, slow in unique_pairs[:MAX_PARAMETER_VARIANTS]:
        candidate = replace(strategy, fast_window=fast, slow_window=slow)
        result = ExecutionSimulator().run(frame, compile_sma_crossover(candidate, frame), candidate.execution_config(initial_capital))
        rows.append({"fastWindow": fast, "slowWindow": slow, "metrics": result_metrics(result)})
    return rows


def cost_sensitivity(frame: pd.DataFrame, signals: list[int], config: ExecutionConfig) -> list[dict[str, object]]:
    scenarios = [("BASE", config.fee_rate, config.slippage_rate), ("DOUBLE_COST", min(0.1, config.fee_rate * 2), min(0.1, config.slippage_rate * 2)), ("ZERO_COST_REFERENCE", 0.0, 0.0)]
    rows: list[dict[str, object]] = []
    for label, fee_rate, slippage_rate in scenarios:
        result = ExecutionSimulator().run(frame, signals, replace(config, fee_rate=fee_rate, slippage_rate=slippage_rate))
        rows.append({"scenario": label, "feesRate": fee_rate, "slippageRate": slippage_rate, "metrics": result_metrics(result)})
    return rows


def trade_order_monte_carlo(result: SimulationResult, *, iterations: int = 200, seed: int = 20260826) -> dict[str, object]:
    if not 1 <= iterations <= MAX_MONTE_CARLO_ITERATIONS:
        raise ValueError(f"Monte Carlo iterations must be between 1 and {MAX_MONTE_CARLO_ITERATIONS}.")
    trades = closed_trade_pnl(result)
    if not trades:
        return {"status": "BLOCKED", "reason": "No closed positions are available for trade-order resampling.", "iterations": 0, "seed": seed}
    rng = random.Random(seed)
    terminal_pnl = [sum(rng.choice(trades) for _ in trades) for _ in range(iterations)]
    return {
        "status": "COMPLETED",
        "method": "Trade-order resampling with replacement from closed simulated trades; this is not a forecast.",
        "iterations": iterations,
        "seed": seed,
        "closedTrades": len(trades),
        "terminalPnl": {"p05": float(np.percentile(terminal_pnl, 5)), "p50": float(np.percentile(terminal_pnl, 50)), "p95": float(np.percentile(terminal_pnl, 95))},
    }
