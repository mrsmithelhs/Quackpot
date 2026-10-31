# Plan 39 Progress Report — Melody Reference and Web Audio Laboratory

- **Packet ID**: `plan-39` (`docs/development/plan-39-melody-reference-and-web-audio-laboratory.md`)
- **Date**: 2026-10-30
- **Lead / Workers**: Gemini 4 Argon (Medium) lead; 9 bounded Gemini Flash subagent workers (6 for v1 research, score/voicing, Web Audio/WAV engine, and HTML/CSS laboratory drafting + v2 upgrades; 3 for cross-model synthesis of the 9 external deep-research reports in `research/results/`).
- **Scope & Ownership**: Strictly report-local under `reports/development/plan-39-melody-reference-and-web-audio-laboratory/`. Zero edits to Plan 32/33 inputs, shared `src/`, `package.json`, packet status frontmatter, or unrelated working-tree files.

---

## 1. Overall Summary

We researched, composed, curated, and verified a report-local **Melody Reference and Web Audio Laboratory** (`reports/development/plan-39-melody-reference-and-web-audio-laboratory/index.html`) designed to solve the external reference-conditioning bottleneck on the owner-selected gacha hook **Motif C ("Lucky Ripple")** and support interactive auditioning of C-derived continuations and light beginning-of-game arrangements, including a **v2 deep-research upgrade** synthesized from 9 external research reports (`prompt-1..3` across ChatGPT, Claude, and Gemini in `research/results/`):

1. **Exact Length-Sufficient Control (`C0-repeat2x`, 9.72 s)**:
   - Original Motif C (`C0-original`) lasts **4.92 s** (`8 beats` at 100 BPM = `4.80 s` + `0.12 s` release tail = `236,160` frames at 48 kHz), which Suno rejects solely because it is shorter than its documented **6.00-second minimum upload rule** (`https://help.suno.com/en/articles/2477633`).
   - `C0-repeat2x` repeats Motif C twice back-to-back at the original 100 BPM tempo (`16 beats` = `9.60 s` + `0.12 s` tail = **9.72 s**, `466,560` frames, `1,866,284` bytes). Because Event 9 of Statement 1 (`beat: 6.0`, `durationBeats: 2.0`, `D5`) ends at beat `8.0` (`4.80 s`), it meets Event 0 of Statement 2 (`beat: 8.0`, `F#5`) seamlessly with full note value, zero silence padding, and zero tempo stretching.
2. **Curated C-Derived 8-Bar Forms & Light Arrangement Families (v1 + v2 Deep-Research Upgrades)**:
   - Diagnosed why Plan 32's rejected `S1`–`S3` extensions failed (sterile `-31 dBFS` 2-note drone, 4 bars of aimless upper-register meandering in `S2`, and omission of the hook return in `S3`), and further diagnosed via the 9 external deep-research reports why Motif C's 2-beat `D5` landing at Beat 6.0 stalls if backed by a static tonic `D` major chord or followed by a Bar 8 tonic `I -> I` seam collision.
   - Built four contrasting 8-bar (`19.32 s`, or exact `19.20 s` with Seamless Loop Wrap) C-derived forms that each preserve the exact 10-event Motif C anchor in Bars 1–2 (`beats 0..8`):
     - **`C1-period-lock`** (*Ripple & Courtyard Period*): Antecedent/consequent parallel period where Bars 3–4 pause on an open half-cadence on dominant `A5` (`MIDI 81`), Bars 5–6 return exact Motif C, and Bars 7–8 resolve via an authentic cadence to `D5`.
     - **`C2-call-and-breath`** (*Pond Echoes*): Conversational call-and-response leaving multi-beat lead rests in Bars 3–4 and Bar 8 while accompaniment bells/chords answer in the spaces.
     - **`C3-accompaniment-groove`** (*Morning Duck-Shop*): Beginning-of-game accompaniment-led form where Motif C anchors Bars 1–2 and Bars 7–8 while the bouncy bass and hocketing accompaniment carry Bars 3–6 (with only a brief 4-note motif wink in Bar 5).
     - **`C4-sentence-drive`** (*v2 Classical Sentence 2+2+4 — E6 Apex & Deceptive Turnaround*): Caplin sentence structure from the Prompt 1 research consensus—states exact Motif C in Bars 1–2, repeats exact Motif C in Bars 3–4 over deceptive/subdominant reharmonization (`Bm7 -> F#m7 -> Gmaj7 -> Em7`), sequences the rising triad up to a single `E6` climax in Bar 5, fragments into `A7` in Bar 6, brings back the hook tail over a deceptive `Bm7` cadence in Bar 7, and rests the lead in Bar 8 while the lower counter-voice previews the hook an octave lower over an `Em7 -> A7` turnaround.
   - Provided **`N1-sunny-waddle`** (`9.72 s`, 4 bars) in a clearly separated *"Optional Separated New-Core Comparison — Does Not Replace Motif C"* section to test whether a narrower mid-register sixth (`D5–B5`, avoiding high `D6`) conditions external generators differently.
   - Implemented **5 harmony options** (`H0-dry`, `H1-bright-resolved`, `H2-floating-color`, `H3-playful-hocketing`, and **`H4-deceptive-pivot`**, with `H1` and `H2` repaired to eliminate Beat 6–8 tonic stagnation and Bar 8 `I -> I` loop-seam collisions) and **8 pure Web Audio procedural synth patches**:
     - v1 baselines: `P0-plan32-triangle`, `P1-pluck-bell`, `P2-warm-keys`, `P3-toy-ensemble`.
     - v2 acoustic-inspired topologies from Prompt 2 research: **`P4-cozy-marimba`** (`1:4` arch-cut second-octave FM + `3.92×` warm wood mode + `8 ms` bandpassed mallet click), **`P5-warm-rhodes`** (`1:1` body FM + `14:1` metallic tine ping + shared asymmetric tube `WaveShaperNode` + dynamic `4.0 kHz -> 1.6 kHz` lowpass sweep), **`P6-acoustic-pluck`** (pre-computed Extended Karplus-Strong string waveguide with Jaffe-Smith allpass fractional-delay tuning + `220 Hz` wooden body formant resonance), and **`P7-breath-ocarina`** (Helmholtz resonator `PeriodicWave` + `20 ms` breath chiff + `-15 cent` pitch scoop + `250 ms` delayed `5.2 Hz` vibrato on sustained notes only).
   - Added toggleable **Cozy Wood Room Air** (`0.24 s` deterministic stereo `ConvolverNode` IR, `convolver.normalize = false`, `180 Hz` highpass send), **Cozy Pocket Micro-Groove** (`52.3%` swing on offbeat 8ths, `+8 ms` lead downbeat pocket, chord strumming, articulated 8th gates), **Brushed Shaker Pulse** (beats 2 & 4), and **Seamless Loop Wrap** (`19.2000 s` / `921,600` frames overlap-add tail wrap).
3. **Unified Web Audio Graph, Dual Export Profiles & Suno Conditioning Stems**:
   - Both real-time browser audition (`AudioContext`) and offline file export (`OfflineAudioContext`) execute the exact same `buildScheduledScore` and `scheduleOnAudioContext` functions on the Web Audio clock.
   - Exporting a bundle produces **Full Mix WAV**, **Melody-Only WAV** (verified 100% identical scheduled `leadEvents`), **Backing-Only WAV** (when accompanied), **2-Voice Conditioning Skeleton WAV** (`-suno-skeleton.wav`: Lead + `-4 dB` Root Bass, zero middle chords, forced 100% dry), **-1 Octave Conditioning Lead WAV** (`-suno-melody-octdown.wav`: `D4–D5` neural pitch-tracker sweet spot, forced 100% dry), and **Reproducible Score/Settings/Provenance JSON** (verified round-trip via `validateImportedManifest`).

---

## 2. Advisor Consultation Disposition

- **Branch Selected**: **Branch C — `orchestrator-gate-only`** (explicitly authorized in `docs/development/plan-39-melody-reference-and-web-audio-laboratory.md` §Stop conditions and delivery: *"Record consultation posture; no paid higher-tier advisor is required or authorized beyond the Argon lead and Flash tasks."* Additionally, `advisor-capable-providers.json` lists `claude-code`, `codex-cli`, and `kimi-code`; this Gemini Argon thread under Antigravity does not match a higher-tier advisor entry in `advisor-capable-providers.json` and fails closed to Branch C).
- **Compensating Verification**: The Argon lead directly audited every Flash worker's output against repository ground truth, corrected scope/metric wording in `external-research-prompts.md` and frame-count rounding in `synth-engine.js`, and executed both unit tests (`laboratory.test.mjs`) and real headless Chrome `AudioContext` + `OfflineAudioContext` verification (`browser-verify.mjs`) via `bounded-node-run.ps1`.

---

## 3. Research Dispositions & Current Service-Mode Guidance

Full synthesis and literature citations (using Plan 33's `[E-full]`, `[E-abs]`, `[E-sec]`, `[P]`, `[T]`, `[H]` labels) are documented in `reports/development/plan-39-melody-reference-and-web-audio-laboratory/research/music-and-conditioning-brief.md`, with three self-contained external deep-research prompts in `research/external-research-prompts.md`:

1. **Suno Upload & Conditioning (`https://help.suno.com/en/articles/2477633`, `https://suno.com/products/covers`)**:
   - **Duration Gate**: Suno enforces a **6.00 to 60.00 second** audio upload requirement (up to 120 s / 8 min on paid tiers). Original Motif C (`4.92 s`) failed solely due to `4.92 s < 6.00 s`. `C0-repeat2x` (`9.72 s`) and `C1`–`C3` (`19.32 s`) satisfy this gate cleanly.
   - **Cover vs. Extend**: **Cover** mode re-orchestrates an uploaded clip while attempting to preserve its pitch/rhythm contour; **Extend** mode treats the upload as a fixed intro stem and generates new music *after* the timestamp. For re-arranging Motif C, **Cover** is the target mode.
   - **Audio Weight vs. Prompt Competition**: Dense genre/instrument text prompts compete with the audio latent representation in Cover mode. Starting with high Audio Influence (`75%–85%`), concise style prompts, and testing **Melody-Only WAV** (`D2-A`) vs. **Full Mix WAV** (`D2-B`) isolates whether accompaniment helps or confuses pitch tracking.
2. **Gemini Create Music / Lyria (`https://support.google.com/gemini/answer/16901237`)**:
   - Consumer Gemini Create Music supports text prompts and visual inputs. Attaching a `.wav` file in consumer Gemini chat routes the audio to multimodal language comprehension (which describes the audio in text) rather than a waveform/chroma conditioning channel in Lyria. This explains why Plan 32's Gemini tracks sounded appealing but did not preserve Motif C's 10-note contour.

---

## 4. Candidate, Harmony, and Patch Source Map & Real-Browser PCM Measurements

All measurements below were captured from real Google Chrome `OfflineAudioContext` renders (`48,000 Hz`, stereo, 16-bit PCM WAV) via `lab/browser-verify.mjs` and recorded in `exports/browser-verification-report.json`.
*(Note: Peak and RMS are float32/PCM16 sample peak and RMS measurements only — not LUFS or true peak.)*

| Candidate ID | Group / Role | Default Harmony & Patch | Bars / Duration (100 BPM) | Frames / WAV Bytes | Lead / Chord / Bass Events | Mix Sample Peak / RMS (dBFS) | Melody-Only Peak / RMS (dBFS) | Lead Parity (`Mix === Solo`) |
|---|---|---|---|---|---|---|---|---|
| **`C0-original`** | Historical 1× Control | `H0-dry` + `P0-plan32-triangle` | 2 bars / **4.92 s** | `236,160` / `944,684 B` | 10 / 0 / 0 | `-16.5 dBFS` / `-31.8 dBFS` | `-16.5 dBFS` / `-31.8 dBFS` | Verified (10/10) |
| **`C0-repeat2x`** | Length-Sufficient 2× Control | `H0-dry` + `P0-plan32-triangle` | 4 bars / **9.72 s** | `466,560` / `1,866,284 B` | 20 / 0 / 0 | `-16.4 dBFS` / `-31.8 dBFS` | `-16.4 dBFS` / `-31.8 dBFS` | Verified (20/20) |
| **`C1-period-lock`** | C-Continuation (Parallel Period) | `H1-bright-resolved` + `P1-pluck-bell` | 8 bars / **19.32 s** | `927,360` / `3,709,484 B` | 39 / 64 / 19 | `-10.5 dBFS` / `-27.2 dBFS` | `-15.9 dBFS` / `-29.4 dBFS` | Verified (39/39) |
| **`C2-call-and-breath`** | C-Continuation (Call & Breath) | `H2-floating-color` + `P2-warm-keys` | 8 bars / **19.32 s** | `927,360` / `3,709,484 B` | 29 / 63 / 13 | `-9.8 dBFS` / `-25.5 dBFS` | `-13.4 dBFS` / `-28.0 dBFS` | Verified (29/29) |
| **`C3-accompaniment-groove`** | C-Continuation (Accompaniment-Led) | `H3-playful-hocketing` + `P3-toy-ensemble` | 8 bars / **19.32 s** | `927,360` / `3,709,484 B` | 24 / 63 / 16 | `-12.6 dBFS` / `-28.6 dBFS` | `-16.0 dBFS` / `-30.1 dBFS` | Verified (24/24) |
| **`C4-sentence-drive`** | v2 C-Continuation (Sentence 2+2+4) | `H4-deceptive-pivot` + `P4-cozy-marimba` | 8 bars / **19.32 s** | `927,360` / `3,709,484 B` | 36 / 92 / 24 | `-11.4 dBFS` / `-27.1 dBFS` | `-16.4 dBFS` / `-29.0 dBFS` | Verified (36/36) |
| **`N1-sunny-waddle`** | Separated Optional Foil Core | `H1-bright-resolved` + `P1-pluck-bell` | 4 bars / **9.72 s** | `466,560` / `1,866,284 B` | 18 / 43 / 11 | `-10.6 dBFS` / `-27.6 dBFS` | `-16.1 dBFS` / `-29.9 dBFS` | Verified (18/18) |

---

## 5. Delegated Flash Worker Record & Lead Curation

| Worker ID | Role & Subagent Type | Requested / Observed Model | Task & Write Posture | Lead Verification & Curation Applied |
|---|---|---|---|---|
| `d9ffd785-42ea-4781-a4c9-cb250d1b50ad` | Plan 32/33 Music Input Researcher (`research`) | Requested `flash`; self-reported Gemini Flash (platform tier-generic caveat noted) | Strictly read-only synthesis of Plan 32 `motifs.js`, `preview.js`, `composition-extensions.js`, `research-01.md`, and Plan 33 files | Verified exact 10-event Motif C table and `4.80 s + 0.12 s = 4.92 s` math directly against `motifs.js` (`SHA-256: 3b47ecdb...0af59e02`). |
| `de88405e-e339-4345-babd-e64a193f7a65` | Web Audio & Conditioning Researcher (`self`) | Requested `flash`; self-reported Gemini Flash | Strictly read-only web & technical synthesis of Suno 6–60 s upload rules, Cover vs Extend, Gemini Create Music, and pure Web Audio patch design | Verified primary help URLs and stripped any `DynamicsCompressorNode` pumping from the `P0-plan32-triangle` control path so `C0-original` matches Plan 32's exact `-16.5 dBFS` peak and `-31.8 dBFS` RMS. |
| `798a727c-46db-4855-b9ef-70d16b1580bb` | Music & Conditioning Brief Author (`self`) | Requested `flash`; self-reported Gemini 2.5 Flash | Sole writer for `research/music-and-conditioning-brief.md` and `research/external-research-prompts.md` | Inspected both files; edited `external-research-prompts.md` to replace a stray reference to `src/audio/synth.mjs` and `-16.0 LUFS` with report-local `lab/patches.js`/`lab/synth-engine.js` and explicit PCM peak/RMS wording. |
| `0c8a7283-04de-4ea2-8a8e-a5c26a97427d` | Score & Voicing Drafter (`self`) | Requested `flash`; self-reported Gemini 2.5 Flash | Drafted v1 scores and executed bounded v2 single-writer upgrade of `lab/scores.js` (`C4-sentence-drive`, `H4-deceptive-pivot`, and `H1`/`H2` seam/bridge repairs) | Audited every note event for monophonic non-overlap, exact Bar 1–2 Motif C anchor match, and dominant Bar 8 loop turnarounds. |
| `edca6ba9-3480-49dd-b8a1-9f52e5bb4baa` | Web Audio & WAV Engine Drafter (`self`) | Requested `flash`; self-reported Gemini Flash | Drafted v1 engine and executed bounded v2 single-writer upgrade of `lab/patches.js` (`P4`–`P7`) and `lab/synth-engine.js` | Consolidated track-level `StereoPannerNode`, `WaveShaperNode`, static `BiquadFilterNode`, and `220 Hz` body formant filter onto shared `leadBus`/`chordsBus`/`bassBus` in `lab/synth-engine.js` to eliminate redundant per-note DSP overhead in `OfflineAudioContext`. |
| `7a25863c-cf97-4de6-932c-bcaae976e08f` | Laboratory HTML & CSS Drafter (`self`) | Requested `flash`; self-reported Gemini 2.5 Flash | Drafted v1 UI and executed bounded v2 single-writer upgrade of `index.html`, `laboratory.css`, and `lab/laboratory.js` | Verified all 40 mandatory DOM IDs, acoustics/conditioning toggles, Suno v6 recipe card, and 5-stem offline export bundles. |
| `008f5674-6399-4030-a3f5-dc9a586bb310` | Prompt 1 Phrase Craft Analyst (`research`) | Requested `flash`; self-reported Google Gemini (Flash worker) | Read-only cross-model synthesis of `prompt-1-chatgpt.md`, `prompt-1-claude.md`, and `prompt-1-gemini.md` | Curated findings on Beat 6.0 `D5` deceptive recontextualization, `I -> I` Bar 8 loop seam collisions, and the `2+2+4` Classical Sentence blueprint (`C4-sentence-drive`). |
| `b9cd832f-ee61-4062-ac0b-3253e01fd0bd` | Prompt 2 Web Audio Synth Analyst (`research`) | Requested `flash`; self-reported Google Gemini (Flash worker) | Read-only cross-model synthesis of `prompt-2-chatgpt.md`, `prompt-2-claude.md`, and `prompt-2-gemini.md` | Curated exact DSP specifications for `P4-cozy-marimba`, `P5-warm-rhodes`, `P6-acoustic-pluck`, `P7-breath-ocarina`, `ConvolverNode` room air, and micro-groove. |
| `59349e89-2fd1-45a9-b386-ca53804d7bd6` | Prompt 3 Conditioning Analyst (`research`) | Requested `flash`; self-reported Google Gemini (Flash worker) | Read-only cross-model synthesis of `prompt-3-chatgpt.md`, `prompt-3-claude.md`, and `prompt-3-gemini.md` | Curated the Suno v6 slider protocol (`Audio Influence 75%`, `Style 40%`, `Weirdness 15%`, `Variety 0`, `Max Mode ON`), Dual Export Profile, 2-Voice Conditioning Skeleton, and `-1` Octave Conditioning Lead. |

---

## 6. Files Created (Owned Scope Only)

All created files reside strictly inside `reports/development/plan-39-melody-reference-and-web-audio-laboratory/`:

- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/index.html` — Owner-facing Web Audio audition & WAV/JSON export laboratory UI.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/laboratory.css` — Responsive light/dark studio stylesheet honoring `prefers-reduced-motion: reduce`.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/scores.js` — Frozen symbolic score & harmony authority (`C0-original`, `C0-repeat2x`, `C1-period-lock`, `C2-call-and-breath`, `C3-accompaniment-groove`, `N1-sunny-waddle`, `H0`–`H3`).
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/patches.js` — Frozen procedural Web Audio synth patch definitions (`P0-plan32-triangle`, `P1-pluck-bell`, `P2-warm-keys`, `P3-toy-ensemble`).
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/synth-engine.js` — Shared deterministic score scheduler, Web Audio graph builder (`AudioContext` + `OfflineAudioContext`), PCM16 WAV encoder/header parser, lead-event parity verifier, and manifest round-trip validator.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/laboratory.js` — Browser DOM controller, transport lifecycle, phrase visualizer, offline export bundler, and namespaced notes/manifest import-export handler.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/laboratory.test.mjs` — Node unit test suite verifying provenance hashes, repetition join, anchor preservation, lead parity, combination guards, and WAV/manifest round-trip.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/browser-verify.mjs` — Isolated headless Chrome verification runner testing live `AudioContext` lifecycle, `OfflineAudioContext` rendering, WAV downloads, and zero network calls.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/research/music-and-conditioning-brief.md` — Grounded musical & reference-conditioning brief with Plan 33 evidence labels and owner observation recording sheet.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/research/external-research-prompts.md` — Three self-contained external deep-research prompts with explicit laboratory impact mappings (with Prompt 2 sharpened to skip solved v1 basics and target advanced 2-op FM, `PeriodicWave` Fourier tables, physical-modeling plucks, deterministic `ConvolverNode` room impulse generation, and sequencer micro-groove/articulation).
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/plan39-c0-repeat2x-h0-dry-p0-plan32-triangle-100bpm-melody.wav` — Ready-to-upload 9.72 s (`466,560` frames, `1,866,284` bytes, SHA-256 `a6fa722937ce4996c2fb05204031b983164e3694734d68567360bd3f44483e07`) 2× exact repeated Motif C WAV clearing Suno's 6.0 s minimum.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/plan39-c0-repeat2x-h0-dry-p0-plan32-triangle-100bpm-manifest.json` — Reproducible provenance & event manifest for `C0-repeat2x`.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/plan39-c1-period-lock-h1-bright-resolved-p1-pluck-bell-100bpm-manifest.json` — Reproducible provenance & event manifest for `C1-period-lock`.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/browser-verification-report.json` — Full headless Chrome verification report and PCM measurements across all 6 candidates.
- `reports/development/plan-39-melody-reference-and-web-audio-laboratory/progress.md` — This progress report.

*(Unfamiliar working-tree paths left untouched per commit discipline: `reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/previews/` and `reports/development/plan-37-action-time-and-optional-life-lanes/`.)*

---

## 7. Commands Run and Verification Results

1. **Preflight Packet Check**:
   - Command: `pwsh -ExecutionPolicy Bypass -Command "& .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe @('scripts/dev/plan-status.js', 'check', '39')"`
   - Result: `ExitCode: 0`, `RUNNABLE: plan-39 is ready to implement` (`ElapsedSeconds: 0.55`, `PeakSampledPrivateBytes: 4059136`).
2. **Unit Test Suite (`laboratory.test.mjs`)**:
   - Command: `pwsh -ExecutionPolicy Bypass -Command "& .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe @('--test', 'reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/laboratory.test.mjs')"`
   - Result: `ExitCode: 0`, 6/6 tests pass (`ElapsedSeconds: 0.55`, `PeakSampledPrivateBytes: 3825664`).
3. **Real-Browser Web Audio & WAV Export Verification (`browser-verify.mjs`)**:
   - Command: `pwsh -ExecutionPolicy Bypass -Command "& .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 node.exe @('reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/browser-verify.mjs')"`
   - Result: `ExitCode: 0`, 6/6 candidates rendered and verified in isolated headless Chrome, 0 non-local network requests, 0 page runtime errors, live `AudioContext` `PLAYING -> PLAYING -> IDLE` lifecycle verified, and downloaded WAV headers & JSON manifests verified on disk (`ElapsedSeconds: 12.03`, `PeakSampledPrivateBytes: 441876480`).

---

## 8. Audition Honesty & Verification Limits

- **What was verified by automated harness and headless Chrome**:
  - Exact note/beat/duration preservation of Plan 32 Motif C (`motifs.js` SHA-256 verified), seamless 2× join at beat `8.0` (`4.80 s`), monophonic voice safety, `leadEvents` identity between Full Mix and Melody-Only exports, real browser `OfflineAudioContext` float32 rendering and 16-bit PCM WAV encoding (`48,000 Hz`, stereo, zero NaNs, zero clipped samples), live `AudioContext` scheduling and `Stop` teardown, and JSON manifest round-trip restoration.
- **What automated verification does NOT establish**:
  - Automated tests and headless `OfflineAudioContext` rendering verify structural, mathematical, and signal-level properties only. They do **not** hear acoustic pleasingness, judge whether a phrase continuation feels catchy or natural, or guarantee that Suno or Gemini will preserve the melody upon upload. **Human owner listening is the sole creative selection gate.**

---

## 9. Short Owner Listening Route & Local Audition URL

### How to Open the Laboratory
- **Direct Local File URL (works immediately in Chrome/Edge without a server)**:
  `file:///C:/AI/Quackpot/reports/development/plan-39-melody-reference-and-web-audio-laboratory/index.html`
- **Ready-to-Upload 9.72 s 2× Repeated C Reference WAV on Disk**:
  `reports/development/plan-39-melody-reference-and-web-audio-laboratory/exports/plan39-c0-repeat2x-h0-dry-p0-plan32-triangle-100bpm-melody.wav`

### 4-Step Owner Listening Route
1. **Step 1 — Baseline & Length Control**: Click **Play Original C (4.92 s)** and **Play 2× Repeat C (9.72 s)** in the Quick-Start bar. Confirm the 9.72 s repeat joins seamlessly at Bar 3 Beat 1 without changing C's feel.
2. **Step 2 — Compare the 3 C-Derived 8-Bar Forms**: Click **Audition C1 Period** (open half-cadence on A5 in Bar 4), **Audition C2 Breath** (conversational rests with floating bell/chord echoes), and **Audition C3 Groove** (accompaniment-led scene where C rests through Bars 3–6 except for a brief Bar 5 wink).
3. **Step 3 — Swap Harmonies, Patches & Layer Solo**: Use the dropdowns to test `H1`–`H3` and `P0`–`P3`, and switch between **Full Mix**, **Melody Solo**, and **Backing Solo** (or check the separated optional **N1 — Sunny Waddle** card at the bottom).
4. **Step 4 — Export Reference Bundle**: Click **Render & Prepare Export Bundle** for any favorite configuration to download its **Full Mix WAV**, **Melody-Only WAV**, **Backing-Only WAV**, and **Score/Provenance JSON** for external conditioning trials.

---

## 10. Remaining Risks & Follow-Ups

- External services (Suno Cover, Gemini Create Music) remain probabilistic neural generators; using the diagnostic matrix (`D1`–`D5`) and recording sheet in `research/music-and-conditioning-brief.md` will isolate whether dry `C0-repeat2x` (`9.72 s`) or accompanied `C1`–`C3` (`19.32 s`) yields better melodic retention in Suno Cover.
- Production soundtrack adoption and runtime game integration remain separately gated until owner listening selection.

- **Ready for orchestrator review**: **yes**
