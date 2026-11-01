# Plan 39 repaired laboratory guide

This report-local laboratory preserves C0 and the owner-selected M1–M6; it is not production music. Open `index.html` locally in a browser. Select an arrangement, patch, tempo and layers, then play or export. C0 is the historical dry control; M1/M2 are intentional variations, not exact repeated-C controls.

The audition slider changes playback volume only. A WAV uses the patch master gain and the active layer gains; if its sample peak exceeds 0.95 the renderer scales it to 0.92. The v4 settings manifest records the patch master, input and effective layer gains, and export safety scale. Peak and RMS are sample measurements, not LUFS or true peak.

A phrase lasts score beats × 60 / BPM. A one-shot WAV includes a conservative release/effect tail. The wrap option folds that finite tail into a score-length WAV. Live looping schedules repeated phrases on the audio clock and overlaps their releases; the first live phrase begins without a previous tail. If browser scheduling falls behind, playback stops and reports it. Device behavior and repeated joins need listening; this is not a sample-identical or clickless guarantee. Browser output and exported WAV can differ in level, including export safety scaling.

New v4 manifests validate current score and patch versions, all canonical tracks, patch snapshot, programs, mix and effective controls before restoring. Older exports remain preserved but are rejected by this importer because their settings cannot establish a complete round trip. Imported layer gains are retained and reported in the status; selecting candidate defaults resets them. Use a current export to make a restorable settings file. Imported tempos and programs must also be represented in the visible controls.

See `TINYSYNTH-NOTICE.md` for the unresolved historical upstream revision, reference revision, local modifications and license. The laboratory is a custom renderer using reported adapted recipes; it is not the full upstream library. Plan 43 must wait for root acceptance and a pinned, verified baseline.
