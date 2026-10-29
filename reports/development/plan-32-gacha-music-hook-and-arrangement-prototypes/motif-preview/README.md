# Plan 32 bare-melody preview artifact

This report-local page contains three original two-bar melody candidates for owner art direction. The owner approved creating these previews and selected C (“Lucky Ripple”) for the next composition step. The first bounded headless attempt rendered A and B, then failed before C because native-select keyboard input left B selected. The partial WAVs and matching JSON records were copied unchanged to `history/attempt-01/` with a failure record; the original downloads remain untouched in `previews/`. After a source repair, root completed all three renders in `history/attempt-02/`. The implementer has not auditioned the previews; no qualitative listening notes are recorded here.

## Files

- `index.html` — accessible render controls and a separate saved-WAV file picker for listening later; no autoplay.
- `preview.css` — local responsive presentation, focus indication and light/dark color support.
- `motifs.js` — editable MIDI note-event data, common D tonic, 100 BPM, and shared voice parameters.
- `preview.js` — serial single-voice `OfflineAudioContext` rendering, finite PCM sample-peak/RMS readings, PCM16 WAV and JSON provenance downloads, plus owner playback that stops on request, page hide or close.
- `runner.mjs` — isolated headless Chrome/CDP workflow; it programmatically sets and verifies the known motif id in the page's native select, then clicks Render and download controls. It captures WAV/JSON downloads, validates them and writes hash-bearing completion and attempt records. It does not play audio or use a server. Programmatic selection is render automation, not a keyboard-accessibility test.

The fixed common gain is intentionally conservative. The page reports **PCM sample peak and RMS only**. It does not claim LUFS, true peak, equivalent perceived loudness or production readiness. There is no normalization, compression, noise, accompaniment, network request or link to production audio.

## Guarded command used by root

Root used this command from `C:\AI\Quackpot` for the completed `attempt-02/` run:

```powershell
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/runner.mjs')
```

The wrapper caps the owned process tree at 90 seconds and 2 GiB sampled private bytes, and Node heap at 1 GiB. Inside that boundary, the runner caps browser work at 70 seconds and total runtime at 79 seconds, leaving wrapper time for cleanup. Each OfflineAudioContext render is capped at 8 seconds. These are resource guards, not per-render performance claims.

`history/attempt-02/` already exists. The runner now refuses to reuse an attempt folder, so invoking this command again will stop before launch. A future run would need a separately reviewed new numbered output path.

The first attempt's unchanged partial outputs are preserved in `history/attempt-01/`. Root's corrected run completed in `history/attempt-02/`. Each attempt gets an `attempt-record.json` after cleanup, including the failure or completion state, downloaded files, hashes, and owned-process/profile cleanup result. A complete three-preview run also gets `run-manifest.json`; partial runs do not claim a completed set.

The runner creates a unique profile under the system temporary directory and opens only the report-local file page in headless Chrome. It sets the select value to the known motif id and dispatches `change`, verifies the selected id, then uses CDP to click the page's Render and download controls. The page blocks HTTP(S) requests; the runner records any non-local request as a failure. It captures each WAV and JSON file into the owned attempt folder, verifies format, size, complete download state, absence of `.crdownload` files, finite readings and provenance, and records SHA-256 hashes. The attempt folder must not already exist; the runner refuses to overwrite prior content. Chrome’s process tree is terminated and the exact temporary profile is deleted only after process exit and tree termination are confirmed. Cleanup uncertainty fails the run, preserves the profile, and is recorded in `attempt-record.json`.

Headless rendering never plays audio. To audition the completed set at the owner's pace, open `index.html`, choose the A, B, and C WAV files from `history/attempt-02/` in its saved-file picker, then use the explicit Play and Stop buttons. No listening time window is imposed. The page permits one active audio source and stops playback when hidden or closed. The JSON provenance files stay alongside their WAV files.

The owner selected C for the next composition step. See [`../composition-extension-proposal.md`](../composition-extension-proposal.md) for the proposed longer phrase structures and staged backing study. No extension source or audio has been created.

## Later evidence to preserve

Each preview’s adjacent JSON file contains its exact note events, shared patch, format, sample rate, channel count, exact frame duration, common gain, render elapsed time, and float32 render-buffer PCM sample peak/RMS before PCM16 quantization. It states that these readings are not LUFS or true peak. `attempt-02/run-manifest.json` records source/output hashes, the three displayed readings, no external page requests, and that the renderer did not audition audio. `attempt-02/attempt-record.json` records completed downloads and confirmed Chrome-tree/profile cleanup. Neither record is evidence of listening. The owner's C selection is recorded separately; any further qualitative notes remain owner-provided. The implementer must not claim to have heard or evaluated previews.
