"""Read-only SHA-256 verification of explicitly listed local pilot inputs.

The JSON manifest contains an `inputs` list of {id, path, sha256}; paths are
local and the manifest must stay ignored. This helper does not decode audio.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sys


def verify(manifest):
    entries = manifest.get("inputs")
    if not isinstance(entries, list) or not entries or len(entries) > 20:
        raise ValueError("inputs must be a nonempty list of at most 20 entries")
    seen = set()
    result = []
    for entry in entries:
        ident, path, expected = entry["id"], entry["path"], entry["sha256"]
        if not isinstance(ident, str) or not ident or ident in seen:
            raise ValueError("input IDs must be unique nonempty strings")
        if not isinstance(expected, str) or len(expected) != 64 or any(c not in "0123456789abcdef" for c in expected):
            raise ValueError("sha256 must be 64 lowercase hexadecimal characters")
        seen.add(ident)
        digest = hashlib.sha256()
        with Path(path).open("rb") as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(block)
        actual = digest.hexdigest()
        result.append({"id": ident, "sha256": actual, "matches": actual == expected})
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest")
    args = parser.parse_args()
    try:
        with open(args.manifest, encoding="utf-8") as stream:
            result = verify(json.load(stream))
        print(json.dumps(result, indent=2))
        return 0 if all(item["matches"] for item in result) else 1
    except (OSError, ValueError, KeyError, TypeError) as error:
        # Avoid echoing personal paths from OS exception text.
        print(f"Verification failed: {type(error).__name__}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
