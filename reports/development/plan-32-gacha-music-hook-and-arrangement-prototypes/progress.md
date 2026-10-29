# Progress — Plan 32 proposal and bounded preview source

## Overall summary

Prepared the motif, rendering and listening proposal from the repaired Plan 33 research. Following owner authorization for three short bare-melody previews and QP Orch source feedback, revised the report-local preview surface to use isolated headless Chrome/CDP rendering with WAV and JSON capture; owner listening happens later at the owner's pace. The current source is pending QP Orch review and release. No audio or browser has been rendered, played, or launched; no libraries were installed; no test, build, or renderer command was run. Production and canonical project files were not changed.

## Files in scope

- `proposal.md` — three motif sketches, Plan 33 grounded recommendation, later five-track design, rendering/audition constraints and gates.
- `progress.md` — evidence, scope and review status.
- `motif-preview/README.md` — source inventory, exact proposed bounded command and safety/output behavior.
- `motif-preview/index.html`, `preview.css`, `motifs.js`, `preview.js` — report-local motif render interface, source data and later owner playback controls.
- `motif-preview/runner.mjs` — isolated headless browser/CDP render and controlled download workflow.

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
- The runner is source-only and designed for one isolated headless Chrome profile, no server, blocked HTTP(S) page requests, serial selection/render/download through CDP, completed-file and `.crdownload` checks, WAV/provenance validation, SHA-256 output/source hashes, and an explicit no-audition run manifest. Its proposed limits are 8 seconds per OfflineAudioContext, 70 seconds browser work and 79 seconds total runner time. The exact Plan 25 wrapper caps the process tree at 90 seconds, sampled private bytes at 2 GiB and Node heap at 1 GiB. Owned-process termination must be confirmed before deleting the temporary profile; cleanup uncertainty fails closed and preserves the profile.
- **No execution evidence exists.** No test, build, browser, renderer, audio playback, Node renderer, runner or package command was run after the initial packet-status preflight. The proposed output folder remains ungenerated; there are no WAVs, JSON provenance files or run manifest to report.
- Root's exact source review found a validation defect: `sampleRate` is defined under `source.patch`, not at the source root. Removed the invalid `source.sampleRate` requirement while keeping the existing finite and 48 kHz patch checks. Also removed the unnecessary `--remote-allow-origins=*` flag and changed terminal render-status handling so the runner returns the page's actual failure reason instead of waiting until timeout. These repairs were committed as `96815f0`.
- After those repairs, bounded syntax-only checks passed serially through Plan 25's `bounded-node-run.ps1`: `node --check` on `motif-preview/runner.mjs`, `preview.js`, and `motifs.js`. The wrapper reported exit code 0 and no cleanup notes for each. The Node processes used 1.3–2.3 MB sampled private bytes; no renderer or browser was launched.

## Problems and resolution

The required packet check was invoked outside the handoff's mandated guarded launcher. This procedural deviation is disclosed above; root reviewed it and said not to repeat the successful read-only check just to satisfy the count. Root's later source review also rejected the earlier visible-browser/human-listening-window runner design. In response, the runner was revised to headless batch capture, the page was given a saved-WAV picker for owner listening later, and the stale visible-runner code was removed. Root's follow-up review then identified the sample-rate validation defect and requested the narrow repairs now recorded above. The source checks pass. Audio generation remains unperformed, and this user request explicitly stops before audio rendering.

## Remaining decisions and risks

- The user's requested stop is the proposal/source-review gate before audio rendering. Any later rendering run requires a separate user-authorized continuation, with QP Orch's exact-command/resource preflight instructions followed.
- After the three approved previews are generated, the owner will listen at their own pace, select a preferred contour, note memorability/familiarity, and comment on the proposed palette. No owner listening evidence exists yet.
- Root must resolve an available offline BS.1770/R128 integrated-loudness and dBTP meter or alternative comparison convention before the five unchanged full-loop variants are separately authorized. Plan 18's probe and current preview page report PCM peak/RMS only.
- Later owner audition evidence will be art direction from named devices; it will not establish a population response or universal laptop audibility.

## Consultation posture

**Branch C — orchestrator-gate-only.** No advisor consultation ran. This thread cannot confidently match itself to an advisor-capable entry. The owner authorized this small report-local preview surface, but the current handoff requires QP Orch to source-review the exact renderer and runner before execution; no advisor budget or provider dispatch was assigned. Root/orchestrator review is the current gate.

## Handoff status

Ready for orchestration and owner review of the current proposal and three-preview implementation. The exact proposed command is recorded in `motif-preview/README.md`; it has not been invoked. The three syntax checks passed, but no browser, renderer or audio run occurred. This submission is not a statement that audio rendered, the owner auditioned the clips, or Plan 32 is complete. Do not set packet completion status. Five full-loop arrangements, loudness tooling selection and every production change remain gated.
