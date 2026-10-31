# Plan 39 — External Deep-Research Prompts: Music Craft, Web Audio Voicing, and Audio Conditioning

**Date:** 2026-10-30  
**Context:** Plan 39 (`plan-39-melody-reference-and-web-audio-laboratory`)  
**Purpose:** Three self-contained deep-research briefs that the owner can copy-paste directly into external frontier deep-research models (e.g., Gemini Deep Research, ChatGPT Pro / o3-mini Deep Research, Claude Opus Deep Research).  

---

## Guide for the Owner

These prompts are entirely self-contained. They include all requisite musical tables, acoustic parameters, historical failures, and platform specifications; **the external research tool requires zero access to this repository**.

For each prompt, this document states:
1. **The Exact Copy-Pasteable Prompt Text** (in enclosed block format).
2. **Impact on the Laboratory:** Exactly what score parameters, synthesis constants, or export configurations in Plan 39 will be updated if you run the prompt and return its findings.

Running these prompts is completely optional. Plan 39’s laboratory and candidate scores will proceed with established baselines, and any incoming external findings will be integrated gracefully without overwriting auditioned controls.

---

## Prompt 1: Motif-to-Phrase Craft & Short-Hook Continuation

### What Laboratory Parameter or Score Experiment Its Findings Would Change
If external research returns findings from this prompt, they will directly adjust:
1. **Antecedent Cadence Pitch & Metric Placement:** Fine-tunes the exact pitch target (e.g., $A5$ vs. $E5$ vs. $C\sharp6$) and rhythmic onset in Bar 4 of score candidate `C1-period-lock`.
2. **Accompaniment Hocket Timing in Beats 6.0–8.0:** Adjusts the rhythmic density and pitch choices of the accompaniment counter-melody in `C2-call-and-breath` during the lead voice's two-beat resting period.
3. **Harmonic Progression Voicings in Bars 3–6:** Updates the chord substitutions ($I \to iii \to vi \to IV$ vs. $I \to vi \to ii \to V$) and inversion voice-leading across the groove section of `C3-accompaniment-groove`.
4. **Loop Seam Transition Strategy:** Determines whether the Bar 8 $\to$ Bar 1 transition utilizes a sustained tonic pedal, an active dominant turnaround, or an elided pickup note.

---

### Copy-Pasteable Prompt Text (Prompt 1)

```markdown
# Deep Research Brief: Phrase Continuation, Voice Leading, and Loop Architecture for an Octave-Spanning Tonal Game Hook

You are an expert composer, music theorist, and video game audio director. I need a comprehensive, highly technical analysis and actionable compositional strategies for extending a short, iconic video game gacha hook into an 8-bar looping phrase for a cozy, playful beginning-of-game environment.

### 1. The Source Motif: Motif C ("Lucky Ripple")
The motif is set in 4/4 time at 100.0 BPM (1 beat = 0.60 s, 1 measure = 2.40 s) in the key of D Major (diatonic collection: D, E, F#, G, A, B, C#). It is 2 measures long (8 beats = 4.80 s musical duration plus a 0.12 s release tail = 4.92 s).

Here is the exact 10-event note table:
- Event 0: Bar 1, Beat 1.0 (Beat 0.0) | Pitch: F#5 (MIDI 78) | Duration: 0.5 beats (eighth) | Velocity: 0.78
- Event 1: Bar 1, Beat 1.5 (Beat 0.5) | Pitch: A5  (MIDI 81) | Duration: 0.5 beats (eighth) | Velocity: 0.78
- Event 2: Bar 1, Beat 2.0 (Beat 1.0) | Pitch: D6  (MIDI 86) | Duration: 1.0 beat  (quarter)| Velocity: 0.78
- Event 3: Bar 1, Beat 3.0 (Beat 2.0) | Pitch: C#6 (MIDI 85) | Duration: 1.0 beat  (quarter)| Velocity: 0.78
- Event 4: Bar 1, Beat 4.0 (Beat 3.0) | Pitch: A5  (MIDI 81) | Duration: 0.5 beats (eighth) | Velocity: 0.78
- Event 5: Bar 1, Beat 4.5 (Beat 3.5) | Pitch: F#5 (MIDI 78) | Duration: 0.5 beats (eighth) | Velocity: 0.78
- Event 6: Bar 2, Beat 1.0 (Beat 4.0) | Pitch: B5  (MIDI 83) | Duration: 1.0 beat  (quarter)| Velocity: 0.78
- Event 7: Bar 2, Beat 2.0 (Beat 5.0) | Pitch: A5  (MIDI 81) | Duration: 0.5 beats (eighth) | Velocity: 0.78
- Event 8: Bar 2, Beat 2.5 (Beat 5.5) | Pitch: F#5 (MIDI 78) | Duration: 0.5 beats (eighth) | Velocity: 0.78
- Event 9: Bar 2, Beat 3.0 (Beat 6.0) | Pitch: D5  (MIDI 74) | Duration: 2.0 beats (half)   | Velocity: 0.78

Melodic Contour: An ascending arpeggio leap (F#5 -> A5 -> D6), a descending step (D6 -> C#6), a drop through chord tones (A5 -> F#5), an upper escape lift to B5 on Bar 2 Beat 1, and a stepwise descent (A5 -> F#5 -> D5) resolving firmly on the lower tonic D5 at Beat 6.0 and sustaining through Beat 8.0.

### 2. Prior Failed Extensions (Diagnostic History)
Earlier attempts to stretch this motif into an 8-bar (19.2 s) form failed during creative listening evaluation:
- Failure 1 (Static Drone): The melody was played over an almost inaudible two-note sustained drone (D3/A3 at -31 dBFS). Without harmonic movement or rhythmic pulse, the texture felt barren, lifeless, and fatiguing.
- Failure 2 (Aimless Upper-Register Meandering): Four full measures of continuous, newly composed high-register notes (15 notes between D5 and D6) were inserted between statements of Motif C. This buried the identity of the theme, lost melodic momentum, and felt like random filler.
- Failure 3 (Abandonment of Hook Return): Motif C was stated in Bars 1-2, followed by 4 bars of sparse waiting, and ended with a new cadence that omitted Motif C entirely. Listeners experienced this as an unresolved bait-and-switch.

### 3. Core Structural Challenge
Motif C spans an entire octave (D5 to D6) and achieves complete diatonic closure on the tonic D5 at Beat 6.0. In classical and contemporary pop phrasing, a phrase that resolves so decisively to the tonic does not easily chain into a continuation without harmonic reactivation or rhythmic hand-off in Beats 6.0-8.0.

### 4. Required Research Inquiries
Please provide a rigorous, practical, and cited report addressing:
1. Sourced Classical & Video Game Phrasing Models: How do master composers (e.g., Koji Kondo, Lena Raine, Yu-Peng Chen, classical masters) extend an octave-spanning, tonic-closed short hook into an 8-bar or 16-bar loop without causing ear fatigue? Compare:
   - Antecedent/Consequent Period structure (suspending on an open half-cadence at Bar 4).
   - Sentence structure (presentation, continuation, cadential acceleration).
   - Call-and-Response / Accompaniment-Led Groove (letting the hook rest while the rhythm section carries the theme).
2. The Beat 6.0-8.0 Vacuum: Concrete voice-leading and arrangement techniques for handling the 2-beat rest in the lead melody at the end of Bar 2. Provide specific rhythm and note examples for how accompaniment counter-lines or bass hockets should bridge Bar 2 into Bar 3.
3. Voice Leading & Diatonic Substitutions: Sourced evidence (e.g., music perception studies on melody conservation such as Liu 2018, 2022) for which diatonic chord substitutions (ii, iii, vi) best maintain melody recognition while refreshing the ear in Bars 3-6.
4. Seamless Looping Seams: Best practices for managing the Bar 8 -> Bar 1 loop turnaround in interactive browser games, ensuring that continuous repetition remains fresh and pleasant during prolonged reading.
```

---

## Prompt 2: Small Game-Synth Ensemble & Browser Web Audio Voicing

### What Laboratory Parameter or Score Experiment Its Findings Would Change
If external research returns findings from this prompt, they will directly adjust:
1. **BiquadFilterNode Cutoffs and Q Values:** Refines the precise low-pass filter cutoff frequencies (e.g., 2,200 Hz vs. 1,800 Hz) and resonance slopes for chord pads and keyboard voices in the Web Audio graph to guarantee zero masking in the 2–5 kHz lead band.
2. **Bass Synthesis Harmonic Content:** Modifies the oscillator configuration for the bass synth in `lab/patches.js` and `lab/synth-engine.js` (e.g., adding a specific gain ratio for a 2nd harmonic overtone at 146.8 Hz) to maximize audibility on low-end laptop and mobile phone speakers without muddying the mix.
3. **Envelope Attack/Decay Curves:** Updates the linear/exponential time constants (`attackSeconds`, `decaySeconds`, `sustainRatio`, `releaseSeconds`) across the laboratory's instrument patches to prevent audible clicking at loop boundaries while maintaining snappy transients.
4. **Layer Gain Staging & Dynamic Headroom:** Calibrates the digital mix bus gain multipliers to ensure consistent PCM RMS and sample-peak headroom (`< 0.90` linear sample peak, explicitly measured as PCM sample peak and RMS rather than unmeasured LUFS/true peak).

---

### Copy-Pasteable Prompt Text (Prompt 2)

```markdown
# Deep Research Brief: Small Game-Synth Ensemble Voicing, Spectral Carving, and Web Audio Synthesis Architecture

You are an expert audio programmer, acoustic engineer, and game sound designer specializing in pure Web Audio API synthesis for web applications.

I need deep technical guidance on designing a lightweight, zero-dependency, procedural 3-to-4-voice synthesizer ensemble that runs cleanly in modern web browsers (Chrome, Safari, Firefox) via Web Audio API (`AudioContext` and `OfflineAudioContext`).

### 1. Application Context & Aesthetic Goals
- Game Type: Cozy, lighthearted browser gacha game.
- Function: Beginning-of-game background music. The player is reading text, reviewing duck stats, and interacting with UI.
- Aesthetic Target: Inviting, warm, lightly bouncy, and playful (think cozy simulation / gentle arcade like Animal Crossing or classic Nintendo handheld titles).
- Hard Constraints: Zero runtime sample libraries or soundfonts (must use native procedural Web Audio nodes: `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `WaveShaperNode`, `StereoPannerNode`). Must render synchronously/offline to 48 kHz 16-bit stereo PCM WAV.

### 2. Acoustic & Hardware Challenges
- Mobile & Laptop Speaker Playback: Target users play on laptops or phones whose built-in transducers exhibit severe acoustic roll-off below 150 Hz. Low bass fundamentals (e.g., D2 at 73.4 Hz) are completely lost if not reinforced by upper harmonics.
- Timbral Fatigue: In looping browser games, harsh, unfiltered waveforms (raw sawtooth or square waves) cause rapid auditory fatigue.
- Frequency Collisions & Phase Cancellation: Unison doubling and crowded midrange voicings cause severe masking, making the lead melody unintelligible.

### 3. Required Research Inquiries
Please provide a comprehensive, highly technical engineering and acoustic brief covering:
1. Register Allocation & Spectral Carving:
   - Provide exact frequency and MIDI register boundaries for a 3-layer ensemble: (a) Lead Voice (C5-D6), (b) Accompaniment Chords/Keyboard (C3-G4), and (c) Bass (D2-D3).
   - What exact filter cutoffs (`BiquadFilterNode.frequency`), filter types, and Q factors should be applied to the chord accompaniment to surgically carve out a pocket in the 2,000 Hz to 5,000 Hz range for the lead voice?
2. Bass Synthesis for Small Transducers:
   - How can a pure Web Audio synthesis graph generate rich, warm, audible 2nd and 3rd harmonics (110 Hz to 250 Hz) for a D2 (73.4 Hz) fundamental without requiring heavy CPU distortion? (Detail multi-oscillator summing vs. custom `PeriodicWave` vs. soft tanh `WaveShaperNode`).
3. Glitch-Free Web Audio Scheduling & Envelopes:
   - What are the exact audio-clock parameter automation practices (`setValueAtTime`, `exponentialRampToValueAtTime`, `setTargetAtTime`) required to guarantee click-free attacks, seamless note transitions, and click-free looping across measure boundaries?
   - How should release tails and voice deallocation be managed in an `OfflineAudioContext` export pipeline to prevent memory leaks and buffer truncation?
4. Concrete Web Audio Patch Recipes:
   - Provide complete, copy-pasteable JavaScript configuration objects or node-graph wiring recipes for:
     a) A warm, gentle lead synth (e.g., filtered triangle/soft square with subtle vibrato).
     b) A playful, cozy chord pluck/electric piano (soft attack, gentle decay).
     c) A rounded, audible bass synth with strong upper-harmonic presence.
```

---

## Prompt 3: Reference Audio Conditioning in Suno Cover/Extend and Consumer Music Generators

### What Laboratory Parameter or Score Experiment Its Findings Would Change
If external research returns findings from this prompt, they will directly adjust:
1. **Recommended Reference Export Preset:** Dictates whether the laboratory's default external export format is a dry solo melody WAV (`C0-repeat2x-lead.wav`), a bass-supported stem, or a full accompaniment mix (`C0-repeat2x-mix.wav`).
2. **Laboratory Duration Targets:** Establishes whether reference WAV exports should be strictly 9.72 seconds (2 bars repeated) or 19.32 seconds (full 8-bar period) to maximize neural latent alignment in Suno.
3. **Guidance Sliders & Prompt Templates in Laboratory UI:** Updates the copy-pasteable prompt formulas and slider recommendations (Audio Weight, Style Influence) displayed to the owner on the export screen.

---

### Copy-Pasteable Prompt Text (Prompt 3)

```markdown
# Deep Research Brief: Empirical Audio-Reference Conditioning Dynamics in Suno (Cover vs. Extend) and Consumer Generative Music Models

You are an expert in generative audio engineering, neural audio synthesis, and commercial AI music platforms (specifically Suno, Udio, and Google DeepMind Lyria).

I need a rigorous, technically grounded empirical analysis of audio-reference conditioning. I am using a short, mathematically precise 10-note melodic hook (Motif C, in D Major, 100 BPM, 4/4 time) as an audio reference to generate high-quality, fully arranged background music while strictly preserving the underlying melody.

### 1. The Core Empirical Problem
- The audio reference is short: a 2-bar motif lasting 4.80 s (+ 0.12 s tail = 4.92 s).
- Platform Gate: Suno's upload endpoint strictly rejects files shorter than 6.00 seconds. An exact 2x musical repetition creates a 9.72 s file (4 measures), cleanly satisfying the length limit.
- Prior Failures: When the owner uploaded the WAV to consumer Gemini chat ("Create Music"), the generated tracks were musically pleasing but consistently failed to preserve the melody. In Suno, prompt styling frequently overpowers audio conditioning, leading to melodic drift.

### 2. Platform Realities & Input Pathways
- Suno: Offers "Cover" mode (marketed to transform style while preserving melody) and "Extend" mode (marketed to continue audio forward). Features sliders for "Audio Influence" / "Audio Weight", "Style Influence", and "Weirdness".
- Gemini Create Music / Lyria: Web chat allows file attachments, but consumer chat UI routing differs fundamentally from an API-level chroma/waveform conditioning adapter.

### 3. Required Research Inquiries
Please provide a comprehensive, evidence-based report detailing:
1. Suno "Cover" Mode Mechanics & Empirical Conditioning:
   - What is the actual technical mechanism of Suno's "Cover" feature? How does it extract and condition on melodic/rhythmic information (e.g., latent audio representations, pitch contour extraction, discrete audio tokens)?
   - What is the empirical relationship between the "Audio Influence" slider (e.g., 50% vs. 75% vs. 90%) and pitch retention? At what threshold does high audio weight cause audio artifacts or noise bleeding?
2. Uploaded Audio Pre-Processing & Stem Optimization:
   - Does Suno's reference encoder preserve pitch contour better when fed:
     a) A completely dry, monophonic lead synth waveform (e.g., pure triangle wave with sharp onsets).
     b) An acoustic instrumental timbre (e.g., piano or bell).
     c) A fully arranged mix containing drums, bass, and harmony?
   - What is the optimal upload duration for melody preservation? Does a 9.72 s file (2 exact repetitions) condition more reliably than a 19.32 s 8-bar phrase?
3. Prompt Competition & Style Drift:
   - How do text prompt tokens compete with audio conditioning latent vectors in the cross-attention layers of modern diffusion/transformer music models?
   - What specific prompt engineering rules and negative prompting strategies minimize melodic drift while maximizing arrangement fidelity in "cozy, playful game music"?
4. The Gemini / Lyria Attachment Reality:
   - Document exactly what happens when a user attaches an audio file in the consumer Gemini web interface. Does the attached WAV reach Lyria's conditioning adapter, or is it merely analyzed by a multimodal LLM (Gemini 1.5/2.0) that generates text tokens for Lyria?
```

---

## 6. Synthesis & Execution Summary

| Research Area | Primary Laboratory Target | Score/Code Artifact Directly Affected |
|---|---|---|
| **Prompt 1: Phrase Craft** | 8-Bar Melodic Period & Loop Seam | `C1-period-lock`, `C2-call-and-breath`, `C3-accompaniment-groove` scores |
| **Prompt 2: Web Audio Voicing** | Biquad Carving & Bass Harmonics | `lab/patches.js`, `lab/synth-engine.js` report-local Web Audio graph parameters |
| **Prompt 3: Audio Conditioning** | Reference WAV Stems & Suno Sliders | Laboratory Export Module, Owner Observation Sheet |

These prompts are finalized and available for the owner's immediate use whenever external deep-research runs are desired.
