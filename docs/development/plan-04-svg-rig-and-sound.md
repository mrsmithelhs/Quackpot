---
id: plan-04
title: SVG duck rig and synthesized sound spike
status: delivered
depends_on: [plan-02, plan-08]
gate: "Owner reviews one rendered rig and sound sample before wider asset production."
summary: >-
  Prove a small layered SVG duck rig and local parameter-synthesized sound
  without deciding broad art production or music provenance.
---
# Plan 04: SVG duck rig and synthesized sound spike

## Packet Metadata

- Packet id: `plan-04`
- Packet title: SVG duck rig and synthesized sound spike
- Status: (see frontmatter)
- Owner/model: one implementer; orchestrator and owner review
- Date: 2026-10-23
- Packet type: prototype
- Mutation level: content and scripts
- Approval gate: mechanism/asset outline before coding; owner review of a small sample before expansion
- Depends on: `plan-02`, `plan-08`
- Expected artifacts: one composable SVG source sample and a small text-parameter sound prototype, `reports/development/plan-04-svg-rig-and-sound/progress.md`

## Goal

Prove that palette, hat and accessory layers can form distinct digital gacha ducks from SVG source and that a local parameter set can synthesize one short effect in browser. Keep the physical metagame prop's representation separate.

## Non-goals

No complete roster, generated raster background, PNG delivery without measured benefit, finished music, game balance, or full presentation polish.

## Depends on

Plan 02's accepted layout determines asset/source paths. Plan 08's owner-selected visual directions determine the base look; do not treat the build-spike placeholder as the approved rig. This packet may run beside Plan 03 only with disjoint file ownership; integration into game UI is a later reviewable change. Keep the physical metagame companion inanimate; its alternate-view/lighting study is Plan 10, and digital motion comparison follows in Plan 09.

## Why this packet exists

The layered rig and audio approach need a measured proof before asset volume grows. Cosmetics must remain separate from finite collectible identity and stats.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/founding/design.md` (Assets, Immersion, Technology), and Plan 02's layout decision. All art starts as repository SVG. Ordinary text stays HTML/CSS. Sound parameters are stored as text and synthesized locally; no runtime network calls. Reduced motion preserves content and choices.

## Scope and work plan

**Repair 02 closeout, 2026-10-25:** `e74b99c`/`7a390da` satisfies the bounded rig/audio repair. Owner accepts the manual head/wing poses as a starting point. Root verified 138 repository tests, corrected two small gallery wording/scrolling issues inline, regenerated the preview and reran 40 scoped tests plus a generated-controller witness. See report-folder `review-04.md`. Accept Mode C and retain all three sound candidates as this proof; no further implementer repair, production integration or motion selection. Historical notes below retain the earlier review sequence.

**Refinement return and owner selection, 2026-10-25:** Owner selects rendered Mode C and retaining all three sounds, reporting C softer. See DECISION-009, report-folder `review-03.md` and `repair-02.md`. The 34 scoped tests pass, but default/master remain B, audio validation is incomplete and reporting overclaims loudness/contains stale values. Repair 02 is the concrete narrow follow-up, preserving selected appearance and sound settings; no redesign or motion catalog. Packet is delivered for this review, not complete or newly assigned. Library-audio policy is separately proposed in draft Plan 18, not part of this repair.

**Refinement proposal review, 2026-10-25:** The returned refinement outline is preserved in report-folder `refinement-proposal-01.md`. `refinement-prebuild-review-01.md` approves the bounded paper/sound comparisons with controlling corrections to Candidate B's actual parameter limits, Candidate C's routing/experimental claims and volume evidence. Current packet check is runnable; the attachment's earlier delivered-status block is historical. Update the proposal accordingly and proceed without another general preflight round, preserving owner sample-selection gates.

**Owner refinement dispatched, 2026-10-25:** The owner sent the whole `reports/development/plan-04-svg-rig-and-sound/owner-refinement-01.md` to the implementer. This covers the complete prior art and sound advice. Packet is `in-progress` for the bounded refinement: implement the matched paper-layer comparison and first propose the limited sound treatments; no general audio rewrite/library migration or game integration is authorized. Original visual/sound acceptance remains open.

**Repair 01 technical review, 2026-10-24:** `ce8e34b`/`2ad66fe` resolves the source-backed preview blocker. Root rebuilt the gallery and verified parity; see `reports/development/plan-04-svg-rig-and-sound/review-02.md`. Packet stays `delivered` pending owner rendered-base and sound audition. No additional asset production, integration or motion assignment is implied.

**Delivery review, 2026-10-24:** `6056c3c`/`aecc1db` returned for bounded Repair 01. The review gallery duplicates source composer/audio logic, so it is not yet an authoritative rendered witness of the tested modules. Read this packet's `reports/development/plan-04-svg-rig-and-sound/review-01.md` and `repair-01.md`. No rig redesign, game integration or broader asset work is requested.

**Prebuild review, 2026-10-24:** The owner assigned this packet to a Gemini implementer. Its submitted outline is preserved in `reports/development/plan-04-svg-rig-and-sound/proposal-01.md`; `prebuild-review-01.md` approves the bounded concept with controlling scope/interface conditions. Read both before building. Plan 12 may run independently in its own report folder. No production game UI integration is authorized.

**Owner direction, 2026-10-24:** Use Plan 08's E2 layered-paper concept as the digital SVG proof reference. Author separate overlapping paper-like groups (including wing sublayers), with stable pivots and accessory attachment points for later articulated motion. Prove the static base and small-size readability first; no raster texture embedding or production race animation in this packet. D2 is the physical companion reference, with alternate views/lighting handled separately in Plan 10. Broader gacha environments, effects and UI need the composition investigation in Plan 11 before production SVG work; this rig proof does not settle them.

1. Run `check plan-04`; present layer interface, asset paths, representative variants and sound parameter approach; **wait for mechanism approval before building**.
2. Create the owner-selected digital base plus a few recolor/layer combinations. Prove parts compose without making a new identity for every cosmetic variant. If demonstrating a physical-companion derivative, keep it static and separately identified; coherent alternate views/lighting belong to Plan 10, and a different owner-selected physical-prop style must not be forced into the digital rig.
3. Create one short local synthesized sound from text-stored jsfxr/ZzFX-style parameters. Test user-gesture audio startup and silent fallback.
4. Capture rendered examples and basic performance/accessibility observations. Keep PNG and music decisions open unless separately measured and owner-approved.

## Validation Checklist

- [ ] SVG source and rendered sample demonstrate interchangeable parts and distinct looks.
- [ ] Cosmetic variation does not alter finite identity or stat model.
- [ ] Sound works locally from text parameters and has a silent fallback.
- [ ] No remote asset, CDN, or generated raster source was introduced.
- [ ] Required artifacts and `reports/development/plan-04-svg-rig-and-sound/progress.md` exist; no unrelated files changed.

## Stop Conditions and report

Stop if extending the rig requires a roster policy, PNG exception, or music provenance decision. Do not set status, edit orchestrator notes, or claim art readiness. Report sample observations and limits, not a count of variants. Commit scoped work and report; never push.
