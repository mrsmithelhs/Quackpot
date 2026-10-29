# Plan 32 — Composition Extension Proposal

**Status:** Proposal only. The owner selected motif C, “Lucky Ripple,” and approved exploring a longer musical phrase. No extension score, rendering source, preview, or rendering job has been created by this proposal.

## Recommendation

Keep C's current two-bar, 4.92-second phrase as a recognizable source idea, then test three different eight-bar forms around it. In all three first-stage candidates, play the original C phrase intact in bars 1–2. Let sections after that use new, explicitly marked answer notes, rests, and sparse echoes derived from C. This gives the owner a direct reference before hearing a larger phrase, without making C's melody continuous for all 19.2 seconds.

First compare phrase structure at the existing 100 BPM and D tonal center with the same lead patch, fixed gain, and a quiet common D/A support bed. Do not add a “dire” or “uneasy” mood to one structure. Less hook is a form choice; mood and activity remain separate design dimensions.

After the owner picks a structure, separately compare two house-inspired harmonic loops under that one chosen form. Keep chord rhythm, lead notes, patch, bass/pad role, and hook placement fixed between those two studies. Do not render a 3-structure × 2-progression grid, and do not produce the five final tracks in this phase.

## Fixed source: selected motif C

The source is `motif-preview/motifs.js`, `sourceVersion: 1`, motif `C` (`Lucky Ripple`). It is in D major at 100 BPM, 4/4. One beat is 0.6 seconds, so the 8-beat phrase is 4.8 seconds; its source render includes a 0.12-second release tail for a 4.92-second WAV.

| Beat from phrase start | Source pitch | MIDI | Duration | Extension treatment |
|---:|---|---:|---:|---|
| 0 | F#5 | 78 | eighth | Reuse unchanged in the opening statement and any full reprise. |
| 0.5 | A5 | 81 | eighth | Reuse unchanged. |
| 1 | D6 | 86 | quarter | Reuse unchanged. |
| 2 | C#6 | 85 | quarter | Reuse unchanged. |
| 3 | A5 | 81 | eighth | Reuse unchanged. |
| 3.5 | F#5 | 78 | eighth | Reuse unchanged. |
| 4 | B5 | 83 | quarter | Reuse unchanged. |
| 5 | A5 | 81 | eighth | Reuse unchanged. |
| 5.5 | F#5 | 78 | eighth | Reuse unchanged. |
| 6 | D5 | 74 | half | Reuse unchanged through beat 8. |

The original is the ten-note sequence at beats `0, 0.5, 1, 2, 3, 3.5, 4, 5, 5.5, 6`. Opening statements and full reprises must use these exact pitches, beat positions, and durations. Do not transpose, retime, reharmonize the lead, or call new notes a C variation in the source data. Give all added material an explicit `origin: "new"`; for echoes, record the source event indexes and any changes to register, onset, duration, or instrument role.

## Stage 1 — three longer phrase structures

All candidates last eight bars (19.2 seconds at 100 BPM). They share the same patch, fixed gain, D tonal center, and very quiet D/A support bed. They have no drums, effects, or changing intensity layer. The common bed supplies context without choosing a chord progression before form selection.

| Candidate | Bars 1–2 | Bars 3–4 | Bars 5–6 | Bars 7–8 | What changes |
|---|---|---|---|---|---|
| **S1 — Call, answer, return** | Exact motif C, unchanged | New two-bar answer melody | Lead rests; the backing carries two sparse, exact C-derived cells | Exact motif C returns unchanged | A full hook, a clear answer, a breathing section, and a full reprise. |
| **S2 — Bookend / contrast** | Exact motif C, unchanged | New two-bar B idea | Continue the B idea for two bars, with one short C-derived backing echo | Exact motif C returns unchanged | A longer central contrast separates the two full hook statements. |
| **S3 — Spacious / fragmentary** | Exact motif C, unchanged | Lead rests over the same quiet support bed | Two C-derived cells appear sparsely in the backing; no continuous lead melody | New two-bar cadence answer; C does not return as a full melody | The original remains intact once, then leaves more space and is recalled only through fragments. |

For an initial echo vocabulary, place source events 0–1 (`F#5` at beat 0, `A5` at beat 0.5) in backing in bar 5, then place events 3–5 (`C#6` at beat 2, `A5` at beat 3, `F#5` at beat 3.5) in backing in bar 6. These are the exact rising and descending C cells, with the original pitches, intervals, and beat positions within their respective bars. If a later chord study needs a transposed echo to fit a selected voicing, record that transposition explicitly in the composition data and compare it separately; do not silently “correct” the melody.

The A/B/C structure labels describe placement and density only. They do not mean bright/uneasy/dire. Keep the same playback level and common accompaniment role in this batch so the owner can judge phrase movement rather than a bundled mood change. These are composition hypotheses, not claims that one structure improves attention, memory, emotional response, or player behavior.

## Stage 2 — two chord loops under the selected form

Only after the owner picks one Stage 1 structure, create two eight-bar backing studies using that same form and lead schedule. Use the same light house-inspired rhythm in both: low tonic support on beats 1 and 3, short chord voicings on offbeats, and no new percussion asset. Repeat the two-bar chord loop four times under the eight-bar phrase. The lead is unchanged; no hook-density, tempo, or sound-patch factor is bundled with the harmony comparison.

Each chord below spans two beats (1.2 seconds), with changes on beats 0 and 2 of each bar; the two-bar loop repeats four times. Use the same pulse in both candidates: low chord root on beats 0 and 2, and a short chord-voicing stab on eighth-note offbeats 1.5 and 3.5. The table checks the exact source C notes against the chord at each two-beat slot; it does not assert that these are the only suitable harmonizations.

| Loop | Two-beat chord sequence | Fit to C's two-bar source |
|---|---|---|
| **P1 — I–V–vi–IV** | `D(add9)` → `A6` → `Bm7` → `Gmaj7` | Beats 0–2: F#, A, D are D-chord tones. Beats 2–4: C#, A, F# fit A6. Beats 4–6: B, A, F# fit Bm7. Beats 6–8: sustained D fits Gmaj7. |
| **P2 — I–iii–vi–IV** | `D(add9)` → `F#m7` → `Bm7` → `Gmaj7` | The opening and last two slots match P1. Beats 2–4: C#, A, F# fit F#m7. The hook notes remain unchanged. |

Store actual bass and chord MIDI voicings, register, and onset/duration events in the backing study data. Chord symbols alone are insufficient evidence that a rendered voicing supports the melody. If a proposed voicing makes a C note clash, change the voicing or surface a separately authored alternative; do not alter C silently.

The backing study is a tonal fit and owner art-direction comparison. Do not label P1 or P2 as objectively happier, more addictive, or more effective. One can change bass notes or inversions later only as a separately recorded composition choice.

## Arrangement roles for later treatment work

Keep these roles separate from phrase structure and from the two progression candidates. The Stage 2 P1/P2 comparison uses only the shared **warm pulse** role so it tests harmony. The other roles are options for a later, separately gated treatment study:

| Role | Proposed ingredients | Kept independent from |
|---|---|---|
| **Warm support / Base reference** | Soft midrange pad, low tonic support, sparse chord punctuation; leave space around the lead | Does not require the hook to play continuously; use the same selected phrase form. |
| **Lighter rhythmic groove** | Same chord loop and chord pitches, with more short offbeat chord attacks and a clear but restrained low pulse | Activity changes without changing hook notes, hook placement, or implying a mood state. |
| **Low unresolved pressure** | Lower, thinner backing; sustained or slowly changing pedal; withhold a strong final cadence while keeping the same lead schedule | “Dire” is an accompaniment/cadence treatment, not an empty melody section or an inference about player emotion. |

Do not generate one file per combination of phrase × progression × role in the next batch. First choose form, then compare the two progressions with the same warm role. If the owner later wants a style/role comparison, propose a small separate set with one selected form and one selected progression held constant.

## Keep the musical dimensions separate

Use these independent axes for later planning:

- **Phrase structure:** where the complete hook, new answers, echoes, and rests occur.
- **Harmonic motion:** the chord progression, register, voicing, and cadence.
- **Activity:** pulse rate, note density, and rhythmic subdivision.
- **Expressive treatment:** instrument role, sustain/filter, and low-register pressure.

When the five controlled tracks are eventually planned, start from one selected structure and one selected Base backing. Keep hook placement and density constant across `Base`, `Uneasy`, `Dire-Clean`, and `Dire-Filtered` unless an owner-approved experiment explicitly tests structure. `Uneasy` can change accompaniment harmony while retaining the phrase form. `Dire` can thin or lower the accompaniment and withhold resolution while the hook remains at the same points. Compare `Dire-Clean` and `Dire-Filtered` with the same notes/backing and only the approved gentle lead filter difference. A hook's absence must not itself be the “dire” treatment. `Foil` may use a separately authored melody, but should use the chosen form and comparable length so it remains a deliberate control.

These are future design constraints, not authorization for the five renders, production state switching, or a Receipt change. The Receipt can report only an actually displayed music state, never a player's inferred feeling.

## Bounded listening sequence and output budget

### First batch: three structure previews

After root reviews the exact composition data, browser page, command, and cleanup source, render A/B/C serially in one isolated browser session. Each WAV is a maximum of 19.2 seconds; retain a WAV, a small provenance JSON, and a run record for each attempt. The original five-second C WAVs remain the reference and are not overwritten.

At stereo 48 kHz PCM16, a 19.2-second WAV is 3,686,444 bytes including its 44-byte header. Three files total 11,059,332 bytes. A stereo float32 working buffer is 7,372,800 bytes per render, with exactly one buffer/context alive at once. Proposed file caps: 3,700,000 bytes per WAV, 32 KiB per provenance file, and 16 KiB for the portable source JSON. These are calculated file/buffer sizes, not measured browser memory or render-time claims.

Owner questions for this batch: Which larger phrase feels like the strongest continuation of C? Does the full hook return at the end, return in the middle, or should the later phrase use only echoes? Which answer section or gap is worth keeping? The owner also notes any familiar-sounding new figure. No listener study is proposed.

### Second batch: two backing studies

After the owner chooses a form and root approves a separate source/command gate, render P1 and P2 under the same selected structure. Two additional 19.2-second WAVs total 7,372,888 bytes. Across both stages, five WAVs total 18,432,220 bytes, plus at most five 32-KiB provenance files and the 16-KiB source JSON. The second batch changes harmonic content while holding phrase form, hook density, tempo, lead patch, and pulse role fixed.

Owner questions for the second batch: Which loop supports the C melody and the chosen larger phrase? Do the chord changes feel too cyclic or too busy? Does a specific voicing or cadence need revision? These questions are art direction, not claims about listeners generally.

### Proposed process envelope

Reuse the existing Plan 25 bounded launcher only after root reviews the future exact command. Proposed outer cap remains 90 seconds, 2 GiB sampled process-tree private bytes, and 1 GiB Node heap. Proposed runner caps are 70 seconds browser work and 79 seconds total; serialize every OfflineAudioContext and cap each 19.2-second render at 15 seconds wall time. Stop on any failed render, unexpected external request, malformed/oversized output, nonfinite PCM, clipping, or uncertain process/profile cleanup. Use a new, unused report-local attempt folder for each batch; never overwrite or automatically retry partials. These are proposed guards, not browser performance guarantees. No library install, server, CDN, provider request, app integration, or audio playback occurs in the renderer.

## Exact files proposed after separate gates

This proposal is the only next-stage file created now. After root adopts Stage 1's exact scope, the smallest implementation set would be:

- `composition-extensions.json` — selected C source data plus S1/S2/S3 eight-bar section maps; each event is marked source-reused, source-derived, or new.
- `composition-preview/index.html`, `preview.css`, and `preview.js` — a report-local, accessible serial renderer/listener using the approved local patch and common controls.
- `composition-preview/runner.mjs` — isolated, bounded renderer/capture with output hash and cleanup records.
- `composition-preview/history/attempt-01/` — `plan32-extension-s1-call-answer.wav`, `plan32-extension-s2-bookend.wav`, and `plan32-extension-s3-spacious.wav`, with provenance sidecars and run records.

Only after an owner structure selection and a second root gate would `composition-backings.json` and `composition-preview/history/attempt-02/` hold `plan32-progression-p1.wav` and `plan32-progression-p2.wav`, with provenance sidecars and run records. The later `Base`, `Foil`, `Uneasy`, `Dire-Clean`, and `Dire-Filtered` compositions are a separate proposal and implementation gate. No such source/audio files are included or started now.

The portable JSON structure also leaves a future, optional path for a bounded external composition critique. No provider, fanout, or consultation budget is assigned here; any such request needs separate authorization.

## Gate requested

Root review and disposition on the three Stage 1 phrase forms, the fixed D/A bed, the resource/file caps, and the staged two-progression follow-up. The current owner has already selected C and approved this direction to explore longer phrasing; no clarification is needed to draft this proposal. No source, audio, library, runtime trigger, Receipt behavior, production integration, or deployment is requested in this phase.
