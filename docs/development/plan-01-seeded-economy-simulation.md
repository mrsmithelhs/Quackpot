---
id: plan-01
title: Seeded economy and Receipt simulation
status: delivered
depends_on: []
gate: "Owner reviews the S1-S4 evidence and proposed tuning before any values become design rules."
superseded_by: null
resolution: null
summary: >-
  Build one reproducible PRNG and a headless model to test pity, economy loops,
  roster duplicates, and event-log Receipt lifecycle from provisional values.
---
# Plan 01: Seeded economy and Receipt simulation

## Packet Metadata

- Packet id: `plan-01`
- Packet title: Seeded economy and Receipt simulation
- Status: (see frontmatter)
- Owner/model: one implementer; orchestrator and owner review
- Date: 2026-10-23
- Packet type: prototype and investigation
- Mutation level: scripts
- Approval gate: mechanism outline before coding; owner review of findings before tuning is adopted
- Depends on: none
- Expected artifacts: reusable PRNG module, headless simulation and focused tests, `reports/development/plan-01-seeded-economy-simulation/progress.md`

## Goal

Make the founding draft's numeric assumptions testable before the game depends on them. Produce reproducible, bounded evidence for S1–S4 and a small shared PRNG suitable for later game use.

## Non-goals

No UI, final values, per-duck or per-cosmetic balancing, shipped near-miss form, or assertion that a headless run measures real classroom minutes.

## Depends on

None. This is the first numerical and Receipt-structure dependency for the mechanism slice. Keep file ownership disjoint from Plan 02's Vite/build files if both run concurrently.

## Why this packet exists

Draft pity at pulls 35/50 could be unreachable, while race rewards could either buy endless pulls or strand the player. Final state cannot reconstruct which cues and conditional odds were shown before an early exit.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/founding/design.md` in full, and `reports/orchestration/founding-docs-review/owner-triage.md` (S1–S4, O1, T5–T9). Treat the Tuning table as starting inputs, not accepted tuning. Preserve the no-per-variant-balancing bound, finite identity versus cosmetic-look distinction, and three-register Receipt honesty rule.

## Scope and work plan

1. Run `node scripts/dev/plan-status.js check plan-01`; stop if blocked. Inspect repository state. Propose PRNG interface, module paths, scenario variables, event schema, and Receipt projection wiring to the orchestrator; **wait for mechanism approval before coding**. Paths are provisional until Plan 02's layout gate.
2. Implement a small seedable PRNG with explicit seed serialization and replay tests. Use it for draws and event-deck selection; keep independent scenario inputs explicit.
3. Model the opening free ten-pull, pulls and pity, banner transitions, race payouts, wages/expenses, cash/gems, finite roster duplicates and Down, bounded set bonuses and curveballs, and terminal routes only to the level needed for S1–S4. Parameterize unknown values and label assumptions; do not quietly select them as policy.
4. Run an unchanged baseline from every applicable row in the Tuning section's **Starting values for simulation** table, marking unspecified inputs as assumptions. Then sweep broad candidate ranges and player strategies for S1 pity reachability, S2 self-funding versus starvation, and S3 roster/duplicate behavior. Include runs beyond 15 days, a few human-readable seed traces, distribution tails (min, percentiles, max), and an explicit accounting of any dimensions left unswept. Estimate the roughly 15-minute floor using stated pacing assumptions; flag that it requires browser/human observation.
5. For S4, use an append-only log and Receipt projection to test early Uninstall (including mid-reveal), zero cash or unpaid expense, ineligible event, and banner transition near ending. Assert displayed cues, actions, costs, outcomes and actual pre-draw conditional odds appear only when recorded; exercise all terminal routes represented by the model. Keep *We displayed / You did / Did this affect you?* separate and avoid motive claims.
6. Report rival explanations and their falsifying observations for numerical conclusions. Recommend a small set of candidate values or experiments to the owner, with sensitivity and uncertainty, not a selected balance table.

## Validation Checklist

- [ ] Seed and inputs replay the same draws, event choices and trace; different seeds can diverge.
- [ ] S1–S4 each have named scenarios, observations, tails or trace evidence, and limits.
- [ ] Receipt adversarial traces preserve append-only provenance and conditional pre-draw odds.
- [ ] No per-variant balancing or UI implementation was added.
- [ ] Required artifacts and `reports/development/plan-01-seeded-economy-simulation/progress.md` exist; no unrelated files changed.
- [ ] Owner gate remains open until the owner approves any tuning recommendation.

## Stop Conditions and report

Stop if a settled design decision must change, a needed rule has no defensible bounded assumption, or the mechanism outline is not approved. Do not set packet status, edit orchestrator notes, call the work complete or ready to ship, or promote draft numbers. Report files, commands, actual observations, failed hypotheses, untested dimensions, and recommendations against S1–S4 rather than test counts. Commit only scoped files and the progress report; never push.
