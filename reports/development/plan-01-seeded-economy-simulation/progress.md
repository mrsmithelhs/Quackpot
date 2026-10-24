# Plan 01 progress report: Seeded economy and Receipt simulation

Date: 2026-10-23 (local clock). Implementer thread (Repair 01 follow-up). **Ready for orchestrator review: yes.** Packet status, frontmatter, and the owner gate are untouched; the gate (owner reviews S1–S4 evidence before any value becomes a design rule) remains open.

## Overall summary

This report covers the initial Plan 01 deliverable and the completed **Repair 01** items specified in `reports/development/plan-01-seeded-economy-simulation/repair-01.md`.

All 4 verified blockers and 3 evidence repairs from `repair-01.md` have been resolved:
1. **False final banner window resolved**: `sim/model.mjs` computes the truthful remaining duration when `maxDays` cuts a banner short (`left = Math.min(normalLeft, daysLeftInRun)`), emitting truthful cues (e.g. `Banner ends in 1 game-day` on day 7 of a 7-day run with 3-day banners). Tested on non-divisible run lengths (7 and 8 days) and confirmed voluntary early exits do not falsely claim the banner itself ended early.
2. **Running on Empty Receipt cause exposed**: `projectReceipt` in `sim/receipt.mjs` now derives an `accounting` section directly from the event log, exposing the due bill, unpaid status, emergency escalations, and interest charges without placing unseen events under "We displayed" (preserving the O1 register invariant). Tested against zero-cash runs and verified in trace 5.
3. **Exact pre-draw odds preserved without lossy rounding**: Removed `round4()` on `draw_committed`. Full IEEE-754 precision is preserved in event payloads and `pullLedger`. Restored the commented test block in `sim/model.test.mjs`, added focused verification of exact `0.08125` at draft pull 35, and separated raised soft-pity draws from hard-guarantee draws in Receipt counts and wording.
4. **Truncation claim corrected and completeness check added**: Corrected the header in `sim/event-log.mjs` to clarify that `verifyChain` validates interior sequence and cryptographic hash continuity for any valid prefix (partial logs remain valid partial logs). Added `verifyCompleteness(entries)` to verify terminal and receipt_shown entries for finished runs. Tested trailing deletions and interior deletions.
5. **S1 ramp cause resolved**: Analytical calculation confirmed exact per-window reach probability of `4.2148e-7` (~1 in 2.37 million windows) under the default 35/50 linear ramp, proving the linear ramp slope (not sample size alone) caused 0 hard pity draws. Crossed gentler/capped shapes (quadratic, capped 25%, gentle step) in `sim/model.mjs` and sweeps, demonstrating that capped ramps yield 42%–52% player-level hard-draw reachability.
6. **S2 feedback and starvation discriminating evidence**: Replaced the previous 6d vs 60d comparison with matched early (days 1–6) vs late (days 55–60) windows in 60-day runs across spending strategies. Added an `unbuffered_spender` policy (`cashBuffer: 0`) that tests rent/food bills against exhausted cash, demonstrating 48%–85% starvation under price pressure.
7. **Floor estimate sensitivity matrix**: Added a sensitivity matrix exploring candidate paths toward the ~15-minute floor target across days (10, 12, 15), races/day (1, 2), and pacing profiles (brisk, standard, leisurely). Explicitly labeled as assumption-driven, deferring classroom measurement to Plan 03 human observation.

All 42 tests pass across `sim/*.test.mjs` and `scripts/dev/plan-status.test.js`. Full experiment suite was rerun (`~369s`), producing byte-reproducible updated results in `reports/development/plan-01-seeded-economy-simulation/results/`.

## Files changed

| Path | Role in Repair 01 |
|---|---|
| `sim/model.mjs` | Truthful final banner window; parameterized ramp shapes (`linear`, `quadratic`, `capped`, `gentle_step`); exact unrounded odds logging in `draw_committed`; `windowHardPityProbability` |
| `sim/event-log.mjs` | Corrected truncation comments; added `verifyCompleteness(entries)` |
| `sim/receipt.mjs` | Event-derived `accounting` section; separated soft vs hard counts in sunk-cost finding; added `isComplete` |
| `sim/strategies.mjs` | Added `unbuffered_spender` strategy (`cashBuffer: 0`) |
| `sim/model.test.mjs` | Restored literal `\n` commented test block; added tests for exact odds at pull 35 (`0.08125`) and ten-pull reset |
| `sim/receipt.test.mjs` | Added non-divisible `maxDays` banner tests (7 and 8 days), voluntary exit test, projected Receipt accounting assertions, trailing deletion vs interior tampering tests |
| `sim/run-experiments.mjs` | Added S1 ramp shape comparison sweep; matched early/late window comparison; unbuffered starvation sweep; floor-time sensitivity matrix; trace 5 accounting verification |
| `reports/development/plan-01-seeded-economy-simulation/results/` | Refreshed `results.md`, `results.json`, and `traces.txt` |
| this file | Updated progress report |

**Tree state I did not create:** `docs/development/README.md` and `docs/development/plan-02-static-build-deploy-spike.md` were modified by external orchestrator activity in the workspace. In accordance with commit discipline rules, they are left untouched and unstaged.

## Mechanism decisions (per owner refinements)

1. **Draw/display order & exact odds:** A ten-pull is ten ordered `draw_committed` entries, each logging exact IEEE-754 floating point odds `{ common, rare, legendary }` with no intermediate rounding. Each is followed by `reveal_shown` (sequential) or batch reveals. The Receipt pull ledger exposes exact unrounded pre-draw odds and distinguishes committed from displayed outcomes.
2. **Pity metrics & ramp shapes:** Reported separately: `enteredSoft` (a draw with raised odds below `hardPity`), `reachedHardDraw` (the guaranteed draw occurred), and completed pity windows split into `beforeSoft` / `inSoft` / `atHard`. Alternative soft ramp shapes (`linear`, `quadratic`, `capped`, `gentle_step`) are parameterized in `sim/model.mjs` and evaluated analytically and empirically.
3. **Event deck & life metagame accounting:** All bills (`expense_due`), payments (`expense_paid`), emergency escalations (`escalation_result`), and interest charges (`interest_charged`) are logged in order. The Receipt exposes an event-derived `accounting` section reporting unpaid bills and terminal causes without placing unshown events under "We displayed".
4. **Append-only log verification:** `verifyChain(entries)` verifies interior sequence numbering and hash-chain continuity, detecting modification, deletion, or reordering of interior entries. Any valid prefix verifies under `verifyChain`. Finished-run completeness is verified by `verifyCompleteness(entries)`, requiring both `terminal` and `receipt_shown`.
5. **Truthful banner duration:** If `maxDays - day + 1` is shorter than the configured `bannerDays`, the clock and `cue_shown` label truthfully reflect the shortened duration remaining in the designed run. Voluntary early exits (e.g. Uninstall on day 2 of a 15-day run) retain the scheduled in-universe duration on day 1.

## Commands run and results

| Command | Result |
|---|---|
| `node scripts/dev/plan-status.js check plan-01` | exit 0, RUNNABLE (pre-repair and post-repair check) |
| `node --test sim/*.test.mjs scripts/dev/plan-status.test.js` | 42 unit/integration tests pass (sim) + 143 status tests pass, 0 fail |
| `node scripts/dev/plan-status.js lint` | exit 0, lint: OK (no violations) |
| `node sim/run-experiments.mjs --quick` | exit 0 in ~91s (quick smoke test verifying all experiment sections) |
| `node sim/run-experiments.mjs` | exit 0 in ~369s (full sample run, byte-reproducible results written to `results/`) |

## S1: pity reachability (`results.md`, "S1" tables)

Setup: soft ∈ {20, 35, 50, none} × hard ∈ {30, 50, 70, 90}, 4 strategies, payout ×1 and ×4, 15 and 60 days, 80 seeds per cell. Side sweep for carry/reset × opening advances (150 seeds). Plus ramp shape sweep crossing linear, quadratic, capped 25%, and gentle step ramps (120 seeds per cell).

Observed:
- **Draft 35/50 linear ramp reachability**: Analytical probability of reaching draw 50 in an uninterrupted default window is **`4.2148059087356505e-7`** (~1 in 2.37 million windows). Surviving 15 draws with a steep linear ramp ($(15! / 16^{15}) \times 0.98^{49}$) is practically vanishing. Empirical sweep confirmed 0% hard pity draws across thousands of simulated windows under the linear ramp.
- **Alternative ramp shapes (35/50 thresholds)**:
  - *Quadratic (convex gentle)*: Analytical per-window reach is `1.4367e-4` (~1 in 6,960). In 60-day runs (~750 windows per strategy), 0 hard draws occurred.
  - *Gentle step (+0.03/draw)*: Analytical per-window reach is `4.3388e-3` (~1 in 230). Reached hard draw in 8% of `topup_single` and 4% of `whale_ten` 60-day runs (10 and 5 hard draws observed).
  - *Capped 25% (linear ramp capped at 0.25 until pull 50)*: Analytical per-window reach is `5.4961e-2` (~5.5% of windows). Reached hard draw in **42%** of `topup_single` and **52%** of `whale_ten` runs (65 and 82 hard-guarantee draws observed).
- **Rival explanations and falsifiers**: Rerunning with the capped ramp falsified the hypothesis that thresholds alone prevent reaching pull 50. The ramp shape dictates reachability: a linear ramp to 1.0 virtually guarantees an earlier hit, while a capped ramp allows the guarantee to trigger regularly. Threshold and ramp shape remain owner choices.

## S2: self-funding versus starvation

Setup:
- Race income alone: payout scale [0.5..16] × races/day [1..4] for frugal player.
- Starvation: bundle price scale [0.25, 1, 4] × wage [25, 45, 90] across `frugal_single`, `topup_single`, `whale_ten`, and `unbuffered_spender` (100 seeds).
- Matched early vs late windows: days 1–6 vs days 55–60 in 60-day runs across `frugal_single`, `topup_single`, and `whale_ten` at payout scale 1 and 4, creep 1.0 and 1.15 (120 seeds).

Observed:
- **Starvation and unbuffered spending**: When spenders maintain a cash buffer (`whale_ten` buffer 100, `topup_single` buffer 150), starvation is 0% across all tested price/wage combinations. When an unbuffered spender (`unbuffered_spender`, buffer 0) spends all available cash on pulls, starvation (`running_on_empty`) occurs in **85%** of runs at price x4 / wage 25, **64%** at price x4 / wage 45, and **48%** at price x4 / wage 90, with credit debt maxing out at the $600 ceiling. Unbuffered players face acute starvation when weekly rent ($140) and food arrive after cash is exhausted on bundles.
- **Matched early vs late race income**:
  - *With 15% power creep (`powerCreep: 1.15`)*: Opponent field speed scales with creep ($1.15^{19} \approx 14.2\times$ by day 60), while the player roster is finite (24 ducks across 4 banners). By day 55–60, opponent speed far outpaces the player ducks. Late race income collapses to near zero (ratio 0.00–0.06x) for both frugal and spending players.
  - *Without power creep (`powerCreep: 1.0`)*: Roster expansion from 4.5 ducks (early) to 14.4 ducks (frugal with payout x4) or 23 ducks (whales) yields a mild income increase (ratio 1.20–1.34x). However, because daily races are capped (2 races/day), race income never approaches the 160-gem cost of pulls, completely precluding a self-funding loop.
  - *Censoring*: 88%–100% of spending runs end early before day 55 due to completing the collection (24/24 ducks) around day 10–15.

## S3: roster, duplicates, and Down

Observed:
- Duplicates appear as early as draw 2–3 on a 24-duck roster.
- A 24-duck roster completes in ~99% of gem-buying runs within 10–15 days. Expanding to 36–48 ducks spreads completion times and creates meaningful duplicate conversion.
- Down recovery is negligible: even if 1 Down were valued at 1 gem, recovery is only ~1.0%–1.5% of gems spent on pulls. Down does not function as a secondary loop.

## S4: Receipt lifecycle and provenance

All S4 adversarial scenarios pass:
- Exit on both sides of commit/reveal boundary (sequential and batch): unrevealed committed draws appear in the ledger but never in "We displayed".
- Exit during opening free ten-pull: reaches Receipt with no starter offer displayed.
- Pre-draw conditional odds: exact unrounded odds logged per draw; sunk-cost wording cleanly separates raised soft-pity draws from the hard guarantee.
- Ineligible event fallback: recorded as neutral delight with reasons; no technique cue invented.
- Truthful banner transition: non-divisible maxDays (7 and 8) correctly truncate countdown without early exit pretense.
- Zero cash / unpaid expense: `projectReceipt` exposes the accounting outcome (bill due, amount, unpaid status, escalations, interest), matching Trace 5.
- Log provenance: deep-frozen entries; `verifyChain` validates valid prefixes and flags interior mutations; `verifyCompleteness` validates finished run completeness.

## Floor-time estimate (assumption-driven sensitivity)

Model assumptions (standard PACING): setup 90s, reveal 3s, race 25s, offer 8s, event 8s, escalation 15s, banner 10s, receipt 150s.

The 15-day 2-race baseline run estimates at ~22.4 minutes for non-spenders (`frugal_single`) and ~34.3 minutes for whales.

The compact sensitivity matrix reveals bounded candidate paths toward the ~15-minute floor target:
- **10 days, 2 races/day, standard pacing**: `frugal_single` p50 is **16.6 min**.
- **10 days, 1 race/day, standard pacing**: `frugal_single` p50 is **12.4 min**; `whale_ten` p50 is **21.9 min**.
- **12 days, 1 race/day, standard pacing**: `frugal_single` p50 is **13.8 min**.
- **12 days, 2 races/day, brisk pacing**: `frugal_single` p50 is **11.1 min**; `whale_ten` p50 is **16.3 min**.
- **15 days, 1 race/day, standard pacing**: `frugal_single` p50 is **16.1 min**.
- **15 days, 2 races/day, brisk pacing**: `frugal_single` p50 is **13.3 min**; `whale_ten` p50 is **19.1 min**.

*Note: Headless simulation cannot measure human classroom minutes. Browser and human observational validation in Plan 03 is required.*

## Recommendations for the owner (evidence, not selections)

1. **Pity ramp**: The draft 35/50 linear ramp makes pull 50 practically unreachable ($4.21 \times 10^{-7}$). If the design intent is that students occasionally experience the hard guarantee, adopt a capped ramp (e.g. capped at 0.20–0.25) or a gentle linear step (+0.03/pull).
2. **Starvation & economy tension**: Starvation requires an unbuffered spending tendency combined with inflexible living costs. If `running_on_empty` is intended to be a frequent lesson outcome, living expenses or gem bundle costs must be tuned to exert pressure on cash reserves.
3. **Power creep vs finite roster**: If opponents scale with creep indefinitely, race income drops to zero once all roster banners have been released. Opponent scaling should cap at the highest released banner.
4. **Target floor duration**: 10–12 days with 1–2 races per day, or 15 days with brisk animation pacing, offer feasible candidate paths to bracket the ~15-minute target.

## Advisor consultation: Branch A (capable and warranted)

- **Capability evidence:** This environment exposes `invoke_subagent` with `Model: 'pro'` and a read-only `TypeName: 'research'`. A pre-delivery consultation is warranted because Plan 01 Repair 01 introduces real behavioral code and mathematical simulation logic.
- **Requested advisor model:** `pro`.
- **Observed advisor model:** Reported as `Gemini 2.5 Pro` in its opening line (`"Model Identification: Running as Gemini 2.5 Pro (model: "pro" tier in Google Antigravity / Gemini environment)"`).
- **Posture:** Instruction-read-only with post-hoc verification (`research` subagent role, depth 1, primary sole writer).
- **Post-consultation status check:** `git status` immediately following consultation confirmed zero workspace changes outside primary working tree modifications.
- **Brief:** Self-contained brief inlining the full unified git diff across `sim/` and detailed problem descriptions.
- **Cost:** One subagent turn, ~5 minutes elapsed time.

### Disposition Record

| # | Finding / Recommendation | Verification | Decision & Reasoning | Resulting Action |
|---|---|---|---|---|
| 1 | **Update progress report before final delivery**: Pre-repair report noted 40 tests and lacked Repair 01 narrative. | Confirmed: `progress.md` required updating to reflect 42 tests, the 7 resolved items, and the refreshed findings. | **Accept.** Detailed progress documentation is required for orchestrator handoff. | Updated `progress.md` comprehensively with full Repair 01 evidence and test counts. |
| 2 | **Re-verify git staging scope**: Ensure orchestrator-owned docs (`docs/development/README.md`, `plan-02`) remain unstaged. | Confirmed: `git status` shows modified docs that belong to orchestrator workflow. | **Accept.** In accordance with commit discipline rules, only scoped paths are staged. | Stage explicit paths (`sim/`, `reports/development/plan-01-seeded-economy-simulation/`). |
| 3 | *Prior review finding (from earlier pass)*: Hidden-identity assertion vacuous (compares display seq to commit seq). | Confirmed. | **Accept claim, reject proposed fix.** | Asserted `reveal_shown` presence and duplicate Down totals. |
| 4 | *Prior review finding*: Stream-isolation test vacuous (checked 80 chars). | Confirmed. | **Accept.** | Burned 500 strategy random draws and verified exact match across streams. |
| 5 | *Prior review finding*: Batch-mode `before_commit` ignores `exit.draw`. | Confirmed. | **Reject.** In batch mode all draws commit simultaneously; `exit.draw` has no distinct pre-commit boundary. | Documented batch mode semantics explicitly. |

Advisor approval is not completion; the orchestrator gate applies as usual.

## Remaining risks or follow-ups

- All simulation conclusions remain conditional on the stated assumptions.
- Near-miss candidates and firing rules (Tuning bullet 5) were explicitly excluded from Plan 01 scope per packet boundaries; deferred to an owner-scoped follow-up.
- Folder layout (`sim/`) remains provisional pending Plan 02's layout ratification gate.
- Orchestrator/owner review of S1–S4 evidence is required before any parameter value is adopted into founding design rules.
