# Plan 25 — desk and phone artwork integration progress

## Summary

Integrated one Plan 24 extracted side-desk composition into the production opening. The scene uses the accepted scene-anchored neutral lighting and a static physical duck. The illustrated phone screen is blank; its invitation text and launch action are real HTML. The setup form keeps the duck-name and autosave controls before the phone launch action in both DOM and visible order. At viewport widths up to 720px, the phone content moves into readable document flow; at 390px and 320px the controls remain visible and the page has no horizontal overflow.

The browser/game controller, transition module, engine, storage, event log, global stylesheet, race, and Duck-Dex were not changed. The kit is imported from `src/assets/apartment/index.mjs`; no report prototype is a runtime dependency. Weather, rain, lightning, and new artwork remain outside this integration.

## State and companion mapping

- Fresh desk: `Welcome Festival`, `10 FREE pulls waiting!`, name input, enabled autosave default, and the existing `btn-start-app` submit action.
- Return desk: `Welcome back`, current companion name, and `Open Quackpot` action.
- Entry and return continue through the existing `main.js` controller and stage-transition lifecycle. No new progression, save schema, cue, or reward behavior was added.
- New runs default to the supported classic-yellow companion identity; the prior style selector was removed. Saved legacy `pirate-hat` and `cyber-visor` values are retained in the existing companion state/callback and are not migrated. The extracted kit renders generic static physical duck art; it does not draw hats or visors. This presentation fallback is the explicit Plan 25 gate decision and must not be read as visual support for those styles.

## Files changed and artifacts

- `src/ui/desk-view.js` — production desk composition, real HTML phone action, setup form semantics, returning state, and saved-style preservation.
- `src/ui/desk-phone.css` — no change; the existing legacy rules are unused by the new rendering.
- `src/ui/apartment-view.mjs` — focused adapter to the accepted Plan 24 desk scene and fresh/return phone copy.
- `src/ui/apartment-view.css` — isolated scene sizing, phone overlay and responsive phone-content flow.
- `src/ui/apartment-view.test.mjs` — five focused tests for scene/state mapping, form IDs and association, setup-before-action order, and saved-style callback preservation.
- `src/main.js` — one stylesheet import; existing controller wiring and transition flow are unchanged.
- `reports/development/plan-25-desk-phone-art-integration/browser-lifecycle.mjs` — isolated bounded Chrome lifecycle witness; records build asset hashes and browser facts, and archives bounded startup diagnostics on failure.
- `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1` — external per-process validation guard; this file is intentionally not part of product runtime.
- `reports/development/plan-25-desk-phone-art-integration/browser-lifecycle.json`, `desk-desktop.png`, `desk-narrow.png` — final successful reduced-motion browser record and screenshots for the final build.

Scoped source/evidence commit: `6b88603` (`Implement Plan 25 desk and phone integration`). The progress report is being committed separately as the final implementer commit.

## Validation and evidence

Packet preflight: `node scripts/dev/plan-status.js check plan-25` returned `RUNNABLE` before production mutation. Packet status was not edited.

Focused source tests: `node --test src/ui/apartment-view.test.mjs` passed 5/5 after the focus-order, form-association, and wide-scene layout changes. After the recorded build and browser witness, root requested one final static copy edit (`Your rubber duck rests beside your phone.`); it changes no behavior, so no rerun was requested. The bounded runner’s sample for this 0.524-second command occurred at startup and is not a meaningful memory peak.

Build: one monitored direct Vite build (`node_modules/vite/bin/vite.js build`) passed after the focus-order, form-association, and wide-scene layout changes: 58 modules transformed. Assets: `index-leWz3NUg.css` (46.27 kB, 10.04 kB gzip, SHA-256 `D9EE3C3880D5D015557813F4C63AEB93BB8B134F44740E194943B34D77F4667A`), `index-BIVrJZxZ.js` (294.30 kB, 87.15 kB gzip, SHA-256 `25FB952C9D82FF421C3E9BFC5F9D53C0378087C49F5CAA8CB9604FB497227307`), and placeholder SVG SHA-256 `F117C22731E770221E8CFD8652B0ACBCBE27A7D00A5F36832A7A5132CEE0E12F`. The JS hash and screenshots predate the final copy-only edit above. Its 0.536-second monitor sample was also startup-only, not a peak.

Latest isolated browser lifecycle witness: one standard-approved Chrome run used a temporary profile, local Vite preview, ports 4174/9223, and the exact pre-copy-edit build hashes above. The bounded monitor reported exit 0, 5.907 seconds, sampled private bytes 408,440,832 (~390 MiB), no stop reason, no cleanup notes, and no stderr. Because the run exceeded the 500 ms sampling interval, this figure is a sampled observed value, not a hard memory ceiling. Post-run process inspection found no Node, Chrome, or Edge process.

The same run verified fresh invitation state, the HTML submit action, entry, autosaved reload restoring `Ada` and `classic-yellow`, return to the desk with `Welcome back`, and visible return action. It used reduced-motion emulation. At 1280×800 the scene measured 818×460 CSS px and no horizontal overflow was observed. At 390×520 the scene measured 332 px wide, the return CTA measured 286×44 px and was visible, and there was no horizontal overflow. At 320×568 the CTA remained visible and there was no horizontal overflow. I visually inspected both final screenshots: the desktop art fills the wider desk card and keeps phone copy readable; the narrow version keeps the art full width and presents the phone invitation/action in a scroll-flow panel.

Coverage limits: the browser witness did not exercise a keyboard-driven tab sequence, actual assistive technology, non-reduced animation behavior, short-height viewport, or the 561–720 px intermediate range. The code and focused test establish DOM order, but do not substitute for a mounted keyboard observation. Narrow screenshot shows the returned desk; fresh desk was checked during the same run and appears in the desktop screenshot.

### Full smoke attempt record

The broad repository smoke was not completed against final source. Attempt 1 completed all eight journeys, then failed to save its archive because the requested report folder did not yet exist (`ENOENT`). Attempt 2 failed during Journey 6 with a 6-second CDP `Runtime.evaluate` timeout and reported `EPERM` while cleaning its temporary Chrome profile. Attempt 3 was still running when the user stopped Codex processes during the Node memory incident; its final result is unknown. No attempt was retried after the explicit resource hold. These attempts are environment/harness evidence only and do not establish a Plan 25 failure or a complete smoke pass.

## Terra-medium review disposition

One post-implementation, read-only reviewer was requested as `gpt-6.1-terra` at explicit medium. The reviewer could not independently observe or verify its exact model identity/effort; record the requested setting and the observed setting as **unverified**, not confirmed. Effective posture: instruction-read-only. An immediate `git status --short` after the consultation showed the already-present Plan 25 files plus the unrelated Plan 18 inbox; the reviewer made no edits. One consultation pass ran; elapsed time/cost was not measured.

1. **Accepted and repaired — keyboard focus order.** Reviewer found the launch submit button preceded name/autosave controls. The controls now precede the art and associated phone submit action in both DOM and visible flow. A focused test asserts the order and form association.
2. **Accepted and repaired — phone legibility at intermediate/mobile widths.** Reviewer found very small/clippable text around the old 560 px breakpoint. The phone content now moves into flow through 720 px; the desk scene is no longer capped by the setup form width; text has readable minimum sizes and the launch target is at least 44 px high. Final 390 px browser evidence supports the narrow path; 561–720 px remains unmeasured.
3. **Rejected as already resolved by the root gate — legacy style visibility.** Reviewer asked whether stored pirate/visor styles must appear visually. Root explicitly approved preserving those stored values with generic static physical art as a presentation-only fallback, with no art redraw or data migration. This implementation preserves values; it does not claim the extracted art depicts either accessory.

No reviewer approval is treated as packet completion or owner acceptance.

## Problems, risks, and follow-ups

- Restricted Chrome launch failed before page load in an earlier attempt. The approved standard execution mode then successfully launched the final isolated witness. The harness now captures bounded Chrome stderr and exit status, records target-discovery failure details and build hashes, checks its fixed ports, applies bounded HTTP/WebSocket/CDP deadlines, and cleans up only its owned browser/preview processes.
- The user reported a Node process reaching approximately 21 GB and terminated Codex/Node processes. The cause was not established. All later authorized process launches were serial under an external guard with a task-local 1 GiB Node heap, 90-second wall limit, and 2 GiB sampled owned-tree private-memory threshold. The 64 MiB PowerShell positive control was sampled at 104,296,448 bytes; this supports the monitor’s ability to observe a sustained touched allocation but does not make its 500 ms sampling interval a hard limit.
- The extracted scene uses generic static duck art. Legacy accessory values remain persisted but are not visibly drawn; owner review should acknowledge that contract.
- The initial implementation witness did not cover keyboard operation, the 561–720 px range, short heights, or normal-motion parity; the approved follow-up now checks keyboard operation, 640/390/320 px layouts, and normal/reduced/manual motion. Full repository smoke and actual assistive-technology behavior remain unverified.
- An unrelated untracked `reports/development/plan-18-audio-sources-and-credits/inbox/` was left untouched.

## Owner-approved Plan 25 follow-up (2026-10-28)

Root approved a bounded extension after rendered owner review. The phone receives a CSS overlay whose only animated property is opacity: 0.16 static baseline to 0.4 peak and back over 3000 ms with ease-in-out. The glow controller starts it only for an active, visible, observable desk; it cancels back to the baseline when manually disabled, reduced motion is requested, the page is hidden, the element is offscreen, the desk is inactive, or the view is destroyed. If `IntersectionObserver` is unavailable, it stays static. The physical duck and extracted apartment kit remain unchanged.

Settings now exposes **Animate phone glow**. Its preference is session-local and does not alter the save schema. At widths up to 720 px, the glow stays inside the HTML phone invitation panel. A responsive regression was found and repaired: switching the panel to `position: relative` had left its desktop `left: 64.5%` and `top: 20%` offsets active. The narrow rules now reset its inset to `auto` while retaining the glow's positioning context.

The gacha starter copy is “Your first flock starts here. Ten free pulls—meet your racing team.” The motion toggle sits after Reveal All, stays present after all reveals, uses pause/play icons with dynamic action labels and titles, has `aria-pressed`, a 44×44 px target, and an accessible explanation while reduced motion disables it.

Follow-up source ownership was limited to `src/main.js`, `src/ui/apartment-view.css`, `src/ui/desk-view.js`, the new ambient glow controller and tests, `src/ui/settings-modal.js`, `src/ui/gacha-view.js`, `src/ui/duck-motion-controller.mjs` and its tests, and `src/ui/duck-motion.css`. No global CSS, engine, storage, event log, art-library, race, Dex, weather, or new-art files changed. No second Terra-medium review was run; the one allowance was used for the main integration.

### Follow-up validation

- Packet preflight had returned `RUNNABLE: plan-25 is ready to implement`; status remains `in-progress`.
- Focused tests passed 15/15 after the responsive inset repair: ambient-glow lifecycle blockers and teardown, disabled visibility fallback, overlapping reduced/manual blockers, late callbacks after destruction, gacha motion-controller state and apartment mapping. The bounded run exited 0 in 0.533 s; sampled owned-tree private memory was 1,867,776 bytes (a short startup sample, not a peak).
- Direct Vite build passed after the inset repair: 59 modules, 0.203 s build time; assets are `index-B2hAeyck.js` (SHA-256 `ec3ac054e4c101f681c8aedd7637779de7547385ee9f18724434310b1610a36c`) and `index-C5uq8mod.css` (SHA-256 `66f4029709bd6696f0cd78eed9083765ea3ddff867c642e512c9dea868e48a01`). The isolated browser record also hashes the placeholder SVG. The bounded runner exited 0 in 1.055 s; sampled owned-tree private memory was 380,243,968 bytes.
- A separate keyboard probe against the preceding build captured trusted Enter keydown/keypress/click/submit/keyup for both a native form positive control and the phone action. The product button was enabled, focused, associated with `desk-companion-form`, and its Enter submit transitioned into gacha. The bubble submit event showed `defaultPrevented: true`, as expected from the existing handler. The run exited 0 in 6.056 s; sampled private bytes were 408,543,232. The final full witness then repeated Enter on the post-inset build.
- Final targeted browser witness passed against the exact build hashes above. It verified the 3000 ms normal-motion glow progression, reduced-motion and manual static baselines, manual resume, Settings focus restoration, Tab order and Enter launch, save/reload/return, copy, pause/resume icon and ARIA updates, Reveal All placement and post-reveal persistence, and reduced-motion duck parity with 10 shells/90 live animations before reduction and zero after. The toggle measured exactly 44×44 px.
- The final width checks used `mobile: false` so CSS media queries used the requested `innerWidth` values: 640, 390 and 320 px. Chrome reserved a 15 px vertical scrollbar; `clientWidth`/`visualViewport.width` were therefore 625, 375 and 305 px. At all three widths `scrollWidth` matched `clientWidth`, and the phone panel and scene stayed within those content bounds. At 390 px the phone panel measured 299 px wide and the CTA measured 271×44 px. At 320 px the phone panel measured 231 px and the CTA 205×44 px. The short 520/568 px heights place the CTA partly below the initial viewport in normal document flow; it remains reachable by vertical scrolling. The narrow screenshot confirms the phone content no longer shifts outside the desk card.
- The final browser run exited 0 in 8.197 s; sampled owned-tree private bytes were 494,325,760, below the 2 GiB sampled threshold; no stop reason or cleanup notes were reported. Pre/post inventories found no Node/Chrome/Edge processes and ports 4174/9223 were free. The 500 ms sampling guard is not a hard peak-memory cap.

### Validation history and limits

Several early targeted browser runs stopped on harness defects, not on product behavior: CDP serialized `Infinity` as `null`; reduced-motion state was sampled before media-query delivery settled; starter copy was queried after Claim removed it; an Enter probe omitted the CDP text fields; and the final record once referenced the wrong variable after all assertions had run. A separate probe verified the trusted Enter path. The first exact-width assertion also conflated `innerWidth` with `clientWidth` when Chrome reserved its scrollbar. Each harness issue was diagnosed and corrected before the final successful witness. The raw last failed attempt remains in `browser-lifecycle-failure.json`; `browser-lifecycle.json` is the final successful record.

The refreshed full `npm test` and legacy eight-journey `npm run test:smoke` were not run under the resource-bounded authorization. Actual assistive-technology behavior was not tested. The screenshots were inspected after the final exact-width run. Root independently inspected the updated narrow screenshot and measurement record, confirmed the rightward layout defect is repaired, and accepted vertical scrolling at the tested short heights. The 3-second timing is verified from the active Web Animation; opacity progression samples span about one second rather than a full measured cycle. The normal document scroll is required to reach the bottom portion of the invitation at the tested short heights.

## Ready for orchestrator review

**Yes.** Production implementation, focused tests, final build, final isolated lifecycle witness, keyboard probe, screenshots, failure history, and the prior independent reviewer dispositions are ready for root review. Root's rendered narrow-screen review confirmed the rightward-overflow repair. Final owner acceptance of the new phone-glow appearance, starter copy, and compact motion control remains a separate gate; Plan 25 stays in progress. Packet status, owner disposition records, push, and deployment were not changed or performed.

## Owner-directed phone light spill repair (2026-10-28)

Orchestration approved a focused lighting repair after rendered owner review found that the prior halo did not visibly illuminate adjacent surfaces. The repair uses a dedicated art-only 16:9 `.apartment-art-frame` around the extracted SVG and scene-anchored light layer. This keeps the spill aligned to the illustrated phone when `.apartment-phone-content` moves into document flow at widths up to 720 px. The layer is between the SVG and readable HTML. Its fixed gradients form a phone-edge pool plus softer desk/wall spill; only the layer opacity animates from 0.28 to 0.62 and back over 3000 ms. CSS geometry is clipped to the art frame. The settings control and static baseline lifecycle are preserved. The physical duck is not animated or given a visible emissive effect.

Files changed for this repair:

- `src/ui/desk-view.js` — introduce the art-only frame and place the scene-anchored glow above the SVG and below the HTML phone controls.
- `src/ui/apartment-view.css` — size/clip the art frame, keep the narrow invitation in flow, and define the tight blue edge plus localized soft gradients.
- `src/ui/ambient-glow-controller.mjs` — animate only opacity with the approved 0.28 / 0.62 / 0.28 values; retain existing visibility, reduced-motion, manual, inactive, and destruction blockers.
- `src/ui/apartment-view.test.mjs`, `src/ui/ambient-glow-controller.test.mjs` — assert layer ordering and animation values/lifecycle.
- `reports/development/plan-25-desk-phone-art-integration/browser-lifecycle.mjs` — extend the single isolated witness to capture matched minimum, peak and static views, and verify spill geometry remains anchored to the art frame on desktop and narrow layouts.
- `reports/development/plan-25-desk-phone-art-integration/browser-lifecycle-failure.json` — retain the failed final browser attempt diagnostics.

Scoped source/evidence commit: `f008fe8` (`Add scene-anchored phone light spill`).

Validation for the repair:

- Packet preflight through `bounded-node-run.ps1` returned `RUNNABLE: plan-25 is ready to implement` (exit 0; sampled owned-tree private bytes 1,343,488; no stop reason).
- Focused UI tests through the guard passed 7/7 (exit 0; 0.529 s; sampled owned-tree private bytes 1,863,680; no stop reason). One earlier focused run had a test-only regex mismatch because the extracted SVG includes a production-prefixed class. The assertion was corrected to allow additional class names, then the focused suite passed.
- Vite build through the guard passed with 59 modules (exit 0; 1.055 s; sampled owned-tree private bytes 381,456,384; no stop reason). Assets: `index-B9GTazJy.js` SHA-256 `5e7bb055a351de9ce883f69d9f91ad56367ed0f2f47587c283fd819c72c8981b`; `index-IHRjW_xF.css` SHA-256 `cb56083951aed5d70336d32a7ddbb87e2a3eade6d59df3af9f36ad266d0c0bfc`; placeholder SVG SHA-256 `f117c22731e770221e8cfd8652b0acbcbe27a7d00a5f36832a7a5132cee0e12f`.
- The first isolated browser attempt used default restricted execution and exited before page load: Chrome code `4294930433`; stderr reported a crashpad `TransactNamedPipe` failure and `crash server failed to launch`. The guard reported exit 1, sampled owned-tree private bytes 142,372,864, no stop reason, and no cleanup notes. Orchestration confirmed this startup issue had previously cleared with standard elevated execution and authorized one retry. The single elevated retry used the same bounded harness and temporary-profile lifecycle and passed: exit 0 in 8.701 s, sampled owned-tree private bytes 519,409,664, no stop reason, no cleanup notes. Post-run inventory found no Node or Chrome process and ports 4174/9223 free.
- The successful browser witness recorded a 3000 ms infinite opacity animation; five normal-motion samples progressed from 0.280 to 0.438. Programmatic time positioning observed 0.280 minimum and 0.620 peak. Reduced motion and manual-off each produced 0.280 with zero active animation; re-enabling restored the 3000 ms animation. At 1280×800, the art frame and light layer both measured x=224.5, y=326.58, width=816, height=458.125 in minimum and reduced-motion states. At 640 px, the frame ratio was 16:9 and the spill matched the art frame. At 390 px, the same art-relative anchoring held while the invitation remained in document flow; page width was 375 CSS px for a 390 px inner viewport, with no horizontal overflow and a 271×44 px action. The 320 px path retained a 205×44 px action and no horizontal overflow.
- Matched 1280×800 minimum, peak, and static screenshots were captured and visually inspected: `desk-light-min.png`, `desk-light-peak.png`, and `desk-light-static.png`. They show a visible blue pool on the wall around the phone/window edge and across the nearby desk toward the right-side books/planter. The phone copy and action remain readable over the light; the physical duck stays visibly unchanged. The static screenshot includes the launch button's keyboard focus ring because keyboard order had just been exercised; scene, viewport, and illumination framing are the same, but this control outline is a small presentation difference in the comparison.
- The initial restricted-mode crash is retained in `browser-lifecycle-failure.json`; the successful run is recorded in `browser-lifecycle.json` and carries the same production build asset hashes listed above. The focused browser scope also verified Settings focus restoration, Tab/Enter launch, save/reload/return, starter copy, and the accepted gacha motion control behavior.
- The one authorized Terra-medium reviewer was already used for the main integration; no second reviewer or full smoke was run. No weather, new artwork, full suite, push, or deployment was included.

## Current delivery status

The code passes the focused tests and build. The successful isolated browser run and matched screenshots demonstrate a static visible baseline, stronger peak, phone-screen-adjacent wall/desk spill, readable HTML phone controls, and narrow art-relative anchoring. **Ready for orchestrator and owner rendered review; final owner acceptance is not recorded here.** The existing Plan25 packet status remains orchestrator-owned and unchanged.
