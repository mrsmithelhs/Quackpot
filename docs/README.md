# Quackpot — Documentation Hub

This folder contains project documentation. See `repo-structure.md` for the accepted source, simulation, asset, evidence and build-output paths.

## Current direction and document authority

The canonical design is `founding/design.md`. It combines selected intent with explicitly labelled future work; it is not a claim every selected feature is implemented. `decision-log.md` preserves why choices changed. `open-questions.md` contains unresolved questions only. Packet frontmatter and the generated `development/README.md` own assignment/status; each packet owns its scope/gates. `repo-structure.md` maps existing code. Reports provide evidence and historical alternatives, not a competing current specification.

| Area | Selected/current direction | Next boundary |
|---|---|---|
| Life and pacing | Accepted five-slot day, staged guidance and working financial contract; roughly30-plus-minute engaged target | Plan51 study closed; Plan52 has mounted the five-slot development scheduler and save transition. Checkpoints, broader integration review and owner acceptance remain pending. No old-save migration |
| Economy | $80 start/$60 shift/$6 meal/$170 remaining-rent working budget; pull-action-plus-race baseline; small purchases erode reserves | Working prices tunable; health/credit/calendar and later session policy remain provisional; recalibrate from integrated-route evidence |
| Race and collection | Accepted default race, digital motion, Duck-Dex and soft rest; selected growth/injury and Bounce/crowd working rules | Plan59 implements the new rules in isolated schema6 with integer worker resolution, compact semantic replay and early selected presentation. Root accepted the bounded technical baseline; owner experience, remaining visual/lifecycle checks, checkpoints and default cutover are open. Default schema5/v1 remains the control. Plan57/58 visuals have extracted source helpers; only Bounce/crowd mechanics are mounted in the opt-in. Plan60's Guard, Quick Recovery and Straight Shooter remain distinct future candidates, not adopted mechanics/balance. See DECISION-084/085/086/088 and reports/orchestration/plan-59-selected-presentation-clearance.md; diagnostic activation/injury constants and future Gem/events remain separately gated |
| Apartment | Accepted apartment art/work surfaces, Plan49 action study and selected Ren experience components | Plan46 held at committed Ren baseline for scheduler-dependent edits, whole-experience acceptance pending; Plan52 ports its features together. Plan48 gigs waits for Plan52 |
| Messages | Selected header entry, recent-first portrait threads, unread-thread badge, separate due/action markers, optional decisions and authored historical exchanges | Plan61 is owner-closed. In-progress Plan63 owns the coordinated Messages source turn after Plan59's committed presentation seam; its independent modules are not final integration. New Messages policy initially targets new opt-in schema6 runs, preserving policy-absent histories and default schema5. Header/desk-phone replacement, real read/display/action/replay and owner review remain pending; randomized chatter is deferred (DECISION-091; reports/orchestration/plan-63-production-turn-clearance.md) |
| Welcome/onboarding | Selected welcome entry, transition naming, saved-location Continue, Settings/Credits, usage download and post-Receipt return | Plan62 revision 04 is owner-accepted as the report-local reference. Plan64 is drafted for production integration with save, Receipt, audio delivery and visual fidelity gates. The kitchen onboarding remains mounted pending that integration. See DECISION-092 |
| Receipt/export | LayoutA and ZIP summary/timeline selected; future manual package includes profile-recorded runs and unlocked achievements | DECISION-076 supersedes per-run-only packaging; storage/export/analyzer design remains separate from Plan52. Plan42 spike and Plan44 Receipt are closed references, not implementation of multi-run history |
| Audio/weather | Selected audio pools; Plan39 reference repertoire; extracted unmounted weather helpers; official MuScriptor Large CUDA FP32 desktop roundtrip selected for future authorized transcriptions | Plan53 authoring-pipeline investigation closed after reconstruction/listening and final M1 disposition; no soundtrack adoption. Plan56 laptop community-FP16 branch closed by owner choice, not demonstrated infeasibility. Use the [desktop roundtrip workflow](workflows/generated-music-desktop-roundtrip.md). Plan43 composition expansion held; further track experiments, publication and integration require separate scope. Weather remains unmounted |
| Social/later narrative | Ren and reviewed Plan36 possibilities preserved | Plan41 owner-closed; Plan45 selected unmounted SVG extraction owner-accepted and closed, Plan46 Codex-led multi-model social integration in progress; Plan36 possibilities preserved |

Do not copy a historical report's pending-stage statement over a later acceptance. Before handoff or closure, reconcile only the affected design, questions, packet gates/status and implementation pointers. Bootstrap is evaluating the staged design-review pilot through its inbox; no generic prompt update or consumer capability adoption has occurred.

Independent modularity/integration reviews are archived under `reports/orchestration/modularity-review-2026-11-01/`; read root-synthesis.md for corrections, active45/47 supervision gates and proposed later tooling. Original reviewer recommendations are not automatic architecture or work-status changes.

Owner subsequently adopts Astra's bounded integration-review practice2026-11-01: `workflows/production-integration-review.md` is the local operating guide. It includes root-viewed before/after/neighbor evidence; W1 is not a recurring retrospective. Larger tooling/refactoring proposals retain packet gates.

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
visual concepts and social interaction/consequence proposals. It is owner-closed as an investigation; Plan45 extraction is accepted and closed; exact social integration is separately scoped in ready Plan46.

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

Plan50 remains report-only. Owner accepts visual/UI results for experimental use; two simple same-conversation Haiku SVG edits succeeded. Flash synthetic audio control did not validate transport/comprehension. The three licensed-audio probes completed: owner found music/applause descriptions reasonably good; short quack was misclassified. Sonnet five-image and paired review found an actionable clipping concern but also false claims/unsupported chronology. Plans46/49/43 explicitly authorize experimental task-scoped creative consultants, with Codex verification and owner gates; no universal standing gate or production adoption follows. PriorClaude curator prompts and Terra starting handoff are under reports/orchestration/plan-50-*.md. Existing production acceptance and model review gates are unchanged.

## Five-slot transition

Read [five-slot-life-schedule.md](five-slot-life-schedule.md) for selected scheduling/financial policy and development-save waiver. Plan51 is closed as a bounded unmounted study. Plan52 has mounted the selected development scheduler and new-save path and regenerated its targeted checkpoint starts; broader replay/lifecycle evidence and owner acceptance remain pending. No isolated Ren/meal workaround or report mock may become a competing scheduler. Historical evidence retains its original policy.
