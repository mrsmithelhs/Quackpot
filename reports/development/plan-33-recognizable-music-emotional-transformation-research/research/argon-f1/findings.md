# Findings — Task Argon-F1: Fixed-Melody, Changed-Harmony/Arrangement Identity Studies

**Observed Model / Provider Setting:** Google Gemini 2.5 Flash (`argon-f1` role). Platform metadata confirms execution as a bounded Flash subagent worker under the Quackpot Plan 33 orchestration framework.

---

## 1. Key Findings

### Finding 1: Kuusi (2009) Experimental Paradigm and Stimulus Discrepancy Resolved [E-full] (Source 1)
Kuusi (2009) selected 19 familiar Finnish tunes (folk songs, Christmas carols, hymns, national anthem), but the experimental analysis was conducted on exactly **14 tunes** (presented across 42 analyzed trials: two experimental manipulations plus one intact baseline version per tune, alongside 6 false catch items, totaling 48 items). This resolves the prior discrepancy: ChatGPT-A correctly reported the 14 analyzed tunes, while Claude-A and Gemini-A cited the unedited stimulus pool of 19 tunes without noting the reduction for analysis. Across 46 participants (14 professionals, 19 amateurs, 13 non-musicians), intact baseline recognition was high (Professionals: 95.9%; Amateurs: 93.6%; Non-musicians: 86.5%).

### Finding 2: Kuusi (2009) Tested Rhythm Stripping, Not Dissonant Harmonic Substitution [E-full] (Source 1)
Prior deep-research reports fundamentally mischaracterized Kuusi (2009)'s experimental conditions:
1. **Melody alone:** Intact pitches presented **isochronously** (all notes fixed at 500 ms duration with equal intensity, eliminating all rhythm and meter). Recognition rates: Professionals 76.1%, Amateurs 67.4%, Non-musicians 53.3%.
2. **Melody with harmony:** Isochronous melody (500 ms per note) accompanied by standard four-part tonal chords (also 500 ms per chord). Recognition rates: Professionals 81.3%, Amateurs 68.0%, Non-musicians 53.9%.
3. **Rhythm alone:** Correct rhythm of the tune played on a **single monotone pitch**, with a metallophone click marking measure downbeats. Recognition rates: Professionals 50.5%, Amateurs 15.6%, Non-musicians 2.5%.
4. **Rhythm with harmony:** Four-part standard harmonic accompaniment played in the rhythm of the tune, but with the **melody completely omitted** (the top voice moved according to chord voicings). Recognition rates: Professionals 37.6%, Amateurs 8.5%, Non-musicians 18.6%.

**Critical verification:** Kuusi (2009) **never replaced original harmony with altered, dissonant, or reharmonized chords**. All harmonized conditions used standard tonal chords. The manipulation contrasted pitch contour without rhythm against rhythm without melody. Gemini-A's claim that the rhythm+harmony condition featured an "incorrect melodic contour" is false; the melody was simply removed. Adding standard harmony to an isochronous melody produced only negligible recognition gains (+0.6% for non-musicians, +0.6% for amateurs, +5.2% for professionals), showing that melody pitch contour carries the vast majority of identity information.

### Finding 3: Melodic Invariance Survives Harmonic Deformations, but Secondary Reharmonization Degrades Identification [E-full] (Source 2)
In Liu (2018) ($N = 80$ adult listeners), participants performed a conservation task ("same or different melody?") across 34 paired musical excerpts. Adding primary, diatonic, or secondary chords to an unaccompanied melody did not significantly harm recognition (Task 1). However, when a melody was actively reharmonized (Task 2), changing from primary triads (I, IV, V) to diatonic substitutions (ii, iii, vi) preserved melody recognition significantly better than changing from primary triads to secondary (chromatic/applied) chords. While adults can dissociate melody from harmony (Task 3), harmonic distance and complexity significantly increase false-negative ("different melody") judgments.

### Finding 4: Cross-Cultural Robustness of Melodic Conservation Under Harmonic Variance [E-abs] (Source 3)
Liu (2021/2022) compared Chinese ($N = 131$) and US ($N = 61$) adult listeners on melodic conservation across three tasks: (1) melody alone then harmonized, (2) harmonized melody then reharmonized, and (3) harmonized melody then alone. Both cultural groups exhibited robust, statistically significant conservation of melodic identity across all harmonic transformations, demonstrating that cognitive abstraction of a melodic line from its harmonic accompaniment is a stable perceptual capacity across differing cultural and pedagogical backgrounds.

### Finding 5: Gemini-A Completely Inverted Jimenez, Kuusi, & Ojala (2022) [E-full] (Source 4)
Gemini-A claimed that in Jimenez, Kuusi, & Ojala (2022), "listeners judged melodies as identical to themselves despite radical harmonic re-accompaniment, largely ignoring background chords in identity judgments." This claim is **entirely false**. Jimenez et al. (2022) did not test melody recognition or melody identity. The melody consisted of fixed vocal tracks from 10 commercial pop songs. Participants ($N = 120$) were asked to rate on a 7-point scale whether the accompanying block chord was the **original chord of the recording**. Target chords (original) received significantly higher match ratings than schematic lures (plausible diatonic substitutions), and clash chords (dissonant/tonal clashes) received drastically lower ratings near the floor. Listeners did not ignore background chords; they demonstrated acute sensitivity to harmonic deviation while the melody remained fixed.

### Finding 6: Harmonic Progressions Alone Can Evoke Tune Identity When Acoustic Surface Cues Are Preserved [E-full] (Sources 5, 6)
Jimenez & Kuusi (2016, 2018) examined whether listeners ($N = 65$) could identify familiar pieces from isolated block-chord progressions without melody or rhythm. Listeners identified pieces significantly above chance, particularly musically trained participants. Crucially, identification success was significantly higher when chord progressions were played with naturalistic piano timbre than with spectrally ambiguous Shepard tones, showing that acoustic surface familiarity reinforces harmonic memory retrieval.

### Finding 7: Changing Timbre and Instrumentation Significantly Impairs Recognition in Tonal Music [E-full] (Source 7)
Poulin-Charronnat et al. (2004) ($N = 64$) tested recognition of musical themes when instrumentation changed between presentation and test (e.g., piano solo vs full orchestra). In tonal music (Liszt's *Les Préludes*, Experiment 3), changing instrumentation caused a significant, sharp decline in recognition for **both musically trained and non-musician listeners**. Unlike pitch transposition, which listeners readily normalize, timbre changes disrupt the perceived identity of musical excerpts because timbre is encoded as an integral acoustic dimension of the musical trace.

### Finding 8: Timbre Is Stored as a Persistent Long-Term Memory Trace [E-full, E-abs] (Sources 8, 9)
Schellenberg & Habashi (2015) ($N = 192$) and Lim & Goh (2012) demonstrated that surface timbre is not discarded after abstraction. While memory for tempo and key transpositions decays significantly after 24 hours to 1 week, timbre changes (e.g., piano to saxophone) continue to impair melody recognition across a full week delay. Furthermore, Lim & Goh (2012) showed that cross-family timbre shifts (e.g., piano to saxophone) produce significantly greater recognition impairment than within-family timbre shifts (e.g., violin to cello).

### Finding 9: Repetition Shifts Perception from Surface Acoustics to Thematic Concepts [E-abs] (Source 10)
Pollard-Gott (1983) demonstrated using Liszt's *Piano Sonata in B minor* that on initial hearing, listeners sort musical passages primarily by surface acoustic features (tempo, register, loudness, texture). With repeated exposure, listeners' mental representations reorganize around **thematic identity**, grouping transformed passages by their shared melodic-thematic core despite radical changes in tempo, harmony, and character.

### Finding 10: Cue Abstraction Anchors Melody Recognition for Non-Musicians [E-abs] (Source 11)
Mélen & Deliège (1995) established that listeners—especially non-musicians—recognize familiar melodies primarily through "cue abstraction": extracting salient local surface features (distinctive pitch contours, characteristic rhythmic motifs, opening intervals) as cognitive anchors. Musically trained listeners can recruit underlying harmonic schemata, but untrained listeners rely almost exclusively on these abstracted surface cues to verify melodic identity.

### Finding 11: Mechanics of Progressive Emotional Transformation Under Fixed Identity [H] (Sources 1, 2, 4, 7, 9, 10, 11)
To make a familiar loop sound progressively uneasy and then dire while guaranteeing that players recognize it as the exact same tune:
- The lead melodic voice (pitches, rhythm, and lead synth timbre) must remain constant or undergo only subtle within-family shifts.
- Harmonic tension should be introduced through diatonic reharmonization first (ii, iii, vi substitutions), progressing to secondary chords, minor-mode modal interchange, and finally clustered dissonance/clash chords in the accompaniment.
- Because repeated exposure causes listeners to abstract the core theme (Finding 9), early iterations establish the thematic concept, enabling later iterations to withstand severe harmonic deformations without identity collapse.

---

## 2. Uncertainty and Context Limits

1. **Laboratory Stimuli vs. Game Loops:** The empirical studies cited (Kuusi 2009; Liu 2018; Poulin-Charronnat et al. 2004) tested isolated phrases (3 to 15 seconds) under explicit laboratory listening instructions. In an idle/gacha game, music functions as background accompaniment during active visual/interactive tasks. Background listening may reduce sensitivity to subtle harmonic nuances while increasing reliance on prominent lead cues.
2. **Artificial Stimulus Constraints:** Kuusi (2009) employed isochronous notes (500 ms) and unvoiced block chords to isolate parameters. In real music, rhythm and melody are tightly bound; stripping rhythm artificially depresses recognition rates.
3. **Publication and Population Skew:** Liu (2018, 2022) tested university students in the US and China; Kuusi (2009) tested Finnish adults; Poulin-Charronnat et al. (2004) tested French students. While Liu (2022) demonstrated cross-cultural stability across China and the US, all studies relied on educated young adults familiar with Western tonal music.
4. **Reharmonization Extremes:** Liu (2018) tested primary vs diatonic vs secondary chords, but did not test atonal clusters or extreme polytonality. Jimenez et al. (2022) included tonal clash chords, but tested chord matching rather than melody recognition. The exact perceptual threshold where extreme harmonic dissonance causes untrained listeners to judge a melody as "different" rather than "deformed" has not been formally mapped in empirical literature.

---

## 3. Transferable Recommendations for the Owner's Goal

### Recommendation 1: Hold the Lead Melody's Pitch, Rhythm, and Primary Timbre Invariant [E-full, High Confidence] (Sources 1, 7, 8, 10, 11)
- **Action:** Compose an original 8–16 bar gacha theme with a highly distinctive rhythmic-melodic contour (strong opening motif). Synthesize the lead line with a dedicated, unchanging instrument patch (e.g., a specific chiptune square-wave or bright synth bell).
- **Rationale:** Kuusi (2009) shows pitch contour carries primary identity; Mélen & Deliège (1995) show surface cues anchor identity; Poulin-Charronnat et al. (2004) and Lim & Goh (2012) prove changing lead timbre severely degrades melody recognition. Keeping the lead voice invariant ensures instantaneous identity recognition across all states.

### Recommendation 2: Stage Emotional Progression Across Four Harmonic Tiers [E-full, E-abs, Med Confidence] (Sources 2, 4, 10)
- **Stage 1 (Normal / Innocent):** Standard diatonic major harmony using primary triads (I, IV, V) with standard accompaniment texture.
- **Stage 2 (Subtle Unease / Fraying):** Diatonic reharmonization substituting secondary diatonic chords (ii, iii, vi) and tonic extensions (maj7, add9). Per Liu (2018), diatonic substitutions preserve high melody conservation while softening stability.
- **Stage 3 (Dire / Entrapped):** Secondary dominants, modal borrowing / interchange (substituting iv, bVI, bVII from parallel minor), and diminished passing chords. Bass line shifts from root-position fundamentals to uneasy pedal points or descending chromatic lines.
- **Stage 4 (Nightmarish / Broken):** Dissonant tension in the accompaniment (semitone cluster seconds, tritone clashes against the melody notes, bitonal pads). As demonstrated by Jimenez et al. (2022), clash chords evoke sharp perceptual violation, but because the player has heard the loop repeatedly (Pollard-Gott 1983), the melody line will be recognized as the same tune trapped in dissonance.

### Recommendation 3: Transform Accompaniment Texture and Register, Not the Lead Register [E-full, Med Confidence] (Sources 7, 9, 11)
- **Action:** In later stages, leave the lead melody in its original register, but mutate the backing arrangement: filter low frequencies, introduce detuned unison delays, add subtle pitch-drift/flutter (wow/flutter effects), and thin out rhythmic accompaniment into sparse, unpredictable stabs.
- **Rationale:** Schellenberg & Habashi (2015) show timbre and register are bound to episodic identity; isolating harmonic degradation to the backing texture allows the lead theme to remain fully recognizable.

### Testable Paired-Listening Check (for Plan 32)
Conduct a simple A/B listening check with 3–5 listeners:
1. Play Stage 1 (Original) for 2 loops (establishing thematic concept).
2. Play Stage 4 (Dissonant / Dire) for 2 loops.
3. Ask two specific questions: (a) *"Is this the same song/tune being played?"* (Yes/No); (b) *"How does the mood of the second version compare to the first?"* (Rating from +3 peaceful/happy to -3 alarming/dire). If any listener answers "No" to (a), pull back dissonant accompaniment intervals that directly mask the lead melody's pitch frequencies.

---

## 4. Open Questions Worth Passing to the Owner

1. **Loop Cadence Resolution:** When the tune reaches Stage 4 (dire), should each loop iteration cadence unresolved (hanging on a suspended or unresolved dissonant chord, driving forward urgency), or should it resolve cleanly to maintain structural normalcy?
2. **Interactive vs. Narrative Triggering:** Does the musical transition between stages occur strictly based on authored story milestones (e.g., reaching specific narrative chapters / pawn states), or dynamically based on run-spending velocity?
3. **Apartment Crossfade Balance:** During apartment-to-gacha transitions, should the apartment ambiance completely duck beneath the gacha loop, or blend tonally as a muffled background layer?
