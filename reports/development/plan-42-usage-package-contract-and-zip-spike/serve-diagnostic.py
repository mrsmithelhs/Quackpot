"""Finite loopback-only Plan 42 static server with page and worker CSP."""
import functools,http.server,os,sys,time
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..'))
class Handler(http.server.SimpleHTTPRequestHandler):
 extensions_map={**http.server.SimpleHTTPRequestHandler.extensions_map,'.mjs':'text/javascript','.js':'text/javascript','.wasm':'application/wasm'}
 def end_headers(self):
  self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'; style-src 'unsafe-inline'")
  super().end_headers()
 def log_message(self,fmt,*args):
  print(fmt%args,flush=True)
port=int(sys.argv[1]);seconds=min(int(sys.argv[2]),900);deadline=time.monotonic()+seconds
server=http.server.ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Handler,directory=ROOT));server.timeout=1
print(f'pid={os.getpid()} root={ROOT} url=http://127.0.0.1:{port}/ deadline_s={seconds}',flush=True)
try:
 while time.monotonic()<deadline:server.handle_request()
finally:server.server_close()
