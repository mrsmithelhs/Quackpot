"""Fail-closed local file checks before any ML import or model allocation."""
import hashlib
import json
from pathlib import Path
import stat
import sys

import verify_owner_medium


def verify(root_arg):
    supplied = Path(root_arg)
    root_stat = supplied.stat(follow_symlinks=False)
    if getattr(root_stat, "st_file_attributes", 0) & 0x400 or not stat.S_ISDIR(root_stat.st_mode):
        raise ValueError("workspace root is not a normal directory")
    root = supplied.resolve(strict=True)
    here = Path(__file__).resolve().parent
    data = json.loads((here / "candidate-metadata.json").read_text(encoding="utf-8-sig"))
    owner_dir = root / "owner-medium"
    owner_stat = owner_dir.stat(follow_symlinks=False)
    if getattr(owner_stat, "st_file_attributes", 0) & 0x400 or not stat.S_ISDIR(owner_stat.st_mode):
        raise ValueError("owner model folder is not a normal directory")
    medium = verify_owner_medium.verify(owner_dir, data["medium_model"])
    parent = root
    for part in ("torch-cache", "hub", "checkpoints"):
        parent = parent / part
        meta = parent.stat(follow_symlinks=False)
        if getattr(meta, "st_file_attributes", 0) & 0x400 or not stat.S_ISDIR(meta.st_mode):
            raise ValueError("checkpoint parent is not a normal workspace directory")
    beat = parent / "beat_this-final0.ckpt"
    beat_stat = beat.stat(follow_symlinks=False)
    if getattr(beat_stat, "st_file_attributes", 0) & 0x400 or not stat.S_ISREG(beat_stat.st_mode):
        raise ValueError("beat checkpoint is not a normal local file")
    receipt = json.loads((root / "beat-integrity.json").read_text(encoding="utf-8"))
    origin = data["beat_checkpoint"]["server_headers"]
    expected_sha1 = origin["oc-checksum"].split(",")[0].strip().removeprefix("SHA1:").lower()
    length = 0; h1 = hashlib.sha1(); h256 = hashlib.sha256()
    with beat.open("rb") as stream:
        for block in iter(lambda: stream.read(1024*1024), b""):
            length += len(block); h1.update(block); h256.update(block)
    if length != int(origin["Content-Length"]) or h1.hexdigest() != expected_sha1:
        raise ValueError("beat checkpoint does not match origin metadata")
    if receipt.get("received_sha256") != h256.hexdigest() or receipt.get("sha256_independently_published") is not False:
        raise ValueError("beat received-byte SHA-256 receipt mismatch")
    return {"medium": medium, "beat_bytes": length, "beat_origin_sha1": h1.hexdigest(), "beat_received_sha256": h256.hexdigest()}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("expected external workspace")
    try:
        print(json.dumps(verify(sys.argv[1])))
    except Exception as exc:
        print("Pre-inference verification failed: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
