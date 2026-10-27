# Plan 23 progress

**Date:** 2026-10-26
**Stage:** Bounded report-only proposal and numerical adapter screens delivered; mapping disposition remains owner-gated. Plan 20 source handoff and exact production file ownership remain coordination gates.

## Overall summary

Completed the read-only source/reference investigation and two report-only numerical screens using the accepted Plan 13 module through an in-memory post-sampling adapter. Current production race resolution is an immediate sampled rank with preset-percent playback; the selected Plan 13 model is a keyed fixed-step simulation with a genuine crossing and presentation derived from a committed result. The existing 8–12 m/s clamp erases higher roster identities and Plan 17 increments. The first screen exposed the speed-domain conflict. A 30-seed calibration run evaluated square-root 10.45–12 across 2,160 races: 0.88% were over 23 seconds, 99.12% were in 17–23 seconds, and none were under 17 seconds. This seed set selected/tuned the candidate and is not independent validation. The owner now accepts early finishes and prefers them to a heavy late tail. The candidate compresses the +5% trial and future rest speed differences. A vertical translation of the monotonic map is proposed for owner consideration because it can preserve transformed speed deltas while shifting absolute speed; no translation was calibrated or selected. Production mapping remains owner-gated.

## Files changed and artifacts

- Added `reports/development/plan-23-production-race-integration/proposal.md`.
- Added `reports/development/plan-23-production-race-integration/adapter-analysis.md`, the bounded runner `adapter-analysis.mjs`, and machine-readable `adapter-analysis-results.json`.
- Added `reports/development/plan-23-production-race-integration/pacing-sweep.mjs` and its machine-readable `pacing-sweep-results.json` for the owner's revised late-race tolerance.
- Refined `adapter-analysis.md` with the owner's early-finish preference, a raw-versus-mapped effect-size table for trial/Sprint/rest inputs, and a bounded next-step choice. The duplicate frozen copy `pacing-calibration-results.json` is retained as a separately named immutable record of the calibration run.
- Added this progress report.
- The proposal artifact is present in shared commit `96f2549` (which also contains separate Plan 20/orchestration coordination edits); its trailing-whitespace cleanup is `e9227ab`. Those unrelated files were preserved and are not claimed as Plan 23 work.
- The numerical investigation, machine-readable results, and proposal clarifications are committed as `cedfec6`.
- The owner-tolerance pacing follow-up and updated candidate analysis are committed as `e0c781d`.
- This timing-preference clarification, raw-versus-mapped effect-size table, and preserved calibration snapshot are committed as `82e754e`.
- This progress report is the final commit for the current scoped update; no push was performed.
- No Plan 23 production or test files, packet, Plan 13, Plan 17, Plan 20, Plan 22, or shared source files were changed. At inspection, concurrent Plan 20 edits were present in `src/core/game-engine.mjs`, `src/core/game-engine.test.mjs`, `src/main.js`, `src/style.css`, `src/ui/duck-motion.css`, and `src/ui/gacha-view.js`; I left them untouched.

## Commands and checks

- `node scripts/dev/plan-status.js check plan-23` — exit 0, `RUNNABLE: plan-23 is ready to implement`.
- Read-only inspection covered the Plan 23/20/22 packets, repo source map, DECISION-018, Plan 13 accepted guide/model/reviews 03–05, Plan 17 accepted integration terms, current engine/storage/log/race view/controller entry points, and Plan 20 proposal/progress.
- `node reports/development/plan-23-production-race-integration/adapter-analysis.mjs` — completed the four-mapping, 432-race-per-mapping screen and wrote the JSON evidence. An initial 20-seed attempt exceeded a reasonable report-only runtime and was interrupted; the final six-seed screen is explicitly labeled exploratory, not distribution evidence. One in-memory harness constants issue was corrected before the completed run.
- `node reports/development/plan-23-production-race-integration/pacing-sweep.mjs` — completed the square-root 10.45–12 follow-up over 30 seeds per input cell (2,160 races total), all finished. Results: mean 22.391s, SD 0.260s, median 22.358s, p95 22.893s, p99 22.986s, range 21.685–23.060s; 19 races (0.88%) over 23s, none under 17s. The 50%-rest subgroup had 2.64% over 23; rested/25%-rest subgroups had zero.
- The calibration results were copied byte-for-byte to `pacing-calibration-results.json`; the source sweep file remains unchanged and continues to reproduce `pacing-sweep-results.json`. An attempted fresh-seed validation run was stopped before output when QP Orch directed that no further wide sweep occur before the owner chooses the modifier/timing trade-off. No independent validation result is claimed.
- The updated table directly compares authored versus transformed input deltas: Plan 17 +5% is 0.500/0.700/1.000 m/s raw versus 0.033/0.036/0.040 mapped; nominal Sprint +10% is 1.000/1.400/2.000 raw versus 0.065/0.070/0.079 mapped. At Common, 25%/50% rest gaps shrink from 2.5/5.0 raw to 0.194/0.511 m/s mapped. These are mapping effects, not a race-outcome guarantee.
- The report proposes asking the owner to authorize a single bounded global-translation family analysis, with fixed calibration seeds and untouched validation seeds, if preserving modifier deltas while favoring early finishes is preferred. The transform amount and all output bounds remain unselected. `>23s` is an empirical distribution threshold, not a hard cutoff; `<17s` is acceptable. Unresolved attempts must be included conservatively if future runs have any.
- The script directly calls the unchanged reference module for the named R03 parity witness, then imports an in-memory source copy with only the adapter insertion. No Plan 13 source file was changed.
- The full direct reference resolution was 299,215 UTF-8 JSON bytes / 54,790 gzip bytes. Five sample full resolutions per mapping measured 288,986–371,551 bytes; the square-root compact-encoding samples were 91,191–99,406 bytes. No watchdog outcome occurred in 1,728 runs, so no watchdog payload size is claimed. Event-guard samples and observed event/diagnostic maxima are documented in `adapter-analysis.md`.
- No repository build, test suite, or browser session was run; browser work remains coordinated by QP Orch.
- The report-only compactor is a size model, not a production storage recommendation until round-trip, precision, corruption, cap-size, and storage-timing checks are approved.

## Problems, risks, and follow-ups

- Production roster speeds exceed or meet the preview's 12 m/s cap; its current minimum also flattens low inputs. Direct port would erase identity and selected modifiers. Proposal requires an approved global adapter study and explicit return-to-owner stop if it cannot preserve supported effects and pacing without per-variant tuning.
- No screened mapping passes both accepted pace and modifier-preservation checks. Smooth maps preserve order but compress the raw +5% trial effect to about 0.06–0.08 m/s on the square-root map; the pacing band still failed in most supported combinations. Owner decision is required before further tuning or source work.
- The calibration sample meets the requested approximate late-tail tolerance, but it is not independent validation. Its mean finish time is 22.391s, so the timing is still concentrated toward the late side of the 17–23s band; the owner's preference permits moving early. The transform reduces the mapped trial increment to 0.033–0.040 m/s and rest deltas substantially. Owner disposition is required before another sweep or source change.
- Plan 20 retains the production-writing lane; its source handoff and exact file ownership must be confirmed before changes.
- Existing saves record race result summaries but do not contain a trajectory. Migration must preserve honest legacy results without inventing motion/event evidence.
- No valid-matrix watchdog payload or production storage timing was observed; do not infer one from cap-shaped samples. Existing trajectory/event/diagnostic/draw-key arrays contain redundancy, so only a round-trip-validated compact form should be considered.

## Advisor consultation

Branch C — orchestrator-gate-only for this report-only screen. The adapter runner is a numerical analysis tool, not the main production implementation; the repository's owner override reserves the one allowed Sol-low review for the implemented main artifact before delivery and bars a proposal/repair reviewer. The report and script are returned to QP Orch for that gate.

## Ready for orchestrator review

Yes — report-only proposal and numerical screens. No implementation or independent timing validation is claimed. QP Orch/owner should choose between the current calibrated candidate and authorizing one bounded global-translation analysis, then confirm Plan 20 source handoff and file ownership before production work begins.
