"""Proposed beat checkpoint acquisition; do not run without root clearance."""
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
import urllib.parse
import urllib.request


class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        parsed = urllib.parse.urlsplit(newurl)
        if parsed.scheme != "https" or parsed.hostname != "cloud.cp.jku.at" or parsed.username or parsed.password:
            raise ValueError("unapproved checkpoint redirect")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def main(root_arg):
    supplied = Path(root_arg)
    root_meta = supplied.stat(follow_symlinks=False)
    if getattr(root_meta, "st_file_attributes", 0) & 0x400 or not stat.S_ISDIR(root_meta.st_mode):
        raise ValueError("workspace root is not a normal directory")
    root = supplied.resolve(strict=True)
    entry = json.loads(Path(__file__).resolve().with_name("candidate-metadata.json").read_text(encoding="utf-8-sig"))["beat_checkpoint"]
    url = entry["url"]; parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname != "cloud.cp.jku.at" or parsed.username or parsed.password:
        raise ValueError("unexpected origin")
    expected = int(entry["server_headers"]["Content-Length"])
    reported = entry["server_headers"]["oc-checksum"].split(",")[0].strip()
    if not reported.startswith("SHA1:"):
        raise ValueError("origin checksum missing")
    expected_sha1 = reported[5:].lower()
    parent = root
    for part in ("torch-cache", "hub", "checkpoints"):
        parent = parent / part
        parent.mkdir(exist_ok=True)
        meta = parent.stat(follow_symlinks=False)
        if getattr(meta, "st_file_attributes", 0) & 0x400 or not stat.S_ISDIR(meta.st_mode):
            raise ValueError("checkpoint parent is not a normal workspace directory")
    target = parent / "beat_this-final0.ckpt"
    partial = target.with_name(target.name + ".partial")
    receipt = root / "beat-integrity.json"
    if target.exists() or partial.exists() or receipt.exists():
        raise ValueError("checkpoint or partial exists; preserve and review")
    h1 = hashlib.sha1(); h256 = hashlib.sha256(); length = 0
    opener = urllib.request.build_opener(SafeRedirect())
    with opener.open(urllib.request.Request(url, headers={"User-Agent": "Quackpot-Plan53"}), timeout=30) as response, partial.open("xb") as out:
        for block in iter(lambda: response.read(1024 * 1024), b""):
            length += len(block)
            if length > expected:
                raise ValueError("checkpoint exceeds expected size")
            out.write(block); h1.update(block); h256.update(block)
    if length != expected or h1.hexdigest() != expected_sha1:
        raise ValueError("checkpoint size or origin SHA-1 mismatch")
    # On Windows os.rename fails if the destination exists; preserve the
    # verified partial if a competing file appeared or finalization fails.
    if os.name != "nt":
        raise ValueError("checkpoint finalization is Windows-only")
    os.rename(partial, target)
    result = {"bytes": length, "origin_sha1": h1.hexdigest(), "received_sha256": h256.hexdigest(), "sha256_independently_published": False}
    with receipt.open("x", encoding="utf-8") as out:
        json.dump(result, out, indent=2)
    print(json.dumps(result))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("expected dedicated external workspace")
    try:
        main(sys.argv[1])
    except Exception as exc:
        print("Checkpoint acquisition failed: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
