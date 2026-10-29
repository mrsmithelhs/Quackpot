# Adaptive Game Music and Theme Transformation: An Evidence Review for a Story-State-Driven Browser Game

The measured evidence only supports a narrow claim: adaptive music has raised players' self-reported tension in one small study. That study is Plut & Pasquier (2019), with N = 30. There is no controlled evidence yet for transforming a single recognizable theme as story circumstances get worse. That idea rests almost entirely on composers' accounts, so treat it as a well-practised craft technique, not a proven effect.

**TL;DR**
- **[E] What has been measured.** In Plut & Pasquier's study (N = 30, within-subjects), music that adapted to game tension raised self-reported tension compared with static music, even when the music moved *opposite* to the game's tension. Enjoyment did not differ significantly. In the free-text answers, players never mentioned that the music was adapting. Across studies, simply *having* music gives a reliable but modest boost to enjoyment and positive feeling, according to two meta-analyses (Caroux & Pujol 2024; Heikkilä et al. 2025 preprint).
- **[P] What composers say.** Composers report reusing one theme in many arrangements to keep it recognizable: Yu-Peng Chen (Genshin Impact), Austin Wintory (Journey), Lena Raine (Celeste), Keiichi Okabe and Masami Ueda (NieR: Automata). Darren Korb (Hades) adds a practical warning: only the "more noticeable" changes made players feel the music was reacting.
- **[H] My recommendation.** For a static web game, 3–4 pre-rendered, loudness-matched arrangements of one tune, switched at bar lines with short equal-power crossfades in the Web Audio API, is cheap and fits the evidence. No middleware is needed. Make each story step *audible*, and don't count on players consciously noticing subtle changes.

---

## 1. Executive summary (≈150 words)

Controlled studies of *adaptive versus linear* game music are scarce and small. The clearest is Plut & Pasquier (IEEE CoG 2019). Thirty participants played a custom game under four music conditions. Adaptive music raised reported tension compared with static music, but enjoyment did not change significantly.\[1\] Larger studies compare music *present versus absent*, not adaptive versus linear. Klimmt et al. (2019, Media Psychology; N = 68 and N = 59) found that music raised enjoyment indirectly, through positive emotion, but not through presence or identification with the character.\[2\]\[3\] Two meta-analyses back a modest general music effect.\[4\]\[5\] I found no controlled study of loop length, repetition tolerance, or whether players notice transitions in commercial-style adaptive scores. Composer accounts describe the techniques consistently: one core theme recast through instrumentation, voice, processing and layered stems, with changes at bar or beat markers. These are statements of intent, not measured audience response. For your game, pre-rendered variants and a small amount of Web Audio scheduling are enough.

---

## 2. Source table

Access codes: **FT** = full text opened by me or my sub-agent; **ABS** = abstract or landing page only; **EXT** = I saw the page's text in a search-result extract but did not open the full page (treat as needing verification); **SEC** = secondary source (journalism, fan wiki, blog).

| Citation | Type | Access | What it shows | Limits |
|---|---|---|---|---|
| Plut, C. & Pasquier, P. (2019). "Music Matters: An empirical study on the effects of adaptive music on experienced and perceived player affect." IEEE CoG. DOI 10.1109/CIG.2019.8847951; author copy: academia.edu/40091439 | [E] peer-reviewed conference paper | FT (author upload, via sub-agent); ABS at caleplut.com/?p=86 | Adaptive music raised reported tension relative to static music; players rated the adaptive soundtrack as matching the game better | N = 30; ~90–120 s per condition; single-item tension rating; mixed in-person and remote listening setups\[1\] |
| Klimmt, C., Possler, D., May, N., Auge, H., Wanjek, L., Wolf, A.-L. (2019). "Effects of soundtrack music on the video game experience." *Media Psychology* 22(5), 689–713. DOI 10.1080/15213269.2018.1507827 | [E] journal article | ABS (Taylor & Francis abstract) | Music present vs absent: indirect effect on enjoyment via positive emotion; increased horror experience; no mediation via presence or identification | Young males only; not adaptive vs linear; one paper cites a different DOI (…2019.1644589), and the T&F page shows …2018.1507827\[3\]\[6\] |
| Caroux, L. & Pujol, M. (2024). "Player Enjoyment in Video Games: A Systematic Review and Meta-analysis of the Effects of Game Design Choices." *IJHCI* 40(16), 4227–4238. DOI 10.1080/10447318.2023.2210880; open copy hal.science/hal-04110722 | [E] systematic review + meta-analysis | EXT (abstract text) | Of the design factors meta-analysed, only music presence significantly affected enjoyment | Presence/absence only; heterogeneous enjoyment measures\[4\] |
| Heikkilä, E., Danso, A., Luck, G. (2025). "The Role of Sound and Music in Video Game-Induced Affect: A Systematic Review & Meta-Analysis." MediArXiv preprint. DOI 10.33767/osf.io/mxrgh_v1 | [E] preprint review + meta-analysis | ABS (IDEAS/RePEc) | 14 studies; 6 meta-analysed on valence: g = 0.409 (95% CI 0.109–0.709) | Not peer-reviewed; too little arousal data to pool; immersion data often lacked statistics\[5\] |
| Hedges, J., Sazdov, R., Johnston, A. (2024). Systematic review of audio's impact on immersive experience in XR and digital games. *J. Audio Eng. Soc.* 72(10). Open copy: opus.lib.uts.edu.au | [E] systematic review | EXT | 92 reports; dominated by VR and headphones; outcomes "mixed" | Mostly spatial audio, not adaptive music\[7\] |
| Gasselseder, H.-P. (2014). "Dynamic music and immersion in the action-adventure: an empirical investigation." Audio Mostly '14. DOI 10.1145/2636879.2636908 | [E] conference paper | EXT (abstract quoted in another listing) | N = 60, *Batman: Arkham City*; dynamic vs two non-dynamic scores; dynamic music affected the "imaginary" aspects of presence | Paper not opened; effect sizes unknown to me\[1\] |
| Korb, D. — interview, "The Sound of Hades," Vox Groovy (n.d.) voxgroovy.is/archives/13829 | [P] composer interview | EXT | Eight simultaneous stems; reactivity has an "effectiveness bell curve" | Interview, no data\[8\] |
| Korb, D. — interview, ALIBI Music blog, alibimusic.com/blog/darren-korb-audio-middleware | [P] composer interview transcript | EXT | Uses FMOD with stem volumes, a low-pass parameter and section markers | Transcript excerpt only\[9\] |
| Ueda, M. (2017). "Happy Hacking: Music implementation in NieR:Automata." PlatinumGames official blog, platinumgames.com/official-blog/article/9581 | [P] official dev blog | EXT | Hacking sections swap to 8-bit versions; describes an automatic 8-bit conversion process | One developer's account\[10\] |
| Okabe, K. (2018). Interview, PlayStation Blog, blog.playstation.com/archive/2018/03/07/… | [P] composer interview | EXT | Used "voices" in each track to keep a consistent NieR identity | Intent only\[11\] |
| Costa, V. — Okabe/Taro/Saito interview, Superjump (originally Nintendo Blast) | [P] composer interview | EXT | Director asked for some kind of "voice" in the music from the start | Translated interview\[12\] |
| Wintory, A. — interview, VGMO, vgmonline.net/austinwintoryinterview | [P] composer interview | EXT | Found the central theme early; the "core DNA" never changed across variations | Intent only\[13\] |
| Wintory, A. — interview, TheSixthAxis (2012) | [P] composer interview | EXT | One main theme; the cello represents the player | Journalism-mediated\[14\] |
| Raine, L. (2018). Interview, Original Sound Version | [P] composer interview | EXT | Badeline's theme written as a minor inversion of Madeline's theme | Intent only\[15\] |
| Raine, L. (2018). Interview, GameGrooves | [P] composer interview | EXT | The "Resurrections" level music "isn't dynamic"; uses progressive cues instead | —\[16\] |
| Chen, Y.-P. / HOYO-MiX — "Developer Insight #3: Behind the Music of Genshin Impact," official site genshin.hoyoverse.com/en/news/detail/5000 | [P] official dev blog | Official page fetched but rendered empty; text seen via EXT and via a fan-wiki transcription (SEC) | Main theme developed through versions V0–V4; day, dusk and night variants | Text verified only through a fan-wiki copy; verify on the official page |
| Chen, Y.-P. — interview, VGMO, vgmonline.net/yu-pengchen | [P] composer interview | EXT | Thinks about how melodies and motives interact | — |
| Graves, J. — interviews: Critical Hit; Game Informer (2011); Kill Screen | [P] composer interviews | EXT | Four "layers of fear" driven by proximity "fear emitters"; four to eight streaming stems on Dead Space 2 | Journalism-mediated |
| Gordon, M. (2017). "DOOM: Behind the Music," GDC Vault gdcvault.com/play/1024068 | [P] conference talk | ABS (session description) | Covers interactive music among other topics | I did not view the video; no transcript |
| Swift, S. "FMOD, an Audio Engine for Video Games, Adapted for Theater," USITT Sound Commission, usitt-sound.org | [T] practitioner case study | EXT | Transitions either immediate or quantized to bar/phrase; a 24-stem, 6-section song; a four-bar transition timeline | Theatre, not games |
| Buffoni, L.-X. (Audiokinetic). "Dynamic Music Creation Using Wwise," mirrored at gamesounddesign.com | [T] middleware vendor tutorial | EXT | Pending transitions resolve at the sync point and are "reverted" if the state changes again | Mirror of a vendor article |
| FMOD Forums threads ("Quantization"; "Transitions with quantization lag one bar behind") qa.fmod.com | [T] user reports | EXT | Users report silence until the next bar, and one-bar lag | Anecdotal |
| Dutta, V. (2020, PhD thesis), "The repetition of video game music, its impact on video game enjoyment, and how best to manage it," Univ. of Huddersfield | [E-qualitative] thesis | EXT | Players were "generally tolerant" of repetition but became overfamiliar | Qualitative interviews; sample size not confirmed |
| Berndt, A. (2012). "Variance in Repetitive Games Music," ICMC | [T] survey of techniques | EXT | Catalogues ways to conceal repetition | No player data\[17\]\[18\] |
| Morisi, M., Superjump/Medium; Pensler, A., "Game Audio Lookout" (Medium); Undertale/Celeste fan wikis; Ensigame; Mubert blog | SEC | EXT | Descriptions of NieR, Undertale, Celeste, DOOM implementations | Secondary; use only as leads |

---

## 3. Findings per question

### Q1. Measured effects

**Plut & Pasquier (2019), IEEE CoG — the only direct adaptive-vs-linear test I could verify. [E]**
- **Participants:** 35 recruited; 5 remote participants removed for incomplete data, leaving **N = 30** (12 female, age 17–54, mean 28). Recruited from game-music mailing lists, gaming forums, an undergraduate sound-design class, and Mechanical Turk. Eight took part in person and the rest remotely.\[1\]
- **Stimulus:** *Galactic Escape*, a custom Unity game with a rising tension curve driven by a pursuing enemy ship. About 90–120 s per playthrough. Music was mapped to game tension through FMOD Studio.\[1\]
- **Conditions (within-subjects, randomized order):**
  - no music
  - neutral (static) music
  - inverse-adaptive music (music gets *less* tense as the game gets more tense)
  - adaptive music (music tension matches game tension)\[1\]
- **Measures:** a 13-item slider survey after each condition, modified from Fang et al. (2010). Tension was a single item.\[1\]
- **Results:** The multivariate effect was significant (F(39, 231) = 1.521, p = .032). Three items were individually significant:
  - tension: F(3, 87) = 3.662, p = .015, ηp² = .112
  - "soundtrack matched my progress": ηp² = .194
  - "soundtrack added to the experience": ηp² = .279\[1\]

  Mean tension scores:

  | Condition | Mean tension |
  |---|---|
  | No music | .55 |
  | Neutral (static) | .49 |
  | Inverse-adaptive | .61 |
  | Adaptive | .62\[1\] |

  Enjoyment, valence and arousal were **not** individually significant.
- **What this means:** The authors conclude that "the adaptivity of the music is more important" than emotional congruency. Note that static music *lowered* tension compared with no music, so the significant tension contrasts are against the neutral condition.\[1\]
- **Transitions (topic d):** The free-text answers "did not contain any discussion of the adaptivity."\[1\] Players' ratings changed, but they didn't comment on the mechanism.
- **Limitations:**
  - small sample
  - very short exposures, so repetition fatigue cannot be tested
  - one tension item
  - uncontrolled remote listening setups
  - no physiological measures
  - no mention of correction for multiple comparisons that I could find

**Klimmt et al. (2019), Media Psychology. [E]**
- **Study 1:** N = 68 young male players, an *Assassin's Creed: Black Flag* episode, original soundtrack present vs absent. Measured enjoyment and the proposed mediators (emotion, spatial presence, identification).\[3\]\[19\]
- **Study 2:** N = 59 young males, *Alien: Isolation*, music present vs absent. Measured horror experience and the same mediators.\[3\]\[19\]
- **Results:** Music had an indirect effect on enjoyment through positive emotions (Study 1) and raised horror experience (Study 2).\[3\]\[19\] The effect was **not** mediated by spatial presence or identification.\[20\]
- **Limitations:** all-male samples; presence vs absence rather than adaptive vs linear; commercial games where the music cannot be separated from the design.
- **For you:** this supports "music matters for enjoyment through emotion." It says nothing about whether *transforming* a theme helps.

**Systematic reviews and meta-analyses. [E]**
- **Caroux & Pujol (2024), IJHCI:** among the game-design factors meta-analysed, only music *presence* significantly affected enjoyment.\[3\] Difficulty and control mode did not.\[21\]
- **Heikkilä, Danso & Luck (2025, preprint):**
  - 14 studies included, 6 pooled
  - sound/music improved affective valence: g = 0.409 (95% CI 0.109–0.709)
  - sensitivity analysis: g = 0.287, I² = 0%
  - 11 of 14 studies at low risk of bias
  - too few studies reported arousal outcomes to pool them\[5\]\[19\]
- **Hedges et al. (2024), JAES:** a review of 92 reports on audio and immersion. Mostly VR and headphones, with "mixed outcomes."\[7\] Not specific to adaptive music.

**Other adaptive-music studies (presence/immersion).**
- **Gasselseder (2014) [E]:** 60 participants, *Batman: Arkham City*, three conditions (dynamic, non-dynamic low-arousal, non-dynamic high-arousal). Dynamic music affected the "imaginary" side of presence; the spatial side responded more to the music's arousal level.\[1\] I did not open this paper, so I can't give effect sizes.
- **Unverified leads:**
  - a VR archery study (N = 22, within-subjects, AI-generated adaptive vs fixed soundtrack) reporting an inverted-U relationship between musical tension and accuracy\[22\]
  - an Unreal MetaSounds "adaptive radio" study (N = 30) with descriptive percentages only\[22\]

  I saw both only as snippets without full citations.
- **Vendor claim, not evidence:** Melodrive's "30% more immersion" figure is company research. An Audiokinetic blog post written by Melodrive describes the experiment behind it: 46 participants, between-subjects, three conditions (no music, a looped ~3-minute linear track, Melodrive's real-time adaptive music) in a VR scene. I could not confirm the "30%" figure itself.

**Noticing transitions (d). [E, thin]**
- Beyond Plut & Pasquier's null qualitative result, the only lead was Simon Cutajar's 2020 Open University PhD thesis, "Automatic Generation of Dynamic Musical Transitions in Computer Games" (oro.open.ac.uk/69192). Its abstract states that "the generated transitions perform as well as crossfading."
- According to its summary, generated transitions were rated about equal to crossfades for immersion, and shorter transitions were perceived as more successful.\[23\]
- This is an unverified lead; I could not open it.

**Repetition fatigue and loop length (e).**
- I found **no controlled study** measuring tolerance as a function of loop length.
- **Vikram Dutta's 2020 University of Huddersfield PhD thesis** (qualitative interviews) reports that players "are generally tolerant of VGM repetition but can become overfamiliar," and come to appreciate a repeated theme's feedback role. The sample size was not confirmed.
- **Berndt (2012)** catalogues techniques for hiding repetition but has no player data.\[18\]
- **Rogers & Weber's survey** ("Audio Habits and Motivations in Video Game Players," Audio Mostly 2019, DOI 10.1145/3356590.3356599; N = 737) found that 56.45% generally listen to the background music in their favourite infrastructure-building game and 39.08% generally do not. The most common reason for turning it off (over 200 mentions) was "I'd rather listen to my own music." I saw only search-result text, not the full paper.
- **Vendor survey, not peer-reviewed:** the "~50% find looped music annoying" figure comes from the Audiokinetic blog post "Players Have Spoken: Video Game Music Must be Adaptive," written by Melodrive. It surveyed 179 people recruited through subreddits and Facebook groups and reports that "approximately 50%" said looped music is annoying.

### Q2. Theme transformation in practice (all [P] unless marked)

- **Genshin Impact (Yu-Peng Chen, HOYO-MiX).**
  - In official HoYoverse materials (text verified only via fan-wiki transcription), Chen says much of the in-game music was "derived from that one tune."\[24\]
  - Technique: one main melody → **day, dusk and night login variants** that "share the same tonality."\[24\] Examples include piano-only, piano plus strings, tin whistle, and an unaccompanied female voice.\[24\]\[25\]
  - Region identity comes from keeping an orchestral base and swapping in regional instruments (for Liyue, Chinese instruments over Western orchestra).\[26\]
  - Identity is preserved through the melody and tonality, while timbre and texture change.
  - I found nothing from Chen about transition timing or repetition.
- **NieR: Automata (Keiichi Okabe; implementation by Masami Ueda).**
  - Okabe used "voices" across tracks to keep the "Nier-ness"; per the Superjump interview, the director asked for voice "from the get-go."\[11\]\[12\]
  - Ueda's official blog: the game swaps between the orchestral track and an 8-bit version during hacking. Where no hand-made 8-bit version existed, an automatic process was used: stereo→mono, a 48-tone (four-octave) band turned into a sine wave and distorted to a square wave, then mixed back with the original.\[10\]
  - Secondary sources describe vocal and non-vocal versions of the same piece, and lyrics of the main vocal theme in multiple languages (Wikipedia; Morisi).\[27\]\[28\]
  - [H] This "same arrangement, different rendering" approach is the closest analogue to your degrading-variant plan.
- **Journey (Austin Wintory).**
  - One central theme, found early and kept: the "core DNA" never changed across variations (VGMO).\[13\]
  - The cello stands for the player throughout (TheSixthAxis).\[14\]
  - Secondary (NME): harps and violas represent other players.\[29\]
- **Celeste (Lena Raine).**
  - Badeline's theme is "literally a minor inversion" of Madeline's theme (OSV interview).\[15\] This is leitmotif transformation used to show a character's darker side.
  - The "Resurrections" level music "isn't dynamic"; it uses progressive cues (GameGrooves).\[16\]
  - Fan sources describe in-level "layers," which I did not verify.\[30\]
- **Hades (Darren Korb).**
  - Most pieces are "eight different stems playing simultaneously in any number of different combinations."\[8\]
  - Reactivity has an "effectiveness bell curve"; "only the more noticeable music changes contributed" to players feeling the music was reacting (Vox Groovy).\[8\]
  - Implemented in FMOD with stem volumes, a low-pass parameter and section markers (ALIBI).\[9\]
  - Laced Records reports stems chosen semi-randomly at the start of a run.\[31\]
  - Secondary: sections switch "at the next appropriate beat marker" (Everything Is Noise).\[32\]
- **Dead Space (Jason Graves).**
  - Four "layers of fear" mixed up automatically as the player nears a proximity "fear emitter" (Critical Hit).\[33\]
  - "Anywhere between four and eight streaming stems" on Dead Space 2 (Game Informer).\[34\]
  - Not theme transformation: Graves says much of the score has no perceivable theme.\[34\] It is the clearest account of a layered tension ramp.
- **Undertale (Toby Fox).**
  - Heavy leitmotif reuse is documented only by fan wikis and analyses, which I treat as SEC.\[35\]\[36\]\[37\]\[38\]
  - The one Fox remark I saw (via wiki) is that much of the music used free soundfonts and synths.\[35\]
  - Secondary: the "Home" theme becomes a music-box version when the lamp is switched off.\[38\]\[39\]
  - I found no first-person Fox account of technique.
- **DOOM 2016 (Mick Gordon):** GDC talk abstract only. Layer breakdowns I saw come from secondary sites (unverified).\[40\]\[41\]
- **Not checked because I ran out of search budget:** BioShock Infinite, Halo (O'Donnell), Silent Hill (Yamaoka).

### Q3. Transition and loop specifics

- **Bar/beat-aligned vs immediate.**
  - [T] Swift (USITT): most transitions were "immediate jumps or quantized to a bar or phrase." A four-bar transition timeline bridged the hardest tempo change. One song used 24 stems across 6 sections.\[42\]
  - [P] Hades: switches at the next beat marker (secondary).\[32\]
  - [T] Wwise: a pending transition resolves at the sync point, and is reverted and rescheduled if the state changes again first.\[43\] This matters if your story state can jump quickly.
- **Crossfade lengths.** I found **no** composer-documented crossfade durations for the named commercial titles. The only figure was a hobbyist Wwise tutorial using 3-second fades (Gerald Clark, Medium) — an unverified convention.\[44\]
- **Loop lengths.** No documented loop lengths for the named titles.
- **Stem/variant counts.**

  | Source | Count |
  |---|---|
  | Hades | 8 stems\[8\] |
  | Dead Space | 4 layers (4–8 stems in DS2) |
  | Genshin login theme | 3 time-of-day variants |
  | NieR: Automata | orchestral/8-bit pairs; vocal/non-vocal variants\[27\] |
  | Swift (theatre) | 24 stems |

- **Reported problems.**
  - FMOD users report silence until the next bar when a track's conditions stop matching, and a one-bar lag with quantization (FMOD Forums).\[45\]\[46\]
  - Korb reports diminishing returns from fine-grained reactivity.\[8\]
  - Graves says he became desensitized while writing and "kept ramping everything up" (Critical Hit).\[33\]

### Q4. Small-team / low-budget patterns
- [P] Celeste shows strong thematic storytelling with *non-dynamic*, progressive cues.\[16\]
- [P] Genshin's day/dusk/night variants are simply separate pre-rendered arrangements of one theme.
- [P] NieR's 8-bit swap pairs two renderings of the same material.\[10\]
- [H] All three can be done with pre-rendered files and no middleware.

---

## 4. Measured vs only claimed

| Claim | Status |
|---|---|
| Adaptive music raises felt tension vs static music | **Measured once** (N = 30, short sessions). Weak but positive.\[1\] |
| Adaptive music increases enjoyment | **Not supported**: non-significant in Plut & Pasquier.\[1\] |
| Music (present vs absent) increases enjoyment/positive affect | **Measured, replicated** (Klimmt; two meta-analyses). Modest effect.\[3\]\[4\]\[5\] |
| Music increases presence/immersion | **Mixed**: Klimmt found no presence mediation; Gasselseder found partial effects; reviews say "mixed."\[1\]\[3\]\[7\] |
| Players notice adaptive transitions | **Not measured directly**; Plut's participants didn't mention adaptivity. Korb *claims* only noticeable changes register.\[1\]\[8\] |
| Theme transformation keeps identity while changing mood | **Only claimed** (Chen, Wintory, Raine, Okabe). No audience study found. |
| Looping causes fatigue / some loop length is "enough" | **Only claimed or qualitative.** No controlled loop-length data found.\[47\] |
| Bar-quantized transitions sound better than immediate ones | **Only claimed** (practice norm). One unverified thesis suggests shorter transitions are rated better.\[23\] |

---

## 5. Patterns: cheap enough for a static browser game vs needing middleware

Good news first: what you're planning — one tune, a few authored story states, changes triggered by *your* script rather than by fast player input — is the easiest kind of adaptive music to build. Because you choose when the state changes, you never face the "state flips twice before the bar line" problem that Wwise has to handle. Everything below is my inference ([H]) based on standard Web Audio API behaviour. Please check the details against MDN's Web Audio API pages, which I did not fetch for this review.

**Pattern A — Pre-rendered full arrangements (recommended starting point).**
- Render 3–4 complete versions of the tune, one per story state (for example: full → thinned → detuned/filtered → sparse/degraded).
- Make every version **exactly the same length and tempo**, and cut each on a bar line, so they can loop and swap at matching positions.
- Implementation:
  1. Create one `AudioContext`.
  2. `fetch` each file and turn it into an `AudioBuffer` with `decodeAudioData`.
  3. For each version, create an `AudioBufferSourceNode` with `loop = true`, connected through its own `GainNode` to the output.
  4. Start **all** of them at the same `context.currentTime + small offset`, with only the current state's gain at 1. They stay sample-locked, which is the browser equivalent of FMOD's synced stems.
  5. To change state, set the gains to fade over 0.5–2 s. Use `setValueAtTime` followed by `linearRampToValueAtTime`, or `setTargetAtTime`. For an equal-power crossfade, ramp the outgoing gain with a cosine-shaped curve and the incoming gain with a sine-shaped curve, so the overall loudness doesn't dip mid-fade.
  6. To land the change on a bar line, compute the time of the next bar boundary (bar length = 60 / BPM × beats per bar, measured from your recorded start time) and schedule the ramp to begin there.
- Cost: 4 files, about 40 lines of JavaScript.

**Pattern B — Stems (vertical layering).**
- Export 3–5 stems of the one tune (e.g. melody, harmony pad, bass, percussion, a "decay" texture), all the same length.
- Start them together and fade layers in or out per state.
- This is Dead Space's and Hades' approach, scaled down.
- Advantages over Pattern A: the melody stem can stay constant, which helps the tune stay recognizable, and the files can be smaller.

**Cheap "degradation" effects done live.**
- A `BiquadFilterNode` low-pass with its frequency lowered step by step (the same idea as Korb's low-pass parameter).\[9\]
- A `WaveShaperNode` for grit.
- Slight detuning through `playbackRate`. Note that `playbackRate` changes pitch *and* tempo together, so if you want tempo steps without a pitch change, pre-render them.

**Things that trip up first-time Web Audio projects:**
- **Autoplay policy:** browsers keep the `AudioContext` suspended until a user gesture. Call `context.resume()` inside your "Start" button's click handler.
- **Gaps at the loop point:** MP3 encoding adds padding, which can cause audible gaps. Use WAV, OGG/Opus, or set `loopStart`/`loopEnd` explicitly. Check Safari's codec support.
- **Memory:** decoded audio is uncompressed in memory. Four 60-second stereo variants at 48 kHz take roughly 4 × 60 × 48,000 × 2 channels × 4 bytes ≈ 92 MB. Keep loops short, or use mono stems.
- **Accessibility:** add a separate music volume control and a mute toggle.

**What genuinely needs middleware (FMOD/Wwise):**
- many simultaneous parameters
- transition matrices between many states
- transition segments, stingers and random variation pools
- rapid player-driven switching

None of these is needed for a handful of authored story states.

**Where I'd question or adjust your plan:**
1. **Make each step clearly audible.** Plut & Pasquier's players registered the effect but didn't comment on it, and Korb says subtle changes stopped reading as reactive.\[1\]\[8\] If the transformation is meant to tell the story, give each state a change the ear can't miss — instrumentation or texture, not just a 2 dB mix shift. You might also mark key moments with a short stinger.
2. **Protect recognizability.** Keep the melodic rhythm and contour (or a constant melody stem) in every variant. Degrade the surroundings first and the melody last. That is what Chen (shared tonality) and Okabe (constant vocal identity) describe.
3. **Loudness-match the variants.** Otherwise "worse" will just sound "quieter," and players may read it as a bug.
4. **Limit the number of states.** Three or four is enough; the evidence doesn't reward granularity.
5. **Plan for repetition in the bleakest state.** Players may spend the longest there. Use a longer loop, or 2–3 alternate takes rotated at bar lines.
6. **Consider an arc, not just a decline.** Composers like Wintory build toward a final restatement.\[29\] Returning to the original or a transformed version of the theme at the end gives the degradation meaning.
7. **Test it.** The evidence base is thin, so a short playtest will tell you more than the literature can. Have a few people play two builds (static vs transforming music) and ask whether they noticed the change and what it meant to them. If you collect anything from your students, follow your school's permission rules.

---

## 6. Top 5 sources to read in full

1. **Plut & Pasquier (2019), "Music Matters"** — the only direct adaptive-vs-static test, and its design is small enough to copy.
2. **Klimmt et al. (2019), Media Psychology** — the best-designed music-presence study, and the reason to separate emotion from presence.
3. **Heikkilä, Danso & Luck (2025), MediArXiv preprint** — the current state of the field and its measurement gaps.
4. **Masami Ueda (2017), PlatinumGames blog "Happy Hacking"** — a concrete, first-person implementation of rendering one track two ways.
5. **Darren Korb interviews (Vox Groovy; ALIBI)** — practical stem counts, the "bell curve" warning, and an FMOD workflow from a very small team.

---

## 7. What I searched for and could not find

- **Gacha/mobile composer accounts on transitions and repetition.** HOYO-MiX materials cover *theme development and instrumentation* but say nothing I could find about loop lengths, crossfades, or how long players listen in hub areas. I found no first-person accounts from composers of other gacha games (e.g. Honkai: Star Rail, Arknights, Fate/Grand Order). My Honkai: Star Rail search ran out of budget. A fan account claims Chen is credited on a later Genshin regional theme because his motifs were reused; that is unverified.\[48\]
- **Controlled loop-length or repetition-tolerance studies.** None found.
- **Measured transition noticeability for commercial-style adaptive scores.** Only one unverified thesis lead.
- **Documented crossfade durations and loop lengths from shipped titles** (Hades, Dead Space, DOOM, NieR). Not found in first-person sources.
- **Toby Fox, first-person, on leitmotif technique.** Not found; only fan wikis.
- **Mick Gordon's GDC talk transcript.** I saw only the Vault abstract.\[41\]
- **BioShock Infinite, Halo (O'Donnell), Silent Hill (Yamaoka).** Not reached within my search budget, so no claims are made about them.

## Sources

1. [Music Matters: An empirical study on the effects of adaptive music on experienced and perceived player affect](https://www.academia.edu/40091439/Music_Matters_An_empirical_study_on_the_effects_of_adaptive_music_on_experienced_and_perceived_player_affect)
2. [Effects of soundtrack music on the video game experience: Media Psychology: Vol 22, No 5](https://www.tandfonline.com/doi/abs/10.1080/15213269.2018.1507827)
3. [Effects of soundtrack music on the video game experience | Semantic Scholar](https://www.semanticscholar.org/paper/Effects-of-soundtrack-music-on-the-video-game-Klimmt-Possler/bd80d0a58b36e7f521883c69cec8674fce0be775)
4. [(PDF) Player Enjoyment in Video Games: A Systematic Review and Meta-analysis of the Effects of Game Design Choices](https://www.researchgate.net/publication/371128231_Player_Enjoyment_in_Video_Games_A_Systematic_Review_and_Meta-analysis_of_the_Effects_of_Game_Design_Choices)
5. [The Role of Sound and Music in Video Game-Induced Affect: A](https://ideas.repec.org/p/osf/mediar/mxrgh_v1.html)
6. [Applying Video Game Satisfaction Elements to Cinematic Audio-Visuals: A Cross-Disciplinary Analysis through Ludomusicology, Diegesis and Flow Theory - İletişim Kuram ve Araştırma Dergisi](https://dergipark.org.tr/en/pub/ikad/article/1669165)
7. [Audio's Impact on Immersive Experience in Extended ...](https://opus.lib.uts.edu.au/rest/bitstreams/e42813c0-d987-4d9f-9a28-e0ece2c41daa/retrieve)
8. [The Sound of Hades – Vox Groovy](https://www.voxgroovy.is/archives/13829)
9. [Darren Korb’s Experience Working with Audio Middleware](https://alibimusic.com/blog/darren-korb-audio-middleware)
10. [Happy Hacking: Music implementation in NieR:Automata - PlatinumGames Official BlogPlatinumGames Official Blog](https://www.platinumgames.com/official-blog/article/9581)
11. [Nier: Automata’s composer Keiichi Okabe reveals the secrets behind the action RPG’s award-winning soundtrack](https://blog.playstation.com/archive/2018/03/07/nier-automatas-composer-keiichi-okabe-reveals-the-secrets-behind-the-action-rpgs-award-winning-soundtrack)
12. [NieR: Automata - An Interview with Yoko Taro, Yosuke Saito, and Keiichi Okabe | SUPERJUMP](https://www.superjumpmagazine.com/nier-automata-switch-interview-with-yoko-taro-yosuke-saito-and-keiichi-okabe/)
13. [Austin Wintory Interview: Closing an Incredible Year - VGMO - Video Game Music Online](https://vgmonline.net/austinwintoryinterview/)
14. [Interview: Composer Austin Wintory On Journey | TheSixthAxis](https://www.thesixthaxis.com/2012/03/15/interview-journey-composer-austin-wintory/)
15. [Original Sound Version INTERVIEW: Composer Lena Raine talks Celeste Soundtrack & working in Game Audio - Original Sound Version](https://www.originalsoundversion.com/interview-composer-lena-raine-talks-celeste-soundtrack-working-in-game-audio/)
16. [Prescription for Sleep - Celeste: An Interview with Jayson Napolitano and Lena Raine — GameGrooves](https://gamegrooves.com/gazette/2018/10/25/prescription-for-sleep-celeste-an-interview-with-jayson-napolitano-and-lena-raine)
17. [VARIANCE IN REPETITIVE GAMES MUSIC Axel Berndt](https://imld.de/cnt/uploads/2012/12/2012-ICMC-VarianceInRepetitiveGamesMusic.pdf)
18. [(PDF) A Survey of Variation Techniques for Repetitive Games Music](https://www.researchgate.net/publication/235663994_A_Survey_of_Variation_Techniques_for_Repetitive_Games_Music)
19. [Effects of soundtrack music on the video game experience | Request PDF](https://www.researchgate.net/publication/327132755_Effects_of_soundtrack_music_on_the_video_game_experience)
20. [Effects of soundtrack music on the video game experience: Media Psychology: Vol 22 , No 5 - Get Access](https://www.tandfonline.com/doi/full/10.1080/15213269.2018.1507827)
21. [Player Enjoyment in Video Games: A Systematic Review and Meta-analysis of the Effects of Game Design Choices: International Journal of Human–Computer Interaction: Vol 40 , No 16 - Get Access](https://www.tandfonline.com/doi/full/10.1080/10447318.2023.2210880)
22. [(PDF) Music Matters: An empirical study on the effects of adaptive music on experienced and perceived player affect](https://www.researchgate.net/publication/336097325_Music_Matters_An_empirical_study_on_the_effects_of_adaptive_music_on_experienced_and_perceived_player_affect)
23. [(PDF) Automatic Generation of Dynamic Musical Transitions in Computer Games](https://academia.edu/42027672)
24. [The Wind and The Star Traveler/Background | Genshin Impact Wiki | Fandom](https://genshin-impact.fandom.com/wiki/The_Wind_and_The_Star_Traveler/Background)
25. [Developer Insight #3 - Behind the Music of Genshin Impact (1)](https://genshin.hoyoverse.com/en/news/detail/5000)
26. [Soundtrack/Background | Genshin Impact Wiki | Fandom](https://genshin-impact.fandom.com/wiki/Soundtrack/Background)
27. [The Ingenuity of Nier’s Music. How Keiichi Okabe’s remarkable scores… | by Michael Morisi | SUPERJUMP | Medium](https://medium.com/super-jump/the-ingenuity-of-niers-music-8c2e009786f1)
28. [Music of Nier - Wikipedia](https://en.wikipedia.org/wiki/Music_of_Nier)
29. ['Journey' turns 10: Austin Wintory has found a way for you ...](https://www.nme.com/features/journey-anniversary-austin-wintory-traveler-soundtrack-3181421)
30. [Enhancing Gameplay with Music in Celeste | by Alexander Pensler | Game Audio Lookout | Medium](https://medium.com/game-audio-lookout/enhancing-gameplay-with-music-in-celeste-5da210bbc602)
31. [How Rock Band influenced Hades' soundtrack – Laced Records](https://www.lacedrecords.com/blogs/blog/how-rock-band-influenced-hades-soundtrack)
32. [SOUND TEST: Darren Korb and Supergiant Games - Everything Is Noise](https://everythingisnoise.net/features/sound-test-darren-korb-and-supergiant-games/)
33. [The sound of horror – How Jason Graves created a new universe of audio terror for video games](https://www.criticalhit.net/gaming/the-sound-of-horror-how-jason-graves-created-a-new-universe-of-audio-terror-for-video-games/)
34. [Dead Space Composer Jason Graves Explains The Unsettling Score - Game Informer](https://gameinformer.com/b/features/archive/2011/01/23/dead-space-interview-composer-jason-graves.aspx)
35. [Leitmotifs | Undertale Wiki | Fandom](https://undertale.fandom.com/wiki/Leitmotifs)
36. [Leitmotifs - The Undertale Wiki](https://undertale.wiki/w/Leitmotifs)
37. [On the Origins of Undertale and Deltarune's Leitmotifs](https://jcoxeye.github.io/leitmotif-index/analysis/leitmotif-origins.html)
38. [Toby Fox - UNDERTALE Soundtrack review by finnaboing - Album of The Year](https://www.albumoftheyear.org/user/finnaboing/album/56048-undertale-soundtrack/)
39. [Coherent Situational Music in Undertale | by Alexander Pensler | Game Audio Lookout | Medium](https://medium.com/game-audio-lookout/coherent-situational-music-in-undertale-e9d682c366ff)
40. [Adaptive Music in DOOM: Secrets of Mick Gordon's Soundtrack and Its Impact on the Game - Ensigame](https://ensigame.com/articles/gaming/secrets-of-dooms-music-mick-gordons-adaptive-soundtrack-and-its-impact-on-gameplay-2)
41. [GDC Vault - 'DOOM': Behind the Music](https://www.gdcvault.com/play/1024068/-DOOM-Behind-the)
42. [FMOD, an Audio Engine for Video Games, Adapted for Theater Stephen Swift](https://www.usitt-sound.org/wp-content/uploads/2020/09/FMOD_Adapted_for_Theater.pdf)
43. [Dynamic Music Creation Using Wwise Part 4 | gamesounddesign.com](http://gamesounddesign.com/in-depth-creation-of-dynamic-music-in-a-video-game-page-four.html)
44. [Space Shooter: Adaptive Music with Wwise and Unity | by Gerald Clark | Medium](https://geraldclarkaudio.medium.com/space-shooter-adaptive-music-with-wwise-and-unity-5d7e95d0af56)
45. [Quantization - FMOD Studio - FMOD Forums](https://qa.fmod.com/t/quantization/12637)
46. [Transitions with quantization lag one bar behind - FMOD Studio - FMOD Forums](https://qa.fmod.com/t/transitions-with-quantization-lag-one-bar-behind/17837)
47. [Thesis Or Dissertation | The repetition of video game music, its impact on video game enjoyment, and how best to manage it | ID: 824768 | Hyku](https://ethos.bl.uk/concern/thesis_or_dissertations/824768)
48. [Daily Genshin Impact Music on X: "In a shocking turn of events, the Snezhnaya main theme is the first regional theme featuring more than one Hoyo-Mix member: Peijia You, Deer Suo, Caroline Luo, and Yang Lee. Yu-Peng Chen is credited due to the utilization of motifs he wrote prior to his departure." / X](https://x.com/genshin_music/status/2083407556626596297)
