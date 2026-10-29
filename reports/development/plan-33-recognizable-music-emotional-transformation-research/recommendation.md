# Plan 33 — Recommendation: Keeping a Gacha Tune Recognizable While It Turns Uneasy, Then Dire

**Date:** 2026-10-28 (system clock)
**Prepared by:** Gemini 4 Argon (Medium) research integrator, integrating the prior Plan 33 Sonnet/Haiku synthesis (`b1bd633`) with the six external Prompt A & Prompt B deep-research reports and four bounded Flash verification tasks (`argon-f1` through `argon-f4`).
**Scope & non-adoption note:** This is a research synthesis and proposal. A report recommendation is **not** production adoption: it composes no music, renders no audio, selects no runtime library or story-state trigger schedule, and modifies no production code.
**Expressive & Receipt guardrail:** Music here is a designed expressive device illustrating the **fictional character's** changing relationship to the same gacha game. **No causal claim about actual players' addiction, dopamine, motivation, or physiological arousal follows from this research.** The Receipt may record only which music state was *displayed*, never an inferred player emotion or motive.

---

## Evidence & Reading-Depth Labels

- **`[E-full]`**: Empirical study with participant or corpus measurements where full text (or complete methods + results) was read. *(Note: full-text is a reading-depth label, not an automatic quality ranking.)*
- **`[E-abs]`**: Empirical study verified from an official abstract, repository record, or quantitative citation in a verified full-text paper.
- **`[P]`**: Composer or developer first-person account of craft/intent (never treated as measured audience response).
- **`[T]`**: Music-theory, analytical, or specification description without listener-effect data.
- **`[H]`**: Hypothesis or reasoned inference connecting published paradigms to Quackpot's repeated classroom gacha hook.

**Verification provenance:** Sources in `sources/index.md`, `deep-research/prompt-a/verification.md`, and `deep-research/prompt-b/verification.md` explicitly distinguish what was **verified directly by Argon**, what was **read by Sonnet** (Plut & Pasquier 2019; Kuusi 2009 PDF extract), and what was **worker-reported** (`argon-f1`–`argon-f4`, `B1`–`B2`, `T1`–`T4`). The integrator did not personally re-open every worker-read source.

---

## 1. The Short Version (One Recommended Approach + One Credible Alternative)

### Recommended Approach — **Approach 2: Staged Accompaniment Reharmonization, Register Drop, and Roughness (with Optional Within-Patch Lead Darkening in "Dire")**
Keep the hook's **pitch intervals/contour, rhythm skeleton, key, tempo, loop length, and integrated loudness** fixed across **Base → Uneasy → Dire**, and keep the **lead instrument identity** unchanged in Base and Uneasy. Drive the emotional transformation primarily through the **accompaniment** using an evidence-backed two-step escalation:
1. **Base → Uneasy (Anxious / Unsettled):** Shift the accompaniment from bright primary triads to **diatonic/modal-mixture substitutions** (`ii`, `vi`, `iv`, $\flat\text{VI}$) with **one unexpected chord** (`[E-abs]`: Liu 2018, 2022; Steinbeis et al. 2006), drop the bass into a **low tonic/minor-third modal pedal** (`[E-full]`: Bostwick et al. 2018; `[E-abs]`: Friedman 2019), thin the mid-register into a **sparse, hollow texture with dynamic swells/dropouts** (`[E-full]`: Trevor et al. 2023; Silvey 2011), and **withhold the final cadence** (half or deceptive cadence at the loop seam to suspend closure: `[E-full]`: Sears et al. 2020; Choi & Fujioka 2025).
2. **Uneasy → Dire (Menacing / Entrapped):** Move the accompaniment to **chromatically remote/clashing voicings** (tritones/minor-second clusters against a low 55–110 Hz pedal with 110–240 Hz upper-harmonic saturation so laptop speakers reproduce it: `[E-full]`: Huron et al. 2006; Granot & Eitan 2011), introduce **30–150 Hz psychoacoustic roughness and inharmonicity** in the pad/bass synth voices (`[E-full]`: Farbood & Price 2017; Pressnitzer et al. 2000; Trevor et al. 2020, 2023), and leave the loop seam unresolved.
3. **Relaxing the strict lead-timbre freeze in Dire (Variant 2A vs. 2B):** Rather than treating "never touch the lead voice" as dogma, test **2A (lead completely clean over rough/exposed accompaniment)** against **2B (subtle within-patch low-pass filtering or slight detuning on the same lead synth patch in Dire)**. Why? Cross-family instrument swaps (piano↔saxophone, piano↔orchestra) hurt recognition of unfamiliar melodies (`[E-full]`: Schellenberg & Habashi 2015; Poulin-Charronnat et al. 2004), but **within-family timbre shifts did not impair recognition** (`[E-abs]`: Lim & Goh 2012), repeated exposure builds an abstract theme concept (`[E-abs]`: Pollard-Gott 1983), and composer practice uses subtle filtering on the same voice to avoid an unintentionally comic "cheerful toy lead over horror chords" clash (`[P]`: Korb 2020; Ueda 2017; Raine 2018).

### Credible Alternative — **Approach 3: Re-Register, Modal Inversion, and Pulse Destabilization (Higher Expressive Ceiling, Higher Identity Risk)**
If Approach 2 sounds too subtle or too ironic in listening tests, **Approach 3** relaxes the strict invariance anchors in **Dire** (and partially in **Uneasy**): drop the lead melody by an octave (`[E-full]`: Eerola et al. 2013; Huron et al. 2006), invert or modal-shift key melodic thirds from major toward minor/Phrygian while preserving the exact rhythm skeleton and contour shape (`[P]`: Raine 2018 *Celeste* Madeline→Badeline transformation), and introduce slight tempo drag or irregular beat hesitations (`[E-full]`: Trevor et al. 2023 low pulse clarity; `[P]`: Phillips; Kondo). Because key/mode, tempo, and timbre penalties accumulate in short-term memory (`[E-full]`: Schellenberg & Habashi 2015; `[E-abs]`: Schellenberg et al. 2014), Approach 3 carries a real risk that listeners hear a *different* tune, so it should be evaluated directly against Approach 2 in the paired-listening comparison.

*(Note: Approach 1—purely additive "shadow layers" over an untouched cheerful Base mix—remains documented in `transformation-matrix.md` as a low-ceiling baseline, and its shared-stem engineering layout is reused by Approach 2.)*

---

## 2. Critical Examination of Prior Anchors & Overgeneralizations

The Argon integration specifically audited whether the prior report's freeze of all seven surface anchors—and its slogan that *"timbre costs identity and buys little tension"*—overgeneralized findings from separate experimental tasks:

1. **Why "timbre costs identity and buys little tension" overgeneralized two narrow paradigms:**
   - **On the identity side:** **Schellenberg & Habashi (2015)** (`[E-full]`, $N=96$) and **Poulin-Charronnat et al. (2004)** (`[E-full]`, $N=64$) tested **cross-family instrument replacements** (piano ↔ alto saxophone; solo piano ↔ full orchestra) on **unfamiliar melodies heard only once or twice**. Even there, the AUC recognition drop in Schellenberg & Habashi was modest (~$.05$), and Schellenberg & Habashi themselves cite **Lim & Goh (2012)** (`[E-abs]`), where switching between **similar timbres (violin ↔ cello)** left recognition **as good as with the original timbre**. Moreover, **Pollard-Gott (1983)** (`[E-abs]`, $N=24$) showed that while listeners sort variations by surface features on first hearing, repeated exposure shifts perception to a shared **thematic concept**.
   - **On the tension side:** **Eerola, Friberg, & Bresin (2013)** (`[E-full]`, $N=46$) found timbre weak for "scary" ($\beta=0.15, sr^2=.02$) only because their "timbre" factor compared **three clean sampled orchestral instruments (flute, horn, trumpet)**. When psychoacoustic studies instead manipulate **timbral roughness (30–150 Hz amplitude modulation/beating), inharmonicity, and spectral flatness** (**Farbood & Price 2017**, `[E-full]`, $N=24$; **Pressnitzer et al. 2000**, `[E-full]`, $N=17$; **Trevor et al. 2020, 2023**, `[E-full]`, $N=20, N=99$; **Athanasopoulos et al. 2021**, `[E-full]`, $N=169$), timbral roughness and inharmonicity are **among the strongest and most cross-culturally robust predictors of tension and threat**.
   - **Resulting synthesis:** Do **not** replace the lead instrument with a different instrument family (which risks recognition loss and can even invert tension ratings between musicians and non-musicians: **Silvey 2011**, `[E-full]`, $N=40$). Instead, **keep the lead patch identity recognizable**, put strong **roughness/inharmonicity in the accompaniment voices**, and test **clean lead (2A) vs. subtle within-patch lead filtering/detuning (2B)** in Dire.

2. **Why Kuusi (2009) supports fixing rhythm, while Liu (2018, 2022) supports staged reharmonization:**
   - Full-text verification of **Kuusi (2009)** (`[E-full]`, $N=46$, 19 familiar tunes selected, **14 analyzed**; read by Sonnet and verified by Argon & `argon-f1`) clarifies that Kuusi's "melody-only" (76.1% professionals / 67.4% amateurs / 53.3% non-musicians) and "melody+harmony" (81.3% / 68.0% / 53.9%) conditions used **isochronous 500 ms piano notes (rhythm stripped)**, compared with **95.9% / 93.6% / 86.5%** for the intact full tune. Thus, **removing rhythm cost ~15–33 percentage points of recognition**, whereas adding standard four-part chords to the isochronous melody barely moved recognition (+0.6 to +5.2 points), and stripping melodic pitches down to rhythm-only (50.5% / 15.6% / 2.5%) or rhythm+harmony without melody (37.6% / 8.5% / 18.6%) collapsed non-musician recognition.
   - Kuusi (2009) never replaced original chords with altered chords. That gap is filled by **Liu (2018, *JRME* 66:210, $N=80$, `[E-full]`/`[E-abs]`)** and **Liu (2022, *JRME* 70:173, $N=131$ China / $N=61$ US, `[E-abs]`)**, where adults judged whether melody pairs were the "same melody" across added, removed, and changed harmonizations. Listeners conserved melody sameness across reharmonizations in both cultures, with **significantly higher accuracy when moving from primary triads (I, IV, V) to diatonic chords (ii, iii, vi) than to secondary/chromatic chords**. This directly supports staging **Uneasy** as a diatonic/modal-mixture reharmonization and reserving chromatic/cluster clashes for **Dire** (after the player has already heard the Base loop repeatedly).

3. **Why Korb's "effectiveness bell curve" warns against over-timid state steps:**
   - In **Plut & Pasquier (2019)** (`[E-full]`, $N=30$), adaptive music raised self-reported tension relative to static neutral music ($p=.036$), yet no participant mentioned the music's adaptivity in free-text responses. Consistently, *Hades* composer **Darren Korb (2020)** (`[P]`) reports an **"effectiveness bell curve"** for dynamic music: subtle micro-mix shifts go unnoticed during gameplay, whereas **clearly audible arrangement steps** (such as dropping percussion, shifting register/texture, or changing harmonic character at a bar line) are what actually register with players.

---

## 3. Concrete Musical Decisions & Evidence Summary

1. **Compose the hook to pass the "bare-melody test" and keep its pitches and rhythm fixed in Approach 2.**
   - *Basis:* Pitch contour + relative intervals (`[E-abs]`: Dowling & Fujitani 1971) and intact rhythm (`[E-full]`: Kuusi 2009) carry tune identity, especially for non-musicians who rely on salient local surface cues (`[E-abs]`: Mélen & Deliège 1995). In gacha practice, **HOYO-MiX / Yu-Peng Chen (2020)** (`[P]`) tested the *Genshin Impact* theme first as an unaccompanied right-hand piano melody (V0) to verify memorability and variation potential before adding accompaniment layers.
2. **Use staged accompaniment reharmonization (diatonic/modal in Uneasy → chromatic/clashing in Dire).**
   - *Basis:* Adult listeners conserve melodic identity under reharmonization (`[E-full]`/`[E-abs]`: Liu 2018, 2022), with diatonic substitutions safer than secondary chords. Single unexpected chords raise felt tension (`[E-abs]`: Steinbeis et al. 2006, $N=24$), and different harmonizations of a fixed melody shift perceived emotion (`[E-full]`: Athanasopoulos et al. 2021, $N=169$). *(Note: Gemini-A's claim that Jimenez, Kuusi, & Ojala 2022 tested melody identity under reharmonization was verified as false—that study tested memory for the original chords, not melody recognition.)*
3. **Differentiate Uneasy (anxious/hollow) from Dire (menacing/rough) using register, texture, and psychoacoustic roughness.**
   - *Basis:* **Trevor, Renner, & Frühholz (2023)** (`[E-full]`, $N=99$, FEARMUS horror film excerpts) showed that **anxious** cues are sparser ($2.18$ events/s), darker, hollow-registered, and dynamically unstable, whereas **terrifying** cues are denser ($3.19$ events/s) and carry strong **30–150 Hz amplitude-modulation roughness** (`[E-full]`: Trevor et al. 2020, $N=20$) and **inharmonicity/spectral flatness** (`[E-full]`: Farbood & Price 2017, $N=24$; Pressnitzer et al. 2000, $N=17$). Because **Silvey (2011)** (`[E-full]`, $N=40$) found that non-musicians rated a sparse solo version as *more* tense than a full orchestral version, the listening test should compare **sparse/exposed Dire** against **dense/rough Dire** under matched integrated loudness.
4. **Use a low minor-third modal drone/pedal in Uneasy and a low bass drop (55–110 Hz with 110–240 Hz harmonics) in Dire.**
   - *Basis:* A continuous low drone induces modal centers where minor-third modes (Dorian, Aeolian, Phrygian, Locrian) are rated significantly more tense and sadder (`[E-full]`: **Bostwick, Seror, & Neill 2018**, $N=32$), and continual tonic drones increase sadness in minor mode (`[E-abs]`: **Friedman 2019**). Lower register increases perceived tension and threat (`[E-full]`: **Granot & Eitan 2011**, $N=132$; **Huron et al. 2006**, $N=41$; **Eerola et al. 2013**, $N=46$). Because classroom laptop/Chromebook speakers roll off below ~100–150 Hz (rendering ~18 Hz infrasound in **Scatterty et al. 2026** physically inoperable), low bass must include 110–240 Hz upper harmonics/saturation.
5. **Withhold or evade the phrase-ending cadence at the loop seam to suspend closure, paired with mode/register/dissonance shifts.**
   - *Basis:* Half, deceptive, and evaded cadences significantly weaken or delay perceived completion/closure (`[E-full]`: **Sears et al. 2020**, $N=40$; **Choi & Fujioka 2025**, $N=38$/$61$), while **Smit et al. (2020)** (`[E-full]`, $N=66$) show that cadence type alone has small effects on arousal unless paired with minor mode, pitch-height shift, or dissonance.
6. **Avoid groove syncopation when building tension; use subtle pulse hesitation only in Approach 3.**
   - *Basis:* Syncopation increased happiness and enjoyment ratings rather than tension (`[E-full]`: **Keller & Schubert 2011**, $N=35$).
7. **Match integrated loudness (LUFS/RMS) in all composition comparisons.**
   - *Basis:* Loudness strongly drives tension and "scary" ratings (`[E-full]`: Granot & Eitan 2011; Farbood 2012; Eerola et al. 2013) and differs between commercial anxiety and terror film excerpts (`[E-full]`: Trevor et al. 2023). *(Gemini-A's claim that loudness failed in 65% of Farbood 2012 trials was refuted as a misreading of stationary-pitch controls.)*

---

## 4. What Was Strengthened, Revised, Rejected, or Unchanged

| Conclusion / Evidence Area | Integration Outcome (see `integration-status.md` & `verification.md` files for full audit) |
|---|---|
| **Melody + rhythm as primary identity anchors** | **Strengthened (`[E-abs]` → `[E-full]` + `[P]`):** Kuusi (2009) full text ($N=46$, 14 analyzed tunes) confirms removing rhythm costs 15–34 points while standard harmony adds only 0.6–5.2 points; HOYO-MiX (2020) adds `[P]` V0 bare-piano test. |
| **Same-tune conservation under reharmonization** | **Upgraded (`[H]` → `[E-full]`/`[E-abs]`):** Liu (2018, $N=80$; 2022, $N=192$) directly demonstrates melody conservation under changed harmony and establishes that primary→diatonic changes preserve recognition better than secondary/chromatic chords. |
| **Lead timbre vs. accompaniment roughness** | **Revised / Nuanced:** Separates cross-family lead swaps (which hurt recognition: Schellenberg & Habashi 2015; Poulin-Charronnat et al. 2004) from within-family/within-patch filtering (Lim & Goh 2012) and validates psychoacoustic roughness/inharmonicity as strong tension drivers (Farbood & Price 2017; Pressnitzer et al. 2000; Trevor et al. 2020, 2023). |
| **Drone, withheld cadence, and anxious-vs-dire profiles** | **Upgraded (`[T/H]` → `[E-full]`/`[E-abs]`):** Added Trevor et al. (2023, $N=99$), Bostwick et al. (2018, $N=32$), Friedman (2019), Sears et al. (2020, $N=40$), Smit et al. (2020, $N=66$), Choi & Fujioka (2025, $N=38$), Huron et al. (2006, $N=41$), Granot & Eitan (2011, $N=132$), and Silvey (2011, $N=40$). |
| **Gacha/mobile & adaptive composer practice** | **Gap Filled (`[P]`):** Added HOYO-MiX / Yu-Peng Chen & Zoe Cai (2020) on *Genshin Impact* V0 piano test and day/dawn/dusk/night variants, plus Korb (2020–2026 *Hades*), Ueda (2017 *NieR*), O'Donnell (2005 *Halo 2*), and Raine (2018–2019 *Celeste*). |
| **Adaptive game music empirical baseline** | **Strengthened (`[E-full]`):** Upgraded Klimmt et al. (2019, $N=68, N=59$) to full text; added Heikkilä, Danso, & Luck (2026 *PLOS ONE* meta-analysis, 14 studies, homogeneous $g=0.34$ audio vs. silence, music-over-SFX CI $[-0.07, 0.68]$), Caroux & Pujol (2024), Hedges et al. (2024), Rogers & Weber (2019, $N=737$), and McNamara et al. (2022). |
| **External AI distortions & hallucinations** | **Rejected:** (1) Gemini-A's inversion of Jimenez, Kuusi, & Ojala (2022); (2) Gemini-A's 65% loudness claim on Farbood (2012); (3) Gemini-B's opening claim that Plut & Pasquier (2019) measured physiological arousal; (4) Gemini-B's fabricated salivary cortisol protocol in Klimmt et al. (2019, Study 2); (5) Gemini-B's fabricated loop-duration table attributed to Rogers & Weber (2019); (6) Gemini-B's fabricated `0.5–2.0s` (*NieR*) and `3.0–5.0s` (*Genshin*) crossfade numbers; (7) ChatGPT-A's misattribution of Bostwick et al. (2018) to Friedman et al. |
| **No player diagnosis / Receipt honesty boundary** | **Unchanged (binding):** Music expresses only the fictional character's story state; zero claims about real players' addiction, dopamine, motivation, or physiology. |

---

## 5. Material Gaps That Remain

1. **No published experiment tests a newly composed game hook repeated across minutes while its arrangement steps from Base → Uneasy → Dire:** Existing studies test either recognition/conservation of short melody pairs (Liu 2018, 2022; Schellenberg & Habashi 2015; Kuusi 2009), affect ratings of isolated/film excerpts (Trevor et al. 2020, 2023; Eerola et al. 2013; Athanasopoulos et al. 2021), or short gameplay with performance-linked adaptive music (Plut & Pasquier 2019, $N=30$).
2. **Dissonant/non-tonic pedals and slow synth detuning (<15 Hz beating) remain `[T/H]`:** Empirical drone studies (Bostwick et al. 2018; Friedman 2019) tested modal/tonic drones, and roughness studies (Trevor et al. 2020; Farbood & Price 2017) tested 30–150 Hz modulation roughness rather than slow chorus/pitch-drift beating.
3. **Accompaniment-only bass drop vs. whole-passage transposition:** Huron et al. (2006), Granot & Eitan (2011), and Eerola et al. (2013) shifted the register of the entire musical passage rather than dropping only the bass under a fixed-register melody.
4. **Crossfade timing and loop-fatigue thresholds:** No empirical study establishes an optimal crossfade duration (McNamara et al. 2022 found brief silence between areas scored slightly higher on flow than crossfades in a non-significant pilot) or a parametric loop-length cutoff.

---

## 6. Proposed Small Paired-Listening Experiment (For Later Owner Evaluation in Plan 32)

- **Listener:** The **owner only** in the first pass (zero student data, zero telemetry, zero external participants).
- **Stimuli (loudness-matched to identical integrated LUFS/RMS, identical 8-bar loop length):**
  1. **Base** (bright diatonic accompaniment, clear authentic cadence) + **Foil hook** (different melody in the same Base style, to calibrate "different tune").
  2. **Uneasy (Approach 2)** (diatonic/modal-mixture chords + one unexpected chord, hollow register over low minor-third drone, dynamic swells, withheld half/deceptive cadence).
  3. **Dire 2A vs. Dire 2B (Approach 2)** (low 55–110 Hz pedal with upper harmonics + 30–150 Hz rough/inharmonic cluster pad + unresolved seam; **2A** keeps the lead patch completely untouched, **2B** applies subtle within-patch low-pass filtering/detuning to the lead).
  4. **Dire 3 (Credible Alternative — Approach 3)** (lead dropped an octave + minor/Phrygian modal inflection + slight tempo/pulse hesitation).
  5. **No-change re-trigger control** (Base re-triggered at a bar boundary, controlling for Plut & Pasquier's finding that *any* state change can alter tension ratings).
- **Questions per pair (details in `composition-brief.md` §4):** (a) *"Same tune?"* (1–5 scale); (b) *"Uneasy / dire tension?"* (1–7 scale and state ordering); (c) *"Does the lead voice in 2A sound eerie-ironic or mismatched compared to 2B and 3?"*

---

## 7. Actual Owner Decisions Needed (Separated by Stage)

### Stage A — Composition & Paired-Listening Experiment Decisions (Needed Now to Gate Plan 32)
These decisions define what Plan 32 composes for the owner's listening test and **do not** require choosing runtime fade timings, story triggers, or code architecture:

1. **Approve the recommended composition experiment scope?** Authorize composing one original 8-bar gacha hook (passing the V0 bare-melody test) plus the Foil hook, rendered in **Approach 2 (Base, Uneasy, Dire-2A clean lead, Dire-2B filtered lead)** and **Approach 3 (Dire-3 re-registered/destabilized alternative)** for the owner-only paired-listening comparison (`composition-brief.md`).
2. **Definition of "same tune" and lead-voice latitude:** Should "same tune" require keeping the lead synth patch strictly identical across all states (testing only **Dire-2A**), or do you authorize comparing **Dire-2A (clean lead)** against **Dire-2B (within-patch filtered/detuned lead)** and **Dire-3 (octave-dropped/modal-shifted lead)**?
3. **Base mood and Dire character target:** Should **Base** read as *inviting/peaceful* or *bright/bouncy-arcade*, and should **Dire** aim for *cold, sparse, and exposed* (Silvey 2011 non-musician tension profile) or *dense, rough, and oppressive* (Trevor et al. 2023 terror profile)—or test both in the Dire stems?

### Stage B — Future Runtime & Integration Decisions (Deferred Until After Owner Listening Selection)
These decisions belong to later audio/story integration (see `transition-contract.md`) and **need not be decided to approve Stage A**:

4. **Authored story-state source:** Which explicit game state drives Base → Uneasy → Dire (S1 authored story flag, S2 explicit displayed stage/counter threshold, or S3 scripted scene map; never player profiling)?
5. **Apartment ↔ gacha transition style:** Short bar-quantized crossfade, ambient pad bridge, or brief breathing gap (~0.5–1.2 s silence/UI latch, per McNamara et al. 2022) on context switches?
6. **Loop continuity & lifecycle policy:** Restart gacha loop on Bar 1 vs. persist playhead across visits; hidden-tab policy (pause vs. continue); and Uninstall/Receipt audio policy (immediate cancellable fade to silence or neutral base so music never delays Uninstall or steers Receipt reflection).
7. **Original-composition provenance & Credits format:** Factual local Credits entry format for original synthesized/rendered music (per `docs/founding/design.md` §Assets and DECISION-010).
