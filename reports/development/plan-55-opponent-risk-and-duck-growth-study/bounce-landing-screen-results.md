# Landing-enabled natural exposure screen

QP Orch cleared 16 calls under manifest `909f0c807c8085ed9b65265e3e4a0a5035eca1607727f904b88e6f0a54ab5800`: seeds 000-007 in two traffic modes, combo/partial only. All 16 finished. Analysis SHA256 `f055516264b0885afbeda08c56510c0a4dcdc6d14194433a9cba6731556f354c` (1,495,833 bytes). Controls and prior exposure shards were read and hash-verified; no controls were rerun. The earlier concurrent attempt stopped on call 7 and did not save the prior six race results, so it is not a completed comparative sample.

| Measure | No clearance | Clearance |
|---|---:|---:|
| Finished races | 8 | 8 |
| Predicted threat checks / eligible checks | 7 / 7 | 7 / 7 |
| Bounce activations (races) | 3 (2) | 3 (2) |
| Declined / latched checks | 3 / 1 | 3 / 1 |
| Real occupied-landing contacts | 2 | 2 |
| Protected P injury rolls | 2 | 2 |
| All duck contacts | 63 | 66 |
| Races with at least one injury | 6 | 6 |
| P injuries / race wins | 0 / 6 | 0 / 6 |

Each traffic set had identical activations on the same two seeds: one during weave recovery (000), then one during a weave hold and one during collision recovery (006). The two actual landing contacts both occurred in seed 006 in both traffic modes. These are paired observations, **not four independent landing contacts**. On the first, P's partial injury probability was .025 with draw .1673, so P was not injured; B independently rolled .0765 against .10 and was injured. On the second, P drew .0627 against .025 and E drew .3409 against .05; neither was injured. The same keyed draws occurred in both paired traffic variants. The sample demonstrates reachable concurrent activation and landing-contact records, not frequency or fairness. It does not establish that a collision would otherwise have occurred or was avoided.

Earlier pre-concurrency exposure had zero Bounce activations in each traffic set, 67/70 total contacts, and 1/2 player injuries. Here the combined candidate changed its trajectories, so these small paired comparisons cannot isolate Bounce or establish causal injury effects. Frozen no-ability and earlier exposure inputs are in the analysis. P's rating 10 versus rival 8 leaves a placement ceiling; P won 6/8 in each set. Both observed P landing draws exceeded .025, so zero injury probability would yield the same observed outcome on these contacts. Full-protection races were not run and no full-versus-partial balance conclusion follows.

No unexpected guard occurred. The separate arranged correctness suite showed multi-overlap/rearm cases can still guard rather than forcing a resolution; this 16-race screen does not prove those conditions are absent generally. Contact model remains discrete report-local, without animation or owner experience acceptance. Eight races per mode and correlated paired seeds do not justify final injury probabilities, collision frequencies, rarity power, or production integration.

Resources: no-clearance 5.457 s, 11.844 GiB available RAM, sampled Node working set 135,151,616 bytes; clearance 5.476 s, 11.828 GiB, 125,837,312 bytes; both exit 0. Full tree memory was not independently sampled; the shard runner does not launch children. Each shard and analysis remained below 2 MiB and the aggregate under 12 MiB. Evidence is under `bounce-landing-screen-output/`; no retry or unapproved seed was used.
