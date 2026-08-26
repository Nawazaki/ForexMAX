"""Compatibility changes applied outside the preserved AlphaBacktest source."""

from __future__ import annotations

import pandas as pd
import progressbar
import warnings


def apply_pandas_append_compatibility() -> None:
    """Provide the removed DataFrame.append API expected by AlphaBacktest 1.0.0."""
    if hasattr(pd.DataFrame, "append"):
        return

    def dataframe_append(self: pd.DataFrame, other: object, ignore_index: bool = False, **_: object) -> pd.DataFrame:
        if isinstance(other, pd.Series):
            other = other.to_frame().T
        return pd.concat([self, other], ignore_index=ignore_index)

    setattr(pd.DataFrame, "append", dataframe_append)
    warnings.filterwarnings(
        "ignore",
        message="The behavior of DataFrame concatenation with empty or all-NA entries is deprecated.*",
        category=FutureWarning,
    )


def apply_execution_compatibility() -> None:
    """Silence legacy progress rendering in request-scoped execution only."""
    progressbar.progressbar = lambda iterable, *args, **kwargs: iterable
