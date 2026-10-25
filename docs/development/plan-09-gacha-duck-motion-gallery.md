---
id: plan-09
title: Digital gacha duck motion comparison
status: draft
depends_on: [plan-04]
gate: "Owner chooses motions after base SVG approval and rendered comparison."
superseded_by: null
resolution: null
summary: >-
  Compare short SVG motions on the accepted digital duck rig, with static and
  reduced-motion alternatives; the physical metagame duck remains inanimate.
---
# Plan 09: Digital gacha duck motion comparison

## Packet Metadata

- Packet id: `plan-09`
- Packet title: Digital gacha duck motion comparison
- Status: (see frontmatter)
- Owner/model: one implementer; owner review
- Date: 2026-10-24
- Packet type: investigation and prototype
- Mutation level: SVG/CSS/JS in an isolated preview
- Approval gate: accepted base SVG first; mechanism outline before coding; owner motion selection
- Depends on: `plan-04`
- Expected artifacts: local motion gallery and `reports/development/plan-09-gacha-duck-motion-gallery/progress.md`

## Goal, non-goals and rationale

**Owner selection, 2026-10-25:** DECISION-009 selects rendered Plan 04 Mode C hybrid. After Plan 04's bounded technical closeout and owner assignment here, use that construction for motion comparisons. The owner specifically values opportunities for paper layers to separate/move. Existing manual head/wing toggles are diagnostics, not the delivered motion gallery; compare relative layer articulation as well as whole-part pivots. Current C shadows filter complete head/wing groups, so inspect their behavior under articulation rather than assuming seam-only shadows. No physical-companion animation.

Test whether expressive digital ducks add useful personality and variety across repeated pulls and races. The owner wants the E2 paper-style duck's separate layers to appear to move relative to one another. Use the accepted base rig rather than polishing a placeholder. This is not authorization to animate the physical metagame duck, alter odds, ship near-miss theater, or install all candidate motions in the game.

## Authority and scope

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, design Assets/Time policy/Immersion, Plan 04's accepted rig and the duck-representation boundary note. Run `check plan-09`; stop if blocked. Propose layers/pivots, timing, trigger and reduced-motion behavior, then wait for mechanism approval before building. Own a disjoint local preview/report folder; coordinate any production asset edits separately.

## Candidate comparison and validation

**Owner play feedback, 2026-10-24:** Add one approximately 0.5-second paper-card turnaround candidate: the digital SVG narrows toward edge-on and opens facing the other direction, as a flat object rotating in depth. Compare readable front/back treatments and attachment behavior rather than requiring a volumetric duck. This is a timing candidate, not a selected animation. Full oval-course choreography, collisions and camera coverage belong to Plan 13; do not expand this rig-motion packet into a race engine.

Compare a still control with a bounded initial set: soft bob, blink, head tilt, wing flutter, squash/rebound, proud turn, startled hop and wobbling settle. Treat these as candidates, not selected behavior; adapt the list at the prebuild gate if the accepted rig cannot support one cleanly. Use one-shot clips with replay controls, plus an optional selected-card idle. Do not animate an entire collection shelf continuously. Hats/accessories must stay attached and information/outcomes must remain identical in reduced motion.

**Owner expansion, 2026-10-24:** The prebuild proposal must also offer a small race-motion comparison: paddling on water, waddling on land, flapping, appearing tired and graceful bobbing. These are candidate visual performances, not new racing mechanics or selected motions. Demonstrate visible articulation between paper groups, rather than translating the entire duck alone. Compare several ducks racing side by side, with readable lanes, mixed motion profiles and a modest repeated-duration sample. Use simple labeled water/land preview grounds; production environment art is outside this packet. Break the work into short comparison batches at the prebuild gate rather than authoring every pull and race clip at once.

Race presentation must preserve already resolved outcomes and fixed-duration/no-reflex-input rules. Do not let a tired animation silently introduce digital stamina or imply a mechanical penalty that does not exist. State whether a motion is cosmetic characterization or represents an approved event/state. Compare poses, layer pivots, overlapping shadows and accessory attachment through each cycle; preserve a clear static/reduced-motion result. Race movement may repeat for its bounded race duration, independently of one-shot reveal clips.

Use local SVG groups and CSS or browser animation APIs; no runtime CDN or remote assets. Test wide and close views, small thumbnails, two representative accessory configurations, reduced motion, interruption/replay and a bounded multi-card performance sample on the owner's target-like desktop. Compare short versus repeated presentation to expose repetition/fatigue rather than assuming “more movement” means more play value. Report measured conditions and limits; no physical classroom-hardware claim without observation.

Provide a local gallery with start/pause/replay, duration labels, a static/reduced-motion toggle and selectable motion IDs for owner notes. Each cue adopted later needs an honest event-log hook if it becomes named manipulation theater. No retention technique follows the Receipt.

## Stop and report

Stop for rig or meaning changes beyond approved scope. Write the progress report with observations, candidate trade-offs, untested cases and required consultation declaration; do not set status, edit orchestrator notes or select motions for the owner. Commit owned work/report and never push. This packet stays draft until the base is accepted and the owner starts motion exploration.

## Delivery checklist

- [ ] Local gallery and progress report exist; candidate IDs and actual observations are recorded.
- [ ] Static/reduced-motion modes, accessory attachment and interruption/replay were inspected.
- [ ] Only owned files changed; physical companion remains inanimate.
- [ ] Owner gate is preserved; no packet completion or ship readiness is self-certified.
