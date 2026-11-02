"""Proposed pinned Python acquisition; do not execute without bootstrap clearance."""
import hashlib
import json
import pathlib
import tarfile
import urllib.parse
import urllib.request
import sys

HOSTS = {"github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com"}


class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        parsed = urllib.parse.urlsplit(newurl)
        if parsed.scheme != "https" or parsed.hostname not in HOSTS or parsed.username or parsed.password:
            raise ValueError("unapproved redirect")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def main(root):
    metadata = json.loads(pathlib.Path(__file__).with_name("candidate-metadata.json").read_text(encoding="utf-8-sig"))["python"]
    url, size_expected, algorithm_hash = metadata["url"], metadata["size_bytes"], metadata["digest_from_release"]
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname != "github.com" or not algorithm_hash.startswith("sha256:"):
        raise ValueError("unexpected Python source metadata")
    root = pathlib.Path(root).resolve(strict=True)
    archive = root / "cpython-3.12.13.tar.gz"
    target = root / "python-3.12.13"
    if target.exists():
        raise ValueError("target already exists")
    digest = hashlib.sha256(); size = 0
    opener = urllib.request.build_opener(SafeRedirect())
    with opener.open(urllib.request.Request(url, headers={"User-Agent": "Quackpot-Plan53"}), timeout=30) as response, archive.open("xb") as output:
        while True:
            block = response.read(1024 * 1024)
            if not block:
                break
            size += len(block)
            if size > size_expected:
                raise ValueError("archive exceeds expected size")
            digest.update(block); output.write(block)
    if size != size_expected or "sha256:" + digest.hexdigest() != algorithm_hash:
        raise ValueError("Python archive verification failed")
    target.mkdir()
    # Python 3.14's data filter rejects paths and links escaping the target.
    with tarfile.open(archive, "r:gz") as source:
        source.extractall(target, filter="data")
    print("Python archive size and upstream SHA-256 verified; extracted under dedicated workspace")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("expected one external workspace path")
    try:
        main(sys.argv[1])
    except Exception as exc:
        print("Python acquisition failed: " + type(exc).__name__, file=sys.stderr)
        sys.exit(1)
