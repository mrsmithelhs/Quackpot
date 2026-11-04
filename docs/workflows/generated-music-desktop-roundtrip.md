# Generated music: desktop transcription and laptop reconstruction

**Owner-selected workflow, 2026-11-04.** Use official MuScriptor Large with CUDA FP32 on the owner's RTX 3090 desktop for future authorized generated-track transcriptions. Plan56's community FP16 laptop branch is closed without installation or inference. The first desktop M1/M3/M5 roundtrip succeeded; that evidence does not guarantee future quality or authorize another run. No Quackpot checkout is needed on the desktop.

## Portable job folder

Create a new ignored job folder under Plan53's `local/`, or the report-local private folder of a future packet. Keep another backup: ignored files are not backed up by Git. Assign neutral logical track IDs and a unique job ID; never overwrite an earlier job.

Transfer only:

- `HANDOFF.md`: copy the starting prompt below, with the specific approved tracks and limits.
- `input-manifest.json`: schema/job ID; each input's logical ID, relative path, byte count and SHA-256; intended source excerpt bounds; provenance/rights confirmation; requested settings; any prior comparison artifact hashes. Do not include personal paths or account details.
- `inputs/`: unchanged owner-authorized MP3 files.
- Optional `excerpts/`: exact previously decoded comparison WAVs, with frame/rate/channel metadata and source-relative bounds. Copy exact bytes when comparing models; do not silently recrop.
- Optional baseline events and portable helpers needed for the comparison, clearly marked as reference only, never model conditioning.

The completed historical transfer under Plan53 `local/desktop-large-transfer-2026-11-03/` and returned `local/MuScriptor-Large-return/` are private examples. The original [desktop handoff](../../reports/orchestration/muscriptor-large-desktop-handoff.md) records the first job's settings and stages; its M1/M3/M5 identifiers, budgets and old package pins are historical rather than automatic defaults for new tracks.

## Desktop starting prompt

> Work only in this standalone job folder; do not clone Quackpot. Verify the manifest and original hashes. Use the existing official MuScriptor Large CUDA FP32 environment and staged weights if intact; record actual code/package/model revisions, hashes, dtype and settings. Inspect hardware, free RAM/VRAM/disk and competing jobs before loading. Do not reinstall, upgrade, download weights, change drivers or introduce a community runtime without a concrete owner-approved setup proposal. Never request credentials in chat.
>
> First propose the exact representative excerpt, decode/resample rules, one-run resource limits, monitoring and cleanup. Prefer the existing deterministic unconditioned settings when compatible; verify API signatures. After approval, run one excerpt, preserve raw events before cleanup and return a small package for same-renderer listening on the laptop. Stop for owner listening before full tracks unless this job explicitly authorizes them. A working existing environment removes setup work, not the listening gate.
>
> After the owner clears the full batch, transcribe each specified MP3 once, sequentially. Use finite independent watchdogs and measured headroom; distinguish hard process limits from sampled GPU/RAM thresholds. Stop on OOM, timeout, invalid output, hash mismatch, monitoring failure or conflicting GPU work. No automatic retries, fallback, quantization, separation, retuning or invented instrument conditioning. Preserve failures and source bytes; terminate only owned work. Produce the return contract below. No uploads, publishing or production integration.

## Return ZIP contract

Use relative paths in a self-contained ZIP, one unique root folder per job:

```text
RETURN-README.md
environment.json
scripts/
comparison/<track-id>-excerpt/   # if performed
tracks/<track-id>/
failures/                       # sanitized, if applicable
return-manifest.json
```

Each run includes raw ordered events, derived MIDI, detected grid, timing/offset/cleanup description, note/program/drum summary, settings and resource/exit report. Document the raw schema explicitly. The successful historical return uses JSONL `start`, `end` and `progress` events, with note ends referencing start-event indices; this differs from earlier JSON objects containing an events array. Do not discard program/drum identity, overlaps or source-relative timing to force compatibility. State omitted/unmatched/zero-length events. Velocity is not recovered expressive dynamics when assigned by the renderer.

`return-manifest.json` lists schema/job ID, status per requested run and each payload file's relative path, byte count and SHA-256 (exclude the manifest itself to avoid a circular hash). Record input hashes and model/version/dtype/settings per run. Exclude source recordings, weights, virtual environments, caches, credentials, personal absolute paths, account/session identifiers and raw harness traces. Retain exact private diagnostic logs on the desktop if needed. ZIP creation alone is not validation.

## Laptop intake and listening

1. Preserve the ZIP unchanged and hash it. Inspect its entry list before extracting: reject traversal/absolute paths, duplicate or conflicting names and unreasonable expansion sizes. Extract to a fresh ignored job folder; never merge over previous results.
2. Validate the declared schema, file hashes, run statuses and original input hashes. Validate finite note times, paired indices, program/drum mapping and MIDI parseability. Inspect portable scripts as data before executing; do not auto-run returned scripts.
3. Reuse Plan53's reviewed raw-event adapter and offline TinySynth rendering method where compatible. Preserve raw predictions; label all mapping, fixed velocity, timing, effect tails and derived adjustments. A new schema or renderer change needs a bounded review, not silent conversion.
4. Render a matched original/reconstruction excerpt first, with track labels and direct audio links. Owner listening determines usefulness. Any duration shortening, note pruning, arrangement repair or alternate instruments are separate derived experiments; never overwrite raw transcription.
5. Commit only sanitized methodology/evidence summaries. Media and return bundles stay ignored. Production soundtrack adoption remains a separate decision.

This document is a reusable process, not a new installer or automated transfer/import tool. Future jobs must still specify inputs, resources, rights and approval gates.
