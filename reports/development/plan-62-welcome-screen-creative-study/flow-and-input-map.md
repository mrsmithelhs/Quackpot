# Plan 62 — initial flow and input map

Source inspection on 2026-11-05; repository HEAD `09ec987a05698022b4eade1c1796074588cdf965`. This is a point-in-time source reading, not a browser walk; other work may change the tree. Hashes identify inspected files, not a complete transitive dependency pin.

| Category | Current source / selected intent | Study boundary |
|---|---|---|
| Fresh entry | `src/main.js` starts a fresh engine at `desk`; `renderApp` routes that step to `renderKitchenSetupView`. The kitchen form contains Professor Quacks, checked autosave and Start the morning; submission sets the preference, calls `setupCompanion`, then enters life. | Selected replacement: welcome and naming transition, with no second onboarding. Exact art and autosave location remain open. |
| Restore | Boot hydrates a supported envelope and uses its saved step, with life priority handling; terminal runs go to Receipt. Corrupt/unsupported preservation and unknown-step safeguards are separate existing paths. | Selected Continue bypasses introduction; synthetic examples must not load, reset or overwrite actual storage. Detailed integration requires current-source review. |
| Historical desk | `renderDeskView` still contains name/autosave fields in its non-returning branch. In the inspected `renderApp`, the earlier `desk` branch intercepts the usual fresh step; the later `!phoneOpen` route passes `returning: currentStep !== 'desk'`. | Source-order reading suggests the non-returning fields are not reached through that route; not a proof about every runtime path. Preserve the returning desk/phone scene, and verify reachability during integration. |
| Receipt | The current Receipt view receives `onFreshRun`; it clears the save before starting afresh except in unsupported-preservation mode. | Selected post-Receipt menu is future behavior; a synthetic Receipt is not authority to alter retention/export or the real Receipt. |
| Settings and download | Existing settings/storage/export are production neighbors, not replaced by a concept. | Show labelled placeholders only; preserve current semantics. No-data and unsupported-save presentation are proposals. |
| Art | `src/assets/apartment/` contains the extracted SVG scene and physical-duck generators. The kitchen setup actually imports `renderScene`. The kit README's historical “not imported by the game” statement is stale for this usage. | Render actual reference inputs before consulting when supported; no claim of visual inspection yet. Plan 24 extraction manifest owns symbol provenance. |
| Music | Plan 39's `lab/scores.js` and `lab/synth-engine.js` are existing audition candidates. Its provenance clarification describes a custom procedural synth with worker-authored recipes inspired by TinySynth documentation, not an integrated upstream library. | Candidate passages and rights remain unselected and unauditioned. No new composition/transcription; no inference of redistribution rights. |

## Inspected SHA-256 pins

| File | SHA-256 |
|---|---|
| `src/main.js` | `9b7b3e7084bd9373c87d1fc6994ad26ab3c38243cd69637878b679cb465aac12` |
| `src/ui/kitchen-setup-view.js` | `374b6553cca09df168229531e7acdf66b1f7e58fcd6c11effaeb050940063c02` |
| `src/ui/desk-view.js` | `dd65b80403c64ffa4e96d404d243a3991a4d784ed8708f5123b3f244c2e5123b` |
| `src/assets/apartment/index.mjs` | `64992928c525d5c5ad6bd10dbbb741e7ae519c16acf25c17813be049b09de63b` |
| `src/assets/apartment/rooms/scene.mjs` | `7e5821d378fd87225d36a7440480a5a8670ad56530b2336b6252a58f62ce997d` |
| `src/assets/apartment/duck/views.mjs` | `ef51fb6ca894e8fa144aae7a157692170350d12812495878c2d3581a1c230425` |
| `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/scores.js` | `f5462620a3ffe7f83eaac7405cac22fdb9f92c2cbd4bff1bf0d4c400539ae68f` |
| `reports/development/plan-39-melody-reference-and-web-audio-laboratory/lab/synth-engine.js` | `f756539d1a564c0cf0fe997a0602a9fe9b93de5b7790a46e02c9bdc247ae3f82` |

Hashes are not a stable prototype dependency set. Pin all actual transitive inputs again before capture or implementation.
