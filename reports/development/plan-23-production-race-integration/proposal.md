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

Production roster speeds are 10, 14, and 20 m/s. The tutorial and finale field bases are 8 and 11.2 m/s. Safe stance adds ±5% sampled variance; Sprint targets 1.10× base with ±20% variance. The Plan 17 item adds 1.05× base speed once when committed; this has not yet been integrated into the current production engine. Plan 13 currently clamps sampled speeds to 8–12 m/s. Consequently, a 14 or 20 m/s identity clips at 12 under Safe, the 20 m/s identity also clips after Sprint, and trial gains disappear whenever they remain clipped. Speeds below 8 also converge on the floor. The fixture's 11.5 m/s field is not equivalent to either production field.

The report-only screen in [`adapter-analysis.md`](./adapter-analysis.md) compares three global monotonic transforms plus the existing clamp using the read-only accepted reference module. No candidate passes all current checks: smoother maps preserve ordering but compress the 5% trial speed delta and most supported combinations exceed the 17–23 second band; the affine 8–12 map performs worse on pacing, while the existing clamp plateaus higher tiers and trial increments. Square-root 9–12 is the first follow-up candidate by observed pacing, with log 9–12 as its alternative; neither is approved. Broader owner/orchestrator decision is required before source work. Do not change the accepted course, physics, trial rule, or per-duck stats to force a fit.

Use this exact input order to avoid double-applying modifiers: validate the selected owned duck; start from its authored roster speed; apply a `restFactor` (default 1, with Plan 22 owning future rest calculation); apply the committed Plan 17 +5% multiplier once; apply Safe/Sprint sampling with the accepted keyed draw; apply the chosen global adapter once; then enter the Plan 13 physics domain. A production resolver may take pre-adapter inputs and perform this sequence internally. Do not pass an already stance/trial-adjusted `effectiveSpeed` into a resolver that applies stance/trial again. Preserve an unchanged direct Plan 13 reference-input mode for parity checks.

## Proposed production boundaries and ownership request

The paths below are the proposed complete write set. QP Orch must confirm or revise ownership after Plan 20 handoff. Do not write any of them before that response.

| Path | Proposed boundary |
|---|---|
| `src/core/race-resolver.mjs` (new) | Pure production resolver port of accepted Plan 13 model, with an explicit rules version, keyed deterministic draws, immutable input validation, result/trajectory/event/checkpoint output, and honest unresolved outcomes. It imports only production core utilities such as `prng.mjs`; never `reports/`. |
| `src/core/game-engine.mjs` | At the existing race commit callback, validate selected duck/stance/trial, construct effective-speed inputs, call the resolver once, and atomically record choice, committed mechanical result, trial consumption, payout/reward, completed-race state, and continuation. Idempotent re-entry returns the committed result. Cancel before commit consumes neither trial nor RNG. |
| `src/core/storage.mjs` | Validate versioned race-resolution payloads and consistency against the append-only log. Preserve schema-v1 historical `race_result` entries as legacy summaries without fabricated trajectories/events; new saves carry the versioned full resolution needed to replay presentation. Reject malformed, duplicate-conflicting, over-cap, or mismatched payloads through existing corruption handling. |
| `src/core/receipt.mjs` | Project compact committed mechanical race facts and actually displayed race cues/actions into the existing three Receipt registers. `EventLog.append()` already supports arbitrary immutable, hash-chained event types; no `event-log.mjs` rewrite is proposed. Keep the full trajectory out of the log. |
| `src/ui/race-view.js` | Replace preset lane movement with the committed result player: shared scene/camera projection for track and runners, correct initial facing, continuous paper turns from simulated heading, winner at the actual crossing and followers at their recorded positions at that instant. Simplify narration to concise, event-linked commentary and provide optional paused views at recorded event stills. Preserve one pre-race choice and immediate exit. |
| `src/ui/race-playback-controller.js` (new) | Own playback clock, pause/resume, skip, five static checkpoints, event-linked seeking, and cleanup. Presentation controls read only persisted trajectory/event records and never call the resolver or advance game RNG. The two-second highlight extends wall playback only, not target simulation time. |
| `src/ui/race-motion-controller.js` (new) | Race-specific wrapper maps recorded movement/contact/rank state to accepted rig motions: paddle during ordinary movement; graceful bob for the leading two from sampled/hysteretic rank; logged duck/wall impacts trigger accepted impact/recovery with priority, then return to the appropriate locomotion. It reads the handed-off Plan 20 rig/view/controller without modifying the card-motion lifecycle. Does not create, rerun, or alter mechanical contacts/recovery. |
| `src/ui/race-motion.css` (new) and `src/main.js` only if required | Scoped race presentation styles and import/cleanup integration. Keep shared `src/style.css` unchanged unless a separately approved exact hunk is unavoidable. No broad main/global CSS growth. |
| Focused core/UI/storage tests | New resolver parity/input matrix, one-time commit/idempotency, save/reload/migration/corruption, display-event honesty, playback invariance, reduced-motion and motion-map tests. Ownership to be confirmed with the source set. |

Plan 20's `src/core/duck-rig.mjs`, `src/ui/duck-rig-view.mjs`, `src/ui/duck-motion-controller.mjs`, and `src/ui/duck-motion.css` are read-only dependencies, not assumed Plan 23 write ownership. Reuse only after the Plan 20 source handoff is explicit. Prefer the new race-specific motion wrapper; do not modify the card-motion lifecycle. Preserve unique SVG namespaces and the static physical companion. Plan 21/22 remain outside the race playback/controller files.

## Commit, storage, replay, and event contract

1. Keep pre-race cancel and selection as today. Validate the chosen duck is currently owned before logging or mutation; current `runRace` falls back to the first roster duck for an unknown ID. On Start Race commit, freeze exact inputs/version: selected identity, race/field ID, base speed, rest factor, trial eligibility/commit, stance, seed/key identity, and adapter version. Apply the documented base → rest → trial → stance/random sample → global adapter → physics order once and resolve synchronously. If unresolved at an accepted guard, record unresolved with no winner/payout; do not produce a fallback rank.
2. Commit the immutable resolution, bounded trajectory, mechanical event facts, payout and trial consumption as one guarded engine operation. A repeated callback, navigation, reload, skip, replay, or view remount returns/reuses that record and cannot draw again or pay twice. Store one canonical versioned full resolution in run state. Append a compact resolution-commit record with digest/outcome plus bounded individual mechanical-event records to the generic hash-chained log; append displayed-event and action evidence only when it occurs. This gives Receipt projection evidence without duplicating trajectory into the log. Keep appends ordered and never rewrite past evidence.
3. Version the new race-resolution payload independently and define envelope migration before schema edits. Existing schema-v1 completed races keep a result summary and receive the approved summary-only legacy presentation; never rerun old races or invent missing events/frames. New corrupted/mismatched payloads must fail through current recovery behavior, not be silently reconstructed from presentation state.
4. The report-only size screen measured approximately 0.29–0.37 MB for representative full reference results and 0.09–0.11 MB for a compact trajectory candidate. It did not observe an 800-tick watchdog result, so there is no measured watchdog payload. Keep one full resolution in run state and compact log evidence. Before implementing compaction, verify round-trip precision, deterministic replay and bytes at maximum observed/guarded and theoretical caps; report load/write cost then. Do not store DOM/CSS animation state. The selected Plan 13 limits remain 800 ticks, 128 mechanical records, and 84 opportunity diagnostics; keep unresolved semantics intact.
5. Mechanical events remain complete even if not displayed. Append `race_event_displayed` only when the relevant event cue actually becomes visible (or is explicitly announced by static playback), and `race_event_seeked`/pause/skip actions only as genuine user actions where Receipt-relevant. Highlight visibility is separate from event existence. Playback interruption leaves unseen cues unclaimed. No frame-by-frame log flood.

## Playback, scene, and motion mapping

All runners, finish line, pond/track scenery, and camera share one world projection. Do not move runner geometry to solve label overlap; use a scoped label treatment. Use the true simulated heading plus oval-facing transform for the paper duck. At first forward crossing, freeze simulation and classify followers at that same instant using Plan 13's stable order; do not teleport them to the line. Report the full playback wall duration separately from the simulation finish time. Keep the two-second highlight presentation-only and inside the accepted ±15% simulation target tolerance accounting.

Normal playback presents the committed race with the selected two-second highlight. In reduced-motion/static mode, use the five fixed checkpoints at 0/25/50/75/100% plus recorded event stills and event-linked seeking; do not animate zoom, lighting, or slowdown. Event-linked seeking pauses at a recorded event time and describes only recorded facts. A highlight can be skipped. Pause, skip, seek, replay, and reload use the same committed resolution while preserving identical information, choices, finish, accessible commentary, keyboard operation, and immediate exit.

Motion selector reads recorded positions/ranks/events only. Sample rank at a declared checkpoint cadence with hysteresis so a one-tick pass does not restart loops. Leading-two bob is a cosmetic locomotion selection only. Actual logged duck/wall impacts interrupt locomotion, play one accepted impact/recovery segment per recorded event, then resume the current rank-selected locomotion; avoid retriggering every playback tick. Static/reduced motion renders the same participants and cause facts without animation. No unlogged impact, new speed penalty, physical-duck motion, or whole-collection loop.

## Evidence and approval sequence

**Now:** report-only proposal and source/input inspection. No production write, tests/build, or browser activity.

**Before source edits:** QP Orch approves/revises this proposal, confirms Plan 20 accepted source handoff, and assigns each production/test file to one writer. If Plan 20 still owns any shared path, serialize work rather than overlap it. QP Orch coordinates a browser slot only after implementation and offline evidence are ready.

**After approval:** first validate model parity against Plan 13's accepted reference outputs and tests; run the complete production input matrix including roster/stance/trial, guard/no-payout, and representative witnesses; prove identical mechanical outputs for identical resolver inputs. Then verify reward/trial idempotency on repeat commit, cancel, save/reload, legacy migration and malformed saves; validate append-only display evidence; measure storage bounds. Verify presentation invariance under pause, replay, seek, skip and reload, reduced/static parity, five checkpoints, event-linked seek truth, and all terminal/exit paths. Build and relevant/full tests follow packet requirements; one coordinated real production race browser turn at narrow and desktop viewports covers keyboard, static/reduced motion and interruptions. Report exact observed settings and any untested hardware/media paths. No deployment or push.

## Open items returned to QP Orch

1. Decide how to proceed because none of the screened global adapters passed both the accepted pacing band and modifier-preservation checks. Square-root 9–12 and log 9–12 are follow-up candidates only; their failed invariants are stated in `adapter-analysis.md`.
2. Confirm exact Plan 20 handoff files. Keep all Plan 20 source read-only until its owner acceptance and handoff.
3. Approve the proposed production/test write set or provide a narrower owner assignment.
4. Set a production payload budget after compact round-trip and capped-size measurements. This report measures reference objects and five compact examples, not an actual watchdog result or production storage timings.

No production or browser verification claim is made by this report.
