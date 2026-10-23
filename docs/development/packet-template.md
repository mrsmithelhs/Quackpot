---
id: plan-NN
title: Short Descriptive Title
status: draft
depends_on: []
gate: ""
superseded_by: null
resolution: null
summary: >-
  One-paragraph purpose blurb. This is what the generated index row shows.
  Replace this with a concise description of what this packet accomplishes and why.
---
# Plan NN: Short Descriptive Title

## Packet Metadata

- Packet id: `plan-NN`
- Packet title: Short Descriptive Title
- Status: (see frontmatter)
- Owner/model: implementer (single) / orchestration / investigator
- Date: YYYY-MM-DD
- Packet type: *choose one: orchestration / docs / scan-only / investigation / prototype / tooling / schema / content / feature / repair / migration / other*
- Mutation level: *choose one: none / docs-only / content / source-data / generated-local / scripts / external / user-facing-release*
- Approval gate: *describe what must happen before work is considered accepted*
- Depends on: *list blocking packets by id, or "none"*
- Expected artifacts: *list files this packet promises to create or change*

## Goal

*One paragraph. What does this packet accomplish? Why does it exist now?*

## Non-goals

*What is explicitly out of scope. Be specific — prevents scope creep.*

## Depends on

*List any blocking dependencies here, in prose. Include rationale.*

## Why this packet exists

*What problem does this solve? What failure mode, reliability gap, or missing capability prompted it?*

## Authority and contracts

Required reading:

- `AGENTS.md`
- `docs/decision-log.md`
- `docs/development/README.md`
- *(add files specific to this work)*

Contracts this packet must preserve:

- *(list any invariants, schemas, or policies the implementer must not break)*
- *(if none, say "none specific to this packet")*

## Scope

### In scope

- *(list specific behaviors, files, or systems the implementer may change)*

### Out of scope

- *(list things the implementer must explicitly NOT do)*

## Implementation Requirements

### Requirement 1 — *(short name)*

Required behavior:

- *(specific, testable behavior)*

Constraints:

- *(things that must not change)*

## Validation Checklist

- [ ] Required output files or artifacts exist.
- [ ] Tests pass (if applicable).
- [ ] Progress report exists at `reports/development/plan-NN-short-descriptive-title/progress.md`.
- [ ] No unrelated files were changed.
- [ ] All contracts in "Authority and contracts" are preserved.
- [ ] Approval gate is honored (work stops at the gate and reports, does not proceed past it).

## Stop Conditions

Stop and report to the orchestrator if:

- A dependency is missing or behaves unexpectedly.
- Making the change would require modifying a settled project decision.
- Validation fails in a way that changes this packet's scope.
- *(add domain-specific stop conditions here)*

## Progress Report

`reports/development/plan-NN-short-descriptive-title/progress.md`

Minimum contents: overall summary, files changed, artifacts produced, commands run, validation checks performed, problems encountered, remaining risks, ready for orchestrator review yes/no.
