# Plan 26 Stage C — source review and bounded continuation
Date: 2026-10-28. Root review plus one requested gpt-6.1-terra / medium read-only child; child cannot independently observe model/effort. No Node, browser, tests or builds run during this review. Implementer counts62/151/311 remain reported evidence, not newly reproduced.

## Curve disposition
Accept the proposed report-only curve for diagnostic work: one linear pulse, 0 at0ms, peak120ms, neutral600ms; window0.18/room0.08 cool overlays; unchanged stills/kit/production. Analytic lifts are hypotheses, not composite measurements. No stronger effect, extra pulse, audio or production adoption. One shared page arbiter and existing blockers remain binding.

## Required small repairs
1. controller.mjs requestFlash consumes a ticket before effect.start, then returns refused if start throws; budget/stats already count acceptance/cancellation. Preserve outcome honesty. Prefer returning the accepted ticket with immediate cancelled/effect-start-failed outcome (and no successful visual claim), rather than calling this a budget-free refusal. Keep pre-eligibility refusals before the arbiter and consuming no budget. Document/test this boundary explicitly; do not add an unsafe cooldown refund after a partially visible effect.
2. flash-harness.js aggregate rasters the full #grid, not the viewport. Label it grid-level diagnostic and include exact extent/crop, or implement actual viewport composite. Do not call a larger offscreen grid a verified whole-viewport result. Total pixels divided by21824 is only a coarse diagnostic; it does not find maximum flashing area within any341x256 reference field. Relabel rather than build a conformance analyzer for this packet. No area-based pass claim.
3. neutralAfterCancel compares frozen rain against restarted moving rain. Isolate flash restoration with identical frozen rain time/state for both comparisons, or report DOM overlay removal separately and withdraw the pixel-equivalence claim.
4. Overlay blue-white alone does not establish the rendered composite cannot involve red transitions. Remove categorical “red flash not applicable” output; label that analysis unperformed or analyze actual composite colors. No certification or measured exclusion inferred from chosen fill.
5. Preserve cancellation reason if watchdog fires, or correct the mechanism to say callers receive effect-aborted. Never report finished for cancellation.

## Bounded browser permission after source fixes
After recording those corrections, a coordinated isolated Claude harness browser turn is granted for this report-only gallery, initially with lightning disabled. No takeover of owner/Codex browser/storage, no shared-server restart. Confirm the page can be reached; if server is absent, ask root rather than starting Node. This permission does not authorize Node processes, extra subagents or repeated failing launches.

First verify blocker/refusal paths and run ONE deterministic positive-control capture with the animation held, not a live repeated-flash sequence. Positive control must establish baked computed opacity changes the composite, raw clones are blind, and capture matches visible scene geometry/colors. If it fails, stop measurement and repair the method; don't claim zero effect.

Bound raster dimensions, frame count and memory before full sampling. Single scene at a time; avoid retaining dozens of full-grid RGBA/luminance frames and canvases. Prefer streaming extrema/summary accumulators and small region series, release image/canvas data after use. Record raster CSS-scale relationship; downscaled diagnostics cannot establish original-scale area. Stop on unexpected memory growth or stalled page; no blind retry or full-suite sweeps. The recent21GB Node cause remains unknown.

If positive control passes and source fixes are complete, continue deterministic one-scene curve sampling including peak/both transitions, then one bounded grid aggregate. Do not disable cooldown except the documented measurement-only watchdog hold; restore all temporary hooks in finally. Restore rain to neutral/still as appropriate. Check one/multiple scenes, cancellation/cooldown and reduced-motion still at1280x720 and390x844; inspect lamp warmth and absence of duck halo. A single live pulse can then be viewed for visual assessment; no autoplay or idle sequence. Keep live controls opt-in.

Record exact coverage and failed/refused cases; no claim about real OS setting/hidden-page/device performance without evidence. Close/release browser afterwards. Return source repair and browser/composite findings for root/owner review, no packet closure. StageD/device work and StageE/promotion remain separate.

Standards reference: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html — frequency, opposing luminance transitions and spatial area are distinct tests; other page content matters. This study does not establish compliance.
