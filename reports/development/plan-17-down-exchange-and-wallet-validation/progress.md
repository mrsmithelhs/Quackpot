# Plan 17 Progress Report — Down Exchange and Whole-Wallet Validation (Repair 01)

**Date:** 2026-10-25  
**Packet:** [`docs/development/plan-17-down-exchange-and-wallet-validation.md`](file:///c:/AI/Quackpot/docs/development/plan-17-down-exchange-and-wallet-validation.md)  
**Status:** Repair 01 Complete; Awaiting Orchestrator / Owner Final Review  
**Task:** Resolve blockers identified in `review-01.md` and execute Repair 01 specifications.

---

## 1. Overall Summary

Completed all required fixes for Plan 17 Repair 01:
1. **Recurrence Probability Conservation:** Repaired `solveBaseOddsBankRecurrence` to accumulate absorbed probability mass across all steps. Verified that total mass ($M_{\text{absorbed}} + M_{\text{live}}$) equals $1.00000000$ across all starting banks ($0, 4, 6, 12, 18, 20, 24$ Down). Verified the first-step split from 6 Down: exactly $80.0\%$ absorbed at 1 Down, $18.0\%$ at 5 Down, and $2.0\%$ live at 20 Down. Initial banks below purchase cost ($0..5$ Down) immediately absorb 100% of mass at 0 draws.
2. **Explicit Censoring Bookkeeping:** Separated natural absorption ($B < 6$) from cap-hit runs ($D \ge \text{maxDraws}$ with $B \ge 6$) in `simulateTicketRecycling`. Live cap-hit banks never enter terminal/absorbed distributions. Paired the empirical 500-draw cap demonstration for frozen pity with an exact analytic induction proof of the net $+14$ Down invariant ($\Delta B = 20 - 6 = +14$).
3. **Roster Coverage Matrix:** Implemented and executed an explicit 12-cell matrix covering Empty, Partial (missing Legendary), and Full rosters across banks 6, 12, 24 Down and pity counts 0, 30, 49. Verified that when a Legendary is not owned, reaching hard pity awards a NEW duck with 0 Down feathers, absorbing immediately after 1 draw with 0 Down remaining. Generated reproducible per-draw trajectories.
4. **Integration Obligations & Hypothetical Paths:** Explicitly designated race-item commit/cancel/reload and presentation guarantees as future integration verification obligations. Labeled whole-wallet balance tables as hypothetical spend paths.

---

## 2. Files Changed & Artifacts Produced

### Owned Files in `reports/development/plan-17-down-exchange-and-wallet-validation/`:
- [`down-validation-engine.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/down-validation-engine.mjs): Core mathematical formulas, repaired mass-conserving Markov recurrence solver, explicit censoring simulator, single-run trajectory tracer, and race quadrature.
- [`scenarios.test.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/scenarios.test.mjs): Automated test suite with 7 test blocks covering opening distributions, recurrence mass conservation, censoring bookkeeping, roster coverage matrix, reproducible trajectories, race item quadrature, and wallet math.
- [`run-scenarios.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/run-scenarios.mjs): Scenario runner script generating `results.json` and console tables.
- [`results.json`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/results.json): Structured data artifact containing full recurrence tables, the 12-cell roster simulation matrix, per-draw step trajectories, quadrature comparisons, and wallet paths.
- [`proposal.md`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/proposal.md): Comprehensive final evidence report with all Repair 01 corrections.
- [`progress.md`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/progress.md): This progress report.

### Unmodified Files (Read-Only References):
- `docs/development/plan-17-down-exchange-and-wallet-validation.md`
- `reports/development/plan-17-down-exchange-and-wallet-validation/preflight-checks-01.mjs`
- `reports/development/plan-17-down-exchange-and-wallet-validation/preflight-review-01.md`
- `reports/development/plan-17-down-exchange-and-wallet-validation/review-01.md`
- `reports/development/plan-17-down-exchange-and-wallet-validation/repair-01.md`
- `src/core/game-engine.mjs`
- `src/core/prng.mjs`

---

## 3. Commands Run and Results

| Command | Purpose | Result |
| :--- | :--- | :--- |
| `node scripts/dev/plan-status.js check plan-17` | Preflight status check | Exit 0: `RUNNABLE: plan-17 is ready to implement` |
| `node --test reports/development/plan-17-down-exchange-and-wallet-validation/scenarios.test.mjs` | Automated test suite execution | Exit 0: 7 tests passed, 0 failed (112.6ms) |
| `node reports/development/plan-17-down-exchange-and-wallet-validation/run-scenarios.mjs` | Execute full simulation matrix and regenerate `results.json` | Exit 0: Generated complete `results.json` |
| `node scripts/dev/plan-status.js lint` | Packet schema and lifecycle lint | Exit 0: `lint: OK (no violations)` |

---

## 4. Validation Checks Performed

1. **Recurrence Mass Conservation:** Verified that across starting banks 0, 4, 6, 12, 18, 20, 24 Down, total mass ($M_{\text{absorbed}} + M_{\text{live}}$) is strictly $1.00000000 \pm 10^{-12}$.
2. **First-Step Split from 6 Down:** Verified that draw 1 absorbs exactly $0.80000000$ at 1 Down and $0.18000000$ at 5 Down, with only $0.02000000$ continuing to step 2.
3. **Censoring Separation:** Confirmed that under Rule T2 A (with reset), 10,000 runs have 0% censoring and 100% absorption into terminal banks $<6$ Down. Confirmed that under frozen pity, 100% of runs are censored at cap with live residual bank (7,006 Down at 500 draws) and 0 terminal bank entries.
4. **Roster Missing-Legendary Rule:** Confirmed that in a 5/6 roster missing Legendary duck-5, drawing duck-5 at hard pity awards 0 Down (NEW), ending the run immediately after 1 draw with 0 Down remaining.
5. **Clean Working Tree Isolation:** Confirmed via `git status` that only owned files inside `reports/development/plan-17-down-exchange-and-wallet-validation/` were touched.

---

## 5. Problems Encountered and How Resolved

- **Terminal Mass Accounting Bug:** The initial recurrence loop used `continue` on bank states $<6$, causing absorbed mass to be dropped in subsequent iterations. Resolved by accumulating absorbed probability by balance into an `absorbed` map on each step.
- **Censored Runs Entering Terminal Distribution:** The simulator was previously recording live cap-hit banks in `terminalBanks`. Resolved by adding explicit censoring checks: only absorbed runs ($B < 6$) enter `terminalBanks`; cap-hit runs enter `censoredResidualBanks`.

---

## 6. Advisor Consultation Declaration

**Branch C — not advisor-capable (fail-closed, orchestrator-gate-only):**  
In accordance with the Implementer Thread Starting Prompt and `advisor-capable-providers.json`, this thread operates under Antigravity (Google DeepMind). Because Antigravity is not listed in `advisor-capable-providers.json`, the thread fails closed to not advisor-capable under Step 1. No autonomous advisor consultation ran; verification is provided by independent orchestrator audit (`review-01.md`, `preflight-checks-01.mjs`) and the automated test suite.

---

## 7. Remaining Risks or Follow-Ups

- **Production Integration Phase:** Live UI, inventory, and Receipt implementation belongs to a separate production integration packet after owner approval of this report.
- **Runtime Lifecycle Guarantees:** Verification of commit-time item consumption, stance modal cancel preservation, and reload idempotency remains an obligation of that future integration packet.

---

## 8. Ready for Orchestrator Review

**Yes.** All Repair 01 items are resolved and verified. Ready for final review and closeout.
