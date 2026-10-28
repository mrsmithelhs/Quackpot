# Plan 22 implementation progress

**Date:** 2026-10-27
**Packet:** `plan-22` remains `in-progress`; no packet status or owner disposition was changed.
**Implementation/evidence commit:** `a59c043` (`Implement Plan 22 race rest`).
**Production posture:** local implementation only; no push or deployment.

## Implemented mechanism

- Rest is derived per owned digital duck identity from completed `race_result` events. The selected factors remain unchanged: no other completed race since this duck raced gives 0.50; one gives 0.75; two or more gives 1.00; no usable prior identity history gives rested.
- Unknown or retired-roster IDs are treated as unusable history. The append-only policy activation records a baseline after the last unknown completed identity, without guessing which duck raced. Unresolved attempts do not advance rest.
- The existing atomic duck/stance/optional-trial submission remains. All owned ducks stay keyboard-selectable, including tired ducks. Candidate order follows actual effective input. Existing digital-rig art and per-duck cosmetics are reused with unique SVG IDs.
- Player-facing cards show speed rating, race rating, Rested/Needs rest, concise penalty reasons, and the 50% → 25% → rested cadence. Text uses a shared decimal formatter for display only; full numeric resolver and log values are retained. Pace option evidence now matches the visible “Steady pace” / “Variable pace” wording.
- Candidate and trial exposure is logged only when the document is visible and the candidate card or trial panel is fully inside the viewport. The sticky HUD is accounted for as an occluding region. Scroll, resize and visibility changes refresh exposure evidence; hidden/offscreen choices are not recorded as displayed.

## Save, commit, restore and Receipt lifecycle

- Saves now use schema 3 with `raceRestEvidenceVersion: 1`. The marker is a narrow version boundary for new-policy evidence. Legacy schema 1 summary-only saves and pre-policy schema 2 factor-1 races remain accepted without fabricated policy events or reconstructed race details.
- Schema 1/2 labels are rejected when they retain new-policy facts, candidate rest fields, cached rest evidence, or a serialized resolver factor below 1. Schema 3 validation requires activation before each new-policy choice action and consistent identity, canonical roster rating, factor, history ordinal/basis, trial values, result/attempt caches, and serialized resolver inputs.
- Rest is applied once to the authored base rating; the existing trial multiplier and resolver mapping remain unchanged. Commit resolves/serializes before wallet, progression, trial or log mutation. Re-entry returns the stored attempt; unresolved attempts remain non-retryable and pay no reward, consume no trial and do not advance rest.
- Receipt activation is presented as game-recorded mechanics, not as a displayed cue or invented player action. Older race-choice entries with incomplete candidate/trial fields report only logged options; they do not claim candidate order or trial unavailability.

## Ownership delivered

Implemented only the approved Plan 22 paths: new `src/core/race-rest.mjs` and tests; bounded `src/core/game-engine.mjs`, `src/core/storage.mjs`, and `src/core/receipt.mjs` changes with their tests; `src/main.js` race-exposure wiring; `src/ui/race-view.js`, new scoped `src/ui/race-entry.css`, and race-view tests; `package.json` test-list entries; and Plan 22 proposal, runners, raw screen results, browser observations, and screenshots under this report folder. Shared resolver, rig sources, global styles, Plan 24/26 files, and packet status were not edited.

## Matched resolver evidence

The deterministic report runner recorded 558 accepted-resolver calls: 270 cases in the original matched screen plus 288 synthetic cadence/roster/stance/trial cases. All 558 finished. The fixed 0.50 and 0.75 treatments remained unchanged. In the synthetic one-identity repeat set, 0.50 produced 0 podiums and 0 Gems across 48 cases versus 21 podiums and 470 Gems at factor 1. In the two-identity/one-intervening set, 0.75 produced 27 podiums and 720 Gems versus 48 podiums and 2,220 Gems at factor 1. With two intervening races, factor 1 matched baseline. These are small diagnostic samples, not population guarantees or a whole-run balance result; longer cadences are synthetic because the current story has two races.

## Rendered browser evidence

- The first sandboxed dedicated Chrome launch stopped before page load with exit code `4294930433` and Crashpad `TransactNamedPipe` failure. The exact output is preserved in `browser-results-restricted.json`; that temporary profile was removed. No owner Chrome or native browser profile was touched.
- The permission-backed, report-local isolated harness then passed desktop 1280×720 and narrow 390×844 race-entry cases with reduced motion, plus a 1280×720 no-preference case. It recorded only fully visible cards, refreshed candidate exposure while scrolling, recorded the trial panel when visible, verified keyboard selection, and captured full-page plus viewport screenshots. `browser-results.json` records the exact DOM text/rectangles, visible exposure IDs, trial refresh, screenshot names and profile cleanup.
- The same harness followed the actual story: race 1 finished; the starter was purchased; the rent-recovery choice was taken; then race 2 selected the same duck. The narrow screenshot shows the tired duck still selectable at a 50% lower race rating. The selected factor 0.50 matches the race result, attempt cache, choice action and resolver input; the Receipt reports the penalty. No synthetic history was inserted. The isolated profile and its storage were cleared and removed.
- The earlier `npm run test:smoke` completed at `2026-10-28T02:59:05.441Z` against `index-B4AihKLr.js`. `src/core/game-engine.mjs` and its rest test changed afterward, so that run is retained as pre-final provenance only and is not claimed as verification of the final engine. Its output is archived as `smoke-observations-pre-final.json`.
- A final `npm run test:smoke` completed at `2026-10-28T03:10:14Z` against the frozen runtime source commit `a59c043babf26d62feec840ba7325f72fc9405c6` (committed `2026-10-27 23:00:37 -0400`). It built and served `index-CV2H5-uy.js`, passed all eight journeys and all 20 recorded summary checks, observed zero runtime exceptions and zero external requests, and cleaned up its dedicated temporary profile. The final output is archived as `smoke-observations-final.json`; its SHA-256 matches the generated Plan 03 observation file. The generated Plan 03 file remains outside the Plan 22 commit for root restoration after archive verification.

## Terra-medium read-only review

One read-only reviewer was used after implementation. Requested settings were `gpt-6.1-terra`, medium effort; the reviewer reported the observed model as `gpt-6.1-terra` and could not independently inspect effective effort. All findings were accepted and repaired before delivery:

1. **Offscreen/obscured candidate exposure:** filter exposures to fully visible cards and trial panels; refresh on scroll, resize and document visibility; account for the sticky HUD. Browser evidence confirms the visible set across viewport scroll.
2. **Pace Receipt overclaim:** store the actual visible “Steady pace” / “Variable pace” labels and qualitative descriptions; do not attribute unshown variation percentages to the live screen.
3. **Authored rating identity mismatch:** validate rating against the canonical roster identity.
4. **Unrecognized legacy duck IDs:** establish a history-limited baseline after unsupported identities rather than count them as a known intervening racer.
5. **Activation ordering:** require the committed choice action to follow policy activation and precede the result; the first visible trial offer also activates the boundary first.
6. **Floating-point trial display noise:** normalize human-readable decimal text consistently while keeping exact numeric evidence unchanged.

The separate root review also found a schema downgrade bypass, an activation record incorrectly placed in “displayed,” and overclaims for incomplete legacy exposure events. These were corrected with the schema 3 evidence marker, game-record Receipt placement, and evidence-bounded legacy wording. No review finding was rejected; no second or repair review was requested.

## Verification and remaining gate

- `node scripts/dev/plan-status.js check plan-22` → `RUNNABLE: plan-22 is ready to implement`.
- `npm test` → 194 passed, 0 failed.
- `npm run build` → passed (Vite 8.3.5).
- `npm run test:smoke` → final frozen-source run passed all 8 journeys; 20/20 summary checks true, zero runtime exceptions and zero external requests. Loaded bundle: `index-CV2H5-uy.js`; source commit/time recorded above.
- Report-local browser harness → passed the three viewport/motion cases, scrolling exposure assertions, trial refresh, and natural tired race-two commit.
- `git diff --check` → no whitespace errors (Git emitted only its normal LF→CRLF working-copy notices).

Owner review of the rendered experience and orchestrator packet disposition remain pending. The packet was intentionally left `in-progress`; no push, deployment, or broader balance conclusion is claimed.
