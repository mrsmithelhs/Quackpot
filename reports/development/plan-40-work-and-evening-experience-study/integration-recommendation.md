# Plan 40 · Integration Recommendation for Plan 38 Codex Progression

**Date**: 2026-10-31  
**Target Consumer**: Plan 38 (Apartment Life Production Integration / Codex Progression Model)  
**Lead Implementer**: Gemini Flash (Plan 40)  

---

## 1. Engine Action & Event Contracts

To support the validated work, commute, and evening experience without creating an ad-hoc secondary schedule, the progression resolver should incorporate the following discrete action primitives:

### 1. `action: 'work_completed'`
- **Authoritative Phase Transition**: `d1_morning` → `d1_afternoon` (or `d1_commute`).
- **Engine Effects**:
  - `cash += 60.00` (Take-home shift wage).
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
    "cashAfter": 75.00
  }
  ```

### 2. `action: 'evening_activity'`
- **Variants**:
  - `kind: 'call_mom'`: Restores **+5 HP** (capped at 100).
  - `kind: 'sit_duck'`: Restores **+2 HP** (capped at 100).
  - `kind: 'open_gacha'`: Leaves health unchanged; opens the phone gacha session hub.
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

### 3. `action: 'extra_shift'`
- **Parameters**: `shiftId` (`'diner_marisol'`, `'warehouse_night'`, `'courier_rush'`).
- **Engine Effects**:
  - `cash += shift.cashGain` (+$40 to +$55).
  - `health -= shift.healthCost` (−10 to −15 HP).
  - Authoritative Phase advances to `night`.
  - **Decoupled Rent Invariant**: Does **not** pay rent or alter the due rent obligation.
- **Append-Only Log Entry**:
  ```json
  {
    "type": "action",
    "kind": "extra_shift_worked",
    "shiftId": "diner_marisol",
    "cashGain": 45.00,
    "healthCost": 15,
    "cashAfter": 120.00,
    "healthAfter": 70
  }
  ```

---

## 2. Production UI & View Mapping

1. **Vignette Layer in `src/ui/life/`**:
   - `life-view.js` should render the atmospheric overlay when the controller phase is `work` or `commute`, utilizing the accepted text format from `copy.mjs` and clean SVG icons.
   - Pacing is player-paced (Next/Continue buttons with keyboard Tab/Enter/Space support), avoiding any forced countdowns.
2. **Evening Apartment Anchors**:
   - In `d1_evening`, `apartment-view.mjs` or `desk-view.js` should mount the three interactive anchors:
     - Phone: Call Mom / Quackpot.
     - Desk: Sit with Duck.
     - Work Notepad: Extra shift offers.
3. **Receipt Evidence & Reflection (Plan 27 / Plan 44)**:
   - Tracking the juxtaposition on the final Receipt:
     - Total hours of physical labor worked ($60 earned).
     - Net amount spent on digital duck gacha within hours of receiving wages.
     - Educational reflection: demonstrating how gacha spending mirrors compensatory exhaustion.
