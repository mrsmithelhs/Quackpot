#!/usr/bin/env python3
"""Plan 18 expansion: turn saved source pages + download ledger into catalog/sources.json.

One short, single-process, standard-library script. No network access. Inputs are the
scratch folder that holds the saved OpenGameArt HTML pages (oga/<slug>.html), commons.json,
the download ledger (ledger.json) and Internet Archive metadata captured by the research run.

    python tools/capture_sources.py <scratch-dir> <report-dir>

The output records what each source PAGE said when it was read on 2026-10-28; it is evidence,
not a statement that a library-wide license applies to anything else.
"""
import html, json, os, re, sys

scratch, report = sys.argv[1], sys.argv[2]
ledger = {l["url"]: l for l in json.load(open(os.path.join(scratch, "ledger.json")))}
commons = json.load(open(os.path.join(scratch, "commons.json")))
RETRIEVED = "2026-10-28"


def txt(fragment):
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment))).strip()


def oga(slug):
    h = open(os.path.join(scratch, "oga", slug + ".html"), encoding="utf-8", errors="replace").read()
    title = txt(re.search(r"<h2>(.*?)</h2>", h, re.S).group(1))
    author_block = re.search(r"field-name-author-submitter.*?field-items\"><div class=\"field-item even\">(.*?)</div></div></div>", h, re.S)
    author_text = txt(author_block.group(1)) if author_block else None  # e.g. "Brandon Morris (Submitted by HaelDB)"
    collab = re.search(r"field-name-field-collaborators.*?field-items\">(.*?)</div></div></div>", h, re.S)
    date = re.search(r"field-name-post-date.*?field-item even\">([^<]*)<", h, re.S)
    lic_block = re.search(r"field-name-field-art-licenses.*?(?=field-name-collect|field-name-field-art-files)", h, re.S).group(0)
    licenses = [{"name": html.unescape(n), "url": u}
                for u, n in re.findall(r"<a href='([^']+)'[^>]*>.*?<div class='license-name'>([^<]+)</div>", lic_block, re.S)]
    body = re.search(r"field-name-body.*?field-item even[^>]*>(.*?)</div></div></div>", h, re.S)
    files = re.findall(r'<a href="(https://opengameart\.org/sites/default/files/[^"]+)" type="[^"]*"[^>]*>([^<]+)</a>\s*([\d.]+ ?[KMGkmg]b)', h)
    return {
        "key": "oga-" + slug,
        "library": "OpenGameArt.org",
        "entryUrl": "https://opengameart.org/content/" + slug,
        "entryTitle": title,
        "authorField": author_text,
        "collaborators": txt(collab.group(1)) if collab else None,
        "pagePostDate": txt(date.group(1)) if date else None,
        "licensesShownOnPage": licenses,
        "descriptionExcerpt": txt(body.group(1))[:420] if body else None,
        "pageFileList": [{"name": html.unescape(n), "size": s} for _, n, s in files],
        "retrievedOn": RETRIEVED,
        "downloads": [ledger[u] | {"url": u} for u in ledger if u.startswith("https://opengameart.org/sites/default/files/")
                      and f"/oga/{slug}/" in ledger[u]["dest"].replace("\\", "/")],
    }


out = {"schemaVersion": 1, "capturedOn": RETRIEVED, "sources": []}
slugs = sorted(d for d in os.listdir(os.path.join(scratch, "dl", "oga")))
for slug in slugs:
    out["sources"].append(oga(slug))

for title, ii in commons.items():
    m = ii["extmetadata"]
    g = lambda k: txt(m[k]["value"]) if k in m else None
    url = ii["url"].split("?")[0]
    out["sources"].append({
        "key": "commons-" + re.sub(r"[^a-z0-9]+", "-", title.lower().replace("file:", "")).strip("-"),
        "library": "Wikimedia Commons", "entryUrl": ii["descriptionurl"], "entryTitle": title,
        "licenseShortName": g("LicenseShortName"), "licenseUrl": g("LicenseUrl"),
        "artist": g("Artist"), "credit": g("Credit"), "dateTime": g("DateTimeOriginal") or g("DateTime"),
        "restrictions": g("Restrictions"), "retrievedOn": RETRIEVED,
        "downloads": [ledger[url] | {"url": url}] if url in ledger else [],
    })

for item, lic in [("Red_Library_Crowds_Applause", "https://creativecommons.org/publicdomain/zero/1.0/"),
                  ("Red_Library_Crowds_Sports", "https://creativecommons.org/publicdomain/zero/1.0/")]:
    out["sources"].append({
        "key": "ia-" + item.lower(), "library": "Internet Archive", "entryUrl": "https://archive.org/details/" + item,
        "entryTitle": item.replace("_", " "), "licenseUrl": lic, "uploader": "jscott@archive.org",
        "note": "Item-level license URL from archive.org metadata API; MP3 files are the item's own derivatives of the uploaded WAV.",
        "retrievedOn": RETRIEVED,
        "downloads": [l | {"url": u} for u, l in ledger.items() if l.get("iaItem") == item],
    })

with open(os.path.join(report, "catalog", "sources.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, indent=1, ensure_ascii=False)
    f.write("\n")
print(len(out["sources"]), "sources written;", sum(len(s["downloads"]) for s in out["sources"]), "download records")
for s in out["sources"]:
    if s["library"] == "OpenGameArt.org" and (not s["licensesShownOnPage"] or not s["downloads"]):
        print("CHECK", s["key"], s["licensesShownOnPage"], len(s["downloads"]))
