# Plan 20 source and lifecycle proposal

**Stage:** Proposal for QP Orch approval. No production implementation is included.

## Objective and boundaries

Replace only the revealed promotional gacha card's duck emoji with the accepted Mode C digital SVG rig, then loop one keyed cosmetic motion per revealed card while the gacha view is active and the card is visible. The selected trigger is card reveal. Before reveal, cards keep their existing card-back presentation and receive no duck art, rarity preview, or motion. The physical companion remains static and keeps its current placeholder image use in the desk and HUD. Motion does not change draw outcomes, cost, odds, engine state, storage schema, or mechanical PRNG streams.

Race motion code may be reusable, but Plan 20 will not connect it to race events. Plan 13's current progress describes candidate preview events and expressly leaves production integration owner/orchestrator gated. Race wiring, including normal paddle, leading-two graceful bob, and impact/recovery, requires accepted Plan 13 semantics and a separate bounded follow-on approval.

## Proposed production file ownership

| File | Proposed responsibility | Ownership |
|---|---|---|
| `src/ui/duck-rig-view.js` (new) | Small DOM/SVG view helper: call `composeDuckSvg` from `src/core/duck-rig.mjs` with Mode C, palette/accessory values, a required unique prefix, and a descriptive accessible name. No report imports. | Plan 20 |
| `src/ui/duck-motion-controller.js` (new) | Own only presentation motion for mounted revealed-card SVGs: keyed paddle/bob choice, animation handles, user pause, view/document visibility, system reduced motion, and teardown/reset. No engine or RNG access. | Plan 20 |
| `src/ui/gacha-view.js` | Render rig SVG for each revealed card, expose the accessible animation pause/resume control and static status, and return controller cleanup. Keep reveal controls, card text, and card-back flow intact. | Plan 20 |
| `src/main.js` | Own the active gacha cleanup callback and user pause preference; call cleanup before any view rerender/navigation and on Uninstall/terminal/fresh-run transitions. Pass active/inactive context when Settings or another modal covers the gacha view. | Plan 20 |
| `src/ui/settings-modal.js` | No expected edit: existing Settings rerender/cleanup boundary in `main.js` should suspend the old card controller, and the fresh underlying view resumes after close. Change only if implementation evidence shows a gap and QP Orch approves the file. | Not initially owned |
| `src/ui/duck-motion.css` (new, if needed) and `src/main.js` stylesheet import | Scope only the revealed-card rig sizing and any animation-related presentation to the gacha card; avoid broad global selector changes. CSS transitions are not the motion owner. | Plan 20 |

Plan 13 owns `reports/development/plan-13-race-staging-and-run-pacing/` and its active progress edit. Plan 20 will not modify, stage, or commit those files. It also will not import `reports/development/plan-09-gacha-duck-motion-gallery/index.html` or any report asset. Reusable source is `src/core/duck-rig.mjs`, whose accepted composer is already production source.

## Digital and physical duck mapping

- **Digital gacha ducks:** revealed cards produced from `engine.state.pendingReveals`; replace the current revealed-card 🦆 icon with composed Mode C SVG. Unrevealed cards stay face-down. Card name, rarity, speed, duplicate/new indicator, and controls stay readable and unchanged.
- **Physical metagame duck:** `src/ui/desk-view.js` and `src/ui/hud.js` currently use the imported `src/assets/duck-placeholder.svg` through `duckSvgUrl`. Retain that URL and its static behavior. Do not globally replace it with the rig or attach the motion controller to it.
- **Race participants:** current race presentation remains as-is. The reusable controller may support the accepted motion IDs, but no race participant is wired to it in this packet.

## Per-card construction and stable cosmetic choice

`GameEngine.commitPromotionalTenPull()` stores each card's `commitSeq` from the append-only draw commit event, and `revealDrawAtIndex()` records the reveal against that sequence. Use `commitSeq` as the immutable card key. Derive the SVG prefix from that numeric key, for example `qp-card-${commitSeq}`, and validate/sanitize it before passing it to the rig composer. This isolates the root, head/wing group, accessory, and `defs` filter IDs (`<prefix>-seam-shadow`) for every simultaneous SVG. Never use a shared fixed `duck` prefix in the ten-card grid.

Derive `paddle` versus `graceful-bob` through a small deterministic cosmetic hash/selector over a versioned domain label plus `commitSeq` and card identity. This is a pure keyed choice: no `Math.random`, game PRNG, `crypto` draw, log append, or save field. The committed card already persists its identity and sequence, so rerender and save/reload reproduce the same motion. Selection does not inspect rarity and cannot run before reveal. The identity and key are presentation inputs only, never game outcomes.

## Motion ownership and lifecycle

Use Web Animations API transform tracks on each SVG instance's root/head/wing and accepted paper-layer paths, porting the Plan 09 factor-four paper-layer offsets, relative timing, and parent motion as reported in its accepted refinement. Keep each instance's handles local to its controller record; use the accepted paddle and graceful-bob loops, preserving the SVG's Mode C hierarchy, hats/accessories, shadows, and exact neutral transform reset. Static/reduced mode uses the same rendered duck and card information without moving it; no new rarity flash, teaser, or reveal anticipation is added.

Provide one visible, keyboard-operable gacha control for pausing/resuming continuing duck motion. It must not reveal cards, change outcomes, or cost anything. Announce state in a concise live status. Preserve the user's pause preference across routine `renderApp()` rerenders for the current mounted view, without persisting it in game state. System reduced motion always wins over an active loop: cancel/freeze active handles and present static SVGs. Listen for `prefers-reduced-motion` changes; when it becomes false, resume only if the view is active and the user has not paused.

The controller suspends loops when `document.visibilityState` is hidden, the gacha stage is not active/covered by Settings or another modal, or an individual card leaves the viewport (IntersectionObserver, with a safe static fallback where unavailable). Resume only still-mounted revealed-card instances that are in view and whose context is active. A user's explicit pause remains in force on resume. On any suspend/cancel path, cancel animation objects, invalidate stale callbacks/generations, and reset every transform to its neutral value so the information remains legible and reactivation never starts mid-stale animation.

`renderGachaView()` returns cleanup for its controller. `main.js` invokes it before `renderApp()` replaces the main content, before navigation to desk/race/Receipt, and before terminal Uninstall/leave/fresh-run transitions. Settings opening already rerenders the app and creates an inert modal; that rerender must dispose the previous controller. The rebuilt underlying gacha controller remains inactive while Settings is open, and closing Settings rebuilds/resumes it under current OS and visibility settings. Save/reload reconstructs the same revealed card IDs and cosmetic choices from `pendingReveals`; animation progress and user pause are transient and do not enter storage.

## Retained race direction; explicit deferment

The owner's recorded follow-on direction remains: normally paddle; leading two may gracefully bob; actual duck/wall impacts use impact/recovery, then return to rank-appropriate locomotion. It is a design direction only. No impact trigger, rank sampling/hysteresis, timing, or race view hook is authorized until Plan 13 event semantics are accepted and QP Orch/owner approve a bounded mapping. No arbitrary demo impacts in the student flow.

## Verification proposal

After this proposal is approved and files are assigned, verify with focused module/tests plus repository-required checks. Tests should cover: deterministic card-key selection across rerender/reload; simultaneous card prefixes/filter-reference isolation; no cosmetic selector access to engine RNG; multiple reveal and reveal-all cards; hide/show and offscreen suspend/resume; explicit pause; system reduced-motion true at mount and both preference-change directions; Settings/inactive context; teardown on navigation, Uninstall, Receipt and fresh run; stale animation callback suppression; exact neutral reset; static information parity; no motion before reveal; and unchanged physical companion asset path. Build and relevant repository tests/smoke checks should confirm no report-folder production dependency and no runtime network call.

Rendered review should cover a ten-card grid at desktop and narrow viewports, varied motion choices, static and reduced-motion modes, pause control by keyboard, Settings overlay, scrolling/offscreen, navigation/Uninstall during playback, and save/reload. Request a coordinated QP Orch browser slot before using browser automation and release that slot afterward. Browser review should report exact viewport and system reduced-motion conditions. Do not claim system-true evidence unless actually observed.

**Approval requested from QP Orch:** approve or revise this bounded source/lifecycle proposal, then establish explicit production file ownership before implementation. Please also reserve a coordinated browser slot for the later rendered check. No code should be written until this proposal gate is returned.
