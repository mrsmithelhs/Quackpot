# Plan 40 · Owner Direction and Treatment Selection

**Date**: 2026-10-31  
**Authority**: Owner consultation & Root Checkpoint Continuation 02  
**Lead Implementer**: Gemini Flash (Plan 40)  

---

## 1. Selected Experience Treatment & Plan 38 Closed Baseline Coordination

- **Treatment Selection**: **Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)**.
- **Coordination with Closed Plan 38 Baseline**:
  - **Morning Departure**: Player-visible departure occurs naturally in the morning phase (`d1_morning`) from the hallway/kitchen.
  - **Single Afternoon Work Anchor**: Scheduled work accounting is a single committed afternoon life anchor (`d1_afternoon`), with commute-in and commute-home experienced as narrative subscenes within that anchor.
  - **Day 1 Kitchen / Dinner Return**: Return home focuses first on the kitchen/dinner counter (setting keys and badge down, having dinner and water, collecting shift wages), before transitioning to evening desk anchors.
- **Visuals Scope Boundary**:
  - *In-Scope for Plan 40*: Report-local visual storyboarding using existing apartment SVGs, ambient visual backdrops (silhouetted warehouse trusses, transit window frames, rain streaks, golden sunset foliage) played behind text notifications, and responsive layout testing.
  - *Future Asset Gate*: Commissioning or drawing full production SVG/raster artwork for external workplaces and city streets is outside Plan 40 and requires a future bounded art brief and owner selection.
- **Sound Design Requirement**:
  - Environmental audio in work and commute environments aligning with the tone of each beat (coordinated with Plan 39 Web Audio laboratory and Plan 18 Creative Commons audio).

---

## 2. Narrative Beat Scale, Author Tone & Catalog Ambition

- **Author-Assigned Experiential Tone (1–5)**:
  - Vignettes are coded by author-assigned tone (1=Very Depleting, 2=Mildly Depleting, 3=Neutral/Routine, 4=Pleasant/Uplifting, 5=Very Energizing), representing the intended tone of the fiction rather than measured player mood.
- **Catalog Scaling & Versioning (`1.1.0`)**:
  - Expanded catalog seeds:
    - **15 Ordinary Work Beats** (`#011`–`#01F`): Covering strain, equipment friction, noise, repetition, inventory tedium, steady flow, camaraderie, teamwork, problem mastery, and supervisor praise.
    - **12 Commute Beats** (`#0C1`–`#0CC`): Covering commute-in (transit delays, morning air, coffee cart kindness) and commute-home (digital isolation, subway hold, park sunlight, helping on stairs, evening bus jazz).
    - **5 Extra Shift Types with 5 Standalone Alternative Beats Each (25 beats)**: Food delivery, grocery dispatch, diner cover, freight overtime, and bike courier.
- **Pre-Choice Exposure Isolation & Unscored Handling**:
  - Pre-choice exposure scores are calculated strictly from work and commute beats experienced *before* the evening room choice.
  - Empty pre-choice exposure (e.g. direct reviewer jump) is recorded as `unscored` and excluded from the tone denominator while retaining session counts.
  - Subsequent extra shift outcomes are recorded under `postChoiceBeats` and are never folded backward into the prior exposure predictor.

---

## 3. Daily Extra Gigs & Shifts Policy

- **Availability & Job-Loss Fallback**:
  - Evening presents **1–2 randomized extra shift options**, weighted toward frequent gig work (QuickDrop food delivery, Harbor Fresh grocery delivery).
  - Offers persist stably across viewing and reloads for that day.
  - **Crucial Fallback Rule**: Gigs remain available on the phone even if regular warehouse shifts are missed or terminated.
- **One Exclusive Evening Anchor**:
  - Accepting an extra shift is an exclusive evening commitment that transitions the day to night/rest, preventing infinite same-night grinding.
- **Decoupled from Rent & Payout Honesty**:
  - Earning shift cash **never** automatically pays or alters the pending rent notice on the fridge.
  - Stated payouts strictly match credited cash with zero unbudgeted contradictory tips.
- **Alternative Standalone Beats**:
  - The 5 beats per job are alternative standalone vignettes (one sampled exposure per actual shift), not a five-part sequence.

---

## 4. Evening Activities

- **Call Mom**: Minor restorative (+5 HP), authentic non-transactional family check-in (strictly distinct from deferred "Borrow from Mom").
- **Sit with Duck**: +2 HP quiet companionship at the desk.
- **Open Quackpot**: Factually framed as opening the gacha app, without pre-classifying it as failure or moral failing in the student UI.
