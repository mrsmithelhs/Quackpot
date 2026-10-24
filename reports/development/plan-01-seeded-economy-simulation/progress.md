# Plan 01 progress report: Seeded economy and Receipt simulation

Date: 2026-10-24 (local clock). Implementer thread (Repair 03 follow-up). **Ready for orchestrator review: yes.** Packet status, frontmatter, and owner tuning decisions are untouched; the gate (owner reviews S1–S4 evidence before any value becomes a design rule) remains open.

## Overall summary

This report covers the initial Plan 01 deliverable, the completed **Repair 01** and **Repair 02** items, and the completed **Repair 03** items specified in `reports/development/plan-01-seeded-economy-simulation/repair-03.md`.

All 2 required repairs from `repair-03.md` have been resolved, and orchestrator report corrections are fully preserved:
1. **Require full observed race exposure in both S2 windows**: `runMatchedWindows` in `sim/run-experiments.mjs` requires the expected observed race count (`days * racesPerDay`) in both early and late windows. Runs that terminate mid-window or before all scheduled races occur on the final window day (such as `completed_collection` occurring during draws on day 12 before that day's races) are strictly excluded from full-exposure calculations, assigning `null` to `lateGpd`, `pairedDiff`, and `pairedRatio`. Discloses `fullN` (`full exposure (n/total)`) and `excludedN` in all result records and tables. Both income and roster summaries (`earlyOwned`, `lateOwned`) are computed on identical full-exposure runs. Added regression test in `sim/receipt.test.mjs` verifying exclusion of pre-race collection completions.
2. **Make structured `paid` agree with actual cash payment**: In `sim/receipt.mjs`, structured item `paid` is defined as `(status === 'paid' || status === 'partially_waived') && paidAmount > 0`. This eliminates the prior contradictory tuple (`status: 'waived', paidAmount: 0, waivedAmount: 12, paid: true`). The boolean strictly reflects non-zero cash settlement: `false` on waived food bills (e.g. skipped lunch with 0 paid), `true` on cash payments, and `false` on unpaid defaults. Added regression assertions in `sim/receipt.test.mjs`.
3. **Preserved orchestrator report corrections**:
   - `pityCarry: 'carry'` parameter name preserved.
   - Escalation defaults preserved (80-cash extra shift, couch/TV 80/120, default credit limit 600).
   - Continuation sample size: 80 seeds per case preserved.
   - Continuation tails: min/median/max 33/73/79 later paid draws in the high-payout/no-creep case (median lower-bound race-funded full-draw equivalents 70 beyond transition stock); 1/2/4 at default (median lower-bound race-funded full-draw equivalents 0).
   - Summary and narrative report the continuation measure as a lower bound on full-draw equivalents funded beyond transition gem stock.

All 47 tests pass across `sim/*.test.mjs` and 143 tests pass in `scripts/dev/plan-status.test.js`. Full experiment runner executed on the final code in ~407s, regenerating `results.md`, `results.json`, and `traces.txt`.

## Files changed

| Path | Role in Repair 03 |
|---|---|
| `sim/receipt.mjs` | Structured `paid` boolean strictly indicates actual cash payment (`paidAmount > 0`), avoiding contradiction on waived bills |
| `sim/run-experiments.mjs` | `runMatchedWindows` requires full expected race counts in both windows (`fullExposure`); computes paired income and roster summaries on full-exposure runs; discloses `fullN` and `excludedN`; exports runner helpers and guards direct execution; refreshed S2 tables |
| `sim/receipt.test.mjs` | Regression tests asserting `paid: false` on waived lunch, `true` on cash payment, and `false` on unpaid bill; regression fixture verifying exclusion of pre-race day-12 collection completion |
| `reports/development/plan-01-seeded-economy-simulation/results/` | Refreshed `results.md`, `results.json`, and `traces.txt` from full ~407s execution |
| this file | Updated progress report preserving orchestrator corrections, reflecting full-exposure numbers and Repair 03 advisor record |

**Tree state I did not create:** `docs/development/README.md` and `docs/development/plan-02-static-build-deploy-spike.md` were modified by external orchestrator activity in the workspace. In accordance with commit discipline rules, they are left untouched and unstaged.

## Mechanism decisions (per owner refinements)

1. **Draw/display order & exact odds:** A ten-pull is ten ordered `draw_committed` entries, each logging exact IEEE-754 floating point odds `{ common, rare, legendary }` with no intermediate rounding. Each is followed by `reveal_shown` (sequential) or batch reveals. The Receipt pull ledger exposes exact unrounded pre-draw odds and distinguishes committed from displayed outcomes.
2. **Pity metrics & ramp shapes:** Reported separately: `enteredSoft` (a draw with raised odds below `hardPity`), `reachedHardDraw` (the guaranteed draw occurred), and completed pity windows split into `beforeSoft` / `inSoft` / `atHard`. Alternative soft ramp shapes (`linear`, `quadratic`, `capped`, `gentle_step`) are parameterized in `sim/model.mjs`. The `capped` ramp ramps linearly from base toward $0.25$ across the soft window (`progress * (cap - base)`), then steps to $1.0$ at the guarantee.
3. **Event deck & life metagame accounting:** All bills (`expense_due`), payments (`expense_paid`), emergency escalations (`escalation_result`), and interest charges (`interest_charged`) are logged in order. The Receipt exposes an event-derived `accounting` section reporting paid cash, waived amounts (e.g. skipped lunch), and unpaid bills without placing unshown events under "We displayed". Structured `paid` is `true` if and only if actual cash was paid. Final recorded debt is derived from the latest debt-changing event in the entire log.
4. **Append-only log verification:** `verifyChain(entries)` verifies interior sequence numbering and non-cryptographic FNV-1a hash-chain continuity, detecting modification, deletion, or reordering of interior entries. Any valid prefix verifies under `verifyChain`. Finished-run completeness is verified by `verifyCompleteness(entries)`, requiring an ordered terminal/Receipt pair (`terminal` immediately followed by `receipt_shown` with matching routes) at the log boundary.
5. **Truthful banner duration:** If `maxDays - day + 1` is shorter than the configured `bannerDays`, the clock and `cue_shown` label truthfully reflect the shortened duration remaining in the designed run. Voluntary early exits (e.g. Uninstall on day 2 of a 15-day run) retain the scheduled in-universe duration on day 1.

## Assumptions I supplied (not in the design table)

Every one is a named parameter in `DEFAULT_PARAMS` (`sim/model.mjs`); keys in `DESIGN_KEYS` are the design-table values. The ones that most affect conclusions:

- **Soft-pity ramp shape**: Default legendary odds rise linearly from base ($0.02$) at pull 35 to $1.0$ at pull 50. Capped variant ramps linearly from base toward $0.25$ before the guarantee.
- **Opening pity advance**: Baseline assumes the free opening ten-pull does not advance the pity counter (`openingAdvancesPity: false`).
- **Pity carry across banners**: Pity carries across banners by default (`pityCarry: 'carry'`; reset was swept).
- **Cash economy**: Start cash $200$, wage $45$/day, food $12$/day, weekly rent $140$; bundle cash prices $0.99$–$99.99$ at 1 cash = $1 (`bundlePriceScale` sweeps this).
- **Roster release pattern**: 24 identities in a repeating common/common/rare/common/rare/legendary pattern, 6 new identities per banner; legendary is the banner-featured one with probability $0.5$.
- **Tier speeds and field creep scaling**: Own base duck speed 8, common 10, rare 14, legendary 20. Field baseline speed 14 scaling with power creep as $(powerCreep)^{bannerIndex}$, speed noise ±30%, performance noise ±15%, race payout place distribution `[30, 18, 10, 5, 2, 0]` gems, 2 races/day.
- **Down duplicate conversion**: Down per duplicate 1/5/20; best-case gem value of 1 Down is 0.02 gems.
- **Escalation ladder**: Steps 1–4 only. Baseline skipped lunch waives the 12-cash food bill and costs 15 health; an extra shift earns 80 cash and costs 15 health; couch/TV sales yield 80/120 cash. The default credit limit is 600, drawn in steps of 200 at 5%/week; the 800 limit is a diagnostic Receipt regression case. Steps 5–7 and the Influencer ending are not modeled.
- **Floor-time pacing profiles**: Setup 90s, reveal 3s, race 25s, offer 8s, event 8s, escalation 15s, banner 10s, receipt 150s for standard pacing (brisk and leisurely variants evaluated in sensitivity matrix).
- **Technique cues not modeled**: Near misses, loss aversion (streak reward), odds navigation button, Duck-Dex shelf silhouettes beyond set-progress display. The near-miss candidate eligibility and firing rule (Tuning bullet 5) was therefore **not tested**.

## Commands run and results

| Command | Result |
|---|---|
| `node scripts/dev/plan-status.js check plan-01` | exit 0, RUNNABLE (pre-repair and post-repair check) |
| `node --test sim/*.test.mjs scripts/dev/plan-status.test.js` | 47 unit/integration tests pass (sim) + 143 status tests pass, 0 fail |
| `node scripts/dev/plan-status.js lint` | exit 0, lint: OK (no violations) |
| `node sim/run-experiments.mjs --quick` | exit 0 in ~84s (quick smoke test verifying all experiment sections) |
| `node sim/run-experiments.mjs` | exit 0 in ~407s (full sample run, results written to `results/`) |

## S1: pity reachability (`results.md`, "S1" tables)

Setup: soft ∈ {20, 35, 50, none} × hard ∈ {30, 50, 70, 90}, 4 strategies, payout ×1 and ×4, 15 and 60 days, 80 seeds per cell. Side sweep for carry/reset × opening advances (150 seeds). Ramp shape sweep crossing linear, quadratic, capped 25%, and gentle step ramps (120 seeds per cell).

Observed:
- **Draft 35/50 linear ramp reachability**: Analytical probability of reaching draw 50 in an uninterrupted default window is **`4.2148059087356505e-7`** (~1 in 2.37 million windows; $(15! / 16^{15}) \times 0.98^{49}$). This vanishingly low probability explains why zero hits in our simulated sample of thousands of windows are unsurprising, without asserting deterministic causation for a sampled zero. Empirical sweep confirmed 0% hard pity draws across thousands of simulated windows under the default steep linear ramp.
- **Alternative ramp shapes (35/50 thresholds)**:
  - *Quadratic (convex gentle)*: Analytical per-window reach is `1.4367e-4` (~1 in 6,960). In 60-day runs (~750 windows per strategy), 0 hard draws occurred.
  - *Gentle step (+0.03/draw)*: Analytical per-window reach is `4.3388e-3` (~1 in 230). Reached hard draw in 8% of `topup_single` and 4% of `whale_ten` 60-day runs (10 and 5 hard draws observed).
  - *Capped 25% (linear ramp from base toward 0.25 before pull 50)*: Analytical per-window reach is `5.4961e-2` (~5.5% of windows). Reached hard draw in **42%** of `topup_single` and **52%** of `whale_ten` runs (65 and 82 hard-guarantee draws observed).
- **Rival explanations and falsifiers**: Rerunning with the capped ramp falsified the hypothesis that thresholds alone prevent reaching pull 50. The ramp shape dictates reachability: a linear ramp toward 1.0 virtually guarantees an earlier hit, while a capped ramp allows the guarantee to trigger regularly. Threshold and ramp shape remain open owner tuning choices.

## S2: self-funding versus starvation

Setup:
- Race income alone: payout scale [0.5..16] × races/day [1..4] for frugal player.
- Starvation: bundle price scale [0.25, 1, 4] × wage [25, 45, 90] across `frugal_single`, `topup_single`, `whale_ten`, and `unbuffered_spender` (100 seeds).
- Matched early vs mid window: days 1–3 vs days 10–12 across `frugal_single`, `topup_single`, and `whale_ten` at payout scale 1 and 4, creep 1.0 and 1.15 (100 seeds; full observed exposure required).
- Matched early vs late window: days 1–6 vs days 55–60 across `frugal_single`, `topup_single`, and `whale_ten` at payout scale 1 and 4, creep 1.0 and 1.15 (100 seeds; full observed exposure required; disclosing terminal censoring).
- Race-funded continuation: top-up purchases through day 6, strictly frugal policy days 7–60 (80 seeds per case).

Observed:
- **Starvation and unbuffered spending**: When spenders maintain a cash buffer (`whale_ten` buffer 100, `topup_single` buffer 150), starvation is 0% across all tested price/wage combinations. When an unbuffered spender (`unbuffered_spender`, buffer 0) spends all cash on bundles, starvation (`running_on_empty`) occurs in **85%** of runs at price x4 / wage 25, **64%** at price x4 / wage 45, and **48%** at price x4 / wage 90, with credit debt maxing out at the ceiling. Unbuffered players face acute starvation when weekly rent ($140) and food arrive after cash is exhausted on bundles.
- **Matched early vs mid race income (days 1–3 vs 10–12; full observed exposure required)**:
  - *Frugal player (100/100 full exposure, 0 excluded)*: Roster expands modestly from 4.2 to 4.5 ducks (1x payout) or 4.5 to 6.6 ducks (4x payout). With creep 1.0, income ratio is 0.65 (1x) and 0.73 (4x). With creep 1.15, opponent scaling outpaces own ducks, dropping late/early ratio to 0.06 (1x) and 0.08 (4x).
  - *Top-up player (97–99/100 full exposure, 1–3 excluded)*: Roster expands from 6.0 to ~20.5–20.9 ducks. Without creep (`creep: 1.0`), roster expansion yields a +20% to +22% income increase (ratio 1.20–1.22x; paired diff p50 +10.7 gems/day at 1x, +32 gems/day at 4x). With creep 1.15, income declines by ~27% to 30% (ratio 0.70–0.73x; paired diff p50 -13.7 gems/day at 1x, -48 gems/day at 4x).
  - *Whale player (85–89/100 full exposure, 11–15 excluded)*: 11–15 runs complete the collection before day-12 races and are excluded from full exposure. Among the 85–89 full-exposure runs, roster reaches 21.5–21.9 ducks. Without creep (`creep: 1.0`), income holds flat (ratio 0.99 at 1x, 1.01 at 4x; paired diff p50 0). With creep 1.15, income drops by ~30% to 35% (ratio 0.65 at 1x, 0.70 at 4x; paired diff p50 -18.7 gems/day at 1x, -64 gems/day at 4x).
- **Matched early vs late race income (days 1–6 vs 55–60; terminal censoring disclosed)**:
  - *Frugal player (100/100 full exposure, 0 excluded, 0% censored)*: With creep 1.0, late/early ratio is 0.89 (1x payout) and 1.35 (4x payout). With creep 1.15, race income collapses to 0.00 gems/day (ratio 0.00x).
  - *Buying players (85%–100% excluded/censored)*: Top-up runs undergo 90%–96% exclusion (only 4–10 surviving full-exposure runs of 100); ratio is 1.26–1.35 (creep 1.0) and 0.06 (creep 1.15). Whales experience 98%–100% exclusion (0 to 2 surviving runs of 100). With median completion at day 17, 60-day population comparisons cannot be drawn for buying cohorts.
- **Race-funded continuation after initial purchases (days 7–60)**:
  - Under high payouts ($4\times$) and no power creep ($1.0$), the saved 80-run cell has median later race income 11,600 gems and zero later bundle income. Later paid draws have min/median/max 33/73/79; the median lower bound on full-draw equivalents funded beyond transition stock is 70.
  - Under default creep ($1.15$) and standard payout ($1\times$), the saved cell has median later race income 152.5 gems and min/median/max later paid draws 1/2/4. The median lower bound on full-draw equivalents funded beyond transition stock is 0.
  - This demonstrates continuation under specific parameters, rather than an endless loop or default-balance result.

## Pre-race choice policies (compared, not assumed)

Five policies (`best`, `rested`, `longshot`, `random`, `alternate`) compared paired by seed, 300 seeds per scenario, across six scenarios.

- **Always racing the best duck was best or statistically tied in every scenario.**
  - *Small roster (frugal, 15d)*: `best` mean 3.02 gems/race; `rested` lost 0.29 gems/race (95% CI [-0.38, -0.21]); `best` won/tied in 76% of seeds.
  - *Large roster (whale, 15d)*: `best` mean 19.90 gems/race; `rested` lost 1.07 gems/race (95% CI [-1.21, -0.93]); `best` won/tied in 82% of seeds.
  - *Field ignores creep*: `best` mean 22.96 gems/race; `rested` lost 1.33 gems/race (95% CI [-1.44, -1.21]); `best` won/tied in 91% of seeds.
  - *No fatigue*: `best` mean 23.86 gems/race; `rested` lost 5.19 gems/race (95% CI [-5.33, -5.06]); `best` won in 100% of seeds.
  - *Strong fatigue (30%)*: `best` (18.81) and `rested` (18.84) statistically tied (difference +0.02, 95% CI [-0.01, 0.06]).
  - *Longshot ×2.5*: `best` mean 20.23 gems/race; `longshot` lost 17.53 gems/race (95% CI [-17.79, -17.27]); `best` won in 83% of seeds.
- **Hypothesis status**: "No pre-race choice is automatically correct" **failed** under these default mechanics: the choice is nearly dominated. Always racing the best duck was strictly best in 4 of 6 scenarios and tied in 2, and never worse by a significant margin. This remains a design tension for the owner: candidate remedies include stronger fatigue (≈30%), duck-specific course affinities, or visible risk/reward dimensions.

## S3: roster, duplicates, and Down

Observed:
- Duplicates appear as early as draw 2–3 on a 24-duck roster.
- **Roster completion horizons by strategy**:
  - At 15 days, 30/400 top-up runs (7.5%) complete all 24 identities (median owned 22/24); 133/400 whale runs (33.25%) complete the collection (median owned 23/24).
  - At 30 days, `topup_single` completes 56% and `whale_ten` completes 89%.
  - The ~99% completion figure is the **60-day whale** result (median completion day 17 for whale, day 27 for top-up).
- Expanding the roster to 36–48 ducks spreads completion times and creates meaningful duplicate conversion.
- Down recovery remains negligible: even if 1 Down were valued at 1 gem, recovery is only ~1.0%–1.5% of gems spent on pulls. Down does not function as an independent secondary loop.

## S4: Receipt lifecycle and provenance

All S4 adversarial scenarios pass:
- **Commit/reveal boundaries (sequential and batch)**: unrevealed committed draws appear in the ledger but never in "We displayed".
- **Opening free ten-pull exit**: reaches Receipt with no starter offer displayed.
- **Pre-draw conditional odds**: exact unrounded IEEE-754 odds logged per draw; sunk-cost wording cleanly separates raised soft-pity draws from hard guarantees.
- **Ineligible event fallback**: recorded as neutral delight with explicit reasons; no technique cue invented.
- **Truthful banner transitions**: non-divisible `maxDays` (7 and 8) correctly truncate countdown without early exit pretense.
- **Zero cash and expense accounting**: `projectReceipt` exposes original due amount, actual cash paid, waived amount (e.g. skipped lunch), and unpaid defaults without claiming skipped meals were purchased food. Structured `paid` boolean strictly reflects whether cash was paid (`false` on waived food bills, `true` on cash payment, `false` on unpaid bill).
- **Truthful final debt**: derived from the latest debt-changing event in the entire log, capturing credit draws after the final interest charge.
- **Finished-run boundary**: `verifyCompleteness` validates that `terminal` is immediately followed by `receipt_shown` with matching routes at the very end of the log.
- **Log provenance**: deep-frozen entries; `verifyChain` validates valid prefixes and flags interior mutations via non-cryptographic FNV-1a hash continuity.

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

1. **Pity ramp shape**: The draft 35/50 linear ramp makes pull 50 practically unreachable ($4.21 \times 10^{-7}$). If the design intent is that students occasionally experience the hard guarantee, adopt a capped ramp (ramping linearly toward 0.20–0.25) or a gentle linear step (+0.03/pull).
2. **Starvation & economy tension**: Starvation requires an unbuffered spending tendency combined with inflexible living costs. If `running_on_empty` is intended to be a frequent lesson outcome, living expenses or gem bundle costs must be tuned to exert pressure on cash reserves.
3. **Power creep vs finite roster**: If opponents scale with creep indefinitely, race income drops to zero once all roster banners have been released. Opponent scaling should cap at the highest released banner.
4. **Race continuation loop**: A continuation loop where race winnings fund ongoing pulls is possible under high payouts ($4\times$) and no creep, but does not emerge under default balance ($1\times$, $15\%$ creep).
5. **Pre-race choice domination**: Racing the best duck dominates under default mechanics. If meaningful pre-race decisions are desired, consider stronger fatigue ($\approx 30\%$) or duck-specific track conditions.
6. **Target floor duration**: 10–12 days with 1–2 races per day, or 15 days with brisk animation pacing, offer feasible candidate paths to bracket the ~15-minute target.

## Advisor consultation: Branch A (capable and warranted)

- **Capability evidence:** This environment exposes `invoke_subagent` with `Model: 'pro'` and a read-only `TypeName: 'research'`. A pre-delivery consultation is warranted because Plan 01 Repair 03 modifies core accounting flags and statistical window metrics.
- **Requested advisor alias:** `pro`.
- **Observed advisor model:** Reported as `Gemini 2.5 Pro (read-only review advisor tier)` in its opening line.
- **Identity & tier uncertainty:** This identity is based solely on the model's self-report. An available `pro` alias does not establish that the advisor is higher-tier than the implementer thread, and platform metadata was not independently queried.
- **Posture:** Instruction-read-only with post-hoc verification (`research` subagent role, depth 1, primary sole writer).
- **Post-consultation status check:** `git status` immediately following consultation confirmed zero workspace changes outside primary working tree modifications.
- **Brief:** Self-contained brief inlining the full unified git diff across `sim/` and detailed problem descriptions from `repair-03.md`.
- **Cost:** One subagent turn, ~3 minutes elapsed time.

### Disposition Record (Repair 03 pass)

| # | Finding / Evaluated Item | Verification | Decision & Reasoning | Resulting Action |
|---|---|---|---|---|
| 1 | **Structured `paid` flag representation**: `paid: (status === 'paid' || status === 'partially_waived') && paidAmount > 0` strictly indicates cash payment. | Confirmed: Returns `false` on waived bills (skipped lunch), `false` on unpaid defaults, and `true` on cash settlement. | **Accept.** Eliminates contradiction between `status: 'waived'` and `paid: true`. | Implemented in `sim/receipt.mjs`; verified by tests in `sim/receipt.test.mjs`. |
| 2 | **Full observed race exposure in `runMatchedWindows`**: Require `expectedEarlyRaces` and `expectedLateRaces`; exclude partial windows. | Confirmed: Replay on `s2em-whale_ten-1-1` verified 86 full-exposure runs and 14 excluded runs (13 completing collection on day 12 before races), yielding exact ratio 0.99159241. | **Accept.** Eliminates fractional-day window distortion. | Implemented in `sim/run-experiments.mjs`; tested in `sim/receipt.test.mjs`. |
| 3 | **Matched window summaries on identical runs**: Compute both income and roster metrics on `fullRuns` in `s2LoopEarlyMid` and `s2LoopLong`; disclose `fullN` and `excludedN`. | Confirmed: `earlyOwned` and `lateOwned` share identical full-exposure population. Tables disclose `full exposure (n/total)` and `excluded n`. | **Accept.** Fully transparent and paired. | Implemented in `sim/run-experiments.mjs`; results refreshed in `results.md` and `results.json`. |
| 4 | **Regression test coverage**: Test waived/paid/unpaid `paid` flag, and verify exclusion of day-12 collection completion before races. | Confirmed: `sim/receipt.test.mjs` explicitly checks all 3 bill statuses and asserts exclusion of seed index 1 from `fullRuns`. | **Accept.** Clean, robust verification. | Implemented in `sim/receipt.test.mjs`. |

Advisor approval is not completion; the orchestrator gate applies as usual.

## Remaining risks or follow-ups

- All simulation conclusions remain conditional on the stated assumptions.
- Near-miss candidates and firing rules (Tuning bullet 5) were explicitly excluded from Plan 01 scope per packet boundaries; deferred to an owner-scoped follow-up.
- Folder layout (`sim/`) remains provisional pending Plan 02's layout ratification gate.
- Orchestrator/owner review of S1–S4 evidence is required before any parameter value is adopted into founding design rules.
