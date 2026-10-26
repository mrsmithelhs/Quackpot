# Plan 13 correctness repair review

Date: 2026-10-26. Verdict: technical repair accepted; delivered for owner race-design review, not final mechanics selection or closure.

Root inspected `e23289f` and final report `5d12a2b`, reproduced 16/16 focused tests, then reran `seed-scan-20.mjs`. The regenerated JSON SHA-256 exactly matches `68B4E3A3375D7F149D9459DCE9BBD444245AA9B3413B5A6082656E085DE41431`; no tracked evidence diff remains. This resolves the stale diagnostic artifact finding.

Narration distinguishes targets, attained/failed acquisition and incomplete holds; shared contact status derives from per-participant recovery; bounded appends/rollback preserve unresolved/no-payout behavior at guards. Regression tests include timeout/interrupted text, asymmetric/unfinished contact recovery and cap boundaries. Root source inspection and reproduced tests support acceptance of the four requested repairs. No new reviewer was used for the bounded repair.

The final-step audit is evidence about a stated fixed-step approximation, not proof of continuous event ordering: in500 sampled races, one geometric pre-finish proximity could not fire under the already-used contact cap,92 candidates were after finish and none were walls. Keep the approximation explicit if future mechanics change. No solver/tuning was silently introduced. The implementer's coordinated browser checks cover named R03 contact and weave narration; root did not duplicate those during Plan20's exclusive browser slot.

Remaining owner decisions: choose or reject compared steering/weave/contact treatments and pacing; long recenter times suppress opportunities, some labels overlap, starting rows confer unequal distance and only one contact episode is supported. These are disclosed investigation results, not approved production quality. Reported20-seed timing range is not universal balance evidence. Rest-rule integration belongs to draft Plan22 (collection is Plan21); neither penalty is present in these comparisons. No production integration, packet closure, push or deployment follows.
