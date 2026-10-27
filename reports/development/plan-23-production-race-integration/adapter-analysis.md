# Plan 23 speed-adapter and payload investigation

**Date:** 2026-10-26
**Stage:** Report-only numerical investigation authorized by QP Orch. No mapping is approved for production.

**Owner calibration clarification:** Treat roster/field inputs as abstract speed ratings for mapping purposes. Historical screens below describe values using the earlier m/s interpretation; those labels are not an approved player-facing unit. Any UI should say `Speed` or `Speed rating` unless a later owner decision establishes units.

## Method

`adapter-analysis.mjs` reads the accepted Plan 13 `race-physics.mjs` and changes no source file. It loads an in-memory copy with a single post-sampling adapter inserted between `sampledPerformance` and `topSpeed`, leaving the selected model, random keys, event order, and physical rules unchanged. An unchanged direct reference call for the named Plan 13 R03 input produced fingerprint SHA-256 `e3e31dbfd758f6ff76ad11e897c0e5c06b5721413aae77ccba60a7a120036cf0`, finished at 22.159874 seconds, and used 443.1975 ticks. This confirms the unmodified reference path for that witness; it does not certify an eventual production port.

Each tested mapping ran 432 races: three production stat tiers (10/14/20 m/s), both existing fields and race IDs (Tutorial 8 m/s / R01; Finale 11.2 m/s / R03), Safe and Sprint, trial absent/present, neutral/25%/50% rest factors, and six paired deterministic seeds. The combined rank-weave/contact model was used throughout. The 10/14/20 values cover all current roster identities by stat; no new identity mechanics were simulated. There are only six seeds, so outcomes are a screening signal, not fairness or balance evidence.

The raw speed domain was bounded from the current supported inputs: 4.4 m/s = Common 10 × 50% rest × Sprint 1.10 × low random factor .80; 27.72 m/s = Legendary 20 × trial 1.05 × Sprint 1.10 × high random factor 1.20. Existing opponent speeds (including ±5%) fall inside this domain. All speed values are transformed once after the original stance/trial sampling and before physics. Future rest factors are analysis inputs only; no rest-history or Plan 22 behavior is implemented.

## Candidate mapping comparison

| Mapping | Common 10 | Rare 14 | Legendary 20 | Trial delta at base 10 / 14 / 20 | 432-race finish time (min / median / max) | Share in 17–23s | Identity win rates Common / Rare / Legendary |
|---|---:|---:|---:|---|---|---:|---|
| Existing clamp to 8–12 | 10.000 | 12.000 | 12.000 | 0.500 / 0 / 0 m/s | 21.67 / 22.27 / 30.52s | 71.5% | 25.7% / 62.5% / 88.2% |
| Affine 4.4–27.72 → 8–12 | 8.961 | 9.647 | 10.676 | 0.086 / 0.120 / 0.172 m/s | 22.06 / 26.97 / 28.77s | 4.4% | 28.5% / 63.2% / 88.9% |
| Log 4.4–27.72 → 9–12 | 10.300 | 10.854 | 11.449 | 0.080 / 0.081 / 0.082 m/s | 21.89 / 23.84 / 25.13s | 27.1% | 29.9% / 64.6% / 90.3% |
| Square root 4.4–27.72 → 9–12 | 10.470 | 10.925 | 11.454 | 0.064 / 0.069 / 0.077 m/s | 21.89 / 23.60 / 24.56s | 30.6% | 28.5% / 64.6% / 89.6% |

For all 1,728 races across the four rows, every race crossed the finish line; no watchdog outcome occurred. The logarithmic and square-root candidates improve on the affine candidate's timing, but neither meets the 23-second upper edge for all supported cases: respectively 72.9% and 69.4% of their runs were outside the band, mostly above it. These runs included rest and stance conditions that the production slice currently does not compose; the 20-second/±15% pacing requirement remains unmet by the tested global mappings. No course, cap, turn, collision, or pacing constant was altered to force a fit.

Every candidate is mathematically strictly increasing across the tested domain. That does not mean modifiers retain their authored magnitude: the selected +5% Plan 17 input becomes only about +0.06–0.08 m/s for the square-root mapping and +0.08 m/s for the logarithmic mapping at each base tier. Across 36 paired condition-cell mean comparisons (same field, stance, rest and seed set), adding the trial changed mean player place by −0.19 and median finish time by −0.064 seconds under square root; under log it changed them by −0.19 place and −0.083 seconds. This is an aggregate measured effect, not proof every seed benefits. The true raw +5% value and its once-only consumption must remain explicit in the committed input evidence; do not describe mapped speed as still being 5% faster.

The log map retains a somewhat larger low-speed distinction than square root: a 10 m/s base maps 0.465 m/s above its 7.5 m/s (25%-rest) input and 1.104 m/s above its 5 m/s (50%-rest) input; square root gives 0.376 and 0.989 m/s. Those figures help Plan 22 reason about whether its selected rest penalties stay perceptible after a global conversion. They are not a Plan 22 balance verdict. Sprint versus Safe also remained outcome-relevant in aggregate: across 36 paired condition-cell means, Sprint improved mean place by 0.31–0.39 and shortened median finish by 0.057–0.077 seconds for the two smooth mappings; seed-specific effects vary.

The tier advantage remains large across mappings: in 144 runs per selected stat tier, Legendary won 89.6–90.3% under smooth maps, versus 28.5–29.9% for Common. This is consistent with the existing 10/14/20 speed spread and must not be “corrected” with per-duck modifiers. It is a material owner-facing balance result from this small screening design, not a claim that the adapter alone caused the gap. The old clamp already erased Rare versus Legendary ordering at the 12 m/s ceiling and erased all +5% trial increments at the 14/20 m/s tiers.

## Recommendation and failed invariants

There is **no passing mapping to recommend for adoption** from this screen. If QP Orch needs one candidate to carry into a broader, owner-approved pacing analysis, use the square-root 9–12 mapping as the first candidate because it had the highest target-band share and lowest maximum finish time of the smooth mappings. Keep logarithmic 9–12 as the alternative if preserving lower-speed/rest distinctions is more important. Reject affine 8–12 for the observed timing failure. Reject the existing clamp for its hard tier/trial plateaus.

The square-root candidate still fails these proposed acceptance checks:

- 69.4% of its tested finishes fell outside 17–23 seconds, so the accepted pacing tolerance is not established.
- The mapped Plan 17 bonus is only 0.064–0.077 physics m/s at the three base tiers. Whether this smaller delta remains an adequate player-visible trial effect needs an owner decision; do not assert the original 5% effect survives unchanged.
- The Legendary-to-Common advantage is substantial and repeated in this small sample. No per-variant correction is authorized.
- Six seeds per cell are insufficient for broad distribution claims; the runs do not demonstrate every seed or every later state.

If preserving trial magnitude, rest readability, the existing physics domain, and pacing cannot all be achieved by one global monotonic function, the owner must choose which constraint can move. Do not tune the 20-second target, course, accepted Plan 13 mechanics, Plan 17 rule, or roster stats silently.

## Follow-up for the owner's late-race tolerance

The owner is willing to accept up to about 5% of races over 23 seconds, and prefers a faster skew over a slow tail. A further report-only screen used the same Plan 13 in-memory adapter, fixed course and mechanics, and the square-root mapping with a 10.45 m/s lower output endpoint:

```text
f(x) = 10.45 + 1.55 × sqrt((x − 4.4) / (27.72 − 4.4)), for 4.4 ≤ x ≤ 27.72
```

It ran 30 deterministic seeds for each of the 72 input cells (three speed tiers × two production race/field combinations × two stances × trial on/off × three future rest factors), for 2,160 finished races and no unresolved outcomes. The measured distribution was: mean 22.391s, SD 0.260s, median 22.358s, p90 22.748s, p95 22.893s, p99 22.986s, range 21.685–23.060s. Nineteen races (0.88%) exceeded 23s; none finished under 17s; 99.12% landed in 17–23s. The sample skew was +0.28. This is a narrow, near-symmetric screening distribution, not proof of a normally distributed production population.

The late tail was concentrated in the future 50%-rest group: 2.64% of that group's 720 trials exceeded 23s; the rested and 25%-rest groups had none. Common-tier runs had 1.67% late finishes, Rare 0.97%, and Legendary none. Tier ranking remained distinct: mean place Common 2.71, Rare 1.61, Legendary 1.17; win rates 34.7%, 60.8%, and 84.6% respectively. No per-variant adjustment was made. No run was pushed below 17 seconds by this mapping; the fastest observed was 21.685s.

The +5% trial remained strictly ordered but was heavily compressed: it changed mapped base speed by only 0.033–0.040 m/s across the three tiers. Across 36 paired condition-cell averages it shifted mean place by 0.113 and finish time by 0.022s; that is a small aggregate effect, not a guaranteed per-seed benefit. Sprint shifted mean place by 0.159 and saved 0.040s across paired cell means. A 10 m/s Common base maps to 11.210; its 25% and 50% rest inputs map 0.194 and 0.511 m/s lower. Thus this mapping fits the requested late tail and retains mathematical ordering, while weakening the trial and rest effects. It cannot be represented as preserving the original physical +5% speed benefit unchanged.

This follow-up made the initial pacing trade-off more concrete: sqrt10.45 was the report-only timing candidate if the owner accepted the smaller mapped trial/rest deltas. It did not authorize production integration. The earlier no-candidate statement applies to the first screen's stricter modifier-preservation gate; sqrt10.45 passed the approximate 5% late-race tolerance in its calibration screen, but did not pass the stronger modifier-magnitude expectation. The owner-approved global linear comparison below supersedes this as the current recommendation.

## Owner-approved global calibration comparison

The owner authorized a bounded, report-only comparison of global input conversions. Finishes under 17 seconds are acceptable; the target is a median simulated finish of 17–23 seconds with at most about 5% strictly over 23 seconds. The 23-second value is a distribution measure, never a forced finish cutoff. Plan 13 mechanics, its course (`straight=60`, `curveRadius=20`), acceleration, braking, turn law, accepted curve-target search bound, keyed draws, contact/weave rules, and first-crossing finish remain fixed. The only substituted operation is the sampled `topSpeed` conversion before physics. The old 8–12 top-speed clamp is bypassed for the two linear arms; the square-root arm maps into the same numeric 10.45–12 interval as the prior candidate. No physics constants are changed. `PHYSICS.maxSpeed=12` remains in its accepted role as the upper search bound for curve-target speed; it does not clamp converted topSpeed on the straights.

The matrix uses all 72 equally weighted cells: Common/Rare/Legendary ratings 10/14/20; Tutorial R01 field 8 and Finale R03 field 11.2; Safe and Sprint; trial off/on; and rested/25%-rest/50%-rest input factors. The factors are analytical inputs for Plan 22, not rest-history implementation. The accepted model applies trial once before stance sampling, then the one global conversion. Each cell gets 8 calibration seeds and a separate 20-seed validation set (576 and 1,440 attempts per model); all three arms use matched seed/configuration pairs. The linear candidate `8.25 + 0.5x` was fixed from the low-domain anchor and an explicit half-scale choice before validation. The machine record names every seed and retains every cell.

Calibration results (8 seeds per cell):

| Mapping | Mean | Median | p95 | Max | Over 23s |
|---|---:|---:|---:|---:|---:|
| sqrt10.45 baseline | 22.380s | 22.377s | 22.838s | 22.912s | 0/576 |
| Identity `x` | 23.013s | 22.354s | 30.237s | 30.626s | 165/576 (28.65%) |
| Linear `8.25 + 0.5x` | 20.932s | 20.937s | 21.721s | 21.925s | 0/576 |

### Validation results

| Mapping | Mean | p5 | Median | p90 | p95 | p99 | Min–max | 17–23s | Under 17s | Over 23s | Unresolved |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| sqrt10.45 baseline | 22.391s | 22.024s | 22.365s | 22.719s | 22.781s | 22.962s | 21.694–22.985s | 1,440/1,440 | 0 | 0/1,440 | 0 |
| Identity `x` | 23.326s | 20.334s | 22.313s | 30.058s | 30.557s | 31.048s | 20.109–31.172s | 1,001/1,440 (69.51%) | 0 | 439/1,440 (30.49%) | 0 |
| **Linear `8.25 + 0.5x`** | **21.023s** | **20.339s** | **21.006s** | **21.714s** | **21.769s** | **21.876s** | **20.109–21.893s** | **1,440/1,440** | **0** | **0/1,440** | **0** |

For the recommended linear candidate, all 72 validation cells had 20/20 genuine finishes, no unresolved guard outcomes, and no finish over 23 seconds. The attempt-level Wilson 95% interval for a 0/1,440 late count is 0–0.266%; that interval assumes independent attempts, while the crossed seed/configuration design limits population inference. A seed-block bootstrap is degenerate when every block has zero late events, so it is not reported as a zero-width confidence interval. The identity mapping missed the late-tail criterion in 47/72 cells. Its Wilson interval is 28.16–32.91%; the 20-block bootstrap sensitivity interval is 26.60–35.00%. No arm produced a finish below 17 seconds. These samples do not establish a normal distribution.

The selected highlight adds 2 seconds of playback only. For the linear candidate, validation playback mean/median/p95/max are 23.023/23.006/23.769/23.893 seconds; these are not race-finish times and are not compared to the 23-second simulated-finish threshold. The prior 30-seed sqrt10.45 calibration set had 19/2,160 (0.88%) over 23 seconds, while its fresh matched validation set here had 0/1,440. Keep that seed-set variation visible; do not convert either finite result into a guarantee.

### Candidate input effects and recommendation

Recommend **`internalSpeed = 8.25 + 0.5 × ratingInput` for owner review**, as the single global report-only candidate. It maps the supported sampled input domain 4.4–27.72 to 10.45–22.11 with no top-speed plateau; Plan 13's accepted corner law remains in force. Existing roster values should be presented as a `Speed`/`Speed rating`, not as an unsupported player-facing m/s claim. Roster fields map Common 10→13.25, Rare 14→15.25, Legendary 20→18.25; Tutorial field 8→12.25 and Finale field 11.2→13.85. This preserves strict tier order across the full input range.

| Authored rating | Mapped base | Trial +5% input gap → mapped gap | Sprint +10% nominal gap → mapped gap | 25% rest input gap → mapped gap | 50% rest input gap → mapped gap |
|---:|---:|---:|---:|---:|---:|
| Common 10 | 13.25 | 0.500 → 0.250 | 1.000 → 0.500 | 2.500 → 1.250 | 5.000 → 2.500 |
| Rare 14 | 15.25 | 0.700 → 0.350 | 1.400 → 0.700 | 3.500 → 1.750 | 7.000 → 3.500 |
| Legendary 20 | 18.25 | 1.000 → 0.500 | 2.000 → 1.000 | 5.000 → 2.500 | 10.000 → 5.000 |

The affine conversion applies the selected +5%, Sprint factor/variance, and later rest factor once to the rating before conversion. Table gaps are standalone deltas at each un-rested authored base; when rest precedes trial, its factor also scales the raw trial increment before conversion. The slope deliberately retains half of each raw absolute speed gap uniformly; the positive intercept changes relative percentages in internal-speed terms. That compression is explicit, not a cap plateau: every supported sampled input remains strictly ordered. Across 36 matched validation condition-cell means, the trial shifted mean place by −0.149 places and finish time by −0.034s; Sprint improved mean place by 0.246 and saved 0.057s. Across 24 paired cells, the 25%-rest input added 0.242s and 50%-rest input added 0.519s. These are average effects, not per-seed guarantees. Candidate tier win rates were Common 27.3%, Rare 56.5%, Legendary 85.8%; mean places were 3.67, 2.22, and 1.30. Do not add per-duck tuning.

The absolute speed deltas are half-scale, and the positive intercept also reduces their relative percentages: rating 10 maps to 13.25, while the once-applied +5% rating input 10.5 maps to 13.50, a **1.89% increase in internal topSpeed**. A 50%-rest rating input maps from `f(10)=13.25` to `f(5)=10.75`, an **18.87% reduction** in internal topSpeed (the input penalty is still applied exactly once before mapping). Although paired race-time changes are modest, the rest groups show materially different race outcomes:

| Future rest input | Mean finish | Mean player place | Player win rate |
|---|---:|---:|---:|
| Rested | 20.769s | 1.315 | 84.6% |
| One race rest (25%) | 21.011s | 2.052 | 60.4% |
| Zero races rest (50%) | 21.288s | 3.823 | 24.6% |

These grouped outcomes come from 480 attempts per rest condition across the same tier/field/stance/trial mix. Since the race terminates at the first entrant's crossing, finish-time deltas do not summarize player-impact size by themselves; rank and win differences must also be reviewed. Rest conditions are inputs for this comparison only; Plan 22 still owns their later lifecycle integration.

Identity conversion preserves raw absolute deltas but performs poorly against the distribution goal: its median (22.313s) is on target, yet 30.49% of validation races exceed 23 seconds and p95 is 30.557s. The affine candidate reduces the tail without early finishes and retains substantially more tier/modifier separation than sqrt10.45. The slope's half-scale effect remains an explicit owner trade-off, so this recommendation is **for owner calibration review only**, not production adoption. Production work still requires QP Orch's explicit source/lifecycle/file assignment and a separate owner decision on the proposed calibration.

Reproduce the matched run with `node reports/development/plan-23-production-race-integration/linear-speed-comparison.mjs`; full per-cell/group results and seed provenance are in `linear-speed-comparison-results.json`. A separate bounded track-geometry screen is documented below. No browser, build, or repository tests were run.

## Follow-up geometry screen: identity mapping, radius fixed

QP Orch requested a single bounded geometry check to see whether track length alone can retain the identity speed mapping and meet both timing criteria. Using the existing eight calibration seeds across the same 72 cells, the screen compared straight lengths 60, 40, and 20 while holding radius at 20. Identity rating-to-topSpeed conversion was used with the 8–12 sampled clamp removed. The accepted `maxSpeed=12` corner-target search bound, all other Plan 13 physics constants, turn law, weave/contact schedules, and exact finish logic stayed unchanged. Course circumferences were 245.664, 205.664, and 165.664 model units respectively. All 1,728 attempted races finished; no attempt was filtered. The held-out set was not run because neither changed geometry passed calibration.

| Straight length | Course length | Mean | Median | p90 | p95 | p99 | Min–max | Under 17s | Over 23s | Unresolved | Calibration decision |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 60 (reference) | 245.664 | 23.013s | 22.354s | 29.747s | 30.237s | 30.600s | 20.112–30.626s | 0/576 | 165/576 (28.65%) | 0 | Fail: late tail |
| 40 | 205.664 | 19.656s | 18.814s | 24.859s | 25.339s | 25.702s | 17.652–25.702s | 0/576 | 77/576 (13.37%) | 0 | Fail: late tail |
| 20 | 165.664 | 16.118s | 15.446s | 20.057s | 20.424s | 20.935s | 14.758–20.935s | 477/576 (82.81%) | 0/576 | 0 | Fail: median below 17s |

The 40-unit result has a median in the desired band but exceeds the late limit; 12/72 cells had at least one late result. Its late rate Wilson 95% interval is 10.83–16.39%, with an 8-seed block-bootstrap sensitivity interval of 11.81–14.93%. The 20-unit result has no late cases (Wilson attempt-level upper bound 0.663%) but its median is below target and 82.81% of attempts finish under 17 seconds. Neither setting qualifies for held-out validation. The 60-unit reference result repeats the already-observed identity-mapping failure on the calibration seed set.

Rest still had large player-outcome differences under identity conversion. On straight 40, Common/Rare/Legendary win rates were 28.6%/64.1%/87.5%; 25%/50% rest groups had 20/192 (10.42%) and 57/192 (29.69%) late outcomes, versus zero for rested ducks. On straight 20, tier win rates were 28.1%/61.5%/82.8%; rest win rates were 82.8% rested, 63.0% after one race, and 26.6% after zero intervening races. These are 8-seed calibration observations, not Plan 22 lifecycle evidence. Orchestrator corrected the subgroup denominators against the saved JSON on 2026-10-26; overall 77/576 remains unchanged.

**Geometry conclusion:** straight-length adjustment at these two bounded values does not solve the distribution while preserving the identity mapping. Stop geometry search here as requested; do not run validation for either setting and do not try an unapproved third value. The affine speed mapping above remains a report-only candidate for owner choice, with its half-scale modifier effects stated explicitly. Reproduce this screen with `node reports/development/plan-23-production-race-integration/track-length-comparison.mjs`; all cells, groups, seeds, and playback summaries are in `track-length-comparison-results.json`.

## Payload and diagnostic sizing

Byte counts are UTF-8 JSON before and after gzip. The named direct Plan 13 R03 reference resolution is 299,215 JSON bytes / 54,790 gzip bytes with 443.1975 ticks, 15 mechanical events, and 33 opportunity diagnostics. Five first-seed full reference results for each mapping were measured; across those 20 samples, the largest full result was 371,551 bytes and smallest was 288,986 bytes. The five square-root samples were 296,850–319,315 bytes full JSON, 91,191–99,406 bytes under the report-only compact candidate encoding, and 53,263–57,019 gzip bytes full / 27,053–29,486 compact.

The candidate encoding stores one fixed entrant order, integer trajectory rows (`tick×1e6`, `progress/lateral/speed×1e3`, `heading×1e4`), deduplicates identical adjacent terminal samples, derives world `x/y`, and retains actual inputs, finish, mechanical records, opportunity diagnostics, and trial consumption. It reduced those five sample JSON payloads by roughly 69–70%. This is only a sizing model: it has not passed round-trip, accuracy, schema, or corruption tests and must not be treated as the production format yet. Since keyed draws derive from the versioned seed/race/input, a long draw-key list is not a mutable stream continuation; retaining or deriving it should be decided explicitly.

The actual reference module returned unresolved guard witnesses of 15,648 bytes at the opportunity-diagnostic guard (24 ticks, no committed diagnostic rows after rollback) and 17,827 bytes at a one-event mechanical cap (26 ticks, one retained mechanical event, one opportunity). Across the 1,728 sampled completed races, the highest observed counts were 27 mechanical events and 47 diagnostics; the accepted limits remain 128 and 84. No 800-tick watchdog result was observed in the valid matrix, so this report does **not** invent a watchdog payload measurement. The full trajectory plus full event/diagnostic/draw-key arrays are substantially redundant: proposed storage keeps one canonical versioned resolution under run state, logs a compact commit/input hash and bounded mechanical event facts for Receipt integrity, and appends displayed-event/action facts only as they occur. Do not duplicate the full trajectory into the hash-chained log.

## Source and lifecycle clarifications from the proposal

- Exact race input order: validate that the selected `duckId` exists in the current owned roster; derive its authored base speed; apply a `restFactor` input (default 1, owned by Plan 22 later); apply the committed Plan 17 `1.05` once if eligible; apply the selected Safe/Sprint sampling formula with the accepted keyed performance draw; apply the selected global adapter once; then enter Plan 13 acceleration/turn/contact physics. Plan 17 eligibility/consumption remains commit-once. The production resolver must not receive an already modified `effectiveSpeed` and also apply stance/trial again. Plan 13's direct reference input mode stays available unchanged for parity witnesses.
- The current `runRace` silently substitutes the first roster duck when an ID lookup misses. Validate ownership and reject before appending a race-choice event or changing trial/RNG/reward state; do not race an unowned fallback.
- Old completed races receive the now-approved summary-only legacy presentation. Never rerun them or synthesize missing trajectories, mechanical events, or displayed cues.
- Normal-motion playback uses the committed trajectory with the selected two-second highlight. Five fixed checkpoints are the reduced-motion/static default, with event stills/seeking retaining truthful event linkage. The selected highlight changes wall playback only.
- Prefer a new race-specific motion wrapper/controller after Plan 20 handoff; keep Plan 20 card motion lifecycle read-only unless its owner explicitly approves a bounded extension.
- `EventLog.append` already accepts arbitrary immutable, hash-chained event types. No `event-log.mjs` rewrite is proposed. Add compact mechanical event and result records there as needed; `receipt.mjs` is the exact projection file if race facts must appear in Receipt registers. Do not duplicate full trajectory/state into the event log.

## Reproducibility and limits

Run from repository root: `node reports/development/plan-23-production-race-integration/adapter-analysis.mjs` for the first six-seed screen and `node reports/development/plan-23-production-race-integration/pacing-sweep.mjs` for the 30-seed sqrt10.45 follow-up. Their machine-readable outputs are `adapter-analysis-results.json` and `pacing-sweep-results.json`. The follow-up substitutes only the PRNG URL in an in-memory reference-module copy and inserts the mapping before `topSpeed`; it changes no accepted source. Both scripts write only within this Plan 23 report folder. No browser, build, repository test, or production source command was run. Current in-flight Plan 20 `src/` changes were left untouched.
