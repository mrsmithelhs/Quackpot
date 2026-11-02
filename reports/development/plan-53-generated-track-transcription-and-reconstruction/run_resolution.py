"""One fixed, root-cleared resolution vector; never installs or loads ML."""
import json
import os
from pathlib import Path
import shutil
import sys

import bootstrap_watchdog


def main(root_arg):
    root = Path(root_arg).resolve(strict=True)
    uv = shutil.which("uv.exe")
    if not uv:
        raise ValueError("uv.exe not found")
    source = Path(__file__).resolve().with_name("bootstrap-requirements.in")
    target = root / "resolved-requirements.txt"
    if target.exists():
        raise ValueError("resolution result already exists")
    args = ["--workspace", str(root), "--seconds", "1800", "--memory-mib", "4096", "--footprint-mib", "20480", "--free-floor-mib", "30720", uv,
            "pip", "compile", str(source), "--python-version", "3.12", "--python-platform", "windows", "--torch-backend", "cu128", "--generate-hashes", "--no-build", "--no-config", "--no-python-downloads", "--output-file", str(target)]
    result = bootstrap_watchdog.run(1800, args)
    print(json.dumps(result))
    return 0 if result.get("status") == "supervisor exited" and result.get("exit_code") == 0 else 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("expected dedicated existing workspace")
    try:
        sys.exit(main(sys.argv[1]))
    except Exception as exc:
        print("Resolution launch failed: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
