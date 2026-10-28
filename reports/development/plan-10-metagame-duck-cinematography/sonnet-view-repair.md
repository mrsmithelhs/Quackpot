# Plan 10 — Sonnet whole-object view repair (2026-10-27)

Handoff: `reports/orchestration/plan-10-sonnet-view-handoff.md`. The owner supplied four Tinkercad screenshots (front, right side, rear three-quarter, high rear) as orientation/proportion witnesses only. The owner also asked, in this session, for Haiku subagent experiments and a Haiku web search for extra reference images; both were run (the handoff's "no additional subagent budget" is superseded by that instruction).

**Rendered verification:** done in one isolated tab of the in-app browser (owner-granted slot) on the approved route `http://127.0.0.1:5181/Quackpot/reports/development/plan-10-metagame-duck-cinematography/preview.html`; the shared server was not touched. Viewport 1200×800 (DPR 1.25), reset to the pane default afterwards. Owner visual judgment is still the gate.

Observed in the browser: the five-view contact sheet (five unique-id SVGs, no console errors beyond Vite's debug lines); the candidate-comparison images; the live stage at medium (rear, neutral) with the duck sitting on the tabletop; desk close-up under the warm lamp for low and rear, and neutral for high — duck legible, outlines continuous, no clipped shadows or detached bill/wing seen. Close crops of rear, high and low were inspected by enlarging the live SVG with CSS in an overlay (760 px wide): **this is CSS scaling, not browser zoom.** **Actual browser zoom at 100/200/400% was not observed**: `Ctrl+=` did not change DPR or visual-viewport scale in this pane. Front and side were checked only at contact-sheet size and via the offline raster. Screenshots were captured in the harness cache, not saved into this folder. A subagent had opened a few `file://` tabs of its own SVGs in the pane during the experiments; I closed them before this check.

## Diagnosis

1. **No camera.** The old views were one front-view body path reused with small edits; "rear", "high" and "low" differed from "front" by moved paths, not by which surfaces face the viewer.
2. **Head turned, body not.** In the old rear view the body outline and both wings stayed front-like while only the face moved, so it read as a turned head on an unchanged body.
3. **High/low were front views with a shifted head.** There was no crown/back exposure in high, no underside plane in low, and no body-over-head occlusion when looking up.
4. **Feature visibility was not derived.** Both eyes and both wings were forced into views where one side faces away.

## Landmark model and camera convention

Duck-local units (+z front, +y up, body length ≈ 120): squat body (half-width 42, half-length 60, 36 above / 26 below centre, flattened base); head sphere r 40 at (0, 52, 10) — about as wide as the body (Tinkercad front/side captures); spatula bill (upper + lower mandible) ~15 units out from the head front below the eye line; eyes on the head sides ~0.5 radius off the face centre; wings as flattened lobes on the body flanks, behind mid-body, upper half; raised tail flick at the rear top.

Camera: azimuth from the front toward the duck's left, elevation above the table; perspective distance 330 units; same landmark model for all views.

| view | azimuth | elevation | eyes shown | wings shown | tail | underside |
|---|---|---|---|---|---|---|
| front | 35° | +12° | both (far narrow) | near; far hidden | behind body | no |
| side | 90° | +5° | near only | near only | in profile | no |
| rear | 148° | +16° | none | near + far sliver | in front of body | no |
| high | 35° | +52° | both | both | peeks over back | no |
| low | 35° | −16° | both | near (far hidden) | hidden | yes |

High and low keep the front azimuth, so only elevation differs from front. Painter rules: head over body when the camera is above the body top, under the body edge when below (low); near wing over body, far wing before body; bill after head when it points toward the camera, before when away; tail behind the body from the front, in front from behind; eyes only on surfaces facing the camera.

**Drafting aid disclosure.** To get silhouettes consistent across views I used a throwaway projection script (outside the repo, in the session scratchpad) that projects those ellipsoid/sphere landmarks per camera and emits silhouette paths, tracing guides (`haiku-experiments/guides/`) and one full draft set (`sonnet-candidates/`). It is not shipped, is not a build step and adds no dependency. The shipped SVGs are static. If the owner considers this a 3D source pipeline in effect, `sonnet-candidates/` can be dropped and the selection redrawn by hand.

## What was selected for `duck-views.js`

After comparing ten Haiku experiments (improve-a-copy and from-scratch for each view, all given the same spec and guide silhouettes) against my projection-baked set (`candidate-grid-offline.png`), the per-view selection is:

| view | selected drawing | why |
|---|---|---|
| front | `haiku-experiments/front-scratch/duck.svg` | wing sits on the body, two-part bill, readable far-eye sliver |
| side | `haiku-experiments/side-improve/duck.svg` | cleanest tail flick and wing lobe; my draft's tail read as a ball and its wing as a flat pancake over the head |
| rear | `haiku-experiments/rear-scratch/duck.svg` | broad turned body, near wing on the left flank, no eyes, bill only a sliver at the head edge, tail at right |
| high | `haiku-experiments/high-improve/duck.svg` | most legible crown / foreshortened bill / flank wing |
| low | `haiku-experiments/low-improve/duck.svg` | visible underside rim, body edge crossing the lower head |

Each was re-wrapped with the shared header (viewBox, bottom alignment, aria-label), shifted ≤4 units for common centring/bottom, and otherwise left as the subagent drew it. Exports keep the keys `front side rear high low` and the `label/note/svg` interface. The unselected variants stay in `haiku-experiments/` and `sonnet-candidates/` and are shown in the new "Candidate comparison (diagnostic)" section of `preview.html`.

## Spatial improvements in the difficult views

- **Rear:** the body outline is now the turned rear mass, not the front-view blob — a broad back, near wing on the left flank overlapping the body, no eyes, tail flick at the right edge, and the bill reduced to an orange sliver clearing the far-left head edge. The head sits over the body with a nape shadow.
- **High:** the crown is the dominant shape, the body compresses behind/below it, the bill foreshortens toward the lower left beside the near eye, and the near wing runs along the flank at an angle instead of a front-view lobe.
- **Low:** a shaded underside plane with a rim line is visible below the body; the body's top edge crosses and hides the lower head; the bill is drawn from below with the lower mandible in front.

## Remaining issues (not resolved)

- **High still reads closer to a plump three-quarter front view than a true look-down.** The "back of body above head" cue is mostly hidden because the head covers it at this elevation.
- **Low reads partly as a bowl/cylinder with a flat plate base**; the bill is two stacked pills rather than a spatula seen from below.
- **Head is a nearly perfect circle in all views** (side, rear): it reads as a ball stacked on the body with a weak neck transition. This follows the sphere in the landmark model; the Tinkercad captures show a similar sphere but the drawn neck join is soft.
- **Rear head is a plain ball**; no nape detail beyond a rim highlight.
- Wing on the near side is a lobe that is drawn rather than moulded in front and rear; the tail flick looks ear-like in the high view.
- Mixed authorship: strokes, shading offsets and highlight treatment are close (shared palette/spec) but not identical across views.
- Not checked: real browser zoom (100/200/400%); front/side close crops and wide framing; window-light and mobile-width layouts. The `.duck` drop-shadow and lamp overlay are unchanged.
- Staging mismatch: the high-angle duck sits in an eye-level room and desk, so the horizon and tabletop do not match a look-down camera; the low view shows its underside while resting on the desk. This is inherent to dropping elevation variants into one fixed room composition.
- High view: the near eye touches the bill outline.
- Not used: web references gave no head/bill/wing ratios (`haiku-experiments/references.md`); proportions come from the owner's captures.

## Files

- Changed: `duck-views.js` (all five views), `preview.html` (id-uniquifying render helper replaces the old body-path regex; compact candidate comparison section and CSS), `proposal.md` (dated geometry approach).
- Added: `sonnet-view-repair.md`, `haiku-experiments/` (SPEC, guides, ten experiment folders with `duck.svg`, `notes.md`, `render.png`; `references.md`), `sonnet-candidates/` (five projection-baked drafts + two offline contact-sheet PNGs).
- Not touched: `src/`, packet/status/index, canonical design, shared assets, apartment/desk/lamp CSS, the shared 5181 server.

## Desk staging revision (owner-authorized scope expansion, 2026-10-27)

The owner found the old desk close-up confusing: upright objects and flat objects were drawn from different cameras, so it was neither a top-down nor a side view. `preview.html` now offers two separate desk compositions in place of the old single "close" shot, each with ONE camera for every object (see `desk-references.md` for the research and the game's real phone dimensions):

- **Desk — side view (P10-C03):** eye-level horizontal camera; the tabletop is a thin band with a front edge, upright objects show their fronts, one light direction (lamp at the left, matching the duck's upper-left shading). Home-office set: lamp, duck, mug, phone on a stand, books and a succulent. The duck is drawn with its front, side or rear view (High/Low need other cameras and fall back to the Side view with an on-page note).
- **Desk — top-down (P10-C04):** camera straight above; every object is a footprint, shadows fall to the lower right away from the lamp at the upper left. Student/craft set: duck, phone lying flat, notepad, sticky note, pencil, keyring with keys, lip balm, coins, lamp seen from above. This scene uses an extra hand-drawn overhead duck (head circle, bill ahead, body oval, wing lobes, tail bump) embedded in `preview.html`; it is not one of the five views in `duck-views.js`.
- **Phone:** redrawn at the game's desk-phone proportions (9:17, bezel, navy screen, 9:41 status row, QUACKPOT invitation text, home bar); the old preview phone was 0.82 wide-to-tall and tilted.
- **Scale:** one scale for all objects (2.2 scene units per mm) with assumed real sizes; the repo specifies none, and the game's own UI shows the duck far larger relative to the phone than physical proportions.
- Removed: the old combined desk CSS/markup (papers, pen, keyring, lip balm, phone-stand, `desk-lamp` divs).

Browser checks (same isolated tab, 1200×800 and 375×812): both scenes in neutral and warm-lamp light; side desk with side/rear/high duck selections; top-down at mobile width (no horizontal scroll); no console errors. Not checked: window light on the desk scenes, real browser zoom, the overhead duck enlarged, other duck views on the side desk beyond rear/high.

Known weaknesses: the overhead duck is simple and reads small beside the phone at physical scale; the lamp shade in the top-down view overlaps the notepad corner; the top-down lamp arm, keys and lip balm are schematic; the side desk's phone has no lean-back perspective; shot/view IDs in the status text still show the selected view's ID even when a different duck is displayed.

## Top-down desk fixes and apartment areas (owner-authorized `preview.html` expansion, 2026-10-27)

**Top-down desk, owner feedback applied:** shadow offsets now scale with each object's height above the desk (pencil 4 px, notepad 5, keys 4, phone 7, lip balm 8, coins 2.5, duck about 20) and no longer sit far from flat objects; the sticky note has no shadow because it is stuck to the paper; coins gained a reeded rim, inner ring, star or "Q" emblem and highlight arc; the lamp head moved toward the top-left corner with a short neck; the lamp now throws a soft warm pool (screen-blended) that brightens items within its radius, and in warm-lamp mode each shadow points directly away from the lamp (neutral and window modes keep one ambient direction).

**Apartment areas:** the Wide/Medium living room (previously CSS boxes) is rebuilt as an SVG scene, and kitchen and bedroom/toy-shelf areas were added, all on one small pinhole-camera model: each object is drawn as a front elevation at its real depth and scaled by focal length over depth, so fridge, couch, TV and a toy-sized duck keep consistent proportions; tabletops and shelf planks are drawn as receding surfaces; camera height is set per room so the surface under the duck lands in the lower third.
- **Living room:** window with curtains, TV on a console, floor lamp, framed landscape art, couch with cushion, plant, rug, coffee table with mug and magazines; a "Couch and TV sold" state shows pale wall marks where they stood (the design's visible emptying).
- **Kitchen:** fridge with magnets, tiled wall, base and upper cabinets, stove with a pot, hood, kettle, toaster, jars, window, breakfast bar with a mug, a fruit bowl and a pendant lamp (the bowl was redrawn after owner feedback: a rimmed shallow bowl on the bar surface, smaller than the first attempt).
- **Bedroom and toy shelf:** bed, window with curtains, night-sky art, bedside table with lamp and clock, and a four-plank toy shelf (teddy, ABC blocks, robot, truck, stacking rings, ball, bunny) with the duck among the toys on the middle plank.
- **Controls:** Apartment area (living, kitchen, bedroom, desk side, desk top-down), Framing (wide/medium, rooms only), living-room state, view, light ("Warm lamp": floor lamp, pendant, bedside lamp or desk lamp depending on the area). Shot IDs P10-C01…C08.
- Story context for these areas: `apartment-story-beats.md` (Haiku explorer). Haiku was not used to draw these scenes.

**Browser-checked** (isolated tab): all ten area-by-framing combinations free of NaN/undefined SVG attributes; living, kitchen and bedroom in neutral and warm light; top-down warm lamp; phone width (375 px) without horizontal scroll. **Not checked:** window light in each room, medium framing of every room beyond bedroom at phone width, real browser zoom.

**Known weaknesses:** the duck is physically small (about 64 mm), so wide room shots show it at 35–60 px and Medium framing is needed to see it; the toy shelf is large in the bedroom frame and its bottom row is partly cropped; the bed is cropped at the right edge; the kitchen and bedroom camera heights are tuned by eye; the living-room couch and TV share the back wall, a stage-set convention; floor planks and rugs are schematic; the other apartment areas (entryway, empty-desk pawn scene) are not drawn.
