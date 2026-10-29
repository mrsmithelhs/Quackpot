# Plan 32 — Codex starting handoff

Owner assignment 2026-10-29: Plan 33 research is accepted for closure; Plan 32 is assigned in-progress to a fresh Codex implementer. Other provider augmentation is possible later but is not assigned or budgeted here. Work in C:/AI/Quackpot. Root QP Orch coordinates; the owner will connect your thread for two-way supervision after starting it.

## Read first and report a proposal

Read AGENTS.md, docs/agent-starting-prompts/implementer-prompt.md, docs/development/plan-32-gacha-music-hook-and-arrangement-prototypes.md, relevant Assets/Receipt sections of docs/founding/design.md, docs/repo-structure.md, and reports/orchestration/plan-33-repair-review-01.md. Then read Plan 33's repaired recommendation.md, composition-brief.md, transformation-matrix.md and transition-contract.md under reports/development/plan-33-recognizable-music-emotional-transformation-research/. Read source evidence selectively if a proposal depends on it; do not repeat the literature investigation.

Inspect git status and relevant process memory first. Run the required plan-status check once through the existing read-only reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 with -Executable node.exe -ArgumentVector @('scripts/dev/plan-status.js','check','plan-32'). Coordinate with root before Node if Plan 16's proof is active. Nonzero means stop/report. One short guarded preflight only; no other executable batch before root clearance. Unrelated small Node processes alone do not imply a conflict; no concurrent known Quackpot test/render/server, no large/growing memory consumer, never kill unrelated processes. The owner experienced a 21GB Node process; keep all later jobs serial, finite and resource bounded.

Your initial deliverable is proposal.md, not audio. Own NEW reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/ only. Source art/audio/app, selected Plan 18 catalog/pools, other reports, packets/status and canonical docs remain read-only. Plan 16 owns checkpoint proof; Plan 27 retained layout alternatives are unrelated. Do not modify src/audio/synth.mjs: it is a sound-effect proof, not an adopted music sequencer.

## Musical objective and lean first pass

Create a recognizable original gacha hook whose arrangement can become uneasy and dire as the fictional character's story worsens. This is an expressive design, not a physiological/addiction classifier. Preserve Receipt honesty and no actual-player motive/effect claims. Original means no intentional copying and an auditable composition record, not a claim that no common interval ever occurred in another tune.

First propose two or three brief motif concepts in editable text notation with plain descriptions of rhythm, contour and instrumentation. Recommend one; do not render all candidates or every arrangement without a gate. Proposed baseline: an 8-bar 4/4 loop around100bpm, 19.2s, with a small distinctive5–9-note phrase and room to breathe. Musical judgment may suggest a justified revision. The owner selects motif/listening brief before generation. Include a bare-melody check in the proposal and specify how it can be evaluated without silently adding a large sixth audition/render suite.

After separate owner/root approval of the motif and rendering mechanism, target exactly five first-pass full-loop renderings:

1. Base: bright, inviting, lightly bouncy and comfortable during reading.
2. Foil: different original melody, same general style/tempo/palette, to clarify different versus same tune judgments.
3. Uneasy: same main hook; accompaniment loses some comfort without becoming horror.
4. Dire-Clean: main hook and original lead patch over restrained, sparse, unresolved pressure.
5. Dire-Filtered: identical Dire backing and note data, changing only gentle lead low-pass filtering. No detuning mixed into this comparison.

Retain main-hook notes/rhythm/tempo/tonal center for these arrangement comparisons. Proposed bass ranges/chords/roughness/dynamic values in Plan 33 are hypotheses and craft starting points, not mandatory formulas or proven laptop audibility. Avoid harshness or startling loudness. Full melodic/modal/tempo changes, dense horror alternatives, detuning and extra texture variants remain deferred. No story-trigger map or production playback architecture is selected.

## Rendering and audition proposal requirements

Explain exact files/source representation, deterministic scheduling, seed if noise is used, oscillator/instrument palette, envelopes, loop/release-tail treatment, output format/sample rate/channels, tool/dependency availability, finite render time/memory and owner audition UI. Prefer existing local capabilities and small inspectable note/event data. No new package installation, library adoption, audio download, external service generation or render job is authorized by assignment. If available tools cannot make musical-quality results, surface that early with a small proposed provider handoff rather than spending many bad generations.

Plan 33 proposes matching integrated loudness around -16 LUFS within0.5LU, with a true-peak ceiling of -1 dBTP (correct notation; the report sometimes says dBFS true peak). Treat those as proposed audition conventions. Identify actual measurement tooling before promising LUFS/true-peak verification; RMS is not interchangeable. If tools are unavailable propose an honest alternative for owner/root approval. Record peak headroom, avoid clipping, and distinguish measured from perceived loudness. No synthesis/decoder/performance claim based solely on downloaded file size. At48kHz stereo float32 a19.2s buffer is7.3728MB decimal; five decoded files36.864MB if all loaded. Prefer one active audition at a time, explicit play gesture, stop old sources before switching, bounded looping, immediate mute/stop and cleanup on page exit. No production import of report assets.

The audition should allow the owner to compare same-tune/foil, mood ordering/salience, clean versus filtered lead, brief repetition comfort/seams and a quick speaker check. Owner listening is art direction, not a participant experiment or population evidence. No student data or listening telemetry. Browser/hosting/rendering scope goes to root before launch; use an approved isolated harness and existing server where suitable, do not take owner tabs or launch a new hosting stack. The old synthesized quacks are not part of this audition.

## Gates, reviewers and delivery

Stop first with proposal.md and a concise recommendation, exact file/tool/resource plan and owner listening-brief decisions. Root may review routine mechanism/file choices; owner motif/listening approval is required before generating tracks. Assignment is not approval to install libraries or render. If root connection is not yet authorized, return the proposal to the owner for relay; no unauthorized cross-thread messaging.

No initial subagent budget. Root may authorize ONE read-only Terra-medium reviewer after implemented renderer/audition and before delivery, judging actual risk; no automatic preproposal/repeated repair reviews, no nested fanout. Model/provider augmentation requires a later explicit brief/budget. State consultation posture even when no consultation is warranted.

Final artifacts after approved generation: editable composition source/provenance, renderer usage and bounded commands, exact five named audio files, compact accessible local audition, actual loudness/seam/source checks, known device/browser/comfort limits, and progress.md. Owner selects audible results before any asset promotion or production integration. Commit explicit own paths and progress last, never push/deploy or set packet status. Report clearly what was heard/measured/generated versus merely proposed.
