# Plan 37 Design Review Pilot — Checkpoint 03

- **Topic:** Life Lanes, Consequence Escalation, Proactive Sales, and Restorative Well-Being
- **Target packet:** [Plan 37](file:///c:/AI/Quackpot/docs/development/plan-37-action-time-and-optional-life-lanes.md)
- **Stage ledger:** [ledger.md](file:///c:/AI/Quackpot/reports/development/plan-37-action-time-and-optional-life-lanes/design-review-pilot/ledger.md)
- **Date:** 2026-10-31

---

### 1. Selections & Scope (LEDGER-08 – LEDGER-13)

The owner established the consequence and secondary life-lane policies for Plan 37:

1. **LEDGER-08 (Work Attendance):** Progressive 3-strike system (1st missed shift = warning; 2nd = final warning; 3rd = termination). Forfeits $+W$ wage for missed shifts; termination permanently closes the scheduled work lane.
2. **LEDGER-09 (Rent Shortfall):** Immediate trigger of the canonical "Running on Empty" escalation ladder on Day 4 Morning if cash $< R_{due}$.
3. **LEDGER-10 (Critical Health & Degradation Gradient):** At 0 HP, forced bedrest consumes 1 active phase (recovering to minimal safe threshold). Lower sub-critical health features an escalating consequence gradient (e.g., extra overtime shift disabled below ~70 HP, reduced work wages due to fatigue/breaks, and concentration friction in gacha/apartment).
4. **LEDGER-11 (Proactive Asset Liquidation):** Player can voluntarily pawn possessions (TV, couch) early for cash rather than waiting for rent failure. The owner explicitly directs adding a social consequence downside (e.g., family/peer reactions) coordinated with orchestration's ongoing social dynamic work.
5. **LEDGER-12 (Restorative Leisure & HP Proxy):** Restful leisure (Call Mom, sit with duck) provides narrative grounding and modest mechanical recovery. **HP is formally confirmed as the canonical proxy for overall well-being in Quackpot.**
6. **LEDGER-13 (Late Night Overtime):** Extending evening gacha into Late Night inflicts direct morning fatigue (reduced HP/well-being on waking, feeding into the LEDGER-10 degradation gradient), preserving morning agency rather than skipping the phase.

---

### 2. Consequence Map & Coordinating Boundaries
- **Plan 29 Coordination:** Numeric HP deltas, food price $M$, shift wage $W$, rent balance $R_{due}$, and specific sub-critical health thresholds (e.g., 70 HP cutoffs) remain provisional inputs for Plan 29 calibration.
- **Orchestration Social Dynamic:** Social consequences for pawning furniture or deteriorating apartment conditions coordinate with the orchestrator's active social design strand.
- **Receipt Schema:** Confirmed that voluntary pawn actions (`action: pawn_item`), health collapses (`action: health_collapse`), and missed shifts (`action: miss_shift`) emit distinct factual log events without moralizing.

---

### 3. Work Status & Relay
- **Independent work proceeding:** Consolidating LEDGER-01 through LEDGER-13 into a comprehensive life-lane rules specification table inside the Plan 37 report directory.
- **Dependencies held:** Production code changes, save migrations, and numerical constants.

#### Relay for Root / Orchestrator
> "Please review this third design-pilot checkpoint for implication/consistency gaps, preserving the owner's selected preferences. Return record/clarify/check/scope dispositions, not a full redesign."
