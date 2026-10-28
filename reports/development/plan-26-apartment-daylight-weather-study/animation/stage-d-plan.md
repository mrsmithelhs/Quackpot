# Plan 26 Stage D: measurement matrix, instrumentation and available hardware (recorded BEFORE any measurement)

Evidence collection only: not a certificate, no general performance claim, nothing promoted into the kit or production. Visuals are the owner-selected ones and are not retuned.

## Machine and browsers actually available (read-only queries, this session)
| Item | Value |
|---|---|
| Machine | LENOVO 83DX, AMD Ryzen 7 8845HS (8 cores / 16 threads, up to 3.8 GHz), 31.3 GB RAM, AMD Radeon 780M Graphics (driver 32.0.31033.3), Windows 11 Home 10.0.26300 |
| Display | 1920x1080 at 144 Hz (the Windows display setting; headless Chrome below does not drive a physical display) |
| Power | AC-connected laptop (battery status 2) |
| Browsers installed | Google Chrome 156.0.8078.73, Microsoft Edge 156.0.4314.50. Only Chrome is driven here. |
| Node | v26.7.0 (helper and bounded launcher only; no dependency installed) |
| Dev server | the owner's already-running Vite server, reached as `http://localhost:5173` (listens on IPv6 only); not started, restarted or modified |
| Claude built-in browser pane | **not usable for timing or performance**: measured again at the start of Stage D, 0 `requestAnimationFrame` frames in 3.5 s while unfocused (see also progress 9.2). Not repeated. |

**This is a fast current laptop, not a slow student or lab machine.** It is the owner's own class of machine only if the owner's teacher machine is similar; that is unknown. **A representative slower student/lab machine and browser is NOT available in this session**, so no result below may be read as evidence for one, and local desktop numbers or any throttling are not substitutes. An owner-run checklist for that machine is delivered separately (`stage-d-owner-checklist.md`) and its result is **pending**.

## Instrumentation (one isolated Chrome, serial, bounded)
- `animation/tools/stage-d-cdp.mjs` (helper, review tool, not runtime) drives **one new Chrome** with a **temporary profile and its own debugging port**, `--headless=new`, GPU left at its default (the established Plan 25 helper passes `--disable-gpu`; this one does not, so the result reflects whatever rendering path Chrome picks, which is recorded from `SystemInfo.getInfo`). No owner tab, profile, storage or setting is touched. No sandbox or Crashpad bypass flags. The page is the existing `animation/gallery.html` on the owner's server.
- Launched only through the established bounded launcher `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1` (1 GiB heap, 2 GiB sampled private bytes for the whole owned process tree, 90 s wall limit, short output), serially, once. No watcher, no full-suite or mutation run, no retry after the first unclassified failure.
- In-page probes (`animation/tools/stage-d-page.js`): per-frame `requestAnimationFrame` intervals, long tasks, JS heap, document-timeline advance versus wall clock (real-time evidence), per-frame computed opacity of the pulse overlays. From Node over CDP: `Performance.getMetrics` deltas (TaskDuration, ScriptDuration, LayoutDuration, RecalcStyleDuration, Nodes, JSHeapUsedSize) over each window.
- **rAF cadence is not compositor or GPU cost.** Main-thread task and script time are reported next to it; the GPU/compositor cost is not measured at all here.

## Matrix (each cell is one fixed foreground window of 3 s, ONE active scene unless labelled diagnostic)
| # | Cell | Scene state | Viewport |
|---|---|---|---|
| 1 | still baseline | storm + lamp, "Show still" (no motion) | 1280x720, dpr 1 |
| 2 | rain | rain, motion running | 1280x720, dpr 1 |
| 3 | storm + lamp | motion running, no flash | 1280x720, dpr 1 |
| 4 | **real-time bright pulse** | storm + lamp, ONE host-triggered pulse requested 400 ms into a 3 s window, natural completion | 1280x720, dpr 1 |
| 5 | diagnostic: four storm scenes | four copies of storm, as many as are visible | 1280x720, dpr 1 |
| 6 | narrow viewport | storm + lamp, motion running | 390x844, dpr 2 (viewport emulation only) |

Lifecycle checks (no further flashes): a **real hidden page** (a second tab is created and activated so the first tab goes to the background, if Chrome reports `visibilityState: hidden`; if it does not, that coverage is reported blocked), and **reduced motion** through `Emulation.setEmulatedMedia` (a browser-emulated media feature, **not** the actual OS preference, labelled as such). The **actual OS reduced-motion setting is not changed** (changing a Windows setting is outside this task); it is on the owner-run checklist.

Real-time pulse: exactly **one** accepted pulse in the whole run (verified from the arbiter's accepted count). Recorded with timestamps: accepted time, per-frame overlay opacities, peak, scene-flash end, window tail end, overlay node removal, ticket outcome and time, no stale resume afterwards, a refused `cooldown` request right after (no second flash), and the arbiter's next-allowed time. Held-frame measurements (earlier sections) are not real-time evidence and are not reused here.

## Out of scope here
Visual retuning, sound, other rooms, kit hooks, TV or music, Plan 25 wiring, promotion (Stage E needs its own proposal). Red-transition analysis: see the limitation note in progress; a small composite-colour diagnostic is proposed there, not claimed.
