# Plan 23 drama study 01 — controlled four-arm screen

## Scope and method

This is the root/owner-approved, headless, report-only screen. The runner reads the accepted Plan 13 race reference and PRNG, substitutes only the owner-review affine adapter in memory, and adds the approved candidate transforms in memory. It does not change the reference, production, canonical decisions, or external Opus review folder. Production must not import this report code.

- Reference source SHA-256: `3d3bd83107da7db38d2b4f902ce9be304aaed52fb49612cd9b90b9ed8ac7a07e`.
- Mapping under review: `topSpeed = 8.25 + 0.5 × sampledPerformance`; Plan 17/rest/stance order remains unchanged. This is an unadopted calibration candidate.
- Six fixed seeds: `plan23-drama-cal-01` through `plan23-drama-cal-06`.
- 72 cells: three roster tiers × two field/race inputs × two stances × two trial states × three rest states.
- Four paired arms: affine baseline, rear assistance only, leader disruption only, and combined; 432 attempts per arm, 1,728 total.
- Arm A matched the current affine resolver's full race fingerprint on all three named witnesses. Hashes and conditions are in `results.json`.
- Empirical quantiles use nearest-rank order statistics. Simulation duration excludes the presentation-only 2 s highlight.

Run from the repository root with:

```text
node reports/development/plan-23-production-race-integration/drama-study-01/run.mjs
```

The runner also verifies the three Arm A parity witnesses against the current affine baseline resolver before it begins the 1,728 attempts. It writes a compact `results.json` with summaries, per-attempt aggregate rows, parity hashes, and paired deltas, plus `results.full.json.gz` with the exact full JSON and every per-opportunity assistance sidecar. The accepted raw Plan 13 source hash is provenance; the affine adapter intentionally changes the race input, so these fingerprints are not raw-reference matches.

## Results

| Arm | Median (s) | p95 (s) | Max (s) | <17 s | >23 s | Unresolved | Mean place | Player wins | Sustained lead changes / race | Wall impact/overlap records |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline | 20.966 | 21.841 | 22.120 | 0 | 0 | 0 | 2.287 | 62.7% | 1.500 | 36 |
| Rear assist | 20.966 | 21.841 | 22.120 | 0 | 0 | 0 | 2.287 | 62.7% | 1.500 | 36 |
| Leader disruption | 21.021 | 21.949 | 21.951 | 0 | 0 | 0 | 2.630 | 49.3% | 1.731 | 322 |
| Combined | 21.021 | 21.949 | 21.951 | 0 | 0 | 0 | 2.630 | 49.3% | 1.731 | 322 |

All four arms met both investigation timing criteria on this screen: median in 17–23 s and no more than 5% strictly over 23 s. This is only six seeds per cell, so it is a small comparison, not a population guarantee. There were no finishes under 17 s in these arms. Faster skew remains allowed; this study held the calibration fixed and did not tune for an early tail.

The rank-history screen found these average counts per finished race:

| Arm | Entrants that moved from bottom two to top three | Entrants that moved from front two to bottom three | Pair passes lasting ≥1 s | Sustained lead changes ≥1 s | Mean finish margin (m) |
|---|---:|---:|---:|---:|---:|
| Baseline / rear assist | 0.271 | 0.347 | 9.086 | 1.500 | 6.651 |
| Leader / combined | 0.352 | 0.697 | 10.595 | 1.731 | 6.158 |

The stronger leader profile therefore produced modestly more sustained movement in the proxies and many more wall-impact/overlap records: 322 versus 36 across 432 races (about 8.9×). Duck contacts remained 432 per arm. No run became unresolved; the maximum observed mechanical-event count was 21 against the accepted 128 cap, and the maximum weave diagnostic count was 36 against the accepted 84 cap. The larger reversal proxies are not proof of audience excitement and come with a substantial wall-cascade increase.

Leader disruption also penalized the player when the player was in the front two: paired mean place worsened by 0.343, with 4 player-win outcomes improving and 62 worsening. Player mean win rate fell from 62.7% to 49.3%. Rank/tier advantage remained ordered in the balanced matrix (leader arm win rates: Common 25.0%, Rare 47.9%, Legendary 75.0%; baseline: 36.1%, 61.8%, 90.3%), though it was compressed. Current Sprint and trial paired input effects also weakened under the stronger leader profile; see `byInput` and `paired` in `results.json`.

## Why the rear-assist arm was null

The study-sidecar records all scheduled checks independently of the existing weave diagnostics. Cumulative rear-only eligibility funnel:

| Gate | Checks that passed |
|---|---:|
| Scheduled | 25,962 |
| Back half | 12,981 |
| Also ≥3 m behind predecessor | 2,167 |
| Also ≥0.25 mapped topSpeed headroom | 1,486 |
| Also ≥15 m clear distance after existing braking distance | 496 |
| Also no active steering/recovery | 208 |
| Keyed 0.5 draw succeeded | 66 |

Combined arm: 25,992 scheduled; 2,256 passed back-half plus 3 m gap, 533 also passed headroom plus curve buffer, 221 also passed the no-episode gate, and 82 keyed opportunities executed. Thus the rule was rare (about 0.25–0.32% of scheduled checks) and had no paired finish-time, place, pass, or lead-change effect. The per-step speed increment sum was 9.600 in rear-only and 17.818 in combined; that is a small applied-velocity accounting value, not a spatial catch-up distance or causal outcome.

Executions were confined to rear-row reference entrants: rear-only D=63/E=3; combined D=71/E=11. The player did not qualify in these fixed-front-row scenarios. The candidate cannot support a claim that high-tier players will catch up, and the extra eligible-gap/headroom/curve/recovery intersection explains the null result. Do not silently increase its force. Root has a separate R2 proposal for acceleration plus lane recenter assistance.

The full opportunity records' `progressDeltaThroughLatestSnapshot` and `gapAtLatestSnapshot` fields describe the interval from opportunity to the latest saved trajectory step (often through race finish), not displacement during the assist window. They are descriptive. Use paired arm deltas for causal claims. Direct assist-window accounting is limited to the actual applied acceleration ticks and speed delta under unchanged topSpeed/braking.

## Limits and disposition

- The 72-cell matrix is deliberately balanced and includes future-only rest states; it is not an estimate of student race frequencies. Current two-race reachable states remain separately inspectable in the per-input tables.
- Lead-change, lasting-pass, position-reversal and wall-event counts are mechanical proxies, not human perception evidence.
- The study does not test presentation, reduced motion, the 2 s highlight playback, storage, receipt projection, or any browser behavior.
- R1 leaves the selected mechanics and production adapter unadopted. It is evidence for root's next candidate review, not authority to alter canonical decisions or production.
- R1 itself remains a six-seed screen. QP Orch later selected a separate R2 candidate and authorized its own 20-seed validation; see `../drama-study-02/README.md`. This does not expand or retroactively validate R1.
- `results.json` keeps compact result rows without per-opportunity arrays. `results.full.json.gz` retains the exact 43,272,640-byte JSON payload; compact-file metadata carries the raw and compressed hashes and exact-decompression check.

## Advisor consultation

Branch C — orchestrator-gate-only for this bounded report-only experiment. No advisor call was authorized or warranted for this follow-up screen; results are returned directly to QP Orch/root for review.
