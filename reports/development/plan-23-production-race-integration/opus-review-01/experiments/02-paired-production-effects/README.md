# 02 — Paired production effects under the affine candidate (Opus-review diagnostic)

**Author:** bounded experiment-writer subagent (claude-haiku-5-5), delegated by the Opus reviewer. **Command (from repo root):** `node reports/development/plan-23-production-race-integration/opus-review-01/experiments/02-paired-production-effects/run.mjs` (about 153 s wall; per-arm compute 35.7 s, 113.5 s, 3.1 s). **Output:** `results.json` (summaries and per-cell aggregates; no trajectories). A determinism spot check (re-running sampled races) matched exactly.

## Hypothesis (from the brief)

Under the affine candidate (`8.25 + 0.5*x`, selected experiment `weave-rank-strong-contact`), in the cases production actually has, tier and fatigue differences dominate outcomes, the +5% trial and Sprint have small effects, the player fixed front-row start inflates win rates, and in-race weave/contact randomness rarely reorders ducks.

## Method and substitutions

- Reference: `reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs`, read-only. SHA-256 `3d3bd83107da7db38d2b4f902ce9be304aaed52fb49612cd9b90b9ed8ac7a07e`. Loaded in memory with the experiment 01 string-patch loader (copied into `run.mjs`, not imported). No physics constant changed.
- Substitutions: (1) PRNG import URL points at repo `src/core/prng.mjs`; (2) the sampled top-speed clamp is replaced by `8.25 + 0.5 * x`, so the reference 8–12 clamp is not applied (player top speeds in these runs span 10.45–22.10); (3) slot-balanced arm only: the player start row is swapped with same-lane rival C (row 1) or E (row 2).
- Player rating input = tier rating × rest factor; trial and stance are applied inside the module.

Cases:

| Group | raceId | Field base | Rest | Status |
|---|---|---:|---:|---|
| R01 rested | R01 | 8 | 1 | current |
| R03 rested | R03 | 11.2 | 1 | current |
| R03 after R01 | R03 | 11.2 | 0.5 | current (same duck as R01) |
| R03 rest 0.75 | R03 | 11.2 | 0.75 | future, not reachable in current 2-race slice |

Tiers: common 10, rare 14, legendary 20. Stance steady/sprint × trial off/on gives 12 cells per race group: 48 cells in total, 24 of them rested.

Seeds: `opus-r01-paired-01` … `opus-r01-paired-40` (40 seeds), the same set for every cell and arm (paired design).

Arms:

| Arm | Experiment | Map | Start row(s) | Cells | Races |
|---|---|---|---|---:|---:|
| affine-row0 | weave-rank-strong-contact | `8.25 + 0.5*x` | 0 (current fixture) | 48 | 1920 |
| affine-slot-balanced | weave-rank-strong-contact | `8.25 + 0.5*x` | 0, 1, 2 weighted equally (proxy) | 48 | 5760 |
| affine-row0-noweave | controller-recenter | `8.25 + 0.5*x` | 0 | 24 (rested only) | 960 |

Metric definitions:

- `margin` = P progress minus max rival progress in `finish[]` (body lengths; negative = P behind at the finish instant).
- `winningMargin` = place-1 progress minus place-2 progress.
- `leadChangesAfter3s` / `playerPlaceChangesAfter3s`: trajectory rows with tick×dt ≥ 3 s (including the duplicated terminal rows); leader = highest progress, ties by id ascending; P rank uses the same ordering; counted as changes between consecutive sampled rows.
- Paired comparisons: same seed, same slot, all other inputs fixed. Δ = X minus Y, with X the first-named side, so negative Δplace = X better. Improved / unchanged / worsened are shares of pairs with both races finished. Win rates use all pairs (an unresolved race would count as a non-win; none occurred). Δmargin percentiles use linear interpolation.
- Splits: by race group, and by tier (tier comparisons are labelled by the pair, e.g. "rare vs common").
- Slot-balanced: pairs from slots 0, 1 and 2 are pooled; every slot contributes an identical pair set, so slots carry equal weight.
- Unresolved races are kept in every denominator. Zero unresolved races occurred in any arm.

## Results

### Arm and group summaries

| Arm | Subset | Races | Unresolved | Finish median / p95 / max (s) | Share finish > 23 s | Win rate | Mean place | Lead changes after 3 s (mean; share >= 1) | P rank changes after 3 s (mean) | Mean winning margin |
|---|---|---:|---:|---|---:|---:|---:|---|---:|---:|
| affine-row0 | all | 1920 | 0 | 20.88 / 21.31 / 21.81 | 0.0% | 56.4% | 2.41 | 1.18; 60.6% | 2.40 | 6.08 |
| affine-row0 | group R01-rest1 | 480 | 0 | 20.68 / 21.40 / 21.81 | 0.0% | 99.8% | 1.00 | 0.83; 46.0% | 0.83 | 12.55 |
| affine-row0 | group R03-rest1 | 480 | 0 | 20.75 / 21.17 / 21.37 | 0.0% | 72.7% | 1.50 | 1.44; 74.6% | 1.90 | 4.84 |
| affine-row0 | group R03-rest0.5 | 480 | 0 | 21.04 / 21.31 / 21.37 | 0.0% | 8.3% | 4.49 | 1.03; 52.5% | 3.89 | 3.15 |
| affine-row0 | group R03-rest0.75 | 480 | 0 | 20.93 / 21.25 / 21.37 | 0.0% | 44.6% | 2.65 | 1.41; 69.2% | 2.97 | 3.79 |
| affine-slot-balanced | all | 5760 | 0 | 20.95 / 21.41 / 21.96 | 0.0% | 41.2% | 3.09 | 1.34; 71.3% | 2.86 | 4.34 |
| affine-slot-balanced | group R01-rest1 | 1440 | 0 | 21.02 / 21.70 / 21.96 | 0.0% | 90.1% | 1.19 | 1.49; 77.9% | 2.81 | 8.69 |
| affine-slot-balanced | group R03-rest1 | 1440 | 0 | 20.86 / 21.16 / 21.37 | 0.0% | 46.2% | 2.44 | 1.47; 77.5% | 3.12 | 3.21 |
| affine-slot-balanced | group R03-rest0.5 | 1440 | 0 | 20.99 / 21.25 / 21.37 | 0.0% | 3.3% | 5.13 | 1.07; 59.5% | 2.50 | 2.67 |
| affine-slot-balanced | group R03-rest0.75 | 1440 | 0 | 20.95 / 21.24 / 21.37 | 0.0% | 25.1% | 3.59 | 1.35; 70.3% | 2.99 | 2.80 |
| affine-row0-noweave | all | 960 | 0 | 20.31 / 20.93 / 21.23 | 0.0% | 88.0% | 1.17 | 0.75; 29.8% | 0.79 | 9.54 |
| affine-row0-noweave | group R01-rest1 | 480 | 0 | 20.31 / 20.99 / 21.23 | 0.0% | 100.0% | 1.00 | 0.00; 0.0% | 0.00 | 13.10 |
| affine-row0-noweave | group R03-rest1 | 480 | 0 | 20.33 / 20.80 / 20.84 | 0.0% | 76.0% | 1.35 | 1.49; 59.6% | 1.59 | 5.99 |

Note: the "affine-row0-noweave" arm covers rested cells only, so its "all" row is rested-only and is not comparable to the all-cell rows of the other arms. The "affine-row0-noweave" group R03-rest1 row is the same cells as affine-row0 R03-rest1.

Win rate and mean place by tier × race group (pooled over stance and trial; cells are win rate / mean place):

| Arm | Group | Common win / place | Rare win / place | Legendary win / place |
|---|---|---|---|---|
| affine-row0 | R01-rest1 | 99.4% / 1.01 | 100.0% / 1.00 | 100.0% / 1.00 |
| affine-row0 | R03-rest1 | 25.0% / 2.42 | 93.1% / 1.07 | 100.0% / 1.00 |
| affine-row0 | R03-rest0.5 | 0.0% / 5.99 | 0.0% / 5.07 | 25.0% / 2.42 |
| affine-row0 | R03-rest0.75 | 0.6% / 4.76 | 36.3% / 2.15 | 96.9% / 1.03 |
| affine-slot-balanced | R01-rest1 | 72.1% / 1.55 | 98.1% / 1.03 | 100.0% / 1.00 |
| affine-slot-balanced | R03-rest1 | 10.0% / 3.83 | 51.0% / 2.05 | 77.5% / 1.44 |
| affine-slot-balanced | R03-rest0.5 | 0.0% / 6.00 | 0.0% / 5.58 | 10.0% / 3.83 |
| affine-slot-balanced | R03-rest0.75 | 0.2% / 5.39 | 14.0% / 3.56 | 61.3% / 1.82 |
| affine-row0-noweave | R01-rest1 | 100.0% / 1.00 | 100.0% / 1.00 | 100.0% / 1.00 |
| affine-row0-noweave | R03-rest1 | 28.1% / 2.04 | 100.0% / 1.00 | 100.0% / 1.00 |

### Paired comparisons

Each table: Δ = X minus Y. "Subset" rows split the same pairs by race group or by tier label. "affine-row0-noweave" has rested cells only, so the rest comparisons have no applicable pairs in that arm.

#### trial on vs off

| Arm | Subset | Pairs (unresolved) | Mean Δplace | Improved / unchanged / worsened | Win X / Y | Δwin (pp) | Mean Δmargin | Δmargin p10 / p50 / p90 |
|---|---|---:|---:|---|---|---:|---:|---|
| affine-row0 | all | 960 (0) | -0.114 | 10.2% / 89.6% / 0.2% | 57.9% / 54.8% | 3.1 | 0.91 | 0.04 / 0.94 / 1.52 |
| affine-row0 | group R01-rest1 | 240 (0) | -0.004 | 0.4% / 99.6% / 0.0% | 100.0% / 99.6% | 0.4 | 0.63 | 0.00 / 0.66 / 1.19 |
| affine-row0 | group R03-rest1 | 240 (0) | -0.100 | 8.8% / 91.3% / 0.0% | 74.6% / 70.8% | 3.8 | 0.65 | 0.00 / 0.74 / 1.28 |
| affine-row0 | group R03-rest0.5 | 240 (0) | -0.179 | 15.8% / 83.8% / 0.4% | 10.0% / 6.7% | 3.3 | 1.42 | 0.77 / 1.25 / 2.42 |
| affine-row0 | group R03-rest0.75 | 240 (0) | -0.171 | 15.8% / 83.8% / 0.4% | 47.1% / 42.1% | 5.0 | 0.96 | 0.41 / 0.99 / 1.37 |
| affine-row0 | tier common | 320 (0) | -0.141 | 13.1% / 86.6% / 0.3% | 32.8% / 29.7% | 3.1 | 1.34 | 0.80 / 1.18 / 2.33 |
| affine-row0 | tier rare | 320 (0) | -0.125 | 10.9% / 88.8% / 0.3% | 59.1% / 55.6% | 3.4 | 0.93 | 0.42 / 0.91 / 1.34 |
| affine-row0 | tier legendary | 320 (0) | -0.075 | 6.6% / 93.4% / 0.0% | 81.9% / 79.1% | 2.8 | 0.48 | 0.00 / 0.38 / 1.23 |
| affine-slot-balanced | all | 2880 (0) | -0.140 | 12.7% / 87.0% / 0.4% | 42.6% / 39.7% | 2.9 | 0.92 | 0.03 / 0.97 / 1.66 |
| affine-slot-balanced | group R01-rest1 | 720 (0) | -0.069 | 5.8% / 94.0% / 0.1% | 91.4% / 88.8% | 2.6 | 0.63 | 0.00 / 0.63 / 1.29 |
| affine-slot-balanced | group R03-rest1 | 720 (0) | -0.156 | 14.2% / 85.6% / 0.3% | 47.6% / 44.7% | 2.9 | 0.68 | 0.00 / 0.75 / 1.33 |
| affine-slot-balanced | group R03-rest0.5 | 720 (0) | -0.131 | 12.2% / 87.2% / 0.6% | 3.9% / 2.8% | 1.1 | 1.43 | 0.84 / 1.27 / 2.40 |
| affine-slot-balanced | group R03-rest0.75 | 720 (0) | -0.203 | 18.5% / 81.1% / 0.4% | 27.6% / 22.6% | 5.0 | 0.95 | 0.37 / 1.02 / 1.39 |
| affine-slot-balanced | tier common | 960 (0) | -0.151 | 14.1% / 85.4% / 0.5% | 22.0% / 19.2% | 2.8 | 1.37 | 0.80 / 1.25 / 2.32 |
| affine-slot-balanced | tier rare | 960 (0) | -0.146 | 12.9% / 86.8% / 0.3% | 42.1% / 39.5% | 2.6 | 0.91 | 0.40 / 0.92 / 1.35 |
| affine-slot-balanced | tier legendary | 960 (0) | -0.122 | 11.0% / 88.8% / 0.2% | 63.8% / 60.5% | 3.3 | 0.49 | 0.00 / 0.37 / 1.26 |
| affine-row0-noweave | all | 480 (0) | -0.067 | 5.6% / 94.4% / 0.0% | 88.8% / 87.3% | 1.5 | 0.67 | 0.00 / 0.78 / 1.28 |
| affine-row0-noweave | group R01-rest1 | 240 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 0.63 | 0.00 / 0.74 / 1.22 |
| affine-row0-noweave | group R03-rest1 | 240 (0) | -0.133 | 11.3% / 88.8% / 0.0% | 77.5% / 74.6% | 2.9 | 0.71 | 0.00 / 0.85 / 1.32 |
| affine-row0-noweave | tier common | 160 (0) | -0.200 | 16.9% / 83.1% / 0.0% | 66.3% / 61.9% | 4.4 | 1.19 | 0.99 / 1.20 / 1.35 |
| affine-row0-noweave | tier rare | 160 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 0.73 | 0.41 / 0.79 / 0.98 |
| affine-row0-noweave | tier legendary | 160 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 0.09 | -0.06 / 0.01 / 0.36 |

#### sprint vs steady

| Arm | Subset | Pairs (unresolved) | Mean Δplace | Improved / unchanged / worsened | Win X / Y | Δwin (pp) | Mean Δmargin | Δmargin p10 / p50 / p90 |
|---|---|---:|---:|---|---|---:|---:|---|
| affine-row0 | all | 960 (0) | -0.201 | 16.3% / 79.8% / 4.0% | 58.3% / 54.4% | 4.0 | 1.46 | -1.15 / 1.06 / 4.42 |
| affine-row0 | group R01-rest1 | 240 (0) | 0.004 | 0.0% / 99.6% / 0.4% | 99.6% / 100.0% | -0.4 | 1.05 | -0.51 / 0.59 / 3.61 |
| affine-row0 | group R03-rest1 | 240 (0) | -0.117 | 12.9% / 82.1% / 5.0% | 75.4% / 70.0% | 5.4 | 0.99 | -0.96 / 0.14 / 3.52 |
| affine-row0 | group R03-rest0.5 | 240 (0) | -0.362 | 26.3% / 68.3% / 5.4% | 10.8% / 5.8% | 5.0 | 2.33 | -1.58 / 2.62 / 6.66 |
| affine-row0 | group R03-rest0.75 | 240 (0) | -0.329 | 25.8% / 69.2% / 5.0% | 47.5% / 41.7% | 5.8 | 1.47 | -1.17 / 1.36 / 4.15 |
| affine-row0 | tier common | 320 (0) | -0.247 | 20.0% / 75.3% / 4.7% | 33.1% / 29.4% | 3.8 | 2.26 | -1.54 / 2.47 / 6.15 |
| affine-row0 | tier rare | 320 (0) | -0.263 | 18.8% / 77.5% / 3.8% | 59.1% / 55.6% | 3.4 | 1.44 | -1.20 / 1.53 / 3.94 |
| affine-row0 | tier legendary | 320 (0) | -0.094 | 10.0% / 86.6% / 3.4% | 82.8% / 78.1% | 4.7 | 0.68 | -0.59 / 0.03 / 3.19 |
| affine-slot-balanced | all | 2880 (0) | -0.261 | 20.4% / 75.8% / 3.7% | 43.4% / 38.9% | 4.5 | 1.49 | -1.13 / 1.07 / 4.62 |
| affine-slot-balanced | group R01-rest1 | 720 (0) | -0.103 | 7.6% / 90.8% / 1.5% | 92.5% / 87.6% | 4.9 | 1.07 | -0.53 / 0.42 / 3.58 |
| affine-slot-balanced | group R03-rest1 | 720 (0) | -0.247 | 21.3% / 73.8% / 5.0% | 49.0% / 43.3% | 5.7 | 0.97 | -0.96 / 0.13 / 3.59 |
| affine-slot-balanced | group R03-rest0.5 | 720 (0) | -0.319 | 23.3% / 73.2% / 3.5% | 4.7% / 1.9% | 2.8 | 2.42 | -1.52 / 2.72 / 7.00 |
| affine-slot-balanced | group R03-rest0.75 | 720 (0) | -0.375 | 29.6% / 65.6% / 4.9% | 27.5% / 22.8% | 4.7 | 1.48 | -1.24 / 1.46 / 4.30 |
| affine-slot-balanced | tier common | 960 (0) | -0.326 | 24.4% / 71.8% / 3.9% | 23.3% / 17.8% | 5.5 | 2.33 | -1.51 / 2.63 / 6.51 |
| affine-slot-balanced | tier rare | 960 (0) | -0.296 | 22.0% / 74.9% / 3.1% | 43.0% / 38.5% | 4.5 | 1.49 | -1.19 / 1.60 / 4.16 |
| affine-slot-balanced | tier legendary | 960 (0) | -0.162 | 15.0% / 80.8% / 4.2% | 64.0% / 60.4% | 3.5 | 0.64 | -0.65 / 0.03 / 3.00 |
| affine-row0-noweave | all | 480 (0) | -0.042 | 8.3% / 88.5% / 3.1% | 92.1% / 84.0% | 8.1 | 1.04 | -0.76 / 0.28 / 3.82 |
| affine-row0-noweave | group R01-rest1 | 240 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 1.10 | -0.36 / 0.55 / 3.91 |
| affine-row0-noweave | group R03-rest1 | 240 (0) | -0.083 | 16.7% / 77.1% / 6.3% | 84.2% / 67.9% | 16.3 | 0.98 | -1.09 / 0.00 / 3.75 |
| affine-row0-noweave | tier common | 160 (0) | -0.125 | 25.0% / 65.6% / 9.4% | 76.3% / 51.9% | 24.4 | 2.08 | -1.53 / 2.73 / 4.63 |
| affine-row0-noweave | tier rare | 160 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 1.11 | -1.09 / 1.55 / 2.42 |
| affine-row0-noweave | tier legendary | 160 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | -0.05 | -0.26 / -0.05 / 0.25 |

#### rest 0.5 vs 1 (R03)

| Arm | Subset | Pairs (unresolved) | Mean Δplace | Improved / unchanged / worsened | Win X / Y | Δwin (pp) | Mean Δmargin | Δmargin p10 / p50 / p90 |
|---|---|---:|---:|---|---|---:|---:|---|
| affine-row0 | all | 480 (0) | 2.998 | 0.0% / 8.5% / 91.5% | 8.3% / 72.7% | -64.4 | -14.87 | -21.00 / -14.84 / -8.11 |
| affine-row0 | group R03-rest0.5 | 480 (0) | 2.998 | 0.0% / 8.5% / 91.5% | 8.3% / 72.7% | -64.4 | -14.87 | -21.00 / -14.84 / -8.11 |
| affine-row0 | tier common | 160 (0) | 3.575 | 0.0% / 0.6% / 99.4% | 0.0% / 25.0% | -25.0 | -18.99 | -24.01 / -18.82 / -14.55 |
| affine-row0 | tier rare | 160 (0) | 4.000 | 0.0% / 0.0% / 100.0% | 0.0% / 93.1% | -93.1 | -15.49 | -19.18 / -15.18 / -12.31 |
| affine-row0 | tier legendary | 160 (0) | 1.419 | 0.0% / 25.0% / 75.0% | 25.0% / 100.0% | -75.0 | -10.13 | -14.17 / -10.47 / -6.01 |
| affine-slot-balanced | all | 1440 (0) | 2.693 | 0.0% / 11.0% / 89.0% | 3.3% / 46.2% | -42.9 | -14.88 | -20.84 / -15.11 / -8.16 |
| affine-slot-balanced | group R03-rest0.5 | 1440 (0) | 2.693 | 0.0% / 11.0% / 89.0% | 3.3% / 46.2% | -42.9 | -14.88 | -20.84 / -15.11 / -8.16 |
| affine-slot-balanced | tier common | 480 (0) | 2.169 | 0.0% / 19.2% / 80.8% | 0.0% / 10.0% | -10.0 | -19.20 | -23.17 / -19.23 / -15.15 |
| affine-slot-balanced | tier rare | 480 (0) | 3.523 | 0.0% / 1.7% / 98.3% | 0.0% / 51.0% | -51.0 | -15.39 | -19.07 / -15.36 / -11.90 |
| affine-slot-balanced | tier legendary | 480 (0) | 2.388 | 0.0% / 12.1% / 87.9% | 10.0% / 77.5% | -67.5 | -10.04 | -13.88 / -10.48 / -5.69 |
| affine-row0-noweave | all | 0 | n/a | n/a | n/a | n/a | n/a | n/a |

#### rest 0.75 vs 1 (future, R03)

| Arm | Subset | Pairs (unresolved) | Mean Δplace | Improved / unchanged / worsened | Win X / Y | Δwin (pp) | Mean Δmargin | Δmargin p10 / p50 / p90 |
|---|---|---:|---:|---|---|---:|---:|---|
| affine-row0 | all | 480 (0) | 1.152 | 0.0% / 46.5% / 53.5% | 44.6% / 72.7% | -28.1 | -4.94 | -7.82 / -5.34 / -1.22 |
| affine-row0 | group R03-rest0.75 | 480 (0) | 1.152 | 0.0% / 46.5% / 53.5% | 44.6% / 72.7% | -28.1 | -4.94 | -7.82 / -5.34 / -1.22 |
| affine-row0 | tier common | 160 (0) | 2.344 | 0.0% / 3.8% / 96.3% | 0.6% / 25.0% | -24.4 | -6.82 | -8.42 / -6.78 / -4.95 |
| affine-row0 | tier rare | 160 (0) | 1.081 | 0.0% / 38.8% / 61.3% | 36.3% / 93.1% | -56.9 | -6.00 | -8.35 / -5.96 / -3.75 |
| affine-row0 | tier legendary | 160 (0) | 0.031 | 0.0% / 96.9% / 3.1% | 96.9% / 100.0% | -3.1 | -2.00 | -3.58 / -2.06 / -0.40 |
| affine-slot-balanced | all | 1440 (0) | 1.147 | 0.1% / 39.3% / 60.6% | 25.1% / 46.2% | -21.0 | -4.94 | -7.82 / -5.40 / -1.22 |
| affine-slot-balanced | group R03-rest0.75 | 1440 (0) | 1.147 | 0.1% / 39.3% / 60.6% | 25.1% / 46.2% | -21.0 | -4.94 | -7.82 / -5.40 / -1.22 |
| affine-slot-balanced | tier common | 480 (0) | 1.558 | 0.0% / 22.3% / 77.7% | 0.2% / 10.0% | -9.8 | -6.94 | -8.77 / -6.93 / -4.97 |
| affine-slot-balanced | tier rare | 480 (0) | 1.506 | 0.2% / 21.7% / 78.1% | 14.0% / 51.0% | -37.1 | -5.74 | -7.76 / -5.96 / -3.55 |
| affine-slot-balanced | tier legendary | 480 (0) | 0.377 | 0.2% / 74.0% / 25.8% | 61.3% / 77.5% | -16.3 | -2.16 | -3.74 / -2.20 / -0.33 |
| affine-row0-noweave | all | 0 | n/a | n/a | n/a | n/a | n/a | n/a |

#### rare vs common

| Arm | Subset | Pairs (unresolved) | Mean Δplace | Improved / unchanged / worsened | Win X / Y | Δwin (pp) | Mean Δmargin | Δmargin p10 / p50 / p90 |
|---|---|---:|---:|---|---|---:|---:|---|
| affine-row0 | all | 640 (0) | -1.223 | 55.0% / 45.0% / 0.0% | 57.3% / 31.3% | 26.1 | 7.96 | 5.00 / 7.40 / 11.90 |
| affine-row0 | group R01-rest1 | 160 (0) | -0.006 | 0.6% / 99.4% / 0.0% | 100.0% / 99.4% | 0.6 | 6.08 | 4.15 / 6.39 / 7.40 |
| affine-row0 | group R03-rest1 | 160 (0) | -1.350 | 72.5% / 27.5% / 0.0% | 93.1% / 25.0% | 68.1 | 7.15 | 4.70 / 7.15 / 9.96 |
| affine-row0 | group R03-rest0.5 | 160 (0) | -0.925 | 49.4% / 50.6% / 0.0% | 0.0% / 0.0% | 0.0 | 10.65 | 7.16 / 10.38 / 14.85 |
| affine-row0 | group R03-rest0.75 | 160 (0) | -2.612 | 97.5% / 2.5% / 0.0% | 36.3% / 0.6% | 35.6 | 7.98 | 6.17 / 7.72 / 9.98 |
| affine-row0 | tier rare vs common | 640 (0) | -1.223 | 55.0% / 45.0% / 0.0% | 57.3% / 31.3% | 26.1 | 7.96 | 5.00 / 7.40 / 11.90 |
| affine-slot-balanced | all | 1920 (0) | -1.136 | 55.3% / 44.7% / 0.1% | 40.8% / 20.6% | 20.2 | 8.00 | 4.91 / 7.61 / 11.80 |
| affine-slot-balanced | group R01-rest1 | 480 (0) | -0.521 | 27.7% / 72.3% / 0.0% | 98.1% / 72.1% | 26.0 | 6.34 | 4.17 / 6.56 / 8.03 |
| affine-slot-balanced | group R03-rest1 | 480 (0) | -1.775 | 83.8% / 16.0% / 0.2% | 51.0% / 10.0% | 41.0 | 6.87 | 4.29 / 7.03 / 9.19 |
| affine-slot-balanced | group R03-rest0.5 | 480 (0) | -0.421 | 24.6% / 75.4% / 0.0% | 0.0% / 0.0% | 0.0 | 10.69 | 7.65 / 10.51 / 14.07 |
| affine-slot-balanced | group R03-rest0.75 | 480 (0) | -1.827 | 85.0% / 15.0% / 0.0% | 14.0% / 0.2% | 13.8 | 8.08 | 5.91 / 8.05 / 10.28 |
| affine-slot-balanced | tier rare vs common | 1920 (0) | -1.136 | 55.3% / 44.7% / 0.1% | 40.8% / 20.6% | 20.2 | 8.00 | 4.91 / 7.61 / 11.80 |
| affine-row0-noweave | all | 320 (0) | -0.519 | 35.9% / 64.1% / 0.0% | 100.0% / 64.1% | 35.9 | 6.89 | 5.13 / 7.11 / 8.17 |
| affine-row0-noweave | group R01-rest1 | 160 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 6.47 | 4.66 / 6.79 / 7.48 |
| affine-row0-noweave | group R03-rest1 | 160 (0) | -1.038 | 71.9% / 28.1% / 0.0% | 100.0% / 28.1% | 71.9 | 7.31 | 5.64 / 7.70 / 8.31 |
| affine-row0-noweave | tier rare vs common | 320 (0) | -0.519 | 35.9% / 64.1% / 0.0% | 100.0% / 64.1% | 35.9 | 6.89 | 5.13 / 7.11 / 8.17 |

#### legendary vs rare

| Arm | Subset | Pairs (unresolved) | Mean Δplace | Improved / unchanged / worsened | Win X / Y | Δwin (pp) | Mean Δmargin | Δmargin p10 / p50 / p90 |
|---|---|---:|---:|---|---|---:|---:|---|
| affine-row0 | all | 640 (0) | -0.959 | 42.0% / 58.0% / 0.0% | 80.5% / 57.3% | 23.1 | 5.17 | 1.10 / 4.77 / 9.15 |
| affine-row0 | group R01-rest1 | 160 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 2.41 | 0.51 / 2.50 / 3.99 |
| affine-row0 | group R03-rest1 | 160 (0) | -0.069 | 6.9% / 93.1% / 0.0% | 100.0% / 93.1% | 6.9 | 2.98 | 0.81 / 3.05 / 4.93 |
| affine-row0 | group R03-rest0.5 | 160 (0) | -2.650 | 98.8% / 1.3% / 0.0% | 25.0% / 0.0% | 25.0 | 8.34 | 6.42 / 8.27 / 10.03 |
| affine-row0 | group R03-rest0.75 | 160 (0) | -1.119 | 62.5% / 37.5% / 0.0% | 96.9% / 36.3% | 60.6 | 6.97 | 4.32 / 7.14 / 9.83 |
| affine-row0 | tier legendary vs rare | 640 (0) | -0.959 | 42.0% / 58.0% / 0.0% | 80.5% / 57.3% | 23.1 | 5.17 | 1.10 / 4.77 / 9.15 |
| affine-slot-balanced | all | 1920 (0) | -1.033 | 50.1% / 49.9% / 0.0% | 62.2% / 40.8% | 21.4 | 5.21 | 1.15 / 4.75 / 9.17 |
| affine-slot-balanced | group R01-rest1 | 480 (0) | -0.029 | 1.9% / 98.1% / 0.0% | 100.0% / 98.1% | 1.9 | 2.41 | 0.50 / 2.56 / 4.09 |
| affine-slot-balanced | group R03-rest1 | 480 (0) | -0.613 | 38.3% / 61.7% / 0.0% | 77.5% / 51.0% | 26.5 | 3.17 | 0.80 / 3.23 / 5.23 |
| affine-slot-balanced | group R03-rest0.5 | 480 (0) | -1.748 | 80.2% / 19.8% / 0.0% | 10.0% / 0.0% | 10.0 | 8.52 | 6.26 / 8.56 / 10.51 |
| affine-slot-balanced | group R03-rest0.75 | 480 (0) | -1.742 | 80.0% / 20.0% / 0.0% | 61.3% / 14.0% | 47.3 | 6.75 | 4.09 / 7.02 / 9.17 |
| affine-slot-balanced | tier legendary vs rare | 1920 (0) | -1.033 | 50.1% / 49.9% / 0.0% | 62.2% / 40.8% | 21.4 | 5.21 | 1.15 / 4.75 / 9.17 |
| affine-row0-noweave | all | 320 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 2.91 | 0.62 / 3.15 / 4.64 |
| affine-row0-noweave | group R01-rest1 | 160 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 2.64 | 0.51 / 2.95 / 4.16 |
| affine-row0-noweave | group R03-rest1 | 160 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 3.18 | 1.06 / 3.47 / 4.79 |
| affine-row0-noweave | tier legendary vs rare | 320 (0) | 0.000 | 0.0% / 100.0% / 0.0% | 100.0% / 100.0% | 0.0 | 2.91 | 0.62 / 3.15 / 4.64 |

### Numbers bearing on each hypothesis clause

- Tier: rare vs common mean Δplace -1.22 (affine-row0), -1.14 (slot-balanced), -0.52 (noweave); 55.0% / 55.3% / 35.9% of pairs improved, 0% worsened. Legendary vs rare -0.96 / -1.03 / 0.00; improved 42.0% / 50.1% / 0%.
- Fatigue: R03 rest 0.5 vs 1 mean Δplace +3.00 (affine-row0) and +2.69 (slot-balanced); 91.5% / 89.0% of pairs worsened; win rate 72.7% → 8.3% and 46.2% → 3.3%. Future rest 0.75 vs 1: +1.15 / +1.15; 53.5% / 60.6% worsened; win rate 72.7% → 44.6% and 46.2% → 25.1%.
- Trial (+5%): mean Δplace -0.11 (affine-row0) and -0.14 (slot-balanced); improved 10.2% / 12.7%, worsened 0.2% / 0.4%; win rate +3.1 / +2.9 pp. Noweave: -0.07, improved 5.6%, win +1.5 pp.
- Sprint: mean Δplace -0.20 / -0.26; improved 16.3% / 20.4%, worsened 4.0% / 3.7%; win rate +4.0 / +4.5 pp. Within R03 rest 0.5, sprint is -0.36 / -0.32 Δplace and +5.0 / +2.8 pp win (trial in the same group: -0.18 / -0.13 Δplace).
- Start row: win rate over all races is 56.4% at row 0 vs 41.2% slot-balanced; R01 rested 99.8% vs 90.1%; R03 rested 72.7% vs 46.2%; R03 rest 0.5 8.3% vs 3.3%. Mean winning margin 6.08 vs 4.34.
- Weave/contact (rested groups only, row 0 vs noweave): R01 rested lead changes after 3 s mean 0.83 (46.0% of races with at least one) vs 0.00 (0%); P rank changes 0.83 vs 0.00; win 99.8% vs 100%. R03 rested lead changes 1.44 (74.6%) vs 1.49 (59.6%); P rank changes 1.90 vs 1.59; win 72.7% vs 76.0%. Lead changes after 3 s occur in 46–75% of rested races in the weave arm and 0–60% in the noweave arm.

## Limitations

- Crossed seeds: the same 40 seeds are used in every cell, slot and arm, so pairs are not independent. Pooled pair counts overstate precision. No standard errors or confidence intervals are reported.
- Balanced cases (equal weight over tiers, race groups, stances, trial states, and the future rest 0.75 group) are not player-frequency estimates. The production mix is not modelled.
- Slot-balanced is an equal-weight proxy over start rows 0, 1 and 2. It is not an implemented seeded start-slot rule.
- The R03 rest 0.75 group is future-only and not reachable in the current 2-race slice.
- The affine map replaces the reference clamp, so player top speeds exceed the reference 8–12 range (10.45–22.10 in these runs).
- The noweave arm covers rested cells only; rest comparisons are not applicable to it.
- Lead and rank changes are read from the 0.05 s trajectory rows after 3 s, including duplicated terminal rows; ties are broken by id.
- Fixed 40-seed design; no seed-sensitivity or larger-N check was run.
