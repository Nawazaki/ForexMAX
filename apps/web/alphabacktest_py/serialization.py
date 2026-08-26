"""JSON serialization for objects produced by the preserved AlphaBacktest engine."""

from __future__ import annotations

from math import isfinite

import pandas as pd


def finite_number(value: object) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if isfinite(number) else None


def dataframe_records(frame: pd.DataFrame) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for index, row in frame.iterrows():
        record: dict[str, object] = {"id": str(index)}
        for key, value in row.items():
            record[str(key)] = finite_number(value) if isinstance(value, (int, float)) else str(value)
        records.append(record)
    return records


def result_payload(engine, dataset, request: dict[str, object]) -> dict[str, object]:
    pnl_history = engine.pnl_history.copy()
    pnl_history["PNL"] = pd.to_numeric(pnl_history["PNL"], errors="coerce").fillna(0.0)
    equity = request["capital"] * (1 + pnl_history["PNL"] / 100)
    peak = equity.cummax()
    drawdown = ((equity / peak) - 1) * 100
    positions = pd.concat([engine.closed_positions, engine.user_positions])

    return {
        "status": "COMPLETED",
        "engine": {
            "name": "AlphaBacktest",
            "version": "1.0.0",
            "execution": "PRESERVED_PYTHON_ENGINE",
            "license": "MIT",
            "sourcePreserved": True,
        },
        "dataset": {
            "provider": dataset.provider,
            "sourceUrl": dataset.asset.source_url,
            "symbol": dataset.asset.yahoo_ticker,
            "label": dataset.asset.label,
            "frequency": dataset.frequency,
            "referencePeriodStart": dataset.reference_start,
            "referencePeriodEnd": dataset.reference_end,
            "retrievedAt": dataset.retrieval_timestamp,
            "dataVersion": dataset.data_version,
            "adjustment": "YAHOO_RETURNED_OHLCV_REFERENCE_SERIES",
        },
        "configuration": request,
        "metrics": {
            "portfolioValue": finite_number(engine.total_value),
            "portfolioPnlPct": finite_number(pnl_history["PNL"].iloc[-1]) if not pnl_history.empty else 0.0,
            "maxDrawdownPct": finite_number(drawdown.min()) if not drawdown.empty else 0.0,
            "feesPaid": finite_number(engine.costs_fees),
            "orders": int(engine.orders.shape[0]),
            "executedTrades": int(engine.trades.shape[0]),
            "closedPositions": int(engine.closed_positions.shape[0]),
            "openPositions": int(engine.user_positions.shape[0]),
        },
        "equityCurve": [
            {"referenceDate": str(index), "portfolioPnlPct": finite_number(value), "portfolioValue": finite_number(request["capital"] * (1 + value / 100))}
            for index, value in pnl_history["PNL"].items()
        ],
        "orders": dataframe_records(engine.orders),
        "trades": dataframe_records(engine.trades),
        "positions": dataframe_records(positions),
        "assumptions": [
            "The preserved AlphaBacktest broker delays an order to the following source period for execution.",
            "Prices are Yahoo-returned daily OHLCV reference observations, not broker executable quotes or live prices.",
            "Slippage, leverage and fee values are passed directly to the preserved AlphaBacktest engine.",
            "The wrapper disables optional TA-Lib indicator calculation; the source code remains preserved while native dependency compatibility is unverified.",
        ],
        "limitations": [
            "Historical simulation results are not forecasts, trade signals or evidence of future performance.",
            "Yahoo Finance availability, adjustment policy and historical revisions are controlled by the provider.",
            "The original engine is single-asset and its README lists multi-asset support as future work.",
        ],
    }
