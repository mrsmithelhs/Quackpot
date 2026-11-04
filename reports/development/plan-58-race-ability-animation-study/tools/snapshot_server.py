"""Finite loopback server for a pinned Plan58 capture snapshot, not a watcher."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import functools, sys, threading
root=Path(sys.argv[1]).resolve()
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.mjs':'text/javascript','.js':'text/javascript'}
    def translate_path(self,path):
        path=urlsplit(path).path
        if not path.startswith('/Quackpot/'):
            return str(root/'__invalid_path__')
        self.path=path[len('/Quackpot'):]
        return super().translate_path(self.path)
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(root)))
timer=threading.Timer(80,server.shutdown);timer.daemon=True;timer.start()
print(f'http://127.0.0.1:{server.server_port}/Quackpot/',flush=True)
try: server.serve_forever(poll_interval=.2)
finally: timer.cancel();server.server_close()
