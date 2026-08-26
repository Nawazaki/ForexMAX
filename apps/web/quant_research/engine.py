"""Deterministic single-asset execution simulator with next-reference-open fills."""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

import pandas as pd

from .contracts import EquityPoint, ExecutionConfig, FillRecord, OrderRecord, PositionRecord, SimulationResult


class ExecutionSimulator:
    """A bounded research simulator. Signals are evaluated at close and fill at the next open."""

    version = "FOREXMAX_QUANT_ENGINE_0.1"

    def run(self, frame: pd.DataFrame, signals: list[int], config: ExecutionConfig) -> SimulationResult:
        config.validate()
        if len(frame) != len(signals):
            raise ValueError("Signal series must align exactly with the reference dataset.")
        if len(frame) < 2:
            raise ValueError("A simulation requires at least two reference observations.")

        cash = config.initial_capital
        margin_locked = 0.0
        position_side = 0
        position: PositionRecord | None = None
        pending: tuple[str, int, str] | None = None
        orders: list[OrderRecord] = []
        fills: list[FillRecord] = []
        positions: list[PositionRecord] = []
        equity: list[EquityPoint] = []
        sequence = 0

        def identifier(prefix: str) -> str:
            nonlocal sequence
            sequence += 1
            return f"{prefix}-{sequence:06d}"

        def mark_price(row: pd.Series) -> float:
            return float(row["Close"])

        for index, (reference_date, row) in enumerate(frame.iterrows()):
            date = pd.Timestamp(reference_date).date().isoformat()
            open_price = float(row["Open"])

            if pending is not None:
                action, desired_side, order_id = pending
                if action == "OPEN":
                    fill_price = open_price * (1 + config.slippage_rate if desired_side > 0 else 1 - config.slippage_rate)
                    notional = abs(config.fixed_units * fill_price)
                    required_margin = notional / config.leverage
                    entry_fee = notional * config.fee_rate
                    if cash >= required_margin + entry_fee:
                        cash -= required_margin + entry_fee
                        margin_locked = required_margin
                        side = "LONG" if desired_side > 0 else "SHORT"
                        position = PositionRecord(
                            position_id=identifier("position"), side=side, entry_date=date, entry_price=fill_price,
                            exit_date=None, exit_price=None, units=config.fixed_units, realized_pnl=None, total_fees=entry_fee,
                        )
                        position_side = desired_side
                        orders[-1] = replace(orders[-1], status="FILLED")
                        fills.append(FillRecord(identifier("fill"), order_id, date, "BUY" if desired_side > 0 else "SELL", config.fixed_units, fill_price, entry_fee))
                    else:
                        orders[-1] = replace(orders[-1], status="REJECTED", reason="Insufficient free cash for initial margin and fee.")
                elif action == "CLOSE" and position is not None:
                    fill_price = open_price * (1 - config.slippage_rate if position_side > 0 else 1 + config.slippage_rate)
                    gross_pnl = (fill_price - position.entry_price) * config.fixed_units * position_side
                    exit_fee = abs(config.fixed_units * fill_price) * config.fee_rate
                    cash += margin_locked + gross_pnl - exit_fee
                    closed = replace(position, exit_date=date, exit_price=fill_price, realized_pnl=gross_pnl - position.total_fees - exit_fee, total_fees=position.total_fees + exit_fee)
                    positions.append(closed)
                    position = None
                    position_side = 0
                    margin_locked = 0.0
                    orders[-1] = replace(orders[-1], status="FILLED")
                    fills.append(FillRecord(identifier("fill"), order_id, date, "CLOSE", config.fixed_units, fill_price, exit_fee))
                pending = None

            close_price = mark_price(row)
            unrealized = 0.0 if position is None else (close_price - position.entry_price) * config.fixed_units * position_side
            equity.append(EquityPoint(date, cash, margin_locked, unrealized, cash + margin_locked + unrealized))

            # Signals are passed in as information known no later than this bar's close.
            # The corresponding order is queued for a later reference-period open only.
            desired_side = signals[index]
            if index == len(frame) - 1 or desired_side not in {-1, 0, 1}:
                continue
            if position is None and desired_side != 0:
                order_id = identifier("order")
                orders.append(OrderRecord(order_id, date, "BUY" if desired_side > 0 else "SELL", config.fixed_units, "QUEUED"))
                pending = ("OPEN", desired_side, order_id)
            elif position is not None and desired_side != 0 and desired_side != position_side:
                order_id = identifier("order")
                orders.append(OrderRecord(order_id, date, "CLOSE", config.fixed_units, "QUEUED"))
                pending = ("CLOSE", 0, order_id)

        if position is not None:
            positions.append(position)
        return SimulationResult(
            engine_version=self.version,
            created_at=datetime.now(UTC).isoformat(),
            configuration=config,
            orders=tuple(orders),
            fills=tuple(fills),
            positions=tuple(positions),
            equity_curve=tuple(equity),
            assumptions=(
                "A signal is generated from information available at the reference close and fills no earlier than the next reference open.",
                "The initial engine supports one single-asset long or short position with fixed units.",
                "Fees and slippage are deterministic percentage assumptions, not executable broker quotes.",
            ),
        )
