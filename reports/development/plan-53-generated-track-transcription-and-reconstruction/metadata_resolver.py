"""Provisional metadata-only Windows/CPython 3.12 wheel resolution.

Uses installed packaging only; never fetches wheels. This deliberately fails on
conflicts or missing compatible wheels and does not claim solver completeness.
Output is a candidate for review, not an installation lock or authorization.
"""
import json
import sys
import urllib.parse
import urllib.request
import time

from packaging.markers import default_environment
from packaging.requirements import Requirement
from packaging.tags import cpython_tags, compatible_tags
from packaging.utils import canonicalize_name, parse_wheel_filename
from packaging.version import InvalidVersion, Version

LIMIT = 16_000_000
MAX_REQUESTS = 150
DEADLINE = time.monotonic() + 90
ENV = dict(default_environment(), python_version="3.12", python_full_version="3.12.13", os_name="nt", sys_platform="win32", platform_system="Windows", platform_machine="AMD64", implementation_name="cpython", platform_python_implementation="CPython", implementation_version="3.12.13")
TAGS = list(cpython_tags((3, 12), platforms=["win_amd64"])) + list(compatible_tags((3, 12), interpreter="cp312", platforms=["win_amd64"]))
TAG_ORDER = {tag: n for n, tag in enumerate(TAGS)}
cache = {}


def get(name, version=None):
    key = (name, version)
    if key in cache:
        return cache[key]
    if len(cache) >= MAX_REQUESTS:
        raise ValueError("metadata request ceiling reached")
    if time.monotonic() >= DEADLINE:
        raise ValueError("metadata wall-time ceiling reached")
    url = "https://pypi.org/pypi/" + urllib.parse.quote(name) + ("/" + urllib.parse.quote(version) if version else "") + "/json"
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Quackpot-Plan53-metadata"}), timeout=min(10, max(1, DEADLINE - time.monotonic()))) as response:
        data = response.read(LIMIT + 1)
    if len(data) > LIMIT:
        raise ValueError(f"metadata response exceeds limit for {name}")
    cache[key] = json.loads(data)
    return cache[key]


def compatible(file):
    if file.get("yanked") or not file["filename"].endswith(".whl"):
        return None
    try:
        _, _, _, tags = parse_wheel_filename(file["filename"])
    except ValueError:
        return None
    ranks = [TAG_ORDER[t] for t in tags if t in TAG_ORDER]
    return min(ranks) if ranks else None


def select(name, requirements):
    data = get(name)
    versions = []
    for value, files in data["releases"].items():
        try:
            version = Version(value)
        except InvalidVersion:
            continue
        if version.is_prerelease or not all(r.specifier.contains(version) for r in requirements):
            continue
        wheels = [(rank, f) for f in files if (rank := compatible(f)) is not None]
        if wheels:
            versions.append((version, value, min(wheels, key=lambda x: x[0])[1]))
    if not versions:
        raise ValueError(f"no compatible wheel for {name}: {[str(r) for r in requirements]}")
    for _, version, wheel in sorted(versions, reverse=True, key=lambda x: x[0]):
        release = get(name, version)
        requires_python = release["info"].get("requires_python")
        if requires_python:
            from packaging.specifiers import SpecifierSet
            if not SpecifierSet(requires_python).contains("3.12.13"):
                continue
        return version, wheel, release["info"].get("requires_dist") or []
    raise ValueError(f"no Python-compatible wheel for {name}")


def resolve():
    # CUDA-wheel metadata dependencies observed via PEP 658; fixed CUDA wheels
    # are not read from PyPI and therefore must have their dependencies listed.
    roots = [Requirement(x) for x in ("muscriptor==0.4.0", "beat-this==1.1.0", "filelock", "typing-extensions>=4.10.0", "sympy>=1.13.3", "networkx", "jinja2", "fsspec", "setuptools")]
    fixed = {"torch": Version("2.8.0+cu128"), "torchaudio": Version("2.8.0+cu128")}
    previous = None
    selected = {}
    for iteration in range(20):
        pending = list(roots); constraints = {}; extras = {}; processed = set()
        while pending:
            req = pending.pop(); name = canonicalize_name(req.name)
            constraints.setdefault(name, []).append(req)
            extras.setdefault(name, set()).update(req.extras)
            state = (name, tuple(sorted(str(x) for x in constraints[name])), tuple(sorted(extras[name])))
            if state in processed:
                continue
            processed.add(state)
            if name in fixed:
                if not all(x.specifier.contains(fixed[name]) for x in constraints[name]):
                    raise ValueError(f"CUDA candidate conflict for {name}")
                continue
            version, wheel, dependencies = select(name, constraints[name])
            selected[name] = (version, wheel, dependencies)
            for text in dependencies:
                child = Requirement(text)
                if child.marker is None or any(child.marker.evaluate(dict(ENV, extra=e)) for e in ("", *extras[name])):
                    pending.append(child)
            if len(processed) > 1000:
                raise ValueError("dependency traversal ceiling reached")
        result = {name: {"version": selected[name][0], "filename": selected[name][1]["filename"], "url": selected[name][1]["url"], "size_bytes": selected[name][1]["size"], "sha256_from_pypi": selected[name][1]["digests"]["sha256"], "requested_extras": sorted(extras[name]), "requires_dist": selected[name][2]} for name in sorted(constraints) if name not in fixed}
        # Check every selected package's active requirements against the final
        # selection. This is still not a backtracking or wheel-metadata solver.
        for parent, item in result.items():
            for raw in item["requires_dist"]:
                child = Requirement(raw)
                if child.marker and not any(child.marker.evaluate(dict(ENV, extra=e)) for e in ("", *item["requested_extras"])):
                    continue
                name = canonicalize_name(child.name)
                actual = fixed.get(name) or (Version(result[name]["version"]) if name in result else None)
                if actual is None or not child.specifier.contains(actual):
                    raise ValueError(f"final dependency conflict: {parent} requires {child}")
        signature = json.dumps(result, sort_keys=True)
        if signature == previous:
            return {"status": "provisional; independent resolver and installation compatibility unverified", "environment": {k: ENV[k] for k in ("python_version", "python_full_version", "sys_platform", "platform_machine", "implementation_name")}, "cuda_candidates": {k: str(v) for k, v in fixed.items()}, "wheels": result, "pypi_wheel_bytes": sum(x["size_bytes"] for x in result.values()), "metadata_requests": len(cache)}
        previous = signature
    raise ValueError("resolution did not converge")


if __name__ == "__main__":
    try:
        json.dump(resolve(), sys.stdout, indent=2); print()
    except Exception as error:
        print(f"Resolution stopped: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
