# 04 — Affine with risk-only Sprint, and a tighter start grid (Opus-authored)

**Author:** Opus reviewer. **Command:** `node reports/development/plan-23-production-race-integration/opus-review-01/experiments/04-affine-sprint-and-grid/run.mjs` (~4 min, 9,720 races). **Output:** `results.json`.

## Question

Experiments 02/03 showed that under the affine candidate (a) Sprint (+10% mean, ±20%) almost never hurts (worsened place in 0.6% of row-0 pairs), contrary to `docs/founding/design.md:34` ("no choice is automatically correct"), and (b) the fixed front-row player slot dominates equal-speed outcomes. This checks two single-constant departures with the affine map unchanged.

## Arms (all: affine `topSpeed = 8.25 + 0.5 × sampled`, experiment `weave-rank-strong-contact`)

| Arm | Sprint sampling | Row spacing |
|---|---|---|
| `affine-current` | `base × 1.1 × (1 ± 0.2)` (selected) | 4 (reference) |
| `affine-sprint-neutral` | `base × 1.0 × (1 ± 0.2)` | 4 |
| `affine-rowspacing-1.5` | selected | 1.5 |

Cells: the three production groups (R01 rested, field 8; R03 rested, field 11.2; R03 after racing the same duck in R01, rest 0.5) × Common 10 / Rare 14 / Legendary 20 × Steady/Sprint × trial off/on, at player rows 0, 1, 2 (equal-weight "slot-balanced" proxy). Seeds: the same 30 held-out seeds as experiment 03 (`opus-r01-pace-val-01…30`); `affine-current` reproduces experiment 03's affine production numbers (row 0 win 63.3%, slot-balanced 47.4%), which cross-checks both harnesses.

## Results

| Arm | Finish median / p95 / max | >23 s | Unresolved | Lead changes after 3 s (mean; share ≥1) | Player win, row 0 / slot-balanced | Win by player row 0 / 1 / 2 |
|---|---|---|---|---|---|---|
| affine-current | 20.92 / 21.52 / 21.93 | 0 | 0 | 1.40; 74.4% | 63.3% / 47.4% | 63.3 / 47.4 / 31.5% |
| sprint-neutral | 20.92 / 21.56 / 21.93 | 0 | 0 | 1.38; 73.7% | 61.4% / 45.1% | 61.4 / 45.0 / 29.0% |
| rowspacing-1.5 | 20.86 / 21.36 / 21.89 | 0 | 0 | 1.62; 82.9% | 59.3% / 53.6% | 59.3 / 54.3 / 47.3% |

Sprint vs Steady, paired (same seed/row/trial/tier/group). Each cell: mean Δplace; % improved; % worsened; win change.

| Scope | Current Sprint (+10%) | Risk-only Sprint (×1.00) | Current Sprint, spacing 1.5 |
|---|---|---|---|
| All, row 0 | −0.19; 14.8%; 0.6%; +5.2 pp | −0.00; 9.1%; 8.0%; +1.3 pp | −0.25; 15.6%; 0.9%; +4.4 pp |
| All, slot-balanced | −0.24; 18.1%; 1.4%; +4.8 pp | +0.01; 8.1%; 9.0%; +0.2 pp | −0.26; 16.6%; 1.5%; +5.5 pp |
| R01 Common (favourite), row 0 | +0.02; 0%; 1.7%; −1.7 pp | +0.13; 0%; 13.3%; −13.3 pp | +0.02; 0%; 1.7%; −1.7 pp |
| R03 Common rested (underdog), row 0 | −0.48; 40.0%; 1.7%; +23.3 pp | −0.07; 30.0%; 20.0%; +15.0 pp | −0.82; 55.0%; 3.3%; +18.3 pp |
| R03 Rare rested (favourite), slot-balanced | −0.25; 18.9%; 1.7%; +10.6 pp | +0.03; 10.0%; 15.0%; 0.0 pp | −0.22; 16.7%; 0.6%; +13.3 pp |

Selected win rates, slot-balanced, Steady → Sprint:

| Group / tier | current | risk-only Sprint | spacing 1.5 |
|---|---|---|---|
| R01 Common | 62 → 74% | 62 → 58% | 83 → 86% |
| R03 Common rested | 8 → 19% | 8 → 13% | 4 → 21% |
| R03 Rare rested | 52 → 63% | 52 → 52% | 71 → 84% |
| R03 Legendary rested | 76 → 76% | 76 → 76% | 96 → 96% |
| R03 tired Rare (0.5) | 0 → 0% | 0 → 0% | 0 → 0% |

## Interpretation and limits

Risk-only Sprint turns Sprint from a near-dominant pick into a real trade-off: it helps underdogs and hurts favourites, and in aggregate it is close to neutral. Tighter rows cut the start-row effect from 32 points (row 0 vs row 2) to 12 and add some lead changes, but they make strong ducks win *more* reliably, because grid luck had been a main source of upsets. Neither change affected timing. The two departures were tested separately here; experiment 05 checks them together on fresh seeds. Same limits as 02/03: crossed seeds, equal-rating fields, slot-balanced is a proxy for a seeded slot rule, no human perception testing.
