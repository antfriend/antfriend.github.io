#!/usr/bin/env python3
"""Serve this repository as a local static website."""

from __future__ import annotations

import argparse
import os
import signal
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def parse_args() -> argparse.Namespace:
    repo_root = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(
        description="Host the local site with a simple HTTP server.",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Interface to bind (default: 127.0.0.1). Use 0.0.0.0 for LAN access.",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to listen on (default: 8000).",
    )
    parser.add_argument(
        "--root",
        default=str(repo_root),
        help="Directory to serve (default: this script's directory).",
    )
    parser.add_argument(
        "--open",
        dest="open_browser",
        action="store_true",
        default=True,
        help="Open the site in your default browser (default: on).",
    )
    parser.add_argument(
        "--no-open",
        dest="open_browser",
        action="store_false",
        help="Do not open a browser automatically.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    if not root.exists() or not root.is_dir():
        print(f"Error: --root must be an existing directory, got: {root}", file=sys.stderr)
        return 2
    if not (1 <= args.port <= 65535):
        print(f"Error: --port must be between 1 and 65535, got: {args.port}", file=sys.stderr)
        return 2

    os.chdir(root)

    handler = SimpleHTTPRequestHandler
    try:
        server = ThreadingHTTPServer((args.host, args.port), handler)
    except OSError as exc:
        print(f"Error: could not start server on {args.host}:{args.port}: {exc}", file=sys.stderr)
        return 1
    server.daemon_threads = True

    base_url = f"http://{args.host}:{args.port}/"
    index_url = f"{base_url}index.html"

    def stop_server(_signum: int, _frame: object) -> None:
        print("\nStopping server...")
        server.shutdown()

    for sig_name in ("SIGINT", "SIGTERM"):
        sig = getattr(signal, sig_name, None)
        if sig is None:
            continue
        try:
            signal.signal(sig, stop_server)
        except (ValueError, OSError):
            pass

    print(f"Serving: {root}")
    print(f"URL: {base_url}")
    print(f"Index: {index_url}")
    print("Press Ctrl+C to stop.")

    if args.open_browser:
        webbrowser.open(index_url)

    try:
        server.serve_forever()
    finally:
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
