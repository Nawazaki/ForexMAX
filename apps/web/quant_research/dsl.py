"""Strict, versioned strategy DSL.  No expressions, imports or user-provided code are accepted."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from .contracts import ExecutionConfig


DSL_VERSION = "1"
ALLOWED_ASSETS = {"SP500", "EURUSD", "USDJPY"}


@dataclass(frozen=True)
class SmaCrossoverDsl:
    schema_version: str
    strategy_type: Literal["SMA_CROSSOVER"]
    asset: str
    frequency: Literal["DAILY_SOURCE_REFERENCE"]
    fast_window: int
    slow_window: int
    entry_rule: Literal["FAST_ABOVE_SLOW_LONG__FAST_BELOW_SLOW_SHORT"]
    exit_rule: Literal["SIGNAL_FLIP"]
    fixed_units: int
    fee_rate: float
    slippage_rate: float
    leverage: float

    def execution_config(self, initial_capital: float) -> ExecutionConfig:
        return ExecutionConfig(
            initial_capital=initial_capital,
            fixed_units=self.fixed_units,
            fee_rate=self.fee_rate,
            slippage_rate=self.slippage_rate,
            leverage=self.leverage,
        )


def _expect_exact_mapping(value: object, expected: set[str], label: str) -> dict[str, object]:
    if not isinstance(value, dict) or set(value) != expected:
        raise ValueError(f"{label} fields do not match the approved Strategy DSL schema.")
    return value


def parse_strategy(payload: object) -> SmaCrossoverDsl:
    root = _expect_exact_mapping(payload, {"schemaVersion", "strategyType", "asset", "frequency", "indicators", "entry", "exit", "positionSizing", "execution"}, "Strategy DSL")
    indicators = _expect_exact_mapping(root["indicators"], {"fastSmaWindow", "slowSmaWindow"}, "Indicator")
    entry = _expect_exact_mapping(root["entry"], {"rule"}, "Entry")
    exit_rule = _expect_exact_mapping(root["exit"], {"rule"}, "Exit")
    sizing = _expect_exact_mapping(root["positionSizing"], {"type", "units"}, "Position sizing")
    execution = _expect_exact_mapping(root["execution"], {"feesRate", "slippageRate", "leverage"}, "Execution")

    if root["schemaVersion"] != DSL_VERSION:
        raise ValueError("Unsupported Strategy DSL version.")
    if root["strategyType"] != "SMA_CROSSOVER":
        raise ValueError("Unsupported Strategy DSL strategy type.")
    if root["asset"] not in ALLOWED_ASSETS:
        raise ValueError("Strategy asset is not allowlisted.")
    if root["frequency"] != "DAILY_SOURCE_REFERENCE":
        raise ValueError("Only daily source-reference strategy execution is active.")
    if entry["rule"] != "FAST_ABOVE_SLOW_LONG__FAST_BELOW_SLOW_SHORT" or exit_rule["rule"] != "SIGNAL_FLIP":
        raise ValueError("Strategy entry or exit rule is not supported.")
    if sizing["type"] != "FIXED_UNITS":
        raise ValueError("Only fixed-unit position sizing is supported.")

    fast, slow, units = indicators["fastSmaWindow"], indicators["slowSmaWindow"], sizing["units"]
    if type(fast) is not int or type(slow) is not int or not (2 <= fast <= 100 and 5 <= slow <= 250 and fast < slow):
        raise ValueError("Invalid SMA windows.")
    if type(units) is not int or not 1 <= units <= 10_000:
        raise ValueError("Invalid fixed-unit position size.")

    fees, slippage, leverage = execution["feesRate"], execution["slippageRate"], execution["leverage"]
    if any(type(value) not in {int, float} for value in (fees, slippage, leverage)):
        raise ValueError("Execution values must be numeric.")
    if not (0 <= float(fees) <= 0.1 and 0 <= float(slippage) <= 0.1 and 1 <= float(leverage) <= 20):
        raise ValueError("Invalid fee, slippage or leverage setting.")

    return SmaCrossoverDsl(
        schema_version=DSL_VERSION,
        strategy_type="SMA_CROSSOVER",
        asset=str(root["asset"]),
        frequency="DAILY_SOURCE_REFERENCE",
        fast_window=fast,
        slow_window=slow,
        entry_rule="FAST_ABOVE_SLOW_LONG__FAST_BELOW_SLOW_SHORT",
        exit_rule="SIGNAL_FLIP",
        fixed_units=units,
        fee_rate=float(fees),
        slippage_rate=float(slippage),
        leverage=float(leverage),
    )
