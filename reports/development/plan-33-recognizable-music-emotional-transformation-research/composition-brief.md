# Plan 33 → Plan 32: Practical Composition & Paired-Listening Brief

**Date:** 2026-10-28 (system clock; updated by Gemini 4 Argon integrator)
**Scope:** Actionable specification for a **later, owner-gated composition and paired-listening experiment in Plan 32**. This brief contains **no score, no audio files, no synthesis code, no library selection, and no runtime story-state schedule**. Approving this brief authorizes only the composition and owner-only listening test (Stage A decisions in `recommendation.md`), without locking in future runtime fade timings or triggers (Stage B).

---

## 1. What to Compose for the Experiment

Compose **one original gacha hook** (plus **one foil hook** of similar style/length for identity calibration) and render a small, controlled set of variants:

1. **The Hook (Identity Core):**
   - A short, memorable melody of **5–9 notes per phrase** over an **8-bar loop in 4/4** (or 16-bar A/A′ if testing repetition fatigue), written from scratch with zero borrowed fragments.
   - **Pass the "V0 Bare-Melody Test" (`[P]`: HOYO-MiX / Yu-Peng Chen 2020; Lena Raine 2018):** Before writing any chords or bass, verify that the unaccompanied single-voice melody has a distinctive rhythmic onset profile and pitch contour that is recognizable on its own. Why? Pitch contour/intervals (`[E-abs]`: Dowling & Fujitani 1971) and intact rhythm (`[E-full]`: Kuusi 2009, where stripping rhythm cost 15–34 recognition points) carry identity for non-musicians (`[E-abs]`: Mélen & Deliège 1995).
2. **Variants to Render (All Matched to the Same Integrated Loudness in LUFS/RMS):**
   - **V-Base:** Bright, consonant diatonic triads (I, IV, V), normal mid-bass register, steady pulse, clear authentic cadence at bar 8.
   - **V-Foil:** A *different* original melody using the exact same tempo, key, lead timbre, and Base accompaniment style (calibrates "different tune" ratings).
   - **V-Uneasy (Approach 2):** Identical hook pitches, rhythm, tempo, key, and lead patch. Accompaniment uses **diatonic/modal-mixture substitutions** (`ii`, `vi`, `iv`, $\flat\text{VI}$) with **one unexpected chord** (`[E-full]`/`[E-abs]`: Liu 2018; Steinbeis et al. 2006), a **hollow texture** (thinned midrange over a low minor-3rd modal drone: `[E-full]`: Trevor et al. 2023; Bostwick et al. 2018), **dynamic swells/dropouts** ($\pm 6\text{ dB}$ internal variability at matched integrated LUFS: `[E-full]`: Trevor et al. 2023), and a **withheld half/deceptive cadence** at bar 8 (`[E-full]`: Sears et al. 2020; Choi & Fujioka 2025). Avoid groove syncopation (`[E-full]`: Keller & Schubert 2011).
   - **V-Dire-2A (Approach 2, Clean Lead):** Identical hook pitches, rhythm, tempo, key, and **untouched Base lead patch**. Accompaniment drops the bass to **55–110 Hz with 110–240 Hz harmonic saturation** (audible on laptop/Chromebook speakers: `[E-full]`: Huron et al. 2006; Granot & Eitan 2011), introduces **30–150 Hz psychoacoustic roughness and inharmonicity** in clashing tritone/minor-second pad voicings (`[E-full]`: Farbood & Price 2017; Pressnitzer et al. 2000; Trevor et al. 2020, 2023), and leaves bar 8 unresolved. *(Optionally render a sparse/exposed backing sub-variant vs. a dense $>3$ events/s backing sub-variant to test Silvey 2011 vs. Trevor et al. 2023.)*
   - **V-Dire-2B (Approach 2, Within-Patch Filtered Lead):** Identical to **V-Dire-2A**, except the lead synth patch receives **subtle within-patch low-pass filtering or mild detuning** (`[E-abs]`: Lim & Goh 2012 within-family timbre preservation; `[P]`: Korb 2020; Ueda 2017).
   - **V-Dire-3 (Credible Alternative — Approach 3):** Drops the lead melody by 1 octave (`[E-full]`: Eerola et al. 2013; Huron et al. 2006), inflects major thirds/sixths toward minor/Phrygian (`[P]`: Raine 2018 *Celeste*), and adds subtle beat hesitation (`[E-full]`: Trevor et al. 2023 low pulse clarity).

---

## 2. Representation, Grid, and Memory Budget Arithmetic (`[T]`)

| Parameter | Proposal | Evidence / Technical Basis |
|---|---|---|
| **Source representation** | Deterministic text note/event data (bar, beat, MIDI pitch, duration, velocity) + per-state chord/voicing/filter parameters | Allows exact reproduction, loudness matching, and either offline stem export or local Web Audio synthesis (`src/audio/synth.mjs`) in Plan 32. |
| **Loop grid** | **8 bars of 4/4** at ~96–108 bpm ($\approx 17.8\text{–}20.0\text{ s}$; $19.2\text{ s}$ at 100 bpm), or **16-bar A/A′** ($\approx 38.4\text{ s}$) | Short loops (~15 s) over 20 min of play trended toward time overestimation and fatigue in pilot testing (`[E-full]`: McNamara et al. 2022), and repetition is a top cause of player muting (`[E-full]`: Rogers & Weber 2019, $N=737$). An A/A′ 16-bar loop or subtle per-loop filter/velocity micro-variation (`[E-abs]`: Worrall 2025) reduces verbatim fatigue. |
| **Seam & alignment** | Bar-aligned loop boundaries; zero reverb/release tail crossing bar 8 unrendered; state switches quantized to measure downbeats (`every measure`) | Measure-quantized switching is shipped practice (`[P]`: Korb 2020 *Hades*); prevents rhythmic seam glitches. |
| **Decoded PCM arithmetic** | At 48 kHz stereo float32 ($384,000\text{ B/s}$), one $19.2\text{ s}$ stem $\approx 7.37\text{ MB}$ ($3.69\text{ MB}$ mono) | **3 pre-rendered full mixes** (Base, Uneasy, Dire) $\approx 22.1\text{ MB}$ stereo. **5 stems** (shared lead, shared rhythm, 3 state accompaniments) $\approx 36.9\text{ MB}$ stereo (or $\approx 22\text{ MB}$ if lead/bass are mono). Procedural synthesis from note tables requires near-zero buffer memory. |

---

## 3. Small Owner-Only Paired-Listening Protocol (Not Run in Plan 33)

- **Listener:** The **owner only** (no students, no external subjects, no telemetry).
- **Playback hygiene:** Fixed listening volume on the owner's reference headphones **and** a second quick check on a built-in laptop/phone speaker (to verify that the 55–110 Hz + 110–240 Hz bass register remains audible without subwoofers). All stimuli normalized to identical integrated loudness (LUFS/RMS) except Pair P5.

| Pair ID | Stimuli Compared | Owner Judgment Questions | Hypothesis / Gap Tested |
|---|---|---|---|
| **P1 — Reharmonization Identity** | `V-Base` (2 loops to establish theme: Pollard-Gott 1983) → `V-Uneasy` → `V-Dire-2A` | 1. *"Same tune?"* (1–5)<br>2. *"Did the melody stay clear?"* | Tests whether staged diatonic → chromatic/rough reharmonization preserves hook identity (`[E-full]`: Liu 2018). |
| **P2 — Foil Calibration** | `V-Base` → `V-Foil` | *"Same tune?"* (1–5) | Anchors the bottom of the "same tune" scale. |
| **P3 — State Ordering & Salience** | `V-Base` → `V-Uneasy` → `V-Dire-2A` (in order and shuffled) | 1. *Tension / dread* (1–7)<br>2. *"Is each step clearly noticeable?"* | Tests state ordering and Darren Korb's `[P]` "effectiveness bell curve" (steps must be clearly audible). |
| **P4 — Lead Timbre Nuance (2A vs. 2B)** | `V-Dire-2A` (clean lead) vs. `V-Dire-2B` (within-patch filtered/detuned lead) | 1. *"Same tune?"* (1–5)<br>2. *"Which sounds more genuinely dire vs. ironically mismatched?"* | Tests relaxing the strict lead-timbre freeze via within-family filtering (`[E-abs]`: Lim & Goh 2012). |
| **P5 — Sparse vs. Dense Dire** | `V-Dire-2B (Sparse/Exposed)` vs. `V-Dire-2B (Dense/Rough)` at matched LUFS, plus a $+3\text{ dB}$ louder check | *Tension / dread* (1–7) and *clarity* | Resolves **Silvey (2011)** (`[E-full]`, non-musicians rate sparse solo tenser) vs. **Trevor et al. (2023)** (`[E-full]`, terror cues are denser), and isolates loudness confound. |
| **P6 — Credible Alternative (Approach 2 vs. 3)** | `V-Dire-2B` vs. `V-Dire-3` (octave drop + minor inflection + pulse hesitation) | 1. *"Same tune?"* (1–5)<br>2. *Tension / dread* (1–7) | Measures whether Approach 3's extra expressive range is worth its stacked identity risk (`[E-full]`: Schellenberg & Habashi 2015). |
| **P7 — No-Change Re-Trigger Control** | `V-Base` → bar-aligned re-trigger of `V-Base` vs. `V-Base` → `V-Uneasy` | *Tension change* (1–7) | Controls for **Plut & Pasquier (2019)** (`[E-full]`, $N=30$), where any perceived adaptation/change shifted ratings relative to static playback. |
| **P8 — Repetition & Hardware Check** | Repeat each state loop 5× (~1.5 min) on headphones and laptop speakers | *"When does loop fatigue start, and does the low bass survive on laptop speakers?"* | Tests loop fatigue (`[E-full]`: Rogers & Weber 2019; McNamara et al. 2022) and >100 Hz transducer roll-off (`argon-f2`). |

---

## 4. Composition-Stage Owner Questions (Stage A Only)

To authorize Plan 32's composition experiment, the owner only needs to answer the three **Stage A** questions in `recommendation.md` §7:
1. Approve composing the single 8-bar hook + foil and rendering `V-Base`, `V-Uneasy`, `V-Dire-2A`, `V-Dire-2B`, and `V-Dire-3` for the owner-only listening test?
2. Confirm whether both **clean lead (`2A`)** and **within-patch filtered lead (`2B`)** (plus **octave/modal `3`**) should be included in the listening pairs?
3. Indicate whether **Base** should lean *peaceful/inviting* or *bouncy-arcade*, and whether **Dire** should test both *sparse/exposed* and *dense/rough* accompaniment textures?
