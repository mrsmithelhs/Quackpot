# Plan 40 · Owner Direction and Treatment Selection

**Date**: 2026-10-31  
**Authority**: Owner consultation & Root Checkpoint 01  
**Lead Implementer**: Gemini Flash (Plan 40)  

---

## 1. Selected Experience Treatment & Visual Boundaries

- **Treatment Selection**: **Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)**.
- **Visuals Scope Boundary**:
  - *In-Scope for Plan 40*: Report-local visual storyboarding using existing apartment SVGs, ambient visual backdrops (silhouetted warehouse trusses, transit window frames, rain streaks, golden sunset foliage) played behind text notifications, and responsive layout testing.
  - *Future Asset Gate*: Commissioning or drawing full production SVG/raster artwork for external workplaces and city streets is outside Plan 40 and requires a future bounded art brief and owner selection.
- **Sound Design Requirement**:
  - Environmental audio in work and commute environments aligning with the tone of each beat (coordinated with Plan 39 Web Audio laboratory and Plan 18 Creative Commons audio).

---

## 2. Narrative Beat Scale, Author Tone & Compact Hex Schema

- **Author-Assigned Experiential Tone (1–5)**:
  - Vignettes are coded by author-assigned tone (1=Very Depleting, 2=Mildly Depleting, 3=Neutral/Routine, 4=Pleasant/Uplifting, 5=Very Energizing), representing the intended tone of the fiction rather than measured player mood.
- **3-Digit Hex Identifier**:
  - Every beat receives a unique 3-digit hexadecimal code (`0x000` to `0xFFF`, e.g. `#011`, `#014`, `#0C4`, `#F05`), allowing up to 4,096 distinct beats.
- **Compact Run-Usage Storage**:
  - Logged in run files as compact tuples `[hexId, rating]` (e.g. `[["012", 2], ["014", 4], ["0C4", 4]]`).
  - Pre-choice exposure scores are calculated strictly from work and commute beats experienced *before* the evening room choice; post-choice extra shift outcomes are never folded backward into the predictor.
- **Catalog Scaling Targets**:
  - Structured for 100+ work beats, 100+ commute beats (including commute-in and commute-home), and 30+ extra shifts with 5 standalone alternative vignettes each.

---

## 3. Work Timing & Payroll Realism

- **Afternoon Shift Anchor**:
  - Ordinary work runs as a single committed afternoon life anchor (`d1_afternoon`).
  - Commute-in and commute-home are experienced as narrative subscenes within this single committed anchor, avoiding extra phase costs or artificial clock drift.
- **Financial Baseline & Payslip Honesty**:
  - $60.00 cash take-home is the owner-selected completed-shift baseline.
  - The $88 gross and $28 deduction on the payslip are purely fictional flavor text, with direct $60 cash disbursed to wallet.

---

## 4. Daily Extra Gigs & Shifts Policy

- **Availability & Stability**:
  - Evening presents **1–2 randomized extra shift options**, weighted toward frequent gig work (QuickDrop food delivery, Harbor Fresh grocery delivery).
  - Offers persist stably across viewing and reloads for that day.
- **Exclusivity**:
  - Accepting an extra shift is an exclusive evening commitment that transitions the day to night/rest, preventing infinite same-night grinding.
- **Decoupled from Rent & Payout Honesty**:
  - Earning shift cash **never** automatically pays or alters the pending rent notice on the fridge.
  - Stated payouts strictly match credited cash with zero unbudgeted contradictory tips.
- **Job-Loss Fallback**:
  - Gig delivery apps remain available on the phone even if regular warehouse shifts are missed or terminated.

---

## 5. Evening Activities

- **Call Mom**: Minor restorative (+5 HP), authentic non-transactional family check-in (strictly distinct from deferred "Borrow from Mom").
- **Sit with Duck**: +2 HP quiet companionship at the desk.
- **Open Quackpot**: Factually framed as opening the gacha app, without pre-classifying it as failure or moral failing in the student UI.
