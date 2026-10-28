# Plan 24 progress — apartment art extraction

Status: implementation and rendered comparison complete; **stopped for owner visual-fidelity comparison**. Plan status, packet, runtime, core, global CSS, package scripts and dependencies are untouched. Nothing is pushed. Nothing in `src/` imports the kit or any report.

Commits (all explicit-path, local): `b2ed380` proposal · `f62beb7` approval (root) · `c5c3e6f` shared extraction + harness · `4914f59` rooms/desks/API/tests · `5749f48` gallery, manifest, archived tools · `c1c0e43` browser slot (root) · `5237a2a` rendered-comparison fixes + numeric comparison tool · this report (last).

## 1. What exists

`src/assets/apartment/` — pure static SVG-string ES modules (`.mjs`), no DOM, timers, counters or global state; output is deterministic for a caller-supplied `idPrefix`.

| Area | Modules |
|---|---|
| Public API | `index.mjs`: `renderDuck(view, {idPrefix, decorative, label})`, `renderScene({area, idPrefix, duckView, framing, light, furnishings, phone, overlay, decorative, label}) → {svg, meta, lighting}` |
| Ducks (six representations: five views + overhead) | `duck/views.mjs` (byte-identical copy of frozen `duck-views.js`), `duck/overhead.mjs`, `duck/index.mjs` (registry, `resolveDuckView` with explicit `meta.fallback`) |
| Shared props | `props/{prims,decor,living,kitchen,bedroom,toys}.mjs` — verbatim builders |
| Rooms | `rooms/{camera,specs,scene}.mjs` — living, kitchen, bedroom; wide and medium; per-item `furnishings: {couch, tv}` |
| Desks | `desk/{phone,side,top}.mjs` — side and top-down, bounded phone text |
| Light | `lighting/defs.mjs` (verbatim defs), `lighting/modes.mjs` (scoped CSS + in-SVG overlay; `overlay:'none'` plus returned `lighting` hints for hosts) |
| Core | `core/{constants,svg,ids}.mjs` |
| Docs/tests | `README.md` (module graph/contracts), `apartment.test.mjs` (12 `node:test` tests; not wired into package scripts) |

Source → module mapping: [extraction-manifest.md](extraction-manifest.md) (60 rows: frozen symbol, frozen line range, new module/export, method, fidelity check, notes). Intentional differences and new code are listed there.

## 2. Evidence

### 2.1 Source-side (Node; run before and after the browser pass)
- `tools/fidelity-check.mjs`: **89/89**. Baseline blobs are hash-verified before use; every room/framing/duck view, the sold living state, both desks and the phone match the frozen generators after bijective id normalisation. Negative controls (changed digit, colour, removal, dangling ref, duplicate id, text, wrong blob, ill-formed XML) are all detected. This is **structural, pre-bake** equality only.
- `node --test src/assets/apartment/apartment.test.mjs`: **12/12** (validation, truthful fallbacks, id uniqueness across repeated instances, escaping, purity, no report imports).
- `npm run build` passes; the kit is not part of the production bundle.

### 2.2 Rendered comparison (one isolated tab driven only by me; no Haiku browser use)
Method: `gallery.html` drives the **unchanged** Plan 10 page in a same-origin iframe through its own radios and renders the kit at the baseline's measured stage size. `tools/browser-pixel-compare.js` then serialises both stages (baseline with its own CSS, kit with the gallery CSS) into `<foreignObject>` SVG images, rasterises both with the same browser and reports per-pixel max-channel difference. All figures below are from that tool at the final source, except where stated. Mean is over all stage pixels (0–255 scale); "p24" is the share of pixels differing by more than 24.

Matched stages: baseline page width 1200 → stage **1120×540**; width 375 → stage **335×310** (same size on both sides in every case; checked each time).

| Check | 1120×540 (desktop) | 335×310 (narrow) |
|---|---|---|
| **Neutral light**, 10 states (3 rooms × wide/medium, desk side, desk top, sold living × wide/medium) | mean 0.00, max ≤2 | mean 0.00, max ≤3 |
| Neutral light, duck front/rear/high/low in every room × framing (24) and desk-side duck views (5–6) | mean 0.00, max ≤2 | mean 0.00, max ≤3 |
| **Window light**, 10 states | mean 0.50–1.05, max 8, p24 = 0 | mean 0.87–3.32, max 12, p24 = 0 |
| **Warm light**, 10 states, default in-SVG overlay | mean 4.08–10.92, max 54, worst p24 13.8% (kitchen wide) | mean 12.59–34.16, max 170, worst p24 50.2% |
| **Warm light, host mode** (kit `overlay:'none'` placed in a clone of the baseline stage, baseline's own `.lighting` CSS driven by the returned hints) — living wide/medium/sold, kitchen wide/medium, bedroom wide/medium, desk side, desk top | mean ≤0.16, max ≤1 | mean ≤0.17, max ≤1 |

What this establishes:
- **Art, medium crop, letterboxing, full scene extent, strokes, shadows, blend modes and baked lamp-on/lamp-pool classes are identical to the baseline** at both stage sizes in neutral light (max ≤3 of 255 is anti-aliasing noise) and, via host mode, in warm light.
- Five standalone duck drawings vs the baseline's five-view model sheet, rasterised at 720×540: **max difference 0 including alpha** (pixel-identical). The overhead duck has no standalone baseline; it is covered by desk-top (neutral identical).
- Duck selection: front and rear change the same number of pixels in baseline and kit (living wide 2,220 / 2,325; desk side 8,217 / 8,668). High and low change nothing in either (horizontal cameras do not show them); the kit reports the fallback in `meta.fallback` and the gallery shows it (section 4 table).
- Repeated instances on one page (every gallery scene and duck drawing, each with its own prefix; the 12-scene stress block plus the other sections): 518 ids, 0 duplicates, 447 `url(#…)` refs, 0 dangling; same-prefix negative control flags 19 duplicates.

### 2.3 The one material difference: default in-SVG lighting overlay
Found and partly fixed during this pass:
1. **Fixed (`5237a2a`).** The first warm result was materially off (desktop mean 9.5–12.9, max up to 64, p24 13–25%). Cause: CSS gradients interpolate in premultiplied alpha, SVG gradients in straight colour, so the mid-pool was too light and warm. `lighting/modes.mjs` now samples the CSS curve into 17 stops (`premultipliedStops`). Desktop warm means fell to 4.1–10.9 (for example living wide 10.3 → 7.2, bedroom wide 12.9 → 5.3, bedroom medium 10.2 → 4.1; kitchen wide 12.5 → 10.9). Diagnostic only: with the baseline iframe forced to a stage of 1000×540 (close to the scene's 16:9) warm means were 1.8–3.3 (max ≤29).
2. **Remains, intentional, not a bug — owner decision.** The original page anchors the pool as percentages of the **host stage**; the kit anchors it to the **scene box** (`overlayMarkup`). On a stage that is not 16:9 the scene is letterboxed (`xMidYMax meet`) and the two pools differ in position and spread. The residual is largest at narrow width (335×310, aspect 1.08): the baseline pool sits as a tall ellipse centred high in the stage, away from the lamp, while the kit pool stays centred on the lamp. Looking at the rendered pair, the kit's placement follows the lamp better; the baseline's is the original (owner-tuned at desktop) look. At 1120×540 the same effect is smaller (mean 4–11). Window light shows only a small gradient-axis difference of the same kind.
3. **Options for the owner**, no change made: (a) keep the box-anchored default (self-contained SVG; light follows the lamp); (b) hosts that want the original page behaviour pass `overlay:'none'` and apply the returned `lighting` hints with the original CSS — verified above to reproduce the baseline to max 1; (c) request a stage-anchored mode (new scope: needs host stage geometry).

### 2.4 Mixed couch/TV states (unbaselined derived combinations)
Inspected separately in neutral light, desktop, wide framing (kit only; no baseline exists):
- Each flag changes only its own item: difference images between the four states show only the sofa silhouette or only the TV/screen silhouette; nothing else moves.
- A removed item leaves its pale placeholder mark (`#c9c3b8`, 55% opacity) drawn per item behind the floor lamp, plant and rug, which stay in front. No stray shadow or half-drawn furniture was visible.
- Medium framing shows neither piece: all four states are pixel-identical there (0 px differ by >12), as are both-present/both-removed vs baseline.
- Not fully explained: the bounding box of pixels above a low threshold differs between some state pairs (the sold-vs-one-item pairs extend further left than the full-vs-one-item pairs). The amplified difference images show only the item silhouettes and the faint placeholder, so I attribute it to the low-contrast placeholder crossing the threshold; I did not trace it numerically. Warm/window light and narrow width were not inspected for mixed states.

## 3. Differences from the baseline (complete list)
1. Default overlay anchoring and premultiplied sampling — section 2.3.
2. No 0.2 s fade on light change (static output).
3. Mixed couch/TV states exist (derived); both-present and both-removed equal the baseline.
4. Phone copy is parameterised, bounded, XML-escaped (defaults byte-equal to the baseline copy).
5. Ids use one required caller prefix instead of an instance counter; markup is otherwise baseline-identical.
6. The overhead duck can be rendered standalone (thin wrapper around the same drawing).
7. Not extracted: page controls, `update()`, label maps, candidate grid, page CSS (scene-relevant rules live in `lighting/modes.mjs`).

## 4. Sizes (UTF-8 length of one scene string)
KiB, neutral / window / warm: living 17.7 / 18.0 / 19.1 · kitchen 20.9 / 21.1 / 22.3 · bedroom 22.2 / 22.5 / 23.6 · desk side 16.1 / 16.4 / 17.5 · desk top 33.3 / 33.5 / 34.7. Warm is about 1 KiB larger after the stop sampling. Ducks (approx. KB): front 3.5, side 6.7, rear 2.7, high 2.4, low 13.0, overhead 3.9. Tests bound scenes <64 KB and ducks <24 KB. No gzip or minification was done.

## 5. Authoring method availability and limits
- Mechanical parts (props, duck views, defs, constants) were sliced from the hash-verified frozen blobs by `tools/extract-verbatim.mjs` rather than retyped; the first run caught a dedent bug in multi-line template literals, fixed and re-verified.
- Rooms and desks were extracted by two Haiku workers (2 of the 4 allowed tasks, disjoint folders, no nesting, no browsers), then re-verified by me with the harness; their outputs were treated as data.
- `authoring-tools/` archives nine helper scripts with machine paths redacted (README discloses it). It is **not** a reproducible build: rooms, desks, props and lighting were authored by hand/patch and have no generator; Haiku scratch scripts are not archived; the scripts were not re-run.
- Ongoing authoring: edit the `.mjs` modules directly; run `fidelity-check.mjs` (pre-bake equality to the frozen baseline) and the interface tests; use the gallery and `browser-pixel-compare.js` for rendered checks.

## 6. Coverage and limits (what was not done)
- **Real browser zoom (100/200/400%) was not tested.** The pane does not support it. The gallery's "CSS crop zoom" is CSS scaling; I looked at one on-screen 2× crop (desk side, warm: duck, mug, phone, shadows matched by eye; glow spread differs as measured) but that is not browser zoom.
- **The slot's 390×844 viewport was not run.** Narrow results use the baseline at page width 375 (stage 335×310) inside a 1280×720-emulated viewport; the gallery page's own layout at a 390-wide viewport is unchecked. Desktop used 1280×720 emulation, but the app pane is narrower and screenshots are downscaled to about 800 px; every number above comes from the in-page rasteriser, not from screenshots.
- The rasteriser measures the browser's `foreignObject` raster of the DOM, not on-screen paint, and ignores the 0.2 s fade. The method was validated by neutral-light results of exactly 0 and by images viewed on screen.
- Warm/window were compared in every scene state above but duck-view variants only in neutral light (warm desk-side duck views were measured once and showed the same overlay-only difference).
- Mixed states: neutral, desktop, wide only (section 2.4). Other lights/widths unchecked.
- No cross-browser check (one Chromium-based pane). No real device. No accessibility audit beyond the `decorative`/`label` root attributes tested in Node.
- Two gallery defects were found and fixed this pass (comparison never rendered: `render()` awaited its own promise, and `requestAnimationFrame` never fires in a hidden pane). Vite's dev server also full-reloads the page whenever a served file is edited, which interrupts running scripts; keep that in mind when scripting the gallery.

## 7. Repair recommendations (separate from extraction; not done here)
- Weak high and low duck views, and their absence from horizontal-camera scenes (rooms always show a side/front/rear duck).
- The duck is small in wide room shots.
- Schematic detail on the top-down desk.
- Owner decision on lighting overlay anchoring (section 2.3), and whether a stage-anchored mode is wanted for Plan 25 integration.
- If mixed couch/TV states will ship, an owner look at them (unbaselined).

## 8. Haiku budget and process
2 of 4 bounded extraction tasks used (rooms; desks); none concurrent beyond the allowance; no nested agents; no Haiku browser tabs. Browser: one isolated tab (`tab-52`) of mine, closed; viewport override reset; the pre-existing `seed` tab, server and storage untouched; one auto-opened `file://` copy of the gallery (from my own edit) was closed. Slot released with this report.

## 9. Gate
Owner visual-fidelity comparison is the remaining gate: gallery at `http://127.0.0.1:5181/Quackpot/reports/development/plan-24-apartment-art-extraction/gallery.html` (needs the existing dev server). Plan 25 (desk/phone integration) is separate.
