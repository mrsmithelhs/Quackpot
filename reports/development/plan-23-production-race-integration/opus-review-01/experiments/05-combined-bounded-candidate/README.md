# 05 — Frozen combined candidate on fresh seeds (Opus-authored)

**Author:** Opus reviewer. **Command:** `node reports/development/plan-23-production-race-integration/opus-review-01/experiments/05-combined-bounded-candidate/run.mjs` (~8 min, 17,280 races). **Output:** `results.json`. `run.mjs` was generated from experiment 04's runner by literal substitutions only (seeds, groups, arms, timing split); the race code is identical.

## Candidate (frozen before this run from experiment 04's single-change results)

- Affine conversion `topSpeed = 8.25 + 0.5 × sampledRating` (unchanged Plan 23 candidate).
- Risk-only Sprint: `sampled = base × 1.00 × (1 ± 0.20)` (selected: ×1.10).
- Start rows 1.5 units apart (reference: 4).
- Player slot equally weighted over rows 0/1/2 in lane 2 — a proxy for a keyed start-slot draw that is **not implemented** here.

Baseline arm `affine-current` = Plan 23 candidate with selected Sprint and reference grid, run on the same seeds and rows.

## Design

All 72 matrix cells (Common 10 / Rare 14 / Legendary 20 × {R01 field 8, R03 field 11.2} × rest {1, 0.75, 0.5} × Steady/Sprint × trial off/on) at player rows 0, 1, 2. Production groups are R01 rested, R03 rested and R03 rest 0.5. R03 rest 0.75 is future-only; R01 with rest < 1 is matrix-only. Fresh seeds `opus-r01-combo-val-01…40`, never used before; no tuning after results. Experiment `weave-rank-strong-contact`.

## Results

| Arm | Production finish median / p95 / max (n=4,320) | All 72 cells median / p95 / max (n=8,640) | >23 s | <17 s | Unresolved | Lead changes after 3 s (mean; share ≥1) | Player win row 0 / 1 / 2 |
|---|---|---|---|---|---|---|---|
| affine-current | 20.90 / 21.50 / 21.85 | 21.00 / 21.74 / 22.01 | 0 | 0 | 0 | 1.35; 72.4% | 61.7 / 39.9 / 27.4% |
| combined-candidate | 20.85 / 21.42 / 21.74 | 20.94 / 21.69 / 22.07 | 0 | 0 | 0 | 1.58; 79.0% | 53.6 / 45.0 / 40.9% |

Zero late in 8,640 attempts per arm: attempt-level Wilson 95% upper bound ≈0.044%; crossed seeds/cells make this an attempt-level bound only.

Sprint vs Steady within each arm (paired by seed/row/trial/tier/group). Each cell: mean Δplace; % improved; % worsened; win change.

| Scope | affine-current | combined-candidate |
|---|---|---|
| All cells, row 0 | −0.29; 19.5%; 1.8%; +7.2 pp | 0.00; 9.2%; 9.7%; −0.2 pp |
| All cells, slot-balanced | −0.31; 23.1%; 2.1%; +6.9 pp | +0.01; 10.4%; 9.9%; −0.2 pp |
| R01 Common (favourite), slot | −0.21; 21.7%; 5.4%; +12.9 pp | +0.34; 2.9%; 22.1%; −10.8 pp |
| R03 Common rested (underdog), slot | −0.54; 42.5%; 3.3%; +11.7 pp | −0.16; 31.3%; 17.9%; +5.0 pp |
| R03 Rare rested, slot | −0.30; 28.7%; 2.5%; +13.3 pp | +0.09; 10.0%; 12.5%; −2.9 pp |

Player win rate, slot-balanced (row 0 in parentheses), Steady / Sprint:

| Group | Tier | affine-current | combined-candidate |
|---|---|---|---|
| R01 rested | Common | 61 (100) / 74 (96) | 86 (99) / 75 (86) |
| R01 rested | Rare, Legendary | 98–100 | 100 |
| R03 rested | Common | 10 (29) / 21 (54) | 5 (13) / 10 (16) |
| R03 rested | Rare | 45 (95) / 59 (98) | 71 (95) / 68 (94) |
| R03 rested | Legendary | 74 (100) / 73 (100) | 92 (100) / 92 (100) |
| R03 rest 0.5 | Common / Rare | 0 / 0–1 | 0 / 0 |
| R03 rest 0.5 | Legendary (= rating 10) | 10 (29) / 21 (54) | 5 (13) / 10 (16) |
| R03 rest 0.75 (future) | Rare | 14 (41) / 25 (63) | 10 (21) / 16 (26) |
| R03 rest 0.75 (future) | Legendary | 54 (100) / 65 (100) | 81 (100) / 78 (95) |

## Interpretation and limits

The combination keeps timing, makes Sprint a two-sided choice and nearly removes the player's grid advantage. Outcomes become more rating-driven: stronger rested ducks win more reliably (Rare 71%, Legendary 92% at the Finale), and a Common duck at the Finale wins rarely (5–10%). The trial was not re-paired here (see 02/03: about +0.9 duck-lengths under affine). The slot-balanced proxy uses lane-2 rows only; an implemented six-slot keyed draw still needs one check. Fields use identical rival ratings. No perception or browser test.
