---
id: plan-03
title: Core mechanism and truthful Receipt slice
status: complete
depends_on: [plan-01, plan-02]
gate: "Owner approves the selected trade-off and bounded mechanism outline before coding, then reviews the played slice."
superseded_by: null
resolution: "Owner played the technically verified three-day mechanism slice and delegated feedback triage/closure on 2026-10-24. Receipt copy cleaned inline; onboarding, game framing, race drama and pacing continue in gated drafts. No final balance or fifteen-minute-floor claim; Skip Lunch settlement must precede food-shortfall expansion."
summary: >-
  Build one playable core-loop path with a meaningful trade-off, local saving,
  Uninstall and its retention offer, and an event-log-derived honest Receipt.
---
# Plan 03: Core mechanism and truthful Receipt slice

## Packet Metadata

- Packet id: `plan-03`
- Packet title: Core mechanism and truthful Receipt slice
- Status: (see frontmatter)
- Owner/model: one implementer; orchestrator and owner review
- Date: 2026-10-23
- Packet type: prototype
- Mutation level: scripts and user-facing local prototype
- Approval gate: owner-selected trade-off and mechanism outline before implementation; owner play review after delivery
- Depends on: `plan-01`, `plan-02`
- Expected artifacts: bounded game slice and tests, `reports/development/plan-03-mechanism-slice/progress.md`

## Goal

Prove the teaching mechanism end to end: the player encounters a visible cue, makes a consequential choice, can Uninstall at any point, and receives a Receipt grounded only in the append-only record.

## Non-goals

No full catalog, finalized balance, teacher analyzer, run-usage export schema, near-miss form, completed art/audio system, or public classroom release.

## Depends on

Plans 01 and 02 are owner-accepted as conditional headless evidence and a local build/layout spike. Tuning was not adopted with Plan 01's closure. The preflight may recommend the limited trial parameters and rules needed for this slice; implementation waits for owner approval of those load-bearing choices. Use `reports/development/plan-03-mechanism-slice/preflight-brief.md` for the starting boundary. Plan 08's visual exploration can run in parallel; final art is not a dependency of this mechanism prototype.

## Why this packet exists

A UI assembled from provisional numbers or an untested build path could look playable while its economy, saving, or Receipt claims are false. This slice tests one complete mechanism after those foundations are reviewed.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/founding/design.md` in full, `reports/orchestration/founding-docs-review/owner-triage.md`, and both dependency reports. Preserve all seven hard constraints and O1's three Receipt registers. Use the shared seeded PRNG and approved layout; keep the event log append-only and local. Uninstall remains visible and immediately escapable after the 80-gem “play out the trap” retention offer. No retention technique after the Receipt.

## Scope and work plan

**Owner gate adopted, 2026-10-24:** The owner approved the amended short trial in `reports/development/plan-03-mechanism-slice/preflight-review-03.md`, including its limited Common-only tactical comparison. This is implementation authority for that bounded contract, not final tuning or a 15-minute floor claim. Delivery `ea74cc6` was reviewed and returned for Repair 01; use `reports/development/plan-03-mechanism-slice/repair-01.md` before further work. Packet is `ready` for the bounded repair; played-slice acceptance remains open.

**Repair 01 review, 2026-10-24:** `bf70ac5` fixes the principal original browser failures, but save/log coverage, repeated bill handling and required UI evidence remain incomplete. Use `reports/development/plan-03-mechanism-slice/review-02.md` and `repair-02.md` for the current bounded handoff. The owner-approved trial rules remain adopted; no new general preflight is needed.

**Repair 02 technical review, 2026-10-24:** `f04a11b` satisfies the bounded repair checks; see `reports/development/plan-03-mechanism-slice/review-03.md` and independent browser observations. Technical acceptance is limited to the approved three-day mechanism slice. Packet remains `delivered` pending owner play acceptance; no further repair assignment or closure is implied. The unreachable-in-this-slice Skip Lunch settlement edge case is recorded for resolution before expanding food-shortfall gameplay.

**Owner clarification, 2026-10-24:** Read `reports/orchestration/duck-representation-boundary.md` before the mechanism outline. The physical metagame companion is outside the digital roster and stays inanimate; camera/framing may vary. Resolve the simulation's existing `own-duck` racer assumption before using it as the game contract. Keep pawn cash/story effects separate from gacha inventory.

1. Run `check plan-03`. Write `reports/development/plan-03-mechanism-slice/preflight.md` proposing the exact single trade-off, bounded trial parameters, states, event types, save schema, Receipt projection, and UI wiring. **Wait for owner approval of the trade-off/trial rules and orchestrator mechanism review before coding.** Do not invent final design values from simulation candidates.
2. Implement the smallest playable opening/core loop and one meaningful competing use of resources or time. Include one pre-race choice if a race is in scope; fixed-duration race has no reflex taps. Show only cues whose event records can prove display.
3. Support start-menu autosave selection and an explicit save icon at many safe junctures. Save run state, seed/PRNG state, and full append-only log locally; reload and resume without silently replaying or dropping an event. Surface shared/cleared-browser limits honestly.
4. Keep Uninstall visible. Record offer display, 80 gems offered, leave/stay action, and outcomes. Leaving reaches the Receipt immediately. Implement one other bounded terminal path, including zero-cash escalation if that is exercised by the chosen trade-off.
5. Build Receipt rows from the log with *We displayed / You did / Did this affect you?*; only name fired cues and use actual pre-draw pity-adjusted odds. Test early exit, zero cash, save/resume, and a run with a cue absent. Include a direct local browser walk-through and recorded evidence, not only unit tests.

## Validation Checklist

- [ ] The owner-approved trade-off is observable and has distinct consequences.
- [ ] Early Uninstall and the other implemented terminal route always reach the Receipt.
- [ ] Save/resume preserves exact state, seed position and event chronology.
- [ ] Receipt examples can be traced row by row to append-only events; absent cues are absent.
- [ ] No game-authored network calls, runtime CDN, real entities, or real payments.
- [ ] Required artifacts and `reports/development/plan-03-mechanism-slice/progress.md` exist; no unrelated files changed.

## Stop Conditions and report

Stop for owner judgment on trade-off, unresolved tuning, storage limitations, or any required hard-constraint change. Do not set status, edit orchestrator notes, declare completion or ship readiness. Report exact played paths, log-to-Receipt evidence, tests, accessibility limits, and remaining work. Commit scoped files and report; never push.
