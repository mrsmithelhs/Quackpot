# Plan 32 bare-melody preview artifact

This report-local page contains three original two-bar melody candidates for owner art direction. The preview source is authored but **has not been executed**. The owner approved creating these previews; QP Orch requires source review before any renderer or browser run.

## Files

- `index.html` — accessible render controls and a separate saved-WAV file picker for listening later; no autoplay.
- `preview.css` — local responsive presentation, focus indication and light/dark color support.
- `motifs.js` — editable MIDI note-event data, common D tonic, 100 BPM, and shared voice parameters.
- `preview.js` — serial single-voice `OfflineAudioContext` rendering, finite PCM sample-peak/RMS readings, PCM16 WAV and JSON provenance downloads, plus owner playback that stops on request, page hide or close.
- `runner.mjs` — isolated headless Chrome/CDP workflow; it selects and renders A, B and C serially, captures WAV/JSON downloads, validates them and writes a hash-bearing run manifest. It does not play audio or use a server.

The fixed common gain is intentionally conservative. The page reports **PCM sample peak and RMS only**. It does not claim LUFS, true peak, equivalent perceived loudness or production readiness. There is no normalization, compression, noise, accompaniment, network request or link to production audio.

## Proposed guarded command (do not run before QP Orch source review)

From `C:\AI\Quackpot`, one finite browser session may later be started with the existing Plan 25 bounded launcher:

```powershell
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/runner.mjs')
```

The wrapper caps the owned process tree at 90 seconds and 2 GiB sampled private bytes, and Node heap at 1 GiB. Inside that boundary, the runner caps browser work at 70 seconds and total runtime at 79 seconds, leaving wrapper time for cleanup. Each OfflineAudioContext render is capped at 8 seconds. These are resource guards, not per-render performance claims.

The runner creates a unique profile under the system temporary directory and opens only the report-local file page in headless Chrome. It uses CDP to operate the page’s motif selection, Render and download controls. The page blocks HTTP(S) requests; the runner records any non-local request as a failure. It captures each WAV and JSON file into the owned `previews/` folder, verifies format, size, complete download state, absence of `.crdownload` files, finite readings and provenance, and records SHA-256 hashes in `run-manifest.json`. The folder must be empty before a run; the runner refuses to overwrite existing content. Chrome’s process tree is terminated and the exact temporary profile is deleted only after process exit and tree termination are confirmed. Cleanup uncertainty fails the run and preserves the profile for diagnosis.

Headless rendering never plays audio. After the source-reviewed run, the owner can open this page at their own pace, select the saved WAV files, and press Play or Stop. No listening time window is imposed. The page permits one active audio source and stops playback when hidden or closed. The JSON provenance files stay alongside their WAV files.

## Later evidence to preserve

Each preview’s adjacent JSON download contains its exact note events, shared patch, format, sample rate, channel count, exact frame duration, common gain, render elapsed time, and float32 render-buffer PCM sample peak/RMS before PCM16 quantization. It states that the readings are not LUFS or true-peak values. `run-manifest.json` records source hashes, output hashes, displayed readings and the fact that no audition took place. The owner alone supplies motif preference and qualitative listening notes; the implementer must not claim to have heard or evaluated previews unless that actually happened.
