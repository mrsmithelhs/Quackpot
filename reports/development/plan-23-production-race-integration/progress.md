# Plan 23 progress

**Date:** 2026-10-26
**Stage:** Bounded report-only proposal, speed calibration, and geometry screen delivered; the affine candidate is recommended for owner review only. Production mapping adoption, lifecycle/storage approval, and exact file ownership remain gated.

## Overall summary

Completed the read-only source/reference investigation and report-only numerical screens using the accepted Plan 13 module through in-memory conversions. Current production race resolution is an immediate sampled rank with preset-percent playback; the selected Plan 13 model is a keyed fixed-step simulation with genuine crossing and presentation derived from a committed result. The existing 8–12 top-speed clamp erases higher roster identity and modifier differences. The prior sqrt10.45–12 candidate met its calibration tail screen but compressed effects. A matched 8-seed calibration/20-seed validation comparison tested identity and one global affine conversion with accepted course and physics constants fixed. Identity conversion had a 22.313s validation median but 439/1,440 (30.49%) finishes over 23s. The recommended report-only candidate `internalSpeed = 8.25 + 0.5 × ratingInput` had mean 21.023s, median 21.006s, p95 21.769s, max 21.893s, zero under-17, zero over-23, and zero unresolved among 1,440 validation attempts. Its 0/1,440 late Wilson 95% interval is 0–0.266%. It uniformly retains half of raw absolute tier/trial/rest/Sprint gaps with no clamp plateau. An owner-authorized identity-speed geometry screen found neither straight 40 nor 20 passed both timing criteria: 40 had 13.37% late, while 20 had a 15.446s median. No held-out geometry validation was run. The affine mapping remains a recommendation for owner review, not production authorization.

## Files changed and artifacts

- Added `reports/development/plan-23-production-race-integration/proposal.md`.
- Added `reports/development/plan-23-production-race-integration/adapter-analysis.md`, the bounded runner `adapter-analysis.mjs`, and machine-readable `adapter-analysis-results.json`.
- Added `reports/development/plan-23-production-race-integration/pacing-sweep.mjs` and its machine-readable `pacing-sweep-results.json` for the owner's revised late-race tolerance.
- Refined `adapter-analysis.md` with the owner's early-finish preference, a raw-versus-mapped effect-size table for trial/Sprint/rest inputs, and a bounded next-step choice. The duplicate frozen copy `pacing-calibration-results.json` is retained as a separately named immutable record of the calibration run.
- Added `linear-speed-comparison.mjs` and `linear-speed-comparison-results.json`, a reproducible matched comparison with all 72 cells, 8 calibration seeds per cell, 20 independent validation seeds per cell, per-cell/group summaries, uncertainty, and playback timing.
- Added `track-length-comparison.mjs` and `track-length-comparison-results.json`, a bounded identity-speed calibration comparison of straight lengths 60/40/20 at fixed radius 20. Neither changed geometry passed; no held-out geometry validation was run.
- Added this progress report.
- The proposal artifact is present in shared commit `96f2549` (which also contains separate Plan 20/orchestration coordination edits); its trailing-whitespace cleanup is `e9227ab`. Those unrelated files were preserved and are not claimed as Plan 23 work.
- The numerical investigation, machine-readable results, and proposal clarifications are committed as `cedfec6`.
- The owner-tolerance pacing follow-up and updated candidate analysis are committed as `e0c781d`.
- This timing-preference clarification, raw-versus-mapped effect-size table, and preserved calibration snapshot are committed as `82e754e`.
- The owner-approved global speed-mapping comparison, reproduced result data, and updated proposal/analysis are committed as `75e67d4`.
- The requested relative modifier/rest outcome clarifications and bounded geometry screen, results, and corrected highlight-tolerance wording are committed as `7136c37`.
- The prior progress snapshot was committed as `9d6fd5f`; this updated report will be committed last for the current work. No push will be performed.
- No Plan 23 production/test files, packet, Plan 13, Plan 17, Plan 20, Plan 22, or shared production source were changed. Other-agent changes outside the report folder were present and left untouched. No cleanup or restore command was run against the phone follow-up files raised in the coordination check.

## Commands and checks

- `node scripts/dev/plan-status.js check plan-23` — exit 0, `RUNNABLE: plan-23 is ready to implement`.
- Read-only inspection covered the Plan 23/20/22 packets, repo source map, DECISION-018, Plan 13 accepted guide/model/reviews 03–05, Plan 17 accepted integration terms, current engine/storage/log/race view/controller entry points, and Plan 20 proposal/progress.
- `node reports/development/plan-23-production-race-integration/adapter-analysis.mjs` — completed the four-mapping, 432-race-per-mapping screen and wrote the JSON evidence. An initial 20-seed attempt exceeded a reasonable report-only runtime and was interrupted; the final six-seed screen is explicitly labeled exploratory, not distribution evidence. One in-memory harness constants issue was corrected before the completed run.
- `node reports/development/plan-23-production-race-integration/pacing-sweep.mjs` — completed the square-root 10.45–12 follow-up over 30 seeds per input cell (2,160 races total), all finished. Results: mean 22.391s, SD 0.260s, median 22.358s, p95 22.893s, p99 22.986s, range 21.685–23.060s; 19 races (0.88%) over 23s, none under 17s. The 50%-rest subgroup had 2.64% over 23; rested/25%-rest subgroups had zero.
- Earlier screens used sqrt10.45–12 and remain historical comparison evidence; the owner's latest calibration approval superseded their modifier-compression recommendation. The immutable `pacing-calibration-results.json` is byte-identical to `pacing-sweep-results.json`; the original runner remains unchanged.
- `node reports/development/plan-23-production-race-integration/linear-speed-comparison.mjs` — completed the matched report-only comparison with 3 mappings × 72 cells × (8 calibration + 20 validation) seeds = 6,048 attempts. On the independent 1,440-attempt validation set, sqrt10.45 had 0 late; identity conversion had 439/1,440 late (30.49%); `8.25 + 0.5x` had 0 late, median 21.006s, mean 21.023s, p95 21.769s, max 21.893s. Every candidate-arm cell finished 20/20 with no unresolved outcomes. No under-17 finish occurred.
- The linear candidate maps supported sampled inputs 4.4–27.72 to internal speeds 10.45–22.11. It preserves strict input order and uniformly scales each raw absolute gap by 0.5: Common +5% changes 0.500→0.250, Sprint +10% nominal 1.000→0.500, 25% rest gap 2.500→1.250, and 50% rest gap 5.000→2.500; Rare/Legendary values are fully tabulated in the analysis. These are internal model values, not learner-visible m/s claims.
- Paired validation condition-cell effects for the linear candidate: trial averaged −0.149 mean-place change and −0.034s; Sprint averaged +0.246 places improved and 0.057s saved; 25%/50% rest inputs added 0.242s/0.519s. Tier win rates remained ordered: 27.3% Common, 56.5% Rare, 85.8% Legendary. See per-cell and group evidence in the JSON rather than pooling away the tails.
- Relative affine examples: rating 10→13.25, while trial input 10.5→13.50 (+1.89% internal topSpeed); rest 10→5 maps 13.25→10.75 (−18.87%). Although paired race-time shifts are modest, rest groups separated materially: rested mean place/win 1.315/84.6%; one-rest 2.052/60.4%; zero-rest 3.823/24.6%. Race ends on the first entrant's crossing, so rank/win effects must accompany time deltas.
- `node reports/development/plan-23-production-race-integration/track-length-comparison.mjs` — 1,728 calibration attempts (3 straight lengths ×72 cells×8 seeds), all finished. Straight 40: median18.814s, 77/576 late (13.37%), 12/72 cells had late outcomes. Straight 20: median15.446s, 477/576 under17 (82.81%), 0 late. Both fail the combined calibration rule; no held-out validation or further geometry search was run.
- An initial exploratory run with a raised in-memory corner-search bound was superseded before reporting. The final run preserves Plan 13's accepted corner-target search bound and turn law; only the sampled topSpeed adapter is substituted. Source SHA-256 is recorded in the results.
- `>23s` is a distribution criterion, never a forced cutoff; `<17s` is acceptable. Unresolved attempts are explicit and conservatively included in the late-or-unresolved rate. The selected +2s highlight playback is reported separately from simulated crossing time.
- The script directly calls the unchanged reference module for the named R03 parity witness, then imports an in-memory source copy with only the adapter insertion. No Plan 13 source file was changed.
- The full direct reference resolution was 299,215 UTF-8 JSON bytes / 54,790 gzip bytes. Five sample full resolutions per mapping measured 288,986–371,551 bytes; the square-root compact-encoding samples were 91,191–99,406 bytes. No watchdog outcome occurred in 1,728 runs, so no watchdog payload size is claimed. Event-guard samples and observed event/diagnostic maxima are documented in `adapter-analysis.md`.
- No repository build, test suite, or browser session was run; browser work remains coordinated by QP Orch.
- The report-only compactor is a size model, not a production storage recommendation until round-trip, precision, corruption, cap-size, and storage-timing checks are approved.

## Problems, risks, and follow-ups

- The proposed affine conversion intentionally scales absolute input gaps by one global factor (0.5), rather than preserving their raw rating-unit magnitudes. This is visible in the effect table; owner review must decide whether the measured trial/rest/Sprint effects are meaningful enough before production source work.
- The recommended affine candidate met the observed timing criteria on 1,440 independent validation attempts. Zero observed late finishes do not guarantee a population zero; the attempt-level Wilson interval's upper bound is 0.266%, and crossed-seed dependence should remain visible in interpretation. Its slope scales absolute rating/modifier gaps by one half, requiring explicit owner acceptance.
- Geometry-only alternatives at straight40 and straight20 failed opposite sides of the target; do not infer an untested intermediate geometry result or begin another search without a new owner decision.
- Plan 20 is accepted and the source hold is released. Exact Plan 23 production/test ownership and lifecycle/storage proposal approval remain outstanding; this report does not authorize production edits.
- Existing saves record race result summaries but do not contain a trajectory. Migration must preserve honest legacy results without inventing motion/event evidence.
- No valid-matrix watchdog payload or production storage timing was observed; do not infer one from cap-shaped samples. Existing trajectory/event/diagnostic/draw-key arrays contain redundancy, so only a round-trip-validated compact form should be considered.

## Advisor consultation

Branch C — orchestrator-gate-only for this report-only screen. The adapter runner is a numerical analysis tool, not the main production implementation; the repository's owner override reserves the one allowed Sol-low review for the implemented main artifact before delivery and bars a proposal/repair reviewer. The report and script are returned to QP Orch for that gate.

## Ready for orchestrator review

Yes — report-only proposal and independent timing validation. Recommend `internalSpeed = 8.25 + 0.5 × ratingInput` for owner calibration review, with its half-scale modifier gaps made explicit. The owner/QP Orch should accept, reject, or revise that calibration and then approve the exact lifecycle/storage and production file ownership before source work. Plan 20 acceptance/source handoff is clear; it is not production authorization.

## Preview and handoff follow-up (2026-10-27)

QP Orch authorized the isolated `drama-preview-01/` report-only candidate and coordinated a dedicated in-app browser turn at the localhost preview URL. The root-selected comparison is R2combined + risk-only Sprint, alongside current Sprint R2combined and the affine baseline. Preview-only modules are generated from the exact `makeStudySource` function in the frozen R2 validator, the unchanged accepted Plan 13 source, and the handed-off Plan 20 rig/view/motion source. No report artifact is imported by production.

The original 60 parity cases were expanded to 72 to separately represent the actual Rare zero-intervening-race tired preset (`zero-races-rest`, factor 0.50) and the distinct one-intervening-race scenario (factor 0.75). `browser-check.mjs` now passes for six presets × two stances × two trial states × three modes, with exact browser-module/direct-transform fingerprints and stored first-seed validation outcomes/metrics. The affine parity wording remains bounded to the current affine baseline wrapper, not raw Plan 13 fingerprints.

The authorized browser check covered desktop 1280×720 and narrow 390×844. A preview-only mobile-control fix removed document-level horizontal overflow. The Rare zero-races tired candidate showed authored rating 14 × 0.50, a 21.48 s genuine first crossing and 2.00 s separate highlight playback. Pause/resume, skip, event-linked duck-contact seek, same-race restart, five reduced/static checkpoints, finish, and static event seeking passed. A newly opened tab showed zero console errors/warnings after the preview repairs. The first tab had exposed a stale-manifest attempt and an impact-animation cache/retrigger defect; the manifest was regenerated and the preview cache now retains/cancels one animation set per recorded contact.

Packaging verification gunzipped and JSON-parsed all three full archives. R1: 43,272,640 raw bytes / 2,042,555 compressed; R2 screen: 57,600,627 / 2,504,470; 20-seed validation: 189,404,333 / 8,297,590. The validation raw and gzip SHA-256 values match `drama-study-02/README.md`; its 4,320 attempts are total, 1,440 per arm, not 4,320 per arm. The selected risk-only Sprint criterion remains the within-arm 720-pair comparison (71 improved, 60 worsened, 589 tied); its 13-improved/124-worsened cross-arm comparison is not that criterion. The candidate is selected only for isolated visual review, not production adoption.

Validation run in this follow-up:

- `node scripts/dev/plan-status.js check plan-23` — `RUNNABLE`.
- `node --check` on the preview controller and browser-check script — passed.
- `node reports/development/plan-23-production-race-integration/drama-preview-01/browser-check.mjs` — passed, 72 parity witnesses.
- Authorized isolated browser interactions at 1280×720 and 390×844 — passed as recorded in `drama-preview-01/evidence/browser-observations.md`; the browser slot was released to QP Orch after evidence capture. The existing local server was not started/stopped by this thread.
- Gzip integrity and JSON parse checks — passed for the R1 screen, R2 screen, and 20-seed full validation.

No production build, general suite, production browser turn, save/migration/Receipt test, or reward-idempotency test was run or claimed. The report/candidate is ready for QP Orch review. Exact production/test path ownership and lifecycle acceptance, owner adoption of the global affine calibration, production payload budget/round-trip validation, Plan 22 rest composition, and the later production browser turn remain open.

**Advisor consultation:** Branch C — orchestrator-gate-only. No additional advisor was requested for this report-only study/preview repair; QP Orch directed that no reviewer be added here. The allowed Sol-low review budget for a later main production artifact remains unused.

The scoped proposal, study and preview artifacts are committed as `3299d27`. This progress update is committed separately as the final Plan 23 write. No push or packet-status change was made.
