"""Finite, loopback-only, read-only server for one synthetic Plan65 browser check."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import hashlib, json, mimetypes, threading

root = (Path(__file__).parent / 'build-candidate-06').resolve(strict=True)
files = {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
         for p in root.rglob('*') if p.is_file() and not p.is_symlink()}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if not path.startswith('/Quackpot/'):
            self.send_error(404); return
        name = path[len('/Quackpot/'):] or 'index.html'
        if name not in files:
            self.send_error(404); return
        data = (root / name).read_bytes()
        if hashlib.sha256(data).hexdigest() != files[name]:
            self.send_error(503); return
        self.send_response(200)
        self.send_header('Content-Type', mimetypes.guess_type(name)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Security-Policy', "connect-src 'none'; worker-src 'none'")
        self.end_headers(); self.wfile.write(data)
    def log_message(self, *args): pass

server = ThreadingHTTPServer(('127.0.0.1', 63864), Handler)
timer = threading.Timer(180, server.shutdown); timer.daemon = True; timer.start()
print(json.dumps({'port':server.server_port, 'files':len(files)}), flush=True)
try: server.serve_forever(poll_interval=.2)
finally: timer.cancel(); server.server_close()
