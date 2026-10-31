"""Finite loopback-only preview of the existing Quackpot dist build; no build or watch."""
from __future__ import annotations

import argparse
import mimetypes
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
import time
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[3]
DIST = (ROOT / 'dist').resolve()
PREFIX = '/Quackpot/'
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('text/javascript', '.mjs')


def resolve_request(target: str, dist: Path = DIST) -> Path | None:
    """Reject paths outside the configured build tree, including symlink escapes."""
    path = unquote(urlsplit(target).path)
    if not path.startswith(PREFIX) or '\\' in path or '\x00' in path:
        return None
    relative = PurePosixPath(path[len(PREFIX):])
    if any(part in ('..', '.') or ':' in part for part in relative.parts):
        return None
    root = dist.resolve()
    candidate = root.joinpath(*relative.parts).resolve()
    return candidate if candidate.is_relative_to(root) else None


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        candidate = resolve_request(path)
        return str(candidate if candidate is not None else DIST / '__invalid_preview_path__')

    def do_GET(self):
        if resolve_request(self.path) is None:
            self.send_error(404)
            return
        super().do_GET()

    def do_HEAD(self):
        if resolve_request(self.path) is None:
            self.send_error(404)
            return
        super().do_HEAD()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=4187)
    parser.add_argument('--seconds', type=int, default=900)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535 or not 1 <= args.seconds <= 3600:
        parser.error('port must be 1–65535 and seconds must be 1–3600')
    if not (DIST / 'index.html').is_file():
        parser.error('dist/index.html is missing; build the project first')
    # Binding fails if the port is already owned; no process is stopped or replaced.
    with ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(DIST))) as server:
        server.timeout = 1
        deadline = time.monotonic() + args.seconds
        print(f'PID {os.getpid()} | http://127.0.0.1:{args.port}/Quackpot/ | expires in {args.seconds}s', flush=True)
        while time.monotonic() < deadline:
            server.handle_request()


if __name__ == '__main__':
    main()
