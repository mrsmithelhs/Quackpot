# Progress — Plan 32 proposal and bounded preview source

## Overall summary

Prepared the motif, rendering and listening proposal from repaired Plan 33 research. The owner authorized exactly three short bare-melody previews on a common lead patch, tempo, tonic, and fixed-gain basis. QP Orch's first headless attempt rendered A and B but failed before C because keyboard automation left B selected. Root repaired selection automation and completed a second bounded headless run with A, B, and C. All three WAV/JSON pairs, a success manifest, and a cleanup-aware attempt record are in `motif-preview/history/attempt-02/`. The failed attempt remains separately archived in `attempt-01/`; original A/B partials remain untouched in `motif-preview/previews/`.

The headless runs did not audition audio. The owner selected motif C, “Lucky Ripple,” for the next composition step and approved exploring a longer phrase. The implementer has not auditioned the audio. No five-track arrangement, production integration, library installation, deployment, or packet-status change occurred. Root, not this implementer, executed the successful renderer.

QP Orch subsequently approved Stage 1 source authoring. The source maps three eight-bar forms around the exact C motif and the accessible report-local renderer. The existing Plan 32 runner now has a separate `--extensions` mode that reuses its process ownership, isolated Chrome/CDP and cleanup lifecycle. QP Orch reviewed the source, passed guarded syntax checks, repaired a prelaunch path-guard mismatch, and completed one successful bounded extension render. The implementer did not launch the runner or audition audio. Stage 2 progressions and the five later mood tracks remain unassigned until the owner chooses a structure.

During root's source review, a correction pass found and fixed the undefined provenance field (`measurements` now explicitly references the render measurement value), removed a duplicate `beatsPerBar` property, and aligned saved-audio playback with the existing request-token/current-audio handling. Playback now stops when the page becomes hidden. Rechecking the runner confirmed that its extensions branch already recognizes the extension status text and provenance labels, waits for the two automatic downloads without clicking a second link, maps the exact S1/S2/S3 filenames, and validates each completed file; no runner change was needed for that review comment. No script or browser was launched during this correction pass.

Root then ran three guarded syntax checks; all passed (0.519s, 0.523s and 0.532s). Its first guarded `--extensions` runner invocation stopped before Chrome launch and before creating `attempt-01/`: after 0.5525s, peak sampled private bytes were 3,854,336, with no `StopReason` or cleanup notes. The error was `Plan 32 history folder resolves outside its report-local source directory` at runner line 397: the containment check used the motif-preview directory as its report root while the extension output is under composition-preview. The failure may have left the newly created `composition-preview/history/` parent empty; no WAV or attempt record was created. The runner now selects `composition-preview/` as the containment root for extension mode while retaining the required containment check. No rerun or render was made in this repair pass; root will review and own the next invocation.

After that narrow path repair, root ran `node --check` on the runner (0.5179s, peak 1,875,968 sampled bytes), then ran the guarded `--extensions` batch once. The wrapper exited 0 in 3.5260813s, peaked at 343,146,496 sampled process-tree private bytes, and reported no `StopReason`, `CleanupNotes`, or stderr. It produced three WAV/provenance pairs plus `run-manifest.json` and `attempt-record.json` in `composition-preview/history/attempt-01/`. The manifest records no playback and zero non-local page requests. All six downloads completed, WAV header checks passed, the owned Chrome tree stopped with termination confirmed and no residual/uncertainty, and the temporary profile was removed. The Chrome child's exit code 1 is the runner's deliberate owned-tree shutdown; the bounded command succeeded.

The runner readings are PCM sample peak/RMS, not LUFS or true peak: S1 -15.65/-32.96 dBFS; S2 -15.64/-32.01 dBFS; S3 -16.23/-35.09 dBFS. Each WAV is 19.32 seconds and 3,709,484 bytes. No perceived-loudness or musical-quality conclusion is made. `composition-preview/evidence-report.md` contains the exact output/source hashes, per-track timings, run controls, cleanup and the retained prelaunch failure evidence. Read-only recomputation matched all five recorded source hashes and the seven output hashes listed in `attempt-record.json`; the embedded motif-source hash also matches the unchanged motif file.

QP Orch authorized a separate delivery commit for the eight existing `composition-preview/history/attempt-01/` outputs (three WAVs, three provenance files, `run-manifest.json`, and `attempt-record.json`). The original untracked `motif-preview/previews/` files remain excluded and untouched. No new rendering, playback, tests or other execution is part of that delivery.

## Files in scope

- `proposal.md` — three motif sketches, Plan 33 grounded recommendation, later five-track design, evidence limits, and gates.
- `progress.md` — execution evidence and handoff status.
- `composition-extension-proposal.md` — source-traceable eight-bar form options, two mapped progression candidates, staged listening sequence, and proposed file/resource gates.
- `composition-extensions.js` — portable classic-script source wrapper, exact C source hash and origin-annotated S1/S2/S3 event maps.
- `composition-preview/index.html`, `preview.css`, `preview.js` — accessible local renderer and owner playback controls with fixed gain and PCM-only labels.
- `composition-preview/evidence-report.md` — root-run results, bounded execution/cleanup evidence, PCM readings, source/output hash verification, and remaining owner gate.
- `composition-preview/history/attempt-01/` — root-generated three WAVs, three provenance files, run manifest and cleanup-aware attempt record. The implementer did not generate or audition these files.
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

- For this source-authoring phase, `git diff --check` was the only workspace validation check. A read-only SHA-256 lookup recorded the current motif source identity. No JavaScript syntax command, test, build, browser, runner, or audio rendering job was run. Source review confirmed that the local page uses classic script loading rather than `fetch()` for `file://` compatibility and that the runner uses the existing guarded lifecycle.
- The motif source SHA-256 embedded in `composition-extensions.js` is `3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02`, read from the current unchanged `motif-preview/motifs.js`. Extension runner mode checks this relationship before launching Chrome.
- The extension preview is 19.2 seconds of musical form plus 0.12 seconds of release tail: 19.32 seconds, 3,709,484 bytes for stereo 48 kHz PCM16, and one 7,418,880-byte float32 buffer. The UI and runner cap WAVs at 3,800,000 bytes. These are calculated bounds, not observed render or memory results.
- Proposed command for root review only; **not run**:

  ```powershell
  .\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/runner.mjs','--extensions')
  ```

- The `--extensions` mode selects the new page and a fresh `composition-preview/history/attempt-01/`, caps each render at 15 seconds, browser work at 70 seconds, total runner at 79 seconds, each WAV at 3,800,000 bytes, and provenance at 32 KiB. It refuses reuse of an existing attempt directory. Outer launcher caps remain 90 seconds, 2 GiB sampled process-tree private bytes and 1 GiB Node heap. Root executed the command once after correcting the mode-specific containment root; the successful output is preserved in the named attempt folder.

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

Motif C is owner-selected. QP Orch generated S1/S2/S3 in `composition-preview/history/attempt-01/` for the owner's explicit listening. The owner has not yet provided qualitative notes or selected a structure. The next decision is whether one longer phrase structure should continue; only after that choice can a later harmonic loop be assigned. The headless run did not play audio.

The completed Stage 1 source, bounded command, and outputs are documented in `composition-extension-proposal.md` and `composition-preview/evidence-report.md`. The 3.8 MB WAV cap, classic-script local data loading, S1/S2/S3 labels, 19.32-second duration, non-normalized fixed gain, and PCM-only labels reflect QP Orch's scope clarifications. There is no seamless-loop/crossfade claim. The owner’s structure choice is required before Stage 2 harmonic loops can be assigned. The five full-loop variants, loudness metering, production integration, and deployment remain separately gated.

## Consultation posture

**Branch C — orchestrator-gate-only.** No advisor consultation ran. QP Orch directly reviewed the source and bounded execution; no additional reviewer or advisor budget was assigned. The headless run rendered files but did not audition them; no listening or audio-quality claims are made.

## Handoff status

Ready for the owner's listening review of the three generated Stage 1 previews. No owner preference or qualitative listening notes are recorded yet. This does not complete Plan 32. Stage 2 remains unassigned pending the owner’s structure choice. Do not set packet completion status.
