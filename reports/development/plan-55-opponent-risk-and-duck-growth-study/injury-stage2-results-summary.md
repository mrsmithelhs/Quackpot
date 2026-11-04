# Per-contact injury Stage 2 — two provisional traffic configurations

2026-11-03. All 96 newly resolved races finished: 16 fixed screen seeds × two provisional traffic configurations × three conditional injury-chance pairs. All entrants began healthy; no ability, recovery, extension or persistent roster was modeled. The same seeds' completed injury-free no-advice and clearance-aware races were reused as controls. The 0.95 same-race target multiplier begins on the next tick and remains diagnostic, not selected production balance. These are exploratory samples, not final odds or evidence that either traffic configuration is preferable.

| Traffic | Chance per contact, steady / Sprint | Injured duck entries out of 96 | Races with injury out of 16 | Player injuries out of 16 | Races with no injury |
| --- | --- | ---: | ---: | ---: | ---: |
| No advice | 2.5% / 5% | 8 | 6 | 1 | 10 |
| No advice | 5% / 10% | 16 | 11 | 1 | 5 |
| No advice | 10% / 20% | 29 | 16 | 3 | 0 |
| Clearance-aware advice | 2.5% / 5% | 10 | 7 | 2 | 9 |
| Clearance-aware advice | 5% / 10% | 20 | 12 | 2 | 4 |
| Clearance-aware advice | 10% / 20% | 30 | 15 | 3 | 1 |

Each 96-entry figure comprises six ducks in 16 races, not 96 independent races. An injury opportunity is conditional on an actual distinct pair contact involving that duck while still uninjured. Same seed and keyed draws do not ensure the same later contacts: an injury can alter movement. Higher bands had more observed injuries here, but these small samples do not establish classroom experience, long-run injury frequency, or an acceptable rate. No-injury outcomes can still follow multiple contacts at every band; the visual perceived severity of those contacts was not tested.

## Exposure and race position

| Traffic / band | Exposed entries steady / Sprint | Actual injury rolls steady / Sprint | Newly injured entries steady / Sprint | Injuries while active rank 1 / lower |
| --- | ---: | ---: | ---: | ---: |
| No advice / low | 43 / 40 | 122 / 110 | 3 / 5 | 0 / 8 |
| No advice / medium | 44 / 41 | 109 / 97 | 7 / 9 | 0 / 16 |
| No advice / high | 45 / 42 | 107 / 93 | 12 / 17 | 4 / 25 |
| Clearance / low | 44 / 41 | 121 / 114 | 3 / 7 | 0 / 10 |
| Clearance / medium | 45 / 42 | 115 / 109 | 7 / 13 | 0 / 20 |
| Clearance / high | 45 / 42 | 106 / 93 | 12 / 18 | 3 / 27 |

Each arm contains 48 steady and 48 Sprint entries. Exposed means at least one actual contact, not that the duck was injured. Roll counts depend on contact exposure and stop after injury. The rank is among still-active entrants immediately before the contact resolver, with active count stored on each event; it is not necessarily the position a player perceived, nor the eventual place. All 113 observed injury entries had a recorded witness showing the 0.95 target applied on the following tick. The correctness gate separately checked the witness calculation; this is a diagnostic target, not evidence of a selected injury animation or a finished recovery model.

## Race-level spread and timing

Counts of injured entries by screen seed 000–015, in order:

| Band | No advice | Clearance-aware advice |
| --- | --- | --- |
| Low | 0, 1, 2, 0, 0, 2, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0 | 0, 2, 1, 1, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1 |
| Medium | 1, 1, 2, 1, 1, 2, 3, 1, 0, 0, 2, 1, 1, 0, 0, 0 | 1, 3, 2, 1, 1, 2, 3, 1, 0, 0, 2, 2, 1, 0, 0, 1 |
| High | 2, 2, 1, 2, 1, 3, 4, 1, 1, 1, 2, 4, 2, 1, 1, 1 | 2, 4, 1, 1, 1, 3, 3, 1, 1, 1, 2, 4, 2, 0, 3, 1 |

Median winner crossing was 21.517 s in both traffic configurations at low and medium, and 21.549 s at high; none of the 16 winners per arm crossed strictly after 23 s. Median last crossing for no advice was 22.936 / 22.996 / 23.098 s (low / medium / high), and for clearance was 22.861 / 22.983 / 23.147 s. Player wins were 14 / 15 / 14 and 15 / 15 / 14 respectively. The player had base speed 10 versus the rivals' 8; the results do not establish general stat scaling, progression effects or a valid tail-rate estimate from only 16 races.

Relative to the paired injury-free control, the ordered contact IDs differed in 5 / 11 / 14 no-advice races and 5 / 11 / 13 clearance races; finish ordering differed in 6 / 10 / 14 and 6 / 9 / 12 respectively. These are descriptive differences, not a causal decomposition. The later histories can diverge after injury affects motion, so an unchanged seed is not an identical watched race. Actual contacts per arm were 122 / 115 / 119 (no advice) and 123 / 122 / 119 (clearance). This experiment does not show that clearance advice reduces injury or crowding.

## Provenance, resource receipt and limits

Source manifest SHA-256 `72b477187470c07fd206ba42642410e58791603d7464b777f8143c93d986b5aa`; full per-contact rolls, ticks, rank/active count, exposures, target witnesses, contact rearm audit, crossings and status are in the six `injury-stage2-output/` shard files. Analysis SHA-256 `4839eeeac69738304ec0b46082cc8bd4de7ca0b411dc3c083ea0e9cd0f444b8d`. Completion markers bind each shard and the two frozen control hashes. Every shard claimed a start marker before any call; there were no interrupted shards or retries. Source/control pins were checked in each job before and after calls. No browser, provider, production, packet-status or held-out work occurred.

| Serial job | Calls | Wall s | Peak sampled bytes | Free GiB before job |
| --- | ---: | ---: | ---: | ---: |
| No advice low | 16 | 3.260 | 148,389,888 | 13.44 |
| No advice medium | 16 | 3.775 | 152,240,128 | 13.40 |
| No advice high | 16 | 3.790 | 159,903,744 | 13.41 |
| Clearance low | 16 | 3.774 | 153,989,120 | 13.48 |
| Clearance medium | 16 | 3.235 | 149,020,672 | 13.45 |
| Clearance high | 16 | 3.803 | 150,577,152 | 13.40 |
| Analysis | 0 | 0.540 | 4,075,520 | 13.51 |

Each job exited 0 with no resource stop, stderr or cleanup notes. The 96 screen calls are distinct from the preceding ten correctness calls: the first two stopped on a comparator mismatch without recording its exact field; the corrected eight matched both controls after excluding only the two named rank annotations, witnessed the 0.95 next-tick target in six test injuries and passed two live-injury rollback cases. The exact first mismatch location remains unknown; see `injury-stage2-protocol.md` and preserved receipts.

This isolated healthy single-race screen does **not** test Guard, Bounce, crowd acceleration, rarity combinations, injury duration/recovery, rest, multi-race roster choice, a favorite duck's progression, or the player's subjective interpretation. The owner has specifically noted that a favorite need not be raced when tired or injured. Those questions remain for later bounded work; held-out seeds remain untouched. Root must review these findings and choose the next provisional comparison before any confirmation or ability study; no final probability has been selected.
