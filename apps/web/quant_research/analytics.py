"""Historical run analytics. Metrics describe only the supplied simulation ledger."""

from __future__ import annotations

from .contracts import SimulationResult


def result_metrics(result: SimulationResult) -> dict[str, float | int | None]:
    equity = [point.portfolio_value for point in result.equity_curve]
    if not equity:
        return {"portfolioValue": None, "portfolioReturnPct": None, "maxDrawdownPct": None, "orders": 0, "fills": 0, "closedPositions": 0, "openPositions": 0, "feesPaid": 0.0}
    running_peak = equity[0]
    max_drawdown = 0.0
    for value in equity:
        running_peak = max(running_peak, value)
        max_drawdown = min(max_drawdown, ((value / running_peak) - 1) * 100 if running_peak else 0.0)
    closed = [position for position in result.positions if position.exit_date is not None]
    fees = sum(fill.fee for fill in result.fills)
    return {
        "portfolioValue": equity[-1],
        "portfolioReturnPct": ((equity[-1] / result.configuration.initial_capital) - 1) * 100,
        "maxDrawdownPct": max_drawdown,
        "orders": len(result.orders),
        "fills": len(result.fills),
        "closedPositions": len(closed),
        "openPositions": len(result.positions) - len(closed),
        "feesPaid": fees,
    }


def closed_trade_pnl(result: SimulationResult) -> list[float]:
    return [float(position.realized_pnl) for position in result.positions if position.realized_pnl is not None]
