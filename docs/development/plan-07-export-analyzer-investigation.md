---
id: plan-07
title: Run-usage export and teacher analyzer investigation
status: complete
resolution: "Owner-approved ZIP/JSON packaging, summary plus bounded timeline, per-run ID and privacy directions recorded; refined report and ZIP feasibility reviewed 2026-10-31. No final schema/library/budgets or executable result claimed. Investigation complete; synthetic ZIP/contract spike and production export/analyzer remain separate."
depends_on: []
gate: "Owner approves data fields, free-text handling, and analyzer scope before schema or UI implementation."
summary: >-
  Inspect BrowserBattlegorithms as an authorized rough model and propose a
  minimal manual export schema plus local multi-file teacher analysis flow.
---
# Plan 07: Run-usage export and teacher analyzer investigation

## Packet Metadata

- Packet id: `plan-07`
- Packet title: Run-usage export and teacher analyzer investigation
- Status: (see frontmatter)
- Owner/model: investigator; orchestrator and owner review
- Date: 2026-10-23
- Packet type: investigation
- Mutation level: docs-only
- Approval gate: owner approves schema fields, free-text policy, and local analyzer scope
- Depends on: none
- Expected artifacts: `reports/development/plan-07-export-analyzer-investigation/progress.md`

## Goal

Propose the smallest run-usage file that lets a teacher examine completion, replay and technique exposure while preserving the student's manual submission choice and a local-only multi-file analyzer.

## Non-goals

No export or analyzer implementation, student files in Git, cloud sync, automatic upload, teacher account, Bootstrap selection, or adoption of BrowserBattlegorithms details without Quackpot-specific review.

## Depends on

None. This is an owner-gated investigation; the mechanism slice need not export usage files. Refer to Plan 01's event-log structure if available, without depending on unapproved fields.

## Why this packet exists

The teacher wants run evidence and replay visibility, but the player's duck name is free text and could carry personal information. A schema chosen casually could collect unnecessary data or make the local analyzer infer motives from actions.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/founding/design.md` (constraints #2/#3, Receipt, Technology, Classroom use), and owner triage T17 and post-review replay decision. Inspect the authorized BrowserBattlegorithms repository read-only as a **rough workflow model**; identify its actual export/import path and limitations before drawing comparisons. Do not copy real student files or names into this public repo.

## Investigation plan

**Owner-approved wrap-up, 2026-10-31:** Two-way Codex oversight extends through completion, including post-delivery refinement. Owner approves ZIP as the intended packaging direction for investigation (versioned JSON inside, direct local ZIP import, optional JSON compatibility), compact summary plus bounded meaningful timeline, omission of names/free text/reflection by default, random per-run ID stable across re-exports but replaced on a new run, and comparison of submitted runs only. Omit seed initially; debugging/checkpoint reconstruction is separate. Initial analyzer stays browser-local/in-memory; teacher CSV can be a later bounded addition. Add packaging feasibility and these field directions to the report; no library install, executable compression benchmark, final schema or production implementation yet. Exact fields, limits and mappings need a follow-on contract/spike. Return the refined investigation for root closure; new implementation packets follow.

**Readiness review, 2026-10-31:** Ready for a Codex-led, report-only first phase.
Own only reports/development/plan-07-export-analyzer-investigation/. Locate the
authorized BrowserBattlegorithms reference read-only; no matching top-level folder
was found under C:/AI in root's initial check. Do not treat that limited search as
proof it is unavailable: inspect likely existing project references, then report a
precise access limit and continue Quackpot alternatives if needed. Do not access real
student exports. Current engine/log/Receipt and closed checkpoint artifacts are
read-only examples, not final data contracts or student records to copy.

Deliver a teacher-question-to-field minimization table, summary versus detailed
alternatives, duck-name/free-text policy, version/duplicate/malformed-import rules,
synthetic labelled example files and a clear distinction between stable concepts
and fields pending Plan37/Receipt integration. Final schema does not need to be
frozen to investigate these questions. No exporter/dashboard implementation,
browser, package installation or new executable validation. Work through ordinary
research/document revisions to delivery without a second preproposal gate. Check
readiness through the unchanged Plan25 bounded launcher after process preflight;
no concurrent Node validation. No advisor needed for docs-only work; record that
posture. Leave shared docs, src, other reports and statuses alone, commit owned
outputs explicitly and progress last, never push. Root/owner approve fields and
implementation separately.

1. Run `check plan-07`; locate BrowserBattlegorithms through available local/connected repository access. If unavailable, report the exact access limit and continue with Quackpot-only schema alternatives; do not invent external behavior.
2. Draft two minimization levels: a compact summary and a richer event-derived export. For each field, state purpose, source event, identifiability risk, and whether the teacher's intended question truly needs it. Explicitly compare omit/opt-in/include choices for the free-text duck name and run/replay identifiers.
3. Specify versioning, malformed-file handling, duplicate import behavior, provenance checks, local multi-file summaries and uncertainty. Keep *We displayed / You did / Did this affect you?* as separate concepts; the analyzer must not claim unobserved impact.
4. State rival hypotheses (for example, summary suffices versus event detail is necessary), falsifying observations and a discriminating teacher task. Recommend a bounded schema and analyzer view, with all undecided fields sent to the owner.

## Validation Checklist

- [ ] BrowserBattlegorithms observations are cited to exact repository files or explicitly marked unavailable.
- [ ] Field table ties each proposed export datum to a teacher use and privacy cost, including free text and replay.
- [ ] Manual download/submission and browser-local import have no automatic transmission path.
- [ ] Rival hypotheses and a discriminating teacher task are recorded; no schema or UI implemented.
- [ ] `reports/development/plan-07-export-analyzer-investigation/progress.md` exists; no unrelated files changed.

## Stop Conditions and report

Stop before choosing collection of personal/free-text data or a remote service. Do not set status, edit orchestrator notes, or present a schema as accepted. Report observed model workflow, alternatives, exact owner questions and evidence gaps. Commit only the scoped report; never push.
