# Plan 04 Refinement Proposal — Visible Paper Construction & Quack Audition (Approved)

**Date:** 2026-10-25  
**Status:** Approved under `refinement-prebuild-review-01.md` with controlling conditions incorporated.

---

## 1. Scope & Bounded Refinement Objectives

- **Packet:** `plan-04` (status: `in-progress`, verified RUNNABLE).
- **Owner Feedback Addressed:**
  1. The duck base needs substantially more of E2's layered-paper character (visible paper cutouts with stepped contours, distinct wing layer tones, and seam contact shadows).
  2. The sound currently reads as a retro electronic effect rather than a recognizable cartoon quack.
- **Controlled Scope:**
  - Preserve all existing proportions, palettes, hats, accessories, and head/body attachment hierarchies.
  - No new cosmetic items, full roster production, animation production, or game UI integration.
  - Maintain the reproducible, source-backed gallery and master SVG derivation pipeline.

---

## 2. Art Direction Refinement: Matched Paper Construction Comparison

The gallery will present a matched three-way comparison using the unadorned Classic Yellow base:

### A. Mode A: Baseline Control (`paper-baseline`)
- The delivered baseline rig preserved as a clearly labeled historical vector snapshot for direct visual comparison.

### B. Mode B: Strong Geometric Paper Separation (`paper-geometric`)
Authoritative current composer (`src/core/duck-rig.mjs`) featuring:
1. **Three Stepped Wing Sublayers:**
   - Instead of nearly coincident contours, the three wing pieces feature distinctly stepped contours in 100×100 viewBox units:
     - `wing-under`: Broad base cardstock pointing back-down, filled with dark shadow tone (`--duck-wing-shadow`).
     - `wing-mid`: Intermediate card contour stepped ~3–5 units inward from under-wing, filled with intermediate tone (`--duck-wing-mid`).
     - `wing-top`: Top wing card stepped ~3–4 units inward from mid-wing, filled with primary wing fill (`--duck-wing-fill`), with a bottom-edge contact shadow casting down onto mid-wing.
   - All three sublayers rotate around common pivot `(52, 56)`.
2. **Exposed Cardstock Backing Contours:**
   - Body and head feature visible offset backing card edges along bottom-right contours (consistent with upper-left illumination).
3. **Contact Seam Paper Shadows:**
   - Explicit paper shadow shapes placed at physical overlaps:
     - Head-over-body seam shadow cast onto chest.
     - Wing-over-body seam shadow cast onto flank.
     - Bill-over-head seam shadow cast onto cheek.
   - Zero filter overhead; crisp, razor-sharp edges at all scales.

### C. Mode C: Restrained Hybrid (`paper-hybrid`)
- Incorporates Mode B geometry plus subtle, highly localized soft contact shadows (`feDropShadow` with `stdDeviation="0.8"`) applied *specifically* at the head-to-body, wing-to-body, and bill-to-cheek seams.
- No blurry overall duck halos or glossy rubber/plastic gradients.

---

## 3. Sound Synthesis Refinement: Three-Way Audition Contract

To replace the retro electronic slide with a recognizable cartoon quack, three candidates will be auditioned at matched perceived volume:

### Candidate A: `QUACK_A_CONTROL` (Baseline Control)
- Unchanged baseline signal path and parameters:
  - Waveform: `sawtooth`
  - Base Frequency: 340 Hz
  - Pitch Bend: -140 Hz (whole-duration linear slide)
  - ADSR: Attack 0.02s, Decay 0.12s, Sustain 0.05, Release 0.08s (Total: 0.22s)
  - Modulation: 22 Hz sine FM, Depth 35 Hz
  - Peak Gain: 0.15

### Candidate B: `QUACK_B_SYNTH_ADSR` (Parameter-Only Revision)
- Strictly parameter-only within the existing oscillator/envelope engine (no new nodes).
- Removes continuous siren slide and FM modulation; provides a punchy cartoon onset and snappy release:
  - Waveform: `sawtooth`
  - Base Frequency: 380 Hz
  - Pitch Bend: -40 Hz (gentle whole-duration bend)
  - ADSR: Attack 0.005s, Decay 0.06s, Sustain 0.15, Release 0.04s (Total: 0.105s)
  - Modulation: None (`modulationDepth: 0`, `modulationFreq: 0`)
  - Peak Gain: 0.14

### Candidate C: `QUACK_C_FORMANT_NOISE` (Source-Filter Audition Graph)
- Minimal native Web Audio source-filter extension using standard `BiquadFilterNode` and deterministic noise:
  - **Excitation 1 (Carrier):** Buzzy sawtooth oscillator (~300 Hz) with short subtle pitch drop (-30 Hz).
  - **Excitation 2 (Breath Burst):** Deterministic 15ms white-noise burst for the initial bill click/puff (generated via an isolated, seeded pseudo-random sequence, completely independent of game outcome RNG).
  - **Parallel Formant Resonators:**
    - Branch 1: `BiquadFilterNode` (type `'bandpass'`, frequency 750 Hz, Q 3.0) with dedicated branch gain.
    - Branch 2: `BiquadFilterNode` (type `'bandpass'`, frequency 1600 Hz, Q 3.5) with dedicated branch gain.
  - **Master Output:** Summed parallel branches route into the master ADSR envelope gain node (Attack 0.01s, Decay 0.08s, Sustain 0.05, Release 0.06s).
  - **Level Matching:** Calibrated to ~0.15 peak output for fair audition against A and B.

---

## 4. Pipeline, Parity & Verification

- `scripts/dev/build-plan-04-preview.mjs` regenerates `src/assets/svg/duck-rig.svg` from the authoritative current composer and updates `reports/development/plan-04-svg-rig-and-sound/preview.html`.
- Parity tests in `scripts/dev/plan-04-parity.test.mjs` assert:
  - Exact derivation of master SVG.
  - Inlined bundle parity for DuckRig and DuckSynth.
  - Stable one-click replay and scheduling for candidates A, B, and C.
  - Deterministic noise generation and headless silent fallback.
- `preview.html` provides side-by-side visual panels for Modes A, B, and C across 32px, 64px, 128px, 256px, and 3-way sound audition buttons.
