# Plan 32 — Composition structure preview evidence

**Status:** QP Orch rendered the authorized Stage 1 batch once. The owner has not yet supplied listening notes or selected a longer structure. The implementer did not run the renderer or audition audio.

## Rendered set

The batch contains three source-traceable eight-bar structures around the selected motif C. Each WAV is 19.2 seconds of musical form plus a 0.12-second release tail (19.32 seconds total), stereo 48 kHz PCM16, and 3,709,484 bytes. The renderer kept the common gain settings and applied no normalization. It does not claim seamless looping or a crossfade.

| Structure | Preview | PCM sample peak | PCM RMS | Renderer time | WAV SHA-256 | Provenance SHA-256 |
|---|---|---:|---:|---:|---|---|
| S1 — Call, answer, return | `plan32-extension-s1-call-answer.wav` | -15.65 dBFS | -32.96 dBFS | 157.4 ms | `f405eb94341407325f2c23dcf2e2215041ffeb4fc53e768fcdc536266d73d2f1` | `3167a210195b444ed8f6a663b68645d6870c0bdd71cdba49e2d3caa0950d4ffd` |
| S2 — Bookend contrast | `plan32-extension-s2-bookend.wav` | -15.64 dBFS | -32.01 dBFS | 146.1 ms | `9b29ff14d71489653ed58fa2c38fb14ed2f65af88d3daf0d6eaf41618a29f5e3` | `a3e0190794a10e17cf3d214465e8f59893ba6bfca9ca9a8ad3fa4c3893875bcf` |
| S3 — Spacious, fragmentary answer | `plan32-extension-s3-spacious.wav` | -16.23 dBFS | -35.09 dBFS | 123.4 ms | `6b921deaaceef64662f900f372b160543ef58e5ce6e81b4449aa917a07f779cc` | `8ab3ef259d695a47f24014b996a2136956f1846e6b439b3b73b4ac7f06cac746` |

PCM sample peak and RMS are the only level readings. They are not LUFS or true-peak measurements and do not establish equal perceived loudness. No listener or emotional-effect claim is made.

## Process and validation evidence

QP Orch ran the exact guarded command proposed in `../composition-extension-proposal.md` through Plan 25's `bounded-node-run.ps1`. The successful run exited 0 in 3.5260813 seconds, peaked at 343,146,496 sampled process-tree private bytes, and had no outer `StopReason`, cleanup notes, or stderr. The wrapper limits were 90 seconds, 2 GiB sampled process-tree private bytes, and 1 GiB Node heap; the runner limits were 70 seconds browser work and 79 seconds total. Its per-render limit was 15 seconds.

The run manifest records zero non-local page requests and no playback. All three WAVs and provenance files completed; the WAV headers passed the runner's RIFF/WAVE, PCM16, stereo, 48 kHz and frame-size checks. The owned Chrome process tree termination was confirmed, with no residual process or cleanup uncertainty, and the temporary profile was removed. The Chrome child exit code 1 reflects the runner's deliberate owned-tree termination; the guarded command itself exited successfully.

Before this success, one guarded invocation stopped at the report-local containment check, before Chrome launch and before creating an attempt directory. It took 0.5525 seconds, peaked at 3,854,336 sampled private bytes, and reported no `StopReason` or cleanup notes. The cause was the extension output being compared against the motif-preview root. The mode-specific containment-root repair is recorded in the runner and progress history. The successful output set is in `history/attempt-01/`; there was no render retry after an audio-producing failure.

Three guarded syntax checks passed before the successful render (0.519, 0.523 and 0.532 seconds); a separate guarded runner `--check` passed in 0.5179 seconds. These are root-run checks. This evidence report did not rerun them.

## Hash checks

`run-manifest.json` contains SHA-256 values for all five source files. Read-only hash recomputation after the render matched all five values. Recomputed hashes for the seven listed output files (three WAVs, three provenance files and `run-manifest.json`) matched `attempt-record.json`. The motif source SHA-256 embedded in `composition-extensions.js` also matches the unchanged `motif-preview/motifs.js`:

`3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02`

The source hash values from the run manifest are:

| Source file | SHA-256 |
|---|---|
| `composition-extensions.js` | `197a304b6adb9199fa858becf6ec83c6216e3608b37b73d76119709c1ae43362` |
| `composition-preview/index.html` | `b5026abc2cf4b929b8417e948c158ca2003da56f1f5d50929be222a872333586` |
| `composition-preview/preview.css` | `db74ef5b6369d981d84ca27a25a17f872d3f58a60a06ce14a5326fdd13cabd8d` |
| `composition-preview/preview.js` | `d3fedffd268254882f0137526239a1d6f62388f396ac0be0cf4eee7b4294716d` |
| `motif-preview/runner.mjs` | `efb5859503a85e827b55a8f16464d05360b0e182c72b296d8628b4f3647c42bb` |

## Remaining decisions

The owner still needs to listen to the three previews and choose whether one form should continue. No listening evidence is recorded in the headless run. Stage 2 harmonic progressions and the five mood tracks were not assigned or rendered. No production integration, source-state trigger, Receipt change, deployment or push is authorized by this batch.

Consultation posture remains **orchestrator-gate-only**: root reviewed the source and execution; no advisor or additional reviewer ran for this batch.
