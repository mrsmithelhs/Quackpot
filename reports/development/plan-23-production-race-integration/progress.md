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
