"""Fetch smoke test for each allowlisted AlphaBacktest historical dataset."""

from __future__ import annotations

import json

from .providers import ASSETS, YahooProvider


if __name__ == "__main__":
    provider = YahooProvider()
    results = []
    for asset_id in ASSETS:
        dataset = provider.fetch(asset_id, 1)
        results.append({
            "asset": asset_id,
            "provider": dataset.provider,
            "symbol": dataset.asset.yahoo_ticker,
            "referenceStart": dataset.reference_start,
            "referenceEnd": dataset.reference_end,
            "observations": int(dataset.frame.shape[0]),
            "version": dataset.data_version,
        })
    print(json.dumps(results, sort_keys=True))
