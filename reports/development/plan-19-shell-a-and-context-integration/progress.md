# Plan 19 progress — Shell A and context integration

Date: 2026-10-25
Packet: `plan-19` (left `in-progress`; implementers do not set packet status)
Implementation commit: `ac602f2`

## Result

Implemented the approved Shell A outline: the full-width apartment canopy, persistent save/settings/uninstall controls, a focused entry/return transition helper, and a settings dialog with accessible focus and save-state behavior. A single activation completes turn/expand; the reverse return is animated when motion is allowed and resolves to a static state when reduced motion is requested. The UI remains a view of the existing engine, storage, log, RNG, and Receipt ownership.

The implementation preserves the selected automatic entry and animated return decisions. It does not expand economy, races, audio selection/integration, or the asset catalog. Plan 13 work in its separate folder was preserved; no Plan 13 files were edited.

## Owned files

- `src/main.js` — wires entry/return transition lifecycle, settings, current-step restoration, save/autosave and Uninstall boundaries; prevents canceled transitions from completing stale callbacks and keeps focus on the active game after entry.
- `src/ui/stage-transition.js`, `src/ui/stage-transition.css` — transition helper and focused presentation/reduced-motion behavior.
- `src/ui/settings-modal.js` — settings UI, focus containment/return, dismissal, autosave choice, save feedback and Credits disclosure.
- `src/ui/desk-view.js`, `src/ui/hud.js`, `src/ui/shell.css` — initial setup versus return-to-apartment content, Shell A canopy and persistent game controls.
- `scripts/dev/plan-19-browser-check.mjs` — isolated Chrome behavioral checks for Plan 19 paths.
- `scripts/dev/smoke-browser.mjs` — supports optional observation-output redirection while retaining its existing default output location.
- `scripts/dev/smoke-validator.mjs`, `scripts/dev/smoke-validator.test.mjs` — align the production title assertion with the accessible Quackpot heading.
- `package.json` — adds `npm run test:plan-19`.
- `reports/development/plan-19-shell-a-and-context-integration/plan-03-smoke-observations.json` — output from the existing full browser smoke, redirected here to preserve Plan 03's existing artifact.

No engine, storage schema, Receipt projection, economy, race, audio or asset catalog files were changed.

## Verification evidence

- `node scripts/dev/plan-status.js check plan-19` — `RUNNABLE` before implementation; repeated after advisor review and changes, still `RUNNABLE`.
- `npm run build` — passed.
- `npm test` — passed, 138/138 tests.
- `npm run test:plan-19` — passed in headless Chrome at 390×520. It exercised pre-setup manual save/reload, entry and focus transfer, autosave-off persistence across reload, settings dialog focus containment and return, Credits disclosure, storage failure feedback, return/reopen state preservation, cancellation when Settings opens during return, reduced-motion entry, and Uninstall during entry and return. It also checked the page request trace against the local preview origin.
- `npm run test:smoke` — passed the existing Plan 02/03 browser journeys, including local-only page requests, reload, save and storage-failure paths, modal interruptions, early Uninstall/Receipt, and autosave-off/manual save. The observation output was redirected into this packet folder; the Plan 03 artifact was preserved.
- Settings card measured 34.4–485.6 px vertically within a 520 px viewport; close button measured 44.2–88.2 px. Save, Settings, Return, and Uninstall controls were inside the 390×520 viewport.
- `git diff --check` — passed; Git emitted only line-ending normalization notices.

The preview page request trace contained only the local preview origin. Headless Chrome emitted browser-internal GCM registration/auth messages in logs; those are not page requests and no broader claim about browser-internal networking is made.

## Advisor consultation and disposition

One authorized read-only Sol reviewer consultation was used for this behavioral change. Requested model: `gpt-6-sol`. The reviewer reported runtime identity `GPT-6 (Codex)`; the specific Sol variant could not be independently verified. Posture: instruction-read-only with post-hoc verification. Consultation used two reviewer turns, with no repository edits or commands performed by the reviewer.

The reviewer identified four actionable risks: focus after entry, restoring the initial setup shell after saving before setup, persistence of autosave-off preference, and a settings/return callback race. All four were accepted and fixed. The focused browser checks exercise each path. Follow-up review found no blocking issues. No findings were rejected. The reviewer noted that the 390×520 viewport evidence does not establish behavior at other viewport sizes, zoom levels, or large-text settings.

## Limits and handoff

Evidence is from local headless Chrome at 390×520 and the existing local browser smoke. This does not establish behavior on physical devices, assistive technologies, all browser implementations, arbitrary zoom/large-text configurations, or all viewport dimensions. Reduced-motion behavior was exercised through the browser preference override; platform-specific OS behavior was not separately established. Production image/audio work and owner rendered acceptance remain outside this implementation report. Owner review is still needed before Plan 19 acceptance.

Packet status remains unchanged and no push was made.

## Repair 01 — transition geometry and Settings keyboard path

Repair implementation commit: `05f75ce`

The orchestrator returned the delivered implementation for two bounded repairs. Both were accepted: the old wide frame rotated into an upright portrait silhouette, and the Settings focus trap omitted the native Credits summary. The accidental literal `` `n `` in the header above is corrected.

### Changes

- `src/ui/stage-transition.js` and `src/ui/stage-transition.css` now use a portrait-sized frame at entry. The frame turns 90 degrees while its brand counter-rotates to remain upright; the landscape frame then expands to the visible stage area measured against the viewport. On a short screen, the overlay covers only the portion below the sticky header that is actually visible, avoiding expansion below the viewport. Absolute centering keeps the expanded frame centered even when it overflows the initial grid track. Return begins at the measured visible area, collapses while landscape, rotates to portrait, then fades. Return keeps its brand counter-rotated until the frame is portrait. Cancellation, reduced-motion/static behavior and game/save boundaries remain in the same lifecycle.
- `src/ui/settings-modal.js` includes native `summary` elements in focus order. It filters out hidden, inert, aria-hidden and closed-details descendants and includes visible focusable descendants when Credits is expanded. Existing containment and focus-return behavior remain.
- `scripts/dev/plan-19-browser-check.mjs` now drives and samples the actual Web Animations API phases in Chrome at 390×520 and 1440×900. It asserts portrait bounds, landscape orientation and upright branding, viewport containment at expansion, reverse stage/collapse/portrait geometry, and native keyboard traversal through Close → Autosave → Save → Done → Credits. It opens/toggles Credits using Enter and Space, verifies a visible expanded descendant participates in focus order, checks forward and reverse wrapping, and retains cancellation, reduced-motion, save/reload and Uninstall paths. It writes `repair-01-observations.json` and desktop PNG frames for portrait, landscape, expansion, reverse landscape collapse and reverse portrait.
- `repair-01-smoke-observations.json` records the existing full browser smoke output without replacing the Plan 03 observation artifact.

### Repair verification

- `node scripts/dev/plan-status.js check plan-19` — `RUNNABLE` before the repair; no packet status was set by the implementer.
- `node --check src/ui/stage-transition.js`, `node --check src/ui/settings-modal.js`, `node --check scripts/dev/plan-19-browser-check.mjs` — passed.
- `npm run build` — passed.
- `npm run test:plan-19` — passed in headless Chrome at 390×520 and 1440×900. At 390×520, entry sampled portrait at 71.7×127.5 px and landscape at 177.0×99.6 px; the frame expanded to 390.0×262.0 px inside the visible 390×262.1 px overlay at y=257.9–520.0, below the sticky header. At 1440×900, entry sampled portrait at 213.0×378.6 px, landscape at 525.9×295.8 px, and expansion at 1239.9×778.4 px inside the 1240×778.4 px stage. Branding stayed upright through counter-rotation. Reverse began at stage bounds, collapsed to the same 525.9×295.8 px landscape geometry, and returned to a 295.8×525.9 px portrait frame. Tab reached Credits in both viewports; Enter and Space toggled it; an expanded link fixture entered the focus order; Tab and Shift+Tab remained contained.
- `npm test` — passed, 138/138 tests.
- `npm run test:smoke` — passed the existing Plan 02/03 static-build, local-asset, reload and eight browser journeys. Output redirected to `repair-01-smoke-observations.json`.
- `git diff --check` — passed for the repair source changes and staged implementation. Line-ending normalization notices were informational only.

The first sandboxed Chrome launch failed during Crashpad startup; rerunning the local browser check with the permitted local process access succeeded. Headless Chrome logged GCM registration/authentication errors; the inspected game page request trace contained only the local preview origin. These browser-internal log messages are not described as page requests.

Advisor consultation for this smaller repair was not run, per the owner/orchestrator rule recorded in `AGENTS.md` commit `3a12d72`: the one Sol-low implementer consultation applies before delivery of main-plan work, not for smaller repair directives. The main implementation’s consultation remains documented above. The two orchestrator findings were independently fixed and verified as listed; no additional findings were rejected. No review commands or edits were performed by an advisor during this repair. Orchestrator technical review and owner rendered acceptance remain outstanding.

Repair 01 preserves the original limits: the browser evidence covers one desktop and one narrow viewport and does not establish physical-device, assistive-technology, arbitrary zoom/large-text, or broad browser behavior. Plan 13 and the root review evidence were left untouched. No packet status was changed and nothing was pushed.

Ready for orchestrator review: yes.
