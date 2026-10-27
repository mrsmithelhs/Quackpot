# Plan 23 isolated preview browser observations

**Date:** 2026-10-27 (America/New_York)

**URL:** `http://127.0.0.1:5181/Quackpot/reports/development/plan-23-production-race-integration/drama-preview-01/preview.html`

**Browser:** new Codex in-app browser tab in the authorized isolated preview context; the owner's Chrome tab was not used. Existing local server answered the URL. This work did not start, stop, or terminate the server.

## Desktop — 1280 × 720 CSS px

- The race view, selected risk-only candidate, matched race seed, six-duck grid, line-crossing result and controls rendered. Initial selected candidate was Sprint mean ×1.00 ±20%; Common Tutorial/R01 at authored rating 10 and rested factor 1 resolved to a 21.62 s simulated crossing plus the 2 s playback highlight.
- Scenario controls preserved the same seed while changing input/mode. The Rare Finale/R03 zero-races-tired case showed authored rating 14 × rest factor 0.50, Safe ±5%, a distinct Plan 17 +5% input, and a real crossing. On the first validation seed with Safe + trial, the affine baseline resolved in 21.36 s and R2combined in 21.34 s; the selected risk-only model used the same mechanical outcome as R2combined for Safe because its Sprint mean change is stance-specific.
- `Next validation seed` advanced from `plan23-drama2-val-01` to `plan23-drama2-val-02`; there is no free-form seed selection. Mode changes retained scenario, stance, trial and seed.
- Start, pause (observed at tick 5.5–6.6), resume, Skip to finish and same-race restart worked. The committed summary remained unchanged through presentation controls. Skip disclosed the six finish places and full event archive with no claimed mechanics or RNG rerun.
- Event seeking selected the recorded duck-contact at tick 25 / 1.25 s, paused at the post-event state, and showed concise text limited to the recorded contact and trajectory. Restart returned to the same committed race playback.
- Static/reduced motion presented five fixed checkpoints at 0%, 25%, 50%, 75% and 100%, followed by the actual finish; event seeking remained available as a still. Reduced mode showed no animated zoom/lighting/slow motion.
- The two-second highlight is included in the displayed maximum playback duration separately from simulation finish time (for the tired R2 risk-only witness, 21.48 s simulated + 2.00 s presentation = 23.48 s maximum playback). This does not change the validation timing criterion.

## Narrow — 390 × 844 viewport override

- Browser-reported layout viewport: 390 × 844; CSS `innerWidth` was 375 after the browser scrollbar. Document and body scroll widths both equaled their client widths (375 px); no horizontal page overflow.
- Race stage measured approximately 306 × 172 px with clipped SVG projection and one-column race layout. Model controls occupied their 306 px container without horizontal overflow. The six-column mechanical event table remains horizontally scrollable inside its own log container.
- The narrow check exposed intrinsic-width overflow in the filter/control flex row. A preview-only media-query fix constrains full-width controls and buttons under 560 px; the post-fix measurement reports no document-level overflow.

## Console and repairs

- The first tab had loaded a stale manifest before the zero-race preset was added, and the first contact/restart interaction exposed a report-preview animation cache bug. The page was reloaded after regenerating the 72-witness manifest; the bug was fixed in the preview controller by cancelling the cached `Animation[]` and retaining one impact animation per event instead of recreating it each frame.
- A new browser tab loaded the final files with **zero console errors or warnings**. Pause/resume, skip, contact event seek, same-race restart, five static checkpoints, finish and event seek from static view all passed in that clean tab. The separate model harness reports 72 first-seed parity witnesses across six presets, two stances, two trial states and three modes.

## Limits

These observations apply only to the report-only preview in this browser. No production source, save/reload, schema migration, Receipt output, reward idempotency, hardware screen reader, physical device, audience response, or deployed site was exercised. The model timing evidence is the 20-seed offline validation reported in `../drama-study-02/README.md`; browser playback is not a new timing-distribution study.

## Owner podium-size and track-lighting refinement — 2026-10-27

**Browser:** QP Orch-authorized isolated in-app preview tab. The desktop viewport was set to exactly 1280×720 CSS px; the same tab was then checked with a 390×844 viewport override. The viewport override was reset and the isolated tab closed after capture, releasing the browser slot. The owner Chrome tab and existing Vite server were untouched.

- **Desktop layout:** the race SVG measured 698.1×387.8 CSS px at (99.6, 64.4). The finish-line segment occupied y=112.5–145.8; all six finishing ducks occupied y=102.2–185.9. The podium labels began at y=325.0 (winner), 340.5 (second), and 352.9 (third), leaving at least 139 CSS px between the last duck’s lower edge and the first podium label. No racer was covered or clipped.
- **Rendered result cards:** each podium card measured 195.5 CSS px wide. Label areas measured 195.5×97.7 CSS px, with 22px computed desktop text (about 17px after SVG viewport scaling). All displayed names, placements, and Gem amounts fit without overflow. The 1280×720 viewport screenshot showed the whole track, finishers, enlarged podium, controls, and result summary.
- **Narrow layout:** at 390×844, the CSS layout viewport was 390px and the race SVG measured 300.8×167.1 CSS px. Podium labels measured 84.2×42.1 CSS px; the declared 24px text scales with the SVG to about 8.0px on screen. The three actual labels had no content overflow, but label text is materially smaller than the desktop result and remains a narrow-screen readability limit. This check did not exercise a physical phone or browser zoom setting.
- **Lighting and contrast:** the result layer’s computed fill was `rgb(7, 25, 37)` at 0.52 opacity and its even-odd path matched only the track ring. Over the original `#327987` track, the approximate blended color is `#1c4754`. The pond, racers, finish line, podium, and cards were not darkened. The cream `#fffdf5` card with `#162b38` text has 14.35:1 WCAG contrast; Gem text `#664f20` on the cream card has 7.63:1. These are calculations from authored sRGB values, not instrument readings.
- **Scope:** this visual-only refinement kept finish timing, order, reward display, reveal trigger, and mechanics unchanged. The frozen 1,440-case model audit and lifecycle were not rerun. No reduced-motion checkpoint, production flow, user study, or screen-reader/device check was repeated in this narrow visual turn; earlier static behavior remains documented above.

## Owner follow-up: whole-environment drama and podium loops — 2026-10-27

**Browser:** QP Orch-authorized isolated in-app tab at 1280×720 CSS px. The one browser slot was used for this follow-up, the viewport override was reset, and the tab was closed afterward. The owner Chrome tab and local Vite server were untouched. This follow-up did not repeat the narrow viewport check.

- **Lighting:** replaced the prior oval-only overlay with the existing dramatic-motion filter, exactly `brightness(0.43) saturate(0.75)`, on the environment group. DOM inspection confirmed the pond and shore are inside the filtered group, while finish-line markings and the podium layer are outside it. The finished screenshot showed a dim pond, shore, and track behind bright ducks, podium, labels, and Gem awards. No second overlay remains. During the final reveal, the computed filter progressed toward the target; pausing at playback 24.9/25.67s held it at `brightness(0.771199) saturate(0.899649)` for 550ms. Resume continued the transition to the settled target filter.
- **Motion roles and identity:** the podium contains three unique report-only rig prefixes. The winner uses `graceful-bob`; second and third use `paddle`, each through the existing Plan 20 controller. Computed shell/head/wing transforms changed over 650ms before pause. A repeated Skip left exactly three duck shells and one controller toggle, with no duplicate loop instance.
- **Skip and finished-race control:** normal-motion Skip settled the podium without the entrance but started ambient loops. The presentation record distinguishes `entranceSkipped` from `ambientMotion`. Pausing the ambient loops, invoking Skip again, and inspecting the state preserved **Resume podium motion**. After natural completion, the new button paused all sampled transforms for 550ms and resumed them while the race status remained **Race complete**.
- **Race pause during reveal:** with podium loops active, the regular race Pause held the loop transforms and whole-environment filter unchanged over 550ms. Resume continued both. Playback then reached its normal completed state and ambient loops remained active independently.
- **Reduced motion and cleanup:** reduced motion hid the podium-motion control, destroyed the separate loop controller, left the ducks in neutral poses for 550ms, and kept the settled environment filter. Changing scenario cleared the podium and reveal class. Restart cleared the old podium before same-race playback. Seeking after completion to Rival A’s 21.94s crossing hid the podium, removed the result filter, hid the podium-motion control, and enabled **Resume race** from that event.
- **Diagnostics and limits:** the isolated tab captured no console errors or warnings. `node --test src/ui/duck-motion-controller.test.mjs` passed 8/8, including existing user-pause, reduced-motion, visibility/offscreen, and teardown coverage for the reused controller. This does not constitute a separate browser `document.hidden` simulation. No production source, model values, numerical audit, save/Receipt/reward path, full project suite, physical-device/assistive-technology check, or user study was part of this follow-up.

## Camera zoom repair — 2026-10-27

**Browser:** authorized isolated Codex in-app browser tab at 1280 × 720 CSS px. The owner’s Chrome tab was not used. Existing localhost server was left running; this repair did not start or stop it. The isolated IAB tab was closed after the checks to release the browser slot.

- **Diagnosis and default:** the zoom renderer was already called on each runner render, but the select defaulted to `Locked wide`, which forces scale 1. The camera control now defaults to **Eased close mid-race, then wide**. **Locked wide** remains an explicit option. The note explains that reduced-motion mode remains wide.
- **Playback easing:** the same committed race began at tick 0 with `matrix(1, 0, 0, 1, 0, 0)`. At tick 67 it remained wide; at tick 167 it measured scale 1.0988, at tick 180 scale 1.1589, and near tick 208 scale 1.1600. These ordered intermediate samples show a ramp into the close view rather than a single snap. Skip to finish returned to the identity matrix.
- **Pause and restart:** pausing at tick 167 held the `matrix(1.0988, 0, 0, 1.0988, -224.28, -134.26)` transform unchanged across a further 500 ms sample. Restart returned to identity at the start of the same race.
- **Event seeking:** selecting the recorded event at tick 163 paused in its post-event state at scale 1.0708. Selecting the recorded tick-38 contact returned to the wide identity transform, consistent with the early-race schedule.
- **Static/reduced motion:** switching modes at tick 163 returned to identity. Identity remained at the current 38% position and the 50%, 75% and 100% static checkpoints. The ordinary finish also returned to identity.
- **Locked wide and unchanged mechanics:** explicit **Locked wide** remained identity at tick 205.8. The diagnostic committed-resolution fingerprint was `296539:9b0cce44` at start, playback, pause, event seeks, reduced/static checkpoints, restart, skip and Locked wide. The displayed result summary stayed `21.62 s + 2.00 s playback highlight = 23.62 s max playback` throughout.
- **Console:** zero captured warnings or errors in the isolated tab.

This verifies report-preview camera presentation only. It does not exercise production race integration, game save/reload, Receipt projection, or reward idempotency.

## Individual crossings and concurrent podium reveal — 2026-10-27

**Browser:** isolated Codex in-app browser at 1280 × 720 CSS px, using the already-running localhost preview. The owner’s Chrome tab and server lifecycle were untouched. This report-only browser slot was reserved by QP Orch for this continuation.

- Selecting **Selected candidate · individual crossing order** resolved the same committed seed `plan23-drama2-val-01`, Tutorial/Common/R01, Sprint, selected rank-weighted weave + strong contact and risk-only Sprint mean. It retained the original Player winner at 21.62 s and continued the field through the final genuine crossing at 22.67 s. The six actual crossing times were 21.62, 21.94, 22.10, 22.14, 22.49 and 22.67 s. The final order was Player, Rival A, Rival B, Rival C, Rival E, Rival D; top-three payouts shown were 50, 20 and 10 Gems. The historical same-instant mode remains separately available.
- **Skip to finish** showed the settled podium, full crossing-time order and payouts immediately. The action message says no mechanics or RNG were rerun. It showed a settled display rather than recording the slide as watched.
- A same-race replay reached the last-crossing presentation boundary at about 24.8 / 25.667 s of playback. The podium was visible and scene-light overlay computed opacity was 0.34 while podium text and course labels remained available. Pausing there held the HUD tick, podium bounds, runner transform and overlay opacity exactly across a further 500 ms sample. Resume completed the remaining coast/reveal interval and reported all ducks crossed, first at 21.62 s and last at 22.67 s. The final result list remained unchanged.
- Reduced-motion mode used the five static 0%, 25%, 50%, 75% and 100% checkpoints. At 100%, it showed the settled podium and settled lighting with no descent; status and controls reported race completion. The fixed-wide static view had no animated camera, event lighting or slow-time effect during the race.
- Captured browser diagnostics for this tab contained zero warnings or errors after these interactions.

This is presentation evidence for a single report-only witness. The 1,440-case offline causal-parity and tail-validation evidence is in `../individual-finish-validation-results.json`. No production model, save, Receipt, reward path, packet status or deployed browser was tested.

## Resolver/presentation boundary repair — 2026-10-27

**Browser:** QP Orch-reserved isolated preview tab using the already-running localhost server. The visible Chrome window was 1525 × 814 px; this continuation did not establish 1280 × 720 CSS-pixel behavior. No other page or owner Chrome tab was used.

- **Reduced/static sequence:** selecting Static / reduced motion and starting the selected individual-crossing result showed fixed checkpoints at 0%, 25%, 50%, 75%, and 100% of the same committed race. At 100% the status reported all six ducks crossed (Player first at 21.62 s; last at 22.67 s), the settled podium was present, and the displayed summary retained the two-second highlight and overlapping one-second coast/reveal timing. This check observed the 100% completed state after refreshing the browser tree; it did not inspect every podium transition frame.
- Earlier in this authorized continuation, normal playback showed no podium at approximately 18.9 seconds, before the last crossing. Skip to finish showed the settled crossing order and payout summary without a mechanics/RNG rerun. The browser was not held at the animated reveal boundary for a new pause/resume measurement in this continuation.
- **Limits:** this continuation does not add evidence for event-linked seeking, restart/replay, intermediate camera easing, reveal pause/resume, or 1280 × 720 layout. Those interactions were recorded in earlier authorized preview sessions above; this repair's direct timer/camera boundary tests and source checks are reported separately in the Plan 23 progress note. No production code or lifecycle behavior was exercised.

## Completed-race event seek and replay repair — 2026-10-27

**Browser:** QP Orch-authorized isolated in-app preview tab at the local report-only URL. The dedicated tab was closed after these checks, releasing the slot; the existing local server and owner browser were not changed.

- After natural playback completed, the six-duck podium and crossing-order summary were visible. Selecting the committed **Rival E finish crossing at 22.49 s / tick 449.849** hid the podium and lighting, moved the view to that event’s post-event state, and enabled **Resume race**. The selected result remained the same committed seed and order.
- Resuming continued from tick 449.849. The final crossing triggered the podium and lighting reveal; while that reveal was active, **Pause** left playback resumable at simulation tick 454. The presentation-action log recorded the event seek, resume, podium/reveal start, and pause in that order. Resuming completed the coast/reveal and returned to the same full result.
- **Restart same race** reset playback to tick 0 while retaining the committed race. **Skip to finish** immediately restored the settled podium and reported that mechanics/RNG were not rerun. After restart, Static / reduced motion showed the fixed 25%, 50%, 75%, and 100% checkpoints; 100% showed the settled podium and completed result.
- The rendered podium remained legible during the paused reveal. This browser check does not claim production integration, save/reload, Receipt, rewards, or broader viewport/device coverage.
