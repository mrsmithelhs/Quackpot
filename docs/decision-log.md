# Decision Log

This file records decisions that should guide future work. New entries should include a date and rationale.

**Append-only.** Do not edit or remove entries. If a decision is superseded, add a new entry that references the old one.

This file is orchestrator/owner-owned. Implementers propose but do not edit.

## Accepted decisions

Use this shape for accepted decisions:

```markdown
### DECISION-001 - Short decision title

**Date:** YYYY-MM-DD

**Decision:** What was decided.

**Rationale:** Why this decision is the right tradeoff for now.

**Supersedes / related:** Optional links to older decisions, packets, or resolved open questions.
```

*(Founding design decisions from 2026-10-23 are recorded in [`docs/founding/design.md`](founding/design.md), [`docs/project-seed.md`](project-seed.md), and [`reports/orchestration/founding-docs-review/owner-triage.md`](../reports/orchestration/founding-docs-review/owner-triage.md). Add subsequent project decisions below as owner decisions are made.)*

## Proposed but not yet accepted

Use the same `**Date:** YYYY-MM-DD` field for proposals, using the proposal date.

*(Implementer proposals waiting for owner review go here.)*

## Accepted decisions recorded 2026-10-24

### DECISION-001 — Ratified paths and local Plan 02 spike

**Date:** 2026-10-24

**Decision:** The owner approved the paths proposed after Plan 02 and inspected the local preview. `docs/repo-structure.md` records the accepted layout. Close Plan 02 as the independently verified local build/subpath spike; live Pages deployment, remote configuration and deployed slash behavior remain unverified and unauthorized. Shared-module relocation remains a bounded integration after Plan 01 acceptance.

**Rationale:** Build/source paths have executable local evidence. Improving the placeholder duck's look is a visual-design follow-up, routed through concept selection and Plan 04's SVG rig rather than reopening scaffold validation.

**Related:** Plan 02 `review-02.md`; Plan 08 visual-direction brief.

### DECISION-002 — Generated concept references before the production SVG

**Date:** 2026-10-24

**Decision:** The owner requested a separate Gemini thread using image generation for several duck styles, three variants each, and a local HTML comparison page. Plan 08 specifies five styles and 15 concepts, with owner selection of one or more directions before production SVG revision in Plan 04. Generated raster concepts are review references under `reports/`; they do not ship or replace authored game SVG source. This clarification is recorded beside the asset contract in the design, agent guide and orchestrator prompt.

**Rationale:** Visual directions can be compared before investing in vector construction. The current Plan 02 duck is a scaffold placeholder, not an accepted production base.

### DECISION-003 — Physical metagame prop and digital gacha characters

**Date:** 2026-10-24

**Decision:** The character owns one physical rubber duck; attachment to it motivates interest in the fictional gacha video game. That physical object is outside the collectible digital roster and stays inanimate. The owner wants to explore expressive animations for digital gacha ducks after the base SVG is settled (Plan 09). For metagame conversations, the owner favors a 2D-first study of coherent static views, camera framing/movement, lighting changes and different compositions within the apartment, including player-driven repositioning of the prop (Plan 10). Inspect zoom quality. A 3D source pipeline is only a future investigation option if a witnessed 2D limitation justifies it; no 3D runtime is selected.

**Rationale:** The physical prop can suggest personality through cinematography and context, while digital collectibles have greater freedom of motion. These require separate representation contracts. Pawning the physical object affects the metagame cash/story, not gacha ownership. The current simulation's physical `own-duck` race slot needs an explicit disposition before its rules are used in the playable slice; see the boundary report.
