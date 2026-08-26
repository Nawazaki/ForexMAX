"""Vercel Python Function for bounded ForexMax Quant Research runs."""

from __future__ import annotations

from dataclasses import asdict
import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from quant_research.ai_provider import AIProvider
from quant_research.datasets import DatasetRegistry
from quant_research.plans import build_manual_research_plan
from quant_research.service import run_research


ALLOWED_PLAN_FIELDS = {"action", "question", "asset"}
ALLOWED_RUN_FIELDS = {"action", "question", "reviewedPlanId", "provider", "periodYears", "capital", "strategy"}


def capabilities() -> dict[str, object]:
    provider = AIProvider().status()
    return {
        "status": "READY_FOR_BOUNDED_RESEARCH",
        "engine": {"name": "ForexMax Quant Research Engine", "version": "FOREXMAX_QUANT_ENGINE_0.1", "baseline": "AlphaBacktest 1.0.0 preserved fidelity reference"},
        "aiProvider": asdict(provider),
        "dataProviders": DatasetRegistry().capabilities(),
        "strategyDsl": {
            "status": "ACTIVE",
            "version": "1",
            "strategies": ["SMA_CROSSOVER"],
            "execution": "NEXT_REFERENCE_OPEN",
            "unsupported": ["arbitrary code", "uploaded files", "dynamic URLs", "TA-Lib", "intraday", "multi-asset"],
        },
        "robustness": {
            "active": ["temporal out-of-sample split with censor gap", "parameter sensitivity", "cost sensitivity", "deterministic trade-order Monte Carlo"],
            "blocked": ["walk-forward queue", "regime analysis", "event study", "cross-asset", "forecasting"],
        },
        "persistence": {"status": "BLOCKED", "reason": "No isolated authorized Preview database is configured for research-run retention or strategy memory."},
    }


class handler(BaseHTTPRequestHandler):
    MAX_BODY_BYTES = 15_000

    def _respond(self, status: int, body: dict[str, object]) -> None:
        encoded = json.dumps(body, separators=(",", ":"), allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self) -> None:
        self._respond(200, capabilities())

    def do_POST(self) -> None:
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > self.MAX_BODY_BYTES:
                raise ValueError("Request body size is invalid.")
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
            if not isinstance(payload, dict):
                raise ValueError("Request fields do not match the approved Quant Research contract.")
            if payload.get("action") == "PLAN":
                if set(payload) != ALLOWED_PLAN_FIELDS:
                    raise ValueError("Plan request fields do not match the approved Quant Research contract.")
                self._respond(200, build_manual_research_plan(payload["question"], payload["asset"]).serialize())
                return
            if payload.get("action") == "RUN":
                if set(payload) != ALLOWED_RUN_FIELDS:
                    raise ValueError("Run request fields do not match the approved Quant Research contract.")
                self._respond(200, run_research(
                    question=payload["question"],
                    reviewed_plan_id=payload["reviewedPlanId"],
                    provider_id=payload["provider"],
                    period_years=payload["periodYears"],
                    capital=payload["capital"],
                    strategy_payload=payload["strategy"],
                ))
                return
            raise ValueError("Quant Research action must be PLAN or RUN.")
        except ValueError as error:
            self._respond(400, {"error": str(error)})
        except Exception:
            self._respond(502, {"error": "Quant Research could not complete with the selected historical provider data."})

    def log_message(self, format: str, *args: object) -> None:
        return
