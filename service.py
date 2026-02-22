#!/usr/bin/env python3
"""Run a tiny local web service for this repository."""

from __future__ import annotations

import argparse
import os
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve this repository and open index.html.",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Interface to bind (default: 127.0.0.1).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to listen on (default: 8000).",
    )
    parser.add_argument(
        "--no-open",
        action="store_true",
        help="Do not open index.html automatically.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not 1 <= args.port <= 65535:
        print(f"Error: invalid port {args.port}. Use 1-65535.", file=sys.stderr)
        return 2

    repo_root = Path(__file__).resolve().parent
    os.chdir(repo_root)

    try:
        server = ThreadingHTTPServer((args.host, args.port), SimpleHTTPRequestHandler)
    except OSError as exc:
        print(f"Error: could not start server on {args.host}:{args.port}: {exc}", file=sys.stderr)
        return 1

    base_url = f"http://{args.host}:{args.port}/"
    index_url = f"{base_url}index.html"

    print(f"Serving {repo_root}")
    print(f"URL: {base_url}")
    print(f"Index: {index_url}")
    print("Press Ctrl+C to stop.")

    if not args.no_open:
        webbrowser.open(index_url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
