# Standalone desktop handoff: MuScriptor Large on an RTX 3090

You are a Codex agent working on the owner's desktop, not in the Quackpot repository. This transfer folder is the complete task context. Do not clone or synchronize Quackpot, search unrelated chats, or modify any game source. The owner is a teacher using limited subscription plans; make routine implementation choices yourself, explain consequential choices plainly, and avoid repeated approval requests for already authorized work.

## Objective and scope

Set up an isolated, reproducible local MuScriptor Large environment, first transcribe the included 25-second M1 excerpt for comparison with the laptop's Medium result, then, after the owner approves proceeding, transcribe the three complete owner-supplied Suno recordings sequentially. Return raw events, derived MIDI, timing/beat information, resource/results manifests, and reusable setup/run scripts. No new music generation, source separation, arrangement repair, TinySynth sound design, cloud inference, publication, or game integration.

The desktop reportedly has an NVIDIA RTX 3090 with 24 GB VRAM. Verify actual hardware, available memory, driver, OS and storage; do not assume them. Prefer official MuScriptor/PyTorch Large, not the laptop's separate community GGUF feasibility branch. No quantization, custom model loader, CPU fallback or community runtime unless a concrete obstacle justifies a new owner-reviewed proposal.

## Folder contents and integrity

- `HANDOFF.md`: this brief.
- `input-manifest.json`: logical IDs, relative paths, sizes and SHA-256 hashes of every transferred input/baseline/helper. Verify before any decoding or model import. Failure stops the affected work; never silently replace a source.
- `inputs/`: three unchanged MP3 downloads.
- `excerpts/`: the exact laptop-decoded 00:20–00:45 WAV for each recording. Use these bytes for comparisons; do not recrop the MP3 for the first trial.
- `medium-baselines/`: raw Medium events and timing records, supplied for later comparison. Do not use them as model hints or input conditioning.
- `reference/single_pass_core.py`: the laptop's pure event-preservation/export helper, supplied as reference only. It has no executable inference entry point and must not be assumed compatible with an unchecked package version. Its 20,000-event cap was designed for excerpts, not full tracks.

Original source identities, independently recheck against the manifest:

| ID | Source | Bytes | SHA-256 |
|---|---|---:|---|
| M1 | M1-1-Miniature-Paper-Toy-World.mp3, reference M1 with Plan 32 prompt 1 | 2990110 | 55c4735cc709157ef6114520ef1653227517cbb9bb13e9837709079eb1d1d538 |
| M3 | M3-3-Polished-Groove.mp3, reference M3 with prompt 3 | 3219443 | 52331f4b539ce31d6c3141d89e8618852f3ad87b004d88ee0fdbd7faa5b3eb9b |
| M5 | M5-4-Ragtime-Question.mp3, reference M5 with a variation of prompt 4 | 2091335 | 439d250854162b437ca4981e67c1dda3d02832fbbbb45c2e84ced4b502c5aea0 |

M5 did NOT use prompt 5. These pairings do not prove that the generated tracks preserved a melody. Inputs and transcriptions are private development media; do not put them into a public Git repository. No credentials, account/session identifiers, model weights or environment caches belong in the returned bundle.

## Existing laptop baseline

Observed working stack: isolated Windows CPython 3.12.13, MuScriptor 0.4.0, PyTorch 2.8.0+cu128 and beat-this beat tracking. The Medium checkpoint revision was `f32236969308476e01fd3aae67357de5feb05a2d`. Desktop compatibility is unverified. Reuse that application version for a cleaner model comparison if practical; if a different version is required, explain and record it, rather than claiming a model-only comparison.

All excerpts are 48 kHz stereo PCM16 WAV, 1,200,000 frames, original time window 20–45 seconds. The original compressed-source decode was performed once; copying these exact WAVs avoids a decoder difference in the comparison.

The laptop transcribed deterministically with `use_sampling=False`, `temperature=1.0`, `cfg_coef=1.0`, `instruments=None`, `batch_size=1`, `beam_size=1`, `no_eos_is_ok=False`, `prelude_forcing=True`, CUDA float32. Validate actual API names/signatures before use. No hand-selected instrument conditioning or reference-score hints.

Medium predicted 542 note starts for M1 (452 acoustic-guitar-labelled, 90 drums); its listening adapter omitted one zero-duration pitched note with disclosure. M3 had 653 note starts across clean/distorted electric guitar, bass and drums. M5 had 450 piano-labelled note starts and no detected drum group. Those are model predictions, not source stems or ground-truth instruments.

Owner found the reconstructions promising. For M5 they preferred a later playback experiment with 50% note lengths and softer low piano, and hear possible hi-hats absent from the model output. Do NOT bake these playback preferences into raw Large output. Compare unedited model outputs first. Velocity in laptop playback was assigned, not recovered expressive dynamics.

## Stage A: read-only desktop inspection and setup proposal

Inspect the transferred files and their hashes, installed Python/package tools, NVIDIA driver/GPU/free VRAM, available RAM, disk, and any competing GPU/heavy jobs. Do not terminate unrelated processes. Choose an owner-approved ordinary local working folder, with separate input, environment/cache, run and return-output directories. Do not require machine-level code execution privileges merely because the task is outside a repository.

Review official sources and the actual package before selecting commands:

- https://github.com/muscriptor/muscriptor
- https://huggingface.co/MuScriptor/muscriptor-large
- https://pypi.org/project/muscriptor/
- https://pytorch.org/get-started/locally/

Historical Large metadata observed on 2026-11-02: revision `8809fdfbed2affa7ade94a7059e746e3880720e7`, weights 5,465,642,136 bytes, SHA-256 `ac4eb6ea87dfc26b6ca6b954c6b967ab87ad4c7d08e078b25214f13ed051f397`. Verify against the chosen snapshot; do not treat this as a live download guarantee. Pin code/package/model and beat-model versions and hashes. Code and weight licenses differ. The official Large repository is separately gated; the owner may need to accept its terms and sign in locally. Never ask them to paste tokens into chat or log credentials. A Medium grant is not proof of Large access.

Propose isolated environment, exact packages/backend, download/installed/cache sizes, model access, resource limits, monitoring and owned-process cleanup. Prefer a project-local virtual environment or equivalent; no global Python replacement, driver reinstall, persistent firewall change or automatic startup service. Do not repeat the laptop's elaborate experimental containment implementation unless required by actual desktop policy. State honestly what offline flags/audit hooks can and cannot enforce; never claim an OS network sandbox from a Python flag.

Stop here for the owner's setup approval before installs or large downloads. This is one meaningful gate, not approval of every command. After approval, complete ordinary setup and validation within the selected bounds; return only on a material deviation, login/terms action, failed prerequisite or revised resource need.

## Stage B: isolated setup and bounded first Large comparison

Install into the approved isolated environment, stage weights and beat-tracking auxiliaries explicitly, and record the resolved environment. Inference should use the staged local snapshots without unexpected downloads. Verify actual imports, CLI/API and selected CUDA device. No audio upload to a hosted transcription service.

Use a finite independent timeout and monitor host RAM, GPU memory, disk and owned-process exit. The old laptop's 7 GB VRAM ceiling is not the desktop ceiling. Select desktop limits from actual availability; as a starting proposal, retain several GB of VRAM and host RAM headroom, require at least 30 GB free disk, and allow at most 20 minutes for the first 25-second inference. These are proposed ceilings, not measured requirements or authority to exhaust memory. State hard limits versus sampled thresholds. Model initialization may temporarily allocate more than the weight-file size; float16 requested after load does not prove a reduced initialization peak.

Before real inference, validate the launcher/watchdog on a harmless short process and validate raw-event/MIDI serialization without loading the model again. Do not build a large test platform. Then run exactly one unconditioned Large transcription of `excerpts/M1.wav`, serially, preserving source hash and selected settings. Capture raw start/end/progress events before upstream MIDI cleanup, detected beat grid, onset-adjusted/export timing, and upstream-derived MIDI with quantize/fill-gaps/trim-leading-bars off and no forced BPM. Record any mandatory upstream cleanup and MIDI offset; derived MIDI is not necessarily a byte-equivalent representation of raw events.

A completed file is not proof of musical accuracy. Inspect output structure, finite times, paired note events, instrument counts, MIDI parseability and plausible duration. Retain failures and partial outputs; no automatic rerun, chunking, CPU fallback or limit increase. On failure, diagnose and propose the smallest next step.

Present the owner a concise first-run report: exact model/version/dtype/settings; elapsed time and sampled peaks; success/failure; artifacts and differences from Medium counts/groups. Optional plain local MIDI playback is acceptable if its renderer is already available and its patch limitations are stated. Do not install a DAW, reproduce Quackpot's listening laboratory or equate different MIDI sound banks with transcription differences. The owner may return this first bundle to the laptop for the same-renderer comparison.

Stop for the owner's go-ahead before the full tracks. Installation success alone does not authorize an unbounded full-track batch.

## Stage C: three full tracks after owner approval

Transcribe M1, M3, then M5 one at a time, once each, using the selected Large version/settings. Decode each unchanged source to a clearly documented lossless input without normalization, tempo change, separation or output-driven cropping. Preserve exact sample/frame metadata and any resampling required by the model. Do not assume compressed metadata is the decoded duration.

Size the wall/event/output limits from measured first-run throughput and actual track duration; propose them at the Stage B gate. Streaming raw JSONL is preferable to retaining unlimited event objects. Do not silently reuse the excerpt helper's 20,000-event ceiling or silently increase it. Preserve event order, source-relative timestamps and instrument names. If the official model requires internal windows, document offsets/joins; do not invent custom chunking/stitching without owner review.

Run without looking at Medium output as conditioning. No note-duration shortening, pitch repair, forced instruments, invented drums, expression recovery claims or note removal in the raw output. Derived MIDI adjustments must be separately identified. Stop on monitoring failure, OOM, timeout, unexpected network acquisition, invalid output, or a conflicting GPU job. Report actual cleanup and uncertainty rather than killing unrelated processes or claiming full descendant proof from a PID alone.

## Required return bundle

Use a self-contained ZIP with relative paths and a machine-readable manifest:

```
RETURN-README.md
environment.json / resolved package list
scripts/                    # actual portable setup/run/export helpers
comparison/M1-excerpt/      # first raw events, MIDI, grids, timing, run summary
tracks/M1/                  # full-track outputs
tracks/M3/
tracks/M5/
failures/                   # if applicable, sanitized diagnostics
return-manifest.json        # relative file names, bytes, SHA-256, run status
```

Each successful run returns raw events (JSON or JSONL with documented schema), derived `.mid`, detected beat information, resolved timing/offset/cleanup metadata, note/instrument summary and resource/elapsed/exit report. Include exact model revision/weight hash, application/package versions, dtype/device, deterministic/sampling controls and decoder details. Describe unmatched/zero-length notes or export failures without rewriting raw events. If output mapping differs from the laptop reference, document it for an importer rather than claiming drop-in compatibility.

Keep first excerpt and each full-track run separate and immutable. Include scripts/config, not the installed environment, model/auxiliary weights or caches. Exclude credentials, personal absolute paths, account names, session traces and irrelevant host/process data from the portable report. Keep a private exact log locally if needed. Rehash originals after work. Report incomplete outputs explicitly; ZIP creation is not success validation.

No source audio needs to return because the laptop retains it. No TinySynth-rendered WAV is required. The laptop orchestrator will inspect/import these outputs, prepare matched listening and decide future reconstruction or integration. No push, game-source mutation or publication is authorized.
