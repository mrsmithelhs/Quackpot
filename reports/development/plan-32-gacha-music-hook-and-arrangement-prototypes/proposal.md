# Plan 32 — Motif, Rendering and Listening Proposal

**Prepared:** 2026-10-29
**Stage:** Preview source authored under the 2026-10-29 owner authorization; stop for QP Orch source review and execution clearance. No audio has been rendered or played in this work.

## Recommendation

Approve a compact, original two-bar hook in D major at 100 BPM, carried by a bright glassy pluck over a soft warm pulse. Repeat and vary that hook inside an eight-bar, 4/4 loop (19.2 seconds). Keep the melody, rhythm, tempo, tonic and lead patch fixed in `Base`, `Uneasy`, `Dire-Clean` and `Dire-Filtered`; let the accompaniment carry most of the mood change. The five-track set should be `Base`, `Foil`, `Uneasy`, `Dire-Clean` and `Dire-Filtered`, as specified by repaired Plan 33.

This recommendation aims for an identifiable tune that is easy to hum after a few bars, while keeping a readable, friendly baseline. It is a craft proposal, not a prediction about listener psychology. Originality means no intentional copying and a durable note/parameter record; it does not claim that no short interval appears elsewhere. It follows repaired Plan 33's stable-hook/control-track distinction, restrained transformation approach, and two-phase gating. Its own evidence is research synthesis and composition craft examples; it does not establish Quackpot-specific player effects.

## Three motif sketches

Notation is editable text: `bar.beat pitch duration`. Beats use quarter-note = 1 beat; `e` = eighth, `q` = quarter, `h` = half. Sketches are candidates, not audio or finalized scores. Each describes a two-bar, 4/4 phrase that can be repeated or lightly varied across the eight-bar loop. All three audition candidates will be transposed to D major so tonic and pitch range remain controlled; the event-data differences preserve each candidate's contour and rhythm.

### A — “Prize Lantern” (recommended)

```text
Tempo 100; D major; 4/4
1.1 D5 q   1.2 F#5 e  1.2& A5 e   1.3 B5 q   1.4 A5 q
2.1 F#5 q  2.2 E5 e   2.2& F#5 e  2.3 D5 q   2.4 A4 q
```

Ten notes give it a clear upward lift, a brief high point, then a falling answer with a lower turnaround. The two paired eighths give the phrase a small “reveal” flick without a busy casino rhythm. Suggested sound: one soft-edged triangle/sine pluck with a short attack and decay, a quiet warm mid-register pulse, and sparse bell-like accents. Keep the lead centered and restrained; no duck quacks or coin/UI effects.

### B — “Pond Ticket”

```text
Tempo 100; G major; 4/4
1.1 G4 q  1.2 D5 q  1.3 B4 e  1.3& D5 e  1.4 G5 q
2.1 E5 q  2.2 D5 q  2.3 A4 q  2.4 G4 q
```

A wider, more open contour with a repeated note implied by its landing; it may sound more like a conventional adventure theme than a gacha-specific reveal. Suggested sound: rounded square/triangle lead, gentle low pulse, minimal high chime.

### C — “Lucky Ripple”

```text
Tempo 100; A major; 4/4
1.1 C#5 e  1.1& E5 e  1.2 A5 q  1.3 G#5 q  1.4 E5 e  1.4& C#5 e
2.1 F#5 q  2.2 E5 e  2.2& C#5 e  2.3 A4 h
```

Ten notes form a quick opening turn followed by a descending answer; the phrase begins on beat one rather than with an anacrusis. It may feel lighter and less stately than A. Suggested sound: muted pluck with a very quiet sustained fifth; avoid adding a fast arpeggio that competes with reading.

## Owner-approved motif-preview scope; execution still gated

The notation candidates are not a good basis for an owner to choose an unheard tune. The owner approved creation of exactly three two-bar bare-melody snippets (A, B and C), with the same lead patch, tempo and tonic and one conservative fixed-gain policy. Report PCM sample peak and RMS with an explicit statement that they are not LUFS or true-peak matches. These previews are for choosing the motif; they are not the five full-loop renderings and do not add a sixth arrangement to that set. Keep their source event data and patch parameters portable and editable. Ask the owner to choose a preferred contour, say which preview is easiest to remember/hum, and note whether any brings a familiar tune to mind. This is owner art direction, not a listener study or proof of originality.

Owner authorization covers these three previews. QP Orch has approved authoring the report-local preview code and must review the exact renderer, runner, file list, commands and resource cleanup before any execution. The owner selects a motif after hearing the previews. Root retains the loudness-meter decision for the later full arrangements; the small preview PCM sample-peak/RMS convention does not authorize the five eight-bar tracks. After motif selection, root and owner must separately approve the full-render mechanism and listening brief before generating the five variants.

## Proposed five-track arrangement plan

| Track | Shared elements | Change to judge |
|---|---|---|
| `Base` | Selected hook, 100 BPM, selected tonic, eight bars | Bright, inviting, lightly bouncy major accompaniment; comfortable beneath reading; resolved final cadence. |
| `Foil` | Tempo, selected tonic, lead patch, palette and broad Base style | A different original melody, so the owner can tell same-hook transformation from merely similar style. |
| `Uneasy` | Same hook notes/rhythm, tempo, tonic and lead patch as Base | Replace some primary triads with diatonic `ii`, `iii` or `vi`; thin the middle texture; introduce at most one borrowed chord and a low pedal; delay or withhold the final resolution. Keep it uneasy, not horror. |
| `Dire-Clean` | Same hook notes/rhythm, tempo, tonic and unfiltered Base lead | Sparse, low, unresolved accompaniment. Use restrained suspended/cluster-adjacent voicings only if they remain comfortable. Begin with space and unresolved pressure rather than dense roughness. |
| `Dire-Filtered` | Identical note data and backing to `Dire-Clean` | Apply only a gentle low-pass change to the same lead voice. No detuning, tempo, note or backing change. |

Plan 33’s reported experiments and craft examples motivate these as hypotheses. In particular, the borrowed harmony, low-register voicings and roughness are not proven Quackpot settings, and no frequency recipe guarantees laptop audibility. Do not infer distress, addiction, dopamine response, motive or behavior from the tune. The Receipt may report only an actually displayed music state, consistent with the current design; Plan 32 selects no story trigger or Receipt implementation.

## Proposed local rendering and audition mechanism

**Recommended after separate root/owner gates:** a small, dependency-free report-local renderer and audition page using the browser’s Web Audio API, not `src/audio/synth.mjs` and not Plan 18 audio. The current package lists Vite as its only dependency; the inspected command lookup found Node and Python, but did not find `ffmpeg`, `ffprobe`, `sox` or Audacity. No audio-specific Node dependency is present in `package.json`.

- Store the selected composition as portable JSON event tables: bar, beat, MIDI pitch, duration, velocity, plus named chord/pad/filter settings and patch parameters. Keep each arrangement’s changed fields explicit and reviewable so a later bounded independent provider critique, if separately authorized, can use the same musical material without being assigned now.
- Schedule note starts from absolute beat positions at `60 / 100` seconds per beat in one `OfflineAudioContext` per render. Use fixed oscillator types (triangle/sine family), short per-note gain envelopes, a quiet low-pulse voice, and a restrained sustained backing voice. Keep all noise out of this first pass; if noise is later proposed, give it a separate fixed seed and do not let it consume the game PRNG.
- Render one variant at a time, then release its context and PCM before starting the next. Keep each output to the exact eight-bar duration; fit note releases within the loop and inspect the bar-8-to-bar-1 seam. If a seam needs a crossfade, surface that as an explicit audio transformation in the manifest and inspect it; do not silently trim away a note tail.
- Save uncompressed local WAV for transparent inspection and browser playback. At 48 kHz, stereo float working PCM is 1,889,280 bytes per 4.92-second two-bar preview; stereo 16-bit WAV payload is 944,640 bytes per preview, 2,833,920 bytes for three before WAV headers. For later 19.2-second full loops, those payload figures are 7,372,800 bytes float and 3,686,400 bytes PCM16 per render. These are sample-buffer/payload calculations, not measured browser memory, file-size, CPU or render-time claims. Use one preview page and one active `OfflineAudioContext` at a time. The proposed Plan 25 wrapper limits the complete owned process tree to 90 seconds and 2 GiB sampled private bytes, with a 1 GiB Node heap; the headless browser phase is capped at 70 seconds and the runner at 79 seconds to reserve wrapper time for cleanup. Each preview render is capped at 8 seconds. These are safety limits, not performance claims. Record each render’s actual elapsed time; stop if the page errors or a cap is reached.
- Render the previews in an isolated headless Chrome process through CDP using the page’s selection, Render and download controls. The runner blocks external page requests, records WAV and JSON downloads into the report-owned empty preview folder, verifies completed files and hashes, writes a run manifest, then closes the owned process tree and removes its temporary profile only after confirmed exit. It never plays audio. For listening later at the owner’s pace, reopen the local page and select the saved WAV files in its explicit file picker; playback is user-started, single-source, immediately stoppable, and stops when the page is hidden or closed. No autoplay, telemetry, student data, owner tabs, new server or hosting stack.
- If the authorized browser/runner cannot support reliable offline rendering, stop and ask root to select a bounded local tool or provider handoff. Do not install a library or download a sound bank in response.

### Preview readings and later loudness gate

For the three short motif previews, QP Orch recommends one conservative common gain and PCM sample-peak/RMS readings, explicitly not LUFS or true-peak matched. The preview page reports those values from its float32 render buffer before PCM16 WAV quantization. These simple readings let the owner compare bare contours; they do not establish equal perceived loudness.

The inspected Plan 18 `audio_probe.py` is standard-library-only and measures WAV duration, sample rate, channels, bit depth, sample peak and RMS; it does **not** measure LUFS or true peak. The command lookup found no `ffmpeg`/`ffprobe`/`sox`/Audacity, and I did not probe unverified Python packages or run a meter. Before the five full arrangements, root must resolve whether an already-available offline BS.1770/R128 integrated-loudness and true-peak meter is usable, or recommend a different comparison rule with its limitation for owner approval. Never call sample peak true peak or RMS LUFS.

## Owner art-direction questions (after authorized previews)

After separately authorized previews have actually been heard, ask:

1. Which contour is the best starting hook, or should the motif be revised?
2. Which preview is easiest to remember or hum, and does any sound too familiar?
3. Is the bright pluck over a warm, sparse pulse the right baseline palette for a later full-loop comparison?

Only after a motif is selected and the five full loops are separately authorized, ask whether Base remains comfortable beneath reading, Uneasy loses some comfort without becoming horror, Dire feels restrained and unresolved, and `Dire-Clean`/`Dire-Filtered` differ in a useful way. The owner is not asked to select tooling or make LUFS/true-peak claims; root resolves available measurement tools and the mechanism gate.

The listening is the owner’s art direction, not a participant experiment or population evidence. Headphones and one built-in laptop/phone speaker are useful practical checks; their results do not establish behavior on all student devices.

## Proposed files after approval

Current scope now includes the following authored preview sources in this report folder; they are not executed yet:

- `motif-preview/motifs.js` — portable two-bar MIDI event data, shared D tonic, tempo and voice parameters;
- `motif-preview/index.html` and `preview.css` — minimal accessible owner audition interface;
- `motif-preview/preview.js` — one-at-a-time `OfflineAudioContext` render, PCM sample peak/RMS readings, PCM16 WAV and per-preview JSON data downloads, one-active playback and immediate stop;
- `motif-preview/runner.mjs` — isolated headless Chrome/CDP launch, bounded rendering and download capture, owned-process cleanup, with no local server or playback;
- `motif-preview/README.md` — exact proposed bounded command, resource envelope and output cleanup notes.

After root source review and execution clearance, the runner may render the three previews serially and capture WAV plus JSON records into `motif-preview/previews/`; the owner may listen later using the saved-file picker. That folder is empty before the approved run. Only after the owner picks a motif and root/owner separately authorize full arrangements would we add:

- selected hook and foil event data plus versioned arrangement parameters in `composition.json`;
- five named WAV outputs and an `audio-manifest.json` recording composition revision, renderer, sample format, settings, meter readings, gains and hashes;
- `audition.html` with minimal accessible playback controls and listening prompts.

No preview WAV, manifest, five-track arrangement, production source, app code, selected Plan 18 catalog/pool, packet/status, canonical document, other report, Plan 16 checkpoint or Plan 27 layout is created or modified by this source-authoring step.

## Stop conditions

Stop here for QP Orch source review of the exact renderer/runner code, resource guard, cleanup and proposed command. Do not execute the renderer or launch the browser until root releases that review gate. Do not generate the five full arrangements, install or adopt dependencies, dispatch another provider, select a production tune, update Plan 18, add a story trigger, change Receipt behavior, or integrate assets in this phase.
