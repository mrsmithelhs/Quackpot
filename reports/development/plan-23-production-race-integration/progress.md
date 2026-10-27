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

## Camera zoom owner-feedback repair (2026-10-27)

QP Orch’s bounded preview-only repair found that the camera renderer was active, but the individual-race preview selected **Locked wide** by default. The preview now defaults to **Eased close mid-race, then wide**, keeps **Locked wide** as an explicit alternative, and describes the static/reduced-motion behavior. A report-only `data-resolution-fingerprint` is stamped when each committed resolution is created so presentation checks can confirm that pause/seek/restart/display changes keep the same mechanical result.

The authorized 1280×720 isolated IAB check observed camera scale 1.0000 at the start and tick 67, 1.0988 at tick 167, 1.1589 at tick 180, and 1.1600 near tick 208; this shows intermediate eased motion. Pause held the tick-167 matrix unchanged for 500 ms. Seeking to tick 163 showed scale 1.0708; seeking to tick 38 returned to wide. Restart reset to identity, Skip to finish returned to identity, reduced/static stayed wide at 38% and the 50/75/100% checkpoints, and explicit Locked wide stayed at identity at tick 205.8. The diagnostic fingerprint `296539:9b0cce44` and result summary (`21.62s + 2.00s highlight`) remained unchanged. The isolated tab captured zero console errors/warnings and was closed to release the browser slot; owner Chrome and the existing local server were untouched.

`node --check` on the modified preview controller and `git diff --check` passed. No production source, race model, constants, mechanics, packet status, or reward/save/Receipt lifecycle were changed or newly validated. The preview repair and evidence are committed as `21ffa84`; this progress entry will be committed separately as the final Plan 23 write. No push was performed.

## Individual crossing order and finish presentation (2026-10-27)

QP Orch authorized a report-only resolver and preview extension under `drama-preview-01/`. The new `plan23-individual-crossing-v1` keeps the selected weave/contact mechanics and original winner trajectory, then continues only active entrants to their genuine finish-line crossings. It records unrounded crossing time/fraction and per-entrant course state; strict numeric time orders entrants, with codepoint ID used only for exact equality. Rewards are assigned only after every entrant crosses. The separate completion watchdog preserves factual crossings but withholds placed finishes and payouts for unresolved races. At crossing ticks, the shared endpoint dispatcher resolves walls and then contact once for survivors only. No Plan 13 source or production file was changed, and production must not import preview/report artifacts.

The new selected preview mode reports the actual crossing order, coasts each duck visually for one second after its crossing, and starts the one-second podium descent and separate track-light dim at the final crossing. Labels and awards remain legible above the lighting layer. Pause freezes race and reveal animation; resume continues; skip and reduced/static checkpoints settle the presentation; replay and seeking clear the reveal state. This presentation timing is separate from simulated finish time.

Final frozen validation after the endpoint-dispatch factoring change: six focused resolver tests passed; 1,440/1,440 selected-arm cases matched `plan23-first-crossing-causal-parity-v1`, with zero mismatches and zero unresolved races. First-winner time remained p50 21.250s, p95 22.165s, max 22.448s (0/1,440 strictly over 23s). Last-finisher time was p50 22.454s, p95 23.427s, max 24.736s; 131/1,440 (9.10%) last crossings were strictly over 23s. Estimated full playback including the two-second highlight and overlapping one-second coast/podium was p50 25.50s, p95 26.45s, max 27.75s. The validated timing criterion is the preserved first-winner crossing; last crossing and playback remain separately reported. This distinction matters if “race duration” is interpreted to mean every duck has crossed: the current selected model does not meet a <=5% over-23s limit on last-finisher time. No silent calibration change was made.

Across the frozen matrix, 718 lower-place assignments and 528 payouts changed versus same-instant classification; there were no exact ties, 115 races with adjacent crossings under 5ms, and no watchdog cases. The frozen matrix had no natural wall/contact record on the crossing tick among its 720 checked rows, so the endpoint survivor behavior is covered by a direct dispatcher boundary test rather than a naturally occurring fixture.

The isolated 1280×720 IAB check and interaction evidence are recorded in `drama-preview-01/evidence/browser-observations.md`: actual crossing order/payouts, skip-to-settled presentation, pause stability over 500ms, resume completion, reduced-motion checkpoints, and zero console warnings/errors. The browser slot was released; owner Chrome and the existing Vite server were untouched.

Validation in this follow-up:

- `node scripts/dev/plan-status.js check plan-23` — `RUNNABLE`.
- `node --check` on the preview controller, resolver, and validation runner — passed.
- `node --test reports/development/plan-23-production-race-integration/drama-preview-01/individual-finish-model.test.mjs` — 6/6 passed.
- Final frozen validation artifact — 1,440 attempts, 1,440 first-crossing parity matches, zero mismatches/unresolved.
- `git diff --check` — passed.

No production build, full project suite, save/reload or migration test, Receipt test, reward-idempotency test, or production browser test was run or claimed. Production lifecycle resolution-once behavior, versioned save compatibility, idempotent rewards, append-only mechanical/display evidence, focused race view, commentary, Plan 22 effective-speed/rest composition, and production file ownership remain for QP Orch's separately authorized implementation gate. The selected model's last-finisher late fraction above is an explicit calibration interpretation point for that gate.

## Production integration delivery — 2026-10-27

**Status:** The owner-adopted DECISION-023/024 production target is implemented in the approved source set and ready for Root orchestration review. This report does not set Plan 23 status or claim owner closure. Owner rendered acceptance remains open. No push or deployment was performed.

This delivery section supersedes earlier historical snapshots in this file that described production integration as not yet implemented or the main-artifact reviewer budget as unused; those statements recorded the state at their earlier dates.

### What is implemented

- Added the pure, versioned production race resolver and port-parity driver/artifact. The production resolver imports no report artifact. `GameEngine.runRace()` validates the owned roster selection, stance and explicit trial choice; prepares effective speed with `restFactor: 1` for later Plan 22 composition; resolves/serializes before mutation; and returns a prior keyed attempt on duplicate calls. Successful commit logs immutable finish order/results once, consumes an explicitly selected Plan 17 trial once and pays existing placements once. A guarded unresolved attempt retains factual crossing/guard evidence without place, reward, trial consumption or rest completion.
- Added schema-v2 race resolution persistence with summary-only v1 migration, lossless bounded resolution encoding, corrupt-save fallback, and semantic cross-checks. Finished and unresolved cached attempts now reconcile identity/status/digest/order/times/places/payouts/trial/evidence against both append-only payload and decoded canonical resolution. `raceResults` cached fields also reconcile. Added the state-only identity/place/payout/fabricated-order regression and a same-length changed-order regression after Root reproduced the gap.
- Added focused race playback, event seeking/checkpoints, selected rig motion and teardown controllers; the shared camera; accepted duck orientation/labels/event glow; genuine individual crossings, per-duck coast, last-cross podium and whole-scene dimming; accurate player podium identity/payout; plain narration; Receipt evidence projection; and narrow source wiring. Pause preserves existing podium loop phase. Continue stays disabled until the final coast/podium settles; Skip is the explicit early-settlement action. Resolver event names now map to the expected wall-recovery/leader-slowdown language.
- Refreshed the implementation proposal to reflect the superseding owner presentation decisions. Added reproducible production parity data and `production-browser-observations.md` in the Plan 23 evidence folder. Browser screenshots were captured in the coordinated CUA sessions but were not materialized as local PNG files; the observation artifact carries the recorded measurements.

### Validation evidence

- `node reports/development/plan-23-production-race-integration/production-parity.mjs` — 1,440/1,440 frozen selected cases matched the accepted first-cross causal projection; zero mismatches. 613,391 sampled interpolation frames through the original prefix matched within 1e-8. This validates named inputs and the first-cross prefix, not the distribution of unseen production seeds.
- The accepted timing metric remains the **winner crossing**: n=1,440, p50 21.249505 s, p95 22.165199 s, max 22.448141 s, 0/1,440 strictly over 23 s. Last crossing is reported separately: p50 22.454363 s, p95 23.427473 s, max 24.736054 s, 131/1,440 (9.10%) strictly over 23 s. Playback including the two-second highlight and one-second reveal is separately estimated at p50 25.50 s, p95 26.45 s, max 27.75 s. Per DECISION-019, the <=5% late criterion applies to the winner crossing; no silent retuning was made to lower the last-finisher tail.
- Two-race concrete save-size fixture: R01 153,939 bytes, R02 151,719 bytes, both resolutions 305,658 bytes, complete envelope 318,876 bytes. The two-resolution value is under the provisional combined 1 MiB budget. `npm test` also exercises v1 migration/static-summary behavior, lossless round trip, corruption, unresolved guard handling, resolve-once/reload, reward/trial idempotency, and receipt separation.
- Final `npm test` — passed, 168/168 tests. Final `npm run build` — passed. `node scripts/dev/plan-status.js check plan-23` — `RUNNABLE`. Final `git diff --check` — passed (Git emitted expected LF-to-CRLF working-copy notices).
- Coordinated production IAB checks used 1280×720 and 390×844 on the local production route. Active runner transforms and course position changed during normal playback; exact full-scene filter was brightness(.43)/saturate(.75) during both highlight and reveal. Narrow header kept event title left/event right; document width was 375 px within a 390 px viewport. The final natural finish and Skip path both correctly gated Continue; event seeking displayed actual leader slowdown and wall recovery copy. Player place/banner, 2/1/3 podium, Gem values, pause/resume freeze, no false rival award and zero browser console warnings/errors were observed. Event/contact highlighting and checkpoint/event seeks were observed in earlier coordinated turns.
- Reduced-motion behavior, static result equivalence, no-frame scheduling and retained pause state across controller recreation were verified in focused tests. Reduced-motion was not separately forced in the final browser session because that would have changed a system preference.
- `rg` found no production references to Plan 23 report modules. Production browser source remained the actual application route; no report preview was imported.
- `npm run test:smoke` — attempted twice after all coordinated IAB turns were closed. Its pretest Vite build passed and Vite Preview started, but the dedicated Chrome process exited with Windows code 2147483651 (`0x80000003`) before CDP connected or page assertions began. Both runs cleaned the dedicated test profile. This is recorded as a smoke-browser launch limitation; no assertion pass is claimed and the harness was not weakened. The isolated production IAB evidence above is independent of this harness failure.

### Main-artifact reviewer consultation and disposition

One allowed read-only main-artifact reviewer consultation ran before delivery. Requested model/effort was `gpt-6-sol` / `low` through the explicit agent launch override. The reviewer reported that its runtime did not expose its actual model or effort, so the observed identity cannot be independently confirmed; no second advisor was launched. Effective posture was instruction-read-only with post-hoc workspace verification. A post-consultation status inspection found no reviewer edits; Root-owned `reports/orchestration/plan-23-production-review-02.md` remains untouched and excluded from all commits. Root's independent Luna-high review remains a separate orchestration control.

| Finding | Independent check and disposition | Change |
|---|---|---|
| Continue was enabled before individual coast and podium settlement. | Accepted. Verified live before/after state; the Continue control is disabled until `settled()`, while Skip remains an explicit path to settle. Focused controller test and actual production natural-finish/replay/skip witnesses passed. | Fixed in the race view/playback boundary. |
| Wall-impact and leader-wobble event names fell through to generic commentary. | Accepted. Compared playback formatter branches to emitted resolver event types; focused event-seek test and production-seed wall/leader event seeks now show specific copy. | Fixed aliases while retaining old labels for compatibility. |
| No additional concrete engine/storage issue found by the advisor. | No new claim; Root's separate cache/log consistency reproduction was independently confirmed and repaired before this consultation. | See semantic validation regression above. |

### Files and commits

Production/test/proposal/parity/browser-observation work was committed in `2609032` (`Integrate Plan 23 production race`). This report is committed separately as the final scoped write. Root-owned `reports/orchestration/plan-23-production-review-02.md` is deliberately uncommitted by this implementer. Other approved paths are listed in commit `2609032`.

### Remaining gates and limitations

- Root must complete the integrated artifact review and disposition any new findings. Owner rendered acceptance of the production result remains required; neither review is inferred from the preview decision or this report.
- The isolated Playwright-style smoke harness remains blocked before page setup by its dedicated Chrome launch failure. Reduced-motion static parity is test-verified but was not separately rendered in the final browser turn. IAB screenshots are conversation captures, not local image files.
- The 1,440-case frozen audit is parity evidence for its named fixture set; it is not a population claim. Last-finisher p95 and late fraction exceed the winner-crossing criterion but that is the accepted metric split, not a hidden retune request. Plan 22 rest remains unimplemented here; the explicit effective-speed input is ready for later composition.

**Ready for Root review:** yes. **Owner closure:** pending. **Packet status:** unchanged by this implementer.

**Advisor consultation:** Branch C — orchestrator-gate-only, following QP Orch's direction not to add another reviewer to this report-only continuation. The allowed Sol-low review budget for the later production artifact remains unused.

The scoped resolver, focused tests, frozen validation artifact, preview, and browser evidence are committed separately from this progress report. This progress entry is the final Plan 23 write. No packet status was changed and no push was performed.

## Resolver/presentation boundary repair — 2026-10-27

QP Orch requested a bounded repair after review of the individual-crossing preview. The selected mode is now the preview default and the prior same-instant classification remains an explicit historical comparison. Presentation timing moved into pure `presentation-timing.mjs`: the two-second highlight remains anchored to the middle of the original first-cross segment; camera progress is based on tick / first-cross tick; and reveal/coast trigger logic uses elapsed milliseconds consistently. A completed static/skip render settles final coast progress before drawing runners and podium.

The resolver now rolls back an entire crossing tick if the mechanical event cap aborts it, including entrant/trajectory state and crossing evidence. Transactional endpoint dispatch restores survivor states if resolution throws. The terminal trajectory frame preserves the actual interpolation prefix rather than replacing later entrants with their future crossing witnesses. Focused coverage now checks caps 26 and 28, endpoint callback rollback, crossing-event consistency, and all returned trajectory states through the historical prefix. The regenerated 1,440-case artifact reports zero causal first-cross mismatches and zero returned-trajectory-prefix mismatches across 613,391 sampled frames (1e-8 tolerance).

The authorized resumed browser check used the isolated preview at a 1525 × 814 visible window. It reached every reduced/static checkpoint through 100%; the final state reported all six genuine crossings and showed the settled podium. Earlier during this resumed browser turn, playback showed no podium before the last crossing and Skip presented the settled result. The animated reveal was not paused or sampled at an intermediate frame in this turn; event seeking/restart, 1280 × 720 layout and current-turn console diagnostics were also not revalidated. Earlier browser evidence remains in the preceding sections. The isolated preview tab was closed after evidence capture; the existing server was left running.

Validation for this repair:

- `node --test reports/development/plan-23-production-race-integration/drama-preview-01/individual-finish-model.test.mjs reports/development/plan-23-production-race-integration/drama-preview-01/presentation-timing.test.mjs` — 12/12 passed.
- `node --check` on the preview controller, resolver, timing module and validation runner — passed.
- `node reports/development/plan-23-production-race-integration/drama-preview-01/individual-finish-validation.mjs` — regenerated 1,440-case artifact; first-cross and returned-prefix parity both 0 mismatches.
- `node scripts/dev/plan-status.js check plan-23` — `RUNNABLE`.
- `git diff --check` — passed.

No production source, production build, full project suite, save/migration/Receipt path, reward idempotency, or packet status was changed or validated. Production work remains behind QP Orch's handoff and ownership gates. **Advisor consultation:** Branch C — orchestrator-gate-only, following QP Orch's explicit direction not to add another reviewer. The allowed Sol-low review budget for a later main production artifact remains unused.

The scoped repair and evidence commit precedes this progress update; this progress update is the final Plan 23 write. No push was performed.

## Completed-race event-seek repair — 2026-10-27

QP Orch's review found that selecting a committed event after full playback hid the podium but left the transient playback state `finished`, disabling Resume despite the event view saying playback could continue. The report-only controller now resets cursor presentation state on every `pauseAtTick`: playback becomes resumable, reveal/coast returns to zero, and the podium/lighting layer is canceled and hidden. The already-committed resolution, crossing order, and payouts remain untouched. The state transition lives in the pure `playbackStateAtSeek()` helper and has focused regression coverage.

Authorized isolated-browser verification selected Rival E's 22.49 s crossing after natural completion, confirmed the hidden podium and enabled Resume, resumed through the final crossing, paused after the reveal started at tick 454, and resumed to the same completed result. Restart returned to tick 0 on the same committed race; Skip settled the podium without rerunning mechanics/RNG; reduced/static mode reached 25/50/75/100% and settled the result at 100%. The podium remained readable during the paused reveal. The dedicated tab was closed after the checks.

Validation for this UI-only repair:

- Focused resolver and presentation tests — 13/13 passed.
- `node --check` on the preview controller and timing module — passed.
- `git diff --check` — passed.
- `node scripts/dev/plan-status.js check plan-23` — `RUNNABLE`.
- The frozen 1,440-case numeric audit was not rerun because this repair changes only report-preview playback state; the previously committed model audit remains unchanged.

No production source, resolver mechanics, numerical constants, production build, full suite, save/migration/Receipt path, reward idempotency, packet status, or push was changed. Advisor consultation remains Branch C — orchestrator-gate-only under QP Orch's no-additional-review direction. The repair and evidence are committed in a scoped repair commit; this progress entry is committed separately as the final Plan 23 write.

## Owner podium-scale and track-dimming refinement — 2026-10-27

Following QP Orch’s visual review, the report-only preview enlarges podium ducks, platforms, and name cards; widens the name area to support wrapping; and moves the platform arrangement lower while retaining the finish line and every finisher above the result. A separate even-odd SVG mask now dims only the oval race surface to 52% opacity. The reveal trigger, one-second coast/podium overlap, committed order, result, and mechanics are unchanged. Static/skip presentation uses the settled layer value and adds no animated dimming.

QP Orch authorized an isolated browser slot for 1280×720 desktop and 390×844 narrow viewport checks. Desktop cards rendered 195.5px wide; labels rendered 195.5×97.7px, with about 17px effective text after SVG scaling. All finishers remained visible above the podium, and displayed names and payouts fit. At 390px width, the 300.8px-wide race SVG scales labels to 84.2×42.1px with about 8px effective text; the actual labels did not overflow, but this is a narrow-screen readability limitation. The track blend is approximately `#1c4754` from `#327987` beneath `#071925` at 52%; the pond, finish line, racers, and podium remain undimmed. The authorized 1280×720 screenshot and computed layout/style readings were observed; the viewport override was reset and the isolated tab closed to release the slot. Details are in `drama-preview-01/evidence/browser-observations.md`.

Validation for this presentation-only owner refinement:

- `node scripts/dev/plan-status.js check plan-23` — `RUNNABLE`.
- `node --check reports/development/plan-23-production-race-integration/drama-preview-01/preview-controller.mjs` — passed.
- `git diff --check` — passed.
- Authorized browser inspection — 1280×720 and 390×844; no captured console errors or warnings; isolated tab closed and viewport reset.
- The frozen 1,440-case numerical audit, focused model tests, production source, save/reload, Receipt, reward idempotency, reduced-motion interaction, and production flows were not rerun or newly validated. This turn changed only report-preview presentation and evidence.

No packet status was changed and no push was performed. The scoped preview change is committed separately from this progress update; this progress entry is the final Plan 23 write.

## Owner whole-environment lighting and podium loops — 2026-10-27

QP Orch approved a bounded report-preview follow-up. The selected slow-motion drama treatment now filters the whole environment group with the same `brightness(.43) saturate(.75)` used by the existing event highlight; the pond, shore, and track dim together, while finish-line markings, race ducks, and the podium remain outside the filter. The reveal animates that filter over its existing one-second interval; pause holds it, resume continues it, and settled Skip/reduced results use a stable target treatment without an entrance transition. The former oval-only lighting overlay was removed, so the result effect is not compounded.

Podium ducks reuse the accepted Plan 20 digital rig and motion controller with unique per-result/per-duck prefixes. First place uses graceful bob; second and third use paddling. Their controller is separate from race-runner motion. The main Race Pause suspends podium loops during reveal without losing animation phase. After the race finishes, a named **Pause podium motion / Resume podium motion** control pauses or resumes only those ambient loops; the finished state stays complete. Normal Skip skips the podium entrance but still starts the loops. Presentation evidence separately records entrance-skipped and ambient-motion state. Static/reduced mode creates no loop controller and shows the same settled result. Seek, restart, and scenario resolution destroy the loop controller and clear reveal styling; repeated show paths retain one controller.

The authorized 1280×720 IAB check observed the target environment filter and bright foreground, active three-duck loops, and one internal controller toggle. During reveal at elapsed 24.9/25.67s, the regular Pause held podium transforms and the computed dim filter unchanged for 550ms. Resume advanced both; natural completion showed **Pause podium motion**, and the loops continued while race status stayed complete. The named control itself held sampled duck transforms unchanged for 550ms and resumed them. Normal Skip showed loops without entrance motion; pausing the loops then pressing Skip again preserved the paused choice. Reduced mode held neutral transforms, scenario/restart cleared the podium controller, and seeking after finish hid the podium/filter and restored resumable playback at the selected event. Console warnings/errors were absent. The isolated tab was closed and viewport reset to release the authorized slot.

Validation for this presentation-only continuation:

- `node --test src/ui/duck-motion-controller.test.mjs` — 8/8 passed for the reused controller’s pause/resume, reduced, visibility/offscreen, and teardown behavior.
- `node --check reports/development/plan-23-production-race-integration/drama-preview-01/preview-controller.mjs` — passed.
- `git diff --check` — passed.
- `node scripts/dev/plan-status.js check plan-23` — `RUNNABLE`.
- Frozen 1,440-case audit was not rerun. No production source, model mechanics, numerical values, save/Receipt/reward path, packet status, or push changed.

**Advisor consultation:** Branch C — orchestrator-gate-only, following QP Orch’s direction not to add another reviewer to this report-preview continuation. No packet status was set and no push was performed. The preview/evidence change is committed separately; this progress entry is the final Plan 23 write.

## Production ownership and lifecycle proposal refresh — 2026-10-27

QP Orch relayed the owner’s DECISION-023 adoption of the tested `R2combined-risk-only`/affine candidate and latest presentation, authorizing Plan23 implementation under orchestration. I refreshed `proposal.md` against the current packet, source map, decisions, Plan13/20/22 boundaries, current engine/storage/log/Receipt/race view/main, accepted rig/controller, and preview manifest/validation artifacts. `node scripts/dev/plan-status.js check plan-23` reports `RUNNABLE`.

The refresh names a bounded proposed source/test write set and the resolve-once, keyed-seed, schema-v2 migration, legacy static-result, idempotent trial/reward, Receipt evidence, focused playback, motion-cleanup, and browser-validation boundaries. Two current report-preview cases measured 621,611–629,251 bytes full JSON and 90,703–92,614 bytes with a proposed integer trajectory projection; theoretical caps still require round-trip and maximum-cap measurement. The refreshed proposal surfaces one unresolved guard policy for QP Orch: whether a committed unresolved race consumes an already-purchased Plan17 trial and how existing progression handles it. Current `runRace()` does not implement the accepted Plan17 trial or the new resolver; `race_choice_offered` is presently appended after player commit, so production must record actual pre-choice display separately.

No production source, tests, build, or browser work was performed. `git diff --check` initially caught trailing spaces in the new proposal header; those were removed. The proposal and this handoff are returned to QP Orch for source/lifecycle review before any production write. No packet status was set and no push was performed.

## Production presentation closure repair — 2026-10-27

QP Orch authorized a bounded production-presentation repair after integrated review. Normal race playback now completes on its own: the success heading and Skip control are removed, and Continue remains unavailable until all finishers coast and the podium settles. Rewinding clears unsettled result text, podium cards/banner, and unearned crossing-place labels from the live view while leaving committed results and append-only evidence intact. The future timeline uses generic upcoming labels; reached items receive event-specific descriptions, aligned with the playback clock. The course-time readout shares one row with concise commentary. Runner orientation, upright/staggered labels, finish overlay, whole-stage dim layer, highlight/reveal easing, and role/contact motion were refined without changing race positions or mechanics.

Recorded contacts now animate the accepted rig’s wrapper, head/wing groups, and paper layers for a one-shot recovery. Pause/resume, seek, replay, reduce-motion, visibility, role changes, and teardown cancel or hold those effects without leaving stale loops. Initial and rewound rank samples assign the sampled leader roles immediately. Participant glow uses an eased 2.2-second presentation envelope. The production smoke journey now waits for natural completion and explicitly rejects a Skip control.

### Validation and rendered evidence

- `npm test` — 170/170 passed after the final source edits. This includes motion cleanup, readable impact pose/replay reset, paused seek, reduced-motion static result, role rewind, commentary aliasing, and playback completion checks.
- `npm run build` — passed after the final source edits.
- `node scripts/dev/plan-status.js check plan-23` — `RUNNABLE`; packet status was not modified. `git diff --check` — passed (only expected LF-to-CRLF working-copy notices).
- In the authorized isolated production IAB at 1280×720, computed transforms across approximately 1.31 playback seconds showed a distinct graceful-bob trajectory for the player leader and paddling trajectory for Rival B; the sampled wing swing reached about 24° for the paddler versus about 4° for the leader. For recorded B/C contact, the 2.50s seek showed their impact pose and paper-layer offsets. After resume, sampled head/wing transforms eased from about 10°/12° at 2.72s to identity by 2.93s; temporary transforms were absent by 3.25s. These are temporal computed-style measurements. The captured contact crop was a static checkpoint and does not itself establish animation over time. Earlier authorized browser observations in this report cover pause/replay, crossing disclosure, result/podium, dimming, responsive width, and browser diagnostics. The isolated IAB was closed; the owner Chrome tab and server were untouched.
- One approved read-only main-artifact review ran. Requested settings were `gpt-6-sol` / `low`; observed model/effort were unavailable in the runtime. The Continue-before-settlement and fallback-commentary findings were accepted and repaired. The reviewer found no further concrete engine/storage issue. The separate repair-review agent’s contact cleanup and lifecycle concerns were also addressed with focused tests and rendered contact recovery evidence. No further reviewer was launched.
- `npm run test:smoke` was not retried in this continuation. The earlier approved attempt built and started preview, but dedicated Chrome exited with code `2147483651` before CDP/page setup; no smoke assertion pass is claimed. Reduced-motion behavior is covered by focused tests and static checkpoints; browser preference emulation was unavailable in the authorized isolated browser.

**Remaining closure gates:** QP Orch must complete integrated review and disposition any findings; the owner must accept the rendered production result. The smoke-browser process-start limitation remains documented. The timing acceptance is still the winner crossing criterion from DECISION-019; last crossing and full playback are reported separately above. Plan 22 rest integration remains future work through the existing effective-speed input.

No packet status was set and no push was performed. The source/test/smoke-script repair is committed separately; this entry is the final scoped report write.
