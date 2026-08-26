"""Serialization for source-aware Quant Research reports."""

from __future__ import annotations

from dataclasses import asdict

from .analytics import result_metrics
from .contracts import Dataset, SimulationResult
from .plans import ResearchPlan


def serialize_result(result: SimulationResult) -> dict[str, object]:
    return {
        "engineVersion": result.engine_version,
        "createdAt": result.created_at,
        "configuration": asdict(result.configuration),
        "metrics": result_metrics(result),
        "equityCurve": [asdict(point) for point in result.equity_curve],
        "orders": [asdict(order) for order in result.orders],
        "fills": [asdict(fill) for fill in result.fills],
        "positions": [asdict(position) for position in result.positions],
        "assumptions": list(result.assumptions),
    }


def build_research_report(*, plan: ResearchPlan, dataset: Dataset, full_result: SimulationResult, in_sample: SimulationResult, oos: SimulationResult, split: dict[str, object], parameter_results: list[dict[str, object]], cost_results: list[dict[str, object]], monte_carlo: dict[str, object]) -> dict[str, object]:
    return {
        "status": "COMPLETED",
        "researchPlan": plan.serialize(),
        "engine": {
            "name": "ForexMax Quant Research Engine",
            "version": full_result.engine_version,
            "execution": "MODERN_TYPED_SINGLE_ASSET_ENGINE",
            "baseline": {
                "name": "AlphaBacktest",
                "version": "1.0.0",
                "role": "PRESERVED_FIDELITY_REFERENCE",
                "license": "MIT",
            },
        },
        "dataset": {**asdict(dataset.reference), "quality": asdict(dataset.quality), "evaluationStart": dataset.evaluation_start},
        "timeSplit": split,
        "baseRun": serialize_result(full_result),
        "inSample": serialize_result(in_sample),
        "outOfSample": serialize_result(oos),
        "robustness": {
            "parameterSensitivity": parameter_results,
            "costSensitivity": cost_results,
            "tradeOrderMonteCarlo": monte_carlo,
        },
        "methodology": [
            "Signals use the available source-reference close; orders are filled no earlier than the next source-reference open.",
            "Out-of-sample results are separated by a source-observation censor gap and are reported as historical diagnostics only.",
            "Monte Carlo resamples closed simulated trade PnL and is not a probability forecast or expected return estimate.",
        ],
        "limitations": [
            *dataset.reference.limitations,
            "This research report is not personalized investment advice, a trading signal, a guarantee or an execution service.",
            "The active engine is single-asset daily historical research only; no intraday, multi-asset, event-study or live-market capability is active.",
            "Research run persistence, user audit retention and strategy memory remain unavailable until an isolated authorized storage design exists.",
        ],
    }
