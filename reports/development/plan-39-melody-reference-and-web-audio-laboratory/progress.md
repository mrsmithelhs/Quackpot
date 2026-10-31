# Plan 39 Progress Report — Melody Reference and Web Audio Laboratory (v3 Revision)

- **Packet ID**: `plan-39` (`docs/development/plan-39-melody-reference-and-web-audio-laboratory.md`)
- **Date**: 2026-10-31
- **Lead / Workers**: Gemini 4 Argon (Medium) lead; 11 bounded Gemini Flash subagent workers across v1, v2 (9-report deep-research synthesis), and v3 (`webaudio-tinysynth` `quality: 1` GM instrument integration + 3-family non-terminal/long-arc/pivot-chord melodic expansions + single-file `.wav` arrangement exporter).
- **Scope & Ownership**: Strictly report-local under `reports/development/plan-39-melody-reference-and-web-audio-laboratory/`. Zero edits to Plan 32/33 inputs, shared `src/`, `package.json`, packet status frontmatter, or unrelated working-tree files.

---

## 1. Overall Summary

Following owner auditioning of the v1 and v2 laboratories and the 9 external deep-research reports (`research/results/prompt-1..3`), the owner identified two core root causes and requested the **v3 Revision**:
1. **Why Original Motif C Resisted Expansion**: Because the 2-bar Motif C ("Lucky Ripple", `4.92 s`) lands on a 2-beat tonic `D5` at Beat 6.0 (`B5 -> A5 -> F#5 -> D5`), it functions music-theoretically as a **terminal consequent phrase** (`1̂` closure). Situating it inside a larger piece without sounding prematurely finished requires either **(a) modifying Bar 2 of the anchor so it does not terminate on tonic `D5`**, **(b) expanding the phrase into a continuous multi-bar melodic journey (`>= 3×` original length) before resolving**, or **(c) balancing the final two notes (`F#5 -> D5`) with an unresolved pivot chord (`Gm6/Bb` or `E9`) that strips `D5` of tonic finality**.
2. **Community-Iterated Procedural Web Audio Instruments (`webaudio-tinysynth` `quality: 1`)**: Rather than hand-crafting ad-hoc oscillators from scratch, the v3 laboratory integrates **`g200kg/webaudio-tinysynth` (`quality: 1` mode, Apache-2.0 License)**—a pure-JS, zero-sample multi-operator FM/additive General MIDI synthesizer—providing **20 curated GM instruments** (`GM-00` Piano, `GM-04` Rhodes EP1, `GM-05` DX EP2, `GM-08` Celesta, `GM-10` Music Box, `GM-11` Vibraphone, `GM-12` Marimba, `GM-13` Xylophone, `GM-15` Dulcimer, `GM-24` Nylon Guitar, `GM-25` Steel Guitar, `GM-32` Acoustic Bass, `GM-33` Finger Bass, `GM-45` Pizzicato Strings, `GM-46` Orchestral Harp, `GM-73` Flute, `GM-75` Pan Flute, `GM-79` Ocarina, `GM-107` Koto, `GM-108` Kalimba, plus `P0-plan32-triangle`) with independent per-track selectors for **Lead**, **Chords**, and **Bass** plus **8 Ensemble Presets**.
3. **Single-File Arrangement WAV Exporter**: Replaced the multi-file export bundle list with a single **"⬇ Export Current Arrangement (.WAV)"** button that renders and immediately downloads **one `.wav` file** matching the exact arrangement, GM instruments, tempo, and layer mix configured to play.

---

## 2. v3 Melodic Expansion Proposals (`M1`–`M6` + `C0-original` Control)

All measurements below were captured from real Google Chrome `OfflineAudioContext` renders (`48,000 Hz`, stereo, 16-bit PCM WAV) via `lab/browser-verify.mjs` and recorded in `exports/browser-verification-report.json`.
*(Note: Peak and RMS are float32/PCM16 sample peak and RMS measurements only — not LUFS or true peak.)*

| Candidate ID | Family / Compositional Strategy | Default Harmony & Ensemble Preset | Bars / Duration (100 BPM) | Frames / WAV Bytes | Lead / Chord / Bass Events | Mix Sample Peak / RMS (dBFS) | Melody-Only Peak / RMS (dBFS) | Lead Parity (`Mix === Solo`) |
|---|---|---|---|---|---|---|---|---|
| **`M1-skyward-vista`** | **Family A** · Non-Terminal Bar 2 (Ascending Skyward Suspension to `E6` over `A7sus4`) | `H-A1-skyward` + `TS-marimba-epiano` (`GM-12` / `GM-04` / `GM-32`) | 4 bars / **9.90 s** | `475,200` / `1,900,844 B` | 19 / 32 / 8 | `-9.5 dBFS` / `-26.6 dBFS` | `-20.8 dBFS` / `-37.8 dBFS` | Verified (19/19) |
| **`M2-supertonic-question`** | **Family A** · Non-Terminal Bar 2 (Stepwise Descent `B5->A5->G5->F#5->E5` Half-Cadence) | `H-A2-supertonic` + `TS-vibraphone-guitar` (`GM-11` / `GM-24` / `GM-33`) | 4 bars / **9.95 s** | `477,600` / `1,910,444 B` | 21 / 35 / 8 | `-11.7 dBFS` / `-25.8 dBFS` | `-21.6 dBFS` / `-33.1 dBFS` | Verified (21/21) |
| **`M3-horizon-drift`** | **Family B** · Long-Timescale Arc (`3×` Length / 6 Bars Continuous Climb to `F#6` Climax) | `H-B1-horizon` + `TS-flute-harp` (`GM-73` / `GM-46` / `GM-32`) | 6 bars / **14.70 s** | `705,600` / `2,822,444 B` | 28 / 51 / 11 | `-9.0 dBFS` / `-25.1 dBFS` | `-19.3 dBFS` / `-28.8 dBFS` | Verified (28/28) |
| **`M4-celestial-wanderer`** | **Family B** · Long-Timescale Arc (`4×` Length / 8 Bars Kondo Sequential Cantabile to `F#6`) | `H-B2-wanderer` + `TS-celesta-rhodes` (`GM-08` / `GM-05` / `GM-32`) | 8 bars / **19.52 s** | `936,960` / `3,747,884 B` | 39 / 69 / 15 | `-8.8 dBFS` / `-25.8 dBFS` | `-24.1 dBFS` / `-38.2 dBFS` | Verified (39/39) |
| **`M5-minor-iv-yearning`** | **Family C** · Unresolved Pivot Chord (Exact 10-Note Motif C Over Modal-Mixture `Gm6/Bb` at Beat 5.5) | `H-C1-minor-iv` + `TS-musicbox-harp` (`GM-10` / `GM-46` / `GM-45`) | 4 bars / **9.95 s** | `477,600` / `1,910,444 B` | 20 / 32 / 8 | `-10.8 dBFS` / `-28.5 dBFS` | `-23.1 dBFS` / `-36.5 dBFS` | Verified (20/20) |
| **`M6-secondary-dominant-drive`** | **Family C** · Unresolved Pivot Chord (Exact 10-Note Motif C Over `E9` `V9/V` Secondary Dominant at Beat 5.5) | `H-C2-sec-dom` + `TS-kalimba-guitar` (`GM-108` / `GM-25` / `GM-32`) | 4 bars / **9.92 s** | `476,160` / `1,904,684 B` | 19 / 35 / 8 | `-10.0 dBFS` / `-27.5 dBFS` | `-23.8 dBFS` / `-37.1 dBFS` | Verified (19/19) |
| **`C0-original`** | **Historical Baseline Control** (Untouched 2-Bar Motif C Reference) | `H0-dry` + `P0-plan32-triangle` | 2 bars / **4.92 s** | `236,160` / `944,684 B` | 10 / 0 / 0 | `-16.4 dBFS` / `-31.8 dBFS` | `-16.4 dBFS` / `-31.8 dBFS` | Verified (10/10) |

---

## 3. Advisor Consultation Disposition

- **Branch Selected**: **Branch C — `orchestrator-gate-only`** (explicitly authorized in `docs/development/plan-39-melody-reference-and-web-audio-laboratory.md` §Stop conditions and delivery: *"Record consultation posture; no paid higher-tier advisor is required or authorized beyond the Argon lead and Flash tasks."* Additionally, `advisor-capable-providers.json` lists `claude-code`, `codex-cli`, and `kimi-code`; this Gemini Argon thread under Antigravity does not match a higher-tier advisor entry in `advisor-capable-providers.json` and fails closed to Branch C).
- **Compensating Verification**: The Argon lead directly audited every Flash worker's output against repository ground truth and executed both Node unit tests (`laboratory.test.mjs`, 7/7 pass) and real headless Chrome `AudioContext` + `OfflineAudioContext` verification (`browser-verify.mjs`, 7/7 candidates + 8/8 `webaudio-tinysynth` presets + single-file `.wav` downloads verified) via `bounded-node-run.ps1`.

---

## 4. Delegated Flash Worker Record & Lead Curation

| Worker ID | Role & Subagent Type | Requested / Observed Model | Task & Write Posture | Lead Verification & Curation Applied |
|---|---|---|---|---|
| `d9ffd785-42ea-4781-a4c9-cb250d1b50ad` | Plan 32/33 Music Input Researcher (`research`) | Requested `flash`; self-reported Gemini Flash | Read-only synthesis of Plan 32 `motifs.js`, `preview.js`, `composition-extensions.js`, `research-01.md`, and Plan 33 files | Verified exact 10-event Motif C table and `4.80 s + 0.12 s = 4.92 s` math directly against `motifs.js` (`SHA-256: 3b47ecdb...0af59e02`). |
| `de88405e-e339-4345-babd-e64a193f7a65` | Web Audio & Conditioning Researcher (`self`) | Requested `flash`; self-reported Gemini Flash | Read-only synthesis of Suno 6–60 s upload rules, Cover vs Extend, and Gemini Create Music | Verified primary help URLs and exact Plan 32 triangle control path. |
| `798a727c-46db-4855-b9ef-70d16b1580bb` | Music & Conditioning Brief Author (`self`) | Requested `flash`; self-reported Gemini 2.5 Flash | Sole writer for `research/music-and-conditioning-brief.md` and `research/external-research-prompts.md` | Inspected both files and sharpened Prompt 2 for advanced Web Audio synthesis. |
| `008f5674-6399-4030-a3f5-dc9a586bb310` | Prompt 1 Phrase Craft Analyst (`research`) | Requested `flash`; self-reported Google Gemini (Flash worker) | Read-only cross-model synthesis of `prompt-1-chatgpt.md`, `prompt-1-claude.md`, and `prompt-1-gemini.md` | Extracted diagnosis of Motif C as a terminal consequent phrase (`B5 -> A5 -> F#5 -> D5`). |
| `b9cd832f-ee61-4062-ac0b-3253e01fd0bd` | Prompt 2 Web Audio Synth Analyst (`research`) | Requested `flash`; self-reported Google Gemini (Flash worker) | Read-only cross-model synthesis of `prompt-2-chatgpt.md`, `prompt-2-claude.md`, and `prompt-2-gemini.md` | Curated DSP room air (`ConvolverNode`) and micro-groove pocket timing. |
| `59349e89-2fd1-45a9-b386-ca53804d7bd6` | Prompt 3 Conditioning Analyst (`research`) | Requested `flash`; self-reported Google Gemini (Flash worker) | Read-only cross-model synthesis of `prompt-3-chatgpt.md`, `prompt-3-claude.md`, and `prompt-3-gemini.md` | Curated Suno v6 Cover conditioning settings (`Audio Influence 75%`, `Style 40%`, `Weirdness 15%`). |
| `e9bff7ae-8e1f-4c90-a326-b5849e44b12a` | WebAudio-TinySynth & Synth Library Researcher (`self`) | Requested `flash`; self-reported Gemini | Researched `g200kg/webaudio-tinysynth` (`quality: 1` mode, Apache-2.0) and executed single-writer update of `lab/patches.js` | Audited `lab/patches.js` (20 `quality: 1` GM programs + `P0-plan32-triangle` + 8 ensemble presets + Apache-2.0 attribution). |
| `179bede1-11eb-4081-8113-f04770de4c6b` | Melodic Anchor Expansion Composer (`self`) | Requested `flash`; self-reported Gemini 2.5 Pro (platform routing) | Composed 6 new melodic proposals (`M1`–`M6`) across Families A, B, and C and executed single-writer update of `lab/scores.js` | Audited all note events, velocities (`0.0..1.0`), 4/6/8-bar harmony arrays, and `isExactAnchor` flags in `lab/scores.js`. |
| `0c8a7283-04de-4ea2-8a8e-a5c26a97427d` | Score & Voicing Drafter (`self`) | Requested `flash`; self-reported Gemini 2.5 Flash | Drafted earlier score authorities | Superseded by v3 `lab/scores.js` from `179bede1-11eb-4081-8113-f04770de4c6b`. |
| `edca6ba9-3480-49dd-b8a1-9f52e5bb4baa` | Web Audio & WAV Engine Drafter (`self`) | Requested `flash`; self-reported Gemini Flash | Executed single-writer v3 upgrade of `lab/synth-engine.js` for `webaudio-tinysynth` (`quality: 1`) multi-operator synthesis, per-track GM overrides, 4/6/8-bar harmonies, `melody-chords` layer mode, and `buildArrangementFilename` | Verified multi-operator FM/additive voice scheduling, shared track buses, and `OfflineAudioContext` rendering across all 7 candidates and 8 ensemble presets. |
| `7a25863c-cf97-4de6-932c-bcaae976e08f` | Laboratory HTML & CSS Drafter (`self`) | Requested `flash`; self-reported Gemini 2.5 Flash | Executed single-writer v3 upgrade of `index.html`, `laboratory.css`, and `lab/laboratory.js` | Verified Family A/B/C cards, Lead/Chords/Bass GM selectors, `melody-chords` mode, and single-file `.wav` export button (`#render-export-btn`). |

---

## 5. Files Created / Updated (Owned Scope Only)

All files reside strictly inside `reports/development/plan-39-melody-reference-and-web-audio-laboratory/`:

- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/index.html` — Owner-facing v3 Web Audio laboratory UI with Family A/B/C quick-start route, Lead/Chords/Bass GM instrument selectors, and single-file `.wav` exporter.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/laboratory.css` — Responsive light/dark studio stylesheet with Family A/B/C badges and `prefers-reduced-motion: reduce` support.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/scores.js` — Frozen v3 symbolic score & harmony authority (`C0-original`, `M1`–`M6`, `H0-dry`, `H-A1` through `H-C2`).
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/patches.js` — Frozen v3 `webaudio-tinysynth` (`quality: 1`, Apache-2.0) multi-operator GM instrument definitions (`20` GM programs + `P0-plan32-triangle` + `8` ensemble presets).
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/synth-engine.js` — Shared deterministic score scheduler, `webaudio-tinysynth` (`quality: 1`) multi-operator Web Audio graph builder (`AudioContext` + `OfflineAudioContext`), PCM16 WAV encoder/header parser, and single-file arrangement filename builder.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/laboratory.js` — Browser DOM controller, per-track GM instrument selector synchronization, transport lifecycle, phrase visualizer, and single-file `.wav` download handler.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/laboratory.test.mjs` — Node unit test suite (7/7 tests passing).
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/browser-verify.mjs` — Isolated headless Chrome verification runner testing live `AudioContext` lifecycle, `OfflineAudioContext` rendering across all 7 candidates and 8 presets, and single-file `.wav` downloads.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/browser-verification-report.json` — Full headless Chrome v3 verification report and PCM measurements.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/plan39-M1-skyward-vista-H-A1-skyward-marimba-full-100bpm-manifest.json` — Verified v3 manifest for `M1-skyward-vista`.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/plan39-M3-horizon-drift-H-B1-horizon-flute-full-100bpm-manifest.json` — Verified v3 manifest for `M3-horizon-drift`.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/plan39-M5-minor-iv-yearning-H-C1-minor-iv-music-box-full-100bpm-manifest.json` — Verified v3 manifest for `M5-minor-iv-yearning`.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/progress.md` — This progress report.

---

## 6. Commands Run and Verification Results (v3)

1. **Unit Test Suite (`laboratory.test.mjs`)**:
   - Command: `pwsh -ExecutionPolicy Bypass -Command "& .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe @('--test', 'reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/laboratory.test.mjs')"`
   - Result: `ExitCode: 0`, 7/7 tests pass (`ElapsedSeconds: 0.55`, `PeakSampledPrivateBytes: 4055040`).
2. **Real-Browser Web Audio & Single-File WAV Export Verification (`browser-verify.mjs`)**:
   - Command: `pwsh -ExecutionPolicy Bypass -Command "& .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe @('reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/browser-verify.mjs')"`
   - Result: `ExitCode: 0`, 7/7 candidates (`C0-original` + `M1`–`M6`) and 8/8 `webaudio-tinysynth` (`quality: 1`) presets rendered and verified in isolated headless Chrome, 0 non-local network requests, 0 page runtime errors, live `AudioContext` `PLAYING -> PLAYING -> IDLE` lifecycle verified, and single-file `.wav` downloads verified (`ElapsedSeconds: 8.75`, `PeakSampledPrivateBytes: 436330496`).

---

## 7. Short Owner Listening Route & Local Audition URL

### How to Open the Laboratory
- **Direct Local File URL**:
  `file:///C:/AI/Quackpot/reports/development/plan-39-melody-reference-and-web-audio-laboratory/index.html`

### 4-Step Owner Listening Route (v3)
1. **Step 1 — Family A (Non-Terminal Hook Modifications)**: Click **★ M1 Skyward Vista** (rewrites Bar 2 so the phrase rises to an open `E6` suspension over `A7sus4` instead of closing on `D5`) and **M2 Supertonic Question** (steps down to open `E5` over `A7`).
2. **Step 2 — Family B (Long-Timescale 3×–4× Arcs)**: Click **★ M3 Horizon Drift (3× / 6 Bars, 14.7 s)** and **M4 Celestial Wanderer (4× / 8 Bars, 19.5 s)** to hear Motif C's opening ripple launch a continuous multi-bar melody up to a high `F#6` climax.
3. **Step 3 — Family C (Unresolved Pivot Chords Under `F#5 → D5`)**: Click **★ M5 Minor-iv Gm6/Bb Pivot** and **M6 Secondary-Dom E9 Pivot** (and try switching **Layer Audition Mode** to **Melody + Chords (No Bass — Pivot Chord Focus)**) to hear how keeping all 10 notes of Motif C but harmonizing `F#5 → D5` with an unresolved chord propels the phrase into Bars 3–4.
4. **Step 4 — Mix & Match TinySynth GM Instruments & Export a Single `.WAV`**: Use the **Lead GM Instrument**, **Chords GM Instrument**, and **Bass GM Instrument** dropdowns to audition any `webaudio-tinysynth` (`quality: 1`) instrument combination, then click **⬇ Export Current Arrangement (.WAV)** to immediately download that single `.wav` file.

- **Ready for orchestrator review**: **yes**
