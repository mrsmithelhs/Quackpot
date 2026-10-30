"""Plan 28 report-local, finite, loopback-only static server for the Direction A browser gate.

Serves the repository root (the page imports src/ and reads Plan 35 JSON) on 127.0.0.1 only, and exits by itself at
its deadline, which is clamped to at most 900 s, even if its parent never stops it. It is not a general process
manager. Run it with `python -I` so nothing is imported from the served tree.

Usage: python -I serve-bounded.py <port> <seconds>
"""
import functools
import http.server
import os
import sys
import time

MAX_SECONDS = 900
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))


class Handler(http.server.SimpleHTTPRequestHandler):
    # Windows registry MIME mappings can label .js as text/plain, which browsers refuse for module scripts.
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
    }

    def log_message(self, fmt, *args):
        sys.stdout.write('%s %s\n' % (time.strftime('%H:%M:%S'), fmt % args))
        sys.stdout.flush()


def main():
    port = int(sys.argv[1])
    seconds = min(int(sys.argv[2]), MAX_SECONDS)
    deadline = time.monotonic() + seconds
    server = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory=ROOT))
    server.timeout = 1
    print('pid=%d root=%s url=http://127.0.0.1:%d/ deadline_s=%d' % (os.getpid(), ROOT, port, seconds), flush=True)
    try:
        while time.monotonic() < deadline:
            server.handle_request()
    finally:
        server.server_close()
        print('stopped at deadline or interrupt', flush=True)


if __name__ == '__main__':
    main()
