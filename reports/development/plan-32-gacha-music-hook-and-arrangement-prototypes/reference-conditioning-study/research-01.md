# Melody-reference conditioning: first evidence pass

Research date:2026-10-30. Product behavior is time-sensitive; recheck the same
interface/model/mode before the next experiment. This is research and a proposed
experiment, not a claim that a new generation method has already succeeded.

## Intake and observations

The ignored/local generated-references folder now has twelve MP3 downloads:
six with-C and six baseline tracks. Original downloads remain unchanged and are
not production assets. Owner reports generally pleasing music but poor preservation
of the chosen C melody; only 04-The_Penny_Prize_Dispenser-with-c.mp3 seemed close.
That is owner listening evidence, not an independent transcription or root audition.
Single outputs from different styles cannot identify the cause or estimate reliability.

Owner confirms the interface was Gemini web app at https://gemini.google.com,
Create music, with C WAV visibly attached to every with-C request. Exact generation
model/version and prompt/settings exports are not yet established. Attachment at
the chat level does not itself prove waveform conditioning at the generator level.

Root read the original C WAV header and size: RIFF/WAVE PCM,48kHz,16-bit,2channels,
944640 data bytes at192000bytes/sec =4.92s (944684bytes total). Source defines the
selected short two-bar motif at100BPM with triangle timbre; the musical phrase is
4.8s plus release. This is a conventional format, not evidence of an unusable or
corrupt upload. Its shortness, patch, level and phrasing could matter to a particular
model, but this inspection establishes no causal explanation for Gemini's results.

## Primary evidence and its limits

### Gemini app and API are not interchangeable evidence

[Gemini Apps music help](https://support.google.com/gemini/answer/16901237?hl=en-gb)
describes Create music and optional image/video uploads for context. It does not
document an uploaded-audio melody-preservation control. This is a capability
documentation gap, not proof that the attached WAV is always ignored.

[Gemini API Lyria3.5 music documentation](https://ai.google.dev/gemini-api/docs/music-generation)
describes text/image generation. It does not establish waveform-melody conditioning
in the app. A chat model's ability to analyze audio, or its promise to follow the
melody, is not an API/tool contract proving the waveform reaches the music model.
Do not spend another large prompt matrix trying to fix an unverified input pathway.

### Suno offers a mode explicitly aimed at this objective

[Suno Cover](https://suno.com/products/covers) describes using actual source audio
to preserve the melody while changing style, including rough voice memos. This
matches the objective more directly than generic text-to-music. These are product
claims, not a measured fidelity guarantee for our clip.

[Suno Upload Audio help](https://help.suno.com/en/articles/2477633) documents6–60s
uploads (up to120s for certain accounts). The page is dated2025-03-24, so confirm
current interface limits rather than treating the page as timeless. Our4.92s clip
is shorter than that documented minimum; this says nothing about Gemini accepting
it. Repeat the selected musical phrase rather than assuming silence padding is a
good musical reference or composing an unwanted new extension merely to add length.

[Suno creative sliders](https://help.suno.com/en/articles/6141377) distinguishes
style influence from audio influence and weirdness. Record the controls actually
available in the chosen model/mode; high audio influence is a hypothesis to test,
not a guarantee or a reason to change every setting simultaneously.

[Suno Remaster](https://help.suno.com/en/articles/8105281) is described as smaller
production/sound variations, compared with Cover's more substantial transformation.
It is not evidence that Remaster can invent the desired new backing arrangement
or generate controlled darker harmony from a bare motif. Cover, Extend, Remaster
and audio upload are different operations; document which is actually used.

### What real melody conditioning looks like in a documented system

[AudioCraft MusicGen code](https://github.com/facebookresearch/audiocraft/blob/main/audiocraft/models/musicgen.py)
has an explicit generate_with_chroma interface taking melody waveforms and sample
rate; [conditioning documentation](https://github.com/facebookresearch/audiocraft/blob/main/docs/CONDITIONING.md)
describes extraction of chroma features. This provides a useful capability distinction:
melodic conditioning is a specific input mechanism, not just an upload label.
Chroma is not a guarantee of exact note/rhythm reproduction. This is an explanatory
reference, not a recommendation to install/download another local model or a finding
about Gemini's internal architecture. Existing resource/license gates still apply.

## Hypotheses to distinguish

1. Waveform never reaches a melody-conditioned music generation path in this app.
2. It is passed as weak inspiration rather than a composition constraint.
3. A4.92s single phrase supplies too little useful context for this model/mode.
4. The reference's timbre/level/phrasing makes its lead difficult to recover.
5. Long style/arrangement prompts compete with melodic fidelity.
6. The tool is stochastic: one plausible result or failure isn't a reliability test.

The current six style pairs confound genre, arrangement and stochastic outputs.
They establish owner preference and a problem worth testing, not which hypothesis
is true. The near-C ragtime output isn't proof of deliberate reference use.

## Recommended next study, before more style generation

First verify an input mode intended for audio/melody reference. For Gemini app,
look for exact current product documentation/UI behavior or support confirmation;
if none exists, mark it experimental and use a tiny diagnostic only with owner's
generation allowance. An audio-analysis response alone doesn't prove tool transfer.
For Suno, investigate upload-to-Cover and the current controls/lengths first, with
Extend used separately only when continuation is the intended operation.

Prepare references later under a bounded rendering brief, preserving the original
ten-note pitches/rhythm and their source. Candidate variants:
- original C where accepted, as historical control;
- two/four identical repetitions on the original grid, about9.6/19.2s plus release;
- the same repeated notes in a clear dry piano/pluck timbre, no backing;
- only later, a sparse pulse/harmony version if the simple reference is demonstrably
  ingested yet insufficient. Don't add a new melody or all layers at once.

Longer here means repeated chosen C, not the rejected S1/S2/S3 extensions. Format,
level and stereo/mono changes should follow the selected mode's actual guidance.
Do not make many variants and then attribute the winning result to one variable.

Use one simple light instrumental style first. Compare minimal instruction versus
the same instruction plus explicit melody/rhythm preservation, with the SAME
reference and model/mode/settings. Then change reference representation. Retest
the promising setting with an independent generation before trusting it. Let a
failed capability check stop the wider matrix. No generations are run by this report.

Suggested compliance prompt for a verified audio-reference mode (a hypothesis):
'Use the uploaded lead as the composition: keep its note order and rhythm, repeat
the complete phrase, and add a light instrumental accompaniment. Keep the lead
clearly audible. No vocals or replacement lead melody.' Add detailed style only
after testing fidelity; wording cannot create a missing conditioning channel.

Score separately: motif audibility; relative pitch/rhythm fidelity; repetitions and
timecodes; global transpose/tempo changes; musical quality; useful arrangement
ideas. A pleasant track is not automatically a preserved hook. Owner listening is
primary for the recognition goal; use a short verified note comparison when needed,
not unsupported MIDI transcription or a similarity score alone. Exact matching
needn't require identical timbre, but tolerances should be declared before ranking.

## Workflow fallback and next authority

The generated references remain useful for instrumentation, groove, harmony and
structure even if they don't reproduce C. Keep the authoritative C note source
separate from generated leads. A later transcription/reconstruction study can borrow
useful arrangement ideas and place C deliberately; don't pretend the generative
tool preserved it. No automatic stem separation/editable MIDI fidelity is promised.

Plan32 remains open. Before preparing reference renders or consuming generations,
return an exact short experiment brief: interface/model/mode evidence, references,
two or three conditions, repeats, what would stop the trial, listening rubric and
resource/quota budget. No full6-style rerun, account/terms acceptance, model weights,
tool installs, transcription job or production audio adoption is authorized here.
Research and capability verification can proceed without those actions. Preserve
exact prompts/settings/version/date beside outputs so this knowledge can be refreshed.
