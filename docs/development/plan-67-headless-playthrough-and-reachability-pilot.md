---
id: plan-67
title: Headless playthrough and reachability pilot
status: in-progress
depends_on: [plan-35]
gate: "Root reviews the audits, action seam and source ownership before implementation. Owner reviews the route and coverage evidence before closure."
summary: >-
  Audit player choices and gameplay randomness, then prove three reproducible
  routes through the production engine, run a bounded reachability scan and
  verify one generated checkpoint through the browser loader.
---

# Plan 67 — Headless playthrough and reachability pilot

## Packet Metadata

- Packet id: `plan-67`
- Packet title: Headless playthrough and reachability pilot
- Status: (see frontmatter)
- Owner/model: Codex implementer
- Date: 2026-11-06
- Packet type: investigation and tooling pilot
- Mutation level: docs-only audit, then development tooling after root review
- Approval gate: Root approves the mechanism and exact write scope before implementation
- Depends on: Plan 35 for checkpoint tooling and provenance
- Expected artifacts: choice and randomness audits, route runner and scripts, bounded scan, generated synthetic checkpoint and browser evidence

## Goal

Run repeatable player journeys through Quackpot's real rules without a browser. Use those journeys to find missing or inconsistent transitions and generate targeted starts for browser review.

## Non-goals

Exhaustive search over concrete saves or seeds, a public API, replacement of the economy simulator, a broad controller rewrite, new endings or game rules, save migration, or deployment.

## Depends on

Reuse Plan 35's checkpoint recipe, validation and provenance practices. Read Plan 16 for the original checkpoint contract. No live packet blocks the read-only audit.

## Why this packet exists

Engine guards, UI eligibility and required display or confirmation steps can diverge. A headless route must respect all three to provide credible evidence about which endings and choices players can reach.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/repo-structure.md`, `docs/five-slot-life-schedule.md`, and the Plans 35, 52, 59, 63, 65 and 66 packets. Trace the live engine, controller, view routing, replay and checkpoint loader. Start with the default five-slot game and state the source revision, policy and seed. Identify experimental and historical paths separately. Preserve authoritative outcome guards, seeded draws and races, append-only evidence and checkpoint provenance.

## Scope and source coordination

Audit current source read-only and write findings under the Plan 67 report folder. After the audit gate, prefer a dev-only driver under `scripts/dev/` with report-local evidence. Root must clear each shared source edit separately with the current owner. Keep pilot outputs isolated from other plans' checkpoint catalogs and evidence logs.

- **Plan 52** shares scheduler, life routing, replay and checkpoint validation. Pin its baseline and reconcile any changed preconditions before cross-plan comparisons. Coordinate before editing any shared checkpoint tool or fixture.
- **Plans 59 and 63** share opt-in schema 6 engine/replay and presentation routing. Inventory those seams, but require a separately scoped expansion to execute them in the pilot. Preserve their frozen review snapshots.
- **Plan 65** shares startup, save identity, storage and Receipt surfaces. Use synthetic fixtures and the approved loader in an isolated browser profile. Coordinate any controller, serialization or storage edit, and keep usage IDs out of deterministic gameplay comparisons only where they are demonstrably incidental.
- **Plan 66** can consume the early exit, financial default and solvent-route evidence. Pin the current Uninstall behavior. If the placement or rules change, rerun against the new source and record the changed step.

## Implementation Requirements

1. **Audit first.** Inventory meaningful states and actions by feature, with engine guards, browser exposure, navigation and cancellation, display or confirmation prerequisites, effects, and evidence. Identify uncovered, duplicated and policy-specific paths. Audit gameplay RNG sources and stream ownership, seed construction, RNG snapshot and restore, timing and asynchronous inputs, and unrelated metadata or cosmetic randomness. Pin sources and note unknowns.
2. **Return a mechanism proposal.** Specify the initial action inventory, route mappings, checkpoint seam, files and concurrency boundaries, exploration limits and reproducibility comparison. Prefer an action query and dispatcher backed by existing guards. Propose narrow shared extraction only where the pilot needs it. A broader browser-to-engine contract change requires separate scope and evidence.
3. **Run three headless routes.** Script early Uninstall, deliberate financial default, and a solvent run with little or no gacha play. Start through normal setup and use legal transitions without state edits or injected outcomes. Record available actions, selected action, refusal reasons, time and balance effects, and terminal or Receipt evidence where reached. Distinguish a terminal ending, a rejected action, a progression dead end and a still-playable run at the horizon. Label simulated display and confirmation evidence explicitly. Repeat with identical inputs and verify the same meaningful trace. Compare a resumed segment with its uninterrupted counterpart, preserving gameplay state, RNG and evidence.
4. **Scan a bounded set of declared situations.** Use deterministic order and explicit seed, day, depth, state and time budgets. List covered state/action pairs with reproducible witnesses, policy exclusions with reasons, and cases with no witness within bounds. Document any state grouping and retain distinctions that can affect future eligibility. Report reachable dead ends with a trace. Claim unreachability only with a justified invariant or exhaustive coverage of the stated finite model.
5. **Generate and open one checkpoint.** Pick a meaningful next choice from a route witness. Generate a synthetic save with source, recipe, seed, policy and expected boundary recorded, then validate through the current production save/replay and browser loader workflow. In an isolated browser, confirm the expected next choice is visible and actionable and its result matches the route. A checkpoint with unsupported simulated display prehistory must be moved to a valid boundary or reported as blocked. Preserve actual browser observations separately. Regeneration must report the first changed action or invariant when the recipe stops working.

## Validation Checklist

- [ ] Audit and scope approved before code writes.
- [ ] All three route scripts run with repeatable traces and an illegal-action negative control.
- [ ] Save/reload continuation matches the uninterrupted gameplay segment.
- [ ] Bounded scan records its limits, witnesses and uncovered cases.
- [ ] One generated checkpoint passes save validation and the browser observation.
- [ ] Tests and browser runs use the bounded resource workflow. Historical fixtures remain intact.

## Stop Conditions

Escalate required gameplay changes, broad shared API work, disputed choice semantics, an occupied source turn or inability to preserve truthful checkpoint evidence before proceeding with dependent writes.

## Progress Report

Record audit, proposal, source pins, commands, route and scan results, browser evidence and unresolved gaps in `reports/development/plan-67-headless-playthrough-and-reachability-pilot/progress.md`.
