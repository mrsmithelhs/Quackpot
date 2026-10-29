# Plan 33 — Sources index

Prepared 2026-10-28. Full per-source tables (title, creators, venue, URL, access, limits, claim-to-source maps, gaps) are in each task's `sources.md`; this index shows what was **actually read, at what depth, and by whom**, and which sources the synthesis leans on. Reading depth is the single most important column: **worker reports are claims, and I did not independently re-open the pages except where noted.**

Depth key: **FULL** = full text read (browser-pane worker, or integrator where stated); **ABS** = abstract/publisher description only; **SNIP** = search-result snippet only; **DOCS** = official documentation page read through a summarizing fetch (not verbatim); **LEAD** = named, not opened.

## A. Evidence the recommendation leans on most

| Source | Depth | Read by | Used for |
|---|---|---|---|
| Schellenberg & Habashi (2015), *Mem. & Cognition* 43:1021 | FULL | B1 (browser) | Timbre change lowers recognition at 10 min/1 day/1 week; key/tempo at 10 min/1 day only; N and effect sizes |
| Eerola, Friberg & Bresin (2013), *Front. Psychol.* 4:487 | FULL (Discussion by keyword) | T2 (summary fetch), B1 (browser) | Cue ranking (pooled), additivity, "scary" results, register/dynamics/mode |
| Athanasopoulos et al. (2021), *PLOS ONE* | FULL (main article; supporting info unread) | T2, B1 | Same melody, different harmonizations; culture-specific mode effect; weak roughness correlations |
| Trevor, Arnal & Frühholz (2020), *JASA-EL* 147:EL540 | FULL | B1 | Roughness in scream-like horror-score excerpts (roughness only) |
| Plut & Pasquier (2019), IEEE CoG, "Music Matters" | FULL (integrator, via text extraction of the PDF the browser downloaded; table cells garbled; page images not renderable here) | Integrator; B2 saw abstract only | Adaptive music vs static music: tension, N=30, limits |
| Dowling & Fujitani (1971), *JASA* 49(2B) | ABS | B1 | Contour + intervals strongest identity carrier (ordering only) |
| Kuusi (2009), ESCOM | ABS | B1 | Melody > rhythm; harmony did not help recognition (familiar tunes) |
| Schellenberg, Stalinski & Marks (2014), *Psychol. Research* 78:84 | ABS (+2015 description) | B1 | Key and tempo penalties additive |
| Steinbeis, Koelsch & Sloboda (2006), *J. Cogn. Neurosci.* 18:1380 | ABS | T2 (snippet), B1 (abstract) | Unexpected chord raises tension (N=24) |
| W3C Web Audio API WD (2026-09-22) | DOCS (sections 1.1, 1.2.3, 1.6.2, 1.9.2 checked by B2) | T4, B2 | Context states, `resume()` behavior, ramp rules, loop clamping |

## B. Task source sets (see each `sources.md` for full tables)

| Task | Folder | Rows | Opened at ABS or better | Notes |
|---|---|---|---|---|
| T1 identity | `research/t1-identity/` | 30 | 8 (ABS) | No full-text empirical paper read by T1; B1 upgraded 4 sources |
| T2 tension | `research/t2-tension/` | 23 | 14 (6 FULL per worker's summary-fetch, rest ABS) | Many SNIP rows; Nature/Springer/SAGE gated |
| T3 game practice | `research/t3-game-practice/` | 11 | 10 usable text; 1 project page | All [P]/secondary; no gacha/mobile composer |
| T4 browser | `research/t4-browser/` | 24 | ~20 DOCS with real content | Summarizing fetch only; spec read in chunks |
| B1 browser pass | `research/browser-pass-b1-results.md` | 8 | 4 FULL, 3 ABS-only, 1 blocked | One PDF triggered a download (stopped) |
| B2 browser pass | `research/browser-pass-b2-results.md` | 7 items | Specs/docs read; 2 studies abstract-only | Plut & Pasquier PDF download read by integrator |

## C. Practitioner (composer/developer) sources — all [P] or secondary

Winifred Phillips (Game Developer and blog, 2019–2021); Keiichi Okabe (PlayStation.Blog 2018); Koji Kondo (2001 interview, fan translation); Darren Korb (Game Developer 2022); EGM *Journey* article; Marcelo Martins (Game Developer 2012, informal). These state intent; none measures audience response. See `research/t3-game-practice/sources.md`.

## D. Official technical documentation read

W3C Web Audio API WD; W3C Audio Session API WD (draft); WHATWG HTML media elements and Fetch; MDN (AudioContext, BaseAudioContext/state, AudioParam, AudioBufferSourceNode, AudioBuffer, OfflineAudioContext, AudioWorkletNode, MediaElementAudioSourceNode, Autoplay guide, Page Visibility, container/codec guide); Chrome developer docs (autoplay 2017/2018; timer throttling 2021); WebKit bug 237878; caniuse (Web Audio, MP3); GitHub Pages limits; Chris Wilson "A tale of two clocks" (practitioner article). Dates and gaps are in `research/t4-browser/sources.md` and `research/browser-pass-b2-results.md`.

## E. Not obtained (gaps that matter)

- Direct evidence on **replacing harmony under a fixed melody** and its effect on tune identity.
- Empirical tests of **drone, sub-bass, detuning, withheld cadence**.
- **Gacha/mobile** composer accounts; FMOD/Wwise official documentation; the Klimmt et al. 2019 results (bot-blocked); Plut & Pasquier's table cells; Egermann et al. 2013; the later Trevor rating study; Safari `interrupted` handling and `navigator.audioSession` (not attempted); Chrome autoplay current wording.

## F. External deep-research prompts (not run)

`deep-research-prompts.md` — two prompts to fill gaps A (accompaniment vs identity, under-tested devices) and B (measured adaptive game music, theme-transformation practice).
