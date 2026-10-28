# Plan 18 expanded audition — taxonomy / source / manifest / interaction checkpoint

**Date:** 2026-10-28. **Author:** Sonnet implementer thread. **Scope:** `reports/development/plan-18-audio-sources-and-credits/` only. **Status of this document:** the checkpoint as first written (before root's answers). It is kept as the record of the proposal; **root answered it in `reports/orchestration/plan-18-checkpoint-disposition-02.md`**, after which the bounded catalog/audition rebuild proceeded (see `progress.md`). Wording below that says "no downloads" refers to the six *search* tasks, not to later work: owner-assisted Freesound intake (14 files) and the approved individual-file/small-pack downloads happened afterwards and are accounted for in `progress.md`.

## 1. What has been done

- `plan-status.js check plan-18` → RUNNABLE.
- v1 audition/provenance/credits/report/progress preserved byte-for-byte in `archive/v1-2026-10-25/` (original files left in place for now; the rebuild will replace them, the archive is the record). The five v1 binaries in `audio/` are untouched.
- **Search budget used: 6 of 6 Haiku search tasks, never more than 3 concurrent**, each into its own `research/<task>/` folder; the search workers made no nested agents, browser tabs, downloads, accounts or credential use (confirmed from their reports; one harness refusal of `summary.md` in T1–T3 means those three have no summary file, the content is folded in here). A seventh Haiku task (screenshot transcription for owner-assisted Freesound intake, T7) was an **owner-authorized exception**, not an unused search task and not an automatic future budget.

| Task | Focus | Leads | Notes |
|---|---|---|---|
| T1 | Kenney pack inventory | 35 | **kenney.nl unreachable** from this machine (connection reset; I reproduced it with WebFetch and curl). Name-based only. Pack-level CC0 evidence is from mirrors for UI Audio and Impact Sounds only. |
| T2 | Duck vocalizations | 28 | 27 are Freesound, all download-gated by login. 1 login-free (Commons PD, ambient). Commons duck calls were CC BY-SA (rejected). Xeno-canto bot-protected (not bypassed). |
| T3 | OpenGameArt UI/card/win/dup | 29 | Only 11 are individually named files; 18 are archives/samplers whose internal names are not visible. |
| T4 | Crowd / race / water / contact | 26 | 23 file-page, 3 lead. |
| T5 | Phone / paper / coins / apartment / ambience | 30 | Rain loops and thunder present, flagged weather-not-approved. |
| T6 | Login-free duck gap-fill + riser/down | 19 | SoundBible "Attribution 3.0" label only; Free Sounds Library CC BY 4.0 with creator not named. |

`research/lead-index.csv` is the consolidated 167-row lead list (generated from the six `candidates.json` files). **Evidence quality is the honest headline:** 50 rows have a license confirmed on the file's own page, 38 are pack-level only, 60 are unverified leads. **Nobody has heard any file.** Every shortlist decision below is name/metadata-based until files are downloaded and auditioned.

## 2. Proposed role taxonomy (9 core groups + 1 optional)

Target 36–60 distinct short effects, 3–6 per important role. A file can be tagged for several roles but is counted once and shown as "shared".

| # | Group | Sub-pools (owner can name more) | Target | Lead coverage today |
|---|---|---|---|---|
| 1 | **DUCK** vocalizations | naturalistic mallard · rubber-toy squeak · cartoon | 9–15 | Plenty CC0 on Freesound (login-gated); few login-free |
| 2 | **UI** | confirm/navigate · gentle dismiss/back | 5–8 | Kenney (UI/Interface) + OGA, good |
| 3 | **CARD** | turn/shuffle/reveal · anticipation accent | 4–7 | Casino audio; **anticipation/riser thin** |
| 4 | **REWARD** | success chimes · restrained rarity accents (low/mid/high) | 6–9 | Good (jingles, OGA win/bells) |
| 5 | **DUP** (Down / duplicate conversion) | soft descending/deflating | 3–4 | Thin; some Kenney Digital down-sweeps may sound sci-fi |
| 6 | **RACE** | start cue · finish/podium | 3–5 | Bells/whistle ok; **no podium sting, no toy horn** |
| 7 | **CROWD** | cheer · applause · gasp / aww | 4–6 | Cheer/applause good (Commons, IA CC0 Red Library, OGA); **no acceptable gasp / aww** |
| 8 | **CONTACT** (duck/wall, splash, recovery) | soft bump · splash/plop · wobble | 4–6 | Splash good; **no soft rubber bump** |
| 9 | **META** | phone notification · paper/receipt · coins/purchase · apartment objects | 8–12 | Good except gaps below |
| 10 | **AMBIENCE** (optional, separate section) | domestic room tone · rain loops | 3–5 | Rain loops present; thunder flagged only, not shortlisted |

Music stays its own unchanged section (existing two tracks). Explicit non-goals: a sound for every button, weather approval, new music, anything synthesized.

**Gaps to accept or fill (owner call):** gasp/aww/disappointment, podium sting, toy horn, soft rubber bump, couch/cushion, stamp, receipt-printer tear, mug set-down. I would *report* these as gaps rather than pad with weak files; the owner's Freesound login (see §6) is the one route that could fill several.

## 3. Source / library list

| Source | Role in this pass | Status |
|---|---|---|
| **Kenney.nl** (via GitHub mirrors for retrieval) | UI, card, jingle, impact, coins | Primary pages unreachable today. v1 provenance (2026-10-25) cites them as CC0; today only mirror LICENSE files back UI Audio / Impact Sounds. Treated as **pack-level CC0, primary pending re-check**. |
| **OpenGameArt.org** | Largest source: UI, win, coins, splash, rain, applause | Reachable; license box per entry (often pack-level, versions sometimes missing → read from license URL). CC0 mostly; a few CC BY 3.0/4.0. |
| **Wikimedia Commons** | Applause, whistle, PD/CC0 ducks | Reachable; only CC0/PD/CC BY accepted, BY-SA rejected. |
| **Internet Archive** (items with explicit CC0/PDM) | USC "Red Library" crowd applause, one CC0 SFX item | Reachable; big items (e.g. 162.8 MB) not usable under the budget. |
| **Freesound** | Duck vocalizations (CC0 plentiful) + a few crowd | **Download requires login.** Not used by me. Owner-assisted path in §6. |
| **SoundBible** | Login-free duck/whoosh | Page shows only "Attribution 3.0" without CC name/link — **needs root/owner call** (§7). |
| **Free Sounds Library / BigSoundBank** | Login-free ducks | FSL labels CC BY 4.0 but names no creator → cannot satisfy attribution, likely rejected; BigSoundBank site wording differs from a CC0 deed → verify. |
| Rejected / restricted | Pixabay, Mixkit, Zapsplat, Sonniss, MixClap (reseller), SFXMint (AI-synth), Google Actions library (Actions-only, no ducks), Xeno-canto (bot wall), Openverse/audio.com/itch.io hosts (403/reset) | Not bypassed. |

## 4. Candidate manifest shape (proposal)

One central `catalog/catalog.json` (hand-reviewed, generated into the page by a build script), `schemaVersion` + `catalogRevision` (monotonic string, e.g. `2026-10-28.1`) so exported choices can be recognized as stale.

```jsonc
{
  "schemaVersion": 1,
  "catalogRevision": "2026-10-28.1",
  "roles": [
    { "id": "duck", "label": "Duck vocalizations", "blurb": "…",
      "subpools": [{ "id": "duck.naturalistic", "label": "Naturalistic" }, …] }
  ],
  "files": [{
    "id": "qp18-0007",                 // stable, never reused
    "title": "…", "creator": "…",
    "source": { "library": "Freesound", "assetPageUrl": "…", "soundId": "418509", "retrievedOn": "2026-10-28" },
    "license": { "name": "CC0", "version": "1.0", "url": "…", "evidence": "≤15-word quote + page URL",
                 "level": "file-page", "attributionRequired": false, "attributionText": "…",
                 "restrictions": [] , "noticeCaptured": "provenance/notices/qp18-0007.txt" },
    "local": { "path": "audio/duck/qp18-0007.ogg", "sha256": "…", "bytes": 0, "durationS": 0.0,
               "format": "ogg-vorbis|wav", "channels": 2, "sampleRate": 44100 },
    "derivation": { "original": "audio/_originals/…", "originalSha256": "…", "operations": ["trim 0.00–1.20 s"], "tool": "…" },
    "roles": ["duck.naturalistic", "contact"],   // shared files appear in each role
    "auditionGainDb": -4.5,                      // documented, non-destructive, audition-only
    "flags": ["shared", "weather-not-approved"]
  }],
  "unresolvedLeads": [ /* separate array: verified-downloadable vs reference leads, never mixed */ ]
}
```

Derivatives (trim/convert) get their own ID/hash with a mapping back to the untouched original; originals are never normalized in place. Credits (`credits.html`/`CREDITS.md`) is generated from the same catalog and lists only files the owner keeps, outside fictional game entities.

## 5. Audition interaction proposal

- **Layout:** sections by game purpose, each with 2-line context text; per candidate one primary Play button (title, duration, source, license badge always visible; expandable "details": creator, hash, notice, derivation). Controls: ☆ shortlist, ✕ reject, note field. Subpool chips per role; owner can add a named subpool.
- **Pool preview:** "Preview random from pool" draws only from that role/subpool's *selected* files, never the same file twice in a row when ≥2 are selected, with the played file's ID/title shown in the status line. Selection is the single source of truth for the draw; a disabled button and message when fewer than 1 is selected. Labelled **audition behavior, not production RNG**.
- **Safety:** nothing plays on load. Global Stop All, master volume (default moderate) and mute; starting any new sound stops the previous one unless "layer" is explicitly toggled for contextual mocks (capped at 3 voices). Per-file `auditionGainDb` is attenuation-only and documented in the catalog.
- **Honest failure states:** missing file, decode failure, autoplay/gesture block each show an inline message on that card and never claim "playing".
- **Persistence/export:** selections, shortlist/reject, notes and subpool names saved to `localStorage` keyed by `catalogRevision`; **Export JSON** (schema + revision + file IDs + per-file role choices + notes) as manual download; **Clear/Reset** with confirmation. No upload, no analytics. On load a stale revision shows a notice and keeps only IDs that still exist.
- **Contextual mocks (clearly labelled "audition mock"):** reveal+chime; race impact + reaction; coin+phone. They reuse the owner's selected files only and never depict a Receipt or race outcome.
- **Credits tab:** factual, generated from catalog, file-level license text. **Synth quacks removed from the main audition and demos**; only an optional, separate, off-by-default "archive" page may link the v1 synth comparison.
- **Accessibility/layout:** native buttons/`<dialog>`, `aria-live` status, visible focus, labelled sliders, narrow-width single column, reduced-motion safe.

**One technical decision for root (see §7-2):** `file://` playback with `HTMLAudioElement` works without a server but its `volume` cannot exceed 1 (gain matching = attenuation only) and cannot be routed through a master bus; Web Audio decode needs `http://` (a tiny local static server). I recommend `HTMLAudioElement` on `file://` for the audition, plus one-time loudness measurement done while served locally to fill `auditionGainDb`.

## 6. Owner-assisted Freesound intake (offered 2026-10-28)

Folders created: `inbox/freesound/` (originals, default Freesound filename kept) and `inbox/freesound/screens/<soundId>.png`. A scrolled screenshot must show the URL bar, title/uploader, license name+version, sound-information panel and description/tags. I compute hash/format/duration from the file. CC0 and CC BY only; the owner's login is theirs and I never use it. Suggested 14 links were given in chat; T6's login-free options may reduce that need.

**Update, 2026-10-28 (after the checkpoint's first commit):** the owner downloaded 14 Freesound originals with their own login. They are unmodified under `audio/_originals/freesound/` with staging records in `catalog/intake/freesound-intake.json` (file-level license read from owner screenshots by a seventh Haiku task, spot-checked by me; hashes, formats and durations measured from the files; remix/derivative sources for 818396 and 418509 recorded). 10 are CC0 and 4 need CC BY attribution (3 at 4.0, 1 at 3.0); 547601 and 749445 are human-voiced imitations and 448208 is labelled "Human made" on its page. The screenshots were deleted by the owner and never committed. Formats are mixed (16/24-bit WAV, one 32-bit float, 44.1/48/96 kHz, two MP3s). The seventh Haiku task exceeded the handoff's six-task budget on the owner's explicit request.

## 7. Questions for QP Orch (the decisions the workers could not make)

1. **Kenney primary verification.** kenney.nl resets connections from this machine. May root/owner confirm CC0 + credit wording via a browser, or accept mirror LICENSE evidence plus the 2026-10-25 capture as "pack-level, pending"?
2. **Playback mechanism** (§5): `HTMLAudioElement` on `file://` (my recommendation) versus requiring a local static server for Web Audio.
3. **SoundBible "Attribution 3.0":** page shows the label but no CC name/URL. Accept as CC BY 3.0 with the creator credit, or drop SoundBible and rely on Commons CC0 + owner's Freesound?
4. **Download policy under the 100 MiB ceiling:** I propose individual files and packs ≤ ~15 MB only; the 142 MB and 162.8 MB items are out. Roughly 60–80 downloads to keep 36–60 after listening. Confirm.
5. **Gaps:** accept the §2 gap list as reported gaps, or approve additional search beyond the six-task budget.
6. **Ambience:** keep rain/domestic as a separate optional section and exclude thunder from the audition entirely?

## 8. Consultation posture

This checkpoint is research/docs only, so **Branch B — advisor consultation not warranted** (no behavioral surface). The later audition page and catalog build script are code; no extra consultant budget was granted, so for that delivery I will declare the degraded mode (orchestrator-gate-only) unless root authorizes otherwise.

## 9. Next steps once root answers

1. Verify finalist licenses at file level (primary pages), then download individual files into `audio/<role>/` with SHA-256, durations, notices.
2. Listening-free QA: decode every file, record durations, peak/RMS, clipping, silence padding; fill `auditionGainDb`.
3. Build `catalog.json`, the audition page, Credits and a short owner sampling guide; run browser checks (multi-select, pool preview, save/reload/export, missing files, stop/volume lifecycle) with browser turns coordinated through root.
4. Commit scoped files, write `progress.md` last, stop at owner selection.
