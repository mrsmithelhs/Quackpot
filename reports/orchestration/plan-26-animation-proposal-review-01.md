# Plan26 animation proposal: technical review and recommended owner decisions

2026-10-27. Owner explicitly accepts still-weather visuals, not animation implementation. Root reviewed document e85e251 with a bounded read-only Terra-medium review and primary W3C/MDN references. Current still-only packet remains binding until owner approves an extension/new packet. No animation/browser/kit mutation is authorized by this review.

## Recommended seven choices

1. Host-side WAAPI controller, report-local first; static kit/SVG output unchanged. This offers direct lifecycle control without adding named CSS keyframes. WAAPI does not itself guarantee correct scheduling or compositing.
2. Ambient rain while an explicitly selected weather/story scene is active and visible, with a reachable FREE motion pause/stop. No weather on real dates, idle apartment scheduling, cloud drift or game-state changes in initial scope. Pause preference must survive scene recreation. The ambient rain need not be individually triggered at every dialogue line.
3. Lightning only on host/story request; refuse rather than queue, four-second shared monotonic cooldown. Recommend ONE pulse in the initial experiment; two can remain a later visual candidate with separately demonstrated aggregate behavior. Numbers are design choices, not safety thresholds or certification. No idle flash.
4. Reduced motion and motion-off preserve approved still and refuse flash. No extra slow brightness substitute initially. Handle live preference changes, not startup only.
5. Page-wide budget: host constructs and injects ONE shared arbiter into every controller. No independent per-controller schedulers masquerading as a global rule. Absent arbiter disables flash. Destroying/recreating one scene must not reset cooldown. Document unrelated page flash producers outside its coverage before promotion.
6. Root coordinates code/standards-based review with Terra-medium plus objective final-composite flash evidence; owner supplies artistic acceptance and target-device observation, not a medical certification. Check current teacher Windows browser plus representative slower student hardware/browser before production claims. No invented Chromebook requirement. Prototype can proceed with bounded current-machine evidence; broader performance claim remains pending hardware. If adequate lightning evidence cannot be obtained, retain non-flashing production alternative.
7. Audio remains out. Expose structured accepted/refused/finished/cancelled outcomes for later host synchronization; cancelled/destroyed flashes must not report successful finish. Later audio lifecycle remains separately gated.

Recommended authorization is staged report-only controller logic/rain experiment first, then explicit lightning visual-stage approval, then final technical/performance/owner gates before any kit/production promotion. Still-weather acceptance is recorded independently; existing Plan25 is not automatically expanded.

## Corrections before an implementation brief

- Preserve original approved still rain. A newly regenerated tile's first frame is not automatically identical to the original random streak path. Add motion-only tiling nodes and temporarily hide/replace original rain ONLY while active; motion-off/reduced/destroy restore exact original static composition. Compare final DOM/composited static output, not source bytes alone. Keep appearance differences of moving version explicit and inspect seam/clip margins.
- Treat pause/hidden/offscreen/scene-inactive/reduced/user-stop as independent blockers. Clearing one must not restart through another. Rain may pause/resume; transient flash cancels to neutral on hide, pause, deactivation or reduced motion and must not resume as a stale story beat. Refuse triggers while blocked. Disconnect and cancel idempotently, handle animation cancellation promises, no leaked loops/listeners or scene-cross effects.
- Remove the claim that two pulses per event and a four-second cooldown prove a rolling flash count by construction. Define pulse transitions, simultaneous scenes, interruptions and all covered producers. Assess actual composite against a specified method; a pause control is not a substitute for bounded flash behavior.
- Verify the raster method captures WAAPI computed appearance with a known positive control: serializing raw SVG may omit animated state. Sample temporal extrema/both transitions, spatial luminance/area and relevant scales/backgrounds.60Hz sampling alone can miss peaks; diagnostic raster curves are not a certification of actual display refresh behavior.
- rAF interval distributions measure cadence, not automatically render/compositor cost. Record frame cadence/drops or appropriate trace data, duration, foreground status, baseline still, device/browser/viewports and one/multiple scenes; avoid extrapolating low-end results. Include rain under existing blend/blur layers.
- Physical duck geometry and transforms remain static. A room-light change can illuminate it without animating its anatomy or adding an emissive halo. Controllers own only documented weather/effect targets. Still-only source tests remain valid for standalone output; animated DOM has separate checks.

## Primary references checked

- W3C WCAG2.2 SC2.3.1 understanding: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html — whole-page frequency/threshold and combined-area evaluation; no model-specific safety conclusion.
- W3C SC2.2.2 understanding: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html — applicable automatically moving content alongside other content needs a user pause/stop/hide mechanism; hidden-only automatic pause is insufficient user control.
- MDN Animation.cancel()/pause(): https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel and https://developer.mozilla.org/en-US/docs/Web/API/Animation/pause — lifecycle primitives, not aggregate guarantees.
