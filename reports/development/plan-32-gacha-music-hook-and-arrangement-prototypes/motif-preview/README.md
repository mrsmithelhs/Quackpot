# Plan 32 bare-melody preview artifact

This report-local page contains three original two-bar melody candidates for owner art direction. The code is authored but **has not been executed**. The owner approved creating these previews; QP Orch requires source review before any renderer or browser run.

## Files

- `index.html` — accessible preview page with explicit Render, Play, Download and Stop controls; no autoplay.
- `preview.css` — local responsive presentation, focus indication and light/dark color support.
- `motifs.js` — editable MIDI note event data, common D tonic, 100 BPM, and shared voice parameters.
- `preview.js` — serial single-voice `OfflineAudioContext` rendering, PCM sample-peak/RMS display, PCM16 WAV and JSON provenance downloads, and one-active-audio playback.
- `runner.mjs` — visible isolated Chrome launcher; no server; temporary profile; only the owned browser process tree is closed; WAV downloads target this `previews/` folder.

The fixed common gain is intentionally conservative. The page reports **PCM sample peak and RMS only**. It does not claim LUFS, true peak, equivalent perceived loudness or production readiness. There is no normalization, compression, noise, accompaniment, network request or link to production audio.

## Proposed guarded command (do not run before QP Orch source review)

From `C:\AI\Quackpot`, one finite browser session may later be started with the existing Plan 25 bounded launcher:

```powershell
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/runner.mjs')
```

That existing wrapper caps the owned process tree at 90 seconds and 2 GiB private bytes. The runner closes its own visible Chrome window after 80 seconds so the wrapper has time to collect results and clean up. These are whole-session guards, not per-render limits or measured performance guarantees for each `OfflineAudioContext`. Render A, B and C serially from the page; wait for each status result before selecting the next. Stop if the page errors, a download exceeds the expected short PCM size, or the external runner reaches either cap.

The runner creates a unique profile under the system temporary directory and removes that exact profile after Chrome exits. It never targets existing browser profiles or user tabs. The retained preview WAVs are written only by explicit owner downloads into `previews/`; this folder is intentionally empty until the later root-approved run. Close the isolated Chrome window when done; wrapper cleanup owns the process tree if the time limit is reached.

## Later evidence to preserve

Each preview has an adjacent JSON download containing its exact note events, shared patch, format, sample rate, channel count, exact frame duration, common gain, render elapsed time, and measured float32 render-buffer sample peak/RMS before PCM16 quantization. It states that the readings are not LUFS or true-peak values. After a source-reviewed run, preserve WAV and JSON files and record source/renderer hashes in progress. The owner alone supplies motif preference and qualitative listening notes; the implementer must not claim to have heard or evaluated previews unless that actually happened.
