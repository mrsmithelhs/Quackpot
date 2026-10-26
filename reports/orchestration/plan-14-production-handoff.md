# Selected Shell A — concise production handoff

**Date:** 2026-10-25. **Owner selected:** Shell A. Plan 14 is a report-only investigation; this handoff does not implement the site. Read this and relevant current source before opening the entire large wireframe. Exact durations, spacing and easing remain implementation/tuning candidates.

## Accepted behavior

- Full-width top canopy preserving the favored logo; constrained readable content inside the game stage. Quiet Save/Settings, persistent Uninstall. Initial autosave choice and later settings; no persistent HUD autosave checkbox.
- Fictional phone enters through an automatic turn → expansion sequence after one ordinary activation. No separate second click to expand. Preserve legible landscape content, keyboard operation, cancellation and static/reduced-motion equivalents. No physical device rotation/fullscreen requirement.
- Return visibly fades/collapses the phone border and rotates it back into the apartment portrait view; no abrupt unanimated reset. Owner refined the comparison through `52227d1`, `db282b8`, `5f22b0d`, `4da0472`. Copy the selected behavior, not the entire implementation.
- Settings must remain within the viewport above game chrome, have a reachable close control, Escape and backdrop dismissal, focus containment/return and inactive background. Backdrop dismissal applies to settings; production retention behavior must preserve canonical immediate exit/offer rules.
- Remove review/explanatory scaffolding from the production stage. Keep basic instructions, prices/odds/terms, actual storage-failure feedback and accessible equivalents. Analysis belongs to Receipt/debrief; no prototype technical diagnostics or fake saving/export/Receipt claims in the game.
- Local Credits reachable from opening/settings; exact audio/credit assets await Plan 18 owner selection. This is not an audio integration assignment.

## Map into production

| Concern | Current home / bounded integration responsibility |
|---|---|
| Header/logo/resource controls | `src/ui/hud.js` plus focused shell styling |
| Scene rendering | `src/ui/desk-view.js`, `gacha-view.js`; physical object remains separate from digital roster |
| Transition lifecycle | Small proposed stage-transition helper called from `src/main.js`, with cancellation/disposal; no outcome or economy logic inside animation |
| Settings and focus | Existing `src/ui/modals.js`, or a small proposed settings renderer if that keeps ownership clearer; use real storage/settings callbacks |
| Saving/event boundaries | Existing engine/storage APIs. Never create mock success, duplicate save logic or change commit/reveal/outcome timing to suit effects |
| Styling | Current `src/style.css`; outline a focused shell/transition CSS split if needed, without a site-wide stylesheet rewrite |
| Receipt and Uninstall | Existing engine/log/Receipt route; preserve frozen terminal state, truthful cue display and immediate exit |

New helper filenames/CSS split are proposals for the bounded implementation outline, not modules that already exist. Existing core modules stay the source of truth. The rig, sound and later race/pull spectacle integrate separately.

## Required production verification

Check one activation executes both entry phases; Return/Uninstall/replay/reload cannot fire stale callbacks; modal nested icon/label clicks return focus to the invoking button; header/close/exit remain reachable at narrow and short actual viewports. Test system and explicit reduced-motion settings, keyboard entry/dismissal and real save failure. Run the existing meaningful save/Receipt/game smoke checks for affected routes. Report browser dimensions and actions, not only a generic test count.

Keep rendering/motion view state separate from persisted game progression, RNG and append-only evidence. Do not record an animation cue as displayed before it actually becomes visible. Large wireframe code is a visual comparison and historical witness; selected behavior and this acceptance map are the production contract.
