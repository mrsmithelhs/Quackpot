# Plan 23 independent race-design review (Opus review 01)

**Date:** 2026-10-27. **Status:** recommendation for owner/orchestrator review. Nothing here is an owner decision, and no production, canonical, Plan 13 or existing Plan 23 file was changed. Baseline inspected: HEAD `d68e376`; see [`baseline.md`](baseline.md). `plan-status check plan-23` → `RUNNABLE`.

## 1. Verdict

**Retain the affine calibration `internalSpeed = 8.25 + 0.5 × rating`, with two bounded changes and one disclosure.**

1. **Disclose** what actually compresses speed. The affine map's half-scale slope matters less than the reference physics envelope. Every duck slows to the same ~11.3 corner speed on 51% of the lap. Acceleration is fixed, so no duck can ever exceed ~19.2 on any straight, and the solo lap has a hard **20.07 s floor**. Internal speed above ~18.6 buys nothing. The Plan 17 +5% boost therefore has a near-zero solo effect for Common/Rare and **exactly zero for Legendary**. The current proposal's "no top-speed plateau" wording is true of the map but not of the race, and the owner should adopt affine knowing this.
2. **Make Sprint a risk-only choice:** keep the ±20% swing but drop its +10% mean (×1.10 → ×1.00). Today Sprint almost never hurts: it worsened the result in 0.6–2% of paired races, against `docs/founding/design.md:34`. Risk-only Sprint helps underdogs, hurts favourites, and is about neutral on average.
3. **Remove the hidden start-grid advantage:** tighten start rows from 4 to 1.5 units and assign the player's slot with a keyed seeded draw. The player currently always starts in the front row, which by itself gives 40–45% wins against five equal ducks (fair share 16.7%). Rivals starting 8 units back never won in 300 equal-speed races under affine. This inflates every reported win rate.

The frozen combination passed the timing rule on 8,640 fresh-seed attempts: median 20.94 s, p95 21.69 s, max 22.07 s, 0 late, 0 unresolved. It made Sprint two-sided (10.4% improved / 9.9% worsened) and raised lead changes from 1.35 to 1.58 per race.

**Do not adopt** the cleaner alternative I tested: a "pace" model where rating scales a duck's whole motion envelope. It removes the saturation and gives uniform, larger modifier effects (boost ≈2.9 duck-lengths at every tier). But it turns races into processions: lead changes fall from 1.05 to 0.24 per race and margins rise from 6.7 to 20.6 lengths. Do not pursue identity conversion or geometry-only changes either; the envelope explains why they fail (§2, D6).

## 2. Causal diagnosis

The tension mixes intrinsic properties with accidental mismatches.

- **Intrinsic: authored gaps dwarf the modifiers.** Ratings step 40–43% per tier (10/14/20). The Tutorial field (8) is 25–150% slower than every roster duck, and the 50% rest penalty is a 2× gap. The boost is +5% and Safe noise ±5%. Under any faithful conversion, tier and rest decide most races, and the boost is roughly a seventh of a tier step. The pace experiment (E03) shows this directly: when ratings are expressed faithfully, races become deterministic.
- **Accidental: units mismatch with the reference envelope.** Plan 13's acceleration (3), braking (6), turn law (`turnCap = max(30, 90 − 5v)`) and 60/20 course were tuned for top speeds of 8–12 (`race-physics.mjs:3-41`). Every duck's corner target is 11.32 (`:183-191`, `:679`), regardless of rating. With a = 3 and b = 6, the reachable maximum is 13.66 on the opening half-straight, 19.18 on the middle straight and 17.55 on the closing half-straight (E01). Production inputs (4.4–27.7 sampled) mostly sit above these values.
  - **Below the knee (~11.3), lap time ∝ 1/speed.**
  - **Above it, the total benefit of any advantage is ≈2 s**, and nothing is gained above ~18.6.
  - **The affine fit works for timing** because its intercept lifts every leader to or above the knee: Tutorial field 8 → 12.25. Leaders then all run 20.1–22.5 s.
  - **Identity conversion fails for the same reason.** Field 8 sits below the knee, so a weak player lets the field lead at ~30 s.
- **Accidental: fixture.** The player is always `row: 0` (`race-physics.mjs:54-61`, `rowSpacing: 4` at `:10`). Plan 13 disclosed the grid as a limit (R1: review-03/04). Ported with production ratings, it becomes one of the largest outcome factors.
- **Weave and contact randomness rarely reorders entrants.** Front-half ducks weave twice as often (`:318-320`), but each weave costs well under a duck-length. In E02 the R03 lead changes were similar with and without weaving (1.44 vs 1.49), so they come from speed differences. In R01 there were none without weaving (0 vs 0.83). Uncertainty actually comes from sampled speed, the grid and Sprint variance.
- **Is a shared conversion sufficient?** For timing, yes: affine passes robustly. For modifier legibility, partly: the physics hides much of each nominal advantage, unevenly by tier. That is acceptable only if disclosed and the copy stays modest.

## 3. Findings

### Verified defects in the decision inputs

| ID | Finding | Evidence |
|---|---|---|
| D1 | Proposal says affine has "no top-speed plateau" and "uniformly retains half of raw absolute modifier gaps" (`proposal.md:79`, `adapter-analysis.md:90`). That holds for the map; the physics adds a plateau. Solo seconds saved by +5%: Common 0.085, Rare 0.056, Legendary −0.0001. In races (E02, row 0) the boost's mean margin gain is 1.34 lengths for Common vs 0.48 for Legendary. Sprint's gain is 2.26 vs 0.68 lengths. | E01 Part A; E02 `results.json` → `comparisons` |
| D2 | Player-fixed front row. At equal ratings the player wins 32–45% from row 0, 5–14% from row 1 and 0–5% from row 2 (300 seeds each). Affine production win rates fall from 63% (row 0) to 47% (slot-balanced). R03 rested Rare drops from 93–99% to 51–57%. | E01 Part B; E02; E03; E04 |
| D3 | Sprint is near-dominant. With a shared draw *u*, the Sprint sample beats Safe whenever *u* > 0.206, under both reference (`race-physics.mjs:97-99`) and production (`src/core/game-engine.mjs:439-442`). Paired worsened share is 0.6% (row 0) to 2.1% (E05 baseline). | E02, E04, E05 |
| D4 | The 72-cell matrix gives equal weight to states production cannot reach. With two races (`src/main.js` race 1/2; `plan-22…:36`), race 1 is always rested and race 2 is rested or 50% rest. **25% rest and tired-R01 cells never occur.** Pooled rest rows such as "60.4% after one race" are therefore not production predictions. Production-relevant (affine, row 0): R03 tired Common 0%, Rare 0%, Legendary 25–37%. | E02/E03 group tables |
| D5 | Reference geometry has a hard time floor: 20.07 s solo, 20.27 s with weaving. The faster tail the owner says is acceptable cannot occur at any speed. Straight-length screens shift this floor rather than restoring speed sensitivity. | E01 |

### Design concerns (judgement, with evidence)

- **C1 — Rest dominates:** under affine a tired Rare or Common at the Finale wins 0%. Common at 50% rest maps to 10.75, below the 11.32 corner knee, so it is penalised on the bends as well (−19 lengths vs −10 for Legendary). With two races, a one-duck player always races tired in the Finale. That may be the intended roster-depth pressure (a power-creep lesson), but Plan 22 should decide it on production cases, not matrix pools.
- **C2 — The Tutorial is effectively a guaranteed win:** any rested duck wins 86–100% under every tested option. Production today is 100% (deterministic sort). The owner should confirm this is intended.
- **C3 — The boost is real but small** under affine: about +0.9 duck-lengths on average, a better place in 9–13% of paired races, +2–3 pp wins, and roughly nothing for Legendary. If Plan 17 must be noticeable, copy should say "a small edge" and never "5% faster". Stronger expressions need an owner decision (§6).
- **C4 — Production race surface** (outside the mechanics scope; integration-relevant; R2, spot-checked):
  - unknown duck falls back to `BANNER_1_ROSTER[0]` (`game-engine.mjs:423`; already in proposal);
  - "Finished 3th." (`src/ui/race-view.js:258`);
  - Sprint is labelled "+10% peak boost" in logged `race_choice_offered` (`game-engine.mjs:427-434`), which would change under D3;
  - Receipt race branches appear gated on cue techniques no production emitter fires (`receipt.mjs:67,101,131`; inference from grep, not runtime-verified).

### Open questions (not resolved here)

Real six-slot keyed draw vs the lane-2 row proxy. Trial effect under the combined candidate (not re-paired in E05). Perceptibility of 1–6 duck-length margins at the camera scale used. Behaviour with a future third race.

## 4. Options compared

| Option | Timing (held-out) | Tier / rest | Boost (+5%) | Sprint | Drama (lead changes after 3 s; mean winning margin) | Complexity / integration |
|---|---|---|---|---|---|---|
| **Affine as proposed** (Plan 23; E02–E05 baselines) | Median 20.9–21.0 s, p95 ≤21.8 s, max ≤22.1 s, 0 late in 1,440 (Plan 23) + 5,040 (E03) + 8,640 (E05) | R03 rested C/R/L 25/93/100% at row 0; tired C/R 0% | ≈0.9 lengths; Legendary ≈0 solo | Near-dominant (worsens ≤2%) | 1.05–1.40; ~6–7 lengths | 1 conversion; physics unchanged |
| **Affine + risk-only Sprint + grid 1.5 + keyed slot** (E04/E05, recommended) | 20.94 / 21.69 / 22.07 s, 0 late / 8,640 fresh, 0 unresolved | R03 rested C/R/L 5–10/68–71/92%; tired C/R 0% | Unchanged (not re-paired) | Two-sided: 10.4% better / 9.9% worse; underdog +5 pp, favourite −11 pp | 1.58 (79% ≥1) | 2 constants + 1 keyed draw; reopens a Plan 13 fixture and the stance rule |
| **Pace P25** (E03; `k = (r/9.46)^0.25` scales top speed, acceleration, braking, corner target and turn rate) | Median 20.04 s, p95 21.89 s, max 22.30 s, 0 late; 3–6% under 17 s | Near-deterministic (R03 slot Rare 98%, Legendary 100%) | 2.9 lengths at every tier; win effect still small (+0.7–1.9 pp) | 5.6 lengths; risk-only variant viable | 0.24; ~20 lengths | Changes accepted acceleration/braking/turn-rate application (7 code sites); reopens DECISION-018 physics |
| Identity / straight 40 / straight 20 (Plan 23) | 30.5% late / 13.4% late / median 15.4 s | — | — | — | — | Fails the timing rule |
| sqrt 10.45–12 (Plan 23) | Passes | Strongly compressed | ≈0.02 s | — | — | Superseded |

None of these is proven for real player populations: all use crossed seeds, equal-rated rival fields and synthetic cell weights.

## 5. Recommended rules and constants (proposal for owner approval)

| Rule | Current selection | Proposed | Benefit | Cost | Evidence | Owner approval needed |
|---|---|---|---|---|---|---|
| Rating → internal speed | Unadopted candidate | `topSpeed = 8.25 + 0.5 × sampledRating`, no clamp; modifier order base → rest → trial → stance sample → conversion (unchanged) | Meets timing; keeps races contested | Hidden envelope compression (D1) must be documented | Plan 23 + E02–E05 | Yes: adopt calibration |
| Sprint | `base × 1.10 × (1 ± 0.20)` (production `game-engine.mjs:430,441`; reference `:97-99`) | `base × 1.00 × (1 ± 0.20)`; Safe stays `× (1 ± 0.05)` | Real choice: "steady and reliable" vs "bigger swing"; no dominant option | Copy/label change; underdogs gain less than with +10% | E04, E05 | Yes: changes the stance rule |
| Start rows | `rowSpacing: 4`, player fixed in row 0 | `rowSpacing: 1.5`; player slot by keyed draw over the six grid slots (e.g. key `plan23/v1\|{raceId}\|start-slot`), drawn from the race seed so cancel/reopen cannot reroll, persisted in committed inputs and shown pre-race | Removes hidden player bias; slot becomes legible pre-race information that can inform the Sprint choice | Strong ducks win more reliably; Tutorial Common drops from ~99% to ~86% | E01, E04, E05 | Yes: changes an accepted Plan 13 fixture |
| Plan 17 boost | +5% rating, once, at commit | No change; describe as a small edge, never "5% faster" | Honest presentation | Remains small; ≈0 for Legendary | E01, E02, E03 | Confirm "small" is acceptable |
| Rest 50/25 | Selected | No change from this review; Plan 22 should evaluate production states only | — | — | D4, C1 | Plan 22 decision |
| Weave/contact/finish/highlight/guards | DECISION-018 | Unchanged | — | — | Guard maxima observed 21 events / 36 diagnostics vs caps 128/84 | None |

**Bounded next experiment** (one run, no tuning; only if the owner approves the grid change): implement the real six-slot keyed draw in the eventual resolver port and rerun the E05 harness on 40 new seeds, adding trial on/off pairs. Accept if:
- median is in 17–23 s, at most 5% finish over 23 s, and 0 unresolved;
- Sprint improved and worsened shares are each ≥5%;
- equal-rating win-rate spread across slots is ≤15 pp.

On failure, report it; do not retune.

**Not tested:** real keyed slot draw; trial pairs under the combined candidate; unequal rival ratings within a field; a third race; human perception of margins; reduced-motion/static presentation; storage size of the new committed input (one extra integer); browser playback.

## 6. Owner decisions required

1. Adopt the affine calibration with the D1 disclosure: boost is near-zero for Legendary, there is no benefit above ~18.6 internal speed, and races cannot finish faster than ~20 s.
2. Change Sprint to risk-only (×1.00, ±20%), or keep +10% and accept a near-dominant option.
3. Change the grid (spacing 1.5 + keyed player slot), or keep the player-fixed front row as an explicitly disclosed player-favouring advantage.
4. Confirm the Tutorial race is meant to be a near-certain win.
5. Plan 22: confirm that a 50%-rested Common/Rare should almost never win the Finale in a two-race slice.
6. Is the Plan 17 boost acceptable as a small edge? Stronger expressions (e.g. applying +5% after conversion, or the pace model) reopen Plan 17 or DECISION-018 and are untested for drama.
7. Note for the timing target: the reference envelope keeps every race between ~20 and 22.5 s. The "substantial faster tail" allowance goes unused unless the physics changes.

## 7. Proposed implementation and repair sequence (after approval)

1. **Owner/QP Orch:** record the decisions and a constants table (conversion, Sprint, row spacing, slot-draw key, rules version such as `plan23-race-v1`). Review-only artifacts change no canonical doc.
2. **Plan 23, new file only** (no Plan 21 contention): pure `src/core/race-resolver.mjs`.
   - Keep a reference-parity mode that reproduces the Plan 13 R03 witness fingerprint exactly.
   - Add a production mode with the approved constants, keyed slot draw and the exact modifier order.
   - First tests: parity, determinism, slot-key stability across cancel/reopen, guard/unresolved paths. Then run the bounded experiment above against this module.
3. **After Plan 21's main/engine/storage repair lands** (serialize; do not edit concurrently): engine commit path, storage versioning, Receipt and view per the existing proposal. Persist slot and rules version in the committed input. Old schema-v1 races stay summary-only legacy; no migration of past race outcomes is needed because production never persisted a physics race. The Sprint label text in `race_choice_offered` changes; Receipt "We displayed" must quote the label actually shown.
4. **Plan 22:** supplies `restFactor` only. Re-check win/place tables on actual production states (two races; any later schedule) before balancing rest.
5. **Browser verification** in an orchestrator-assigned slot after offline evidence.

## Evidence index

- [`experiments/01-speed-envelope-and-grid/`](experiments/01-speed-envelope-and-grid/README.md): envelope, boost marginals, grid bias (Opus).
- [`experiments/02-paired-production-effects/`](experiments/02-paired-production-effects/README.md): paired affine effects, slot-balanced, no-weave control (Haiku; Opus-reviewed).
- [`experiments/03-pace-scaling-candidate/`](experiments/03-pace-scaling-candidate/README.md): pre-registered pace calibration and validation vs affine; risk-only Sprint under pace (Haiku; Opus-reviewed).
- [`experiments/04-affine-sprint-and-grid/`](experiments/04-affine-sprint-and-grid/README.md): single-change tests under affine (Opus).
- [`experiments/05-combined-bounded-candidate/`](experiments/05-combined-bounded-candidate/README.md): frozen combination on fresh seeds (Opus).
- [`delegation-log.md`](delegation-log.md): Haiku scopes, self-reported identities, dispositions.

**Uncertainty:**
- Seeds are reused across cells, rows and arms, so attempts are not independent. Zero-late bounds are attempt-level (e.g. Wilson upper ≈0.044% for 0/8,640).
- Matrix weights are not player frequencies.
- Lead changes are a proxy for drama, not a perceptual measure.
- E04 used E03's held-out seeds to choose the two changes; only E05 is a fresh-seed check of the frozen combination.
