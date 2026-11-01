# Plan 39 — Codex technical completion

Owner assigns this repair in C:/AI/Quackpot on2026-10-31. Read AGENTS.md, implementer contract, docs/development/plan-39-melody-reference-and-web-audio-laboratory.md and reports/orchestration/plan-39-v3-review-01.md. Run packet check through the existing bounded launcher before starting. Repair the existing laboratory in place, preserving the owner's selected M1–M6 repertoire, original C0 and all musical histories. Do not send this back to Argon or restart composition.

## Scope and authority

Own the existing reports/development/plan-39-melody-reference-and-web-audio-laboratory/ lab, focused tests, provenance/notices, updated guide and NEW repair evidence. Preserve original research, score content and historical exports; don't overwrite old exports and present them as new evidence. Production src, package dependencies, Plan43, owner saves and packet status are outside your ownership. Plan43 is assigned but not dispatched; its eventual research is independent, and it must not duplicate your baseline repairs. Plan44 owns separate production Receipt work. You are not alone: don't revert others' changes, stage explicit paths and wait on live index locks.

Existing root repairs retain the offline-render concurrency lock after UI timeout until actual settlement and bound retained export URLs. Preserve and regression-check those fixes. Finish these six reviewed items:

1. Reconcile audition and exported mix/gain, or clearly separate playback-only volume from serialized arrangement gain. Settings and UI must say exactly what the export contains.
2. Use an explicit musical duration/loop contract. Live uses a DOM-timed restart while WAV currently overlaps tails; correct relevant inconsistencies and verify repeated joins. Do not claim sample-identical outputs unless actually demonstrated. Duration labels derive from score and tempo.
3. Account for the longest selected lead/chord/bass/effect tails and wrap behavior without clipping releases or accumulating energy.
4. Validate complete arrangement round trips: motif, harmony, instruments/patches, bass, tempo, layers/mix and versioned controls. Reject unsupported/malformed settings safely. Preserve intentional M1/M2 variations as such, with canonical C0 separately identified.
5. Establish exact TinySynth-derived source revision/recipe provenance, license and local notices/modifications using primary upstream evidence. Describe the actual custom renderer accurately; no claim the entire upstream library is present. If origin cannot be established, report it rather than invent a pin or silently replace the sound.
6. Provide bounded browser/export evidence for representative arrangements, repeated export/cleanup, rapid stop/cancellation/timeout, settings restore and live/WAV loop comparisons. Preserve distinctions between executable checks, listening observations and unverified devices.

Start with a short repair map and source/resource baseline in the report folder. These identified fixes are authorized through implementation and delivery; do not stop for another proposal round on ordinary choices. Escalate material sonic changes, new dependencies/samples, musical rewriting or broader renderer architecture. Prefer preserving score/patch choices and fixing scheduling/accounting. If a change audibly alters an accepted rendition, present a labelled before/after to owner rather than silently replacing it.

## Resources and evidence

Preflight visible Node/process memory before each batch. All Node through unchanged reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1: named serial tests, 1GiB heap/2GiB sampled owned tree/90s. No watchers, large matrix, ML/packages, mutation storms or unknown process termination. Browser audio needs its own graph/voice/event/buffer/output bounds: the Node limiter does not cap browser memory. One render at a time; lock through actual settlement after timeout; finite exports/URLs and explicit cleanup. Current short scores are the repair test scope, not new two-minute tracks.

Coordinate finite server/browser/audio turns with QP Orch; use isolated state and protect owner storage and existing services. Start with a small representative matrix including a sustained non-lead tail, varied patches/layers/tempo and canonical control. Test known failure modes rather than every possible combination. Metrics are sample peak/RMS unless another measurement is actually implemented; they are not LUFS/true peak or proof of musical quality. No runtime network; research browsing is permitted and required for exact current upstream facts.

## Review and final handoff

One read-only default-role **gpt-6.1-terra, explicit medium** pre-delivery reviewer is authorized after implementation. Use a self-contained brief, record availability/settings and disposition findings; no automatic repeated repair-review budget. Main implementer owns fixes. Repository delegation discipline permits bounded helpers with cold briefs and a single writer; no nested fanout.

Once owner connects/authorizes the chat, send root milestones, genuine blockers and final hashes. Commit source/evidence first and progress last. Do not set packet status, push or deploy. Final package lists disposition for each of the six findings, bounded test/browser evidence and listening limits, exact source hashes/licensing and a reproducible verified baseline that Plan43 can pin. Root reviews technical completion; owner re-listens only where sound changed or the playback/export experience needs judgment. Plan39 closure and Plan43 reuse follow root/owner acceptance, not implementer self-certification.
