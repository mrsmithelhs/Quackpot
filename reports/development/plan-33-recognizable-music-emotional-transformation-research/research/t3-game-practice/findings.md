# T3 findings: game composer/developer practice

**Provenance:** Authored by Haiku worker T3 (Plan 33); saved by the Sonnet integrator from the worker's returned text, reformatted but not substantively edited. Source numbers refer to `sources.md` in this folder. **No empirical paper was read in full**; the two expected [E] studies (Plut & Pasquier; Klimmt et al. 2019) were reachable only as snippets, so no finding below is [E]. 11 sources opened (10 with usable text, 1 project page only). Not independently re-opened by the integrator.

Tags: **[P]** practitioner, **[T]** theory, **[H]** hypothesis.

## 1. Key findings

1. **[P] Keep one recognizable hook and vary its arrangement rather than its core identity.** Phillips describes restating one main theme in six variations on one project, and a short chord sequence repeated about fourteen times in another main theme, as deliberate signature devices. (7, 8)
2. **[P] Vertical layering keyed to location and player action.** Phillips describes one game with three stackable layers switched on, off or set in volume, with trigger points mapped in a roadmap for the developer. (9)
3. **[P] Horizontal re-sequencing with engine markers.** Segments are cut at beats, measure starts or designated points and reordered at runtime; one game uses over thirty randomized segments per level so players cannot anticipate the next. (3, 4)
4. **[P] Transition style is a choice.** One account contrasts overt transitions (segments that fade into silence) with hidden transitions on a boss track whose rising segments blend seamlessly. (4)
5. **[P] Melody-on and melody-off alternates.** Export versions with and without the melody, alternate them, and mute the melodic layer in some spaces (the cited example mutes a melody in smaller rooms). Author describes the basis as informal observation. (11)
6. **[P] Story-linked assignment.** Phillips writes exploration and combat music first, then assigns the strongest themes to story moments and characters, matching the number of leitmotifs to narrative depth; one theme recurs across three story missions. (9, 7)
7. **[P] Tempo and event cues as urgency.** Kondo says he sped up the music late in one *Super Mario Bros.* stage and that some musical ideas only work in a game; *Ocarina* field music plays in randomized 8-bar blocks and an enemy encounter shifts to a more heroic theme. (6) Speed-up threshold unresolved (G9).
8. **[P] Scene-driven and melody-first writing.** Okabe says he composes for specific visuals and scenes, that battle music is tempo-driven, and that for emotional songs he writes a melody that would work sung and builds the track around it. (2)
9. **[P] Instrumentation as character coding.** Phillips blended gritty guitars and strings with playful instruments for a mad-scientist character; *Journey* is described as one long theme with instruments tied to the player character and the wider world (journalist summary). (9, 10)
10. **[P] Repetition fatigue is an acknowledged problem.** Phillips calls it a major issue that is very hard to avoid, citing an overused tune. (9) Martins (informal) says memorable melodies wear out on repetition and that a loop heard about twice is tolerable while more is risky; threshold table not verified. (11)
11. **[P] Loop seams and transitions.** Martins says the seam is most audible when the music drops back to its opening, that reordering sections makes the loop end obvious, and that a thinner loop point sounds weak. (11)
12. **[P] Middleware practice.** Korb describes timeline markers and section transitions, consistent parameter names across templates, and routing a vocal through a bus for a filter. (5) Wintory states the challenge of reconciling player agency with musicality, since altering linear music's timing can damage storytelling. (10; one direct remark, original source not named)

## 2. Measured vs. only claimed

- **Measured, not verified here (snippet-level leads):** Plut & Pasquier — adaptive music raised experienced tension more than linear music, and inverse-mapped music also raised tension. Klimmt et al. 2019 — music raised enjoyment via positive emotion in one game and shocking music intensified horror in another; spatial-presence route not confirmed. A 2025 meta-analysis snippet reports a positive sound/music effect on valence. All must be checked against full papers.
- **Claimed [P]:** every composer statement above. None reports measuring whether players perceived the intended change, recognized a theme, or noticed a transition.
- **Informal:** Martins' repetition thresholds are self-described as unscientific.

## 3. Repetition fatigue and transition noticeability (from practice)

Practitioners attribute fatigue mainly to repeated memorable melody (11) and treat it as a central composer problem (9). Seams are noticed by experienced listeners and by less experienced listeners who notice repetition (11). Fixes described: randomized segment order (4), melody-on/off alternation (11), reordered or staggered sections (11), hidden transitions (4). None is measured.

## 4. Cheap vs. full middleware for a small static browser game

Cheap enough **[H, med]**: one theme with two or three pre-rendered arrangements switched on bar boundaries (7, 8, 11); a two-layer stem (base plus melody) with a melody-off variant (11); one late tempo step as a pre-rendered variant rather than live time-stretching (6) — changing the playback rate of a plain sample also shifts pitch; a short fixed segment order with bar-aligned transitions (3, 4).

Needs more than a small static game **[H, med]**: randomized graphs of 30+ segments per state (3, 4); transition timelines with relative offsets; synchronized multi-track stacks; stingers keyed to parameter values (leads only, G7). Korb's workflow (5) is middleware-specific.

## 5. Accounts tied to character or story state

Sources 2, 6, 7, 9 and 10 (see §1 items 6–9). All are retrospective composer or journalist accounts of intent; none measures listener response.

## Uncertainty and context limits

- Survivorship: composers describe techniques that worked in their own projects; no failures reported.
- Mostly Western AAA and Japanese console titles; **no gacha or mobile composer account was found.**
- Several pages were read through a summarizing fetch; paraphrases must be checked against originals.
- Thresholds (loop repeats; speed-up timing) are unverified or conflicting.
- Culture/training dependence is not addressed by any opened source.

## Transferable recommendations (expressive device only)

- **R1 [P, med]** Keep identity in melodic contour and rhythm; vary arrangement, instrumentation and tempo. Test: paired listening, "are these three versions the same tune?"
- **R2 [P, med]** Two-layer build with a melody-off variant for the most uneasy states. Test: melody-on vs melody-off rated tension.
- **R3 [P then H, low]** Reach the final dire state by a tempo step *or* an added layer, not both at once. Test: tempo-only vs layer-only, rated urgency.
- **R4 [P, med]** Bar-aligned changes. Test: overt vs hidden transition; ask listeners to mark where the change happens.
- **R5 [P, med]** Avoid obvious landmarks at the loop point; test loop-seam detection.
- **R6 [P informal, low]** Limit repeats per state; test tolerance over several plays rather than assuming a threshold.
- **R7 [P, med]** Tie each change to a story beat, not to player performance. Test: can listeners order the states in story sequence from the music alone?

**Suggested paired-listening test [H]:** four conditions (original; instrumentation-only; tempo-only; melody-off), about 20–30 listeners per condition; measure recognition, perceived unease and perceived urgency. Limits: short excerpts, likely Western undergraduate samples, self-report. Tests perception of the expressive device only, not player motive, addiction or physiology.

## Open questions for the owner (from worker)

1. Which story states map to which layer or tempo step? 2. Should transitions be audible (story-meaningful) or hidden? 3. How is "recognizable" defined for the test: contour, rhythm or timbre? 4. Are pre-rendered variants acceptable, or must variation be live? 5. How many distinct states should the tune have?
