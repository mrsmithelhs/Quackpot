# Findings: Task Argon-F2 — Arrangement Tension Devices and Fear-Subtype Acoustics

**Observed Model / Provider Settings:**
- Role / Agent ID: `argon-f2` (Plan 33 research worker)
- Platform Environment: Google Gemini platform (Gemini 2.5 Flash / Flash model via bounding harness)
- Context Scope: Cold-start verification of external Prompt A literature for Quackpot Plan 33.

---

## 1. Key Findings

1. **Resolution of Trevor et al. (2023) Citation Conflict and Statistical Validity:**
   The correct DOI for Caitlyn Trevor, Marina Renner, and Sascha Frühholz (2023), *"Acoustic and structural differences between musically portrayed subtypes of fear"*, is `10.1121/10.0016857` (*Journal of the Acoustical Society of America*, 153(1), 384–399). The alternate DOI cited by Gemini-A (`10.1121/10.0016847`) belongs to an unrelated paper on microphone arrays in the same issue. The sample size is confirmed as $N = 99$ participants rating 100 excerpts from the FEARMUS database. Furthermore, the numerical values reported in Gemini-A are authentic descriptive statistics from the paper's acoustic feature analysis:
   - **Event density (events/sec):** Anxiety Mean = $2.176$ ($\pm 1.307$) vs. Terror Mean = $3.190$ ($\pm 1.758$).
   - **Loudness (RMS):** Anxiety Mean = $0.172$ ($\pm 0.045$) vs. Terror Mean = $0.194$ ($\pm 0.058$).
   - **Loudness variability:** Anxiety Mean = $0.561$ ($\pm 0.068$) vs. Terror Mean = $0.513$ ($\pm 0.099$).
   **Critical methodological caveat:** These stimuli were naturalistically selected commercial horror film soundtrack excerpts with varied orchestration, tempo, and compositional language, *not* experimental transformations of a fixed musical melody. [E-full] (Source 1)

2. **Empirical Acoustic Separation of "Anxious / Uneasy" vs. "Terrifying / Dire" Soundscapes:**
   Trevor et al. (2023) demonstrate that musically portrayed fear is not monolithic. Musically portrayed **anxiety** (the "uneasy" stage) relies on high loudness variability (dynamic swells, sudden dropouts, sustained held tones) within a sparser texture (lower event density). In contrast, musically portrayed **terror** (the "dire" stage) is characterized by higher event density, significantly higher overall RMS loudness, faster tempo, harsher roughness, and a brighter spectral centroid mimicking the acoustic signatures of human alarm screams. Both subtypes share minor modality and rhythmic unpredictability. [E-full] (Source 1)

3. **Drone and Pedal-Point Mechanics — Authorship and Affective Limits:**
   The 2018 *Music Perception* paper (*36*(2), 243–249) is authored by **J. Jeffrey Bostwick, George A. Seror III, and W. Trammell Neill (2018)**, *not* Friedman et al. (resolving the ChatGPT-A vs. Claude-A conflict). Bostwick et al. ($N = 32$) showed that in the absence of melodic/harmonic structure, a continuous low drone establishes a tonal center, where minor-third modes (Aeolian, Dorian, Phrygian, Locrian) are rated significantly sadder and more tense than major-third modes. Friedman (2019, *Psychomusicology*, *29*(4), 171–179) tested continual tonic drones behind simple melodies and found that drones increased perceived sadness *only* in minor modes and failed to increase peacefulness. Crucially, neither study tested dissonant, non-tonic pedal points or threat induction; static tonic drones primarily reinforce modal sadness rather than active panic or dread. [E-full, E-abs] (Sources 2, 3)

4. **Pedal Point Classification in Popular Styles is Analytical Theory, Not Listener Psychophysics:**
   Hudson & Wang (2025, *Music Theory Online*, 31.4) provide a music-theory framework (`[T]`) describing "sentimental pedals," "cinematic pedals," and "harmonic-bass divorce." While theoretically useful for arranging, it is entirely non-empirical: it contains no listener tests, no tension rating scales, and no psychoacoustic verification. [T] (Source 4)

5. **Pitch Register and Transposition Strongly Drive Perceived Threat and Tension:**
   Whole-passage pitch height acts as a direct biological signal for dominance and threat (following the Morton/Ohala frequency code). Huron, Kinney, & Precoda (2006; $N = 41$) showed that lower-pitched transpositions of melodies sound significantly more threatening, aggressive, and dominant. Granot & Eitan (2011; $N = 132$) confirmed that lower pitch register and increasing loudness are primary drivers of perceived musical tension, frequently modulating or completely overriding the effects of melodic contour and tempo. [E-full] (Sources 5, 6)

6. **Psychoacoustic Roughness, Inharmonicity, and Spectral Flatness Drive Tension Independent of Harmony:**
   Farbood & Price (2017; $N = 24$) and Pressnitzer et al. (2000; $N = 17$) demonstrate that timbral roughness (rapid beating between close frequency components), inharmonicity, and spectral flatness reliably produce strong increases in perceived tension even in isolated tones or nontonal orchestral sonorities. In Farbood's (2012) temporal model, sensory roughness and dynamic loudness provide immediate, low-level tension spikes that do not depend on classical harmonic syntax. [E-full] (Sources 7, 8, 9)

7. **Refutation of Gemini-A's 65% Loudness Claim:**
   Gemini-A claimed that in Farbood (2012), "loudness shifts alone fail to drive perceived tension in 65% of test trials unless paired with pitch/harmonic cues." This is a severe misrepresentation. In Farbood (2006, 2012), the 65% figure originates in control trials evaluating listener responses to stationary/repeated pitches, where 65% of responses independent of loudness shifts reported *no change* in tension. Across Farbood (2012) and Granot & Eitan (2011), loudness changes consistently emerge as one of the strongest individual determinants of musical tension. [E-full] (Sources 5, 7)

8. **Listener Expertise Alters Tension Response to Orchestration:**
   Silvey (2011; $N = 40$) tested three amplitude- and duration-matched orchestrations of Mussorgsky's *Bydlo* (solo piano, brass quintet, full orchestra). While real-time tension curves were highly correlated across groups ($r = .78$ to $.96$), an inverse effect occurred for texture: musically trained listeners rated the sparse solo piano version as the *least* tense, whereas untrained nonmusicians rated the piano version as the *most* tense. [E-full] (Source 10)

9. **Infrasound (18 Hz) is Irrelevant and Inoperable for Browser Synthesized Audio:**
   Scatterty et al. (2026; *Frontiers in Behavioral Neuroscience*, 20:1729876) found that 18 Hz infrasound elevated salivary cortisol and negative mood. However, 18 Hz is an inaudible pressure fluctuation below the human hearing threshold (20 Hz), requiring specialized heavy subwoofers. Standard laptop, Chromebook, and mobile phone speakers mechanically cut off sharply above 100–150 Hz. Attempting to synthesize 18 Hz in Web Audio on student devices will produce zero audible signal or uncontrolled digital distortion. Auditory bass tension must be achieved in the audible range (50–120 Hz). [E-full, H] (Source 11)

10. **Withheld Cadences Manipulate Expectancy and Completion, Not High Arousal Threat:**
    Sears et al. (2020; $N = 40$) and Choi & Fujioka (2025; $N = 38$) demonstrate that deceptive and withheld cadences reliably suspend cognitive closure (Degree of Completion) and sustain expectancy. However, Smit et al. (2020; $N = 66$) proved that isolated cadence types have negligible effects on arousal; emotional valence is driven primarily by mode (major vs. minor) and pitch height rather than cadential syntax alone. Withholding a cadence prevents emotional resolution, but cannot induce dread without timbral or dynamic disruption. [E-full] (Sources 12, 13, 14)

11. **Syncopation Generates Enjoyment and Groove, Not Anxiety:**
    Keller & Schubert (2011; $N = 35$) found that syncopation significantly increased perceived happiness and enjoyment. Perceived tension differences between syncopated and unsyncopated phrases were statistically unreliable. Introducing standard syncopation into a looping gacha theme risks making it catchier and more pleasant, rather than uneasy or dire. [E-full] (Source 15)

---

## 2. Uncertainty and Context Limits

- **Lack of Controlled Longitudinal Loop Studies:** Most empirical psychoacoustic studies (Farbood & Price 2017; Smit et al. 2020; Pressnitzer et al. 2000) evaluate brief, isolated auditory stimuli (1 to 15 seconds) or single film clips. There is virtually no peer-reviewed literature measuring listener tension across 10–20 repetitions of a game loop undergoing real-time parametric degradation.
- **Ecological vs. Parametric Confound in Film Music:** Trevor et al. (2023) analyzed pre-existing film soundtracks where orchestration, tempo, harmony, and loudness varied simultaneously. While their descriptive statistics reflect authentic Hollywood conventions, they do not prove that altering event density or roughness alone on a single recognizable melody will achieve the same affective differentiation without destroying melodic identity.
- **Participant Demographics:** The vast majority of empirical studies cited (Bostwick et al. 2018; Granot & Eitan 2011; Huron et al. 2006; Keller & Schubert 2011; Silvey 2011) tested Western undergraduate cohorts or trained musicians. As Silvey (2011) demonstrates, musical training can completely invert how listeners perceive tension in sparse vs. dense arrangements.
- **Hardware Limitations:** Academic psychoacoustic studies utilize laboratory-grade headphones or calibrated monitor speakers. Student browser gameplay occurs on low-cost laptop speakers, earbuds, or Chromebooks, which severely attenuate bass frequencies below 120 Hz and compress dynamic ranges.

---

## 3. Transferable Recommendations for the Owner's Goal

To transform an original, recognizable looping tune from benign gacha play into **uneasy** and subsequently **dire** states across authored story stages, implement the following parameter mappings:

1. **Stage 1 (Normal / Alluring Loop):**
   - *Arrangement:* Clear metric pulse, balanced midrange/upper register, smooth harmonic consonances, resolved authentic cadences. [P, High Confidence]
   - *Acoustics:* Low psychoacoustic roughness, stable dynamic RMS, moderate event density. [E-full, High Confidence] (Sources 1, 8)

2. **Stage 2 (Uneasy / Anxious Transformation):**
   - *Loudness Dynamics:* Increase loudness variability ($\pm 6$ to $10\text{ dB}$ swells, sudden momentary volume drops before key beats) rather than increasing average volume (Trevor et al. 2023). [E-full, High Confidence] (Source 1)
   - *Texture / Orchestration:* Thin the accompaniment into a "hollow" texture—drop mid-frequency filler chords, leaving an exposed melody over an unyielding, low tonic pedal drone (Bostwick et al. 2018; Friedman 2019; Silvey 2011 nonmusician response). [E-full, High Confidence] (Sources 2, 3, 10)
   - *Cadential Withholding:* Avoid perfect authentic cadences at the loop boundary; substitute deceptive cadences (V $\rightarrow$ VI or V $\rightarrow$ $\flat\text{VI}$) or hang on suspended dominant pedals to withhold closure (Sears et al. 2020; Choi & Fujioka 2025). [E-full, High Confidence] (Sources 13, 14)
   - *Avoid:* Do *not* add syncopation, which induces positive groove/enjoyment (Keller & Schubert 2011). [E-full, High Confidence] (Source 15)

3. **Stage 3 (Dire / Terrifying Transformation):**
   - *Register Shift:* Transpose the bass accompaniment down by 1–2 octaves into the 55–110 Hz range (A1–A2), maximizing biological threat perception without exceeding laptop speaker limits (Huron et al. 2006; Granot & Eitan 2011). [E-full, High Confidence] (Sources 5, 6)
   - *Timbral Roughness / Inharmonicity:* Introduce rapid acoustic beating (15–30 Hz frequency separation) or subtle FM/ring-modulation sidebands on accompanying synth voices to maximize psychoacoustic roughness and spectral flatness (Farbood & Price 2017; Pressnitzer et al. 2000). [E-full, High Confidence] (Sources 8, 9)
   - *Density and Loudness:* Increase event density (e.g., adding rapid clockwork sixteenth-note arpeggiations or harsh stabs) and raise average RMS loudness while compressing dynamic variability into a dense, inescapable wall of sound (Trevor et al. 2023). [E-full, High Confidence] (Source 1)
   - *Metric Unpredictability:* Introduce irregular meter drops or brief micro-delays (e.g., dropping a beat every 4 bars) to disrupt metric entrainment rather than groove-inducing syncopation. [E-full, Med Confidence] (Sources 1, 15)

4. **Recommended Paired-Listening Test (Small AB Comparison):**
   In a future design test, present students with:
   - Version A: Melody with rhythmically varied syncopation and static tonic drone.
   - Version B: Identical melody with deceptive cadence withholding, sudden loudness dropouts, and a low-register rough beating bassline.
   Evaluate whether Version B achieves higher ratings on an "uneasy / dread" semantic differential scale without degrading recognition of the underlying tune. [H]

---

## 4. Open Questions Worth Passing to the Owner

1. **Melodic Preservation vs. Transformation Intensity:** At the "dire" stage, how strictly must the surface melody remain recognizable? Heavy roughness, inharmonicity, and register transposition heighten threat but risk obscuring melodic contour if applied to the lead voice rather than the accompaniment.
2. **Target Playback Hardware:** Given that bass frequencies below 100 Hz are inaudible on Chromebook and laptop speakers, should bass-driven threat rely on second/third harmonics (120–240 Hz saturation) to ensure students without headphones experience the intended tension?
3. **Loop Boundary Seamlessness:** In an append-only browser state, should cadence withholding occur at every loop iteration (e.g., every 16 bars), or should the loop dynamically defer resolution over progressively longer periods as run circumstances deteriorate?
