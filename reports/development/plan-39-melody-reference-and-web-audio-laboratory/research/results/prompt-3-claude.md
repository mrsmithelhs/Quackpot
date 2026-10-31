# Preserving a 10-Note Motif Through Suno Cover/Extend and Gemini/Lyria: What the Evidence Actually Supports (October 2026)

Suno Cover is the only consumer route here with a documented "keep the melody" promise, but no one has published a measured link between Suno's Audio Influence slider and pitch retention. Your Gemini failures come from how the product is built, not your prompt: the consumer Gemini music tool documents image/video attachments, not audio, so your WAV almost certainly never reached Lyria as an audio condition.\[1\] If the 10 notes must be exactly right, the most reliable plan is a hybrid: let Suno (or Flow Music) build the arrangement around a long, pre-structured reference, then lay your exact motif over the result in a DAW and check it with a pitch-contour test.

## TL;DR
- **Suno Cover mechanics aren't public.** Suno has only said it uses an autoregressive transformer over a learned audio tokenization.\[2\]\[3\] Audio Influence has no published response curve. The best practitioner log (100+ ear-judged generations) found that melody and structure were lost at ≤20% and kept "just like the original" at ~70%. The UI flags 0–14% and 86–100% as "danger zones."\[4\] The 25% default is too low for strict melody retention.\[5\]
- **Gemini chat almost certainly reduces your WAV to text.** Google's help page lists only "images or videos" as optional inputs for Create music.\[1\] Third-party analysis describes the app converting media to text before Lyria.\[6\] The Lyria 3/3.5 model cards describe text-conditioned latent diffusion.\[7\]\[8\] Google's audio-reference route is Flow Music (Add Audio / Cover / Extend / Replace), not the Gemini chat.\[9\]
- **Recommended path:** a dry, monophonic, harmonically clean lead (piano-like or soft triangle/square, not bell) as an 8–16-bar structured reference (19.32 s or longer, not 9.72 s). Suno v6 Cover with Audio Influence ~65–80%, Weirdness ~15–30, Variety 0, Max Mode on for keepers, and a prompt that describes the band, not the hook. Score each output by pitch-contour comparison. Keep a DAW overlay (or Suno Studio 2.0 MIDI-as-prompt) as the fallback that guarantees the notes.

## Key Findings

| Question | Answer | Evidence tier |
|---|---|---|
| How Cover extracts melody | Undisclosed. Suno says only that it models audio as tokens with an autoregressive transformer.\[2\] | Official (CEO interviews); mechanism unknown |
| Audio Influence vs. pitch retention curve | No quantitative data exists anywhere | Null result (verified by dedicated search) |
| Where melody survives | ~60–84% Audio Influence; lost at ≤20% | Anecdotal but systematic (one creator, 100+ gens) |
| Artifacts at high influence | UI flags 86–100% red; high influence carries source flaws through\[10\] | Anecdotal / practitioner guidance |
| Best input timbre | No controlled test; clean single line preferred over full mix\[11\] | Practitioner assertion + signal-processing inference |
| 9.72 s vs 19.32 s | No test exists; longer, structured reference favored | Inference + practitioner guidance |
| Gemini WAV → Lyria audio conditioning? | Not documented; almost certainly no\[1\]\[6\] | Official docs (absence) + third-party analysis |
| Published Suno cover melody accuracy | Suno V5 Melody MAE 1.87 semitones (competitor paper) | Academic, competitor-authored |

## Details

### 1. Suno "Cover" mechanics: what is documented vs. inferred

**Documented (official).** Suno introduced Covers in September 2024.\[12\] It describes Cover as taking "anything from a simple voice memo to a fully-produced track" into "an entirely new style, all while preserving the original melody."\[13\] The help center says it transforms style "while keeping the melody."\[14\] Suno also warns the beta "might return the original clip without adapting it to a new style."\[13\] Uploads must be between 6 seconds and your plan's maximum. The original announcement said "between 6 - 60 seconds."\[15\] The current help page allows 60 s on Basic and up to 8 minutes on Pro/Premier,\[16\] which confirms your 6.00 s gate.\[16\]\[17\] The Creative Sliders page documents only that Weirdness runs "Safe to Chaos, where 50% is the 'normal' expected result," that Style Influence runs "Loose to Strong," and that an audio upload adds a third Audio Influence slider.\[18\]\[19\] No numeric semantics are published.

**Current version context (date-sensitive).** Suno shipped the v6 family (v6, v6-wild, v6-mini) on September 9, 2026, and its FAQ states "All models prior to v6 have been retired."\[17\]\[20\] Any v4.5/v5-era slider advice is therefore historical. v6 added two controls that matter for you:
- **Variety** is "designed to introduce variety in your outputs by adjusting and updating your style prompts." Setting it to 0 retains full control of your tags.\[19\]\[21\] At any setting above Off, Suno is effectively rewriting your prompt, which is a hidden source of style drift.\[20\]
- **Max Mode** is a compute toggle. Suno recommends it for, among other things, "covers where you want the result to stay close to the original."\[19\]\[22\]

**Architecture (official, high-level only).** CEO Mikey Shulman told Peter Yang's Creator Economy interview that "We also use transformers and our edge is figuring out how to tokenize audio correctly… we create a discrete representation for small bits of audio. The model doesn't know about instruments, musical tones, or voices," noting that audio is "a continuous signal sampled about 50,000x per second." He has also described modelling the raw 48 kHz waveform without encoding the 12-tone scale.\[23\] He described choosing autoregression over diffusion, noting that autoregression "figures it out bit by bit."\[3\]\[23\] A "~50 tokens/sec" figure appears only in the Today in AI newsletter ("Suno compresses it into a smarter, discrete representation (~50 tokens/sec)"), which cites no primary source; treat it as unverified.

**What this implies (inference, not fact).** Suno does not appear to run an explicit pitch tracker the way MusicGen-Melody does. MusicGen extracts an argmax-quantized chromagram with a 2^14-sample window, deliberately "omit[ting] the drums and bass," and conditions on it.\[24\] In Suno, the uploaded audio is most plausibly tokenized and used as a conditioning/prefix signal that the generator re-performs, with Audio Influence weighting it. Two consequences follow:
1. Suno can inherit more than melody: groove, structure and arrangement. Practitioners report exactly this. One found the source drums' groove dominated "regardless of the value."\[4\] Another notes "Cover inherits the arrangement and structure it came from."\[5\]
2. Fidelity is statistical, not guaranteed. Even at 100%, one tester reports the cover "follows the original's arrangement more closely. Not identically — that part you can't avoid."\[5\]

**Audio Influence empirical relationship (null result, plus best anecdote).** A dedicated search found **no quantitative or controlled test** of melody retention against Audio Influence. The most systematic log is Daisuke Kurosawa's (note.com, 17 Nov 2025, Suno v4.5, 100+ generations, ear-judged):\[4\]
- At 20%: the model "skipped the sequential… melody section… and went straight to the chorus-like melody."\[4\]
- At 10% (with "BPM135, smooth jazz, sax / Weirdness 40% / Style Influence 80%"): "definitely not a cover."
- Summary of low settings: "if you lower the Audio Influence, the structure and melody of the original song will be ignored."\[4\]
- At 70% (Weirdness 15, Style 30): "the structure up to the chorus is perfect, just like the original. However, it lacks excitement."\[4\]
- At 84%: "This might be pretty good."\[4\]
- The UI turns values of 0–14% and 86–100% red, which he reads as "danger zones."\[4\]
- His final recipe: Weirdness 50 / Style 80 / Audio 60.\[4\]

Other practitioners:
- One reports the panel opens at "Weirdness 50% / Style Influence 50% / Audio Influence 25%" and has "settled on 50%."\[5\]
- The unofficial sunnoai.com "Suno AI Audio Inputs" guide advises: "Start at 55%. Raise it toward 80% when the melody or performance must survive; drop it toward 30% when the clip is only setting a mood."

**On your 50/75/90 question:** treat 50% as likely insufficient for a strict 10-note hook, 75% as the most probable sweet spot, and 90% as inside the flagged risk band. That is directional, not measured.

**Artifacts / "noise bleeding" threshold.** No measured threshold exists. Practitioner guidance consistently says higher influence "may preserve useful timing as well as flaws in the source."\[10\] It advises lowering Audio Influence by about 10 points or cleaning the source when noise or timing flaws surface.\[25\] With a synthesized, noise-free reference this risk is lower. The more likely failure at 90%+ is a "slightly-processed version of your recording" that is under-arranged, rather than noise.\[19\]

**The only published melody-accuracy numbers for Suno covers come from competitor-authored papers.**
- **Qwen-Music (arXiv 2607.11699, Sept 2026, Alibaba):** reports DTW-aligned Melody MAE of 1.87 semitones for Suno V5 vs 1.48 for its own system.\[26\] This was on AI-generated references only,\[27\] with Suno slider settings unreported. In blind A/B listening the split was 50.3% vs 49.7% against Suno V5.5.\[26\]
- **MuLaCover (arXiv 2610.26684, Oct 2026):** reports performance "on par with… Suno-v5.5."\[28\]

A mean error near 2 semitones means individual notes in a short motif can easily land on wrong scale degrees. That is why per-output verification matters.

### 2. Cover vs. Extend for your use case

- **Extend** keeps your uploaded audio verbatim up to the chosen timestamp and generates a continuation.\[29\]\[30\] Suno re-infers style, tempo and character from audio near the extend point.\[17\] The continuation is not obliged to restate your motif. Use Extend when you want your exact recording to remain audible as the intro or first statement. Do not rely on it to repeat the hook faithfully later.
- **Cover** regenerates all audio ("a re-recording, not a remix") while targeting the source melody and structure.\[31\] The output is generally the same length and shape as the source.\[29\] A 9.72 s upload therefore yields roughly a 10 s cover, not a background cue. For background music, the length and structure of the cue must be built into the reference.

### 3. Reference pre-processing and stem choice

**Timbre (no controlled test exists; reasoned recommendation).**
- **(a) Dry monophonic synth.** Best candidate, with a caveat about which waveform. A pure sine has almost no harmonics and can be weakly represented by codec-style tokenizers. A triangle or soft square has a clear fundamental plus harmonics and sharp onsets, which gives both pitch and rhythm cues. Keep it dry: practitioners report that reverb and heavy processing "bake into the analysis."\[29\]
- **(b) Piano: good. Bell: avoid.** One guide asserts "A piano, guide vocal or simple instrumental line is easier to interpret than a crowded full mix."\[32\] Bells, glockenspiel and other mallets have strong inharmonic partials that can produce octave or pitch-class confusion in pitch estimators. That is a signal-processing inference, not a Suno-specific test.
- **(c) Full mix: worst for strict melody.** Drums and arrangement are inherited as strongly as melody (Kurosawa's drum-groove finding).\[4\] MusicGen's designers strip drums and bass precisely to isolate melody.\[24\] An optional middle ground worth A/B-testing is the lead plus a very quiet sustained D-major root/pad (no drums). It anchors key and harmony without supplying a groove to copy.

**Duration.** Your timing math is correct: 100 BPM gives 0.6 s per beat and 2.4 s per bar. Four bars plus the 0.12 s tail is 9.72 s; eight bars plus the tail is 19.32 s. No test compares 9.72 s and 19.32 s. The weight of practitioner guidance favors longer, focused clips: "Thirty seconds is enough," and 20–40 s for hummed melodies.\[29\]\[33\] A 9.72 s file passes the gate, but it gives Cover only four bars of content and a ~10 s output. Recommendation: build a 16-bar reference (38.52 s with tail) structured as A A A' A, with the exact motif four times, or eight times if you want the hook constant. This gives the model repeated evidence of the same contour, gives Cover a cue-length structure to inherit, and keeps "one idea per clip."\[29\] Also:
- Trim leading silence ("Silence at the front reads as an intro").\[29\]
- Start exactly on the downbeat.
- Keep the 0.12 s tail, or end on a held tonic so the final bar doesn't read as truncated.

**Upload screening.** Suno blocks uploads matching existing works,\[15\] and aimusickit.com's 2026 guide to the "Uploaded audio matches existing work of art" error reports that "Pure humming, a capella sketches, public-domain text — these get caught too, because the fingerprint database is conservative." A short, common-sounding diatonic hook could occasionally trigger this. If it does, vary the timbre or add the pad layer.

### 4. Prompt competition and style drift

**Mechanism (general theory; Suno specifics undisclosed).** In conditional music models, text and audio conditions are typically injected via cross-attention, prefix tokens or concatenation. Relative influence is set at sampling time by guidance. MusicGen trains with conditions dropped 20% of the time to enable classifier-free guidance.\[24\] Meta's style-conditioning work uses a "Double Classifier Free Guidance" with separate weights (α=3, β=6) to "mix textual and style conditions that are not aligned."\[34\] The general lesson is that when text and audio disagree, the stronger-weighted condition wins. Your "prompt overpowers audio" drift is the expected behavior when style text pulls toward a different melody prior.\[29\] Suno's Style Influence and Audio Influence plausibly act as weights of this kind. An unofficial third-party API exposes `styleWeight` and `audioWeight` on 0–1 scales,\[35\] but Suno has not documented the internals.\[35\]

**Prompt rules that follow from this:**
1. **Describe the band, not the hook.** Never describe the melody in words; text descriptions of melody compete with the audio. Practitioners put it as "The recording is the hook. The style field is for everything around it."\[19\]\[33\]
2. **Lock the musical frame:** `instrumental, 100 BPM, 4/4, D major`. Explicit tempo and key reduce the model's freedom to re-harmonize or re-time.
3. **One dominant genre plus one modifier.** For example, "cozy playful video game music, light pizzicato strings and marimba accompaniment, soft brushed percussion, warm felt piano bass." Avoid mashups.\[36\]
4. **Assign the lead role.** For example, "lead melody played by a soft flute/celesta, clearly featured, accompaniment stays underneath." Otherwise the arrangement may bury or re-voice the hook.\[29\]
5. **Use the Exclude field** (Suno's negative control) for drift vectors: `vocals, choir, lead guitar solo, key change, modulation, tempo change, minor key, dubstep drops`.
6. **Variety 0** while calibrating, so Suno doesn't rewrite your tags.\[19\]
7. **Change one slider per run.** Every reputable guide agrees that changing several controls at once makes the results uninterpretable.\[10\]\[29\]\[33\]\[37\]

### 5. Gemini / Lyria: what happens to an attached WAV

- **Consumer Gemini "Create music"** (Lyria 3 launched Feb 18, 2026;\[38\] Lyria 3 Pro Mar 25, 2026; the overview page now advertises Lyria 3.5).\[39\]\[40\]\[41\] Google's help page lists the steps as Upload & tools → Create music → "(Optional) Upload images or videos for added context."\[1\] Audio is not a documented input.\[1\]\[41\] Google's launch post says you can "ask Gemini to take inspiration from something you upload."\[42\] DeepLearning.AI's *The Batch* describes the app as accepting images and videos, "convert[ing] them to text, and pass[ing] to Lyria 3."\[6\]
- **Lyria models.** The Lyria 3 and 3.5 model cards describe "latent diffusion, applied to temporal audio latents" synthesizing audio "from a text prompt."\[7\]\[8\] The Gemini API documents text and image inputs only. It notes that Lyria 3.5 "uses a prompt rewriter internally" and that "Music generation is a single-turn process."\[43\]
- **Conclusion.** The documented pipeline offers no audio conditioning adapter for a chat attachment. The most probable path is that the Gemini LLM (current-generation, not 1.5/2.0) "listens" to your WAV, summarizes it in text, and Lyria generates from that text. A 10-note pitch sequence cannot survive that text bottleneck, which matches your result: pleasant tracks, wrong melody. Google has not published the internal routing, so this is a well-supported inference, not a confirmed trace.
- **Google's real audio-reference surface is Flow Music** (formerly ProducerAI/Riffusion, running Lyria 3.5 since July 29, 2026).\[44\]\[45\] Its help center documents "Add Recording" and "Add Audio" references plus Remix → Extend, Cover and Replace on selected sections.\[9\] How Flow conditions on audio is undocumented, and the model card still lists text input.\[46\] Treat it as a candidate to A/B against Suno, not a guaranteed fix.
- **Lyria RealTime** (API) steers with weighted text prompts. It has no documented melody-audio conditioning.\[47\]

## Recommendations

**A. Prepare the reference (do this first)**
1. Render the motif from MIDI at 100 BPM in D major. Use a dry, mono-compatible lead: a soft triangle/square with short attack, or a dry piano. No reverb, no delay, no bell or mallet timbres.
2. Build a 16-bar file: motif ×8, or A A A' A with an exact motif. Start on the downbeat with zero leading silence and end with a 0.12 s tail or a held D. Export WAV at 44.1/48 kHz, peak about −1 dBFS.
3. Make variant B, the same lead plus a quiet sustained D-major pad/root note (no drums), for the timbre test. Keep your 9.72 s file as variant C to test the length hypothesis directly.

**B. Suno v6 settings (starting points, not official presets)**
- Model: v6 (not v6-wild).
- Mode: Cover, Instrumental on.
- Audio Influence 70%, then test 60/70/80. Avoid the 25% default.
- Style Influence 50–60.
- Weirdness 15–30.
- Variety 0 (Off).
- Max Mode on only for candidate keepers. It costs 2× credits.\[20\]
- Style prompt: `instrumental cozy playful video game music, 100 BPM, 4/4, D major, featured lead melody on soft flute and celesta, gentle pizzicato strings, marimba, warm round bass, light brushed percussion, bright and warm mix`.
- Exclude: `vocals, choir, key change, modulation, tempo change, minor key, guitar solo, heavy drums`.
- Use **Extend** only when you want your literal recording as the opening statement. Extend from the end of bar 16, with the same prompt.

**C. A/B test protocol (to measure melodic retention)**
1. **Conditions:** reference variant (A/B/C) × Audio Influence (60/70/80). Run 3 generations (6 clips) per cell, since Suno exposes no seed.\[36\] Hold the prompt, model and other sliders fixed.
2. **Pre-process outputs:** source-separate (e.g., Demucs) to remove drums and bass, isolating the "other"/melody stem. Verify tempo (100 ± 1 BPM) and key (D major) first; a transposed or re-timed output fails immediately.
3. **Extract the melody:** run an f0 tracker (pYIN/CREPE) or a note transcriber (e.g., Basic Pitch) on the reference and the output stem. Convert to MIDI-semitone contours.
4. **Metrics:**
   - Note-level: did all 10 notes appear in the correct order and pitch class, with onsets within ±50 ms of the grid? Score ×/10 per motif instance.
   - DTW-aligned Melody MAE in semitones (Qwen-Music's metric; for reference, Suno V5 measured 1.87).\[26\] Target < 0.5.
   - Chroma cosine similarity per frame (MusicGen's melody-adherence metric).\[48\]
   - A listening check for artifacts, scored separately from similarity.
5. **Decision rule:** pick the cell with the highest median note score. Break ties by MAE, then by arrangement quality. Then confirm with Max Mode on.

**D. Alternative workflows (likely more reliable than any slider)**
- **Overlay (guaranteed fidelity):** generate the arrangement in Suno at 100 BPM / D major (from your reference, or text-only). Then mute or duck the generated lead via stems and place your exact MIDI-rendered motif on top in a DAW. For game music this is often the professional choice.
- **Suno Studio 2.0 (Premier, Aug 13, 2026):** import your motif as MIDI.\[49\] Suno says "MIDI clips can also be used as a prompt for new audio generations," and you can build other tracks around it while your MIDI notes stay exact.\[50\]\[51\]\[52\] Note that Studio requires Chrome for Web MIDI and is Premier-only.\[53\]\[54\]
- **Flow Music** (Add Audio + Cover) as a second engine in the same A/B protocol.
- **Open models** for deterministic melody conditioning: MusicGen-Melody conditions explicitly on chroma, at lower fidelity and under a non-commercial weights license.\[48\]\[55\]

## Caveats
- Suno is proprietary. Every statement about how Cover conditions internally is inference from CEO interviews and analogous open models.\[56\]
- The slider findings come from one systematic but ear-judged creator log, run on v4.5, which is now retired. v6 may respond differently, and MusicRadar (Sept 17, 2026) quoted an r/SunoAI user calling v6 output "muffled, dull and strangely lifeless… the high end feels almost completely gone."
- The quantitative Suno-cover numbers come from competitor-authored papers that used AI-generated references and unreported slider settings.\[27\]
- No source tests timbre or length effects. The 16-bar and timbre recommendations are reasoned hypotheses for you to validate with the protocol above.
- Gemini's internal routing for attachments is not published. The "text bottleneck" conclusion rests on documented inputs and third-party analysis.
- Product names, slider ranges, plan gating and upload limits changed repeatedly in 2026. Re-check the in-app UI before relying on any value.

## Sources

1. [Generate music with Gemini Apps - Computer - Gemini Apps Help](https://support.google.com/gemini/answer/16901237)
2. [Inside Suno, the AI Music App You Won't Be Able to Stop Listening To | Mikey Shulman (Suno)](https://creatoreconomy.so/p/inside-suno-the-ai-music-app-you-wont-stop-listening-to-product)
3. [How to Build AI That Creates Music, with Suno CEO, Mikey Shulman | Barrchives | Amplify Partners](https://www.amplifypartners.com/barrchives/how-suno-builds-ai-models-for-musicians)
4. [Researching how to create cover arrangements of existing songs using AI composition (SUNO)｜黒沢ダイスケ](https://note.com/kuro_96chang/n/n441ec5b882fc?hl=en)
5. [SUNO Cover — Keep the Melody, Change the Style – B'Mush](https://bmushsoftmusic.com/suno-cover/)
6. [Google Debuted Lyria 3, An App That Turns Text or Images Into 30-Second Songs](https://www.deeplearning.ai/the-batch/google-debuted-lyria-3-an-app-that-turns-text-or-images-into-30-second-songs)
7. [Lyria 3 - Model Card — Google DeepMind](https://deepmind.google/models/model-cards/lyria-3/)
8. [Lyria 3.5 - Model Card — Google DeepMind](https://deepmind.google/models/model-cards/lyria-3-5/)
9. [Create & manage songs in Google Flow Music - Computer - Google Flow Help](https://support.google.com/flow/answer/17084348?hl=en&co=GENIE.Platform%3DDesktop)
10. [How to Fix Suno Artifacts, Random Vocals, and Chord Drift](https://meloty.ai/ko/resources/post/how-to-fix-suno-artifacts-random-vocals)
11. [Suno MIDI Export: Turn a Stem Into Playable Notes](https://queststudio.io/blog/suno-midi-export-cleanup-guide)
12. [Suno Cover: The Ultimate 2026 Guide to Music Reimagination](https://apipass.dev/blogs/suno-cover-2026-guide)
13. [Introducing Covers | Suno](https://suno.com/blog/covers)
14. [What is a Cover?](https://help.suno.com/en/articles/2872257)
15. [Audio Inputs | Suno](https://suno.com/blog/audio-inputs)
16. [How to Use: Audio Uploads](https://help.suno.com/en/articles/6141569)
17. [Suno Extend Song: How to Extend a Song in Suno AI (V6) — Undetectr](https://undetectr.com/blog/suno-extend)
18. [How to Use: Creative Sliders](https://help.suno.com/en/articles/6141377)
19. [Suno Upload Audio: Turn Your Own Hook Into a Finished Song](https://sunowatermarkremover.com/blog/suno-upload-audio/)
20. [Update the plugin for Suno v6 (v6 / v6-wild / v6-mini): Variety, Max Mode, download caps, retired models · Issue #562 · bitwize-music-studio/claude-ai-music-skills · GitHub](https://github.com/bitwize-music-studio/claude-ai-music-skills/issues/562)
21. [Suno AI Custom Mode: Style of Music, Lyrics and Every V6 Setting — Undetectr](https://undetectr.com/blog/suno-ai-custom-mode-guide)
22. [Suno V6 Keeps Changing Your Prompt? Variety Explained — Undetectr](https://undetectr.com/blog/suno-v6-changing-your-prompt)
23. [Suno's Mikey Shulman: Everyone Can Make Music Now | Sequoia Capital](https://sequoiacap.com/podcast/sunos-mikey-shulman-everyone-can-make-music-now)
24. [Simple and Controllable Music Generation Jade Copet♠♢ Felix Kreuk♠♢ Itai Gat](https://arxiv.org/pdf/2306.05284)
25. [Suno v5.5 Slider Settings: 6 Goal-Based Recipes – Jack Righteous](https://jackrighteous.com/en-us/blogs/guides-using-suno-ai-music-creation/creative-control-sliders-suno-v5)
26. [Qwen-Music Technical Report](https://www.alphaxiv.org/abs/2607.11699)
27. [Qwen-Music Technical Report](https://arxiv.org/html/2607.11699v2)
28. [MuLaCover: Flexible Cover Song Generation via Symbolic Tonal Control](https://arxiv.org/html/2610.26684)
29. [Suno AI Audio Inputs | Upload, Record, Extend & Cover Your Own Audio](https://sunnoai.com/audio-inputs/)
30. [Turn a Voice Memo Into a Finished Song With Suno AI – Jack Righteous](https://jackrighteous.com/en-us/blogs/guides-using-suno-ai-music-creation/how-to-turn-voice-memos-into-songs-with-suno-ai)
31. [Suno AI Covers | Keep the Melody, Change Everything Else](https://sunnoai.com/covers/)
32. [Make Suno Sing Your Melody: Upload & Lyric Fit Guide – Jack Righteous](https://jackrighteous.com/blogs/guides-using-suno-ai-music-creation/make-suno-sing-your-melody-upload-lyric-sync)
33. [Give Suno V6 Your Own Hook: Voice Memo or Riff to Song — Undetectr](https://undetectr.com/blog/suno-v6-voice-memo-to-song)
34. [Audio Conditioning for Music Generation via Discrete Bottleneck Features](https://musicgenstyle.github.io/)
35. [Upload And Extend Audio - Suno API](https://docs.sunoapi.org/suno-api/upload-and-extend-audio)
36. [Suno V5 & V5.5 Common Issues & How to Fix Them (2026 Guide)](https://apipass.dev/blogs/suno-v5-common-issues-and-solutions)
37. [Suno V6 Guide: What's New, Pricing and How to Prompt It | Moe Lueker](https://moelueker.com/blog/suno-v6-guide)
38. [Google adds music-generation capabilities to the Gemini app | TechCrunch](https://techcrunch.com/2026/02/18/google-adds-music-generation-capabilities-to-the-gemini-app/)
39. [Gemini AI music & song generator - Lyria 3.5](https://gemini.google/overview/music-generation/)
40. [Gemini app rolling out music generation for all with Lyria 3](https://9to5google.com/2026/02/18/gemini-app-music-lyria-3/)
41. [Gemini Lyria 3: How to Create AI Music Inside the Gemini App (2026) | Blog](https://lyria3-pro.com/blog/gemini-lyria-3)
42. [Use Lyria 3 to create music tracks in the Gemini app](https://blog.google/innovation-and-ai/products/gemini-app/lyria-3/)
43. [Generate music with Lyria 3.5 | Gemini Generate Content API (Legacy) | Google AI for Developers](https://ai.google.dev/gemini-api/docs/generate-content/music-generation)
44. [Google Lyria 3.5 Lands in Flow Music](https://www.aimusicpreneur.com/ai-tools-news/google-lyria-3-5-flow-music-launch/)
45. [What Is Google Flow Music? What It Does and Doesn't Do | Veena](https://www.veena.studio/blog/google-flow-music)
46. [Lyria 3.5 Review: Flow Music Pricing & Rights](https://www.therundown.ai/tools/lyria-3-5)
47. [Real-time music generation using Lyria RealTime | Gemini API | Google AI for Developers](https://ai.google.dev/gemini-api/docs/realtime-music-generation)
48. [MusicGen | Open Laboratory](https://openlaboratory.com/models/musicgen/)
49. [Suno 4.5 vs 5 Tested: What 5.5 Adds in 2026 | Moe Lueker](https://moelueker.com/blog/suno-v5-vs-v4-5-what-actually-changed-and-when-to-use-each)
50. [Suno AI: Free AI Song & Music Generator](https://sunnoai.com/)
51. [Introducing Studio 2.0 | Suno](https://suno.com/blog/studio-2)
52. [Suno | Studio 2.0 is here](https://suno.com/release-notes/studio-2)
53. [Suno Studio 2.0 MIDI Guide: Import, Record & Generate – Jack Righteous](https://jackrighteous.com/en-us/blogs/guides-using-suno-ai-music-creation/suno-studio-2-midi-guide)
54. [Suno Studio 2.0 | The Generative Audio Workstation Explained](https://sunnoai.com/studio/)
55. [facebook/musicgen-melody · Hugging Face](https://huggingface.co/facebook/musicgen-melody)
56. [Suno: AI Music & MRI Optimization](https://www.emergentmind.com/topics/suno)
