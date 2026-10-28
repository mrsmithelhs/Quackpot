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
| `sun-floor` | after the rug polygon (`fill="#b8836a"…`) | sun patch (four window panes projected on the floor) + item shadows; under every item |
| `sun-table` | before the duck's contact-shadow ellipse | short directional shadows of the duck and mug on the table top; duck markup untouched |
| `sun-atmosphere` | after the duck's closing `</svg>`, before the first lamp glow | cool shade tint (multiply), window bloom (screen), white-out panes |

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

- One sun for the room: travels toward the camera and to the right (azimuth 25°), elevation 36° (`SUN` in `study/daylight.mjs`).
- Floor patch: the four window panes (glass 780–1520 mm, mullions widened to 48 mm so the cross reads) projected along the sun to the floor with the kit's own `proj`. At this elevation it lands on the far rug and the bare floor behind it, in a thin foreshortened strip; the coffee table occludes part of it in the kit's own paint order.
- Shadows: strips/tapers for sofa, TV and unit, plant and floor lamp, plus duck and mug on the table, offset along the same direction with height-based length; the kit's own ground ellipses stay on top as contact shadows. Cool multiply tint.
- Approximate, not physical: the shadows are not clipped to the beam (one window would not light the whole floor), the sun does not light walls or furniture faces, silhouettes are simplified, the tint is global. Window geometry supports the picture; it does not prove the projection is correct. The coffee table's own sun shadow falls below the frame.
- Window glare (bloom and white-out panes) is drawn over later furniture, so it can wash a plant leaf that overlaps the window; this is intentional veiling glare and is listed as a visual check.

## 6. Checks and what they do not show

`tools/check.mjs` (153 checks at checkpoint): pin and git cross-check; keyed geometry equals kit specs; no-effect identity; precedence and rejections; per-variant: layers removed → kit output exactly, well-formed XML, unique/resolvable ids, duck and lamp markup byte-identical, no animation constructs, expected three blocks; two simultaneous instances; deterministic output; missing/ambiguous/changed-anchor failures.
These are structural. They do not establish that the daylight looks good; that is the owner look in the browser stage. Difference images, when used, are diagnostic only.
