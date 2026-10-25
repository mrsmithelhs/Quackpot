# Plan 17 Progress Report — Down Exchange and Whole-Wallet Validation

**Date:** 2026-10-25  
**Packet:** [`docs/development/plan-17-down-exchange-and-wallet-validation.md`](file:///c:/AI/Quackpot/docs/development/plan-17-down-exchange-and-wallet-validation.md)  
**Status:** Scenarios & Evidence Pass Complete; Awaiting Orchestrator / Owner Final Review  
**Task:** Bounded mechanism validation of owner-selected 3-Down item, 6-Down ticket, and 1,750-gem odd-bundle tier under approved rules T1 A / T2 A / T3 A / I1.

---

## 1. Overall Summary

Following orchestration preflight review and owner approval of rules **T1 A** (normal duplicate payouts on ticket draws), **T2 A** (pity advance with explicit reset to 0 on Legendary), **T3 A** (instant active-banner redemption "Pull with Down — 6 Down"), and **I1** (+5.0% base speed boost for 1 race, consumed on commit), this thread implemented and executed the complete bounded scenario validation suite within `reports/development/plan-17-down-exchange-and-wallet-validation/`.

All calculations, simulations, and data artifacts were produced strictly within the report folder with zero mutations to shared `sim/`, `src/`, or root configuration files.

### Key Evidence Established:
1. **Reconciled Opening 10-Pull Distributions:**
   - Evaluated over non-equiprobable multinomial count vectors: $P(\text{Down} \ge 3) = \mathbf{100.0000\%}$ and $P(\text{Down} \ge 6) = \mathbf{81.9507\%}$.
   - Mean Down is **$8.3706$**, Median Down is **$7$** Down.
   - Guaranteed minimum duplicate cards is strictly 4 (pigeonhole bound); minimum Down is strictly 4 Down ($P(\text{Down} < 4) = 0$).
   - Reconciled exact probabilities for representative 10-card traces: Low Tail (4 Down, 2.02%), Median (7 Down, 12.27%), Upper-Middle (10 Down, 13.14%), and Windfall (25 Down, 0.3719%).
2. **Pooled-Bank Integer Recycling Dynamics (Corrected Proof):**
   - Replaced fractional branching ratio with exact discrete Markov state recurrence.
   - For an initial bank of 6 Down under base odds, expected draws is **$1.08075$**; **98.0% of first draws end the sequence immediately** (Common returns +1, Rare returns +5, both leaving $<6$ Down).
   - Higher starting banks exhibit pooling synergy: 12 Down yields **$2.5446$** expected draws (guaranteeing a second draw), 18 Down yields **$3.9511$**, and 24 Down yields **$5.3352$**.
   - Extinction probability is **$1.0$ (almost surely)** across all finite starting banks, with remaining live probability decaying below $10^{-13}$ within 64–83 steps.
3. **Pity Advancement & Neutralization of Runaway Loop:**
   - Under Rule T2 A, ticket draws advance pity. From pity 0, mean draws is $1.081$; near soft pity (pity 30), mean draws is $1.134$.
   - **Counterexample Solved:** If pity was frozen at hard pity (pity 49) without reset, every draw yields a Legendary (+20 Down, net $+14$ Down per draw), creating a runaway infinite loop (confirmed via simulation hitting safety cap 2001). Under Rule T2 A's required reset, drawing a Legendary immediately resets pity to 0, bounding the total draws from pity 49 to an average of **$5.078$** draws.
4. **Pond Race Consumable Resolution (Option I1):**
   - Evaluated via 100,000-step numerical quadrature and 20,000 paired Monte Carlo races.
   - Against the Race 2 field (11.2 speed), +5% base speed on Common Sprint shifts 1st-place win probability from **$36.97\%$ to $49.49\%$ (+12.53 percentage points)**, increasing expected gem payout from 20.91g to 27.24g (+6.33g).
   - Confirmed that Common Safe stance cannot beat the 11.2 field ($0.017\%$ win rate even with the item), preserving tactical stance tension.
   - Confirmed that Tutorial race (8.0 field) has a 100.0% win rate baseline, demonstrating that buying items before Race 1 is an unneeded currency sink.
5. **Whole-Wallet Remainder & Shortfall Reconciliation:**
   - Traced 5 canonical progression paths, proving that the pure bundle shortfall ($1,750 - 1,600 = 150$, 10 short of 160) shifts in real play: standard Day 1 winners carry 50 race gems $\to 200$ gems, enabling an 11th pull and leaving 40 gems stranded (120-gem shortfall).
   - Specified necessary Receipt wording to distinguish bundle-only remainder from wallet remainder and avoid learner pushback.

---

## 2. Files Changed & Artifacts Produced

### Owned Files in `reports/development/plan-17-down-exchange-and-wallet-validation/`:
- [`down-validation-engine.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/down-validation-engine.mjs): Core mathematical formulas, Markov recurrence solvers, dynamic pity recycling simulator, race quadrature, and wallet tracer.
- [`scenarios.test.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/scenarios.test.mjs): Automated test suite verifying distributions, recurrence bounds, pity reset boundaries, race win rates, and wallet math.
- [`run-scenarios.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/run-scenarios.mjs): Executable script running the full scenario suite and generating markdown/console tables.
- [`results.json`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/results.json): Complete structured JSON artifact containing all empirical traces, recurrence tables, simulation metrics, and wallet paths.
- [`proposal.md`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/proposal.md): Comprehensive final evidence report and pedagogical debrief specifications.
- [`progress.md`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/progress.md): This progress report.

### Unmodified Files (Read-Only References):
- `docs/development/plan-17-down-exchange-and-wallet-validation.md`
- `src/core/game-engine.mjs`
- `src/core/prng.mjs`
- `sim/model.mjs`
- `reports/development/plan-17-down-exchange-and-wallet-validation/preflight-checks-01.mjs`
- `reports/development/plan-17-down-exchange-and-wallet-validation/preflight-review-01.md`

---

## 3. Commands Run and Results

| Command | Purpose | Result |
| :--- | :--- | :--- |
| `node scripts/dev/plan-status.js check plan-17` | Preflight status check | Exit 0: `RUNNABLE: plan-17 is ready to implement` |
| `node --test reports/development/plan-17-down-exchange-and-wallet-validation/scenarios.test.mjs` | Run Plan 17 automated test suite | Exit 0: 5 tests passed, 0 failed (114.8ms) |
| `node reports/development/plan-17-down-exchange-and-wallet-validation/run-scenarios.mjs` | Execute full simulation scenarios & generate `results.json` | Exit 0: Successfully generated `results.json` and summary tables |
| `cmd.exe /c "npm test"` | Full repository regression check | Exit 0: 138 tests passed, 0 failed across all packages |
| `node scripts/dev/plan-status.js lint` | Packet schema and lifecycle lint | Exit 0: `lint: OK (no violations)` |

---

## 4. Validation Checks Performed

1. **Multinomial Total Mass:** Verified that $\sum P(\mathbf{k}) = 1.0000000000000002$.
2. **Independent Reproduction:** Verified that mean Down ($8.3706$), median Down ($7$), duplicate cards mean ($5.7308$), and ticket affordability ($81.9507\%$) match root's preflight calculation in `preflight-checks-01.mjs`.
3. **Pigeonhole Floor:** Confirmed that with 10 draws across 6 identities, duplicate cards is at least 4, and Down gained is at least 4.
4. **Markov Decay from 6 Down:** Confirmed that expected draws from 6 Down is exactly $1.08075$ draws under base odds, with remaining live mass $< 10^{-13}$ within 64 steps.
5. **Pity Runaway Neutralization:** Confirmed that pity 49 without reset hits runaway safety cap ($>2,000$ draws), while pity 49 with Rule T2 A reset bounds expected draws to $5.078$.
6. **Quadrature vs. Simulation Convergence:** Confirmed that numerical quadrature for Common Sprint vs 11.2 field ($36.97\%$ baseline, $49.49\%$ boosted) matches 20,000-trial paired Monte Carlo ($37.14\%$ baseline, $49.33\%$ boosted) within $\pm 0.2\%$.
7. **Clean Scope Isolation:** Verified via `git status` that only files inside `reports/development/plan-17-down-exchange-and-wallet-validation/` were created or modified.

---

## 5. Problems Encountered and How Resolved

- **Initial Assertion Discrepancy on Starting Bank 12:** Initial test asserted bank 12 draws would equal $2 \times 1.08 = 2.16$. Recurrence solver returned $2.5446$. Investigation confirmed that leftover Down from draw 1 ($+1$ or $+5$) pools with residual bank, guaranteeing a second draw ($100\%$ probability) and creating non-linear pooling synergy. Test was updated with exact analytical bounds.
- **Floating Point Equality on $P(\text{Down} \ge 3)$:** Evaluated exact sum gave $0.9999999999999999$ due to double-precision arithmetic; updated assertion to `Math.abs(itemAffordable - 1.0) < 1e-12`.

---

## 6. Advisor Consultation Declaration

**Branch C — not advisor-capable (fail-closed, orchestrator-gate-only):**  
In accordance with the Implementer Thread Starting Prompt and `advisor-capable-providers.json`, this thread operates under Antigravity (Google DeepMind). Because Antigravity is not listed in `advisor-capable-providers.json`, the thread fails closed to not advisor-capable under Step 1. No autonomous advisor consultation ran; verification is provided by independent orchestrator audit (`preflight-review-01.md`, `preflight-checks-01.mjs`) and the automated test suite.

---

## 7. Remaining Risks or Follow-Ups

- **Production Integration Phase:** Implementation of Down exchange in the live game UI, inventory, and Receipt belongs to a subsequent production integration packet after owner review of this report.
- **Roster Expansion Awareness:** When the collectible roster is expanded beyond 6 identities in future milestones, opening duplicate rates will drop. The $81.95\%$ opening ticket affordability is specific to the current 6-identity roster.

---

## 8. Ready for Orchestrator Review

**Yes.** All required evidence, test scripts, and structured data artifacts have been generated and committed. Ready for final review and closeout gating.
