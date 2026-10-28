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
- **Lamp stays warm:** the lamp spill and glow layers are drawn after `room-lift` and are not tinted or moved. **Duck non-emissive:** no halo, no duck/lamp node or transform is touched; the room lift is the only layer that can reach the duck's pixels (like the existing `window-spill` already does), and the duck region's luminance change is measured and reported separately. The overlay fill colours are blue-white, but that is a design choice, not evidence about red transitions in the composite: red transitions are **not analysed** here.

## Interruption
Anything that could stop motion cancels the pulse to neutral at once: pending visibility, off-screen (glass cropped out, the conservative glass gate, unchanged), hidden, inactive, user pause, user stop, reduced motion, destroy. The overlay nodes are removed, the outcome is `cancelled`, the cooldown is **not** reset or refunded, and a cancelled pulse is never resumed. Reduced motion and motion-off keep the approved still and **refuse** (refusals consume nothing). Outcomes are distinct: `refused` (with a reason) / `finished` / `cancelled`. A watchdog cancels a pulse that has not finished 1500 ms after its nominal end; the ticket settles `cancelled` with reason `watchdog` (the effect carries its reason on the rejection; any other effect abort reads `effect-aborted`). If the effect throws while starting, after the arbiter has already accepted the request, the host gets the **accepted** ticket already settled `cancelled` with reason `effect-start-failed`: the budget is spent, nothing is refunded, no visual is claimed, and this is not a budget-free refusal.

## Composite measurement method (browser turn)
1. **Positive control first (one capture pair, animation held).** Serialising the stage to an SVG image does not carry Web Animations state. For the flash, a raw clone at t=0 and at the peak must be identical (method blind) while a clone with the animated `opacity` baked from computed style must differ; the baked capture at t=0 must equal the scene without any overlay; and the lifted pixels must fall inside the DOM glass box, with a visible side-by-side of the capture and the live stage for geometry and colour. Only if all of that holds are further captures taken.
2. **Deterministic sampling.** The pulse animations are paused and seeked to chosen times; nothing depends on real-time frame delivery. Samples: t = 0, every 20 ms through the rise (0-120), the peak (120), every 20 ms through the fall (120-600), and the final neutral; this includes both transitions and the extremum, plus a 60 Hz grid (every 16.667 ms) as a cadence view. A raster curve is diagnostic and says nothing certain about a real display's refresh behaviour.
3. **Per-pixel relative luminance** of the composited image (sRGB -> linear, 0.2126 R + 0.7152 G + 0.0722 B). Reported: mean luminance over the glass box and over the whole stage per frame, the largest per-pixel lift vs the pre-flash reference, the largest frame-to-frame step, and the duck-region change. Rain is frozen at one time for every frame and for the reference, and restoration is checked by cancelling only the pulse and comparing against that same reference (the pixel-equivalence claim is about flash removal, not about rain).
4. **Flash definition (WCAG 2.2 SC 2.3.1, general flash, simplified).** A pixel flashes when its luminance series has a monotone rise run of >= 0.10 followed by a monotone fall run of >= 0.10 and the darker value is below 0.80. Reported per sampling rate: the total count of flashing pixels over the raster, with the 341 x 256 reference field (87,296 px; a quarter is 21,824 px) quoted only as context. **That total is not the maximum flashing area inside any reference field, no spatial or frequency conformance is evaluated, and no area-based pass is claimed.** Flashes per rolling second are those the scheduler allows (at most one pulse per four seconds). Red transitions are not analysed. Viewports: 1280x720 and 390x844, rasters at CSS scale 1 (the scale to CSS pixels is recorded; downscaled diagnostics could not establish original-scale area). Not a photosensitivity certification.
5. **Memory bounds.** One scene at a time; frames are streamed (a pre-flash reference, the previous frame and the current frame are all that is retained; flash counting keeps per-pixel running state), canvases and images are released after every capture, a pixel limit and a JS-heap growth guard stop a run early, and nothing retries blindly.
6. **Aggregate across simultaneous scenes:** four storm scenes on one page, one request each in the same tick: exactly one is accepted and three are refused `active`. The composite is a **grid-level diagnostic**: the whole scene grid is rasterised (generally larger than the viewport), its extent and scroll position are recorded, and the part inside the current viewport is reported separately; it is not called a verified whole-viewport result. Whole-page effects from other producers (video, other tabs, unrelated page animation) are not covered.

## Not in scope
Audio/thunder, other rooms, kit hooks, rain art changes, still changes, Plan 25 wiring, whole-room visibility policy (the glass gate stays), production promotion, device/performance evidence (Stage D).

## Bright look (owner-directed variant, `lightning-bright.mjs`)
**Why it exists.** The owner triggered the restrained pulse above in the gallery and could not tell any lightning was happening (measured peak lift about 0.07 on the glass and 0.03 elsewhere, which this note had warned could look subtle). The owner's direction: *a bright-white flash that takes over the whole scene, then quickly fades from the whole scene, while the window stays light for maybe half a second longer before it also fades out.* This variant implements exactly that. It is **selectable in the gallery** (Lightning look: `bright`, the default, or `restrained`); the restrained look and its curve are unchanged and still selectable. The earlier review said "no stronger effect"; this is a stronger effect by the owner's explicit instruction and **needs its own root review** before anything beyond this report-only gallery.

**Unchanged and shared:** host-triggered only, one pulse per accepted event, no idle flashes, storm only, one page arbiter (>= 4000 ms from the start of the previous accepted pulse, refusal not queueing, recreation cannot reset it, no arbiter fails closed), every blocker (pending visibility, off-screen or cropped glass, hidden, inactive, pause, stop, reduced motion) cancels to neutral at once or refuses, outcomes `finished` / `cancelled` / `refused`, the `watchdog` reason, overlays removed at the end. Only `opacity` is animated.

**Curve (linear segments, 800 ms total, factor x peak opacity):**
| t (ms) | scene white (`#ffffff`, peak 0.90) | window white (`#f4f8ff`, peak 1.00) |
|---|---|---|
| 0 | 0 | 0 |
| 40 | 1 | 1 |
| 300 | 0 | 0.75 |
| 800 | 0 | 0 |

The scene flash rises in 40 ms (about two or three frames at 60 Hz) and is gone by 300 ms; the window is still at 0.75 at 300 ms and fades out by 800 ms, 500 ms longer. One maximum per layer, no second peak.

**Placement.** Two overlay nodes inserted right after the existing `window-spill` ellipse: a full-scene white rect (the same 14000-unit span the rain tint uses) and a pane-clipped white rect over the glass. That puts them **above** the rain tint and vignette (so the white is not dimmed by them) and **above the duck**, but **below** the lamp spill and lamp glow. No node, transform or geometry of the duck or lamp is touched and there is no halo; but a whole-scene white overlay lights the duck and washes the room, and it also washes the lamp's glow region at the peak (measured: see progress.md 9.3). The original brief to keep the lamp warm and the duck unlit is therefore **not met at the peak** by this look, only before and after it.

**Measurement.** Same method as above (positive control first, deterministic seek, baked rasters, streamed). Expected opacity is read from each layer's own keyframes. This look is a large-area, high-contrast flash: by the simplified luminance test essentially every pixel of the scene flashes (rise and fall of at least 0.10), so the flashing-pixel counts are large, not zero. One pulse is one flash and the scheduler allows at most one pulse per rolling second, but that is a design bound, not a conformance result, and no certification or area-based claim is made.
