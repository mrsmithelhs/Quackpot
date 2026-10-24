# Plan 03 Preflight Proposal: Core Mechanism and Truthful Receipt Slice (Revision 2)

**Date:** 2026-10-24  
**Author:** Implementer (Plan 03 thread)  
**Packet:** [`docs/development/plan-03-mechanism-slice.md`](file:///c:/AI/Quackpot/docs/development/plan-03-mechanism-slice.md)  
**Reference brief:** [`reports/development/plan-03-mechanism-slice/preflight-brief.md`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/preflight-brief.md)  
**Reviews addressed:** [`reports/development/plan-03-mechanism-slice/preflight-review-01.md`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/preflight-review-01.md) and Orchestrator Review 02  
**Status:** Revised preflight proposal submitted for Owner and Orchestrator review. **Implementation code remains paused awaiting approval.**

---

## 1. Governance and Advisor Consultation Declaration

- **Packet Status:** `plan-03` is currently `ready` and verified runnable via `node scripts/dev/plan-status.js check plan-03` (exit code 0).
- **Approval Gate:** Per packet frontmatter: *"Owner approves the selected trade-off and bounded mechanism outline before coding, then reviews the played slice."*
- **Advisor Consultation Declaration (Single Branch):**
  - **Branch in Use:** **Branch C — Not advisor-capable (fail-closed to orchestrator-gate-only).**
  - **Capability Evidence and Reasoning:** Checked `advisor-capable-providers.json` (version 3). The current execution thread runs inside Google Antigravity. While Antigravity provides an internal subagent tool (`invoke_subagent`), `advisor-capable-providers.json` explicitly lists only `claude-code`, `codex-cli`, and `kimi-code`, with an unambiguous instruction: *"If you cannot confidently match yourself to an entry in that file, treat yourself as not advisor-capable."* Following this fail-closed requirement, this thread declares Branch C. No automated advisor was consulted; review relies entirely on the primary orchestrator gate.
- **Parallel Work Coordination:** Plan 08 operates strictly in `reports/development/plan-08-duck-visual-direction-prototypes/`. Plan 03 modifies only its own report files until the mechanism gate is passed. The existing SVG placeholder in `src/assets/duck-placeholder.svg` is preserved for this mechanism trial.

---

## 2. One Executable Learner Route and Action/Balance Table

### 2.1 Scope Definition: A Bounded Mechanism Demonstration
This slice is explicitly designed as a **bounded 3-day mechanism demonstration (~3–5 minutes of interactive play)** to validate the core loop, state machine, save/resume, and truthful Receipt projection. It does **not** establish the roughly 15-minute classroom floor run (which requires multiple banners, extended life progression, and full event-deck pacing). **Owner acceptance of this shortened prototype duration is requested under P3-DEC-1.**

### 2.2 Canonical Rhythm and Parameters
To prevent unrecoverable insolvency while creating a genuine economic squeeze, the economy uses the following coherent parameters:
- **Starting Cash:** $15.00
- **Starting Health:** 100 HP
- **Daily Wage:** +$10.00 earned at the end of each day (Day 1 evening and Day 2 evening)
- **Daily Food Expense:** $5.00 due each morning (Day 1 morning, Day 2 morning, Day 3 morning)
- **Periodic Rent Expense:** $15.00 due on Day 2 afternoon
- **Total Bills Scheduled (Days 1–3):** 4 bills totaling **$30.00** (three $5.00 food bills + one $15.00 rent bill)
- **Pond Race Schedule:** Exactly 2 races in the 3-day slice:
  - **Race 1 (Day 1 Midday):** Opening Tutorial Race (purse: 1st: 50 gems)
  - **Race 2 (Day 3 Midday):** Championship Finale against Rival Whale in Lane 1 (purse: 1st: 50 gems, 2nd: 20 gems, 3rd: 10 gems)
- **Starter Pack Offer:** $0.99 for 240 gems labeled `"400% value"` (gems-only, per model default)
- **Gem Bundle Shop:** Displays odd bundle sizes (e.g. 60 gems for $0.99, 330 gems for $4.99) against a 160-gem pull cost
- **Retention Offer:** Exactly 80 gems and copy `"play out the trap"`
- **Canonical Escalation Ladder (Steps 1–4):**
  - **Step 1 (`skip_lunch`):** Available only when food bill is due and Health > 20. Waives food bill (`billWaived: 5`), cash unchanged ($0), Health -15 HP.
  - **Step 2 (`extra_shift`):** Available when any bill cannot be paid and Health > 20. Grants +$10.00 cash, Health -15 HP (reconciling canonical wages and sleep loss without altering race reflexes; fatigue obscuring choices remains Plan 05).
  - **Step 3 (`sell_couch`, then `sell_tv`):** One-time asset sales. Selling couch grants +$10.00 cash; selling TV grants +$15.00 cash; visibly empties apartment.
  - **Step 4 (`credit_card`):** Available if debt < $50.00 limit. Draws +$15.00 cash, debt +$15.00, incurs 5% weekly interest ($0.75) if carried to a statement.
  - *(Steps 5–7 deferred per design doc D1).*

### 2.3 Exact Terminal Predicate
The terminal route is derived strictly from the following conditions:
- **`terminalRoute = 'uninstall'`**: The player clicks the persistent [Uninstall] button, is presented with the 80-gem retention modal, and clicks [Leave Anyway].
- **`terminalRoute = 'running_on_empty'`**: A bill is due and cash on hand is insufficient, and either:
  1. The player explicitly declines all available escalation options in sequence (choosing "Default / Can't Pay"), or
  2. All eligible escalation steps have been exhausted (couch and TV sold, credit limit reached, health $\le 20$), or
  3. Health reaches $\le 0$.
- **`terminalRoute = 'run_complete'`**: The player completes the Day 3 Championship Race and finishes the 3-day slice with all due bills settled.

### 2.4 The Frugal Zero-Cash Moment
In the frugal branch (Trace 1), paying Day 2 Rent of $15.00 reduces cash from $15.00 to exactly **$0.00**.
- **Solvency Rule:** Having $0.00 cash after settling a bill does **not** trigger default because no expense is currently due.
- The player experiences the psychological tension of an empty wallet during Day 2 afternoon, but remains solvent.
- In the evening, the Day 2 Wage (+$10.00) arrives as scheduled, raising cash to $10.00 before Day 3 morning food ($5.00) comes due.

### 2.5 Explicit State and Balance Progression Table

The table below traces the exact numerical state (Cash, Gems, Health, Debt, and Event Logged) across the four canonical branches:

| Day & Step | Event / Action | Cash Before $\rightarrow$ After | Gems Before $\rightarrow$ After | Health Before $\rightarrow$ After | Log Event Emitted & Fields |
|---|---|---|---|---|---|
| **D1: Morning** | Run starts; meet physical duck; free 10-pull | $15.00 $\rightarrow$ $15.00 | 0 $\rightarrow$ 0 | 100 $\rightarrow$ 100 | `draw_committed` (x10), `reveal_shown` (x10) |
| **D1: Morning** | Food Bill 1 arrives ($5.00) | $15.00 $\rightarrow$ $10.00 | 0 $\rightarrow$ 0 | 100 $\rightarrow$ 100 | `expense_due` (`kind: 'food'`, $5), `expense_paid` ($5, cashAfter: 10) |
| **D1: Midday** | Race 1: Tutorial race; win 1st place | $10.00 $\rightarrow$ $10.00 | 0 $\rightarrow$ 50 | 100 $\rightarrow$ 100 | `race_choice_offered`, `action`, `race_result` (`place: 1`), `reward` (50 gems) |
| **D1: Afternoon** | Starter Offer displayed | $10.00 $\rightarrow$ $10.00 | 50 $\rightarrow$ 50 | 100 $\rightarrow$ 100 | `offer_shown` (`technique: 'anchoring'`, gems: 240, price: 0.99, anchorLabel: '400% value') |
| **D1: Afternoon** | **Choice A: Decline Starter** | $10.00 $\rightarrow$ $10.00 | 50 $\rightarrow$ 50 | 100 $\rightarrow$ 100 | `action` (`kind: 'starter_declined'`) |
| **D1: Afternoon** | **Choice B: Buy Starter ($0.99)** | $10.00 $\rightarrow$ **$9.01** | 50 $\rightarrow$ **290** | 100 $\rightarrow$ 100 | `purchase` (`kind: 'starter'`, price: 0.99, bundleGems: 240, gemsAfter: 290) |
| **D1: Evening** | Day 1 Wage arrives (+$10.00) | Choice A: $10 $\rightarrow$ **$20.00**<br>Choice B: $9.01 $\rightarrow$ **$19.01** | Unchanged | 100 $\rightarrow$ 100 | `income` (`kind: 'wage'`, amount: 10.00) |
| **D2: Morning** | Food Bill 2 arrives ($5.00) | Choice A: $20 $\rightarrow$ **$15.00**<br>Choice B: $19.01 $\rightarrow$ **$14.01** | Unchanged | 100 $\rightarrow$ 100 | `expense_due` (`kind: 'food'`, $5), `expense_paid` ($5) |
| **D2: Afternoon** | Rent Bill arrives ($15.00) | Choice A: $15 $\rightarrow$ **$0.00** (Paid in full!)<br>Choice B: $14.01 $\rightarrow$ **SHORT by $0.99!** | Unchanged | 100 $\rightarrow$ 100 | `expense_due` (`kind: 'rent'`, amount: 15.00, cashBefore: 14.01) |

#### Branch Progression from Day 2 Rent:

- **Trace 1: Frugal / Solvent (Choice A):**
  - Rent ($15.00) is paid in full from the $15.00 balance $\rightarrow$ Cash = $0.00.
  - Emits: `expense_paid` (`kind: 'rent'`, amount: 15.00, cashAfter: 0.00).
  - Evening: Day 2 Wage arrives (+$10.00) $\rightarrow$ Cash = $10.00.
  - Day 3 Morning: Food Bill 3 ($5.00) arrives and is paid in cash $\rightarrow$ Cash = **$5.00**.
  - Day 3 Midday: Race 2 (Championship Finale against Rival Whale) concludes.
  - Day 3 Afternoon: Designed slice ending reached:
    - Emits: `terminal` (`route: 'run_complete'`).
    - Receipt View mounts $\rightarrow$ Emits: `receipt_shown` (`route: 'run_complete'`).
    - Receipt confirms: **4 bills paid in cash totaling $30.00** (three $5 food + one $15 rent), 0 unpaid bills, 0 debt, ending cash $5.00, Anchoring cue shown but unpurchased, no retention cue shown.

- **Trace 2: Purchase with Escalation Recovery (Choice B $\rightarrow$ Extra Shift):**
  - Rent ($15.00) arrives when Cash is $14.01. Short by $0.99!
  - Escalation Step 1 (`skip_lunch`) is ineligible (bill is rent).
  - Escalation Step 2 (`extra_shift`) is offered:
    - Emits: `escalation_offered` (`step: 'extra_shift'`, billKind: 'rent', cashBefore: 14.01, healthBefore: 100).
    - Player accepts extra shift:
      - Cash: $14.01 + $10.00 = **$24.01**.
      - Health: 100 - 15 = **85 HP**.
      - Emits: `action` (`kind: 'escalation_accepted'`, step: 'extra_shift').
      - Emits: `escalation_result` (`step: 'extra_shift'`, effects: { cashGained: 10, healthLost: 15 }, cashAfter: 24.01, healthAfter: 85).
  - Rent is now paid:
    - Cash: $24.01 - $15.00 = **$9.01**.
    - Emits: `expense_paid` (`kind: 'rent'`, amount: 15.00, cashAfter: 9.01).
  - Evening: Day 2 Wage arrives (+$10.00) $\rightarrow$ Cash = $19.01.
  - Day 3 Morning: Food Bill 3 ($5.00) arrives and is paid in cash $\rightarrow$ Cash = **$14.01**.
  - Day 3 Midday: Race 2 concludes.
  - Day 3 Afternoon: Designed slice ending reached:
    - Emits: `terminal` (`route: 'run_complete'`).
    - Receipt View mounts $\rightarrow$ Emits: `receipt_shown` (`route: 'run_complete'`).
    - Receipt confirms: Starter pack purchased for $0.99, 1 emergency escalation step (`extra_shift`), **4 bills paid in cash totaling $30.00**, ending cash $14.01, final health 85 HP.

- **Trace 3: Purchase with Default / Terminal (Choice B $\rightarrow$ Full Escalation Exhaustion):**
  - Rent ($15.00) arrives when Cash is $14.01. Short by $0.99!
  - Escalation progression:
    - Step 2 (`extra_shift`) offered $\rightarrow$ Player clicks **[Decline]** (`action: 'escalation_declined'`).
    - Step 3 (`sell_couch`) offered $\rightarrow$ Player clicks **[Decline]** (`action: 'escalation_declined'`).
    - Step 3 (`sell_tv`) offered $\rightarrow$ Player clicks **[Decline]** (`action: 'escalation_declined'`).
    - Step 4 (`credit_card`) offered $\rightarrow$ Player clicks **[Decline]** (`action: 'escalation_declined'`).
  - Terminal predicate met: All available escalation options declined; Rent bill remains unpaid.
  - Run ends immediately:
    - Emits: `terminal` (`route: 'running_on_empty'`).
    - Receipt View mounts $\rightarrow$ Emits: `receipt_shown` (`route: 'running_on_empty'`).
  - Receipt confirms: Unpaid rent bill ($15.00 due with $14.01 on hand), 2 food bills paid in cash ($10.00), starter pack purchased for $0.99, terminal route `running_on_empty`.

- **Trace 4: Uninstall & Retention Trap (Available at any juncture):**
  - Player clicks **[Uninstall]** at any point.
  - Emits: `action` (`kind: 'uninstall_chosen'`).
  - Emits: `retention_modal_shown` (`technique: 'exit_friction'`, gemsOffered: 80, stayLabel: 'play out the trap').
  - **Sub-branch 4A (Leave):** Player clicks **[Leave Anyway]**:
    - Emits: `action` (`kind: 'leave_immediately'`).
    - Emits: `terminal` (`route: 'uninstall'`).
    - Receipt View mounts $\rightarrow$ Emits: `receipt_shown` (`route: 'uninstall'`).
    - Receipt prints immediately with Exit Friction finding (`Chose to leave immediately`).
  - **Sub-branch 4B (Stay):** Player clicks **[Play Out The Trap]**:
    - Emits: `action` (`kind: 'play_out_the_trap'`).
    - Gems credited: +80 gems.
    - Emits: `reward` (`kind: 'retention_gems'`, gems: 80, gemsAfter: currentGems + 80).
    - Play resumes. (If player later uninstalls, the modal re-opens but does not grant repeat gems; logs repeat attempt honestly).

---

## 3. Probability Rules, Opening Distribution, and Roster Mapping

### 3.1 Delineation of Inputs vs. Tuning
To prevent treating exploratory guesses as rigid mandates:
- **Provisional Founding Tuning Inputs (from `docs/founding/design.md` §Tuning):**
  - Single pull: 160 gems; Ten-pull: 1,600 gems.
  - Base rarities: Common 80%, Rare 18%, Legendary 2%.
  - Soft pity start: draw 35; Hard guarantee: draw 50.
  - These values are provisional simulation inputs, not final game balance.
- **Fixed Hard Constraints & Owner Decisions:**
  - 80-gem retention offer with copy `"play out the trap"` (O6, Hard Constraint #5).
  - $0.99 starter pack with `"400% value"` anchor label (O11).
  - Three Receipt registers (*We displayed*, *You did*, *Did this affect you?*) (O1).
  - Append-only event log with no network calls (Hard Constraint #2).

### 3.2 Exact Conditional Pity Formula
The inherited linear pity model from `sim/model.mjs` lines 95–119 is specified as follows:
Let $\text{pityCount}$ be the number of draws already made in the current pity window (so this draw is draw $n = \text{pityCount} + 1$).
- If $n < \text{softPityStart}$ (i.e. $n < 35$):
  $$P(\text{legendary}) = \text{base} = 0.02$$
- If $\text{softPityStart} \le n < \text{hardPity}$ (i.e. $35 \le n < 50$):
  $$\text{span} = \text{hardPity} - \text{softPityStart} + 1 = 50 - 35 + 1 = 16$$
  $$\text{progress} = \frac{n - \text{softPityStart} + 1}{\text{span}} = \frac{n - 34}{16}$$
  $$P(\text{legendary}) = 0.02 + 0.98 \times \frac{n - 34}{16}$$
  - **Draw 35 ($n = 35$):** $\text{progress} = 1/16 = 0.0625 \implies P(\text{legendary}) = 0.02 + 0.98(0.0625) = \mathbf{0.08125}$.
  - **Draw 49 ($n = 49$):** $\text{progress} = 15/16 = 0.9375 \implies P(\text{legendary}) = 0.02 + 0.98(0.9375) = \mathbf{0.93875}$.
- If $n \ge \text{hardPity}$ (i.e. $n \ge 50$):
  $$P(\text{legendary}) = 1.0$$
- **Non-Legendary Split:**
  $$\text{rareShare} = \frac{0.18}{0.18 + 0.80} = 0.183673...$$
  $$P(\text{rare}) = (1 - P(\text{legendary})) \times \text{rareShare}$$
  $$P(\text{common}) = (1 - P(\text{legendary})) \times (1 - \text{rareShare})$$
- **Banner Carry Policy:** `pityCarry: 'carry'` is exercised for the slice.

### 3.3 Opening Ten-Pull and Guaranteed Tutorial Win
Under independent base draws (Common 0.80, Rare 0.18, Legendary 0.02):
- $P(\text{all Common}) = 0.80^{10} \approx 10.737\%$
- $P(\text{zero Rare}) = 0.82^{10} \approx 13.745\%$ (contains ~3.008% chance of Legendary with 0 Rare)
- $P(\ge 1\text{ Rare}) = 1 - 0.82^{10} \approx \mathbf{86.255\%}$

**Recommended Opening Implementation (P3-DEC-2):**
To preserve authentic PRNG behavior and truthful odds reporting without artificial rigging:
1. The opening 10-pull executes **10 genuine seeded PRNG draws** with `preDrawOdds()` and `openingAdvancesPity: false`. Exact pre-draw odds are logged per draw.
2. **Fixed Tutorial Race 1 Opponents:** In Race 1, the AI opponents are assigned a fixed base speed of **8.5** with $\text{noise} = 0.05$ ($\implies \text{opponent performance} \in [8.07, 8.92]$).
3. **Guaranteed Win Guarantee:**
   - The lowest possible player duck is Common (base speed **10.0**).
   - Under the recommended Safe Pace stance ($\pm 5\%$), Common duck performance is strictly $\ge \mathbf{9.50}$.
   - Because $9.50 > 8.92$, **the player is mathematically guaranteed to win 1st place in Race 1 under ALL possible draw distributions (Common, Rare, or Legendary) against a fixed, uncalibrated field.**
   - No silent per-roll field calibration is used.

### 3.4 Starter Pack Contents (Gems-Only Recommended)
In `sim/model.mjs` line 43, the starter pack is defined as:
`starter: { gems: 240, price: 0.99, anchorLabel: '400% value' }`.
- **Implementer Recommendation (P3-DEC-5):** Keep the starter pack strictly **gems-only** ($0.99 for 240 gems labeled `"400% value"`).
- This avoids injecting unvetted duck identities into the early economy and matches the tested model default.

### 3.5 Finite Roster and Duplicate Conversion
- Banner 1 defines a finite pool of 6 collectible identities:
  - Common (3): `duck-0`, `duck-1`, `duck-3` (Base speed: 10.0)
  - Rare (2): `duck-2`, `duck-4` (Base speed: 14.0)
  - Legendary (1): `duck-5` (Base speed: 20.0)
- **Commit-Time Duplicate Conversion:**
  - When a draw commits an identity already in `state.owned`:
    - `duplicate: true` is flagged in the draw payload.
    - Duplicate converts to Down currency (`downGained: 1` for Common, `5` for Rare, `20` for Legendary).
    - It is **not** added as an additional racing slot. Only unique identities appear in the race selection roster.

### 3.6 Receipt Technique Provenance
- `currency_obfuscation`: Emitted on the Receipt **only if** the Gem Shop view is displayed, logging `cue_shown` with `{ technique: 'currency_obfuscation', bundles: [...], pullCost: 160 }`. Accepting retention gems alone does not fire this finding.
- `exit_friction`: Appears only if `retention_modal_shown` fires.
- `anchoring`: Appears only if `offer_shown` fires with `technique: 'anchoring'`.

---

## 4. Single Recommended Pre-Race Choice: Two-Stance Tactical Comparison

### 4.1 Recommendation: A Two-Stance Tactical Choice (P3-DEC-3)
To provide a genuine, non-dominated pre-race choice without inventing unapproved digital duck fatigue stats or trait catalogs, the implementer recommends a **Two-Stance Tactical Choice** selected before each race:
- **Stance 1: Safe Pace (Steady/Low Variance)**
- **Stance 2: Sprint Push (Aggressive/High Variance)**

### 4.2 Mathematical Model and Non-Dominated Demonstration
Let $S$ be the base speed of the player's selected duck (Common = 10.0, Rare = 14.0).
- **Safe Pace:** Target speed $S$; $\text{noise} = 0.05$ ($\pm 5\%$).
  $$\text{perf}_{\text{safe}} = S \times (1 + (2U - 1) \times 0.05) \in [0.95 S, 1.05 S]$$
- **Sprint Push:** Target speed $1.10 S$ (+10% peak boost); $\text{noise} = 0.20$ ($\pm 20\%$).
  $$\text{perf}_{\text{sprint}} = (1.10 S) \times (1 + (2U - 1) \times 0.20) \in [0.88 S, 1.32 S]$$

#### Comparison Under Two Concrete Visible Conditions:

- **Condition 1: Facing a Weaker Field (Visible Opponent Speed: 9.0 $\pm 5\% \implies [8.55, 9.45]$)**
  - Player enters Common duck ($S = 10.0$).
  - *If Safe Pace:* $\text{perf} \in [9.50, 10.50]$.
    - Minimum Safe performance ($9.50$) > Maximum Opponent performance ($9.45$).
    - **Win Probability = 100%.** Zero risk.
  - *If Sprint Push:* $\text{perf} \in [8.80, 13.20]$.
    - Performance can drop down to $8.80$, below the opponent's peak of $9.45$.
    - **Win Probability $\approx 85\%$.** Introduces a 15% blunder risk.
  - **Verdict under Condition 1:** **Safe Pace is strictly optimal.** Choosing Sprint Push is an unforced blunder.

- **Condition 2: Facing a Faster Rival Field (Visible Opponent Speed: 11.2 $\pm 5\% \implies [10.64, 11.76]$)**
  - Player enters Common duck ($S = 10.0$).
  - *If Safe Pace:* $\text{perf} \in [9.50, 10.50]$.
    - Maximum Safe performance ($10.50$) < Minimum Opponent performance ($10.64$).
    - **Win Probability = 0%.** Guaranteed loss.
  - *If Sprint Push:* $\text{perf} \in [8.80, 13.20]$.
    - Performance can reach up to $13.20$, well above the opponent's peak of $11.76$.
    - **Win Probability $\approx 38\%$.**
  - **Verdict under Condition 2:** **Sprint Push is strictly optimal.** It converts a guaranteed defeat into a viable 38% chance at victory.

**Conclusion:** Neither stance is globally dominated. The correct choice depends entirely on scouting the visible opponent pace relative to your duck's base speed.

---

## 5. Physical / Digital Boundary Reconciliation and Empirical Recheck

### 5.1 Clear Boundary Separation
- **The Physical Metagame Prop:** An inanimate rubber duck sitting on the character's apartment desk. It motivates the story. It is never an entrant in pond races, has no digital stats, and cannot be pulled from the gacha.
- **The Digital Collectibles:** Virtual game assets inside the fictional app *Quackpot*. They race in the pond and fill the Duck-Dex.
- **Pawn Offer Disconnection:** Pawning the physical duck affects character cash (+$5.00) and triggers the narrative "empty desk" scene. It **never** mutates `state.digitalRoster` or removes a digital duck.

### 5.2 Model Defect Correction and Actual Defaults
In `sim/model.mjs`:
- `ownDuckSpeed` was set to **8** (not 10).
- `tierSpeed` defaults were: Common = **10**, Rare = **14**, Legendary = **20**.
- In `raceDucks()`, `own-duck` (speed 8) was injected into the player's racing roster and removed when `ownDuckSold` became true.
- Removing `own-duck` leaves the racing roster composed exclusively of digital ducks drawn from the gacha.

### 5.3 Proposed Empirical Paired Recheck
Rather than presupposing a zero diff across all policies, a targeted recheck script (`sim/recheck-own-duck-boundary.mjs`) will be executed during implementation:
- It will execute 100 seeds across scenarios for multiple policies (`best`, `random`, `alternate`) comparing outcomes with versus without the speed-8 `own-duck`.
- Observed differences will be reported directly in the implementation progress report to establish exact empirical bounds.

---

## 6. Save, Event, and Receipt API Mapping

### 6.1 Exact Event Schema (Matching `sim/event-log.mjs`)
Every logged event adheres strictly to the existing shape:
```javascript
{
  seq: 0,                           // 0-indexed integer
  type: "offer_shown",              // Event type string
  clock: { day: 1, label: "day 1 afternoon" },
  payload: { ... },                 // Event data
  chain: "a1b2c3d4"                 // FNV-1a hash over (prevChain|seq|type|clock|payload)
}
```

### 6.2 Event Types Consumed by `sim/receipt.mjs`

| Event Type | Required Payload Fields | Consumed By Receipt Register / Section |
|---|---|---|
| `cue_shown` | `{ technique: 'currency_obfuscation', bundles: [...], pullCost: 160 }` | Register 1: *We displayed* (Currency obfuscation) |
| `cue_shown` | `{ technique: 'sunk_cost_pity', counter: X, hardPity: 50, softPityStart: 35 }` | Register 1: *We displayed* (Sunk cost pity) |
| `offer_shown` | `{ technique: 'anchoring', gems: 240, price: 0.99, anchorLabel: '400% value' }` | Register 1: *We displayed* (Anchoring) |
| `retention_modal_shown` | `{ technique: 'exit_friction', gemsOffered: 80, stayLabel: 'play out the trap' }` | Register 1: *We displayed* (Exit friction) |
| `draw_committed` | `{ drawIndex, of: 10, pityBefore, drawNumberInWindow, odds: { common, rare, legendary }, rarity, identity, duplicate, downGained, advancesPity }` | Pull Ledger: pre-draw odds & committed outcome |
| `reveal_shown` | `{ commitSeq, rarity, identity, duplicate, downGained }` | Pull Ledger: displayed outcome verification |
| `purchase` | `{ kind: 'starter' \| 'bundle', price: 0.99, bundleGems: 240, gemsAfter: X }` | Register 2: *You did* (Recorded purchases) |
| `action` | `{ kind: 'leave_immediately' \| 'play_out_the_trap' \| 'escalation_accepted' \| 'escalation_declined' \| 'race_choice' }` | Register 2: *You did* (Player decisions) |
| `expense_due` | `{ kind: 'rent' \| 'food', amount: 15.00, cashBefore: X }` | Accounting Section: Expenses due |
| `expense_paid` | `{ kind: 'rent' \| 'food', amount: 15.00, cashAfter: X }` | Accounting Section: Expenses paid in cash |
| `escalation_result` | `{ step: 'extra_shift', effects: { cashGained: 10, healthLost: 15 }, cashAfter: X, healthAfter: Y }` | Accounting Section: Emergency escalations |
| `terminal` | `{ route: 'uninstall' \| 'running_on_empty' \| 'run_complete' }` | Ending Route derivation |
| `receipt_shown` | `{ route: 'uninstall' \| 'running_on_empty' \| 'run_complete' }` | `verifyCompleteness` tail verification |

### 6.3 Hydration API Specification for `EventLog`
To enable clean restoration of the frozen, hash-chained log without violating immutability, `EventLog.hydrate(entries)` will be added to `src/core/event-log.mjs`:
```javascript
export class EventLog {
  // ... existing private fields #entries, #head ...
  
  static hydrate(entries) {
    if (!Array.isArray(entries)) throw new TypeError('entries must be an array');
    if (!verifyChain(entries)) throw new Error('Cannot hydrate EventLog: invalid sequence or hash chain');
    const log = new EventLog();
    for (const e of entries) {
      log.#entries.push(deepFreeze({ ...e }));
    }
    log.#head = entries.length > 0 ? entries[entries.length - 1].chain : 'genesis';
    return log;
  }
}
```

### 6.4 PRNG Stream Serialization
In `sim/prng.mjs`, `rng.serialize()` returns a JSON string:
`{"v":1,"alg":"sfc32","key":"seed","s":[a,b,c,d]}`.
To prevent consumer stream cross-talk, the save envelope captures the serialized state of **all four active streams**:
```javascript
prngStreams: {
  root: rng.serialize(),
  draw: rngDraw.serialize(),
  race: rngRace.serialize(),
  event: rngEvent.serialize()
}
```
Restoring calls `restoreRng(prngStreams[name])` for each stream, ensuring exact deterministic continuation.

### 6.5 Commit-Before-Reveal Inventory & Duplicate Semantics
When a ten-pull is committed (`draw_committed` x10):
- All 10 draws are determined in order.
- Duplicate classification and Down conversions are evaluated sequentially against the expanding `owned` set at commit time.
- **Committed Ownership:** The ducks are added to `state.owned` (or Down credited) at commit time and queued into `pendingReveals = [{ drawIndex, identity, rarity, duplicate, downGained, revealed: false }]`.
- **Reload Integrity:** Reloading or uninstalling mid-reveal does **not** reroll draws, change duplicate classification, or re-award Down currency.
- **Receipt Provenance:** Unrevealed draws remain in the pull ledger (`revealed: false`) and are strictly omitted from Register 1 (*We displayed*).

---

## 7. Atomic Checkpoint Boundaries, Receipt Presentation, and Resiliency

### 7.1 Commit vs. Reveal Checkpoint Boundaries
Gacha draws execute under two distinct checkpoint boundaries:
1. **Draw Commit Checkpoint:**
   - Player clicks [Pull].
   - All 10 `draw_committed` events are appended to the event log.
   - PRNG advances; state updates; unrevealed draws enter `pendingReveals`.
   - **Storage checkpoint occurs immediately before any card is revealed.**
2. **Draw Reveal Checkpoint:**
   - As each duck card is flipped on screen, `reveal_shown` is appended to the event log.
   - Duck is marked `revealed: true` in `pendingReveals`.
   - **Storage checkpoint occurs after each reveal.**
3. **Mid-Reveal Resume:**
   - If a reload occurs while `pendingReveals` has unrevealed draws:
     - On resume, the game detects pending reveals.
     - The game presents: *"You have unrevealed ducks waiting! [Open Cards]"*.
     - If the player chooses [Uninstall] before opening, the Receipt reflects S4 provenance: the draw is in the internal ledger as committed, but absent from Register 1 (*We displayed*).

### 7.2 Receipt Presentation as the True Logging Boundary
`receipt_shown` is strictly an event of **actual visual presentation in the DOM**, not a termination trigger:
1. When a run ends, `terminal` is appended: `{ type: 'terminal', payload: { route } }`.
   - `state.phase` becomes `'terminal'`.
   - Storage checkpoint occurs.
2. The UI renders the Receipt view.
3. **Only upon actual mounting and presentation of the Receipt in the DOM**, `receipt_shown` is appended: `{ type: 'receipt_shown', payload: { route } }`.
   - `state.phase` becomes `'receipt_presented'`.
   - Storage checkpoint occurs, creating the matching tail pair required by `verifyCompleteness()`.
4. **Resuming Between Steps:**
   - If a crash/reload occurs after `terminal` but before `receipt_shown`:
     - On resume, the game detects `phase === 'terminal'`.
     - It immediately mounts the Receipt view.
     - Upon mounting, `receipt_shown` is appended and persisted.
5. **Idempotent Reload After Completion:**
   - If `verifyCompleteness(entries)` is already true, subsequent reloads display the Receipt in read-only mode without appending duplicate `receipt_shown` events.

### 7.3 Storage Architecture and Failure Handling
- **Storage Choice:** `localStorage` wrapped in an envelope adapter (`src/core/storage.mjs`).
- **Complete Storage Versioned Envelope:**
  ```json
  {
    "schemaVersion": 1,
    "savedAt": 1792849200000,
    "autosaveEnabled": true,
    "state": {
      "day": 2,
      "clock": { "day": 2, "label": "day 2 morning" },
      "phase": "playing",
      "cash": 14.01,
      "gems": 290,
      "health": 100,
      "debt": 0,
      "owned": ["duck-0", "duck-1"],
      "lastRacedId": "duck-1",
      "pityCount": 0,
      "pendingReveals": []
    },
    "prngStreams": {
      "root": "{\"v\":1,\"alg\":\"sfc32\",\"key\":\"seed\",\"s\":[1,2,3,4]}",
      "draw": "{\"v\":1,\"alg\":\"sfc32\",\"key\":\"seed/draw\",\"s\":[5,6,7,8]}",
      "race": "{\"v\":1,\"alg\":\"sfc32\",\"key\":\"seed/race\",\"s\":[9,10,11,12]}",
      "event": "{\"v\":1,\"alg\":\"sfc32\",\"key\":\"seed/event\",\"s\":[13,14,15,16]}"
    },
    "eventLog": [ ... ]
  }
  ```
- **Autosave vs. Explicit Save:**
  - Start Menu Checkbox: `[x] Enable Autosave (recommended)`. Default: `true`.
  - Explicit Save Button: Active in HUD during quiescent states; displays "Saved" toast.
- **Handling Write Failures with Older Snapshot Intact:**
  - If `localStorage.setItem()` fails (`QuotaExceededError` or `SecurityError`):
    - The existing snapshot in `localStorage` is **left untouched** (never deleted or overwritten).
    - An in-memory session object takes over for the current tab.
    - An observable banner informs the user:
      > *"Storage Warning: Browser storage quota exceeded or restricted. Your previous save remains stored, but new progress this session is held in temporary memory and will be lost on reload."*
- **Handling Stale/Corrupt Data:**
  - Incompatible schema (`schemaVersion !== 1`) or broken hash chain (`verifyChain() === false`) prompts: *"Saved game data incompatible or corrupt. [Start Fresh Run]"*, preventing runtime exceptions.
- **Fresh-Run Seed:** Starting a fresh run generates a new cryptographically random seed string and confirms before overwriting an existing save.

---

## 8. Files, Architecture, and Verification Plan

### 8.1 Module Reorganization
Pure modules will be relocated as ratified in `docs/repo-structure.md`:
- Move `sim/prng.mjs` $\rightarrow$ `src/core/prng.mjs`
- Move `sim/event-log.mjs` $\rightarrow$ `src/core/event-log.mjs`
- Move `sim/receipt.mjs` $\rightarrow$ `src/core/receipt.mjs`
- Update `sim/model.mjs`, `sim/run-experiments.mjs`, and tests to import from `../src/core/...`.
- Add `EventLog.hydrate()` to `src/core/event-log.mjs`.

### 8.2 Implementation Files in `src/`
- `src/core/storage.mjs`: LocalStorage envelope adapter with in-memory fallback.
- `src/core/game-engine.mjs`: State machine managing transitions, expenses, escalations, races, and logging.
- `src/ui/`: DOM components mounted into `#app`:
  - `hud.js`: Header displaying Cash, Gems, Health, Day, Save button, and persistent Uninstall button.
  - `desk-view.js`: Apartment desk with static physical duck.
  - `gacha-view.js`: Promotional 10-pull and single-pull theater with reveal boundaries.
  - `race-view.js`: Pre-race tactical stance choice, lane animation, and result display.
  - `modal-view.js`: Starter pack offer, retention modal, and escalation ladder.
  - `receipt-view.js`: Printed-slip Receipt component rendering the three registers.
- `src/main.js`: Main controller mounting UI to DOM.

### 8.3 Bounded Verification Strategy
1. **Node Unit & Integration Tests (`npm test`):**
   - Verify all 65 existing tests pass after `src/core/` module relocation.
   - Run bounded paired recheck (`sim/recheck-own-duck-boundary.mjs`) across 100 seeds for multiple policies, reporting observed differences empirically.
   - Add targeted test suites:
     - `src/core/storage.test.mjs`: Test save/load, `EventLog.hydrate()`, all 4 PRNG stream restorations, write failure handling, and memory fallback.
     - `src/core/game-engine.test.mjs`: Test Traces 1–4, commit/reveal reload boundaries, tactical stances under Conditions 1 and 2, and Receipt honesty.
2. **Automated Headless Chrome Smoke (`npm run test:smoke`):**
   - Extend `scripts/dev/smoke-browser.mjs` to execute automated CDP journeys under `/Quackpot/`:
     - Verify zero console errors, zero runtime exceptions, zero network calls.
     - Journey 1: Boot $\rightarrow$ Uninstall $\rightarrow$ Retention modal $\rightarrow$ Leave $\rightarrow$ Verify Receipt mounted.
     - Journey 2: Boot $\rightarrow$ Free pull $\rightarrow$ Race 1 $\rightarrow$ Buy Starter $\rightarrow$ Rent due $\rightarrow$ Extra shift $\rightarrow$ Finish Day 3 $\rightarrow$ Verify Receipt.
     - Journey 3: Mid-reveal reload $\rightarrow$ Resume $\rightarrow$ Complete run.

---

## 9. Consolidated Owner Decisions Requested

Before implementation code is authored, the implementer requests owner confirmation on the following five decisions:

| Decision ID | Item | Implementer Recommendation | Alternatives for Owner Consideration |
|---|---|---|---|
| **P3-DEC-1** | Demonstration Duration & Economy | **Adopt the bounded 3-day mechanism demonstration** ($15 starting cash, $10/day wage, $5/day food, $15 rent on Day 2, 4 bills totaling $30). | Require a longer 5-day or 7-day loop with multiple rent cycles. |
| **P3-DEC-2** | Promotional 10-Pull Model | **Genuine Seeded PRNG Draws (`openingAdvancesPity: false`)** with Race 1 tutorial field fixed at base speed 8.5, guaranteeing the canonical opening win on all draw outcomes without dynamic rigging. | Scripted promotional tutorial grant (logged honestly as a grant, not rolled odds). |
| **P3-DEC-3** | Pre-Race Choice Mechanic | **Two-Stance Tactical Choice (Safe Pace vs. Sprint Push)**, proven mathematically non-dominated under weaker vs. faster field scouting. | Digital duck fatigue or trait catalog. |
| **P3-DEC-4** | Local Storage Technology | **`localStorage` with versioned envelope schema, all 4 PRNG streams, and explicit in-memory fallback notification**. | `IndexedDB` (asynchronous, deferred for teacher analyzer). |
| **P3-DEC-5** | Starter Pack Contents | **Gems-only: $0.99 for 240 gems labeled `"400% value"`**, matching model default. | Add a guaranteed Rare duck identity. |

---

**Stop Condition:** The implementer will not touch implementation code until the owner and orchestrator review this revised preflight proposal and resolve the five decisions.
