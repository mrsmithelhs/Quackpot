# Progress — Plan 32 proposal and bounded preview source

## Overall summary

Prepared the motif, rendering and listening proposal from repaired Plan 33 research. QP Orch made one bounded headless renderer attempt: A and B rendered and were saved; selection for C failed because native-select keyboard automation left B selected. The partial files are preserved in `motif-preview/history/attempt-01/` with an attempt record; original files remain untouched in `motif-preview/previews/`. No audio was auditioned. This implementer has made only source and report repairs since that run; the next bounded attempt remains root-owned. No libraries were installed. Production and canonical project files were not changed.

## Files in scope

- `proposal.md` — three motif sketches, Plan 33 grounded recommendation, later five-track design, rendering/audition constraints and gates.
- `progress.md` — evidence, scope and review status.
- `motif-preview/README.md` — source inventory, exact proposed bounded command and safety/output behavior.
- `motif-preview/index.html`, `preview.css`, `motifs.js`, `preview.js` — report-local motif render interface, source data and later owner playback controls.
- `motif-preview/runner.mjs` — isolated headless browser/CDP render and controlled download workflow.
- `motif-preview/history/attempt-01/` — copied A/B WAV and JSON partials plus a report of the failed attempt and the limits of available cleanup evidence.

No files outside `reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/` were intentionally changed during this work.

## Inputs reviewed

- `AGENTS.md` and `docs/agent-starting-prompts/implementer-prompt.md`
- Plan 32 packet and `reports/orchestration/plan-32-codex-starting-handoff.md`
- Required design, decision, repository-structure and plan-index references
- `reports/orchestration/plan-33-repair-review-01.md`
- Repaired Plan 33 `recommendation.md`, `composition-brief.md`, `transformation-matrix.md` and `transition-contract.md`
- Plan 18 progress, credits proposal, selection catalog and standard-library `audio_probe.py`
- `package.json`, relevant `src/audio/synth.mjs` source (read-only)
- `reports/orchestration/plan-32-preview-authorization.md` (owner preview approval and root source-review gate)
- Plan 16 `run-controlled-vite-phase.mjs` and `checkpoint-proof.mjs` as read-only process-lifecycle references; no Plan 16 files changed

## Checks and evidence

- Initial `git status --short` was empty.
- `node scripts/dev/plan-status.js check 32` returned `RUNNABLE: plan-32 is ready to implement`.
- **Preflight process deviation:** that packet check was accidentally invoked directly through Node before the handoff's more specific wrapper instruction was seen. Root reviewed the deviation and dispositioned that the successful read-only check need not be repeated solely to satisfy the invocation count. No retry was made. Any future Node execution must use the bounded wrapper and coordinate with root.
- Read-only inspection found Vite as the sole package dependency, no audio-specific dependency, the existing Plan 18 PCM peak/RMS probe, and no `ffmpeg`, `ffprobe`, `sox` or Audacity executable on PATH. No Python audio packages were probed.
- The owner explicitly approved authoring exactly three short bare-melody previews on one common lead patch, tempo, tonic and fixed-gain basis; PCM sample-peak/RMS only, not LUFS/true-peak matched. Root authorized report-local source authoring, then required exact source/command review before execution. The five-track arrangement, production integration, new dependencies and provider dispatch remain separately gated.
- The preview source contains three original two-bar note-event candidates at 100 BPM in D major, with a shared triangle voice and common fixed gain. One candidate is the recommended “Prize Lantern” contour. The rendering code uses one serial OfflineAudioContext per selected preview, validates bounded event/patch inputs and finite PCM, creates PCM16 WAV plus adjacent JSON provenance, and reports only sample peak/RMS. The listening interface also accepts saved WAVs, starts playback only from an explicit Play action, permits one active source, and stops on Stop, page hide or close.
- The runner remains designed for one isolated headless Chrome profile, no server, blocked HTTP(S) page requests, serial motif selection/render/download through CDP, completed-file and `.crdownload` checks, WAV/provenance validation, SHA-256 source/output hashes, and no audition. Following the C-selection failure, motif ids are now assigned programmatically to the page's native select and verified before the actual Render control is clicked. This is render automation, not evidence of keyboard accessibility. The next invocation is configured for a new `history/attempt-02/` directory and refuses any existing attempt folder. Every attempt writes `attempt-record.json` after cleanup with failure/completion, files, hashes and process/profile cleanup evidence; only three successful previews get `run-manifest.json`.
- **QP Orch's first-run evidence:** the headless attempt failed at C selection with `Motif selection control chose B; expected C.` after about 2.866 seconds. The wrapper reported peak sampled private bytes of 328,609,792 and no outer stop or cleanup notes. The existing A/B WAVs are each 944,684 bytes; their JSON reports 4.92-second PCM16 stereo 48 kHz output and finite PCM readings. A reports sample peak -16.4 dBFS / RMS -31.8 dBFS; B reports -16.4 dBFS / -32.1 dBFS. These are source-reported PCM sample readings only, not LUFS/true-peak readings. C and the full `run-manifest.json` are absent. The attempted runner did not write a durable cleanup record, so the profile/process disposition is not independently recorded; see `history/attempt-01/attempt-record.json`.
- Root's exact source review found a validation defect: `sampleRate` is defined under `source.patch`, not at the source root. Removed the invalid `source.sampleRate` requirement while keeping the finite and 48 kHz patch checks. Also removed `--remote-allow-origins=*` and changed terminal render-status handling to return the actual page error. These repairs were committed as `96815f0`.
- The subsequent C-selection failure led root to request source-only repairs: use explicit programmatic select assignment (with exact-value check), preserve the partial run in `history/attempt-01/`, never reuse an attempt directory, and persist a cleanup-aware attempt record even after failure. A/B files were copied unchanged and hashes compared; originals were left in place. The repaired runner now targets the unused `history/attempt-02/` path. No runner rerun was made by this implementer.
- Bounded syntax-only checks passed before the selection and attempt-record repairs: `node --check` on `motif-preview/runner.mjs`, `preview.js`, and `motifs.js`, serially through Plan 25's `bounded-node-run.ps1`. Each returned exit code 0 and no cleanup notes; sampled Node private bytes were 1.3–2.3 MB. The post-failure repair has not been executed or syntax-checked.

## Problems and resolution

The required packet check was invoked outside the handoff's mandated guarded launcher; root reviewed this deviation and said not to repeat the successful read-only check solely to satisfy invocation count. Root rejected the earlier visible-browser/listening-window runner design, leading to headless capture and later owner playback from saved WAV files. The first root-owned headless attempt rendered A and B but failed at C selection. Its partials are copied into `history/attempt-01/`, with originals preserved, and missing cleanup evidence is stated rather than inferred. Source repairs now switch selection automation to programmatic value assignment and add a durable attempt/cleanup record. The current source repair has not been run.

## Remaining decisions and risks

- Root owns any next bounded attempt after reviewing the current source. The runner will refuse to reuse `attempt-01/` or `attempt-02/`; a later failure must also leave its own attempt/cleanup record.
- After the three approved previews are generated, the owner will listen at their own pace, select a preferred contour, note memorability/familiarity, and comment on the proposed palette. No owner listening evidence exists yet.
- Root must resolve an available offline BS.1770/R128 integrated-loudness and dBTP meter or alternative comparison convention before the five unchanged full-loop variants are separately authorized. Plan 18's probe and current preview page report PCM peak/RMS only.
- Later owner audition evidence will be art direction from named devices; it will not establish a population response or universal laptop audibility.

## Consultation posture

**Branch C — orchestrator-gate-only.** No advisor consultation ran. This thread cannot confidently match itself to an advisor-capable entry. The owner authorized this small report-local preview surface, but the current handoff requires QP Orch to source-review the exact renderer and runner before execution; no advisor budget or provider dispatch was assigned. Root/orchestrator review is the current gate.

## Handoff status

Ready for root review of the source-only repair and the partial-run record. Root's first bounded attempt produced A/B and failed before C; it did not complete the authorized three-preview set, and no listening/audition result is claimed. The current runner fix was not executed. This submission is not a statement that the owner auditioned the clips or that Plan 32 is complete. Do not set packet completion status. Five full-loop arrangements, loudness tooling selection and every production change remain gated.
