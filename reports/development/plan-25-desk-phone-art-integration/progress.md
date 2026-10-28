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

Focused source tests: `node --test src/ui/apartment-view.test.mjs` passed 5/5 after the final focus-order and form-association changes. The bounded runner’s sample for this 0.524-second command occurred at startup and is not a meaningful memory peak.

Build: one monitored direct Vite build (`node_modules/vite/bin/vite.js build`) passed after the final product source changes: 58 modules transformed. Assets: `index-leWz3NUg.css` (46.27 kB, 10.04 kB gzip, SHA-256 `D9EE3C3880D5D015557813F4C63AEB93BB8B134F44740E194943B34D77F4667A`), `index-BIVrJZxZ.js` (294.30 kB, 87.15 kB gzip, SHA-256 `25FB952C9D82FF421C3E9BFC5F9D53C0378087C49F5CAA8CB9604FB497227307`), and placeholder SVG SHA-256 `F117C22731E770221E8CFD8652B0ACBCBE27A7D00A5F36832A7A5132CEE0E12F`. Its 0.536-second monitor sample was also startup-only, not a peak.

Final isolated browser lifecycle: one standard-approved Chrome run used a temporary profile, local Vite preview, ports 4174/9223, and the exact build hashes above. The bounded monitor reported exit 0, 5.907 seconds, sampled private bytes 408,440,832 (~390 MiB), no stop reason, no cleanup notes, and no stderr. Because the run exceeded the 500 ms sampling interval, this figure is a sampled observed value, not a hard memory ceiling. Post-run process inspection found no Node, Chrome, or Edge process.

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
- Full smoke, keyboard-operated focus, short-height viewport, intermediate-width render, and reduced-motion parity against normal motion remain unverified.
- An unrelated untracked `reports/development/plan-18-audio-sources-and-credits/inbox/` was left untouched.

## Ready for orchestrator review

**Yes.** Production implementation, focused tests, final build, final isolated reduced-motion lifecycle witness, screenshots, failure history, and independent reviewer dispositions are ready for root review. Root independently inspected the final desktop and narrow screenshots and accepted them as a coherent, reviewable composition; final rendered owner acceptance remains a separate gate. Packet status, owner disposition records, push, and deployment were not changed or performed.
