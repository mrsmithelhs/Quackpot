# Plan 40 · Integration Recommendation for Plan 38 Codex Progression

**Date**: 2026-10-31  
**Target Consumer**: Plan 38 (Apartment Life Production Integration / Codex Progression Model)  
**Lead Implementer**: Gemini Flash (Plan 40)  

---

## 1. Action & Event Contracts for Progression Engine

To support the validated work, commute, and evening experience, the progression resolver in Plan 38 should incorporate the following discrete action primitives:

### 1. `action: 'work_completed'`
- **Parameters**: `shiftDate`, `hours: 8.0`, `beats: Array<[hexId, rating]>`.
- **Authoritative Phase Transition**: `d1_morning` → `d1_afternoon` → `d1_commute`.
- **Engine Effects**:
  - `cash += 60.00` (Take-home shift wage baseline).
  - `health` remains baseline or absorbs minor shift fatigue.
- **Append-Only Log Entry**:
  ```json
  {
    "type": "action",
    "kind": "work_shift_completed",
    "day": 1,
    "hours": 8.0,
    "gross": 88.00,
    "deductions": 28.00,
    "takeHome": 60.00,
    "beats": [["012", 2], ["014", 4]],
    "avgRating": 3.0,
    "cashAfter": 75.00
  }
  ```

### 2. `action: 'commute_completed'`
- **Parameters**: `phase: 'in' | 'home'`, `beat: [hexId, rating]`.
- **Authoritative Phase Transition**: Enters `d1_evening`.
- **Append-Only Log Entry**:
  ```json
  {
    "type": "action",
    "kind": "commute_completed",
    "phase": "home",
    "beat": ["0C4", 4],
    "day": 1
  }
  ```

### 3. `action: 'evening_activity'`
- **Variants**:
  - `kind: 'call_mom'`: Restores **+5 HP** (capped at 100).
  - `kind: 'sit_duck'`: Restores **+2 HP** (capped at 100).
  - `kind: 'open_gacha'`: Leaves health unchanged; opens phone gacha session hub.
- **Append-Only Log Entry**:
  ```json
  {
    "type": "action",
    "kind": "evening_activity_resolved",
    "activity": "call_mom",
    "healthDelta": 5,
    "healthAfter": 85
  }
  ```

### 4. `action: 'extra_shift'`
- **Parameters**: `shiftId` (`'gig_food'`, `'gig_grocery'`, `'diner_cover'`, etc.), `beat: [hexId, rating]`.
- **Engine Effects**:
  - `cash += shift.cashGain` (+$35.00 to +$55.00).
  - `health -= shift.healthCost` (−8 to −15 HP).
  - Phase advances to `night`.
  - **Decoupled Rent Invariant**: Does **not** pay rent or alter the due rent obligation.
- **Append-Only Log Entry**:
  ```json
  {
    "type": "action",
    "kind": "extra_shift_worked",
    "shiftId": "gig_food",
    "cashGain": 35.00,
    "healthCost": 8,
    "beat": ["F04", 4],
    "cashAfter": 110.00,
    "healthAfter": 77
  }
  ```

---

## 2. Compact Run-Usage Export Schema (CourseVGD Analysis)

In student run-usage ZIP exports, each day records a compact summary to minimize file size:
```json
{
  "day": 1,
  "beats": [["012", 2], ["014", 4], ["0C4", 4]],
  "avgWorkScore": 3.0,
  "commuteScore": 4.0,
  "dailyLikert": 3.33,
  "eveningChoice": "call_mom",
  "wageEarned": 60.00,
  "gachaSpent": 0.00
}
```

---

## 3. Production UI & Audio Coordination

1. **Ambient Backdrops in `src/ui/life/`**:
   - `life-view.js` should render the ambient visual layer (warehouse trusses, transit window sill, weather) behind the narrative cards during work and commute phases.
2. **Audio Needs (Plan 39 / Plan 18 Coordination)**:
   - Work and commute environments require environmental sound effects (warehouse ambient hum, radio pop, rain on transit glass, park birds) corresponding to the Likert rating of the active beat.
