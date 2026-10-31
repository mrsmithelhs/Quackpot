# Quackpot — Documentation Hub

This folder contains project documentation. See `repo-structure.md` for the accepted source, simulation, asset, evidence and build-output paths.

## Current direction and document authority

The canonical design is `founding/design.md`. It combines selected intent with explicitly labelled future work; it is not a claim every selected feature is implemented. `decision-log.md` preserves why choices changed. `open-questions.md` contains unresolved questions only. Packet frontmatter and the generated `development/README.md` own assignment/status; each packet owns its scope/gates. `repo-structure.md` maps existing code. Reports provide evidence and historical alternatives, not a competing current specification.

| Area | Selected/current direction | Next boundary |
|---|---|---|
| Life and pacing | Action-based Morning/Afternoon/Evening, optional LateNight, maintenance meals alongside anchors; roughly30-plus-minute engaged design target | Plans37/29 closed investigations; Plan38 amended for Codex progression; root mechanism clearance before source writes |
| Economy | $60 take-home completed-shift baseline; small gacha purchases should accumulate into reserve pressure | Other prices/health/credit/session allowances provisional; recalibrate from integrated-route evidence |
| Race and collection | Accepted production race, digital motion, Duck-Dex and soft rest | Broader catalog/compositions separate; preserve accepted mechanics |
| Apartment | Accepted art/desk/phone; Plan38 life surfaces exist | Work/evening experience Plan40 assigned Gemini Flash; coherent phase/obligation integration before later disruption |
| Receipt/export | LayoutA selected; ZIP with summary/bounded timeline selected | Plan42 repaired spike delivered for owner review; Plan27 closed, draft44 Receipt integration unassigned; exporter/analyzer separate |
| Audio/weather | Selected audio pools; M1–M6 reference repertoire; extracted weather helpers | Audio preparation/integration, Plan39 technical repairs, Plan43 style study; weather not mounted |
| Social/later narrative | Ren and reviewed Plan36 possibilities preserved | Plan41 assigned Sonnet, Plan36 possibilities preserved; owner selection before integration; not automatic feature adoption |

Do not copy a historical report's pending-stage statement over a later acceptance. Before handoff or closure, reconcile only the affected design, questions, packet gates/status and implementation pointers. Bootstrap is evaluating the staged design-review pilot through its inbox; no generic prompt update or consumer capability adoption has occurred.

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

[Plan 41: Ren friend and social life](development/plan-41-ren-friend-character-and-social-life-study.md)
develops the owner-selected friend idea through character/reference research,
visual concepts and social interaction/consequence proposals. It is ready for
assignment, with production visuals and HP/relationship rules still gated.

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
