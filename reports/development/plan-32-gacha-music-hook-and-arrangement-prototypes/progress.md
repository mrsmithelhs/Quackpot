# Progress — Plan 32 proposal and bounded preview source

## Overall summary

Prepared the motif, rendering and listening proposal from repaired Plan 33 research. The owner authorized exactly three short bare-melody previews on a common lead patch, tempo, tonic, and fixed-gain basis. QP Orch's first headless attempt rendered A and B but failed before C because keyboard automation left B selected. Root repaired selection automation and completed a second bounded headless run with A, B, and C. All three WAV/JSON pairs, a success manifest, and a cleanup-aware attempt record are in `motif-preview/history/attempt-02/`. The failed attempt remains separately archived in `attempt-01/`; original A/B partials remain untouched in `motif-preview/previews/`.

The headless runs did not audition audio. The owner selected motif C, “Lucky Ripple,” for the next composition step and approved exploring a longer phrase. The implementer has not auditioned the audio. No five-track arrangement, production integration, library installation, deployment, or packet-status change occurred. Root, not this implementer, executed the successful renderer.

## Files in scope

- `proposal.md` — three motif sketches, Plan 33 grounded recommendation, later five-track design, evidence limits, and gates.
- `progress.md` — execution evidence and handoff status.
- `composition-extension-proposal.md` — source-traceable eight-bar form options, two mapped progression candidates, staged listening sequence, and proposed file/resource gates.
- `motif-preview/README.md` — source inventory, guarded command, numbered attempts, and owner listening steps.
- `motif-preview/index.html`, `preview.css`, `motifs.js`, `preview.js` — report-local source data, renderer, and owner playback controls.
- `motif-preview/runner.mjs` — bounded headless browser/CDP renderer with unique attempt directories and cleanup-aware records.
- `motif-preview/history/attempt-01/` — first attempt's A/B WAV/JSON copies and failure/cleanup-evidence record.
- `motif-preview/history/attempt-02/` — completed A/B/C WAV/JSON outputs, `run-manifest.json`, and `attempt-record.json`.

The original first-attempt partials in `motif-preview/previews/` are root-generated untracked files. They were left in place and their exact hashes match the copies archived in `attempt-01/`.

No files outside `reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/` were intentionally changed.

## Inputs reviewed

- `AGENTS.md` and `docs/agent-starting-prompts/implementer-prompt.md`
- Plan 32 packet and `reports/orchestration/plan-32-codex-starting-handoff.md`
- Required design, decision, repository-structure and plan-index references
- `reports/orchestration/plan-33-repair-review-01.md`
- Repaired Plan 33 `recommendation.md`, `composition-brief.md`, `transformation-matrix.md` and `transition-contract.md`
- Plan 18 progress, credits proposal, selection catalog and standard-library `audio_probe.py`
- `package.json`, relevant `src/audio/synth.mjs` source (read-only)
- `reports/orchestration/plan-32-preview-authorization.md`
- Plan 16 `run-controlled-vite-phase.mjs` and `checkpoint-proof.mjs` as read-only process-lifecycle references
- Owner's post-preview selection of C and direction relayed by QP Orch for a bounded longer-phrase proposal

## Checks and execution evidence

- Initial `node scripts/dev/plan-status.js check 32` returned `RUNNABLE: plan-32 is ready to implement`. **Preflight process deviation:** the read-only check was accidentally invoked directly through Node before seeing the handoff's more specific wrapper instruction. Root reviewed it and dispositioned that no repeat was needed. No retry was made.
- Read-only inspection found Vite as the sole package dependency, no audio-specific dependency, the existing Plan 18 PCM peak/RMS probe, and no `ffmpeg`, `ffprobe`, `sox` or Audacity executable on PATH. No Python audio packages were probed.
- The original three syntax-only checks passed through Plan 25's `bounded-node-run.ps1`: `node --check` for `runner.mjs`, `preview.js`, and `motifs.js`. After source repair, root also ran bounded `node --check runner.mjs`: exit 0, 0.523 seconds, peak sampled private bytes 1,855,488.
- Root's first renderer attempt failed selecting C (`Motif selection control chose B; expected C.`) after about 2.866 seconds. The wrapper reported 328,609,792 peak sampled private bytes and no outer stop or cleanup notes. A/B partials are preserved in `attempt-01/` with their original files still present. The original runner had no persistent cleanup record, so that attempt's exact process/profile cleanup disposition is unknown and is marked as such.
- After changing render automation to set the known select value and dispatch `change`, then verify the exact selection before clicking Render, root performed one standard elevated bounded run with the documented Plan 25 wrapper command. It exited 0 in 2.945 seconds, peaked at 338,952,192 sampled private bytes, and reported no `StopReason`, `CleanupNotes`, or stderr. The attempt record confirms all six downloads completed; the owned Chrome tree termination was confirmed with no residual/uncertainty, and the exact temporary profile was removed. The wrapper succeeded; the Chrome child exit code 1 reflects the runner's deliberate owned-tree shutdown.
- The exact wrapper command was:

  ```powershell
  .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/runner.mjs')
  ```

- The completed outputs are stereo 48 kHz PCM16 WAV, 4.92 seconds each, 944,684 bytes each. Fixed common gain was used with no per-preview normalization or compression. Render times and PCM readings from each JSON/run manifest are:

  | Motif | Render time | PCM sample peak | PCM RMS | WAV SHA-256 |
  |---|---:|---:|---:|---|
  | A — Prize Lantern | 40 ms | -16.4 dBFS | -31.8 dBFS | `13621d6c4890a873ec067eff64f360685d571053e22177aae80a3a7c076a2985` |
  | B — Pond Ticket | 39 ms | -16.4 dBFS | -32.1 dBFS | `4ae20d7bf5ccff240d4518db904738d3c2d79000ff98e5b90d927fa633b8657d` |
  | C — Lucky Ripple | 34 ms | -16.5 dBFS | -31.8 dBFS | `b76e9a2f0d357ba4c7c9fc313e54c4e0e621c2774c20bdae5295441d21de4bf6` |

  These report PCM sample peak and RMS only, explicitly not LUFS or true peak. They are not equal-perceived-loudness measurements.
- `attempt-02/run-manifest.json` records hashes for all five source files and each WAV/JSON output. Those five hashes were recomputed against current source and match:

  | Source | SHA-256 |
  |---|---|
  | `index.html` | `e6ee4ba31e2779bbff94ee8a0a5ed67dbe030423a8bd3e0035c2591fbe88bfac` |
  | `preview.css` | `403f2f1c683c6ca476de3f4b99d3e6537682ff5635fe24cc92a7d8e1beafbcb7` |
  | `motifs.js` | `3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02` |
  | `preview.js` | `3d041e642802f6390e12755c1753759aa899c3bd6270716c280d4ede41e440a9` |
  | `runner.mjs` | `ebeceb9f19cb04159baaf831ddbb1781b7f4ec5a19e82055a2817e4705ff19cb` |

- The run recorded zero non-local page requests and no playback/audition. The runner source caps are 8 seconds per OfflineAudioContext, 70 seconds browser work, and 79 seconds total runner time. The wrapper caps are 90 seconds, 2 GiB sampled process-tree private bytes, and 1 GiB Node heap.
- `git diff --check` was clean before the report-only delivery commit. No tests or builds were run in this report-finalization turn; no audio was played by this implementer.

## Problems and resolution

The first headless attempt's selection failure and unknown detailed cleanup disposition are preserved in `attempt-01/`; its partial WAV/JSON files were copied byte-for-byte and not removed. The runner now uses programmatic selection with an exact-value check, an unused numbered output directory, and a durable attempt record written after cleanup on either failure or completion. Root ran the corrected runner once and completed A/B/C in `attempt-02/`; no retry or second success run was performed.

## Owner handoff and remaining gates

Motif C is owner-selected. Open `motif-preview/index.html`, select the WAV files from `history/attempt-02/` in the saved-file picker, and use the explicit Play/Stop controls at the owner's own pace. The next proposed owner listening decision—after root reviews and separately authorizes extension previews—is which longer phrase structure to pursue and which later chord loop supports the hook. No listening notes about the generated previews have been relayed; the motif selection is recorded as the owner's choice.

The proposed two-stage extension work and exact file/resource scope are in `composition-extension-proposal.md`. The five full-loop variants remain separately gated. Root must resolve an available offline BS.1770/R128 integrated-loudness and dBTP meter or another comparison convention before that work. The current readings do not authorize loudness-matched arrangement claims, production integration, or deployment.

## Consultation posture

**Branch C — orchestrator-gate-only.** No advisor consultation ran. The owner authorized the three-preview work and selected C for the proposed longer-phrase exploration; root reviewed the exact source/command and owned the single successful execution. The current composition extension is still a proposal. No advisor budget or provider dispatch was assigned. No reviewer or model consultation is claimed.

## Handoff status

Ready for root review of `composition-extension-proposal.md`. Motif C is owner-selected. Any extension source/rendering needs a separate root gate under the proposal's staged scope; the five longer controlled arrangements and all production changes remain separately gated. This does not complete Plan 32. Do not set packet completion status.
