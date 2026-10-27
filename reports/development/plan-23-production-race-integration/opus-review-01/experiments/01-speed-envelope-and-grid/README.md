# 01 — Speed envelope and start-grid bias (Opus-authored diagnostic)

**Author:** Opus reviewer (not delegated). **Command:** `node reports/development/plan-23-production-race-integration/opus-review-01/experiments/01-speed-envelope-and-grid/run.mjs` (~80 s). **Output:** `results.json`.

## Hypotheses

- H1a: above the shared corner speed, the reference kinematics (fixed acceleration 3, braking 6, shared turn law) saturate, so internal top-speed differences are worth only a little lap time; above some value they are worth nothing.
- H1b: the player's fixed front-row start (`P` lane 2 row 0; rivals B–E 4–8 units behind) is a structural advantage that can be as large as or larger than the selected modifiers.

## Method and substitutions

In-memory copy of the accepted `race-physics.mjs` (SHA-256 recorded in results). Substitutions: PRNG import URL; sampled top-speed clamp replaced by a named map (identity unless stated); Part B swaps the player's start row with the same-lane rival. No physics constant changed.

- **Part A (solo envelope):** `fieldBaseSpeed=0.5` so the player always leads; `controller-recenter` (no weave) and the selected `weave-rank-strong-contact`. One seed (`opus-envelope`); Steady samples ±5%, so the actual sampled top speed is reported. Analytic reachable speeds per straight are computed from a=3, b=6 and the corner target.
- **Part B (grid):** player and field share the same rating (10 or 11.2), selected experiment, raceId R03, Steady, no trial, 300 seeds `opus-grid-001…300`, identity and affine (`8.25+0.5x`) maps, player in row 0 (current), 1 or 2.

## Results

Analytic: corner target 11.316 (at lane offset 0.6); reachable maximum 13.66 on the opening half-straight, 19.18 on the middle straight and 17.55 on the closing half-straight; bends are 51.2% of the lap.

Solo lap (no weave) by sampled internal top speed: 8.26→29.85 s, 10.32→24.10 s, 11.35→22.09 s, 12.38→21.38 s, 13.42→20.90 s, 14.45→20.56 s, 16.51→20.18 s, 17.54→20.11 s, **≥18.58→20.068 s (flat)**. With the selected weave/contact the floor is 20.27 s. Below the corner speed, time ∝ 1/speed; above it, the entire remaining benefit of any speed advantage is ≈2 s per lap, and none above ~18.6.

Solo seconds saved by the Plan 17 +5% rating (same seed, no weave):

| Rating | Affine `8.25+0.5x` | Identity |
|---:|---:|---:|
| 5 (Common 50% rest) | 0.239 | identity base unresolved at the 40 s watchdog when soloing at 0.5 field |
| 7.5 | 0.105 | 1.485 |
| 10 (Common) | 0.085 | 1.076 |
| 14 (Rare) | 0.056 | 0.184 |
| 20 (Legendary) | −0.0001 (none) | 0 (none) |

Start-grid bias at equal ratings (fair share: 16.7% wins, mean place 3.5):

| Player row | Identity 11.2 win / place | Identity 10 | Affine 11.2 | Affine 10 |
|---:|---|---|---|---|
| 0 (current) | 39.7% / 2.32 | 32.0% / 2.61 | 45.0% / 1.85 | 42.0% / 1.83 |
| 1 | 11.3% / 3.36 | 14.0% / 3.44 | 6.0% / 3.28 | 5.3% / 3.27 |
| 2 | 1.7% / 4.50 | 4.7% / 4.30 | 0.0% / 5.16 | 0.0% / 5.24 |

## Interpretation and limits

Both hypotheses are supported. The affine candidate's narrow 20.1–21.9 s validation range is explained by the envelope: its intercept lifts every leader near or above the corner knee, where the reference physics cannot produce a lap faster than ≈20.1–20.3 s or slower than ≈22.5 s. The reference geometry cannot produce the faster tail the owner says is acceptable at any speed. The +5% boost is nearly invisible for Common/Rare and literally zero for Legendary under both maps, because Legendary already exceeds every reachable speed. At equal speed the player's front-row slot wins 2.5–2.7× its fair share, and a duck starting 8 units back never won under affine in 300 races, so the in-race weave/contact randomness rarely reorders entrants.

Limits: single-seed solo laps; grid test at one raceId and two ratings; no Sprint/trial in Part B. The grid numbers measure the reference fixture as Plan23 would port it; production rivals currently use that same fixture.
