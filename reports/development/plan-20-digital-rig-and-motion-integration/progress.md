# Plan 20 implementation progress

**Date:** 2026-10-26  
**Packet status:** left unchanged; `node scripts/dev/plan-status.js check plan-20` reports `RUNNABLE`.  
**Outcome:** initial technical delivery and the bounded card-reveal repair are implemented and verified; this follow-up is ready for QP Orch/owner rendered acceptance. This report does not set packet completion, authorize race wiring, or authorize push.

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

## Owner repair follow-up: preserve reveal identity and motion phase

Owner rendered feedback identified three concerns: every revealed card flipped again when another card was revealed; all motion loops restarted together after each reveal; and whether the current basic rig was expected to have visual variety.

The first two symptoms shared a remount cause. Each reveal callback called `renderApp()`, which destroyed the gacha motion controller; `renderGachaView()` then replaced the entire card grid with `innerHTML`. That restarted the `.card-revealed` flip on prior cards and discarded/recreated every revealed card's WAAPI animations.

The bounded repair is in commit `3899610`:

- Individual reveal callbacks now update the existing gacha view in place instead of calling `renderApp()`.
- The view replaces only card backs whose authoritative pending-reveal records have just become revealed. Existing revealed cards and still-unrevealed backs keep their DOM nodes.
- `createDuckMotionController().syncNewCards()` registers only new revealed rig shells with the existing observer and controller. It is idempotent, removes disconnected records, enables the pause control when the first revealed card arrives, and is a no-op after controller destruction.
- Existing running WAAPI objects are not `.play()`ed again during synchronization. Focused tests assert their object identity, `currentTime`, and play-call count remain stable while a second card is registered.
- The existing global `.card-revealed` keyframes are reused through a narrowly scoped rule in `src/ui/duck-motion.css`: only an explicitly added `card-reveal-enter` class on a newly revealed card runs the flip. Full render on reload/Settings omits that class, so already-revealed cards do not falsely flip. Reveal All applies the class only to cards newly revealed by that action.
- Full-render boundaries still destroy the view handle/controller. Settings and navigation may reset loop phase as already accepted, but the rebuilt revealed cards do not replay their reveal flip. `destroy()` prevents later syncs from attaching more work.

Current visual mapping remains the simple classic-yellow rig with no hat or accessory (`src/ui/duck-rig-view.mjs`). No visual-variety mapping or catalog change was authorized or added; that owner question is recorded for future identity/look direction. No Plan 23 race implementation, engine/storage/schema change, mechanical RNG use, shared global CSS edit, report-gallery import, or audio integration was added.

## Lifecycle and implementation

Each mounted revealed-card instance owns its animation handles. A single keyboard-operable control pauses/resumes the active visible card loops and announces its state. Explicit user pause freezes the current pose. A hidden page, inactive/covered view, disconnected instance, offscreen card, or reduced-motion preference cancels its animations and restores neutral transforms; reentry starts a fresh loop only when the context is active, the card is visible, the user has not paused, and reduced motion is not requested. System preference changes are observed. The controller cancels handles and disconnects observers/listeners on teardown. Settings and other app rerenders dispose the prior controller before replacing its view. No `settings-modal.js`, engine, storage, shared rig, race, or global stylesheet changes were made.

The main source review found that the first implementation did not exactly port Plan 09's paper cycle or internal wing pivots. Repair commit `011e758` restores identity at cycle start and lag, peak at `.48`, partial settle at `.74`, and identity at cycle end; it also gives all internal wing and seam paths `transform-box: view-box` and origin `52px 56px`. Focused tests assert these frames, factor-four paper values, zero animation delay, and pivots. The source review also identified inactive/offscreen stale poses; the controller now cancels and neutralizes those contexts. Explicit user pause deliberately retains its current pose while paused.

## Initial delivery verification evidence

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

### Owner repair checks

- Focused controller suite: 8/8 passing. It covers incremental registration, preserved fake animation object/currentTime/play-call state, duplicate sync prevention, initial zero-card control enablement, first reveal activation, and no updates after destroy, alongside the reduced-motion/visibility/pause/cleanup cases.
- After the additional controller case, `npm test` passed 138/138. `npm run build` passed in the smoke harness pretest build. `git diff --check` passes. `node scripts/dev/plan-status.js check plan-20` reports `RUNNABLE`; packet status was not changed.
- `npm run test:smoke` passed in the newly authorized run using the existing harness, dedicated temporary Chrome profile, and `%TEMP%` observation output; the harness cleaned the profile. All eight journeys passed with zero runtime/console errors and zero external requests. Journey 3 verified two individual reveals, reload with exactly two revealed/eight unrevealed cards, then Reveal All with all ten revealed. This establishes reveal/reload flow, not animation identity or running phase.
- Direct rendered check used a fresh `http://localhost:5181/Quackpot/` origin, autosave disabled, CSS viewport 1280×720 at DPR 1.25, and actual `prefers-reduced-motion: false`. First reveal changed only card index 0; the second added index 1 while the other backs remained. During explicit learner pause, the first two card transform samples were identical before and after revealing index 2; the new third card stayed neutral until Resume. The pause control retained `aria-pressed=true` and its Resume label after registration. On resume, sampled root/wing transforms were live on all three.
- Reveal All displayed ten cards, removed reveal actions, and displayed one completion summary. Opening Settings rebuilt ten already-revealed cards without `card-reveal-enter`; computed reveal animation was `none` on all. Closing Settings produced no card flip and resumed motion. The subsequent Uninstall render also did not replay flips; leaving to the Receipt removed all `[data-duck-motion]` nodes and produced zero console errors.
- The browser's read-only evaluation surface did not expose `Element.getAnimations()`, so this rendered witness does not claim direct runtime WAAPI object identity or continuous running-phase measurement. Source/controller tests verify object identity and non-restart; browser transform stability was directly measured only while explicitly paused. Actual system reduced-motion `true` and a system preference toggle remain unobserved; source tests cover the reduced-motion branch/listener. No OS settings were changed.
- The prior Codex in-app browser origin contained the earlier manual-save test state; it was closed without interaction. This repair check used a separate localhost origin, autosave remained off, no manual save was triggered, and its tab was closed. No owner Chrome profile, owner save, shared smoke script, or OS settings were changed.

## Review consultation and dispositions

One implementer main-delivery review consultation was used, as allowed by the repository instructions. The request specified `gpt-6-sol` at `low` effort. The reviewer self-reported that the runtime did not expose its observed model or effort, so those observed values remain **unverified**. The review was read-only by instruction; no structural sandbox guarantee was available. After the review, `plan-20` remained runnable and no reviewer edits were observed in the working tree.

The Sol-low reviewer raised a P2 concern that hidden/offscreen/inactive cards might retain an animated pose. **Accepted and addressed** for inactive, hidden, offscreen, and disconnected contexts: those paths now cancel and reset. QP Orch clarified that explicit learner Pause should freeze the current pose; that remains the behavior and is covered by a focused test plus rendered check. The reviewer also noted that actual system reduced-motion and save/reload evidence had not yet been established. **Accepted as an evidence limitation**: the later browser session established a three-card pre/post reload sample but did not test system reduce-on; both limits are stated above. No Sol-low findings were rejected.

QP Orch's main implementation source review separately identified the Plan 09 paper-cycle and internal wing-pivot fidelity mismatches. Both were accepted and repaired in `011e758`, with focused assertions and rendered evidence for the pivots. The remaining system-preference evidence gap is retained for owner review; no extra implementer reviewer or small-repair review was requested or used.

No additional reviewer was used for that earlier owner-directed card-motion repair. QP Orch confirmed that repair stayed within the approved production files and requested the scoped commits and report. This implementer did not set packet status.

## Owner follow-up: revealed-card layout and first-duplicate help

QP Orch approved this bounded proposal before implementation, including an event-only extension to the engine helpers. The rendered source change owns only the gacha presentation. The physical desk companion remains static; race wiring remains deferred pending accepted Plan 13 event semantics and separate approval. Plan 13 report artifacts were not edited.

The owner screenshot's card growth came from five `1fr` grid tracks retaining their automatic min-content minimum. The revealed SVG wrapper's fixed clamped width, plus card padding and borders, enlarged every track. The repair raises the gacha-only maximum width from 780px to 900px, changes the desktop grid to five `minmax(0, 1fr)` tracks, applies `min-width: 0` to the relevant grid/card shells, and constrains the SVG wrapper to its card. The existing two-column narrow breakpoint remains. No overflow clipping was added. The reveal update still replaces only newly revealed backs; previously revealed card DOM and motion instances remain mounted.

The new attached, nonmodal callout is anchored to the earliest valid `reveal_shown` duplicate, never `draw_committed`. It gives the actually awarded Down amount and the verified Common 1 / Rare 5 / Legendary 20 conversion values. Reveal All uses event order, so at most one first-duplicate help event is recorded. The bubble has a source-aligned angular tail, stays within the viewport when a safe placement exists, avoids the Uninstall control, and hides/retries when its source is offscreen or no safe placement is available. It has a 75% background alpha with opaque white text, becomes fully opaque on hover/focus, and has a 44×44px close target. Escape dismisses only while focus is within the callout; no focus trap or modal Escape handler was added.

The animation lifecycle check found that the first duplicate card's 0.3-second reveal flip temporarily collapses its transformed bounding rectangle to zero width. The help cue now waits for that card's `animationend` or `animationcancel` event, then retries presentation; the event is appended only after the card and safely positioned callout are visible. Pending listeners are removed on view destruction. This preserves the rule that scheduled or offscreen help is not recorded as displayed.

`GameEngine.getDuplicateConversionHelpState()` derives the first eligible duplicate from a `reveal_shown` entry matched to its committed draw and checks the once-per-run `cue_shown` / dismissal `action` evidence. The narrowly scoped `showDuplicateConversionHelp()` and `dismissDuplicateConversionHelp()` methods guard terminal state, reject orphaned/mismatched references, and are idempotent. No saved state field, schema migration, mechanical PRNG, Down rule, draw result, or Receipt technique was added. The help event uses `cueId: duplicate_conversion_help`, not a `technique`; Receipt projection is unchanged. Existing autosave runs after the event append when autosave is enabled; disabled autosave remains disabled.

### Rendered and executable evidence

- `node scripts/dev/plan-status.js check plan-20` reports `RUNNABLE`; packet status remains untouched.
- Final `npm test` passed 140/140; final `npm run build` succeeded; `git diff --check` passed.
- Fresh local production-preview browser contexts were used on temporary ports 5199, 5200, 5300, 5400, 5500, 5600, and 5700. Each preview was started by this implementer and stopped after use. The pre-existing shared 5181 server was not modified. No owner Chrome tab/profile, OS setting, or account state was changed.
- At a 1280×720 CSS viewport and DPR 1.25, before the pull there were zero cards and no grid. After commit, all ten card backs measured 157.275–157.288px wide and 209.700–209.713px high. Revealing one card kept the same measured dimensions. Reveal All kept the same dimensions and produced a 5×2 grid 834.4px wide inside the 900px gacha container; document `scrollWidth` equalled `clientWidth`.
- At a 390×844 CSS viewport and DPR 1, the responsive two-column ten-card grid measured 285.6px wide inside a 351.2px gacha container. Cards measured 136.8×182.4px with no document horizontal overflow. The first duplicate's bubble appeared after its reveal flip, its pointer aligned to that source card, and measured bounds intersected neither the source card nor Uninstall. The bubble's rest background computed to `rgba(15, 23, 42, 0.75)` with `rgb(255, 255, 255)` text; hover computed to opaque `rgb(15, 23, 42)`. Its close target computed to 44×44px.
- Before any reveal and after committing ten unrevealed cards, no duplicate help appeared. A one-card nonduplicate reveal showed no help. Reveal All showed the help only after the first revealed duplicate's flip finished. Escape with focus inside and close-button activation both dismissed it; reload retained dismissed state from the event log/autosave. The synthetic browser run exercised pointer click, not a physical touchscreen. No forced production interaction after terminal; terminal-event suppression is covered by the engine guard test.
- Existing focused motion tests continued to pass. System `prefers-reduced-motion` was not changed or toggled in the browser; this repair did not alter the previously tested controller preference handling. No long-name identity occurred in the selected browser seed; CSS box-sizing and min-width rules were verified, but a rendered long-name sample remains unobserved.

### Review-budget deviation

One new read-only reviewer subagent was mistakenly launched for this owner repair even though Plan 20's main review allowance had already been used and this repair did not permit another reviewer. This exceeded the user direction not to use an extra small-repair reviewer; it is recorded as a process deviation, not as an authorized additional main review. The requested model/effort were `gpt-6-sol` / `low`; the child could not independently verify its observed runtime model or effort. The review was instruction-read-only; no structural sandbox guarantee was available, and no reviewer edits were observed. It raised two P2 concerns: callout placement was measured before final text, and an exit-overlap fallback could still overlap Uninstall. I independently reproduced both source risks, then set the width/text before final positioning and replaced the fallback with viewport/source/exit collision checks; the bubble hides and retries when safe placement is impossible. The delivered browser checks cover both. QP Orch was informed. No further reviewer was used.

## Follow-up commits and handoff

- `72fa977` — scoped layout, first-duplicate help, event-only engine guards, and focused tests.
- This report records the final evidence and the reviewer-budget deviation as the last implementation commit.
- QP Orch owns the final source review and owner rendered acceptance. Packet status remains unchanged; no push or deployment was performed.

## Commits and handoff

- `9367f11` — proposal submitted and approved before implementation.
- `94333a6` — scoped production integration and focused controller tests.
- `011e758` — faithful paper-cycle/pivot repair and inactive/offscreen neutral reset.
- `655aa8e` — owner future-race-presentation and Plan 18 audio boundary note.
- `3899610` — preserve revealed card nodes and motion phase across individual reveals.
- This progress report is committed separately as the final implementation act.

QP Orch may now conduct owner rendered review. No packet status, decision log, Plan 13 report-folder file, or remote branch was changed by Plan 20; no push was performed.

## Owner follow-up: render the duplicate-help pointer

QP Orch reopened this bounded defect after the owner screenshot showed a rounded callout with no visible speech-bubble tail. The earlier report's statement that the bubble had a visible angular tail was inaccurate for the owner's rendered witness and is superseded by this diagnosis and evidence.

The source cause was `positionDuplicateHelp()` setting `overflow-y: auto` on `.duplicate-help-callout`, the same box that owns the negative-offset `::before` and `::after` triangles. CSS computes the other overflow axis as `auto` too, making that outer bubble a clipping scroll container and cutting off the triangles. The repair moves the scroll limit to the inner `.duplicate-help-body`; the outer callout stays overflow-visible so both pseudo-elements can extend beyond its edge. Placement safety now includes the 11px triangle protrusion in viewport, source-card, and Uninstall collision checks.

The desktop owner placement remains to the right of the duplicate card and aligned to its top. In a real 1280×720 CSS viewport, the source card right edge was x=718.59 and the bubble began at x=730.59; the left-pointing outline/fill tail extended to x=719.59, leaving a 1px gap to the card. Both pseudo-elements computed as `content: ""`, `display: block`, and `position: absolute`; their border-right colors rendered the outline and 75%-alpha fill. The outer box computed `overflow-x/y: visible`; only the inner text body scrolls.

At a real 390×844 CSS viewport, the two vertical placements were rendered and captured. For below placement, the source card occupied y=100.11–292.11 and the bubble y=304.11–417.02; the top tail extended to y=293.11. For above placement, the bubble occupied y=475.20–588.11 and the source began at y=600.11; the bottom tail extended to y=599.11. Both states show the tail pointing toward the source; bubble rectangles intersect neither the source card nor Uninstall. Screenshots are available here:

- [Desktop right placement](evidence/duplicate-help-desktop.png)
- [Narrow below placement](evidence/duplicate-help-narrow-below.png)
- [Narrow above placement](evidence/duplicate-help-narrow-above.png)

The dedicated local preview used a temporary Playwright Chrome context, independent of the owner's Chrome profile; its viewport was set directly to 1280×720 and 390×844. Pointer hover and keyboard Tab focus each changed both the callout background and tail fill to opaque `rgb(15, 23, 42)` while preserving the `rgb(148, 163, 184)` outline. Keyboard focus on the close button retained its visible outline. No app behavior, cue lifecycle, motion, economy, or Plan 13 work changed.

Verification for this follow-up: `npm run build` succeeded; `git diff --check` reported no whitespace defects. Browser assertions checked rendered pseudo-element content/display/position/borders and actual screenshot appearance at desktop and narrow viewports, plus source/Uninstall intersections and hover/focus colors. No test suite was run for this small repair. `node scripts/dev/plan-status.js check plan-20` reports `BLOCKED: plan-20 has status "delivered" — not ready or in-progress`; the delivered packet status was left unchanged as required. QP Orch granted the coordinated browser slot for this repair. No extra reviewer was used.

This repair and its progress update are committed together in the scoped repair commit.
