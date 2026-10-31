# Plan 40 · Integration Recommendation for Plan 38 Codex Progression

**Date**: 2026-10-31  
**Target Consumer**: Plan 38 (Apartment Life Production Integration / Codex Progression Model)  
**Lead Implementer**: Gemini Flash (Plan 40)  
**Authority**: Investigation proposal & presentation handoff (NOT runtime production authority)  

---

## 1. Action & Event Interface Proposals for Plan 38

These interfaces are proposed recommendations for Codex's progression resolver in Plan 38, designed to represent work, commute, and evening beats cleanly without inventing a second schedule or separate timeclocks:

### 1. `action: 'work_completed'` (Afternoon Shift Anchor)
- **Anchor Context**: Ordinary work runs as a single committed afternoon life anchor (`d1_afternoon`).
- **Commute Integration**: Commute-in and commute-home are experienced as narrative subscenes *within* this single work commitment, rather than charging separate life phases or adding new clocks to the HUD.
- **Financial Baseline**:
  - Direct **$60.00 cash take-home** credited to wallet (Plan 29 completed-shift baseline).
  - The $88 gross and $28 deduction are fictional payslip presentation copy, not tax simulation or engine logic.
- **Proposed Append-Only Log Evidence**:
  ```json
  {
    "type": "action",
    "kind": "work_shift_completed",
    "day": 1,
    "hours": "afternoon_anchor",
    "takeHome": 60.00,
    "preChoiceBeats": [["012", 2], ["014", 4], ["0C4", 4]],
    "avgPreChoiceScore": 3.33,
    "cashAfter": 75.00
  }
  ```

### 2. `action: 'evening_activity'` (Evening Life Anchor)
- **Variants**:
  - `kind: 'call_mom'`: Restores **+5 HP** (capped at 100). Factual, grounding family check-in.
  - `kind: 'sit_duck'`: Restores **+2 HP** (capped at 100). Quiet reflection with physical companion.
  - `kind: 'open_gacha'`: Leaves health unchanged; opens the phone gacha session hub.
- **Proposed Append-Only Log Evidence**:
  ```json
  {
    "type": "action",
    "kind": "evening_activity_resolved",
    "activity": "call_mom",
    "healthDelta": 5,
    "healthAfter": 85
  }
  ```

### 3. `action: 'extra_shift'` (Optional Overtime / Gig Work)
- **Exclusivity**: Taking an extra shift is an exclusive evening commitment that transitions the day to night/bedrest, preventing an infinite same-night grinding loop.
- **Gig Availability Policy**:
  - 1–2 options rolled per day, weighted toward frequent gig work (food/grocery delivery).
  - Persists stably across room inspection and page reloads for that day.
  - Acts as an accessible fallback even if the regular warehouse job is missed or forfeited.
- **Parameters**: `shiftId` (`'gig_food'`, `'gig_grocery'`, `'diner_cover'`, etc.), `beat: [hexId, rating]`.
- **Decoupled Rent Invariant**: Earning shift cash **never** automatically pays or alters the pending rent balance on the fridge.
- **Flat Reward Honesty**: Stated payout (e.g. $35.00) strictly matches the credited amount with zero contradictory unbudgeted tips.
- **Proposed Append-Only Log Evidence**:
  ```json
  {
    "type": "action",
    "kind": "extra_shift_worked",
    "shiftId": "gig_food",
    "cashGain": 35.00,
    "healthCost": 8,
    "postChoiceBeat": ["F04", 4],
    "cashAfter": 110.00,
    "healthAfter": 77
  }
  ```

---

## 2. Compact Run-Usage Export Schema (CourseVGD Analysis)

In student run-usage ZIP exports, each day records a compact summary without free-text student identifiers or timestamps:
```json
{
  "day": 1,
  "pre": [["012", 2], ["014", 4], ["0C4", 4]],
  "avg": 3.33,
  "act": "call_mom",
  "post": [],
  "wage": 60.00,
  "gachaSpent": 0.00
}
```

---

## 3. Sound Design & Production Coordination

- **Audio Alignment**: Work and commute environments require environmental sound cues (warehouse hum, conveyor clatter, rain on transit glass, park birds, acoustic headphone music) corresponding to the author-assigned tone rating (1–5), coordinated with Plan 39 (Web Audio laboratory) and Plan 18 (Creative Commons audio).
- **Production Boundary**: No production engine, save schema, or controller changes are asserted by Plan 40; Plan 38 maintains sole authority over runtime progression integration.
