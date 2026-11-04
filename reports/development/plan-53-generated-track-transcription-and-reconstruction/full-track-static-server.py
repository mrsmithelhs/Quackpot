"""Plan 53 finite loopback-only static server for the report-local listening gate.

Serves the repository root without live reload and exits after at most 175 seconds.
Run with python -I; pass port 0 to bind an ephemeral loopback port.
Usage: python -I full-track-static-server.py <port> <seconds>
"""
import functools
import http.server
import os
import sys
import time

MAX_SECONDS = 175
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))


class Handler(http.server.SimpleHTTPRequestHandler):
    # Windows registry MIME mappings can label .js as text/plain, which browsers refuse for module scripts.
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
    }

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stdout.write('%s %s\n' % (time.strftime('%H:%M:%S'), fmt % args))
        sys.stdout.flush()


def main():
    port = int(sys.argv[1])
    seconds = min(int(sys.argv[2]), MAX_SECONDS)
    deadline = time.monotonic() + seconds
    server = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory=ROOT))
    server.timeout = 1
    print('pid=%d root=%s port=%d deadline_s=%d' % (os.getpid(), ROOT, server.server_port, seconds), flush=True)
    try:
        while time.monotonic() < deadline:
            server.handle_request()
    finally:
        server.server_close()
        print('stopped at deadline or interrupt', flush=True)


if __name__ == '__main__':
    main()
