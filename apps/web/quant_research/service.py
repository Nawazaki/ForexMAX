"""Bounded run service joining validated DSL, datasets, execution, robustness and reporting."""

from __future__ import annotations

import pandas as pd

from .datasets import DatasetRegistry
from .dsl import parse_strategy
from .engine import ExecutionSimulator
from .plans import build_manual_research_plan
from .reports import build_research_report
from .robustness import cost_sensitivity, parameter_sensitivity, temporal_oos_split, trade_order_monte_carlo
from .strategy import compile_sma_crossover


def run_research(*, question: object, reviewed_plan_id: object, provider_id: object, period_years: object, capital: object, strategy_payload: object) -> dict[str, object]:
    if provider_id != "YAHOO_DAILY_RESEARCH":
        raise ValueError("Unsupported dataset provider.")
    if type(period_years) is not int or period_years not in {1, 3, 5}:
        raise ValueError("Unsupported historical period.")
    if type(capital) not in {int, float}:
        raise ValueError("Initial capital must be numeric.")
    strategy = parse_strategy(strategy_payload)
    config = strategy.execution_config(float(capital))
    config.validate()
    plan = build_manual_research_plan(question, strategy.asset)
    if reviewed_plan_id != plan.plan_id:
        raise ValueError("Run request does not match the reviewed research plan.")
    dataset = DatasetRegistry().fetch(provider_id=provider_id, asset_id=strategy.asset, period_years=period_years)
    evaluation_start = pd.Timestamp(dataset.evaluation_start)
    start_position = dataset.frame.index.get_loc(evaluation_start)
    if not isinstance(start_position, int):
        raise RuntimeError("Dataset evaluation window cannot be resolved safely.")
    full_signals = compile_sma_crossover(strategy, dataset.frame)
    frame = dataset.frame.iloc[start_position:].copy()
    signals = full_signals[start_position:]
    full_result = ExecutionSimulator().run(frame, signals, config)
    (in_frame, in_signals), (oos_frame, oos_signals), split = temporal_oos_split(frame, signals)
    in_sample = ExecutionSimulator().run(in_frame, in_signals, config)
    oos = ExecutionSimulator().run(oos_frame, oos_signals, config)
    return build_research_report(
        plan=plan,
        dataset=dataset,
        full_result=full_result,
        in_sample=in_sample,
        oos=oos,
        split=split,
        parameter_results=parameter_sensitivity(in_frame, strategy, float(capital)),
        cost_results=cost_sensitivity(in_frame, in_signals, config),
        monte_carlo=trade_order_monte_carlo(in_sample),
    )
