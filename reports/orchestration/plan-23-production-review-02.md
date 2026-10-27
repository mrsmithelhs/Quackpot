# Production core/save review during browser verification

2026-10-27. Root independently ran the current full `npm test`:165tests passed. The production browser slot remains assigned to QP Impl23; root did not drive it. A read-only Luna-high audit inspected the production commit/save/Receipt/codec boundaries, and root verified its single high-confidence finding with a direct Node probe.

## Required semantic-save repair

`validateSave` compares cached `raceAttempts` to the log only by status/raceId and compares a decoded result's crossing count to the logged finish-order length. It does not reconcile the cached outcome's identity, placement, payout or full finish order. `fromEnvelope` keeps an existing cached attempt, so the inconsistency can reach restored getters/rendering.

Root reproduction: seed `root-plan23-attempt-consistency`; start, commit/reveal promotional ten-pull, run race1 with first owned duck and Safe. JSON-cloned envelope initially validates. Replace only cached raceAttempts[1] with place6, payout999, duckId duck-999 and six fabricated finish-order IDs/payouts. It still validates while the append-only result says50Gems. This establishes an accidental state/log consistency defect, not a claim of anti-tamper security against deliberate offline editing.

Root sent the writer a bounded repair after its current browser witnesses: reconcile canonical cached finished/unresolved fields against append-only payload and decoded resolution; reject contradictory identity/digest/order/places/payouts/crossing/time/trial/winner facts without rerunning mechanics. Add valid-roundtrip and same-length fake-order/state-only corruption regressions. Check codec metadata bounds where directly relevant. Rerun core/storage/full tests; no numerical1,440-case rerun if physics is untouched. No added repair reviewer.

Other audit concerns remain covered by existing gates: one-time commit/trial/reward/RNG behavior, legacy static summaries, lossless bounded payload and three-register Receipt honesty. No further high-confidence defect was found in that bounded audit. Final production/rendered delivery remains pending; Plan23 is not closed.

## Committed delivery review

Root reviewed delivery commits `2609032` (implementation/evidence) and `7787f2e` (progress). Root independently reran the final full suite: 168/168 passed, and `npm run build` passed. Root repeated the original semantic-save probe: the valid envelope passes; the state-only fabricated duck/place/payout/same-length finish-order cache is now rejected with four explicit mismatches. Source review confirms full cached order and decoded resolution reconciliation. The previously reproduced finding is repaired.

Root inspected the final race view, focused stylesheet and smoke-harness diff. The production view now separates labels from duck rotation, uses Y-axis orientation, orders podium places 2/1/3, marks the player's place `(you!)`, derives the banner from the actual player payout, combines chronological checkpoints/events and removes the owner-identified developer text. The harness changes update race selectors and explicitly skip presentation while retaining existing reward/reload and journey assertions. They do not establish a smoke pass.

Coordinated implementer browser witnesses covered desktop/narrow actual production playback, changing runner/rig transforms, camera, event glow, matching highlight/podium filter endpoints, podium order/player banner, shared pause, event seeking and Continue gating through natural finish/replay/skip. Those are implementer-observed rendered evidence, not a separate root browser reproduction. Captures were not persisted as local images. Final reduced-motion behavior is unit-tested, not separately rendered in the final browser pass. The isolated automated smoke browser failed twice before CDP/page assertions, with Chrome exit 2147483651; this remains an open verification limitation, not a game assertion failure or passing smoke claim.

Disposition: production delivery is ready for owner visual review with these explicit limitations. No new blocking defect was reproduced in this bounded root review. The 1,440-case parity artifact remains named-fixture evidence, not a population guarantee; the last-finisher tail is separate from the accepted winner timing criterion. Plan23 remains in-progress. Owner production acceptance and final closure remain pending; no push/deployment is authorized.
