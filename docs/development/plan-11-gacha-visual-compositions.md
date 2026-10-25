---
id: plan-11
title: Gacha visual compositions before environment and UI assets
status: draft
depends_on: [plan-08]
gate: "Owner approves a small generation brief and budget, then selects compositions before production environment, effects or UI SVG work."
superseded_by: null
resolution: null
summary: >-
  Compare paper-style and mixed-style gacha compositions using owner-approved
  concept generations before committing to environment, effect and UI SVG assets.
---
# Plan 11: Gacha visual compositions before environment and UI assets

## Purpose and boundary

The owner accepted Plan 08 and wants E2's layered-paper treatment explored beyond the digital ducks, while allowing other treatments where useful. This is a draft investigation brief, not authorization to consume image-generation quota or build game environments. The physical apartment and D2 prop are separate (Plan 10). A production base duck can be proven in Plan 04 without waiting for full scene art.

## Required reading and preflight

Read `AGENTS.md`, `docs/founding/design.md` Assets/Immersion/Receipt contracts, `docs/decision-log.md`, Plan 08's manifest/review, Plans 04 and 09, and `docs/repo-structure.md`. Run `node scripts/dev/plan-status.js check plan-11`; stop if blocked. After assignment, first propose a small composition matrix, exact image count, generation prompts, review sizes and quota-aware stopping rules. Wait for owner approval before generation. Do not choose a visual system for the owner.

## Bounded comparison proposal

**Owner interview integration, 2026-10-25:** DECISION-008 favors sensory commercial presentation and relevant non-textual cues with accessible equivalents. Keep review annotations outside the student-facing composition; do not build mathematical/manipulation-analysis helper boxes into live gacha. Necessary price/odds/terms remain readable. If illustrating the selected 1,750-gem bundle, label bundle-only arithmetic separately from the player's whole wallet; Plan 17 owns the economic check. No new generation budget is authorized here.

**Owner play feedback, 2026-10-24:** Preserve the current logo as a favored reference. Test a full-width game stage/header, a quiet settings/save location without an always-visible autosave checkbox, and visually distinct metagame versus gacha contexts. Consume Plans 12/14's functional hypotheses without selecting teaching flow or navigation by image-generation accident. Include an oval race inside a rectangular viewing region as a composition candidate; race mechanics and camera timing remain Plan 13's gate.

Propose two or three representative gacha surfaces, such as a collectible/reveal view, a race with several ducks, and a shop or menu. Compare a predominantly layered-paper scene with a restrained mixed treatment using the same content and framing. Paper style may suit only selected elements. Reuse the E2 reference and preserve local HTML text for actual UI; concept text is illustrative, not approved copy. Examine hierarchy, contrast, duck/foreground separation, race lane readability, room for readable odds and balances, and restraint around decorative effects. Do not invent odds, near-miss rules or purchasing mechanics to dress a mockup.

Use actual image generation only after the owner approves the matrix and budget. Store concepts/prompts/provenance and a local comparison gallery under `reports/development/plan-11-gacha-visual-compositions/`. Preserve successful generations across quota interruptions; disclose missing cells and never substitute fake completions. No production asset or `src/` edits. All references remain under reports; later shipped assets require authored SVG source under the existing contract.

## Validation, delivery and gate

Compare matched desktop/narrow compositions and small race/card examples. Describe observed readability and likely SVG/layer costs separately from untested implementation/performance claims. Provide stable IDs, owner notes and a short recommendation with alternatives. The gallery must work locally without remote dependencies. Leave `progress.md` with exact coverage, missing generations, decisions still needed and the required consultation declaration. Commit only owned files, never push, never set packet status.

Stop after owner composition review. Production environment/effects/UI SVG construction requires a subsequent bounded work order; this packet does not authorize it or automatically integrate animation into the game.
