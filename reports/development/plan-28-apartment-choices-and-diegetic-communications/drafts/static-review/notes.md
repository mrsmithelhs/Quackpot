# Plan 28 comparison prototype: static review (source only, nothing executed)

Scope: comparison/ (life-model.mjs, views.mjs, fixtures.mjs, prototype.js, index.html, prototype.css, plan28.test.mjs). Read-only; the two files changed on disk mid-review (views.mjs, plan28.test.mjs) were re-read and checked in their current form.

## Verified clean

- **Imports (category 1).** `../../../../` from comparison/ reaches the repo root (comparison → plan-28 → development → reports → root). All named imports exist: `GameEngine`, `GAME_CONSTANTS` (game-engine.mjs:42,84), `validateSave` (storage.mjs:60), `renderScene` (apartment/index.mjs:98), `createStageTransition` (stage-transition.js:4). Every local import matches an export in life-model.mjs, views.mjs and fixtures.mjs. index.html:8 stylesheet target exists.
- **renderScene arguments (category 2).** Only option keys in the accepted list (index.mjs:100). Enum values are valid (areas, framing, light, duckView, furnishings). Phone strings are within PHONE_LIMITS (index.mjs:26): prototype.js:74 `6:40 PM` (7 ≤ 8), `MESSAGES` (8 ≤ 12), `Marisol`, `Shift tonight?` (14 ≤ 16); prototype.js:81 `QUACKPOT`, `Welcome`/`back`, `Ready when`/`you are`. Empty BLANK_PHONE (life-model.mjs:56) passes checkText. idPrefixes match `^[a-z][a-z0-9-]{0,23}$` (core/ids.mjs:4).
- **Engine methods (category 3).** All exist with the assumed signatures: billExpense (game-engine.mjs:739), chooseZeroCashOption (798), getCurrentEscalationStep (857), acceptEscalation (886), declineEscalation (964), clickUninstall (990), leaveUninstall (1010), stayUninstall (1025), creditWage (720), advanceDay (1086), toEnvelope (1093), fromEnvelope (1111), isTerminal (133). `log.entries`, `log.length` exist (event-log.mjs:56,60). Traced: rent at 15.00 gives zeroCash and `d2_afternoon_zerocash` (739-773); rent at 14.01 gives escalation, index 1→2, first offer extra_shift (784-790, 863-868).
- **Tests (category 4).** Traced every assertion against engine logic and fixture data. Fixture pins match the files: SHA-256 of both files equals `fixture.sha256`; byte counts 170013 and 170061; `eventCount` 46 and chain tails `eb597f89` and `18fbcc52` match the eventLog; `boundary` values match catalog.json (step, activeModal null, phase playing, cash 15 / 14.01, activeBill null). Ledger fields exist (food `d2_food` paid, wage income with clock day 1). Assertion strings match views.mjs (lines 96, 108, 125, 129). H2 colour markers each occur once per item: SOFA at living.mjs:5, SCREEN at living.mjs:7, GHOST at rooms/specs.mjs:17. I expect all tests to pass, with two caveats below.
- **Duplicate clicks (category 5).** Double-click is blocked by the busy flag (prototype.js:134-139). Pay is synchronous and the engine is idempotent (game-engine.mjs:746-753). No double-charge path found.

## Findings

1. **Likely bug. Stale async action overwrites a newer scenario.** prototype.js:161-162 captures `ui.engine` before awaiting; lines 201-203 (`open-quackpot`) and 205-207 (`return`) await `turnPhone` and then `show()` regardless of generation. startScenario (43-45, 63) replaces the engine and cancels the transition. stage-transition.js:9-11 sets `cancelled`, and `run` then resolves `false` (lines 111, 115) without throwing, so the stale action still renders. `return` also uses the old engine (`returnView(engine)`). Fix: record `const gen = ui.generation` at the top of `act`, and after each await `if (gen !== ui.generation) return;`. Check the `run` result too.

2. **Likely bug. Old card stays clickable while a scenario loads.** startScenario sets `ui.view = null` (prototype.js:48) but leaves the old buttons enabled until the fetch finishes (51). Clicking "Continue" then runs act → `ui.view.next` (164) → TypeError → caught at 142 and shown as "Prototype error". Pay or accept on the old card mutates the old engine, which is then silently replaced (63). Fix: set `ui.busy = true` and disable card buttons (or clear `#card`) at the start of startScenario.

3. **Likely bug (minor). Unhandled rejection on scenario change or reset.** Change and reset handlers (prototype.js:243-244) call startScenario, which can throw (readRepoFile at 36-37 throws on HTTP error or on file://). The only `.catch` is at 247, which covers the first call only, so the card silently stays stale. Fix: route all startScenario calls through one wrapper that renders the blocked card on error.

4. **Nit (logic). Wrong moment for an unresolved ladder accept.** views.mjs:131 maps any non-sale, non-shift accept to `rent-settled`, even when the card says "Rent still unpaid" (129, 136). Unreachable with these fixtures because every accept resolves at 14.01 (game-engine.mjs:944). Fix: map to `rent-unpaid` when `!rentPaid`.

5. **Nit (contract). Preview is not fully pure.** life-model.mjs:2 says previews never mutate the engine. previewLadder calls `engine.getCurrentEscalationStep()` on the live engine (life-model.mjs:163), and that can advance `state.escalationStepIndex` (game-engine.mjs:865-877). Benign for both fixtures. Fix: call it on a clone, or correct the comment.

6. **Nit (comment). Wrong citation.** plan28.test.mjs:109 cites the ghost at rooms/specs.mjs:16-17. Both ghost rects are on line 17. The count-based check is still correct.

7. **Nit (UI). Duplicate cues.** show() pushes a cue on every render (prototype.js:101-103), including the morning-framing re-render (245). The ledger cue is logged twice per framing change. Fix: push only on a new moment.

8. **Nit (concurrency). busy flag cleared by stale work.** The finally at prototype.js:143 and startScenario at 70 reset `ui.busy` regardless of which operation owns it. Fix together with finding 1.

9. **Nit (run instructions).** prototype.js:36 and index.html:8 resolve from the repo root, and the module needs HTTP. Serving only comparison/ or opening via file:// will fail. Document the serve root.

## Not verified

- validateSave and engine hydration were not executed. The fixture-load assertions rely on the recorded `valid: true` pin (fixture-validation-index.json).
- No browser or node run. Visual layout and focus were not checked.
