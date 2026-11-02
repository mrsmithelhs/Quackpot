"""Proposed install stage; do not execute without separate root clearance.

One shared watchdog deadline covers all commands. No model downloads or ML
imports are included. Requires reviewed requirements and an existing workspace.
"""
import json
import hashlib
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
    resolved = root / "resolved-requirements.txt"
    if not resolved.is_file():
        raise ValueError("reviewed requirements missing")
    reviewed = json.loads((here / "wheel-mapping.json").read_text(encoding="utf-8-sig"))
    if hashlib.sha256(resolved.read_bytes()).hexdigest() != reviewed["requirements_sha256"]:
        raise ValueError("requirements changed after wheel review")
    py312 = root / "python-3.12.13" / "python" / "python.exe"
    envpython = root / "venv" / "Scripts" / "python.exe"
    commands = [
        [sys.executable, "-B", str(here / "fetch_python.py"), str(root)],
        [uv, "venv", "--python", str(py312), "--no-python-downloads", "--no-config", str(root / "venv")],
        [uv, "pip", "sync", str(resolved), "--python", str(envpython), "--require-hashes", "--torch-backend", "cu128", "--no-build", "--no-config", "--no-python-downloads"],
    ]
    deadline = time.monotonic() + 1800
    outputs = []
    for number, command in enumerate(commands, 1):
        remaining = int(deadline - time.monotonic())
        if remaining < 1:
            raise TimeoutError("stage deadline exhausted")
        if number > 1 and not py312.is_file():
            raise ValueError("expected verified Python executable absent")
        logfile = root / "bootstrap-output.log"
        previous = root / f"bootstrap-output-before-install-{number}.log"
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
        raise SystemExit("expected reviewed dedicated workspace")
    try:
        sys.exit(main(sys.argv[1]))
    except Exception as exc:
        print("Install stage stopped: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
