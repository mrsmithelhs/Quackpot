# Plan 26 mechanism and comparison matrix (root checkpoint)

Scope: living room, still images only. Everything lives in this folder; `src/assets/apartment/` (Plan 24), Plan 10, production, packets and status are read-only/untouched. No animation, rain movement, lightning, audio, other rooms, kit hooks or production imports.

## 1. Pinned input

- Delivered Plan 24 kit = `src/assets/apartment/`, last changed by commit `5237a2a4f58922ff713240a9e4c7221ab89e6c62` (24 files). `pinned-kit.json` records each file's git blob id (LF-normalised, so Windows CRLF checkouts verify). `study/pin.mjs` `assertPinnedKit()` runs on first render in Node; `tools/check.mjs` also cross-checks the pin against `git ls-tree` of that commit and that the kit is unmodified in the working tree.
- Interface used: the public `renderScene` (unchanged) plus read-only imports of the kit's `ROOM_SPECS`, `proj` and `windowMm` as geometry inputs (internal modules, not public API; guarded by a check that the keyed window and furniture coordinates still equal the kit spec).
- Environment: Node 26 (ES modules, `node:` imports only), no dependencies. Browser gallery served by the existing Vite dev server (Plan 24's route style); only the in-page code runs there.

## 2. Wrapper contract (`study/scene.mjs`)

`renderStudyScene({ ...kit options, daylight, weather, strength }) → { svg, meta, lighting, study }`.

- No effect (`daylight:'off'`, `weather:'clear'`): `svg` is **byte-identical** to `renderScene` for the same kit options. Checked over 180 option combinations (5 areas × 3 lights × 2 framings × 6 duck views), three furnishing states and `overlay:'none'`.
- `daylight:'sun'` (living only): three blocks are inserted at **exact verified anchors**, each wrapped in `<!--p26:begin NAME-->…<!--p26:end NAME-->`; removing them returns the kit output byte for byte. Anchors must match exactly once or the call throws (`AnchorError`); negative checks cover missing, ambiguous and kit-changed cases.
- Default comparisons use the kit's documented **scene-anchored** overlay. The original host/stage-anchored behaviour appears only as an explicitly labelled extra control in the gallery.
- `study` metadata reports requested vs effective options, notes, inserted blocks and the list of approximations.

| Block | Anchor | Content |
|---|---|---|
| `sun-floor` | after the rug polygon (`fill="#b8836a"…`) | long item shadows on the floor; a floor sun patch only if any of it is in frame (at the study's sun it is not) |
| `sun-window-glass` | after the window item (rebuilt exactly with the kit's own `put` + `windowMm`) | white-out of the four panes, under everything standing in front of the window |
| `sun-table-plane` | after the coffee-table top polygon (`fill="#86664d"…`) | the window beam on the table with the window-frame shadow, plus plant-leaf and lamp-shade shadows crossing it; clipped to the table outline |
| `sun-table-objects` | before the duck's contact-shadow ellipse | rounded shadows of the duck and mug; duck markup untouched |
| `sun-atmosphere` | after the duck's closing `</svg>`, before the first lamp glow | light cool shade tint (multiply) and a wide warm window bloom (screen) |

Only the global shade tint can change pixels of the lamp layers; the lamp markup itself is byte-identical (checked), and in all Stage-2 variants the lamp is off.

## 3. Comparison matrix (Stage 2: daylight)

Columns (kit light unless noted): **neutral** · **legacy window** (kit `light:'window'`, scene-anchored) · **sun, restrained** · **sun, strong**. Extra labelled control: **legacy window, host/stage-anchored** (kit `overlay:'none'` + the original stage CSS gradient).
Rows: wide and medium framing; stage = real desktop viewport and real narrow viewport (390 px wide), each at the stage aspect the viewport gives plus one fixed 335×310 narrow-stage and one 1120×540 wide-stage view (Plan 24 geometry) to expose letterboxing.
Not in this matrix: warm lamp (any pairing with sun is rejected until Stage 3), weather stills, other rooms, mixed furnishings beyond one check, animation.

## 4. Requested → effective precedence (`study/options.mjs`)

Settings: `daylight` (off | sun), `weather` (clear | overcast | rain | storm), kit `light` (neutral | window | warm, where `warm` is the lamp), `strength` (restrained | strong).

| Rule | Statement |
|---|---|
| R1 | Weather other than `clear` suppresses direct sun (no sun patch, no directional shadows): effective sun = false, even if `daylight:'sun'` was requested. So `daylight` and `weather` are not fully independent: weather owns the sky. |
| R2 | Effective sun (and any weather) supersedes the legacy window wash: requested `light:'window'` becomes effective kit light `neutral`, and `study.notes` says so. `light:'window'` itself is untouched when `daylight:'off'`. |
| R3 | The lamp is independent of the sky in principle, but its pairing with sun or weather is a Stage 3 comparison. Lamp + sun is rejected now (RangeError); lamp + weather is rejected until Stage 3. |
| R4 | `overcast | rain | storm` are rejected in this stage after R1–R3 are evaluated, so the precedence is testable now and implemented later. |

Stage 3 will use a small **named** set (for example: overcast, rain, storm, each lamp-off, plus storm + lamp as the paired contrast), not the full daylight × weather × lamp product.

## 5. Sun model and honest approximations

- **Low late-afternoon sun**: elevation 16 degrees, azimuth -6 degrees (travels toward the camera, very slightly left). Reason found in the first browser pass: in this camera the coffee table covers the foreground floor (the rug/floor shows only as a thin band behind the table and at the right), so a high sun's floor patch (tried first at 36 degrees) lands behind the table and is invisible. A low sun carries the window beam onto the table top where the duck stands.
- The four window panes (glass 780-1520 mm, mullion gaps widened to 48 mm so the cross reads) are projected along the sun onto the table plane (height 430 mm) with the kit's own `proj`, and clipped to the table outline; at this elevation only the upper part of the beam reaches the table, so the lit area is a diagonal band with the frame cross shadow in it.
- Shadows: strips/tapers for sofa, TV and unit, plant and floor lamp on the floor; plant leaves and lamp shade onto the table; rounded capsules for the duck and mug; all offset along the same direction with height-based length (rays are cut 250 mm in front of the camera). The kit's own ground ellipses stay on top as contact shadows. Cool multiply colour.
- Approximate, not physical: floor shadows are drawn broadly although one window would not light the whole floor; the sun does not light walls or furniture faces; silhouettes are simplified; the tint is global; the coffee table's own sun shadow falls below the frame. Window geometry supports the picture; it does not prove the projection is correct.
- Window glare: the white-out panes sit under foreground furniture (the first version drew them on top and left a hard rectangle over a plant leaf, found in the browser pass and fixed); only the soft bloom is drawn over furniture, so a leaf overlapping the window is lightly veiled.

## 6. Checks and what they do not show

`tools/check.mjs` (153 checks): pin and git cross-check; keyed geometry equals kit specs; no-effect identity; precedence and rejections; per-variant: layers removed → kit output exactly, well-formed XML, unique/resolvable ids, duck and lamp markup byte-identical, no animation constructs, expected three blocks; two simultaneous instances; deterministic output; missing/ambiguous/changed-anchor failures.
These are structural. They do not establish that the daylight looks good; that is the owner look in the browser stage. Difference images, when used, are diagnostic only.

## 7. Stage 3: still weather (added after owner approval; source side)

Approved named set (no larger matrix): **1** clear strong sun (reference, lamp off) · **2** overcast · **3** rain · **4** storm, no flash · **5** storm + warm lamp. Restrained sun stays in section 1 of the gallery as a reference; nothing accepted was removed. Animated rain and lightning are **retained as future options, not built, not selected**.

Precedence as built (`study/options.mjs`, replaces the Stage 2 R3/R4):

| Rule | Statement |
|---|---|
| R1 | Any weather suppresses direct sun (no sun band, no directional shadows). |
| R2 | Sun and any weather supersede the legacy window wash (requested `light:'window'` -> effective kit `neutral`). |
| R3 | The lamp is independent of the sky in principle, but only storm + lamp is built. Lamp with sun, overcast or rain throws. Lamp with a clear sky and no study effect is the kit's own warm light, passed through byte-identically. |
| R4 | storm + lamp: the kit's warm full-room overlay (a dark vignette anchored to the lamp, which would leave the duck in deep shade) is omitted: effective overlay `none`, reported in `study.notes` even when `overlay:'svg'` was requested. The lamp's own glow layers stay on; the storm tint supplies the darkness. |

Blocks inserted for weather (same verified-anchor mechanism; removing them returns the kit output for the effective kit options byte for byte):

| Block | Anchor | Content |
|---|---|---|
| `wx-floor` | after the rug | soft, non-directional ambient shadows under the large furniture (flags respected) |
| `wx-window` | after the window item | sky gradient, ellipse clouds, seeded static rain streaks and droplets, all clipped to the four panes; under plant, lamp and curtains |
| `wx-atmosphere` | after the duck's `</svg>`, before the first lamp glow | cool tint, vignette, cool window spill; in the lamp cell a warm focus glow around the duck, drawn before the lamp glows so the lamp stays warm |

Rain and storm differ by art, not only darkness: sky and cloud colours, streak count (62 vs 150), length (12-20 vs 20-34), slant (11 vs 30 degrees), weight and opacity, droplet count (7 vs 10), tint strength and vignette. Overcast has no streaks. Storm has no flash layer. Streaks are seeded, so output is identical on every render. Elements are grouped by role (`sky`, `clouds`, `rain-streaks`, `droplets`), which would let a later, separately approved motion stage address them; no timing, keyframe, trigger or flash exists anywhere.

Approximations: flat gradient sky with ellipse clouds; global multiply tint and vignette; the storm + lamp focus glow around the duck is a study addition (the kit's lamp pool, at the lamp on the right, does not reach the duck); the medium crop hides the window, so there weather is ambience only (the gallery caption says so). Unchanged lamp markup is checked structurally; the final composite around the lamp and duck is measured separately in the browser (`tools/browser-measure.js` `regions()`).

Checks: `tools/check.mjs` (151, Stage 2 and identity) and `tools/check-weather.mjs` (304: precedence, per-variant stripping to the kit output, XML/ids, duck and lamp markup, no animation/flash constructs, expected blocks, rain vs storm differences, simultaneous instances, determinism).
