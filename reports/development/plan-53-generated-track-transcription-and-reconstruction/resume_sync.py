"""Proposed resume from preserved state; never execute without root review."""
import hashlib
import json
from pathlib import Path
import shutil
import sys
import time

import bootstrap_watchdog


def main(root_arg):
    root = Path(root_arg).resolve(strict=True)
    here = Path(__file__).resolve().parent
    uv = shutil.which("uv.exe")
    if not uv:
        raise ValueError("uv unavailable")
    if hashlib.sha256(Path(uv).read_bytes()).hexdigest() != "6d40479cd1d0d5db7fc0fe68ad703fc8acbd84bba50d864bb97461f6af9d9561":
        raise ValueError("uv executable changed")
    resolved = root / "resolved-requirements.txt"
    mapping = json.loads((here / "wheel-mapping.json").read_text(encoding="utf-8-sig"))
    if hashlib.sha256(resolved.read_bytes()).hexdigest() != mapping["requirements_sha256"]:
        raise ValueError("requirements changed")
    py312 = root / "python-3.12.13" / "python" / "python.exe"
    envpython = root / "venv" / "Scripts" / "python.exe"
    if not py312.is_file() or not envpython.is_file():
        raise ValueError("preserved Python or venv unavailable")
    commands = [
        [str(py312), "-B", str(here / "verify_python.py")],
        [uv, "pip", "sync", str(resolved), "--python", str(envpython), "--require-hashes", "--torch-backend", "cu128", "--no-build", "--no-config", "--no-python-downloads"],
        [str(envpython), "-B", str(here / "verify_environment.py")],
    ]
    deadline = time.monotonic() + 1800
    outputs = []
    for number, command in enumerate(commands, 1):
        remaining = int(deadline - time.monotonic())
        if remaining < 1:
            raise TimeoutError("stage deadline exhausted")
        logfile = root / "bootstrap-output.log"
        previous = root / f"bootstrap-output-before-resume-{number}.log"
        if logfile.exists():
            if previous.exists():
                raise ValueError("diagnostic destination exists")
            logfile.rename(previous)
        args = ["--workspace", str(root), "--seconds", str(remaining), "--memory-mib", "4096", "--footprint-mib", "20480", "--free-floor-mib", "30720", *command]
        result = bootstrap_watchdog.run(remaining, args)
        outputs.append(result)
        if result.get("status") != "supervisor exited" or result.get("exit_code") != 0:
            print(json.dumps({"status": "stopped", "step": number, "results": outputs}))
            return 1
    print(json.dumps({"status": "completed; model/inference still gated", "results": outputs}))
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("expected preserved workspace")
    try:
        sys.exit(main(sys.argv[1]))
    except Exception as exc:
        print("Resume stopped: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
