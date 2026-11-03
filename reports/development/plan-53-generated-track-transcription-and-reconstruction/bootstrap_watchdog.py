"""Independent outer timeout for the proposed bootstrap supervisor only."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import time


def run(seconds, args, supervisor_name="bootstrap_supervisor.py"):
    if supervisor_name not in ("bootstrap_supervisor.py", "pilot_supervisor.py"): raise ValueError('unreviewed supervisor')
    supervisor = Path(__file__).with_name(supervisor_name).resolve(strict=True)
    started = time.monotonic()
    child = subprocess.Popen([sys.executable, "-B", str(supervisor), *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        stdout, stderr = child.communicate(timeout=seconds)
        if len(stdout) > 65536 or len(stderr) > 65536:
            return {"status": "supervisor output exceeded bound", "exit_code": child.returncode}
        try:
            result = json.loads(stdout)
        except (ValueError, TypeError):
            return {"status": "invalid supervisor result", "exit_code": child.returncode}
        return {"status": "supervisor exited", "exit_code": child.returncode, "supervisor": result, "elapsed_seconds": round(time.monotonic()-started, 3)}
    except subprocess.TimeoutExpired:
        child.kill()  # only the supervisor owned by this watchdog
        child.communicate(timeout=5)
        return {"status": "watchdog timeout; supervisor terminated; job cleanup not independently verified", "exit_code": child.returncode, "elapsed_seconds": round(time.monotonic()-started, 3)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seconds", type=int, required=True)
    parser.add_argument("args", nargs=argparse.REMAINDER)
    parsed = parser.parse_args()
    if not 0 < parsed.seconds <= 1800 or not parsed.args:
        parser.error("watchdog limit 1–1800 seconds; supervisor arguments required")
    result = run(parsed.seconds, parsed.args)
    print(json.dumps(result))
    sys.exit(0 if result["status"] == "supervisor exited" and result["exit_code"] == 0 else 1)
