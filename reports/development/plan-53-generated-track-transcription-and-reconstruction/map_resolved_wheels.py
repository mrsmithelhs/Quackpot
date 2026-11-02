"""Map an existing uv lock to previously collected, platform-specific metadata."""
import hashlib
import json
from pathlib import Path
import re
import sys


def main(lock_path):
    root = Path(__file__).resolve().parent
    lock_bytes = Path(lock_path).read_bytes()
    text = lock_bytes.decode("utf-8")
    blocks = re.split(r"(?m)^(?=[a-zA-Z0-9_.-]+==)", text)
    actual = {}
    for block in blocks:
        match = re.match(r"([a-zA-Z0-9_.-]+)==([^\s\\]+)", block)
        if match:
            actual[match.group(1)] = {"version": match.group(2), "hashes": set(re.findall(r"--hash=sha256:([0-9a-f]{64})", block))}
    candidate = json.loads((root/"dependency-candidate.json").read_text(encoding="utf-8-sig"))
    metadata = json.loads((root/"candidate-metadata.json").read_text(encoding="utf-8-sig"))
    selected = {name: {"version": item["version"], "filename": item["filename"], "url": item["url"], "size_bytes": item["size_bytes"], "published_sha256": item["sha256_from_pypi"]} for name,item in candidate["wheels"].items()}
    for item in metadata["cuda_candidates"]:
        name = item["filename"].split("-", 1)[0]
        selected[name] = {"version": candidate["cuda_candidates"][name], "filename": item["filename"], "url": item["url"], "size_bytes": item["size_bytes"], "published_sha256": item["sha256_from_index"]}
    if set(actual) != set(selected):
        raise ValueError("package set differs from existing metadata")
    for name, item in selected.items():
        if actual[name]["version"] != item["version"] or item["published_sha256"] not in actual[name]["hashes"]:
            raise ValueError("version or selected wheel hash mismatch: " + name)
    result = {"status": "metadata mapping only; no wheel body downloaded or installability established",
              "requirements_sha256": hashlib.sha256(lock_bytes).hexdigest(),
              "target": "Windows x86-64, CPython 3.12, CUDA 12.8",
              "wheel_count": len(selected), "wheel_bytes": sum(x["size_bytes"] for x in selected.values()),
              "wheels": dict(sorted(selected.items()))}
    json.dump(result, sys.stdout, indent=2); print()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("expected local resolved requirements path")
    try:
        main(sys.argv[1])
    except Exception as exc:
        print("Mapping failed: " + type(exc).__name__ + ": " + str(exc), file=sys.stderr)
        sys.exit(1)
