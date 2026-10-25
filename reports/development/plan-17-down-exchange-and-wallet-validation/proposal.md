# Plan 17: Down Exchange and Whole-Wallet Validation — Final Evidence & Proposal (Repair 01)

**Date:** 2026-10-25  
**Status:** Completed Proposal & Evidence (Repair 01 Executed)  
**Packet:** [`docs/development/plan-17-down-exchange-and-wallet-validation.md`](file:///c:/AI/Quackpot/docs/development/plan-17-down-exchange-and-wallet-validation.md)  
**Scope:** Strictly bounded to `reports/development/plan-17-down-exchange-and-wallet-validation/`. Existing `sim/` and `src/` modules are read-only references.

---

## 1. Executive Summary & Calibration Context

In the Plan 12 owner interview and orchestration triage ([DECISION-008](file:///c:/AI/Quackpot/docs/decision-log.md#L97-L110) and [DECISION-009](file:///c:/AI/Quackpot/docs/decision-log.md#L111-L120)), the owner refined the Down economy:
1. **Target Calibration:** **3 Down** for a minor temporary speed item, and **6 Down** for a single-pull ticket, alongside the **1,750-gem** odd-bundle tier ($4.99).
2. **Approved Scenario Rules (Orchestration Review):**
   - **Rule T1 A:** Draws bought with Down award normal rarity-weighted Down on duplicates (Common: 1, Rare: 5, Legendary: 20).
   - **Rule T2 A:** Draws bought with Down use conditional banner odds, advance the normal pity counter once, and **explicitly reset pity to 0 upon drawing a Legendary**.
   - **Rule T3 A:** Immediate active-banner redemption labeled **“Pull with Down — 6 Down”**; Down remains bankable in the wallet.
   - **Rule I1:** Minor speed item provides **+5.0% base speed** for one race (non-stacking). Runtime lifecycle (commit-once, reload preservation) is designated as a **future integration verification obligation**.

This report documents the verified mathematical and simulation evidence supporting these owner targets, incorporating Repair 01 requirements: mass conservation in recurrence, explicit separation of absorption from cap-censoring, a multi-cell roster coverage matrix (empty, partial missing legendary, full), and honest accounting of hypothetical wallet paths.

---

## 2. Six-Identity Duplicate Payouts and Opening Distributions

### 2.1 Roster Structure & Multinomial Basis
The active Banner 1 roster ([`BANNER_1_ROSTER`](file:///c:/AI/Quackpot/src/core/game-engine.mjs#L15-L22)) contains exactly 6 identities across 3 tiers:
- **Common (3 identities, 80.0% base odds):** `duck-0`, `duck-1`, `duck-3` ($p_C = 0.80 / 3 \approx 0.266667$ each). Duplicate payout: **1 Down**.
- **Rare (2 identities, 18.0% base odds):** `duck-2`, `duck-4` ($p_R = 0.18 / 2 = 0.090000$ each). Duplicate payout: **5 Down**.
- **Legendary (1 identity, 2.0% base odds):** `duck-5` ($p_L = 0.020000$). Duplicate payout: **20 Down**.

Because outcomes are governed by independent draws from unequal category probabilities, the opening distribution is evaluated over all non-equiprobable count vectors $\mathbf{k} = (k_1, \dots, k_6)$ summing to 10 with multinomial mass:
$$P(\mathbf{k}) = \frac{10!}{\prod_{i=1}^6 k_i!} \prod_{i=1}^6 p_i^{k_i}$$

### 2.2 Reconciled Opening Probabilities
By the Pigeonhole Principle, drawing 10 cards across 6 distinct identities guarantees at least $10 - 6 = 4$ duplicate cards. It is impossible to receive fewer than 4 duplicate cards from an empty roster.

#### Duplicate Cards Distribution
| Duplicate Cards | Exact Probability | Cumulative |
| :---: | :---: | :---: |
| **4** | 4.2833% | 4.2833% |
| **5** | 34.1784% | 38.4617% |
| **6** | 46.2870% | 84.7487% |
| **7** | 14.6737% | 99.4224% |
| **8** | 0.5770% | 99.9995% |
| **9** | 0.0005% | 100.0000% |

- **Mean duplicate cards:** **$5.7308$**
- **Median duplicate cards:** **6**

#### Down Feathers Gained Distribution
| Down Gained | Exact Probability | Cumulative | Exchange Affordability |
| :---: | :---: | :---: | :--- |
| **4** | 2.0200% | 2.0200% | Affords 1 speed item (3 Down); 2 Down short of ticket. *(Plan 03 fixture)* |
| **5** | 16.0293% | 18.0493% | Affords 1 speed item (3 Down); 1 Down short of ticket. |
| **6** | 26.8080% | 44.8573% | **Affords 1 ticket (6 Down) or 2 speed items**. |
| **7** | 12.2740% | 57.1313% | **Median Down (7 Down)**. Affords 1 ticket + 1 Down remainder. |
| **8** | 1.9885% | 59.1198% | 1 ticket + 2 Down remainder. |
| **9** | 11.6019% | 70.7217% | 1 ticket + 3 Down remainder (or 3 speed items). |
| **10** | 13.1378% | 83.8595% | 1 ticket + 4 Down remainder (or 3 speed items + 1 remainder). |
| **11 – 13** | 6.4149% | 90.2744% | 1 to 2 tickets. |
| **14** | 4.4933% | 94.7677% | **2 tickets (12 Down) + 2 Down remainder**. |
| **15 – 24** | 4.5458% | 99.3135% | Multiple tickets or mixed item baskets. |
| **25** | **0.3719%** | 99.6854% | **Windfall:** Affords 4 tickets (24 Down) + 1 Down remainder. |
| **26+** | 0.3146% | 100.0000% | High-windfall tail (multiple Rare/Legendary duplicates). |

#### Reconciled Summary Metrics:
- **$\mathbf{P(\text{Down} \ge 3) = 100.0000\%}$:** Every single player drawing the initial free 10-pull earns at least 4 Down. **100% of students can afford the 3-Down minor speed item.**
- **$\mathbf{P(\text{Down} \ge 6) = 81.9507\%}$:** Over 4 out of 5 students (~82%) can afford at least one **6-Down pull ticket** immediately.
- **$\mathbf{P(\text{Down} < 6) = 18.0493\%}$:** Only ~18% of students experience a shortfall of 1 or 2 Down to reach a ticket.
- **Mean Down:** **$8.3706$** Down.
- **Median Down:** **$7$** Down.

### 2.3 Representative 10-Card Opening Traces

#### Trace 1: Low Tail Opening (4 Down — 2.02% probability)
*Plan 03 static trial fixture equivalent. Draws all 6 unique identities, yielding 4 Common duplicates:*
- Cards 1–6: `duck-0` (C, NEW), `duck-1` (C, NEW), `duck-3` (C, NEW), `duck-2` (R, NEW), `duck-4` (R, NEW), `duck-5` (L, NEW).
- Cards 7–10: `duck-0` (C, DUP, +1), `duck-1` (C, DUP, +1), `duck-3` (C, DUP, +1), `duck-0` (C, DUP, +1).
- **Summary:** 4 Duplicates, **4 Down**. Affords 1 speed item (3 Down); 2 Down short of ticket.

#### Trace 2: Median / Typical Opening (7 Down — 12.27% probability)
*Drawn from 3 unique Common identities ($k_C = [2, 3, 5]$, Rares/Legendary not drawn), yielding 7 Common duplicates:*
- Cards 1–3: `duck-0` (C, NEW), `duck-1` (C, NEW), `duck-3` (C, NEW).
- Cards 4–10: `duck-0` (+1), `duck-1` (+1), `duck-1` (+1), `duck-3` (+1), `duck-3` (+1), `duck-3` (+1), `duck-3` (+1).
- **Summary:** 7 Duplicates, **7 Down**. Affords 1 ticket (6 Down) with 1 Down remainder, or 2 speed items + 1 remainder.

#### Trace 3: Upper-Middle Opening (10 Down — 13.14% probability)
*Count vector $[3, 2, 3, 2, 0, 0]$ (4 unique identities, 1 Rare duplicate + 5 Common duplicates):*
- Cards 1–4: `duck-0` (C, NEW), `duck-1` (C, NEW), `duck-3` (C, NEW), `duck-2` (R, NEW).
- Card 5: `duck-2` (R, DUP, **+5 Down**).
- Cards 6–10: `duck-0` (+1), `duck-0` (+1), `duck-1` (+1), `duck-3` (+1), `duck-3` (+1).
- **Summary:** 6 Duplicates, **10 Down**. Affords 1 ticket (6 Down) with 4 Down remainder, or 3 speed items + 1 remainder.

#### Trace 4: Legendary Windfall Opening (25 Down — 0.3719% probability)
*Count vector $[0, 0, 6, 1, 1, 2]$ (4 unique identities, 1 Legendary duplicate + 5 Common duplicates):*
- Cards 1–4: `duck-3` (C, NEW), `duck-2` (R, NEW), `duck-4` (R, NEW), `duck-5` (L, NEW).
- Card 5: `duck-5` (L, DUP, **+20 Down**).
- Cards 6–10: `duck-3` (+1), `duck-3` (+1), `duck-3` (+1), `duck-3` (+1), `duck-3` (+1).
- **Summary:** 6 Duplicates, **25 Down**. Affords **4 tickets (24 Down)** with 1 Down remainder.

---

## 3. Pooled-Bank Recurrence & Mass Conservation (Repair 01)

### 3.1 Resolving Terminal Probability Mass Loss
In earlier iterations, bank states that dropped below 6 Down ($B < 6$) were skipped during subsequent steps without being accumulated, discarding absorbed mass.  
In Repair 01, absorbed mass is accumulated across all steps into an absorbed distribution map:
$$\text{Total Mass} = M_{\text{absorbed}} + M_{\text{live}} \equiv 1.00000000$$

### 3.2 Exact Recurrence Evaluation Across Starting Banks (Base Odds, Full Ownership)
Tracking discrete transitions from live bank state $B \ge 6$:
$$B \to \begin{cases} B - 5 & (p = 0.80) \\ B - 1 & (p = 0.18) \\ B + 14 & (p = 0.02) \end{cases}$$

| Starting Bank | Expected Total Draws | Absorbed Mass | Remaining Live Mass | Total Mass | Steps to $\epsilon < 10^{-13}$ | First-Step Absorbed Split | Overall Terminal Bank Distribution |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **0 Down** | **0.00000** | 1.00000000 | 0.00 | 1.00000000 | 0 | 100% at 0 Down | 0 Down (100.0%) |
| **4 Down** | **0.00000** | 1.00000000 | 0.00 | 1.00000000 | 0 | 100% at 4 Down | 4 Down (100.0%) |
| **6 Down** | **1.08075** | 1.00000000 | $8.97 \times 10^{-14}$ | 1.00000000 | 64 | **80.0% at 1d, 18.0% at 5d** | **1d: 80.04%, 5d: 19.04%**, 4d: 0.59%, 3d: 0.24%, 2d: 0.09% |
| **12 Down** | **2.54461** | 1.00000000 | $8.03 \times 10^{-14}$ | 1.00000000 | 69 | None (100% live $\ge 7$) | **2d: 64.17%, 1d: 24.42%, 5d: 9.66%**, 4d: 1.30%, 3d: 0.45% |
| **18 Down** | **3.95109** | 1.00000000 | $7.36 \times 10^{-14}$ | 1.00000000 | 73 | None (100% live $\ge 13$) | **3d: 51.46%, 2d: 29.35%, 1d: 9.94%**, 5d: 7.37%, 4d: 1.88% |
| **20 Down** | **4.03735** | 1.00000000 | $9.76 \times 10^{-14}$ | 1.00000000 | 73 | None (100% live $\ge 15$) | **5d: 41.27%, 4d: 25.13%, 3d: 18.89%**, 2d: 8.87%, 1d: 5.84% |
| **24 Down** | **5.33516** | 1.00000000 | $6.79 \times 10^{-14}$ | 1.00000000 | 76 | None (100% live $\ge 19$) | **4d: 41.25%, 3d: 31.78%, 2d: 15.01%**, 5d: 7.23%, 1d: 4.73% |

#### Key Recurrence Findings:
1. **Total Probability Mass Conserved:** Absorbed mass plus live mass sums to $1.00000000$ across all starting banks.
2. **First-Step Split Verified:** From 6 Down, Draw 1 immediately absorbs exactly $80.0\%$ at bank 1 Down and $18.0\%$ at bank 5 Down. Only the $2.0\%$ Legendary windfall continues past step 1.
3. **Pooling Synergy:** 12 Down yields **$2.545$ expected draws** (greater than $2 \times 1.08 = 2.16$). Because Draw 1 costs 6 Down, the bank drops to 6; any duplicate returns at least +1 Down, guaranteeing that the bank remains $\ge 7$ Down for an unconditional second draw.

---

## 4. Multi-Cell Roster Coverage Matrix (Repair 01)

### 4.1 Explicit Separation of Absorption from Cap-Censoring
In accordance with Review 01, simulation outcomes strictly separate:
- **Absorbed Runs:** The run ends naturally because the player runs out of purchasing power ($B < 6$). The final bank ($0 \le B \le 5$) is recorded in `terminalBanks`.
- **Censored Runs:** The run reaches the declared maximum draw cap ($D = 2,000$ draws) while still possessing live purchasing power ($B \ge 6$). The live residual bank is recorded in `censoredResidualBanks` and is **never** counted in terminal distributions.

### 4.2 Simulation Coverage Matrix (10,000 Trials per Cell)

| Cell ID | Roster Configuration | Initial Bank | Initial Pity | Absorbed Count / Rate | Censored Count / Rate | Mean Draws (Completed) | Mean Draws (Capped) | Max Draws Observed | Terminal Banks Summary |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **M1** | Empty (0/6 owned) | 6 Down | Pity 0 | 10,000 / **100.0%** | 0 / **0.0%** | **1.000** | 1.000 | 1 | 100% end at 0 Down |
| **M2** | Empty (0/6 owned) | 12 Down | Pity 0 | 10,000 / **100.0%** | 0 / **0.0%** | **2.001** | 2.001 | 5 | 99.9% end at 0 Down |
| **M3** | Partial (5/6, missing Legendary) | 6 Down | Pity 0 | 10,000 / **100.0%** | 0 / **0.0%** | **1.000** | 1.000 | 1 | 100% end at 0 Down |
| **M4** | Partial (5/6, missing Legendary) | 6 Down | Pity 30 | 10,000 / **100.0%** | 0 / **0.0%** | **1.000** | 1.000 | 1 | 100% end at 0 Down |
| **M5** | Partial (5/6, missing Legendary) | 6 Down | **Pity 49 (Hard Pity)** | 10,000 / **100.0%** | 0 / **0.0%** | **1.000** | 1.000 | 1 | **100% end at 0 Down** |
| **M6** | Partial (5/6, missing Legendary) | 12 Down | Pity 0 | 10,000 / **100.0%** | 0 / **0.0%** | **2.326** | 2.326 | 6 | 70.3% at 1d, 26.6% at 5d |
| **M7** | Full (6/6 owned) | 6 Down | Pity 0 | 10,000 / **100.0%** | 0 / **0.0%** | **1.080** | 1.080 | 16 | 80.0% at 1d, 19.0% at 5d |
| **M8** | Full (6/6 owned) | 6 Down | Pity 30 | 10,000 / **100.0%** | 0 / **0.0%** | **1.079** | 1.079 | 14 | 79.9% at 1d, 18.9% at 5d |
| **M9** | Full (6/6 owned) | 6 Down | **Pity 49 (with Reset)** | 10,000 / **100.0%** | 0 / **0.0%** | **5.045** | 5.045 | 25 | 41.3% at 5d, 25.1% at 4d |
| **M10**| Full (6/6 owned) | 12 Down | Pity 0 | 10,000 / **100.0%** | 0 / **0.0%** | **2.532** | 2.532 | 20 | 64.2% at 2d, 24.4% at 1d |
| **M11**| Full (6/6 owned) | 24 Down | Pity 0 | 10,000 / **100.0%** | 0 / **0.0%** | **5.309** | 5.309 | 22 | 41.3% at 4d, 31.8% at 3d |
| **M12**| **Counterexample (Frozen Pity 49)** | 6 Down | Pity 49 (No Reset) | 0 / **0.0%** | 10 / **100.0%** | **N/A** | **500.0** | **500 (Cap)** | **Empty (Live Bank: 7,006d)** |

### 4.3 Structural Insights from Roster Coverage:
1. **The Missing Legendary Trap (Cell M5):**
   - When a player owns all Commons and Rares but is missing the Legendary duck (`duck-5`), drawing at hard pity (Pity 49) guarantees `duck-5`.
   - Because `duck-5` was **not previously owned**, it is a **NEW** duck, awarding **0 Down feathers**.
   - Pity resets to 0. Bank drops from 6 to 0. The player achieves their collection goal, but **ticket recycling terminates immediately with 0 Down**.
2. **The Full Ownership Windfall (Cell M9):**
   - When all 6 ducks are owned, hitting hard pity guarantees a **duplicate** Legendary, awarding **20 Down**.
   - Under Rule T2 A, pity resets to 0. The 20 Down then decays at base odds, yielding an expected **$5.045$ completed draws**. All 10,000 runs absorb cleanly (0% censoring).
3. **Analytic Induction of the Frozen Pity Runaway Loop (Cell M12):**
   - In Cell M12, 100% of runs hit the declared cap ($D = 500$ draws) with 7,006 Down remaining.
   - **Inductive Invariant:** Let $p_L = 1.0$ be fixed without reset. Every draw deterministically yields duplicate duck-5 (+20 Down) at cost 6 Down.
   - Net change per draw is strictly $\Delta B = +20 - 6 = \mathbf{+14\text{ Down}}$.
   - Bank after $n$ draws is $B(n) = B(0) + 14n$. Since $14 > 0$, $B(n) \to \infty$. This proves the runaway loop analytically, independent of the empirical safety cap.

### 4.4 Reproducible Per-Draw Trajectories

#### Trajectory 1: Empty Roster Starting with 6 Down (Cell M1)
- **Draw 1:** Pity 0, Odds: C 80%, R 18%, L 2%. Drew `duck-0` (Common, NEW). Award: **0 Down**. Bank: $6 - 6 + 0 = \mathbf{0\text{ Down}}$. Pity after: 1.
- **Outcome:** Bank $< 6 \implies$ **Terminated / Absorbed after 1 draw** with 0 Down remaining.

#### Trajectory 2: Partial Roster Missing Legendary Starting at Pity 49 (Cell M5)
- **Draw 1:** Pity 49, Odds: L 100%. Drew `duck-5` (Legendary, NEW). Award: **0 Down**. Bank: $6 - 6 + 0 = \mathbf{0\text{ Down}}$. Pity after: 0 (Reset).
- **Outcome:** Bank $< 6 \implies$ **Terminated / Absorbed after 1 draw** with 0 Down remaining.

#### Trajectory 3: Full Roster Starting at Pity 49 with Normal Reset (Cell M9)
- **Draw 1:** Pity 49, Odds: L 100%. Drew `duck-5` (Legendary, OWNED). Award: **+20 Down**. Bank: $6 - 6 + 20 = \mathbf{20\text{ Down}}$. Pity after: 0 (Reset).
- **Draw 2:** Pity 0, Odds: C 80%, R 18%, L 2%. Drew `duck-0` (Common, OWNED). Award: **+1 Down**. Bank: $20 - 6 + 1 = \mathbf{15\text{ Down}}$. Pity after: 1.
- **Draw 3:** Pity 1, Odds: base. Drew `duck-2` (Rare, OWNED). Award: **+5 Down**. Bank: $15 - 6 + 5 = \mathbf{14\text{ Down}}$. Pity after: 2.
- **Draw 4:** Pity 2. Drew `duck-1` (Common, OWNED). Award: **+1 Down**. Bank: $14 - 6 + 1 = \mathbf{9\text{ Down}}$. Pity after: 3.
- **Draw 5:** Pity 3. Drew `duck-3` (Common, OWNED). Award: **+1 Down**. Bank: $9 - 6 + 1 = \mathbf{4\text{ Down}}$. Pity after: 4.
- **Outcome:** Bank $4 < 6 \implies$ **Terminated / Absorbed after 5 draws** with 4 Down remaining.

---

## 5. Pond Race Consumable Resolution & Integration Obligations (Option I1)

### 5.1 Efficacy Verification (Numerical Quadrature & Paired Simulation)
Against 5 independent opponents:
- **Finale Field (11.2 speed):** On Common Sprint stance, +5.0% base speed shifts 1st-place win probability from **$36.97\%$ to $49.49\%$ (+12.53 percentage points)**, increasing expected gem payout from 20.91g to 27.24g (+6.33g).
- **Common Safe Stance:** Win probability against field 11.2 shifts from $0.0000\%$ to $0.0173\%$ (a tiny upset chance). The item cannot bail out passive play.
- **Tutorial Race (8.0 field):** Baseline Common Safe already achieves $100.0\%$ win rate. Buying items before Race 1 provides zero marginal benefit.

### 5.2 Deferred Integration Lifecycle Obligations
The mathematical model here confirms statistical efficacy. The following runtime behaviors are designated as **future integration verification obligations** to be implemented and tested in the upcoming UI/engine integration packet:
1. **Commit-Time Consumption:** The item must be consumed strictly once when the race execution commits.
2. **Stance Modal Cancellation:** Opening the pre-race stance modal and closing/cancelling it must NOT consume the item.
3. **Idempotency on Reload:** Page reload during or after race resolution must reconstruct state without double-consuming the item or duplicating race rewards.
4. **Presentation Separation:** The numerical +5% boost is a game-engine parameter; it does not promise a fixed 0.2s duration or 30s consumable duration in the visual presentation.

---

## 6. Whole-Wallet Hypothetical Progression Paths & Receipt Specs

### 6.1 Hypothetical Wallet Progression Paths
The following table models explicit hypothetical purchase and spend trajectories:

| Path ID & Scenario | Gems Before Purchase | Bundle Added | Total Available | After 10-Pull (1,600g) | Available Singles | Stranded Remainder | Shortfall to Next Single |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Path 1: Pure Isolated Bundle** | 0g | +1,750g ($4.99) | 1,750g | 150g | 0 | **150g** | **10g short** *(The isolated trap)* |
| **Path 2: Tutorial Race Winner** | 50g | +1,750g ($4.99) | 1,800g | 200g | **1** | **40g** | **120g short** |
| **Path 3: Starter Pack Purchaser** | 130g | +1,750g ($4.99) | 1,880g | 280g | **1** | **120g** | **40g short** |
| **Path 4: Starter Pack Alone** | 50g | +240g ($0.99) | 290g | N/A | **1** | **130g** | **30g short** |
| **Path 5: Two Race Wins** | 100g | +1,750g ($4.99) | 1,850g | 250g | **1** | **90g** | **70g short** |

### 6.2 Truthful Receipt Debrief Specifications
1. **Strict Currency Isolation (Rule T4):** Down spend (6 Down/ticket) is logged strictly in the secondary-currency register, never inflated into cash or gem registers.
2. **Accurate Stranded Reporting:** 5 Down must be reported as 1 Down short of a ticket, but capable of buying a 3-Down speed item. It must never be labeled as wholly unspendable.
3. **Question-Based Reflection:** The *“Did This Affect You?”* register must present reflective questions (e.g. *“Did the availability of pull tickets in the Down exchange encourage you to keep drawing after your opening pulls?”*) rather than asserting player psychological states.

---

## 7. Artifact Index & Verification Summary

All supporting evidence, simulation scripts, and reproducible test suites are located within this folder:
- **Analytics Engine:** [`down-validation-engine.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/down-validation-engine.mjs)
- **Automated Test Suite (7/7 Passing):** [`scenarios.test.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/scenarios.test.mjs)
- **Scenario Evidence Generator:** [`run-scenarios.mjs`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/run-scenarios.mjs)
- **Structured Data Artifact:** [`results.json`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/results.json)
- **Progress Report:** [`progress.md`](file:///c:/AI/Quackpot/reports/development/plan-17-down-exchange-and-wallet-validation/progress.md)

**Automated Verification:**
- `node --test reports/development/plan-17-down-exchange-and-wallet-validation/scenarios.test.mjs`: Exit 0 (7 pass, 0 fail).
- `node scripts/dev/plan-status.js lint`: Exit 0 (`lint: OK (no violations)`).
- `node scripts/dev/plan-status.js check plan-17`: Exit 0 (`RUNNABLE`).
