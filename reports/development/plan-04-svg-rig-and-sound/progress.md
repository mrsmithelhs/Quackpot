# Progress Report: Plan 04 Refinement 01 — Visible Paper Construction & Quack Audition

**Packet ID:** `plan-04`  
**Date:** 2026-10-24  
**Author:** Implementer Thread (Gemini / Antigravity)  
**Status:** Ready for Owner Look & Sound Audition Selection  

---

## 1. Overall Summary of Refinement 01

Per [`reports/development/plan-04-svg-rig-and-sound/refinement-prebuild-review-01.md`](refinement-prebuild-review-01.md) and [`owner-refinement-01.md`](owner-refinement-01.md), this thread executed the owner refinement directive to advance the vector rig toward the layered-paper aesthetic of concept E2 (`reports/development/plan-08-duck-visual-direction-prototypes/concepts/e2.jpg`) and to provide a bounded, 3-way quack audition comparison:

1. **Updated Durable Proposal (`reports/development/plan-04-svg-rig-and-sound/proposal-01.md`):**
   - Incorporated all controlling review conditions, explicitly documenting the visual paper comparison modes (Modes A, B, C), the 3 stepped wing sublayers, the paper tone palettes (`--duck-wing-mid`), exposed backing cardstock rims, and seam contact shadows.
   - Documented the 3 quack audition candidates, the deterministic seeded noise PRNG (independent of game RNG), parallel formant filters, level-matched peak gain, and fail-closed silent fallback.

2. **Visible Layered Paper Construction in `src/core/duck-rig.mjs`:**
   - **Stepped Wing Sublayers:** Redesigned the wing group into 3 visibly stepped paper sublayers:
     - Under-wing (`#duck-wing-under`): broad backing silhouette extending to x=79.
     - Mid-wing (`#duck-wing-mid`): intermediate card feather contour extending to x=74.
     - Top-wing (`#duck-wing-top`): foreground card feather contour extending to x=68.
   - **Stepped Paper Palette Tones:** Added distinct `--duck-wing-mid` across all 5 cosmetic palettes (`classic-yellow`, `mallard-green`, `bubblegum-pink`, `monochrome-noir`, `golden-legendary`) ensuring middle and top fills provide physical paper contrast rather than coinciding.
   - **Exposed Backing Cardstock Rims:** Added offset backing card contours beneath the body base (`#duck-body-backing-rim`) and head base (`#duck-head-backing-rim`), making pieces read as physically cut and glued cardstock rather than painted flat vector shapes.
   - **Seam Contact Shadows:** Implemented narrow upper-left contact occlusion shadows at physical overlaps:
     - Head-over-body join (`#duck-head-seam-shadow`)
     - Wing-over-body join (`#duck-wing-seam-shadow`)
     - Bill-over-cheek join (`#duck-bill-seam-shadow`)
   - **Paper Construction Modes (Matched 3-Way Visual Comparison):**
     - **Mode A (`baseline`):** Historical baseline control snapshot (2 wing layers, basic card rim, flat silhouette).
     - **Mode B (`geometric`):** Strong geometric paper separation (3 stepped wing sublayers, backing cardstock rims, stepped paper tones, crisp geometric seam shadows, zero SVG filter blur).
     - **Mode C (`hybrid`):** Mode B geometry plus restrained, localized soft contact shadows at joins (`#duck-seam-soft-head`, `#duck-seam-soft-wing`, `#duck-seam-soft-bill`) with tight standard deviation (`stdDeviation="0.8"`, `dx="-0.4"`, `dy="0.8"`, `opacity="0.35"`), avoiding broad whole-duck halos.
   - **Cosmetic Integrity:** Preserved all hats (Tiny Top Hat, Sailor Cap), accessories (Bow Tie, Monocle), and attachment anchors across all modes.

3. **Authoritative Master SVG Asset (`src/assets/svg/duck-rig.svg`):**
   - Derived 100% reproducibly via `getCanonicalMasterSvg()`, reflecting Mode B geometric paper separation on Classic Yellow base.
   - Byte-for-byte verified in automated test suite.

4. **Bounded Quack Sound Audition in `src/audio/synth.mjs`:**
   - Level-matched 3-candidate audition suite with peak gain normalized to conservative `0.15`:
     - **Candidate A (`QUACK_A_CONTROL`):** Historical 340 Hz downward sawtooth sweep (-140 Hz over 220ms, 22 Hz FM mod depth 35, peak gain 0.15) preserved unchanged as the control baseline.
     - **Candidate B (`QUACK_B_SYNTH_ADSR`):** Parameter-only articulated revision (sawtooth carrier, 280 Hz -> 180 Hz downward sweep over 180ms, no FM modulation, snappy 5ms attack, 40ms decay, 0.7 sustain, 40ms release envelope, peak gain 0.15).
     - **Candidate C (`QUACK_C_FORMANT_NOISE`):** Small source-filter audition graph with buzzy carrier (sawtooth base 240 Hz -> 170 Hz sweep), deterministic 15ms seeded noise burst (via LCG PRNG, completely decoupled from game outcome PRNG), and parallel `BiquadFilterNode` bandpass formant filters (F1 ~750 Hz Q=3.0, F2 ~1600 Hz Q=4.5) with short articulated envelope (8ms attack, 45ms decay, 0.65 sustain, 45ms release, peak gain 0.15).
   - Preserved gesture-based start/resume, silent fallback on missing or failed AudioContext, and no external runtime libraries or audio files.

5. **Updated Source-Backed Gallery (`scripts/dev/build-plan-04-preview.mjs` & `preview.html`):**
   - Rebuilt `reports/development/plan-04-svg-rig-and-sound/preview.html` via `npm run build:plan-04`.
   - Side-by-side matched visual comparison on identical Classic Yellow base, scale, and background for Mode A (Baseline), Mode B (Geometric Paper), and Mode C (Geometric + Restrained Soft Shadows).
   - Interactive 3-way quack audition panel with dedicated replay buttons for Candidate A, Candidate B, and Candidate C, accompanied by full parameter specifications.
   - Preserved multi-scale sizing checks (32px, 64px, 128px, 256px), background contrast checks, cosmetic permutations, and attachment rotation diagnostics.

---

## 2. Bounded File Ownership Verification

- **Owned files created or modified:**
  - `reports/development/plan-04-svg-rig-and-sound/proposal-01.md` (Updated durable proposal reflecting refinement review conditions)
  - `src/core/duck-rig.mjs` (Paper construction modes A/B/C, 3 stepped wing sublayers, palettes, seam shadows)
  - `src/core/duck-rig.test.mjs` (17 tests covering paper modes, stepped wings, palettes, master SVG derivation)
  - `src/audio/synth.mjs` (Quack audition candidates A, B, C; deterministic seeded noise; parallel formant filters)
  - `src/audio/synth.test.mjs` (10 tests covering audition candidates, deterministic noise buffer, silent fallback)
  - `src/assets/svg/duck-rig.svg` (Regenerated canonical derived master SVG)
  - `scripts/dev/build-plan-04-preview.mjs` (Updated preview builder with matched paper & quack audition UI)
  - `scripts/dev/plan-04-parity.test.mjs` (7 parity tests covering master derivation, source hashes, and audio contract)
  - `reports/development/plan-04-svg-rig-and-sound/preview.html` (Regenerated source-backed review page)
  - `reports/development/plan-04-svg-rig-and-sound/progress.md` (This refinement progress report)
- **Files untouched:**
  - Untracked file `reports/development/plan-12-guided-opening-and-shop-progression/wireframes-owner-interview.md` and Plan 12 materials remain untouched per commit discipline.
  - Game UI, `src/main.js`, and placeholder assets (`src/assets/duck-placeholder.svg`) remain completely untouched (no production game integration).
  - Simulation files and Plan 02/03 smoke test assumptions remain untouched.

---

## 3. Rendered Sizing, Background, and Acoustic Observations

### Visual Paper Construction Observations Across Modes & Sizing
- **Mode A (Baseline):** Serves as a clear benchmark. While readable, the flat silhouette lacks physical layering; the wing reads as a single block with painted accents, and the join between head and body is purely contour-based.
- **Mode B (Strong Geometric Paper Separation):** Substantially captures the E2 cardstock character. The exposed backing cardstock rims on head and body instantly establish physical cutout borders. The 3 stepped wing sublayers (under-wing extending to x=79, mid-wing to x=74, top-wing to x=68) in distinct paper tones (`--duck-wing-shadow`, `--duck-wing-mid`, `--duck-wing-fill`) clearly show physical card strata. Seam contact shadows at head-over-body and wing-over-body create crisp, clean separation without any blur.
- **Mode C (Strong Geometric + Restrained Soft Seam Shadows):** Localized Gaussian blur (`stdDeviation="0.8"`) applied strictly at the 3 physical seams (head join, wing join, bill join) adds subtle ambient occlusion depth while leaving the exterior silhouette completely sharp.
- **Multi-Scale Sizing (32px, 64px, 128px, 256px):**
  - **32px Icon Scale:** Evaluated on dark (`#0F172A`), light (`#F8FAFC`), and pond blue (`#0284C7`) grounds. Mode B and Mode C retain crisp silhouettes; micro seam shadows drop out cleanly without muddying the icon.
  - **64px Avatar Scale:** Backing rims and stepped wing layers are clearly distinguishable.
  - **128px & 256px Dialog Scale:** Physical card cutout character is unmistakable. Viewers can easily trace which piece sits over which.
- **Attachment Diagnostics:** Verified that head tilt (12°) correctly carries head backing rim, bill seam shadow, eye, and accessories as a rigid group. Wing paddle (-18°) pivots all 3 sublayers around `(52, 56)`.

### Acoustic Audition Observations
- **Candidate A (`QUACK_A_CONTROL`):** Continuous downward pitch glide (-140 Hz) and 22 Hz FM modulation produce a distinct 8-bit laser/retro arcade synthesizer tone.
- **Candidate B (`QUACK_B_SYNTH_ADSR`):** Removing FM modulation and applying a snappy ADSR envelope (5ms attack, 40ms decay, 40ms release) produces a tighter, more articulated electronic blip.
- **Candidate C (`QUACK_C_FORMANT_NOISE`):** Dual bandpass formant resonators (F1 ~750 Hz, F2 ~1600 Hz) combined with a deterministic 15ms seeded noise burst introduce clear vocal resonance and breath/reediness, shifting the character significantly away from 8-bit synth toward a recognizable cartoon quack.
- **Note on Audition:** Node scheduling, gain safety (0.15 peak), and silent fallback are fully verified by automated tests. Final aesthetic preference among Candidates A, B, and C is reserved for owner listening.

---

## 4. Commands Run and Validation Results

- `node scripts/dev/plan-status.js check plan-04`: Exit 0 (`RUNNABLE: plan-04 is ready to implement`).
- `node scripts/dev/plan-status.js lint`: Exit 0 (`lint: OK (no violations)`).
- `node scripts/dev/build-plan-04-preview.mjs`: Exit 0 (Master SVG derived, preview.html compiled and written).
- `node --test src/core/duck-rig.test.mjs`: Exit 0 (17 passing tests).
- `node --test src/audio/synth.test.mjs`: Exit 0 (10 passing tests).
- `node --test scripts/dev/plan-04-parity.test.mjs`: Exit 0 (7 passing tests).
- `cmd.exe /c "npm test"`: Exit 0 (132 passing tests across 11 test suites).

---

## 5. Advisor Consultation Declaration

**Branch C — not advisor-capable (fail-closed, orchestrator-gate-only):**
- **Evaluation:** Consulted `advisor-capable-providers.json`. This thread operates on Google DeepMind Antigravity / Gemini, which is not listed as an advisor-capable provider in `advisor-capable-providers.json`.
- **Rule applied:** Per AGENTS.md Step 1 fail-closed rule (*"If you cannot confidently match yourself to an entry in that file, treat yourself as not advisor-capable"*), Branch C applies.
- **Posture:** Orchestrator-gate-only. No advisor child was spawned. Full review authority remains with the orchestrator/owner.

---

## 6. Ready for Owner Look & Sound Audition Selection

- **Status:** Ready for Owner Audition and Review.
- **Artifacts for Inspection:**
  - Standalone Source-Backed Gallery: `reports/development/plan-04-svg-rig-and-sound/preview.html`
  - Canonical Derived Master SVG: `src/assets/svg/duck-rig.svg`
  - Source Modules: `src/core/duck-rig.mjs` and `src/audio/synth.mjs`
  - Durable Proposal: `reports/development/plan-04-svg-rig-and-sound/proposal-01.md`
- **Owner Decisions Required:**
  1. Paper construction mode selection: Mode A (Baseline Control), Mode B (Strong Geometric Paper Separation), or Mode C (Geometric + Restrained Soft Seam Shadows).
  2. Sound audition selection: Candidate A (Baseline Control), Candidate B (Articulated ADSR Synth), or Candidate C (Resonant Formant + Seeded Noise).
