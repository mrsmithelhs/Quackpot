# Plan 24 — extraction interface and ownership proposal

2026-10-27. For root approval before any `src/assets/apartment/` writes. Read first: handoff, `docs/development/plan-24-apartment-art-extraction.md`, AGENTS, decision log (DECISION-026/027), `repo-structure.md`, the Plan 10 session log, `sonnet-view-repair.md`, `preview.html`, `duck-views.js` and the art inventory. `check plan-24` returns RUNNABLE. Only this file has been written so far.

## 1. Frozen baseline

- Repo `HEAD 768945e`; Plan 10 sources last changed in `1f4d8c1` (`ce23e57` for the final shelf fix). Blobs: `preview.html` `f304ff9f8ebd844973a98fd915ecb7c124e97029` (529 lines), `duck-views.js` `a48c0e210de27e5b4cbbd1a6b933942f30a2f4e3`. Both stay unchanged and are the comparison baseline.
- Everything to extract sits in two places: `duck-views.js` (five views) and the `<script type="module">` of `preview.html`, lines 141–487 (`uniq`…`roomScene`). The rest of the page (controls, gallery of candidates, `update()`) is review-app code and is not extracted.
- **Feasibility probe (scratch, not committed):** the frozen generators evaluate in plain Node (slice lines 141–487, pass `views`), producing the baseline SVG strings with no browser: side desk 15.9 KB, top desk 33.4 KB, rooms 17.5–22.1 KB, sold living room 16.5 KB. This enables an automated pre-bake string-equality fidelity check (§6) in addition to the rendered comparison.

## 2. Public interface (`src/assets/apartment/index.js`)

Pure functions returning static SVG strings. No DOM, timers, observers, module-level counters or global mutation; no imports outside the new tree.

```js
export const DUCK_VIEWS  = ['front','side','rear','high','low','top'];   // six representations
export const AREAS       = ['living','kitchen','bedroom','desk-side','desk-top'];
export const FRAMINGS    = ['wide','medium'];                            // rooms only
export const LIGHT_MODES = ['neutral','window','warm'];

renderDuck(view, { idPrefix, decorative = true, label })            -> '<svg viewBox="0 0 360 270" …>'
renderScene({ area, idPrefix, duckView = 'side', framing = 'wide', light = 'neutral',
              furnishings = { couch:'present', tv:'present' },       // living room only
              phone = {}, overlay = 'svg', decorative = true, label })
  -> { svg, meta, lighting }
// meta     = { area, framing, light, shotKey, requestedDuckView, duckView, fallback: null | {from,to,reason} }
// lighting = { mode, center:{x,y} (% of the scene box), rx, ry }   // hints for hosts that draw their own overlay
```

- **Supported options are bounded:** unknown area/view/framing/light or a malformed `idPrefix` throws `RangeError`/`TypeError`. `framing` is ignored (and reported) for desks. `furnishings` applies to `living` only.
- **Fallbacks are explicit.** Horizontal cameras (living/kitchen/bedroom/desk-side) cannot show `high`, `low` or `top` and return the Side duck with `meta.fallback = {from, to, reason}` and `meta.duckView = 'side'`; the overhead desk always uses `top`. `meta.shotKey` is the real composition (`living-wide`, `desk-top`, …), never the requested label.
- **Game decisions stay out.** Inputs are render-visibility facts (`couch`/`tv` present or removed, light mode, which duck view). The kit never decides sales, rewards or story state. Mapping from game state to these inputs belongs to the integrating packet.
- **Phone text:** `phone = { status, brand, heading:[l1,l2], body:[l1,l2], note }`, all optional; defaults are the baseline invitation copy. Each string is XML-escaped and length-bounded; no markup is accepted. This is art, not the accessible HTML phone Plan 25 will use.
- **Accessibility:** default `decorative: true` keeps the baseline `aria-hidden` scene; `decorative: false` gives the root `role="img"` with `label` (escaped; defaults to a description built from the actual area/view).

## 3. Camera, scale and paint-order contract (copied verbatim, documented in `core/constants.js`)

Room scenes: 960×540 scene box, `F = 950`, `CX = 480`, `x = CX + F·X/z`, `y = hy + F·(camH − Y)/z`; per-room `hy/camH/zw`, anchors and surfaces as in `ROOM_SPECS`; duck `DUCK_UNITS_PER_MM = 3.34`; medium framing is the baseline computed viewBox. Desks: `PX_MM = 2.2`, `PHONE_MM 72×136` (9:17), side-desk duck scale 0.62, overhead duck scale 0.8 rotated −10°. Duck views keep their 360×270 frame, content bottom y = 250 and per-view centre x. Paint order is the baseline's (items by descending z, then surfaces, on-table items, duck, pendant, glows); the extraction does not reorder, redraw or retune anything.

## 4. Lighting and instance IDs

- **Lighting infrastructure** (gradients, blur filters, directional cones, cast-shadow sets, `lamp-on` toggles) is extracted verbatim; I own `lighting/defs.js` (the shared defs) and `lighting/modes.js`.
- The baseline switches light with page CSS (`.stage[data-light]`) plus an HTML overlay. The kit instead **bakes the chosen mode into the SVG** (lamp-on opacity/display attributes, ambient vs lamp shadow sets, an in-SVG dimming/window overlay in scene coordinates), so a returned scene is self-contained and needs no stage CSS. Known intentional differences, to be measured in the gallery: no 0.2 s fade (static/reduced-motion equivalent) and the overlay follows the scene box rather than stage percentages. `overlay: 'none'` plus `lighting` lets a host draw its own overlay if it prefers the baseline behaviour.
- **IDs:** builders keep the baseline's fixed local ids. One final pass in `core/ids.js` rewrites every `id`, `url(#…)` and `href="#…"` in the finished string to `${idPrefix}-…`, including the nested duck. `idPrefix` is required (`/^[a-z][a-z0-9-]{0,23}$/`); there is no hidden instance counter. Repeating a scene is safe with distinct prefixes; reusing a prefix in one document is the caller's error (documented, not detectable by a pure function).

## 5. Module ownership

```
src/assets/apartment/
  index.js                 SONNET   public API, validation, composition
  core/constants.js        SONNET   camera/scale/frame constants (single source)
  core/ids.js, svg.js      SONNET   scopeIds, escapeXml, inner(), validators
  lighting/defs.js,modes.js SONNET  shared <defs>, light baking, overlay
  duck/                    WORKER 1 views.js (five views, byte-identical), overhead.js (topDuckInner),
                                    index.js (renderDuckMarkup, resolveDuckView, framing)
  props/                   WORKER 2 prims.js (R Ci El Pg Pa NS sc_), decor.js (art windowMm plant mug magazines
                                    clock clockSmall), living.js (sofa coffeeTable tvUnit floorLamp),
                                    kitchen.js (fridge cabinetRun stove pot hood upperCabs kettle toaster jars bar
                                    stool fruit pendant), bedroom.js (bed bedside bedLamp), toys.js (toyShelf teddy
                                    block robot truck rings ball bunny)
  rooms/                   WORKER 3 camera.js (proj put), specs.js (ROOM_SPECS), scene.js (roomScene)
  desk/                    WORKER 4 phone.js (phoneFace, text-parameterised), side.js, top.js
  apartment.test.mjs       SONNET   interface tests (run with node --test; no package.json change)
reports/development/plan-24-apartment-art-extraction/
  proposal.md, progress.md, extraction-manifest.md, gallery.html + gallery.js, fidelity-check.mjs,
  authoring-tools/ (archived scratch scripts), baseline notes   SONNET
```

Dependencies flow one way: `core → lighting → props → duck → rooms/desk → index`. Workers extract function bodies verbatim, turning preview closure variables (`views`, `sceneDefs`, `DUCK_*`, `uniq`) into explicit imports/parameters; they never invent options, rename visual constants or touch ids.

**Haiku budget: four tasks, two at a time, disjoint folders.** Wave 1: worker 1 (`duck/`) and worker 2 (`props/`). Wave 2, after I integrate wave 1 and publish `core`/`lighting`: worker 3 (`rooms/`) and worker 4 (`desk/`). Each gets a self-contained brief with its source line ranges, owned files, import contract, ban on nested delegation/browsers/edits outside its folder, and must report exact source→export mapping and any deviation. Unused budget is not spent. I integrate shared interfaces and the gallery and resolve differences.

## 6. Verification plan

1. **Automated fidelity harness** (`fidelity-check.mjs`, report folder, test-only, reads the frozen Plan 10 page): evaluates the baseline generators and compares the kit's pre-bake markup for every baseline state (5 duck views + overhead, two desks, each room wide/medium, sold living room) after normalising id names; any diff is reported, not hidden. This proves structural preservation, not appearance.
2. **Interface tests** (`apartment.test.mjs`): ID uniqueness and reference resolution across repeated scenes, option validation, fallback metadata, XML well-formedness (small tag-stack checker, no dependency), no external URLs/scripts/foreignObject/images/handlers, text escaping and bounds, purity (identical output twice, no global changes), size bounds per family (baseline measures above plus headroom).
3. **Rendered comparison** (browser slot via QP Orch; no independent tabs): the gallery imports only the kit; baseline is the unchanged Plan 10 page loaded same-origin in the gallery so state can be set and compared side by side, plus reference screenshots. Desktop and narrow, all six ducks, both desks, each room wide/medium, sold variant, neutral/warm/window, close crops of furniture occlusion and lighting. Actual browser zoom is unsupported in this pane and will be reported as unverified. Counts, XML and import checks are not claimed as visual proof.
4. `npm run build` must still pass with the new tree unreferenced from production. No package script, runtime, core, storage or global CSS edit.

## 7. Decisions for root

1. **Living-room input:** per-item `furnishings` flags (recommended: the source already draws a separate ghost mark per item, and the game sells couch and TV separately) versus the baseline's combined sold boolean. Only both-present and both-removed exist in the baseline; mixed states would be implemented by the same code paths, shown in the gallery as unbaselined, and not claimed as validated.
2. **Lighting model:** bake the mode and overlay into the SVG (recommended, self-contained, with the two differences above) versus a stage-CSS contract like the baseline.
3. **Fidelity harness and gallery location:** both in the Plan 24 report folder, reading the frozen Plan 10 report (allowed for test/review tooling; nothing in `src/` imports reports).
4. **Phone text option:** keep (escaped, bounded) or drop and ship only the baseline copy.

## 8. Non-goals and stop conditions

No new rooms, props, accessories, redrawing, game integration, runtime import or Plan 25 desk/phone work. Recommendations for repairs (weak high/low views, small wide-shot duck, schematic top-desk details) go in `progress.md`, not code. Stop for any interface needing runtime changes, a settled-rule change, a new pipeline or dependency, or unexplained visual drift. Packet status, root dispositions and acceptance are not mine to set; nothing is pushed.

## 9. Authoring-method availability

The session's scratch scripts still exist (projection/guide generator `gen-guides.mjs`, view builder `build-views.mjs` + `build-views-tail.mjs`, emitters, renderer `render_svg.py`, `assemble.py`, grid/check helpers, the room patch scripts). After approval I will archive the art-producing ones (not the one-off patch scripts) under `authoring-tools/` with a usage/inputs/outputs README and an explicit non-runtime note; their hard-coded session paths are documented rather than rewritten.
