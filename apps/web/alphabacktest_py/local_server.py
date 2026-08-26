"""Local-only HTTP runner for exercising the same handler exported to Vercel."""

from http.server import HTTPServer

from api.alphabacktest import handler


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 8010), handler).serve_forever()
