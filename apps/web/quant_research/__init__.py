"""ForexMax Quant Research core.

This package is deliberately server-side only.  It contains typed data contracts,
quality validation and deterministic execution primitives; it never evaluates user
code or makes trading decisions.
"""

from .contracts import Dataset, DatasetRef, ExecutionConfig, QualityReport

__all__ = ["Dataset", "DatasetRef", "ExecutionConfig", "QualityReport", "DatasetRegistry", "ExecutionSimulator"]


def __getattr__(name: str):
    """Defer optional data/execution imports until a caller actually needs them.

    Vercel imports a Python Function's package before dispatching its handler. Keeping
    the package initializer light prevents the Manus capability endpoint from loading
    the historical-provider dependency tree before a research run is requested.
    """
    if name == "DatasetRegistry":
        from .datasets import DatasetRegistry

        return DatasetRegistry
    if name == "ExecutionSimulator":
        from .engine import ExecutionSimulator

        return ExecutionSimulator
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
