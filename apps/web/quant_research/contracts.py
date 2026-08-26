"""Immutable contracts shared by the Quant Research data and execution layers."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal

import pandas as pd


QualityStatus = Literal["PASSED", "BLOCKED"]
Frequency = Literal["DAILY_SOURCE_REFERENCE"]


@dataclass(frozen=True)
class DatasetRef:
    """Versioned identity and provenance for a historical dataset."""

    dataset_id: str
    asset_id: str
    label: str
    provider: str
    source_url: str
    symbol: str
    frequency: Frequency
    timezone: str
    coverage_start: str
    coverage_end: str
    retrieved_at: str
    version: str
    adjustment_policy: str
    information_cutoff: str
    limitations: tuple[str, ...]


@dataclass(frozen=True)
class QualityReport:
    status: QualityStatus
    checks: tuple[str, ...]
    failures: tuple[str, ...]
    row_count: int
    warmup_observations: int


@dataclass(frozen=True)
class Dataset:
    reference: DatasetRef
    frame: pd.DataFrame
    quality: QualityReport
    evaluation_start: str


@dataclass(frozen=True)
class ExecutionConfig:
    initial_capital: float
    fixed_units: int
    fee_rate: float
    slippage_rate: float
    leverage: float
    max_positions: int = 1

    def validate(self) -> None:
        if not 1_000 <= self.initial_capital <= 10_000_000:
            raise ValueError("Initial capital must be within the approved research range.")
        if not 1 <= self.fixed_units <= 10_000:
            raise ValueError("Fixed units must be within the approved research range.")
        if not 0 <= self.fee_rate <= 0.1 or not 0 <= self.slippage_rate <= 0.1:
            raise ValueError("Fee and slippage rates must be between 0 and 10%.")
        if not 1 <= self.leverage <= 20:
            raise ValueError("Leverage must be between 1x and 20x.")
        if self.max_positions != 1:
            raise ValueError("The initial single-asset research engine supports one open position only.")


@dataclass(frozen=True)
class OrderRecord:
    order_id: str
    reference_date: str
    side: Literal["BUY", "SELL", "CLOSE"]
    units: int
    status: Literal["QUEUED", "FILLED", "REJECTED"]
    reason: str | None = None


@dataclass(frozen=True)
class FillRecord:
    fill_id: str
    order_id: str
    reference_date: str
    side: Literal["BUY", "SELL", "CLOSE"]
    units: int
    price: float
    fee: float


@dataclass(frozen=True)
class PositionRecord:
    position_id: str
    side: Literal["LONG", "SHORT"]
    entry_date: str
    entry_price: float
    exit_date: str | None
    exit_price: float | None
    units: int
    realized_pnl: float | None
    total_fees: float


@dataclass(frozen=True)
class EquityPoint:
    reference_date: str
    cash: float
    margin_locked: float
    unrealized_pnl: float
    portfolio_value: float


@dataclass(frozen=True)
class SimulationResult:
    engine_version: str
    created_at: str
    configuration: ExecutionConfig
    orders: tuple[OrderRecord, ...]
    fills: tuple[FillRecord, ...]
    positions: tuple[PositionRecord, ...]
    equity_curve: tuple[EquityPoint, ...]
    assumptions: tuple[str, ...] = field(default_factory=tuple)
