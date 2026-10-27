# Plan 21: Duck-Dex inspection and first-owned entry presentation proposal

**Packet ID:** `plan-21`  
**Date:** 2026-10-26  
**Stage:** Implementation proposal and standalone queue verification delivered for Owner/QP Orch gate approval. No production source files have been mutated.

---

## 1. Objective and Architectural Boundaries

This proposal defines the complete production architecture for the canonical standing **Duck-Dex** as voluntary collection access and integrates **first-owned card reveals** into a skippable, sequential shelf-focus and silhouette-to-color presentation queue.

### Strict Non-Goals and Hard Boundaries
- **No new rarity or gacha odds:** Preserves existing linear pity and 80% Common / 18% Rare / 2% Legendary odds.
- **No fabricated set bonus mechanics or power scores:** Gaps in set effects remain explicit. No mechanical stat modifiers are invented.
- **No race dynamics or stamina cooldowns:** Soft rest rules belong to Plan 22 and will interface cleanly with this view once integrated.
- **No physical companion changes:** The physical rubber duck on the desk remains inanimate and distinct from the collectible digital roster.
- **No paid acceleration or Fast-Pull fees:** All skip, fast-pull, and reduced-motion paths remain free of charge and zero-friction.
- **No runtime CDN or network calls:** Complies strictly with Hard Constraint #2. All state and event logs remain strictly in local browser storage.
- **No report imports into production:** Production source will only import accepted pure modules (`src/core/duck-rig.mjs`, `src/core/game-engine.mjs`, `src/core/storage.mjs`).

---

## 2. Voluntary Duck-Dex Collection Inspection Architecture

### 2.1 Voluntary Access & Navigation Context
The Duck-Dex is accessible voluntarily by the student at any time without requiring a story beat or gacha draw trigger:
1. **HUD Canopy Button:** A dedicated `🦆 Duck-Dex` button is placed on the app canopy inside `src/ui/hud.js`. It appears whenever the player is inside the fictional phone stage (gacha, race staging, afternoon town).
2. **Context-Preserving Navigation:**
   - When the user opens the Duck-Dex, the controller caches `previousStep = currentStep` (e.g. `d1_morning_gacha`, `d1_midday_race`).
   - A clear, prominent `← Return to Game` button at the top of the Duck-Dex returns the player to the exact previous step without resetting unrevealed cards, restarting the day, or losing transient view state.
   - Keyboard `Escape` also safely closes the Duck-Dex and returns to the prior context.

### 2.2 Shelf Visual Grid & Missing Silhouettes
The Duck-Dex displays a physical "curio shelf" grid housing all finite identities in the current banner roster (`BANNER_1_ROSTER` identities: `duck-0` through `duck-5`):
- **Owned Ducks (Discovered):**
  - Rendered with the accepted Mode C hybrid SVG rig via `createDigitalDuckSvg` (`src/ui/duck-rig-view.mjs`).
  - Each identity receives a fixed, canonical cosmetic identity from accepted parts:
    - `duck-0` (*Puddle Quacker*, Common): Classic Yellow palette, no hat, no accessory.
    - `duck-1` (*Rubber Mallard*, Common): Mallard Green palette, no hat, no accessory.
    - `duck-2` (*Pond Rocket*, Rare): Bubblegum Pink palette, Sailor Cap, no accessory.
    - `duck-3` (*Bath Cadet*, Common): Classic Yellow palette, Sailor Cap, no accessory.
    - `duck-4` (*Turbo Drake*, Rare): Mallard Green palette, Tiny Top Hat, Bow Tie.
    - `duck-5` (*Biblically Accurate Duck*, Legendary): Bubblegum Pink palette, Tiny Top Hat, Monocle.
  - Displays tier badge (`COMMON`, `RARE`, `LEGENDARY`), identity name, and base speed.
- **Missing Ducks (Silhouettes):**
  - Rendered in its dedicated shelf slot as an unowned silhouette (`filter: brightness(0) opacity(0.35)` with dark cardstock background and dashed border).
  - Labeled `???` with slot number (e.g. `#5 - Unknown Legendary Duck`).
  - Missing status creates authentic completion visibility without deceptive false statistics.

### 2.3 Factual Value Inspection & Explicit Set Gaps
Selecting any slot opens a focused identity inspection card showing only factual, verified attributes:
- **Identity Name:** Exact canonical name.
- **Rarity Tier & Base Pre-Draw Rate:** Common (80%), Rare (18%), Legendary (2%).
- **Base Race Speed:** Common (10.0 m/s), Rare (14.0 m/s), Legendary (20.0 m/s).
- **Effective Race Speed & Availability:** Displays current base speed; notes that Plan 22 soft rest fatigue (50% penalty on 0 rest, 25% on 1 rest) will display here once active.
- **Set Membership:** Member of "Pond of Destiny" Set (`BANNER_1_ROSTER`).
- **No Fabricated Data:** Zero speculative resale prices, zero fabricated secondary-market valuations, and zero artificial power ratings (no "Battle Power 9000").

### 2.4 Set Card & Completion Pressure Cue Emission
A prominent Set Overview Banner sits atop the shelf:
- **Set Header:** `Pond of Destiny (Banner 1)`
- **Membership Progress:** `X / 6 Owned` (e.g., `4 / 6 Owned • 2 Missing`).
- **Set Effect Gap:** Explicitly displayed:  
  `"Set Bonus: None active (investigation only — no mechanical bonus applied)"`.  
  This prevents player misunderstanding while maintaining the canonical design gap.
- **Receipt Projection Alignment:**
  When the Duck-Dex shelf is opened while `owned.length < BANNER_1_ROSTER.length`, the engine appends:
  ```json
  {
    "type": "cue_shown",
    "cueId": "completion_pressure",
    "technique": "completion_pressure",
    "payload": {
      "cueId": "completion_pressure",
      "technique": "completion_pressure",
      "setProgress": [{ "set": "Pond of Destiny", "owned": 4, "total": 6 }],
      "incompleteSets": 1
    }
  }
  ```
  This integrates seamlessly with `src/core/receipt.mjs` line 128:
  `Set progress shown N time(s); most recent (day 1 morning): 4/6.`

---

## 3. First-Owned Card Reveal Presentation Queue

### 3.1 Definition of "New" (First-Owned)
- **Commit-Time Ground Truth:** "New" means previously unowned identity at committed draw time, not currently unviewed art.
- In `commitPromotionalTenPull()`, each draw has `isDuplicate = ownedSet.has(chosenDuck.id)`.
- If a duck is drawn for the first time, `duplicate: false`. If drawn a second time within the same 10-pull, the second draw is committed with `duplicate: true` and converted to Down.
- **Outcome Concealment:** Unrevealed cards remain hidden face-down. The acquisition queue is populated only as cards are flipped (`revealDrawAtIndex` or `revealNextDraw` or `revealAllPending`).

### 3.2 Sequential Presentation Lifecycle (`src/ui/acquisition-queue.js`)
When a card with `duplicate === false` is revealed, it is enqueued into the presentation controller:
1. **Phase 1: Shelf Focus (~2.0 seconds)**:
   - Smooth camera/scroll focus moves to the duck's shelf slot in the Duck-Dex.
   - The slot initially displays its unowned dark silhouette.
   - Badge displays: `"New Identity Discovered!"`.
2. **Phase 2: Silhouette-to-Color Transition (~2.5 seconds)**:
   - The dark silhouette dissolves smoothly into the vibrant full-color Mode C hybrid rig.
   - A subtle rarity-colored radial background glow pulses behind the duck.
   - The card title, rarity badge, and base speed fade in.
   - Live region announces: `"New Duck-Dex Entry: Rubber Mallard (Common) unlocked!"`.
3. **Phase 3: Inter-Item Transition (~0.5 seconds)**:
   - Advances to the next queued first-owned identity.
   - Once all queued items are shown, smoothly returns to the gacha card grid.

### 3.3 Run-Pacing Budget & Time Policy
- Presentation timing per identity: `2.0s focus + 2.5s color transition = 4.5s`.
- For a 10-pull:
  - 1 new identity: `4.5s + 0.5s return = 5.0s`.
  - 5 new identities: `5 * 4.5s + 0.5s = 23.0s`.
  - 10 new identities: `10 * 4.5s + 0.5s = 45.5s`.
- **Time Policy Statement:** Ten new identities add approximately 45–50s to the opening gacha sequence. In conformance with Plan 21, **no claim of an unchanged 15-minute floor run is made**. The drama budget legitimately extends the opening phase while preserving honest time records.

---

## 4. Fast-Pull, Reveal-All, and Free Skip Paths

### 4.1 Skip Presentation Control
- A prominent `⏭️ Skip Presentation` button is continuously visible and keyboard-accessible (`Tab` + `Space`/`Enter`) during playback.
- Hitting Skip immediately stops all timers, marks all currently queued identities as discovered/seen, updates the shelf slots to full-color Mode C rigs instantly, appends an action event (`acquisition_presentation_skipped`), and returns to the gacha grid in 0ms.

### 4.2 Connection to Existing "Reveal All" (`btn-reveal-all`)
- `src/ui/gacha-view.js` contains `#btn-reveal-all` ("Reveal All").
- When the player selects "Reveal All", all 10 cards flip face-up immediately.
- In accordance with Plan 21, Fast-Pull bypasses the 45-second sequential queue entirely:
  - All new identities are immediately marked as unlocked in the Duck-Dex.
  - A concise, non-blocking toast banner displays: `"✨ 5 new ducks added to your Duck-Dex!"`.
  - The player remains in the gacha theater without forced waiting.
- **Zero-Cost Accessibility:** No charge, no gem fee, no Down consumption. Fully free of manipulation.

### 4.3 Reduced Motion Parity (`prefers-reduced-motion: reduce`)
- If the operating system or browser requests reduced motion:
  - Auto-scrolling and timed transition waits (2s + 2.5s) are completely disabled.
  - Newly revealed identities transition instantly to their discrete static full-color state.
  - An accessible ARIA live region (`aria-live="polite" role="status"`) announces the acquisition textually.
  - Total pacing addition under reduced motion is **0.0 seconds**.

### 4.4 Window Blur / Modal Suspension
- `document.visibilityState === 'hidden'`: timers and Web Animations pause immediately.
- Opening Settings or Retention/Uninstall modals immediately suspends or cleans up the acquisition queue, preventing background state leaks or missed callbacks.

---

## 5. Persistence, State, and Event Log Schema

### 5.1 Backward-Compatible Storage Envelope
`engine.state` introduces one bounded field:
```javascript
state.seenDexEntries = ['duck-0', 'duck-1']; // Array of duck IDs whose acquisition has been presented or skipped
```
- **Backward Compatibility:**
  In `GameEngine.fromEnvelope(envelope)`:
  ```javascript
  this.state.seenDexEntries = Array.isArray(envelope.state?.seenDexEntries)
    ? [...envelope.state.seenDexEntries]
    : [...(envelope.state?.owned || [])];
  ```
  Existing save snapshots without `seenDexEntries` hydrate cleanly with 100% test compatibility.
- Storage schema validation in `src/core/storage.mjs` verifies that `seenDexEntries` is an array of strings matching known roster IDs.

### 5.2 Append-Only Event Log Integrity
- `cue_shown` (logged only upon real visible presentation):
  ```json
  {
    "type": "cue_shown",
    "cueId": "duck_dex_acquisition",
    "payload": {
      "cueId": "duck_dex_acquisition",
      "identity": "duck-1",
      "rarity": "common",
      "focusMs": 2000,
      "transitionMs": 2500
    }
  }
  ```
- `action` (logged upon explicit skip):
  ```json
  {
    "type": "action",
    "payload": {
      "kind": "acquisition_presentation_skipped",
      "remainingCount": 2
    }
  }
  ```
- **Idempotency Guarantee:**
  - Manually revisiting the Duck-Dex shelf after pulls never re-triggers the acquisition animation or duplicates log entries.
  - Reloading the page during a partially revealed pull does not re-animate already-seen ducks.

---

## 6. Proposed Production File Ownership

| File | Responsibility | Proposed Ownership |
|---|---|---|
| `src/ui/duck-dex-view.js` (new) | Renders the voluntary collection shelf, unowned silhouettes, Mode C rigs, factual inspector modal, set card, and return navigation. | Plan 21 |
| `src/ui/duck-dex.css` (new) | Scoped styling for curio shelf grid, silhouette cards, color dissolve, and inspection callout. | Plan 21 |
| `src/ui/acquisition-queue.js` (new) | Presentation queue manager: 2s focus + 2.5s color transition, skip controls, reduced-motion bypass, and clean return to gacha. | Plan 21 |
| `src/ui/gacha-view.js` | Connects single reveal and Reveal-All events to the acquisition queue; mounts Fast-Pull toast feedback. | Plan 21 |
| `src/ui/hud.js` | Adds the voluntary `🦆 Duck-Dex` entry button to the persistent HUD canopy when phone stage is active. | Plan 21 |
| `src/main.js` | Integrates `currentStep = 'duck_dex'` navigation, `previousStep` return handling, and view handle cleanup. | Plan 21 |
| `src/core/game-engine.mjs` | Stores `seenDexEntries`, implements `getDexCollectionState()`, and logs completion pressure cues. | Plan 21 |
| `src/core/storage.mjs` | Validates `seenDexEntries` array in storage envelopes with backward-compatible fallback. | Plan 21 |
| `src/ui/duck-dex-view.test.mjs` (new) | Unit & DOM tests for shelf rendering, silhouette state, factual data, and keyboard return navigation. | Plan 21 |
| `src/ui/acquisition-queue.test.mjs` (new) | Unit & lifecycle tests for batch duplicates, skip resolution, pacing timing, and reduced motion. | Plan 21 |

---

## 7. Standalone Verification Evidence

The standalone simulation runner `flow-queue-analysis.mjs` was executed to verify all core logic before any source mutations:
- **Suite 1: Batch duplicates produce unique acquisitions:** PASS. (2 duplicates in a 10-pull resulted in 0 duplicate acquisitions; exactly 3 unique new identities queued).
- **Suite 2: Pacing budget for 10 new identities:** PASS. (Exact duration = 45.5s, confirming Plan 21's 40–50s projection).
- **Suite 3: Fast-pull instant resolution:** PASS. (0ms elapsed, instant shelf colorization, truthful skip actions logged).
- **Suite 4: Mid-sequence skip resolution:** PASS. (Items completed before skip logged honestly; remaining items resolved with 0ms delay).
- **Suite 5: Reduced motion discrete state:** PASS. (0ms delay, discrete static state transition, static cue emitted).
- **Suite 6: Reload idempotency:** PASS. (Persisted `seenDexEntries` prevents re-animating previously seen ducks).
- **Suite 7: Unrevealed outcomes stay hidden:** PASS. (Unrevealed cards never enter the presentation queue).
- **Suite 8: Completion pressure Receipt conformance:** PASS. (Cue structure matches `src/core/receipt.mjs` expectations identically).

Full machine-readable results are preserved in `reports/development/plan-21-duck-dex-and-new-entry-presentation/flow-queue-results.json`.

---

## 8. Approval Requested

**Gate Decision Requested from Owner / QP Orch:**
1. Approve the voluntary collection shelf layout, factual value mapping, and explicit set-effect gap copy.
2. Approve the acquisition presentation queue timeline (2.0s focus, 2.5s silhouette-to-color transition, 45.5s maximum for 10 new identities).
3. Approve the connection of Fast-Pull / Reveal-All to immediate queue bypass with zero-fee accessibility.
4. Approve the production file ownership matrix outlined in Section 6.

*No production code will be edited until this gate is returned and approved.*
