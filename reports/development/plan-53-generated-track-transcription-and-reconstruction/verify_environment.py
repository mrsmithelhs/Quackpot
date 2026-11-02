"""Check installed distributions via metadata only; do not import packages."""
import importlib.metadata
import json
from pathlib import Path
import re
import sys


def canonical(name):
    return re.sub(r"[-_.]+", "-", name).lower()


def main():
    mapping = json.loads(Path(__file__).resolve().with_name("wheel-mapping.json").read_text(encoding="utf-8-sig"))
    installed = {canonical(item.metadata["Name"]): item.version for item in importlib.metadata.distributions() if item.metadata.get("Name")}
    errors = []
    for name, data in mapping["wheels"].items():
        observed = installed.get(canonical(name))
        if observed != data["version"]:
            errors.append({"name": name, "expected": data["version"], "observed": observed})
    extras = sorted(set(installed) - {canonical(name) for name in mapping["wheels"]})
    if errors or extras:
        print(json.dumps({"status": "mismatch", "mismatches": errors, "unexpected_distributions": extras}))
        return 1
    print(json.dumps({"status": "matching metadata", "count": len(installed), "distributions": dict(sorted(installed.items()))}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
