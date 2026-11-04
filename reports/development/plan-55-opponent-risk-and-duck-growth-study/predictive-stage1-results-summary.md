# Predictive traffic Stage 1 — fixed-seed screen

2026-11-03. QP Orch cleared exactly 16 fixed screen seeds in each of three injury-free, ability-free arms. All 48 races reached genuine completion. The fixed roster gives player P base speed 10 and rivals 8; risk assignments alternate, and the player advantage is not a matched stat-gradient test. This is a small paired exploration, not a final injury, steering or production rule.

| Measure | Accepted one-contact reference | Multiple contacts, no advice | Multiple contacts, predictive advice |
| --- | ---: | ---: | ---: |
| Contact episodes, across 16 races | 16 | 115 | 121 |
| Aggregate crowded duck-seconds | 1,479.95 | 1,164.03 | 1,154.39 |
| Longest continuous crowded episode for one duck | 22.25 s | 20.95 s | 18.65 s |
| Median first crossing | 21.5565 s | 21.5173 s | 21.5173 s |
| First crossing strictly after 23 s | 0 of 16 | 0 of 16 | 0 of 16 |
| Player wins | 16 of 16 | 14 of 16 | 14 of 16 |

Crowding uses the predeclared proximity proxy: at least two active grounded neighbors within four course units and within eight units along the course; gaps over one simulation tick do not count as continuous. It records time near others, not whether ducks are trapped, stalled, visibly overlapping, or in a pileup. Its large values and initial formation require visual review and possible metric refinement. Last-crossing times are in raw results; no browser playback time was measured. Sixteen races cannot validate the accepted <=5% late tail.

Compared by seed with multi-contact/no-advice, predictive advice produced fewer/equal/more contacts in 2/9/5 races and a shorter/equal/longer longest crowded episode in 6/5/5. Across the predictive arm, 90 advice opportunities were eligible, 48 followed, 42 ignored and 25 subsequently canceled for recovery. These audit counts are not independent trials and do not prove causal improvement; paths may diverge. The candidate **did not reduce total contacts** here and the per-seed crowd signal is mixed. Its small reduction in aggregate proximity time, by itself, is not a reason to claim success. The previously proposed plan says stop for root disposition if it fails to improve traffic evidence; Stage 2 injury tuning and held-out confirmation were not run.

Predeclared visual selection yields screen seed `000` (first listed), plus maximum crowded-episode seed `010` in the predictive arm (`004` in multi/no-advice, `006` in reference), each with paired-seed counterparts. There is no injury-based selection because injury was disabled; treating a multiple-contact/no-injury example as injury evidence would be misleading. These selected examples are not representative by assertion. No viewer, screenshot, or owner observation has occurred.

## Evidence and limits

`predictive-stage1-output/{reference,multi,predictive}.json` contain per-race contacts, audit details, crowd measures and crossings; `.complete.json` files bind sizes, hashes and pin manifest. `analysis.json` and its completion receipt bind all three. Source manifest SHA-256 `bddb34ca78161f49adbc920113ea4586295af473fa59a96751edc031c346b1d0`. Arm hashes: reference `0f41d6b528d4aae4e3781a4f6d8fe263136c77db6a23413f705c0970f6bf2a05`; multi `e1123ad7cabfeeef5e7439ef1b4e4c4a3fb75cbd809ce0b11f565d145aff9e97`; predictive `59e4b848994892730831dae0b2f880984ad9454a5d9a4f74abe51d96069ff3d5`; analysis `e530e490fc157d964eed95f71dd63a93dbb1ddcf89465f5e95baa4bbca81d0ec`. Counts are 16+16+16 resolution calls, analysis zero.

Serial bounded receipts: reference 3.073 s / 148,762,624 sampled bytes; multi 3.064 s / 137,961,472; predictive 3.064 s / 164,937,728; analysis 0.522 s / 1,843,200. Fresh host free memory respectively 13.34, 13.05, 13.19 and 13.23 GiB. All exited 0 with no stop, stderr or cleanup notes. Source pin checks ran before/after each call. Correctness provenance is separate: earlier accepted-reference and no-advice comparisons were exact on two seeds under the source before the narrow checkpoint repair; after two failed guard checks and an index-based fix, both guard-only cases passed. This does not prove final-source equivalence across all inputs. Historical source/results remain intact.

Next decision for orchestration: determine whether to refine crowd avoidance or the proxy and define another bounded protocol, or hold this traffic candidate as provisional for a separately justified injury study. Subjective plausibility requires actual viewing; no numerical measure above substitutes for it. No production mutation, ability/rarity result, injury rate, packet status, push or deployment is authorized by these findings.
