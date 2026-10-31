# Plan 37 Design Review Pilot — Checkpoint 02 (Final Reconciled)

- **Topic:** Day 1–3 Sequence, Meal Capacity, Work/Rent Lifecycle, and Session Semantics
- **Target packet:** [Plan 37](file:///c:/AI/Quackpot/docs/development/plan-37-action-time-and-optional-life-lanes.md)
- **Stage ledger:** [ledger.md](file:///c:/AI/Quackpot/reports/development/plan-37-action-time-and-optional-life-lanes/design-review-pilot/ledger.md)
- **Date:** 2026-10-31 (Reconciled with owner selections LEDGER-01–07)

---

### 1. Provenance Breakdown

#### A. Recorded Owner Selections (Binding)
- **LEDGER-01:** Tiered gacha session consumption (baseline burst in slot; explicit un-moralized confirmation before consuming next life phase).
- **LEDGER-02:** Three primary active phases (**Morning**, **Afternoon**, **Evening**) + optional **Late Night** overtime.
- **LEDGER-03:** Neutral conflict warnings only when an action preempts a scheduled obligation; routine actions commit without modal friction.
- **LEDGER-04:** **Anchor + Routine Maintenance**. Meals coexist alongside a phase's primary anchor activity.
- **LEDGER-05:** **Gacha Unlock Timing**. The *Quackpot* app unlocks on the player's phone in **Day 1 Evening**, immediately following completion of the first afternoon work shift.
- **LEDGER-06:** **Mutually Exclusive Evening Anchors**. Evening offers three distinct primary anchor choices: (1) Restful Leisure (Call Mom / sit with duck), (2) Gacha Session, or (3) Overtime Shift ($+W$).
- **LEDGER-07:** **Two Daily Meal Windows**. Breakfast in Morning, Dinner in Evening. Skipping either costs $0$ and deducts an on-button disclosed $-5$ HP. Lunch is integrated into the afternoon shift.

#### B. Specification Requirements (Architectural Constraints)
- **Session Lifecycle:** Browsing/Dex inspection is cost-free. First active draw/race commits the baseline session. Returning to the room and reopening the phone in the same phase re-enters the active session without penalty.
- **Persistence & Idempotency:** Draw confirmation atomically commits RNG outcomes and append-only receipt events (`cue_shown`, `action`). Browser reloads resume with inventory and log intact, never re-charging the phase or re-triggering completed commitments.
- **Distinct Work/Rent Lifecycle:** Clocking in, experiencing the represented work vignette, and receiving wages ($+W$) are distinct steps. Rent is paid consciously at the desk/mail slip, not via automatic silent deductions. Rent is due Day 4 Morning; Day 3 is unpaid-but-not-yet-due.

#### C. Illustrative Parameters (Provisional / Pending Plan 29 Calibration)
- Starting cash $C_0$, shift wage $W$, meal price $M$, gem purchase cost $G$, rent balance $R_{due}$ due on Day 4 Morning. Late Night fatigue rates remain open for Plan 29.

---

### 2. Coherent Day 1–Day 3 Flow

- **Day 1:**
  - *Morning:* Breakfast choice ($-M$ or Skip $-5$ HP). Setup apartment & name physical rubber duck.
  - *Afternoon:* Scheduled work shift (Clock in $\rightarrow$ narrative vignette $\rightarrow$ earn wage $+W$).
  - *Evening:* Dinner choice ($-M$ or Skip $-5$ HP). Rent notice arrives from Harbor Court Property Office ($R_{due}$ due Day 4). Phone pings: *Quackpot* unlocks. Choose **one** anchor: Intro Gacha Session (free 10-pull + race), Restful Leisure (Call Mom / duck), or Overtime Shift.
  - *Night:* Sleep / stamina recovery.
- **Day 2:**
  - *Morning:* Breakfast choice. Morning Anchor: Gacha session (baseline) **or** apartment leisure.
  - *Afternoon:* Scheduled work shift (earn $+W$) **or** warned gacha extension (confirm $\rightarrow$ forfeit $+W$).
  - *Evening:* Dinner choice. Choose **one** evening anchor: Call Mom, Evening Gacha, or Overtime Shift.
  - *Late Night (Optional):* Warned late-night gacha extension (confirms late-night play, fatigue next morning).
- **Day 3:**
  - *Morning:* Breakfast choice. Financial review: rent $R_{due}$ is unpaid but not yet due (due tomorrow).
  - *Afternoon:* Work shift ($+W$) **or** gacha session.
  - *Evening:* Dinner choice. Voluntary early rent payment if cash $\ge R_{due}$, or hold cash for Day 4.

---

### 3. Three Consistent Symbolic Traces

1. **Balanced / Engaged Route:**
   - Eats meals ($-4M$ across Days 1–2). Works both scheduled afternoon shifts ($+2W$).
   - Plays intro gacha Day 1 evening; calls Mom Day 2 evening.
   - Day 3 Morning status: cash $= C_0 + 2W - 4M$; HP $= 100$; Rent $R_{due}$ pending for tomorrow.
2. **The Gacha Slide (Preempted Work & Skipped Meals):**
   - Skips breakfasts and dinners ($-20$ HP total, $0$ food cost). Works Day 1 afternoon ($+W$), but spends cash on gacha gems ($-G$).
   - On Day 2, morning gacha extends into afternoon: warned that work will be missed $\rightarrow$ confirms. Forfeits afternoon wage ($+$0). Extends into Late Night gacha.
   - Day 3 Morning status: cash $= C_0 + W - G$; HP $= 80$ (fatigued); Rent $R_{due}$ pending tomorrow with only one wage earned and savings eroded.
3. **Rapid Route / Early Exit:**
   - Clicks through setup, skips breakfast, works Day 1 afternoon ($+W$), opens gacha on Day 1 evening.
   - On Day 2 morning, opens phone, selects **Uninstall**. Declines the 80-gem retention modal; immediately reaches the Receipt debrief.
