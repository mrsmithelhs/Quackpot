# Plan 13 progress

**Date:** 2026-10-25. **Stage:** isolated preview implementation complete; rendered review and owner decisions remain open.

## Work completed

The owner authorized the isolated preview after the amended prebuild review. The preview now compares 12/20/30-second race timing, causal seeded beats against a resolved-result control, and hand-worked fixture traces. A named-seed mode imports the canonical PRNG read-only and records committed seed/race/choice/trial inputs, fixed-order performance draws, beat draws, eligibility, deltas, progress before/after, finish order, payouts, draw counts, and stream snapshots.

The two named-seed models use separate race-local performance and event streams. The causal candidate draws six performance values and twelve event values; the resolved control draws six performance values and adds no event draws. Event rules remain preview candidates: fixed 40%/70% beats, frozen ranking and gap eligibility, fixed lane-order draws, simultaneous offset application, ±2% baseline event effects and at most ±4% cumulative offset, unique player-first/lower-lane tie resolution, and existing unique-place payouts. Presentation controls reuse the already resolved record. Tests cover duration/camera/motion/replay/save-restore invariance and unchanged mechanical draw records.

### Worked named-seed trace

Inputs: seed “Quackpot Plan 13 named-seed example”, race R03, Steady, player base speed 11.7, field base speed 11.5, no Plan 17 trial. The six performance draws in lane order are A .791417, P .442701, B .395453, C .752757, D .890910, E .156385. They yield speeds A 11.835, P 11.633, B 11.380, C 11.791, D 11.950, E 11.105.

At 40%, E is eligible behind the racer ahead, draws .060761, and gets clean-draft +22.21 points: 444.19 to 466.40. At 70%, B is eligible, draws .029423, and bobbles −22.76: 796.58 to 773.82. Other rolls are recorded as no-event causes. Finishes: D 1194.95 / 1st / 50 Gems; A 1183.51 / 2nd / 20; C 1179.07 / 3rd / 10; P 1163.30 / 4th; E 1132.69 / 5th; B 1115.22 / 6th. This is model output for the stated seed and candidate rules, not accepted production behavior.

## Progressive choice finding

Steady and Sprint remain the opening comparison. The implementation and reproducible test confirm that Drafting currently uses Steady's exact performance formula and event table, so it is mechanically equivalent under this model. The preview labels that as a negative finding and asks the owner to remove the later Drafting option or define a distinct trade-off. No new mechanic was invented. The 12-second introduction remains only an illustrative allowance for any genuinely adopted future option, not evidence for Drafting.

## Presentation refinements

The SVG rig faces left, so the duck artwork rotates onto the travel tangent. Deterministic staged lane paths alter only visual radii; logical lanes and tie order stay fixed. The wide camera now remains locked; the close camera eases in/out around the event region. Optional 1/2-second slow motion stretches a recorded highlight and displays the added total wall time. Optional subtle warm lighting is low intensity. Reduced-motion mode shows the static result and removes lane motion, zoom, and lighting treatment; there are no flashes. The paper turn now remains on its 180-degree reverse and can turn back to front. Plan 17 remains the accepted 3 Down / +5% base speed / one race / non-stacking / consume-once-on-commit rule; the preview only applies the 1.05 factor to the base speed when the trial checkbox is committed.

## Day pacing

The proposal retains the 900-second illustrative allocation: setup 90 seconds, seven ordinary days at 55 seconds (385), three consequential days at 95 seconds (285, including three 20-second races), Receipt/ending 120, and 20 seconds of non-idle orientation allowance. It includes ordered ordinary and consequential maps, counts decisions and repeated waits, and distinguishes paused instructional/result segments from visible live-clock shop windows. A 1/2-second highlight on each of three races adds 3/6 seconds to that budget. These remain estimates, not measured player or classroom evidence. Longer player-paced scenes can exceed the 15-minute floor.

## Scope and evidence

Owned artifacts are proposal.md, preview.html, preview-controller.mjs, preview-model.mjs, preview-model.test.mjs, and this progress report, all under the assigned report folder. Source, rig, package, Plan 19 files, and packet status were not edited. The prebuild review file was left unchanged. The existing Vite server was started by orchestration for the human's manual review; per its direction I did not navigate or automate that server.

The local browser rendering route remains unavailable to this agent; no screenshot, rendered appearance, asset loading, camera framing, accessibility behavior, or responsive layout was visually verified. The HTML/controller received syntax and model-level tests only. Presentation fingerprints detect mismatch between the saved mechanical record and its fingerprint; they are not an authenticity or tamper-proof guarantee. The room/track composition still needs human visual review.

## Checks

- node scripts/dev/plan-status.js check plan-13 — exit 0, RUNNABLE.
- node --test reports/development/plan-13-race-staging-and-run-pacing/preview-model.test.mjs — 10 tests passed, including finish-order/display-progress agreement.
- node --check on preview-controller.mjs and preview-model.mjs — passed.
- git diff --check on the owned folder — passed.
- One optional read-only advisory was attempted. Requested model/effort were gpt-6-sol / low; the harness reported observed model gpt-6.1-sol and did not expose effort, so this is not represented as the authorized Sol-low review. The actionable notes were independently checked and repaired: the wide camera no longer follows the player; displayed progress uses finish-score arithmetic and has an ordering regression test; restore stops old playback; snapshot wording does not claim tamper-proof integrity; and Drafting pacing copy no longer implies a distinct tested trade-off. No further reviewer will be launched.

Artifact commit: 0c1c46a. The progress report is committed separately as the final owned-file commit. No push performed.

## Owner/orchestrator follow-up

Please review the isolated preview visually and decide whether Drafting is removed or given a distinct owner-approved trade-off before any later preview iteration. The proposed event probabilities/effects, three race durations, slow-motion extension, lighting, and 900-second map are review candidates only. No production integration, final duration/day count, packet status change, or push was performed.