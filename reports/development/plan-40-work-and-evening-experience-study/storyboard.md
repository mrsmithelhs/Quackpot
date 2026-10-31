# Plan 40 · Work and Evening Experience Storyboard & Selected-Flow Tour

**Date**: 2026-10-31  
**Study**: Plan 40 Work and Evening Experience Study  
**Preview Entry Point**: [`index.html`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/index.html)  
**Primary Treatment**: Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)  

---

## 1. Selected-Flow Tour: Beat by Beat

The interactive storyboard demonstrates an understandable, lived progression from the morning departure through wage disbursal, evening apartment decompression, and late-night rest.

```
[Morning Departure]
       │
       ▼
[Work Shift (Beat 1 & 2)]  <── Condition: Grinding vs Engaging
       │
       ▼
[Commute (Beat 1 & 2)]     <── Condition: Exhausting vs Pleasant
       │
       ▼
[Wage Payslip Disbursal]   <── $60.00 Net Take-Home Cash
       │
       ▼
[Evening Apartment Stage]  <── Warm desk lamp, dusk window, duck companion
   ├── 📞 Call Mom (+5 HP Restorative Check-in)
   ├── 🦆 Sit with Duck (+2 HP Stillness & Reflection)
   ├── 📱 Open Quackpot (Compensatory Gacha Temptation)
   └── 💼 Extra Shifts Board (Flat Cash vs Health Strain)
```

### Beat 1: Morning Departure (8:00 AM)
- **Scene**: Apartment kitchen/hallway under neutral daylight.
- **Narrative**: Your work badge and keys lie on the kitchen counter beside your travel mug.
- **Player Action**: `[Grab Keys & Leave for Shift]`.
- **Purpose**: Establishes that stepping into the workday is an active life transition, grounding the character in physical reality before the shift begins.

### Beat 2: Ordinary Work Shift (8.0 Hours)
- **Visuals**: Atmospheric vignette card with evocative SVG icon (warehouse rollers / conveyer boxes or breakroom coffee / pastry).
- **Two Experimental Conditions**:
  - *Mundane / Grinding*: Pallet wrap, fluorescent hum, conveyor jam, stiff lower back. In your pocket, your phone vibrates with a reminder of the duck race earlier.
  - *Engaging / Pleasant*: Shared lemon pastry with Dan, cheerful radio tunes, catching a barcode error, feeling capable and part of a cooperative crew.
- **Player Action**: Advance through 2 beats, then `[Clock Out & Head to Bus]`. No forced reflex tasks or artificial countdown timers.

### Beat 3: Commute Home (Late Afternoon)
- **Visuals**: Atmospheric transit card with rain streaks on bus glass or slanted sunlight through park trees.
- **Two Experimental Conditions**:
  - *Dull / Exhausting*: Packed Route 14 bus in cold drizzle, wet coats, surrounded by passengers silently staring into dopamine-heavy mobile games and short-form feeds.
  - *Pleasant / Uplifting*: Late golden sunlight through autumn maple leaves in the park, mellow music in headphones, crisp refreshing air clearing the head.
- **Player Action**: Walk through the neighborhood to reach the apartment door.

### Beat 4: Shift Payslip & Wage Disbursal
- **Visuals**: Clean, tactile institutional pay receipt from *Harbor Logistics Distribution Inc.*
- **Financial Baseline**:
  - Gross earnings: $88.00 (8.0 hrs)
  - Deductions: −$28.00
  - **Net Take-Home Cash: $60.00** (matching Plan 29 owner-selected baseline).
- **Player Action**: `[Collect Wages (+$60.00) & Walk In]`. The wallet clearly updates from $15.00 to $75.00.

### Beat 5: Evening Apartment & Life Anchors
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
  4. **💼 Extra Shift Board**:
     - Opens optional overtime opportunities without auto-paying rent.

### Beat 6: Optional Extra Shifts & Separation from Rent
- **Shift Offers (Flat Rewards)**:
  - *Diner Closing Cover (Marisol)*: +$45.00 cash, −15 HP.
  - *Warehouse Night Restock*: +$55.00 cash, −15 HP.
  - *Late Courier Run*: +$40.00 cash, −10 HP.
- **Crucial Decoupling**: Taking an extra shift grants cash directly into the player's wallet and imposes health fatigue. It **never** silently pays the pending rent balance on the fridge. Rent payment remains an explicit, player-initiated choice.

---

## 2. Owner Behavioral Research Hypothesis & Tracker

The storyboard incorporates the owner's hypothesis regarding work/commute pacing:
> *"On days where the work is presented as more fun and/or the commute home is more enjoyable, do players do something better for them in the evening?"*

### Live Cohort Analytics in Storyboard
The reviewer panel displays real-time and synthetic cohort behavior across all 4 experimental quadrants:
- **Grinding Work + Exhausting Commute**: Depleted players heavily exhibit compensatory consumption (68% choose gacha indulgence).
- **Engaging Work + Pleasant Commute**: Grounded and replenished players strongly favor restorative care (74% choose Call Mom / Sit with Duck).

---

## 3. Visual Assets & Provenance

1. **Apartment Scenes**:
   - Source: [`src/assets/apartment/index.mjs`](file:///c:/AI/Quackpot/src/assets/apartment/index.mjs) (Plan 24/28 accepted SVG art kit).
   - Areas used: `kitchen` (neutral morning light), `desk-side` (warm evening/night lamp), `living` (overtime board).
   - 100% vector SVG, zero runtime external network calls.
2. **Workplace & Commute Vignettes**:
   - Clean, lightweight SVG iconography authored in `scenes.mjs` (warehouse rollers, breakroom mug/pastry, bus rain streaks, park sun/maple branch, paycheck seal).
   - Structured for future expansion into full-stage illustrated scenes if commissioned.
3. **Typography & Styling**:
   - Scoped CSS in [`storyboard.css`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/storyboard.css).
   - Mobile-responsive (16:9 desktop to 390px mobile narrow) with high-contrast accessibility and full `@media (prefers-reduced-motion: reduce)` support.
