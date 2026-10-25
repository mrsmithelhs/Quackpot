# Plan 04 Refinement Proposal — Visible Paper Construction & Quack Audition (Approved)

**Date:** 2026-10-25  
**Status:** Approved under `review-03.md` and `repair-02.md` with owner selection of Mode C and all three sound candidates.

---

## 1. Scope & Bounded Refinement Objectives

- **Packet:** `plan-04` (status: `in-progress`, verified RUNNABLE).
- **Owner Decisions Recorded (2026-10-25):**
  1. **Visual Selection:** Owner selected rendered Mode C (Restrained Hybrid) as the canonical master asset and composer default. Mode A (Baseline Control) and Mode B (Geometric Separation) are retained in the gallery for explicit matched comparison.
  2. **Audio Selection:** Owner requested retention of all three sound candidates (Candidate A: Baseline Control, Candidate B: Articulated ADSR Synth, Candidate C: Formants & Breath Noise). Owner observed Candidate C sounds noticeably softer due to dual bandpass filtering; context mixing is deferred to later scope.
- **Controlled Scope:**
  - Preserve all existing proportions, 3 accepted palettes (`classic-yellow`, `mallard-green`, `bubblegum-pink`), 2 hats (`tiny-top-hat`, `sailor-cap`), 2 accessories (`bow-tie`, `monocle`), and head/body attachment hierarchies.
  - No new cosmetic items, full roster production, animation production, or game UI integration.
  - Maintain the reproducible, source-backed gallery and master SVG derivation pipeline.

---

## 2. Art Direction Refinement: Matched Paper Construction & Selected Master

The gallery presents a matched three-way comparison using the unadorned Classic Yellow base:

### A. Mode A: Baseline Control (`baseline`)
- The delivered baseline rig preserved as a clearly labeled historical vector snapshot for direct visual comparison (flat silhouette, coincident wing layers, broad painted body shadow).

### B. Mode B: Strong Geometric Paper Separation (`geometric`)
Clean cardstock control featuring:
1. **Three Stepped Wing Sublayers:**
   - Instead of coincident contours, three wing pieces feature distinctly stepped contours in 100×100 viewBox units:
     - `wing-under`: Broad base cardstock pointing back-down, filled with dark shadow tone (`--duck-wing-shadow`).
     - `wing-mid`: Intermediate card contour stepped inward, filled with intermediate paper tone (`--duck-wing-mid`).
     - `wing-top`: Top wing card stepped inward, filled with primary wing fill (`--duck-wing-fill`), with a contact shadow casting down onto mid-wing.
   - All three sublayers rotate around common pivot `(52, 56)`.
2. **Exposed Cardstock Backing Contours:**
   - Body and head feature visible offset backing card edges along bottom-right contours (`#duck-body-backing-rim` and `#duck-head-backing-rim`), consistent with upper-left illumination.
3. **Contact Seam Paper Shadows:**
   - Geometric paper shadow shapes placed at physical overlaps:
     - Head-over-body seam shadow cast onto chest.
     - Wing-over-body seam shadow cast onto flank.
     - Bill-over-head seam shadow cast onto cheek.
   - Zero filter overhead; crisp, razor-sharp edges at all scales.

### C. Mode C: Selected Restrained Hybrid (`hybrid`) — Canonical Master
- **Owner-selected default asset and canonical master SVG.**
- Incorporates Mode B geometric paper construction plus localized soft drop shadows (`feDropShadow` with `stdDeviation="0.8"`) attached to the head and wing groups (`#duck-head-group` and `#duck-wing-group`).
- Casts subtle, physical contact shading over the body and wing sublayers without whole-duck outer blur or glossy plastic rendering.

---

## 3. Sound Synthesis: Three Audition Candidates & Bounded Contracts

Preserves all three stable presets with explicit gain coefficients and strict finite quack-scale bounds:

### Candidate A: `QUACK_A_CONTROL` (Baseline Control)
- Unchanged baseline signal path and parameters:
  - Waveform: `sawtooth`
  - Fundamental: 340 Hz
  - Pitch Bend: -140 Hz (whole-duration linear glide)
  - ADSR: Attack 0.02s, Decay 0.12s, Sustain 0.05, Release 0.08s (Total: 0.22s)
  - Modulation: 22 Hz sine FM, Depth 35 Hz
  - Gain Setting: 0.15 (AudioParam master gain coefficient)

### Candidate B: `QUACK_B_SYNTH_ADSR` (Parameter-Only Revision)
- Strictly parameter-only within the existing oscillator/envelope engine (no new nodes).
- Removes continuous siren slide and FM modulation; provides a punchy cartoon onset and snappy release:
  - Waveform: `sawtooth`
  - Fundamental: 380 Hz
  - Pitch Bend: -40 Hz (gentle whole-duration bend)
  - ADSR: Attack 0.005s, Decay 0.06s, Sustain 0.15, Release 0.04s (Total: ~0.105s)
  - Modulation: None (`modulationDepth: 0`, `modulationFreq: 0`)
  - Gain Setting: 0.14 (AudioParam master gain coefficient)

### Candidate C: `QUACK_C_FORMANT_NOISE` (Source-Filter Audition Graph)
- Minimal native Web Audio source-filter extension using standard `BiquadFilterNode` and deterministic noise:
  - **Excitation 1 (Carrier):** Buzzy sawtooth oscillator (300 Hz) with short subtle pitch drop (-30 Hz).
  - **Excitation 2 (Breath Burst):** Deterministic 15ms white-noise burst for the initial bill click/puff (isolated LCG PRNG, decoupled from game outcome RNG).
  - **Parallel Formant Resonators:**
    - Branch 1: `BiquadFilterNode` (type `'bandpass'`, frequency 750 Hz, Q 3.0, branch gain 0.85).
    - Branch 2: `BiquadFilterNode` (type `'bandpass'`, frequency 1600 Hz, Q 3.5, branch gain 0.65).
  - **Master Output:** Summed parallel branches route into the master ADSR envelope gain node (Attack 0.01s, Decay 0.08s, Sustain 0.05, Release 0.06s, Total: ~0.15s).
  - **Gain Setting:** 0.15 (AudioParam master gain coefficient).
  - **Acoustic Note:** The owner observed Candidate C sounds noticeably softer due to dual bandpass filtering; context mixing is deferred to later scope.

### Finite / Bounded Parameter Contract
- **Explicit Bounds Enforced in `validateSoundParams()`:**
  - Waveform: `sawtooth` | `triangle` | `sine` | `square`
  - Treatment: `control` | `param_only` | `source_filter`
  - Frequency: 20 Hz to 4000 Hz
  - Pitch Bend: -2000 Hz to 2000 Hz (ending frequency >= 20 Hz)
  - Envelope: Attack 0.001–0.5s, Decay 0.001–1.0s, Sustain 0.0–1.0, Release 0.001–1.0s, Total Duration <= 2.0s
  - Gain: 0.001 to 1.0 (coefficient)
  - Modulation: Freq 0–100 Hz, Depth 0–500 Hz
  - Formants: F1 50–3000 Hz (Q 0.1–20.0, gain 0.0–2.0), F2 100–6000 Hz (Q 0.1–20.0, gain 0.0–2.0)
  - Noise: Duration 0.001–0.2s, Gain 0.0–1.0
  - Rejects `NaN`, `Infinity`, negative, or extreme values synchronously before graph/buffer creation.
- **Direct Noise Helper Bounds (`createDeterministicNoiseBuffer`):**
  - Strictly bounds duration between 0.001s and 0.5s; sampleRate <= 192000 (maximum allocation <= 96,000 samples, ~384 KB).
  - Returns `null` safely when context is unavailable or invalid.

---

## 4. Pipeline, Diagnostics & Verification

- `scripts/dev/build-plan-04-preview.mjs` generates `src/assets/svg/duck-rig.svg` directly from `getCanonicalMasterSvg()` (Mode C hybrid) and compiles source-backed `reports/development/plan-04-svg-rig-and-sound/preview.html`.
- **Manual Pose Diagnostics:** Preview toolbar buttons trigger manual 12° head tilt and -18° wing paddle on the Section 3 diagnostic rig, scrolling/focusing it into view. Supports `prefers-reduced-motion: reduce`. Note that continuous looping and layer choreography belong to Plan 09.
- Parity tests in `scripts/dev/plan-04-parity.test.mjs` assert:
  - Exact byte-for-byte derivation of canonical master SVG (Mode C).
  - Embedded source provenance hashes and bundled `DuckRig`/`DuckSynth` parity.
  - Three-candidate parameter contract integrity, user-gesture resume, conservative gain, and silent fallback.
