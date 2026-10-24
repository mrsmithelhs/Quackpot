# Plan 03 Progress Report: Core Mechanism and Truthful Receipt Slice (Including Repair 01)

**Date:** 2026-10-24  
**Author:** Implementer (Plan 03 thread)  
**Packet:** [`docs/development/plan-03-mechanism-slice.md`](file:///c:/AI/Quackpot/docs/development/plan-03-mechanism-slice.md)  
**Repair brief:** [`reports/development/plan-03-mechanism-slice/repair-01.md`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/repair-01.md)  
**Review 01 report:** [`reports/development/plan-03-mechanism-slice/review-01.md`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/review-01.md)  
**Preflight proposal:** [`reports/development/plan-03-mechanism-slice/preflight.md`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/preflight.md) (Revision 3, Option 1 approved by Owner)  
**Current Status:** **Implementation and Repair 01 Complete and Verified. Ready for Orchestrator Review.**  
*(Per AGENTS.md guardrails, implementers never set packet completion status in frontmatter; the packet remains `ready` pending orchestrator and owner verification).*

---

## 1. Executive Summary

This progress report documents the initial implementation and subsequent execution of **Plan 03 Repair 01** for the core mechanism and truthful Receipt slice. All defects identified in Review 01 and all requirements specified in Repair 01 have been implemented, tested, and verified end-to-end:
1. **Authoritative Persisted Progression:** Step progression (`step`), active modal state (`activeModal`), completed races (`completedRaces`), and race outcomes (`raceResults`) are persisted in the envelope and restored on reload. Races cannot be rerun or duplicate-awarded across reloads.
2. **Frozen Terminal Runs & Truthful Retention:** When a run reaches a terminal state (such as viewing the Receipt), the Uninstall button is removed from the HUD and post-Receipt retention is completely prevented. When retention is opened after 80 gems have already been claimed, the copy is truthful (no false bonus promise) and staying logs `stay_without_reward`.
3. **Solvent Zero-Cash Options:** When rent is paid and cash reaches $0.00, `chooseZeroCashOption(choice)` allows the player to continue to evening wage, take an extra shift, or sell the couch without conflation with unpaid bill escalations and without forced default.
4. **Deep Semantic Envelope Validation & Resilient Storage:** Storage adapter now rejects malformed envelopes including the exact Review 01 corrupted probes (PRNG word containing a string, cleared `state.owned`, pending reveal with uncommitted duck identity). Corrupted saves are safely preserved under `quackpot_save_backup`. Storage quota failures display an in-app warning banner (`.storage-warning-banner`).
5. **Event-Derived Receipt & Actual Presentation:** Receipt summary scalars (`finalCash`, `finalHealth`, `finalDebt`, `ownedDucksCount`, `totalDown`) are derived strictly from the event log. DOM mounting precedes appending `receipt_shown`, and full precision conditional odds are preserved.
6. **Dual Test Verification:**
   - **Unit Tests (`npm test`):** 89/89 tests passing (expanded with 9 dedicated Repair 01 regression tests covering corrupted envelope probes, backup preservation, zero-cash options, post-terminal protection, race reload idempotency, and repeat retention).
   - **Headless Chrome CDP Smoke Suite (`npm run test:smoke`):** Automated build and CDP browser smoke suite covering 9 full phases, verifying all new regression paths in isolated headless Chrome and writing observations to `reports/development/plan-03-mechanism-slice/repair-01-observations.json` while preserving `smoke-observations.json`.

---

## 2. Advisor Consultation Declaration

- **Branch in Use:** **Branch C — Not advisor-capable (fail-closed to orchestrator-gate-only).**
- **Capability Evidence and Reasoning:** Checked `advisor-capable-providers.json` (version 3). The current execution thread runs inside Google Antigravity. While Antigravity provides an internal subagent tool (`invoke_subagent`), `advisor-capable-providers.json` explicitly lists only `claude-code`, `codex-cli`, and `kimi-code`, with an unambiguous instruction: *"If you cannot confidently match yourself to an entry in that file, treat yourself as not advisor-capable."* Following this fail-closed requirement, this thread declares Branch C. No automated advisor was consulted; review relies entirely on the primary orchestrator gate.

---

## 3. Repair 01 Implementation Details

### 3.1 Authoritative Persisted Progression & Idempotent Mechanics (`src/core/game-engine.mjs`)
- Added `engine.state.step`, `engine.state.activeModal`, `engine.state.completedRaces`, and `engine.state.raceResults` to the authoritative state persisted in the storage envelope.
- In `runRace(raceNumber, duckId, stance)`, checks if `engine.state.completedRaces.includes(raceNumber)`. If already executed, returns the cached outcome from `engine.state.raceResults[raceNumber]` without re-awarding gems, re-advancing the PRNG stream, or re-logging events.
- In `src/ui/race-view.js`, if the race is already marked completed, the entry form and animation track are bypassed on render, immediately displaying the persisted placement badge and claimed prize.
- In `commitPromotionalTenPull()`, guarded against duplicate calls by checking if `state.owned.length > 0` or if ten pulls are already committed.
- In `buyStarterPack()`, guarded against duplicate purchase by checking if `state.starterBought` is already true.

### 3.2 Frozen Terminal Runs & Truthful Retention (`src/ui/hud.js`, `src/ui/modals.js`, `src/core/game-engine.mjs`)
- In `src/ui/hud.js`, when `engine.isTerminal()`, the `#btn-uninstall` button is removed from the DOM and replaced by a locked `.hud-terminal-pill` ("Terminal View"). The manual Save button is disabled and marked as "Run Concluded".
- In `src/core/game-engine.mjs`, `clickUninstall()` checks `isTerminal()` and refuses execution with an error if terminal. Post-Receipt retention dialogs are structurally prevented.
- In `src/ui/modals.js`, `renderRetentionModal()` inspects `engine.state.retentionGemsClaimed`. When already claimed, the modal renders truthful copy:
  > *"You have already claimed the 80 bonus gems from a previous exit attempt. No additional bonus is available, but you can continue this run."*
  The "Stay & Collect 80 Free Gems" button is replaced by "Stay & Continue Run (No Bonus)".
- In `src/core/game-engine.mjs`, `stayFromRetention()` checks `state.retentionGemsClaimed`. If already claimed, gems are not awarded and event `stay_without_reward` is logged instead of `retention_stay`.

### 3.3 Solvent Zero-Cash Actions (`src/core/game-engine.mjs`, `src/ui/modals.js`)
- Disentangled the zero-cash offer from unpaid escalation default:
  - When rent is paid ($15.00) from a frugal balance ($15.00), cash drops to $0.00 while all bills are paid.
  - Instead of invoking the unpaid bill escalation ladder (`acceptEscalation`), the engine surfaces `activeModal: 'zerocash'`.
  - Added dedicated method `chooseZeroCashOption(choice)` supporting `'continue'`, `'extra_shift'`, and `'sell_couch'`.
  - `'continue'`: Logs `zero_cash_action` with `choice: 'continue'`, leaves cash at $0.00, and proceeds to the scheduled evening wage (+10.00).
  - `'extra_shift'`: Grants +$10.00 cash, deducts 15 HP, logs `zero_cash_action`, and proceeds.
  - `'sell_couch'`: Grants +$10.00 cash, marks couch sold, logs `zero_cash_action`, and proceeds.
  - None of these options trigger unpaid debt or default (`running_on_empty`).
- Unpaid bills ($14.01 < $15.00) continue through the canonical ordered escalation ladder in `acceptEscalation(step)` and terminate on `running_on_empty` only when all eligible options are refused.

### 3.4 Deep Semantic Validation & Storage UI (`src/core/storage.mjs`, `src/ui/hud.js`, `src/ui/desk-view.js`)
- **PRNG Deserialization Hardening:** Validates that each of the four PRNG state words (`sfc32` internal state `[a, b, c, d]`) is a strictly valid uint32 integer (`typeof w === 'number'`, `Number.isInteger(w)`, `w >= 0`, `w <= 0xFFFFFFFF`). Rejects strings like `"bad"`.
- **Roster & Reveal Consistency:** Rejects envelopes where `state.owned` array length does not match unique drawn identities in the event log (e.g., cleared owned array). Rejects envelopes where any item in `pendingReveals` contains an uncommitted duck identity (e.g., `"duck-NOT-COMMITTED"`).
- **Corrupt Save Preservation:** Added `backupCorruptSave(storage, envelopeStr)` which copies malformed or unhydrateable envelope strings to `quackpot_save_backup` before clearing the active key.
- **Quota Exceeded UI:** When `saveGame()` catches a write error (e.g., `QuotaExceededError`), it returns `{ ok: false, error: 'storage_quota_exceeded' }`. `src/main.js` catches this and displays a persistent warning banner (`.storage-warning-banner`) informing the learner that progress is held in temporary memory.
- **Start Menu Autosave Control:** Added an autosave toggle checkbox to `src/ui/desk-view.js` so learners can opt out of autosave before launching the app.

### 3.5 Event-Derived Receipt & Actual Presentation (`src/core/receipt.mjs`, `src/ui/receipt-view.js`)
- `generateReceipt(entries)` now computes summary resource scalars purely from event history:
  - `finalCash`: Derived from initial cash + wages + escalation cash + zero cash + sales - expenses - purchases.
  - `finalHealth`: Derived from 100 - all health deductions.
  - `finalDebt`: Derived from all credit draws.
  - `ownedDucksCount`: Derived from set of unique `draw_committed` duck IDs.
  - `totalDown`: Derived from duplicate duck Down conversions.
- In `src/ui/receipt-view.js`, the receipt HTML is rendered and inserted into the DOM *before* calling `engine.recordReceiptPresented()`. This guarantees that `receipt_shown` is appended only after actual DOM presentation. Full decimal precision for conditional pity odds is preserved in the audit table.

### 3.6 Paired Physical Duck Recheck Clarification
- In section 3.2 of the founding report, clarification was made that the 100-seed paired simulation recheck in [`sim/recheck-own-duck-boundary.mjs`](file:///c:/AI/Quackpot/sim/recheck-own-duck-boundary.mjs) demonstrated 100% identical race placements under the bounded conditional scenarios where player duck selection and PRNG alignment were held constant (`best` and `alternate` policies).
- It is explicitly acknowledged that under unconstrained or diverging player choices, different rosters can lead to divergent race entries. The physical duck separation is a design boundary ensuring metagame physical companion styling does not alter digital collectible gacha attributes.

---

## 4. Verification Evidence

### 4.1 Unit & Integration Test Suite (`npm test`)
Ran via `cmd.exe /c "npm test"`:
```
ℹ tests 89
ℹ suites 0
ℹ pass 89
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2156.1
```
**Test Breakdown:**
- `src/core/game-engine.test.mjs` (13 tests):
  - Pre-draw linear pity odds at soft pity (draw 35) and hard pity (draw 50).
  - Trace 1 (Frugal / Solvent): 4 bills totaling $30.00, zero-cash continuation, finish on `run_complete`.
  - **[Repair 01 Regression]:** Zero-cash extra shift and sell couch keep run solvent and active.
  - **[Repair 01 Regression]:** Post-terminal actions are rejected.
  - **[Repair 01 Regression]:** Race execution is idempotent on reload/rerun.
  - **[Repair 01 Regression]:** Repeat retention does not re-credit gems and logs `stay_without_reward`.
  - **[Repair 01 Regression]:** Card reveals match exact committed index.
  - Trace 2 (Starter Pack + Escalation Recovery): Extra shift (+10 cash, -15 HP), finish with $14.01.
  - Trace 3 (Starter Pack + Default): Decline all escalations, finish on `running_on_empty`.
  - Trace 4 (Uninstall): Retention modal, leave immediately, finish on `uninstall`.
  - Tactical racing stances non-dominated under weaker vs. faster fields (synthetic Common fixture).
  - Commit-before-reveal reload integrity and unrevealed Receipt provenance.
  - Idempotent Receipt presentation on reload after completion.
- `src/core/storage.test.mjs` (11 tests):
  - Save/load valid game envelope cleanly.
  - Semantic validation detects mismatched state values.
  - Semantic validation detects corrupted PRNG streams.
  - **[Repair 01 Regression]:** Rejects PRNG state word with string `"bad"`.
  - **[Repair 01 Regression]:** Rejects envelope when `state.owned` is cleared.
  - **[Repair 01 Regression]:** Rejects pending reveal with uncommitted identity `"duck-NOT-COMMITTED"`.
  - **[Repair 01 Regression]:** `backupCorruptSave` preserves invalid data under backup key.
  - Semantic validation detects broken event log hash chain.
  - Write failure activates in-memory session and leaves stored snapshot untouched.
  - Safe handling of malformed JSON.
  - Clear game functionality.
- `sim/model.test.mjs`, `sim/prng.test.mjs`, `sim/receipt.test.mjs` (43 tests):
  - Pure modules relocated from `sim/` to `src/core/` verified passing all simulation tests.
- `scripts/dev/smoke-validator.test.mjs` (11 tests):
  - Port collision, subpath, network isolation, DOM assertion validators.
- `scripts/dev/plan-status.test.js` (11 tests):
  - Plan status tooling tests.

### 4.2 Automated Headless Chrome Smoke Suite (`npm run test:smoke`)
Executed via Chrome DevTools Protocol in an isolated browser profile. All observations written to [`reports/development/plan-03-mechanism-slice/repair-01-observations.json`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/repair-01-observations.json) (while preserving [`reports/development/plan-03-mechanism-slice/smoke-observations.json`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/smoke-observations.json)):
```
=============================================================
PLAN 03 REPAIR 01 SMOKE TEST VERIFICATION RESULTS
=============================================================
  [PASS] Isolated process ownership & port check
  [PASS] Dedicated temporary browser profile
  [PASS] Build freshness & chunk filename verification
  [PASS] Initial load under /Quackpot/ (bounded event wait, all 200 OK)
  [PASS] DOM mounted and SVG decoded
  [PASS] Reload verification (bounded event wait, DOM + 200/304 cache requests)
  [PASS] Zero runtime exceptions, zero console errors, zero external requests
  [PASS] Journey 1: Early Uninstall -> Receipt Presentation -> No Post-Receipt Retention
  [PASS] Journey 4: Saved race result reload with exactly one reward (no duplicate)
  [PASS] Journey 5: Modal interruptions (Uninstall/Stay) restored; truthful repeat copy
  [PASS] Journey 6: All zero-cash buttons tested natively; run remains solvent
  [PASS] Journey 7: Corrupted save preserved under backup; storage quota warning active
  [PASS] Journey 8: Autosave disabled at start honored; manual save path verified
=============================================================
```

---

## 5. Table of Changed and Created Files

| File Path | Action | Description |
|---|---|---|
| `src/core/game-engine.mjs` | Modified | Persisted progression state, guarded race execution, zero-cash options, truthful retention stay, card index reveal. |
| `src/core/game-engine.test.mjs` | Modified | Added 5 unit regression tests for zero-cash, post-terminal lock, race reload, repeat retention, and card index reveal. |
| `src/core/storage.mjs` | Modified | Strict uint32 PRNG word checks, owned/reveal consistency checks, backup key preservation, phase validation. |
| `src/core/storage.test.mjs` | Modified | Added 4 unit regression tests for `"bad"` uint32, cleared owned, uncommitted reveal, and backup preservation. |
| `src/core/receipt.mjs` | Modified | Pure event-derived summary scalars, full decimal odds precision. |
| `src/main.js` | Modified | Corrupted save restore UI, storage warning banner, autosave initialization, race HUD updates. |
| `src/ui/hud.js` | Modified | Terminal state pill, post-receipt uninstall button removal, save button locking. |
| `src/ui/desk-view.js` | Modified | Added start-screen autosave toggle checkbox. |
| `src/ui/gacha-view.js` | Modified | Direct card index reveal wiring. |
| `src/ui/race-view.js` | Modified | Bypasses setup and animation if race is already completed in persisted state. |
| `src/ui/modals.js` | Modified | Truthful repeat retention copy; wired zero-cash continue, extra shift, and sell couch buttons. |
| `src/ui/receipt-view.js` | Modified | Mounts DOM before recording presentation; renders derived summary scalars. |
| `src/style.css` | Modified | Added styling for `.storage-warning-banner`, `.hud-terminal-pill`, `.save-toast-warning`, `.odds-cell`. |
| `scripts/dev/smoke-browser.mjs` | Modified | Added Journeys 4, 5, 6, 7, 8; `waitForVisible` helper; outputs to `repair-01-observations.json`. |
| `reports/development/plan-03-mechanism-slice/repair-01-observations.json` | Created | Machine-readable observations artifact for Repair 01 verification. |
| `reports/development/plan-03-mechanism-slice/progress.md` | Modified | Complete progress report documenting Repair 01 implementation and verification evidence. |

---

## 6. Stop Condition & Packet Status

Per the packet instructions and AGENTS.md guardrails:
- Implementers never set completion status in frontmatter (`status: ready` remains unchanged).
- All scoped code changes and test runs are complete.
- All 89 tests pass and browser smoke test passes cleanly across all 9 phases.
- Committing scoped work locally; no push will be performed.
- Returning for orchestrator review and owner acceptance.
