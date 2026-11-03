"""Static network-isolation trial payload; no audio, model, or credentials.

Do not execute until an administrator-mediated trial is explicitly approved.
"""
import json
from pathlib import Path
import socket
import subprocess
import sys


def main(mode):
    if mode not in ("baseline", "blocked"): raise ValueError("unexpected probe mode")
    result={"mode":mode,"direct_connected":False,"dns_resolved":False,"child_started":None}
    try:
        with socket.create_connection(("1.1.1.1",443),timeout=2): result["direct_connected"]=True
    except OSError: pass
    try:
        result["dns_resolved"]=bool(socket.getaddrinfo("example.com",443,type=socket.SOCK_STREAM))
    except OSError: pass
    if mode == "blocked":
        try:
            child=subprocess.run([sys.executable,"-B","-c","print('child-started')"],capture_output=True,text=True,timeout=2)
            result["child_started"]=child.returncode == 0 and "child-started" in child.stdout
        except (OSError,subprocess.TimeoutExpired):
            result["child_started"]=False
    result["local_read_ok"]=len(Path(__file__).read_bytes())>0
    print(json.dumps(result))


if __name__ == "__main__":
    if len(sys.argv)!=2: raise SystemExit("expected baseline or blocked")
    main(sys.argv[1])
