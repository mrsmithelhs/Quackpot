"""Collect bounded public metadata, never package/model bodies or credentials."""
import datetime
from html.parser import HTMLParser
import json
import sys
import urllib.parse
import urllib.request

LIMIT = 2_000_000


def request(url, method="GET"):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "Quackpot-Plan53-metadata"})
    with urllib.request.urlopen(req, timeout=15) as response:
        if method == "HEAD":
            return {key: response.headers.get(key) for key in ("Content-Length", "ETag", "Last-Modified", "oc-checksum")}
        data = response.read(LIMIT + 1)
        if len(data) > LIMIT:
            raise ValueError("metadata response exceeds bound")
        return data


def get_json(url):
    return json.loads(request(url))


class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.links.append(dict(attrs))


def torch_wheel(name):
    index = f"https://download.pytorch.org/whl/cu128/{name}/"
    parser = Links(); parser.feed(request(index).decode())
    suffix = f"{name}-2.8.0+cu128-cp312-cp312-win_amd64.whl"
    matches = [a for a in parser.links if urllib.parse.unquote(urllib.parse.urlsplit(a.get("href", "")).path).endswith(suffix)]
    if len(matches) != 1:
        raise ValueError(f"expected exactly one {name} wheel")
    link = matches[0]["href"]; url, fragment = urllib.parse.urldefrag(link)
    digest = urllib.parse.parse_qs(fragment).get("sha256", [])
    if len(digest) != 1 or len(digest[0]) != 64:
        raise ValueError("missing SHA-256")
    head = request(url, "HEAD")
    return {"filename": suffix, "index": index, "url": url, "size_bytes": int(head["Content-Length"]), "sha256_from_index": digest[0], "metadata_sha256": matches[0].get("data-core-metadata")}


def main():
    release = get_json("https://api.github.com/repos/astral-sh/python-build-standalone/releases/tags/20260623")
    name = "cpython-3.12.13+20260623-x86_64-pc-windows-msvc-install_only_stripped.tar.gz"
    assets = [x for x in release["assets"] if x["name"] == name]
    if len(assets) != 1:
        raise ValueError("Python release asset missing or ambiguous")
    asset = assets[0]
    packages = []
    for package, version in (("muscriptor", "0.4.0"), ("beat-this", "1.1.0")):
        data = get_json(f"https://pypi.org/pypi/{package}/{version}/json")
        wheels = [x for x in data["urls"] if x["filename"].endswith("-py3-none-any.whl")]
        if len(wheels) != 1:
            raise ValueError("PyPI wheel missing or ambiguous")
        wheel = wheels[0]
        packages.append({"name": package, "version": version, "filename": wheel["filename"], "url": wheel["url"], "size_bytes": wheel["size"], "sha256_from_pypi": wheel["digests"]["sha256"], "requires_dist": data["info"]["requires_dist"]})
    model = get_json("https://huggingface.co/api/models/MuScriptor/muscriptor-medium?blobs=true")
    files = [x for x in model["siblings"] if x["rfilename"] == "model.safetensors"]
    if len(files) != 1:
        raise ValueError("model file missing or ambiguous")
    f = files[0]
    beat_url = "https://cloud.cp.jku.at/public.php/dav/files/7ik4RrBKTS273gp/final0.ckpt"
    manifest = {"collected_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "purpose": "candidate metadata; not a dependency lock or download authorization",
                "python": {"filename": name, "url": asset["browser_download_url"], "size_bytes": asset["size"], "digest_from_release": asset["digest"]},
                "pypi_wheels": packages, "cuda_candidates": [torch_wheel("torch"), torch_wheel("torchaudio")],
                "medium_model": {"revision": model["sha"], "gated": model["gated"], "filename": f["rfilename"], "size_bytes": f["size"], "sha256_from_hub": f["lfs"]["sha256"]},
                "beat_checkpoint": {"url": beat_url, "server_headers": request(beat_url, "HEAD"), "independent_sha256": None},
                "unresolved": ["all transitive dependencies and selected wheel hashes", "auxiliary checkpoint independent SHA-256", "actual download and installed footprints", "model revision enforcement", "OS network isolation", "full supervisor"]}
    json.dump(manifest, sys.stdout, indent=2); print()


if __name__ == "__main__":
    main()
