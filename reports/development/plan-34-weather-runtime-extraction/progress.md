# Plan 34 progress — weather runtime extraction without mounting

**Date:** 2026-10-28  
**Status:** implementation delivered for orchestrator review; packet status was not changed.

## Summary

Extracted Plan 26's accepted living-room weather stills, seeded rain specification/controller, page-level flash arbiter, and owner-selected bright lightning effect into focused source modules. The helpers remain unmounted. No apartment kit, production view, app entry, settings, save/storage, core/log, or global CSS was changed. No push, deployment, browser launch, or full-suite run was performed.

## Files changed

- `src/ui/weather-flash-arbiter.mjs` and focused tests.
- `src/ui/weather-rain-spec.mjs` and focused tests.
- `src/ui/weather-motion-controller.mjs` and focused tests.
- `src/ui/weather-lightning-effect.mjs` and focused tests.
- `src/assets/apartment-weather/{geometry.mjs,weather-art.mjs,layers.mjs,README.md}` plus real-kit and source-fingerprint tests.
- `src/test/weather-fake-dom.mjs` for test-only lifecycle fixtures.
- `package.json` explicit test-list update.

Source commit: `0b4230f` (`Extract unmounted Plan 34 weather helpers`). The progress report is being committed separately as the final scoped commit.

## Contract and implementation evidence

- `buildWeatherLayers({ area, idPrefix, weather, ...kitOptions })` removes `weather` before calling the apartment kit and retains the original plain SVG before staging any insertions. Clear returns exact plain-kit SVG. Supported styled weather is living-room `overcast`, `rain`, or `storm`; unsupported requests and anchor failures return the plain scene plus requested/effective diagnostics, with effective weather explicitly reported as `clear`.
- Weather insertion is local-string atomic: floor after the rug, pane layers after the unique production window markup, and atmosphere before the first lamp glow. A missing later anchor discards the earlier staged insertion. IDs are derived from the caller's prefix with the `-weather` scope.
- Stable `data-weather` roles cover the sky, clouds, rain streaks/droplets, ambient shadows, tint/vignette, and window/lamp spill. The pane clip reference and source kit output remain intact. Tests exercise two prefixes against real kit output, exact clear-path identity, stripped-back equality, source duck/lamp subtree preservation, layer order, clip/IDs, unsupported-area/weather fallback, and atomic missing-anchor fallback.
- Controller uses no module-level mutable state. It requires one valid clipped `sky` role, a live reduced-motion preference listener, and first visibility observation before motion can run. Missing/ambiguous/unclipped glass, missing observer/WAAPI, or unknown reduced-motion support stays static and refuses flash. `flashEnabled` is independent and defaults off; turning it off cancels an active ticket but does not refund or reset the injected arbiter.
- Bright-only lightning retains the selected 40 ms rise, 300 ms whole-scene fade, 800 ms window fade, 500 ms window tail, scene peak 0.9 and window peak 1.0. Existing exception-safe node registration/cleanup, accepted-then-cancelled start failures, watchdog handling, shared start-to-start cooldown, no queue, and no cooldown refund are covered by focused tests.
- The test-only source fingerprint checks the relevant Plan 24 kit files against accepted blob IDs recorded for kit commit `5237a2a4f58922ff713240a9e4c7221ab89e6c62`. Runtime modules have no report, Git, or filesystem reads.

## Validation performed

All Node launches used the established `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1` launcher, sequentially, with `node.exe`, 1 GiB heap, 2 GiB sampled owned-tree private-memory cap, 90 second deadline, and bounded output. Sampling is not a hard peak-memory guarantee.

Packet preflight, via the bounded launcher, returned `RUNNABLE: plan-34 is ready to implement`.

Focused Node tests (each launched separately through the bounded launcher):

- `node --test src/ui/weather-flash-arbiter.test.mjs` — 8/8 passed.
- `node --test src/ui/weather-rain-spec.test.mjs` — 9/9 passed.
- `node --test src/ui/weather-motion-controller.test.mjs` — 28/28 passed after review repairs.
- `node --test src/ui/weather-lightning-effect.test.mjs` — 8/8 passed after review repairs.
- `node --test src/assets/apartment-weather/layers.test.mjs` — 5/5 passed after review repairs.
- `node --test src/assets/apartment-weather/kit-fingerprint.test.mjs` — 1/1 passed.

The focused tests total 59 passing checks. The first bounded runs exposed fixture/path issues and one literal-anchor matcher assumption; each was diagnosed before a retry and corrected within scope. No broad `npm test`, legacy smoke, watcher, or unattended sweep was run. A PowerShell check parsed `package.json` and confirmed every one of its 22 explicitly listed test-file paths exists. `git diff --check` passed.

Bounded Vite builds passed before and after extraction. Both transformed 59 modules and produced the same files, sizes, and SHA-256 values:

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| `dist/index.html` | 526 | `2F6EBB38C2DF85560685A2DD38EAB4D95C1867A659BAA41267FECF4429BF2D66` |
| `dist/assets/duck-placeholder-Mhd15Sdp.svg` | 1,011 | `F117C22731E770221E8CFD8652B0ACBCBE27A7D00A5F36832A7A5132CEE0E12F` |
| `dist/assets/index-IHRjW_xF.css` | 47,583 | `CB56083951AED5D70336D32A7DDBB87E2A3EADE6D59DF3AF9F36AD266D0C0BFC` |
| `dist/assets/index-B9GTazJy.js` | 296,871 | `5E7BB055A351DE9CE883F69D9F91AD56367ED0F2F47587C283FD819C72C8981B` |
| `dist/assets/index-B9GTazJy.js.map` | 772,818 | `210ADE311A8E0B2AEEF0AD5769741277C163A6D4ACE096524AF91CEC468340CD` |

Static reference inspection found no import/reference to these new modules from `src/main.js` or current production views. Their only incoming imports are between the extracted helpers and from focused tests. The unchanged bundle hashes and 59-module count corroborate that the helpers are not in the production entry graph; no browser witness was needed.

## Advisor review and disposition

One authorized, read-only review ran after the main implementation. Requested model: `gpt-6.1-terra`. Reviewer reported observed model `gpt-6.1-terra`; the reviewer role was configured for medium effort, but effective effort could not be independently observed. Read-only posture was instruction-enforced, not structurally verified. The reviewer launched no processes and ran no tests.

1. **Accepted — reduced-motion transition gap.** The prior handler could clear `reduced-unknown` and reconcile before adding `reduced`. The handler now updates both blockers before one reconcile. The regression test exercises unknown followed by reduced and confirms observers never see an unblocked gap. Focused controller tests pass 28/28.
2. **Accepted — misleading fallback effective weather.** Fallbacks now report the plain scene as effective `clear`, preserving the requested weather separately and retaining effective area. Unsupported weather/area and anchor-failure tests confirm it.
3. **Accepted — unobservable MediaQueryList.** A boolean `matches` value without a usable change-listener API now yields `reduced-unknown` and a static scene. A regression test covers this case.
4. **Accepted — missing-glass observer fallback.** The controller now requires exactly one sky role with a clipped parent and never observes the whole scene as a substitute. Missing glass stays static and blocks flash. The old root-fallback expectation was replaced with a malformed-scene regression test.

No second reviewer pass was run. Primary implementation independently verified each correction and reran the affected focused suites. A post-review status check showed no reviewer edits; the only unrelated untracked path is the parallel Plan 33 report directory, which was not staged or modified.

## Problems, risks, and follow-ups

- The integration helper is not mounted and does not establish production surface, story triggers, settings persistence, Receipt treatment, credits UI, device behavior, or live flash measurements. Those remain separate E2/owner gates.
- Real-kit source compatibility is pinned in test-only code; a future accepted kit change will require deliberate fingerprint/anchor review.
- Sampled process memory remains only the launcher’s sample, not a guaranteed peak measurement.
- The shared tree contains untracked `reports/development/plan-33-recognizable-music-emotional-transformation-research/` from another thread. It is untouched and excluded from both commits.

## Ready for orchestrator review

**Yes.** The scoped source/tests and this report are committed locally. No packet status, push, deployment, mounting, app settings, save schema, log, or production view changed.
