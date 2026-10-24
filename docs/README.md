# Quackpot — Documentation Hub

This folder contains project documentation. See `repo-structure.md` for the accepted source, simulation, asset, evidence and build-output paths.

## Index

| Folder / File | Purpose |
|---|---|
| `founding/design.md` | Canonical game design, hard constraints, manipulation catalog, time/saving policy, and Receipt specification. |
| `project-seed.md` | Setup context, owner decisions and historical directory sketch. |
| `repo-structure.md` | Owner-ratified paths and pending shared-module integration boundary. |
| `decision-log.md` | Dated accepted decisions with rationale. Append-only; orchestrator-owned. |
| `open-questions.md` | Genuinely unresolved questions. Resolved items move to the decision log. |
| `development/` | Implementer handoff packets. See `development/README.md` for the packet index. |
| `workflows/` | How-to guides for key project processes. |
| `agent-starting-prompts/` | Starting prompts for orchestrator, implementer, design-review, plan-scan, and test-coverage-scan threads. |

<!-- Add rows for schemas/, style-guides/, investigations/, retrospectives/, tooling/ as needed. -->

## What belongs here

- Decisions and their rationale.
- Investigation reports.
- Workflow guides.
- Schema definitions.
- Agent onboarding prompts.

## What does not belong here

- Implementation code — that goes in `src/` (or equivalent).
- Generated outputs — that goes in `data/generated/` or equivalent.
- Implementer progress reports — those go in `reports/development/<packet>/`.
