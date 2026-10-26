# Plan 23 bounded integration proposal

**Date:** 2026-10-26
**Stage:** Report-only investigation. Approval requested from QP Orch for source handoff, lifecycle contract, and explicit file ownership before any production write or browser turn.

## Objective and boundaries

Port the owner-selected Plan 13 combined rank-weighted weave and seeded 15–20° contact model, genuine first finish-line crossing, and two-second presentation-only slow-motion highlight into the two existing production race steps. Preserve the accepted Plan 13 constants, keyed schedules, event caps, tie ordering, unresolved guard behavior, and limits. Resolve each race once at commit, then render the persisted resolution. A report or preview module must never be imported by production.

This proposal is not production authorization. Plan 20 retains the production-writing lane until QP Orch confirms its acceptance/source handoff and explicitly assigns Plan 23's files. No browser testing is requested until that coordination occurs. Plan 22 owns rest penalties and later race-entry presentation; Plan 23 will expose a stable effective-speed input and leave rest at its neutral value. No Dex, audio, economy, new race options, publishing, or packet-status work is included.

## Evidence inspected

- `docs/development/plan-23-production-race-integration.md`, `docs/development/plan-20-digital-rig-and-motion-integration.md`, `docs/development/plan-22-race-entry-and-duck-rest.md`
- Plan 13 accepted `preview-guide.md`, `race-physics.mjs`, `preview-model.mjs`, and reviews 03–05; DECISION-018 in `docs/decision-log.md`
- Plan 17 accepted 3 Down → +5% base speed for one race, non-stacking, consumed once on race commit; 6 Down ticket behavior is unrelated and untouched
- `src/core/game-engine.mjs`, `src/core/storage.mjs`, `src/core/event-log.mjs`, `src/ui/race-view.js`, `src/main.js`, and the Plan 20 proposal/progress handoff

The current engine resolves a sampled rank immediately in `runRace`, applies payout and appends `race_result`, and returns a summary. `race-view.js` then animates preset lane percentages; saved results are reconstructed from `race_result`. The engine currently has a race PRNG stream, but Plan 13's accepted mechanics use keyed race-local draws. The current saved envelope is schema version 1 and persists game state, PRNG streams, and append-only event log.

## Input calibration is a blocking design issue

Production roster speeds are 10, 14, and 20 m/s. The tutorial and finale field bases are 8 and 11.2 m/s. Safe stance adds ±5% sampled variance; Sprint targets 1.10× base with ±20% variance. The Plan 17 item adds 1.05× base speed once when committed. Plan 13 currently clamps sampled speeds to 8–12 m/s. Consequently, a 14 or 20 m/s identity clips at 12 under Safe, the 20 m/s identity also clips after Sprint, and trial gains disappear whenever they remain clipped. Speeds below 8 also converge on the floor. The fixture's 11.5 m/s field is not equivalent to either production field.

Do not copy that clamp around actual stats, raise the cap without examining steering feasibility, or tune individual ducks. Before implementation, use an approved, fixed set of engine inputs (every roster tier, both field bases, both stances, trial absent/present) to compare candidate **global monotonic input adapters** from effective game speed to the Plan 13 physics domain. An acceptable adapter must preserve the strict ordering of supported effective speeds, retain observable +5% trial and stance effects, keep all inputs inside the model's feasible range without per-duck exceptions, and meet the accepted pacing tolerance with the unchanged course, turn rules, and event constants. Check corner speeds/turn caps and genuine crossing/watchdog outcomes too. If no global adapter satisfies these invariants, stop and return a decision request to QP Orch/owner; do not silently change selected mechanics or rebalance variants.

The resolver input should be named `effectiveSpeed` (or an equivalently stable scalar) after existing stance and committed trial composition, with a documented neutral/default rest multiplier. Plan 22 can later compose its selected 50%/25% rest multiplier into this input exactly once, before the approved global adapter. Plan 23 must not implement rest history or apply a second downstream speed multiplier.

## Proposed production boundaries and ownership request

The paths below are the proposed complete write set. QP Orch must confirm or revise ownership after Plan 20 handoff. Do not write any of them before that response.

| Path | Proposed boundary |
|---|---|
| `src/core/race-resolver.mjs` (new) | Pure production resolver port of accepted Plan 13 model, with an explicit rules version, keyed deterministic draws, immutable input validation, result/trajectory/event/checkpoint output, and honest unresolved outcomes. It imports only production core utilities such as `prng.mjs`; never `reports/`. |
| `src/core/game-engine.mjs` | At the existing race commit callback, validate selected duck/stance/trial, construct effective-speed inputs, call the resolver once, and atomically record choice, committed mechanical result, trial consumption, payout/reward, completed-race state, and continuation. Idempotent re-entry returns the committed result. Cancel before commit consumes neither trial nor RNG. |
| `src/core/storage.mjs` | Validate versioned race-resolution payloads and consistency against the append-only log. Preserve schema-v1 historical `race_result` entries as legacy summaries without fabricated trajectories/events; new saves carry the versioned full resolution needed to replay presentation. Reject malformed, duplicate-conflicting, over-cap, or mismatched payloads through existing corruption handling. |
| `src/core/event-log.mjs`, `src/core/receipt.mjs` | Only if needed for typed race evidence/Receipt projection: append mechanical resolution facts at commit, distinct `race_event_displayed` / race action facts only when actually shown/acted on. Keep the existing three Receipt registers (`We displayed`, `You did`, `Did this affect you?`). Precomputed but unseen events, skipped highlights, and interrupted playback are not displayed evidence. No per-frame appends. |
| `src/ui/race-view.js` | Replace preset lane movement with the committed result player: shared scene/camera projection for track and runners, correct initial facing, continuous paper turns from simulated heading, winner at the actual crossing and followers at their recorded positions at that instant. Simplify narration to concise, event-linked commentary and provide optional paused views at recorded event stills. Preserve one pre-race choice and immediate exit. |
| `src/ui/race-playback-controller.js` (new) | Own playback clock, pause/resume, skip, five static checkpoints, event-linked seeking, and cleanup. Presentation controls read only persisted trajectory/event records and never call the resolver or advance game RNG. The two-second highlight extends wall playback only, not target simulation time. |
| `src/ui/race-motion-controller.js` (new or Plan 20 handoff extension) | Map recorded movement/contact/rank state to the accepted rig motions: paddling during ordinary race movement; graceful bob for leading two based on sampled/hysteretic rank; logged duck/wall impacts trigger accepted impact/recovery with priority, then return to the appropriate locomotion. Does not create, rerun, or alter mechanical contacts/recovery. Decide with QP Orch whether Plan 20's controller can be safely extended or a race-specific controller is needed. |
| `src/ui/race-motion.css` (new) and `src/main.js` only if required | Scoped race presentation styles and import/cleanup integration. Keep shared `src/style.css` unchanged unless a separately approved exact hunk is unavoidable. No broad main/global CSS growth. |
| Focused core/UI/storage tests | New resolver parity/input matrix, one-time commit/idempotency, save/reload/migration/corruption, display-event honesty, playback invariance, reduced-motion and motion-map tests. Ownership to be confirmed with the source set. |

Plan 20's `src/core/duck-rig.mjs`, `src/ui/duck-rig-view.mjs`, `src/ui/duck-motion-controller.mjs`, and `src/ui/duck-motion.css` are dependencies, not assumed Plan 23 write ownership. Reuse only after the Plan 20 source handoff is explicit. Preserve unique SVG namespaces and the static physical companion. Plan 21/22 remain outside the race playback/controller files.

## Commit, storage, replay, and event contract

1. Keep pre-race cancel and selection as today. On Start Race commit, freeze the exact input snapshot (race ID/rules version, selected digital identity, field input, stance, trial eligibility/commit, effective speed values, and seed/key identity) and resolve synchronously once. If unresolved at an accepted guard, record it as unresolved with no winner/payout; do not produce a fallback rank.
2. Commit the immutable resolution, bounded trajectory, mechanical event records, payout and trial consumption as one guarded engine operation. A repeated callback, navigation, reload, skip, replay, or view remount returns/reuses that record and cannot draw again or pay twice. Add event IDs/causal links so cues and player actions point to their committed mechanical event; keep appends ordered and never rewrite past evidence.
3. Version the new race-resolution payload independently and propose envelope migration before schema edits. Existing schema-v1 completed races have result summaries but no motion/event history: retain their old result view/summary or explicit legacy static rendering. Never rerun old races or invent missing events/frames. New corrupted/mismatched payloads must fail through current recovery behavior, not be silently reconstructed from presentation state.
4. Estimate serialized bytes on the accepted caps before implementation. Use compact fixed-rate or otherwise bounded samples sufficient for playback, five default static snapshots, and stills keyed to at most 128 mechanical events; report actual typical/worst-case byte sizes and load/write time in the proposal update. Do not store DOM/CSS animation state. The selected Plan 13 limits are 800 ticks, 128 mechanical records, and 84 opportunity diagnostics; keep their unresolved semantics intact.
5. Mechanical events remain complete even if not displayed. Append `race_event_displayed` only when the relevant event cue actually becomes visible (or is explicitly announced by static playback), and `race_event_seeked`/pause/skip actions only as genuine user actions where Receipt-relevant. Highlight visibility is separate from event existence. Playback interruption leaves unseen cues unclaimed. No frame-by-frame log flood.

## Playback, scene, and motion mapping

All runners, finish line, pond/track scenery, and camera share one world projection. Do not move runner geometry to solve label overlap; use a scoped label treatment. Use the true simulated heading plus oval-facing transform for the paper duck. At first forward crossing, freeze simulation and classify followers at that same instant using Plan 13's stable order; do not teleport them to the line. Report the full playback wall duration separately from the simulation finish time. Keep the two-second highlight presentation-only and inside the accepted ±15% simulation target tolerance accounting.

Default playback has five static checkpoints at 0/25/50/75/100% and recorded event stills. Event-linked seeking moves to a recorded event time, pauses there, and describes only recorded facts. A highlight can be skipped. Pause, skip, seek, replay, and reload use the same committed resolution. Reduced motion uses fixed-wide framing and static checkpoints/event stills; it omits animated zoom, lighting changes, and slowdown while preserving the same information, choices, finish and accessible commentary. Keep keyboard operation, announced playback state, and immediate exit.

Motion selector reads recorded positions/ranks/events only. Sample rank at a declared checkpoint cadence with hysteresis so a one-tick pass does not restart loops. Leading-two bob is a cosmetic locomotion selection only. Actual logged duck/wall impacts interrupt locomotion, play one accepted impact/recovery segment per recorded event, then resume the current rank-selected locomotion; avoid retriggering every playback tick. Static/reduced motion renders the same participants and cause facts without animation. No unlogged impact, new speed penalty, physical-duck motion, or whole-collection loop.

## Evidence and approval sequence

**Now:** report-only proposal and source/input inspection. No production write, tests/build, or browser activity.

**Before source edits:** QP Orch approves/revises this proposal, confirms Plan 20 accepted source handoff, and assigns each production/test file to one writer. If Plan 20 still owns any shared path, serialize work rather than overlap it. QP Orch coordinates a browser slot only after implementation and offline evidence are ready.

**After approval:** first validate model parity against Plan 13's accepted reference outputs and tests; run the complete production input matrix including roster/stance/trial, guard/no-payout, and representative witnesses; prove identical mechanical outputs for identical resolver inputs. Then verify reward/trial idempotency on repeat commit, cancel, save/reload, legacy migration and malformed saves; validate append-only display evidence; measure storage bounds. Verify presentation invariance under pause, replay, seek, skip and reload, reduced/static parity, five checkpoints, event-linked seek truth, and all terminal/exit paths. Build and relevant/full tests follow packet requirements; one coordinated real production race browser turn at narrow and desktop viewports covers keyboard, static/reduced motion and interruptions. Report exact observed settings and any untested hardware/media paths. No deployment or push.

## Open items returned to QP Orch

1. Approve or revise the global speed-domain adapter investigation and its pass/fail invariants. The existing 8–12 clamp cannot represent the production roster faithfully.
2. Confirm exact Plan 20 handoff files and whether the motion controller may be extended.
3. Approve the proposed production/test write set or provide a narrower owner assignment.
4. Confirm if legacy completed races retain their summary-only result screen or use an explicit static legacy presentation.
5. Approve a byte-size target after the accepted trajectory format is measured against 800 ticks and event caps; do not choose a target before measurement.

No production or browser verification claim is made by this report.
