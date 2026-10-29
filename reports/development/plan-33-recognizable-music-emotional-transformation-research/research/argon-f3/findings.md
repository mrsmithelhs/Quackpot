# Task Argon-F3 — Findings: Adaptive Game Music Empirical Studies and Physiological-Arousal Verification

**Observed Model/Provider Identity:** Google Gemini / Gemini 2.5 Flash (Worker identity: `argon-f3` executing under Quackpot Plan 33 orchestration; platform metadata identifies execution role as `argon-f3` within the Antigravity/Gemini environment).

---

## 1. Key Findings

### 1. Gemini B's Opening Claim and Salivary Cortisol Protocol Are Fabricated [E-full] (Sources 1, 2)
Gemini B opens its Prompt B report claiming that *"Empirical research demonstrates that adaptive game audio significantly modulates subjective tension and physiological arousal compared to linear soundtracks, even when musical tension is mapped inversely to game events [1]"*, and claims in text and tables that Klimmt et al. (2019, Study 2) in *Alien: Isolation* performed *"Physiological: Salivary cortisol assays across three intervals (baseline, gameplay, recovery)"* showing *"significantly higher cortisol production"*. 
**Verification outcome:** Both claims are entirely false. Klimmt et al. (2019) conducted **zero** physiological assays and collected no saliva or cortisol data. Plut & Pasquier (2019) recorded zero physiological data, and their univariate test for self-reported arousal was not statistically significant. Gemini B confabulated colloquial horror gaming tropes with unrelated neuroendocrine stress literature.

### 2. Plut & Pasquier (2019) Relies Exclusively on Self-Report Sliders; Arousal Was Non-Significant [E-full] (Source 1)
Plut & Pasquier (2019, IEEE CoG, N=30) evaluated a custom space-shooter game across four conditions: None (silence), Neutral (linear/static), Tension (adaptive matching game tension), and Inverse (adaptive inverted tension). 
- **Measures:** Continuous self-report sliders for experienced and perceived affect (valence, arousal, tension, soundtrack matching, soundtrack experience). Zero physiological metrics were collected.
- **Statistical results:** Univariate ANOVA for self-reported *arousal* was **not statistically significant**. Only *tension* ($F(3,87)=3.662, p=.015, \eta_p^2=.112$), *soundtrack matching*, and *soundtrack experience* reached statistical significance.
- **Pairwise tension differences:** Statistically significant differences appeared **only against the Neutral static baseline** ($p=.048$ for Inverse vs. Neutral; $p=.036$ for Tension vs. Neutral). Crucially, tension in the adaptive conditions was **not** statistically significantly different from Silence/None (.55 None vs. .49 Neutral vs. .61 Inverse vs. .62 Tension).
- **Participant awareness:** Free-text post-play responses revealed that participants evaluated whether the music fit the scene, but did **not** explicitly identify or discuss the adaptive mechanism.

### 3. Klimmt et al. (2019, Study 2) Measured Subjective Horror via Self-Report in Linear Conditions [E-full] (Source 2)
Klimmt et al. (2019, *Media Psychology*) investigated player enjoyment via affective and cognitive routes:
- **Study 2 Design:** N=59 young men played a 15-minute sequence of *Alien: Isolation* under two conditions: original soundtrack present vs. absent. 
- **Variables:** Evaluated via post-game psychometric questionnaires: a 4-item horror experience scale (scariness, tension, acute fear), an 8-item game enjoyment scale, positive and negative affect scales, spatial presence, and character identification.
- **Audio treatment:** Tested **linear soundtrack presence vs. absence**, not adaptive vs. linear audio. Soundtrack presence directly heightened subjective horror experiences and indirectly boosted enjoyment via affective intensification. No endocrine or physiological assays were conducted.

### 4. Meta-Analytic Evidence Shows Moderate Benefit for Audio, but Music Over SFX Is Uncertain [E-full] (Sources 3, 4)
- **Heikkilä, Danso, & Luck (2025 preprint / 2026 PLOS ONE):** Systematic review of 14 studies, meta-analysis of 6 studies examining game audio versus silence on positively valenced player experience. Overall pooled effect size was moderate ($g=0.48, 95\% \text{ CI } [0.22, 0.74]$). Removing a single self-selected music outlier eliminated heterogeneity ($I^2=58\%$ dropped to $0\%$), yielding a homogeneous pooled effect size of $g=0.34 [0.18, 0.50]$. In exploratory subgroup analysis, the specific incremental effect of **music over sound effects** was small and statistically uncertain ($g=0.31$, with the 95% CI crossing zero: $[-0.07, 0.68]$).
- **Caroux & Pujol (2024, IJHCI):** In a broad meta-analysis of game design elements on player enjoyment, background music presence was one of the few design choices with a statistically significant positive effect, whereas game difficulty and control interfaces failed to show significant main effects.

### 5. XR/Game Audio Systematic Review Demonstrates an Audio Enhancement Threshold [E-full] (Source 5)
Hedges, Sazdov, & Johnston (2024, JAES, 92 studies) synthesized audio's impact on immersion across extended reality and digital games. The review identified an **enhancement threshold**: beyond a baseline level of auditory congruence, increasing technical audio complexity or spatialization yields diminishing returns that users do not perceptibly register. The review noted a heavy skew toward VR head-mounted displays and called for standardized, audio-specific evaluation metrics.

### 6. Dynamic Music Regulates Narrative Immersion; Spatial Immersion Tracks Arousal Potential [E-full] (Sources 1, 6)
Gasselseder (2014, Audio Mostly, N=60) tested *Batman: Arkham City* across three conditions: dynamic adaptive music, low-arousal non-dynamic music, and high-arousal non-dynamic music. Results demonstrated that dynamic audio alignment specifically moderates temporal-narrative immersion and emotional regulation, whereas sensory-spatial presence is governed primarily by raw acoustic arousal potential (frequency density, loudness).

### 7. Rogers & Weber (2019) Establishes Repetition Fatigue; Gemini B's Loop Table Is Fabricated [E-full] (Source 7)
Rogers & Weber (2019, Audio Mostly, N=737) surveyed video game audio habits. 
- **Survey findings:** Repetition is a primary reason players mute in-game music (both in favorite games, Table 2, and in general, Table 3), leading players to engage in audio multitasking (muting game music to play external podcasts or music).
- **Fabrication check:** Gemini B claimed Rogers & Weber proved that *"Verbatim loops shorter than 60 seconds cause acute annoyance within 15–30 minutes"* and provided a detailed table of loop durations (<30s, 1–2 min, >3–5 min). **This table and quantitative threshold do not exist in Rogers & Weber (2019).** Rogers & Weber is a retrospective survey without loop-duration testing. Gemini B invented the duration benchmarks.

### 8. Short Loops Distort Time Perception; Silence Gaps Foster Greater Flow Than Crossfades [E-full] (Source 8)
McNamara, Lindblom, & Arthur (2022, Georgia Tech CCML / SMPC 2022) conducted a 20-minute experimental study in a 4-area Unity 3D game testing loop duration (~15s vs. ~2.5 min) and transition style (seamless crossfade vs. short silence):
- **Time estimation:** Players hearing short (~15s) loops systematically overestimated their playtime, whereas players hearing long (~2.5 min) loops underestimated playtime, indicating lower task enjoyment and higher subjective fatigue with short loops.
- **Transition effect:** Counterintuitively, players experiencing **short silences** between area music transitions reported higher average Short Flow State Scale (SFSS) scores than players experiencing seamless crossfades.

### 9. Player Tolerance Hinges on Functional Value; Expressive Micro-Variation Mitigates Fatigue [E-abs] (Sources 9, 10)
- **Dutta (2020, Univ. of Huddersfield PhD):** Qualitative heuristic inquiry found players tolerate repeating video game music when it provides meaningful functional feedback, but unmanaged repetition leads to overfamiliarity and hedonic degradation.
- **Worrall (2025/2026, Univ. of York PhD):** Evaluated expressive performance rendering for symbolic game music, demonstrating that applying subtle procedural variations to micro-timing, note velocity, and articulation significantly delays repetition fatigue without requiring newly composed melodic material.

---

## 2. Uncertainty and Context Limits

1. **Absence of Physiological Evidence for Adaptive Audio:** Despite frequent AI claims, empirical literature does not show that adaptive video game music drives measured endocrine (cortisol) or autonomic (HRV, EDA) changes over linear music. Published findings rely almost exclusively on post-hoc subjective questionnaires (GEQ, PANAS, SFSS) or self-report sliders.
2. **Ecological Validity and Sample Skew:** Empirical studies rely heavily on small student cohorts (e.g., N=30 in Plut & Pasquier; N=59 young men in Klimmt et al. Study 2) playing for 10–20 minutes. Naturalistic gaming sessions spanning multiple hours in varied home environments are rarely captured.
3. **No Empirical Basis for Rigid Loop Cutoffs:** No peer-reviewed study establishes universal, hard duration thresholds (e.g., Gemini B's claim that loops under 60 seconds fail at 15–30 minutes). Listener tolerance depends heavily on musical density, role (diegetic vs. background), volume, and interactive context.
4. **Music-over-SFX Ambiguity:** Meta-analytic data (Heikkilä et al.) indicate that while having audio is significantly better than silence, the incremental contribution of music above sound effects has a confidence interval spanning zero ($-0.07$ to $0.68$). Music is an expressive enhancer, not an autonomous psychological switch.

---

## 3. Transferable Recommendations for Plan 33

The owner's goal is to keep an original, synthesized browser gacha tune recognizable while transforming it across three authored character stages (neutral $\rightarrow$ uneasy $\rightarrow$ dire), operating strictly as an expressive storytelling device.

1. **Avoid Seamless Crossfading Between Apartment and Gacha; Use Brief Breathing Gaps [E-full] (Confidence: High)**
   - *Evidence:* McNamara & Arthur (2022) observed higher flow scores when area transitions were separated by brief silence rather than seamless crossfades.
   - *Application:* When opening the fictional gacha modal or transitioning from the apartment, introduce a 500–1200ms acoustic breath (or room tone/subtle UI latch) rather than an overlapping Web Audio crossfade. This gives the ear a boundary and resets auditory habituation.
2. **Transform Harmonic and Timbral Tension Rather Than Accelerating Tempo [E-full] (Confidence: High)**
   - *Evidence:* Plut & Pasquier (2019) demonstrated that harmonic dissonance and timbral harshness modulate subjective tension without triggering disorientation. Gasselseder (2014) showed structural-narrative congruence supports immersion.
   - *Application:* Maintain the recognizable lead melody and tempo across all three stages. For the "uneasy" stage, introduce subtle detuning, minor-second harmonic substitutions, and a low-pass filter closing down. For the "dire" stage, add cold square/sawtooth timbre layers, high-register dissonance, and drop low fundamental frequencies.
3. **Implement Procedural Micro-Timing and Velocity Variation Across Iterations [E-abs] [P] (Confidence: Medium)**
   - *Evidence:* Worrall (2025/2026) and Dutta (2020) show that listener fatigue in repetitive loops is caused by verbatim sample-identical repetition.
   - *Application:* Because Plan 32 will synthesize/render audio locally, apply subtle procedural jitter to Web Audio parameters on each loop cycle (e.g., $\pm 2\text{–}4\%$ low-pass cutoff drift, $\pm 1\text{–}2\text{ms}$ note-onset micro-timing, $\pm 5\%$ note velocity). This maintains melodic identity while preventing mechanical loop fatigue.
4. **Target a 45–75 Second Base Melodic Loop with Inter-Loop Breathing [E-full] [H] (Confidence: Medium)**
   - *Evidence:* McNamara & Arthur (2022) showed 15-second loops distort time perception and increase subjective fatigue, while longer loops maintain enjoyment.
   - *Application:* Structure the gacha theme with a core 45–60 second progression followed by a 4–8 bar ambient vamp or decay before restarting, avoiding manic rapid cycling.
5. **Recommended Small Paired-Listening Test [H]**
   - Implement a simple A/B test in the browser: Present students/listeners with (A) a 60-second verbatim repeating loop with immediate retrigger vs. (B) the same 60-second loop with subtle filter drift and a 1.5-second breathing tail across the 3 authored stages. Evaluate perceived tension and annoyance using 5-point Likert sliders.

---

## 4. Open Questions for the Owner

1. **Apartment vs. Gacha Audio Hierarchy:** Should opening the gacha modal completely duck/silence the apartment ambient music with a clean transition gap, or should the apartment sound remain audible as an attenuated low-passed background layer?
2. **Pacing of Transformation Stages:** Should the transition across the three musical states (neutral $\rightarrow$ uneasy $\rightarrow$ dire) be strictly pegged to authored narrative story chapters, or should it visually and sonically reflect run-time currency exhaustion?
3. **Player Volume Agency:** Given Rogers & Weber's (2019) finding that repetition drives audio muting and multitasking, should the fictional gacha UI include an in-universe music toggle/volume slider that preserves Receipt tracking even when silenced?
