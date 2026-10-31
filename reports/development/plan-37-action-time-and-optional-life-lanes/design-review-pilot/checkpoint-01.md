# Plan 37 Design Review Pilot — Checkpoint 01

- **Topic:** Action commitments and opportunity disclosure during an ordinary day
- **Target packet:** [Plan 37](file:///c:/AI/Quackpot/docs/development/plan-37-action-time-and-optional-life-lanes.md)
- **Stage ledger:** [ledger.md](file:///c:/AI/Quackpot/reports/development/plan-37-action-time-and-optional-life-lanes/design-review-pilot/ledger.md)
- **Date:** 2026-10-30

---

### 1. Selections & Scope
The owner completed the first foundational topic, establishing how time advances and how player commitments interact with daily life:

1. **LEDGER-01 (Session Boundary):** Option C (Tiered Session Consumption). Entering active gacha play (pulling/racing) commits the current slot for a baseline burst. Pushing past the baseline presents an explicit prompt warning that continuing will consume the upcoming life slot.
2. **LEDGER-02 (Day Structure):** Option A (Named Narrative Phases). An ordinary day is divided into three primary active phases (**Morning**, **Afternoon**, **Evening**) with an optional **Late Night** overtime state for extended sessions.
3. **LEDGER-03 (Opportunity Disclosure):** Option A (Explicit Un-Moralized Conflict Confirmation). Upcoming obligations are visible ambiently. A clear, non-judgmental confirmation prompt appears *only* when committing an action would directly preempt or sacrifice a scheduled obligation (e.g., missing work or skipping a meal). Routine non-conflicting actions commit without modal friction.

---

### 2. Consequence Map
- **Engine & State:** Adds a day-phase enum (`MORNING`, `AFTERNOON`, `EVENING`, `LATE_NIGHT`) and a session engagement state. No real-world timers or delayed exits.
- **Log & Receipt:** Emits distinct append-only events: `CUE_SHOWN` (e.g., conflict prompt presented) and `ACTION_COMMITTED` (e.g., skipped shift confirmed). This preserves strict Receipt honesty (*what was displayed* vs. *what you did*) without inferring motive.
- **Presentation (Plan 28):** Phase transitions map to apartment lighting/ambience. Modals use neutral institutional/device styling.
- **Economy & Pacing (Plan 29):** Plan 29 calibrates the exact pull/race count allowed in a baseline slot and the wage/health impacts of missed obligations.

---

### 3. Stress-Testing & Counterexamples
- *The "Click-Through" Spree:* A player with ample gems could rapidly click through confirmation prompts and consume Morning, Afternoon, and Evening in 30 seconds. This is accepted: the game discloses the trade-off at every step, and the student's own agency drives the outcome.
- *Modal Fatigue:* Restricting confirmation dialogs strictly to *conflicting* commitments (preempting work, skipping meals, or entering Late Night) prevents friction during free play.

---

### 4. Questions for Orchestration & Proposed Disposition
1. Does the logging pair (`CUE_SHOWN` for pre-action trade-off, `ACTION_COMMITTED` for player confirmation) satisfy existing Receipt schema conventions without breaking current replay fixtures?
2. Does orchestrator concur that Late Night should function purely as an optional penalty/overtime state rather than a mandatory daily phase?
- **Proposed disposition:** `record` owner selections LEDGER-01 through LEDGER-03; permit Plan 37 to proceed with concrete life-lane specification (meals, work, rest). Hold production/schema mutations.

---

### 5. Work Status
- **Independent work proceeding:** Detailing specific life lanes (meals, work shifts, free restorative rest) within the 3-phase + Late Night framework.
- **Held dependencies:** Numeric parameters (held for Plan 29); UI/component code (held for Plan 38/orchestrator).
