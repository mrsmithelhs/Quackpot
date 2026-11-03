"""Proposed supervised final0 acquisition; requires separate root clearance."""
from pathlib import Path
import json
import sys

import bootstrap_watchdog


def main(root_arg):
    root = Path(root_arg).resolve(strict=True)
    helper = Path(__file__).resolve().with_name("acquire_beat_checkpoint.py")
    python = root / "python-3.12.13" / "python" / "python.exe"
    old = root / "bootstrap-output-before-beat-acquisition.log"
    log = root / "bootstrap-output.log"
    if not python.is_file() or old.exists():
        raise ValueError("interpreter missing or retained log destination exists")
    if log.exists():
        log.rename(old)
    args = ["--workspace", str(root), "--seconds", "300", "--memory-mib", "256",
            "--footprint-mib", "20480", "--free-floor-mib", "30720", str(python), "-B", str(helper), str(root)]
    result = bootstrap_watchdog.run(300, args)
    print(json.dumps(result))
    return 0 if result.get("status") == "supervisor exited" and result.get("exit_code") == 0 else 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("expected dedicated external workspace")
    try:
        sys.exit(main(sys.argv[1]))
    except Exception as exc:
        print("Beat acquisition launch failed: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
