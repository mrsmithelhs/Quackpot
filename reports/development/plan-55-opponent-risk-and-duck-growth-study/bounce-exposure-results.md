# Bounce natural-exposure screen

QP Orch cleared manifest `3233cd05cd2273133916b0ac7ea62a353f708f6843b3b603dbd234c0d6800f98` for exactly 16 calls. Both eight-call shards finished and bounded zero-resolver analysis completed; no retries, alternate seeds or full-protection runs. QP Orch corrected the protocol resource wording: fresh **available physical RAM**, not disk, must be at least 8 GiB before each shard. The pinned protocol is retained unchanged as the execution record. The existing `maxSpeed=12` bounds curve-speed search, while ordinary acceleration follows inherited target speed; no global 12 cap or retuning was applied.

| Measure | No defensive clearance | Defensive clearance |
|---|---:|---:|
| Completed races | 8 | 8 |
| Bounce sampling checks | 692 | 695 |
| Predicted Bounce threats | 13 | 12 |
| Threats during a steering episode | 13 | 12 |
| Eligible Bounce checks / activations | 0 / 0 | 0 / 0 |
| Crowd acceleration activations (races) | 8 (7) | 9 (7) |
| Total distinct contacts | 67 | 70 |
| Races with at least one injury | 6 | 6 |
| Player injuries | 1 | 2 |
| Player race wins | 6 | 6 |

All Bounce checks were ineligible. The steering episode flag includes scheduled weave acquisition, holding and recentering as well as collision steering and recovery; the recorded Boolean does not distinguish them. Acquisition times out after 1 second, holding lasts up to 0.5 seconds, and recentering ends only after three consecutive 0.05-second ticks centered and aligned; there is no fixed overall duration. Of crowd checks, no-clearance reasons were 675 ineligible, 8 activated, 1 declined and 8 latched; clearance reasons were 673 ineligible, 9 activated, 1 declined and 12 latched. The independent crowd ability did activate without Bounce, but this paired, small diagnostic does not isolate its causal balance effect. No Bounce landing event or landing guard occurred, and the denominator of genuine contacts during Bounce protection was **zero**. Therefore this screen says nothing about full versus partial protection, and does not show that full protection is overpowered. The separate arranged fixtures demonstrate mechanism reachability, not frequency.

For context, matching frozen no-ability controls had 70/68 contacts, injuries in 8/8 races, player injuries 1/2, and player wins 7/7 for no-clearance/clearance respectively. These are eight-race samples and not statistical conclusions. Player rating 10 versus rivals 8 can create a placement ceiling. Telemetry suggests the steering-episode eligibility restriction and predictor timing deserve targeted investigation before comparing protection; any change or further races require a separately reviewed finite protocol.

Execution: no-clearance 4.601 s, fresh RAM 13.457 GiB, sampled peak process working set 140,316,672 bytes; clearance 4.699 s, 13.432 GiB and 116,641,792 bytes. Both exited 0; node heap limit 1 GiB. Process tree inspection via CIM was unavailable; the runner source makes no child-process calls, so the recorded samples are the Node process, not independent full-tree measurements. Analysis output 634,630 bytes; both shards under 2 MiB, aggregate including frozen controls and markers below 10 MiB. Evidence: `bounce-exposure-output/analysis.json` and shard receipts; no production files changed.
