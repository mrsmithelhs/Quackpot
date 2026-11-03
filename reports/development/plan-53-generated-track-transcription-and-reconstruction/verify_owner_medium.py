"""Proposed owner-downloaded Medium verification; no network or ML imports."""
import hashlib
import json
from pathlib import Path
import stat
import sys

REVISION = "f32236969308476e01fd3aae67357de5feb05a2d"
CONFIG_BLOB = "3862558703a8c30630ff1149b58e2f070179c774"


def verify(folder, info):
    folder = Path(folder).resolve(strict=True)
    if info["revision"] != REVISION:
        raise ValueError("model revision drift")
    for name in ("config.json", "model.safetensors"):
        meta = (folder / name).stat(follow_symlinks=False)
        if getattr(meta, "st_file_attributes", 0) & 0x400 or not stat.S_ISREG(meta.st_mode):
            raise ValueError("model input is not a normal local file")
    config = (folder / "config.json").read_bytes()
    if len(config) != 126 or hashlib.sha1(b"blob " + str(len(config)).encode() + b"\0" + config).hexdigest() != CONFIG_BLOB:
        raise ValueError("config Git object mismatch")
    architecture = json.loads(config)
    expected = {"dim": 1024, "num_heads": 16, "num_layers": 24, "card": 1395}
    if any(type(architecture.get(key)) is not int or architecture[key] != value for key, value in expected.items()):
        raise ValueError("config is not the expected Medium architecture")
    h = hashlib.sha256(); size = 0
    with (folder / "model.safetensors").open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            size += len(block); h.update(block)
    if size != info["size_bytes"] or h.hexdigest() != info["sha256_from_hub"]:
        raise ValueError("weights size or SHA-256 mismatch")
    return {"revision": REVISION, "model_bytes": size, "model_sha256": h.hexdigest(),
            "config_git_blob_sha1": CONFIG_BLOB, "config_received_sha256": hashlib.sha256(config).hexdigest(),
            "config_sha256_independently_published": False, "architecture": expected}


def main(folder_arg):
    info = json.loads(Path(__file__).resolve().with_name("candidate-metadata.json").read_text(encoding="utf-8-sig"))["medium_model"]
    print(json.dumps(verify(folder_arg, info)))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("expected owner Medium directory")
    try:
        main(sys.argv[1])
    except Exception as exc:
        print("Medium verification failed: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
