# Sonnet art inventory and use proposals

2026-10-27. Owner reports strong results from the Sonnet session and requests an inventory/use assessment. Source inspection and a read-only Terra-medium inventory audit underpin this report; no fresh rendered acceptance is claimed. The owner authorized Sonnet's expansions during that session; they are recorded in `session-log.md`, not treated as violations of the original narrower brief. Plan10 remains in-progress; this report does not select final art, close packets or authorize production changes.

## Asset register

All paths below are relative to `reports/development/plan-10-metagame-duck-cinematography/`.

| Family | Present source / contents | Status and useful distinction |
|---|---|---|
| Physical companion views | `duck-views.js`: front three-quarter, side, rear three-quarter, high, low; interface `views[key].svg/label/note` | Five selected static authored views. The selected geometry incorporates five Haiku candidates; these are not five additional independent drawings beyond those candidate files. Physical object remains inanimate. |
| Overhead companion | `preview.html`, `topDuckInner()` | Sixth distinct view for the top-down desk; schematic and not yet unified with the five-view model sheet. |
| Desk, side | `preview.html`, `sideDeskScene()` | Eye-level desk, lamp, supported portrait phone, books, succulent, mug, window and duck. High/low selections fall back to another view; selected shot label can misrepresent actual view. |
| Desk, overhead | `preview.html`, `topDeskScene()` | Table surface, overhead duck, face-up phone, notepad, sticky note, pencil, keyring/two keys, lip balm, detailed gold/silver coins, articulated lamp, height-sensitive shadows. |
| Phone face | `preview.html`, `phoneFace()` | 9:17 game-phone proportions; bezel, status row, invitation screen and home bar. Illustration is not a functional production invitation control. |
| Living room | `preview.html`, `ROOM_SPECS`, `roomScene()` | Curtains/window, landscape picture, couch/cushion, TV/console, floor lamp, plant, rug, coffee table, mug and magazines. Wide/medium compositions. |
| Sold living room | Same scene with combined couch-and-TV-sold state | Pale marks and absence of both items. No separate couch-only/TV-only sequence yet. |
| Kitchen | Same room generators | Fridge/magnets, tiled wall, lower/upper cabinets, stove/pot/hood, kettle, toaster, jars, window, bar/stools, mug, shallow fruit bowl and pendant lamp. Wide/medium. |
| Bedroom | Same room generators | Bed, window/curtains, night-sky picture, bedside table/lamp/clock, rug, toy shelf and companion. Wide/medium. |
| Toys | `toyShelf`, `teddy`, `block`, `robot`, `truck`, `rings`, `ball`, `bunny` helpers | Shelf plus teddy, ABC blocks, antenna-free robot, truck, stacking rings, ball and bunny. Owner directed recent clearance repairs. These are ordinary possessions, not invented sellable resources. |
| Shared room props | `art`, `windowMm`, `plant`, `mug`, `sofa`, `coffeeTable`, `tvUnit`, `floorLamp`, `fridge`, `cabinetRun`, `stove`, `pot`, `hood`, `upperCabs`, `clock`, `kettle`, `toaster`, `jars`, `bar`, `stool`, `fruit`, `pendant`, `bed`, `bedside`, `bedLamp`, `clockSmall`, `magazines` | Reusable drawing vocabulary embedded in the preview, not individual exported assets. Different cameras need compatible projections, not blind reuse of every silhouette. |
| Lighting/material infrastructure | Preview defs/styles plus room/desk lighting and projection helpers | Neutral, window and warm lamp modes; directional cones/spill, focused pools, shaped dimming, shadows, gradient materials, depth/camera placement, ID uniquification. Modes are code options; not all final combinations rendered. |
| Sonnet alternatives | `sonnet-candidates/`: five SVG views | Projection-baked study alternatives; not selected production assets. Two PNGs are offline comparison renders. |
| Haiku alternatives | `haiku-experiments/`: ten `duck.svg` drawings, scratch/improve for each view | Five chosen as inputs to selected views, five alternatives. Five `start.svg` files are baseline copies, not extra new assets; ten PNGs are review renders. |
| Construction guides | `haiku-experiments/guides/`: five SVG guides and JSON | Authoring references, not game art. |
| Research/provenance | `session-log.md`, `sonnet-view-repair.md`, `desk-references.md`, `apartment-story-beats.md`, `haiku-experiments/references.md` | Context and method records. Reference research did not establish authoritative duck ratios; owner images supply spatial reference. External reference availability is not a redistribution license. |

The scene system exposes **five areas** (three rooms and two desk cameras), with **eight named shot compositions** (wide/medium for each room plus two desks), plus sold-state and lighting variations. Do not multiply all controls into a claim that every combination is a validated separate asset. The collection has six selected/scene-used duck representations and fifteen experimental SVG drawings, with selected candidates overlapping that experimental count.

## Recommended uses

| Use | Existing foundation | Proposed implementation boundary |
|---|---|---|
| Opening invitation / everyday home screen | Side desk, phone face, static front/side duck | First integration candidate. Preserve real HTML phone controls, naming/settings/exit and Shell A transitions; SVG decor should not replace accessible UI. Make phone text legible at final size. |
| Duck conversation beats | Front/side/rear views, close framing, room lamp treatments | Choose a few static compositions/lighting cuts paired with owner-selected dialogue. Physical duck does not animate. Keep scenes skippable and outside running-clock time. |
| Money-pressure consequences | Living room and sold-state art | Show independently removed couch/TV according to actual state. Do not visually remove objects before sale or invent a new sale mechanic. |
| Food/sleep/life-choice context | Kitchen and bedroom | Visual setting for already authorized consequences; no automatic new meals, family, characters or reward rules. Bedroom toys suggest history without prescribing biography. |
| Pawned companion / ending | Desk and companion geometry | Add genuine empty-desk counterpart, preserve other props, and choose framing to register absence. Pawning physical duck never deletes digital collection. |
| End-of-run Receipt | Desk surface, paper/notepad vocabulary | Static printed-slip staging behind HTML Receipt/controls; preserve log evidence, export and accessibility. |
| Shared decorative kit | Lamps, windows, tables, books, mugs, plants, pictures, toys | Reuse coherent camera/material families to reduce future drawing cost. Keep ordinary text HTML and asset IDs collision-free. |

## Proposed next art/integration sequence

1. **Preserve and select.** Commit the original Sonnet handoff and retain its session index. Ask the Sonnet author to archive the drafting/projection and offline-rendering scripts with usage/inputs under the report folder if still available. The output SVG remains editable without them, but the recorded method is not reproducible today. Retain experiment sources; do not ship diagnostic grids or reference PNGs.
2. **Physical-duck and shot polish.** A small Sonnet drawing packet: high/low and overhead consistency; side/rear head-to-body connection; actual displayed-view labels; camera-compatible companion placement and close/medium visual checks. Select a small useful set rather than expanding angles indefinitely.
3. **Extract the chosen home-art kit.** A bounded implementation packet ports selected SVG generators into focused production modules, then integrates one desk/phone composition. Do not import report files or copy the entire preview into `main.js`. Preserve actual game state, Shell A, static companion, keyboard/focus, responsive framing and zero runtime network. Keep art implementation separate from the decision to add new mechanics.
4. **Stateful consequences and cinematic scenes.** Add independent couch/TV removal and empty-desk/pawn states, then owner-selected room shots and dialogue. Record which sale/story states exist before expanding scenery further.
5. **Digital gacha art direction separately.** Apply Sonnet authoring to future paper-style environment/UI/effect SVG studies, with owner-approved compositions. Physical rubber-toy rooms are not automatically the gacha game's visual language.

These are recommendations, not promoted packets. Plan22 rest follows Plan23; that sequence is not changed by this art inventory.

## Additional assets worth considering

**Highest value:** matching empty-desk view; separate couch-only and TV-only removed scenes; phone screen states for invitation/home/return; selected companion colors/accessories including the previously noted chef hat; readable close conversation crops with intentional negative space for HTML dialogue; consistent day/window/warm-lamp states across chosen shots.

**Next, after story selection:** receipt/slip and envelope/bill props; intentionally sparse apartment aftermath; outside/nature and friends/family alternatives if those life-choice beats are adopted. These should follow the narrative, not create obligations to use every room or object. An entryway is optional, not required merely because it is absent.

**Separate digital-game needs:** paper-style course/environment compositions, podium/effect polish, rarity/set presentation and duck cosmetic families at catalog scale. Evaluate reuse of the accepted digital rig; do not redraw a full catalog one duck at a time or introduce per-variant balance.

## Integration and verification limits

Most source is embedded in a large report HTML file with shared gradients, `R/Ci/El/Pg/Pa` primitives, `proj/put`, `ROOM_SPECS`, lighting and camera assumptions. Extraction needs explicit dependency/ID/viewBox/paint-order/scale ownership and reusable interfaces. Asset file count alone understates what exists and overstates production readiness.

The Sonnet record reports successful source/XML checks and bounded rendered scene comparisons. It also reports weaker high/low views, small physical-scale ducks in wide shots, schematic overhead details, crop/camera weaknesses and some unverified final neutral/window/close combinations. Actual100/200/400% browser zoom and assistive-technology behavior remain unverified. This inventory is source-verified, not a fresh browser/artistic acceptance review. Owner's positive assessment does not automatically close Plan10 or adopt every expanded scene as canonical geography.

## Standing workflow update

Owner selects Sonnet for future SVG drawing plans. The successful pattern was bounded cheap drawing experiments plus separate reference research, with Sonnet selecting/refining a coherent result. Future packets should name budgets, reference responsibilities, disjoint candidate folders and single-writer integration, and serialize browser use. Do not treat every subagent output as an equally good final asset. Review routing now uses Terra-medium for root, with orchestrator-discretionary Terra-medium post-implementation reviewers for Codex implementers; historical Sol/Luna records are preserved.
