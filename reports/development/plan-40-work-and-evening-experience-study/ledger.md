# Plan 40 · Decision Ledger

**Last Updated**: 2026-10-31  
**Lead**: Gemini Flash (Plan 40)  

This ledger strictly separates verified owner choices from implementer interpretations, working proposals, and unresolved cross-packet boundaries.

---

## 1. Verified Owner Choices

| Item ID | Date | Topic | Owner Decision | Source |
| :--- | :--- | :--- | :--- | :--- |
| **OWN-40-01** | 2026-10-31 | Treatment Direction | Selected **Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)** with future option for dedicated illustrated scenes. | Owner consultation |
| **OWN-40-02** | 2026-10-31 | Work/Commute Experiment | Include experimental variation: test whether more engaging/pleasant work and commute leads players toward self-care / restorative evening choices vs compensatory gacha indulgence. | Owner direction |
| **OWN-40-03** | 2026-10-31 | Evening Activity Effect | **Call Mom** provides a **minor restorative** effect (+5 HP). | Owner consultation |
| **OWN-40-04** | 2026-10-31 | Extra Shift Rewards | Extra shifts feature **flat rewards** with multiple shift types (e.g. food gig, grocery gig, diner cover). | Owner consultation |
| **OWN-40-05** | 2026-10-31 | Author Tone & Hex ID | Narrative beats categorized on a **5-point author tone scale** (1=Depleting to 5=Energizing) with **3-digit hex IDs** stored in usage file as `[hexId, rating]`. | Owner direction / Root Checkpoint 01 |
| **OWN-40-06** | 2026-10-31 | Catalog Scaling | Architecture structured for **100+ work beats**, **100+ commute beats**, and **30+ extra shifts** (each with 5 standalone alternative vignettes). | Owner direction |
| **OWN-40-07** | 2026-10-31 | Daily Extra Shifts | Evening presents **1–2 randomized extra shift options per day**, weighted toward frequent gig work (food/grocery delivery). | Owner direction |
| **OWN-40-08** | 2026-10-31 | Audio/Sound Need | Work and commute environments require environmental sound design reflecting the experiential quality of each beat. | Owner direction |
| **OWN-37-01** | 2026-10-31 | Shift Take-Home Baseline | Ordinary completed shift baseline take-home pay is **$60.00**. | Plan 37 Closeout / Plan 29 |
| **OWN-38-01** | 2026-10-30 | Life/Phone Separation | Phone invitation means opening the gacha; life actions stay diegetic in the apartment. | Plan 38 Owner Review 02 |
| **OWN-38-02** | 2026-10-30 | Rent vs Shift Decoupling | Extra shifts grant wages directly; they must never silently auto-pay rent. | Plan 38 Owner Review 02 |
| **OWN-010** | 2026-10-25 | Social Neutrality | Call Mom is personal/neutral catch-up; strictly NOT "Borrow from Mom". | Founding Design & Review |

---

## 2. Implementer Interpretations & Structural Mapping

| Topic | Implementer Interpretation | Context & Rationale |
| :--- | :--- | :--- |
| **Work Anchor Pacing** | Ordinary work runs as an afternoon-sized anchor (`d1_afternoon`) with commute subscenes, rather than multi-phase scheduling. | Conforms to Plan 37 action model and root checkpoint review. |
| **Gig Exclusivity** | Taking an extra shift consumes the evening slot and transitions to night/rest. | Prevents unbounded same-evening grinding loops while preserving player agency. |
| **Pre-Choice Tracking** | Pre-choice exposure scores are calculated strictly before the evening room choice; post-choice outcomes are segregated. | Prevents statistical artifact where shift outcome is factored into prior exposure. |
| **Visual Scoping** | Ambient backdrops (warehouse trusses, transit window frames, weather) behind notifications are implemented in report prototype; full production scene illustrations are deferred to future art authoring brief. | Respects packet boundary against creating extensive unapproved production assets. |

---

## 3. Working Proposals (Awaiting Later Formal Integration)

| Proposal ID | Proposal | Status | Impacted Scope |
| :--- | :--- | :--- | :--- |
| **PROP-40-01** | Evening HP Restoration Cap: Call Mom restores +5 HP, up to a maximum of 100 HP. | Working Proposal in Storyboard | Plan 38 engine progression model |
| **PROP-40-02** | Extra Shift Health Tiers: −8 HP to −15 HP depending on shift intensity. | Working Proposal in Storyboard | Plan 38 engine progression model |
| **PROP-40-03** | Tone Tier Cutoffs: Depleting (1.0–2.2), Neutral/Routine (2.3–3.5), Uplifting (3.6–5.0). | Implemented in Tracker | CourseVGD student usage file analysis |

---

## 4. Unresolved Cross-Packet Boundaries

- **Plan 38 Integration**: Codex is currently integrating the core phase progression and obligation resolver in `src/core/`. Plan 40 provides recommended action interfaces and copy contracts.
- **Plan 39 / Plan 18 Sound Design**: Environmental audio cues for work and commute require coordination with Plan 39 Web Audio laboratory and Plan 18 Creative Commons audio.
- **Plan 42 Usage File Contract**: Compact serialization `[hexId, rating]` integrates with Plan 42 ZIP package format.
