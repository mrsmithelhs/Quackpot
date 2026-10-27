# Plan 23 production integration proposal — refreshed after DECISION-023

**Date:** 2026-10-27
**Stage:** Exact source ownership and lifecycle proposal for QP Orch review. Production files remain untouched pending this review.

## Authority and target

Plan 23 is `RUNNABLE`. Plan 20 is owner-accepted and its source hold is released. DECISION-023 adopts the latest tested report preview and authorizes production integration under QP Orch supervision. This refresh supersedes the earlier proposal’s pending calibration decision, Sprint mean 1.10, and same-instant follower classification. It does not claim production implementation or validation.

Port the adopted `R2combined-risk-only` candidate unchanged: shared affine conversion `8.25 + 0.5 × sampled rating`; rank-weighted weave, seeded 15–20° contact, rear acceleration/recentering/turn assistance and controlled leader slowdown; current course, controller and caps; Safe ±5%; risk-only Sprint mean 1.00 ±20%; genuine individual crossing order; current front-row field fixture and existing 50/20/10 Gem places. Preserve the two-second presentation-only highlight and the accepted larger podium, last-crossing reveal, overlapping one-second coast/descent, whole-environment lighting, first-place graceful bob, second/third paddle, pause and reduced/static behavior. The timing target remains on winner crossing; last crossing and full playback remain separate measures.

Plan 22 owns rest calculation and lifecycle. The resolver accepts a clean `restFactor`/effective-base input defaulting to 1, and this integration does not calculate rest. Do not import any file from `reports/` at runtime, tune the adopted model, implement the 6-Down pull exchange, or add art/audio/deployment work.

## Current source findings

- `src/core/game-engine.mjs::runRace()` currently samples one player performance and five opponents, ranks once, pays immediately, appends `race_result`/`reward`, and caches only a summary. It falls back to the first roster duck for an unknown ID. It has no Plan 17 three-Down trial purchase, availability, or consumption API. The current roster ratings are 10/14/20; the two field bases are 8 and 11.2.
- `src/ui/race-view.js` renders a diagnostic/scout table and preset lane percentages. Its race form has racer and Safe/Sprint controls. The `race_choice_offered` event is currently appended inside `runRace()` after Start Race, so that record cannot establish that those options were displayed before selection.
- `src/main.js` owns the two race entry/result route callbacks and autosave. `src/core/storage.mjs` accepts envelope schema v1 only; current corrupt-save preservation and temporary-memory fallback must remain in place. `GameEngine.toEnvelope()/fromEnvelope()` store state, four PRNG streams and the append-only log. `EventLog.append()` provides immutable hash-chained records; `projectReceipt()` reads the log and currently projects `race_result` summaries.
- Plan 20’s reusable production files are `src/core/duck-rig.mjs`, `src/ui/duck-rig-view.mjs`, `src/ui/duck-motion-controller.mjs`, and `src/ui/duck-motion.css`. They are dependencies/read-only. The existing controller provides the accepted paddle and graceful-bob loops; the new race wrapper will map recorded impacts to the accepted impact/recovery behavior without altering contact mechanics or the card controller.
- The accepted preview resolver is only under `reports/development/plan-23-production-race-integration/drama-preview-01/`. It has 1,440 frozen first-cross parity cases and 613,391 sampled returned-trajectory-prefix frames with zero mismatches. This remains report evidence; production parity must be demonstrated independently against its frozen inputs/artifacts.

## Proposed exact write ownership

One production writer owns only the following paths. Existing Plan 20 motion and rig files, `src/style.css`, report root-review notes, shared design/decision documents, packet status, and package/build configuration stay out of the write set.

| Path | Owned work |
|---|---|
| `src/core/race-resolver.mjs` (new) | Pure, versioned port of the adopted resolver; input validation, keyed deterministic draws, all entrants’ crossings and continuation, immutable bounded result, honest guard/unresolved return. No DOM, engine mutation, report imports, or mutable run-RNG consumption. |
| `src/core/game-engine.mjs` | Race commit boundary, selected roster/field/stance/trial inputs, resolver call-once guard, result persistence, idempotent rewards, trial integration, and progress reconciliation. Keep non-race rules intact. |
| `src/core/storage.mjs` | Schema-v2 validation/migration for the new versioned race-resolution record and its consistency with the append-only log; retain existing corruption backup and memory-fallback behavior. |
| `src/core/receipt.mjs` | Compact projection of committed race facts, actually displayed cues and user race actions into existing Receipt registers. |
| `src/ui/race-view.js` | Replace preset lane animation/technical table with the focused race scene, concise factual commentary, optional event-linked paused views, static checkpoints, keyboard-operable controls and explicit exit. |
| `src/ui/race-playback-controller.mjs` (new) | Presentation clock, highlight, pause/resume, skip, event seek, reduced/static rendering and teardown. It reads committed results only; it never invokes mechanics or RNG. |
| `src/ui/race-motion-controller.mjs` (new) | Per-racer rig creation and cleanup; normal paddle, rank-sampled/hysteretic leader bob, recorded-contact impact/recovery priority, and podium roles/ambient pause. It maps evidence to visuals and cannot create events or outcomes. |
| `src/ui/race-view.css` (new) and `src/main.js` | Race-scoped presentation styles and narrowly scoped import/callback cleanup wiring only. No broad main or global stylesheet growth. |
| `src/core/race-resolver.test.mjs`, `src/ui/race-playback-controller.test.mjs`, `src/ui/race-motion-controller.test.mjs` (new) | Focused deterministic parity/guard, presentation-invariance and motion-lifecycle tests. |
| `src/core/game-engine.test.mjs`, `src/core/storage.test.mjs`, `src/core/receipt.test.mjs` (new) | Focused commit-once, trial/reward idempotency, migration/corruption/round-trip and Receipt honesty coverage. Existing tests are extended only in the relevant areas. |
| `reports/development/plan-23-production-race-integration/progress.md` | Final evidence and handoff report, committed as the last scoped write. |

QP Orch is asked to approve or revise this exact list before production source changes. Any necessary scope change returns to QP Orch before touching the additional path.

## Effective input and trial boundary

At entry, validate the selected racer against the owned roster; never silently substitute another identity. Record the field fixture/race ID, model/config version, root-seed-derived race key, selected identity, authored rating, rest factor (currently 1), trial state, stance and sampled inputs. Input order is:

1. Select the authenticated owned duck’s authored base rating (10/14/20).
2. Multiply by the explicit effective-speed/rest factor supplied by the caller (1 for this integration; Plan 22 owns future values).
3. Apply the purchased Plan 17 trial’s +5% to base once, if available and explicitly selected.
4. Apply the keyed stance sample: Safe uses mean 1.00 and ±5%; Sprint uses the adopted mean 1.00 and ±20%.
5. Apply the shared affine conversion `8.25 + 0.5 × sampled rating` once, then pass that physics-domain input to the adopted course/controller.

The trial is the accepted 3-Down, one-race, non-stacking item. The race-entry view must expose its optional purchase/use state plainly and require explicit activation; it must not spend Down merely because the player opens, cancels, or reloads the form. Buying and consuming are distinct logged actions: purchase subtracts 3 Down once and records an available trial; race commit consumes that availability once. The 6-Down draw is not added. No effect is applied twice across `effectiveSpeed` and the resolver.

The saved race-local seed/key and resolver/config version are immutable input evidence. The resolver uses deterministic keyed draws rather than advancing the game’s root, draw, race or event streams. Replaying/reloading presentation reads the committed resolution and cannot consume any stream.

## Resolve-once, payout and unresolved semantics

On explicit Start Race, validate all inputs and resolve a candidate synchronously before mutating balances, trial availability, completed-race state or append-only evidence. A successful completed candidate is committed once: persist the immutable resolution; append one compact committed-result record with result digest, config/input identity, individual crossing order/places, status and Gem outcome; consume a selected trial once; apply the existing place-based payout once; then mark progression complete. Repeated callback or restore returns that committed object. The full trajectory is stored once in `state.raceResolutions[raceId]`, not duplicated into the event log.

If an accepted guard returns unresolved, do not invent a winner/place, award Gems, or silently turn it into a completed race. Record the bounded guard evidence and do not attempt a second resolution under the same race key. **QP Orch must confirm the progression/purchase edge before that branch is implemented:** does an unresolved committed attempt consume the already purchased Plan 17 trial and count as the existing race step for progression, or must the attempted race remain retryable without spending the trial? The accepted “consume once on race commit” wording makes this a real boundary case; implementation must not choose a user-facing ending or retry policy silently. The no-payout and no-duplicate-charge rules are fixed either way.

## Save/reload and bounded payload proposal

Keep the existing storage key and introduce envelope schema v2 with `state.raceResolutions`. `loadGame()` migrates a valid v1 envelope in memory before v2 validation: retain all existing state, PRNG snapshots and hash-chained events; translate no old entries; mark previously completed races as legacy summaries. A legacy race shows its recorded static result only and has no synthesized trajectory, contact, display or seek evidence. Saving after migration writes v2. Invalid v2 payloads use current corrupt-save backup/recovery; never reconstruct a resolution from presentation state or a digest mismatch.

The report-only individual-crossing resolver was measured in memory on two finished six-entrant cases (432/433 ticks). Full JSON objects were 621,611/629,251 bytes. A proposed renderer/storage projection with fixed entrant order, integer trajectory rows `[tick, progress×1000, lateral×1000, heading×10000, speed×1000]` for each entrant, derived world coordinates, exact separate crossing witnesses, inputs, finish table, event records and opportunity records was 90,703/92,614 bytes. This is a sizing sample, not production format evidence or a watchdog bound. Before source adoption, test encode/decode error against renderer and resolver witnesses, ensure crossing order/timing and event seek parity, and measure 800-tick/128-event/84-diagnostic caps. Proposed ceiling: 512 KiB per race resolution and 1 MiB for both races, excluding the ordinary run log; report actual serialized and round-trip costs. Do not accept a lossy codec or claim a maximum until the cap matrix passes. If the bound cannot be met, bring the measured alternative back to QP Orch rather than dropping required evidence.

## Append-only evidence and Receipt

- Record `race_choice_offered` when the entry options are actually rendered, with a stable exposure ID; current append timing after Start Race is corrected so “We displayed” is factual and repeat render does not duplicate the same exposure.
- Preserve the player’s actual duck/stance/trial actions as action events. Record the trial purchase and consumption separately.
- Append the committed mechanical result once with a digest and compact crossing/placement/payout facts. Keep detailed mechanical contacts/crossings in the immutable resolution plus bounded mechanical event records as needed for Receipt; no per-frame log entries.
- Append a race cue/display event only when commentary, highlight or a contact cue is actually presented (including the static equivalent when that is what the player sees). Append seek/pause/skip actions only when genuinely invoked and Receipt-relevant. A skipped/interrupted/unseen event is never recorded as displayed.
- Keep the Receipt a pure log projection with its “We displayed / You did / Did this affect you?” separation. Displayed evidence references stable event IDs and the resolution digest; it does not infer events from final balances or resolution contents.

## Playback and motion mapping

Use the actual individual finish sequence and a shared track/duck camera projection. The two-second highlight is anchored to the adopted first-cross segment. At each racer’s recorded crossing, ease that racer toward rest for about one second. At the last genuine crossing, start the approximately one-second podium descent and whole-environment `brightness(.43) saturate(.75)` transition while the last coast continues. Keep labels, finish markings and upper finishers readable. Race ends only after all coasts and the podium descent complete. The final podium shows actual first/second/third recipients, with graceful bob on first and paddle on second/third; a separately labeled control pauses/resumes ambient podium loops after race completion.

All animation consumes only the committed timeline and logged events. Sample rank on a declared checkpoint cadence with hysteresis; ordinary motion is paddle, leading two may use graceful bob, and recorded wall/duck contact triggers one priority impact/recovery sequence before returning to locomotion. Each per-duck rig has a unique ID prefix and explicit teardown. Race Pause freezes race, coast, podium entrance and lighting phases together; the podium-motion preference is preserved across temporary race pause. Skip settles the committed race and podium without changing the player’s ambient-loop pause preference. Reduced-motion/static mode creates no loop controller and presents equivalent names, finish order, causes and payouts. Hidden-document, seek, restart, scenario change and unmount suspend or destroy controllers without altering mechanics.

Provide concise plain-language race commentary instead of the diagnostic table. Retain five static checkpoints (0/25/50/75/100%) plus recorded event stills. Event-linked seeking pauses at the event’s recorded time and explains only committed facts. Keep controls keyboard accessible and immediate exit available. No animated camera/lighting/slowdown in reduced/static mode.

## Validation, browser coordination and delivery gate

After QP Orch approves this proposal and exact source ownership:

1. Port only the adopted candidate and compare production outputs with the frozen 1,440 reference matrix, including actual returned trajectory frames through first crossing, all individual crossing times/order, event dispatch/contact endpoints, caps, exact/near ties, unresolved guards and stable final placements/payouts. Verify actual roster ratings, fields, Safe/Sprint, trial true/false and stable effective-speed input; winner timing and last/playback distributions remain reported separately.
2. Validate schema-v1 migration and legacy static summaries, v2 round-trip/size/corruption cases, corrupt-save backup behavior, resolver once per race key, cancel/reload/re-entry, trial spend/consume and reward idempotency. Verify the append-only chain/digest and Receipt never claim a hidden or skipped event was displayed.
3. Verify playback pause/resume, skip, event seek after completion, all five checkpoints, restart/scenario/unmount/document-hidden cleanup, loop-control preference, reduced/static parity, and no mechanical/RNG changes. Confirm production bundle contains no report imports and runtime remains offline.
4. Run focused tests, project-required test/build checks, then request a coordinated QP Orch browser slot for actual production desktop/narrow race witnesses. Preserve owner tabs, existing server and saves. Report exact viewport, interactions, serialized sizes, test commands, limitations and one allowed Sol-low review of the main production artifact before delivery.

No browser turn starts before QP Orch confirms the slot. No packet status, push or deployment is in scope. Final integrated race remains subject to owner rendered review.
