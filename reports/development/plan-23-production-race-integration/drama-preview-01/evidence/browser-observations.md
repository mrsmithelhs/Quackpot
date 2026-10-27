# Plan 23 isolated preview browser observations

**Date:** 2026-10-27 (America/New_York)

**URL:** `http://127.0.0.1:5181/Quackpot/reports/development/plan-23-production-race-integration/drama-preview-01/preview.html`

**Browser:** new Codex in-app browser tab in the authorized isolated preview context; the owner's Chrome tab was not used. Existing local server answered the URL. This work did not start, stop, or terminate the server.

## Desktop — 1280 × 720 CSS px

- The race view, selected risk-only candidate, matched race seed, six-duck grid, line-crossing result and controls rendered. Initial selected candidate was Sprint mean ×1.00 ±20%; Common Tutorial/R01 at authored rating 10 and rested factor 1 resolved to a 21.62 s simulated crossing plus the 2 s playback highlight.
- Scenario controls preserved the same seed while changing input/mode. The Rare Finale/R03 zero-races-tired case showed authored rating 14 × rest factor 0.50, Safe ±5%, a distinct Plan 17 +5% input, and a real crossing. On the first validation seed with Safe + trial, the affine baseline resolved in 21.36 s and R2combined in 21.34 s; the selected risk-only model used the same mechanical outcome as R2combined for Safe because its Sprint mean change is stance-specific.
- `Next validation seed` advanced from `plan23-drama2-val-01` to `plan23-drama2-val-02`; there is no free-form seed selection. Mode changes retained scenario, stance, trial and seed.
- Start, pause (observed at tick 5.5–6.6), resume, Skip to finish and same-race restart worked. The committed summary remained unchanged through presentation controls. Skip disclosed the six finish places and full event archive with no claimed mechanics or RNG rerun.
- Event seeking selected the recorded duck-contact at tick 25 / 1.25 s, paused at the post-event state, and showed concise text limited to the recorded contact and trajectory. Restart returned to the same committed race playback.
- Static/reduced motion presented five fixed checkpoints at 0%, 25%, 50%, 75% and 100%, followed by the actual finish; event seeking remained available as a still. Reduced mode showed no animated zoom/lighting/slow motion.
- The two-second highlight is included in the displayed maximum playback duration separately from simulation finish time (for the tired R2 risk-only witness, 21.48 s simulated + 2.00 s presentation = 23.48 s maximum playback). This does not change the validation timing criterion.

## Narrow — 390 × 844 viewport override

- Browser-reported layout viewport: 390 × 844; CSS `innerWidth` was 375 after the browser scrollbar. Document and body scroll widths both equaled their client widths (375 px); no horizontal page overflow.
- Race stage measured approximately 306 × 172 px with clipped SVG projection and one-column race layout. Model controls occupied their 306 px container without horizontal overflow. The six-column mechanical event table remains horizontally scrollable inside its own log container.
- The narrow check exposed intrinsic-width overflow in the filter/control flex row. A preview-only media-query fix constrains full-width controls and buttons under 560 px; the post-fix measurement reports no document-level overflow.

## Console and repairs

- The first tab had loaded a stale manifest before the zero-race preset was added, and the first contact/restart interaction exposed a report-preview animation cache bug. The page was reloaded after regenerating the 72-witness manifest; the bug was fixed in the preview controller by cancelling the cached `Animation[]` and retaining one impact animation per event instead of recreating it each frame.
- A new browser tab loaded the final files with **zero console errors or warnings**. Pause/resume, skip, contact event seek, same-race restart, five static checkpoints, finish and event seek from static view all passed in that clean tab. The separate model harness reports 72 first-seed parity witnesses across six presets, two stances, two trial states and three modes.

## Limits

These observations apply only to the report-only preview in this browser. No production source, save/reload, schema migration, Receipt output, reward idempotency, hardware screen reader, physical device, audience response, or deployed site was exercised. The model timing evidence is the 20-seed offline validation reported in `../drama-study-02/README.md`; browser playback is not a new timing-distribution study.
