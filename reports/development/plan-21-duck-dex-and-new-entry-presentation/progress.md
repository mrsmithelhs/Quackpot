# Plan 21 progress

**Date:** 2026-10-26  
**Stage:** Full production implementation and test verification delivered for owner/orchestrator review.

---

## 1. Overall Summary

Completed the implementation of Plan 21 (Duck-Dex inspection and first-owned entry presentation). 

### Implemented Behaviors
1. **Voluntary Duck-Dex Collection Shelf (`src/ui/duck-dex-view.mjs` & `src/ui/duck-dex.css`):**
   - A dedicated `🦆 Duck-Dex` canopy control is available in the persistent HUD during the phone/app stage.
   - Context-preserving navigation: Opening the Duck-Dex saves `dexReturnStep = currentStep`. The `← Return to Game` button (and Escape key) returns cleanly to the prior context (gacha, race staging, etc.) without resetting cards or re-triggering day events.
   - Curio shelf displays all 6 banner identities (`BANNER_1_ROSTER`). Owned ducks render with the accepted Mode C hybrid SVG rig with canonical palettes, hats, and accessories (`DUCK_COSMETICS`). Unowned ducks display as distinct dark-cardstock silhouettes (`filter: brightness(0) opacity(0.35)`).
   - Factual attribute inspection card opens upon clicking/focusing any shelf slot, exposing real base speeds (10.0 / 14.0 / 20.0 m/s), pre-draw drop rates (Common 80%, Rare 18%, Legendary 2%), availability, and an explicit Plan 22 rest note. Zero fabricated resale values or power numbers.
   - "Pond of Destiny" set banner shows `X / 6 Ducks` progress and explicitly displays the set-effect gap: `"Set Bonus: None active (investigation only — no mechanical bonus applied)"`. Emits `completion_pressure` cues when viewed while incomplete, fully conforming to `src/core/receipt.mjs` line 128.
2. **First-Owned Card Reveal Presentation Queue (`src/ui/acquisition-queue.mjs`):**
   - Ground truth duplicate evaluation: Only draws with `duplicate === false` at commit time enter the acquisition queue. Repeated draws in the same 10-pull convert to Down without duplicate acquisition presentation. Unrevealed cards remain hidden.
   - Sequential presentation: 2.0s shelf focus (showing silhouette with "New Identity Discovered!" badge) followed by a 2.5s silhouette-to-color transition (radial glow pulses, name/stats fade in, polite ARIA live region announces unlock). Ten new identities take 45.5s, explicitly acknowledging the drama extension in the run-pacing budget without claiming an unchanged 15-minute floor.
3. **Fast-Pull & Free Skip Paths:**
   - Prominent `⏭️ Skip Presentation` control immediately marks all queued identities as seen, updates shelf slots to full color, logs `acquisition_presentation_skipped`, and returns in 0ms.
   - Clicking `Reveal All` flips all 10 cards immediately, bypasses the 45.5s queue, and displays a non-blocking toast (`"✨ X new ducks added to Duck-Dex!"`). Free of charge; zero microtransaction fees or friction.
4. **Reduced Motion & Tab Inactive Suspension:**
   - When `prefers-reduced-motion: reduce` is detected, timed waits and camera scrolling are disabled, executing discrete static state changes instantly.
   - `document.visibilityState === 'hidden'` and modal openings immediately suspend or clean up active sequences without orphaned timer handles.
5. **Persistence & Log Schema (`src/core/game-engine.mjs` & `src/core/storage.mjs`):**
   - Adds `state.seenDexEntries` array, backward-compatibly hydrated in `fromEnvelope()` by defaulting to `[...(state.owned || [])]`.
   - Semantic storage validation ensures `seenDexEntries` is an array of strings.
   - Append-only event logging for `duck_dex_acquisition`, `duck_dex_acquisition_static`, `acquisition_presentation_skipped`, `duck_dex_viewed`, and `completion_pressure`.

---

## 2. Files Changed and Artifacts Produced

- **Source:** `src/ui/duck-dex-view.mjs` (new) — voluntary shelf view, silhouette rendering, factual inspector modal, and return navigation.
- **Source:** `src/ui/duck-dex.css` (new) — scoped styling for shelf grid, silhouettes, inspector modal, acquisition overlay, and reduced-motion overrides.
- **Source:** `src/ui/acquisition-queue.mjs` (new) — presentation queue controller managing 2s focus + 2.5s color transition, skip, and reduced-motion bypass.
- **Source:** `src/ui/gacha-view.js` — integrated single reveal and Reveal-All events with `acquisitionQueue` and Fast-Pull toast feedback.
- **Source:** `src/ui/hud.js` — added voluntary `🦆 Duck-Dex` canopy control and `showDex` property.
- **Source:** `src/ui/duck-rig-view.mjs` — extended `createDigitalDuckSvg` to accept optional `hat`, `accessory`, and `paperMode` with backwards-compatible defaults.
- **Source:** `src/main.js` — added `currentStep = 'duck_dex'` navigation, `dexReturnStep` return handling, view cleanup, and stylesheet import.
- **Source:** `src/core/game-engine.mjs` — added `DUCK_COSMETICS`, `seenDexEntries` in state, `getDexCollectionState()`, `recordDexViewed()`, `recordAcquisitionCue()`, `skipAcquisitionPresentation()`, and backward-compatible hydration.
- **Source:** `src/core/storage.mjs` — added semantic validation for `state.seenDexEntries`.
- **Tests:** `src/ui/duck-dex-view.test.mjs` (new) — unit tests for shelf markup, inspector factual data, and keyboard return navigation.
- **Tests:** `src/ui/acquisition-queue.test.mjs` (new) — unit tests for Fast-Pull instant resolution, duplicate skipping, and unrevealed concealment.
- **Tests:** `src/core/game-engine.test.mjs` — added 4 comprehensive unit tests for Dex collection state, inspection cue logging, acquisition cues, and storage hydration/validation.
- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/proposal.md` — complete architecture proposal.
- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/flow-queue-analysis.mjs` — standalone verification harness.
- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/flow-queue-results.json` — 8/8 passing verification suites.
- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/progress.md` (this report).

*Note on working tree isolation:* Uncommitted changes related to Plan 23 and other plans (`AGENTS.md`, `docs/agent-starting-prompts/orchestrator-prompt.md`, `docs/development/README.md`, `docs/development/plan-21-duck-dex-and-new-entry-presentation.md`, `docs/development/plan-23-production-race-integration.md`, `docs/founding/design.md`) were observed in the tree and left untouched. Only Plan 21 files are staged and committed.

---

## 3. Commands Run and Results

- `node scripts/dev/plan-status.js check plan-21`:  
  Exit code 0: `RUNNABLE: plan-21 is ready to implement`.
- `cmd /c "npm test"`:  
  Exit code 0: 144 passing tests across 11 test suites; 0 failures.
- `node --test src/ui/duck-dex-view.test.mjs src/ui/acquisition-queue.test.mjs`:  
  Exit code 0: 4 passing tests; 0 failures.
- `cmd /c "npm run build"`:  
  Exit code 0: Clean Vite build yielding static production bundle in 105ms.
- `node reports/development/plan-21-duck-dex-and-new-entry-presentation/flow-queue-analysis.mjs`:  
  Exit code 0: 8/8 verification cases passed.

---

## 4. Problems Encountered and Resolutions

- **Typeless Package.json ESM Warning in Node Tests:** When running `.js` test files with `node --test`, Node emitted a `MODULE_TYPELESS_PACKAGE_JSON` warning. Resolved by naming the new modules `duck-dex-view.mjs` and `acquisition-queue.mjs`, matching the convention of `duck-rig-view.mjs` and `duck-motion-controller.mjs`.
- **Deep Semantic Validation in `validateSave`:** An initial engine test manually set `state.owned` without committing corresponding draw events, which `validateSave` correctly rejected for inventory mismatch against `eventLog`. Resolved by generating draws through `engine.commitPromotionalTenPull()`, verifying authentic save envelopes.
- **Non-Browser Test Environment (`window` undefined):** In `duck-dex-view.mjs`, guarded global `window` access with `typeof window !== 'undefined'`, enabling headless Node testing while preserving full browser keyboard navigation.

---

## 5. Remaining Risks and Follow-Ups

- **Visual / Art Polish:** Color transition duration (2.5s) and radial glow parameters are implemented with pure CSS/WAAPI and can be visually adjusted during owner review.
- **Plan 22 Soft Rest Integration:** Factual inspector displays current base speed and includes an explicit informational notice preparing for Plan 22's soft fatigue penalties (50% / 25%).

---

## 6. Advisor Consultation

**Branch C — Not advisor-capable / degraded mode by user instruction (orchestrator-gate-only).**  
The user explicitly instructed: *"No advisor calls authorized, run as Branch C."*  
In strict compliance with this instruction, no advisor subagents were spawned. The implementation is submitted directly for the orchestrator/owner review gate.

---

## 7. Ready for Orchestrator Review

**YES.** The complete Plan 21 production implementation, unit tests, and verification reports are delivered and ready for orchestrator and owner review.
