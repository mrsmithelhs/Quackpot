# Plan 13 progress

**Date:** 2026-10-25. **Stage:** prebuild proposal delivered for owner review. No isolated preview was built.

## Overall summary

Produced the bounded race/pacing comparison and a worked illustrative seeded trace requested before preview work. The proposal compares 12/20/30-second races and distinct seeded-mechanical-beat versus resolved-outcome staging models; it recommends investigating seeded mechanical beats with a resolved-outcome control. It defines candidate event, RNG, log, trial, camera and replay boundaries and a 900-second pacing budget with setup, ordinary/consequential days and Receipt included. All candidate mechanics, timing and budget are recommendations pending owner selection. Plan 17's accepted 3 Down / +5% base speed / one committed race / non-stacking / consume-once contract is preserved.

The trace is an illustrative fixture with explicitly invented draws and thresholds, not an execution of repository code or a claimed PRNG sequence. No outcome mechanic has been implemented or accepted. The next step is owner review and explicit prebuild approval; only then may an isolated preview be built within this report folder.

## Files changed

- `reports/development/plan-13-race-staging-and-run-pacing/proposal.md` — comparison, recommendation, boundaries, trace, pacing budget and evidence limits.
- `reports/development/plan-13-race-staging-and-run-pacing/progress.md` — this delivery record.

No source, rig, simulation, package, packet, generated index, or shared files were changed. The working tree was clean at the initial check. Later, unrelated working-tree edits appeared in `src/main.js`, `src/ui/desk-view.js`, `src/ui/hud.js`, `src/ui/settings-modal.js`, `src/ui/shell.css`, `src/ui/stage-transition.css`, and `src/ui/stage-transition.js`. They are outside this assignment and were left untouched and unstaged.

## Commands and checks

- `node scripts/dev/plan-status.js check plan-13` — exit 0, `RUNNABLE: plan-13 is ready to implement`.
- Proposal saved in commit `cc2fbfb` (`docs(plan-13): propose race pacing comparison`). This progress report is committed separately as the final owned-file commit.
- Read the assigned Plan 13 packet, implementer starting prompt, canonical race/time/Receipt/immersion sections, GATE-53B owner triage, relevant decision-log entries, Plan 01 results, Plan 03 packet and owner play feedback, and Plans 04/09/11 as read-only references.
- No build, tests, browser preview, classroom timing, or source execution was performed; these are beyond the proposal stage and/or require prebuild approval.

## Consultation and review

Advisor consultation was not warranted for this docs-only proposal under the implementer prompt's proportionality rule. An optional reviewer was initially dispatched, then interrupted immediately after the user clarified that a reviewer was not authorized at this stage. No review findings were received or used. No reviewer files were created or changed.

## Remaining risks and follow-up

- Owner must choose which outcome model and which candidate causal events, if any, may enter the isolated preview, and approve its precise prebuild scope.
- The worked trace's example thresholds and non-PRNG fixture values are placeholders, not rules or replay evidence.
- The 15-minute split is a planning budget, not observed player or classroom timing. A later approved preview can measure preview durations; classroom-floor claims still need separate observation.
- Integration still needs to prove accurate append-only race/Receipt evidence, and whole-run balance remains outside this proposal. Preserve the Skip Lunch settlement follow-up before later work makes food shortfall reachable.

**Ready for orchestrator review:** yes, for the proposal and prebuild gate only. **Ready for isolated preview:** no; awaiting owner prebuild approval. Packet status remains unchanged and owner/orchestrator-owned. No push performed.
