# Plan 39 v3 technical review and owner musical direction

Date: 2026-10-31. Delivery baseline: d81462c. Status: delivered, not closed or production-adopted.

Owner reports substantially improved quality after iteration and selects a variety of M1–M6 as reference hooks for differing gacha situations. Not every variation needs an external generated cover. Preserve the original C control and all variation histories. Root has not independently listened to this delivery; musical preference is the owner's evidence.

## Review and immediate repairs

Requested one read-only default-role gpt-6.1-terra reviewer at explicit medium effort. Its source review found timeout overlap, accumulated export URLs, live/export gain and loop differences, incomplete tail accounting, narrow manifest round-trip checks and incomplete source provenance. These are source findings; neither reviewer nor root performed a fresh browser/audio matrix.

A bounded Terra-medium implementation child repaired only resource lifecycle in the report's lab/synth-engine.js, lab/laboratory.js and lab/laboratory.test.mjs. Root inspected the diff. Offline timeout now retains the renderer lock until the underlying render settles, including a late rejection. The gallery retains five export bundles, revoking evicted WAV/settings URLs; transient note-download URLs and page-hide resources are released. No scores, patches or sonic settings changed.

Root ran the exact laboratory.test.mjs through the unchanged Plan 25 bounded launcher, serial test concurrency 1: **8/8 pass**, exit 0, approximately 0.53 seconds, no stop reason or cleanup notes. The new injected renderer test exercises timeout, refusal of overlap, late rejection and subsequent reuse. The URL eviction change was source-reviewed, not browser-exercised. Short-run sampled memory does not establish worst-case audio memory. No browser, large render, server or watcher was launched.

## Remaining technical work before closure/scaling

1. Clarify or reconcile live audition gain versus exported gain, recording actual export settings. The slider's zero case is not ordinarily reachable and is not asserted as a UI defect.
2. Live looping restarts on a DOM timer, whereas WAV export overlap-adds a tail. Reconcile or explicitly distinguish them; derive duration labels from the selected score/tempo. No seamless live/export parity claim yet.
3. Compute render tail requirements across all selected voices/effects, not only the lead, so sustained chord/bass/reverb material is not silently truncated.
4. Strengthen settings round-trip verification beyond the canonical lead: chord/bass/patch/version and restored controls, or narrow the claim. Preserve the original packet's repeated-exact-C reference as a distinct control if still needed; do not mislabel owner-authorized M1/M2 alterations as accidental corruption.
5. Pin the exact TinySynth source revision and adapted program recipes; preserve applicable license/notices and modification records. This is a custom renderer using TinySynth-derived recipes, not evidence that the full upstream library is integrated. Upstream reference: https://github.com/g200kg/webaudio-tinysynth and its LICENSE.
6. Extend bounded browser evidence for repeated exports, cancellation/timeout lifecycle, selected arrangements, loop boundaries and actual WAV/live listening. Existing harness results cover selected cells, not the full score/preset/tempo matrix.

Do not return to Argon for these repairs: owner requests Flash or Codex Terra because Argon usage is nearly exhausted. Preserve musical content and use a bounded single-writer repair brief; ordinary fixes and focused reruns do not need repeated owner permissions. Production adoption and longer-track rendering remain gated. Plan 43 research may proceed independently, but executable reuse must pin a reviewed baseline and resolve relevant rendering issues before two-minute exports.

## Next composition investigation

Plan 43 captures six apartment styles and selected longer ordinary loops plus short motif-inflected counterparts. It is ready, unassigned. Research first; recommend two contrasting short pilots before expanding selected tracks. This does not reopen Plan 32 or select actual soundtrack assets, emotional triggers, or deployment.
