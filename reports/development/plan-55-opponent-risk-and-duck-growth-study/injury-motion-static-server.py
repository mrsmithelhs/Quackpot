"""Finite loopback-only static server for the Plan55 task-owned snapshot."""
import functools
import http.server
import json
import os
import sys
import time

root = os.path.abspath(sys.argv[1])
seconds = int(sys.argv[2])
if not os.path.isdir(root) or not 1 <= seconds <= 85:
    raise SystemExit('invalid snapshot root or deadline')
class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css'}
    def log_message(self, *_args):
        pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=root))
server.timeout = 1
print(json.dumps({'port': server.server_port, 'seconds': seconds}), flush=True)
deadline = time.monotonic() + seconds
try:
    while time.monotonic() < deadline:
        server.handle_request()
finally:
    server.server_close()
