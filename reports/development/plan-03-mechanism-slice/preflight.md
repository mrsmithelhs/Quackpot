# Plan 03 Preflight Proposal: Core Mechanism and Truthful Receipt Slice (Revision 1)

**Date:** 2026-10-24  
**Author:** Implementer (Plan 03 thread)  
**Packet:** [`docs/development/plan-03-mechanism-slice.md`](file:///c:/AI/Quackpot/docs/development/plan-03-mechanism-slice.md)  
**Reference brief:** [`reports/development/plan-03-mechanism-slice/preflight-brief.md`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/preflight-brief.md)  
**Review addressed:** [`reports/development/plan-03-mechanism-slice/preflight-review-01.md`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/preflight-review-01.md)  
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
- **Daily Wage:** +$10.00 earned at the end of each day
- **Daily Food Expense:** $5.00 due each morning
- **Periodic Rent Expense:** $15.00 due on Day 2 afternoon
- **Pond Race 1 Purse:** 1st place: 50 gems
- **Starter Pack Offer:** $0.99 for 240 gems labeled `"400% value"`
- **Gem Bundle Shop:** Displays odd bundle sizes (e.g. 60 gems for $0.99, 330 gems for $4.99) against a 160-gem pull cost
- **Retention Offer:** Exactly 80 gems and copy `"play out the trap"`
- **Escalation Ladder (Canonical Steps 1–4):**
  1. `skip_lunch`: Available only when food bill is due and Health > 20. Waives food bill (`billWaived: 5`), cash unchanged ($0), Health -15 HP.
  2. `extra_shift`: Available when any bill cannot be paid and Health > 20. Grants +$10.00 cash, Health -15 HP.
  3. `sell_couch`: One-time sale. Grants +$10.00 cash, visibly removes couch.
  4. `sell_tv`: One-time sale. Grants +$15.00 cash, visibly removes TV.
  5. `credit_card`: Available if debt < $50.00 credit limit. Draws +$15.00 cash, debt +$15.00.

### 2.3 Explicit State and Balance Progression Table

The table below traces the exact numerical state (Cash, Gems, Health, Debt, and Event Logged) across the four canonical branches:

| Day & Step | Event / Action | Cash Before $\rightarrow$ After | Gems Before $\rightarrow$ After | Health Before $\rightarrow$ After | Log Event Emitted & Fields |
|---|---|---|---|---|---|
| **D1: Morning** | Run starts; meet physical duck; free 10-pull | $15.00 $\rightarrow$ $15.00 | 0 $\rightarrow$ 0 | 100 $\rightarrow$ 100 | `draw_committed` (x10), `reveal_shown` (x10) |
| **D1: Morning** | Food Bill 1 arrives | $15.00 $\rightarrow$ $10.00 | 0 $\rightarrow$ 0 | 100 $\rightarrow$ 100 | `expense_due` (`kind: 'food'`, $5), `expense_paid` ($5, cashAfter: 10) |
| **D1: Midday** | Race 1: Roster selection; win 1st place | $10.00 $\rightarrow$ $10.00 | 0 $\rightarrow$ 50 | 100 $\rightarrow$ 100 | `race_result` (`place: 1`), `reward` (`gems: 50`) |
| **D1: Afternoon** | Starter Offer displayed | $10.00 $\rightarrow$ $10.00 | 50 $\rightarrow$ 50 | 100 $\rightarrow$ 100 | `offer_shown` (`technique: 'anchoring'`, gems: 240, price: 0.99, anchorLabel: '400% value') |
| **D1: Afternoon** | **Choice A: Decline Starter** | $10.00 $\rightarrow$ $10.00 | 50 $\rightarrow$ 50 | 100 $\rightarrow$ 100 | `action` (`kind: 'starter_declined'`) |
| **D1: Afternoon** | **Choice B: Buy Starter ($0.99)** | $10.00 $\rightarrow$ **$9.01** | 50 $\rightarrow$ **290** | 100 $\rightarrow$ 100 | `purchase` (`kind: 'starter'`, price: 0.99, bundleGems: 240, gemsAfter: 290) |
| **D1: Evening** | Day 1 Wage arrives | Choice A: $10 $\rightarrow$ **$20.00**<br>Choice B: $9.01 $\rightarrow$ **$19.01** | Unchanged | 100 $\rightarrow$ 100 | `income` (`kind: 'wage'`, amount: 10.00) |
| **D2: Morning** | Food Bill 2 arrives ($5.00) | Choice A: $20 $\rightarrow$ **$15.00**<br>Choice B: $19.01 $\rightarrow$ **$14.01** | Unchanged | 100 $\rightarrow$ 100 | `expense_due` (`kind: 'food'`, $5), `expense_paid` ($5) |
| **D2: Afternoon** | Rent Bill arrives ($15.00) | Choice A: $15 $\rightarrow$ **$0.00** (Paid in full!)<br>Choice B: $14.01 $\rightarrow$ **SHORT by $0.99!** | Unchanged | 100 $\rightarrow$ 100 | `expense_due` (`kind: 'rent'`, amount: 15.00, cashBefore: 14.01) |

#### Branch Progression from Day 2 Rent:

- **Trace 1: Frugal / Solvent (Choice A):**
  - Rent ($15.00) is paid in full from the $15.00 balance $\rightarrow$ Cash = $0.00.
  - Emits: `expense_paid` (`kind: 'rent'`, amount: 15.00, cashAfter: 0.00).
  - Evening: Day 2 Wage arrives (+$10.00) $\rightarrow$ Cash = $10.00.
  - Day 3: Morning Food ($5.00) paid $\rightarrow$ Cash = $5.00.
  - Day 3 Midday: Race 2 / Race 3 finishes $\rightarrow$ Designed slice ending reached:
    - Emits: `terminal` (`route: 'run_complete'`).
    - Emits: `receipt_shown` (`route: 'run_complete'`).
    - Receipt confirms: 3 bills paid in cash ($25.00 total), 0 unpaid bills, 0 debt, Anchoring cue shown but unpurchased, no retention cue shown.

- **Trace 2: Purchase with Escalation Recovery (Choice B $\rightarrow$ Extra Shift):**
  - Rent ($15.00) arrives when Cash is $14.01. Rent cannot be paid!
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
  - Day 3: Survives to designed finish (`run_complete`).
  - Receipt confirms: Starter pack purchased for $0.99, 1 emergency escalation step (`extra_shift`), 3 bills paid in cash, final health 85 HP.

- **Trace 3: Purchase with Default / Terminal (Choice B $\rightarrow$ Decline Escalation):**
  - Rent ($15.00) arrives when Cash is $14.01.
  - Escalation Step 2 (`extra_shift`) is offered.
  - Player chooses **[Refuse Shift / Can't Pay]**:
    - Emits: `action` (`kind: 'escalation_declined'`, step: 'extra_shift').
    - Escalation exhausted without funding rent. Rent remains unpaid.
    - Emits: `terminal` (`route: 'running_on_empty'`).
    - Emits: `receipt_shown` (`route: 'running_on_empty'`).
  - Receipt confirms: Unpaid rent bill ($15.00 due with $14.01 on hand), starter pack purchased for $0.99, terminal route `running_on_empty`.

- **Trace 4: Uninstall & Retention Trap (Available at any juncture):**
  - Player clicks **[Uninstall]** at any point.
  - Emits: `action` (`kind: 'uninstall_chosen'`).
  - Emits: `retention_modal_shown` (`technique: 'exit_friction'`, gemsOffered: 80, stayLabel: 'play out the trap').
  - **Sub-branch 4A (Leave):** Player clicks **[Leave Anyway]**:
    - Emits: `action` (`kind: 'leave_immediately'`).
    - Emits: `terminal` (`route: 'uninstall'`).
    - Emits: `receipt_shown` (`route: 'uninstall'`).
    - Receipt prints immediately with Exit Friction finding (`Chose to leave immediately`).
  - **Sub-branch 4B (Stay):** Player clicks **[Play Out The Trap]**:
    - Emits: `action` (`kind: 'play_out_the_trap'`).
    - Gems credited: +80 gems.
    - Emits: `reward` (`kind: 'retention_gems'`, gems: 80, gemsAfter: currentGems + 80).
    - Play resumes. (If player later uninstalls, the modal re-opens but does not grant repeat gems; logs repeat attempt honestly).

---

## 3. Probability Rules, Probability Functions, and Roster Boundaries

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
  $$P(\text{legendary}) = \text{base} + (1 - \text{base}) \times \text{progress} = 0.02 + 0.98 \times \frac{n - 34}{16}$$
  - **Draw 35 ($n = 35$):** $\text{progress} = 1/16 = 0.0625 \implies P(\text{legendary}) = 0.02 + 0.98(0.0625) = \mathbf{0.08125}$.
  - **Draw 49 ($n = 49$):** $\text{progress} = 15/16 = 0.9375 \implies P(\text{legendary}) = 0.02 + 0.98(0.9375) = \mathbf{0.93875}$.
- If $n \ge \text{hardPity}$ (i.e. $n \ge 50$):
  $$P(\text{legendary}) = 1.0$$
- **Non-Legendary Split:**
  $$\text{rareShare} = \frac{0.18}{0.18 + 0.80} = 0.183673...$$
  $$P(\text{rare}) = (1 - P(\text{legendary})) \times \text{rareShare}$$
  $$P(\text{common}) = (1 - P(\text{legendary})) \times (1 - \text{rareShare})$$
- **Banner Carry Policy:** `pityCarry: 'carry'` is exercised for the slice.

### 3.3 Promotional Ten-Pull Specification
An unscripted 10-pull with base 18% rare odds has a $(1 - 0.18)^{10} \approx 13.7\%$ probability of producing zero Rare ducks, leaving the player with only Common ducks.
The implementer proposes two options for owner determination (**P3-DEC-2**):
- **Option A (Genuine Seeded Draws with Natural Roster Adaptation - RECOMMENDED):**
  Execute 10 genuine PRNG draws with `openingAdvancesPity: false`. Log exact unrounded `preDrawOdds` for each draw.
  - If a Rare is drawn (~86.3% probability), the player enters it in Race 1.
  - If only Commons are drawn (~13.7% probability), the player enters their best Common duck, and Race 1 field speeds are appropriately calibrated so the opening tutorial win is achievable under either outcome.
- **Option B (Scripted Promotional Tutorial Grant):**
  Award 1 fixed Rare + 9 Common identities as a scripted game event (`tutorial_grant`).
  - *Honesty Rule:* If scripted, it is logged as a direct tutorial grant, not as simulated odds draws, so the Receipt does not report synthetic odds for a predetermined outcome.

### 3.4 Starter Pack Roster Bonus
In `sim/model.mjs`, the starter pack provides $0.99 \rightarrow 240\text{ gems}$ with label `"400% value"`.
- Adding a guaranteed Rare duck ("Turbo Quacker") is an implementer proposal to heighten the temptation to spend.
- **Owner decision requested under P3-DEC-1:** Approve whether the $0.99 starter pack includes a Rare duck identity alongside 240 gems, or remains gems-only.

### 3.5 Finite Identities and Duplicate Conversion Integrity
To avoid inflating roster counts:
- The game maintains a finite set of unique collectible identities (e.g. 6 identities on Banner 1: `duck-0` through `duck-5`).
- When a draw rolls an identity already in `state.owned`:
  - `duplicate: true` is flagged.
  - The identity is **not** duplicated in `state.roster`.
  - Duplicate converts to Down currency (`downGained: 1` for Common, `5` for Rare).
  - The player's racing selection menu displays only unique owned identities.

### 3.6 Receipt Technique Provenance
- `currency_obfuscation`: Will appear on the Receipt **only if** the Gem Shop view is opened, emitting `cue_shown` with `{ technique: 'currency_obfuscation', bundles: [...], pullCost: 160 }`. Accepting retention gems alone does not fire this finding.
- `exit_friction`: Appears only if `retention_modal_shown` fires.
- `anchoring`: Appears only if `offer_shown` fires with `technique: 'anchoring'`.

---

## 4. Pre-Race Choice Analysis and Field Model

### 4.1 Retraction of Purely Arithmetic "Dominance Fix" Claim
The prior proposal claimed that a 30% duck fatigue penalty solved the dominated-choice finding of Plan 01. That claim is **retracted**:
- Swapping effective speed from Rare ($11.0 \times 0.70 = 7.70$) to Common ($10.00$) simply replaces one deterministic maximum with another. A policy that always picks $\max(\text{effective speed})$ remains trivial and dominated unless course conditions, uncertainty, or tactical risk/reward create genuine trade-offs.
- Furthermore, digital duck fatigue is an unapproved mechanic, whereas the owner's request in O4 was for proposals on how *the metagame character's fatigue* could obscure the player's UI choices.

### 4.2 Outcome Calculation and Noise Model
From `sim/model.mjs`, race performance is calculated as:
$$\text{perf} = \text{effectiveSpeed} \times \left(1 + (2U - 1) \times \text{noise}\right)$$
where $U \sim \text{Uniform}(0, 1)$ from `rngRace`, and $\text{noise} = 0.15$ (providing $\pm 15\%$ performance variation).
Opponent field performance is drawn similarly around `fieldBaseSpeed`:
$$\text{fieldPerf}_i = \text{fieldMid} \times \left(1 + (2U_1 - 1) \times \text{fieldSpread}\right) \times \left(1 + (2U_2 - 1) \times \text{noise}\right)$$
where $\text{fieldSpread} = 0.30$.

### 4.3 Proposed Pre-Race Choice Options for Owner Selection (P3-DEC-3)

The implementer presents two bounded, non-dominated mechanics for owner review:

- **Option A: Pre-Race Tactical Stance (No Duck Fatigue):**
  The player races their primary digital duck but selects one of three distinct tactical stances before the race:
  1. **Consistent Pace:** Noise reduced to $\pm 5\%$. Low variance, guarantees beating weaker opponents, but cannot upset a faster rival.
  2. **Aggressive Sprint:** Peak speed +15%, but noise widened to $\pm 25\%$ (risk of drift/spin-out). Creates a high-risk, high-reward choice when facing a faster field.
  3. **Drafting / Slipstream:** Gains +20% speed bonus if trailing behind a lane rival, but 0% bonus if in the lead.
  *Advantage:* Keeps digital ducks free of unapproved fatigue mechanics, requires no extra roster balancing, and provides a clear strategic decision without timing taps.

- **Option B: Track Condition / Course Affinity with Visible Scouting:**
  Each race announces a track condition (e.g. *Weedy Shallows* vs. *Deep Current*).
  - Ducks have traits (e.g. *Lightweight*, *Streamlined*).
  - Matching the track grants +20% speed.
  *Advantage:* Forces the player to select different ducks from their collection depending on the course, creating organic value for roster breadth.

---

## 5. Physical / Digital Boundary Reconciliation and Bounded Recheck

### 5.1 Clear Boundary Separation
- **The Physical Metagame Prop:** An inanimate rubber duck sitting on the character's apartment desk. motivate the story. It is never an entrant in pond races, has no digital stats, and cannot be pulled from the gacha.
- **The Digital Collectibles:** Virtual game assets inside the fictional app *Quackpot*. They race in the pond and fill the Duck-Dex.
- **Pawn Offer Disconnection:** Pawning the physical duck affects character cash (+$5.00) and triggers the narrative "empty desk" scene. It **never** mutates `state.digitalRoster` or removes a digital duck.

### 5.2 Model Defect Correction and Actual Defaults
In `sim/model.mjs`:
- `ownDuckSpeed` was set to **8** (not 10).
- `tierSpeed` defaults were: Common = **10**, Rare = **14**, Legendary = **20**.
- In `raceDucks()`, `own-duck` (speed 8) was injected into the player's racing roster and removed when `ownDuckSold` became true.
- Removing `own-duck` leaves the racing roster composed exclusively of digital ducks drawn from the gacha.

### 5.3 Bounded Paired Recheck Specification
To verify that removing the speed-8 `own-duck` racer introduces no distortion into the accepted Plan 01 evidence:
- **Hypothesis:** Because the opening free ten-pull awards digital ducks of speed $\ge 10$ (Common 10, Rare 14), any rational or `best` racing policy will never select the speed-8 `own-duck` once digital ducks exist.
- **Bounded Recheck Script:** A targeted script (`sim/recheck-own-duck-boundary.mjs`) will execute:
  1. Replay 100 seeds from Scenario S2 (`frugal` and `whale`) with `own-duck` present versus excluded.
  2. Measure race placements, gem income, and survival rates under the `best` policy.
  3. Confirm that for all runs where a digital duck is owned, the output is mathematically identical.
  4. Document the exact results in the implementation progress report.

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
| `action` | `{ kind: 'leave_immediately' \| 'play_out_the_trap' \| 'escalation_accepted' }` | Register 2: *You did* (Player decisions) |
| `expense_due` | `{ kind: 'rent' \| 'food', amount: 15.00, cashBefore: X }` | Accounting Section: Expenses due |
| `expense_paid` | `{ kind: 'rent' \| 'food', amount: 15.00, cashAfter: X }` | Accounting Section: Expenses paid in cash |
| `escalation_result` | `{ step: 'extra_shift', effects: { cashGained: 10, healthLost: 15 }, cashAfter: X, healthAfter: Y }` | Accounting Section: Emergency escalations |
| `terminal` | `{ route: 'uninstall' \| 'running_on_empty' \| 'run_complete' }` | Ending Route derivation |
| `receipt_shown` | `{ route: 'uninstall' \| 'running_on_empty' \| 'run_complete' }` | `verifyCompleteness` tail verification |

### 6.3 Hydration API Specification for `EventLog`
To enable clean restoration of the frozen, hash-chained log without violating immutability:
We will add `EventLog.hydrate(entries)` to `src/core/event-log.mjs`:
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
To prevent consumer stream cross-talk, the save envelope captures the serialized state of each active stream:
```javascript
prngStreams: {
  root: rng.serialize(),
  draw: rngDraw.serialize(),
  race: rngRace.serialize(),
  event: rngEvent.serialize()
}
```
Restoring calls `restoreRng(prngStreams[name])` for each stream, ensuring exact deterministic continuation.

---

## 7. Atomic Resume Boundaries and Storage Resiliency

### 7.1 Commit vs. Reveal Checkpoint Boundaries
Gacha draws have two distinct mutations:
1. **Draw Commit Checkpoint:**
   - Player clicks [Pull].
   - `draw_committed` is appended to the event log.
   - `rngDraw` advances; state pity counter advances; drawn ducks enter `pendingReveals` queue.
   - **Storage checkpoint occurs immediately.**
2. **Draw Reveal Checkpoint:**
   - As each duck card is flipped on screen, `reveal_shown` is appended to the event log.
   - Duck is moved from `pendingReveals` to `owned` (or converted to Down).
   - **Storage checkpoint occurs after each reveal.**
3. **Mid-Reveal Reload Behavior:**
   - If the player reloads or crashes while `pendingReveals` is non-empty:
     - On resume, the game detects committed but unrevealed draws.
     - The game presents a diegetic prompt: *"You have unrevealed ducks waiting! [Open Cards]"*.
     - If the player chooses [Uninstall] before opening, the Receipt correctly reflects S4 provenance: the draw is visible in the internal pull ledger as committed, but **strictly absent from Register 1 (*We displayed*)**.

### 7.2 Terminal / Receipt Tail Pair Persistence
`sim/event-log.mjs` `verifyCompleteness()` requires:
- A `terminal` entry immediately followed by `receipt_shown` with matching `route` as the final two entries in the log.
- **Atomic Handling:** When a run terminates, both `terminal` and `receipt_shown` are committed to the log sequentially, followed by a final save write. If a reload occurs while viewing the Receipt, the completed run is restored directly into the Receipt view with completeness intact.

### 7.3 Storage Architecture and Failure Handling
- **Storage Choice:** `localStorage` wrapped in an envelope adapter (`src/core/storage.mjs`).
- **Storage Versioned Envelope:**
  ```json
  {
    "schemaVersion": 1,
    "savedAt": 1792849200000,
    "autosaveEnabled": true,
    "state": {
      "day": 2,
      "clock": { "day": 2, "label": "day 2 morning" },
      "cash": 14.01,
      "gems": 290,
      "health": 100,
      "debt": 0,
      "owned": ["duck-0", "duck-1"],
      "lastRacedId": "duck-1",
      "pityCount": 0,
      "pendingReveals": []
    },
    "prngStreams": { "root": "...", "draw": "...", "race": "..." },
    "eventLog": [ ... ]
  }
  ```
- **Structural Integrity vs. Authentication:**
  - `verifyChain(savedLog)` validates sequence IDs and FNV-1a hash continuity as a structural corruption check. It is explicitly documented that FNV-1a is a corruption detector, not a cryptographic tamper barrier.
  - State coherence check: verifies that cash, gems, and roster in `state` match the event log projections.
- **Honest Failure Fallback:**
  - If `localStorage.setItem()` throws (`QuotaExceededError` or private browsing `SecurityError`), the storage adapter falls back to an in-memory session object.
  - The UI displays an explicit status notification:
    > *"Notice: Browser storage is disabled or full. Game progress will persist only while this browser tab stays open, and will be lost on reload or tab close."*

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
  - `race-view.js`: Pre-race choice interface, lane animation, and result display.
  - `modal-view.js`: Starter pack offer, retention modal, and escalation ladder.
  - `receipt-view.js`: Printed-slip Receipt component rendering the three registers.
- `src/main.js`: Main controller mounting UI to DOM.

### 8.3 Bounded Verification Strategy
1. **Node Unit & Integration Tests (`npm test`):**
   - Verify all 65 existing tests pass after `src/core/` module relocation.
   - Run bounded paired recheck (`sim/recheck-own-duck-boundary.mjs`) confirming zero deviation from removing speed-8 `own-duck`.
   - Add targeted test suites:
     - `src/core/storage.test.mjs`: Test save/load, `EventLog.hydrate()`, PRNG restoration, and memory fallback.
     - `src/core/game-engine.test.mjs`: Test Traces 1–4, commit/reveal reload boundaries, and Receipt honesty.
2. **Automated Headless Chrome Smoke (`npm run test:smoke`):**
   - Extend `scripts/dev/smoke-browser.mjs` to execute automated CDP journeys under `/Quackpot/`:
     - Verify zero console errors, zero runtime exceptions, zero network calls.
     - Journey 1: Boot $\rightarrow$ Uninstall $\rightarrow$ Retention modal $\rightarrow$ Leave $\rightarrow$ Verify Receipt mounted.
     - Journey 2: Boot $\rightarrow$ Free pull $\rightarrow$ Race 1 $\rightarrow$ Buy Starter $\rightarrow$ Rent due $\rightarrow$ Extra shift $\rightarrow$ Finish Day 3 $\rightarrow$ Verify Receipt.
     - Journey 3: Mid-reveal reload $\rightarrow$ Resume $\rightarrow$ Complete run.

---

## 9. Consolidated Owner Decisions Requested

Before implementation code is authored, the implementer requests owner confirmation on the following four decisions:

| Decision ID | Item | Implementer Recommendation | Alternatives for Owner Consideration |
|---|---|---|---|
| **P3-DEC-1** | Demonstration Duration & Economy | **Adopt the bounded 3-day mechanism demonstration** with starting cash $15, wage $10/day, food $5/day, rent $15 on Day 2, and starter pack at $0.99. | Require a longer 5-day or 7-day loop with multiple rent cycles. |
| **P3-DEC-2** | Promotional 10-Pull Model | **Option A: Genuine Seeded PRNG Draws with `openingAdvancesPity: false`**, with field speeds accommodating a Common-only opening roll. | Option B: Fixed scripted promotional tutorial grant (logged honestly as a grant, not rolled odds). |
| **P3-DEC-3** | Pre-Race Choice Mechanic | **Option A: Pre-Race Tactical Stance** (Consistent Pace vs. Aggressive Sprint vs. Drafting), keeping digital ducks free of unapproved fatigue mechanics. | Option B: Course Affinity / Track Conditions matching duck traits.<br>Option C: Roster rotation with consecutive-race penalty under visible opponent scouting. |
| **P3-DEC-4** | Local Storage Technology | **`localStorage` with versioned envelope schema and explicit in-memory fallback notification**. | `IndexedDB` (asynchronous, deferred for teacher analyzer). |

---

**Stop Condition:** The implementer will not touch implementation code until the owner and orchestrator review this revised preflight proposal and resolve the four decisions.
