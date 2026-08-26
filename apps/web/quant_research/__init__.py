"""ForexMax Quant Research core.

This package is deliberately server-side only.  It contains typed data contracts,
quality validation and deterministic execution primitives; it never evaluates user
code or makes trading decisions.
"""

from .contracts import Dataset, DatasetRef, ExecutionConfig, QualityReport
from .datasets import DatasetRegistry
from .engine import ExecutionSimulator

__all__ = ["Dataset", "DatasetRef", "ExecutionConfig", "QualityReport", "DatasetRegistry", "ExecutionSimulator"]
