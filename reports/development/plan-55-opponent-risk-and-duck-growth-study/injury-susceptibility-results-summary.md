# Injury susceptibility — fixed single-race comparison

2026-11-03. Eight paired seeds, three arms, six entrants per race: all 24 races completed. All ducks began uninjured; there were no abilities, Guard, persistent injury/recovery, real life routes or browser displays. Multi-contact and corrected advice were held as a provisional candidate, not established anti-clumping behavior. Injury-on used diagnostic 20% steady / 40% variable conditional roll probabilities and same-race 0.95 final-target effect from the next tick, not selected final odds. Paths and later contacts may diverge after injury despite paired seeds.

| Measure | Injury off | First eligible contact per duck/race | Each distinct eligible contact until first injury |
| --- | ---: | ---: | ---: |
| Actual contact events across eight races | 67 | 60 | 59 |
| Entrant-races involving at least one contact, out of 48 | 43 | 43 | 43 |
| New-injury rolls | 0 | 43 | 84 |
| Newly injured entrant-races, out of 48 | 0 | 12 | 27 |
| Races with at least one new injury, out of 8 | 0 | 6 | 8 |
| Player race entries involving at least one contact, out of 8 | 5 | 5 | 5 |
| Player new-injury rolls / injured race entries | 0 / 0 | 5 / 1 | 8 / 3 |

An entrant-race means one duck's entry in one race; the 48 entries and contacts are not independent samples. The fact that 43 were exposed in each arm is an observed total, not proof the same ducks or contacts were exposed. Different events occur after injury alters motion. With these diagnostic values, the per-contact rule generated much more observed injury in this small fixture. Eight seeds are not an adequate estimate of acceptable rates, balance, classroom experience or injury frequency across a complete game. Do not infer that either rule is selected.

| Seed | Contact events: off / first / each | Injured entrants: first / each |
| --- | --- | --- |
| 000 | 11 / 11 / 7 | 0 / 3 |
| 001 | 8 / 4 / 4 | 4 / 5 |
| 002 | 7 / 9 / 9 | 1 / 3 |
| 003 | 10 / 10 / 9 | 0 / 2 |
| 004 | 5 / 6 / 7 | 1 / 2 |
| 005 | 11 / 6 / 11 | 1 / 5 |
| 006 | 5 / 5 / 5 | 2 / 2 |
| 007 | 10 / 9 / 7 | 3 / 5 |

An injured duck received no second new-injury stack within a race; actual contact and participant-keyed opportunities are retained in arm files. Previously injured entrants, extension, recovery clocks, Guard, roster rotation and per-run consequences were not simulated. The extension helper's pure test verifies only one decision record, not a recovery transition. Existing tests do not prove rollback after a guard with live injury/contact/advice state. The original one-contact race and earlier traffic comparison are separate historical references, not additional arms in this result.

Resource receipt: prior correctness four calls; this matrix 24 calls. Fresh real-host inventory and scope-pin checks preceded each serial job. Off: 1.5394647 s / 122,912,768 sampled bytes; first: 1.5428373 s / 126,849,024; contact: 2.0426988 s / 102,006,784; analysis: 0.5215398 s / 1,789,952. All exit 0, no stop, empty cleanup/stderr. Four exclusive outputs total 69,069 bytes: `off.json` SHA-256 `52965ebbf1a14338d1ede73d6af6a1ce302f7d21dbb65c3d6a4cd732e688943a`; `first.json` `6b71561d3b6f8fbb367704363840769e52c0f1e8fb7ce7cb7d92baba75e2ef61`; `contact.json` `0ee9b64069e70999002505e3be9c310f4b10229df999e917ba3325f5b25efe9d`; analysis `0b76221bc97ec5f0f6d864086fe49056b5ccba69de0aa51fc35f72094cbdc643`. QP Orch reviews next boundary. No production source, ability animation, new provider run, or packet status was changed.
