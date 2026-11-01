# Plan 40 · Owner Direction and Treatment Selection

**Date**: 2026-10-31  
**Authority**: Owner consultation & Root Checkpoint Continuation 02 / 03  
**Lead Implementer**: Gemini Flash (Plan 40)  

---

## 1. Selected Experience Treatment & Plan 38 Closed Baseline Coordination

- **Treatment Selection**: **Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)**.
- **Coordination with Closed Plan 38 Baseline**:
  - **Morning Departure**: Player-visible departure occurs naturally in the morning phase (`d1_morning`) from the hallway/kitchen.
  - **Single Afternoon Work Anchor**: Scheduled work accounting is a single committed afternoon life anchor (`d1_afternoon`), with commute-in and commute-home experienced as narrative subscenes within that anchor.
  - **Day 1 Kitchen / Dinner Return**: Return home focuses first on the kitchen/dinner counter (setting keys and badge down, choosing maintenance dinner, collecting shift wages), before transitioning to evening desk anchors.
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
    - **Global ID Uniqueness**: All 52 authored hex IDs verified strictly unique across the entire catalog.
- **Pre-Choice Exposure Isolation & Display-vs-Outcome Tracking**:
  - Pre-choice exposure scores are calculated strictly from work and commute beats experienced *before* the evening room choice, tracked upon display on screen.
  - Empty pre-choice exposure (e.g. direct reviewer jump) is recorded as `unscored` (mean: `null`) and excluded from tone tier denominators.
  - Subsequent extra shift outcomes are recorded under `postChoiceBeats` only after the vignette is rendered on screen, never folded backward into the prior exposure predictor.

---

## 3. Daily Extra Gigs & Shifts Policy

- **Availability & Job-Loss Fallback**:
  - Evening presents **1–2 randomized extra shift options**, weighted toward frequent gig work (QuickDrop food delivery, Harbor Fresh grocery delivery).
  - Offers persist stably across viewing and reloads for that day as a proposed contract.
  - **Crucial Fallback Rule**: Gigs remain available on the phone even if regular warehouse shifts are missed or terminated.
- **One Exclusive Evening Anchor**:
  - Accepting an extra shift is an exclusive evening commitment that transitions the day to night/rest, preventing infinite same-night grinding.
  - One scenario records exactly one evening choice; alternative previews begin via an explicit fresh scenario / reset.
- **Decoupled from Rent & Payout Honesty**:
  - Earning shift cash **never** automatically pays or alters the pending rent notice on the fridge.
  - Stated payouts strictly match credited cash with zero unbudgeted contradictory tips.
- **Alternative Standalone Beats**:
  - The 5 beats per job are alternative standalone vignettes (one sampled exposure per actual shift), not a five-part sequence.
- **Candidate Values**: Cash gains ($35, $42, $45, $55, $40) and health fatigue costs (−8, −10, −15 HP) are working proposals pending future balance integration.

---

## 4. Kitchen Return & Maintenance Dinner Choice

- **Dinner Remains an Explicit Choice**:
  - Kitchen return does not silently establish free automatic dinner.
  - Presents an unresolved dinner reminder linking to minimal explicit meal choices:
    - *Eat Prepared Leftovers*: Maintenance meal ($0 cash, routine sustenance).
    - *Skip Dinner for Now*: Fatigue / lack of appetite ($0 cash, meal skipped).
  - Meals remain routine maintenance, not separate charged life anchors.

---

## 5. Evening Activities & Candidate Status

- **Call Mom**: Minor restorative (+5 HP, owner-selected), authentic non-transactional family check-in (distinct from deferred "Borrow from Mom"). Completing the call resolves that evening's commitment.
- **Sit with Duck**: +2 HP quiet companionship at the desk (working proposal). Resolves evening commitment.
- **Open Quackpot**: Factually framed as opening the gacha app launcher stand-in (no simulated play claimed). Resolves evening commitment.
- **Stateless Prototype Semantics**:
  - Prototype runs in-memory; page reload or 'Reset Scenario' resets state.
  - Cross-reload persistence is a proposed integration contract for Plan 38, not verified by this stateless prototype.
- **Proposed Export Adapter**:
  - Compact serialization schema is a proposed export adapter for `CATALOG_VERSION = '1.1.0'`, not an adopted Plan 42 ZIP schema.
