# Plan 40 · Work and Evening Experience Storyboard & Selected-Flow Tour

**Date**: 2026-10-31  
**Study**: Plan 40 Work and Evening Experience Study  
**Preview Entry Point**: [`index.html`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/index.html)  
**Primary Treatment**: Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)  

---

## 1. Selected-Flow Tour: Beat by Beat

The interactive storyboard demonstrates an understandable, lived progression from the morning departure through commute, workplace shifts, wage disbursal, evening apartment decompression, and late-night rest.

```
[Morning Departure]
       │
       ▼
[Commute In]               <── Beat: 1–5 Likert Rating (e.g. #0C1 or #0C3)
       │
       ▼
[Work Shift (Beat 1 & 2)]  <── Beats: 1–5 Likert Rating (e.g. #012 + #014)
       │
       ▼
[Commute Home]             <── Beat: 1–5 Likert Rating (e.g. #0C4 or #0C5)
       │
       ▼
[Wage Payslip Disbursal]   <── $60.00 Net Take-Home Cash
       │
       ▼
[Evening Apartment Stage]  <── Warm desk lamp, dusk window, duck companion
   ├── 📞 Call Mom (+5 HP Restorative Check-in)
   ├── 🦆 Sit with Duck (+2 HP Stillness & Reflection)
   ├── 📱 Open Quackpot (Compensatory Gacha Temptation)
   └── 💼 Tonight's Gigs & Shifts (1–2 Daily Offers Weighted Toward Delivery Gigs)
```

### Beat 1: Morning Departure (8:00 AM)
- **Scene**: Apartment kitchen/hallway under neutral daylight.
- **Narrative**: Your work badge and keys lie on the kitchen counter beside your travel mug.
- **Player Action**: Either `[Step Out & Commute In]` or `[Arrive at Shift Floor]`.
- **Purpose**: Establishes that stepping into the workday is an active life transition, grounding the character in physical reality.

### Beat 2: Commute In (Morning Transit)
- **Visuals**: Ambient transit window backdrop with weather effects (sleet/rain or morning sidewalk).
- **5-Point Likert Beat**: Categorized with a 3-digit hex ID (e.g. `#0C1` Rating 1 freezing sleet, or `#0C3` Rating 3 steady morning sidewalk).
- **Player Action**: Board bus/walk to enter plant.

### Beat 3: Ordinary Work Shift (8.0 Hours · 2 Beats)
- **Visuals**: Ambient warehouse backdrop with structural trusses and skylights, plus notification cards.
- **Granular Pacing & Variety**:
  - The shift is split into two distinct blocks: **Morning Shift Block** (Beat 1) and **Afternoon Closing Block** (Beat 2).
  - Each beat carries a 3-digit hex ID and 1–5 Likert rating.
  - Allows mixed combinations: a mediocre morning (`#012` Rating 2 sore heels) can combine with an uplifting afternoon (`#014` Rating 4 radio pop & shared pastry), yielding a balanced daily score.
  - Covers dimensions: strain, monotony, routine, social connection, problem mastery, and supervisor praise.
- **Player Action**: Advance through beats without forced countdown timers, then `[Clock Out & Head Home]`.

### Beat 4: Commute Home (Late Afternoon)
- **Visuals**: Ambient transit/sunset backdrop with golden tree silhouettes or rain on window glass.
- **5-Point Likert Beat**: e.g. `#0C2` Rating 2 packed bus with everyone scrolling loot boxes, `#0C4` Rating 4 golden sunlight through maple trees, or `#0C5` Rating 5 helping an elderly neighbor on the subway stairs.
- **Player Action**: Walk through the neighborhood to reach the apartment door.

### Beat 5: Shift Payslip & Wage Disbursal
- **Visuals**: Clean, tactile institutional pay receipt from *Harbor Logistics Distribution Inc.*
- **Financial Baseline**:
  - Gross earnings: $88.00 (8.0 hrs)
  - Deductions: −$28.00
  - **Net Take-Home Cash: $60.00** (matching Plan 29 owner-selected baseline).
- **Player Action**: `[Collect Wages (+$60.00) & Walk In]`. The wallet clearly updates from $15.00 to $75.00.

### Beat 6: Evening Apartment & Life Anchors
- **Visuals**: Accepted apartment desk view in warm evening lighting (amber desk lamp pool, physical rubber duck resting calmly).
- **Interactive Diegetic Anchors**:
  1. **📞 Call Mom**:
     - Warm phone conversation about dinner, health, and family news.
     - Restores **+5 HP** (minor restorative effect selected by owner).
  2. **🦆 Sit with Duck**:
     - Deep breath and stillness at the desk with the physical companion.
     - Restores **+2 HP**.
  3. **📱 Open Quackpot**:
     - Push notification temptation: *"Daily Reset in 2 Hours! First 10-Pull 30% Off!"*.
     - Simulates opening the gacha app with fresh shift wages.
  4. **💼 Tonight's Gigs & Shifts**:
     - Displays 1–2 rolled options for that evening, weighted toward frequent gig work.

### Beat 7: Optional Extra Shifts (1–2 Daily Rolls Weighted Toward Gigs)
- **Daily Roll Mechanic**:
  - The phone displays 1 or 2 available offers:
    - *QuickDrop Food Delivery*: +$35.00 cash, −8 HP (frequent gig).
    - *Harbor Fresh Grocery Dispatch*: +$42.00 cash, −10 HP (frequent gig).
    - *Harbor Street Diner Cover*: +$45.00 cash, −15 HP (occasional).
    - *Logistics Freight Overtime*: +$55.00 cash, −15 HP (occasional).
    - *Express Bike Courier*: +$40.00 cash, −10 HP (occasional).
  - Each shift features 5 distinct narrative beats rated on the 1–5 scale with 3-digit hex IDs (e.g. `#F01` to `#F05`, `#E01` to `#E05`).
- **Decoupled from Rent**:
  - Accepting a shift credits cash directly into the player's wallet and reduces health fatigue. It **never** auto-pays the pending rent balance on the fridge.

---

## 2. 5-Point Likert Scale & Compact Usage Serialization

### Compact Tuple Schema:
Each beat is recorded as `[hexId, rating]`:
```json
{
  "day": 1,
  "beats": [["012", 2], ["014", 4], ["0C4", 4]],
  "avgScore": 3.33,
  "eveningChoice": "call_mom"
}
```

### Likert Tier Correlation (Owner Hypothesis):
- **Depleting Day (Avg 1.0 – 2.2)**: 70% compensatory gacha indulgence.
- **Mixed / Routine Day (Avg 2.3 – 3.5)**: 45% gacha, 45% restorative, 10% extra work.
- **Uplifting Day (Avg 3.6 – 5.0)**: 20% gacha, 75% restorative connection (Call Mom / Sit with Duck).

---

## 3. Visual Assets, Ambient Backdrops & Audio Notes

1. **Apartment Scenes**: Pure SVG from [`src/assets/apartment/index.mjs`](file:///c:/AI/Quackpot/src/assets/apartment/index.mjs).
2. **Ambient Backdrops**: Report-local SVGs played behind notification cards during work and commute (warehouse ceiling trusses, structural columns, transit window frames, rain streaks, sunset glows).
3. **Sound Design Need**: Work and commute environments require environmental audio cues (warehouse hum, conveyor clatter, rain on glass, radio tunes, birdsong) to reinforce the experiential contrast, for coordination with Plan 39 (Web Audio) and Plan 18 (Creative Commons).
