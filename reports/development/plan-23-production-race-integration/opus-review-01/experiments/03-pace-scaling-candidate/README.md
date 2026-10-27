# 03 — Pace-scaling candidate (Opus-review diagnostic)

**Author:** bounded experiment-writer subagent (claude-haiku-5-5), delegated by the Opus reviewer. **Command (from repo root):** `node reports/development/plan-23-production-race-integration/opus-review-01/experiments/03-pace-scaling-candidate/run.mjs`

**Output:** `results.json` and this README, both written by `run.mjs` from the same in-memory results. Wall time of this run: 293 s (calibration 33 s, validation 260 s).

## Hypothesis (from the brief)

One global pace number that scales the whole motion envelope removes the speed-saturation knee, gives uniform relative modifier effects across tiers, and meets the timing rule.

## Method and substitutions

- Reference: `reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs`, read-only. SHA-256 `3d3bd83107da7db38d2b4f902ce9be304aaed52fb49612cd9b90b9ed8ac7a07e`. Loaded in memory with the experiment 02 string-patch loader (copied into `run.mjs`, not imported). No source file is edited.
- Line endings: the reference has 0 CRLF and 936 LF line breaks. The in-memory copy converts CRLF to LF before substitution (a no-op for this file), so that the anchor `speed: 6,\n` from the brief matches the text.
- Substitutions are applied in order with split/join; each anchor must occur at least once (the run throws otherwise). Occurrence counts are in Verification.
- Player rating input = tier rating x rest factor; trial and stance are applied inside the module.
- The affine arm changes only the sampled top-speed clamp, as in experiment 02. The pace arms change the seven anchors below; R0 and ALPHA are literals set per candidate.

### Affine arm (baseline)

```
"topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed)," → "topSpeed: ((x) => (8.25 + 0.5 * x))(sampled),"
```

### Pace arms (both candidates; R0 and ALPHA as literals)

P25: ALPHA = 0.25, R0 = 9.46

```
"topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed)," → "pace: Math.pow(sampled / 9.46, 0.25), topSpeed: 14 * Math.pow(sampled / 9.46, 0.25),"
"speed: 6,\n" → "speed: 6 * Math.pow(sampled / 9.46, 0.25),\n"
"const targetCornerSpeed = curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));" → "const targetCornerSpeed = e.pace * curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));"
"/ (2 * PHYSICS.braking));" → "/ (2 * PHYSICS.braking * e.pace * e.pace));"
"e.acceleration = PHYSICS.baseAcceleration;" → "e.acceleration = PHYSICS.baseAcceleration * e.pace * e.pace;"
"e.speed - PHYSICS.braking * PHYSICS.dt)" → "e.speed - PHYSICS.braking * e.pace * e.pace * PHYSICS.dt)"
"turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt" → "e.pace * turnCap(e.speed / e.pace) * Math.PI / 180 * PHYSICS.dt"
```

P15: ALPHA = 0.15, R0 = 10.57

```
"topSpeed: clamp(sampled, PHYSICS.minSpeed, PHYSICS.maxSpeed)," → "pace: Math.pow(sampled / 10.57, 0.15), topSpeed: 14 * Math.pow(sampled / 10.57, 0.15),"
"speed: 6,\n" → "speed: 6 * Math.pow(sampled / 10.57, 0.15),\n"
"const targetCornerSpeed = curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));" → "const targetCornerSpeed = e.pace * curveTargetSpeed(PHYSICS.curveRadius - Math.abs(e.lateral));"
"/ (2 * PHYSICS.braking));" → "/ (2 * PHYSICS.braking * e.pace * e.pace));"
"e.acceleration = PHYSICS.baseAcceleration;" → "e.acceleration = PHYSICS.baseAcceleration * e.pace * e.pace;"
"e.speed - PHYSICS.braking * PHYSICS.dt)" → "e.speed - PHYSICS.braking * e.pace * e.pace * PHYSICS.dt)"
"turnCap(e.speed) * Math.PI / 180 * PHYSICS.dt" → "e.pace * turnCap(e.speed / e.pace) * Math.PI / 180 * PHYSICS.dt"
```

### Sprint-neutral arm (selected pace candidate plus this change; Safe/Steady unchanged)

```
"base * 1.1 * (1 + (2 * draw - 1) * 0.2)" → "base * 1.0 * (1 + (2 * draw - 1) * 0.2)"
```

## Cases, seeds, arms

| Group | raceId | Field base | Rest | Kind | Label |
|---|---|---|---|---|---|
| R01-rest1 | R01 | 8.0 | 1.00 | production | R01 rested |
| R03-rest1 | R03 | 11.2 | 1.00 | production | R03 rested |
| R03-rest0.5 | R03 | 11.2 | 0.50 | production | R03 after R01 (rest 0.5) |
| R03-rest0.75 | R03 | 11.2 | 0.75 | future | R03 rest 0.75 (future, not reachable in the current 2-race slice) |
| R01-rest0.75 | R01 | 8.0 | 0.75 | matrix-only | R01 rest 0.75 (matrix only) |
| R01-rest0.5 | R01 | 8.0 | 0.50 | matrix-only | R01 rest 0.5 (matrix only) |

Matrix: 6 race groups x tiers common 10 / rare 14 / legendary 20 x steady/sprint x trial off/on = 72 cells. Production subset: 36 cells (R01-rest1, R03-rest1, R03-rest0.5). Future group: 12 cells (R03-rest0.75). Matrix-only: R01 with rest 0.75 and 0.5 (24 cells).

Calibration seeds: `opus-r01-pace-cal-01` … `opus-r01-pace-cal-12` (12). Validation seeds: `opus-r01-pace-val-01` … `opus-r01-pace-val-30` (30), fresh and not used in any earlier experiment. Crossed seeds are shared across cells and arms.

| Arm | Map / substitutions | Plan | Cells |
|---|---|---|---|
| cal-P25 / cal-P15 | pace candidate (7 anchors) | row 0 only | 72 matrix cells x 12 seeds |
| affine | topSpeed 8.25 + 0.5 x (no clamp) | row 0: 72 cells; rows 1 and 2: 48 production+future cells | 30 seeds |
| pace-<selected> | pace candidate (7 anchors) | same as affine | 30 seeds |
| pace-<selected>-sprint-neutral | pace candidate + Sprint mean 1.0 instead of 1.1 | sprint cells of 3 production groups at rows 0-2 | 18 cells x 3 rows x 30 seeds |

## Metric definitions

- `margin` = P progress minus max rival progress in `finish[]` (body lengths; negative = P behind at the finish instant). `winningMargin` = place-1 progress minus place-2 progress.
- Lead changes and P rank changes: trajectory rows with tick x dt >= 3 s, counted as changes between consecutive rows; leader = highest progress, ties by id ascending.
- Paired comparisons: same seed, same row, all other inputs fixed. Delta = X minus Y, X the first-named side, so negative Delta place = X better. Improved / unchanged / worsened are shares of pairs with both races finished. Win rates use all pairs. Margin percentiles use linear interpolation.
- Timing: finish-time median, p5, p95 and max use finished races. Share < 17 s uses all races. Share > 23 s is shown both over finished races and over all races with unresolved counted as late (conservative). Playback +2 s = horizonSeconds + 2 s (the reference presentation adds highlightSeconds to the race duration, see buildPresentationPlan totalWallSeconds); reported separately.
- Unresolved races stay in every denominator. Win rate = wins / all races in the subset; mean place and margins use finished races.

## Selection rule and outcome (pre-registered)

Rule: pick P25 if its calibration has median finish in [17, 23] s, share of finishes > 23 s <= 2.5%, and 0 unresolved; else pick P15 if it passes the same rule; else STOP.

| Candidate | Median finish (s) | Median in range | Share > 23 s (of finished) | Share <= 2.5% | Unresolved | Unresolved = 0 | Pass |
|---|---|---|---|---|---|---|---|
| P25 | 19.88 | true | 0.0% | true | 0 | true | true |
| P15 | 20.76 | true | 0.0% | true | 0 | true | true |

**Outcome: selected P25.** P15 also passed the rule and was not validated, because the rule selects the first passing candidate in the order P25, P15. Validation and the solo envelope check were run for P25 only.

## Calibration results (row 0, 12 seeds)

P25 (`cal-P25`):

| Arm | Subset | Races | Unresolved | Finish median (s) | p5 (s) | p95 (s) | max (s) | Share < 17 s (of all) | Share > 23 s (of finished) | Share > 23 s or unresolved (of all) | Playback +2 s median (s) | Playback +2 s max (s) | Max events (cap 128) | Max opp. diagnostics (cap 84) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P25 | matrix, 72 cells, row 0 | 864 | 0 | 19.88 | 17.27 | 21.99 | 22.28 | 3.1% | 0.0% | 0.0% | 21.88 | 24.28 | 20 | 35 |
| P25 | production, 36 cells, row 0 | 432 | 0 | 19.73 | 16.86 | 20.53 | 21.46 | 6.3% | 0.0% | 0.0% | 21.73 | 23.46 | 19 | 33 |
| P25 | future R03 rest 0.75, 12 cells, row 0 | 144 | 0 | 19.82 | 18.15 | 20.28 | 20.53 | 0.0% | 0.0% | 0.0% | 21.82 | 22.53 | 20 | 32 |

P15 (`cal-P15`):

| Arm | Subset | Races | Unresolved | Finish median (s) | p5 (s) | p95 (s) | max (s) | Share < 17 s (of all) | Share > 23 s (of finished) | Share > 23 s or unresolved (of all) | Playback +2 s median (s) | Playback +2 s max (s) | Max events (cap 128) | Max opp. diagnostics (cap 84) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P15 | matrix, 72 cells, row 0 | 864 | 0 | 20.76 | 18.93 | 21.98 | 22.21 | 0.0% | 0.0% | 0.0% | 22.76 | 24.21 | 21 | 35 |
| P15 | production, 36 cells, row 0 | 432 | 0 | 20.54 | 18.70 | 21.15 | 21.71 | 0.0% | 0.0% | 0.0% | 22.54 | 23.71 | 19 | 34 |
| P15 | future R03 rest 0.75, 12 cells, row 0 | 144 | 0 | 20.64 | 19.47 | 21.11 | 21.19 | 0.0% | 0.0% | 0.0% | 22.64 | 23.19 | 19 | 34 |

## Validation results

Candidate: P25. Seeds 30. Arms: affine (baseline), pace-P25 (selected candidate), pace-P25-sprint-neutral. Modes: row 0 (player at row 0 only) and slot-balanced (rows 0, 1, 2 weighted equally on the 48 production+future cells; the 24 matrix-only cells have row 0 only, so slot rows are restricted to production+future).

### Timing summary

| Arm | Subset | Races | Unresolved | Finish median (s) | p5 (s) | p95 (s) | max (s) | Share < 17 s (of all) | Share > 23 s (of finished) | Share > 23 s or unresolved (of all) | Playback +2 s median (s) | Playback +2 s max (s) | Max events (cap 128) | Max opp. diagnostics (cap 84) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| affine | matrix, 72 cells, row 0 | 2160 | 0 | 20.94 | 20.29 | 21.79 | 22.10 | 0.0% | 0.0% | 0.0% | 22.94 | 24.10 | 21 | 36 |
| affine | production, 36 cells, row 0 | 1080 | 0 | 20.86 | 20.21 | 21.36 | 21.71 | 0.0% | 0.0% | 0.0% | 22.86 | 23.71 | 20 | 35 |
| affine | production, 36 cells, slot-balanced rows 0-2 | 3240 | 0 | 20.92 | 20.43 | 21.52 | 21.93 | 0.0% | 0.0% | 0.0% | 22.92 | 23.93 | 20 | 35 |
| affine | future R03 rest 0.75, 12 cells, row 0 | 360 | 0 | 20.88 | 20.34 | 21.28 | 21.37 | 0.0% | 0.0% | 0.0% | 22.88 | 23.37 | 20 | 34 |
| affine | future R03 rest 0.75, 12 cells, slot-balanced rows 0-2 | 1080 | 0 | 20.90 | 20.47 | 21.20 | 21.38 | 0.0% | 0.0% | 0.0% | 22.90 | 23.38 | 20 | 34 |
| pace-P25 | matrix, 72 cells, row 0 | 2160 | 0 | 20.04 | 17.22 | 21.89 | 22.30 | 3.0% | 0.0% | 0.0% | 22.04 | 24.30 | 20 | 35 |
| pace-P25 | production, 36 cells, row 0 | 1080 | 0 | 19.67 | 16.86 | 20.64 | 21.64 | 6.0% | 0.0% | 0.0% | 21.67 | 23.64 | 20 | 34 |
| pace-P25 | production, 36 cells, slot-balanced rows 0-2 | 3240 | 0 | 19.76 | 17.04 | 20.81 | 21.95 | 4.5% | 0.0% | 0.0% | 21.76 | 23.95 | 20 | 34 |
| pace-P25 | future R03 rest 0.75, 12 cells, row 0 | 360 | 0 | 19.93 | 17.76 | 20.32 | 20.63 | 0.0% | 0.0% | 0.0% | 21.93 | 22.63 | 19 | 33 |
| pace-P25 | future R03 rest 0.75, 12 cells, slot-balanced rows 0-2 | 1080 | 0 | 19.86 | 18.04 | 20.27 | 20.63 | 0.0% | 0.0% | 0.0% | 21.86 | 22.63 | 19 | 33 |
| pace-P25-sprint-neutral | sprint, production, 18 cells, row 0 | 540 | 0 | 19.86 | 16.83 | 20.83 | 21.95 | 7.2% | 0.0% | 0.0% | 21.86 | 23.95 | 19 | 35 |
| pace-P25-sprint-neutral | sprint, production, 18 cells, slot-balanced rows 0-2 | 1620 | 0 | 19.86 | 17.07 | 21.03 | 22.08 | 4.1% | 0.0% | 0.0% | 21.86 | 24.08 | 19 | 35 |

### Per-tier x group: win rate, mean place, lead changes, margin (production groups plus future)

Mode: row 0

| Group | Tier | affine win | affine mean place | affine lead chg after 3 s (share >= 1) | affine mean win margin | pace win | pace mean place | pace lead chg after 3 s (share >= 1) | pace mean win margin |
|---|---|---|---|---|---|---|---|---|---|
| R01-rest1 | common | 97.5% | 1.02 | 1.13 (50.8%) | 6.28 | 100.0% | 1.00 | 0.00 (0.0%) | 17.86 |
| R01-rest1 | rare | 100.0% | 1.00 | 0.93 (46.7%) | 12.34 | 100.0% | 1.00 | 0.00 (0.0%) | 37.78 |
| R01-rest1 | legendary | 100.0% | 1.00 | 0.93 (46.7%) | 14.77 | 100.0% | 1.00 | 0.00 (0.0%) | 54.59 |
| R03-rest1 | common | 36.7% | 2.01 | 1.21 (77.5%) | 2.73 | 31.7% | 2.83 | 0.63 (33.3%) | 4.12 |
| R03-rest1 | rare | 99.2% | 1.01 | 1.23 (73.3%) | 6.01 | 100.0% | 1.00 | 0.00 (0.0%) | 20.89 |
| R03-rest1 | legendary | 100.0% | 1.00 | 0.97 (73.3%) | 8.98 | 100.0% | 1.00 | 0.00 (0.0%) | 39.91 |
| R03-rest0.5 | common | 0.0% | 5.96 | 0.65 (32.5%) | 3.27 | 0.0% | 6.00 | 0.42 (33.3%) | 2.95 |
| R03-rest0.5 | rare | 0.0% | 5.06 | 1.22 (47.5%) | 3.24 | 0.0% | 5.94 | 0.45 (31.7%) | 2.97 |
| R03-rest0.5 | legendary | 36.7% | 2.01 | 1.21 (77.5%) | 2.73 | 31.7% | 2.83 | 0.63 (33.3%) | 4.12 |
| R03-rest0.75 (future) | common | 0.8% | 4.47 | 1.31 (52.5%) | 3.17 | 0.0% | 5.78 | 0.50 (31.7%) | 2.88 |
| R03-rest0.75 (future) | rare | 46.7% | 1.76 | 1.16 (74.2%) | 2.78 | 45.8% | 2.08 | 0.71 (36.7%) | 4.88 |
| R03-rest0.75 (future) | legendary | 100.0% | 1.00 | 1.09 (73.3%) | 6.96 | 100.0% | 1.00 | 0.00 (0.0%) | 25.08 |

Mode: slot-balanced rows 0-2

| Group | Tier | affine win | affine mean place | affine lead chg after 3 s (share >= 1) | affine mean win margin | pace win | pace mean place | pace lead chg after 3 s (share >= 1) | pace mean win margin |
|---|---|---|---|---|---|---|---|---|---|
| R01-rest1 | common | 68.1% | 1.67 | 1.54 (75.3%) | 4.00 | 97.8% | 1.02 | 0.91 (58.9%) | 14.47 |
| R01-rest1 | rare | 98.3% | 1.02 | 1.67 (81.7%) | 8.89 | 100.0% | 1.00 | 0.38 (33.6%) | 34.02 |
| R01-rest1 | legendary | 100.0% | 1.00 | 1.47 (82.2%) | 11.47 | 100.0% | 1.00 | 0.11 (10.8%) | 51.26 |
| R03-rest1 | common | 13.6% | 3.60 | 1.22 (73.1%) | 2.50 | 21.4% | 3.88 | 0.87 (50.0%) | 3.63 |
| R03-rest1 | rare | 57.5% | 1.94 | 1.60 (78.9%) | 3.39 | 98.3% | 1.02 | 0.75 (58.1%) | 16.23 |
| R03-rest1 | legendary | 75.6% | 1.45 | 1.72 (85.6%) | 4.85 | 100.0% | 1.00 | 0.29 (25.8%) | 36.09 |
| R03-rest0.5 | common | 0.0% | 5.99 | 0.99 (57.5%) | 2.80 | 0.0% | 6.00 | 0.76 (48.3%) | 3.10 |
| R03-rest0.5 | rare | 0.0% | 5.59 | 1.19 (62.5%) | 2.80 | 0.0% | 5.98 | 0.73 (46.1%) | 3.18 |
| R03-rest0.5 | legendary | 13.6% | 3.60 | 1.22 (73.1%) | 2.50 | 21.4% | 3.88 | 0.87 (50.0%) | 3.63 |
| R03-rest0.75 (future) | common | 0.3% | 5.30 | 1.22 (64.2%) | 2.79 | 0.0% | 5.91 | 0.75 (45.8%) | 3.14 |
| R03-rest0.75 (future) | rare | 19.2% | 3.28 | 1.23 (72.5%) | 2.45 | 30.3% | 3.24 | 0.91 (53.9%) | 4.20 |
| R03-rest0.75 (future) | legendary | 61.4% | 1.77 | 1.65 (81.1%) | 3.77 | 100.0% | 1.00 | 0.65 (53.9%) | 20.39 |

### Paired comparisons (cell: mean Delta place / win change pp / mean Delta margin / improved / worsened)

Delta = X minus Y (X first-named). Production groups for all comparisons except the rest 0.75 vs 1 comparison, which uses the future group. Pair counts are listed for affine row 0, affine slot, pace row 0, pace slot.

#### trial on vs off

| Subset | Pairs (aff r0 / aff slot / pace r0 / pace slot) | affine row 0 | affine slot | pace-P25 row 0 | pace-P25 slot |
|---|---|---|---|---|---|
| all | 540 / 1620 / 540 / 1620 | -0.107 / +2.6 / +0.91 / 9.1% / 0.0% | -0.141 / +2.1 / +0.91 / 12.7% / 0.3% | -0.172 / +0.7 / +2.87 / 13.0% / 1.1% | -0.138 / +1.9 / +2.83 / 10.6% / 0.6% |
| group R01-rest1 | 180 / 540 / 180 / 540 | -0.006 / +0.6 / +0.60 / 0.6% / 0.0% | -0.074 / +2.0 / +0.65 / 6.5% / 0.2% | 0.000 / 0.0 / +2.59 / 0.0% / 0.0% | -0.007 / +0.7 / +2.65 / 0.7% / 0.0% |
| group R03-rest1 | 180 / 540 / 180 / 540 | -0.100 / +3.9 / +0.69 / 8.9% / 0.0% | -0.176 / +2.6 / +0.66 / 16.3% / 0.6% | -0.244 / +1.1 / +2.98 / 18.3% / 1.7% | -0.202 / +2.8 / +2.99 / 15.6% / 0.9% |
| group R03-rest0.5 | 180 / 540 / 180 / 540 | -0.217 / +3.3 / +1.44 / 17.8% / 0.0% | -0.172 / +1.7 / +1.43 / 15.4% / 0.2% | -0.272 / +1.1 / +3.03 / 20.6% / 1.7% | -0.204 / +2.0 / +2.86 / 15.6% / 0.9% |
| tier common | 180 / 540 / 180 / 540 | -0.106 / +3.9 / +1.46 / 9.4% / 0.0% | -0.189 / +3.7 / +1.45 / 17.0% / 0.4% | -0.244 / +1.1 / +2.97 / 18.3% / 1.7% | -0.202 / +2.8 / +2.96 / 15.6% / 0.9% |
| tier rare | 180 / 540 / 180 / 540 | -0.122 / +0.6 / +0.80 / 9.4% / 0.0% | -0.104 / +0.9 / +0.82 / 9.1% / 0.4% | -0.028 / 0.0 / +2.91 / 2.2% / 0.0% | -0.017 / +0.7 / +2.84 / 1.5% / 0.0% |
| tier legendary | 180 / 540 / 180 / 540 | -0.094 / +3.3 / +0.48 / 8.3% / 0.0% | -0.130 / +1.7 / +0.46 / 12.0% / 0.2% | -0.244 / +1.1 / +2.72 / 18.3% / 1.7% | -0.194 / +2.0 / +2.69 / 14.8% / 0.9% |

#### sprint vs steady

| Subset | Pairs (aff r0 / aff slot / pace r0 / pace slot) | affine row 0 | affine slot | pace-P25 row 0 | pace-P25 slot |
|---|---|---|---|---|---|
| all | 540 / 1620 / 540 / 1620 | -0.185 / +5.2 / +1.72 / 14.8% / 0.6% | -0.241 / +4.8 / +1.72 / 18.1% / 1.4% | -0.324 / +11.8 / +5.64 / 17.0% / 0.7% | -0.385 / +8.6 / +5.60 / 15.2% / 0.7% |
| group R01-rest1 | 180 / 540 / 180 / 540 | +0.006 / -0.6 / +0.82 / 0.0% / 0.6% | -0.089 / +3.9 / +0.92 / 6.3% / 2.4% | 0.000 / 0.0 / +4.39 / 0.0% / 0.0% | +0.007 / -0.7 / +4.29 / 0.0% / 0.7% |
| group R03-rest1 | 180 / 540 / 180 / 540 | -0.167 / +8.3 / +1.32 / 13.9% / 0.6% | -0.294 / +7.0 / +1.26 / 22.2% / 1.3% | -0.467 / +17.8 / +6.22 / 23.9% / 1.1% | -0.576 / +13.5 / +6.34 / 22.4% / 0.7% |
| group R03-rest0.5 | 180 / 540 / 180 / 540 | -0.394 / +7.8 / +3.02 / 30.6% / 0.6% | -0.339 / +3.5 / +2.99 / 25.7% / 0.6% | -0.506 / +17.8 / +6.30 / 27.2% / 1.1% | -0.585 / +13.2 / +6.16 / 23.2% / 0.7% |
| tier common | 180 / 540 / 180 / 540 | -0.183 / +7.2 / +2.86 / 16.1% / 1.1% | -0.311 / +7.8 / +2.81 / 22.8% / 2.6% | -0.467 / +17.8 / +5.98 / 23.9% / 1.1% | -0.565 / +12.4 / +5.80 / 22.0% / 1.5% |
| tier rare | 180 / 540 / 180 / 540 | -0.211 / +0.6 / +1.48 / 15.0% / 0.0% | -0.200 / +3.1 / +1.57 / 15.6% / 0.9% | -0.039 / 0.0 / +5.56 / 3.3% / 0.0% | -0.017 / +0.4 / +5.52 / 1.5% / 0.0% |
| tier legendary | 180 / 540 / 180 / 540 | -0.161 / +7.8 / +0.83 / 13.3% / 0.6% | -0.211 / +3.5 / +0.79 / 15.9% / 0.7% | -0.467 / +17.8 / +5.37 / 23.9% / 1.1% | -0.572 / +13.2 / +5.49 / 22.0% / 0.7% |

#### rest 0.5 vs 1 (R03)

| Subset | Pairs (aff r0 / aff slot / pace r0 / pace slot) | affine row 0 | affine slot | pace-P25 row 0 | pace-P25 slot |
|---|---|---|---|---|---|
| all | 360 / 1080 / 360 / 1080 | +3.003 / -66.4 / -15.17 / 0.0% / 87.8% | +2.728 / -44.4 / -14.85 / 0.0% / 89.0% | +3.314 / -66.7 / -43.63 / 0.0% / 87.2% | +3.321 / -66.1 / -43.44 / 0.0% / 82.4% |
| group R03-rest0.5 | 360 / 1080 / 360 / 1080 | +3.003 / -66.4 / -15.17 / 0.0% / 87.8% | +2.728 / -44.4 / -14.85 / 0.0% / 89.0% | +3.314 / -66.7 / -43.63 / 0.0% / 87.2% | +3.321 / -66.1 / -43.44 / 0.0% / 82.4% |
| tier common | 120 / 360 / 120 / 360 | +3.950 / -36.7 / -19.64 / 0.0% / 100.0% | +2.389 / -13.6 / -19.43 / 0.0% / 80.8% | +3.167 / -31.7 / -41.86 / 0.0% / 93.3% | +2.119 / -21.4 / -39.80 / 0.0% / 68.6% |
| tier rare | 120 / 360 / 120 / 360 | +4.050 / -99.2 / -15.83 / 0.0% / 100.0% | +3.650 / -57.5 / -15.47 / 0.0% / 100.0% | +4.942 / -100.0 / -47.02 / 0.0% / 100.0% | +4.964 / -98.3 / -46.68 / 0.0% / 100.0% |
| tier legendary | 120 / 360 / 120 / 360 | +1.008 / -63.3 / -10.03 / 0.0% / 63.3% | +2.144 / -61.9 / -9.67 / 0.0% / 86.1% | +1.833 / -68.3 / -42.00 / 0.0% / 68.3% | +2.881 / -78.6 / -43.83 / 0.0% / 78.6% |

#### rest 0.75 vs 1 (future, R03)

| Subset | Pairs (aff r0 / aff slot / pace r0 / pace slot) | affine row 0 | affine slot | pace-P25 row 0 | pace-P25 slot |
|---|---|---|---|---|---|
| all | 360 / 1080 / 360 / 1080 | +1.069 / -29.4 / -5.03 / 0.0% / 50.6% | +1.123 / -21.9 / -4.88 / 0.4% / 60.4% | +1.342 / -28.6 / -17.96 / 0.0% / 49.2% | +1.418 / -29.8 / -18.29 / 0.0% / 46.1% |
| group R03-rest0.75 | 360 / 1080 / 360 / 1080 | +1.069 / -29.4 / -5.03 / 0.0% / 50.6% | +1.123 / -21.9 / -4.88 / 0.4% / 60.4% | +1.342 / -28.6 / -17.96 / 0.0% / 49.2% | +1.418 / -29.8 / -18.29 / 0.0% / 46.1% |
| tier common | 120 / 360 / 120 / 360 | +2.458 / -35.8 / -7.23 / 0.0% / 98.3% | +1.706 / -13.3 / -7.06 / 0.0% / 80.0% | +2.950 / -31.7 / -19.63 / 0.0% / 93.3% | +2.028 / -21.4 / -18.86 / 0.0% / 68.6% |
| tier rare | 120 / 360 / 120 / 360 | +0.750 / -52.5 / -5.85 / 0.0% / 53.3% | +1.342 / -38.3 / -5.65 / 0.0% / 76.1% | +1.075 / -54.2 / -19.43 / 0.0% / 54.2% | +2.225 / -68.1 / -20.32 / 0.0% / 69.7% |
| tier legendary | 120 / 360 / 120 / 360 | 0.000 / 0.0 / -2.02 / 0.0% / 0.0% | +0.322 / -14.2 / -1.94 / 1.1% / 25.0% | 0.000 / 0.0 / -14.82 / 0.0% / 0.0% | 0.000 / 0.0 / -15.70 / 0.0% / 0.0% |

#### rare vs common

| Subset | Pairs (aff r0 / aff slot / pace r0 / pace slot) | affine row 0 | affine slot | pace-P25 row 0 | pace-P25 slot |
|---|---|---|---|---|---|
| all | 360 / 1080 / 360 / 1080 | -0.642 / +21.7 / +8.00 / 40.3% / 0.0% | -0.904 / +24.7 / +8.02 / 47.6% / 0.0% | -0.631 / +22.8 / +20.25 / 24.4% / 0.0% | -0.969 / +26.4 / +20.18 / 27.5% / 0.0% |
| group R01-rest1 | 120 / 360 / 120 / 360 | -0.025 / +2.5 / +6.07 / 2.5% / 0.0% | -0.650 / +30.3 / +6.48 / 31.9% / 0.0% | 0.000 / 0.0 / +19.92 / 0.0% / 0.0% | -0.022 / +2.2 / +19.66 / 2.2% / 0.0% |
| group R03-rest1 | 120 / 360 / 120 / 360 | -1.000 / +62.5 / +7.05 / 63.3% / 0.0% | -1.661 / +43.9 / +6.81 / 84.4% / 0.0% | -1.833 / +68.3 / +22.99 / 68.3% / 0.0% | -2.864 / +76.9 / +23.88 / 78.6% / 0.0% |
| group R03-rest0.5 | 120 / 360 / 120 / 360 | -0.900 / 0.0 / +10.86 / 55.0% / 0.0% | -0.400 / 0.0 / +10.78 / 26.4% / 0.0% | -0.058 / 0.0 / +17.84 / 5.0% / 0.0% | -0.019 / 0.0 / +17.00 / 1.7% / 0.0% |
| tier rare vs common | 360 / 1080 / 360 / 1080 | -0.642 / +21.7 / +8.00 / 40.3% / 0.0% | -0.904 / +24.7 / +8.02 / 47.6% / 0.0% | -0.631 / +22.8 / +20.25 / 24.4% / 0.0% | -0.969 / +26.4 / +20.18 / 27.5% / 0.0% |

#### legendary vs rare

| Subset | Pairs (aff r0 / aff slot / pace r0 / pace slot) | affine row 0 | affine slot | pace-P25 row 0 | pace-P25 slot |
|---|---|---|---|---|---|
| all | 360 / 1080 / 360 / 1080 | -1.019 / +12.5 / +4.73 / 33.6% / 0.0% | -0.832 / +11.1 / +4.70 / 38.3% / 0.2% | -1.036 / +10.6 / +19.95 / 31.1% / 0.0% | -0.706 / +7.7 / +19.99 / 23.4% / 0.0% |
| group R01-rest1 | 120 / 360 / 120 / 360 | 0.000 / 0.0 / +2.43 / 0.0% / 0.0% | -0.022 / +1.7 / +2.60 / 1.7% / 0.0% | 0.000 / 0.0 / +16.82 / 0.0% / 0.0% | 0.000 / 0.0 / +17.23 / 0.0% / 0.0% |
| group R03-rest1 | 120 / 360 / 120 / 360 | -0.008 / +0.8 / +2.98 / 0.8% / 0.0% | -0.483 / +18.1 / +2.85 / 32.5% / 0.6% | 0.000 / 0.0 / +19.01 / 0.0% / 0.0% | -0.017 / +1.7 / +19.95 / 1.7% / 0.0% |
| group R03-rest0.5 | 120 / 360 / 120 / 360 | -3.050 / +36.7 / +8.78 / 100.0% / 0.0% | -1.989 / +13.6 / +8.65 / 80.8% / 0.0% | -3.108 / +31.7 / +24.03 / 93.3% / 0.0% | -2.100 / +21.4 / +22.80 / 68.6% / 0.0% |
| tier legendary vs rare | 360 / 1080 / 360 / 1080 | -1.019 / +12.5 / +4.73 / 33.6% / 0.0% | -0.832 / +11.1 / +4.70 / 38.3% / 0.2% | -1.036 / +10.6 / +19.95 / 31.1% / 0.0% | -0.706 / +7.7 / +19.99 / 23.4% / 0.0% |

### Sprint-neutral arm

Neutral sprint = pace-P25 with Sprint mean 1.0 (instead of 1.1). Pace steady and pace +10% sprint are the pace arm's own cells at the same rows, seeds and trial states. Paired comparison: neutral sprint (X) minus pace steady (Y), same seed, row, trial, tier and group.

Mode: row 0

| Group | Tier | Neutral sprint win / mean place | Pace steady win / mean place | Pace +10% sprint win / mean place |
|---|---|---|---|---|
| R01-rest1 | common | 96.7% / 1.05 | 100.0% / 1.00 | 100.0% / 1.00 |
| R01-rest1 | rare | 100.0% / 1.00 | 100.0% / 1.00 | 100.0% / 1.00 |
| R01-rest1 | legendary | 100.0% / 1.00 | 100.0% / 1.00 | 100.0% / 1.00 |
| R03-rest1 | common | 35.0% / 3.57 | 5.0% / 3.53 | 58.3% / 2.13 |
| R03-rest1 | rare | 100.0% / 1.00 | 100.0% / 1.00 | 100.0% / 1.00 |
| R03-rest1 | legendary | 100.0% / 1.00 | 100.0% / 1.00 | 100.0% / 1.00 |
| R03-rest0.5 | common | 0.0% / 6.00 | 0.0% / 6.00 | 0.0% / 6.00 |
| R03-rest0.5 | rare | 0.0% / 6.00 | 0.0% / 6.00 | 0.0% / 5.88 |
| R03-rest0.5 | legendary | 35.0% / 3.57 | 5.0% / 3.53 | 58.3% / 2.13 |

Paired: neutral sprint minus pace steady, row 0:

| Subset | Pairs | Mean Delta place / win change pp / mean Delta margin / improved / worsened |
|---|---|---|
| all | 540 | +0.013 / +6.3 / -0.06 / 10.7% / 8.9% |
| group R01-rest1 | 180 | +0.017 / -1.1 / -1.00 / 0.0% / 1.1% |
| group R03-rest1 | 180 | +0.011 / +10.0 / +0.36 / 16.1% / 12.8% |
| group R03-rest0.5 | 180 | +0.011 / +10.0 / +0.46 / 16.1% / 12.8% |
| tier common | 180 | +0.028 / +8.9 / -0.04 / 16.1% / 13.9% |
| tier rare | 180 | 0.000 / 0.0 / -0.20 / 0.0% / 0.0% |
| tier legendary | 180 | +0.011 / +10.0 / +0.05 / 16.1% / 12.8% |
| common x R01-rest1 | 60 | +0.050 / -3.3 / -1.17 / 0.0% / 3.3% |
| rare x R01-rest1 | 60 | 0.000 / 0.0 / -1.21 / 0.0% / 0.0% |
| legendary x R01-rest1 | 60 | 0.000 / 0.0 / -0.63 / 0.0% / 0.0% |
| common x R03-rest1 | 60 | +0.033 / +30.0 / +0.50 / 48.3% / 38.3% |
| rare x R03-rest1 | 60 | 0.000 / 0.0 / +0.28 / 0.0% / 0.0% |
| legendary x R03-rest1 | 60 | 0.000 / 0.0 / +0.29 / 0.0% / 0.0% |
| common x R03-rest0.5 | 60 | 0.000 / 0.0 / +0.55 / 0.0% / 0.0% |
| rare x R03-rest0.5 | 60 | 0.000 / 0.0 / +0.32 / 0.0% / 0.0% |
| legendary x R03-rest0.5 | 60 | +0.033 / +30.0 / +0.50 / 48.3% / 38.3% |

Mode: slot-balanced rows 0-2

| Group | Tier | Neutral sprint win / mean place | Pace steady win / mean place | Pace +10% sprint win / mean place |
|---|---|---|---|---|
| R01-rest1 | common | 81.1% / 1.39 | 98.9% / 1.01 | 96.7% / 1.03 |
| R01-rest1 | rare | 100.0% / 1.00 | 100.0% / 1.00 | 100.0% / 1.00 |
| R01-rest1 | legendary | 100.0% / 1.00 | 100.0% / 1.00 | 100.0% / 1.00 |
| R03-rest1 | common | 17.2% / 4.28 | 1.7% / 4.74 | 41.1% / 3.02 |
| R03-rest1 | rare | 90.0% / 1.15 | 97.8% / 1.02 | 98.9% / 1.01 |
| R03-rest1 | legendary | 100.0% / 1.00 | 100.0% / 1.00 | 100.0% / 1.00 |
| R03-rest0.5 | common | 0.0% / 6.00 | 0.0% / 6.00 | 0.0% / 6.00 |
| R03-rest0.5 | rare | 0.0% / 6.00 | 0.0% / 6.00 | 0.0% / 5.96 |
| R03-rest0.5 | legendary | 17.2% / 4.28 | 1.7% / 4.74 | 41.1% / 3.02 |

Paired: neutral sprint minus pace steady, slot-balanced rows 0-2:

| Subset | Pairs | Mean Delta place / win change pp / mean Delta margin / improved / worsened |
|---|---|---|
| all | 1620 | -0.046 / +0.6 / +0.07 / 9.3% / 7.2% |
| group R01-rest1 | 540 | +0.126 / -5.9 / -0.97 / 0.0% / 6.3% |
| group R03-rest1 | 540 | -0.111 / +2.6 / +0.55 / 13.9% / 9.1% |
| group R03-rest0.5 | 540 | -0.154 / +5.2 / +0.61 / 13.9% / 6.3% |
| tier common | 540 | -0.028 / -0.7 / -0.07 / 13.9% / 12.6% |
| tier rare | 540 | +0.043 / -2.6 / +0.03 / 0.0% / 2.8% |
| tier legendary | 540 | -0.154 / +5.2 / +0.24 / 13.9% / 6.3% |
| common x R01-rest1 | 180 | +0.378 / -17.8 / -1.53 / 0.0% / 18.9% |
| rare x R01-rest1 | 180 | 0.000 / 0.0 / -0.88 / 0.0% / 0.0% |
| legendary x R01-rest1 | 180 | 0.000 / 0.0 / -0.50 / 0.0% / 0.0% |
| common x R03-rest1 | 180 | -0.461 / +15.6 / +0.81 / 41.7% / 18.9% |
| rare x R03-rest1 | 180 | +0.128 / -7.8 / +0.45 / 0.0% / 8.3% |
| legendary x R03-rest1 | 180 | 0.000 / 0.0 / +0.41 / 0.0% / 0.0% |
| common x R03-rest0.5 | 180 | 0.000 / 0.0 / +0.52 / 0.0% / 0.0% |
| rare x R03-rest0.5 | 180 | 0.000 / 0.0 / +0.51 / 0.0% / 0.0% |
| legendary x R03-rest0.5 | 180 | -0.461 / +15.6 / +0.81 / 41.7% / 18.9% |

## Solo envelope check (selected candidate)

Experiment `controller-recenter`, seed `opus-envelope`, raceId `ENV`, field base 0.5, steady, trial off, player at row 0. finish x k should be roughly constant if the whole envelope scales with k = (sampled / R0)^ALPHA.

| Rating | Player sampled | k | Finish (s) | Finish x k | Status | Winner | Player place |
|---|---|---|---|---|---|---|---|
| 5 | 5.160 | 0.8594 | 24.074 | 20.689 | finished | P | 1 |
| 8 | 8.256 | 0.9665 | 21.413 | 20.697 | finished | P | 1 |
| 10 | 10.320 | 1.0220 | 20.252 | 20.698 | finished | P | 1 |
| 14 | 14.448 | 1.1117 | 18.598 | 20.675 | finished | P | 1 |
| 20 | 20.640 | 1.2154 | 17.019 | 20.685 | finished | P | 1 |
| 27.7 | 28.586 | 1.3185 | 15.696 | 20.694 | finished | P | 1 |

## Verification

| Arm | Races | Max map residual (tolerance ~1e-3 from rounded output) | Player row = slot | Player top speed range | Player pace range | Unresolved reasons | Max events | Max opp. diagnostics | Substitution anchor occurrences |
|---|---|---|---|---|---|---|---|---|---|
| calibration cal-P25 | 864 | 0.000769 | true | 11.581 – 18.262 | 0.827 – 1.304 | {} | 20 | 35 | 1,1,1,1,1,1,1,1 |
| calibration cal-P15 | 864 | 0.000631 | true | 12.288 – 16.149 | 0.878 – 1.153 | {} | 21 | 35 | 1,1,1,1,1,1,1,1 |
| affine | 5040 | 0.000500 | true | 10.489 – 22.063 | n/a | {} | 21 | 36 | 1,1 |
| pace-P25 | 5040 | 0.000770 | true | 11.612 – 18.302 | 0.829 – 1.307 | {} | 20 | 35 | 1,1,1,1,1,1,1,1 |
| pace-P25-sprint-neutral | 1620 | 0.000718 | true | 11.444 – 17.871 | 0.817 – 1.276 | {} | 19 | 35 | 1,1,1,1,1,1,1,1,1 |

- Reference SHA-256 3d3bd83107da7db38d2b4f902ce9be304aaed52fb49612cd9b90b9ed8ac7a07e; rules version plan13-physics-v3; guard caps read from the module: mechanical events 128, opportunity diagnostics 84.
- Line endings: 0 CRLF and 936 LF line breaks in the reference; normalization to LF is a no-op.
- Determinism spot check (re-running races, affine 18 races, pace-P25 18 races): identical.
- Missing paired partners (should be 0): 0.

## Limitations

- Crossed seeds: the same seeds are used across cells, rows and arms, so pairs are not independent and pooled pair counts overstate precision. No standard errors or confidence intervals are reported.
- The matrix is an equal-weight balance over tiers, race groups, stances, trial states and rest factors. It is not player frequency; the production mix is not modelled.
- Slot-balanced is a proxy: rows 0, 1 and 2 weighted equally on the production+future cells. It is not an implemented seeded start-slot rule.
- The pace arms change the accepted Plan 13 acceleration, braking, turn-rate application and remove the 8-12 speed clamp. They are an alternative mechanic, not a calibration of the accepted mechanic. The affine arm also removes the clamp, as in experiment 02.
- Calibration used 12 seeds and the validation used 30 fresh seeds; the selection rule was applied to calibration only.
- The R03 rest 0.75 group is future-only and not reachable in the current 2-race slice.
- Player base speed = tier rating x rest, so R03 rest 0.5 legendary (10.0) and R03 rested common (10.0) are the same player input and produce identical races. Those table rows repeat by construction; the same input is counted in both places.
- The noweave and matrix-only groups are not part of the production summaries.
- Unresolved races are counted in every denominator; the late-or-unresolved share is the conservative timing figure.
- Win rates in the tier x group tables pool both trial states and both stances unless the table states otherwise.

