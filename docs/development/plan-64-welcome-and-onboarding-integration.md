---
id: plan-64
title: Welcome and onboarding integration
status: in-progress
depends_on: [plan-62]
gate: "Root approves the pinned visual reference, source ownership, save and Receipt lifecycle, and audio delivery before production writes. Owner reviews the integrated experience before closure."
summary: >-
  Make the accepted Plan 62 welcome and duck naming the entry to Quackpot.
  Connect real saved runs, Settings, Credits and post-run Receipt and usage
  actions while preserving the apartment and its existing game rules.
---
# Plan 64 — Welcome and onboarding integration

- Packet type — feature
- Mutation level — source-data
- Lead — Codex implementer, with a bounded read-only Terra-medium pre-delivery review
- Date — 2026-11-05
- Evidence — `reports/development/plan-64-welcome-and-onboarding-integration/progress.md`

## Purpose

Give the whole experience a recognizable entrance. A new player sees the welcome scene, meets and names the physical companion, then arrives at Day 1 Morning. A returning player can continue directly from the saved location. After a run, the same entrance offers a clear way to revisit the Receipt, download usage and start again.

Read DECISION-090 and the latest Plan 62 owner-accepted revision and closure record, the production integration review workflow, current source map and save, usage export and Receipt contracts. Treat the accepted rendered study as the visual reference. Use the actual game as the authority for mechanics, saves, Settings, export and Receipt.

## Pin the handoff before writing production source

Start from revision 04 frozen at `b739fb33` and its handoff at `e7f3f447`. The handoff freezes the reviewed study source and records that exact owner-browser byte identity was not independently captured. Reproduce that reference for paired captures, and pin the actual startup, restore, kitchen and terminal routes being replaced or retained. Update the compact integration record below with those pins and observable comparisons. If a reference artifact is local-only, hash it and document how root can review it. Keep the source ownership turn narrow. Startup routing, Settings, save dispatch and Receipt share production files with other packets. Root assigns the turn against their current commits.

| Category | Integration intent |
| --- | --- |
| Selected presentation | Match the accepted title and menu placement, room and furniture grounding, water band, occasional digital racers, rotating phone with eased orientation correction, and the TV/couch fade timing. During naming, dim the whole scene, keep the panel readable and light the stationary physical companion with the desk lamp. Preserve the accepted copy, editable name suggestion behavior and sound icon. Pin exact defaults and timings from the accepted revision. |
| Preserved game context | Existing apartment scenes, real save validation and schema dispatch, autosave preference, current controls and utilities, real Receipt and usage export, and the current accepted terminal behavior. |
| Study scaffolding | Replace scenario and audition selectors, example save/Receipt/export/modal actions and illustrative race effects with their appropriate production equivalents. Keep welcome racers cosmetic, including any accepted illustrative effects. Use separate cosmetic randomness and never start a real race, award points or write game events for them. |
| Deferred | New apartment tracks, actual race simulation on the welcome screen, new game rules, save-format cutover, and other packets' onboarding or ending changes. |

The frozen defaults are Title A and “A little room, a quiet moment, and a new day.” Use the revision 04 room geometry, with TV cabinet and couch grounded at the shared wall/floor boundary, raised desktop panel, taller water strip and a scene-wide naming dimmer. Match the physical duck and lamp layering in the rendered reference. The 30 editable name suggestions are source material. The alternate title and copy options remain study material.

## Route contract

| Entry or action | Expected result |
| --- | --- |
| Fresh entry | Welcome opens. Settings, Credits and usage download are available with truthful availability. Visiting the welcome screen alone does not start or save a run. |
| Start, then Back | Enter the accepted lamp-lit naming scene with an editable suggestion. Back restores welcome, focus and audio level without creating or replacing a run. Keep the suggestion stable while the form is open and separate its choice from gameplay RNG. Check it against the actual collectible roster. |
| Confirm naming | Apply the real companion setup and autosave preference once, then enter the existing first Morning route. Preserve name validation and fallback behavior. Retire the reachable duplicate kitchen naming and Start the morning controls. Keep the normal kitchen and returning desk routes. |
| Supported save and Continue | Resume the actual saved location without naming. Preserve policy dispatch, interruption and terminal restore behavior. Starting a different run must honor existing save-preservation and replacement safeguards. |
| Unsupported, corrupt or unavailable storage | Use the existing preservation and recovery policies. Expose only actions the underlying state supports. Preview and Back must leave saved bytes alone. |
| Settings or Credits | Open the real utility over welcome, pause presentation, and return focus and the previous state on dismiss. Preserve accessibility and reduced-motion preferences. |
| Receipt then welcome | Offer Start another run, View Receipt and Download usage file as applicable. Use the real retained terminal record and existing download mechanism. Reopening a Receipt must respect existing exactly-once evidence and retention policy. Resolve the handoff before changing any save-clearing behavior. |

## Art, audio and lifetime

Extract focused production modules and local SVG assets with provenance and no runtime imports from reports. Carry over the accepted M5 audition character, passage and fade envelope subject to the audio delivery gate. Confirm the exact artifact, its source and redistribution rights, local size/encoding, reproducibility and Credits. The private reconstruction is a reference until the rights and delivery plan are cleared. If unavailable, bring root an explicit choice. Do not silently substitute a different recording.

Reference audio is the Plan 53 M5 reconstruction with half-duration piano and softer low piano, `soft-offline.wav`, SHA-256 `76b610a56f0617d021f926b2979126ba8687abf06d4287ee07736fbe5ef3460b`. The first 30 seconds repeat with 3 seconds in, 24 at level and 3 out. Frozen scene gains are 100% opening and 25% naming, with one-second transitions. The synthetic apartment uses 50%. Record these separately from the envelope's 0.55 peak. Resolve any discrepancy with earlier gain notes at the source gate.

Use one audio owner across welcome and apartment with gesture activation, the accepted naming gain, Back restoration and fade out/in on handoff. Where apartment music is absent, fade into silence and leave a clear attachment seam. Muting, utility overlays, hidden pages, rapid navigation, disposal and reduced motion need bounded, predictable behavior. Keep the site static and offline at runtime.

## Acceptance evidence

- Compare the accepted study and actual integrated welcome, naming and first apartment at desktop and narrow sizes. Include enlarged text and reduced-motion checks for controls, focus, reachable content and stable artwork. Watch actual motion and listen through a loop and transitions. Still captures establish composition only.
- Exercise fresh Start/Back/confirm, supported Continue, preservation on unsupported or invalid saves, Settings/Credits return, and a genuine post-Receipt return with reopen/export and another-run choices. Use isolated synthetic starts and check save bytes, event counts and RNG where relevant. Test repeated activation and canceled replacement.
- Include the real neighboring apartment and Receipt surfaces in the review. Document any exact departure from the accepted study and why it was needed. Root inspects paired rendered evidence before owner delivery.
- Use finite, root-cleared validation lanes and an established safe browser route. Record actual bounds, process cleanup limits and failures. Run the packet check before implementation. Commit scoped source/evidence and progress last.

Production source writes require the reviewed seam and audio disposition. No default save cutover, push or deployment is included.
