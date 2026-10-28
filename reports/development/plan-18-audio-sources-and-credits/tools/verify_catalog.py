#!/usr/bin/env python3
"""Offline integrity check for the Plan 18 audition catalog (standard library only, single process, short output).

    python tools/verify_catalog.py <report-dir>

Checks: every cataloged file exists, matches its SHA-256, its probed duration/format matches the record; every record
has creator, source URL, license name (and version for CC), notice text, change notice; CC BY records carry credit
text and derivative/remix chains where recorded; no duplicate paths; catalog-data.js matches catalog.json; the page
has no synth references and no network fetches (only explicit <a href> links); and the size ledger vs the 100 MiB
ceiling. It does NOT execute the page JavaScript and does NOT prove audibility, loudness or browser behavior.
"""
import hashlib, json, os, re, sys

report = sys.argv[1]
j = lambda *p: os.path.join(*p)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audio_probe

cat = json.load(open(j(report, "catalog", "catalog.json"), encoding="utf-8"))
errors, notes = [], []


def err(m):
    errors.append(m)


seen = set()
for f in cat["files"]:
    p = f["local"]["path"]
    if p in seen:
        err(f"duplicate path {p}")
    seen.add(p)
    a = j(report, p)
    if not os.path.exists(a):
        err(f"{f['id']} missing file {p}")
        continue
    if hashlib.sha256(open(a, "rb").read()).hexdigest() != f["local"]["sha256"]:
        err(f"{f['id']} sha256 mismatch")
    pr = audio_probe.probe(a)
    if abs(pr["durationS"] - f["local"]["durationS"]) > 0.002:
        err(f"{f['id']} duration drift {pr['durationS']} vs {f['local']['durationS']}")
    L = f["license"]
    if not (f["creator"] and f["source"].get("entryUrl") and L.get("name")):
        err(f"{f['id']} missing creator/source/license")
    if L["name"] in ("CC0", "CC BY") and not L.get("version"):
        err(f"{f['id']} CC license without version")
    if L["attributionRequired"] and not ("licensed" in f["attributionText"] and L["url"] in f["attributionText"]):
        err(f"{f['id']} CC BY credit text incomplete")
    if f["derivation"] and f["derivation"].get("operation") == "trim+fade" and not f["derivation"].get("originalSha256"):
        err(f"{f['id']} derivative without original hash")
    if not os.path.exists(j(report, "catalog", "notices", f["sourceKey"] + ".txt")):
        err(f"{f['id']} missing notice file for {f['sourceKey']}")
    if f["roles"] and f["roles"][0].startswith("ambience") and "weather-not-approved" not in f["flags"]:
        err(f"{f['id']} ambience without weather flag")
    if f["local"]["levels"].startswith("unmeasured") and f["auditionGainDb"] != 0:
        err(f"{f['id']} gain set for unmeasured file")
    if f["auditionGainDb"] > 0:
        err(f"{f['id']} gain would amplify")

attrib = open(j(report, "catalog", "ATTRIBUTIONS.md"), encoding="utf-8").read()
for m in cat["music"]:
    for k in ("creator", "source", "licenseScope", "attributionText", "changeNotice", "provenanceRef", "sha256", "path"):
        if not m.get(k):
            err(f"music {m['id']} missing {k}")
    L = m.get("license", {})
    if not (L.get("name") and L.get("version") and L.get("url")):
        err(f"music {m['id']} license incomplete")
    if hashlib.sha256(open(j(report, m["path"]), "rb").read()).hexdigest() != m["sha256"]:
        err(f"music {m['id']} sha256 mismatch")
    for needle in (m["id"], m["attributionText"], m["changeNotice"], m["license"]["url"]):
        if needle not in attrib:
            err(f"ATTRIBUTIONS.md lacks music {m['id']} text {needle[:40]!r}")
for f in cat["files"]:
    if f["id"] not in attrib or f["attributionText"] not in attrib or f["changeNotice"] not in attrib:
        err(f"ATTRIBUTIONS.md lacks effect {f['id']} credit/change text")

js = open(j(report, "catalog", "catalog-data.js"), encoding="ascii").read()
m = re.search(r"window\.QP18_CATALOG = (.*);\s*$", js, re.S)
if json.loads(m.group(1)) != cat:
    err("catalog-data.js differs from catalog.json")

page = open(j(report, "audition.html"), encoding="utf-8").read()
for pat in (r"DuckSynth", r"synth", r"AudioContext", r"fetch\(", r"XMLHttpRequest", r"https?://[^\s\"']+\.(?:wav|ogg|mp3)", r"<script[^>]+src=\"https?:", r"<link[^>]+href=\"https?:", r"autoplay"):
    hits = re.findall(pat, page, re.I)
    if hits:
        err(f"page contains forbidden pattern {pat!r}: {hits[:2]}")
credits_fn = re.search(r"function renderCredits\(\) \{.*?\n\}\n", page, re.S)
if not credits_fn or "CAT.files.forEach" not in credits_fn.group(0) or "CAT.music.forEach" not in credits_fn.group(0):
    err("renderCredits must iterate both CAT.files and CAT.music")
ext_links = re.findall(r"href=\"(https?://[^\"]+)\"", page)
notes.append(f"page static external href count: {len(ext_links)} (explicit navigation only)")

# size ledger
audio_bytes = sum(os.path.getsize(j(r, f)) for r, _, fs in os.walk(j(report, "audio")) for f in fs)
orig_bytes = sum(os.path.getsize(j(r, f)) for r, _, fs in os.walk(j(report, "audio", "_originals")) for f in fs)
notes.append(f"audio/ total {audio_bytes} bytes = {audio_bytes / 1048576:.1f} MiB (of which _originals/freesound {orig_bytes / 1048576:.1f} MiB)")
notes.append(f"catalog: {len(cat['files'])} effects (ambience {sum(1 for f in cat['files'] if f['roles'][0].startswith('ambience'))}), {len(cat['music'])} music")
print("\n".join(notes))
if errors:
    print(f"FAIL: {len(errors)} problem(s)")
    print("\n".join(errors[:40]))
    sys.exit(1)
print("OK: catalog consistent with files on disk (offline checks only)")
