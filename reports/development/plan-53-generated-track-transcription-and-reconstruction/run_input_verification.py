"""Bounded, no-ML model/config/checkpoint integrity preflight."""
from pathlib import Path
import json
import sys
import bootstrap_watchdog


def main(root_arg):
    root = Path(root_arg).resolve(strict=True)
    helper = Path(__file__).resolve().with_name("verify_inference_inputs.py")
    python = root / "python-3.12.13" / "python" / "python.exe"
    log = root / "bootstrap-output.log"
    old = root / "bootstrap-output-before-input-check.log"
    if not python.is_file() or old.exists():
        raise ValueError("interpreter missing or retained log destination exists")
    if log.exists(): log.rename(old)
    args = ["--workspace", str(root), "--seconds", "30", "--memory-mib", "256",
            "--footprint-mib", "20480", "--free-floor-mib", "30720", str(python), "-B", str(helper), str(root)]
    result = bootstrap_watchdog.run(30, args)
    print(json.dumps(result))
    return 0 if result.get("status") == "supervisor exited" and result.get("exit_code") == 0 else 1


if __name__ == "__main__":
    if len(sys.argv) != 2: raise SystemExit("expected dedicated external workspace")
    try:
        sys.exit(main(sys.argv[1]))
    except Exception as exc:
        print("Input check failed: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
