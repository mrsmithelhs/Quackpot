---
id: plan-37
title: Action-based time and optional life lanes specification
status: draft
depends_on: []
gate: "Action-based time selected by owner on 2026-10-30; assignment and exact schedule/consequence specification require approval before executable experiments or production."
superseded_by: null
resolution: null
summary: >-
  Specify the owner-selected action-based time model and optional meal, work,
  leisure and recovery lanes. Separate opportunity costs and disclosed consequences
  from Plan29 numeric calibration before implementing new story rules.
---
# Plan 37: Action-based time and optional life lanes specification

## Packet Metadata

- Packet id: plan-37
- Packet title: Action-based time and optional life lanes specification
- Status: (see frontmatter)
- Owner/model: unassigned investigator
- Date: 2026-10-30
- Packet type: investigation / rules specification
- Mutation level: report-only initially
- Approval gate: owner selects exact commitments and consequences before experiments/implementation
- Depends on: none for investigation; selected Plan28 presentation and Plan29 economy outputs inform later implementation
- Expected artifacts: current-capability map, time/action table, contrasting day examples, recommendation and progress

## Goal and authority

The owner explicitly approves action-based time and wants optional life lanes as
guidance relaxes. Do not reopen action-based versus real-time progression. Specify
how commitments create opportunity costs without penalizing slow readers, device
speed or accessibility. Preserve the roughly30-minute engaged target without a
selected upper duration ceiling; no enforced waits or delayed Uninstall.

Read AGENTS.md, canonical design, decision log, Plan28 owner-direction and root
prebuild review, draft Plan29 and Plan36. Inspect actual day/expense/health/terminal
rules. Separate existing behavior from proposed rules and owner-selected direction.

## Scope and outputs

Own only new reports/development/plan-37-action-time-and-optional-life-lanes/.
No engine/UI/save schema edits, numeric retuning, art, audio, fixtures or status
changes. No assignment, browser, Node experiments or subagent authority is granted
by draft status. Propose method and exact experiment needs first.

Compare two small concrete specifications for slot granularity, commitments and
opportunity warnings. Define which actions advance time: opening/reading a page,
pausing, inspecting a collection, settings, presentation and repeated navigation
must not accidentally become separate hidden charges. A committed gacha session
may have a time cost, but exact session boundary, repeat pulls/races, cancellation,
resume and maximum consequences need an explicit proposal. Do not select four
fixed slots per day merely because an earlier lead suggested them.

Use meals, scheduled work, a free restorative activity and gacha as representative
lanes. Distinguish voluntary skip, missed opportunity and automatic consequence.
Show warnings/choices before meaningful commitments. Optional does not require
that every branch ends identically, but costs/outcomes cannot be silently invented.
Compare proactive sales, cook/order, sleep and social contact as later candidates;
do not require all of them in a first wave. Dismissal/fired ending and phone-service
loss are separate owner decisions, not approved simply by naming a lane.

Return examples of engagement, disengagement and mixed choices, not one inevitable
decline or a moralized optimal route. Specify wages/food/rent ordering and failure
recovery symbolically; coordinate Plan29 numeric calibration without creating a
circular dependency. Plan28 owns presentation language; Plan36 owns perception
disturbances, which cannot secretly alter obligations or actual player choices.

For every shortlisted rule define trigger, action commitment, current slot/day,
available alternatives, disclosure, state/log effect, save/reload/idempotency,
Uninstall/terminal ordering, accessible equivalent and open numeric parameters.
Receipt facts distinguish displayed opportunities, actual chosen commitments and
automatic story consequences; questions ask impact without asserting it. Cosmetic
seeds cannot perturb economy/race/draw streams. No real-time deadline or real payment.

## Validation, gates and delivery

Provide a finite paper trace for representative days/branches, including exhausted
time, interrupted action, insufficient cash, zero cash, early Uninstall and resume.
State invariants and unresolved decisions before proposing code or simulation.
Owner selects the rule specification; root separately approves bounded experiments
and later production ownership. Keep numeric rates provisional until Plan29 work.

Progress records exact evidence, limitations, consultation posture and owner choices.
Before assignment use the guarded packet check; nonzero means stop. Report against
the objective, never proxy counts. No global docs/status edits by implementers,
unapproved dependencies, push or deployment. Commit owned files, progress last.
