# Plan 40 · Decision Ledger

**Last Updated**: 2026-10-31  
**Lead**: Gemini Flash (Plan 40)  

This ledger strictly separates verified owner choices from implementer interpretations, working proposals, and unresolved cross-packet boundaries.

---

## 1. Verified Owner Choices

| Item ID | Date | Topic | Owner Decision | Source |
| :--- | :--- | :--- | :--- | :--- |
| **OWN-40-01** | 2026-10-31 | Treatment Direction | Selected **Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)** with future option for dedicated illustrated scenes. | Owner response to Plan 40 consultation |
| **OWN-40-02** | 2026-10-31 | Work/Commute Experiment | Include experimental variation: test whether more engaging/pleasant work and commute leads players toward self-care / restorative evening choices vs compensatory gacha indulgence. | Owner direction |
| **OWN-40-03** | 2026-10-31 | Evening Activity Effect | **Call Mom** provides a **minor restorative** effect (+5 HP). | Owner response to Plan 40 consultation |
| **OWN-40-04** | 2026-10-31 | Extra Shift Rewards | Extra shifts feature **flat rewards** with multiple shift types (e.g. diner cover, warehouse stock). | Owner response to Plan 40 consultation |
| **OWN-37-01** | 2026-10-31 | Shift Take-Home Baseline | Ordinary completed shift baseline take-home pay is **$60.00**. | Plan 37 Root Closeout / Plan 29 |
| **OWN-38-01** | 2026-10-30 | Life/Phone Separation | Phone invitation means opening the gacha; life actions stay diegetic in the apartment. | Plan 38 Owner Review 02 |
| **OWN-38-02** | 2026-10-30 | Rent vs Shift Decoupling | Extra shifts grant wages directly; they must never silently auto-pay rent. | Plan 38 Owner Review 02 |
| **OWN-010** | 2026-10-25 | Social Neutrality | Call Mom is personal/neutral catch-up; strictly NOT "Borrow from Mom". | Founding Design & Review |

---

## 2. Implementer Interpretations & Structural Mapping

| Topic | Implementer Interpretation | Context & Rationale |
| :--- | :--- | :--- |
| **Vignette Pacing** | Text cards with immediate keyboard/click advance; no countdown timers. | Preserves Hard Constraint #4 (no forced artificial waiting periods) while allowing literary rhythm. |
| **Visual Lighting Shifts** | Morning departure (neutral/morning) → Workplace/Commute overlay → Evening apartment (warm amber lamp / dusk window) → Night apartment (deep shadows / desk lamp only). | Leverages existing SVG lighting kit without requiring unapproved raster assets. |
| **Desk Anchors** | In the evening apartment, the desk presents three natural interaction zones: Phone (Call Mom / Gacha), Physical Duck (quiet companionship), and Notepad (rent/budget review). | Keeps life actions situated in the 3D room coordinates established in Plan 28. |

---

## 3. Working Proposals (Awaiting Later Formal Integration)

| Proposal ID | Proposal | Status | Impacted Scope |
| :--- | :--- | :--- | :--- |
| **PROP-40-01** | Evening HP Restoration Cap: Call Mom restores +5 HP, up to a maximum of 100 HP. | Working Proposal in Storyboard | Plan 38 engine progression model |
| **PROP-40-02** | Extra Shift Health Tiers: −10 HP to −15 HP depending on shift intensity. | Working Proposal in Storyboard | Plan 38 engine progression model |
| **PROP-40-03** | Commute Condition Determinism: Commute mood may be influenced by day number or seeded event deck. | Prototype Experiment | CourseVGD student usage file analysis |

---

## 4. Unresolved Cross-Packet Boundaries

- **Plan 38 Integration**: Codex is currently integrating the core phase progression and obligation resolver in `src/core/`. Plan 40's storyboard provides the exact UX/copy contracts for departure, shift completion, return home, and evening activities, which Plan 38 will wire into production controllers.
- **Plan 41 Ren Coordination**: Ren's social messages and peer dynamics operate in parallel in Plan 41 Sonnet. Mom's call remains an independent family anchor, leaving Ren's conversation trees to Plan 41.
