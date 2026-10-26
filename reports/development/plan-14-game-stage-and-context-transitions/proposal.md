# Plan 14 Proposal: Game Stage and Metagame Transitions Investigation (Repair 01)

**Date:** 2026-10-25
**Type:** UX Architecture & Diegetic Stage Transition Investigation
**Status:** Delivered for Owner Review & Selection (Repair 01)
**Author:** Implementer Thread (Plan 14)
**Scope:** `reports/development/plan-14-game-stage-and-context-transitions/`
**Accompanying Interactive Artifact:** [`wireframes.html`](file:///C:/AI/Quackpot/reports/development/plan-14-game-stage-and-context-transitions/wireframes.html)

---

## 1. Executive Summary and Investigation Mandate

During the technical review and owner play-testing of Plan 03 ([`reports/orchestration/plan-03-owner-play-feedback.md`](file:///C:/AI/Quackpot/reports/orchestration/plan-03-owner-play-feedback.md)) and the Plan 12 owner interview ([`reports/orchestration/plan-12-owner-integration.md`](file:///C:/AI/Quackpot/reports/orchestration/plan-12-owner-integration.md), DECISION-008), the integration owner provided clear, binding aesthetic and structural guidance for Quackpot:

1. **Favored Identity:** Preserve the favored *Quackpot* logo (`QUACK` in gold `#fbbf24`, `POT` in white `#ffffff`) and its companion avatar cameo.
2. **Game Feel over Website Feel:** Replace the narrow centered 960px web-document wrapper with a full-width game framing that reads immediately as a dedicated videogame rather than a browser form.
3. **Constrained Readable Widths:** While the shell spans the full browser width, readable narrative text, dialogue boxes, and store catalogs must remain constrained to comfortable reading columns (max-width 720–760px, 60–75 characters per line). Do not stretch text across 1440p/4K monitors, and do not force browser fullscreen (`requestFullscreen`).
4. **Rectangular Game Viewport:** Provide a centered, letterboxed rectangular stage (16:9 desktop reference ratio) that comfortably stages both the apartment metagame and the fictional gacha app.
5. **Quieter Save & Settings Architecture:** Remove the distracting autosave checkbox from the persistent HUD header. Preserve autosave as an onboarding choice on the start menu, and relocate runtime toggles into a discoverable Settings Drawer/Modal. Retain an explicit, 1-click manual "Save" button with honest storage-failure feedback (including explicit alerts when running in restricted in-memory mode). Keep the prominent, red "Uninstall" emergency exit button visible at all times per Hard Constraint #5.
6. **Fictional-Phone Quarter-Turn & Stage Expansion (DECISION-008):** Choreograph the selected diegetic transition where the metagame character's smartphone rotates 90° into landscape orientation within the apartment desk, followed by a seamless expansion into the full-width gacha stage canvas. Provide an equally smooth reverse return transition, a zero-transform reduced-motion alternative, and full responsive/keyboard operability.
7. **Two Distinct Duck Contexts (DECISION-003):** Strictly separate the physical desk companion (an inanimate 2D rubber duck prop whose attachment motivates interest in gacha; cinematographic framing/lighting conveys mood; pawning affects the metagame apartment/cash story) from the collectible digital ducks (Plan 04 Mode C hybrid paper rig; active in gacha racing; animated).
8. **Experience vs. Debrief Boundary (DECISION-008):** In live gacha gameplay, remove pedagogical math analysis helper boxes. Let commercial excitement and predatory pressure register organically. Surfacing mathematical decomposition belongs exclusively on the post-run Receipt and debrief.
9. **Factual Credits Coordination (DECISION-010 & Plan 18):** Reserve a quiet, discoverable Credits panel inside the Settings Drawer for factual licensing and creator attributions (CC0/CC audio provenance) without breaching the fictional game world.

### Repair 01 Alignment
Following orchestration review ([`review-01.md`](file:///C:/AI/Quackpot/reports/development/plan-14-game-stage-and-context-transitions/review-01.md)), Repair 01 bound the prototype to strict verification requirements:
- **Interruption Safety:** Single explicit transition state machine with immediate cancellation of pending timers on Return, Escape, replay, or mock terminal exit.
- **Wireframe Choreography:** Demonstrates phone turn $\rightarrow$ legible upright landscape screen $\rightarrow$ stage expansion, and reverse collapse. Timings are labeled as proposals for owner selection (400ms turn, 400ms expand, 800ms total entry, 400ms return).
- **Focus & Motion Contracts:** Strict focus containment (Tab trapping) inside dialogs, returning focus to the invoking trigger upon dismissal. Escape dismisses top dialogs without navigating scenes. Reduced motion initializes from the OS preference (`matchMedia`) with working manual override and instant static scene swapping.
- **Truthful Labeling & Separation:** Storage, saving, and export are labeled as prototype simulations. Invented runtime verification claims and unmeasured AAA compliance statements are removed. Credits feature a factual attribution placeholder per DECISION-010 without claiming unmade code dedications. Stage copy is strictly player-facing; architectural commentary is isolated in the review margin.
- **Stable Terminal Placeholder:** Mock Leave enters an in-stage terminal/Receipt placeholder, locks the exit controls, and stops retention reopening.

Both shell options, the complete transition choreography, and all accessibility features can be evaluated interactively in [`wireframes.html`](file:///C:/AI/Quackpot/reports/development/plan-14-game-stage-and-context-transitions/wireframes.html).

---

## 2. Shell Option A (Recommended): "Cinematic Stage Canopy"

### 2.1 Architectural Concept
Shell Option A adopts a modern, arcade-inspired "canopy" header spanning 100% of the browser width, anchored directly to the top edge. It organizes all persistent HUD elements into three distinct ergonomic zones (Brand Identity on the left, Life & Economy Status in the center, and System/Exit Utilities on the right), while dedicating the entire vertical viewport below to a framed, centered 16:9 stage canvas.

```
+---------------------------------------------------------------------------------------------------------+
| [CANOPY HEADER: 100% Viewport Width]                                                                     |
| (Logo & Avatar Cameo)        [Day 1 Midday]  [$10.00 Cash]  [💎 0 Gems]  [100 HP]    [💾 Save] [⚙️] [❌ Exit]|
+---------------------------------------------------------------------------------------------------------+
| [AMBIENT STAGE WRAPPER: Full-Bleed Dark Radial Vignette]                                                |
|                                                                                                         |
|       +-----------------------------------------------------------------------------------------+       |
|       | [RECTANGULAR STAGE CANVAS: 16:9 Ratio, Max 1120px, Min 480px]                           |       |
|       |                                                                                         |       |
|       |   +---------------------------------------------------------------------------------+   |       |
|       |   | CONSTRAINED CONTENT WELL (Max 760px Width)                                      |   |       |
|       |   | - Apartment Desk / Physical Duck / Smartphone OR Gacha Banner & Storefront      |   |       |
|       |   +---------------------------------------------------------------------------------+   |       |
|       |                                                                                         |       |
|       +-----------------------------------------------------------------------------------------+       |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

### 2.2 Header Layout & Component Breakdown

1. **Left Zone: Brand & Physical Companion Cameo**
   - **Avatar Cameo:** A 38Ã—38px circular badge rendering the 2D inanimate physical duck companion (`Professor Quacks`), bordered in warm gold (`#fbbf24`).
   - **Favored Logo:** Preserves the exact Plan 03 styling:
     `<span class="title-quack">QUACK</span><span class="title-pot">POT</span>` (`QUACK` in glowing amber `#fbbf24`, `POT` in crisp white `#ffffff`).
   - **Subtitle / Run Version:** A small blue pill (`Slice v0.14`) and a quiet indicator showing the current companion name.

2. **Center Zone: Persistent Status Canopy**
   - **Day & Time Phase:** `📅 Day 1: Midday` (updates as time advances through midday expenses, afternoon races, evening wages, and night rent).
   - **Fictional Cash:** `💵 Cash: $10.00` (green `#34d399` when solvent; transitions to amber/red alert styling when facing an unpaid bill).
   - **Gems (Dormant Gating):** `💎 Gems: 0` starts in a dimmed, dashed-border dormant state (45% opacity) to prevent rookie cognitive overload, illuminating into vivid amethyst when the first gems or pull rewards are granted.
   - **Health HP:** `❤️ Health: 100 HP` (escalation meter tracking skipped meals and physical strain; flashes crimson alert below 20 HP).

3. **Right Zone: Action & Utility Controls (Quieter Save Model)**
   - **💾 Save Button:** A compact, low-chrome icon button (`btn-hud-quiet`). In the prototype, clicking triggers an inline simulation toast (`✓ Simulated: Run saved locally to browser storage.`) that automatically fades after 2.6 seconds.
   - **⚙️ Settings Button:** Opens the focus-trapped Settings Drawer housing autosave preferences, storage diagnostics, accessibility toggles, and local credits.
   - **❌ Uninstall Button:** Prominently styled in crimson (`rgba(239, 68, 68, 0.2)` with `#ef4444` border), guaranteeing that the player's emergency exit route is always visible and 1-click reachable per Hard Constraint #5.

### 2.3 Stage Container & Constrained Content Wells
- **Stage Framing:** Background uses a rich radial vignette (`radial-gradient(circle, #111827 0%, #080c14 100%)`) that eliminates empty desktop white-space while framing the game action.
- **Canvas Bounds:** Aspect ratio defaults to 16:9 with a max-width of 1120px and min-height of 480px.
- **Constrained Content Wells:** All narrative dialogues, apartment blotter notes, gacha cards, and store grids are nested within a centered `.gacha-content-well` container constrained to **760px maximum width**. This prevents line lengths from exceeding 75 characters, ensuring optimal legibility across wide desktop monitors.

---

## 3. Shell Option B (Alternative): "Diegetic Console & Split Utility Rail"

### 3.1 Architectural Concept
Shell Option B explores strict diegetic separation: the entire top of the screen is reserved exclusively for in-world game state, while all software utilities (save buttons, settings gears, credits, and uninstall) are relocated to a quiet, translucent console rail anchored at the bottom of the viewport.

```
+---------------------------------------------------------------------------------------------------------+
| [DIEGETIC TOP BAR: 100% In-World Markers Only — Zero System Controls]                                   |
| (Logo & Avatar)                     [Day 1 (Midday)]   [$10.00]   [💎 0]   [100 HP]                     |
+---------------------------------------------------------------------------------------------------------+
| [CENTRAL STAGE VIEWPORT]                                                                                |
|                                                                                                         |
|       +-----------------------------------------------------------------------------------------+       |
|       | [STAGE CANVAS: Letterboxed 16:9 Viewport]                                               |       |
|       +-----------------------------------------------------------------------------------------+       |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
| [SPLIT UTILITY RAIL: Subdued Bottom Bar — Semi-Transparent Backdrop Blur]                               |
| 🎮 Quackpot Console v0.14  |  Autosave: Enabled                      [💾 Save]  [⚙️ Options]  [❌ Uninstall] |
+---------------------------------------------------------------------------------------------------------+
```

### 3.2 Key Differences from Shell Option A
- **Pure In-World Top Bar:** The top bar contains no interactive utility buttons. It feels like an authentic retro-arcade or simulation monitor HUD.
- **Bottom Utility Rail:** Anchored to the bottom margin with backdrop-blur styling (`rgba(14, 20, 34, 0.92)`). Displays a quiet "Autosave: Enabled" status indicator alongside Save, Options, and Uninstall buttons.
- **Trade-Offs:**
  - *Advantage:* Maximizes atmospheric immersion on the top half of the screen.
  - *Disadvantage:* On smaller laptop displays or when browser toolbars take up vertical height, bottom-anchored bars risk colliding with internal game navigation tabs (such as the Gacha bottom bar `[Home | Races | Roster | Shop]`), creating visual crowding at the base of the viewport.

---

## 4. Deep Comparative Analysis: Shell A vs. Shell B

| Criterion | Shell Option A: Canopy (Recommended) | Shell Option B: Split Rail (Alternative) | Design Assessment & Trade-Off |
| :--- | :--- | :--- | :--- |
| **Ergonomic Scanning** | Top-right utility cluster matches standard web/game UX conventions. | Utilities split between top and bottom; requires vertical eye scanning. | **Shell A wins.** Players instinctively search the top-right corner for settings and emergency exit. |
| **Diegetic Immersion** | High; canopy uses dark slate framing that feels like a modern console HUD. | Maximum top purity; top bar is 100% in-world narrative state. | **Shell B wins** on pure conceptual diegesis, but at the cost of ergonomic dispersion. |
| **Viewport Collision Risk** | Zero; bottom of stage remains completely free for gacha navigation tabs. | Moderate risk of crowding between gacha navigation tabs and system rail. | **Shell A wins.** Keeping the bottom clear avoids nested button bars on laptop screens. |
| **Mobile / Tablet Adaptability** | Header neatly wraps status pills into a clean two-row canopy. | Bottom rail occupies precious vertical real estate on small touchscreens. | **Shell A wins.** Top canopy scrolls or collapses cleanly on mobile viewports. |
| **Hard Constraint #5 (Uninstall)** | Always visible in top-right corner with distinct crimson accent. | Positioned in bottom-right footer; may require scrolling on short viewports. | **Shell A wins.** Guarantees immediate visibility of the emergency exit at all times. |

**Recommendation:** Adopt **Shell Option A ("Cinematic Stage Canopy")** as the production baseline. It satisfies the owner's request for a full-width videogame feel, eliminates the persistent autosave checkbox, keeps text columns constrained and readable, and avoids vertical collisions with gacha navigation controls.

---

## 5. Fictional-Phone Landscape-to-Stage Transition Choreography

Per DECISION-008, the owner selected a fictional-phone quarter-turn into landscape followed by stage expansion as the transition direction. The transition bridges the character's physical apartment desk and the commercial gacha app.

### 5.1 The 5-Beat Transition Lifecycle & Interruption Handling

```
[Beat 1: Apartment Desk]
   Phone sits in portrait (aspect ~9:19.5, 200Ã—380px) on desk.
   Golden push notification pulses: "Special Welcome Gift Waiting! Tap to Claim 10-Pull!"
               │
               ▼ (Player clicks phone or presses Enter/Space)
[Beat 2: Diegetic Quarter-Turn (400ms proposed)]
   Desk lighting dims slightly (radial vignette intensifies).
   Phone elevates with 3D drop shadow and rotates 90° clockwise:
   `transform: rotate(90deg) scale(1.15);`
   Inside phone, screen contents counter-rotate into legible landscape view.
               │
               ▼ (Continuous smooth easing curve)
[Beat 3: Stage Expansion (400ms proposed; 800ms total entry)]
   Rotated phone expands outward to fill the 1120px 16:9 stage canvas.
   Desk scene dissolves into the active full-width gacha interface.
               │
               ▼
[Beat 4: Active Gacha Stage]
   Full Quackpot Gacha App is active with Rookie 10-Pull Banner.
   Focus moves to primary CTA; background shortcuts active.
               │
               ▼ (Player clicks "Return to Desk" or hits Escape)
[Beat 5: Reverse Return Sequence (750ms total: fade then rotate)]
   Stage 5A (Fade, 350ms): Gacha stage canvas fades out, revealing the apartment desk with the phone resting on the blotter in landscape orientation.
   Stage 5B (Rotation, 400ms): Landscape phone on desk smoothly rotates 90° counter-clockwise back to portrait resting position.
   Desk lighting and physical companion prominence are restored.
```

### 5.2 Interruption & Cancellation Safety
- **Single State Machine:** State is tracked via `transitionState` (`'desk'`, `'turning'`, `'expanding'`, `'gacha'`, `'terminal'`).
- **Immediate Callback Invalidation:** Clicking `⬅ Return to Desk`, `btn-step-desk`, pressing `Escape`, or initiating terminal exit executes `cancelPendingTransitions()`. This clears active `setTimeout` timers and increments `transitionToken`, ensuring stale async callbacks never re-open the gacha stage after a user has cancelled.
- **Unified Click & Auto-Play Timing:** Clicking the phone container and clicking `▶ Auto-Play` execute the exact same scheduled pipeline: 400ms turn $\rightarrow$ 400ms expansion (800ms total entry). All durations are explicitly presented as design proposals for owner review.

### 5.3 Reduced-Motion Alternative (`prefers-reduced-motion: reduce`)
When the user has system reduced motion enabled or toggles "Reduced Motion" in the Settings Drawer:
- **System Preference Detection:** Initialized automatically on load via `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- **Zero Transforms:** Zero angular rotation (`rotate(0deg)`) and zero scale transforms.
- **Instant Static Swap:** Clicking the phone or Return immediately performs a clean 100ms cross-fade between views with zero rotation.
- **Focus & Narration:** Focus transfers immediately to the primary CTA; live region announces: *"Quackpot Gacha App opened in landscape stage view (reduced motion active)."*

---

## 6. Quieter Save, Settings Architecture & Local Credits

### 6.1 Removal of HUD Checkbox & Onboarding Placement
- The persistent HUD checkbox from Plan 03 is removed from the header.
- **Onboarding Placement:** The initial run start screen / new game modal provides the primary autosave opt-in:
  `[✓] Enable Autosave (recommended — saves progress and Receipt log locally)`.
- **Settings Drawer Placement:** Players can toggle autosave at any time inside the Settings Drawer.

### 6.2 Settings Drawer / Modal Specification
Activated via `⚙️ Settings` (or keyboard shortcut `?` / `O`), the modal presents four structured, accessible sections:

1. **Saving & Storage Preferences:**
   - **Autosave Toggle:** Toggle switch allowing players to enable or disable automatic saving. Explanatory text notes: *"Saves automatically on stage changes, pulls, race finishes, and day transitions."*
   - **Manual Save Button:** A full-width `💾 Save Run State Now` button triggering immediate micro-toast feedback.
   - **Honest Storage Diagnostics (Simulation):** Monospace box stating that storage in the wireframe is simulated:
     ```text
     Mode: Simulated HTML5 localStorage (Prototype Simulation)
     Notice: In production, local storage envelope and hash chain are verified at runtime.
     Last Saved: Simulated Just Now (Day 1 Midday)
     ```
   - **Restricted Storage Simulation:** When simulated restricted storage is toggled, the box updates:
     ```text
     Mode: Simulated In-Memory Session (Restricted)
     Notice: In production, write failure activates in-memory session and leaves stored snapshot untouched.
     ```

2. **Accessibility Options:**
   - **Reduced Motion:** Disables 90° phone rotation and zoom transforms; activates instant cross-fades.
   - **High Contrast Candidate:** Enforces solid borders and elevated contrast palette (review candidate styling; unmeasured AAA claims omitted).
   - **Synthesized Web Audio:** Toggles procedural Web Audio quacks and chimes.

3. **Factual Credits Placeholder (DECISION-010 & Plan 18 Coordination):**
   - Per DECISION-010, the owner approved amending repository rules to permit licensed Creative Commons audio sources (CC0 and CC BY) alongside procedural Web Audio synthesis, with factual attribution linked from settings.
   - The Credits panel provides a factual attribution placeholder:
     ```text
     Quackpot is an educational browser gacha game created for CourseVGD to examine predatory monetization design.
     Audio Attribution Placeholder: Audio effects are currently synthesized locally via the Web Audio API. Future locally bundled Creative Commons audio recordings (CC0 / CC BY) approved under DECISION-010 will be factually credited here once auditioned and selected in Plan 18.
     Satirical Fiction Notice: All publishers, sponsors, and gacha brands depicted are fictional satire.
     ```

4. **Run Data Export (Simulation):**
   - Provides a `📥 Simulate Receipt Download` button reflecting Hard Constraint #3 (offline student file download; zero telemetry).

### 6.3 Hard Constraint #5: Always-Visible Uninstall & Stable Terminal State
- The crimson `❌ Uninstall` button remains permanently mounted on the persistent canopy in all active states.
- Clicking opens the **Retention Modal**, offering `80 Free Gems` to stay.
- Clicking `🚪 Leave Immediately & View Receipt (Best Ending)` executes immediate terminal exit:
  - Closes modal without alerts.
  - Cancels all pending transition timers.
  - Activates the in-stage **Terminal / Receipt Placeholder** (`scene-terminal`).
  - Locks the uninstall buttons (`🏁 Run Ended`).
  - Disables retention re-opening until the user explicitly clicks `🔄 Reset Prototype & Start Fresh Run`.

---

## 7. Accessibility, Responsive & Keyboard Contracts

### 7.1 Responsive Viewport Adaptability
- **Actual Viewport Media Queries:** Evaluated on real window dimensions (`@media (max-width: 768px)` wraps the canopy into two rows; `@media (max-height: 600px)` reduces padding to keep all affordances visible without vertical clipping).
- **Container Presets:** Toolbar select dropdown (`Desktop`, `Laptop 1024px`, `Tablet 768px`, `Mobile 390px`) resizes the preview container to demonstrate constrained 760px text wells.

### 7.2 Focus Trapping & Keyboard Management
- **Modal Focus Trapping:** When Settings or Uninstall opens, focus is trapped inside the active dialog using Tab / Shift+Tab wrapping. Background shortcuts are suppressed.
- **Return to Invoking Trigger:** Dismissing a modal (via `✕` button or `Escape`) restores keyboard focus directly to the button that opened it (`btn-open-settings` or `btn-open-uninstall`).
- **Escape Key Hierarchy:**
  1. If a modal is open: `Escape` dismisses the modal and returns focus to its trigger. Scene navigation is not triggered.
  2. If no modal is open and gacha is active: `Escape` returns to the apartment desk.
  3. If transition is in flight: `Escape` cancels the animation and returns to desk.
- **Keyboard Shortcuts:** `S` (Save), `?` / `O` (Settings), `U` (Uninstall), `Enter` / `Space` (Activate).

### 7.3 Accessible Event Narration (`aria-live="polite"`)
A dedicated live region announces all state transitions and system notifications:
- *"Beat 1: Apartment Desk. Phone resting in portrait orientation."*
- *"Beat 2: Fictional phone executes 90° quarter-turn into landscape orientation."*
- *"Beat 3: Phone screen expands into full-width gacha stage canvas. Quackpot Gacha App active."*
- *"Reverse transition: Exited gacha app, returned to apartment desk."*
- *"Terminal exit: Run ended cleanly via Uninstall. Presenting end-of-run Receipt placeholder."*

---

## 8. Diegetic Separation: Physical Duck vs. Digital Gacha

| Attribute | Physical Companion Duck (Metagame) | Collectible Digital Ducks (Gacha App) |
| :--- | :--- | :--- |
| **Diegetic Nature** | Tangible rubber duck owned by the character, sitting on the apartment desk blotter. | Digital racing sprites collected inside the fictional *Quackpot* smartphone app. |
| **Art & Rendering** | 2D inanimate SVG prop (`Professor Quacks`). Cinematographic framing and desk lighting convey mood. | Plan 04 Mode C hybrid paper SVG rig with layered cardstock construction. |
| **Animation Policy** | **Strictly inanimate.** Never moves, waddles, or flaps autonomously. Camera cuts or repositioning suggest personality. | **Animated.** Articulates wings, heads, paddling, and racing motion (to be explored in Plan 09). |
| **Story Consequences** | Pawnable during late-game rent crises. Pawning empties the desk station and creates an emotional story beat. | Collected in the digital Duck-Dex roster. Never pawned for cash; duplicate cards convert into Down currency. |
| **HUD Depiction** | Represented by the circular cameo avatar beside the canopy logo. | Displayed in gacha pull theater, race lanes, and roster cards. |

---

## 9. Implementation Roadmap & Production Migration Plan

Following owner selection, implementation can be executed cleanly in a small, bounded packet without risking existing simulation or storage infrastructure:

1. **Phase 1: Shell CSS & Layout Tokens (`src/style.css`):**
   - Introduce full-width `.shell-a-header` canopy and `.stage-canvas` container tokens.
   - Add `.gacha-content-well` max-width constraint (760px).
   - Implement responsive media queries and high-contrast / reduced-motion token overrides.
2. **Phase 2: HUD Refactoring (`src/ui/hud.js`):**
   - Migrate HUD from narrow 960px container to canopy architecture.
   - Remove `<label><input type="checkbox"> Autosave</label>` from persistent header markup.
   - Mount quiet `💾 Save`, `⚙️ Settings`, and permanent `❌ Uninstall` buttons.
   - Connect save toast micro-feedback for storage success and restricted in-memory mode.
3. **Phase 3: Settings & Credits Component (`src/ui/modals.js`):**
   - Implement the accessible Settings Drawer component with Tab focus trapping.
   - Wire autosave toggle to `engine.autosaveEnabled`.
   - Embed factual Credits panel per DECISION-010.
4. **Phase 4: Phone Transition Choreography (`src/ui/desk-view.js` & `src/ui/gacha-view.js`):**
   - Implement the 90° landscape quarter-turn and stage expansion classes with cancelPendingTransitions safety.
   - Wire keyboard handlers and `aria-live` narration hooks.
   - Add instant cross-fade fallback for reduced-motion mode.
5. **Phase 5: Automated Verification:**
   - Update `src/ui/hud.js` tests to verify quieter save controls.
   - Run full test suite (`npm test`) and browser smoke tests (`npm run test:smoke`).

---

## 10. Summary of Owner Selection Choices

To proceed toward implementation, the owner is invited to confirm the following architectural decisions:

1. **Shell Architecture:**
   - **Option A (Recommended):** Cinematic Stage Canopy (Full-width top canopy bar with persistent meters, quiet save, settings, and uninstall).
   - **Option B (Alternative):** Diegetic Console & Split Utility Rail (Top bar 100% diegetic; system actions anchored to bottom rail).
2. **Phone Transition Choreography:**
   - Approve the proposed 400ms turn + 400ms expansion (800ms total entry), 400ms return, and instant reduced-motion cross-fade.
3. **Quieter Save Model:**
   - Approve removing the autosave checkbox from the persistent HUD, providing onboarding opt-in on start menu, and housing runtime toggles in the Settings Drawer.
4. **Factual Credits Placement:**
   - Approve housing factual CC/CC0 audio licensing and creator attribution inside the Settings Drawer per DECISION-010.
