# Task Argon-F4 — Primary composer/developer accounts of theme transformation and gacha/mobile practice

Read `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/common-brief.md` first (ignoring its Haiku/Sonnet delivery amendment: you ARE permitted and required to write `sources.md` and `findings.md` directly into your exclusive folder `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/argon-f4/`).

**Exclusive write scope:**
- `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/argon-f4/sources.md`
- `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/argon-f4/findings.md`

## Objective

Verify the primary composer and developer accounts cited across the three external Prompt B deep-research reports (`chatgpt-research-b.md`, `claude-research-b.md`, `gemini-research-b.md`), especially **gacha/mobile accounts (HOYO-MiX / *Genshin Impact*)** and concrete shipped accounts of **transforming one recurring theme across states** (*NieR: Automata*, *Hades*, *Halo 2*, *Celeste*, *Dead Space*, *Journey*). Verify what is genuinely in the first-person accounts versus what was extrapolated or fabricated (such as unverified crossfade durations), and extract transferable practice without copying any melodies.

## Specific sources and claims to verify

1. **Gacha/mobile primary account — Yu-Peng Chen & Zoe Cai / HOYO-MiX (2020), "Developer Insight #3 — Behind the Music of Genshin Impact"**:
   - Check official URLs (`https://www.hoyolab.com/article/13128`, `https://genshin.hoyoverse.com/en/news/detail/5000`) and reputable transcripts/translations if the SPA page renders dynamically.
   - Verify what Chen and Cai actually state:
     - Testing the main theme first as a bare piano version (V0) to evaluate whether the melody remained listenable on its own and had potential for variation across future arrangements (V1–V4).
     - Diurnal / time-of-day variants (day, dusk, night) of the main/login theme sharing the same melody and tonality while scaling orchestration (full orchestra / Celtic wind lead down to solo piano, tin whistle, or unaccompanied solo female vocal / a cappella at night).
     - Regional re-orchestration (keeping core motifs/orchestral foundation while changing regional instruments).
   - **Critical check on Gemini B's claim:** Did HOYO-MiX actually document "Slow unquantized crossfading (3.0–5.0s) tied to diurnal lighting interpolation" in Developer Insight #3, or did Gemini B invent that numerical parameter?

2. **NieR: Automata — Masami Ueda (2017) & Keiichi Okabe (2018):**
   - **Masami Ueda (2017)**, "Happy Hacking: Music implementation in NieR:Automata," PlatinumGames Official Blog (`https://www.platinumgames.com/official-blog/article/9581`) and Game Developer summary (`https://www.gamedeveloper.com/audio/how-platinum-8-bit-ize-s-i-nier-automata-i-s-music-on-the-fly`): verify how pre-rendered 8-bit tracks and the real-time 8-bit filter (stereo-to-mono, 48-tone band pitch-tracked to sine/square wave) worked, and how the filter smoothed transitions between normal and 8-bit versions.
   - **Keiichi Okabe (2018)**, PlayStation Blog interview (`https://blog.playstation.com/archive/2018/03/07/nier-automatas-composer-keiichi-okabe-reveals-the-secrets-behind-the-action-rpgs-award-winning-soundtrack/`): verify what Okabe says about preserving identity (vocal anchor, parallel Quiet/Medium/Dynamic/8-bit arrangements sharing tempo/bars/chords) and check whether Okabe actually specified "0.5–2.0s" equal-power crossfades (as Gemini B claims) or whether that number is absent from the interview.

3. **Hades — Darren Korb (2020–2026 interviews):**
   - Check *Gameplay* interview (`https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/`), *Vox Groovy* (`https://www.voxgroovy.is/archives/13829`), *ALIBI Music* blog (`https://alibimusic.com/blog/darren-korb-audio-middleware`), and *RPG Site* (2026, `https://www.rpgsite.net/interview/20348-supergiant-games-interview-2026-greg-kasavin-darren-korb-hades-2-ending-music-future-coffee`).
   - Verify Korb's concrete statements on:
     - Deconstructing one piece into up to 8 stems (drum, bass, guitar, lead/pad) plus measure-level section markers (`every measure`) in FMOD.
     - Sequential arrangement progression of the same piece (restrained/chill intro → fuller folk arrangement → hard-rock boss treatment).
     - The "effectiveness bell curve" of reactivity ("only the more noticeable music changes contributed" to players feeling the music was reacting).

4. **Other shipped practice accounts:**
   - **Martin O'Donnell & Jay Weinland (2005)**, "Audio Production for Halo 2" (*Game Developer* GDC report `https://www.gamedeveloper.com/audio/gdc-2005-report-audio-production-for-i-halo-2-i-`): verify "Quantum Music" (short measure loops, variable middles, pad "glue", fading out loops if a player stalls too long).
   - **Lena Raine (2018–2019)** (*Celeste* interviews on Tiny Mix Tapes, Original Sound Version, GameGrooves): verify Badeline's theme as a minor/darkened transformation of Madeline's theme, progressive non-dynamic cues, and anti-repetition loop writing.
   - **Jason Graves (2011)** (*Dead Space 2* Game Informer interview): verify 4–8 streaming stems layered additively by threat proximity.

## Output requirements

Write `sources.md` and `findings.md` in `C:/AI/Quackpot/reports/development/plan-33-recognizable-music-emotional-transformation-research/research/argon-f4/` using ` E-full `, ` E-abs `, ` P `, ` T `, ` H ` labels. Clearly state your observed model/provider setting at the top of `findings.md`.
