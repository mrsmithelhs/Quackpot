# Plan 17 Progress Report — Bounded Mechanism Outline

**Date:** 2026-10-25  
**Packet:** [`docs/development/plan-17-down-exchange-and-wallet-validation.md`](file:///c:/AI/Quackpot/docs/development/plan-17-down-exchange-and-wallet-validation.md)  
**Task:** Bounded mechanism outline identifying unresolved ticket/item rules and validating 3/6 Down calibration.

---

## 1. Overall Summary

Completed the bounded mechanism outline for Plan 17 Down exchange and whole-wallet validation. The analysis strictly preserves the owner-selected target prices of **3 Down** for a minor temporary speed item and **6 Down** for a single-pull ticket, alongside the **1,750-gem** odd-bundle example. 

Key analytical findings established:
- **Pigeonhole Guarantee:** Drawing 10 cards across 6 roster identities guarantees at least 4 duplicate cards. Drawing from an empty roster yields $P(\text{Down} \ge 3) = 100.00\%$ and $P(\text{Down} \ge 6) = 81.95\%$. Over 80% of students qualify for at least one pull ticket immediately after their opening 10-pull, while 100% can afford the speed item.
- **Subcritical Lossiness:** Proved mathematically that ticket recycling has an expected return of $E[\text{Down}] = 2.10$ Down per draw (return ratio $R = 0.35$). It forms a strictly subcritical branching process with an expected multiplier of $1.538\times$ total draws per initial ticket, guaranteeing complete extinction (no infinite or self-funding loop).
- **Transient Recovery Trajectories:** Identified the "Rare Bounce" (18% probability, returns 5 Down) and "Legendary Windfall" (2% probability, returns 20 Down = 3 tickets) as the mathematical drivers behind the authentic feeling of "almost catching up."
- **Consumable Item Calibration:** Demonstrated that the wireframe's sample +0.5% boost is 20x smaller than race noise and undetectable; proposed concrete observable alternatives (+5.0% single-race boost, non-stacking).
- **Whole-Wallet Breakage:** Demonstrated how the isolated 10-gem shortfall ($1,750 - 1,600 = 150$) shifts in whole-wallet play (e.g. 50 race gems creates 200 gems, enabling an 11th pull and leaving 40 gems stranded). Outlined necessary Receipt phrasing to prevent learner contradictions.

---

## 2. Files Changed & Artifacts Produced

### Owned Files Created:
- [`reports/development/plan-17-down-exchange-and-wallet-validation/proposal.md`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/proposal.md): Complete bounded mechanism outline with multinomial distributions, rule decision matrix, subcritical lossiness proofs, recovery trajectory definitions, item speed analysis, and whole-wallet progression tables.
- [`reports/development/plan-17-down-exchange-and-wallet-validation/progress.md`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/progress.md): This progress report.

### Unmodified / Read-Only Files Inspected:
- `docs/development/plan-17-down-exchange-and-wallet-validation.md`
- `docs/founding/design.md`
- `docs/decision-log.md`
- `reports/orchestration/plan-12-owner-integration.md`
- `reports/development/plan-12-guided-opening-and-shop-progression/wireframes-owner-interview.md`
- `src/core/game-engine.mjs`
- `sim/model.mjs`
- `advisor-capable-providers.json`

### Note on Existing Tree Changes:
- `git status` displays unstaged modifications in `docs/development/README.md` and `docs/development/plan-04-svg-rig-and-sound.md` made prior to this thread. In accordance with commit discipline, these files were left completely untouched and will not be staged.

---

## 3. Commands Run and Results

| Command | Purpose | Result |
| :--- | :--- | :--- |
| `node scripts/dev/plan-status.js check plan-17` | Preflight check for packet runnability | Exit 0: `RUNNABLE: plan-17 is ready to implement` |
| `git status` | Inspect working tree state and existing modifications | Confirmed unstaged files from other threads; verified disjoint scope |
| `node scratch/calc_dist.js` | Exact multinomial evaluation of 10-pull duplicate cards and Down distributions | Reconciled exact probabilities: $P(\text{Down} \ge 3) = 1.0$, $P(\text{Down} \ge 6) = 0.8195$ |
| `node scratch/check_wallets.js` | Whole-wallet remainder and shortfall arithmetic | Verified wallet remainders across 5 progression paths |

---

## 4. Validation Checks Performed

1. **Exact Multinomial Sum:** Verified that total probability across all $6^{10}$ combinations sums to exactly $1.00000000$.
2. **Mean Duplicate and Down Counts:** Verified that mean duplicate cards equals $5.7308$ and mean Down gained equals $8.3706$, reproducing the Luna-high audit calculations recorded in [`reports/orchestration/plan-12-owner-integration.md`](file:///c:/AI/Quackpot/reports/orchestration/plan-12-owner-integration.md#L26).
3. **Pigeonhole Floor:** Confirmed that with 6 identities and 10 draws, minimum duplicate cards is strictly 4, and since Common duplicate payout is 1 Down, minimum Down is strictly 4 Down ($P(\text{Down} < 4) = 0$).
4. **Branching Process Subcriticality:** Verified that under 100% duplicate ownership, expected Down per draw is $2.10$, yielding an offspring mean of $R = 2.10 / 6 = 0.35 < 1.0$.

---

## 5. Problems Encountered and How Resolved

- **Issue:** Windows PowerShell quoting caused syntax errors when attempting inline `node -e` commands.
- **Resolution:** Authored temporary helper scripts in the session scratch directory (`scratch/calc_dist.js` and `scratch/check_wallets.js`) and executed them via file path.

---

## 6. Advisor Consultation Declaration

**Branch C — not advisor-capable (fail-closed, orchestrator-gate-only):**  
In accordance with the Implementer Thread Starting Prompt and `advisor-capable-providers.json`, this thread operates under Antigravity (Google DeepMind). Because Antigravity is not an entry in `advisor-capable-providers.json`, the thread fails closed to not advisor-capable under Step 1. No autonomous advisor consultation ran; the standard orchestrator/owner review gate applies before scenario implementation.

---

## 7. Remaining Risks or Follow-Ups

- **Owner Selection of Rules T1–T3 & Item Option:** The next stage (headless scenario implementation and empirical traces) depends on the owner selecting preferred options from the decision matrix in [`proposal.md`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/proposal.md).
- **Roster Expansion Sensitivity:** When the roster expands beyond 6 identities in future milestones, opening duplicate probabilities will drop significantly. The current high initial ticket affordability ($81.95\%$) is a direct consequence of the 6-identity roster.

---

## 8. Ready for Orchestrator Review

**Yes.** The bounded mechanism outline is ready for orchestrator and owner review. Scenario implementation scripts remain gated on owner decisions.
