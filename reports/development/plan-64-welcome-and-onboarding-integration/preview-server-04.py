"""Finite loopback review server. Start only after root clearance; no repository access."""
import datetime, hashlib, json, mimetypes, os, pathlib, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

base = pathlib.Path(__file__).resolve().parent
package = (base / 'local' / 'preview-package-04').resolve(strict=True)
manifest_path = package / 'manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
allowed = manifest['files']
if not allowed or any(not k.startswith('/') or '..' in pathlib.PurePosixPath(k).parts for k in allowed):
    raise SystemExit('invalid manifest routes')

def content(route):
    entry = allowed[route]
    path = package.joinpath(*pathlib.PurePosixPath(entry['file']).parts)
    if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(package):
        raise ValueError('invalid package path')
    data = path.read_bytes()
    if hashlib.sha256(data).hexdigest() != entry['sha256']:
        raise ValueError('snapshot hash changed')
    return data

for route in allowed:
    content(route)

selector = b'''<!doctype html><meta charset="utf-8"><title>Plan 64 synthetic starts</title><h1>Plan 64 synthetic review</h1><p>These controls affect only the save on this isolated preview origin.</p><button data-start="saved">Saved run</button><button data-start="terminal">Terminal Receipt</button><button data-start="fresh">Fresh start</button><section id="confirm" hidden><p>Replace or clear this preview origin save?</p><button id="yes">Replace</button><button id="no">Cancel</button></section><p id="status" role="status"></p><script>let chosen=null;async function openStart(kind){try{if(kind==='fresh')localStorage.removeItem('quackpot_save_v1');else{const r=await fetch('/starts/'+kind);if(!r.ok)throw Error('Fixture unavailable');const t=await r.text();JSON.parse(t);localStorage.setItem('quackpot_save_v1',t)}location.href='/Quackpot/'}catch(e){document.querySelector('#status').textContent='Could not prepare the synthetic start.'}}for(const b of document.querySelectorAll('[data-start]'))b.onclick=()=>{chosen=b.dataset.start;if(localStorage.getItem('quackpot_save_v1')===null)openStart(chosen);else{document.querySelector('#confirm').hidden=false;document.querySelector('#yes').focus()}};document.querySelector('#yes').onclick=()=>openStart(chosen);document.querySelector('#no').onclick=()=>{document.querySelector('#confirm').hidden=true;document.querySelector('[data-start="'+chosen+'"]').focus()};</script>'''

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args): pass
    def do_GET(self):
        route = urlsplit(self.path).path
        if route == '/review': data, kind = selector, 'text/html; charset=utf-8'
        else:
            if route == '/Quackpot/': route = '/Quackpot/index.html'
            if route not in allowed: self.send_error(404); return
            try: data = content(route)
            except (OSError, ValueError): self.send_error(503); threading.Thread(target=self.server.shutdown, daemon=True).start(); return
            suffix = pathlib.PurePosixPath(route).suffix.lower()
            kind = {'.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.wav': 'audio/wav'}.get(suffix) or mimetypes.guess_type(route)[0] or 'application/octet-stream'
        self.send_response(200); self.send_header('Content-Type', kind); self.send_header('Content-Length', str(len(data))); self.send_header('Cache-Control', 'no-store'); self.end_headers(); self.wfile.write(data)

server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
timer = threading.Timer(900, server.shutdown); timer.daemon = True
ready = {'pid': os.getpid(), 'port': server.server_port, 'expires_utc': (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=900)).isoformat(), 'manifest_sha256': hashlib.sha256(manifest_path.read_bytes()).hexdigest()}
(package / 'ready.json').write_text(json.dumps(ready), encoding='utf-8'); timer.start()
try: server.serve_forever(poll_interval=.2)
finally:
    timer.cancel(); server.server_close()
    (package / 'stopped.json').write_text(json.dumps({'pid': os.getpid(), 'stopped_utc': datetime.datetime.now(datetime.timezone.utc).isoformat()}), encoding='utf-8')
