# Plan 20 implementation progress

**Date:** 2026-10-26  
**Packet status:** left unchanged; `node scripts/dev/plan-status.js check plan-20` reports `RUNNABLE`.  
**Outcome:** implementation and bounded rendered checks are ready for QP Orch/owner review. This report does not set packet completion, authorize race wiring, or authorize push.

## Scope and ownership

QP Orch approved the source/lifecycle proposal before implementation and assigned the Plan 20 production scope. Work stayed within:

- `src/ui/duck-rig-view.mjs` — compose the accepted Mode C source rig with card-keyed SVG prefixes and accessible names.
- `src/ui/duck-motion-controller.mjs` — deterministic cosmetic choice, per-instance motion ownership, pause, visibility/intersection/reduced-motion lifecycle, cancellation and neutral reset.
- `src/ui/duck-motion.css` — scope presentation to revealed gacha card rigs.
- `src/ui/gacha-view.js` — render rigs only for revealed cards and expose the motion pause/status control.
- `src/main.js` — own gacha controller cleanup, active/inactive context and transient user pause across rerenders.
- `src/ui/duck-motion-controller.test.mjs` — focused lifecycle and faithful-motion assertions.
- `reports/development/plan-20-digital-rig-and-motion-integration/proposal.md` and this report.

The physical companion remains the existing static embedded `Professor Quacks`/placeholder use in the desk and HUD. Only revealed digital gacha ducks receive the Mode C rig. Each card uses its persisted `commitSeq` for a distinct `qp-card-<sequence>` prefix, including scoped SVG definition/filter IDs. Cosmetic paddle versus graceful-bob selection is a pure, versioned keyed hash over card identity and sequence; it does not use mechanical randomness, mutate engine state, append events, or add saved fields. Unrevealed cards remain card backs. The report gallery is not imported into production.

Race wiring remains deferred: the retained direction is normally paddle, leading two may gracefully bob, and actual duck/wall impacts use impact/recovery before returning to rank-appropriate locomotion. It requires accepted Plan 13 event semantics and a separate bounded follow-on approval. No race hooks, Dex work, reveal-sequence changes, value indicators, or cooldown features were added.

QP Orch relayed an owner note for future race-presentation integration: the investigation's technical narration table should become simpler, event-linked player commentary with accessible presentation. This is a future integration concern, not a current card-motion blocker or scope expansion. Future crowd/contact audio belongs to the Plan 18 follow-on; Plan 20 adds no audio.

## Lifecycle and implementation

Each mounted revealed-card instance owns its animation handles. A single keyboard-operable control pauses/resumes the active visible card loops and announces its state. Explicit user pause freezes the current pose. A hidden page, inactive/covered view, disconnected instance, offscreen card, or reduced-motion preference cancels its animations and restores neutral transforms; reentry starts a fresh loop only when the context is active, the card is visible, the user has not paused, and reduced motion is not requested. System preference changes are observed. The controller cancels handles and disconnects observers/listeners on teardown. Settings and other app rerenders dispose the prior controller before replacing its view. No `settings-modal.js`, engine, storage, shared rig, race, or global stylesheet changes were made.

The main source review found that the first implementation did not exactly port Plan 09's paper cycle or internal wing pivots. Repair commit `011e758` restores identity at cycle start and lag, peak at `.48`, partial settle at `.74`, and identity at cycle end; it also gives all internal wing and seam paths `transform-box: view-box` and origin `52px 56px`. Focused tests assert these frames, factor-four paper values, zero animation delay, and pivots. The source review also identified inactive/offscreen stale poses; the controller now cancels and neutralizes those contexts. Explicit user pause deliberately retains its current pose while paused.

## Verification evidence

- `node scripts/dev/plan-status.js check plan-20` — `RUNNABLE: plan-20 is ready to implement`.
- `node --test src/ui/duck-motion-controller.test.mjs` — 6/6 focused controller tests pass, reproduced after `011e758` by QP Orch.
- `npm test` — 138/138 tests pass.
- `npm run build` — Vite production build succeeds.
- `git diff --check` — passes for Plan 20 changes. Existing Plan 13 dirty files were left unstaged and unmodified by this work.
- Changed source modules contain no report-gallery import or network API call. The standard Vite build includes its same-origin module-preload fetch for static application assets; this is not a new app service/telemetry call.
- `npm run test:smoke` — retried in the authorized isolated slot with its dedicated temporary Chrome profile and a `%TEMP%` observation file. All eight Plan 03 smoke journeys passed; the harness reported zero runtime/console errors and zero external requests, then cleaned the temporary browser profile. This generic smoke does **not** itself exercise revealed-card choice persistence.
- Focused rendered check used a fresh Day 1 session in a newly created Codex in-app browser tab with automatic saving disabled. All ten cards were revealed. DOM inspection found ten unique `qp-card-2` through `qp-card-11` SVG namespaces, zero duplicate SVG IDs, accessible duck names, both `paddle` and `graceful-bob` choices (6 and 4 in that run), and the paper-layer pivots at `52px 56px` with `view-box` transform boxes. Sampled live computed transforms changed during playback. The Pause control set `aria-pressed="true"`, changed its label to Resume, and sampled transforms stayed stable over 400 ms. The companion image remained a separate static physical duck.
- In that same isolated in-app browser session, manual Save followed by reload restored all ten revealed cards. Before reload, sampled choices were `qp-card-2=paddle`, `qp-card-3=graceful-bob`, `qp-card-4=paddle`; after reload all ten keyed choices were reconstructed and those three samples matched. This is a bounded sample comparison, not a captured pre-reload comparison for all ten cards.
- The browser reported `prefers-reduced-motion: false`. No operating-system setting was changed; an actual system reduce-on/reduce-off browser witness was not performed. The reduced-motion branch and listener are covered by focused source tests, not by the rendered system-preference witness.
- The temporary rendered-check tab was closed. No owner Chrome profile or OS settings were edited. Browser viewport was the in-app browser's available default; no explicit responsive viewport override was set in this final witness.

## Review consultation and dispositions

One implementer main-delivery review consultation was used, as allowed by the repository instructions. The request specified `gpt-6-sol` at `low` effort. The reviewer self-reported that the runtime did not expose its observed model or effort, so those observed values remain **unverified**. The review was read-only by instruction; no structural sandbox guarantee was available. After the review, `plan-20` remained runnable and no reviewer edits were observed in the working tree.

The Sol-low reviewer raised a P2 concern that hidden/offscreen/inactive cards might retain an animated pose. **Accepted and addressed** for inactive, hidden, offscreen, and disconnected contexts: those paths now cancel and reset. QP Orch clarified that explicit learner Pause should freeze the current pose; that remains the behavior and is covered by a focused test plus rendered check. The reviewer also noted that actual system reduced-motion and save/reload evidence had not yet been established. **Accepted as an evidence limitation**: the later browser session established a three-card pre/post reload sample but did not test system reduce-on; both limits are stated above. No Sol-low findings were rejected.

QP Orch's main implementation source review separately identified the Plan 09 paper-cycle and internal wing-pivot fidelity mismatches. Both were accepted and repaired in `011e758`, with focused assertions and rendered evidence for the pivots. The remaining system-preference evidence gap is retained for owner review; no extra implementer reviewer or small-repair review was requested or used.

## Commits and handoff

- `9367f11` — proposal submitted and approved before implementation.
- `94333a6` — scoped production integration and focused controller tests.
- `011e758` — faithful paper-cycle/pivot repair and inactive/offscreen neutral reset.
- This progress report is committed separately as the final implementation act.

QP Orch may now conduct owner rendered review. No packet status, decision log, Plan 13 report-folder file, or remote branch was changed by Plan 20; no push was performed.
