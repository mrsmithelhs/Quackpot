# Plan 33 — Recommendation: Keeping a Gacha Tune Recognizable While It Turns Uneasy, Then Dire

**Date:** 2026-10-28 (system clock; updated for Review 01 repairs)
**Prepared by:** Gemini 4 Argon (Medium) research integrator, integrating the prior Plan 33 Sonnet/Haiku synthesis (`b1bd633`) with the six external Prompt A & Prompt B deep-research reports, four bounded Flash verification tasks (`argon-f1` through `argon-f4`), and targeted Review 01 repairs (`reports/orchestration/plan-33-argon-integration-review-01.md`).
**Scope & non-adoption note:** This is a research synthesis and proposal. Accepting this research report does **not** automatically start composition, assign Plan 32, generate audio, select a runtime library or story-state trigger schedule, or modify production code. Any Plan 32 assignment and exact generation/listening/resource scope require explicit later owner authorization.
**Expressive & Receipt guardrail:** Music here is a designed expressive device illustrating the **fictional character's** changing relationship to the same gacha game. **No causal claim about actual players' addiction, dopamine, motivation, or physiological arousal follows from this research.** The Receipt may record only which music state was *displayed*, never an inferred player emotion or motive.

---

## Evidence & Reading-Depth Labels (Reconciled for Review 01)

- **`[E-full]`**: Empirical study with participant or corpus measurements where full text (or complete methods + results) was verified from an identified accessible document. *(Reading-depth label, not an automatic quality ranking.)*
- **`[E-abs]`**: Empirical study verified directly from an official abstract or repository record.
- **`[E-sec]`**: Empirical result reported via quantitative citation in a verified full-text paper or secondary summary where the primary full text was behind a paywall (`[E-abs]` is **not** broadened to conceal secondary reporting).
- **`[P]`**: Composer or developer first-person account of craft/intent (never treated as measured audience response).
- **`[T]`**: Music-theory, analytical, or specification description without listener-effect data.
- **`[H]`**: Hypothesis, art-direction proposal, or reasoned inference connecting published paradigms to Quackpot's repeated classroom gacha hook.

**Verification provenance:** `sources/index.md`, `deep-research/prompt-a/verification.md`, and `deep-research/prompt-b/verification.md` distinguish what was **verified directly by Argon**, what was **read by Sonnet** (Plut & Pasquier 2019; Kuusi 2009 PDF extract), and what was **worker-reported** (`argon-f1`–`argon-f4`, `B1`–`B2`, `T1`–`T4`). Where a worker marked a paywalled paper as `full text` without an identified open full-text witness (specifically **Liu 2018**), the synthesis uses the conservative verified level (`[E-abs]` + `[E-sec]`).

---

## 1. The Short Version (Recommended First Pass + Later Options)

### Recommended Approach — **Approach 2: Accompaniment-First Transformation, Plus a Single-Factor Clean vs. Gently Low-Pass-Filtered Lead Check in "Dire"**
Start with **bright, inviting, lightly bouncy music that remains comfortable and listenable during reading** (`[H]` art direction). Keep the hook's **pitch intervals/contour, rhythm skeleton, tonal center ("same key" defined as shared tonic/tonal center), tempo, loop length, and matched integrated LUFS loudness** fixed across **Base → Uneasy → Dire**, and keep the **lead instrument patch** unchanged in Base and Uneasy. Drive the state progression primarily through the **accompaniment** (`[H]` craft design informed by narrower perception studies):

1. **Base (Bright, Inviting, Read-Friendly):** Primary diatonic major triads (`I, IV, V`), warm mid-register accompaniment, steady pulse, and a resolved authentic cadence at bar 8 (`[H]` craft baseline; hook tested first unaccompanied via HOYO-MiX's V0 bare-melody check `[P]`).
2. **Uneasy (Loses Comfort Without Becoming Horror):** Shift the accompaniment first to **diatonic substitutions** (`ii, iii, vi` — supported for "same melody" conservation by **Liu 2018**, `[E-abs]`/`[E-sec]`, and **Liu 2022**, `[E-abs]`) with at most **one unexpected or borrowed minor-mixture chord** (`iv` or $\flat\text{VI}$ — an `[H]` craft extrapolation beyond Liu's primary-to-diatonic test, informed by single-chord tension in **Steinbeis et al. 2006**, `[E-abs]`), a **low tonic/modal pedal** (`[E-full]`: Bostwick et al. 2018; `[E-abs]`: Friedman 2019), a **thinned, sparser mid-register texture**, and a **withheld half or deceptive cadence** at the loop seam to suspend closure (`[E-full]`: Sears et al. 2020; Choi & Fujioka 2025).
3. **Dire (Restrained, Sparse, Unresolved Pressure First):** Aim Dire first toward **restrained, sparse, unresolved pressure** (`[H]` art direction, informed by **Silvey 2011**, `[E-full]`, where non-musicians rated a sparse solo arrangement tenser than full orchestra, and by the sparse/hollow profile of anxious cues in **Trevor et al. 2023**, `[E-full]`)—lowering the bass register (`[E-full]`: Huron et al. 2006; Granot & Eitan 2011), introducing controlled harmonic tension/roughness in the backing pad without making the loop harsh or fatiguing by default (`[E-full]` tone/chord-pair studies: Farbood & Price 2017; Pressnitzer et al. 2000), and leaving the loop seam unresolved. Keep denser/rougher backing alternatives on the shelf only if the owner hears too little contrast in the first pass.
4. **Single-Factor Lead Comparison in Dire (`Dire-Clean` vs. `Dire-Filtered`):** Over the **exact same Dire backing**, compare **clean lead (`Dire-Clean`)** against **gently low-pass-filtered lead (`Dire-Filtered`, filtering only—no detuning mixed in)**. Why? Cross-family instrument swaps (`piano ↔ sax` in **Schellenberg & Habashi 2015**, `[E-full]`; `piano ↔ orchestra` in **Poulin-Charronnat et al. 2004**, `[E-full]`) impair recognition of unfamiliar melodies, whereas within-family timbre shifts preserved recognition (**Lim & Goh 2012**, `[E-abs]`/`[E-sec]`), and gentle low-pass darkening on the same synth voice is a standard composer tool (`[P]`: Korb 2020; Ueda 2017) to prevent the lead from sounding detached from a darkened backing.

### Lean First-Pass Rendering Set (Exactly 5 Renderings for Owner Art-Direction Listening)
If the owner later authorizes Plan 32 to run a first listening check, render **five matched 8-bar loops** (no student subjects; owner listening is **art-direction evaluation**, not a statistical experiment or population proof):
1. **`Base`** (bright, inviting, lightly bouncy reference loop)
2. **`Foil`** (different original melody in the same Base style, to sanity-check "different tune")
3. **`Uneasy`** (Approach 2 accompaniment shift: diatonic/light modal mixture, low pedal, thinned texture, withheld cadence)
4. **`Dire-Clean`** (Approach 2 restrained, sparse, unresolved Dire backing with the **untouched Base lead**)
5. **`Dire-Filtered`** (identical Dire backing to `Dire-Clean`, with **gentle low-pass filtering only** on the lead voice)

### Deferred Alternative — **Approach 3: Octave Drop, Modal Inflection, and Pulse Hesitation (Hold as Later Option)**
Full melodic/modal/tempo alteration (**Approach 3**: dropping the lead an octave, inflecting melodic 3rds/6ths toward minor, and adding pulse hesitation, plus any extra dense/rough or detuned sub-variants) remains documented in `transformation-matrix.md` as a **later option** if the owner finds the 5-file accompaniment-first set insufficient. Because key/mode, tempo, and timbre changes each carry short-term recognition costs (`[E-full]`: Schellenberg & Habashi 2015; `[E-abs]`: Schellenberg et al. 2014), keeping Approach 3 in reserve avoids inflating the first pass.

---

## 2. Critical Examination of Evidence vs. Musical Recipe (Review 01 Repairs)

1. **Kuusi (2009): Descriptive condition differences with confounds, not a clean causal rhythm penalty (`[E-full]`):**
   - Full-text inspection of **Kuusi (2009)** (`https://jyx.jyu.fi/bitstreams/37dba1fe-eff1-44a1-9d0d-78e7548cedef/download`, $N=46$, 19 familiar tunes selected, **14 analyzed**) shows descriptive recognition rates of **95.9% (professionals) / 93.6% (amateurs) / 86.5% (non-musicians)** for the intact full tune, compared with **76.1% / 67.4% / 53.3%** for isochronous 500 ms melody alone, **81.3% / 68.0% / 53.9%** for isochronous melody + standard 4-part harmony (+0.6 to +5.2 points over melody alone), **50.5% / 15.6% / 2.5%** for monotone rhythm alone, and **37.6% / 8.5% / 18.6%** for rhythm + harmony with melody omitted.
   - **Methodological confounds:** The ~15–33 point difference between the intact tune and the isochronous melody conditions is **not an isolated causal effect of removing rhythm** because: (a) the intact version combined original harmony + rhythm + melody together, (b) the intact version was always presented **after** the two altered versions of the same tune (fixed order / repeated exposure), and (c) altered-condition recognition scores **excluded tunes that a participant failed to identify in the intact condition**. Preserving hook rhythm in Quackpot remains a sound practical inference (`[H]`) supported by Kuusi's descriptive pattern and surface cue-abstraction studies (`[E-abs]`: Mélen & Deliège 1995; Dowling & Fujitani 1971), without claiming a universal numerical rhythm penalty.

2. **Liu (2018, 2022): Diatonic conservation (`[E-abs]`/`[E-sec]`) vs. borrowed minor mixture and clusters (`[H]`):**
   - **Liu (2018)** (`https://journals.sagepub.com/doi/10.1177/0022429418776936`, $N=80$, `[E-abs]`) and **Liu (2022)** ($N=131$ China / $N=61$ US, `[E-abs]`) tested whether adults judge short melody pairs as the "same melody" when harmony is added, removed, or changed, finding above-chance melody conservation across all three tasks in both cultures. Secondary reporting of Liu (2018) Task 2 (`[E-sec]`) notes higher conservation when moving from primary triads (`I, IV, V`) to **diatonic chords (`ii, iii, vi`)** than to secondary/applied chords.
   - **Boundary between evidence and recipe:** Liu's primary-to-diatonic comparison does **not** directly test or validate borrowed minor modal mixture (`iv`, $\flat\text{VI}$), chromatic clusters, or frightening arrangements. In our proposal, "same key" means **retaining the same tonic/tonal center**, using diatonic substitutions (`ii, iii, vi`) as the `[E-abs]`/`[E-sec]` anchor in Uneasy, and treating borrowed minor mixture (`iv`, $\flat\text{VI}$) and Dire dissonance as **`[H]` craft choices** to be judged by ear.

3. **Sound-pair experiments vs. correlational film-excerpt analysis vs. cross-cultural outcomes:**
   - **Isolated sound-pair / chord judgments:** **Farbood & Price (2017)** (`https://bpb-us-e1.wpmucdn.com/wp.nyu.edu/dist/f/11865/files/2020/08/Farbood_Price_2017.pdf`, $N=24$, `[E-full]`) and **Pressnitzer et al. (2000)** ($N=17$, `[E-full]`) tested **paired comparisons of isolated 2-second synthesized tones or orchestral chords**, finding that roughness, inharmonicity, and spectral flatness increase tension judgments in isolated sonorities. Applying subtle roughness to a looping accompaniment is an **`[H]` musical extrapolation**, not something proved by tone-pair trials, and roughness should never be pushed to an uncomfortable listening level by default.
   - **Correlational horror-excerpt analysis:** **Trevor, Renner, & Frühholz (2023)** (`https://pubmed.ncbi.nlm.nih.gov/36732275/`, $N=99$, `[E-abs]`/`[E-full]`) collected listener anxiety/terror ratings to classify 100 existing commercial horror-film excerpts (FEARMUS) and then ran **correlational acoustic/music-theoretical analyses** on the classified clips (finding anxious clips sparser at $2.18$ events/s with higher loudness variability $0.561$, and terrifying clips denser at $3.19$ events/s with higher RMS $0.194$ and harsher 30–150 Hz roughness). It did **not** manipulate isolated parameters on a fixed melody.
   - **Cross-cultural and expertise moderation:** In **Athanasopoulos et al. (2021)** ($N=169$, `[E-full]`), the Western major-happy / minor-sad pairing appeared only in UK listeners ($p=.0074$), while in the Kalash group roughness correlated *positively* ($+0.22$) with valence (and both Pakistani groups were below the target $N=37$). In **Silvey (2011)** ($N=40$, `[E-full]`), musicians rated solo piano least tense while non-musicians rated solo piano *most* tense. Accordingly, no musical device produces a universal tension effect across all students.

4. **Proposed parameters vs. empirical facts (`[H]`):**
   - Specific synth settings mentioned in our brief—such as a 55–110 Hz bass fundamental with 110–240 Hz upper harmonics, $\pm 6\text{ dB}$ internal swell range, 30–150 Hz modulation rates, or 16-bar A/A′ loop-fatigue benefits—are **proposed starting parameters (`[H]`)**, not empirically established Quackpot constants. No frequency recipe guarantees reproduction on every laptop or phone speaker; audibility must be checked directly on target speakers.

---

## 3. Summary of Findings & Dispositions (Including Review 01 Repairs)

| Area / Claim | Disposition & Reconciled Evidence Status |
|---|---|
| **Kuusi (2009) rhythm & harmony** | **Repaired (`[E-full]` descriptive + `[H]` inference):** Reports exact condition means (intact 95.9%/93.6%/86.5% vs. isochronous melody 76.1%/67.4%/53.3% vs. melody+harmony 81.3%/68.0%/53.9%) together with the harmony, presentation-order, and intact-selection confounds. Preserving hook rhythm is retained as an `[H]` design inference. |
| **Liu (2018, 2022) melody conservation** | **Reconciled (`[E-abs]` + `[E-sec]`, with `[H]` recipe boundary):** Official abstracts (`[E-abs]`) confirm melody conservation under changed harmony across US ($N=80$) and Chinese/US ($N=192$) adults; secondary reporting (`[E-sec]`) supports primary→diatonic (`ii, iii, vi`) over secondary chords. Modal mixture (`iv`, $\flat\text{VI}$) and Dire clusters are explicitly labelled `[H]` craft choices. |
| **Lead timbre vs. single-factor filtering** | **Refined (`[E-full]` / `[E-abs]` / `[E-sec]` → `[H]` single-factor test):** Separates cross-family swaps (`piano ↔ sax` in Schellenberg & Habashi 2015 `[E-full]`) from within-family similarity (Lim & Goh 2012 `[E-abs]`/`[E-sec]`). First pass compares `Dire-Clean` vs. `Dire-Filtered` (low-pass filtering **only**, separated from detuning). |
| **Uneasy & Dire acoustic profiles** | **Clarified (`[E-full]` correlational / sound-pair vs. `[H]` recipe):** Distinguishes Trevor et al. (2023) correlational film-excerpt classification and Farbood & Price (2017) isolated 2-s tone pairs from our proposed state progression (`[H]`). Adopts Root's provisional art direction: readable/bouncy Base → less-comfortable Uneasy → restrained, sparse, unresolved Dire first. |
| **Adaptive game music & composer craft** | **Verified (`[E-full]` / `[P]`):** Retains Plut & Pasquier (2019, $N=30$, `[E-full]` self-report tension vs. static neutral), Klimmt et al. (2019, `[E-full]`), Heikkilä et al. (2026 meta-analysis, `[E-full]`, $g=0.34$ audio vs. silence, music-over-SFX CI $[-0.07, 0.68]$), HOYO-MiX (2020, `[P]` V0 piano test), and Korb (2020, `[P]` measure markers & salience bell curve). |
| **Rejected external AI claims (Contradicted vs. Unsupported)** | **Distinguished per Review 01:**<br>- **Contradicted by primary full text:** (1) `Gemini-A`'s claim that Jimenez et al. (2022) tested melody identity (it tested chord memory); (2) `Gemini-A`'s 65% loudness failure claim on Farbood (2012) (stationary-pitch controls); (3) `Gemini-B`'s physiological arousal claim on Plut & Pasquier (2019) and salivary cortisol claim on Klimmt et al. (2019); (4) `Gemini-B`'s `<30s / 1–2 min / >3–5 min` table attributed to Rogers & Weber (2019); (5) `ChatGPT-A`'s misattribution of Bostwick et al. (2018) to Friedman et al.<br>- **Unsupported by cited source:** `Gemini-B`'s `0.5–2.0s` (*NieR*) and `3.0–5.0s` (*Genshin*) crossfade durations do not appear in Okabe (2018), Ueda (2017), or Chen & Cai (2020). |

---

## 4. Remaining Uncertainty & Material Gaps

1. **No direct study of a repeated game loop across Base → Uneasy → Dire:** Published studies test short melody pairs, isolated tones/cadences, film clips, or short action games—not a 19.2 s classroom gacha loop heard across a 15–25 minute session.
2. **Paywalled primary details (`[E-sec]`):** Exact Task 2 subgroup tables in Liu (2018, 2022), $d'$ tables in Lim & Goh (2012), and Experiment 1 sample breakdown in Friedman (2019) remain behind publisher paywalls and are conservatively tagged `[E-abs]` / `[E-sec]` rather than spending further agent budget.
3. **Hardware & listener variance:** Small laptop/phone speakers vary widely below ~150 Hz, and musical training/culture moderate perceived tension (`[E-full]`: Silvey 2011; Athanasopoulos et al. 2021).

---

## 5. Short Owner Decision List (Separated by Gate)

Accepting this Plan 33 research report closes the research synthesis only. **Plan 32 assignment and any audio generation or listening scope require separate, explicit owner authorization.**

### Gate 1 — Research Acceptance & Whether to Authorize a Lean Plan 32 First Pass
1. **Accept the repaired Plan 33 research synthesis?** (Closes Plan 33 research without adopting music or starting production work.)
2. **Authorize a lean Plan 32 first-pass art-direction listening check (5 renderings)?** If and when you choose to open Plan 32, authorize composing one original 8-bar hook (no intentional copying, with an auditable composition record) and rendering **five loudness-matched files (`-16 LUFS` integrated, `-1.0 dBFS` true-peak ceiling)**: **`Base`** (bright, inviting, lightly bouncy, read-friendly), **`Foil`** (different melody, same style), **`Uneasy`** (loses comfort without horror: diatonic/light modal shift, low pedal, thinned texture, withheld cadence), **`Dire-Clean`** (restrained, sparse, unresolved pressure with clean lead), and **`Dire-Filtered`** (same Dire backing with **gentle low-pass filtering only** on the lead).
3. **Keep fuller alternatives in reserve?** Hold **Approach 3** (octave drop + minor inflection + pulse hesitation) and extra dense/rough or detuned Dire variants as later options only if the 5-file first pass shows too little contrast.

### Gate 2 — Deferred Runtime & Integration Decisions (Not Needed Until After Listening Selection)
4. **Authored story-state source & transition style (`transition-contract.md`):** Which explicit authored state (`S1` story flag, `S2` visible stage threshold, or `S3` scene map) drives Base → Uneasy → Dire; apartment ↔ gacha transition style (bar-quantized fade vs. brief breathing gap); hidden-tab policy; Uninstall/Receipt silence rules; and local Credits provenance wording.
