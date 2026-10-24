---
id: plan-05
title: Fatigue and pre-race choice investigation
status: draft
depends_on: []
gate: "Owner chooses or rejects a fatigue proposal before it enters gameplay."
superseded_by: null
resolution: null
summary: >-
  Compare bounded ways fatigue could obscure the one pre-race choice while
  preserving agency, accessibility, and the reduced-motion information path.
---
# Plan 05: Fatigue and pre-race choice investigation

## Packet Metadata

- Packet id: `plan-05`
- Packet title: Fatigue and pre-race choice investigation
- Status: (see frontmatter)
- Owner/model: investigator; orchestrator and owner review
- Date: 2026-10-23
- Packet type: investigation
- Mutation level: docs-only
- Approval gate: owner decision on a recommended approach; no gameplay change in this packet
- Depends on: none
- Expected artifacts: `reports/development/plan-05-fatigue-choice-investigation/progress.md`

## Goal

Recommend a bounded, testable way to express fatigue through the existing single pre-race choice, with an explicit option to retain a clear choice if obscuring methods fail review.

## Non-goals

No implementation, no adoption of the owner's examples as settled mechanics, no reflex-tap race, and no claim that deliberately changing click targets is accessible without evidence.

## Depends on

None. The recommendation may inform a later slice repair or follow-on packet; Plan 03 does not require a fatigue mechanic.

## Why this packet exists

The owner asked for ideas, not a decided impairment mechanic. Scrambled labels, shifting positions or distraction can express pressure but may impair keyboard/screen-reader use or make the choice arbitrary.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/founding/design.md` (Pond Race, Life metagame, Immersion), and owner triage O4/T3. Preserve one pre-race choice, no timing taps, and reduced-motion information and outcome parity.

## Investigation plan

1. Run `check plan-05`. State rival hypotheses up front: a visual/cognitive fatigue cue adds legible pressure; it merely creates input error; or a clear choice with narrative feedback works better. For each, name an observation that would falsify it.
2. Compare at least two bounded proposals plus a clear-control baseline on what changes visually, what stays stable for keyboard/touch/screen-reader users, how the player recovers from error, and which event-log cue would support an honest Receipt line. Identify a test where rival hypotheses predict different outcomes.
3. Propose a small user-observation protocol for the teacher's target-like computer, including reduced motion and accessibility modes. Do not infer classroom success from a paper review. Recommend one prototype candidate or recommend no obscuring, with uncertainty.
4. Return the recommendation to the owner; record no design decision without approval.

## Validation Checklist

- [ ] Candidate/baseline comparison has falsifiers and at least one discriminating observation plan.
- [ ] Keyboard, touch, screen-reader, reduced-motion, agency, and Receipt implications are explicit.
- [ ] No gameplay or canonical design was changed.
- [ ] `reports/development/plan-05-fatigue-choice-investigation/progress.md` exists; no unrelated files changed.

## Stop Conditions and report

Stop if a proposal would remove an informed choice or contradict a hard constraint. Do not set status, edit orchestrator notes, or present the recommendation as an owner decision. Report evidence limits and the exact owner choice requested. Commit the scoped report; never push.
