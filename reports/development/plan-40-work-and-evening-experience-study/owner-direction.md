# Plan 40 · Owner Direction and Treatment Selection

**Date**: 2026-10-31  
**Authority**: Owner in direct consultation  
**Lead Implementer**: Gemini Flash (Plan 40)  

---

## 1. Selected Experience Treatment & Visual Scope

- **Treatment Selection**: The owner selected **Treatment 3 (Atmospheric Micro-Fiction / Lived Pacing & Commute Vignette)**.
- **Visuals Scope Boundary**:
  - *In-Scope for Plan 40*: Report-local visual storyboarding using existing apartment SVGs, ambient visual backdrops (silhouetted warehouse trusses, transit window frames, weather streaks, lighting overlays) played behind text notifications, and responsive layout testing.
  - *Future Asset Gate*: Commissioning or drawing a full production SVG or raster artwork library for external workplaces and city streets is out of scope for Plan 40 and requires a future bounded art authoring brief and owner selection.
- **Sound Design Requirement**:
  - The owner noted a future need for environmental sound design across work and commute phases, aligning audio cues (fluorescent ballast buzz, rain on transit glass, upbeat radio pop, birds in the park) with the experiential quality of each beat (coordinated with Plan 39 Web Audio laboratory and Plan 18 Creative Commons audio).

---

## 2. Narrative Beat Granularity, Likert Rating & Compact Hex Schema

- **5-Point Likert Scale**:
  - Each narrative beat is categorized with a 1–5 perception score:
    - **1 = Very Depleting / Negative**: Heavy physical strain, hostile supervision, severe weather/slush, intense transit delay.
    - **2 = Mildly Depleting / Dull**: Monotony, sore heels, cold drizzle, cramped standing room, digital isolation.
    - **3 = Neutral / Uneventful**: Steady routine flow, neutral weather, clock ticking predictably.
    - **4 = Pleasant / Uplifting**: Classic pop on warehouse radio, shared lemon pastry, slanted golden sunlight through park trees.
    - **5 = Very Uplifting / Energizing**: Autonomy, problem mastery, supervisor praise, helping an elderly neighbor on subway stairs.
- **3-Digit Hex Identifier**:
  - Every beat receives a unique 3-digit hexadecimal code (`0x000` to `0xFFF`, e.g. `#011`, `#014`, `#0C4`, `#F05`), allowing up to 4,096 distinct beats.
- **Compact Run-Usage Storage**:
  - Stored in student run files as compact tuples `[hexId, rating]` (e.g. `[["012", 2], ["014", 4], ["0C4", 4]]`) with an overall daily average score, maximizing space efficiency for offline file export.
- **Catalog Scaling Targets**:
  - Architecture structured for:
    - **100+ Ordinary Work Beats** (spanning strain, routine, social connection, mastery, praise).
    - **100+ Commute Beats** (spanning commute-in and commute-home, weather, transit, acts of kindness).
    - **30+ Extra Shifts**, each containing at least **5 distinct narrative beats** (rated 1–5).
  - Current storyboard seeds a working sample of 5 work beats, 5 commute beats, and 5 extra shift types with 5 rated beats each (25 extra-shift beats).

---

## 3. Extra Shift Availability (1–2 Daily Offers Weighted Toward Gigs)

- **Presentation Model**:
  - Rather than displaying an exhaustive static board of all shifts, players receive **1–2 randomized options per day** on their phone or evening notice.
  - **Weighted Toward Frequent Gig Work**: Food delivery gigs (*QuickDrop*) and grocery dispatch gigs (*Harbor Fresh*) appear most frequently, while diner covers, warehouse overtimes, and courier rushes appear as occasional opportunities.
- **Decoupled from Rent**:
  - Shift cash (+take-home pay) is credited directly to the player's wallet; accepting a shift **never** auto-pays or alters the pending rent balance on the fridge.

---

## 4. Evening Activity: Call Mom

- **Selected Effect**: **Minor Restorative** (+5 HP).
- **Role**: Neutral, warm, grounding check-in about dinner, health, and daily life. Strictly **not** "Borrow from Mom" (the deferred financial escalation ladder).
