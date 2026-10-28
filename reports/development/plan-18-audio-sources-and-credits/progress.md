# Progress report — Plan 18 expanded audition (catalog/page rebuild)

**Packet:** Plan 18 (reopened by owner 2026-10-28). **Thread:** Sonnet implementer. **Scope:** `reports/development/plan-18-audio-sources-and-credits/` only.
**Authority:** `reports/orchestration/plan-18-expanded-audition-sonnet-handoff.md` and `reports/orchestration/plan-18-checkpoint-disposition-02.md`.
**Ready for orchestrator review: yes for technical review — with one explicit verification gap: the page's JavaScript has NOT been executed** (see §4). Production audio integration, status changes and pushes: none. The v1 progress report is preserved in `archive/v1-2026-10-25/progress.md`.

## 1. Summary

- Rebuilt the audition as a role/pool selection page over a central catalog: **60 recorded effects in 9 purpose groups plus 3 optional rain loops, and the 2 existing music tracks** in a separate tab. Synthesized quacks are removed from the audition and the mocks; the shared synth source and v1 artifacts are untouched and the v1 page/docs are preserved in `archive/v1-2026-10-25/`.
- **Pools:** multiple selection per purpose, optional named pools, "preview random from pool" (selected files only, no immediate repeat when ≥2 eligible, shows which file played). Selected / shortlisted / rejected are separate states. Notes, extra audition attenuation, JSON export/import, explicit confirm-to-clear, stale-revision handling that never silently resets.
- **Provenance:** every file has stable ID, creator, exact source page, license + version + URL, evidence scope, local path, SHA-256, probed duration/format/size, change notice and credit text; page notices captured under `catalog/notices/`; Credits tab and `catalog/ATTRIBUTIONS.md` list ALL auditionable files.
- **Evidence honesty:** nothing has been listened to by me; picks are name/metadata based. Licensing evidence is graded per file (below), not assumed library-wide.

## 2. Disposition items applied

1. **Kenney:** only the three v1 files remain (Click 1, Card Slide 1, Steel Jingle 00), recorded as *pack-level primary evidence verified by root*, with **member provenance PENDING** (they came from a mirror of a 2014 snapshot; equality with current official archives is not established). kenney.nl was unreachable from this machine (connection reset on curl and WebFetch); I did not route around it and added no new Kenney downloads.
2. **Playback:** native `HTMLAudioElement`, relative local files, attenuation-only audition gain, `master × gain × trim` clamped to [0,1]; no Web Audio, no server, no runtime fetch; catalog data is an ordinary `<script src>` (`catalog/catalog-data.js`). Peak/RMS are measured only for PCM WAV (38 files); 25 Ogg/MP3 files are labelled "level unmeasured" and get no gain. Quiet files are flagged; the page says dB values are not loudness. `file://` behavior is **unverified** (§4).
3. **SoundBible:** all quarantined (8 leads), listed in the Credits tab; so is Commons "Cash register" (cites a SoundBible origin) and Free Sounds Library (no creator named).
4. **Downloads:** individual files and small packs only. **Ledger:** third-party downloads 46,335,781 B (44.2 MiB) in 56 OGA files/archives, 7 Commons files, 3 Internet Archive MP3s (hashes in `catalog/sources.json`), plus owner Freesound originals 19.4 MB (18.5 MiB) = about 62.7 MiB downloaded; extracted copies kept in `audio/<purpose>/` add about 13.1 MiB (counted conservatively on top) → **about 76 MiB of the 100 MiB ceiling**; archives were NOT retained (re-downloadable from recorded URLs/hashes). `audio/` on disk is 35.7 MiB (includes the 3.6 MiB of v1 files). Refused as oversize/out of rule: 19.6 MB crowd-cheering zip, 18.8–75 MB rain, 142 MB and 162.8 MB items; `.7z` packs not opened (no extractor, no install). Downloaded but **unused** (wasted budget): `SoundPack01.zip` (6.8 MB; AIFF members that Chrome/Firefox cannot play), `ui_sounds.zip` (2.8 MB; durations unknown, not picked), most of the 15 MB "Sound effects Pack 2" (used 4 members).
5. **Gaps** reported, not padded (Credits tab and guide): card anticipation, crowd gasp/aww, podium sting/toy horn, soft rubber bump, couch/stamp/receipt-tear/mug. No extra search was run; the 14 owner Freesound files were prioritized (they are the whole duck section).
6. **Ambience:** separate optional section, flagged "weather audio not approved", thunder excluded entirely.
7. **Budget:** the checkpoint's "6 of 6 / no downloads" wording is corrected (it now distinguishes the six search tasks from the owner-authorized seventh Haiku task, T7, and the later owner-assisted intake and approved downloads).
- **Remix/derivative chains:** 818396 (remix of Freesound 31271, CC BY 4.0 source confirmed from screenshot), 418509 (extracted from Freesound 244329, CC0, confirmed), Applause qp18-0042 (cut of the Yo Frankie! end-game sound; source entry `opengameart.org/content/endgame` read: CC-BY 3.0, Blender Foundation) — each recorded in `source.chain`, the credit text and the notices.
- Owner download/login is not treated as license proof: each Freesound license is from the file's page screenshot.

## 3. Files changed / artifacts

Created: `audition.html` (replaced; v1 in archive), `catalog/{selection.json,sources.json,catalog.json,catalog-data.js,ATTRIBUTIONS.md,notices/*.txt}`, `catalog/intake/freesound-intake.json` (earlier), `audio/<ambience|card|contact|crowd|duck|dup|meta|race|reward|ui>/qp18-NNNN.*` (extracted/derived), `audio/_originals/freesound/*` (earlier), `tools/{audio_probe.py,capture_sources.py,build_catalog.py,verify_catalog.py}`, `SAMPLING-GUIDE.md`, `research/*` and `archive/*` (earlier). Modified: `progress.md`, `expanded-checkpoint.md` (status/budget corrections). Four trimmed derivatives (qp18-0003, -0005, -0009, -0010) have recorded start/length/fade and original hashes; originals unmodified. v1 `bundled-synth.js`, `build-audition.mjs`, `parity.test.mjs` and review files are left in place as history (not used by the new page).

## 4. Commands run and what was and was not verified

Commands (all single-process, short, no watchers, no repeated suites, no parallel Node):
- `node scripts/dev/plan-status.js check plan-18` once (mandated preflight; RUNNABLE). **No other Node was run after the disposition.** (Earlier in the session, before the resource instruction, I ran a few tiny one-shot Node scripts for lead tallies and file probing; none ran after.)
- Python 3.14 standard library: `tools/capture_sources.py`, `tools/build_catalog.py`, `tools/verify_catalog.py` (each run twice at most), `tools/audio_probe.py`; plus short `urllib`/`curl` downloads with rate limiting (one Wikimedia 429 handled by waiting).
- **Verified (offline, by `tools/verify_catalog.py`):** all 63 cataloged files exist; SHA-256 matches; probed duration matches the record; every record has creator/source/license (+version for CC); CC BY credit text includes license and URL; derivatives have original hashes; ambience is weather-flagged; no gain set on unmeasured files and no amplifying gain; `catalog-data.js` equals `catalog.json`; `audition.html` contains no synth references, no `AudioContext`/`fetch`/`XMLHttpRequest`/`autoplay`, no remote script/style, no remote media URL; 5 v1/music hashes re-checked.
- **NOT verified:** that the page's JavaScript runs at all; any playback, stop/volume/mute behavior, error-state reset, pool preview, save/reload/export/import, narrow layout, keyboard use, or `file://` loading; actual audibility, loudness, decodability in a browser, or the sound/role fit (nobody listened). Rain loop seams unverified. I read the script back for syntax/logic and fixed bugs found, but a read-through is not execution.
- **Proposed bounded verification (needs root coordination; I have not started it).** Isolated provider browser/storage, one tab, no Node, no server, ≤10 minutes, ≤30 browser actions, ≤5 screenshots, console capped at 50 lines: (1) open `file:///C:/AI/Quackpot/reports/development/plan-18-audio-sources-and-credits/audition.html`; confirm the catalog loads and the console is clean; (2) tick 2 duck sounds and 1 of another purpose, run pool preview 6 times, confirm only ticked files play, no immediate repeat, status names the file; (3) press Play then Stop all, Esc, mute and volume 0, tab switch and reload during playback; (4) missing-file handling is NOT exercised in the real folder; it stays code-reviewed unless root authorizes a throwaway copy of the folder with one audio file removed; (5) reload to confirm saved choices, export JSON, clear with confirm, import it back; (6) narrow (375 px) layout and keyboard-only pass over one purpose.

## 5. Problems and how handled

- kenney.nl unreachable → no new Kenney; v1 files marked provenance-pending.
- OGA pages: author vs uploader differ (e.g., "Brandon Morris (Submitted by HaelDB)"); recorded as shown. OGA license boxes are **entry-level**, not per-file pages; the evidence scope field says so (40 files `entry-page`, 19 `file-page` [Freesound 14 + Commons 5], 3 `pack-level` [Kenney], 1 `item-level` [Internet Archive]). 3 files are public-domain on Commons file pages (claim relies on Commons/upstream PDSounds).
- Dual-license entry (completion sound: OGA-BY 3.0 / CC0): CC0 elected, recorded.
- Well Done (`Well Done CCBY3.ogg`): page says relicensed to CC0 on 2024-10-05; the filename still says CCBY3. Recorded as CC0 per the page.
- Wikimedia 429 rate limit: waited and resumed; all SHA-1 values match the API.
- Counts: 52 CC0, 5 CC BY 3.0, 3 CC BY 4.0, 3 public domain; 38 WAV, 18 Ogg, 7 MP3.

## 6. Remaining risks / follow-ups

- Run the §4 browser verification before owner selection (needs root).
- Owner listening may reject many name-based picks; gaps may need a bounded follow-up search (not granted).
- Kenney member provenance pending; OGA creators are sometimes only the uploader.
- 25 files have no loudness measurement; level matching is approximate attenuation only.
- Large-ish unused downloads are recorded above.

## 7. Advisor consultation posture

**Branch C — degraded, orchestrator-gate-only.** The provider (Claude Code) is listed as advisor-capable in `advisor-capable-providers.json`, but the handoff grants no consultant budget ("no extra consultant budget"), and this packet does produce code (page + Python tools), so a consultation would normally be warranted. None ran; root's independent Terra-medium review applies. The Haiku workers were research/transcription workers, not advisors.

## 8. Unrelated working-tree state (left alone)

Modified/untracked paths from other threads: `reports/development/plan-25-desk-phone-art-integration/*`, `src/main.js`, `src/ui/{apartment-view.css,desk-view.js,duck-motion-controller*,duck-motion.css,gacha-view.js,settings-modal.js,ambient-glow-controller*}`. Not staged or committed by me.
