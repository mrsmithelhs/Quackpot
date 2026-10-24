# Reading the Plan 01 experiment artifacts

These are conditional headless experiments, not accepted production values or observations of human behavior. `results.json` holds cell summaries; `results.md` renders them; `traces.txt` holds selected event traces. Read the adjacent progress report and orchestrator reviews for source assumptions and limits.

## Paired S2 windows after Repair 03

Use `fullN`, `excludedN`, `fullEarlyGpd`, `fullLateGpd`, and `pairedDiff` for the analytic cohort. Full exposure requires all configured races in both windows. Reaching a window's final day is not enough: collection completion can happen before that day's races.

The JSON retains compatibility aliases from earlier result shapes:

- `survivorN` aliases `fullN`; it does **not** count every run whose helper-level `survived` flag is true.
- `survEarlyGpd` and `survLateGpd` alias the full-exposure distributions.
- In the long-window cells, `censoredShare` aliases `excludedShare`, including incomplete race exposure as well as runs ending before the window.

Prefer the explicitly named full-exposure fields. In the whale/no-creep/payout-1 early/mid cell, 99 runs reach day 12, but only 86 complete both race windows. The correct comparison denominator is 86, with 14 exclusions out of 100. This documentation resolves the legacy-name ambiguity without changing the verified analytic values; no production/export schema is established here.

## Continuation

Continuation cases use 80 seeds. “Lower-bound race-funded full-draw equivalents” subtracts transition gem stock from later pull spending, clamps at zero, divides by 160 and rounds down. It is a conservative accounting quantity, not a unique attribution of each draw's currency. The experiment has a finite horizon and can end early at collection completion.

## Subsequent owner clarification

The physical metagame companion is outside the digital roster. Existing model results still include the old `own-duck` race-slot assumption. See `reports/orchestration/duck-representation-boundary.md`: reconcile it before using the model as a playable contract, and revisit only evidence actually affected by that change. No accepted game rule permits the physical prop to race or makes its pawn sale remove a digital collectible.
