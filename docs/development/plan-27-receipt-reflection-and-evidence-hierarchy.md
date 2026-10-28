---
id: plan-27
title: Receipt reflection and evidence hierarchy
status: draft

depends_on: [plan-23]
gate: "Owner approves investigation scope before assignment, then selects recommendation before production changes."
superseded_by: null
resolution: null
summary: >-
  Design a reflection-first Receipt with expandable evidence while preserving the append-only log and three-register honesty.
---
# Plan 27: Receipt reflection and evidence hierarchy

## Packet Metadata

- Packet id: plan-27
- Packet title: Receipt reflection and evidence hierarchy
- Status: (see frontmatter)
- Owner/model: unassigned investigation; orchestration coordinates
- Date: 2026-10-28
- Packet type: investigation / proposal
- Mutation level: report-only
- Approval gate: owner selection before production implementation

## Goal, scope and delivery

The owner sees excessive race detail on the end Receipt. Current src/core/receipt.mjs collects per-race choices/cues/playback actions/results, and src/ui/receipt-view.js renders the arrays in full. Investigate presentation hierarchy, not deletion of evidence.

Own NEW reports/development/plan-27-receipt-reflection-and-evidence-hierarchy/ only. Runtime, log/schema/storage/export and accepted mechanics are read-only. Read canonical Receipt rules, current projection/view and Plan07 export investigation; no automatic dependency on unfinished analyzer work.

Propose a compact default debrief: consequential financial/life outcomes; a few run-grounded displayed-cue/action/reflection groups; optional race summaries and expandable chronological evidence. Compare at most two layouts on a long synthetic run and early-Uninstall/zero-cash cases. Separate mechanical race events from cues actually displayed; never imply a simulated collision was watched. Preserve We displayed / You did / Did this affect you? and conditional pre-draw odds. No invented motive, effects or hidden ranking algorithm; explain proposed grouping/selection rules and omissions. Keep all detailed evidence available locally without making it all default copy. Accessibility and print/export implications must be explicit; narrative view is not the raw run-usage export.

Return report-local wireframes plus source-event-to-summary mappings and evidence links, disclosure/keyboard behavior, and implementation boundary. No production mutation. Stop for owner hierarchy/copy selection; later integration needs a bounded scope. Root reviews via Terra-medium, no implementer subagents assumed.

## Contracts and workflow

Read AGENTS.md, docs/decision-log.md, docs/development/README.md and docs/repo-structure.md first. Run node scripts/dev/plan-status.js check plan-27 before starting; nonzero means stop. Draft status is not assignment authority. Respect shared-tree ownership; no runtime report imports, external runtime requests or personal/student data. No new assets/audio adoption, package dependencies, reviewer/subagent budgets or browser permission implied. Propose exact report files and validation before source experiments. Include a progress.md with evidence, uncertainty, consultation declaration and owner decisions still needed. Commit explicit owned paths, progress last; no packet status changes, push or deployment.
