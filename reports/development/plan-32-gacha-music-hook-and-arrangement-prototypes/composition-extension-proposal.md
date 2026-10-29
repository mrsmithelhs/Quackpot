# Plan 32 — Composition Extension Proposal

**Status:** Stage 1 source authoring approved by QP Orch. The owner selected motif C, “Lucky Ripple,” and approved testing extensions. This phase authors three longer forms and a local preview renderer for root review. It does not run a script, browser, renderer, or audio job. Stage 2 progressions and the five mood variants remain unassigned until the owner chooses a structure.

## Recommendation

Keep C's current two-bar, 4.92-second phrase as a recognizable source idea, then test three different eight-bar forms around it. In all three first-stage candidates, play the original C phrase intact in bars 1–2. Let sections after that use new, explicitly marked answer notes, rests, and sparse echoes derived from C. This gives the owner a direct reference before hearing a larger phrase, without making C's melody continuous for all 19.2 seconds.

First compare phrase structure at the existing 100 BPM and D tonal center with the same lead patch, fixed gain, and a quiet common D/A support bed. The selected motifs are a recurring Quackpot harmonic vocabulary, not an owner selection of house music as a genre. A house-inspired groove remains only a possible later treatment. Do not add a “dire” or “uneasy” mood to one structure. Less hook is a form choice; mood and activity remain separate design dimensions.

After the owner picks a structure and root assigns the work, separately compare two recurring Quackpot harmonic loops under that one chosen form. Keep lead notes, patch, and selected phrase placement fixed between those studies. Groove, pulse and voicing are not chosen here. Do not render a 3-structure × 2-progression grid or produce the five later mood tracks in this phase.

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

All candidates have a 19.2-second musical form (eight bars) plus the common 0.12-second release tail, for a 19.32-second file. They share the same patch, fixed gain, D tonal center, and very quiet D/A support bed. They have no drums, effects, or changing intensity layer. The common bed supplies context without choosing a chord progression before form selection.

| Candidate | Bars 1–2 | Bars 3–4 | Bars 5–6 | Bars 7–8 | What changes |
|---|---|---|---|---|---|
| **S1 — Call, answer, return** | Exact motif C, unchanged | New two-bar answer melody | Lead rests; the backing carries two sparse, exact C-derived cells | Exact motif C returns unchanged | A full hook, a clear answer, a breathing section, and a full reprise. |
| **S2 — Bookend / contrast** | Exact motif C, unchanged | New two-bar B idea | Continue the B idea for two bars, with one short C-derived backing echo | Exact motif C returns unchanged | A longer central contrast separates the two full hook statements. |
| **S3 — Spacious / fragmentary** | Exact motif C, unchanged | Lead rests over the same quiet support bed | Two C-derived cells appear sparsely in the backing; no continuous lead melody | New two-bar cadence answer; C does not return as a full melody | The original remains intact once, then leaves more space and is recalled only through fragments. |

For an initial echo vocabulary, place source events 0–1 (`F#5` at beat 0, `A5` at beat 0.5) in backing in bar 5, then place events 3–5 (`C#6` at beat 2, `A5` at beat 3, `F#5` at beat 3.5) in backing in bar 6. These are the exact rising and descending C cells, with the original pitches, intervals, and beat positions within their respective bars. If a later chord study needs a transposed echo to fit a selected voicing, record that transposition explicitly in the composition data and compare it separately; do not silently “correct” the melody.

The S1/S2/S3 structure labels describe placement and density only; they are distinct from original motif A/B/C labels. They do not mean bright/uneasy/dire. Keep the same patch, gain settings, and common accompaniment role in this batch. Record PCM sample peak and RMS only; do not normalize or claim LUFS or true-peak matching. These are creative form auditions, not a controlled perceptual experiment or claims that one structure improves attention, memory, emotional response, or player behavior.

## Stage 2 — two chord loops under the selected form

Only after the owner picks one Stage 1 structure and root assigns a separate scope, create two eight-bar backing studies using that same form and lead schedule. These compare recurring Quackpot harmonic vocabulary. A house-inspired rhythm is only a later option, not a selected genre or required pulse. The lead is unchanged; no hook-density, tempo, or sound-patch factor is bundled with the harmony comparison.

Each chord below spans two beats (1.2 seconds), with changes on beats 0 and 2 of each bar; the two-bar harmonic loop repeats four times. The table checks the exact source C notes against the chord at each two-beat slot; it does not assert that these are the only suitable harmonizations. Pulse and voicing are not yet assigned.

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

After root reviews the exact composition data, browser page, command, and cleanup source, render S1/S2/S3 serially in one isolated browser session. Each WAV is a 19.2-second form plus 0.12-second tail; retain a WAV, a small provenance JSON, and a run record for each attempt. The original short C WAV remains the reference and is not overwritten. No seamless-loop or crossfade claim is made; loop-wrap treatment is a separate later choice.

At stereo 48 kHz PCM16, a 19.32-second WAV is 3,709,484 bytes including its 44-byte header. Three files total 11,128,452 bytes. A stereo float32 working buffer is 7,418,880 bytes per render, with exactly one buffer/context alive at once. Proposed caps: 3,800,000 bytes per WAV, 32 KiB per provenance file, and 32 KiB for the portable source script. These are calculated file/buffer sizes, not measured browser memory or render-time claims. Preserve the common gain settings; these files have PCM peak/RMS readings only, not LUFS/true-peak matching. Metering of later full mixes is a separate question.

Owner questions for this batch: Which larger phrase feels like the strongest continuation of C? Does the full hook return at the end, return in the middle, or should the later phrase use only echoes? Which answer section or gap is worth keeping? The owner also notes any familiar-sounding new figure. No listener study is proposed.

### Second batch: two backing studies

After the owner chooses a form and root separately assigns a source/command gate, render P1 and P2 under that structure. Their duration, pulse, voicing, exact PCM size, and process caps are not assigned in this proposal. Stage 2 changes harmonic content while holding phrase form, hook placement, tempo, and lead patch fixed.

Owner questions for the second batch: Which loop supports the C melody and the chosen larger phrase? Do the chord changes feel too cyclic or too busy? Does a specific voicing or cadence need revision? These questions are art direction, not claims about listeners generally.

### Proposed process envelope

Reuse the existing Plan 25 bounded launcher only after root reviews the future exact command. Proposed outer cap remains 90 seconds, 2 GiB sampled process-tree private bytes, and 1 GiB Node heap. Proposed runner caps are 70 seconds browser work and 79 seconds total; serialize every OfflineAudioContext and cap each 19.2-second render at 15 seconds wall time. Stop on any failed render, unexpected external request, malformed/oversized output, nonfinite PCM, clipping, or uncertain process/profile cleanup. Use a new, unused report-local attempt folder for each batch; never overwrite or automatically retry partials. These are proposed guards, not browser performance guarantees. No library install, server, CDN, provider request, app integration, or audio playback occurs in the renderer.

## Exact files proposed after separate gates

Stage 1 source files now under root review:

- `composition-extensions.js` — classic local script wrapper around the portable composition data, avoiding `file://` fetch/CORS dependencies. It includes an exact hash of the unchanged motif source, C events, and S1/S2/S3 maps; events are marked source-reused, source-derived, or new.
- `composition-preview/index.html`, `preview.css`, and `preview.js` — report-local, accessible serial renderer/listener using the approved local patch and common controls.
- `motif-preview/runner.mjs` adds explicit `--extensions` mode, reusing its isolated Chrome/CDP lifecycle, process ownership and cleanup record. It writes only to `composition-preview/history/attempt-01/`, refuses an existing attempt directory, and validates the adapted filenames, WAV and provenance.

The exact proposed root-review command is:

```powershell
.\reports\development\plan-25-desk-phone-art-integration\bounded-node-run.ps1 -Executable node.exe -ArgumentVector @('reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/runner.mjs','--extensions')
```

Runner limits in this mode are 15 seconds per render, 70 seconds browser work, and 79 seconds total runner; the existing outer wrapper remains 90 seconds, 2 GiB sampled process-tree private bytes, and 1 GiB Node heap. WAV cap: 3,800,000 bytes; provenance cap: 32 KiB. The calculated WAV is 3,709,484 bytes and the one-at-a-time float32 buffer is 7,418,880 bytes. These limits still need root confirmation against the exact source and changed runner. No command was run in this phase.

Expected outputs are `plan32-extension-s1-call-answer.wav`, `plan32-extension-s2-bookend.wav`, and `plan32-extension-s3-spacious.wav`, with provenance sidecars and an attempt record in the fresh attempt folder.

Stage 2 progression work remains unassigned until the owner chooses a structure. The five mood variants also remain unassigned. No such source/audio files are included or started now.

The portable source data also leaves a future, optional path for a bounded external composition critique. No provider, fanout, or consultation budget is assigned here; any such request needs separate authorization.

## Gate requested

Root review and disposition on the authored Stage 1 source, preview UI, adapted runner branch, exact proposed command, the three phrase forms, fixed D/A bed, resource/file caps, and the staged two-progression follow-up. No source or runner command has been launched. No audio is produced in this phase. No library, runtime trigger, Receipt behavior, production integration, or deployment is requested.
