"""Vercel Python Function for bounded ForexMax Quant Research runs."""

from __future__ import annotations

from dataclasses import asdict
import json
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from quant_research.ai_provider import AIProvider
from quant_research.datasets import DatasetRegistry
from quant_research.plans import build_manual_research_plan, build_manus_review_plan
from quant_research.service import run_research


ALLOWED_PLAN_FIELDS = {"action", "question", "asset"}
ALLOWED_RUN_FIELDS = {"action", "question", "reviewedPlanId", "provider", "periodYears", "capital", "strategy"}
ALLOWED_AI_START_FIELDS = {"action", "question", "asset"}
ALLOWED_AI_RESULT_FIELDS = {"action", "question", "asset", "taskId", "taskTicket"}


class ManusTaskGate:
    """Best-effort per-instance cap; durable enforcement needs authorized storage or edge controls."""

    WINDOW_SECONDS = 15 * 60
    MAX_STARTS_PER_CLIENT = 3
    MAX_CONCURRENT_STARTS = 2
    _lock = threading.Lock()
    _starts_by_client: dict[str, list[float]] = {}
    _active_starts = 0

    @classmethod
    def _client_key(cls, handler: BaseHTTPRequestHandler) -> str:
        forwarded = handler.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
        return forwarded or handler.client_address[0]

    @classmethod
    def acquire(cls, handler: BaseHTTPRequestHandler) -> None:
        client = cls._client_key(handler)
        now = time.monotonic()
        with cls._lock:
            starts = [started for started in cls._starts_by_client.get(client, []) if now - started < cls.WINDOW_SECONDS]
            if len(starts) >= cls.MAX_STARTS_PER_CLIENT:
                raise ValueError("AI plan creation is temporarily rate-limited. Use the deterministic plan or try again later.")
            if cls._active_starts >= cls.MAX_CONCURRENT_STARTS:
                raise ValueError("AI plan creation is temporarily busy. Use the deterministic plan or try again later.")
            cls._starts_by_client[client] = [*starts, now]
            cls._active_starts += 1

    @classmethod
    def release(cls) -> None:
        with cls._lock:
            cls._active_starts = max(0, cls._active_starts - 1)


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
            if payload.get("action") == "AI_PLAN_START":
                if set(payload) != ALLOWED_AI_START_FIELDS:
                    raise ValueError("AI plan request fields do not match the approved Quant Research contract.")
                validated_plan = build_manual_research_plan(payload["question"], payload["asset"])
                ManusTaskGate.acquire(self)
                try:
                    response = AIProvider().start_plan_annotation(validated_plan.objective, validated_plan.asset)
                finally:
                    ManusTaskGate.release()
                self._respond(202, response)
                return
            if payload.get("action") == "AI_PLAN_RESULT":
                if set(payload) != ALLOWED_AI_RESULT_FIELDS:
                    raise ValueError("AI review result fields do not match the approved Quant Research contract.")
                result = AIProvider().get_plan_annotation(payload["taskId"], payload["taskTicket"])
                if result.get("status") == "COMPLETED":
                    annotation = result.get("annotation")
                    if not isinstance(annotation, dict):
                        raise ValueError("AI review result did not match the approved contract.")
                    self._respond(200, {"status": "COMPLETED", "plan": build_manus_review_plan(payload["question"], payload["asset"], annotation).serialize()})
                    return
                self._respond(200, result)
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
            raise ValueError("Quant Research action must be PLAN, AI_PLAN_START, AI_PLAN_RESULT or RUN.")
        except ValueError as error:
            self._respond(400, {"error": str(error)})
        except Exception:
            self._respond(502, {"error": "Quant Research could not complete with the selected historical provider data."})

    def log_message(self, format: str, *args: object) -> None:
        return
