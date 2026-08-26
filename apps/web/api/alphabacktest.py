"""Vercel Python Function: constrained AlphaBacktest wrapper for ForexMax Preview."""

from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from alphabacktest_py.runner import capabilities, run_request


class handler(BaseHTTPRequestHandler):
    MAX_BODY_BYTES = 10_000

    def _respond(self, status: int, body: dict[str, object]) -> None:
        encoded = json.dumps(body, separators=(",", ":")).encode("utf-8")
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
            self._respond(200, run_request(payload))
        except ValueError as error:
            self._respond(400, {"error": str(error)})
        except Exception:
            self._respond(502, {"error": "AlphaBacktest could not complete with the selected historical provider data."})

    def log_message(self, format: str, *args: object) -> None:
        return
