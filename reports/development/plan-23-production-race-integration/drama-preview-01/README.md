# Plan 23 isolated race integration preview

**Stage:** report-only visual candidate for QP Orch review. No production model, engine, save, Receipt, canonical decision, or accepted Plan 13 source was changed.

## Open the preview

QP Orch's authorized local URL was:

`http://127.0.0.1:5181/Quackpot/reports/development/plan-23-production-race-integration/drama-preview-01/preview.html`

The preview expects the repository's local Vite server and existing dependencies. It imports the accepted Plan 20 digital-duck rig and motion controller for visual demonstration, but all Plan 23 mechanics are generated in this report folder from the accepted Plan 13 race source and the frozen Plan 23 R2 study transform. Production has no report-folder imports.

## Contents

- `preview.html`, `preview-controller.mjs`, and `preview.css` form a focused race-only view with comparison modes, actual roster-tier/race/rest inputs, stance and Plan 17 trial controls, event-linked paused views, the two-second highlight, and reduced/static checkpoints.
- `baseline-model.mjs` and `candidate-model.mjs` are generated browser modules. `browser-check.mjs` extracts the exact study transform from `drama-study-02/validate.mjs`, generates the modules and manifest, and verifies them against direct transforms and stored frozen validation rows.
- `model-manifest.json` records source/runner hashes, the frozen validation result hash, modes, six scenario presets and 72 first-seed parity witnesses. It is generated output; rerun `node reports/development/plan-23-production-race-integration/drama-preview-01/browser-check.mjs` to regenerate it.
- `evidence/browser-observations.md` records the authorized desktop/narrow browser checks and limitations.

## Model and scenario boundaries

The visual candidate is R2combined with risk-only Sprint: Safe retains the accepted ±5% sampling; Sprint retains the keyed ±20% spread but uses a mean multiplier of 1.00 in this candidate. The current R2combined comparison uses its present 1.10 Sprint mean. The affine baseline wrapper is the comparison baseline; its fingerprint parity is exact only against the current affine wrapper, not the raw Plan 13 resolver. Neither the calibration nor the candidate is adopted for production.

Roster ratings remain 10/14/20 as abstract authored ratings. The report-only candidate applies the investigated shared affine transform after ordered rest, Plan 17 trial, and stance sampling. This avoids the Plan 13 8–12 speed-cap plateau in the mapped integration domain, while scaling absolute rating/modifier gaps to half their unscaled size. Trial remains a distinct +5% input and Sprint remains a distinct keyed choice. In the scenarios, Rare tired with one intervening race is 0.75; the current production zero-intervening-races tired preset is separately represented as 0.50. Rest computation and lifecycle remain Plan 22 work.

The accepted selected weave/contact mechanics, first real forward finish-line crossing, same-instant follower classification and two-second presentation-only highlight are preserved. Playback controls never resolve the model again. Pausing, replaying, skipping, seeking and static checkpoints are presentation of the already-resolved report-only result.

## Verification

Run the module syntax checks and `browser-check.mjs` directly as listed in the evidence note. Do not use this preview as production integration evidence for versioned saves, migrations, append-only Receipt projection, or reward idempotency; those still require the approved production handoff and verification.

## Camera behavior

The default Camera control is **Eased close mid-race, then wide**. It applies a smooth presentation-only zoom through the middle of playback and returns to a wide view at the finish. **Locked wide** remains available as an explicit alternative. Static/reduced-motion mode keeps the camera wide at every checkpoint. Camera controls never resolve the race again; `data-resolution-fingerprint` is a preview-only diagnostic attached when the committed resolution is created so playback checks can confirm the same outcome is still being presented.

The 2026-10-27 isolated browser check verified a smooth scale progression from 1.0000 at the start to 1.0988 at tick 167, 1.1589 at tick 180 and 1.1600 near tick 208, followed by a return to 1.0000 at the finish. Pause held the sampled transform, and event seeking, restart, static checkpoints and Locked wide left the committed-resolution fingerprint unchanged. Exact observations are in `evidence/browser-observations.md`.
