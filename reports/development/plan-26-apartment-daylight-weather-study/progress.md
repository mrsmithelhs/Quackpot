# Plan 26 progress — living-room still daylight (Stage 2)

Status: **ready for owner look at the daylight comparison.** Weather stills (Stage 3) are not started and wait for the owner's stage permission. No packet, status, push, production import or kit change. Plan status is unchanged.

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
