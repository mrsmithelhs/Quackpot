# Plan 13 progress

**Date:** 2026-10-25. **Stage:** focused proposal amendment delivered to the prebuild gate. No isolated preview was built.

## Overall summary

Amended the comparison in response to the orchestrator's `prebuild-review-01.md`. The proposal now defines a calculable normalized progress mechanism with exact 40%/70% event opportunities, clean-draft/bobble eligibility and probabilities, bounded offsets, fixed draw order, unique-place tie/payout handling, and three hand-calculated fixtures. It adds the required one-choice opening/later-unlock comparison and ordered ordinary/consequential day maps. The comparison still uses 12/20/30-second races and recommends seeded mechanical beats with a resolved-outcome control. All candidate mechanics, timing, choice options and budget are recommendations pending owner selection. Plan 17's accepted 3 Down / +5% base speed / one committed race / non-stacking / consume-once contract is preserved.

The traces are illustrative fixtures with explicit formulas/draws, not executions of repository code or claimed outputs for a named seed. No outcome mechanic has been implemented or accepted. The next step is owner review of this amendment and explicit prebuild approval; only then may an isolated preview be built within this report folder.

## Files changed

- `reports/development/plan-13-race-staging-and-run-pacing/proposal.md` — comparison, recommendation, boundaries, trace, pacing budget and evidence limits.
- `reports/development/plan-13-race-staging-and-run-pacing/progress.md` — this delivery record.

No source, rig, simulation, package, packet, generated index, or shared files were changed. The working tree was clean at the initial check. During the prior turn unrelated edits appeared in `src/main.js`, `src/ui/desk-view.js`, `src/ui/hud.js`, `src/ui/settings-modal.js`, `src/ui/shell.css`, `src/ui/stage-transition.css`, and `src/ui/stage-transition.js`; they were later recorded by Plan 19 commits, and I did not modify them. At final status, unrelated changes remained in `docs/development/README.md`, `docs/development/plan-19-shell-a-and-context-integration.md`, and untracked Plan 19 evidence files `reports/development/plan-19-shell-a-and-context-integration/review-entry-desktop.png` and `review-entry-probe.mjs`. These are outside this assignment and were left untouched and unstaged.

## Commands and checks

- `node scripts/dev/plan-status.js check plan-13` — exit 0, `RUNNABLE: plan-13 is ready to implement`.
- `git diff --check` — clean for the amended owned report files.
- Read the assigned Plan 13 packet, implementer starting prompt, orchestrator `prebuild-review-01.md`, current resolver as a read-only reference, canonical race/time/Receipt sections, owner triage and decision log, Plan 01 results, Plan 03 packet and owner play feedback, and Plans 04/09/11.
- `prebuild-review-01.md` is an orchestrator-owned handoff and was left unchanged.
- Proposal baseline was saved in `cc2fbfb`; focused amendment is saved in `5eaa983`. This progress report is committed separately as the final owned-file commit.
- No build, tests, browser preview, classroom timing, or source execution was performed; the preview remains gated.

## Consultation and review

No independent advisor consultation was used for this docs-only amendment. A reviewer subagent had been launched on the previous turn and was interrupted after the user clarified that a reviewer was not authorized; no findings were received or used. The user observed the harness display high effort, so no claim of low visible effort is made here. This amendment uses the orchestrator's supplied `prebuild-review-01.md`, not an additional reviewer. No reviewer files were created or changed.

## Remaining risks and follow-up

- Owner must approve the proposed progress equation, candidate draw thresholds/effects, choice comparison and exact isolated preview scope before any preview code is written.
- The hand-worked fixture draws/performance values are explicit examples, not rules or replay evidence for a named run seed.
- The 15-minute split is a planning budget, not observed player or classroom timing. A later approved preview can measure preview durations; classroom-floor claims still need separate observation.
- Integration still needs to prove accurate append-only race/Receipt evidence, and whole-run balance remains outside this proposal. Preserve the Skip Lunch settlement follow-up before later work makes food shortfall reachable.

**Ready for orchestrator/owner review:** yes, for the focused proposal amendment only. **Ready for isolated preview:** no; the prebuild approval gate remains open. Packet status remains unchanged and owner/orchestrator-owned. No push performed.
