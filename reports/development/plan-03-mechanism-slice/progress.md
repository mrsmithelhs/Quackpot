# Plan 03 Progress Report: Core Mechanism and Truthful Receipt Slice

**Date:** 2026-10-24  
**Author:** Implementer (Plan 03 thread)  
**Packet:** [`docs/development/plan-03-mechanism-slice.md`](file:///c:/AI/Quackpot/docs/development/plan-03-mechanism-slice.md)  
**Preflight proposal:** [`reports/development/plan-03-mechanism-slice/preflight.md`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/preflight.md) (Revision 3, Option 1 approved by Owner)  
**Current Status:** **Implementation Complete and Verified. Ready for Orchestrator Review.**  
*(Per AGENTS.md guardrails, implementers never set packet completion status in frontmatter; the packet remains `ready` pending orchestrator and owner verification).*

---

## 1. Executive Summary

This progress report documents the completion of **Plan 03: Core mechanism and truthful Receipt slice**. All requirements ratified by the Owner under Option 1 (amended work order) have been implemented, tested, and verified end-to-end:
1. **Pure Module Relocation:** Moved pure algorithmic modules (`prng.mjs`, `event-log.mjs`, `receipt.mjs`) to `src/core/` while preserving backward compatibility for simulation scripts. Added `EventLog.hydrate(entries)` with hash chain verification.
2. **Empirical Paired Recheck on Physical Duck Removal:** Executed a 100-seed comparative study across multiple player policies (`best`, `alternate`, `random`). For `best` and `alternate`, 100% identical race placements were preserved (`meanGemDiff: 0.00`).
3. **Storage Adapter with Semantic Validation:** Built `src/core/storage.mjs` wrapping `localStorage` with versioned envelopes (`schemaVersion: 1`), full 4-stream PRNG serialization/restoration, hash chain verification, log-to-state scalar reconciliation, in-memory fallback on quota errors, and corrupted save preservation.
4. **Deterministic Game Engine State Machine:** Built `src/core/game-engine.mjs` managing the bounded 3-day loop, promotional 10-pull with commit-before-reveal checkpoints, two-stance tactical racing (`Safe Pace` vs. `Sprint Push`) against a 6-entrant field, canonical 4-step escalation ladder with zero-cash wage continuation, persistent Uninstall with 80-gem retention offer, and strict Receipt presentation logging boundary.
5. **Interactive Browser UI:** Built modular view components in `src/ui/` (`hud.js`, `desk-view.js`, `gacha-view.js`, `race-view.js`, `modals.js`, `receipt-view.js`) and wired them into `src/main.js` with responsive styling in `src/style.css`.
6. **Rigorous Dual Verification:**
   - **Node Unit Test Suite (`npm test`):** 80/80 tests passing (`storage.test.mjs`, `game-engine.test.mjs`, `receipt.test.mjs`, `prng.test.mjs`, `model.test.mjs`, `smoke-validator.test.mjs`, `plan-status.test.js`).
   - **Headless Chrome CDP Smoke Suite (`npm run test:smoke`):** Automated build (`vite build`) and browser verification via Chrome DevTools Protocol covering 6 distinct phases: initial load, reload, subpath checks, and 3 full automated browser journeys. Zero console errors, zero runtime exceptions, zero external network calls.

---

## 2. Advisor Consultation Declaration

- **Branch in Use:** **Branch C — Not advisor-capable (fail-closed to orchestrator-gate-only).**
- **Capability Evidence and Reasoning:** Checked `advisor-capable-providers.json` (version 3). The current execution thread runs inside Google Antigravity. While Antigravity provides an internal subagent tool (`invoke_subagent`), `advisor-capable-providers.json` explicitly lists only `claude-code`, `codex-cli`, and `kimi-code`, with an unambiguous instruction: *"If you cannot confidently match yourself to an entry in that file, treat yourself as not advisor-capable."* Following this fail-closed requirement, this thread declares Branch C. No automated advisor was consulted; review relies entirely on the primary orchestrator gate.

---

## 3. Implementation Details & Architecture

### 3.1 Pure Module Relocation (`src/core/`)
Per owner-approved folder layout in `docs/repo-structure.md`:
- `src/core/prng.mjs`: Core seeded PRNG (`sfc32` + `cyrb128`), state serialization, and stream forking.
- `src/core/event-log.mjs`: Append-only, frozen event log with FNV-1a hash chaining, terminal/receipt completeness validation, and newly added `EventLog.hydrate(entries)`.
- `src/core/receipt.mjs`: Pure projection function deriving the 3-register findings (*We displayed / You did / Did this affect you?*), financial accounting ledger, and gacha pull ledger strictly from event entries.
- Backward compatibility re-exports created in `sim/prng.mjs`, `sim/event-log.mjs`, and `sim/receipt.mjs`.

### 3.2 Empirical Paired Recheck on Physical Racer Removal
Created [`sim/recheck-own-duck-boundary.mjs`](file:///c:/AI/Quackpot/sim/recheck-own-duck-boundary.mjs) and ran it over 100 seeds across multiple policies (`frugal_single` and `whale_ten`):
- For `best` and `alternate` policies: 100% identical race placements (`ratio: 1.0000`, `meanGemDiff: 0.00`).
- For `random` policy: 98.9%–99.5% identical placement ratio, with minor gem variance (-0.87 to -1.19 gems across 15 days) caused by RNG consumption alignment when randomly selecting among eligible digital ducks.
- Confirms physical duck separation introduces zero systemic disruption to game dynamics.

### 3.3 Storage Adapter & Deep Semantic Validation (`src/core/storage.mjs`)
Implemented `saveGame()`, `loadGame()`, and `clearGame()`:
- **Envelope Structure:** Includes `schemaVersion: 1`, `savedAt`, `autosaveEnabled`, complete `state`, all 4 serialized PRNG streams (`root`, `draw`, `race`, `event`), and the full `eventLog`.
- **Validation Pipeline:**
  1. Scalar & timestamp bounds check.
  2. All 4 PRNG stream deserialization checks (valid `sfc32` structure and 4 uint32 state integers).
  3. FNV-1a event log sequence and hash chain integrity verification.
  4. Log-to-state reconciliation:
     - Cash matches: $\text{initialCash} + \sum \text{wages} + \sum \text{escalationCash} - \sum \text{expensesPaid} - \sum \text{purchases}$.
     - Gems match: $\text{initialGems} + \sum \text{raceGems} + \sum \text{retentionGems} + \sum \text{starterGems} - \sum \text{pullGems}$.
     - Health matches: $100 - \sum \text{healthLost}$.
     - Owned inventory matches unique drawn identities; Down currency matches duplicate conversion totals.
     - Pity counter matches paid draws since last legendary.
     - Pending reveals queue matches committed draws lacking `reveal_shown`.
- **Fault Resiliency:** If `localStorage.setItem()` fails (`QuotaExceededError` or `SecurityError`), the stored snapshot is left untouched, temporary in-memory session takes over, and an observable notice is presented. Corrupted saves are never deleted until explicit user confirmation.

### 3.4 Finite State Engine (`src/core/game-engine.mjs`)
Fully implements the ratified Revision 3 contract:
- **Rhythm & Economy:** Starting cash $15.00, starting health 100 HP, daily food bills $5.00, Day 2 rent bill $15.00, daily evening wages +$10.00.
- **Commit-Before-Reveal Gacha:**
  - 10-pull determined and committed upfront (`draw_committed` x10).
  - Pre-draw conditional odds calculated using linear soft/hard pity model.
  - Ownership committed to `state.owned` immediately to prevent reload rerolls.
  - Unrevealed draws queued in `pendingReveals`.
  - Flipping cards emits `reveal_shown` per card.
  - Receipt Pull Ledger reflects commit vs. reveal provenance.
- **Two-Stance Tactical Racing:**
  - 6-entrant field: 5 AI opponents + player in Lane 2.
  - Tutorial field: Base speed 8.0 ±5% (range 7.60–8.40). Guaranteed win for both Safe Pace ($\ge 9.50$) and Sprint Push ($\ge 8.80$) even for Common ducks.
  - Finale field: Base speed 11.2 ±5% (range 10.64–11.76); Lane 1 occupied by Rival Whale.
  - Deterministic ties: Player wins over AI; lower lane wins over higher lane.
- **Canonical Escalation Ladder & Zero-Cash Check:**
  - When rent drops cash to exactly $0.00, surfaces the zero-cash offer: `[Continue to Evening Wage]` preserves solvency without forced sacrifice.
  - When cash is insufficient ($14.01 < $15.00), offers ordered escalation steps: Step 2 (`extra_shift` +10 cash, -15 HP), Step 3A (`sell_couch` +10 cash), Step 3B (`sell_tv` +15 cash), Step 4 (`credit_card` +15 cash, +15 debt).
  - Declining all options terminates with `running_on_empty`.
- **Persistent Uninstall & Retention Trap:**
  - Persistent red `[Uninstall]` button in HUD.
  - Retention modal offers 80 gems and copy `"play out the trap"`.
  - Leaving terminates with `uninstall` and prints Receipt immediately.
- **Receipt Presentation Boundary:**
  - When terminal condition is reached, appends `terminal` event.
  - `receipt_shown` is appended strictly upon actual mounting in the DOM, creating the required `verifyCompleteness()` tail pair. Reloading after completion is idempotent.

### 3.5 Interactive Browser UI (`src/ui/` & `src/main.js`)
Modular component architecture:
- `src/ui/hud.js`: Header bar with companion icon, Day & Clock indicator, Cash, Gems, Health, Debt, Autosave toggle, manual Save button, and persistent Uninstall button.
- `src/ui/desk-view.js`: Apartment desk introduction featuring the physical rubber duck (`Professor Quacks`), style customization, and launch trigger.
- `src/ui/gacha-view.js`: Gacha banner theater with odds display, 10 card slots, flip animations, tier badges (Common/Rare/Legendary), and duplicate Down conversions.
- `src/ui/race-view.js`: Pond racing track with 6-entrant scouting table, stance selector, lane animation, and placement/gem payout results.
- `src/ui/modals.js`: Starter pack offer modal ($0.99 for 240 gems, "400% value"), zero-cash prompt, escalation ladder modal, retention exit modal, and corrupt save dialog.
- `src/ui/receipt-view.js`: Paper register slip rendering the 3 registers, accounting breakdown, and pull audit ledger.

---

## 4. Verification Evidence

### 4.1 Unit & Integration Test Suite (`npm test`)
Ran via `cmd.exe /c "npm test"`:
```
ℹ tests 80
ℹ suites 0
ℹ pass 80
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1371.7
```
**Test Coverage Breakdown:**
- `src/core/game-engine.test.mjs` (8 tests):
  - Pre-draw linear pity odds at soft pity (draw 35) and hard pity (draw 50).
  - Trace 1 (Frugal / Solvent): 4 bills totaling $30.00, zero-cash continuation, finish on `run_complete`.
  - Trace 2 (Starter Pack + Escalation Recovery): Extra shift (+10 cash, -15 HP), finish with $14.01.
  - Trace 3 (Starter Pack + Default): Decline all escalations, finish on `running_on_empty`.
  - Trace 4 (Uninstall): Retention modal, leave immediately, finish on `uninstall`.
  - Tactical racing stances non-dominated under weaker vs. faster fields (synthetic Common fixture).
  - Commit-before-reveal reload integrity and unrevealed Receipt provenance.
  - Idempotent Receipt presentation on reload after completion.
- `src/core/storage.test.mjs` (7 tests):
  - Save/load valid game envelope.
  - Semantic validation detecting mismatched state scalars.
  - Semantic validation detecting corrupted PRNG streams.
  - Semantic validation detecting broken event log hash chains.
  - Write failure fallback to in-memory session retaining stored snapshot.
  - Safe error handling for malformed JSON.
  - Clear game functionality.
- `sim/model.test.mjs`, `sim/prng.test.mjs`, `sim/receipt.test.mjs` (43 tests):
  - All original simulation models, PRNG properties, S4 exit boundaries, and 3-register honesty tests verified passing after module relocation.
- `scripts/dev/smoke-validator.test.mjs` (11 tests):
  - Validation rules for port collision, subpath enforcement, external request rejection, DOM state checks, and bounded waits.
- `scripts/dev/plan-status.test.js` (11 tests):
  - Frontmatter parsing, effective status calculation, cycle detection, linting rules, and status mutation safety.

### 4.2 Automated Headless Chrome Smoke Test (`npm run test:smoke`)
Automated Chrome execution via CDP (`node scripts/dev/smoke-browser.mjs`), with results saved to [`reports/development/plan-03-mechanism-slice/smoke-observations.json`](file:///c:/AI/Quackpot/reports/development/plan-03-mechanism-slice/smoke-observations.json):
1. **Phase 1: Initial Load under `/Quackpot/`:**
   - 5 requests recorded: `Document`, `Script`, `Stylesheet`, and `duck-placeholder.svg` (all 200 OK).
   - Observed asset filenames match this run's build (`index-D0IIRm2r.js`, `index-BNAOoF9n.css`, `duck-placeholder-Mhd15Sdp.svg`).
   - `#app` mounted, `#spike-title` present, companion duck SVG complete with natural dimensions (120x120).
2. **Phase 2: Page Reload:**
   - 5 requests recorded (allowing 304s for cache revalidation).
   - DOM mounted and verified intact.
3. **Phase 3: Trailing Slash Check:**
   - `/Quackpot` requested; observed 404 on local Vite preview server (deployed GitHub Pages 301 redirect is a remote deployment property).
4. **Phase 4: Journey 1 (Early Uninstall -> Retention Trap -> Receipt):**
   - Clicked Start App -> Clicked Uninstall in HUD.
   - Retention modal observed with `"80 FREE GEMS"`.
   - Clicked Leave Anyway -> `#receipt-paper` mounted immediately.
   - Verified: `Terminal Route: Early Uninstall`, `Technique #1: Exit friction`, `We displayed: Retention offer shown: 80 gems or "play out the trap"`, `You did: Chose to leave immediately`.
5. **Phase 5: Journey 2 (Starter Pack -> Rent Shortfall -> Extra Shift -> Day 3 Finale -> Receipt):**
   - Claimed promotional 10-pull -> Revealed all -> Proceeded to Morning Food Bill ($5.00).
   - Won Race 1 (Tutorial) -> Payout +50 gems.
   - Starter Pack Modal appeared -> Bought for $0.99 (Cash: $9.01, Gems: 290).
   - Day 1 Wage (+10.00) -> Day 2 Food (-$5.00) -> Day 2 Rent Due ($15.00).
   - Cash before rent: $14.01. Shortfall detected!
   - Escalation modal appeared (`Step 2: Work Emergency Extra Shift`).
   - Accepted Extra Shift (+10 cash, -15 HP) -> Rent paid ($9.01 remaining, 85 HP).
   - Day 2 Wage (+10.00) -> Day 3 Food (-$5.00) -> Day 3 Finale Race against Rival Whale in Lane 1.
   - Run Complete reached -> `#receipt-paper` mounted.
   - Verified Accounting section: `4 recorded expense bill(s) paid in cash ($30.00 total)`, `1 emergency escalation step(s) recorded: extra_shift`, Final cash: $14.01, Final health: 85 HP.
6. **Phase 6: Journey 3 (Mid-Reveal Reload & Resume Integrity):**
   - Claimed 10-pull -> Revealed exactly 2 cards -> Triggered browser reload.
   - Resumed from storage: Exactly 2 revealed cards and 8 unrevealed cards rendered.
   - Clicked Reveal All: All 10 cards revealed with preserved commitment sequence and identities.

---

## 5. Hard Constraint Verification

| Hard Constraint | Status | Evidence |
|---|---|---|
| **#2: Zero Runtime Network Calls / Telemetry** | **Verified** | CDP network listener observed zero outgoing requests outside `127.0.0.1:4173/Quackpot/assets/`. Zero CDNs, zero telemetry endpoints, zero external scripts. |
| **#3: Offline Browser Storage Only** | **Verified** | All run state and event logs persist in `localStorage` (`quackpot_save_v1`) or in-memory session. Zero cloud sync or automatic transmission. |
| **#6: Fictional Entities Only** | **Verified** | All ducks (*Puddle Quacker*, *Rubber Mallard*, *Turbo Drake*, *Biblically Accurate Duck*), companions (*Professor Quacks*), and rivals (*Rival Whale*) are purely satirical fictions. |
| **#7: Static Build Output for GitHub Pages** | **Verified** | `vite build` bundles static HTML/CSS/JS/SVG into `dist/`. No server-side runtime code. |

---

## 6. Table of Changed and Created Files

| File Path | Action | Description |
|---|---|---|
| `src/core/prng.mjs` | Created | Pure PRNG module (`sfc32` + `cyrb128`), state serialization, forking. |
| `src/core/event-log.mjs` | Created | Append-only event log with FNV-1a hash chaining and `EventLog.hydrate()`. |
| `src/core/receipt.mjs` | Created | Truthful 3-register Receipt projection function and accounting ledger. |
| `src/core/storage.mjs` | Created | Versioned envelope adapter with semantic validation and in-memory fallback. |
| `src/core/storage.test.mjs` | Created | Unit test suite for storage adapter and validation boundaries (7 tests). |
| `src/core/game-engine.mjs` | Created | Core game engine state machine for Plan 03 3-day loop and canonical rules. |
| `src/core/game-engine.test.mjs` | Created | Unit test suite for engine traces, stances, commit/reveal, and receipt (8 tests). |
| `src/ui/hud.js` | Created | Persistent HUD component with clock, resources, save, and uninstall button. |
| `src/ui/desk-view.js` | Created | Apartment desk view with physical companion styling and app launch. |
| `src/ui/gacha-view.js` | Created | Promotional 10-pull theater with card flip animations and odds display. |
| `src/ui/race-view.js` | Created | Pond race track with 6-entrant scouting, stance selector, and lane animation. |
| `src/ui/modals.js` | Created | Starter offer, zero-cash check, escalation ladder, and retention modals. |
| `src/ui/receipt-view.js` | Created | Printed-slip Receipt component rendering the 3 registers and audit ledger. |
| `src/main.js` | Modified | Main browser controller mounting views, handling storage, and navigation. |
| `src/style.css` | Modified | Complete responsive stylesheet for game UI, HUD, cards, modals, and receipt. |
| `sim/recheck-own-duck-boundary.mjs` | Created | 100-seed paired recheck script for physical duck removal. |
| `sim/prng.mjs` | Modified | Re-exports from `../src/core/prng.mjs`. |
| `sim/event-log.mjs` | Modified | Re-exports from `../src/core/event-log.mjs`. |
| `sim/receipt.mjs` | Modified | Re-exports from `../src/core/receipt.mjs`. |
| `scripts/dev/smoke-browser.mjs` | Modified | Headless Chrome smoke runner extended with automated Journeys 1, 2, and 3. |
| `reports/development/plan-03-mechanism-slice/smoke-observations.json` | Created | Machine-readable observation record from automated headless browser smoke run. |
| `package.json` | Modified | Test script updated to include `storage.test.mjs` and `game-engine.test.mjs`. |

---

## 7. Scope Boundaries & Next Steps

- **Bounded Prototype Scope:** This implementation fulfills the ratified 3-day demonstration slice (~3–5 minutes of play). The roughly 15-minute classroom floor experience, multiple gacha banners, teacher analyzer, and run-usage export schema remain planned for future packets.
- **Two-Stance Race Choice:** The two-stance choice (`Safe Pace` vs. `Sprint Push`) is verified non-dominated for Common-only rosters under the bounded test contract; broader roster/trait race tuning remains an open design subject for later packets.
- **Stop Condition Met:** Per packet instructions, implementation and verification are complete. No further mutations will be made. The packet remains in status `ready` awaiting orchestrator review and owner play acceptance.
