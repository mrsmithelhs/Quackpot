# Plan 39 — Music and Conditioning Brief: Motif C Continuations, Voicing Architecture, and Reference Conditioning

**Date:** 2026-10-30  
**Status:** Working Research & Composition Specification  
**Lead Packet:** `plan-39-melody-reference-and-web-audio-laboratory`  
**Parent / Dependency Context:** Plan 32 (`plan-32-gacha-music-hook-and-arrangement-prototypes`), Plan 33 (`plan-33-recognizable-music-emotional-transformation-research`)  
**Target Environment:** Local Browser Web Audio Audition / Offline WAV Export Laboratory; External Reference Conditioning Workflow  

---

## Executive Summary

This brief establishes the musical, psychoacoustic, and technical architecture for Plan 39. Plan 39 exists to solve a critical empirical bottleneck identified in Plan 32 and Plan 33: the owner-selected two-bar gacha hook, **Motif C ("Lucky Ripple")**, has a duration of **4.92 seconds** (4.80 s musical phrase + 0.12 s release tail). When the owner attempted external reference conditioning in Suno, the service strictly rejected the file because it falls below the documented 6.00-second minimum upload threshold (`https://help.suno.com/en/articles/2477633`). Furthermore, earlier manual attempts in Plan 32 to extend Motif C to 8 bars (`S1`, `S2`, `S3`) failed owner listening due to sterile static drones, wandering non-thematic filler, and loss of the hook return. Concurrently, generation attempts in consumer Gemini Create Music yielded pleasant generic music that consistently failed to preserve the melodic contour of Motif C because consumer chat file uploads do not feed a waveform-conditioning adapter in the underlying generator.

This document grounds a four-part solution:
1. **Mathematical & Musical Exactness:** We establish the exact 10-event note specification of Motif C and demonstrate why an exact two-repetition phrase (`C0-repeat2x`, 9.72 s at 100 BPM) resolves the upload length limit cleanly with zero silence padding and zero tempo stretching.
2. **Diagnostic Critique of Rejected Extensions:** We dissect why `S1`–`S3` collapsed aesthetically, extracting core voice-leading principles for phrase extension across an octave-spanning tonic-closed hook.
3. **Motif-to-Phrase Craft & Web Audio Voicing Architecture:** Grounded in Plan 33's verified evidence framework (`[E-full]`, `[E-abs]`, `[E-sec]`, `[P]`, `[T]`, `[H]`), we specify three distinct C-derived phrase forms (`C1-period-lock`, `C2-call-and-breath`, `C3-accompaniment-groove`), an isolated foil comparison (`N1-sunny-waddle`), register allocations, spectral carving rules, and Web Audio synthesis constraints.
4. **External Reference Conditioning & Owner Recording Sheet:** We detail documented platform behavior for Suno (Cover vs. Extend, Audio Influence, prompt competition) and Gemini/Lyria, formalize a 5-factor diagnostic experiment matrix (`D1`–`D5`), and provide a copy-pasteable observation sheet for reproducible owner listening evaluations.

---

## 1. Provenance & Exact Motif C ("Lucky Ripple") Specification

### 1.1 Source Provenance & Verification

Motif C was composed and auditioned during Plan 32, where the owner selected it over Motifs A ("Prize Lantern") and B ("Pond Ticket") as the primary musical hook for the game's beginning-of-game state.

- **Symbolic Source Authority:** `reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/motifs.js`  
  *SHA-256:* `3b47ecdbda9de857bce9579ff946ff8c2bc3babfbee6614a984c85750af59e02`  
- **Rendered Reference Audio:** `reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/history/attempt-02/plan32-motif-c.wav`  
  *SHA-256:* `b76e9a2f0d357ba4c7c9fc313e54c4e0e621c2774c20bdae5295441d21de4bf6`  
- **Audio Format Specifications:** RIFF/WAVE PCM, 48,000 Hz, 16-bit linear PCM, stereo (2 channels).

### 1.2 Metric & Tonal Foundation

- **Key:** D Major (diatonic collection: D, E, F#, G, A, B, C#)
- **Tonal Center / Tonic:** `D` (`tonicMidi: 62` for D4, `tonicMidi: 74` for D5)
- **Meter:** 4/4 common time (4 quarter-note beats per measure)
- **Tempo:** 100.0 BPM
- **Beat & Bar Arithmetic (`[T]`):**
  - $1\text{ beat} = \frac{60.0}{100.0} = 0.600\text{ s}$
  - $1\text{ measure (bar)} = 4 \times 0.600\text{ s} = 2.400\text{ s}$
  - $2\text{ measures (phrase body)} = 8 \times 0.600\text{ s} = 4.800\text{ s}$
  - Synthesis envelope release tail $= 0.120\text{ s}$
  - Single-statement file duration $= 4.800\text{ s} + 0.120\text{ s} = \mathbf{4.920\text{ s}}$

### 1.3 Complete 10-Event Symbolic Note Table

The original Motif C consists of exactly ten note events beginning on Beat 1.0 (beat index 0.0) of Bar 1:

| Event Index | Measure : Beat | Global Beat (from start) | Pitch Name | MIDI Note | Duration (Beats) | Duration (Seconds) | Velocity | Melodic Function & Pitch Contour |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **0** | 1 : 1.0 | 0.0 | F#5 | 78 | 0.5 | 0.300 s | 0.78 | 3rd of tonic triad; rising pickup to upper register |
| **1** | 1 : 1.5 | 0.5 | A5 | 81 | 0.5 | 0.300 s | 0.78 | 5th of tonic triad; continues upward leap |
| **2** | 1 : 2.0 | 1.0 | D6 | 86 | 1.0 | 0.600 s | 0.78 | High tonic octave apex; melodic peak of phrase |
| **3** | 1 : 3.0 | 2.0 | C#6 | 85 | 1.0 | 0.600 s | 0.78 | Leading tone step down; appoggiatura feel |
| **4** | 1 : 4.0 | 3.0 | A5 | 81 | 0.5 | 0.300 s | 0.78 | Drop to dominant degree; rhythmic division |
| **5** | 1 : 4.5 | 3.5 | F#5 | 78 | 0.5 | 0.300 s | 0.78 | Mediant step; prepares turnaround |
| **6** | 2 : 1.0 | 4.0 | B5 | 83 | 1.0 | 0.600 s | 0.78 | Submediant upper turn (6th degree); playful lift |
| **7** | 2 : 2.0 | 5.0 | A5 | 81 | 0.5 | 0.300 s | 0.78 | Dominant step down |
| **8** | 2 : 2.5 | 5.5 | F#5 | 78 | 0.5 | 0.300 s | 0.78 | Mediant step down |
| **9** | 2 : 3.0 | 6.0 | D5 | 74 | 2.0 | 1.200 s | 0.78 | Lower tonic resolution; held across beats 6.0 to 8.0 |

*Melodic Contour Summary:* An energetic opening arpeggio leap ($F\sharp5 \to A5 \to D6$, a minor 6th span), an immediate descending step ($D6 \to C\sharp6$), a drop back through triad tones ($A5 \to F\sharp5$), a buoyant escape-tone lift to $B5$ on the downbeat of Bar 2, followed by a stepwise descent ($A5 \to F\sharp5 \to D5$) that settles squarely on the lower tonic octave $D5$ at Beat 6.0 and sustains through Beat 8.0.

### 1.4 Duration Arithmetic & The Conditioning Gate (`[T]`)

#### The Problem: External Service Rejection
- Suno's documented file-upload requirement (`https://help.suno.com/en/articles/2477633`) mandates an audio duration between **6.00 seconds and 60.00 seconds** (with up to 120.00 seconds permitted on certain paid subscription tiers).
- The single 1x render of Motif C has:
  $$\text{Duration}_{1x} = 4.800\text{ s} + 0.120\text{ s} = 4.920\text{ s}$$
  $$\text{Sample Frames at 48 kHz} = 4.920 \times 48{,}000 = \mathbf{236{,}160\text{ frames}}$$
  $$\text{PCM Data Bytes} = 236{,}160 \times 2\text{ channels} \times 2\text{ bytes/sample} = \mathbf{944{,}640\text{ bytes}}$$
  $$\text{Total File Size (with 44-byte RIFF header)} = \mathbf{944{,}684\text{ bytes}}$$
- Because $4.920\text{ s} < 6.000\text{ s}$, Suno's audio ingestion endpoint issues an immediate validation error and halts generation.

#### The Rejected "Shortcuts"
1. **Silence Padding:** Appending 1.5–2.0 seconds of digital zero at the end of the file meets the file length check ($4.92\text{ s} \to 6.50\text{ s}$), but corrupts generative conditioning: neural audio models perceive trailing dead air as a structural prompt instruction to generate silent pauses, erratic tempo shifts, or sudden ambient noise.
2. **Tempo Stretching:** Slowing the playback from 100 BPM to 75 BPM stretches 8 beats to 6.40 seconds, but distorts the perceptual groove, turns the playful "Lucky Ripple" into a lethargic dirge, and trains the external model on an incorrect rhythmic feel.

#### The Pure Musical Solution: Exact 2x Repetition (`C0-repeat2x`)
Instead of artificial padding, we construct `C0-repeat2x` as an exact, unadulterated two-repetition phrase:
- **Bar Count:** 4 measures (16 beats).
- **Musical Duration:** $16 \times 0.600\text{ s} = 9.600\text{ s}$.
- **Total Rendered Duration (with tail):** $9.600\text{ s} + 0.120\text{ s} = \mathbf{9.720\text{ s}}$.
- **Sample Frames at 48 kHz:** $9.720 \times 48{,}000 = \mathbf{466{,}560\text{ frames}}$.
- **PCM Data Bytes:** $466{,}560 \times 4 = \mathbf{1{,}866{,}240\text{ bytes}}$ ($1{,}866{,}284\text{ bytes}$ total file size).
- **Seamless Musical Join:** Note Event 9 starts at global beat 6.0 with a duration of 2.0 beats, sustaining exactly through beat 8.0 (Bar 2, Beat 4.0). The second statement begins precisely at global beat 8.0 (Bar 3, Beat 1.0) with Event 0 ($F\sharp5$). Because Note 9 completes its full natural duration exactly as the next measure begins, the phrase loops seamlessly with zero gap, zero overlap, and zero tempo alteration.
- **Verification:** $9.720\text{ s} > 6.000\text{ s}$ and $9.720\text{ s} \le 60.000\text{ s}$, perfectly satisfying Suno's documented criteria.

---

## 2. Diagnostic Critique of Prior Rejected Extensions (`S1`, `S2`, `S3` in Plan 32)

In Plan 32, three 8-bar extended structures (`S1`, `S2`, `S3`) were drafted and rendered as 19.32-second previews (`composition-preview/history/attempt-01/`). When auditioned by the owner, all three extensions were rejected. Understanding the exact mechanical and structural reasons for this rejection is vital to prevent repeating those errors.

```
Rejected S1: [ Motif C (Bars 1-2) ] [ Answer (Bars 3-4) ] [ Empty Drone / 2 sparse notes (5-6) ] [ Motif C (7-8) ]
Rejected S2: [ Motif C (Bars 1-2) ] [ Aimless High Meandering: 15 notes across Bars 3-6       ] [ Motif C (7-8) ]
Rejected S3: [ Motif C (Bars 1-2) ] [ Empty Drone (3-4)  ] [ 2 sparse notes (5-6) ] [ New Cadence (7-8): NO HOOK RETURN ]
```

### 2.1 Mechanical Failure 1: The Sterile Drone
All three previews placed the melody over an accompaniment consisting solely of a two-note sustained fifth ($D3$ at 146.8 Hz and $A3$ at 220.0 Hz) mixed at an extremely quiet level ($-31\text{ dBFS}$ RMS). 
- In audition, this drone was virtually imperceptible on standard speakers, functioning psychologically not as musical support but as dead room air.
- Without rhythmic pulse, bass harmonic motion, or chord changes, the extended phrase felt like an unaccompanied solo exercise stretched far past its natural density limit.

### 2.2 Structural Failure 2: `S2` High-Register Meandering
In `S2` ("Bookend / contrast"), Bars 3–6 introduced 15 new melody notes in the upper register ($D5 \text{ to } D6$) attempting to provide a contrasting "B idea":
- Because the notes had no clear motivic relationship to Motif C's distinctive leaps and were unsupported by harmonic progression, they sounded like aimless melodic filler.
- Four continuous measures of meandering diluted the memorability of Motif C, causing the listener to lose the thread of the original hook before it finally returned in Bar 7.

### 2.3 Structural Failure 3: `S3` Abandonment of the Hook Return
In `S3` ("Spacious / fragmentary"), Motif C was stated only once in Bars 1–2. Bars 3–6 were left almost completely empty, and Bars 7–8 concluded with a generic cadential figure that omitted the hook entirely:
- The owner experienced this as an abrupt bait-and-switch: an engaging 4.8-second hook was introduced, followed by 10 seconds of hollow waiting, ending without satisfaction or payoff.

### 2.4 Fundamental Structural Lesson (`[H]`)
Why did extending Motif C prove so fragile?
1. **Octave-Spanning Tonic Closure:** Motif C is not an open fragment or an antecedent question; it is a self-contained, closed musical gesture spanning an entire octave ($D5 \to D6 \to D5$) that lands decisively on the tonic $D5$ at beat 6.0 and holds for two full beats. In classical period construction, a melody that reaches strong authentic closure on the tonic does not naturally chain into an immediate continuation without harmonic reactivation.
2. **The Vacuum in Beats 6.0–8.0:** Because the lead melody rests on a held tone during the final quarter of the two-bar unit, an 8-bar extension cannot rely solely on the lead voice. Extending Motif C requires:
   - **Harmonic progression** that pulls away from the tonic (e.g., moving to $V$, $vi$, or $IV$) to create forward momentum.
   - **Rhythmic hocketing** where accompaniment instruments actively step forward to fill beats 6.0–8.0 while the lead voice rests.
   - **Deliberate structural contrast**, such as an antecedent phrase ending in an open half-cadence on scale degree 5 ($A5$), or an accompaniment-led groove section where the ensemble carries the musical interest.

---

## 3. Motif-to-Phrase Craft, Voice Leading, Register & Loop Architecture

### 3.1 Grounding in Plan 33 Literature & Evidence Labels

To maintain strict scientific and musicological integrity, all compositional and technical assertions are labeled using Plan 33’s evidence taxonomy:
- **`[E-full]`**: Empirical study with full-text verified methodology and results.
- **`[E-abs]`**: Empirical study verified directly from official abstracts or repository records.
- **`[E-sec]`**: Empirical findings verified via secondary quantitative reporting in peer-reviewed literature.
- **`[P]`**: Professional composer/developer craft account of practical techniques.
- **`[T]`**: Established music theory, acoustic analysis, or engineering specification.
- **`[H]`**: Explicit craft hypothesis or design inference connecting published evidence to Quackpot.

The architecture directly applies seven key literature findings from Plan 33:
1. **Contour & Interval Invariance (`[E-abs]` — Dowling & Fujitani 1971):** Listeners recognize transposed and altered melodies primarily through invariant pitch contours and exact interval profiles. Motif C's distinctive rising minor-6th leap ($F\sharp5 \to D6$) must remain intact in all anchor statements.
2. **Rhythmic Skeleton Preservation (`[E-abs]` — Mélen & Deliège 1995; `[E-full]` — Kuusi 2009):** Melodic identification degrades significantly when rhythmic onset profiles are flattened or randomized. The dotted/eighth-note rhythm of Motif C must be conserved across iterations.
3. **Harmonic Conservation via Diatonic Substitutions (`[E-abs]`/`[E-sec]` — Liu 2018, 2022):** Listeners consistently identify melodies as the "same melody" when reharmonized with diatonic chords ($ii, iii, vi$) sharing the same tonal center. Reharmonizations in Plan 39 must strictly preserve the D tonal center.
4. **Cadential Closure & Tension (`[E-full]` — Sears et al. 2020; Choi & Fujioka 2025):** Full authentic cadences ($V \to I$) provide psychological termination, while half-cadences (suspending on $V$) sustain anticipation and loop momentum.
5. **Low-Register Audibility on Small Transducers (`[E-full]` — Huron et al. 2006; Granot & Eitan 2011):** Mobile phone and laptop speakers exhibit steep acoustic high-pass roll-off below 150 Hz. Bass voices must emphasize 2nd and 3rd harmonics in the 110–240 Hz octave rather than relying on pure sub-100 Hz fundamentals.
6. **Timbral Intelligibility (`[E-abs]`/`[E-sec]` — Lim & Goh 2012):** Within-family instrument variations preserve melody identification, whereas sudden cross-family timbre swaps obscure tune recognition.
7. **Measure-Quantized Transitions (`[P]` — Korb 2020; Ueda 2017):** In adaptive video game audio, structural musical changes and layer muting must occur on strict measure boundaries ($2.40\text{ s}$ intervals at 100 BPM) to prevent perceptual disjunction.

### 3.2 The Three C-Derived Continuation Candidates

Rather than a generic cross-product of arbitrary variations, Plan 39 specifies three sharply differentiated, artistically motivated 8-bar phrase structures:

```
Candidate 1: C1-period-lock (Classical Antecedent / Consequent Period)
Bar 1-2: Motif C Anchor -------> Bar 3-4: Answer with Open Half-Cadence on A5 (V)
Bar 5-6: Motif C Return -------> Bar 7-8: Consequent Authentic Cadence on D5 (I)

Candidate 2: C2-call-and-breath (Conversational Call & Response)
Bar 1-2: Motif C "Call" -------> Bar 3-4: Ensemble Echo / Accompaniment "Response"
Bar 5-6: Developing Variation --> Bar 7-8: Resolving Reprise / Cadence

Candidate 3: C3-accompaniment-groove (Beginning-of-Game Atmosphere)
Bar 1-2: Motif C Motif Statement (Establishes Theme)
Bar 3-6: Lead Rests; Playful Accompaniment Groove Carries the Game Space
Bar 7-8: Full Motif C Reprise Re-anchors the Loop Seam
```

#### Candidate 1: `C1-period-lock` (Antecedent / Consequent Period)
- **Concept:** Solves the tonic closure problem by transforming the first statement into an antecedent phrase that deliberately suspends on an open half-cadence.
- **Bars 1–2:** Exact Motif C anchor statement over tonic support ($D \to G \to A$).
- **Bars 3–4 (Antecedent Answer):** Lead voice picks up at Bar 3, echoes the $F\sharp5 \to A5 \to D6$ gesture, but pivots to an open half-cadence, landing on $A5$ (scale degree 5) on Bar 4 Beat 3 over an $A\text{ major } (V)$ chord. This leaves the harmonic question open (`[E-full]`: Sears et al. 2020).
- **Bars 5–6:** Motif C opening gesture returns firmly on the tonic.
- **Bars 7–8 (Consequent Closure):** Consequent phrase concludes with a complete authentic cadence landing on $D5$ on Bar 8 Beat 3 over a resolved $D\text{ major } (I)$ chord, providing full closure before the loop repeats.

#### Candidate 2: `C2-call-and-breath` (Conversational Call & Response)
- **Concept:** Introduces breathing room and prevents lead-synth fatigue by treating Motif C as an active "call" followed by an instrumental accompaniment "response."
- **Bars 1–2 (The Call):** Exact Motif C stated by the lead voice.
- **Bars 3–4 (The Response / Breath):** Lead voice drops silent. The chord/accompaniment layer (warm keyboard or bell-pluck) takes over melodic interest, playing a delicate descending hocket echo derived from Motif C's notes ($C\sharp6 \to A5 \to F\sharp5 \to D5$) over a $Bm7 \to Gmaj7 \to A$ progression.
- **Bars 5–6 (The Exchange):** Lead voice re-enters with a shortened 4-note ascending variation ($F\sharp5 \to A5 \to B5 \to D6$).
- **Bars 7–8 (Resolution):** Full ensemble converges for a gentle closing cadence.

#### Candidate 3: `C3-accompaniment-groove` (Beginning-of-Game Accompaniment-Led Form)
- **Concept:** Designed specifically for a cozy, readable game environment where the player needs to read text, examine ducks, and absorb UI without being bombarded by continuous lead melodies.
- **Bars 1–2 (The Signature):** Exact Motif C states the iconic game identity.
- **Bars 3–6 (The Groove Bed):** Lead voice rests completely for four full measures. The accompaniment ensemble carries the scene: a bouncy, syncopated bassline ($D2 \dots D3$), cheerful keyboard chord stabs on offbeats ($D(add9) \to F\sharp m7 \to Bm7 \to Gmaj7$), and a subtle percussive triangle pulse.
- **Bars 7–8 (The Re-anchor):** Motif C returns in full to close the 8-bar cycle, perfectly reinforcing the hook right before the loop seam wraps.

#### Separated Optional Comparison: `N1-sunny-waddle`
- **Concept:** A completely independent 8-bar melodic candidate in D Major at 100 BPM, featuring a gentler, more step-wise contour (emphasizing major 3rds and 6ths rather than high-octave leaps).
- **Isolation Rule:** Maintained strictly as a separated comparison control. It is never mixed into C-derived suites or substituted silently, ensuring the owner can evaluate whether Motif C's octave leap is inherently too brisk for beginning-of-game reading without compromising Motif C's provenance.

### 3.3 Voice Leading & Register Allocation (`[T]`, `[E-full]`)

To prevent acoustic masking and mud, the ensemble is partitioned into three strictly delineated frequency registers:

```
Frequency Spectrum Allocation:
[ 70 Hz ------------- 300 Hz ]  Bass Layer (D2-D3 + Harmonics)
         [ 250 Hz ------------- 2.5 kHz ]  Chord / Accompaniment Layer (C3-G4)
                  [ 1.5 kHz ------------- 8.0 kHz ]  Lead Synth Layer (C5-D6)
```

1. **Lead Synth Register (`C5` to `D6` | MIDI 72–86 | 523 Hz – 1175 Hz):**
   - Sits at the top of the sonic texture.
   - Melody must maintain clear voice-leading separation; chord voices must not cross above $C5$ or double the lead in unison, which causes severe phase cancellation and pitch ambiguity in simple Web Audio oscillators.
2. **Chord / Harmony Register (`C3` to `G4` | MIDI 48–67 | 130 Hz – 392 Hz):**
   - Voiced as open or semi-open triads and 7ths ($D(add9)$, $F\sharp m7$, $Bm7$, $Gmaj7$, $A6$).
   - Thirds and sevenths are placed comfortably between 200 Hz and 600 Hz, avoiding dense, muddy low-interval limits below 150 Hz.
3. **Bass Register (`D2` to `D3` | MIDI 38–50 | 73.4 Hz – 146.8 Hz):**
   - Root movements emphasize authentic steps ($I \to IV \to V$).
   - **Small-Speaker Optimization (`[E-full]`: Huron et al. 2006):** Because $D2$ (73.4 Hz) is virtually inaudible on typical smartphone and thin laptop speakers, the bass synth patch uses a low-pass-filtered sawtooth or a dual-oscillator mix (fundamental sine + octave-up triangle at 146.8 Hz) to reinforce the 110–240 Hz second harmonic.

### 3.4 Spectral Carving & Web Audio Synthesis Architecture

- **Spectral Pocketing via Biquad Filters:**
  - Accompaniment chord pads and keyboard voices route through a `BiquadFilterNode` configured as a low-pass filter with cutoff at $2{,}000\text{–}2{,}500\text{ Hz}$ ($Q = 0.707$). This surgically clears the critical $2{,}000\text{–}5{,}000\text{ Hz}$ ear-sensitivity region for the lead voice.
  - The Lead voice uses a bright triangle/gentle pulse wave routing through a dedicated filter with cutoff at $6{,}000\text{–}8{,}000\text{ Hz}$, allowing crisp attack transients without harsh high-frequency fizz.
- **AudioContext vs. OfflineAudioContext Identity:**
  - The real-time interactive browser preview (`AudioContext`) and the file export engine (`OfflineAudioContext`) must execute the exact same node-graph instantiation and scheduling functions.
  - All envelope attacks, decays, and frequency sweeps must use parameter automation methods (`setValueAtTime`, `exponentialRampToValueAtTime`) scheduled on the audio clock (`context.currentTime`), strictly avoiding JavaScript DOM timers (`setTimeout`, `setInterval`) which introduce catastrophic jitter and phase artifacts.
- **Cheap-Proof vs. Production Synth Caveat:**
  - The laboratory synthesis engine uses lightweight procedural Web Audio nodes (oscillators, gains, biquads). These sound patches serve as **cheap, zero-dependency proof-of-concept instruments** to validate melody, harmony, and arrangement balance. They are not final game audio assets. Production soundtrack implementation remains separately gated.

### 3.5 Critical Musicological & Art-Direction Caveat
> **Formal Caveat:** Music theory frameworks `[T]`, perceptual laboratory findings `[E-full]`, and algorithmic heuristics describe general acoustic tendencies and historical patterns. They cannot guarantee individual emotional response, personal aesthetic delight, or external AI model adherence. **Human owner listening remains the sole, final decision gate for all musical selections.**

---

## 4. External Service Reference Conditioning & Owner Recording Sheet

### 4.1 Documented Capabilities vs. Marketing Claims

When using external generative services to flesh out arrangements, the owner must navigate the gap between marketing copy and actual technical capabilities.

#### Suno (`https://suno.com`)
- **Documented Ingestion Criteria (`https://help.suno.com/en/articles/2477633`):** Uploaded audio clips must be strictly between **6.00 and 60.00 seconds** (120 s on select tiers). Any shorter file fails immediately.
- **"Cover" Mode (`https://suno.com/products/covers`):**
  - *Marketing Claim:* Transforms source audio into any style while preserving melody and core structure.
  - *Empirical Reality:* Conditioning operates via neural latent representations. If the style prompt contains high-energy conflicting genre keywords (e.g., "heavy metal guitar solo"), the generator often overrides melodic conditioning completely.
- **"Extend" Mode:** Appends new musical material starting from a user-specified timestamp. It is not designed to reharmonize or restyle an entire existing melody from the beginning.
- **Slider Dynamics:**
  - *Audio Influence:* Controls how strongly the conditioning latent constrains the diffusion path. For melody retention, Audio Influence must be tested at high settings ($70\%\text{–}90\%$).
  - *Style Influence / Weirdness:* High style influence or weirdness triggers heavy melodic drift.
- **Prompt Competition:** Long, verbose text prompts filled with complex genre tags directly compete with audio conditioning vectors in the cross-attention layers. Prompts must be kept concise and stylistically coherent.

#### Gemini Create Music / Lyria (`https://support.google.com/gemini/answer/16901237`)
- **Documented Input Modalities:** Gemini web app's Create Music feature accepts text prompts and optional image/video inputs.
- **The Chat Attachment Fallacy:** In the consumer Gemini chat interface, attaching a `.wav` file uploads the audio to the multimodal conversational LLM (Gemini 1.5/2.0), not to the underlying music generation engine (Lyria). The LLM listens to the audio and writes a text description (e.g., "A playful triangle synth melody in D major"), which is then sent to Lyria as a plain text prompt. Because Lyria receives only text—not the raw audio waveform or a chroma pitch matrix—the resulting music is stylistically pleasant but cannot reliably reproduce the exact 10 notes of Motif C.

### 4.2 The 5-Factor Diagnostic Experiment Matrix (`D1`–`D5`)

To isolate why external generation succeeds or fails, the owner can execute targeted, single-variable tests across five key diagnostic dimensions:

| Factor ID | Experimental Dimension | Comparison Variable A | Comparison Variable B | What This Isolates |
|:---:|:---|:---|:---|:---|
| **D1** | **Duration** | 4.92 s (Single statement; Suno baseline control) | 9.72 s (`C0-repeat2x` exact repeat) | Verifies that reaching the 6.0 s threshold unlocks generation without distortion. |
| **D2** | **Mix Density / Stems** | Dry Melody WAV (solo lead synth) | Full Accompaniment Mix (Lead + Chords + Bass) | Determines whether the generator tracks a clean solo lead better than a full arrangement. |
| **D3** | **Form Structure** | Exact 2x Repeat (`C0-repeat2x`) | Phrase Continuation (`C1-period-lock` or `C3-groove`) | Tests whether the model preserves melodic contour better on simple loops or complete musical periods. |
| **D4** | **Lead Timbre** | Pure Triangle Wave (laboratory synth) | Acoustic Bell / Toy Piano rendering | Evaluates whether richer harmonic spectra improve pitch extraction in neural encoders. |
| **D5** | **Prompt Competition** | Minimal Prompt ("Cozy playful game soundtrack, 100 BPM") | Complex Genre Prompt ("80s city pop disco funk with brass section, synth bass, vinyl warmth") | Measures how heavily verbose text styling degrades melodic retention. |

---

### 4.3 Copy-Pasteable Markdown Owner Observation Recording Sheet

When testing references in Suno, Udio, or Gemini, copy and paste this standard template into your review notes to ensure reproducible records:

```markdown
### External Generation Observation Sheet

- **Run ID:** RUN-20261030-____
- **Date & Time:** 2026-10-30T__:__:__
- **Platform / Service:** [ ] Suno (web)   [ ] Suno (API)   [ ] Gemini Create Music   [ ] Other: _______
- **Operation Mode:** [ ] Cover   [ ] Extend   [ ] Audio Upload + Text Prompt   [ ] Chat Attachment
- **Model / Service Version:** (e.g., Suno v3.5, Suno v4, Lyria) ______________________

#### 1. Input Reference Asset
- **Source Reference File:** (e.g., `C0-repeat2x-lead.wav`, `C1-period-lock-mix.wav`) ______________________
- **Reference Duration:** _____ seconds
- **File SHA-256:** ________________________________________________________________
- **Stem Type:** [ ] Dry Lead Melody Only   [ ] Backing Groove Only   [ ] Full Mix

#### 2. Generator Controls & Settings
- **Audio Influence / Audio Weight:** _____%
- **Style Influence / Style Weight:** _____%
- **Weirdness / Creativity:** _____%
- **Text Prompt:** `____________________________________________________________________`
- **Negative Prompt (if applicable):** `________________________________________________`

#### 3. Output Evaluation & Listening Results
- **Output File Name / URL:** _______________________________________________________
- **Output Duration:** _____ seconds
- **Melodic Retention Score (1 to 5):** [ ] 1: None (Ignored)   [ ] 2: Faint / Distorted   [ ] 3: Recognizable Fragments   [ ] 4: Strong Preservation   [ ] 5: Exact Contour
- **Aesthetic / Vibe Score (1 to 5):** [ ] 1: Poor / Unusable   [ ] 2: Muddy / Cluttered   [ ] 3: Acceptable   [ ] 4: Charming / Cozy   [ ] 5: Exceptional
- **Beginning-of-Game Suitability:** [ ] Too Intense / Busy   [ ] Just Right (Cozy & Playful)   [ ] Too Dull / Flat
- **Detailed Listening Notes:**
  *(Note specific bars where Motif C was clearly heard, any awkward pitch drifts, unexpected tempo shifts, or audio artifacts)*
  ____________________________________________________________________________________
  ____________________________________________________________________________________
```

---

## 5. Architectural Conclusions & Implementation Roadmap

1. **Immediate Score Delivery:** Implement the symbolic score representations for `C0-repeat2x`, `C1-period-lock`, `C2-call-and-breath`, `C3-accompaniment-groove`, and `N1-sunny-waddle` using JSON/JavaScript event structures.
2. **Audio Graph Integration:** Wire these scores into the unified Web Audio laboratory engine, providing real-time auditioning, per-layer mute/solo toggles, and offline rendering to 48 kHz PCM16 WAV files.
3. **Reference Export:** Provide the owner with one-click offline export for:
   - `C0-repeat2x-lead.wav` (9.72 s clean solo reference for Suno Cover conditioning).
   - `C0-repeat2x-mix.wav` (9.72 s full arrangement reference).
   - `C1`–`C3` phrase continuation WAVs for structural comparison.
4. **Owner Art-Direction Gate:** Present the laboratory harness to the owner for interactive listening. No production code mutation or soundtrack adoption will occur without explicit owner approval.
