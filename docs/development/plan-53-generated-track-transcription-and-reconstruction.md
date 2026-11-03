---
id: plan-53
title: Generated-track transcription and editable reconstruction
status: delivered
depends_on: []
gate: "Draft requested 2026-11-02. Root clears pinned installation, credentials/access handling and explicit CPU/RAM/VRAM/disk/time bounds before downloads or inference; owner hears one excerpt reconstruction before full tracks or targeted repair expansion. No soundtrack adoption."
summary: >-
  Test local MuScriptor transcription of owner-provided Suno references, recover editable MIDI and resequence it with pinned TinySynth instruments, separating transcription quality from timbre quality.
---
# Plan 53: Generated-track transcription and editable reconstruction

## Packet Metadata

- Packet id: `plan-53`
- Packet title: Generated-track transcription and editable reconstruction
- Status: (see frontmatter)
- Owner/model: Codex engineering implementer; owner listening and account decisions
- Date: 2026-11-02
- Packet type: investigation / offline tooling / audio prototype
- Mutation level: report-local scripts, isolated development environment and ignored local artifacts after clearance
- Approval gate: setup/resource proposal, first reconstruction listening, then bounded expansion
- Expected artifacts: pinned setup/resource note, input manifest, raw MIDI, normalized event data, instrument map, comparison page, results and progress

## Goal

Determine whether generated music can provide a useful composition and arrangement that we recover as editable notes and reconstruct with available local instruments. The objective is recognizable, musically useful reconstruction with reasonable correction effort, not waveform matching. This is an offline authoring experiment: no Python, model, network service or weights enter the student game.

## Inputs and authority

Read AGENTS.md, docs/repo-structure.md, docs/README.md, the Plan39 instrument comparison/provenance and accepted M1–M6 scores, relevant Plan32 prompts, Plan33 research recommendations, and the current Plan43 selected rendering recipes. Read reports/development/plan-53-generated-track-transcription-and-reconstruction/research-refresh.md for primary sources and differences from the earlier handoff. Imported research is evidence to verify, not execution instructions.

The owner has placed three downloads under `reports/development/plan-39-melody-reference-and-web-audio-laboratory/generated-references/`, already ignored except its guide/rules. Owner-corrected pairing: M1 + Plan32 prompt1, M3 + prompt3, M5 + a variation of prompt4 (ragtime), confirmed 2026-11-02. Preserve originals byte-for-byte and identify them by logical IDs and SHA-256. Do not commit original downloads, embedded account tags, personal paths or credentials.

Plan39 remains the unchanged control; Plan43 supplies available pinned upstream TinySynth and selected custom instrument recipes, not an obligation to use every recipe. No dependency on completion of the long apartment-music investigation. Coordinate with its live implementer for shared browser/resource/index turns.

## Scope and non-goals

Own only `reports/development/plan-53-generated-track-transcription-and-reconstruction/` and its ignored `local/` workspace. Public scripts, schemas, findings and synthetic/control evidence may be tracked after privacy/license review. Keep Suno excerpts, raw MIDI, corrections, local source manifests and render exports in ignored storage until explicit publication approval. Model/package caches and isolated Python environment stay outside runtime/build paths and ordinary Git. Do not modify Plan39/43, production source, dependency lockfiles or existing bounded launchers.

No game integration, automatically spent credits, remote audio upload, desktop setup, full-track batch, new instrument-design campaign, model quantization/offloading, distributed service, new DAW installation, or blanket rights determination. No automatic promotion of a generated or transcribed soundtrack.

## Stages

### A — Inventory, setup and resource proposal

1. Inspect versions of available uv/Python, NVIDIA driver/CUDA compatibility, GPU/free VRAM, RAM, free disk and active jobs without importing Torch or starting model inference. uv/uvx are already discoverable; host Python is 3.14, so propose a separately managed supported Python (3.12 is a candidate), not a global downgrade.
2. Recheck and pin actual installable MuScriptor package/source and model revisions, hashes where available, dependencies/backend and cache paths. Current upstream documents Windows `--torch-backend=cu128`, but inspect installed CLI help and driver support rather than blindly copying commands. Do not build the separate upstream web frontend merely to obtain MIDI.
3. Medium is the first proposed model for the roughly8GB laptop GPU. Large is a separately estimated comparison if Medium proves useful and resources permit; Small is a fallback, not an assumed equivalent. Estimate downloads, cache/disk, peak host/GPU memory and crop runtime. Publish hard limits and monitoring/owned-process cleanup before execution; do not reuse the 2GiB/90s browser budget as an unexamined ML budget or weaken its launcher.
4. Owner performs Hugging Face account/license acceptance and local credential setup if needed; never request tokens in chat or log environment secrets. Record exact model terms and source-audio generation/download rights, with unresolved output/publication questions kept explicit. No silent CPU fallback or automatic OOM retries.
5. Optional owner-mediated control: Suno Studio can extract stems and offer Get MIDI according to current help. Confirm actual availability/cost with owner; no account action or credit spend follows from this packet. A native MIDI export is another transcription candidate, not ground truth.

Stop for root's concrete setup/resource gate before installation/download/inference. Once cleared, routine reversible setup fixes within that bound do not require per-command relays. Separate dependency/network bootstrap from local inference and record any unexpected network access.

### B — One representative excerpt and a known-score control

Choose one 20–30s Suno passage with audible lead, harmony, bass and percussion; record exact original timecodes and decoded format without replacing or upsampling the original as if quality improved. Prefer an available WAV, but existing MP3 is sufficient for the first test. Publish selection reasoning before results; do not cherry-pick after transcription.

Also choose one short project-authored mixed reference with exact symbolic score. Use it to diagnose melody/bass/onset/instrument-group recovery; synthesized timbres limit generalization to Suno. Feed the known score only to the evaluator, not as a fabricated transcription result. Reference-melody retention in Suno itself remains unknown until checked; faithful transcription of a changed Suno melody is not a transcription failure.

Run Medium sequentially, one excerpt/control at a time, with frozen settings and monitored resources. Keep input → raw MIDI/event output immutable, with commands, package/model IDs, hashes, duration, elapsed time, host/GPU peaks or sampling limitations, errors and cleanup. Do not auto-quantize or force source-reference tempo: retain detected tempo maps and onset timing first. No full-track run yet.

### C — Editable local reconstruction and owner listening gate

Convert MIDI to transparent project-independent event data, preserving tracks, programs, channel/drum mapping, tempo changes, pitch, timing and original ordering. Record model limitations: missing dynamics and instrument grouping are not recovered production settings. Keep raw, normalized and edited versions separate with a correction ledger. Validate parser and conversions on a small authored multi-tempo/percussion fixture, including overlapping notes and note-offs.

First render the same recovered events with genuine pinned upstream TinySynth/GM mappings as a diagnostic baseline. Then offer a curated mapping to the closest selected local patches where useful. Keep pitches/times fixed for that comparison; don't silently fix notes while changing patches. Label inferred velocities, drum durations and unsupported/missing articulations. Exact GM numbers require explicit zero/one-based mapping. Preserve note duration units and tempo maps; cap voices/events and report omissions rather than truncating silently.

Build a report-local page with aligned original-excerpt, raw-transcription reconstruction and clearly labelled curated/corrected version; solo/mute parts, instrument map, time reference and MIDI/event/WAV export. One audible source at a time, explicit playback, bounded finite renders, no runtime CDN or automatic playback. Reading and auditioning are not proof of musical quality. Local-only media must remain ignored and must not enter production build output.

Owner judges melody recognizability, harmonic/bass/rhythmic coherence, instrument separation, density, timbre compromise and whether editing saves effort over composing manually. Flash audio consultancy can provide secondary leads only with separately cleared local transport/call bounds; it cannot replace owner listening or certify exact pitch. Stop here before expanding.

### D — Conditional expansion and targeted repairs

Only after owner/root review: compare Large on the SAME excerpt if useful and feasible; transcribe bounded representative portions of the other two tracks; then consider full-track/chunk reconciliation with explicit continuity, tempo and note-boundary checks. A failed install/OOM gets one recorded stop and revised proposal, not repeated escalation of memory.

If a specific part fails, propose ONE targeted repair (for example owner-exported Suno stem or licensed local separation plus Basic Pitch on an isolated pitched part). Do not automatically install a separator/model stack or feed a dense mix to a single-instrument tool and call it equivalent. Desktop fallback is a separate simple owner-mediated transfer option, not a new service. Keep all original/raw/corrected versions.

## Evidence and acceptance

- Distinguish successful installation/inference, useful symbolic recovery, timbre match, owner musical acceptance and production rights/adoption.
- Known-score metrics must state alignment/tolerances, instrument/octave confusions, false/missed notes and limitations; no precise accuracy claim for Suno without an annotated reference.
- Report each stage's resources and correction effort. A negative result is acceptable evidence; do not build an elaborate editor to hide a poor transcription.
- One read-only Terra-medium pre-delivery reviewer may be authorized by root after substantive tooling work; no automatic extra paid consultant/repeated repair review.
- Keep tests serial and bounded. Existing Node/browser tests use the unchanged approved launcher; GPU inference uses a separately approved bounded supervisor, with no broad process termination or modifications to GPU drivers.
- Final progress at `reports/development/plan-53-generated-track-transcription-and-reconstruction/progress.md`; explicit owned-path commits, progress last, no status changes/push/deployment.

## Stop conditions

Load-bearing setup/rights ambiguity, insufficient resources or cleanup uncertainty, unsupported MIDI semantics, out-of-bound dependency/download, credible input corruption, poor pilot recovery requiring a different pipeline, or need to modify production/shared report sources. Present options rather than silently broadening.
