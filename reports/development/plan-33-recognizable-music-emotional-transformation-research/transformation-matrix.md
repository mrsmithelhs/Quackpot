# Plan 33 — Base → Uneasy → Dire Transformation Matrix

**Date:** 2026-10-28 (system clock; updated by Gemini 4 Argon integrator)
**Purpose:** Three bounded approaches for transforming one original gacha hook across **Base → Uneasy → Dire**. Cells specify **anchors retained**, **parameters altered**, **hypothesized impression (`[H]`)**, and **verified supporting evidence with its limits**.
**Evidence labels:** **`[E-full]`** measured, full text / methods+results read; **`[E-abs]`** measured, abstract/repository/citation verified; **`[P]`** composer/developer account; **`[T]`** music theory/specification; **`[H]`** hypothesis/inference. Full source details: `sources/index.md`, `deep-research/prompt-a/verification.md`, and `deep-research/prompt-b/verification.md`.

---

## 1. Controls Applied to Every Comparison

| Control | Setting | Why It Matters |
|---|---|---|
| **Loudness (LUFS / RMS)** | Match integrated loudness and peak headroom across Base, Uneasy, and Dire within every comparison pair; verify at a fixed playback level | Loudness strongly increases tension and "scary" ratings (`[E-full]`: Eerola et al. 2013; Granot & Eitan 2011; Farbood 2012) and differs between anxious ($0.172$ RMS) and terrifying ($0.194$ RMS) film excerpts (`[E-full]`: Trevor et al. 2023). *(Gemini-A's claim that loudness failed in 65% of Farbood 2012 trials was refuted.)* |
| **Hook pitches & rhythm skeleton** | Identical across states in Approaches 1 and 2; modified only in the Approach 3 alternative | Melodic contour/intervals (`[E-abs]`: Dowling & Fujitani 1971) and intact rhythm (`[E-full]`: Kuusi 2009, where stripping rhythm into 500 ms isochronous notes cost 15–34 recognition points) are the primary identity carriers, especially for non-musicians (`[E-abs]`: Mélen & Deliège 1995). |
| **Tempo & key center** | Identical across states in Approaches 1 and 2; varied only in Approach 3 | Key ($\pm 6$ semitones) and tempo ($\pm 64$ bpm) shifts impair short-term recognition (10 min, 1 day) and add to other surface changes (`[E-full]`: Schellenberg & Habashi 2015; `[E-abs]`: Schellenberg et al. 2014). |
| **Loop length & seam** | Identical bar count (8 bars of 4/4, or 16-bar A/A′) and identical bar-line seam | Compares arrangement rather than form; enables sample-locked or bar-quantized transitions (`[P]`: Korb 2020; Okabe 2018). |
| **Lead timbre** | Identical in Approach 1 and Approach 2A; subtle within-patch filtering/detuning tested in Approach 2B; cross-family/octave change only in Approach 3 | Cross-family swaps (piano↔sax, piano↔orchestra) impair recognition (`[E-full]`: Schellenberg & Habashi 2015; Poulin-Charronnat et al. 2004), whereas within-family timbre shifts preserve recognition (`[E-abs]`: Lim & Goh 2012). |
| **Hardware floor (>100 Hz audibility)** | Ensure low-register bass/drones (55–110 Hz) include 110–240 Hz upper-harmonic saturation | Classroom laptop, Chromebook, and phone speakers roll off sharply below ~100–150 Hz; inaudible ~18 Hz infrasound (`[E-full]`: Scatterty et al. 2026) is physically inoperable on student devices (`[H]`). |

---

## 2. Approach 1 — Additive Shadow Layers (Base Stem Untouched)

*Concept:* The calm Base arrangement continues playing unchanged; Uneasy and Dire fade in additional "shadow" stems underneath or around it. Preserves identity by construction because the exact Base stem never leaves.

| State | Anchors Retained | Parameters Altered | Hypothesized Impression `[H]` | Supporting Evidence & Limits |
|---|---|---|---|---|
| **Base** | Everything (hook pitches, rhythm, tempo, key, lead timbre, consonant chords, percussion) | None | Inviting, bright, steady | Baseline reference; hook designed to pass HOYO-MiX's V0 bare-melody test (`[P]`: Chen & Cai 2020). |
| **Uneasy** | All Base stems intact | Fade in a low sustained tonic/minor-third drone (55–110 Hz + harmonics) and a quiet high-register pad with a mild dissonant interval | Something is "off" underneath a still-cheerful tune | Low drones induce modal centers where minor-3rd intervals sound more tense/sadder (`[E-full]`: Bostwick et al. 2018, $N=32$; `[E-abs]`: Friedman 2019); low register increases tension/threat (`[E-full]`: Granot & Eitan 2011; Huron et al. 2006). *Limit:* Adding a drone under an unchanged major triad may read as muddy rather than modal. |
| **Dire** | Base lead and rhythm skeleton intact (optionally mute bright percussion) | Add a 30–150 Hz rough/inharmonic synth pad and a dissonant cluster layer at matched integrated loudness | Crowding, menace, or eerie irony ("the cheerful machine keeps playing over dread") | Psychoacoustic roughness (30–150 Hz modulation) and inharmonicity strongly drive tension and negative valence (`[E-full]`: Farbood & Price 2017, $N=24$; Pressnitzer et al. 2000, $N=17$; Trevor et al. 2020, $N=20$; Trevor et al. 2023, $N=99$). Additive stem stacking matches *Dead Space* / *Hades* craft (`[P]`: Graves 2011; Korb 2020). *Limit:* Because the bright Base chords remain audible, Dire may sound cluttered or ironically cheerful rather than bleak. |

---

## 3. Approach 2 — Staged Reharmonization, Register Drop, and Roughness (Recommended Starting Set)

*Concept:* Share the **lead stem** and **rhythm skeleton** across states, but **replace** the bass and harmony stems in Uneasy and Dire. Test two Dire lead options: **2A (lead completely untouched)** vs. **2B (subtle within-patch low-pass filtering/detuning on the same lead synth)**.

| State | Anchors Retained | Parameters Altered | Hypothesized Impression `[H]` | Supporting Evidence & Limits |
|---|---|---|---|---|
| **Base** | Everything | Primary diatonic triads (I, IV, V); normal mid-bass register; balanced density; clear authentic cadence at bar 8 | Inviting, tidy, complete | Reference state. |
| **Uneasy** | Hook pitches, rhythm, tempo, key, lead timbre, rhythm skeleton | **Diatonic/modal-mixture reharmonization** (`ii`, `vi`, `iv`, $\flat\text{VI}$) with **one unexpected chord**; **hollow texture** (thin mid-voicings, low minor-3rd drone + high pad); **loudness variability** ($\pm 6\text{ dB}$ swells/dropouts at matched integrated LUFS); **withheld cadence** (half or deceptive cadence at bar 8); **no groove syncopation** | Familiar tune, unsettled ground; "expectation not quite met" | - **Identity under reharmonization:** Adults conserve melody sameness under changed harmony, best for primary→diatonic changes (`[E-full]`/`[E-abs]`: Liu 2018, $N=80$; Liu 2022, $N=192$).<br>- **Tension:** One unexpected chord raises tension (`[E-abs]`: Steinbeis et al. 2006, $N=24$); anxious horror music uses sparse density ($2.18$ events/s), hollow registers, darker spectrum, and higher loudness variability ($0.561$) (`[E-full]`: Trevor et al. 2023, $N=99$); low minor-3rd drones raise tension/sadness (`[E-full]`: Bostwick et al. 2018; `[E-abs]`: Friedman 2019).<br>- **Cadence & rhythm:** Half/deceptive cadences suspend perceived completion (`[E-full]`: Sears et al. 2020, $N=40$; Choi & Fujioka 2025, $N=38$), while syncopation increases happiness rather than tension (`[E-full]`: Keller & Schubert 2011, $N=35$). |
| **Dire 2A (Clean Lead)** | Hook pitches, rhythm, tempo, key, **exact Base lead patch** | **Chromatic/clashing voicings** (tritones, minor seconds); **low bass drop** (55–110 Hz pedal + 110–240 Hz harmonic saturation); **30–150 Hz rough/inharmonic pad**; **unresolved loop seam**; compare **sparse/exposed** vs. **dense ($>3$ events/s)** backing | Stark, cold, trapped; the untouched lead sounds isolated against menacing backing | - **Roughness & register:** 30–150 Hz roughness and inharmonicity are top timbral tension drivers (`[E-full]`: Farbood & Price 2017; Pressnitzer et al. 2000; Trevor et al. 2020, 2023); lower register increases threat/tension (`[E-full]`: Huron et al. 2006, $N=41$; Granot & Eitan 2011, $N=132$; Eerola et al. 2013, $N=46$).<br>- **Sparse vs. dense Dire:** Trevor et al. (2023) found terrifying film cues denser ($3.19$ events/s), whereas **Silvey (2011)** (`[E-full]`, $N=40$) found non-musicians rated a sparse solo arrangement *more* tense than full orchestra.<br>- **Identity risk:** Secondary/chromatic chords carry higher false-negative risk than diatonic chords (`[E-full]`: Liu 2018), mitigated by prior repeated exposure to Base (`[E-abs]`: Pollard-Gott 1983). |
| **Dire 2B (Filtered Lead)** | Hook pitches, rhythm, tempo, key, **same lead instrument patch** | Same accompaniment as **Dire 2A**, plus **subtle within-patch low-pass filtering or slight detuning** on the lead voice so it darkens with the backing | Cohesive, dimmed, worn down; avoids "happy toy lead over horror chords" irony | Within-family timbre shifts left recognition intact (`[E-abs]`: Lim & Goh 2012, cited in Schellenberg & Habashi 2015), and game composers routinely apply low-pass filtering/degradation to the active voice during state transitions (`[P]`: Korb 2020; Ueda 2017). *Limit:* Direct test against 2A needed in paired listening. |

---

## 4. Approach 3 — Re-Register, Modal Inversion, and Pulse Destabilization (Credible Alternative)

*Concept:* Relax strict invariance in Dire (and partially in Uneasy) to maximize expressive range: drop the lead melody by an octave, inflect key melodic intervals toward minor/Phrygian while keeping the exact rhythm skeleton and contour shape, and destabilize the pulse.

| State | Anchors Retained | Parameters Altered | Hypothesized Impression `[H]` | Supporting Evidence & Limits |
|---|---|---|---|---|
| **Base** | Everything | Same as Approach 2 Base | Inviting, tidy | Reference state. |
| **Uneasy** | Hook contour and rhythm skeleton, loop length | Drop lead melody by 1 octave **or** inflect major 3rds/6ths to minor ($\flat 3, \flat 6$) over sparse minor-drone accompaniment | Heavier, shadowed, unmistakably altered (`[P]`: Korb's "bell curve" salience) | Lowering the *melody's* register directly increased "scary" (`[E-full]`: Eerola et al. 2013, $\beta=-0.23, sr^2=.15$) and threat (`[E-full]`: Huron et al. 2006); minor mode is a strong Western cue (`[E-full]`: Eerola et al. 2013; Athanasopoulos et al. 2021 UK cohort, $p=.0074$) and matches *Celeste*'s Madeline→Badeline motif inversion (`[P]`: Raine 2018). |
| **Dire** | Hook contour shape and rhythm onset pattern | Octave-dropped + filtered/rough lead; minor/Phrygian pitch inflection; slight tempo drop or irregular beat hesitations (low pulse clarity); unresolved seam | Stalling, fragmented, "the tune itself is breaking down" | Low pulse clarity characterizes both anxious and terrifying horror cues (`[E-full]`: Trevor et al. 2023); cue effects act roughly additively (`[E-full]`: Eerola et al. 2013, 77–89% linear variance). *Limit:* **Highest identity risk**—stacking pitch/mode, register, timbre, and tempo changes accumulates recognition penalties (`[E-full]`: Schellenberg & Habashi 2015; `[E-abs]`: Schellenberg et al. 2014). |

---

## 5. Side-by-Side Comparison of the Approaches

| Dimension | Approach 1 (Additive Shadow) | Approach 2A (Reharmonize, Clean Lead) | Approach 2B (Reharmonize + Filtered Lead) | Approach 3 (Re-Register / Modal / Pulse) |
|---|---|---|---|---|
| **Identity protection** | Highest (by construction) | High (`[E-full]`: Kuusi 2009; Liu 2018) | Medium-high (`[E-abs]`: Lim & Goh 2012) | Medium-low (stacked surface changes) |
| **Expressive ceiling ("Dire")** | Medium-low (Base chords persist) | Medium-high (can read as ironic) | High (cohesive darkening) | Highest (melody itself darkens) |
| **Salience in gameplay** (`[P]`: Korb bell curve) | Low-medium | Medium-high | High | Highest |
| **Loudness/tempo control** | Cleanly matched | Cleanly matched | Cleanly matched | Requires tempo-matched sub-pair |
| **Role in Plan 33 recommendation** | Baseline stem layout only | **Recommended primary (Variant A)** | **Recommended primary (Variant B)** | **Credible alternative (test in Pair P6)** |

---

## 6. What This Matrix Deliberately Does Not Claim

No cell asserts that every student will feel a specific emotion or that any arrangement causes physiological stress, dopamine release, or compulsive behavior (`[E-full]` audit in `deep-research/prompt-b/verification.md` refuted external AI claims of physiological/cortisol proof). Listener training (`[E-full]`: Silvey 2011; Kuusi 2009) and cultural enculturation (`[E-full]`: Athanasopoulos et al. 2021; `[E-abs]`: Liu 2022) moderate every cue. The Receipt records only which music state was *displayed*, never what the player felt.
