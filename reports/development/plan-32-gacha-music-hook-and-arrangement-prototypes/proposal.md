# Plan 32 — Motif, Rendering and Listening Proposal

**Prepared:** 2026-10-29
**Stage:** Proposal only; stop for root mechanism/resource review and owner motif/listening approval. No score has been rendered and no audio has been played in this work.

## Recommendation

Approve a compact, original two-bar hook in D major at 100 BPM, carried by a bright glassy pluck over a soft warm pulse. Repeat and vary that hook inside an eight-bar, 4/4 loop (19.2 seconds). Keep the melody, rhythm, tempo, tonic and lead patch fixed in `Base`, `Uneasy`, `Dire-Clean` and `Dire-Filtered`; let the accompaniment carry most of the mood change. The five-track set should be `Base`, `Foil`, `Uneasy`, `Dire-Clean` and `Dire-Filtered`, as specified by repaired Plan 33.

This recommendation aims for an identifiable tune that is easy to hum after a few bars, while keeping a readable, friendly baseline. It is a craft proposal, not a prediction about listener psychology. Originality means no intentional copying and a durable note/parameter record; it does not claim that no short interval appears elsewhere.

## Three motif sketches

Notation is editable text: `bar.beat pitch duration`. Beats use quarter-note = 1 beat; `e` = eighth, `q` = quarter, `h` = half. Sketches are candidates, not audio or finalized scores. Each describes a two-bar, 4/4 phrase that can be repeated or lightly varied across the eight-bar loop.

### A — “Prize Lantern” (recommended)

```text
Tempo 100; D major; 4/4
1.1 D5 q   1.2 F#5 e  1.2& A5 e   1.3 B5 q   1.4 A5 q
2.1 F#5 q  2.2 E5 e   2.2& F#5 e  2.3 D5 h
```

Nine notes give it a clear upward lift, a brief high point, then a falling answer and a held landing. The two paired eighths give the phrase a small “reveal” flick without a busy casino rhythm. Suggested sound: one soft-edged triangle/sine pluck with a short attack and decay, a quiet warm mid-register pulse, and sparse bell-like accents. Keep the lead centered and restrained; no duck quacks or coin/UI effects.

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
1.1 C#5 e  1.1& E5 e  1.2 A5 q  1.3 G#5 q  1.4 E5 q
2.1 F#5 q  2.2 E5 e  2.2& C#5 e  2.3 A4 h
```

A quick opening pickup and a more descending answer make it feel lighter and less stately than A. Suggested sound: muted pluck with a very quiet sustained fifth; avoid adding a fast arpeggio that competes with reading.

## Bare-melody check

Before rendering the five arrangements, audition the selected melody alone through a single lead voice, first once and then after a short pause. The owner should be able to hum or recognize its contour, distinguish it from the proposed foil, and confirm that the hook does not depend on accompaniment for its identity. This is a short gate check using the already-authorized owner audition, not a sixth arrangement or a new listener study. If the hook fails, revise the text score before authorizing any full renders.

## Proposed five-track arrangement plan

| Track | Shared elements | Change to judge |
|---|---|---|
| `Base` | Selected hook, 100 BPM, D tonic, eight bars | Bright, inviting, lightly bouncy major accompaniment; comfortable beneath reading; resolved final cadence. |
| `Foil` | Tempo, tonic, lead patch, palette and broad Base style | A different original melody, so the owner can tell same-hook transformation from merely similar style. |
| `Uneasy` | Same hook notes/rhythm, tempo, tonic and lead patch as Base | Replace some primary triads with diatonic `ii`, `iii` or `vi`; thin the middle texture; introduce at most one borrowed chord and a low pedal; delay or withhold the final resolution. Keep it uneasy, not horror. |
| `Dire-Clean` | Same hook notes/rhythm, tempo, tonic and unfiltered Base lead | Sparse, low, unresolved accompaniment. Use restrained suspended/cluster-adjacent voicings only if they remain comfortable. Begin with space and unresolved pressure rather than dense roughness. |
| `Dire-Filtered` | Identical note data and backing to `Dire-Clean` | Apply only a gentle low-pass change to the same lead voice. No detuning, tempo, note or backing change. |

Plan 33’s reported experiments and craft examples motivate these as hypotheses. In particular, the borrowed harmony, low-register voicings and roughness are not proven Quackpot settings, and no frequency recipe guarantees laptop audibility. Do not infer distress, addiction, dopamine response, motive or behavior from the tune. The Receipt may report only an actually displayed music state, consistent with the current design; Plan 32 selects no story trigger or Receipt implementation.

## Proposed local rendering and audition mechanism

**Recommended after a separate root/owner mechanism gate:** a small, dependency-free report-local renderer and audition page using the browser’s Web Audio API, not `src/audio/synth.mjs` and not Plan 18 audio. The current package lists Vite as its only dependency; the inspected command lookup found Node and Python, but did not find `ffmpeg`, `ffprobe`, `sox` or Audacity. No audio-specific Node dependency is present in `package.json`.

- Store the selected composition as small JSON or JavaScript event tables: bar, beat, MIDI pitch, duration, velocity, plus named chord/pad/filter settings. Keep each arrangement’s changed fields explicit and reviewable.
- Schedule note starts from absolute beat positions at `60 / 100` seconds per beat in one `OfflineAudioContext` per render. Use fixed oscillator types (triangle/sine family), short per-note gain envelopes, a quiet low-pulse voice, and a restrained sustained backing voice. Keep all noise out of this first pass; if noise is later proposed, give it a separate fixed seed and do not let it consume the game PRNG.
- Render one variant at a time, then release its context and PCM before starting the next. Keep each output to the exact eight-bar duration; fit note releases within the loop and inspect the bar-8-to-bar-1 seam. If a seam needs a crossfade, surface that as an explicit audio transformation in the manifest and inspect it; do not silently trim away a note tail.
- Save uncompressed local WAV for transparent inspection and browser playback. At 48 kHz, stereo float working PCM is 7,372,800 bytes per 19.2-second render; stereo 16-bit WAV payload is 3,686,400 bytes per render, about 18.4 MB for five payloads before WAV headers. These are sample-buffer/payload calculations, not measured browser memory, file-size, CPU or render-time claims. A proposed ceiling is one render page, one active variant, one loop per render, and a 60-second wall limit for the whole five-file batch; record actual elapsed time and process memory under an approved guarded runner and stop at either limit.
- Audition from a local report page with explicit Play, Stop/Mute and track selection; stop the prior source before switching and play one track at a time. Provide loop-once and short 3–5-repeat comfort/seam choices, keyboard-operable controls, visible track names, and immediate mute. No autoplay, telemetry, external request, student data, owner tabs, new server or hosting stack.
- If the authorized browser/runner cannot support reliable offline rendering, stop and ask root to select a bounded local tool or provider handoff. Do not install a library or download a sound bank in response.

### Loudness measurement gate

Plan 33 corrects the target notation to `-16.0 LUFS ±0.5 LU` integrated and a `-1.0 dBTP` ceiling. The inspected Plan 18 `audio_probe.py` is standard-library-only and measures WAV duration, sample rate, channels, bit depth, sample peak and RMS; it does **not** measure LUFS or true peak. RMS is not a replacement for either. The command lookup found no `ffmpeg`/`ffprobe`/`sox`/Audacity, and I did not probe unverified Python packages or run a meter.

Therefore the proposed renderer is mechanically feasible, but the five files cannot yet be honestly promised to meet Plan 33’s loudness convention. Before rendering, root/owner should either name an already-available, offline BS.1770/R128 integrated-loudness and true-peak meter, or approve a different comparison rule with the limitation stated. Do not call sample peak a true peak or call RMS LUFS. Record the chosen meter, version, settings, readings and applied gain per file; if no approved meter is available, stop before rendering rather than mislabel the matches.

## Listening brief for owner

1. Does A (“Prize Lantern”) feel like the intended Quackpot hook, or should B or C be the starting point?
2. Is a bright pluck over a warm, sparse pulse the right baseline palette, and does it remain comfortable while reading?
3. Should Uneasy and Dire remain accompaniment-first, with their differences judged at matched tempo, tonic and intended level?
4. For Dire, should the owner hear `Dire-Clean` versus the same backing with only a gentle low-pass lead, with detuning deferred?
5. Which already-available offline meter or alternative comparison rule should govern loudness and true-peak claims?
6. Approve the proposed report-local Web Audio/OfflineAudioContext path and its one-at-a-time 60-second batch cap, or request a different bounded mechanism?

The listening is the owner’s art direction, not a participant experiment or population evidence. Headphones and one built-in laptop/phone speaker are useful practical checks; their results do not establish behavior on all student devices.

## Proposed files after approval

Current scope creates only this `proposal.md` and its required `progress.md`. If the motif and mechanism are approved later, the proposed bounded deliverables in this same report folder are:

- `composition.json` — selected note/event data, foil notes and versioned arrangement parameters;
- `render.mjs` or a local `renderer.html` plus a small module — explicit deterministic render implementation;
- five named WAV outputs and an `audio-manifest.json` recording composition revision, renderer, sample format, settings, meter readings, gains and hashes;
- `audition.html` with minimal accessible playback controls and listening prompts.

No files in this later list are created under this proposal gate. No selected Plan 18 catalog/pool, production source, app code, packets, canonical documents, other report, Plan 16 checkpoint, Plan 27 layout or status is modified.

## Stop conditions

Stop here for root review of mechanism, tool, file and resource choices and owner approval of motif/listening brief. Do not render audio, install or adopt dependencies, launch any rendering/listening/browser/server job, select a production tune, update Plan 18, add a story trigger, change Receipt behavior, or integrate assets in this phase.
