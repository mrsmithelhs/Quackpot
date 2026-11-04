# M1 full02 Flash response (unverified)

Model output is preserved for review, not established listening evidence. Some characters were already replaced in captured output; local file paths were redacted.

### Auditory Confirmation & Scope of Listening

Both complete recordings were loaded and auditioned in their entirety:
* **`original.mp3`**: Complete recording (~1:04 duration).
* **`reconstruction.mp3`**: Complete recording (~1:04 duration).

Listening covers 100% of both files from 0:00 to 1:04. No clipping or cutoff occurred during auditioning.

---

### 1. Original Track Characterization

#### Genre & Style
* **Genre/Style:** Cheerful, whimsical video game lounge / light electro-acoustic swing-pop (reminiscent of casual lifestyle simulations, puzzle games, or modern cartoon OSTs in the spirit of *Animal Crossing* or *Tomodachi Life*).
* **Meter & Tempo:** 4/4 meter with a light swing / shuffle pocket; tempo sits steadily around 118–120 BPM.
* **Expressive Character:** Upbeat, sunny, playful, and charmingly eccentric. The groove relies on bouncy syncopation, bright percussive accents, and tight, tactile articulations.

#### Audible Instrumentation
* **Melodic Lead:** Bright acoustic/tack piano layered or alternating with mallet percussion (vibraphone/marimba) and high synth/reed-like embellishments. The attacks are crisp with natural acoustic decay.
* **Harmonic Bed / Comping:** Mid-register electric piano (Wurlitzer/Rhodes style) or muted guitar/clavinet comping on the upbeats (off-beat skank/comp), accompanied by warm, low-key synth pad/organ wash providing harmonic glue.
* **Bass:** Bouncy, rounded acoustic/upright or semi-acoustic electric bass playing an active, walking/arpeggiated counter-melody with expressive slide, staccato bounce, and round low-end resonance.
* **Percussion / Drum Kit:** Tight, dry-to-moderate room acoustic kit: warm kick on downbeats, crisp brushed snare/handclap on beats 2 and 4, closed/half-open hi-hat with swinging micro-timing, and auxiliary toys (woodblocks, cowbell, or castanet-like clicks).

---

### 2. Timecoded Auditory Comparisons Across Track Quarters

#### A. Early Quarter (0:00 – 0:16)
* **Audible in Original (0:00 – 0:16):**
  * The track opens with a crisp, syncopated melodic intro featuring bright piano/mallet timbres and bouncy bass pickups.
  * The groove locks immediately into a swinging pocket. The snare/clap on beats 2 and 4 has warm body and slight room air, while the hi-hat maintains dynamic accentuation (strong-weak-medium).
  * The bass notes bloom with low-mid fullness (around 80–200 Hz), connecting smoothly from note to note with organic release tails.
* **Audible in Reconstruction (0:00 – 0:16):**
  * The transcription model captured the primary melodic pitch sequence accurately, but the timbre is rendered with a sterile, glassy GM electric piano / synth mallet.
  * The drums enter with uniform, maximum-velocity General MIDI kick and snare hits. The snare is papery and lacks snare-wire buzz or room reverb; the hi-hat is rigidly quantized and static in velocity.
  * The bassline suffers from abrupt envelope cutoff: note releases drop immediately to digital zero, producing unnatural silence between notes and making the groove feel choppy rather than bouncy.

#### B. Middle Quarter (0:28 – 0:44)
* **Audible in Original (0:28 – 0:44):**
  * The arrangement thickens. Secondary melodic counterpoints and short ornamental fills (grace notes, quick descending arpeggios) dance around the main theme.
  * The harmonic comping supports the lead with smooth voice leading in the lower-mid frequencies without muddying the walking bassline.
  * Stereo width is audible: comping instruments sit slightly off-center, percussion elements are gently panned across the stereo field, and the mix feels unified by a subtle cohesive room impulse.
* **Audible in Reconstruction (0:28 – 0:44):**
  * Polyphonic density creates perceptible masking and voice collisions. Transcribed harmonic chords sound like blocky, simultaneous note-onsets with identical velocities.
  * Ghost notes and subtle expressive inflections from the original were transcribed as full-velocity sustained notes or missed entirely, leading to unexpected rhythmic clunkiness.
  * The stereo field is narrow and flat. Every GM instrument sits dead-center or at default hard pans with zero spatial glue, resulting in a disconnected, tracker-like playback quality.

#### C. Final Quarter (0:48 – 1:04)
* **Audible in Original (0:48 – 1:04):**
  * The piece builds toward a playful climax with rhythmic anticipation and accented syncopated hits around 0:54–0:58.
  * At 1:00–1:04, the band executes a crisp cadence with a slight expressive push/pull in timing, finishing on a tight, dry, punctuated unison chord that rings out into natural acoustic decay.
* **Audible in Reconstruction (0:48 – 1:04):**
  * The cadence around 0:55 loses its rhythmic drama because velocity contours are flat; the accented hits do not hit any harder than the preceding comping.
  * Fast ornamental runs in the final measures sound mechanically smeared or unevenly triggered, likely due to transcription onset jitter.
  * The final chord (1:02–1:04) lacks natural ring-out and decay: GM note-offs trigger abrupt release states, cutting the tail off with artificial suddenness.

---

### 3. Detailed Parameter-by-Parameter Musical Comparison

| Dimension | Original Recording (Audible Reality) | Current TinySynth Reconstruction | Root Hypothesis / Cause |
| :--- | :--- | :--- | :--- |
| **Melody** | Dynamic, expressive mallet/piano timbre; organic phrasing with expressive velocity variation and subtle vibrato/slides. | Piercing, dry GM mallet/synth; flat velocity curves; occasional dropped rapid notes or harsh velocity spikes. | Transcription model outputs unscaled raw velocities; GM sound lacks velocity-layered multi-samples. |
| **Harmony & Voicing** | Warm mid-range chord pads and rhythmic comping; subtle voice-leading; smooth spectral blend. | Thin, brittle keyboard chords; stiff block-chord onsets; occasional chord clashes. | Polyphonic transcription struggles to separate chord extensions from lead harmonics; all chord voices trigger at identical tick times. |
| **Bass** | Warm, round, legato walking bass; rich fundamental; smooth release envelopes. | Plucky, dry synth bass; abrupt note cutoffs; gaps between walking notes. | MIDI note durations in transcription end prematurely; GM synth bass envelope has near-zero release time. |
| **Percussion & Groove** | Relaxed, swinging pocket; varied hi-hat velocities; organic snare accents; subtle auxiliary shakers/clicks. | Completely straight, robotic swing; static drum velocities; abrasive high-frequency hats; missing subtle auxiliary percussion. | Drum channel mapped to standard GM drums without groove humanization; auxiliary percussion mapped to wrong drum note numbers or discarded. |
| **Dynamics** | Natural breath and crescendo between phrases; clear distinction between foreground lead and background comping. | Constant, fatiguing volume across all channels; foreground and background compete at similar amplitude. | Lack of dynamic channel mixing; all transcribed tracks play at uniform default gain/velocity. |
| **Articulation** | Deliberate mix of staccato comping, legato bass, and accented melodic heads. | Uniformly detached or awkwardly sustained notes; lack of legato or portamento transitions. | Default GM soundfont ignores articulation flags; no overlapping legato envelopes. |
| **Timbre** | Cohesive, warm vintage/modern acoustic-electric hybrid mix. | Synthetic, tinny, dated GM soundfont character. | Web Audio TinySynth default wavetables/synthesis algorithms are lightweight FM/subtractive approximations. |
| **Texture & Space** | Defined front-to-back depth; wide, gentle stereo placement; cohesive room acoustics. | 100% dry; mono-heavy center placement; zero ambient glue. | Web Audio graph has no master convolution/algorithmic reverb or stereo pan positioning. |

---

### 4. Prioritized Improvement Plan & Reversible Experiments

#### Priority 1: High Impact / Low Effort (Deterministic Post-Processing & Synth Tweaks)

1. **Velocity Normalization & Humanization Curve:**
   * *Hypothesis:* Compressing peak velocities on the lead and expanding dynamic contrast between melody, bass, and accompaniment will immediately restore mix hierarchy.
   * *Experiment A/B:* Map MIDI velocities through a piecewise linear transfer curve:
     * Lead melody: Compress range to $[60, 105]$ with a gentle convex response.
     * Chords/Comping: Scale down to $[40, 75]$ to prevent them from overpowering the lead.
     * Bass: Scale to $[70, 95]$ with low velocity variance to maintain solid bottom end.
   * *Musical Risk:* Over-compression can make the performance sound lifeless; under-scaling comping may make chords inaudible.

2. **Bass Legato & Envelope Lengthening:**
   * *Hypothesis:* Extending bass note durations by 10–15% and setting a non-zero release time will eliminate the jarring silence between walking bass notes.
   * *Experiment A/B:* In the MIDI playback scheduler, if `nextNote.onset - currentNote.offset < 60ms`, extend `currentNote.duration` to seamlessly touch `nextNote.onset`. On TinySynth's bass patch, increase envelope release time from ~20ms to 80–120ms.
   * *Musical Risk:* If bass notes overlap too much, low-frequency phase cancellation or mud will occur.

3. **Drum Groove & Velocity Scaling:**
   * *Hypothesis:* Differentiating downbeat kicks, backbeat snares, and off-beat hi-hats will recover the swing pocket.
   * *Experiment A/B:*
     * Snare backbeat (beats 2 & 4): Keep strong ($V \approx 90\text{--}100$).
     * Closed Hi-Hat: Apply an alternating velocity pattern: Downbeat ticks at $V \approx 65\text{--}75$, offbeat swung ticks at $V \approx 40\text{--}50$.
     * Apply a small deterministic swing delay ($+15\text{--}25\text{ ms}$) to offbeat 16th/8th notes if the transcription quantized them straight.
   * *Musical Risk:* Exaggerated swing timing will clash with the recorded melody.

4. **Web Audio Master Bus Reverb & Panning:**
   * *Hypothesis:* A small, lightweight impulse response (or algorithmic Schroeder/Freeverb node) and subtle track panning will eliminate the dry GM aesthetic.
   * *Experiment A/B:* Add a local Web Audio `ConvolverNode` loaded with a tiny (10–25 KB) CC0 room/studio impulse response (wet mix ~12–18%). Pan accompaniment instruments $\pm 15\text{--}25\%$ off-center; keep bass, kick, and snare dead center.
   * *Musical Risk:* Excess reverb washes out rhythmic clarity in fast passages.

---

#### Priority 2: Medium Impact / Moderate Effort (Voice Separation & Sound Replacement)

1. **Deterministic Voice Separation (Melody vs. Chords):**
   * *Hypothesis:* The transcription model bundled top-line melody and chordal stabs into a single polyphonic track.
   * *Experiment A/B:* Implement a deterministic note-splitter: in polyphonic events, the highest pitch above a pitch threshold (e.g., $> C4$) is routed to the lead voice (Vibraphone/Piano), while lower simultaneous pitches are routed to an electric piano or nylon guitar patch.
   * *Musical Risk:* Occasional lead notes dipping into the chord register may be misclassified, causing a sudden timbre shift mid-phrase.

2. **Alternative Bundled Soundfont / Custom Lightweight Patches:**
   * *Hypothesis:* TinySynth's built-in FM patches are inherently thin; substituting targeted 1-shot SFZ/Soundfont instruments for the key voices (Acoustic Upright Bass, Tack Piano, Vibraphone, Vintage Drum Kit) will dramatically close the perceptual gap.
   * *Experiment A/B:* Bundle a minimal set of multi-sampled CC0/permissive instruments (compressed via modern Web Audio formats like Opus/OGG or lightweight Soundfont2 under 1–2 MB total).
   * *Musical Risk:* Increased bundle size and memory footprint for static browser delivery.

---

#### Priority 3: High Impact / Ambitious (Advanced Architecture & Research)

1. **Stem-Assisted Multi-Track Transcription:**
   * *Concept:* Instead of transcribing the full mix through a single general model, run the original audio through an offline stem separation model (e.g., Demucs / HTDemucs) to generate four clean audio stems (Drums, Bass, Other, Vocals/Lead), then transcribe each stem with a specialized domain model (e.g., specialized drum transcription for MIDI ch10; monophonic pitch tracker with pitch bend for bass).
   * *Dependencies:* Offline pipeline step, modern source separation neural networks, manual alignment and review.

2. **Custom Web Audio WebAssembly Engine (Soundfont / SoundPipe):**
   * *Concept:* Replace TinySynth with a small WASM-compiled FluidSynth or custom Web Audio AudioWorklet player capable of true velocity layering, round-robin sample triggering, and realistic envelope release stages.
   * *Dependencies:* Asset licensing for soundfonts, engineering effort to build and integrate WASM/AudioWorklet within static browser and CourseVGD sandbox constraints.

---

### 5. Verification & Validation Protocol

To guard against placebo effects and ensure reproducible musical improvements, evaluate all changes using both objective metrics and structured human listening:

#### Objective Metrics (Automated / Data-Driven)
1. **Dynamic Dynamic-Range Contrast:** Measure the RMS ratio between the lead channel and accompaniment channels (target: Lead should sit +3 dB to +5 dB above chord comping).
2. **Polyphony & Overlap Detection:** Scan output MIDI events for bass-note overlaps; confirm that bass note durations do not exceed the start of consecutive bass notes by more than 5 ms.
3. **Spectral Envelope Comparison:** Compute short-time Fourier transform (STFT) average spectral energy distributions of both tracks; confirm that the reconstruction does not exhibit the massive high-frequency shelf spike (>6 kHz) currently caused by TinySynth's dry FM bells.

#### Human Listening Rubric (Blind A/B Tests)
Evaluate candidate renders on three 10-second excerpts (Intro 0:05–0:15, Mid-section 0:30–0:40, Cadence 0:50–1:00) using a 5-point Likert scale on:
* **Groove / Pocket Cohesion:** Does the rhythm feel bouncy and swinging, or rigid and stumbling?
* **Timbral Warmth vs. Harshness:** Is the lead pleasant at higher listening volumes, or fatiguing and piercing?
* **Arrangement Clarity:** Can you clearly distinguish the bass countermelody, chord rhythm, and lead theme?
