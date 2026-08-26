"""Local-only HTTP runner for exercising the same handler exported to Vercel."""

from http.server import BaseHTTPRequestHandler, HTTPServer

from api.alphabacktest import handler as AlphaBacktestHandler
from api.quant_research import handler as QuantResearchHandler


class LocalApiDispatcher(BaseHTTPRequestHandler):
    """Development-only path dispatcher; Preview uses Vercel's file-based Python functions."""

    _respond = AlphaBacktestHandler._respond

    def _target(self):
        return QuantResearchHandler if self.path.startswith("/api/quant_research") else AlphaBacktestHandler

    def do_GET(self) -> None:
        target = self._target()
        self.MAX_BODY_BYTES = target.MAX_BODY_BYTES
        target.do_GET(self)

    def do_POST(self) -> None:
        target = self._target()
        self.MAX_BODY_BYTES = target.MAX_BODY_BYTES
        target.do_POST(self)

    def log_message(self, format: str, *args: object) -> None:
        return


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 8010), LocalApiDispatcher).serve_forever()
