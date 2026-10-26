# Plan 23 progress

**Date:** 2026-10-26
**Stage:** Bounded integration proposal delivered; awaiting QP Orch approval, Plan 20 source handoff, and explicit production file ownership.

## Overall summary

Completed the requested read-only source and reference investigation and wrote `proposal.md` inside the initial report-only scope. The packet preflight was runnable. Current production race resolution is an immediate sampled rank with preset-percent playback; the accepted Plan 13 model is a keyed fixed-step simulation with real finish crossing and presentation derived from a committed result. The most important integration issue is that Plan 13 clamps physics speed to 8–12 m/s while production inputs range from 8/11.2 m/s field bases and 10/14/20 m/s ducks, with stance and Plan 17 trial multipliers. A global monotonic adapter study is proposed as a required gate before implementation.

## Files changed and artifacts

- Added `reports/development/plan-23-production-race-integration/proposal.md`.
- Added this progress report.
- The proposal artifact is present in shared commit `96f2549` (which also contains separate Plan 20/orchestration coordination edits); its trailing-whitespace cleanup is `e9227ab`. Those unrelated files were preserved and are not claimed as Plan 23 work.
- No production, test, packet, Plan 20, Plan 13, Plan 17, Plan 22, or shared source files changed.

## Commands and checks

- `node scripts/dev/plan-status.js check plan-23` — exit 0, `RUNNABLE: plan-23 is ready to implement`.
- Read-only inspection covered the Plan 23/20/22 packets, repo source map, DECISION-018, Plan 13 accepted guide/model/reviews 03–05, Plan 17 accepted integration terms, current engine/storage/log/race view/controller entry points, and Plan 20 proposal/progress.
- No build, tests, or browser session was run; this is report-only proposal work and browser activity remains coordinated by QP Orch.
- `git diff --cached --check` — passed for the proposal commit after removing Markdown hard-break whitespace.
- Progress report is the remaining scoped artifact and will be committed last.

## Problems, risks, and follow-ups

- Production roster speeds exceed or meet the preview's 12 m/s cap; its current minimum also flattens low inputs. Direct port would erase identity and selected modifiers. Proposal requires an approved global adapter study and explicit return-to-owner stop if it cannot preserve supported effects and pacing without per-variant tuning.
- Plan 20 retains the production-writing lane; its source handoff and exact file ownership must be confirmed before changes.
- Existing saves record race result summaries but do not contain a trajectory. Migration must preserve honest legacy results without inventing motion/event evidence.
- Proposed worst-case storage size is not yet measured; implementation approval should follow bounded-format measurement or include that as the first approved source-independent artifact.

## Advisor consultation

Consultation not warranted — this is a docs-only proposal with no behavioral artifact to critique.

## Ready for orchestrator review

Yes — proposal only. No implementation is authorized by this report. QP Orch should review the input adapter gate, source handoff, file ownership, legacy display treatment, and measured storage-budget step before production work begins.
