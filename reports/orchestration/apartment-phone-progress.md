# Apartment phone presence — implementation progress

Date: 2026-10-27

## Implemented

Added a static portrait phone beside the physical rubber duck on the apartment desk. First entry shows the fictional Quackpot Welcome Festival invitation on the phone; a returning visit shows “Welcome back” and “Your game is ready when you are.” The phone screen is plain HTML and CSS with no added action, grant, mechanic, network dependency, audio, or asset.

Kept the existing companion setup form, selector IDs, defaults, style options, autosave checkbox, `btn-start-app`, one form submit listener, and `onStartApp` callback payload. Returning companion names are HTML-escaped before being inserted into markup. The invitation appears only in the phone screen; the adjacent narrative names the game without repeating the offer.

Styling is isolated in `src/ui/desk-phone.css`, imported at the top of `src/ui/shell.css`. The desk scene has compact-width and short-viewport rules. All content remains in document flow; the existing form controls and launch button follow the phone scene and remain normal keyboard-operable controls. No browser observation was run, so actual focus order, visual readability, and viewport fit have not been empirically confirmed.

## Validation

- `npm run build` succeeded with Vite transforming 28 modules.
- `git diff --check` reported no whitespace errors in the three source files.
- SHA-256 hashes of `src/ui/desk-view.js`, `src/ui/shell.css`, and `src/ui/desk-phone.css` were identical immediately before and after the build, confirming the scoped source edits persisted through validation.
- No browser-driven check was run; root will review rendered behavior when a browser slot is available.

## Deferred boundary

The existing transition continues to use its centered temporary phone overlay. Connecting its animation to the exact persistent phone position requires changes to the separately owned stage-transition lifecycle, which were outside this scope. No transition code or behavior was changed.

## Orchestrator verification

Root inspected the rendered opening at1280×720 and390×520 CSS viewports, including phone shape/readability and document width. No horizontal page overflow was observed; setup controls remain in normal scroll flow. In a fresh localhost session with autosave disabled before starting, Enter on the existing launch control entered the gacha; Return finished on the static phone's Welcome back screen with the existing Open Quackpot control focused. The physical companion remained static. This is bounded browser evidence, not an assistive-technology or full device matrix claim.

Root also saved isolated-profile opening screenshots at `reports/orchestration/apartment-phone-desktop.png` and `apartment-phone-narrow.png`. A final wording-only edit removes the unnecessary word "fictional" from the in-world invitation narration; screenshots precede that copy edit. No mechanics, form callback or transition change accompanied it. Root verified scoped diffs; no race/Dex/engine files belong to this follow-up. Owner visual approval remains open.
