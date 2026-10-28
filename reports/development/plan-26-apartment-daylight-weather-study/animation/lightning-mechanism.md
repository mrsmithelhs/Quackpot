# Lightning study: mechanism note (Plan 26 Stage C, report-only)

Written before any flash is rendered. All numbers are **design choices for review, not safety thresholds or a certification**. Source of truth in code: `LIGHTNING` in `lightning.mjs`; change a number there and in this note together.

## What an event is
- Host-triggered only (`controller.requestFlash`). No timer, no idle flash, no random scheduling, no audio.
- **One pulse per accepted event.** An accepted event flashes only the requesting scene. Several scenes on a page cannot flash together: the single shared arbiter accepts one request, refuses the rest (`active`), and the next acceptance needs a monotonic **>= 4000 ms** gap measured from the START of the previous accepted pulse. Refused requests are never queued, replayed or counted against the budget. Recreating a scene or controller cannot reset the arbiter (the host owns it). No arbiter -> fail closed.
- Only the **storm** weather (plain and with the lamp) can flash. Rain, overcast and any scene without running rain motion refuse.

## Curve (opacity factor f over one pulse, linear segments)
| t (ms) | f |
|---|---|
| 0 | 0 |
| 120 | 1 (peak) |
| 600 | 0 |

Total duration **600 ms**: linear rise over 120 ms, linear fall over 480 ms, one maximum, no second peak, no flicker, no repeat. `fill: none`, iterations 1, easing `linear`. At the end the overlay nodes are **removed**, so the DOM returns to the pre-flash serialisation. Only the `opacity` property of the overlay nodes is animated.

## Layers, colour and opacity bounds (peak = f 1)
| Target | Shape and placement | Colour | Blend | Peak opacity |
|---|---|---|---|---|
| `window-lift` | rect = the existing glass `sky` rect, appended last inside the pane-clipped group (above rain, clipped to the four panes) | `#e8f0ff` (cool white) | normal | **0.18** |
| `room-lift` | ellipse copied from the existing `window-spill` geometry, inserted right after it (above furniture and duck, below the lamp spill and lamp glow); radial gradient `#cfdcff` stops 1 / .55 / 0 | cool blue-white | `screen` | **0.08** |

- Both overlay nodes carry opacity `0` at creation and `data-p26-flash-target`; both are inserted by the effect and removed by it. Nothing else is touched.
- The rain tint (`weather-tint`, multiply) and vignette sit above `window-lift`, so the final composite lift is smaller than the overlay opacities suggest. The design target is that the **final composite lift stays below 0.10 relative luminance at every pixel**; this is checked in the browser turn, not assumed, and the opacities are tuned down (not up) if it is exceeded. A stronger look would need its own review.
- **Lamp stays warm:** the lamp spill and glow layers are drawn after `room-lift` and are not tinted or moved. **Duck non-emissive:** no halo, no duck/lamp node or transform is touched; the room lift is the only layer that can reach the duck's pixels (like the existing `window-spill` already does), and the duck region's luminance change is measured and reported separately. No red component: both colours are blue-white.

## Interruption
Anything that could stop motion cancels the pulse to neutral at once: pending visibility, off-screen (glass cropped out, the conservative glass gate, unchanged), hidden, inactive, user pause, user stop, reduced motion, destroy. The overlay nodes are removed, the outcome is `cancelled`, the cooldown is **not** reset or refunded, and a cancelled pulse is never resumed. Reduced motion and motion-off keep the approved still and **refuse** (refusals consume nothing). Outcomes are distinct: `refused` (with a reason) / `finished` / `cancelled`. A watchdog cancels a pulse that has not finished 1500 ms after its nominal end (`cancelled`, reason `watchdog`).

## Composite measurement method (browser turn)
1. **Positive control first.** Serialising the stage to an SVG image does not carry Web Animations state. For the flash, a raw clone at t=0 and at the peak must be identical (method blind) while a clone with the animated `opacity` baked from computed style must differ; only then are baked rasters used.
2. **Deterministic sampling.** The pulse animations are paused and seeked to chosen times; nothing depends on real-time frame delivery. Samples: t = 0, every 20 ms through the rise (0-120), the peak (120), every 20 ms through the fall (120-600), and the final neutral; this includes both transitions and the extremum, plus a 60 Hz grid (every 16.667 ms) as a cadence view. A raster curve is diagnostic and says nothing certain about a real display's refresh behaviour.
3. **Per-pixel relative luminance** of the composited image (sRGB -> linear, 0.2126 R + 0.7152 G + 0.0722 B). Reported: mean luminance over the glass box and over the whole stage per frame, the largest per-pixel lift vs neutral, the largest frame-to-frame step, and the duck-region change.
4. **Flash definition (WCAG 2.2 SC 2.3.1, general flash, simplified).** A pixel flashes when its luminance series has a monotone rise run of >= 0.10 followed by a monotone fall run of >= 0.10 and the darker value is below 0.80. Reported per sampling rate: flashing pixel count, that count as a share of the 341 x 256 px reference field (87,296 px; one quarter is 21,824 px), flashes per rolling second (the scheduler allows at most one pulse per four seconds), and the red-flash rule is noted as not applicable (no saturated red). Viewports: 1280x720 and 390x844, on the CSS pixel grid. Not a photosensitivity certification.
5. **Aggregate across simultaneous scenes:** four storm scenes on one page, one request each in the same tick: exactly one is accepted and three are refused `active`; the whole-viewport composite is measured with that single pulse. Whole-page effects from other producers (video, other tabs, unrelated page animation) are not covered.

## Not in scope
Audio/thunder, other rooms, kit hooks, rain art changes, still changes, Plan 25 wiring, whole-room visibility policy (the glass gate stays), production promotion, device/performance evidence (Stage D).
