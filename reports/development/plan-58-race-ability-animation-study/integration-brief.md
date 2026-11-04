# Plan 58 — production integration brief (proposal only)

This is a **report-local handoff, not permission to change the game**. The owner-selected study directions and evidence limits are in `selection-and-evidence.md`. Plan55 and Plan57 are complete report-only investigations; their production integration remains separately scoped. The next integration packet must reconcile their current handoffs, Plan52's shared ownership/checkpoint state, and actual current code before deciding what to implement. Ability concept names, eligibility, durations, activation probability, collision behavior, growth and balance are not adopted merely by these visuals. No runtime import of `reports/` is allowed.

## Current seams, pinned for orientation

The following hashes are the actual files at consolidation, SHA-256. They are **drift indicators, not authorization or proof of event compatibility**. Re-read and re-pin before an integration.

| File | SHA-256 | Current role |
| --- | --- | --- |
| `src/ui/race-view.js` | `d04f2fa57c41be7060a3427eceec73cbeb3b77c8d6d12d7b4bcd11b582b4a074` | Renders race runners from digital rig and projects selected resolution events into playback/timeline. |
| `src/ui/race-motion-controller.mjs` | `1c4aa11ba8ccd81532b519e435898394f2e4ed18c13943fa2610c399efce1191` | Owns race duck motion lifecycle and currently handles contact presentation; not an implemented ability event contract. |
| `src/ui/duck-rig-view.mjs` | `e996129c859bb1602e3646c7c3607d37f64e88ef3d611bf16de91021e77fa4a7` | Composes digital duck SVG. |
| `src/core/duck-rig.mjs` | `389f18ae5b391e0b3922a183c8ffe2c8d776bd35b8feefa47b72c067d774f793` | Supplies current digital rig layer groups and accessory slots. |

Report-local comparison reference (do not import into the student game):

| File | SHA-256 | Role |
| --- | --- | --- |
| `gallery/fixtures.mjs` | `8033bd125bad70d9ea5d071f4223cff34af31a50bfaab8c1ab2b0ba189fa43a2` | Synthetic time-coded opportunities, activations, contact, source and targets. |
| `gallery/gallery.mjs` | `679b9eb7965f2369eac82fd99dcf23c6f7417ba048c0c83643b819f0e02ba5f0` | Study-only instance renderer, layout, label and time controls. |
| `gallery/gallery.css` | `5f8dc4bae5536404014a6b748845996143ba5eadb6a0409036538ecfcf7c344b` | Study dimensions and compositing, not production styles. |
| `gallery/revision-effects.mjs` | `3ee89813f8d127452cf89f1f0d7b5430abbd9ba7c408ca59cec034033ac73a6e` | Selected Bounce pad and crowd wave/air visual geometry. |
| `gallery/candidate-effects.mjs` | `b3447007eb0f284f52466e9e6b163b75cb51ff4d4c6a90b3ffbcab2b06831972` | Guard, Quick Recovery and Dive study elements. |
| `gallery/alternatives-effects.mjs` | `627c2409120f56dd9afad8c302375fb39ac94e748c7416687db7dccdbd03bd93` | Wide Flap, Flap Ahead, Draft and local pose studies. |
| `gallery/final-three-effects.mjs` | `c281614986b4d0789e8d14bd47a590de1ef32c8f7543fd375fc20318fa7e9693` | Straight Shooter, combined Steady Nerves A, Wake Break study geometry. |

The Plan57 selected bandage reference is copied report-locally as `art/plan57-adhesive-bandage.svg`, source/hash and owner-selection status in `plan57-bandage-reference.md`. Plan57 also selected angular pop, scattered fragments, earlier burst A and a one-second participant white return. Its report-local samples are not a production integration or a deterministic variation contract.

## Required contract before implementation

1. **Admit real semantic events, not gallery guesses.** The future resolver/playback handoff needs an identified source, relevant targets, actual opportunity versus activation, start and end/cancel, independent contact/injury and an honest timeline. Reconcile current Plan55 event/seed/replay proposals and actual production seams before defining any schema. A predicted threat is not a contact or evidence of avoidance; a visual activation must never create effects, injuries, reward changes or guaranteed outcomes.
2. **Resolve finish and cancellation.** Define what happens to active/pending presentation when an entrant finishes, an eligible leader/follower leaves or finishes, an ability ends/cancels, the user seeks, navigates, pauses or closes the race. Current Plan58 has no finish/cancel fixture; its no-trigger and end cases are not proof of this behavior. Keep true finish crossing order, lifecycle and already-selected race presentation intact.
3. **Choose a bounded port, not a monolithic copy.** Root should pin the precise race playback event seam, affected runner/view neighbors, effect-layer ownership, and source/target semantics under `docs/workflows/production-integration-review.md`. Use local game-owned SVG source and focused modules. Do not import study code/assets into runtime or infer that every candidate becomes a ship requirement. Keep the physical companion out of digital rig animation.
4. **Separate transforms and ownership.** World position and heading, body/wing/head articulation, ground effects, behind/foreground motion graphics, labels and injury markers have different anchors. Head/bill/eye/hat move together; the neck accessory remains body-anchored. Do not mirror upright text, paint over a face, detach accessories, or let a foreground effect hide a target. Decide palette-aware bridge geometry on real rigs. Test colors, accessories, headings, Y turns and actual race scale with named participants.
5. **Preserve access and lifecycle.** Define static/reduced-motion representations of actual participant/event facts, not a fabricated benefit. Pause/seek/replay must reconstruct the same state, preserve independent instances and cleanly dispose listeners, animation handles and nodes. Gallery evidence is manual static and CDP-emulated reduced motion; actual OS/AT and real-device coverage remain open.
6. **Respect event, save and Receipt boundaries.** The integration must coordinate with Plan55's current ownership and Plan52's stable checkpoint; preserve seeded deterministic resolution, real individual finish ordering, resolve-once reward lifecycle, historical/new supported replay policy and append-only Receipt facts. Animation frame state must not change rewards, random draws, storage or the Receipt. Any save/replay/event versioning and unsupported development-save behavior require the applicable production review, not an inference from this gallery.
7. **Port explanation contexts separately.** The report-local Duck-Dex and racer-selection demos are genuinely enlarged but share renderer/copy. Any production discovery/selection UI needs its own accepted content, navigation and optional replay/static decisions; the gallery headings do not establish those requirements. No compulsory watching.

## Validation and decision boundaries

Use actual before/after production views and focused event/reload tests under the production integration workflow. Cover selected visual source and target, no-activation controls, simultaneous/successive effects, actual contact and injury, underwater location, dynamic heading/turns, accessibility equivalents, and post-finish cancellation once its policy is explicitly chosen. Preserve a collision/ability event truth matrix and check any perceived ability outcome against actual events. Verify offline static output and local licenses/provenance if porting art. Historical still captures, source tests, CDP emulation and the owner's study approval are not proof of production rendering, accessibility or balance.

Owner has selected study visual directions; QP Orch and owner still decide investigation closure and any future production packet. Burst lacks a defined discrete activation and remains deferred. No Plan58 packet status, production files, runtime dependencies, pushes or deployment are changed by this brief.
