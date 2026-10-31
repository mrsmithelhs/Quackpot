# Extending "Lucky Ripple" into a Seamless 8-Bar Loop: Phrase Form, the Beat 6–8 Gap, Reharmonization, and Web Audio Looping

**Recommendation:** Build the 8-bar loop as a **sentence that ends on a half cadence**. Keep the melody's arrival on D5 at Beat 6.0, but stop the harmony from closing there: under the held note, play Em7 → A7sus4. A soft accompaniment pickup (E4–F#4–G4–A4) then fills the two-beat gap. Bar 8 should stop on the dominant (A7), so the downbeat that resolves the loop is the next Bar 1.

## TL;DR
- **Form:** Use Motif C (bars 1–2), then Motif C reharmonized on vi/iii/IV (bars 3–4), then a fragmented and sequenced version of the opening cell (bars 5–6), then the motif's tail landing on a deceptive Bm7 and a Bar 8 half cadence on A7. The hook's shape is present in every bar. A dominant leads into each loop restart, so the seam never stacks one tonic on another.
- **The Beat 6.0–8.0 gap:** Keep D5 sustained as a pedal while the harmony moves underneath it (Em7 → A7sus4), and let the bass and a counter-line hocket through the gap. One perception study found that changing the accompanying chords did not impair melody recognition (Povel & Van Egmond, 1993).\[1\] vi (Bm7) is the strongest substitute for the motif's opening, because F#5, A5 and D6 are all chord tones. iii does not work under that cell: D6 sits a half step above F#m's fifth (C#), which produces a ♭9 clash. I could not verify the "Liu 2018/2022" melody-conservation studies.
- **Seam and longevity:** Schedule notes on the AudioContext clock with a lookahead scheduler (25 ms tick, 100 ms window). Either let release tails overlap naturally on the continuous timeline, or pre-render and fold the 0.12 s tail back onto the start of a 921,600-sample (48 kHz) buffer. Rotate four arrangement passes over a constant lead timbre, including one pass where the melody rests.

---

## Key Findings

### Evidence status at a glance

| Requested item | Status | What it supports |
|---|---|---|
| Caplin/Schoenberg sentence and period models | Verified (Caplin via Open Music Theory and course notes) | Presentation, continuation and cadential functions; the period's weak (half) cadence at bar 4 |
| Koji Kondo on loops not getting tiresome | Verified (Game Developer interview, GameSpot, translated songbook interview) | Repeated self-listening as a test; counterpoint/obbligato as the reason loops don't wear out |
| Super Mario Bros. loop architecture | Verified (Schartmann, quoting Karen Collins) | Out-of-order repetition; 72% internal repetition |
| Lena Raine on loopable melodies | Verified (No Tags podcast, Spitfire interview) | Simple, groove-based hook, then the chord progression carries on ("riff-ability") |
| Yu-Peng Chen on theme reuse | Verified, but the source is HoYoverse promotional material | One theme re-orchestrated for day, dusk and night; sequencing as a development device |
| Melody recognition under changed accompaniment | Verified (Povel & Van Egmond 1993, abstract level) | Changing chords did not impair melody recognition |
| "Liu 2018 / 2022" melody-conservation studies | **Not verifiable.** No such perception study found; the only "Liu 2018" hits are computational lead-sheet generation papers | Do not cite |
| Web Audio scheduling | Verified (web.dev "A Tale of Two Clocks", MDN, independent benchmark) | Lookahead scheduling; native buffer looping; risk of timer throttling in hidden tabs |

### 1. Phrase models compared for a hook that closes on the tonic

**What the sources say:**
- In Caplin's sentence, a two-bar basic idea is repeated to form a presentation that prolongs the tonic. A continuation follows, using any mix of fragmentation, faster harmonic rhythm, faster surface rhythm and sequence, and then a cadence.\[2\] Open Music Theory's model example is Mozart K. 283: one-measure fragments are "sequenced one step lower," and the harmony goes from changing once per measure to twice per measure.\[3\]
- A period puts a basic idea against a contrasting idea that "brings a weak cadence" (Caplin, p. 49), usually a half cadence.\[4\]
- WKMT's "Analysing Classical Sonatas – The Sentence" (Piano Lessons London) says of the cadential idea that "it is very common to find half-cadences because, in this way, continuity is favoured." That is the property a loop needs.

**Applied to Motif C:**

| Model | How it fits Motif C | Loop behaviour | Verdict |
|---|---|---|---|
| **Antecedent/consequent (HC at bar 4)** | The antecedent needs an open ending, so the motif's signature drop to D5 would have to become E5 or A5. That alters the hook at its most memorable point. A normal consequent ends on a PAC at bar 8, which then runs straight into Bar 1's tonic, so I meets I at the seam. | Balanced, but the seam is static unless the bar 8 PAC is evaded | Workable only with an evaded bar 8 |
| **Sentence (presentation, continuation, cadential)** | The motif is already a two-bar basic idea. Repeating it (bars 3–4) is idiomatic. Fragmentation in bars 5–6 develops the hook instead of adding new filler (which caused Failure 2), and the cadence can be a half cadence. | Momentum keeps building, and a bar 8 HC drives into Bar 1 | **Recommended** |
| **Call-and-response / groove-led** | Fixes the "barren" texture of Failure 1, but if the groove takes over without the hook it repeats Failure 3's bait-and-switch. | Good for variety over many passes | **Use as a layer and as a pass variant, not as the whole form** |

**How the composers handle it:**
- **Koji Kondo** treats loops as needing to survive long-term repetition. He says game music is "something that you're going to hear again and again… the music has to be something that's not going to get on your nerves."\[5\] He tests by listening "over and over and over and over and over again."\[6\] In a translated songbook interview he credited the Zelda themes' durability partly to the obbligato: "by composing so the counterpoint was audible in the phrasing, I think I managed to come up with tunes that didn't get old."\[7\] That supports writing a real counter-line rather than a drone.
- **Super Mario Bros. "Overworld":** Schartmann, citing Karen Collins, describes the loop as Intro ||: A B B C A D D C D :||. Sections recur "always… in a different context." Internal repetitions make up 72% of the theme: the 90-second piece contains only 25.5 seconds of unique material.\[8\] Heavy reuse in changing contexts is the model, which is the opposite of Failure 2's fifteen new filler notes.
- **Lena Raine** says complex melodies "lose people," while "simple and repetitive… if it's a good groove then it's going to stick." She also describes stating a catchy phrase and then going "into the chord progression for a while," so that listeners "start either hearing the melody that they remember, or they start riffing to themselves internally."\[9\] This is the case for letting the hook rest on some passes.
- **Yu-Peng Chen** (HoYoverse promotional material, so treat with some caution) says much of Genshin Impact's music was "derived from that one tune." Day, dusk and night variations "share the same tonality" with different orchestration.\[10\] He calls sequencing, "changing pitch and repeating the cycle," a core development technique.\[11\] His first demo tested the bare melody "without any accompanying harmony" to check its potential for variation.\[12\]

### 2. Melody conservation under reharmonization (Research Question 3)

**What the sources say:**
- **Povel & Van Egmond (1993), *Music Perception* 11(2):101–115.** Nine-tone melodies were compared with and without accompaniment, and with different accompaniments. The abstract reports that "melody recognition is unaffected by the variations in accompaniments, supporting the view that melody and accompaniment are processed relatively independently."\[1\] Caveat: I saw only the abstract, not the full text, so I cannot say which chord substitutions were tested.
- **Jimenez, Kuusi & Ojala (2022), *Music Perception* 40(2).** They summarize Povel & Van Egmond as showing that listeners "can at least partially ignore the accompanying harmony in short-term memory tasks."\[13\] Their own design separates schematically plausible substitute chords ("lures") from chords that clash with the melody.\[13\]
- **A contrasting tone-level result:** Slana, Repovš, Fitch & Gingras (2016), *Acta Psychologica* 166:54–63, tested 19 musicians and 19 non-musicians on same/different pitch-class judgments. Listeners "were most accurate when the chords remained the same, less so in the absence of chordal accompaniment, and least when the chords differed between both target tones." So changing chords can affect perception at the level of single notes, even though recognition of the whole melody holds up.
- **Schellenberg & Habashi (2015).** Changing key or tempo hurt recognition after 10 minutes and after 1 day, but not after 1 week.\[14\] Changing timbre "affected recognition negatively after all three delays."\[15\] The practical lesson is to **keep the lead timbre fixed** and vary the accompaniment instead.
- **Functional-substitution practice:** I, vi and iii belong to the tonic family, and IV and ii to the subdominant. Avoid ♭9 and tritone intervals between the melody and the new chord.\[16\]
- **The "Liu 2018/2022" studies:** I could not find any music-perception study by an author named Liu, in either year, on melody recognition under ii/iii/vi substitution. The only "Liu 2018" results are a lead-sheet *generation* paper (Liu & Yang, IEEE ICMLA).\[17\] Treat any citation of this as unverified.

**Substitution audit of Motif C** (my analysis, applying the ♭9 rule):

| Melodic cell | Original implied harmony | vi (Bm7) | iii (F#m7) | ii (Em7) | IV (G/Gmaj7) |
|---|---|---|---|---|---|
| F#5–A5–D6 (Beats 0–1) | D | **All chord tones (best)** | ✗ D6 is a ♭9 above C# | Usable as color (9th, 11th, 7th) but vague | D is the 5th; F# is the maj7 |
| C#6 (Beat 2) | A or A/C# | C# is the 9th (soft) | **5th of F#m7 (best)** | ✗ C# is outside the chord and sounds harsh | ✗ C# is ♯11 |
| A5–F#5 (Beat 3) | D | Chord tones | **Chord tones** | Color tones | 9th and maj7 |
| B5 (Beat 4) | G | Root | ✗ B over F#m is weak | 5th | **3rd (best)** |
| D5 sustained (Beats 6–8) | D (closure) | **3rd: closes the melody but evades the harmony** | ✗ | **7th: reactivates** | 5th |

### 3. The Beat 6.0–8.0 gap

The motif ends with closure in the melody. The fix is to keep that melodic closure but deny harmonic closure, and to fill the time with rhythm instead of new lead material. The Jazz Piano Site's "How to Reharmonize a Song" recommends exactly this: "On a long melody note or repeated melody note, move through a number of chords (this makes the melody note a kind of pedal point, which sounds great)." D5 is the 7th of Em7 and the 4th of A7sus4, so the sustained tonic becomes a ii7–V7sus4 that leans toward Bar 3. Voice-leading check (my analysis): the counter-line notes E4, F#4, G4 and A4 form a 7th, 6th, 5th and 4th below D5. That is a converging line with no seconds against the held note.

---

## Details: Note-Level Blueprint (D major, 4/4, ♩=100, 1 beat = 0.60 s, loop = 32 beats = 19.20 s)

Beat numbers are absolute within the loop (0–32). MIDI pitches are in parentheses. Everything in this section is my compositional design, applying the sourced principles above.

### Form map

| Bars | Function | Lead | Harmony (beats) |
|---|---|---|---|
| 1–2 | Basic idea | Motif C exactly as given (events 0–9) | D (0–2), A/C# (2–3), Bm7 (3–4) / G (4), D/F# (5), **Em7 (6), A7sus4 (7)** |
| 3–4 | Repeated basic idea, reharmonized | Motif C repeated, same pitches and rhythm, lead D5 sustained beats 14–16 | **Bm7 (8–10), F#m7 (10–12)** / Gmaj7 (12–14), Em7 (14), G/A (15) |
| 5–6 | Continuation: fragmentation, sequence, faster harmonic rhythm | Bar 5: opening cell sequenced up a step on ii; Bar 6: half-bar fragments | Em7 (16–20) / D/F# (20–22), A7 (22–24) |
| 7 | Cadential: the hook's tail returns | B5–A5–F#5–D5 (shape of events 6–9) | Gmaj7 (24), D/F# (25), **Bm7 (26–28), deceptive** |
| 8 | Half-cadence turnaround; lead rests (response) | Counter-line echoes Bar 1 an octave lower | Em7 (28–30), A7 (30–32) → next loop's D |

### Lead line, bars 5–7 (new events; bars 1–4 repeat Motif C exactly)

| Beat | Pitch | Dur | Note |
|---|---|---|---|
| 16.0 | G5 (79) | 0.5 | Bar 1's rhythm, sequenced up a step on Em7 |
| 16.5 | B5 (83) | 0.5 | |
| 17.0 | E6 (88) | 1.0 | One step above the hook's D6 peak: the climax |
| 18.0 | D6 (86) | 1.0 | 7th of Em7 |
| 19.0 | B5 (83) | 0.5 | |
| 19.5 | G5 (79) | 0.5 | |
| 20.0 | F#5 (78) | 0.5 | Half-bar fragment at the original pitch (identity) |
| 20.5 | A5 (81) | 0.5 | |
| 21.0 | D6 (86) | 1.0 | |
| 22.0 | E5 (76) | 0.5 | Fragment sequenced onto A7 (5th, 7th, 3rd) |
| 22.5 | G5 (79) | 0.5 | |
| 23.0 | C#6 (85) | 1.0 | Leading tone; echoes Event 3 |
| 24.0 | B5 (83) | 1.0 | Tail of Motif C |
| 25.0 | A5 (81) | 0.5 | |
| 25.5 | F#5 (78) | 0.5 | |
| 26.0 | D5 (74) | 2.0 | Closes the melody over Bm7, so the harmony stays open |
| 28.0–32.0 | rest | — | Accompaniment answers |

### Bridging the Beat 6.0–8.0 gap (and its equivalents at beats 14–16 and 28–32)

**Bar 2, Beats 6.0–8.0 (rising pickup, hocketed):**
- Lead: D5 (74) held.
- Counter-line (soft sine or triangle "celesta," velocity about 0.50): E4 (64) at 6.0, F#4 (66) at 6.5, G4 (67) at 7.0, A4 (69) at 7.5, each an eighth note. The rising contour answers the motif's descending tail and sets up F#5 at Beat 8.
- Bass: E2 (40) at 6.0 for a quarter; A2 (45) at 7.0 for an eighth; then rest at 7.5 so the counter-line's A4 carries the upbeat on its own (the hocket).

**Bar 4, Beats 14–16 (descending echo, for variety):**
- Counter-line: G4 (67) at 14.0, F#4 (66) at 14.5, E4 (64) at 15.0 for a quarter, over Em7 → G/A.
- Bass: E2 (40) at 14, A2 (45) at 15.

**Bar 8, Beats 28–32 (call-and-response; the lead is silent):**
- Counter-line plays Bar 1 an octave lower as a "preview" of the hook: F#4 (66) at 28.0, A4 (69) at 28.5, D5 (74) at 29.0 (quarter), C#5 (73) at 30.0 (quarter, the 3rd of A7), A4 (69) at 31.0, F#4 (66) at 31.5. The lead's F#5 at the next Beat 0 completes the phrase an octave higher.
- Bass: E2 (40) at 28 for 1.5 beats, B2 (47) at 29.5, A2 (45) at 30 for 1 beat, A2 at 31, C#3 (49) at 31.5 → D3 at the loop's downbeat.

### Bass line (full loop)

Bar 1: D3 (50) 0–1.5, A2 (45) 1.5, C#3 (49) 2, B2 (47) 3.
Bar 2: G2 (43) 4, F#2 (42) 5, E2 (40) 6, A2 (45) 7 (eighth).
Bar 3: B2 (47) 8–9.5, F#2 (42) 9.5, F#2 10–11.5, C#3 (49) 11.5.
Bar 4: G2 (43) 12–13.5, D3 (50) 13.5, E2 (40) 14, A2 (45) 15.
Bar 5: E2 (40) 16–17.5, B2 (47) 17.5, E2 18–19.5, G2 (43) 19.5.
Bar 6: F#2 (42) 20–21.5, A2 (45) 21.5, A2 22–24.
Bar 7: G2 (43) 24, F#2 (42) 25, B2 (47) 26–27.5, F#2 (42) 27.5.
Bar 8: as specified above.

### Comp voicings (offbeat eighth "plucks" at x.5 of each beat, 0.25-beat duration, velocity about 0.45)

The voicings are chosen for minimal movement between chords. Several of them share the same three notes, so only the bass changes:
- D, D/F# and Bm7: F#3–A3–D4 (54–57–62)
- G, Em7 and G/A: G3–B3–D4 (55–59–62)
- Gmaj7: F#3–B3–D4 (54–59–62)
- F#m7: E3–A3–C#4 (52–57–61)
- A7sus4: G3–A3–D4 (55–57–62); A7: G3–A3–C#4 (55–57–61)
- A/C#: A3–E4 (57–64). Leave out C#4 here so the leading tone isn't tripled against the bass C#3 and the lead's C#6.

### Dynamics
All ten motif events currently sit at velocity 0.78. That flatness adds to fatigue. My suggestion: downbeats around 0.82, offbeat eighths around 0.70, and the climactic E6 at Beat 17 around 0.85.

---

## Recommendations: Freshness Across Long Reading Sessions

1. **Run a four-pass meta-loop (76.8 s) instead of one 19.2 s loop.** This applies the reordering, layering and "melody rests" ideas sourced below.
   - **Pass A:** Exactly as written above.
   - **Pass B:** Comp switches to broken-chord arpeggios. Bar 2 uses the descending echo; Bar 4 uses the rising pickup.
   - **Pass C ("hook rests"):** The lead plays only bars 1–2 and 7–8. In bars 3–6 the counter-line carries fragments of the motif an octave lower. This follows Raine's "go into the chord progression for a while."\[9\]
   - **Pass D:** As Pass A, plus a quiet glockenspiel doubling the lead in bars 1–2 only.

   Marcelo Martins's "Rethinking the audio loop in games" (Game Developer) gives five numbered low-cost fixes for loop fatigue. Solution 2, muting the melody, was used in the Skyview Temple of *Zelda: Skyward Sword*. Solution 3, silence, was used in *Halo*: "When the player spent too much time in one stage, the music simply disappeared." In combination, music can "repeat without melodies after a while… and fall into silence, returning with parts reversed." Interactive-music literature describes these approaches as vertical layering and horizontal resequencing (Collins's "variable branching form").\[18\]

2. **Keep the lead timbre constant across all passes.** Timbre changes impaired melody recognition at every delay tested (Schellenberg & Habashi). Change the accompaniment instead.

3. **Add a "breath" occasionally.** For example, after every third meta-loop (about 4 minutes), play 4 bars of pad and bass only, or 5–10 s of silence. Martins suggests: "Play the loop 3 times... After the third repetition, let the music subtly disappear. Leave the game in silence for a while and repeat the operation."

4. **Mix so the accompaniment is audible.** Failure 1's drone at −31 dBFS was effectively inaudible. My suggested starting levels relative to the lead: bass −4 dB, counter-line −6 dB, comp −10 dB, shaker −18 dB. Low-pass the comp around 3 kHz for comfortable reading. Keep master peaks around −6 dBFS.

5. **Rely on repetition, but at the right size.** In Margulis (2013), "Aesthetic Responses to Repetition in Unfamiliar Music," *Empirical Studies of the Arts* 31(1):45–57, listeners heard 1-minute Berio and Carter excerpts and "rated the excerpts in both repetition conditions as more enjoyable, interesting, and artistic than the original, unaltered versions." Repeated listening shifts attention toward larger-scale structure; listeners first picked out repeats lasting 1–8 seconds. Motif C's 4.8 s length falls within that range.

---

## Implementation Notes: Seamless Looping in the Browser (Web Audio, no network assets)

**Timing (from web.dev's "A Tale of Two Clocks"):**
- Schedule every note against `AudioContext.currentTime`, not `setTimeout`.\[19\]
- The reference metronome uses "a setTimeout interval of 25ms" and each call "will schedule for the next 100ms."\[20\]
- Compute times from integers to avoid floating-point drift: `t = t0 + n*19.2 + beat*0.6`.
- Convert pitch with `f = 440 * 2 ** ((midi - 69) / 12)`.

**Hidden tabs (one developer's benchmark in headless Chromium, so treat as indicative):**
- A lookahead scheduler held notes "within 0.01 ms of the grid" under load.\[21\]
- In a silent hidden tab, timer-ticked lookahead made "2,763 of 2,820" notes late. A Worker-driven tick had "0 late notes."\[21\]
- The same author cites Chrome's exemption for pages that have "made noises in the past 30 seconds."\[21\]
- In practice: drive the tick from a Web Worker, or use the pre-render option below.

**Release tails at the seam:**
- **Option 1, live synthesis:** Each loop iteration is scheduled on one continuous timeline, so a 0.12 s release starting at Beat 31.5 simply overlaps the next Bar 1 with no special handling. Ramp gains with `setTargetAtTime`/`linearRampToValueAtTime` (never set them directly)\[19\] and use a ~5 ms attack to avoid clicks.
- **Option 2, pre-render (most robust; Joe Sullivan's "A Tale of No Clocks"):**
  1. Render one 4-pass meta-loop in an `OfflineAudioContext` of length (76.8 + 0.12) s.\[22\]
  2. Add the samples after the loop end back onto the first 0.12 s of the buffer. This is the buffer version of the DAW "tail-to-front" technique.\[23\]
  3. Trim the buffer to exactly 76.8 s and play it through an `AudioBufferSourceNode` with `loop = true`. The browser then repeats it continuously without any further JavaScript scheduling.\[22\]\[24\]

  At 48 kHz, one 8-bar loop is exactly 921,600 samples (846,720 at 44.1 kHz). Both are whole numbers, so the loop never drifts by a fraction of a sample.
- **First playback:** Start at Beat 28 (Bar 8) so the hook's first entrance is already introduced by the counter-line.

---

## Caveats
- I confirmed the Povel & Van Egmond result from the abstract (via Crossref and a later citing paper), not from the full text. Their chord manipulations may not be ii/iii/vi substitutions specifically.
- The "Liu 2018/2022" findings could not be verified and are not used here.
- Composer statements describe general philosophies, not documented phrase-extension procedures. Kondo's Zelda quote comes from a fan translation. Chen's quotes are from publisher promotional content. None of these composers is documented as using the exact Motif C techniques proposed here.
- Margulis's repetition experiment used excerpts from atonal works (Berio, Carter), so applying it to a cozy tonal loop is an extrapolation. The sources disagree on who the listeners were: Albrecht's *Music Theory Online* review describes them as professional theorists, while the 2013 abstract describes listeners "who lacked special expertise in contemporary art music."
- The hidden-tab throttling figures come from a single developer's headless-Chromium tests. Re-test in the target browsers before shipping.
- The A7 (Bar 6) → Gmaj7 (Bar 7) move is a V–IV retrogression. This is idiomatic in pop (de Clercq & Temperley found IV is the most common non-tonic chord in their rock corpus, with no strong asymmetry in root motion), but it is not Classical practice.\[25\] Swap in Em7 at Bar 7 Beat 0 for a more Classical sound.

## Sources

1. <https://api.crossref.org/works/10.2307/40285612>
2. [The Phrase, Archetypes, and Unique Forms – Open Music Theory](https://viva.pressbooks.pub/openmusictheory/chapter/phrase-archetypes-unique-forms/)
3. [The sentence – Open Music Theory - Elliott Hauser](https://elliotthauser.com/openmusictheory/sentence.html)
4. [Thematic Function – Open Music Theory](https://openmusictheory.github.io/themeFunctions)
5. [The Mario Maestro speaks: Koji Kondo on composing classics](https://www.gamedeveloper.com/audio/the-i-mario-i-maestro-speaks-koji-kondo-on-composing-classics)
6. [Creating Nintendo's Most Memorable Melodies: Q&A With Koji Kondo - GameSpot](https://www.gamespot.com/articles/creating-nintendo-s-most-memorable-melodies-q-a-wi/1100-6424209/)
7. [Special Interview - Koji Kondo -](https://glitterberri.com/ocarina-of-time/special-interview-koji-kondo/)
8. [Koji Kondi Week - Day 4: Overworlds and Underworlds - Small books. Big Albums.](https://333sound.com/koji-kondi-week-day-4-overworlds-and-underworlds/)
9. [11: Lena Raine and the quest for the cozy web - No Tags](https://notagspodcast.substack.com/p/11-lena-raine)
10. [Soundtrack/Background | Genshin Impact Wiki | Fandom](https://genshin-impact.fandom.com/wiki/Soundtrack/Background)
11. [Forest of Jnana and Vidya/Background | Genshin Impact Wiki | Fandom](https://genshin-impact.fandom.com/wiki/Forest_of_Jnana_and_Vidya/Background)
12. [Developer Insight #3 - Behind the Music of Genshin Impact (1)](https://genshin.hoyoverse.com/en/news/detail/5000)
13. [Veridical and Schematic Memory for Harmony in Melody-and-Accompaniment Textures | Music Perception | University of California Press](https://online.ucpress.edu/mp/article/40/2/89/194652/Veridical-and-Schematic-Memory-for-Harmony-in)
14. [Remembering the melody and timbre, forgetting the key and tempo - PubMed](https://pubmed.ncbi.nlm.nih.gov/25802029/)
15. [(PDF) Remembering the melody and timbre, forgetting the key and tempo](https://www.researchgate.net/publication/274086950_Remembering_the_melody_and_timbre_forgetting_the_key_and_tempo)
16. [Reharmonization: Diatonic Chord Substitution - Composer Focus](https://composerfocus.com/reharmonization-diatonic-chord-substitution/)
17. [Automatic Melody Harmonization with Triad Chords: A Comparative Study](https://arxiv.org/pdf/2001.02360)
18. [Chapter 3](https://etheses.whiterose.ac.uk/27365/1/Chapters/Chapter%203/Chapter%203.html)
19. [The Web Audio API for Interactive Apps: Building Dynamic Soundscapes That React in Real Time | Simplified Media](https://simplified.media/guides/web-audio-api)
20. [A tale of two clocks | Articles | web.dev](https://web.dev/articles/audio-scheduling)
21. [Web Audio Scheduling Drift: setTimeout vs the Audio Clock](https://abchaudary.me/blog/web-audio-scheduling-drift)
22. [A Tale of No Clocks](http://joesul.li/van/tale-of-no-clocks/)
23. [Video Game Music: How to Create a Seamless Loop](https://www.makeuseof.com/how-to-create-music-loop-video-games/)
24. [Online Audio Looper 2026 | Free Browser Loop Editor with Zero-Crossing Snap & WAV Export | Tools 4 Music 2026](https://tools4music.com/tools/audio-looper)
25. [A Corpus Analysis of Rock Harmony Trevor de Clercq and David Temperley](https://www.midside.com/presentations/declercq_2010_nemcog_slides.pdf)
