### Plan 04 Preflight Check & Refinement Proposal

Per the assignment workflow in `AGENTS.md` and [`owner-refinement-01.md`](file:///c:/AI/Quackpot/reports/development/plan-04-svg-rig-and-sound/owner-refinement-01.md) (*"Before executing refinement, follow the packet check and actual assignment/status workflow; never self-close or push"*):

---

### 1. Preflight Check

Running the required status check:
```bash
node scripts/dev/plan-status.js check plan-04
```
**Result:**
```text
BLOCKED: plan-04 has status "delivered" — not ready or in-progress
```
Under the implementer contract, an implementer cannot modify frontmatter status or implement a blocked packet. Please have the orchestrator or owner set `plan-04` to `in-progress` (or `ready`) so implementation can proceed.

Below is the concrete proposal for the requested **Art Direction** and **Sound Audition** refinements for owner review before code mutation.

---

### 2. Art Direction Refinement: Visible Paper Construction (E2)

Per `owner-refinement-01.md`, we will enhance the vector construction to make the duck look assembled from distinct physical paper cutouts rather than painted flat shading, while preserving all existing proportions, palettes, hats, accessories, and hierarchy:

#### A. Geometric Stepping & Overlap
1. **Three Wing Sublayers (Distinct Stepped Contours & Tones):**
   - In the current baseline, the middle and top wing contours nearly coincide. We will widen the geometric step between the three pieces so each layer exposes a 4–6px visible paper strip:
     - **Under-feather piece (`wing-under`):** Broadest base silhouette, filled with dark shadow paper tone (`--duck-wing-shadow`).
     - **Mid-feather piece (`wing-mid`):** Intermediate stepped contour, filled with an intermediate paper tone (`--duck-wing-mid`), distinctly visible beneath the top cover.
     - **Top-cover piece (`wing-top`):** Main curved paper piece with a narrow cast-shadow strip along its bottom edge casting onto the mid-feather.
   - All three sublayers remain grouped under common pivot `(52, 56)`.
2. **Exposed Cardstock Backing Contours:**
   - The body and head will feature broad backing paper shapes with visible bottom-right offset edges (simulating cardstock backing under upper-left lighting).
3. **Seam & Contact Shadows:**
   - Narrow contact/occlusion paper shadows will be placed explicitly at physical overlap seams:
     - Where the head sits over the body/chest.
     - Where the wing sits over the body flank.
     - Where the bill card attaches over the cheek paper.
   - Shadows will be placed on top of the underlying receiving piece rather than hidden beneath their own opaque fill.

#### B. Matched Comparison in the Review Gallery
The review gallery will present three side-by-side modes using the unadorned Classic Yellow base:
- **Mode A (Baseline):** The existing delivered rig.
- **Mode B (Strong Geometric Paper Separation):** Stepped wing contours, exposed backing card edges, and crisp flat offset paper shadow strips (pure vector, zero filters).
- **Mode C (Restrained Hybrid):** Mode B geometry plus subtle, highly localized soft contact shadows (`feDropShadow` or Gaussian blur with `stdDeviation="0.8"`) applied *only* at the head-to-body, wing-to-body, and bill-to-cheek seams (no overall duck halo or plastic gradients).

---

### 3. Sound Synthesis Refinement: Audition Candidates

The current `QUACK_SHORT` uses a continuous linear frequency sweep (340 Hz to 200 Hz) with 22 Hz sine FM modulation, which creates a retro electronic sci-fi tone rather than a cartoon duck voice.

#### Missing Capabilities Identified
A recognizable cartoon duck quack requires:
1. An articulated amplitude envelope (percussive onset and fast tail, rather than an extended smooth synth sustain).
2. Acoustic formant resonances (band-pass/peaking emphasis around ~700 Hz and ~1600 Hz) to simulate nasal vocal cavity filtering instead of raw unfiltered sawtooth harmonics.
3. A tiny, subtle unpitched breath/burst transient at the start of the bill articulation.

#### Proposed Three-Way Audition Set
We will present three candidates with stable A/B/C IDs, one-click audition buttons, and calibrated perceived volume:

1. **Candidate A: `QUACK_A_CONTROL` (Baseline Control)**
   - The current baseline retained verbatim as the audition control.
   - *Parameters:* 340 Hz sawtooth, -140 Hz linear glide over 220ms, 22 Hz sine FM modulator, 0.15 peak gain.

2. **Candidate B: `QUACK_B_SYNTH_ADSR` (Parameter-Only Revision)**
   - Stays entirely within the existing oscillator/envelope engine (no new node types).
   - Removes the continuous siren slide and 22 Hz modulation.
   - Uses a sharp 5ms attack, an immediate pitch drop in the first 25ms (the "kw" attack transient), followed by a short stable vowel sustain and a snappy 40ms release.
   - Produces a punchier, less electronic cartoon chirp.
   - *Parameters:* 380 Hz sawtooth, -60 Hz initial bend, 5ms attack, 60ms decay, 0.18 sustain, 40ms release (total ~0.11s), gain 0.14.

3. **Candidate C: `QUACK_C_FORMANT_NOISE` (Source-Filter with Resonant Formants & Breath Transient)**
   - Small native Web Audio extension using standard `BiquadFilterNode`:
     - **Excitation:** Buzzy sawtooth oscillator (~300 Hz) plus a deterministic 15ms white-noise breath burst for the beak click.
     - **Formants:** Two native `BiquadFilterNode` filters emphasizing duck-like nasal bands:
       - Formant 1: ~750 Hz (Q: 3.5), sweeping slightly to 620 Hz.
       - Formant 2: ~1650 Hz (Q: 4.0).
     - **Envelope:** Rapid attack and resonant decay (total ~0.18s).
     - Level-matched to 0.15 peak gain. Zero external libraries, zero audio downloads, and deterministic noise buffer seeding independent of game outcome PRNG.

---

### 4. Next Step

Once `docs/development/plan-04-svg-rig-and-sound.md` is transitioned from `delivered` to `in-progress` by the orchestrator/owner, I will implement this proposal across `src/core/duck-rig.mjs`, `src/audio/synth.mjs`, the parity tests, and regenerate `preview.html` via `npm run build:plan-04`.
