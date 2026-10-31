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

## Prompt 2: Advanced Web Audio / HTML5 Game Music Synthesis, Procedural Room Air & Micro-Groove

### What Laboratory Parameter or Score Experiment Its Findings Would Change
We have **already implemented** our v1 baseline (`lab/patches.js` and `lab/synth-engine.js`) with a shared `AudioContext` / `OfflineAudioContext` scheduler (`48,000 Hz` stereo PCM16 WAV export), click-free linear/exponential micro-ramps, 3-band register separation (`D2–A2` bass with 2nd-harmonic overtone, `C3–G4` chords with `1.2–1.35 kHz` lowpass carving, `C5–D6` lead), and four first-order oscillator+biquad patches (`P0`–`P3`).

Running this sharpened Prompt 2 will directly drive a **v2 synthesis upgrade** in `lab/patches.js` and `lab/synth-engine.js`:
1. **2-Operator FM & Custom `PeriodicWave` Instrument Topology:** Replaces bare `triangle`/`sine`/`square` oscillators in `P1`–`P3` with genuine 2-op FM (`modulator -> modulationIndexGain -> carrier.frequency`), custom Fourier harmonic tables (`ctx.createPeriodicWave(real, imag)`), and `5–15 ms` filtered noise mallet/chiff attack transients so leads and chords sound like warm game instruments (marimba, kalimba, Rhodes/Wurlitzer, soft ocarina/whistle) rather than clinical test tones.
2. **Delayed Vibrato & Pitch-Envelope Micro-Scoops:** Adds LFO vibrato that blooms only on sustained notes (`>= 1.0 beat`, such as Beat 6's 2-beat `D5`) while keeping fast 8th-note turns (`beats 0.0, 0.5, 3.0, 3.5`) pitch-tight.
3. **Deterministic Procedural `ConvolverNode` Room Impulse ("Cozy Wooden Room Air"):** Adds a toggleable, seeded procedural stereo impulse response (`0.35–0.60 s` early reflections + damped tail) on an auxiliary send bus so browser auditions have warm spatial cohesion while keeping dry export stems available for external AI conditioning.
4. **Sequencer Micro-Groove & Articulation Engine:** Adds optional micro-swing (`52–55%` eighth-note swing), note-gate articulation (`staccato` vs `tenuto` vs `legato`), velocity-to-filter/FM-index coupling, and a subtle brushed-noise/woodblock pulse layer.

---

### Copy-Pasteable Prompt Text (Prompt 2)

```markdown
# Deep Research Brief: Advanced Zero-Sample Web Audio Music Synthesis, Procedural Room Acoustics, and Sequencer Micro-Groove for HTML5 Video Games

You are a principal Web Audio API DSP engineer, HTML5/JavaScript game synth architect, and video game sound designer.

### 1. What We Have Already Built and Solved (DO NOT Re-Explain These Basics)
We have already built a working browser-based symbolic music laboratory (`AudioContext` + `OfflineAudioContext` rendering to 48,000 Hz, 16-bit stereo PCM WAV) for a cozy, playful beginning-of-game theme in D Major at 100 BPM:
- **Already Solved (Skip in your response):**
  - Basic `AudioContext` vs. `OfflineAudioContext` clock scheduling (`currentTime`, no `setTimeout` jitter).
  - Basic anti-click envelope micro-ramps (`2–12 ms` attacks, `60–100 ms` releases).
  - Basic 3-band register allocation (Bass `D2–A2` with 2nd-harmonic overtone for small laptop/phone speakers; Chords `C3–G4` low-passed around `1.2–1.35 kHz`; Lead `C5–D6` in `523–1175 Hz`).
  - Basic 2-oscillator (`triangle`/`sine`/`square`) + single `BiquadFilterNode` subtractive patches.
- **Strict Runtime Constraints:**
  - Zero external audio files, zero sample downloads, and zero network requests.
  - Must run identically in live `AudioContext` and `OfflineAudioContext` on `file://` and `http://` (which means **no external `AudioWorklet` script URLs** and **no deprecated `ScriptProcessorNode`**; all synthesis must use native Web Audio graph nodes, `PeriodicWave`, `AudioBuffer` procedural buffers, `ConvolverNode`, `WaveShaperNode`, `DelayNode`, `BiquadFilterNode`, `GainNode`, `OscillatorNode`, and `StereoPannerNode`).
  - Remember the Web Audio specification constraint: inside a feedback loop, `DelayNode` enforces a minimum delay of 1 render quantum (`128 frames = 2.667 ms` at 48 kHz, capping simple feedback delay lines at `~375 Hz`).

### 2. The Core Problem We Need You to Solve
First-order `OscillatorNode` (`triangle`/`sine`/`square`) + `BiquadFilterNode` patches still sound like clinical, bone-dry test oscillators after 15–20 seconds of listening. We need **concrete, production-grade procedural synthesis topologies, exact numerical parameter tables, and JavaScript node-graph recipes** drawn from the best open-source HTML5/JS synths (e.g., `webaudio-tinysynth`, `SoundBox`, `CPlayer`, `ZzFXM`, `WebAudioFont` procedural synthesis, demoscene/js13k engines) and classic/indie video game sound design (Yamaha OPL/OPN/OPM 2-op/4-op FM, Nintendo cozy shop/town themes).

### 3. Required Deep Technical Inquiries

#### Inquiry A: Four Concrete Zero-Sample Web Audio Instrument Topologies (With Exact Numbers)
Provide complete node-graph wiring diagrams and copy-pasteable JavaScript parameter recipes (frequencies, ratios, modulation indices in Hz, `Float32Array` Fourier coefficients, filter Qs, and envelope times) for four non-fatiguing, expressive instruments:
1. **Cozy Wooden Marimba / Kalimba / Xylophone Lead (`C5–D6`, 523–1175 Hz):**
   - How to combine a **2-operator FM transient** (what exact non-integer or integer `modulator:carrier` ratio—e.g., `1 : 2.76` or `1 : 4.0`—and what modulator decay time in `ms` creates the hollow woody/tine strike without metallic clang?) with a **short procedurally generated noise-burst mallet click** (`AudioBufferSourceNode` of `5–15 ms` bandpass-filtered noise) and a warm fundamental resonator.
2. **Warm Electric Piano — Rhodes / Wurlitzer / Celesta Chords (`C3–G4`, 130–392 Hz):**
   - Provide both (a) an exact **2-op FM topology** where velocity scales the modulator gain (`modulationIndex * f_carrier`) and decays faster than the carrier, and (b) an exact **`PeriodicWave` Fourier harmonic array** (`real` and `imag` coefficients for harmonics `1..12`) paired with soft `WaveShaperNode` warm saturation and stereo pan/autopan modulation.
3. **Plucked Acoustic String / Harp / Ukulele Accompaniment (`C3–E5`):**
   - Because `DelayNode` feedback loops in Web Audio cannot go below 128 samples (`2.67 ms` at 48 kHz = `375 Hz`), how should we synthesize a convincing plucked string across `130–660 Hz` in `OfflineAudioContext`? Compare:
     - Pre-computing a short Karplus-Strong plucked buffer into an `AudioBuffer` per note/pitch in JS memory (< 0.5 ms CPU) and playing it via `AudioBufferSourceNode`, vs.
     - A multi-stage `PeriodicWave` + dual-decay envelope + body-formant `BiquadFilterNode` bank (`peaking` filters at wood body resonances). Give exact code/coefficients for the best approach.
4. **Soft Breath Ocarina / Woodwind / Whistle Lead (`C5–D6`):**
   - Exact recipe for: (a) a `PeriodicWave` with predominantly odd harmonics + soft 2nd harmonic, (b) a `15–30 ms` breath/chiff bandpass noise envelope on note attack, (c) a **micro-pitch scoop** (`-15 cents -> 0 cents` over `25 ms`), and (d) **delayed LFO vibrato** (an LFO at `5.0–5.5 Hz`, `±8–12 cents`, whose depth `GainNode` stays near zero for the first `180 ms` so eighth notes stay crisp, then ramps in smoothly on sustained half notes).

#### Inquiry B: Deterministic Procedural Room Impulse Response ("Cozy Room Air" via `ConvolverNode`)
Dry oscillators wired straight to `ctx.destination` sound sterile in headphones.
- Provide a complete, deterministic JavaScript function `createCozyRoomImpulse(ctx, { durationSeconds, preDelayMs, dampingHz, seed })` that fills a stereo `AudioBuffer` with:
  1. Discrete early-reflection taps (`5–35 ms`) modeling a small warm room, and
  2. A decorrelated L/R exponentially decaying tail low-pass damped below `2.5–3.5 kHz` so it adds warmth and depth without metallic ringing or smearing fast eighth notes.
- Recommend exact dry/wet send gains for Lead (`10–18%`), Chords (`20–30%`), and Bass (`0–5%`) so total mix peak stays well below clipping and the required `tailSeconds` increase stays `<= 0.35 s`.

#### Inquiry C: Symbolic Score Micro-Groove, Articulation & Humanization Rules
When rendering a symbolic note table (`{ beat, midi, durationBeats, velocity }`) in a cozy video game theme (100 BPM, 4/4):
1. **Micro-Timing & Swing:** What exact timing offsets (in milliseconds or beat fractions) make a 100 BPM game loop bounce naturally without sounding sloppy? (Compare subtle 8th-note swing `52–54%`, laying the lead melody `+8 to +14 ms` behind the grid ("in the pocket"), and chord-strumming micro-arpeggiation of `8–15 ms` per voice from low to high).
2. **Note-Gate Articulation & Phrase Breathing:** How should authored `durationBeats` map to actual gate time (`releaseStart`) for staccato eighth-note turns (`0.5b`) vs. slurred stepwise lines vs. cadential half notes (`2.0b`) so phrases breathe like a real player?
3. **Subtle Non-Intrusive Percussion / Pulse:** Provide a pure Web Audio recipe for an ultra-gentle, cozy rhythmic pulse (e.g., a soft brushed maraca/shaker or muted woodblock tick on beats 2 and 4 at `-24 to -28 dBFS`) that reinforces the 100 BPM groove during lead rests without sounding like a drum machine.

#### Inquiry D: Synthesis Timbre Impact on External Neural Audio Conditioning (Suno `Cover`)
When exporting our synthesized score as a WAV reference to upload into an external neural audio-to-audio model (specifically Suno `Cover` mode):
- How do neural audio encoders (e.g., EnCodec/SoundStream/CQT pitch-tracking frontends) respond to different synthesized reference timbres?
- Specifically: Does a piano/pluck envelope with sharp onset transients (`< 8 ms`), strong 2nd–5th harmonics, and exponential decay yield better melodic contour retention in Suno `Cover` than a sustained triangle/flute wave? Should the reference WAV uploaded to Suno be **100% dry** (no `ConvolverNode` room air, no vibrato, no chord strumming) even if the in-browser audition uses room air and micro-groove?
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
