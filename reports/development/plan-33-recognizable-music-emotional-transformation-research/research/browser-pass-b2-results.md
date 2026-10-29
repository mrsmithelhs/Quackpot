# Browser pass B2 results — game-music studies and Web Audio verification

**Provenance:** Authored by Haiku worker B2 (Plan 33 owner-authorized browser pass, 2026-10-28), using the harness browser pane (about 69 tool calls). Saved by the Sonnet integrator from the worker's returned text, reformatted but not substantively edited, **plus an integrator full-text note on Plut & Pasquier (section 1b)** that the integrator read itself. B2 also reported that its first navigate created a tab named "seed" that it did not close; the integrator closed it afterward. No files were written by the worker. The worker's Plut & Pasquier PDF link triggered a browser download (`paper_106.pdf` in the owner's Downloads folder; the worker stopped and did not retry); see section 1b. Other worker claims have not been independently re-opened.

## 1. Plut & Pasquier (2019), "Music Matters"

### 1a. Worker report (abstract + intro only)
- Citation: Cale Plut and Philippe Pasquier, 2019 IEEE Conference on Games (CoG), London, 20–23 Aug 2019. DOI 10.1109/CIG.2019.8847951. URLs read: https://ieeexplore.ieee.org/document/8847951 (abstract + first paragraph; "Sign in to Continue Reading" wall) and a Semantic Scholar page (TLDR/metadata). PDF link http://ieee-cog.org/2019/papers/paper_106.pdf triggered a download, so the worker stopped.
- Abstract-level verdict: adaptive music "can significantly increase" reported experienced tension; players "recognize and value" music and adaptive over linear music. Worker verdicts on the earlier snippet-level claims: adaptive raised tension — PARTLY; inverse-mapped raised tension — CANNOT TELL; about 30 participants — CANNOT TELL.

### 1b. Integrator full-text read of the downloaded PDF
The integrator read the extracted text of the downloaded PDF (IEEE PDFeXpress-certified, 8 pages, TeX; text extracted with `pdftotext` from a copy in the session scratch folder; figures and table cells partly garbled by extraction, so **per-condition means in Table VII are not cited here**). What it says:

- **Design:** within-subject; four music conditions in a custom game, *Galactic Escape* (Unity; about 120 s per play; rising tension curve from a fixed 30 s timer then a pursuing-ship timer): **None**; **Neutral** (static, ambiguous music that does not change); **Inverse Tension** (music relaxes as game tension rises); **Tension** (music adds dissonant tones, harsh timbres, crowded harmonies and increasingly unbalanced rhythm as game tension rises). Music was adapted with FMOD Studio. Condition order randomized.
- **Participants:** 35 recruited (8 in person, 27 remote), 5 remote participants removed for incomplete data → **N=30**; age 17–54 (mean 28); 12 female; mostly low weekly gaming; recruited from games-music mailing lists, online gaming boards, a sound-design class and Mechanical Turk. Remote participants used their own equipment.
- **Measure:** 13 quantitative self-report slider items (0–1) per condition, from a modified game-enjoyment instrument; the authors state that they added questions and removed others from the original instrument.
- **Results:** omnibus multivariate F(39,231)=1.521, p=.032. Three univariate effects individually significant: soundtrack experience F(3,87)=11.227, p<.001, η²p=.279; soundtrack matching F(3,87)=6.967, p<.001, η²p=.194; **tension F(3,87)=3.662, p=.015, η²p=.112**. Post-hoc t-tests for tension: Neutral vs Inverse Tension p=.048; Neutral vs Tension p=.036. The text does not report a significant tension difference between None and the adaptive conditions or between Inverse and Tension. The text does not describe a multiple-comparison correction. About 25% of responses violated normality; the authors used a standard ANOVA anyway.
- **Descriptive pattern (text, not table cells):** reported tension *fell* when static music was added to no music, and *rose* with adaptive music (including the inverse mapping), more with matched mapping.
- **Authors' interpretation:** adaptivity itself matters more than emotional congruency. Their conclusion states tension-adaptive music amplifies experienced tension "compared to linear or no music"; **the significant tension tests the text reports are against Neutral (static) music only**, so the "or no music" part is not supported by a reported test.
- **Authors' limits:** a custom game; subjective self-report; unknown effect of interaction speed, camera/avatar, listening environment, gaming experience, input device and narrative; biofeedback not used; the tension manipulation is grounded in theory but "not independently confirmed."
- **Relevance and non-relevance to Quackpot:** supports the plausibility that *changing* the music with game state can raise reported tension (small N, short play, self-report). It says nothing about **tune recognition** — neither the music's identity nor repeated hooks were tested. The mapping here was driven by *player-performance-linked* game tension; Quackpot's states are authored story states.
- **Verdict on the T3 snippet claim** ("adaptive raised experienced tension more than linear music; inverse-mapped also raised tension; about 30 participants"): **CONFIRMED in substance with corrections** — N=30 confirmed; adaptive and inverse-mapped both raised tension relative to *Neutral static* music; no reported test against *no music*; effect sizes moderate (η²p=.112 for tension).

## 2. Klimmt, Possler, May, Auge, Wanjek & Wolf, "Effects of soundtrack music on the video game experience," *Media Psychology*

- DOI 10.1080/15213269.2018.1507827; Semantic Scholar lists online publication 20 Aug 2018; volume 22(5) not verified. Read: Semantic Scholar abstract (truncated). Taylor & Francis returned a Cloudflare bot check; the worker stopped.
- Visible: the theory (soundtrack adds to enjoyment through an affective route — intensified emotion — and cognitive routes — spatial presence, identification); Study 1 described as N=68. Results not visible.
- Verdicts: N=68 for Study 1 CONFIRMED (abstract text); N=59, the two game titles, the "shocking music intensified horror" result, and the enjoyment-via-emotion finding CANNOT TELL (abstract gives the affective route as a hypothesis, not a result).

## 3. W3C Web Audio API specification (Working Draft)

Read https://www.w3.org/TR/webaudio/. The page states "This version: https://www.w3.org/TR/2026/WD-webaudio-1.1-20260922/" — a Working Draft, not a Recommendation.

- **a. Context states (section 1.1, BaseAudioContext enum):** `suspended` — context time does not proceed; audio hardware may be powered down or released. `running` — audio is being processed. `closed` — context released; cannot be used. `interrupted` — "currently interrupted and cannot process audio until the interruption ends." `resume()` (section 1.2.3): when state is `suspended` **and the control-thread state is `interrupted`**, the spec queues a task that sets `state` to `interrupted`, sets the state-before-interruption to `running`, fires `statechange`, and rejects the resume promise with `InvalidStateError`. **Verdict on the T4 claim "resume() moves the context to interrupted and rejects": CONFIRMED against this text, with a narrower precondition than T4 stated** (suspended state with an interrupted control thread). The integrator's earlier skepticism is retired.
- **b. AudioParam (section 1.6.2):** `exponentialRampToValueAtTime`: v(t)=V0·(V1/V0)^((t−T0)/(T1−T0)); if V0 and V1 have opposite signs, or V0 is zero, the value stays at V0 over the interval; the spec says an exponential ramp to 0 is not possible and suggests `setTargetAtTime()` as an approximation; after T1 the value holds at V1. `cancelAndHoldAtTime(cancelTime)`: cancels scheduled changes at or after the time and holds the value automation would have had at that time until the next automation event (the multi-step algorithm for ramps and set-target events was not read in full).
- **c. AudioBufferSourceNode (section 1.9.2):** `loopEnd` ≤ 0 or greater than buffer duration → looping ends at the end of the buffer; `loopStart` < 0 → begins at 0; `loopStart` > buffer duration → begins at the end of the buffer.

## 4. MDN and WHATWG

- MDN `BaseAudioContext/state` (last modified 24 Jul 2025): same four values; `suspended` is a pause via `suspend()`; `interrupted` is a pause caused by something outside the web app, where the browser decides when it unpauses. MDN `AudioContext/resume` (last modified 8 Oct 2024): resumes a suspended context; does not mention `interrupted`.
- WHATWG HTML Standard 4.8.11.8 (page updated 26 Oct 2026): when a media element with `loop` reaches the end going forward, playback seeks to the earliest position. This is an HTMLMediaElement rule and **does not describe** Web Audio `AudioBufferSourceNode` looping.

## 5. Chris Wilson, "A tale of two clocks"

https://web.dev/articles/audio-scheduling (only date on page: 2013-01-09, unverified as publication date). Practitioner article, not a spec. Recommends a periodic `setTimeout` that schedules audio events up to the next timer call, with overlap for worst-case main-thread delay; timer callbacks can be late by tens of milliseconds or more. **No fixed lookahead number (such as 0.1 s) appeared in the section read** — the T4 "0.1 s lookahead" figure is from MDN's example code, not a rule.

## 6. Chrome autoplay for Web Audio

developer.chrome.com/blog/autoplay (updated 2017-09-13) and /blog/web-audio-autoplay (updated 2018-11-26): an AudioContext created before a user gesture starts `suspended`; call `resume()` after a gesture. Both pages are old; current Chrome wording **not verified**.

## 7. Not attempted

Safari/WebKit `interrupted` handling and `navigator.audioSession` (browser budget reached).

## Worker's top 3 corrections

1. Plut & Pasquier: abstract confirms a significant tension increase under adaptive music, but not "more than linear" nor ~30 participants nor inverse mapping (the integrator's full-text read in 1b settles these).
2. Klimmt 2019: N=68 for Study 1 only; the rest unverified.
3. Web Audio `resume()`: claim supported by the spec's steps (not wrong); Chrome autoplay pages date from 2017–2018.
