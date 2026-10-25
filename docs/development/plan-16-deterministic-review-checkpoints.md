---
id: plan-16
title: Deterministic review checkpoints and browser briefs
status: draft
depends_on: [plan-03]
gate: "Owner approves the checkpoint/load architecture and small first catalog before implementation or agent fan-out."
superseded_by: null
resolution: null
summary: >-
  Propose valid engine-generated seeded checkpoints and short review briefs so
  targeted browser checks can start at the relevant game or metagame beat.
---
# Plan 16: Deterministic review checkpoints and browser briefs

**Date:** 2026-10-24. **Type:** testing-tools investigation. **Mutation:** report and bounded proof after owner architecture approval. **Owner/model:** one investigator; later cheap read-only reviewers. **Expected artifacts:** `reports/development/plan-16-deterministic-review-checkpoints/proposal.md`, a small proposed manifest/brief format and `progress.md`.

## Goal and authority

The owner wants test saves created by underlying game code so Playwright or harness reviewers can inspect a specific game/metagame event without replaying the entire opening. Read `AGENTS.md`, Plan 03's accepted limits, current engine/storage validation, smoke journeys, relevant PRNG/log contracts and `reports/orchestration/session-handoff.md`. Run `check plan-16`; stop if blocked. Initial work owns only this report folder; no production debug hooks, source edits, browser-storage overwrite or review swarm is authorized before the architecture gate.

## Proposed design and first catalog

Compare engine/action-replay checkpoint generation with manually edited state, recommending real engine transitions and production save validation. A seed alone is insufficient: preserve full state/PRNG streams/log, current UI step/modal, configuration/rules/schema version and deterministic future input/clock assumptions. Generate synthetic checkpoints from named action recipes; do not weaken validators or invent prior display events solely to reach a desired scene. Distinguish the scripted history before a checkpoint from what the reviewer actually observes after loading it.

Propose a small first catalog, such as pending reveal, first duplicate/Down, race result, starter offer, solvent zero cash, unpaid escalation and final Receipt. Add future seeded race events/story beats only when the relevant mechanism exists; do not fabricate support today. Each manifest entry needs stable ID, generator/source revision, schema/config/seed, recipe, starting state/context, expected next events and branches, known limits and a concise review brief with look-fors. Record the actual loaded artifact fingerprint/revision in reviewer output. Version or regenerate stale checkpoints when code changes; never claim an old expected event must still occur under changed rules.

Specify an isolated local test loader/browser context that protects ordinary saves, preserves local-only/no-network behavior and keeps privileged fixture controls out of the published student build. Prefer automation loading validated fixtures over adding a student-facing import menu unless a reviewed need emerges. Checkpoint saves are synthetic testing artifacts, not student run exports or a replacement export schema. Keep generated content reproducible and free of personal names/data; decide whether generated JSON belongs in tests or ignored output only after inspecting size and reuse.

## Targeted cheap review workflow

Propose a single-writer generator and a bounded read-only reviewer batch with separate browser contexts/profiles, so agents cannot overwrite one another's saves. Existing local server/port and browser ownership must be coordinated. A brief names the checkpoint, exact action sequence, deterministic versus variable outcomes, viewport/input context, look-fors, and expected report/evidence. Use Luna-high where requested and available, or owner-selected harness alternatives; requested model and observed routing remain distinct. Do not promise a model/provider path before checking actual tools.

Select reviewers by changed-area/risk coverage, not all fixtures on every change. Give each a small task and observation budget; findings must distinguish observed failure, taste/proposal and untested concern. Root verifies material findings; cheap agents do not approve gates or establish learner comprehension. This is not authorization to launch a hundred agents, publish artifacts or send cross-thread messages.

## Validation and gate

Propose checks for deterministic regeneration/fingerprint, valid load, next-event/choice continuation, mid-reveal and terminal consistency, stale-schema rejection and preservation of existing browser saves. Use one or two real checkpoints for a bounded proof only after approval. Return architecture, catalog and brief recommendations first; a later scoped implementation adds generator/loader and regression tests. Commit owned reports with consultation declaration, never push or set status.
