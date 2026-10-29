# Plan 33 — deep-research prompts for the owner to run externally

**Status:** drafts for owner use with other providers' deep-research modes. Nothing here has been run. Results return to the Plan 33 integrator (or orchestration) as pasted text; the integrator will verify every citation before using it. Prepared 2026-10-28 from the gaps left by tasks T1–T4.

**How to use:** paste one prompt whole into a deep-research tool. Run Prompt A and Prompt B separately (they have different source types). Optionally run the same prompt on two providers and compare which sources each found. Keep each provider's raw output; do not edit citations.

**Why these two:** the four Haiku tasks could mostly read abstracts and snippets. Their biggest unresolved evidence gaps are (A) how much changing only the accompaniment/arrangement affects whether a tune is judged "the same", and which untested arrangement devices (drone, sub-bass, detuning, withheld cadence) have any empirical support; and (B) measured, not just composer-claimed, effects of adaptive game music, plus composer accounts of theme transformation. Browser-audio constraints (T4) were already sourced from official documentation and do not need a deep-research pass.

---

## Prompt A — melody identity vs. arrangement, and arrangement-level tension

> **Role and goal.** You are a music-cognition literature researcher. I need a source-grounded evidence review to guide the *original composition* of a short synthesized game tune that must stay recognizably the same tune while its arrangement becomes progressively more uneasy and then dire (three versions: calm/enticing "base", "uneasy", "dire"). This is an expressive design choice for a fictional story; it is **not** about diagnosing listeners, addiction, or physiology. Do not discuss those.
>
> **Questions (answer each separately, with evidence).**
> 1. *Identity under re-arrangement.* When the melody (pitch contour, intervals, rhythm) is held constant and only accompaniment/harmonization, instrumentation, register of the accompaniment, texture, or tempo changes, do listeners still judge it the same tune? Look for experiments where the melody is fixed and the harmonization/arrangement varies, tune-recognition studies that dissociate melody, rhythm and harmony (e.g., Kuusi; Melen & Deliège), cover-version and "same song" perception studies, and theme-and-variation perception studies. Report which cues (contour, rhythm, intervals, tempo, key, timbre, harmony) were varied and how much identity loss was measured.
> 2. *Effect of fixed-melody arrangement changes on tension/unease.* Studies where the same melody is presented with different harmonizations, bass lines, drones, pedal points, voicings, textures or registers, and tension/unease/threat ratings are collected.
> 3. *Under-tested devices.* Find any empirical evidence (listener ratings, behavioural, or acoustic analysis of film/game scores) on: sustained drones and pedal tones; sub-bass or very low register; detuning/beating/roughness; withheld or deceptive cadences and delayed resolution; metric ambiguity or irregular pulse; sparse versus dense texture; dynamic/loudness confounds. If no empirical study exists for a device, say so explicitly.
> 4. *Cultural and training limits* for each finding.
> 5. *Horror/threat score acoustics.* Primary papers (e.g., Trevor and colleagues in *JASA*; Lipscomb & Tolchinsky; Bullerjahn & Güldenring) on which acoustic/arrangement features make music sound threatening, with stimuli and sample sizes.
>
> **Source rules.** Prefer peer-reviewed empirical papers, preprints from reputable repositories (PsyArXiv, arXiv, university repositories) and systematic reviews. Books and theory texts are acceptable only when clearly labelled theory. **Every claim needs a citation with authors, year, title, venue, and a DOI or direct URL.** For each source state whether you read the full text, the abstract only, or only a summary/snippet. Do not cite a paper you could not open at least at abstract level. **If you cannot find evidence, write "no evidence found" rather than inferring.** Never invent a citation, sample size, effect size or quote. At most one short quote (under 15 words) per source.
>
> **Evidence tags.** Mark every finding **[E]** empirical (give N, population, stimuli, measure), **[T]** theory/description, **[P]** practitioner/composer account, or **[H]** your own inference. Do not present [T], [P] or [H] as if [E].
>
> **Output format.** (1) A 150-word executive summary. (2) A table of sources: citation | access (full/abstract/snippet) | design (N, stimuli, task) | key result | limits. (3) Findings per question above, each tagged and linked to table rows. (4) "Where the evidence is thin or absent" list. (5) A ranked list of the 5 most decision-relevant sources that a human should read in full, with reasons. (6) A short list of searches that returned nothing useful, so I know what was tried.

---

## Prompt B — measured effects of adaptive game music, and theme-transformation practice

> **Role and goal.** You are a game-audio research assistant. I need an evidence review on adaptive/interactive video-game music, to guide a small static browser game in which one recognizable original tune changes arrangement as an authored *story* state worsens (not as a response to player performance). I need *measured* evidence separated from composer claims. This is about perception of a designed expressive device; **do not** discuss addiction, monetization psychology, or diagnosing players.
>
> **Questions.**
> 1. *Measured effects.* Peer-reviewed or well-documented empirical studies on adaptive vs. linear game music and (a) experienced tension/arousal, (b) enjoyment, (c) presence/immersion, (d) noticing of transitions, (e) repetition fatigue. Include Plut & Pasquier ("Music Matters", IEEE CoG), Klimmt et al. (2019, *Media Psychology*), systematic reviews/meta-analyses of sound and music in games (including any 2024–2026 reviews), and studies on loop length or repetition tolerance. For each, give N, population, game/stimuli, conditions, measures, results, limitations.
> 2. *Theme transformation in practice.* First-person composer/developer accounts (conference talks with transcripts or slides, postmortems, interviews with the composer) where **one recognizable theme is reused in multiple arrangements as story or character circumstances change** — e.g., vocal/instrumental/degraded variants, tempo or layer steps, leitmotif transformation. Examples to check (do not limit yourself): *NieR: Automata* (Okabe), *Undertale* (Toby Fox), *Hades* (Korb), *Journey* (Wintory), *Silent Hill* (Yamaoka), *Dead Space* (Graves), *BioShock Infinite*, *Halo* (O'Donnell), *DOOM* (2016, Gordon), *Celeste*, and mobile/gacha games (e.g., *Genshin Impact*/HOYO-MiX region themes; other gacha composers). Extract the technique, how identity was preserved, and what the composer says about transitions and repetition. Do not describe or transcribe any melody.
> 3. *Transition and loop practice* with documented specifics: bar-aligned vs. immediate transitions, crossfade lengths used, loop lengths, number of variants/stems shipped, and any reported problems.
> 4. *Small-team/low-budget patterns* suitable for a static web game (few stems or pre-rendered variants).
>
> **Source rules.** Prefer: (1) peer-reviewed/reputable preprint empirical work; (2) the composer/developer speaking in their own words (GDC Vault, AES, YouTube talk with transcript, official dev blog); (3) official middleware docs (FMOD, Wwise) for *design patterns* only. Label secondary journalism and fan wikis as secondary. **Every claim needs authors/speaker, year, title, venue, and a direct URL or DOI**, plus access level (full text / abstract / transcript / snippet only). Do not cite what you cannot open. Never invent quotes, numbers or citations; if you cannot verify, say "unverified lead." At most one short quote (under 15 words) per source.
>
> **Evidence tags.** [E] measured (with N and design), [P] practitioner's stated intent, [T] description, [H] your inference. Never present [P] as measured audience response.
>
> **Output format.** (1) 150-word executive summary. (2) Source table: citation | type | access | what it shows | limits. (3) Findings per question, tagged. (4) A "measured vs only claimed" section. (5) Patterns cheap enough for a static browser game vs. requiring middleware. (6) Top 5 sources a human should read in full. (7) What you searched for and could not find (especially gacha/mobile composer accounts).

---

## Verification plan once results come back (integrator)

1. For each cited source the deep-research tool says it read, the integrator will open it (or have an authorized worker open it) and check authors, year, N and the quoted result. Unopenable sources are marked **unverified lead** and excluded from decision-shaping claims.
2. Discrepancies against T1–T4 findings are recorded in `recommendation.md` under uncertainties.
3. Nothing from these prompts changes the no-audio/no-production boundary.
