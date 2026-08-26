"""Best-effort in-process protections for Preview Manus task creation."""

from __future__ import annotations

import unittest

from api.quant_research import ManusTaskGate


class _Headers:
    def __init__(self, forwarded: str = "203.0.113.1") -> None:
        self.forwarded = forwarded

    def get(self, name: str, default: str = "") -> str:
        return self.forwarded if name.lower() == "x-forwarded-for" else default


class _Handler:
    def __init__(self, forwarded: str = "203.0.113.1") -> None:
        self.headers = _Headers(forwarded)
        self.client_address = ("127.0.0.1", 0)


class ManusTaskGateTest(unittest.TestCase):
    def setUp(self) -> None:
        ManusTaskGate._starts_by_client = {}
        ManusTaskGate._active_starts = 0

    def test_limits_starts_per_client(self) -> None:
        handler = _Handler()
        for _ in range(ManusTaskGate.MAX_STARTS_PER_CLIENT):
            ManusTaskGate.acquire(handler)
            ManusTaskGate.release()
        with self.assertRaises(ValueError):
            ManusTaskGate.acquire(handler)

    def test_limits_concurrent_starts(self) -> None:
        first = _Handler("203.0.113.2")
        second = _Handler("203.0.113.3")
        third = _Handler("203.0.113.4")
        ManusTaskGate.acquire(first)
        ManusTaskGate.acquire(second)
        with self.assertRaises(ValueError):
            ManusTaskGate.acquire(third)
        ManusTaskGate.release()
        ManusTaskGate.release()


if __name__ == "__main__":
    unittest.main()
