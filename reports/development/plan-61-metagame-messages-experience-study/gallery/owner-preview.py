from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import json

root = Path(__file__).resolve().parent
allowed = {'index.html': 'text/html; charset=utf-8', 'gallery.css': 'text/css; charset=utf-8', 'app.mjs': 'text/javascript; charset=utf-8', 'state.mjs': 'text/javascript; charset=utf-8', 'ren-avatar.svg': 'image/svg+xml'}
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        name = self.path.split('?', 1)[0].lstrip('/') or 'index.html'
        if name not in allowed:
            self.send_error(404); return
        data = (root / name).read_bytes()
        self.send_response(200); self.send_header('Content-Type', allowed[name]); self.send_header('Content-Length', str(len(data))); self.send_header('Cache-Control', 'no-store'); self.end_headers(); self.wfile.write(data)
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
(root / 'preview-endpoint.json').write_text(json.dumps({'port': server.server_port}), encoding='utf-8')
timer = Timer(900, server.shutdown); timer.daemon = True; timer.start()
try: server.serve_forever(poll_interval=.5)
finally: server.server_close(); timer.cancel()
