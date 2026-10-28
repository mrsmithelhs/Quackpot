# Plan 26 progress — living-room still daylight (Stage 2) and still weather (Stage 3)

Status: **Stage 2 daylight was owner-reviewed (strong-sun shadows liked); Stage 3 still weather is ready for owner review (section 7 below).** Animated rain and lightning are retained as future options and are not built. No packet, status, push, production import or kit change. Plan status is unchanged.

Commits (local, explicit paths): `521f682` scaffold · `d905074` gallery · this stage's fixes, tools and report in the final commit that carries this file.

## 1. Source baseline

- Pinned input: the delivered Plan 24 kit (`src/assets/apartment/`, 24 files, last changed by `5237a2a4f58922ff713240a9e4c7221ab89e6c62`). `pinned-kit.json` holds git blob ids (LF-normalised); `tools/check.mjs` verifies the pin, cross-checks it against `git ls-tree` of that commit, and confirms the kit is unmodified in the working tree. The kit was not edited.
- Contract, wrapper, precedence table, anchors and the approximation list: [mechanism.md](mechanism.md) (root accepted the mechanism checkpoint).

## 2. Actual variants (living room only, still)

| Cell | What it is |
|---|---|
| Neutral | kit `light:'neutral'` |
| Legacy window | kit `light:'window'`, scene-anchored overlay (unchanged behaviour) |
| Sun, restrained / strong | wrapper `daylight:'sun'` over kit neutral; five inserted blocks (floor shadows, window white-out, window beam on the table with frame shadow, duck/mug shadows, shade tint + window bloom); legacy wash suppressed (R2) |
| EXTRA CONTROL (labelled) | kit `light:'window'` with `overlay:'none'` plus the original stage CSS gradient laid over the stage: the host/stage-anchored behaviour, not the same look as the scene-anchored reference |

Sun model (approximate, see mechanism.md section 5): one low late-afternoon sun, elevation 16°, azimuth −6°.

## 3. Source checks (Node, 153/153)

Pin and git cross-check; keyed window/furniture coordinates equal the kit spec; no-effect output byte-identical to the kit over 180 option combinations plus furnishing states and `overlay:'none'`; precedence rules R1–R4 and rejections (sun+lamp, weather stills, non-living areas); for every sun variant (strength × framing × light × duck view): removing the inserted blocks returns the kit output exactly, XML is well formed, ids unique and resolvable, duck and lamp-glow markup byte-identical, no animation constructs, five expected blocks, root tag unchanged; two simultaneous instances with different prefixes; determinism; missing, ambiguous and kit-changed anchors fail. Sizes: sun strong wide 21.7 KiB vs kit neutral 17.7 KiB. These checks are structural and say nothing about whether the daylight looks good.

## 4. Rendered comparison

One isolated tab driven only by me; no worker tabs. (The pane was closed, so my first navigation opened the pane's single tab; it was mine and was closed at the end.) The existing server was used unchanged.

Viewports actually emulated and inspected: **1280×720** (two grid columns, stage 597 px wide) and **390×844** (one column, stage 358 px wide, no horizontal scroll). For 1:1 detail I also used an 800×450 inspection viewport; that is not part of the requested matrix. Browser zoom was not used (unsupported); "CSS crop zoom" is CSS scaling.

Coverage:

| Viewport | Stage shape | Framing | Seen as screenshot | Numbers |
|---|---|---|---|---|
| 1280×720 | wide 2.07:1 | wide, medium | yes (all five cells) | yes |
| 1280×720 | 16:9 scene | wide, medium | yes (3× CSS crops of duck/table and window/plant) | yes |
| 1280×720 | narrow 1.08:1 | wide, medium | no | yes |
| 390×844 | narrow 1.08:1 | wide, medium | yes (sun strong and host control cells; neutral top) | yes |
| 390×844 | wide / 16:9 | either | no | (numbers depend on stage shape, not viewport, so covered above) |
| 1280×720 | wide | wide, couch removed | yes (sun shows the kit's placeholder mark, no sofa shadow) | no |

Numeric diagnostics vs neutral (in-page rasteriser, `tools/browser-measure.js`; mean channel difference 0–255 / pixels changed by more than 24 / mean luminance change). Diagnostic only; not a judgement of the art:

| Stage / framing | Legacy window | Sun restrained | Sun strong | Host control |
|---|---|---|---|---|
| wide 2.07:1 / wide | 7.6 / 5% / +2.5 | 12.4 / 17% / +4.0 | 19.3 / 25% / +5.0 | 6.9 / 3% / +1.9 |
| wide 2.07:1 / medium | 8.9 / 7% / +4.0 | 17.7 / 28% / +10.3 | 27.2 / 34% / +14.4 | 8.0 / 5% / +3.2 |
| 16:9 / wide | 7.4 / 5% / +2.1 | 12.4 / 17% / +5.1 | 19.2 / 25% / +6.8 | 7.4 / 5% / +2.1 |
| 16:9 / medium | 7.9 / 5% / +3.0 | 17.8 / 29% / +10.6 | 27.3 / 34% / +14.8 | 7.9 / 5% / +3.0 |
| narrow 1.08:1 / wide | 6.1 / 3% / +2.3 | 9.9 / 11% / +2.4 | 15.6 / 16% / +2.4 | 4.8 / 0% / +0.6 |
| narrow 1.08:1 / medium | 10.3 / 13% / +6.2 | 17.5 / 27% / +11.3 | 26.6 / 38% / +16.3 | 7.7 / 7% / +3.2 |

Sanity: at the 16:9 stage the host control equals the legacy window exactly (anchoring coincides), as expected.

### What I saw (and fixed during the pass)
First render problems, all in report code, fixed and re-checked:
1. At the first sun (36°) the floor patch was invisible: the coffee table covers the foreground floor in this camera. Fixed by a low sun (16°) that puts the window beam on the table top.
2. Low-sun rays projected behind the camera drew diagonal streaks across the wall. Fixed by cutting rays at 250 mm in front of the camera.
3. The first duck/mug shadows were hard flat parallelograms; they are now rounded and softer.
4. The white-out panes were drawn over the foreground plant and left a hard rectangle over a leaf tip. They now sit right after the window item (under the plant, lamp and curtains); only the soft bloom is drawn over furniture.
5. The tint greyed the whole room (strong sun was darker than neutral at narrow width). The tint is lighter and a wide warm window bloom was added.

Current look (strong, wide stage): the blown-out window with its frame cross, a warm sunlit band across the left half of the table with the frame's shadow and a soft shadow behind the duck and mug, cooler shade on the right of the table and the wall, plant and lamp shadows crossing the table and floor. Restrained is lighter and less contrasty. At 390×844 the narrow stage shows the same read; the medium crop shows the table band and the duck's shadow clearly and cuts the window off.

### Observations and limits (for the owner's look)
- **Letterboxing:** the kit paints wall and floor beyond its 960×540 box, so a stage taller than the scene shows wall colour above, not bars. In the narrow stage the TV and sofa are cut at the box edges; neutral does the same, so this is the kit's composition, not something added here.
- **Medium crop:** the window is cropped out in the medium framing, so the white-out panes and bloom are not seen; the light reads only from the table band, shadows and tint.
- **Glare over the foreground plant** is a faint veil from the soft bloom; the leaf stays crisp.
- **Shadow colour:** the cool shadows on the table's right side (lamp shade, plant) are flat blue-grey slabs; softened once but still more graphic than the duck's soft shadow. A visual call for the owner.
- **Approximations** are as listed in mechanism.md: low sun chosen for visibility, not realism; floor shadows broader than one window would allow; no sun on walls or furniture faces; the duck is not re-lit (kit markup untouched), so only its shadow changes.
- **Not seen as screenshots:** narrow stage at 1280, 390 with wide/16:9 stage shapes, and the mixed couch/TV states other than couch removed in sun. TV-removed-only was not inspected visually.
- **Screenshots:** the tool's scaled (0.7) screenshots cropped the 390 view, so I used full-scale ones; one capture was stale (taken before re-render) and was retaken. Console showed three transient module errors from my own mid-edit hot reloads; the final loads were clean.
- The lamp is off in all Stage 2 variants; lamp/sun pairing and all weather stills are Stage 3.
- Plan 24's furniture-removal observation is under separate root investigation; nothing here touches or settles it.

## 5. Housekeeping
Browser: one tab (mine), closed; 390 and 1280 viewport overrides reset; slot released. No owner tabs, storage, settings or servers touched. Working tree also shows `docs/development/` edits and an untracked `reports/development/plan-22-race-entry-and-duck-rest/`; they are not mine and are not in my commits.

## 6. Next gate
Owner look at the daylight comparison (gallery: `http://127.0.0.1:5181/Quackpot/reports/development/plan-26-apartment-daylight-weather-study/gallery.html`, needs the existing dev server). Stage 3 (overcast/rain/storm stills, with a defined lamp variant set) starts only after the owner reviews this or gives explicit permission.

## 7. Stage 3: still weather (overcast, rain, storm, storm + lamp)

Commits (local): `324162b` weather layers, precedence, gallery section and checks · `0fda0d1` lamp correction · `2c20847` warmer lamp-following spill and truthful window-visibility captions · this report.

### 7.1 Lamp correction (root request)
The first storm + lamp cell had a warm glow centred on the duck, which made the duck look like the light source. I withdraw the earlier claim that the added pool was acceptable. It was removed. The duck now gets **no added light**. The kit's own lamp (floor lamp right of the sofa) keeps its glow, down cone and up spill, drawn after the storm tint so it stays warm. The only added warm light is a restrained spill centred on that lamp (a wide ellipse around the middle of its down cone and a smaller one above the shade). A check asserts its centre equals the lamp's x (610.3) and is far from the duck's (328.0), and that no duck-centred glow exists in any variant. The kit's warm full-room overlay is omitted in this cell (rule R4: it would leave the duck in near-black shade and the storm tint supplies the darkness); the cell's notes say so. A second pass warmed the spill after the 1:1 comparison with the ordinary warm scene showed it too pale and pinkish.

### 7.2 Source checks (Node)
`tools/check.mjs` 151/151 and `tools/check-weather.mjs` 311/311: no-effect identity (including plain kit warm); precedence R1-R4 and rejections (rain/overcast/sun + lamp, unknown weather, other areas); per variant (overcast, rain, storm, storm + lamp x wide/medium x three duck views, plus furnishings removed): layers removed returns the kit output for the effective options exactly, well-formed XML, ids unique and resolvable, duck markup and lamp-glow markup byte-identical, no animation/timing/flash/lightning constructs, three expected blocks, soft ambient shadows and no sun blocks, lamp spill only in the lamp cell and centred on the lamp; rain vs storm differ (streaks 62 vs 150, longer, more slanted, more droplets, different sky, stronger tint); four simultaneous instances; determinism. Structural only.

### 7.3 Browser surface and rendered comparison
Surface: the Claude desktop app's built-in browser pane (tools `mcp__Claude_Browser__*`), one tab opened and closed by me; no worker tabs; no owner tabs, storage, settings or server touched. I cannot independently prove isolation from other harnesses beyond that this tab was the only one in a closed pane. Closed at the end; viewport overrides (1280x720, 390x844, 800x450 for 1:1 detail) reset; slot released.

Actually emulated and inspected: **1280x720** (two columns, stage 597 px) and **390x844** (one column, stage 358x332, no horizontal scroll). Cells: clear strong sun (reference), overcast, rain, storm, storm + lamp, plus an extra labelled ordinary kit warm scene for comparison.

| Viewport | Stage shape | Framing | Seen |
|---|---|---|---|
| 1280x720 | wide 2.07:1 | wide | all six cells (sun, overcast, rain, storm in one view; rain, storm, lamp, warm reference in another) |
| 1280x720 | wide 2.07:1 | medium | storm + lamp and warm reference (small, scaled capture); the other cells at this combination were not individually looked at |
| 1280x720 | 16:9 | wide | numbers only |
| 390x844 | narrow 1.08:1 | wide | storm, storm + lamp, overcast, rain, warm reference |
| 390x844 | narrow 1.08:1 | medium | storm and storm + lamp; overcast, rain, sun and warm reference not looked at at this combination |

What I saw:
- **Distinct weather:** overcast has a pale grey sky with cloud forms and no streaks; rain a dim blue-grey sky with fine near-vertical streaks and droplets; storm a dark sky with dense, longer, strongly slanted streaks and the darkest room. The room tint steps down overcast, rain, storm. Streaks and sky are clipped to the four panes, mullions stay, and the plant and curtains stay in front (the corrected paint order).
- **Storm + lamp:** the room stays cool and dark; warm light comes from the lamp (shade, wall, sofa, floor) and follows its cone. The duck is dim olive-yellow but readable, with no halo. In the ordinary kit warm scene the duck is almost black.
- **Consistency with the ordinary warm scene:** same lamp, same cone shape and position at both widths and crops. The ordinary scene is a much stronger, more saturated pool with a dark vignette; the storm + lamp pool is deliberately weaker and cooler because the room stays storm-lit.
- **Medium crop:** at desktop (wide stage) the window is out of frame, so weather there is ambience only and the captions say so. At the narrow stage the taller stage shows more above the box, so the window is partly visible (caption: partly cropped). The first version of this caption wrongly said "out of frame" at the narrow stage; found in the browser and fixed to use the real stage geometry.
- **Letterboxing:** as in Stage 2, the kit paints beyond its box, so a taller stage shows wall colour above, not bars; the TV and sofa are cut at the box edges at the narrow stage, as in neutral.

Numbers (in-page rasteriser; mean luminance 0-255 / warmth R-B), diagnostic only:

| Region (16:9 stage, wide) | Clear sun | Overcast | Rain | Storm | Storm + lamp | Ordinary warm |
|---|---|---|---|---|---|---|
| duck | 154 / 75 | 119 / 78 | 108 / 66 | 89 / 48 | 81 / 49 | 38 / 7 |
| around the lamp | 191 / 27 | 181 / 22 | 163 / 12 | 133 / 3 | 188 / 36 | 202 / 78 |
| sofa | 163 / 26 | 154 / 20 | 139 / 12 | 113 / 4 | 173 / 45 | 176 / 69 |
| left wall (control), luminance only | 138 | 134 | 121 | 100 | 92 | 40 |

The duck region in storm + lamp (81) is about 8 lower than in storm (89) because the lamp cell has no kit neutral 5% warm overlay; the lamp spill adds nothing there. At medium framing the duck region reads 94 (storm) / 86 (storm + lamp) / 39 (ordinary warm); at the narrow stage, wide frame, 106 / 100 / 50. Around the lamp, storm + lamp is clearly warmer than storm (36 vs 3) but weaker than the ordinary scene (78). Unchanged lamp markup is verified structurally; the pixels around the lamp do change (global tint, vignette and the spill), as these numbers show.

### 7.4 Limits and open items
- **Kit glow ring:** a faint thin circular ring around the lamp shade is visible in storm + lamp (clearer at narrow width and at 3x CSS crop). It is the kit's own lamp-glow circle: the ordinary warm scene shows it too, only hidden by that scene's overlay. It cannot be fixed here without changing the kit, so it is recorded for the Plan 24 side.
- **Study addition:** the lamp spill is a report-local approximation (two ellipses), not derived from kit light geometry beyond the lamp's position.
- **Not looked at:** the 16:9 stage as screenshots; medium framing for overcast, rain and clear sun at 390 and 1280; 390 with the wide or 16:9 stage shapes (numbers depend on stage shape, not viewport). Browser zoom is unsupported; crops were CSS scaling.
- **Capture reliability:** the pane's screenshots were sometimes stale or timed out, and the shared Vite server reloaded my page when other agents edited source (state resets, `__p26` lost); conclusions above were re-checked against DOM state or a fresh capture, and the captures marked "small, scaled" are legible but low resolution.
- **Browser independence:** declared above; I did not operate or see any other agent's browser.
- Daylight shadow-slab polish remains later art polish, not done.

### 7.5 Next gate
Owner look at the five still weather cells (`.../plan-26-apartment-daylight-weather-study/gallery.html`, needs the existing dev server). Other rooms/desks, animated rain and lightning (retained, with a later bounded proposal covering embedding, pause/teardown, reduced motion, repeated-instance keyframes, aggregate flash behaviour and performance), kit promotion and Plan 25 integration remain separate gates.

## 8. Stages A/B: weather motion controller and animated rain (report-only, source checks and browser turn done, awaiting review)

Owner and QP Orch approved the controller logic and animated-rain prototype (handoff `plan-26-animation-sonnet-handoff.md`). Everything is in the new `animation/` folder; the kit, `study/*`, the still gallery and the still generators are untouched (`animation/tests/still.test.mjs` asserts this). Contract and lifecycle table: `animation/interface.md`.

**Built:** `arbiter.mjs` (one page-wide flash arbiter: monotonic 4 s cooldown measured from the accepted pulse, refuse-not-queue, finished/cancelled/refused outcomes; no visual), `rain-motion.mjs` (pure spec of animation-only rain layers: far and near streak tiles plus sliding drops), `controller.mjs` (host WAAPI controller on the inline SVG with six independent blockers: user pause, hidden, off-screen, inactive, user stop, reduced; live reduced-motion; idempotent `destroy()`), a separate motion gallery (`animation/gallery.html`) with free pause and show-still controls per scene, and in-page measurement helpers (`animation/tools/browser-harness.js`).

**Choices that follow the review:** the original still rain is hidden with `display="none"` only while motion is active and its previous attribute is restored on stop, reduced and destroy; the moving layers are new art (own seeds), so the moving picture differs from the still on purpose. Pause-class blockers freeze in place, still-class blockers restore the approved still; a scene created while blocked stays on the unchanged still until it first runs. Only `transform` and `opacity` are animated; nothing targets the duck, its ancestors or the lamp; no cloud drift. The flash path is logic only: refusal precedence, cancel-to-neutral on interruption, no resume of a stale beat, tested with a fake effect. No lightning art exists.

**Source checks (Node, no browser):** `node --test animation/tests/*.test.mjs` 38/38: arbiter (boundary 3999.9 vs 4000 ms, no queueing, backwards clock, validation, burst); rain tile (spec determinism, loop vector along the still slant, geometric seam: visible streak set at phase 1 equals phase 0, and a two-copy tile fails that test, so it is a live check; coverage across phases; drops stay in the glass; keyframes touch only transform and opacity); controller (build and restore compared on final DOM serialisation, all 64 subset/order combinations of the four pause-class blockers, still-class dominance, live reduced preference, idempotent teardown with zero live animations/listeners/observers, `finished` rejections handled, three independent instances, shared-arbiter refusal and no cooldown reset on recreation, duck/lamp guard, `animate()` failure rolls back); still output byte-identical to the fingerprints recorded before any change (8 cells) and no animation constructs in it. Existing `tools/check.mjs` 151/151 and `tools/check-weather.mjs` 311/311 still pass; `check plan-26` runnable.

### 8.1 Browser turn (granted by the owner; Claude desktop built-in browser pane)
Surface: one tab (`animation/gallery.html` on the existing dev server at 127.0.0.1:5181), plus one short-lived second tab to try a real hidden state. No owner tabs, storage, settings or server touched; I cannot prove isolation from other harnesses beyond that these were the only tabs in the pane. Viewports emulated: **1280x720** (dpr 1.25) and **390x844** (dpr 2, Android UA). Closed at the end; viewport override reset; slot released. In-page measurement via `animation/tools/browser-harness.js`; numbers are diagnostic, not a judgement of the art.

| Check | 1280x720 | 390x844 |
|---|---|---|
| Console errors | none (only Vite connect) | not re-read |
| Real WAAPI motion (rain/storm) | all animations progress; far, near and drops all move | scenes running with 9/12 animations; progress not re-sampled |
| Raster positive control | raw clone blind (diff 0.000), baked clone differs (mean 0.084): method valid | same (0.084) |
| Loop seam, mid-loop vs across-the-wrap diff ratio | rain 0.91 / 0.76; storm 0.99 / 1.20 (ratio near 1 = no jump) | storm 0.99 / 1.16 |
| Clip: pixels beyond glass + 8 px vs still | 0 differing (rain and storm) | 0 differing |
| Show still / reduced option / destroy: DOM equals recorded still, composited raster vs a fresh still | equal, mean diff 0, 0 live animations | not repeated |
| Free pause | all animations `paused`, transforms frozen in place; resume runs again | not repeated |
| Off-screen | scrolling pauses and resumes scenes by themselves (`offscreen` blocker) | not exercised (all on screen) |
| One page, no overflow | n/a | no horizontal scroll at any stage shape or framing |
| Page checks | ids unique, no dangling refs, storm/wide still equals the recorded fingerprint in this browser | same stills |

**Real hidden state: not exercised.** Fronting a second tab did not change the first tab's `visibilityState` in this pane (the pane also reports itself hidden), so I could not produce a real hidden page. The controller's listener path was exercised with a **simulated** `visibilitychange` (state overridden on the document): hidden pauses all, a user pause survives becoming visible again, resume restores motion. That proves the wiring, not real browser hidden behaviour.
**Reduced motion:** the pane cannot emulate the OS setting, so the controller option `reducedMotion: 'reduce'` was used; the OS preference path itself is unobserved.
**Frame cadence:** with motion on, the pane's rAF median was 20.8 ms (p95 21.4, max 22, no long tasks) for one scene, all four, and four copies. The still baseline and the wide/medium case could not be compared: with nothing visibly animating, rAF fell to about 1 Hz in this unfocused pane (reproduced twice), so rAF is not a usable frame meter here, as the review warned. No claim about compositor cost or low-end devices.

**Findings for review**
1. *Fixed in this turn:* the gallery's dangling-reference check scanned its own result table after the first re-render and reported a false "1 dangling". It now scans only the scene grid (`gallery.js`).
2. *Fixed after the browser turn (owner said to fix it here):* at the wide stage the medium crop puts the window fully out of frame (glass 0% visible), yet the controller kept 12 animations running because its off-screen test watched the scene box. The controller now observes the glass (`[data-p26="sky"]`, falling back to the scene box when absent), with a unit test (`controller.test.mjs`, 39/39). Browser recheck at 1280x720: wide/medium and scene/medium with the glass out of frame go `paused: offscreen` with 0 running animations; narrow/medium (glass 48% visible), narrow/wide and wide/wide keep running; scrolling scenes in and out still pauses and resumes them as before. Note: right after changing framing the observer callback lags, so the state settles about a second later in this pane. Seam, clip, restore and pause results above were taken before this one-line change and do not depend on it; not re-run.
3. Measurement artifact worth knowing: right after `pause()` a computed transform can still change for a frame (pause is applied at the next frame); I read it only after waiting.
4. Tile speeds and densities are still first-pass values for owner look.

### 8.2 Startup repair after QP Orch rain review (`plan-26-rain-review-01.md`)
**Problem (root's finding):** with an observer present the controller started with no visibility blocker, so until the first asynchronous callback a cropped or off-screen window could start rain and the fake flash path could accept a request.
**Repair (`controller.mjs`, `interface.md`, `tests/controller.test.mjs` only):** when an `IntersectionObserver` exists the controller now starts with `offscreen` set and `state().visibilityPending: true`; the first callback clears pending and sets or clears `offscreen` from the glass intersection. Other blockers are unaffected in both directions, a flash request while pending is refused as `blocked:offscreen` without touching the arbiter, a callback after `destroy()` is ignored, and listeners are told when pending clears even if the blocker does not change. With no observer the documented visible fallback is kept (never pending). Rain art, kit, stills and the rest of the controller are unchanged.
**Source checks on the final source:** `node --test animation/tests/*.test.mjs` **45/45** (39 before + 6 new: pending startup with refused flash and no cooldown use; non-intersecting first callback; visible first callback does not override pause/inactive/stop/reduced/hidden; other blockers toggled during pending; teardown before the first callback with late deliveries; missing-observer fallback). Existing tests that assumed visible now deliver an explicit known-visible observation through a helper instead of bypassing the guard. Mutation check: removing the pending blocker makes 4 of the new tests fail. `tools/check.mjs` 151/151, `tools/check-weather.mjs` 311/311.
**Browser check (one brief pass, 1280x720, built-in pane, one tab, closed afterwards):** a freshly created controller reads `still`, pending, `offscreen`, 0 animations, DOM equal to the recorded still, and a flash request is refused `blocked:offscreen` with 0 accepted in the arbiter, both for a cropped glass (wide stage, medium crop) and a visible glass (wide/wide). Cropped: after the first callback it stays on the unchanged still with `offscreen` and 0 running animations. Visible: it started running only after the first callback arrived. The seam, clip and visual matrix were not repeated (no path they use changed).
**Observed lag, honestly:** in this pane the first callback depends on the pane producing frames. Idle, unfocused, it produced none (0 rAF frames in 4 s; the visible controller stayed pending for over 10 s) until a screenshot woke it, after which the callback arrived at once. So initial-visibility delay in a real browser can be long when the page is not being rendered; the repair makes that delay show as a still picture rather than rain. This is a property of this pane, not a measurement of other browsers.

**Not verified:** a real hidden page, the OS reduced-motion preference, low-end/compositor performance, the medium framing in motion at the narrow stage by eye (numbers only), and phone interaction by touch (clicks only). No claim is made about photosensitivity or flash safety.

**Next gate:** root/owner review after the browser turn. Lightning art and composite evidence remain a later explicitly approved stage; other rooms, kit hooks, Plan 25 and promotion remain separate.

## 9. Stage C: lightning study (report-only; mechanism and source checks done, browser composite turn requested)

Authorised by the owner after the accepted A/B rain repair, per `plan-26-stage-c-sonnet-handoff.md` (packet check `plan-26` runnable). Everything is in `animation/`; the kit, `study/*`, the still gallery and the still generators are untouched (`tests/still.test.mjs` re-run; `src/` changes visible in the working tree belong to other work and were not touched). No audio, no other rooms, no kit hooks, no Plan 25 wiring. **No flash has been shown in any browser yet**: the handoff asks root to review the curve first.

**Mechanism (written before any flash was rendered):** `animation/lightning-mechanism.md`. Host-triggered only, **one pulse per accepted event**, no idle flashes, flashes only the requesting storm scene. Curve (opacity factor, linear): 0 at 0 ms, 1 at 120 ms, 0 at 600 ms. Two animation-only overlays whose `opacity` is the only animated property: `window-lift` (`#e8f0ff`, normal blend, peak 0.18, over the glass inside the pane clip, above rain) and `room-lift` (`#cfdcff` radial gradient, `screen`, peak 0.08, copied from the existing `window-spill` geometry, above furniture and duck, below the lamp spill and glow). Cool, restrained; the lamp layers stay warm and untouched; the duck gets no node, halo or transform (the room lift can reach its pixels the way `window-spill` already does; duck-region change is measured separately). Overlays are removed at the end or on cancel.

**Scheduler and lifecycle (source-tested):** one host-created arbiter shared by all scenes and demo controls; monotonic >= 4000 ms from the START of the previous accepted pulse; refusal, never queue; recreation cannot reset it; no arbiter fails closed. Refusal precedence is in `interface.md`; every refusal that precedes the arbiter (`not-storm`, `no-glass`, `no-room-anchor`, reduced, stopped, pending, cropped or off-screen, hidden, inactive, paused, destroyed, `motion-unavailable`) consumes nothing. Any blocker or destroy mid-pulse cancels to neutral at once, outcome `cancelled`, cooldown kept, never resumed; `finished` / `cancelled` / `refused` are distinct; a watchdog (600 + 1500 ms) cancels a pulse that never settles. The glass-only visibility gate is unchanged, so a cropped-out window refuses.

**The curve for root review** (`node animation/tools/estimate-lightning.mjs`; analytic, not the composite):

| t (ms) | f | window opacity | room opacity |
|---|---|---|---|
| 0 | 0 | 0 | 0 |
| 40 | .333 | .060 | .027 |
| 80 | .667 | .120 | .053 |
| 120 | 1 | .180 | .080 |
| 240 | .750 | .135 | .060 |
| 360 | .500 | .090 | .040 |
| 480 | .250 | .045 | .020 |
| 600 | 0 | 0 | 0 |

Per 60 Hz frame: window opacity +0.025 on the rise, -0.006 on the fall. **Estimated** composite lift in relative luminance at the peak (sRGB-space compositing through the storm multiply tint, ignoring the vignette and real room colours): glass sky and clouds 0.024-0.032, room centre 0.016-0.031, rain streaks about 0. That is well below the 0.10 swing of the general-flash definition, so by this estimate the pulse is a modest brightening (roughly doubling a very dark sky) rather than a hard flash. It may look subtle to the owner; making it stronger is a separate, reviewed change (the estimate reaches 0.10 only near window opacity 0.57, which is not proposed). The browser composite measurement is the evidence; this table is only what root should check before approving the flashing demonstration.

**Source checks:** `node --test animation/tests/*.test.mjs` **62/62** (45 before, plus 11 lightning and 6 flash-metrics). Lightning tests: exact curve and keyframes (one maximum, bounded, linear segments, documented opacity bounds); exactly two animations per pulse and no restart; overlay placement and exact DOM restore after finish or cancel; duck and lamp subtrees byte-identical and unreachable by any animation; all refusals consume no budget; every interruption (pause, hidden, inactive, off-screen, reduced, stop, destroy) cancels at once and is never resumed, a late finish cannot rewrite the outcome, cancellation does not refund the cooldown; three controllers with recreation over 400 fake-time steps (37 accepted pulses: all gaps >= 4000 ms, at most one pulse in any rolling second, only accepted requests counted); the 3999.9 vs 4000 ms boundary; four scenes in one tick give one accepted and three `active`; destroy after finish, destroy twice, watchdog cancel and clear; effect start failure rolls back. Mutation checks (run with a hard timeout): removing overlay cleanup, removing cancel-on-blocker, removing the pre-arbiter check, and raising the window peak to 0.30 each make the lightning tests fail or time out. The pure measurement maths (`tools/flash-metrics.mjs`: relative luminance, frame stats, WCAG-style flash counting with hysteresis, rolling window) is Node-tested. `tools/check.mjs` 151/151, `tools/check-weather.mjs` 311/311, `check plan-26` runnable; all earlier rain, pending-visibility and still tests are unchanged and passing.

**Built for the browser turn, not yet run in a browser:** the gallery (`animation/gallery.html`) now has lightning requests **off by default** behind a checkbox, per-storm-scene buttons, an "all storm scenes at once" aggregate demo, a live page-arbiter readout and an event log. The harness (`tools/flash-harness.js`) has `flashPositiveControl`, `flashMeasure` (deterministic seek of the held pulse, baked raster, per-pixel luminance, 20 ms and 60 Hz grids, extrema, both transitions, glass, duck and outside regions, WCAG-style flash count against the 341x256 reference field, neutral-after-cancel check) and `flashAggregate` (four-scene grid, one accepted pulse). These have only been syntax-checked; their first real run is the browser turn.

**Next gate (requested):** root review of the mechanism note and the curve above, then an isolated browser turn for: positive control, composite measurement at 1280x720 and 390x844, one and several scenes, cancellation, cooldown, still and reduced-motion, and rain coexistence. Stage D (performance, representative devices) and Stage E (promotion) stay outstanding. No claim is made about photosensitivity.

### 9.1 Stage C review corrections (`plan-26-stage-c-review-01.md`): source and measurement edits made, NOT yet run

QP Orch accepted the curve for diagnostic work (unchanged: 0 at 0 ms, peak at 120 ms, neutral at 600 ms; window 0.18 / room 0.08; one shared arbiter; existing blockers) and asked for five bounded repairs. This handoff does not authorise a Node launch, so **these edits have not been run by me**: no `node --test`, no syntax check, no browser load yet. The tests below were edited to match and are untested until a bounded run is authorised or the pages load in the browser.

1. **Start failure after acceptance** (`controller.mjs`): when `effect.start` throws after the arbiter accepted, the controller now returns the **accepted ticket already settled `cancelled`** with reason `effect-start-failed`, not a refusal. The budget is spent and not refunded; no visual is claimed. Pre-arbiter eligibility refusals are unchanged and consume nothing. Tests edited (`lightning.test.mjs`, `controller.test.mjs`) to assert status `accepted`, outcome `cancelled / effect-start-failed`, stats `accepted 1 / cancelled 1 / finished 0`, no `flashActive`, and cooldown refusal afterwards.
2. **Aggregate label and extent** (`tools/flash-harness.js`): the four-scene composite is now labelled a **grid-level diagnostic, not a verified whole-viewport result**. It records the grid raster size and CSS scale (1), the grid's position in the viewport and the crop that lies inside the viewport, and reports grid-level and viewport-crop numbers separately. The `shareOfReferenceQuarter` ratio is gone; flashing-pixel counts are totals over the stated extent, with the 341x256 field quoted only as context, and the text says they are not a maximum inside any reference field and carry no area-based pass claim. Per-scene measurement carries the same limits text.
3. **Neutral check isolated from rain** (`tools/flash-harness.js`): the pre-flash reference is rasterised with rain frozen and no flash node; after sampling only the pulse is cancelled (rain stays frozen at the same time) and the neutral frame is compared with that reference, together with a DOM check that the overlay nodes are gone and the ticket outcome. The earlier comparison against restarted rain is removed.
4. **Red transitions** (`tools/flash-harness.js`, `lightning-mechanism.md`): the categorical "not applicable" output is removed. It now reads that red transitions are not analysed and that the overlay fill colours are not evidence of absence.
5. **Watchdog reason** (`lightning.mjs`, `controller.mjs`): the effect carries its reason on its `finished` rejection (`watchdog`), and the controller uses it, so a watchdog cancel settles `cancelled` with reason `watchdog`; any other effect abort stays `effect-aborted`. Test edited to assert the exact outcome object. Never reported as finished.

**Memory and capture bounds added** (`tools/flash-harness.js`, `tools/flash-metrics.mjs`, `tools/browser-harness.js`): one scene at a time; frames are streamed (pre-flash reference, previous and current frame only) with a new streaming per-pixel swing tracker (`createSwingTracker`, Node test written, and an in-page `metricsSelfCheck()` compares it with the series counter); canvases and images are released after each capture; a raster pixel limit (1.2 M stage, 2.4 M grid) and a JS-heap growth guard (200 MB) stop a run early; no blind retry. The positive control is one held capture pair that also checks the baked t=0 capture equals the scene without any overlay and that the lifted pixels fall inside the DOM glass box, plus `showCapture()` to draw the capture next to the live stage for a by-eye geometry and colour comparison.

**Browser turn: not started.** `http://127.0.0.1:5181` is not answering (a curl from this session got no connection), the earlier Node processes having been killed. The review says to ask root rather than start Node, so I have not started a server and no browser page was opened. Nothing has flashed.

### 9.2 Stage C browser turn and composite evidence (measured; diagnostic only, no certification)

**Surface:** the Claude desktop built-in browser pane, one tab, on the owner's shell-loaded server `http://localhost:5173` (it listens on IPv6 `[::1]` only; 5181 was down). No Node was launched by me, no server started or restarted, no owner tabs, storage or settings touched. Viewports emulated: **1280x720** (dpr 1.25) and **390x844** (dpr 2). Lightning requests stayed off in the gallery (checkbox unchecked, buttons disabled); every request below came from the harness through the controller's own `requestFlash` and the page's one shared arbiter. Closed at the end, viewport override reset, slot released. Peak JS heap growth in any run was 57 MB (bound 200 MB); nothing stalled.

**Page and method checks:** all modules loaded with no console errors (this was also the first real syntax check of the edited sources); `metricsSelfCheck()` (streaming tracker equals the series counter on random data) passed; the page checks (unique ids, no dangling refs, storm/wide still equals the recorded fingerprint) held.

**Blocker and refusal paths (real arbiter, 1280x720 and 390x844):** rain and overcast scenes `not-storm`; user pause `blocked:user-pause`; inactive `blocked:inactive`; stop `stopped`; reduced-motion option `reduced-motion`; a freshly created scene `blocked:offscreen` while visibility is pending; a medium-crop scene with the glass cropped out `blocked:offscreen` after its first callback and still. Not one of these consumed budget (arbiter `accepted 0`, `refused* 0` after them).

**Positive control (one held capture pair, storm scene):** passed at both viewports. Computed overlay opacity at t=0 is 0/0 and at 120 ms is 0.18/0.08 (exact). The raw clone is blind (max lift 0); the baked clone sees the pulse (max lift 0.0728 at 1280, 0.0727 at 390); the baked capture at t=0 equals the scene with no overlay (diff 0); of the lifted pixels, 10,670 of 10,716 glass-box pixels are lifted (the rest of the lift is the soft room ellipse). A visible capture drawn beside the live stage matched its geometry and colours, with the window lifted at the peak. Raster size equals the stage CSS size (scale 1.000 at 1280, 0.999 at 390). Only after this passed were further captures taken.

**Curve sampling, one scene at a time, 61 samples (every 20 ms plus a 60 Hz grid; both transitions and the peak), rain frozen at one time, pre-flash reference without overlay:**

| | 1280x720 storm | 1280x720 storm + lamp | 390x844 storm |
|---|---|---|---|
| animation vs documented curve, max opacity error | 0.000001 | 0.000001 | 0.000001 |
| peak at (ms) | 120 | 120 | 120 |
| peak max per-pixel luminance lift (0-1) | 0.0728 | 0.0798 | 0.0727 |
| peak glass mean lift | 0.0549 | 0.0560 | 0.0553 |
| peak max lift outside the glass box | 0.0258 | 0.0286 | 0.0254 |
| duck region max lift | 0 | 0 | 0 |
| largest frame-to-frame step in the merged samples | 0.016 | 0.020 | 0.017 |
| flashing pixels (>= 0.10 rise then >= 0.10 fall), 20 ms / 60 Hz / all samples | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| overlay invisible at t=0 vs no overlay | exact | exact | exact |
| restoration: overlay nodes removed, neutral frame vs pre-flash reference (rain frozen identically) | yes, diff 0 | yes, diff 0 | yes, diff 0 |

The earlier analytic estimate (0.024-0.032) **under-predicted** the measured composite lift by about 2.3x (measured 0.073-0.080); the measured values are the evidence. All of them are below the 0.10 swing used in the simplified definition, which is why the flashing-pixel counts are zero under that definition. That is a statement about this study's simplified luminance test only: it does not evaluate frequency, area inside any reference field, or red transitions (not analysed), and it is not a photosensitivity certification. The duck's region is exactly 0 because the room-lift ellipse ends at y about 208 and the duck begins at y 214 in the 597x288 wide stage (geometry, not a masking error); no halo exists. **Lamp warmth** (storm + lamp, the lamp glow region, mean colour at t=0 -> peak): R 138.1 -> 141.7, G 132.7 -> 136.6, B 125.2 -> 129.9, so R/B 1.103 -> 1.091: still warm, about a 1% cooling of that region.

**Aggregate across simultaneous scenes (GRID-LEVEL DIAGNOSTIC, not a verified whole-viewport result):** four storm copies, one request each in the same tick. 1280x720: grid raster 1208x839 (scale 1, grid at left 28 / top 0, viewport crop x 0-1208, y 0-720): 1 accepted, 3 refused `active`, one overlay, peak max lift 0.0707, 0 pixels at >= 0.10, 0 flashing pixels, neutral restoration exact. 390x844: grid raster 358x1232, viewport crop y 0-844: 1 accepted, `storm-2:active`, `storm-3:active`, `storm-4:blocked:offscreen`, peak 0.0709, 0 flashing pixels, restoration exact. Flashing-pixel counts are totals over those extents, not a maximum in any 341x256 field; no area-based claim.

**Cancellation and cooldown (real request path, both viewports):** a pulse cancelled by user pause settles `cancelled` (`blocked:user-pause`) with no overlay left, and the next request on the same or another scene is refused `cooldown` (about 3999 ms), proving cancellation does not refund the cooldown. A second scene asking while a pulse is active is refused `active`. Each request was accepted while the scene was running (the controller only accepts when unblocked), so the overlay was added over live rain; in the measured captures rain was frozen on purpose. Rain and pulse coexistence was therefore exercised but not separately sampled.

**What the live attempt showed (important):** a natural 600 ms pulse through the real path did **not** finish on its own in this pane: the watchdog cancelled it at about 2.1 s and the ticket settled `cancelled` with reason `watchdog` (confirming the repair 5 reason on real animations). A plain control animation (same 600 ms options on a throwaway element) also needed 2.8 s to finish while only 2 animation frames arrived, so the pane starves animations of frames when idle and unfocused; the pulse's timeline cannot be watched at true speed here. Consequences: **a real-time live pulse for visual assessment was not obtained**, a natural `finished` outcome was not observed in a browser (it is covered only by the fake-time tests), and this pane says nothing about frame delivery on real displays. Cadence from this machine was not measured; Stage D covers performance.

**Still unverified:** the Node tests (all edits since the review repairs, including the tests I edited and the streaming-tracker test, have not been run; no Node launch was authorised); a real hidden page; the OS reduced-motion setting (the controller option was used); frame delivery, compositor cost and low-end devices; a real-time view of the pulse; red-transition analysis; any whole-viewport area evaluation. Stage D and Stage E remain outstanding.

**Node test result (authorised afterwards by the owner: one bounded run, hard timeout, no background loops, no mutation runs):** `node --test animation/tests/*.test.mjs` on the final source: **63/63 pass, 0 fail, 0 cancelled, 0.3 s** (62 before, plus the streaming-tracker test). This verifies the review repairs and the edited tests: the start-failure accepted-and-cancelled ticket, the `watchdog` reason, and the streaming swing tracker equal to the series counter. `tools/check.mjs` and `tools/check-weather.mjs` were not re-run in this pass (not part of the authorisation); their last recorded results (151/151, 311/311) pre-date these edits, which do not touch the stills or the kit. The earlier "tests not run" statements in 9.1 and 9.2 are superseded by this line.

### 9.3 Owner feedback: the restrained pulse was invisible; bright look added (owner-directed, needs root review)

**Feedback (owner, after trying the gallery's pulse buttons on one scene and from the top control):** could not tell any lightning was happening. Wanted *a bright-white flash that takes over the whole scene, then quickly fades from the whole scene, while the window stays light for maybe half a second longer before it also fades out.*

**Diagnosis:** the pulse ran as specified; the specification was too weak for what the owner had in mind. Measured peak composite lift of the restrained look was 0.073-0.080 on the glass and about 0.026-0.029 elsewhere (section 9.2), and the room only tinted slightly. That is a subtle brightening, which the progress report and mechanism note had warned about. (Separately, the top "all storm scenes" button flashes only one scene by design: one accepted pulse per request, the rest refused `active`.)

**Change (report-only, additive):** new `animation/lightning-bright.mjs` with `createBrightLightningEffect()` and the curve in `lightning-mechanism.md` ("Bright look"). The gallery has a new control, **Lightning look: bright (default) or restrained**; the restrained effect and its curve are untouched. The measurement harness now reads each pulse's own keyframes, so it works for either look. Everything else (one pulse per accepted event, the shared arbiter and four-second cooldown, refusals, all blockers, reduced motion, watchdog, cleanup) is shared. **The earlier review said "no stronger effect"; this is stronger by the owner's explicit instruction and needs its own root review.**

**Measured (browser, 1280x720 and 390x844, held-pulse composites, positive control first):**

| | 1280x720 storm | 1280x720 storm + lamp | 390x844 storm |
|---|---|---|---|
| positive control: raw clone blind, baked sees pulse, t=0 equals no overlay | yes / yes / yes | n/a (measured directly) | yes / yes / yes |
| animation vs its own keyframes, max opacity error | 0.000001 | 0.000001 | 0.000001 |
| peak at (ms) | 40 | 40 | 40 |
| peak max per-pixel luminance lift (0-1) | 0.894 | 0.911 | 0.894 |
| peak whole-stage mean lift | 0.712 | 0.697 | 0.710 |
| peak glass mean lift | 0.815 | 0.782 | 0.823 |
| duck region mean / max lift at peak | 0.717 / 0.795 | 0.734 / 0.803 | 0.721 / 0.795 |
| share of the stage that lifts | 98.9% | n/a | 98.2% |
| flashing pixels (rise >= 0.10 then fall >= 0.10), 20 ms / 60 Hz / all samples, of the raster | 170,102 / 170,102 / 170,102 of 171,936 | 170,102 of 171,936 | 60,808 of 61,934 |
| largest frame-to-frame step in the merged samples | 0.426 | 0.434 | 0.427 |
| restoration: overlay nodes removed, neutral vs pre-flash reference (rain frozen identically) | yes, diff 0 | yes, diff 0 | yes, diff 0 |

Shape check from the sampled series (storm, 1280): whole-stage mean luminance 0.152 at 0 ms, 0.419 at 20 ms, **0.864 at 40 ms**, 0.641 at 100 ms, 0.359 at 200 ms, **0.180 at 300 ms** (the room is back to normal) while the **glass mean is 0.573 at 300 ms, 0.438 at 400 ms, 0.235 at 600 ms, 0.110 at 800 ms**: the window lingers about half a second longer and then fades, as described. By-eye capture next to the live stage at 40 ms (whole scene washed near white, window brightest) and at 400 ms (room normal, window still light) matched the numbers; geometry and colours matched the live scene. Four storm copies, one request each: 1 accepted, 3 refused `active` (1208x839 grid raster, GRID-LEVEL DIAGNOSTIC): one scene flashes, peak lift 0.894, 170,102 flashing pixels, restoration exact. Peak JS heap growth 74 MB in the aggregate (bound 200 MB).

**What this look does that the earlier brief ruled out, stated plainly:**
- **Lamp:** at the 40 ms peak the lamp's glow region is white (R/B 1.002; before the flash 1.103, at 400 ms 1.096), so the lamp is **not warm at the peak**; it recovers as the scene flash fades.
- **Duck:** no node, transform or halo is added to the duck, but the whole-scene white lights it strongly at the peak (mean lift 0.72).
- **Flash character:** a hard near-white rise over almost the whole scene (a frame-to-frame step of 0.43 in relative luminance), one pulse, at most one per rolling second by the scheduler and one per four seconds from the same page by the arbiter. Under the simplified luminance test this is a general flash over the whole scene area; the study makes no area, frequency or red-transition conformance claim and is not a photosensitivity certification. This is a decision for root and the owner, not a measurement that clears it. Reduced motion, pause, stop and the opt-in checkbox are the controls that exist; the gallery still ships with lightning off.

**Verification status:** the bright effect, its harness generalisation and the gallery selector were exercised in the browser (all numbers above). A new Node test file, `animation/tests/lightning-bright.test.mjs` (curve and 500 ms linger, one pulse and two animations, placement and exact cleanup, duck/lamp untouched, refusals, interruption and watchdog reason, shared arbiter and boundary), **has been written but not run**: the earlier Node authorisation was for one run and has been used. The previously verified 63/63 animation tests covered the restrained look and shared code, which this change does not edit. Not verified, as before: a real-time pulse in this pane (it starves animations of frames when idle, so natural completion and true-speed viewing are unobserved), a real hidden page, the OS reduced-motion setting, devices, and red transitions.

**Owner decision (2026-10-28):** after reviewing the bright look above, the owner chose to **keep it** as the gallery default. This is recorded for root: the large-area, high-contrast flash described above (whole-scene white, lamp white at the peak, duck lit, a 0.43 frame-to-frame luminance step) is the owner-chosen direction for the report-only gallery and still needs root technical review before anything beyond it; it is not promotion, not Stage D device evidence and not a certification. The owner reply did not clearly authorise another Node run, so `animation/tests/lightning-bright.test.mjs` remains written but not run until a bounded run is authorised.

**Node test result for the bright look (authorised by the owner: one bounded run, hard timeout, no background loops, no mutation runs):** `node --test animation/tests/*.test.mjs` on the final source: **69/69 pass, 0 fail, 0 cancelled, 0.3 s** (63 before, plus the 6 bright-look tests: curve and 500 ms linger, one pulse and two animations, placement and exact cleanup with duck and lamp untouched, refusals consuming no budget, every interruption and the watchdog reason, shared arbiter with the 3999.9/4000 ms boundary). The earlier "written but not run" statement for `lightning-bright.test.mjs` is superseded. `tools/check.mjs` and `tools/check-weather.mjs` were not re-run (not part of the authorisation; the stills and kit are untouched). Still unverified, as before: a real-time pulse in a browser, a real hidden page, the OS reduced-motion setting, devices, and red transitions.

### 9.4 Bright-look review (`plan-26-bright-review-01.md`): exception-cleanup repair and focused validation

QP Orch accepted the owner-selected bright direction as the report-only gallery look (whole-scene white, lamp washed at the peak, static duck lit from outside; no production claim) and required one narrow source repair. **No curve, colour, opacity, placement or visual changed, and no browser rerun was done** (the changes are exception-only paths).

**Repairs (`lightning-bright.mjs`, and the analogous path in `lightning.mjs`):**
1. **Node registration.** Each overlay node is now put in the cleanup list the moment its insertion succeeds, in both the before-sibling and the append branch. Before, the second node of the pair was only registered after both inserts, so a failure on the second insert left the first overlay in the DOM, broke exact restoration and blocked later requests (`flash-nodes-present`). The restrained effect had the same shape (`defs` then `room`) and is fixed the same way.
2. **Watchdog scheduling.** `schedule(...)` is now inside its own try block: if it throws after the two animations exist, `cancel()` runs (animations cancelled, every node removed, no timer) and the error propagates, so no pulse runs without a returned handle. The controller then returns the accepted ticket already settled `cancelled` (`effect-start-failed`) and the budget stays spent.
3. **Docs.** `lightning-mechanism.md` header now says the restrained look is owned by `LIGHTNING` in `lightning.mjs` and the bright look by `BRIGHT` in `lightning-bright.mjs`, with independent constants.

**New tests (both `lightning.test.mjs` and `lightning-bright.test.mjs`, two each, 4 in total):** (a) the SECOND overlay insertion throws after the first succeeded (confirmed by an insertion counter); (b) the watchdog scheduler throws after the animations were created (confirmed by the animation count). Each asserts exact DOM restoration (`serialize()` equal to the pre-request value), no live animation left over, no timer armed, accepted-then-cancelled ticket with reason `effect-start-failed`, arbiter stats accepted 1 / cancelled 1 / finished 0, nothing active, cooldown refusal 100 ms later, and a successful later request exactly 4000 ms after the failed start once the injected fault is removed (timer armed then cleared on finish, DOM exact again). Existing successful, interruption and refusal tests are unchanged.

**Validation (one focused run, authorised by the review):** through the existing bounded launcher `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1` (read-only), serial, explicit paths, no glob, no watcher, `node.exe --test --test-timeout=15000` over the seven animation test files (`arbiter`, `controller`, `flash-metrics`, `lightning`, `lightning-bright`, `rain-motion`, `still`), the launcher's 1 GiB heap, 2 GiB sampled private-byte and 90 s limits. Result: **exit 0, 73 tests, 73 pass, 0 fail, 0 cancelled, 0.58 s, no stop reason, no cleanup notes, peak sampled private memory 4 MB** (the launcher samples every 500 ms, so a sub-second run is barely sampled). 73 = 69 before + 4 new. `tools/check.mjs` and `tools/check-weather.mjs` were not run (not part of the authorisation; stills and kit untouched). Other Node processes on the machine were not touched.

**Still unverified, unchanged:** a real-time pulse in a browser (natural completion and true-speed look), a real hidden page, the OS reduced-motion setting, red-transition analysis, representative-device performance, and framings beyond those tested for the finite 14000-unit overlay. No conformance, safety or production-readiness claim; Stage D and the separately gated Stage E remain outstanding.

## 9.5 Stage D: lifecycle and performance evidence (bounded; one fast laptop, one isolated headless Chrome; not a certificate)

Authorised after Stage C was technically accepted (`plan-26-stage-d-sonnet-handoff.md`). The matrix, hardware and instrumentation were recorded **before** measuring in `animation/stage-d-plan.md` (commit `007e58b`). Visuals are the owner-selected ones, unchanged. Nothing is promoted into the kit or production; no audio, other rooms, kit hooks, TV or music, or Plan 25 wiring.

**What was and was not available.** Measured: LENOVO 83DX, AMD Ryzen 7 8845HS (8 cores / 16 threads), 31.3 GB, AMD Radeon 780M, Windows 11 (26300), 1920x1080 at 144 Hz, AC power; Google Chrome 156.0.8078.73 driven headless (`--headless=new`, temporary profile, own debugging port, GPU left at Chrome's default; Chrome reports ANGLE Direct3D11 on the Radeon 780M with GPU compositing and rasterisation enabled); Microsoft Edge 156 is installed but was not driven. **Not available: a representative slower student or lab machine, a second browser, a 60 Hz or low-power case, and the actual OS reduced-motion setting** (I changed no Windows setting). Throttling and the desktop are not substituted for them. The Claude built-in browser pane was tried again and produced **0 animation frames in 3.5 s** while unfocused, so it was not used for timing or performance and the benchmark was not repeated. An **owner-run checklist** for the missing machines and browsers is `animation/stage-d-owner-checklist.md`; every row there is **pending**.

**How it ran.** One serial helper (`animation/tools/stage-d-cdp.mjs`, probes in `animation/tools/stage-d-page.js`) through the established bounded launcher `bounded-node-run.ps1` (1 GiB heap, 2 GiB sampled private bytes for the owned tree, 90 s wall limit): **exit 0, 31.8 s, peak sampled private memory 836 MB for the whole Chrome tree, no stop reason**. It used the owner's already-running server at `localhost:5173` (not started or restarted), no owner tab, profile or storage, and exactly **one accepted pulse in the whole run** (arbiter accepted count 1). Full data: `animation/stage-d-results.json`. The helper's temporary Chrome profile could not be deleted by the helper (`EPERM`, Chrome still releasing files); I then removed that one directory (`...\Temp\quackpot-plan26-d-JzDHe0`) myself. Cadence below is requestAnimationFrame cadence in a headless page that Chrome paced at about 144 frames per second here; **rAF cadence is not compositor or GPU cost, and GPU/compositor time was not measured at all**. CDP `Performance.getMetrics` supplies main-thread task, script, layout and style-recalculation time.

**Matrix results** (each cell one 3 s foreground window, 1280x720 at dpr 1 unless stated, one active scene unless labelled):

| Cell | frames / fps | median / p95 / max frame (ms) | frames >25 ms / >50 ms | long tasks | timeline vs wall | running animations | main-thread task time in 3 s (per frame) | script / layout / style recalc ms | layouts |
|---|---|---|---|---|---|---|---|---|---|
| 1 still baseline (storm + lamp, Show still) | 410 / 136.4 | 6.9 / 7.1 / 8.0 | 0 / 0 | 0 | 1.001 | 0 | 81.7 ms (0.20) | 12.1 / 2.3 / 0.3 | 13 |
| 2 rain, running | 432 / 143.7 | 7.0 / 7.1 / 7.6 | 0 / 0 | 0 | 1.001 | 9 | 430.9 ms (1.00) | 11.4 / 27.3 / 49.9 | 434 |
| 3 storm + lamp, running | 432 / 143.7 | 7.0 / 7.1 / 7.5 | 0 / 0 | 0 | 1.002 | 12 | 439.2 ms (1.02) | 11.9 / 27.1 / 54.7 | 434 |
| 4 storm + lamp with the real-time pulse | 433 / ~144 | 6.9 / 7.1 / 8.0 (during the pulse, 116 frames) | 0 / 0 | 0 | n/a | 12 + 2 overlays | 453.4 ms (1.05) | 26.9 / 27.2 / 52.7 | 433 |
| 5 DIAGNOSTIC four storm scenes (all four visible) | 432 / 143.7 | 6.9 / 7.1 / 7.5 | 0 / 0 | 0 | 1.002 | 48 | 960.5 ms (2.22) | 11.9 / 55.7 / 139.7 | 434 |
| 6 storm + lamp, 390x844 dpr 2 (viewport emulation only) | 432 / 143.7 | 7.0 / 7.1 / 7.3 | 0 / 0 | 0 | 1.004 | 12 | 449.0 ms (1.04) | 10.4 / 24.0 / 47.1 | 434 |

Reading it, with limits: on this machine every cell held the display-rate cadence with **no frame over 25 ms and no long task**, and the animation timeline advanced in step with the wall clock (ratio 1.00). **The cost that does appear is main-thread time**: a running scene costs about 1.0 ms of main-thread time per frame (the still about 0.2 ms), four visible scenes about 2.2 ms, and each frame forces a style recalculation and a layout (434 per 3 s against 13 for the still), because these SVG transform and opacity animations run on the main thread rather than being handed to the compositor. At this machine's speed that is about 15% of one core's wall time for one scene and 32% for four; **on a CPU several times slower or at a different refresh rate this would be the first thing to grow, and that is untested**. JS heap stayed at 3-4.4 MB in every cell. Whole-tree Chrome private memory was sampled only by the launcher (peak 836 MB, not per cell). This does **not** establish a general performance claim, nothing about a slower machine, nothing about a visible window on a real display, nothing about the GPU or compositor, and nothing about other browsers.

**Real-time bright pulse, through natural completion (cell 4, one pulse, requested 400 ms into the window):** accepted; **ticket settled `finished` at 812.9 ms** after the request (nominal 800 ms plus frame quantisation of about 7 ms); first overlay visible at the first frame, 12.9 ms after the request; peak opacity 0.998 at 47.7 ms (nominal 40 ms; sampling resolution about 7 ms); **scene flash back to 0 at 311.7 ms (nominal 300), window back to 0 at 805.3 ms (nominal 800): the window tail after the scene flash was 493.6 ms** (nominal 500); overlay nodes gone at 812.3 ms and 0 at the end; **0 stale overlay frames after settle**, `flashActive` false; a request 500 ms after settling was **refused `cooldown` (retry in 2687 ms)** with no second flash, and the arbiter's next-allowed time was exactly 4000 ms after the pulse's start; arbiter stats: accepted 1, finished 1, cancelled 0, refused-cooldown 1. 117 frames were sampled through the pulse at a median of 6.9 ms (p95 7.1, max 8.0, none over 25 ms). This is real-time timing evidence in a headless page; **it is not a viewed observation** (nobody watched this window). Whether the owner has watched this bright pulse at true speed on a real display is not recorded here; a viewed true-speed observation on the teacher and lab machines is on the checklist, not claimed.

**Lifecycle (this Chrome, no flashes started):**
- **Real hidden page: reached.** Creating and activating a second tab put the gallery tab at `visibilityState: hidden`; the scene went `paused` with blocker `hidden` (12 animations kept, frozen), a flash request was refused `blocked:hidden`, and after returning the scene was `running` again with 12 animations.
- **Reduced motion (browser-emulated, `Emulation.setEmulatedMedia`, NOT the actual OS setting):** the scene went to `still` with blocker `reduced` and 0 animations, a flash request was refused `reduced-motion`, and after clearing the emulation it was `running` with 12 animations (live, no reload).
- **Actual OS reduced-motion setting: not tested** (blocked: it needs a Windows setting change that I did not make); checklist item 4.
- Earlier-recorded limits that still stand: the built-in pane starves animations of frames when idle and unfocused, and fake-time tests cover completion paths that are now also seen in real time in this one Chrome.

**Red transitions and composite colour: still incomplete.** Neither the blue-white overlay colours nor the lifts measured earlier settle whether the rendered composite contains saturated-red transitions; the study's general-flash numbers (section 9.3: one pulse, about 99% of the scene area, peak lift 0.89, largest frame-to-frame step about 0.43) are unchanged and carry no area or compliance pass. **Proposed (not run, awaiting root's decision):** a small diagnostic on the same held captures the harness already takes: per pixel and frame, flag a pixel as saturated red when R / (R + G + B) is at least 0.8, and count pixels whose flag flips between the pre-flash reference and any frame (and their luminance-independent size of change), reporting totals over the raster with no area claim. If root declines it, red transitions remain a documented production-readiness limitation. The checks `tools/check.mjs` and `tools/check-weather.mjs` were not run in Stage D (not part of its scope; stills and kit untouched).

**What Stage D leaves for the owner and root:** the owner-run checklist (teacher machine, representative slower student/lab machine, a second browser, a real viewed true-speed pulse, the actual OS reduced-motion setting); a decision on the red-transition diagnostic; and, only if wanted, a Stage E proposal (exact runtime ownership, API, lifecycle, save and credits) that this stage does not write or imply. Stage D is evidence collection, not a certificate.
