---
id: plan-36
title: Late-game disorientation and unreliable narration investigation
status: ready
depends_on: []
gate: "Owner authorized investigation on 2026-10-30. Assignment/model and any prototype execution need orchestration clearance; owner selects effects before production implementation."
superseded_by: null
resolution: null
summary: >-
  Investigate late-game transition disturbances, gacha imagery spilling into apartment
  life, and unreliable character narration. Return bounded alternatives, grounded
  counterpoints, truthful Receipt mappings and owner decisions before prototypes or integration.
---
# Plan 36: Late-game disorientation and unreliable narration investigation

## Packet Metadata

- Packet id: plan-36
- Packet title: Late-game disorientation and unreliable narration investigation
- Status: (see frontmatter)
- Owner/model: unassigned investigator; orchestration coordinates
- Date: 2026-10-30
- Packet type: investigation / creative direction
- Mutation level: report-only initially
- Approval gate: mechanism/experiment proposal before prototypes; owner effect selection before production
- Depends on: none for investigation; future implementation dependencies must be identified
- Expected artifacts: report-local proposal, effect matrix, three short scene treatments, recommendation and progress report

## Goal and why this packet exists

The owner wants the later fictional character's experience of gacha to intrude on
their perception and narration of apartment life. Investigate expressive effects
that suggest absorbed attention, lost time, habit and rationalization without
diagnosing the human player or compromising reliable controls and factual evidence.
These are new candidates, not adopted story events or implemented mechanics.

**Owner expansion, 2026-10-30:** Independent Claude Opus, Claude Sonnet, Gemini
Argon and Gemini Flash reviews may first propose broader story developments and
interaction types beyond the current roadmap, then develop Plan 36 ideas in that
context. Ordinary engaged play now targets at least roughly 30 minutes without a
selected upper duration ceiling; duration remains unvalidated and never enforced.
Each reviewer may use up to four low-tier tasks (Haiku for Claude, Flash for Gemini),
at most two concurrently, with no recursive fan-out. All reviewer/subagent output
stays in that harness's own working directory OUTSIDE the repository. The owner
will copy reports back for discussion; no cross-provider repository writes,
implementation or adoption is authorized. This explicit budget applies only to
these external reviews, not a blanket budget for the later assigned investigator.
Use reports/orchestration/plan-36-external-creative-review-handoff.md. Preserve
independent reports and provenance; recommendations are inputs for owner triage.

## Authority and required reading

Read AGENTS.md, docs/founding/design.md, docs/decision-log.md,
docs/development/README.md, docs/repo-structure.md, and the relevant accepted
Plan 14/19/25 transition/desk reports. Read draft Plans 05, 15, 27, 28, 29, 30,
31 and 32/closed Plan 33 only for adjacent scope and decisions; do not reopen them.
Inspect actual source wiring selectively before describing implementation feasibility.
The owner request dated 2026-10-30 authorizes this investigation, not implementation.

Preserve hard constraints, zero runtime network requests, local saves, seeded
outcomes, static delivery, and Receipt honesty: **we displayed / you did / did this
affect you?** Physical companion ducks stay inanimate. Changed lighting and camera
composition may suggest character, but gacha animation must not be applied to them.

## Ownership and non-goals

Own only NEW reports/development/plan-36-late-game-disorientation-investigation/.
Do not edit src/, shared tooling, fixtures, schemas, assets, audio, packet status,
decision records or closed reports. No generation, downloads, packages, Node/browser
execution, researcher fan-out or reviewer budget is implied. Propose any such work
with exact scope and resource needs first. Report illustrations may initially be
text storyboards; do not build a new scene engine to explain a recommendation.

Do not implement life choices, room navigation, music playback, diagnoses,
psychiatric simulations, actual hidden purchases or autonomous financial decisions.
Do not impose waits or tune economy/pacing. Existing production has a short bounded
route; later narrative stages/rooms are proposed content, not already available.

## Work plan and gates

1. Map current transition, scene, audio and log boundaries; distinguish implemented
   hooks, accepted plans and absent capabilities. Propose a small report structure.
2. Produce a bounded menu (approximately 12 candidates) across the three families
   below, then shortlist about four complementary effects. Include quiet recovery
   moments and escalation alternatives; more effects is not the objective.
3. Write three short treatments: first intrusion, sustained spillover, late ambiguity.
   Each includes the ordinary version, disturbed version, reduced-motion/static
   equivalent, grounded counterpoint and an example Receipt treatment.
4. Recommend a small isolated comparison, if useful, with precise files, scenes,
   controls, resource budget and questions for the owner. Stop for approval before
   executable prototypes, new art or sound. Report owner decisions separately from
   investigator recommendations. Production adoption requires a later bounded packet.

## Candidate families supplied by the owner

### Transitions and spatial continuity

Consider increasingly slow or erratic phone return, orientation bounceback,
landscape resting orientation, arrival in another apartment room, an unfamiliar
hallway or someone else's apartment, gacha music persisting after return, and a
wobble/snapback toward gacha. Compare their narrative meanings and confusion risks.

Root recommendation for investigation: honor intentional navigation. A return may
look interrupted while still reaching an actionable apartment view; an apparent
snapback should be an optional/interruptible authored beat, not an actual failed
exit command. Do not select either alternative without owner review. Changes to
settled exit/navigation protections are load-bearing decisions to surface, never
an implementer's inference of authorization from this candidate list.

### Gacha imagery and habits in ordinary life

Consider faint card-frame/rarity shapes among apartment objects, apparent motion in
reflections or light, collection-style arrangements of meal receipts, merch treated
as a collection, and gacha-styled messages about life events. Additional candidates
include a missing object leaving a familiar silhouette, calendar boxes echoing a
reward grid, and ordinary notices acquiring promotional visual grammar.

Keep real bills, payment terms, costs, balances and choices legible and accurate.
Separate fictional app persuasion, character thoughts, actual evidence and purely
visual motifs. An object arrangement may depict character activity between scenes;
it must not be recorded as an action performed by the human player. No inventory,
cash or reward mutation may be smuggled in as decorative scene continuity.

### Unreliable character narration

Explore rationalization, selective attention, time compression, repeated plans,
and a remembered intention contradicted by a visible object or earlier recorded
choice. Examples: 'just one race' against a cold meal; a repeatedly rewritten plan
for tomorrow; the character remembering a celebratory sound over a mundane message.

Prefer bounded ambiguity with concrete counterpoints to arbitrary plot reversals.
Never falsify a real player choice, overwrite a save, rewrite event evidence, claim
the human forgot something, or present unobserved psychological impact as fact.
Any fabricated memory belongs explicitly to character narration, not operational
instructions or the Receipt's factual account. Do not turn the companion into an
omniscient moral judge or require a clinical interpretation.

## Required design analysis

For each shortlisted effect specify trigger/eligibility, narrative purpose,
stage range, seeded variation, duration/frequency/cooldown/repeat cap, visual/audio
layers, grounded counterpoint, interruption/exit behavior, readable fallback,
save/reload/one-shot lifecycle, exact displayed-event evidence, implementation
dependency and an explicit reason to reject or defer it.

Use story-state pressure bands, not a diagnosis inferred from clicking speed or
real-world behavior. Cosmetic selection should use a separate deterministic stream
or stable event keys so it cannot perturb draw/race/economy randomness. A selected
beat must not reroll through reload; preview evidence and actual displayed cues
remain distinct. Quiet returns must remain eligible at later stages. No selected
rates, mandatory order or escalation schedule is implied by this packet.

Keep Uninstall and its immediate Leave route visible, stable and actionable even
during disturbances. Costs/odds/terms, focus, Settings, saving/storage feedback and
accessible navigation cannot be obscured, moved away from an activated target or
made unreliable. Reduced motion must convey narrative information with stills,
cuts/text/object changes; do not translate disorientation into harder controls.
Investigate an optional sensory-effects-off setting without silently selecting a
new global settings policy. No flashes, screen shake or audio tricks are required.

The Receipt must distinguish displayed treatment, explicit player action and
depicted character activity. Suggested questions invite reflection without asserting
effects: 'Did the game still feel present when you returned to the apartment?'
Keep a reliable factual anchor (e.g. actual day/expense/history) somewhere available;
the debrief cannot itself become an unreliable narrator.

## Validation and delivery

- [ ] Current-capability map names actual source evidence and absent dependencies.
- [ ] Owner candidates and new recommendations are identified separately.
- [ ] Bounded matrix and three treatments include quiet/grounded alternatives.
- [ ] No human actions or psychological effects are invented as Receipt facts.
- [ ] Navigation/Uninstall, accessible equivalents and save/reload are accounted for.
- [ ] Narrative surprises preserve actual obligations, outcomes and event evidence.
- [ ] Proposed experiment stops at its mechanism/budget gate; no runtime changes.
- [ ] Recommendation gives a small owner choice, rejected/deferred ideas and risks.
- [ ] Progress report records scope, sources, work performed, consultation posture,
      limitations and readiness for owner review against the actual objective.

Before assignment, run the guarded packet check for plan-36; nonzero means stop.
Implementers never set status, write orchestration dispositions or claim release
readiness. Commit explicit owned paths, progress last, never push or deploy.
