"""Proposed finite loopback server. Do not launch until root authorizes the review window."""
import ctypes
from ctypes import wintypes
from datetime import datetime, timedelta, timezone
import errno
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import sys
import threading

BASE = Path(__file__).resolve().parent
WEB = BASE / 'web'
if len(sys.argv) != 2 or not re.fullmatch(r'[a-z0-9-]{1,40}', sys.argv[1]):
    raise SystemExit('Pass a new lowercase run ID.')
run_id = sys.argv[1]
if not (WEB / 'selector' / 'index.html').is_file() or not (WEB / 'app' / 'index.html').is_file():
    raise SystemExit('Frozen review files are missing.')
if any(path.is_symlink() for path in WEB.rglob('*')):
    raise SystemExit('Symlinks are not allowed in the review tree.')

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.mjs': 'text/javascript', '.js': 'text/javascript'}
    def list_directory(self, path):
        self.send_error(403)
        return None
    def log_message(self, *args):
        pass

def server_at(port):
    return ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, directory=str(WEB)))

try:
    server = server_at(5189)
except OSError as error:
    if error.errno not in (errno.EADDRINUSE, 10048):
        raise
    server = None
    for _ in range(3):
        candidate = server_at(0)
        if candidate.server_port != 5173:
            server = candidate
            break
        candidate.server_close()
    if server is None:
        raise RuntimeError('Could not allocate a permitted review port.')

timer = None
try:
    # Windows FILETIME and .NET UTC ticks identify the owned process across PID reuse.
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.GetCurrentProcess.restype = wintypes.HANDLE
    kernel.GetProcessTimes.argtypes = [wintypes.HANDLE] + [ctypes.POINTER(wintypes.FILETIME)] * 4
    kernel.GetProcessTimes.restype = wintypes.BOOL
    creation, exit_time, kernel_time, user_time = (wintypes.FILETIME() for _ in range(4))
    if not kernel.GetProcessTimes(kernel.GetCurrentProcess(), ctypes.byref(creation), ctypes.byref(exit_time),
                                  ctypes.byref(kernel_time), ctypes.byref(user_time)):
        raise ctypes.WinError(ctypes.get_last_error())
    filetime = (creation.dwHighDateTime << 32) | creation.dwLowDateTime
    created_ticks = str(filetime + 504911232000000000)
    started = datetime.now(timezone.utc)
    expires = started + timedelta(minutes=15)
    private = {'pid': os.getpid(), 'createdUtcTicks': created_ticks, 'port': server.server_port}
    public = {'origin': f'http://127.0.0.1:{server.server_port}', 'selectorPath': '/selector/',
              'startedUtc': started.isoformat(), 'expiresUtc': expires.isoformat(), 'lifetimeSeconds': 900}
    with (BASE / f'server-{run_id}.private.log').open('x', encoding='utf-8') as output:
        json.dump(private, output)
    with (BASE / f'server-{run_id}-ready.json').open('x', encoding='utf-8') as output:
        json.dump(public, output, indent=2)
    timer = threading.Timer(900, server.shutdown)
    timer.daemon = True
    timer.start()
    print(json.dumps(public), flush=True)
    server.serve_forever(poll_interval=.2)
finally:
    if timer is not None:
        timer.cancel()
    server.server_close()
