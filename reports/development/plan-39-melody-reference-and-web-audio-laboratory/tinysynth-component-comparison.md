# TinySynth component comparison — pinned reference, not origin proof

2026-10-31. This report is a read-only comparison; it does not change or approve the sound, establish production licensing clearance, or identify the historical upstream version used by the original author. Existing attribution and local Apache-2.0 license remain in `TINYSYNTH-NOTICE.md` and `TINYSYNTH-APACHE-2.0.txt`.

## Inputs and method

- Local authority: `lab/patches.js` `GM_PROGRAMS` (lines 49–338; SHA-256 `e52172032484d5909cb6daf60b5ff6b7ab29f026879031d919d3e748e3b206f2`) and `lab/synth-engine.js` (SHA-256 `f756539d1a564c0cf0fe997a0602a9fe9b93de5b7790a46e02c9bdc247ae3f82`). These are the reviewed Plan39 candidate, unchanged by this comparison.
- Primary reference: [g200kg/webaudio-tinysynth `webaudio-tinysynth.js` at `3d75aee4b3f43cbd932265e7d60201fd5b770397`](https://github.com/g200kg/webaudio-tinysynth/blob/3d75aee4b3f43cbd932265e7d60201fd5b770397/webaudio-tinysynth.js), retrieved as raw bytes, SHA-256 `dd2b1d95d64499dfc3c292858e8c2d6525dc0bcdc345a900b7db207dffaae38c`. Upstream `program1` begins at line 128; `program0` begins at 274. `setQuality` installs `program1` over `program0` by zero-based index when quality is enabled. `setTimbre` line 968 fills omitted fields.
- Parsed text as data with Python standard-library regular expressions; no downloaded code was evaluated. Removed source comments before extracting bracketed program entries, checked there were exactly 128, and extracted all 20 local numbered definitions. Mapped each local `gmNumber` to the same zero-based upstream `program1` index. Compared operator count, order and all 13 fields `g,w,t,f,v,a,h,d,s,r,p,q,k` after filling missing upstream fields with the reference `setTimbre` defaults: `g=0,w=sine,t=1,f=0,v=0.5,a=0,h=0.01,d=0.01,s=0,r=0.05,p=1,q=1,k=0`. Numeric representations such as `.4` and `0.40` compare as numbers. Local fields were normalized using the same defaults for this table only; this is **recipe-data normalization**, not an assertion that local playback applies upstream defaults or sounds identical.
- “Different” below means the named local recipe differs mechanically from the corresponding numbered reference recipe; it is a **modified-relative-to-reference classification**, not proof that the upstream entry was copied or that this revision was its origin. “No established match” applies to historical derivation, which this comparison cannot determine. This is not a search for an accidental match among every other upstream program or an audit of other revisions.

## Complete local curated-program map

Counts are upstream to local. The example identifies one difference in the first operator (upstream to local); an operator-count difference alone also prevents an exact normalized match. All 20 numbered entries are **different**; none is an exact normalized match to its corresponding entry. Local numeric IDs and the GM name establish the comparison target, not authorship.

| Local program (`patches.js` line) | Upstream `program1` index | Operators | Example first-operator difference |
|---|---:|---:|---|
| GM-00-piano (63) | 0 | 2 → 2 | `v` 0.4 → 0.45 |
| GM-04-epiano1 (76) | 4 | 2 → 3 | `v` 0.35 → 0.50 |
| GM-05-epiano2 (90) | 5 | 2 → 3 | `v` 0.35 → 0.45 |
| GM-08-celesta (104) | 8 | 2 → 2 | `t` 1 → 2 |
| GM-10-music-box (117) | 10 | 2 → 2 | `t` 1 → 2 |
| GM-11-vibraphone (130) | 11 | 2 → 3 | `v` 0.2 → 0.46 |
| GM-12-marimba (144) | 12 | 2 → 3 | `v` 0.3 → 0.52 |
| GM-13-xylophone (158) | 13 | 2 → 2 | `t` 1 → 2 |
| GM-15-dulcimer (171) | 15 | 2 → 3 | `w` triangle → sine |
| GM-24-nylon-guitar (185) | 24 | 2 → 2 | `w` sine → triangle |
| GM-25-steel-guitar (198) | 25 | 2 → 3 | `f` 1 → 0 |
| GM-32-acoustic-bass (212) | 32 | 2 → 3 | `v` 0.5 → 0.65 |
| GM-33-finger-bass (226) | 33 | 2 → 3 | `w` sine → triangle |
| GM-45-pizzicato (240) | 45 | 2 → 3 | `w` sine → sawtooth |
| GM-46-harp (254) | 46 | 2 → 3 | `v` 0.3 → 0.45 |
| GM-73-flute (268) | 73 | 2 → 3 | `v` 0.7 → 0.48 |
| GM-75-pan-flute (282) | 75 | 2 → 2 | `v` 0.4 → 0.46 |
| GM-79-ocarina (295) | 79 | 2 → 2 | `v` 0.7 → 0.50 |
| GM-107-koto (308) | 107 | 2 → 3 | `v` 0.5 → 0.42 |
| GM-108-kalimba (322) | 108 | 2 → 3 | `w` triangle → sine |

`P0-plan32-triangle` (line 51) is the separately identified historical Plan32 control, `gmNumber: null`, with its own bare-triangle scheduling branch (`synth-engine.js` around line 736); it has no numbered upstream mapping in this comparison. Its classification is **independent control**, not an exact or modified GM program match. Ensemble presets in `patches.js` combine local program IDs and gains; they are local arrangements, not additional upstream program entries.

## Renderer components and limits of attribution

The original lab reports an adaptation; the following are code comparisons against the stated snapshot. “Adapted/inspired” describes observable resemblance and reported lineage, not proof of copied lines or a historical revision. No complete textual diff or authorship audit was performed.

- **Field vocabulary and operators — reported adaptation / similar interface.** Upstream `setTimbre` (968) and `_note` (1017) use the same general `g,w,t,f,v,a,h,d,s,r,p,q,k` vocabulary and multi-operator oscillators; local `patches.js` (32–47) and `scheduleOnAudioContext` (641 onward) use a related representation. Local defaults and semantics differ, so matching names are not behavioral equivalence. In particular upstream computes frequency as target frequency × `t` + `f`, while local uses `f` as an override when nonzero (`synth-engine.js:786`). Local code does not implement upstream `p`/`q` pitch-sweep behavior; its recipes set both to zero while upstream defaults are 1.
- **Envelope and routing — custom, similar concepts, not exact.** Upstream `_note` uses linear attack and `setTargetAtTime` for decay, and `_releaseNote` (1096) uses a target release; local operator scheduling (785–853) uses linear ramps, minimum attack/decay/release values, finite oscillator stops and a separate `voiceGain`. Upstream routes `g=0` to channel volume, `1–10` to another oscillator frequency or noise playback rate, and `g>10` to another operator gain; local routes `g=0` to its voice bus and positive `g` only to a target with an oscillator `frequency`. Thus the data-level table does not establish identical routing, velocity response or envelopes.
- **Key scaling and noise — custom / related idea, not exact.** Upstream applies `2^((note-60)/12*k)` to operator gain in `_note`, without the local 0.25–4 clamp. Local applies a clamped scale to decay duration and selected operator gain/modulation paths (`synth-engine.js:785–821`). Upstream makes distinct `n0` and `n1` noise buffers (1335 onward), loops and pitch-scales them; local uses a seeded finite generated noise buffer for either noise label (`synth-engine.js:109,795–801`) without that same loop/playback-rate behavior. This comparison establishes differences, not the quality or origin of the local sounds.
- **Scheduling, room effect and export — local implementation; lineage of individual ideas unknown.** Local `buildScheduledScore` (323), graph scheduler (641), deterministic room impulse (160), WAV encoder (1039), offline render and wrap (1143), v4 manifest and lab UI provide a report-local arrangement workflow. The upstream object implements a broader MIDI-like synth/player and its own scheduling and reverb. The present comparison does not establish that these local components were copied from this reference or that every feature is independent; it does establish they are not the full upstream library. Separate audible results and license conclusions cannot be inferred from a table comparison.

## Narrow question for the original author

Can the original author provide the actual source URL and immutable revision or downloaded file/hash used for the v3 recipes and scheduler, plus the extraction/modification record or original working notes for each program? If no such record exists, say so. That evidence could establish historical provenance; resemblance to the comparison snapshot cannot.
