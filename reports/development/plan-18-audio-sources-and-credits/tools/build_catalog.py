#!/usr/bin/env python3
"""Plan 18 expansion: build the audition catalog from catalog/selection.json.

    python tools/build_catalog.py <scratch-dir> <report-dir>

<scratch-dir> holds the untrusted downloaded archives under dl/ (re-downloadable from the URLs and
SHA-256 values recorded in catalog/sources.json). One short single-process run using only the standard
library. It
  * extracts the selected members/files into audio/<group>/qp18-NNNN.<ext> (originals of owner-downloaded
    Freesound files and the v1 Kenney files stay where they are and are referenced, not copied),
  * makes the few trimmed derivatives (originals untouched, operation recorded),
  * probes every file (tools/audio_probe.py), hashes it, derives an attenuation-only audition gain,
  * writes catalog/catalog.json, catalog/catalog-data.js (embedded data for file://), catalog/notices/*.txt
    and catalog/ATTRIBUTIONS.md.
Selection is a candidate list for the owner to audition; nothing here is an adopted production choice.
"""
import hashlib, json, os, shutil, struct, sys, zipfile, array, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audio_probe

scratch, report = sys.argv[1], sys.argv[2]
REVISION = "2026-10-28.1"
GEN_DATE = "2026-10-28"
j = lambda *p: os.path.join(*p)

ROLES = [
    ("duck", "Duck vocalizations", "Quacks and toy/cartoon duck voices. Three tones so a pool can mix or stay in one family.",
     [("naturalistic", "Naturalistic", "Recorded ducks."), ("toy", "Rubber / toy", "Squeaks and toy quacks."),
      ("cartoon", "Cartoon / voiced", "Human-voiced or processed quacks; NOT duck recordings.")]),
    ("ui", "UI confirm, navigate, dismiss", "Interface cues. Not every button needs a sound.",
     [("confirm-navigate", "Confirm / navigate", ""), ("dismiss-back", "Dismiss / back", "")]),
    ("card", "Card turn, shuffle, reveal", "Card handling. Anticipation accents: none found (a reported gap).",
     [("turn-shuffle-reveal", "Turn / shuffle / reveal", ""), ("anticipation", "Anticipation accent", "No acceptable candidate found yet.")]),
    ("reward", "Rewards and rarity accents", "Success chimes and restrained rarity accents.",
     [("success-chime", "Success chimes", ""), ("rarity-accent", "Rarity accents", "")]),
    ("dup", "Duplicate conversion (Down)", "Soft descending or deflating cues.", [("down", "Down / conversion", "")]),
    ("race", "Race start and finish", "Start and finish cues.", [("start", "Start", ""), ("finish", "Finish", "")]),
    ("crowd", "Audience reactions", "Cheer and applause. Gasp / aww / disappointment: no acceptable candidate found (a reported gap).",
     [("cheer-applause", "Cheer / applause", ""), ("gasp-aww", "Gasp / aww", "No acceptable candidate found yet.")]),
    ("contact", "Contact, splash, recovery", "Duck/wall bumps, water splashes and recovery accents.",
     [("bump", "Soft bump", ""), ("splash", "Splash / water", ""), ("recovery", "Recovery / wobble", "")]),
    ("meta", "Metagame: phone, paper, coins, apartment", "Apartment-side cues.",
     [("phone", "Phone notification", ""), ("paper", "Paper / Receipt", ""), ("coins", "Coins / purchase", ""), ("apartment", "Apartment objects", "")]),
    ("ambience", "Optional ambience (rain)", "Separate optional section. Weather audio is NOT approved for production.",
     [("rain", "Rain", "")]),
]

CC = {
    "CC0": ("CC0", "1.0", "https://creativecommons.org/publicdomain/zero/1.0/", False),
    "CC-BY 3.0": ("CC BY", "3.0", "https://creativecommons.org/licenses/by/3.0/", True),
    "CC-BY 4.0": ("CC BY", "4.0", "https://creativecommons.org/licenses/by/4.0/", True),
}

sources = {s["key"]: s for s in json.load(open(j(report, "catalog", "sources.json"), encoding="utf-8"))["sources"]}
intake = {r["intakeId"]: r for r in json.load(open(j(report, "catalog", "intake", "freesound-intake.json"), encoding="utf-8"))["records"]}
selection = json.load(open(j(report, "catalog", "selection.json"), encoding="utf-8"))["items"]

# v1 Kenney records (docs: provenance.md in archive/v1-2026-10-25). Root verified the official PACK pages on 2026-10-28;
# these three files came from a 2014-snapshot mirror, so member-to-current-pack equality is NOT established.
KENNEY_V1 = {
    "audio/click1.wav": ("Click 1", "UI Audio", "https://kenney.nl/assets/ui-audio", "https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio/click1.wav"),
    "audio/cardSlide1.ogg": ("Card Slide 1", "Casino Audio", "https://kenney.nl/assets/casino-audio", "https://raw.githubusercontent.com/iwenzhou/kenney/master/Audio%20(295%20files)/Casino%20sounds%20(50%20sounds)/cardSlide1.ogg"),
    "audio/jingles_STEEL00.ogg": ("Steel Jingle 00", "Music Jingles", "https://kenney.nl/assets/music-jingles", "https://raw.githubusercontent.com/iwenzhou/kenney/master/Audio%20(295%20files)/Jingle%20sounds%20(85%20sounds)/jingles_STEEL/jingles_STEEL00.ogg"),
}


def sha256(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def norm_creator(a):
    if not a:
        return None
    if "(Submitted by" in a:
        who, by = a.split("(Submitted by", 1)
        return f"{who.strip()} (uploaded to OpenGameArt by {by.strip(' )')})"
    return a


def derive_wav(src, dst, d):
    b = open(src, "rb").read()
    info = audio_probe.wav_info(src)
    ch, sr, bits = info["channels"], info["sampleRate"], info["bitDepth"]
    assert info["formatTag"] == 1 and bits in (16, 24), "derive supports 16/24-bit PCM only"
    p = 12
    while p + 8 <= len(b):
        cid, sz = b[p:p + 4], struct.unpack_from("<I", b, p + 4)[0]
        if cid == b"data":
            data = b[p + 8:p + 8 + min(sz, len(b) - p - 8)]
            break
        p += 8 + sz + (sz & 1)
    bw = bits // 8
    frames = len(data) // (ch * bw)
    blk = max(1, sr // 100)  # 10 ms blocks
    def sample(i):
        o = i * bw
        return int.from_bytes(data[o:o + bw], "little", signed=True)
    env = []
    for k in range(0, frames, blk):
        m = 0
        for f in range(k, min(frames, k + blk)):
            for c in range(ch):
                m = max(m, abs(sample(f * ch + c)))
        env.append(m)
    thr = d["thresholdFrac"] * max(env)
    first = next(i for i, e in enumerate(env) if e >= thr)
    start = max(0, first * blk - int(d["preRollS"] * sr))
    end = min(frames, start + int(d["lengthS"] * sr))
    n = end - start
    fade = int(d["fadeMs"] / 1000 * sr)
    out = bytearray()
    for f in range(n):
        g = min(1.0, (f + 1) / fade, (n - f) / fade)
        for c in range(ch):
            v = int(round(sample((start + f) * ch + c) * g))
            out += v.to_bytes(bw, "little", signed=True)
    hdr = b"RIFF" + struct.pack("<I", 36 + len(out)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, ch, sr, sr * ch * bw, ch * bw, bits) + b"data" + struct.pack("<I", len(out))
    open(dst, "wb").write(hdr + out)
    return {"operation": "trim+fade", "startS": round(start / sr, 3), "lengthS": round(n / sr, 3), "fadeMs": d["fadeMs"],
            "rule": f"start {d['preRollS']} s before the first 10 ms block whose peak reaches {int(d['thresholdFrac'] * 100)}% of the file's loudest block",
            "tool": "tools/build_catalog.py (standard-library Python, no resampling or gain change)"}


def lic_from_source(src, rec):
    """Returns (license dict, creator, source dict, evidence scope)."""
    lib = src["library"]
    if lib == "OpenGameArt.org":
        names = [l["name"] for l in src["licensesShownOnPage"]]
        elected = "CC0" if "CC0" in names else names[0]
        n, v, u, att = CC[elected]
        lic = {"name": n, "version": v, "url": u, "shownOnPage": names, "attributionRequired": att,
               "scope": "OpenGameArt entry page license box (applies to the entry's files as shown; not a per-file page)",
               "note": "Dual-licensed entry; CC0 elected." if len(names) > 1 else None}
        s = {"library": lib, "entryUrl": src["entryUrl"], "entryTitle": src["entryTitle"], "authorField": src["authorField"],
             "collaborators": src.get("collaborators"), "pagePostDate": src["pagePostDate"], "retrievedOn": src["retrievedOn"]}
        return lic, norm_creator(src["authorField"]), s
    if lib == "Wikimedia Commons":
        name = src["licenseShortName"]
        if name == "CC0":
            n, v, u, att = CC["CC0"]
        else:
            n, v, u, att = "Public domain", None, None, False
        lic = {"name": n, "version": v, "url": src["licenseUrl"] or u, "shownOnPage": [name], "attributionRequired": att,
               "scope": "Wikimedia Commons file page (extmetadata via API)", "note": "Public-domain claim as stated on the Commons file page; upstream source: " + (src.get("credit") or "n/a") if name != "CC0" else None}
        s = {"library": lib, "entryUrl": src["entryUrl"], "entryTitle": src["entryTitle"], "artist": src["artist"], "credit": src["credit"], "retrievedOn": src["retrievedOn"]}
        return lic, src["artist"], s
    if lib == "Internet Archive":
        lic = {"name": "CC0", "version": "1.0", "url": src["licenseUrl"], "shownOnPage": ["CC0 1.0 (item licenseurl)"], "attributionRequired": False,
               "scope": "Internet Archive item-level license URL", "note": src["note"]}
        s = {"library": lib, "entryUrl": src["entryUrl"], "entryTitle": src["entryTitle"], "uploader": src["uploader"], "retrievedOn": src["retrievedOn"]}
        return lic, "USC Cinema/Sunset Editorial 'Red Library' (uploaded by " + src["uploader"] + ")", s
    raise KeyError(lib)


files, used_sources, counter = [], {}, 0
ledger_bytes_new = 0
for item in selection:
    counter += 1
    fid = f"qp18-{counter:04d}"
    group = item["roles"][0].split(".")[0]
    srcname = item["src"]
    derivation, flags = None, list(item.get("flags", []))
    # --- resolve source + original path ------------------------------------------------------------------
    if srcname == "fs":
        r = intake[item["intake"]]
        lic = {"name": r["license"]["name"], "version": r["license"]["version"], "url": r["license"]["url"],
               "shownOnPage": [r["license"]["displayedOnPage"]], "attributionRequired": r["license"]["attributionRequired"],
               "scope": "Freesound sound page (file level), read from owner screenshot", "note": None}
        creator = r["source"]["uploader"]
        source = {"library": "Freesound", "entryUrl": r["source"]["assetPageUrl"], "entryTitle": r["source"]["title"], "soundId": r["source"]["soundId"],
                  "retrievedOn": r["source"]["retrievedOn"], "retrievedBy": r["source"]["retrievedBy"], "pageDateUploaded": r["source"]["pageDateUploaded"],
                  "chain": r.get("remixSource") or r.get("derivedFrom")}
        orig = r["local"]["path"]
        flags += [f for f in r["flags"] if f in ("human-made-label", "human-imitation-not-a-duck", "long-needs-trim", "96kHz-source")]
        attrib_url = f"https://freesound.org/s/{r['source']['soundId']}/"
        sk = "freesound-" + r["source"]["soundId"]
        used_sources[sk] = {"type": "freesound", "intake": r}
        dl_info = [{"url": attrib_url, "bytes": r["local"]["bytes"], "sha256": r["local"]["sha256"], "note": "owner download with own login; unmodified original kept in repo"}]
        scope_level = "file-page"
    elif srcname == "kenney-v1":
        path = item["path"]
        t, pack, packurl, mirror = KENNEY_V1[path]
        lic = {"name": "CC0", "version": "1.0", "url": "https://creativecommons.org/publicdomain/zero/1.0/", "shownOnPage": ["Creative Commons CC0 (pack page)"],
               "attributionRequired": False, "scope": f"Kenney '{pack}' PACK page, verified directly by root 2026-10-28 (pack-level primary evidence)",
               "note": "Member provenance PENDING: retrieved from a mirror of a 2014-era snapshot; equality with the current official pack archive is not established."}
        creator = "Kenney (www.kenney.nl)"
        source = {"library": "Kenney.nl", "entryUrl": packurl, "entryTitle": f"{pack} (pack)", "retrievedOn": "2025-10-25 (v1 audition)", "mirror": mirror}
        orig = path
        flags.append("member-provenance-pending")
        sk = "kenney-" + pack.lower().replace(" ", "-")
        used_sources.setdefault(sk, {"type": "kenney", "pack": pack, "url": packurl, "mirror": mirror})
        dl_info = [{"url": mirror, "note": "v1 mirror retrieval (2025-10-25); hash recorded in v1 provenance and re-hashed here"}]
        scope_level = "pack-level"
        attrib_url = packurl
    else:
        src = sources[srcname]
        lic, creator, source = lic_from_source(src, item)
        if item.get("chain"):
            source["chain"] = item["chain"]
        dls = {os.path.basename(d["dest"]): d for d in src["downloads"]}
        if "kenney" in srcname:
            raise SystemExit("unexpected")
        fname = item["file"]
        ledger = dls.get(fname) or dls.get(fname.replace(" ", "_"))
        if ledger is None:
            raise SystemExit(f"no ledger entry for {srcname} {fname}; have {list(dls)}")
        dl_path = j(scratch, ledger["dest"])
        ext = os.path.splitext(item.get("member") or fname)[1].lower()
        out_rel = f"audio/{group}/{fid}{ext}"
        os.makedirs(j(report, "audio", group), exist_ok=True)
        if "member" in item:
            zf = zipfile.ZipFile(dl_path)
            open(j(report, out_rel), "wb").write(zf.read(item["member"]))
            derivation = {"operation": "none (extracted unmodified)", "archive": fname, "archiveSha256": ledger["sha256"], "member": item["member"]}
        else:
            shutil.copyfile(dl_path, j(report, out_rel))
            derivation = {"operation": "none (copied unmodified)", "downloadedFile": fname, "downloadSha256": ledger["sha256"]}
        orig = None
        dl_info = [{"url": ledger["url"], "bytes": ledger["bytes"], "sha256": ledger["sha256"], "retrievedOn": ledger["retrievedOn"]}]
        sk = srcname
        used_sources.setdefault(sk, {"type": "source", "src": src, "downloads": []})
        used_sources[sk]["downloads"].append({"file": fname, "member": item.get("member"), "id": fid})
        scope_level = "entry-page" if lic["scope"].startswith("OpenGameArt") else ("file-page" if "Commons" in lic["scope"] else "item-level")
        attrib_url = source["entryUrl"]
    # --- final local path (+ optional derivative) -----------------------------------------------------------
    if srcname in ("fs", "kenney-v1"):
        if "derive" in item:
            os.makedirs(j(report, "audio", group), exist_ok=True)
            out_rel = f"audio/{group}/{fid}.wav"
            d = derive_wav(j(report, orig), j(report, out_rel), item["derive"])
            derivation = dict(d, original=orig, originalSha256=sha256(j(report, orig)))
            local_rel = out_rel
        else:
            local_rel = orig
            derivation = {"operation": "none (unmodified original, referenced in place)", "original": orig}
    else:
        local_rel = out_rel
    abspath = j(report, local_rel)
    pr = audio_probe.probe(abspath)
    sha = sha256(abspath)
    # --- audition gain: attenuation only, whole-file-RMS based, measured WAV only -------------------------
    gain, gnote = 0.0, "no attenuation (level unmeasured; lossy file not decoded)"
    if "rmsDbfs" in pr and pr["rmsDbfs"] is not None:
        gain = round(max(-18.0, min(0.0, -30.0 - pr["rmsDbfs"])), 1)
        gnote = "attenuation toward -30 dBFS whole-file RMS, capped at -18 dB; approximate, NOT loudness-equalized"
        if pr["peakDbfs"] is not None and pr["peakDbfs"] < -20:
            flags.append("quiet")
    # --- notices --------------------------------------------------------------------------------------------
    if lic["attributionRequired"]:
        chain = source.get("chain")
        attribution = f'"{item["title"]}" by {creator} ({attrib_url}), licensed {lic["name"]} {lic["version"]} ({lic["url"]}).'
        if chain:
            attribution += f' Remix/derivative of "{chain["title"]}" by {chain["uploader"]} ({chain["pageUrl"]}).'
    else:
        attribution = f'Optional credit: "{item["title"]}" by {creator} ({attrib_url}), {lic["name"]}{" " + lic["version"] if lic["version"] else ""}.'
    if derivation and derivation.get("operation") == "trim+fade":
        change = f'Changed: excerpt of {derivation["lengthS"]} s starting {derivation["startS"]} s into the original with {derivation["fadeMs"]} ms fades; no other processing. Original unmodified at {derivation["original"]}.'
    elif srcname == "kenney-v1":
        change = "No changes (kept as retrieved for the v1 audition)."
    elif "member" in item:
        change = f'No changes to the audio; extracted from archive {item["file"]}.'
    else:
        change = "No changes."
    if item.get("derive") is None and srcname == "fs" and item["intake"] == "fs-818396":
        change += " Note: this Freesound sound is itself a remix (see chain)."
    ownerfmt = {"fs-748": None}
    files.append({
        "id": fid, "title": item["title"], "creator": creator, "roles": item["roles"], "note": item["note"], "flags": sorted(set(flags)),
        "source": source, "license": lic, "licenseEvidenceScope": scope_level,
        "local": {"path": local_rel.replace("\\", "/"), "sha256": sha, "bytes": os.path.getsize(abspath), "container": pr["container"],
                  "codec": pr.get("codec"), "sampleRate": pr.get("sampleRate"), "channels": pr.get("channels"), "bitDepth": pr.get("bitDepth"),
                  "formatTag": pr.get("formatTag"), "kbps": pr.get("kbps"), "durationS": pr["durationS"], "durationBasis": pr.get("durationBasis", "container metadata / PCM data length"),
                  "peakDbfs": pr.get("peakDbfs"), "rmsDbfs": pr.get("rmsDbfs"), "levels": pr["levels"]},
        "auditionGainDb": gain, "auditionGainNote": gnote,
        "derivation": derivation, "downloads": dl_info, "attributionText": attribution, "changeNotice": change,
        "sourceKey": sk,
    })

# shared files must appear once: ensure no duplicate paths
paths = [f["local"]["path"] for f in files]
assert len(paths) == len(set(paths)), "duplicate local path"

MUSIC = [
    {"id": "qp18-m01", "title": "Chill lofi inspired [loop edit]", "creator": "omfgdude (composer); qubodup (loop edit)", "path": "audio/chilllofir-loop.ogg",
     "license": {"name": "CC0", "version": "1.0", "url": "https://creativecommons.org/publicdomain/zero/1.0/"}, "source": "https://opengameart.org/content/chill-lofi-inspired-loop-edit",
     "sha256": "ccaa02bb60310146f1fa3b1c70be0a5a57f0674b9c4944a22b85b0c03e932cdb", "durationS": 97.216, "note": "Existing v1 music candidate, unchanged.",
     "licenseScope": "OpenGameArt entry page license box as recorded in the v1 provenance (2026-10-25); per-entry, not per-file.",
     "attributionText": 'Optional credit (CC0): "Chill lofi inspired [loop edit]" by omfgdude (composer), made loopable by qubodup (OpenGameArt.org), CC0 1.0 Universal.',
     "changeNotice": "No changes: the seamless Ogg loop edit as published by qubodup, kept bit-identical (see archive/v1-2026-10-25/provenance.md).",
     "provenanceRef": "archive/v1-2026-10-25/provenance.md (Asset 4)"},
    {"id": "qp18-m02", "title": "Fluffing a Duck", "creator": "Kevin MacLeod (incompetech.com)", "path": "audio/fluffing-a-duck.ogg",
     "license": {"name": "CC BY", "version": "3.0", "url": "https://creativecommons.org/licenses/by/3.0/"}, "source": "https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_Fluffing_a_Duck.ogg",
     "sha256": "2e38f6d769351fb1f763ebaa387ee24f9c8693391f9888d6b304d1adafa9253d", "durationS": 67.37,
     "attributionText": '"Fluffing a Duck" by Kevin MacLeod (incompetech.com), licensed under Creative Commons Attribution 3.0 Unported (CC BY 3.0) https://creativecommons.org/licenses/by/3.0/',
     "note": "Existing v1 music candidate, unchanged.",
     "licenseScope": "Wikimedia Commons file page for the exact file, as recorded in the v1 provenance (2026-10-25); CC BY 3.0 Unported, not the later CC BY 4.0 catalog offer.",
     "changeNotice": "No changes: the Ogg Vorbis file exactly as downloaded from Wikimedia Commons (upstream: Free Music Archive, album 'Oddities').",
     "provenanceRef": "archive/v1-2026-10-25/provenance.md (Asset 5)"},
]
for m in MUSIC:
    assert sha256(j(report, m["path"])) == m["sha256"], m["id"]

GAPS = [
    "Card anticipation / riser accent: no acceptable CC0/CC BY candidate found (the one rising-sound set was in AIFF, which Chrome/Firefox cannot play).",
    "Crowd gasp / aww / disappointment: none found that was acceptable.",
    "Race podium sting and toy horn: none found.",
    "Soft rubber duck/wall bump: only generic soft clunks; none specifically rubber.",
    "Couch/cushion, stamp, receipt-printer tear, mug set-down: none found without a login or ambiguous license.",
]
QUARANTINED = [
    "SoundBible leads (8): page shows only an 'Attribution 3.0' label with no CC name/link; exact-file terms not settled; not promoted.",
    "Free Sounds Library duck leads (4): CC BY 4.0 label but no creator named, so attribution cannot be satisfied.",
    "BigSoundBank 'Ducks': site wording differs from the CC0 deed; unresolved.",
    "Freesound items other than the 14 owner-provided: download requires a login.",
    "Large archives not downloaded (over the ~15 MiB rule): 'Free Crowd Cheering Sounds' (19.6 MB, CC BY 4.0), 'amb_rain2' (18.8-75.5 MB), 'Sound Effects Pack' (142 MB), an Internet Archive 162.8 MB item.",
    "7z archives (door sets, GUI sounds by Lokif, water splashes) not opened: no extractor without installing software.",
    "Thunder (rumble/thunder loops) kept as a future-weather lead only; not in this audition.",
    "Commons 'Cash register' PD claim cites a SoundBible origin; quarantined with SoundBible.",
]

catalog = {
    "schemaVersion": 1, "catalogRevision": REVISION, "generatedOn": GEN_DATE,
    "statement": "Candidates for owner audition. Selection here is not an adopted production choice; licenses are as read from the cited pages on 2026-10-28; nothing was auditioned by the builder (picks are name/metadata based).",
    "roles": [{"id": r, "label": l, "blurb": b, "subpools": [{"id": f"{r}.{s}", "label": sl, "blurb": sb} for s, sl, sb in subs]} for r, l, b, subs in ROLES],
    "files": files, "music": MUSIC, "gaps": GAPS, "quarantined": QUARANTINED,
}
cat_json = json.dumps(catalog, indent=1, ensure_ascii=True)
open(j(report, "catalog", "catalog.json"), "w", encoding="utf-8").write(cat_json + "\n")
open(j(report, "catalog", "catalog-data.js"), "w", encoding="ascii").write(
    "/* generated by tools/build_catalog.py; embedded so the page works from file:// */\nwindow.QP18_CATALOG = " + json.dumps(catalog, ensure_ascii=True) + ";\n")

# --- notices -----------------------------------------------------------------------------------------------
os.makedirs(j(report, "catalog", "notices"), exist_ok=True)
for sk, u in used_sources.items():
    lines = [f"Source record {sk} (captured 2026-10-28)", ""]
    if u["type"] == "freesound":
        r = u["intake"]
        lines += [f"Library: Freesound", f"Sound page: {r['source']['assetPageUrl']}", f"Title: {r['source']['title']}", f"Uploader: {r['source']['uploader']}",
                  f"License shown on page: {r['license']['displayedOnPage']} ({r['license']['name']} {r['license']['version']}) {r['license']['url']}",
                  f"Retrieved by: {r['source']['retrievedBy']}", f"File: {r['local']['downloadedFilename']}  sha256 {r['local']['sha256']}",
                  f"Description excerpt: {r['descriptionExcerpt']}"]
        if r.get("remixSource"):
            lines.append("Remix source: " + json.dumps(r["remixSource"]))
        if r.get("derivedFrom"):
            lines.append("Derived from: " + json.dumps(r["derivedFrom"]))
    elif u["type"] == "kenney":
        lines += [f"Library: Kenney.nl, pack '{u['pack']}'", f"Official pack page (verified by root 2026-10-28): {u['url']}",
                  "Official support: credit optional; if crediting use 'Kenney' and not the logo.", f"Mirror used in v1: {u['mirror']}",
                  "Member provenance pending (2014-era mirror snapshot)."]
    else:
        s = u["src"]
        lines += [f"Library: {s['library']}", f"Entry page: {s['entryUrl']}", f"Entry title: {s['entryTitle']}"]
        for k in ("authorField", "collaborators", "pagePostDate", "artist", "credit", "uploader", "licenseShortName", "licenseUrl", "descriptionExcerpt"):
            if s.get(k):
                lines.append(f"{k}: {s[k]}")
        if s.get("licensesShownOnPage"):
            lines.append("Licenses shown on page: " + "; ".join(f"{l['name']} ({l['url']})" for l in s["licensesShownOnPage"]))
        for d in s["downloads"]:
            lines.append(f"Downloaded: {d['url']}  {d['bytes']} bytes  sha256 {d['sha256']}  retrieved {d['retrievedOn']}")
        lines.append("Files used from this source: " + "; ".join(f"{x['id']} <- {x['file']}" + (f"::{x['member']}" if x["member"] else "") for x in u["downloads"]))
    open(j(report, "catalog", "notices", sk + ".txt"), "w", encoding="utf-8").write("\n".join(lines) + "\n")

# --- ATTRIBUTIONS.md ---------------------------------------------------------------------------------------
md = ["# Auditionable recordings: sources, licenses, changes", "",
      f"Catalog revision {REVISION}. Generated by `tools/build_catalog.py`; do not edit. Lists ALL bundled/auditionable recordings, not only any later selection. "
      "Licenses are as read from the cited pages; see `catalog/notices/` for the captured page notices.", ""]
for f in files:
    L = f["license"]
    md += [f"## {f['id']} {f['title']}", f"- Creator: {f['creator']}", f"- Source: {f['source']['entryUrl']}",
           f"- License: {L['name']} {L['version'] or ''} {L['url'] or ''} (evidence: {L['scope']})",
           f"- Local file: `{f['local']['path']}`  sha256 `{f['local']['sha256']}`", f"- Credit text: {f['attributionText']}", f"- Changes: {f['changeNotice']}", ""]
for m in MUSIC:
    md += [f"## {m['id']} {m['title']} (music)", f"- Creator: {m['creator']}", f"- Source: {m['source']}",
           f"- License: {m['license']['name']} {m['license']['version']} {m['license']['url']} (evidence: {m['licenseScope']})",
           f"- Local file: `{m['path']}`  sha256 `{m['sha256']}`", f"- Credit text: {m['attributionText']}", f"- Changes: {m['changeNotice']}",
           f"- Provenance record: {m['provenanceRef']}", ""]
open(j(report, "catalog", "ATTRIBUTIONS.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")

tot_new = sum(os.path.getsize(j(report, f["local"]["path"])) for f in files if f["local"]["path"].startswith("audio/") and not f["local"]["path"].startswith("audio/_originals") and f["sourceKey"] not in ("kenney-ui-audio", "kenney-casino-audio", "kenney-music-jingles"))
print(f"{len(files)} files cataloged; new extracted/derived bytes in audio/<group>/: {tot_new}")
print("flags:", sorted({fl for f in files for fl in f['flags']}))
