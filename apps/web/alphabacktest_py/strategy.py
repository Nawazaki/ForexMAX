"""Defined strategy wrappers that use original AlphaBacktest classes and order flow."""

from __future__ import annotations

from .compat import apply_execution_compatibility, apply_pandas_append_compatibility

apply_pandas_append_compatibility()
apply_execution_compatibility()

from .vendor import Backtest


class SmaCrossoverBacktest(Backtest):
    """A constrained strategy callback layered on the original Backtest class."""

    def __init__(self, *, asset_label: str, data, initial_time: str, fast_window: int, slow_window: int, position_size: int, slippage: float, leverage: float, fees: float, capital: float):
        self.fast_window = fast_window
        self.slow_window = slow_window
        self.position_size = position_size
        super().__init__(
            sym=asset_label,
            initial_time=initial_time,
            final_time="last",
            dateformat="%Y-%m-%d",
            ticker=None,
            indicators=False,
            slippage=slippage,
            leverage=leverage,
            fees=fees,
            capital=capital,
            save_results=False,
            plot_results=False,
            data=data,
        )

    def strategy(self, _open, close, high, low, vol, dtime):
        if len(close) < self.slow_window:
            return
        fast = sum(close[-self.fast_window:]) / self.fast_window
        slow = sum(close[-self.slow_window:]) / self.slow_window
        desired_side = "LONG" if fast > slow else "SHORT" if fast < slow else None
        if desired_side is None:
            return

        if not self.has_positions():
            if desired_side == "LONG":
                self.long_order(self.symbol, self.position_size, dtime, close[-1])
            else:
                self.short_order(self.symbol, self.position_size, dtime, close[-1])
            return

        position_id = self.user_positions.index[0]
        amount = float(self.user_positions.loc[position_id, "Amount"])
        has_long = amount > 0
        should_close = (has_long and desired_side == "SHORT") or (not has_long and desired_side == "LONG")
        if should_close:
            self.closing_order(position_id, dtime, close[-1])
