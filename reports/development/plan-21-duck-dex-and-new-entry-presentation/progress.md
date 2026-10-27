# Plan 21 progress

**Date:** 2026-10-26  
**Stage:** Repair 01 implemented and verified; delivered for orchestrator and owner review.

---

## 1. Overall Summary & Repair 01 Scope

Addressed all findings from `review-01.md` per instructions in `repair-01.md`.
The repair resolves unrevealed discovery leakage, implements the selected Duck-Dex shelf discovery presentation (2.0s slot focus + 2.5s silhouette-to-color transition directly on the SVG element), establishes truthful presentation persistence/interruption lifecycle semantics, corrects inspector copy to disambiguate tier rates from identity odds while removing development jargon, harmonizes pulled card cosmetics with collection art, and implements accessible modal focus containment with focus restoration.

Preserved accepted Plan 20 card sizing, keyed flips, independent motion, and duplicate help pointer. Kept the apartment portrait-phone follow-up strictly outside this repair.

---

## 2. Finding Dispositions & Implemented Behaviors

### Finding 1 (P1 — Duck-Dex exposes unrevealed committed outcomes)
- **Problem:** `GameEngine.getDexCollectionState()` projected `state.owned` directly, leaking newly committed but unrevealed pull outcomes when the Duck-Dex was viewed during an active 10-pull.
- **Resolution:**
  - Preserved authoritative ownership and duplicate down conversion at commit in `state.owned`.
  - Derived player-visible discovery, discovered count, and set progress strictly from reveal evidence. Any identity in `state.pendingReveals` that is newly committed and not yet revealed (`!d.revealed && !d.duplicate`) is excluded from visible discovery in `getDexCollectionState()`.
  - Unrevealed identities remain as dark-cardstock silhouettes labeled `??? (Unowned)` and `Missing from roster`. Set progress and completion flags reflect only revealed discoveries.
  - Verified with root review seed `plan21-review`: committing a 10-pull with zero reveals reports `ownedCount: 0` and 0/6 discovered ducks; revealing card 0 (`duck-3`) discovers only `duck-3`; revealing all cards discovers all 4 unique identities (`duck-0`, `duck-1`, `duck-2`, `duck-3`). Duplicate-in-batch secrecy was also verified.

### Finding 2 (P1 — Presentation persistence and interruption are incomplete)
- **Problem:** Presentation cues were recorded without an acquisition persistence callback to main; destroying views cleared timers without resume policy; tab hidden triggered a false player skip action.
- **Resolution:**
  - Specified and implemented distinct completed, interrupted, explicit skip, and automatic suspension semantics across the queue controller (`src/ui/acquisition-queue.mjs`), gacha view (`src/ui/gacha-view.js`), and main controller (`src/main.js`).
  - **Completed:** Upon full completion of the 2.0s focus and 2.5s color transition, the entry is marked in `state.seenDexEntries`, a truthful `duck_dex_acquisition` cue is appended with actual displayed timing (`focusMs: 2000, transitionMs: 2500`), and `onPersist?.()` calls `maybeAutosave()` at a safe boundary.
  - **Interrupted:** If unmounted mid-presentation (view destroyed due to step advance, visiting Settings, or browser reload), the active card remains un-seen. On view mount or reload, `acquisitionQueue.enqueueReveals(pending, { fastPull: false })` safely resumes unpresented revealed cards without replaying already seen cards or emitting false cues.
  - **Automatic suspension:** Tab hidden (`document.visibilityState === 'hidden'`) pauses active timers, computing and retaining `timerRemaining`. When tab visibility returns to `visible`, the timer resumes. Zero fake skip actions or cues are logged.
  - **Explicit skip:** Player clicks `⏭️ Skip Presentation` or presses Escape. Logs `acquisition_presentation_skipped` action with exact `remainingCount`, marks remaining identities seen, appends `duck_dex_acquisition_static` cues, triggers `onPersist?.()`, and returns focus via `onFocusReturn`.

### Finding 3 (P2 — Selected shelf transition was replaced with standalone overlay, and color transition targets wrong element)
- **Problem:** Prior implementation rendered an isolated duck card overlay instead of focusing the shelf, and CSS `transition: filter` targeted a wrapper rather than the child SVG where `filter` was modified.
- **Resolution:**
  - Implemented the selected shelf interaction in `acquisition-queue.mjs`: mounts `.acquisition-shelf-overlay` rendering the actual Duck-Dex curio shelf, scrolls to and highlights the target slot for ~2.0s, then transitions silhouette to color for ~2.5s, with polite screen-reader announcements.
  - Corrected CSS interpolation target in `src/ui/duck-dex.css`: placed `transition: filter 2.5s ease, opacity 2.5s ease;` directly on `.slot-duck-art svg`, allowing the browser to smoothly interpolate the filter dissolve from dark silhouette (`brightness(0) opacity(0.35)`) to full color.

### Finding 4 (P2 — Inspector copy and access)
- **Problem:** Inspector labeled aggregate base rarity pool share as the duck's drop rate (implying 80% for a single Common duck); used m/s speed notation conflicting with abstract calibration; contained development copy ("Plan 22", "founding design", "investigation only").
- **Resolution:**
  - Disambiguated odds copy into two clear fields:
    - `Base Tier Rate:` (e.g. `80% (Base tier pool share across 3 Common ducks)` for Common, `18% (Base tier pool share across 2 Rare ducks)` for Rare, `2% (Base tier rate; guaranteed at 50 pity)` for Legendary).
    - `Base Identity Odds:` (e.g. `~26.7% (1 of 3 Common identities)` for Common, `9.0% (1 of 2 Rare identities)` for Rare, `2.0% (Sole Legendary identity)` for Legendary).
  - Used plain Speed rating without asserted m/s mapping (`Speed Rating: 10.0`).
  - Removed all development jargon. Race availability displays in-world roster state: `"Rested and ready to race"` when owned, `"Unavailable"` when unowned. Set effect note displays `"None active (standard banner set)"`.

### Finding 5 (P2 — Cosmetic consistency)
- **Problem:** `gacha-view.js` called `createDigitalDuckSvg` without cosmetic overrides, causing pulled cards to show default yellow appearance while the shelf used `DUCK_COSMETICS`.
- **Resolution:**
  - In `gacha-view.js` `renderCard()`, passed `DUCK_COSMETICS[card.identity]` (`palette`, `hat`, `accessory`) to `createDigitalDuckSvg`. Pulled cards now visually match shelf slots across all surfaces.

### Finding 6 (P2 — Modal focus lifecycle)
- **Problem:** Inspector and discovery surfaces lacked proper focus containment, background inerting, and focus restoration to originating targets.
- **Resolution:**
  - In `duck-dex-view.mjs`: Background sections (`[data-dex-section]`) are marked `inert = true` while inspector is open. Tab and Shift+Tab wrap focus inside inspector. Escape key and backdrop clicks dismiss the inspector. Upon dismissal, focus is restored to the originating shelf slot (`originatingDuckId`).
  - In `acquisition-queue.mjs`: Siblings inside the view container are set to `inert = true`. Skip button receives initial focus. Tab traps within overlay. Escape triggers explicit skip. Upon completion or skip, `onFocusReturn` restores focus to the next gacha action button (`#btn-reveal-next` or `#btn-gacha-proceed`) or card.

---

## 3. Files Changed

- **Source:** `src/core/game-engine.mjs` — secrecy-protected discovery in `getDexCollectionState()`, set effect copy update.
- **Source:** `src/ui/gacha-view.js` — cosmetic profile reuse in `renderCard()`, mount resumption of interrupted reveals, wired `onAcquisitionPersist`, `onAcquisitionComplete`, and `onFocusReturn`.
- **Source:** `src/ui/duck-dex-view.mjs` — disambiguated odds copy, plain speed rating, in-world race availability, background inerting, focus trap, and focus restoration to originating slot.
- **Source:** `src/ui/duck-dex.css` — CSS transition on `.slot-duck-art svg`, shelf slot highlight/discovering/discovered animation styles, and acquisition shelf styling.
- **Source:** `src/ui/acquisition-queue.mjs` — shelf focus presentation, truthful cue timing on completion, pause/resume on visibility change, explicit skip logging, and clean interruption handling.
- **Source:** `src/main.js` — passed `onAcquisitionPersist` and `onAcquisitionComplete` to `renderGachaView` calling `maybeAutosave()`.
- **Tests:** `src/core/game-engine.test.mjs` — added zero-reveal secrecy tests with `plan21-review` seed and duplicate-in-batch secrecy tests.
- **Tests:** `src/ui/duck-dex-view.test.mjs` — added tests for disambiguated odds copy, plain speed, absence of dev jargon, and focus/inert lifecycle.
- **Tests:** `src/ui/acquisition-queue.test.mjs` — added tests for explicit skip, interruption/resume, and nominal 2.0s focus / 2.5s color transition timing via Node mock timers.
- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/progress.md` (this report).

*(Note on proposal harness: `flow-queue-analysis.mjs` remains in the folder as historical proposal-model evidence).*

---

## 4. Verification Evidence

1. **Packet Status Check:**
   - Command: `node scripts/dev/plan-status.js check plan-21`
   - Result: Exit 0 (`RUNNABLE: plan-21 is ready to implement`).

2. **Core Test Suite:**
   - Command: `cmd /c "npm test"`
   - Result: Exit 0. 146 passing tests across 11 test suites; 0 failures.

3. **Focused UI Unit Tests:**
   - Command: `node --test src/ui/duck-dex-view.test.mjs src/ui/acquisition-queue.test.mjs`
   - Result: Exit 0. 8 passing tests; 0 failures.
     - `acquisition-queue: fast-pull immediately resolves newly acquired ducks with static cues`
     - `acquisition-queue: skips already seen entries and duplicate draws`
     - `acquisition-queue: explicit skip logs skipped action, emits static cue, and restores focus`
     - `acquisition-queue: interruption mid-flight preserves unrevealed/unseen state for clean resume`
     - `acquisition-queue: nominal interactive lifecycle completes 2.0s focus and 2.5s color dissolve with truthful cue`
     - `renderDuckDexView: pure markup generation and state reflection`
     - `renderDuckDexView: inspector factual data contains no fabricated scores`
     - `renderDuckDexView: inspector copy clearly distinguishes base tier share from identity odds and contains no dev jargon`

4. **Production Build:**
   - Command: `cmd /c "npm run build"`
   - Result: Exit 0. Vite static bundle built in 66ms.

5. **Headless Browser Subpath Smoke Suite:**
   - Command: `cmd /c "npm run test:smoke"`
   - Result: Exit 0. All 15 assertions passed across all 8 browser journeys with dedicated browser profile, CDP inspection, bounded event waits, zero console errors, zero uncaught exceptions, and zero external network calls.

---

## 5. Working Tree Isolation & Guardrails

- Concurrent uncommitted changes from Plan 23 and orchestrator prompts (`AGENTS.md`, `docs/agent-starting-prompts/orchestrator-prompt.md`, `docs/development/README.md`, `docs/development/plan-21-duck-dex-and-new-entry-presentation.md`, `docs/development/plan-23-production-race-integration.md`, `docs/founding/design.md`, `reports/development/plan-23-...`) were kept strictly untouched in the working tree.
- Apartment portrait-phone follow-up was excluded (`desk-view.js` and `shell.css` kept clean).
- No git push executed; packet status frontmatter left untouched for orchestrator verification.

---

## 6. Advisor Consultation

**Branch C — orchestrator-gate-only per owner rule (2026-10-25).**  
Per owner instructions, repair work requires no additional advisor calls. No subagents were invoked.

---

## 7. Ready for Review

**YES.** Plan 21 Repair 01 implementation, tests, and evidence are complete and ready for orchestrator and owner review.
