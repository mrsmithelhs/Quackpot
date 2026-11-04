# Owner-provided desktop Flash review 1

The owner reports that both desktop reviews used the same full M1 MP3 pair. This is unverified model output, preserved as evidence; audible claims and suggested changes require independent validation.

Analyzed original.mp3
Analyzed reconstruction.mp3

### Listening Basis

#### Broad Musical Character
* **Original:** A warm, relaxed, organic indie-folk / bedroom-pop instrumental (roughly 110–120 BPM in 4/4). It is anchored by delicate fingerpicked acoustic guitar, a round acoustic bass line, soft unhurried percussion (subdued kick, rimshot/snare, and organic shaker/brush hats), and an airy, singing melodic lead reminiscent of a wooden flute, whistle, or warm electric piano/melodica. The mix has a cohesive room ambiance, gentle dynamic swells, and natural acoustic damping where string resonances blend smoothly.
* **Reconstruction:** A faithful symbolic capture rendered through General MIDI / WebAudio TinySynth. The underlying melodic contours, chord motion, and rhythmic groove are clearly recognizable and preserve the compositional intent of the source. However, because all events trigger at a uniform, unmodulated velocity into dry synthesizer presets, the character shifts into a bright, rigid, 1990s PC multimedia / Chiptune-adjacent sound.

#### Three Concrete Differences with Approximate Timestamps

1. **Intro Fingerpicked Strumming & Decay (~0:00 – 0:08 in both files)**
   * *Audible Difference:* In the original, the opening plucked pattern is played with light, expressive touch; strings ring naturally into a warm room reverb, and note releases decay smoothly. In the reconstruction, each plucked note strikes at identical maximum velocity with an abrupt envelope cutoff, producing a brittle, mechanical "typewriter" sensation with no distinction between primary bass plucks and quiet inner chord notes.
2. **Percussion Entry & Transient Balance (~0:15 – 0:25 in both files)**
   * *Audible Difference:* In the original, the drum groove enters softly behind the acoustic instruments: the kick is deep and pillowy, the snare/rim is woody and quiet, and the high-frequency percussion sits in the background. In the reconstruction, standard General MIDI drum samples enter at full velocity; the snare and hi-hat transients are louder and sharper than the melody, and every 8th/16th subdivision hits with identical mechanical force (the classic "machine-gun" effect).
3. **Lead Line Prominence vs. Mid-Range Chord Clutter (~0:30 – 0:45 in both files)**
   * *Audible Difference:* During the main melodic phrase development in the original, the upper melody floats comfortably above the accompaniment because the mid-register rhythm guitars remain quiet and diffuse. In the reconstruction, the multi-note chord transcription is rendered with the same patch/velocity as the melody, creating a dense mid-frequency wall where individual chord tones crowd out and mask the lead line.

#### Observation vs. Interpretation Caveat
* *Directly Audible:* Note onsets, relative loudness across frequency bands, timbre harshness, absence of velocity variation, and clear temporal placement of major themes.
* *Interpretive / Uncertain:* Specific GM soundfont patch numbers selected by TinySynth, whether subtle harmonic artifacts in the mid-range are transcription pitch errors versus strummed guitar overtones, and exact micro-timing swing percentages.

---

### Detailed Comparative Review

#### 1. Melody and Important Supporting Lines
* **What Survives:** The primary melodic hook (~0:15 through to the final cadence) has survived transcription remarkably well. The pitch contour, phrase boundaries, and call-and-response structures are intact and immediately identifiable.
* **What is Obscured:**
  * The singing, connected nature of the lead line is lost. In the original, notes connect with subtle legato and breath-like dynamic shaping. In the reconstruction, every melody note is an isolated, rigid gate.
  * In busier phrases (~0:32 – 0:45), secondary counter-lines and inner harmonies blur together because they share identical velocity and dry stereo placement with the primary melody.

#### 2. Harmony, Bass Movement, and Rhythmic Organization
* **Harmony & Bass:** The root motion and chord progression are accurately transcribed. The bass line reliably provides the foundational harmonic changes. However, MuScriptor appears to have transcribed acoustic guitar resonances and strum overtones as clustered, simultaneous MIDI notes in the mid-register (G3–C5 range). At fixed velocity, these clusters sound muddy or slightly dissonant.
* **Rhythmic Organization:** The original has a subtle, relaxed "pocket" (laid-back backbeat, slight swing in the high-hat/shaker). The reconstruction feels quantized to a rigid grid. When played at uniform velocity, this rhythmic rigidity robs the groove of its relaxed, lazy-day charm.

#### 3. Instrument Separation, Register, Density, and Balance
* **Register & Balance:** The original mix relies heavily on frequency and dynamic carving: the melody sits in the clear upper-mids, the acoustic strumming occupies the low-mids, and the kick/bass anchor the low end.
* **The Reconstruction Issue:** In TinySynth, all channels compete across the same dynamic plane. The mid-register chord voicings are too loud by roughly 4 to 6 dB relative to the lead, while the drum transients poke out too far on the high end.

#### 4. Note Lengths, Articulation, Accents, and Dynamics
* **Dynamics:** This is the single largest deficiency. Uniform velocity eliminates the musical hierarchy (accented beats vs. ghost notes, melody vs. accompaniment).
* **Articulation & Note Lengths:** The original uses natural acoustic decays (plucked strings ring until damped; flutes sustain with gentle release). In the reconstruction, many chord notes hold strictly until the subsequent onset or cut off abruptly, causing either unnatural silence between beats or harmonic collision across bar lines.

#### 5. Sectional Transitions and Overall Track Coherence
* The arrangement structure remains coherent across the entire duration: intro (~0:00–0:15), verse/theme A (~0:15–0:30), expansion/theme B (~0:30–0:48), and outro/resolution (~0:48–end).
* However, transitions feel abrupt. In the original, section changes are signaled by subtle dynamic swells, drum fills with rising velocity, and cymbal/reverb tails. In the reconstruction, section changes happen like a switch being flipped, because there is no dynamic crescendo leading into new phrases. The deliberate 2-second tail at the end allows the final chord to decay, which is musically sound, but the decay itself is linear rather than natural acoustic ring-out.

---

### Prioritized Practical Recommendations

#### Recommendation 1: Tiered Part-Level Velocities (Stem Balancing)
* **Audible Problem (~0:15 – 0:45):** Accompaniment chords and drums overpower the lead melody, making the track sound like a cacophony of competing keyboard voices.
* **Proposed Intervention:** Apply global scaling factors to note velocities based on assigned instrument tracks:
  * Melody / Lead: Velocity ~100–108
  * Bass: Velocity ~85–92
  * Mid-range Chord Accompaniment: Velocity ~60–72
  * Drums / Percussion: Kick ~75, Snare ~65, Hi-hat/Cymbal ~50–55
* **Why It Helps:** Immediately restores the natural volume hierarchy. The lead line will instantly step forward without changing a single pitch or patch.
* **What It Might Damage / Misidentify:** If MuScriptor placed lead and accompaniment notes on the same MIDI track/channel, blanket channel scaling will attenuate both.
* **A/B Experiment:** Take 8 bars (~0:15 to ~0:30). Render version A with existing flat velocities. Render version B with accompaniment track velocity reduced by 30% and drum track velocity reduced by 35%. Compare vocal-line clarity.

#### Recommendation 2: Hi-Hat and Sub-Beat Velocity Alternation (De-Machine-Gunning)
* **Audible Problem (~0:16 – end):** The high-frequency percussion hits continuously at flat volume, creating a persistent, distracting rattling sound.
* **Proposed Intervention:** Process the drum track note events so that on-beat 8th notes retain moderate velocity (~65) while off-beat 16th subdivisions drop to ~40–48. Introduce a pseudo-random jitter of ±4 on velocity.
* **Why It Helps:** Emulates the natural dynamics of a human hand playing a shaker or brush, removing the robotic stiffness of GM drums.
* **What It Might Damage:** If the drum track contains open cymbal crashes or syncopated accents on off-beats, blanket alternation could accidentally mute an intentional crash hit. (Guard against this by only targeting GM pitch 42/44/46 closed hat/shakers).
* **A/B Experiment:** Render an 8-bar drum-only loop. Version A with flat 100 velocity on hats; Version B with strong/weak alternating velocities (70 on beats, 45 on off-beats). Listen for groove relaxation.

#### Recommendation 3: Pruning Mid-Register Chord Clusters & Duplicate Notes
* **Audible Problem (~0:30 – 0:45):** Noticeable mud and buzzy harmonic clashes in the octave between C3 and C4 during chord progressions.
* **Proposed Intervention:** In the accompaniment tracks, detect note events sounding simultaneously within a major or minor second (semitone/whole-tone intervals) in the lower-mid register that last less than a quarter note. Selectively remove the lower note or thin 4-note voicings down to 2-note/3-note open voicings (root, 3rd, 7th).
* **Why It Helps:** Model-based transcription often interprets acoustic string scraping, guitar body resonances, or room reverberation as discrete chromatic MIDI notes. Pruning these phantom notes cleans the harmonic bed.
* **What It Might Damage:** Risk of removing authentic harmony extensions (e.g., added 9ths or suspension resolutions) intended by the composition.
* **A/B Experiment:** Select the 4 bars around ~0:35. In one file, manually filter out all simultaneous note clusters closer than a minor 3rd in the chord accompaniment channel; compare directly to the raw transcription to verify that the core chord quality is maintained.

#### Recommendation 4: WebAudio Synthesis Envelope & Low-Pass Filtering
* **Audible Problem (Throughout, especially ~0:00 – 0:15):** The TinySynth instruments have harsh, buzzing high-frequency harmonics and instant cutoffs that feel unnatural compared to the warm, rounded source track.
* **Proposed Intervention:** In the WebAudio audio graph, route the accompaniment and drum channels through a low-pass BiquadFilterNode (`type: 'lowpass'`, cutoff ~3500 Hz – 4500 Hz, Q ~0.7) and add a global convolution or simple stereo feedback delay/reverb bus. Adjust the TinySynth patch release parameter from the default short cutoff to a gentle 150–250ms decay.
* **Why It Helps:** The original track is fundamentally warm and low-passed (lo-fi/indie aesthetic). Taming the harsh GM synth highs instantly brings the sound closer to the source’s cozy ambiance without altering MIDI note data.
* **What It Might Damage:** Over-filtering can make the track sound dull or muffled, causing the lead melody to lose intelligibility.
* **A/B Experiment:** Toggle a 4 kHz 12dB/oct low-pass filter on the accompaniment and drum buses during playback. Compare the sense of "warmth" and ear fatigue over 30 seconds.

#### Recommendation 5: Guitar Strum Emulation (Onset Micro-Staggering)
* **Audible Problem (~0:00 – 0:10):** The chord strums hit as block chords—all notes strike at the exact same millisecond, sounding like a cheap electric organ rather than a plucked/strummed string instrument.
* **Proposed Intervention:** Apply a 15–25ms delay spread across the notes of simultaneous accompaniment chords (e.g., note 1 at 0ms, note 2 at +18ms, note 3 at +36ms), alternating between upward and downward strum directions.
* **Why It Helps:** Humanizes the accompaniment and spreads out the transient energy, preventing clipping and harsh transient stacking.
* **What It Might Damage:** If applied to percussion or rhythmically tight bass notes, it will cause uncoordinated, sloppy timing. Must be restricted strictly to polyphonic chord tracks.
* **A/B Experiment:** On the opening 8 seconds, stagger simultaneous notes in each chord by 20ms. Compare against the instantaneous block-chord playback.

---

### Three Highest-Value Experiments

#### 1. Straightforward MIDI Event Editing: Tiered Channel Velocities
* **Type:** MIDI event manipulation (zero synthesis changes).
* **Implementation:** Scale the raw velocities in the MIDI/event JSON by part role (Melody: 105, Bass: 85, Harmony/Guitar: 65, Drums: 60, Hat/Shaker: 45).
* **Value:** High return on minimal effort. In under five minutes of code or data adjustment, it fixes the single largest complaint—the lack of musical balance and melody masking.

#### 2. Synthesis / Audio Graph Processing: Global Bus Low-Pass Filter & Room Reverb
* **Type:** WebAudio graph adjustment.
* **Implementation:** Insert a `BiquadFilterNode` (cutoff ~4.2 kHz) and a lightweight `ConvolverNode` (small room impulse response or simple feedback comb filter) before the audio destination.
* **Value:** Immediately tames the brittle General MIDI timbre, softens harsh transients, and coats the dry TinySynth output in the cozy bedroom-pop acoustic space characteristic of the original.

#### 3. Sound-Design & Patch Selection: GM Program Substitutions for Lead & Harmony
* **Type:** Instrument/Program assignment.
* **Implementation:** Audit the assigned GM program numbers:
  * Replace thin GM acoustic guitar / clavinet accompaniment with *GM 24 (Nylon Guitar)* or *GM 4 (Electric Piano 1 / Rhodes)* for warmer mid-range support.
  * Assign the lead line to *GM 73 (Flute)*, *GM 71 (Clarinet)*, or *GM 11 (Vibraphone)* with a slightly extended release envelope.
* **Value:** Transforms the aesthetic from an abrasive early-90s PC soundcard delivery to a deliberate, charming, warm indie-game palette.

---

### Separate Creative Suggestions (Beyond Strict Preservation)
* *These are aesthetic choices for Quackpot’s cozy/casual gacha context, distinct from faithful transcription repair:*
  * **Embrace the Chiptune / Lofi Aesthetic:** Rather than trying to fake an organic acoustic band with GM samples, lean into a stylized, deliberate 16-bit or FM aesthetic (e.g., Toy Piano + Square Lead + Chiptune drums). This turns synthesis limitations into an intentional art style that fits duck-collecting gameplay.
  * **Dynamic Intensity Based on Game State:** Because the MIDI arrangement is now parsed into distinct layers (lead, harmony, bass, rhythm), Quackpot could dynamically mute the drums during quiet desk/reading moments and unmute them when opening a gacha pack or viewing a race.