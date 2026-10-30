---
id: plan-39
title: Melody reference and Web Audio laboratory
status: ready
depends_on: [plan-33]
gate: "Owner authorizes Argon/Flash report-local composition, harness and export experiments on 2026-10-30. Ready for assignment; owner listening selects results, production adoption separate."
superseded_by: null
resolution: null
summary: >-
  Build a local Web Audio audition and WAV-export laboratory for melody C continuations, light arrangements and reusable symbolic scores, informed by accepted music research and owner listening.
---
# Plan 39: Melody reference and Web Audio laboratory

## Packet Metadata

- Packet id: plan-39
- Packet title: Melody reference and Web Audio laboratory
- Status: (see frontmatter)
- Owner/model: Gemini Argon lead, Flash composition/research/coding workers; awaiting launch
- Date: 2026-10-30
- Packet type: investigation / executable prototype
- Mutation level: report-local source and generated-local exports
- Approval gate: scoped experiments authorized; owner listening before selection or production adoption
- Expected artifacts: research synthesis, editable scores/patches, HTML audition/export tool, checks, selected-reference workflow and progress report

## Goal and why this packet exists

The selected Lucky Ripple C reference lasts about 4.92 seconds including release, below the six-second minimum the owner encounters in Suno. Earlier long C extensions were rejected; Gemini's full tracks were musically appealing to the owner but usually did not retain C recognizably. Build a better composition and reference-authoring workflow: audition short continuations, accompaniment-led treatments, voicings and synthesized instrument choices, then explicitly export a chosen reference for the owner's external generation experiments. Reusable score/rendering architecture is useful future pipeline work, not production readiness.

## Non-goals and dependencies

Plan 33's accepted research is the completed dependency. Plan 32 remains open historical/parallel music exploration, not a blocking unfinished implementation dependency. Preserve its selected C, rejected extensions and generated references. No runtime game changes, soundtrack adoption, paid-service calls, automated uploads, credential handling, model downloads, ML transcription, huge soundfonts, npm installs or new dependency by default. No dark/ominous arrangements in this pass. No general DAW, unrestricted score editor or full MIDI sequencer required.

## Authority and reading

Read AGENTS.md, docs/decision-log.md, docs/development/README.md, docs/repo-structure.md, relevant audio/provenance constraints in docs/founding/design.md, and the implementer starting prompt. Focused inputs:

- reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/motifs.js: selected motif C note/beat data and original synth parameters. Verify against preserved history and reference, never overwrite them.
- Same Plan 32 folder: motif-preview/history/attempt-02/plan32-motif-c.wav, reference-conditioning-study/research-01.md, and prior composition-extension-proposal.md / composition-extensions.js as rejected-history context, not templates to repeat.
- reports/development/plan-33-recognizable-music-emotional-transformation-research/recommendation.md, composition-brief.md, transformation-matrix.md and transition-contract.md. Follow evidence labels and limits; its old exact five-render scope is historical, not the scope of this new owner-authorized experiment.
- reports/orchestration/plan-39-argon-starting-handoff.md.

Verified initial technical sources, 2026-10-30: https://help.suno.com/en/articles/2477633 documents 6–60-second uploads with account-specific upper limits; https://suno.com/products/covers describes audio-based melody preservation, a product claim rather than a fidelity guarantee; https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext describes rendering a graph to AudioBuffer. Recheck current service modes before advising the owner. An attached file or an audio-analysis response does not establish melody conditioning in Gemini Create music.

## Ownership and delegation

Own only NEW reports/development/plan-39-melody-reference-and-web-audio-laboratory/ and its subfolders. No edits to Plan 32/33 inputs, shared src, package.json, root guidance, status, other reports or production. Plan 38 and the design-review pilot can proceed independently. Leave unfamiliar working-tree changes alone.

Argon should use Flash workers for much of the research, candidate score authoring, renderer work, harness work and focused checking. No numerical call cap; assign bounded outputs and avoid a cross-product of experiments or duplicated full-repo surveys. One lead integrates. Agree a small shared score/patch interface first; give workers disjoint folders or isolated patches. One writer owns each shared file and git integration; serialize writes if isolation is unavailable. Leaf workers do not fan out. Verify model selectors actually available and record actual use without relying on self-report as verified model identity.

## Work plan and execution latitude

### 1. Ground the musical brief cheaply

Reuse Plan 33 before new searches. Write a concise music brief covering C's rhythmic/interval identity, phrase/answer/cadence, voice leading and melodic register, arrangement space, timbral intelligibility, loop form and listening fatigue. Argon's own compositional judgment is welcome; label craft hypotheses separately from empirical findings. Verify newly load-bearing claims against primary publications or first-party composer/technical accounts. Preserve citations and uncertainty; don't claim theory predicts everyone's response.

If gaps justify external deep research, write two or three self-contained prompts and name what experiment each would change. The owner may run them externally. Do not make receipt of new reports a prerequisite for the unchanged-C control or a first small laboratory; if reports arrive, integrate them with explicit provenance and version new scores rather than silently replacing owner-auditioned material. Suggested questions are supplied in the handoff.

### 2. Build a compact musical candidate set

Always offer (a) original C as a historical control and (b) two exact musical repetitions of C at its original tempo, approximately 9.6 seconds plus release, as a length-sufficient control. No silence padding or tempo stretching as the main solution. Verify the actual resulting duration.

Then propose and implement a curated first set, approximately three distinct C-derived continuation/form ideas and three contrasting light arrangement families. This is a starting size, not a quota or nine-cell compulsory matrix. Examples: antecedent/answer with clear cadence; call/response with breathing room; accompaniment-led form with intermittent C returns. At least one C anchor occurrence retains its exact pitches, onset beats and durations; label transformations elsewhere explicitly. Preserve comparison against that anchor. Do not claim an extension is accepted merely because it is tonal or passes a structural check.

Explore restrained chord/voicing alternatives compatible with C, e.g. bright resolved support, gentle floating/added-note color, lightly playful syncopated accompaniment; keep bass and lead intelligible and avoid hiding the tune under doubled voices. Patch candidates may use clean pluck/bell, warm keyboard and light arcade/toy-like synth voices. Do not imitate a named artist or substitute crude quack SFX. Keep beginning-of-game mood inviting and readable. Offer melody alone, backing alone and full arrangement. C need not sound continuously.

New core motifs are authorized as a small, clearly separated optional comparison if research or listening suggests C is a poor foundation; keep C and the owner's prior choice intact until the owner selects otherwise. Do not launch a large competing-melody hunt.

### 3. Shared symbolic source and audio graph

Use editable versioned note events (track, beat, MIDI pitch, duration, velocity), tempo/meter/bar sections, chords/voicings and text synthesis patches. Store explicit candidate IDs, parent/anchor, provenance and any seed. Do not call an oscillator preset an authentic sampled instrument. Use original synthesized patches first; no downloaded sample library required.

One validated score and graph-building path must support AudioContext audition and OfflineAudioContext export. Schedule on audio time, not DOM timers. Separate score generation from synthesis and UI. Deterministic event data and seeded variation where used; don't promise byte-identical cross-browser waveform rendering. No eval or executable imports from user configuration.

### 4. Owner-facing local laboratory

Create index.html and focused modules/styles. Another Flash worker may own the HTML comparison harness against the agreed interface. Provide readable candidate cards and a small set of supported controls for form, harmony, patch, tempo and layer mute/solo, not dozens of unexplained technical sliders. Label unsupported combinations rather than composing arbitrary broken combinations silently. Include short musical intent descriptions, duration, anchor/changed sections and a simple phrase/track visualization where useful. Provide direct A/B against C and the repeated control, clear Play/Stop, optional loop and master volume; no autoplay. Never overlap auditions accidentally; rapid switch/stop and teardown clean up voices and timers. Honor reduced-motion for visuals and keep keyboard controls accessible.

Local favorites/notes and settings export/import may be included; any storage is separate namespaced laboratory data, never game save storage. Validate imported data, bound sizes/ranges, reject unknown versions safely and never overwrite damaged stored choices silently. Prefer JSON download if persistence would add disproportionate complexity.

### 5. Export selected references

Mandatory exports: full mix WAV, melody-only WAV and editable score/settings/provenance JSON. Backing-only WAV is useful and modest if the architecture already supports layer solo. MIDI export is optional after core delivery; do not expand into a MIDI editor. WAV is the external upload artifact, JSON is the composition authority, MIDI if present does not preserve synthesis timbre by itself.

Render a finite arrangement through OfflineAudioContext, encode a valid PCM WAV locally and download only on explicit owner action. Use a documented sample rate/channel count and a complete musical phrase plus release. Favor 10–30-second references; support at most 60 seconds and one offline job at a time, with bounded voices/events and released buffers/object URLs. Validate size before allocation, stop gracefully on failure and avoid retaining many rendered buffers. No realtime MediaRecorder capture or silent padding shortcut. Display actual duration, peak and RMS; aim for consistent audition level with headroom and no clipping. Do not label RMS or sample peak as LUFS/true peak; use those terms only if actually measured. Separate musical differences from simple loudness advantages.

The mix and melody-only exports must contain the same chosen lead events. Export settings include score/patch/schema versions, candidate/seed, tempo, layer gains, render format and attribution/origin. Keep old exports distinct, never silently replace originals. Avoid large pre-rendered repository batches; ignored local exports plus committed compact scores are preferred. External Suno/Gemini upload, generation quotas and rights acceptance remain the owner's actions. No guarantee either service will preserve melody.

### 6. Verify, iterate with owner, deliver

Scoped implementation, composition/rendering, bounded tests and proportionate browser passes are authorized on assignment without another pre-render proposal gate. Work directly with the owner on listening and revise within scope; orchestration returns only for substantive scope/contracts/resource issues or final delivery. No routine per-run permission churn.

All Node jobs must use the unchanged reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1, serially, with the established 1 GiB heap / 2 GiB sampled owned-tree / 90-second limits. Check processes first; never stop unrelated Node/Codex work. No Node-based batch audio renderer required; this is browser Web Audio. Reuse an approved dev server and coordinate access only when actually sharing a browser surface. Do not start/stop another implementer's server or control its tab. No background jobs, watcher, install or ML inference.

## Validation Checklist

- [ ] Reference and repeated-control pitch/onset/duration data match C; repetition joins retain the full last note and no unintended gap/overlap.
- [ ] Scores/controls have finite validated bounds; reproducible event generation and seed/source versions are recorded.
- [ ] Playback and offline export use the same scheduling/patch path; fast switches, stop, loop and repeated exports release resources.
- [ ] Export WAV headers/sample counts/duration/channel format parse correctly; no NaNs or clipped samples. Compare scheduled lead events for solo and mix. Round-trip exported settings reproduces the chosen event structure.
- [ ] Owner-facing audition/export works in a real browser; inspect/hear the downloaded WAV as well as in-page playback. Do not infer sonic quality from a fake AudioContext test.
- [ ] Name what was actually heard by owner/model/harness. Automated tests establish structure, not melodic quality or future generator fidelity. Human listening is the selection gate.
- [ ] Preserve original/rejected materials, report source/read-only boundaries, no production imports or external runtime assets.
- [ ] Progress includes research dispositions, candidate/source map, actual delegated work, verification limits, current service-mode guidance and a short owner listening route.

## Stop conditions and delivery

Escalate production mutation, unbounded renderer, missing harness capability that prevents core work, new dependency/download requirement or substantive ownership conflict. A missing nested/subagent tool should usually lead to a simpler implementation, not a blocker. Record consultation posture; no paid higher-tier advisor is required or authorized beyond the Argon lead and Flash tasks. Do not set packet completion status. Commit explicit owned source/research/evidence paths, progress last; never push. Deliver progress.md under the owned report folder with the local audition URL and exported reference workflow.
