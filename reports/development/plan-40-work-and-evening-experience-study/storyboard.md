# Plan 40 · Work and Evening Experience Storyboard & Selected-Flow Tour

**Date**: 2026-10-31  
**Study**: Plan 40 Work and Evening Experience Study  
**Preview Entry Point**: [`index.html`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/index.html)  
**Primary Treatment**: Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)  
**Catalog Version**: `1.1.0`  

---

## 1. Selected-Flow Tour: Beat by Beat

The interactive storyboard demonstrates an understandable, lived progression from the morning departure through commute, workplace shifts, wage disbursal, Day 1 kitchen/dinner return, evening apartment decompression, and late-night rest.

```
[Morning Departure]
       │
       ▼
[Commute In]               <── Beat: 1–5 Author Tone Rating (e.g. #0C1 or #0C3)
       │
       ▼
[Work Shift (Beat 1 & 2)]  <── Beats: 1–5 Author Tone Rating (e.g. #012 + #014)
       │
       ▼
[Commute Home]             <── Beat: 1–5 Author Tone Rating (e.g. #0C4 or #0C5)
       │
       ▼
[Wage Payslip Disbursal]   <── $60.00 Net Take-Home Cash
       │
       ▼
[Day 1 Kitchen / Dinner]   <── Keys & badge on counter, warm tea, dinner decompression
       │
       ▼
[Evening Apartment Stage]  <── Warm desk lamp, dusk window, duck companion
   ├── 📞 Call Mom (+5 HP Restorative Check-in)
   ├── 🦆 Sit with Duck (+2 HP Stillness & Reflection)
   ├── 📱 Open Quackpot (Gacha App Launch)
   └── 💼 Tonight's Gigs & Shifts (1–2 Daily Offers Weighted Toward Delivery Gigs)
```

### Beat 1: Departure (Afternoon Shift Anchor)
- **Scene**: Apartment kitchen/hallway under neutral daylight.
- **Narrative**: Your work badge and keys lie on the kitchen counter beside your travel mug.
- **Player Action**: Either `[Step Out & Commute In]` or `[Arrive at Shift Floor]`.
- **Purpose**: Establishes that stepping into work is an active life transition.

### Beat 2: Commute In (Morning/Afternoon Transit)
- **Visuals**: Ambient transit window backdrop with weather effects (sleet/rain or morning sidewalk).
- **Author Tone Rating (1–5)**: Categorized with a 3-digit hex ID (e.g. `#0C1` Rating 1 freezing sleet, or `#0C3` Rating 3 steady morning sidewalk).
- **Player Action**: Board bus/walk to enter plant.

### Beat 3: Ordinary Work Shift (Afternoon Anchor · 2 Beats)
- **Visuals**: Ambient warehouse backdrop with structural trusses and skylights, plus notification cards.
- **Granular Pacing & Variety**:
  - The shift is split into two distinct blocks: **Shift Block 1** and **Shift Block 2**.
  - Each beat carries a 3-digit hex ID and 1–5 author-assigned tone rating.
  - Allows mixed combinations: a mediocre morning (`#012` Rating 2 sore heels) can combine with an uplifting afternoon (`#014` Rating 4 radio pop & shared pastry), yielding a balanced daily score.
  - Covers dimensions: strain, monotony, routine, social connection, problem mastery, and supervisor praise.
- **Player Action**: Advance through beats without forced countdown timers, then `[Clock Out & Head Home]`.

### Beat 4: Commute Home (Late Afternoon)
- **Visuals**: Ambient transit/sunset backdrop with golden tree silhouettes or rain on window glass.
- **Author Tone Rating (1–5)**: e.g. `#0C2` Rating 2 packed bus with everyone scrolling loot boxes, `#0C4` Rating 4 golden sunlight through maple trees, or `#0C5` Rating 5 helping an elderly neighbor on the subway stairs.
- **Player Action**: Walk through the neighborhood to reach the apartment door.

### Beat 5: Shift Payslip & Wage Disbursal
- **Visuals**: Clean, tactile institutional pay receipt from *Harbor Logistics Distribution Inc.*
- **Financial Baseline**:
  - Direct **$60.00 cash take-home** credited to wallet (Plan 29 completed-shift baseline).
  - Invented $88 gross / $28 deduction arithmetic is omitted per Root Continuation 03.
- **Player Action**: `[Collect Wages (+$60.00) & Walk In]`. The wallet clearly updates from $15.00 to $75.00.

### Beat 6: Day 1 Kitchen Dinner Return
- **Visuals**: Apartment kitchen counter under warm interior lighting (`src/assets/apartment/index.mjs`).
- **Narrative**: Setting keys and warehouse badge on the laminate counter.
- **Maintenance Dinner Choice (Disclosed Parameters)**:
  - Presents an explicit, disclosed meal choice:
    - *Eat Prepared Leftovers*: Maintenance meal ($0 cash, routine sustenance).
    - *Skip Dinner for Now*: Fatigue / low appetite ($0 cash, meal skipped).
  - Keeps meals routine maintenance without silently assuming free dinner or consuming an extra anchor.
- **Player Action**: `[Head to Desk]`.

### Beat 7: Evening Apartment & Life Anchors
- **Visuals**: Accepted apartment desk view in warm evening lighting (amber desk lamp pool, physical rubber duck resting calmly).
- **Single Exclusive Evening Choice**:
  - Selecting and completing an anchor concludes that evening's scenario; alternative previews require starting a fresh scenario.
  1. **📞 Call Mom**: Warm phone conversation about dinner, health, and family news (+5 HP, owner-selected).
  2. **🦆 Sit with Duck**: Deep breath and stillness at the desk with the physical companion (+2 HP, working proposal).
  3. **📱 Open Quackpot**: Factual launcher stand-in preview (no simulated gacha play claimed).
  4. **💼 Tonight's Gigs & Shifts**: Displays 1–2 rolled options for that evening, weighted toward frequent gig work.

### Beat 8: Optional Extra Shifts (Candidate Gigs & Offers)
- **Daily Roll Mechanic**:
  - The phone displays 1 or 2 available offers with candidate rewards and fatigue costs:
    - *QuickDrop Food Delivery*: +$35.00 cash, −8 HP (frequent gig).
    - *Harbor Fresh Grocery Dispatch*: +$42.00 cash, −10 HP (frequent gig).
    - *Harbor Street Diner Cover*: +$45.00 cash, −15 HP (occasional).
    - *Logistics Freight Overtime*: +$55.00 cash, −15 HP (occasional).
    - *Express Bike Courier*: +$40.00 cash, −10 HP (occasional).
  - Each shift features 5 standalone alternative vignettes rated on the 1–5 scale with 3-digit hex IDs.
- **Decoupled from Rent & Payout Honesty**:
  - Accepting a shift credits cash directly into the player's wallet and reduces health fatigue. It **never** auto-pays the pending rent balance on the fridge.
  - Stated payouts match disbursed cash with zero unbudgeted bonus tips.

### Beat 9: Late Night Return & Evening Complete
- **Night Return (after Extra Shift)**:
  - Displays the post-choice beat upon arrival at the dark flat; session is recorded in tracker now that the vignette is actually displayed.
  - Player turns off the desk lamp and sleeps, resolving the day.
- **Evening Complete (after Apartment Desk Anchor)**:
  - Displays a clean summary card of the completed anchor, updated wallet, health, and dinner choice.
  - Button `[Start New Scenario]` resets the in-memory state cleanly for the next test.

---

## 2. Pre-Choice Exposure & Synthetic-Data Separation

### Display-vs-Outcome Tracking:
- Pre-choice work and commute beats are recorded when actually rendered on screen.
- If a preview session is interrupted or reset before an evening choice, no row is added to the experiment tracker.
- Post-choice beats from extra shifts are recorded only when rendered and displayed on screen in Night Return.
- **Single Evening Choice Rule**: One row in the tracker corresponds to exactly one completed evening choice per scenario.

### Unscored / Unknown Handling:
- If `preChoiceBeats` is empty (e.g. testing evening choices directly), the tracker marks the session as `unscored` (mean: `null`) and excludes it from the tone tier denominator, rather than artificially assuming a neutral score of 3.0.

### Stateless In-Memory Prototype Semantics:
- The prototype is an in-memory testbed; page reload or 'Reset Scenario' resets all state.
- Cross-reload state persistence is a proposed Plan 38 integration contract, not verified by this prototype.

### Data Separation in Reviewer UI:
- **Observed Preview Sessions**: Tracks actual sessions run in the interactive preview (starts at 0).
- **Demonstration Fixture**: An isolated 90-run synthetic dataset used exclusively to verify that the chart/table UI functions properly, strictly separated from observed sessions. Denominators are never combined.

---

## 3. Compact Usage Serialization Schema (Proposed Adapter)

Proposed adapter for `CATALOG_VERSION = '1.1.0'` (candidate schema for future CourseVGD integration, not an adopted Plan 42 ZIP schema):
```json
{
  "day": 1,
  "pre": [["012", 2], ["014", 4], ["0C4", 4]],
  "avg": 3.33,
  "act": "call_mom",
  "post": []
}
```
  "avg": 3.33,
  "act": "call_mom",
  "post": []
}
```
