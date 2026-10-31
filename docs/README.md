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

## Later narrative possibilities

[Plan 36: late-game disorientation](development/plan-36-late-game-disorientation-investigation.md)
holds the deferred creative direction for small, irregular disruptions of expected
phone returns, gacha imagery spilling into apartment life, and unreliable character
narration. See the [external-review synthesis](../reports/orchestration/plan-36-external-review-synthesis-01.md)
and [four preserved reviews](../reports/development/plan-36-late-game-disorientation-investigation/external-reviews/README.md).
Owner direction includes text/static and reduced-motion alternatives, increasing
but unpredictable frequency rather than a fixed sequence, and room for humor such
as life receipts arranged like a Duck-Dex. Prioritize inexpensive, high-impact
ideas when the ordinary day/session structure is ready. This is a future-design
reference, not an integration plan or authority to implement the review proposals.

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
