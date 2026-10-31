# Plan 37: Consolidated Action / Transition Specification & Lifecycle Semantics

- **Status:** Accepted closed design investigation with root integration qualifications; not an executable specification
- **Date:** 2026-10-31
- **Governing Ledger:** [ledger.md](file:///c:/AI/Quackpot/reports/development/plan-37-action-time-and-optional-life-lanes/design-review-pilot/ledger.md) (LEDGER-01 through LEDGER-14)
- **Review Dispositions:** Root Checkpoint Reviews 01, 02, 03, and Final Spec Review 01 (`reports/orchestration/plan-37-final-spec-review-01.md`)

---

**Root closeout2026-10-31:** Read `reports/orchestration/plan-37-closeout-and-integration-boundaries.md` first. It takes precedence over the proposed morning ordering and combined Put Phone Down/Finish Session wording below. Remaining transaction/default decisions belong to a bounded integration proposal; this artifact is not proof of implemented behavior.

## 1. Provenance & Authority Framework

Every rule, parameter, and interaction in this specification is explicitly tagged with its authoritative source:
- **`[SELECTED]`**: Binding owner decision recorded in `ledger.md` (LEDGER-01 through LEDGER-14). Cannot be altered without owner direction.
- **`[FOUNDING-REQ]`**: Core architectural requirement from the founding game design (Hard Constraints #1–7: local static browser execution, no network/telemetry/CDN, append-only log, Receipt separation, 80-gem retention modal, always-available immediate Uninstall/Leave).
- **`[PROPOSED-LIFECYCLE-DEFAULT]`**: Recommended architectural and state-machine defaults supplied to close lifecycle gaps (e.g., finite phase-entry health ordering, Day 1 unlock exception, finite bedrest resolution, session close mechanics). Subject to root review.
- **`[PROVISIONAL-CALIBRATION]`**: Symbolic numerical threshold, price, or rate awaiting [Plan 29](file:///c:/AI/Quackpot/docs/development/plan-29-life-economy-scale-and-session-pacing.md) calibration ($C_0, W, M, G, R_{due}, H_{rest}, H_{fatigue}$, and sub-critical HP cutoffs like 70/30).
- **`[PROPOSED-PRESENTATION]`**: Candidate narrative copy, visual transition, or social dialogue coordinated with Plan 28, Plan 40, or Plan 41.

---

## 2. Consolidated Action & Transition Table

| Action / Lane ID | Eligible Phase & Context | Classification | Commitment & Warning Trigger | Displayed Cost / Terms | Actual State & Event Log Effect | Next Phase Advancement | Resume & Reload Idempotency | Reduced Motion & Exit Equivalent |
|---|---|---|---|---|---|---|---|---|
| **`MEAL_BREAKFAST`** | Morning | Maintenance `[SELECTED]` | Confirm eating at kitchen counter. Coexists with Morning Anchor `[SELECTED]`. | Food cost $M$ `[PROVISIONAL-CALIBRATION]`. Restores well-being. | `Cash -= M`; `HP += H_meal` `[PROVISIONAL-CALIBRATION]`. Log: `action: eat_breakfast`. | Stays in Morning (Anchor open). | Once per Morning. Reload preserves state without double charge. | Instant static resolution. |
| **`MEAL_SKIP_BREAKFAST`** | Morning | Maintenance `[SELECTED]` | Explicit button click. | Disclosed on button: $0 cost, −5 HP `[SELECTED]`. No modal popup `[SELECTED]`. | `HP -= 5`. Clamped at 0 `[PROPOSED-LIFECYCLE-DEFAULT]`. Log: `action: skip_breakfast`. | Stays in Morning (Anchor open). | Once per Morning. Reload preserves deduction. | Instant static resolution. |
| **`MEAL_DINNER`** | Evening | Maintenance `[SELECTED]` | Confirm dinner in apartment. Coexists with Evening Anchor `[SELECTED]`. | Food cost $M$ `[PROVISIONAL-CALIBRATION]`. | `Cash -= M`; `HP += H_meal` `[PROVISIONAL-CALIBRATION]`. Log: `action: eat_dinner`. | Stays in Evening (Anchor open). | Once per Evening. | Instant static resolution. |
| **`MEAL_SKIP_DINNER`** | Evening | Maintenance `[SELECTED]` | Explicit button click. | Disclosed on button: $0 cost, −5 HP `[SELECTED]`. No modal popup `[SELECTED]`. | `HP -= 5`. Clamped at 0 `[PROPOSED-LIFECYCLE-DEFAULT]`. Log: `action: skip_dinner`. | Stays in Evening (Anchor open). | Once per Evening. | Instant static resolution. |
| **`WORK_SCHEDULED_SHIFT`** | Afternoon | Primary Anchor `[SELECTED]` | Clock-in button at door/phone. Consumes Afternoon anchor `[SELECTED]`. | Requires active employment. Displays wage $+W$ `[PROVISIONAL-CALIBRATION]`. | Step 1: Clock-in. Step 2: Vignette. Step 3: `Cash += W`. Log: `action: work_shift`. | Advances to **Evening**. | In-flight reload resumes at vignette step; wage credited exactly once. | Skips vignette directly to wage credit. |
| **`WORK_OVERTIME_SHIFT`** | Evening | Primary Anchor `[SELECTED]` | Select "Overtime Shift" at desk/phone. Mutually exclusive with Leisure & Gacha `[SELECTED]`. | Earns $+W$. Disabled if $HP < 70$ `[PROVISIONAL-CALIBRATION]`. | Consumes Evening anchor. `Cash += W`; stamina cost. Log: `action: overtime_shift`. | Advances to **Night** (Sleep). | Completes once; reload preserves wage. | Static text resolution. |
| **`LEISURE_CALL_MOM`** | Evening | Primary Anchor `[SELECTED]` | Select "Call Mom" on phone. Mutually exclusive with Overtime & Gacha `[SELECTED]`. | Free ($0). Restores modest well-being (+10 HP `[PROVISIONAL-CALIBRATION]`). | Consumes Evening anchor. `HP += H_leisure`. Log: `action: leisure_call_mom`. | Advances to **Night** (Sleep). | Once per Evening. Reload preserves dialogue state. | Static text display. |
| **`LEISURE_SIT_DUCK`** | Morning / Evening | Anchor or Free inspect | Sit with physical rubber duck. Free inspection if browsing; can serve as Evening Leisure `[SELECTED]`. | Free ($0). Narrative grounding beat. | If chosen as Evening Anchor: `HP += H_duck`. Log: `action: leisure_duck`. | Advances to **Night** if chosen as Evening Anchor. | Idempotent view; repeatable without penalty. | Static camera view. |
| **`GACHA_SESSION_BASELINE`** | Morning, Evening (Unlocked Day 1 Eve `[SELECTED]`) | Primary Anchor `[SELECTED]` | First active Draw (10-pull) or Race commits the slot `[SELECTED]`. Browsing Dex/odds is free `[FOUNDING-REQ]`. | Disclosed gem/dollar price. Covers $P_{base}$ pulls + $R_{base}$ races `[PROVISIONAL-CALIBRATION]`. | Consumes phase anchor. Deducts gems/cash. Generates RNG outcomes & append-only events. | Stays in current phase until session closed or extended. | Reload preserves inventory and active session state; does not recharge phase. | Static reveal / skip animation. |
| **`GACHA_SESSION_REENTRY`** | Current phase with active session | Navigation `[FOUNDING-REQ]` | Picking phone back up after browsing apartment during same phase. | Free ($0, 0 slots) `[FOUNDING-REQ]`. | Re-enters active session. Does not mutate phase time or charge fees. Log records cues actually displayed. | Stays in current phase. | Fully idempotent. | Direct screen switch. |
| **`GACHA_EXTEND_CONFLICT`** | Active session when baseline exhausted | Slot Preemption `[SELECTED]` | Attempting draw/race after baseline exhausted. Triggers conflict modal `[SELECTED]`. | Neutral modal: *"Continue? Will consume next phase & skip [Named Obligation or Free Time]"* `[SELECTED]`. | If confirmed: Consumes next phase (e.g. Afternoon shift forfeited, wage lost). Log: `cue_shown`, `action: extend_gacha`. | Advances phase counter to preempted slot. | Confirmation is atomic; reload retains preempted phase state. | Neutral modal format. |
| **`GACHA_EXTEND_LATE_NIGHT`** | Evening Gacha session | Spillover Overtime `[SELECTED]` | Continuing Evening gacha past baseline. Modal warning of morning fatigue `[SELECTED]`. | Free entry, but inflicts Morning Fatigue penalty (−10 HP `[PROVISIONAL-CALIBRATION]`). | State flags `late_night_fatigue = true`. Log: `cue_shown`, `action: late_night_gacha`. | Advances to **Night** / Morning transition. | Atomic commit; reload wakes in Morning with fatigue. | Static prompt. |
| **`RENT_PAY_CONSCIOUS`** | Day 3 Evening or Day 4 Morning | Financial Action `[SELECTED]` | Click "Pay Rent" at desk notice slip. Available if Cash $\ge R_{due}$. | Deducts full balance $R_{due}$ `[PROVISIONAL-CALIBRATION]`. Leaves character with clean housing record. | `Cash -= R_due`; `rent_paid = true`. Log: `action: pay_rent`. | Does NOT advance phase (desk action). | Once-only; slip permanently stamped PAID. Reload safe. | Accessible button. |
| **`RENT_WITHHOLD_CONSCIOUS`** | Day 4 Morning deadline | Financial Action `[SELECTED LEDGER-14]` | Click "Hold Cash / Do Not Pay" when Cash $\ge R_{due}$ `[SELECTED]`. | Retains cash in hand. Triggers immediate landlord escalation/threat `[SELECTED]`. Zero inferred player motive `[SPEC-REQ]`. | `rent_paid = false`; activates landlord escalation state. Log: `action: withhold_rent`. | Holds phase until escalation response made. | Persisted across reload. Factual Receipt evidence. | Accessible button. |
| **`RENT_SHORTFALL_LADDER`** | Day 4 Morning deadline | Crisis Escalation `[SELECTED]` | Automatic phase-entry check on Day 4 Morning if Cash $< R_{due}$ `[SELECTED]`. | Triggers canonical "Running on Empty" ladder: budget $\rightarrow$ overtime $\rightarrow$ pawn $\rightarrow$ credit card `[FOUNDING-REQ]`. | Activates escalation modal state. Log: `cue_shown: rent_shortfall`. | Holds phase until escalation resolved. | State persisted across reloads. Cannot be bypassed by ignoring slip. | Keyboard accessible ladder. |
| **`PAWN_ASSET_PROACTIVE`** | Any apartment phase | Voluntary Asset Sale `[SELECTED]` | Click TV or Couch $\rightarrow$ "Sell for Cash". Can be done early `[SELECTED]`. | Cash credited ($+V_{item}$ `[PROVISIONAL-CALIBRATION]`). Downside: visible room loss + social friction `[SELECTED]`. | `Cash += V_item`; `item_owned = false`; triggers social comment event. Log: `action: pawn_item`. | Does not advance phase (instant transaction). | Irreversible once confirmed. Reload keeps room empty & cash credited. | Accessible confirm modal. |
| **`HEALTH_COLLAPSE_BEDREST`** | Morning Phase Entry or after meal skip if $HP \le 0$ | Automatic Consequence `[SELECTED]` | Triggered immediately if HP reaches 0 from wake fatigue or meal skips. | Character collapses. Entire current Morning phase converted to Bedrest `[SELECTED]`. | Forfeits phase anchor (work/gacha blocked). `HP = H_rest_recovery` (e.g. 25 HP `[PROVISIONAL-CALIBRATION]`). Log: `consequence: health_collapse`. | Advances to **Afternoon** after rest. | Once-only execution. Reload resumes inside resting scene without re-collapsing. | Immediate Uninstall remains accessible `[FOUNDING-REQ]`. |
| **`UNINSTALL_LEAVE`** | Universal (Always available) | Terminal Exit `[FOUNDING-REQ]` | Click "Uninstall Quackpot" on phone or settings. | Retention modal offers 80 gems `[FOUNDING-REQ]`. Player can click "Leave Now" immediately `[FOUNDING-REQ]`. | Run concludes immediately. Compiles append-only event log into Receipt. Log: `action: uninstall_confirmed`. | Routes directly to **Receipt Debrief View**. | Resuming completed run loads final Receipt view. | Clean static view. |

---

## 3. Core Lifecycle Semantics

### 3.1. Phase Entry & Health Resolution Ordering `[PROPOSED-LIFECYCLE-DEFAULT]`
To prevent circular dependencies, infinite loops, and mandatory food purchases at 0 HP, morning progression executes in a strict, finite sequence:
1. **Wake & Fatigue Application:** If `late_night_fatigue == true`, deduct $H_{fatigue}$ (e.g., 10 HP `[PROVISIONAL-CALIBRATION]`) immediately upon waking. Clear the flag.
2. **Health Check 1 (Wake Collapse):** If $HP \le 0$, clamp HP to 0 and immediately trigger `HEALTH_COLLAPSE_BEDREST`. Morning is converted to rest, recovering $+H_{rest}$ (e.g., 25 HP `[PROVISIONAL-CALIBRATION]`), logging `consequence: health_collapse`, and advancing directly to Afternoon. (Breakfast is skipped; rent obligations remain active).
3. **Routine Maintenance (Breakfast):** If $HP > 0$, the player may choose `MEAL_BREAKFAST` (pay $M$, restore HP) or `MEAL_SKIP_BREAKFAST` ($0, −5 HP).
4. **Health Check 2 (Starvation Collapse):** If skipping breakfast drops $HP \le 0$, clamp HP to 0 and immediately trigger `HEALTH_COLLAPSE_BEDREST` for the remainder of Morning, recovering $+H_{rest}$ and advancing to Afternoon.
5. **Deadline & Obligations Check:** On Day 4 Morning arrival:
   - If rent was paid early: Slip is stamped PAID. Proceed to Anchor.
   - If rent unpaid and $Cash \ge R_{due}$: Present conscious choice: `[Pay Rent]` or `[Hold Cash / Do Not Pay]` `[SELECTED LEDGER-14]`.
   - If rent unpaid and $Cash < R_{due}$: Trigger `RENT_SHORTFALL_LADDER` immediately `[SELECTED LEDGER-09]`.
6. **Primary Anchor Selection:** If healthy and rent obligations are addressed, the player may select their Morning Anchor.

### 3.2. Sub-Critical Health Degradation Gradient `[SELECTED]`
*(Thresholds and specific penalties are provisional `[PROVISIONAL-CALIBRATION]` pending Plan 29 calibration)*:
- **Normal Well-Being ($HP \ge 70$):** All actions available; scheduled and overtime shifts perform normally.
- **Moderate Fatigue ($30 \le HP < 70$):** Overtime evening shifts are disabled; shift vignettes reflect tiredness.
- **Severe Exhaustion ($0 < HP < 30$):** Scheduled work shifts yield reduced wages (longer required breaks); apartment interactions display fatigue.
- **Critical Collapse ($HP \le 0$):** Triggers `HEALTH_COLLAPSE_BEDREST` as specified in Section 3.1. Clamped at 0; once-only commit; positive recovery to $H_{rest}$.

### 3.3. Work Attendance & 3-Strike Policy `[SELECTED]`
- **Shift Schedule:** Scheduled shifts occur on introductory Days 1, 2, and 3 Afternoon, and continue on regular weekdays in the ongoing calendar.
- **Strike 1 (1st Miss):** Forfeits day's wage $+W$. Manager texts warning: *"We had to cover for you today."*
- **Strike 2 (2nd Miss):** Forfeits day's wage $+W$. Manager texts final warning: *"Final warning. Another absence and you're let go."*
- **Strike 3 (3rd Miss):** Forfeits day's wage $+W$. Termination notice received. The scheduled afternoon work lane is permanently closed for the remainder of the run.
- **Scope Limits `[FOUNDING-REQ]`:** Termination closes scheduled employment. It does not terminate the run, does not authorize unapproved new gig/odd-job systems, and does not alter evening overtime availability unless governed by health.

### 3.4. Gacha Unlock Exception `[PROPOSED-LIFECYCLE-DEFAULT]`
- **Baseline Rule `[SELECTED]`:** *Quackpot* unlocks on the phone in Day 1 Evening.
- **Exception Handling `[PROPOSED-LIFECYCLE-DEFAULT]`:** If the player skipped the Day 1 Afternoon shift or collapsed into bedrest, the phone notification **still arrives in Day 1 Evening**. Access to the fictional game is decoupled from wage receipt to prevent permanent gameplay softlocks.

### 3.5. Rent Deadline & Payment Agency `[SELECTED]`
- **Notice:** Delivered Day 1 Evening ($R_{due}$ due Day 4 Morning).
- **Day 3 Voluntary Early Payment:** Player may pay at desk slip if $Cash \ge R_{due}$, clearing the debt early.
- **Day 4 Morning Resolution:**
  - *Case 1 (Paid Early):* Notice shows PAID stamp.
  - *Case 2 (Solvent Unpaid, $Cash \ge R_{due}$) `[SELECTED LEDGER-14]`:* Player presented with genuine choice:
    - `[Pay Rent]`: Deducts $R_{due}$; marked PAID. If remaining cash is exactly $0, clean zero solvency is recorded honestly.
    - `[Hold Cash / Do Not Pay]`: Cash retained; rent marked overdue; landlord escalation triggers immediately. Recorded factually without inferring intent. Escalation for solvent withholding demands payment without forcing asset liquidation.
  - *Case 3 (Shortfall, $Cash < R_{due}$) `[SELECTED LEDGER-09]`:* Reaching Day 4 Morning with insufficient funds immediately activates the "Running on Empty" escalation ladder (budgeting $\rightarrow$ overtime $\rightarrow$ pawning $\rightarrow$ credit card). Cannot be deferred by ignoring the desk slip.

### 3.6. Gacha Session Semantics & Transaction Lifecycle `[PROPOSED-LIFECYCLE-DEFAULT]`
- **Browsing vs. Active Play:** Opening app, viewing Dex, checking odds, or reading messages costs 0 time slots.
- **Active Session Lock:** First confirmed Draw (10-pull) or Race entry commits the phase anchor. Covers baseline allowance of $P_{base}$ pulls + $R_{base}$ races `[PROVISIONAL-CALIBRATION]`.
- **In-Phase Re-entry:** Putting the phone down to view the room and picking it back up in the same phase re-enters the active session without recharging time.
- **Anchor Exclusivity:** If another anchor (Work or Leisure) was already committed in this phase, Gacha cannot be selected.
- **Session Close:** Choosing "Put Phone Down / Finish Session" after baseline play concludes the session and advances the phase.
- **Extension Warning:** Attempting play past baseline triggers conflict modal naming the specific obligation preempted in the next phase (or free leisure if none).
- **Atomic Persistence:** Draw RNG outcomes and receipt events commit atomically on confirm. Reloads resume with inventory and log intact; incomplete race presentations display static results of committed RNG outcomes.

---

## 4. Comprehensive Symbolic Traces

### Trace A: Steady Solvent Play (Solvent & Healthy)
* **Initial State:** Cash $= C_0$, HP $= 100$.
* **Day 1:** Morning (Breakfast: Cash $= C_0 - M$; Duck setup) $\rightarrow$ Afternoon (Work shift: Cash $= C_0 - M + W$) $\rightarrow$ Evening (Rent notice arrives for $R_{due}$; Dinner: Cash $= C_0 - 2M + W$; Gacha unlocks $\rightarrow$ free intro 10-pull + race) $\rightarrow$ Night (Sleep).
* **Day 2:** Morning (Breakfast: Cash $= C_0 - 3M + W$; Morning gacha baseline) $\rightarrow$ Afternoon (Work shift: Cash $= C_0 - 3M + 2W$) $\rightarrow$ Evening (Dinner: Cash $= C_0 - 4M + 2W$; Call Mom: HP restored to 100) $\rightarrow$ Night (Sleep).
* **Day 3:** Morning (Breakfast; view rent slip due tomorrow) $\rightarrow$ Afternoon (Work shift: Cash $= C_0 - 5M + 3W$) $\rightarrow$ Evening (Dinner; pay rent early at desk: Cash $= C_0 - 6M + 3W - R_{due}$; Sit with duck).
* **Day 4:** Morning (Wakes with rent already PAID; solvent, healthy, zero housing crisis).

### Trace B: Distracted Play & Warning Accumulation (Two Missed Shifts, No Termination)
* **Initial State:** Cash $= C_0$, HP $= 100$.
* **Day 1:** Morning (Skip breakfast: HP $= 95$) $\rightarrow$ Afternoon (Work shift: Cash $= C_0 + W$) $\rightarrow$ Evening (Skip dinner: HP $= 90$; Gacha unlocks $\rightarrow$ buys gems: Cash $= C_0 + W - G$) $\rightarrow$ Night (Sleep).
* **Day 2:** Morning (Skip breakfast: HP $= 85$; Morning gacha baseline) $\rightarrow$ Afternoon (Player extends gacha past baseline: warned of missed work $\rightarrow$ confirms. **Strike 1 logged**. Wage $= 0$. Cash unchanged) $\rightarrow$ Evening (Skip dinner: HP $= 80$; Extends gacha into Late Night: warned of morning fatigue) $\rightarrow$ Late Night.
* **Day 3:** Morning (Wakes with Late Night fatigue: HP $= 70$. Skip breakfast: HP $= 65$. Rent due tomorrow!) $\rightarrow$ Afternoon (Player extends gacha again: warned of missed work $\rightarrow$ confirms. **Strike 2 logged (Final Warning)**. Wage $= 0$) $\rightarrow$ Evening (Dinner: Cash $= C_0 + W - G - M$; Calls Mom).
* **Day 4:** Morning (Enters Day 4 with 2 strikes; job is still active; faces rent deadline).

### Trace B2: Persistent Shift Neglect & 3-Strike Termination
* **Context:** Continues from Trace B on Day 4.
* **Day 4:** Morning (Pays rent or deals with deadline) $\rightarrow$ Afternoon (Player extends morning gacha into afternoon: warned that missing shift will cause immediate firing $\rightarrow$ confirms. **Strike 3 logged**).
* **Outcome:** Termination notice received. Afternoon scheduled work lane is permanently closed for remainder of run. Cash reflects zero wages from missed shifts.

### Trace C: Rapid Route & Immediate Uninstall (Clean Pedagogical Exit)
* **Day 1:** Player rapidly clicks setup, skips reading, works afternoon ($+W$), sees gacha unlock in evening.
* **Day 2:** Morning, opens phone, does one pull, then clicks **Uninstall Quackpot**.
* **Retention Intercept:** Modal offers 80 free gems and "play out the trap". Player selects "Leave Now".
* **Outcome:** Run terminates instantly; displays Receipt showing displayed odds, cumulative spending, and self-reflection prompts. No forced sales or loans.

### Trace D: Pre-Anchor Health Collapse & Bedrest Recovery
* **Context:** Player enters Day 3 Morning at $5$ HP after repeated meal skips and late-night sessions.
* **Trigger:** Player clicks "Skip Breakfast" (−5 HP). HP drops to $0$.
* **Resolution:** `HEALTH_COLLAPSE_BEDREST` triggers immediately. Morning phase converts to bedrest. Character wakes up in Afternoon at $H_{rest}$ (25 HP). Afternoon work shift remains available. Log records `consequence: health_collapse`. Mid-scene reload safely resumes at resting scene.

### Trace E: Early Rent Payment Trace
* **Context:** Solvent player on Day 3 Evening.
* **Action:** Interacts with desk rent slip. Clicks `[Pay Rent]`.
* **Resolution:** Cash deducted ($R_{due}$); slip marked PAID.
* **Day 4 Morning:** Wakes up to Day 4 deadline. System checks rent status: already PAID. No deadline prompt or escalation occurs; player proceeds directly to morning choices.

### Trace F: Solvent Rent Withholding Trace `[SELECTED LEDGER-14]`
* **Context:** Player enters Day 4 Morning with $Cash \ge R_{due}$.
* **Action:** Interacts with rent slip. Chooses `[Hold Cash / Do Not Pay]`.
* **Resolution:** Cash retained in wallet. Rent status marked OVERDUE. Log records `action: withhold_rent`. Landlord escalation triggers immediately (demands payment, issues warning). Player retains funds but faces immediate housing pressure.

### Trace G: Rent Shortfall & Escalation Ladder Trace `[SELECTED LEDGER-09]`
* **Context:** Player enters Day 4 Morning with $Cash < R_{due}$.
* **Trigger:** Phase entry detects shortfall immediately (independent of clicking notice).
* **Resolution:** `RENT_SHORTFALL_LADDER` triggers. Player presented with canonical escalation steps (emergency budget, pawning TV/couch, credit card).

---

## 5. Review & Handoff Status

This document preserves the selected policy framework and corrected illustrative traces. Root accepts it as a design investigation, qualified by `reports/orchestration/plan-37-closeout-and-integration-boundaries.md`; its remaining lifecycle proposals are not all selected or unambiguous. Exact transition/transaction behavior requires bounded integration review.
