# Multi-contact base comparison — exploratory results

2026-11-03. Eight fixed paired seeds, three arms, 24 completed races, no unresolved/guard result. All arms shared the same seed-specific mixed steady/variable entrants. Reference is a **mixed-field candidate with the original one-contact limit**, not an exact production-input race; prior disabled-option parity separately checked original production. Multi-contact arms have no injury or abilities. The advice-on candidate is the first provisional crowd-avoidance rule, not an adopted racing policy.

| Seed | Reference contacts | Multiple contacts, advice off | Multiple contacts, advice on | Advice-eligible decisions / followed |
| --- | ---: | ---: | ---: | ---: |
| 000 | 1 | 12 | 11 | 2 / 2 |
| 001 | 1 | 5 | 8 | 14 / 12 |
| 002 | 1 | 7 | 7 | 5 / 4 |
| 003 | 1 | 8 | 10 | 3 / 1 |
| 004 | 1 | 5 | 5 | 4 / 3 |
| 005 | 1 | 6 | 11 | 2 / 1 |
| 006 | 1 | 5 | 5 | 8 / 4 |
| 007 | 1 | 11 | 10 | 14 / 6 |
| **Total** | **8** | **59** | **67** | **52 / 33** |

The advice-on candidate did not reduce total contacts in this small sample. A provisional rapid-cluster proxy (two distinct contacts sharing an entrant within one second, counted as pairs) found 10 pairs with advice off and 11 with advice on. Those are not necessarily eleven distinct dogpiles, nor evidence that any particular steering decision caused or prevented a collision. In the advice arm 26 of 31 eligible steady decisions followed the candidate advice, versus 7 of 21 sprint decisions. Decisions and races share seeds/entrants and are not independent human observations.

All racers finished in all 24 cases. Average first-winner time was approximately 21.375 s reference, 21.424 s multi and 21.424 s advice; average last crossing was 22.910, 23.038 and 23.114 s respectively. Eight seeds do not establish the accepted race timing distribution, balance or experience. The reference's one-contact limit itself constrains the contact count, so its 8 vs 59 comparison does not alone measure perceived severity. The output retains per-case contact participants and crossings, all eligible advice decisions and skip totals.

Crowding and very-low-speed results are recorded as trajectory snapshot counts, not seconds. Although dt is 0.05 s, individual crossing interpolation produces fractional tick gaps; the exact gap values are in each case. The earlier two-call low-cap fixture stopped at tick14 before any contact/advice/pair state, so it does not establish rollback of live multi-contact state or the candidate 32-contact guard. Independent full-physics chain/crossing verification and owner visual review remain open. No Bounce, crowd acceleration, injury, roster progression or production integration was tested.

Resource: reference 8 calls, 1.5408069 s / 100,798,464 sampled bytes; multi 8, 1.5328909 s / 99,790,848; advice 8, 1.5374561 s / 101,105,664; fixed analysis 0.5218332 s / 1,843,200. All exit 0, no stop, empty cleanup/stderr. Fresh real-host inventories and scope pins matched before each. Four exclusive outputs total 41,421 bytes; `reference.json` SHA-256 `2497b4d14af4a174922f4e5da0ecb718f2b57301520f832517c88d4e6abd984f`, `multi.json` `1453fac17e0a372de1c6919a529f2fb4f951100d83341815b000e399ac14a500`, `advice.json` `a1309ea5ea13451f05fb3090dc96e9325ed8c075bc614b15eaFCF34b793e6969`, analysis `c54a5701585d7dab2a29bab1b34a25434f9488583ca0e024df4e485c1b65d8f3`. The three arms and analysis are saved under `multi-base-results/`. QP Orch decides the next bounded action; no result-driven retuning or new execution is authorized by this report.
