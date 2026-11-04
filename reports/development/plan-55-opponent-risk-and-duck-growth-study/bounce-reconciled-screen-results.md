# Reconciled matched-stat screen

QP Orch cleared 24 new races under manifest `e8f0635ef700524e586018a3991db540f633bdc58b5bf2fdaf6110ac38e22457`: fixed seeds 000-007, clearance traffic, three arms (Bounce partial, Bounce full, and crowd acceleration alone). All finished. The matched no-ability eight-race control was reused from the earlier landing adapter, with its original markers/hash/input identities verified. Reuse rests on one-seed deep no-ability parity plus source inspection of the ability-disabled path; it is not eight-seed rerun proof. The earlier failed Bounce shard remains preserved and was not stitched into these results.

| Eight paired seeds per arm | No ability, reused | Bounce partial | Bounce full | Crowd only |
|---|---:|---:|---:|---:|
| P wins | 3 | 3 | 3 | 4 |
| P mean finish place, lower is better | 2.25 | 1.875 | 1.875 | 2.375 |
| Races with P injured | 2 | 1 | 1 | 0 |
| Races with any duck injured | 6 | 7 | 7 | 6 |
| Total contacts, all ducks | 67 | 64 | 64 | 66 |
| Bounce activations (races) | 0 | 6 (3) | 6 (3) | 0 |
| Crowd activations | 0 | 0 | 0 | 9 |
| Real protected P contact rolls | 0 | 3 | 3 | 0 |

P's placements by seed were 1,4,2,2,1,2,5,1 without ability; 1,2,2,2,1,2,4,1 for either Bounce policy; and 6,1,1,2,1,2,5,1 with crowd alone. These are descriptive observations from eight predetermined paired seeds, not reliable estimates of winning probability or proof that one ability helped. The equal rating reduces the previous player base-speed advantage but does not remove lane, initial-position, or seed effects.

The three genuine P protected contacts are the same three paired events in the two Bounce arms, **not six independent contacts**. Their shared keyed uniform draws were .6837, .2867 and .7415; the reduced-risk thresholds were .025, .05 and .025, while full protection used 0. None resulted in a P injury in either policy. The one P injury recorded in each Bounce arm occurred outside the protected window. Placements and injury counts were identical in these particular partial/full runs. The sample therefore does not show full protection is overpowered, nor does it establish the policies are equivalent: a different draw or race could produce different outcomes. Other ducks retain their own injury opportunities. No full-protection preference or final injury probability is selected by these data.

The crowd-only arm activated nine times and produced different individual placements, including sixth on seed 000. Those outcomes do not isolate an ability effect from the altered trajectories and small paired sample. No combination of Bounce and crowd was included. No owner-visible animation or subjective race review occurred.

All three new shards finished within bounds: partial/full/crowd 5.757/5.848/5.949 seconds, fresh available physical RAM 11.960/11.829/11.824 GiB, sampled Node working set 133,337,088/131,268,608/129,515,520 bytes, all exit 0. Node runners do not spawn children, but full process tree memory was not independently observed. Pinned zero-resolver analysis SHA256 `b4e94e5f8bdb9eec525d48e0ac77109c1aba91d46c07b07ed750c7f1ec11f5c7` (30,321 bytes). No held-out sample, parameter tuning, additional seed, production integration or final experience acceptance occurred. A further genuinely independent exposure sample or owner visual review needs a separately reviewed finite protocol; no automatic expansion follows.
