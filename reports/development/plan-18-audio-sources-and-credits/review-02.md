# Plan 18 Repair 01 — technically accepted for owner audition

**Date:** 2026-10-25. **Input:** `7d3b885`, plus root's small inline audition-control corrections. **Disposition:** no further implementer repair. Ready for owner sample/role/Credits selection, not production integration or packet completion. All five candidate binaries remain unchanged; all three quacks remain reference options.

## Verified repair

- Six parity tests pass: current source hash, presets, validation/durations and actual bundled C graph routing/fallback. The page loads the reproducibly compiled authoritative synth rather than a hand-coded approximation. Source presets and graph stay unchanged.
- Root reran `review-01-file-checks.mjs`: all five hashes still match, header/granule durations reproduce and click PCM peak/RMS reproduce. No Ogg decoding, acoustic level-matching or audible loop-seam proof is implied.
- Provenance pins MacLeod's downloaded Ogg to CC BY3.0, records the actual source/retrieval lineage and corrects Kenney's Music Jingles source. Candidate C is no longer presented as owner-selected primary audio. Claims of zero latency, unmeasured Ogg levels, perfect looping and blanket browser support are qualified/removed.
- Recorded playback awaits/catches start failures. Stop All pauses/reset media and closes the module's active Web Audio context. Credits now has opening/settings buttons and native modal open/close with opener restoration. Root's inspection establishes those code paths, not a native-dialog/AT conformance result.

## Inline corrections and targeted checks

Cold read-only Luna-high review identified three remaining audition-glue defects, independently verified by root: master volume0 could pass invalid zero gain into the source validator; mute/slider changes only affected media, not a currently sounding synth; audio-start could say ready for a null context.

Root fixed these within `audition.html`, with no production/shared module or candidate changes. A private audition output GainNode provides live master volume/mute while unchanged source presets/graphs are invoked through an injected context facade. Native context methods remain bound to their real context. Muted/zero-volume clicks schedule no new synth and report silence; source errors/unavailable contexts produce status instead of false ready/playing. Stop All clears private routing when the module context closes.

`review-02-controller-checks.mjs` executes the real inline controller using DOM/media stubs and the actual source synth implementation. It passes checks for unchanged preset identity, actual graph invocation, live synth/media mute, live master gain changes, zero volume, Stop All context close, media rejection and missing context. Native-method binding is asserted by context stubs. The six bundle/parity tests still pass after these edits.

## Owner gate and limits

Listen to the three effects and two music candidates in the repaired audition, check repeated/loop use at a comfortable device volume, and select/decline roles individually. A quieter synthC is an observed owner preference datum, not a selected primary sound or proof of measured recognizability. The two-context music direction remains a recommendation; exact tracks/loop treatment/Credits adoption need owner selection. No all-five automatic adoption.

Root did not perform a new browser playback, output-level, loop-seam, native-dialog, screen-reader or classroom-device session. Controller stubs plus parity/files establish a bounded technical witness; listening and final context/pacing remain owner review and later integration work. Existing repository tests do not establish this isolated audition's behavior. Packet stays delivered until owner selection; production work remains separately scoped. Existing consultation declaration is retained; no new provider mechanism requires upstream export.
