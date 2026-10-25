# Plan 03 owner play feedback and disposition

**Date:** 2026-10-24. **Authority:** owner played the slice, delegated now/later triage and allowed closure if feedback belongs to subsequent work. Technical acceptance is review 03 at `f04a11b`.

| Owner feedback | Disposition |
|---|---|
| Likes the logo | Preserve as a favored reference in Plans 11/14. No redesign request. |
| Full-width header; game rather than website feel | Near-term design obligation in Plan 14, then approved shell implementation. Full stage width does not require full-width body copy. |
| Remove persistent header autosave checkbox | Plan 14 relocates it while retaining start-menu choice, discoverable settings and explicit Save. No removal of saving ability. |
| Exposition through play; introduce Gems, duplicates and Down one at a time | Plan 12 guided-opening proposal. No opening lecture, unexplained buttons or forced PRNG teaching result. |
| Graphic/UI transition between metagame and gacha | Plan 14 functional context proposal, coordinated with Plans 10/11's separate art directions. |
| Slower dramatic oval races, mixing/bumping, camera moves, rectangular viewport and ~0.5s flat turns | Plan 09 individual turn study; Plan 13 race/camera/pacing study. Durations and new causal collision rules are proposals, not adopted game mechanics. |
| Remove developer-facing Receipt sentence | Inline presentation cleanup now. Also remove adjacent hash-chain/tail diagnostics and log-derived labels from player copy; internal evidence/projection remain intact. |
| Shop must welcome players as complexity grows | Plan 12 progression/wireframe investigation, coordinated with Plan 06 odds-detail and Plan 11 compositions. |
| Days too short | Plan 13 timed day/run beat map. The three-day mechanism trial was not representative production pacing. |

## Closeout and sequencing

**Inline verification:** Receipt-only copy/diagnostic presentation cleanup passed a fresh Vite production build; no game rules, log projection or save behavior changed. Packet render/lint passed. Advisor consultation was not warranted for this cosmetic copy cleanup. Prior 98-test/11-phase technical evidence remains tied to its recorded implementation; the full browser suite was not rerun for this text-only follow-up.

Close Plan 03 as the owner-played bounded mechanism proof after the inline Receipt cleanup. These observations are presentation, teaching and pacing obligations rather than failed approved mechanism acceptance checks. Preserve the short-trial/Common-only limitation and the Skip Lunch settlement follow-up before reachable food-shortfall expansion. No final balance, fifteen-minute floor, production presentation or deployment is accepted by this closure.

New Plans 12–14 are drafts only; no packet assignment, generation budget or implementation is implied. Recommended next sequence for owner approval: Plan 04 base SVG preflight beside Plan 12 guided-opening investigation; Plan 14 shell/context proposal next or disjoint in parallel; Plan 11 composition generations after functional targets and budget approval; then Plans 09/13 individual motion and race/pacing prototypes after the base rig gate. Plan 10 physical staging remains separate. Keep each actual implementation small and return recommendations to the owner.

## Recommendation boundaries

Current normal race motion is 1.2 seconds, so literal fivefold scaling is about six seconds. Compare durations around 12/20/30 seconds before selecting; longer waits alone do not establish drama or educational value. Lane mixing/collisions/camera cuts must have clear visual-versus-mechanical semantics and must not create an unapproved false near-miss story.

Flat depth turns are a viable prototype candidate with CSS Y-axis rotation on an SVG wrapper and a deliberate reverse-facing/back treatment. This is an inference about E2's paper treatment, not a measured implementation result. Primary references: [MDN rotateY](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/transform-function/rotateY), [MDN backface visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backface-visibility). A mirrored back alone may reverse asymmetric accessories; inspect the actual rig before selection.
