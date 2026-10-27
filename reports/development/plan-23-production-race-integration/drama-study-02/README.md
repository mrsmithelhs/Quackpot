# Plan 23 drama study 02 — calibration screen and validation

## Scope and inputs

This is report-only headless evidence. The runner reads the accepted Plan 13 race reference and PRNG, then applies the owner-review affine map and the approved R2 study transforms in memory. It does not change production, canonical rules, the accepted Plan 13 reference, Plan 20, or the external Opus review. Production must not import report artifacts.

- Reference source SHA-256: `3d3bd83107da7db38d2b4f902ce9be304aaed52fb49612cd9b90b9ed8ac7a07e`.
- Owner-review speed map: `topSpeed = 8.25 + 0.5 × sampledPerformance`; authored roster tier, Plan 17, stance sampling, and the three Plan 22 rest-state scenarios remain ordered inputs. The map is still not adopted.
- Each matrix has 72 balanced cells: three roster tiers × two field/race inputs × two stances × two Plan 17 states × three rest factors.
- Timing excludes the presentation-only two-second highlight.
- Each runner checks three named race fingerprints against the current affine baseline resolver before running its matrix. The accepted reference source hash is recorded as provenance, but these are **not** raw-reference fingerprints: the review-only affine adapter intentionally changes `topSpeed` before physics.

## Six-seed R2 screen

The four-arm screen covered six calibration seeds and 1,728 races (432 per arm). All races finished and no arm exceeded the selected timing limits.

| Arm | Median (s) | p95 (s) | Max (s) | <17 s | >23 s | Mean player place | Player win rate | Bottom-2→top-3 | Front-2→bottom-3 | Wall records |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline | 21.008 | 21.829 | 22.101 | 0 | 0 | 2.356 | 57.9% | 0.414 | 0.319 | 44 |
| Assistance | 21.008 | 21.829 | 22.101 | 0 | 0 | 2.361 | 57.9% | 0.361 | 0.329 | 8 |
| Leader slowdown | 21.259 | 22.066 | 22.287 | 0 | 0 | 2.576 | 55.3% | 0.669 | 1.340 | 36 |
| Combined | 21.259 | 22.066 | 22.287 | 0 | 0 | 2.569 | 55.3% | 0.639 | 1.387 | 0 |

Here the combined arm showed more rank movement and fewer wall records than the baseline. Those wall counts were sparse, however, and the subsequent 20-seed validation did **not** reproduce the apparent reduction. Treat the six-seed counts as screen variation, not an established wall-contact effect.

Assistance executed 1,508 times from 25,932 scheduled arm-only checks and had near-zero paired player-place or win effect. Most opportunities and executions involved the mapped under-14 speed band; the ≥17 band had no executed opportunities. This does not mean assistance was mechanically inactive: it recorded recovery/recentering and turn-cap effects, but outcome movement remained small. See the full sidecars for per-opportunity evidence.

The separate leader slowdown produced more sustained passing/reversal proxies, but worsened player outcome counts in the six-seed screen. This is a model effect only; no audience-experience or adoption claim follows from it.

## Twenty-seed validation

QP Orch selected the frozen R2 combined candidate for a fresh 20-seed validation and separately named an external-risk-only Sprint arm. The risk-only arm changes only the player Sprint mean multiplier from 1.10 to 1.00 while retaining the same keyed ±20% spread. Baseline and R2combined retain current Sprint. This validation has 4,320 attempts: 20 new seeds × 72 cells × three arms.

| Arm | Finished / 1,440 | Median (s) | p95 (s) | Max (s) | <17 s | >23 s | Mean place | Player win rate | Sustained lead changes / race | Wall records |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Baseline | 1,440 | 21.027 | 21.833 | 22.017 | 0 | 0 | 2.353 | 58.47% | 1.728 | 36 |
| R2combined | 1,440 | 21.181 | 22.120 | 22.448 | 0 | 0 | 2.476 | 58.06% | 1.918 | 40 |
| R2combined-risk-only | 1,440 | 21.250 | 22.165 | 22.448 | 0 | 0 | 2.592 | 55.07% | 1.933 | 40 |

All arms had zero unresolved races and zero finishes outside the strict `>23 s` cap. Their medians fall within 17–23 s; this balanced model sample produced no finishes under 17 s. It does not estimate real player race frequencies.

The frozen R2combined arm versus baseline, paired on 1,440 seed/input rows, changed mean player place by `+0.122` (higher is worse), mean player win rate from `58.47%` to `58.06%`, and mean finish time by `+0.148 s`. Movement proxies increased: bottom-two-to-top-three entrants `0.204→0.562` per race; front-two-to-bottom-three `0.510→1.342`; lasting passes of at least one second `8.221→11.453`; sustained lead changes `1.728→1.918`. Wall contact/overlap records were `36` baseline and `40` R2combined, so the screen's `44→0` pattern did not replicate. Event counts stayed below the 128 mechanical cap (mean 16.42 baseline, 25.18 combined; maxima 21 and 35); each arm recorded 1,440 duck contacts.

Tier advantages stayed ordered in each arm. Common/Rare/Legendary win rates were baseline `28.1%/59.6%/87.7%`, R2combined `26.9%/59.4%/87.9%`, and risk-only `22.7%/56.3%/86.3%`. Under the R2combined mapping, mean place by tier was `3.819/2.333/1.275`; zero-races-rest was the weakest input at mean place `4.013`, compared with one-race-rest `2.138` and rested `1.277`. These rows preserve the separate effects of authored tier, trial, stance, and rest factors instead of compressing them into a capped speed input.

### Sprint versus Safe within each arm

The owner-defined two-sided movement signal compares the player's Sprint result with its matched Safe result inside the same arm, pairing seed, tier, field, Plan 17 trial state, and rest factor. A negative Sprint-minus-Safe place delta means Sprint improved player place.

| Arm | Paired Sprint/Safe rows | Sprint improved place | Tied | Sprint worsened place | Mean place delta | ≥5% improvement and ≥5% worsening |
|---|---:|---:|---:|---:|---:|---|
| Baseline | 720 | 120 (16.67%) | 572 | 28 (3.89%) | −0.210 | No |
| R2combined | 720 | 119 (16.53%) | 569 | 32 (4.44%) | −0.204 | No |
| R2combined-risk-only | 720 | 71 (9.86%) | 589 | 60 (8.33%) | +0.028 | Yes |

The risk-only arm meets the stated two-sided 5% movement criterion. Its mean place delta is slightly worse for Sprint, and the 720 pairs contain 28 player-win improvements versus 11 worsenings. The separate cross-arm comparison of risk-only Sprint against current-Sprint R2combined had 13 improved, 583 tied, and 124 worsened player places; that is a different comparison and is not the within-arm criterion.

Plan 17 trial-true versus matched trial-false comparisons retained a favorable mean place delta in all three arms: `−0.132` baseline, `−0.165` R2combined, and `−0.172` risk-only. The paired report also breaks those effects out by tier, field, stance, and rest. The 72 reachable input-cell summaries are preserved per arm in the compact JSON.

## Evidence files and reproduction

- `results.json` is the compact six-seed calibration report, with per-attempt aggregate rows and no per-opportunity arrays.
- `results.full.json.gz` contains the exact full six-seed JSON, including every assistance opportunity and event audit.
- `validation-results.json` is the compact 20-seed validation report, including the within-arm Sprint/Safe derivation, all 72 reachable cell outcomes, paired Plan 17 results, the separate cross-arm Sprint comparison, and hashes.
- `validation-results.full.json.gz` contains the exact unabridged validation result and sidecars.
- `run.mjs` reproduces the six-seed R2 screen. `validate.mjs` reproduces the separately authorized three-arm validation. Both are report-only and require no installed dependencies beyond Node.

The 20-seed raw validation payload is 189,404,333 bytes with SHA-256 `c1d6c9bba497e47dd2301e252d3960bb544e6d50de261839071463bebc5b15fd`; gzip is 8,297,590 bytes with SHA-256 `07453ce31b2208b396247165db437904e80e4093d4bfa40e245880742b8418f0`. Independent decompression verified exact byte length and hash. The canonical paired Sprint/Safe derived summary is bound to the raw hash and has SHA-256 `c3f2a5d31de15db776d35c1f9a9ed60e163a47eb7bd3c8c1808c55d6cf5ad7f3`.

## Limits and next gate

- The model maps balanced synthetic inputs through an owner-review affine function. It does not establish production race calibration, audience excitement, or the behavior of a production resolver.
- Rest factors are injected scenarios from the accepted Plan 22 direction; Plan 22 remains the owner of production rest integration.
- Race timings exclude the two-second slow-motion highlight. There was no browser, render, reduced-motion, seek, save/reload, reward-idempotency, or event-presentation test here.
- The risk-only Sprint result meets the owner's paired movement threshold, while aggregate and cross-arm effects include countervailing outcomes. It is a candidate for the separately authorized isolated visual comparison, not a production or canonical selection.
- No production file or accepted reference changed; no browser turn or advisor review was used. Orchestrator coordination controls the visual-candidate file scope and any browser turn.

## Advisor disposition

Branch C — orchestrator-gate-only for this report-only experiment, as directed by QP Orch. No higher-tier advisor or browser review was requested or used.
