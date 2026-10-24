---
id: plan-04
title: SVG duck rig and synthesized sound spike
status: draft
depends_on: [plan-02]
gate: "Owner reviews one rendered rig and sound sample before wider asset production."
superseded_by: null
resolution: null
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
- Depends on: `plan-02`
- Expected artifacts: one composable SVG source sample and a small text-parameter sound prototype, `reports/development/plan-04-svg-rig-and-sound/progress.md`

## Goal

Prove that palette, hat and accessory layers can form distinct cosmetic ducks from SVG source and that a local parameter set can synthesize one short effect in browser.

## Non-goals

No complete roster, generated raster background, PNG delivery without measured benefit, finished music, game balance, or full presentation polish.

## Depends on

Plan 02's accepted layout determines asset/source paths. This packet may run beside Plan 03 only with disjoint file ownership; integration into game UI is a later reviewable change.

## Why this packet exists

The layered rig and audio approach need a measured proof before asset volume grows. Cosmetics must remain separate from finite collectible identity and stats.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/founding/design.md` (Assets, Immersion, Technology), and Plan 02's layout decision. All art starts as repository SVG. Ordinary text stays HTML/CSS. Sound parameters are stored as text and synthesized locally; no runtime network calls. Reduced motion preserves content and choices.

## Scope and work plan

1. Run `check plan-04`; present layer interface, asset paths, representative variants and sound parameter approach; **wait for mechanism approval before building**.
2. Create one base duck plus a few recolor/layer combinations, including one less-extreme own-duck look. Prove parts compose without making a new identity for every cosmetic variant.
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
