# Plan 21 progress

**Date:** 2026-10-27  
**Stage:** Repair 03 implemented and verified; delivered for orchestrator and owner review.

---

## 1. Overall Summary & Repair 03 Scope

Addressed the two remaining defects from `review-03.md` per instructions under `coordination-steering-01.md`:
1. **Defect 1 (P2 — Static/reduced-motion paths obey activity guards):** Gated fast-pull and reduced-motion resolution behind `isEffectiveActive()`. When inactive, suspended, or document hidden, queued work and motion changes do NOT prematurely mutate `seenDexEntries`, emit cues, trigger persistence, or fire completion callbacks. When reactivated (`setActive(true)` or `document.visibilityState === 'visible'`), pending static/reduced-motion work resolves statically once, never continuing animation. Added terminal guard (`engine.isTerminal()`) and verified normal active fast-pull.
2. **Defect 2 (P2 — Browser harness failure & required coverage contract):** In `plan-21-browser-check.mjs`, established `REQUIRED_CHECKS`, added explicit failure reporting if fixtures are unavailable (never silently omitting named checks), and set `process.exitCode = 1` on any failed assertion, missing check, or unhandled error. Added a `--probe-failure` verification mode proving that the harness fails nonzero on test failure.
3. **Preserved accepted Repair 02 fixes and concurrent work:** Maintained silhouette Phase 1 and color Phase 2 presentation decoupling, duplicate-first reveal discovery invariance, modal suspension boundaries, and left all other agents' files untouched.

---

## 2. Coordination Steering & Working Tree Preservation

- **Write Scope Adherence:** Only files within Plan 21's explicit production scope were edited:
  - `src/ui/acquisition-queue.mjs`
  - `src/ui/acquisition-queue.test.mjs`
  - `reports/development/plan-21-duck-dex-and-new-entry-presentation/plan-21-browser-check.mjs`
  - `reports/development/plan-21-duck-dex-and-new-entry-presentation/repair-02-browser-observations.json`
  - `reports/development/plan-21-duck-dex-and-new-entry-presentation/progress.md` (this report).
- **Concurrent work preservation:** Uncommitted changes from Plan 23 and orchestrator documents (`AGENTS.md`, starting prompts, `README.md`, `plan-21` packet, `plan-23` packet, `design.md`, and `reports/development/plan-23-...`) remain completely untouched in the tree.
- **Dedicated test evidence output:** Browser observations were written directly to `reports/development/plan-21-duck-dex-and-new-entry-presentation/repair-02-browser-observations.json`. Plan 03's historical observations were preserved untouched.

---

## 3. Finding Dispositions & Implemented Behaviors

### Defect 1 (P2 — Static/reduced-motion paths bypass activity guards)
- **Problem:** `src/ui/acquisition-queue.mjs` gated animated `processNext` with `isEffectiveActive()`, but `enqueueReveals` fast/static branch and `handleMotionChange` did not. Enqueuing reveals with reduced motion or triggering a motion preference change while inactive/suspended prematurely mutated `seenDexEntries`, emitted static cues, and called `onPersist` without mounting the shelf or waiting for view activation.
- **Resolution:**
  - In `src/ui/acquisition-queue.mjs`:
    - Added `pendingFastPull` state and unified static resolution inside `resolveStatically(count)`.
    - `resolveStatically()` strictly guards on `isEffectiveActive()` (`!isDestroyed && isEffectiveActive() && !engine.isTerminal()`).
    - In `enqueueReveals()`, if `pendingFastPull || prefersReducedMotion()`: if `isEffectiveActive()` is false, items remain queued and `pendingFastPull` is stored without mutating engine state, seen entries, or cues.
    - In `handleMotionChange()`: if `prefersReducedMotion()` is true:
      - If `isEffectiveActive()`: immediately resolves statically.
      - If inactive / suspended: clears active timers, cleans up DOM overlay without events, safely puts any `activeItem` back at the head of `queue` (`queue.unshift(activeItem); activeItem = null; isRunning = false;`), and mutates ZERO engine state or seen entries.
    - Upon reactivation in `setActive(true)` or `handleVisibilityChange()`: if `pendingFastPull || prefersReducedMotion()`, calls `resolveStatically()` to resolve all pending items statically once. Never continues an animated sequence when reduced motion is preferred.
    - Added `engine.isTerminal()` guard across all entry points: terminal runs never mutate seen entries or emit cues.
  - Added 4 focused regression tests in `src/ui/acquisition-queue.test.mjs`:
    - Inactive queued work followed by reduced-motion change: verifies 0 seen mutations, 0 cues, 0 persistence calls, 0 completions while inactive; reactivation resolves statically once with 1 static cue and 0 animated continuation.
    - Terminal guard: verifies terminal engine rejects static resolution and callbacks.
    - Hidden document mount with reduced motion: verifies zero mutations while `document.visibilityState === 'hidden'`, resolves statically upon `'visibilitychange'` to `'visible'`.
    - Normal active fast-pull: verifies immediate static resolution when active.

### Defect 2 (P2 — Browser harness does not fail reliably)
- **Problem:** `plan-21-browser-check.mjs` conditionally skipped Settings and duplicate-first journeys if fixture discovery returned null, without recording failures. Its summary printed failure on error but did not set `process.exitCode = 1`, allowing broken runs to exit 0.
- **Resolution:**
  - Defined and exported `REQUIRED_CHECKS` (all 8 named journeys).
  - Exported pure evaluation helper `evaluateObservations(observations, required)` which checks against `REQUIRED_CHECKS`, inserts explicit failures for any missing checks, and verifies that zero checks failed and no runtime error occurred.
  - In Journey 3 and Journey 4, if fixture discovery fails, explicit failed checks are recorded (`'inactive_modal_suspension_in_settings'`, `'duplicate_first_reveal_triggers_discovery'`, `'subsequent_original_reveal_does_not_retrigger'`).
  - If `!allPassed`, `process.exitCode = 1` is explicitly set before exit. In `catch (err)`, error is recorded and `process.exitCode = 1` is set.
  - Added self-contained `--probe-failure` mode: running `node plan-21-browser-check.mjs --probe-failure` injects a test failure, verifies `evaluateObservations` reports `allPassed === false`, sets `process.exitCode = 1`, and exits nonzero.

---

## 4. Verification Evidence

1. **Packet Status Check:**
   - Command: `node scripts/dev/plan-status.js check plan-21`
   - Result: Exit 0 (`RUNNABLE: plan-21 is in-progress`).

2. **Full Repository Test Suite:**
   - Command: `cmd /c "npm test"`
   - Result: Exit 0. 147 passing tests across 11 test suites; 0 failures.

3. **Focused UI Unit Test Suite:**
   - Command: `cmd /c "node --test src/ui/duck-dex-view.test.mjs src/ui/acquisition-queue.test.mjs"`
   - Result: Exit 0. 14 passing tests; 0 failures:
     - `acquisition-queue: fast-pull immediately resolves newly acquired ducks with static cues`
     - `acquisition-queue: skips already seen entries and duplicate draws`
     - `acquisition-queue: explicit skip logs skipped action, emits static cue, and restores focus`
     - `acquisition-queue: interruption mid-flight preserves unrevealed/unseen state for clean resume`
     - `acquisition-queue: nominal interactive lifecycle completes 2.0s focus and 2.5s color dissolve with truthful cue`
     - `acquisition-queue [Plan 21 Repair 02]: real-engine active discovery begins as silhouette in Phase 1 and colorizes in Phase 2`
     - `acquisition-queue [Plan 21 Repair 02]: duplicate-first reveal triggers discovery, subsequent original reveal does not re-trigger`
     - `acquisition-queue [Plan 21 Repair 02]: inactive modal state suspends timers and prevents background completion`
     - `acquisition-queue [Plan 21 Repair 03]: inactive queued work followed by reduced-motion change does not prematurely mutate or emit cues; reactivation resolves statically once`
     - `acquisition-queue [Plan 21 Repair 03]: terminal guard prevents static resolution, mutations, cues, and callbacks`
     - `acquisition-queue [Plan 21 Repair 03]: hidden document mount with reduced motion does not resolve until visibility returns to visible`
     - `renderDuckDexView: pure markup generation and state reflection`
     - `renderDuckDexView: inspector factual data contains no fabricated scores`
     - `renderDuckDexView: inspector copy clearly distinguishes base tier share from identity odds and contains no dev jargon`

4. **Production Build:**
   - Command: `cmd /c "npm run build"`
   - Result: Exit 0. Vite static client environment built in 283ms.

5. **Frontmatter Lint:**
   - Command: `node scripts/dev/plan-status.js lint`
   - Result: Exit 0 (`lint: OK (no violations)`).

6. **Browser Harness Failure Path Verification:**
   - Command: `node reports/development/plan-21-duck-dex-and-new-entry-presentation/plan-21-browser-check.mjs --probe-failure`
   - Result: Exit 1.
   - Output:
     ```
     === PLAN 21 BROWSER HARNESS FAILURE PROBE ===
     Testing harness failure detection with injected failure and missing required checks...
     Probe evaluated: allPassed=false, failedCount=7, missingCount=6
     [PROBE VERIFIED] Harness correctly detected failure and missing checks. Setting process.exitCode = 1.
     ```

7. **Production Headless Browser Verification (Positive Run):**
   - Command: `node reports/development/plan-21-duck-dex-and-new-entry-presentation/plan-21-browser-check.mjs`
   - Result: Exit 0.
   - Observations: `reports/development/plan-21-duck-dex-and-new-entry-presentation/repair-02-browser-observations.json`
   - All 8 checks passed (8/8):
     - `ten_pull_committed`: PASS (10 card backs present on initial commit)
     - `active_discovery_phase1_silhouette`: PASS (Active target slot rendered `.slot-unowned.slot-highlight-focus`, text `??? (Unowned)`, computed SVG filter `brightness(0) opacity(0.35)`)
     - `active_discovery_phase2_color_transition`: PASS (At 2.2s, target transitions to `.slot-owned.slot-discovering`, reveals duck name, computed transition `filter, opacity`)
     - `acquisition_completed_cleanup`: PASS (Overlay unmounted cleanly after 4.5s nominal presentation)
     - `inactive_modal_suspension_in_settings`: PASS (Opening Settings during presentation suspends timers; target duck is not marked seen in storage; resumes cleanly on close)
     - `duplicate_first_reveal_triggers_discovery`: PASS (Revealing duplicate card first triggers Duck-Dex discovery overlay immediately)
     - `subsequent_original_reveal_does_not_retrigger`: PASS (Revealing original card for same identity later does not re-trigger overlay)
     - `reveal_all_fast_pull_bypass`: PASS (Reveal All / Fast-Pull resolves cards instantly, emits toast, leaves zero lingering overlay)

---

## 5. Files Changed & Staged

- `src/ui/acquisition-queue.mjs` — static/reduced-motion activity guards, `pendingFastPull`, safe inactive preservation, single static resolution on reactivation.
- `src/ui/acquisition-queue.test.mjs` — 4 focused regression tests for inactive queued work, reduced-motion change, terminal guard, and hidden document mounting.
- `reports/development/plan-21-duck-dex-and-new-entry-presentation/plan-21-browser-check.mjs` — required checks enforcement, explicit fixture failure detection, `--probe-failure` mode, nonzero exit on failure.
- `reports/development/plan-21-duck-dex-and-new-entry-presentation/repair-02-browser-observations.json` — verified 8-check observation artifact.
- `reports/development/plan-21-duck-dex-and-new-entry-presentation/progress.md` — this progress report.

---

## 6. Advisor Consultation

**Branch C — orchestrator-gate-only per owner rule (2026-10-25).**  
Per owner instructions, repair work requires no additional advisor calls. No subagents were invoked.

---

## 7. Ready for Review

**YES.** Plan 21 Repair 03 implementation, focused regression tests, failure probe verification, and positive browser evidence are complete and ready for orchestrator and owner review. Packet frontmatter status remains `in-progress`; no git push has been executed.
