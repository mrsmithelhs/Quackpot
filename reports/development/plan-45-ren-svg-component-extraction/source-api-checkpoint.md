# Plan 45 — source and API checkpoint for QP Orch

2026-11-01. **Proposed; root approval required before extraction.** This is not an implementation or an owner art acceptance. Working tree inspected at `7c0478e`; Plan 47 runs concurrently. Packet check 45 returned RUNNABLE through the unchanged bounded launcher following a memory preflight (8,132,153,344 bytes available; 75% load; process list is sandbox-limited). An earlier direct Node check also ran before the launcher requirement was noticed.

## Pinned primary sources

Paths below are relative to `reports/development/plan-41-ren-friend-character-and-social-life-study/concepts/`. SHA-256 pins the actual bytes; commit IDs identify the most recent observed change for the indicated source or group, not necessarily authorship of each individual file. Ledger S1–S58 and `09-ren-drawing-kit-index.md` govern selection; root review `reports/orchestration/plan-41-investigation-delivery-review-01.md` keeps vest v3, latest dust and floor view unreviewed.

| Source | SHA-256 | Purpose |
|---|---|---|
| `round-04-faces-and-door.html` | `4a3824ad4b3c819d5701d1931bdfd9116fbae78d00cabb352bae20ebb147ba63` | Six figure/face definitions and their common layers; avatar viewBox `46 30 148 148`, including the actual tilted listening figure. Commit `21b73666a0ee414e92e8cfca41b47d519beda9f2`. |
| `door-scene-v2.svg` | `891ea0e26b5be21f4492a23375dd56ca0c7a62b6672b4996d61b9afcd6fc50b4` | Reframed existing upper-door/hall artwork; commit `21b73666a0ee414e92e8cfca41b47d519beda9f2`. |
| `svg-round-01/_template/ren-base-template.svg` | `e75f0a8e6b15d6d4b98a7eee146b964773c2b1d40d7d56ed47a3dc9fd923ada0` | Base bust, short curls, outfit and ear pencil; concept source, not an independent full body. |
| `svg-round-01/outfits/pajama-navy/pajama-navy.svg` | `1fe0bf4b4b151b03e93253f6adf29fd2c4c1e5b5a9f2fd13185ca9b4f1a9d6ea` | Existing close couch figure. |
| `svg-round-01/outfits/cardigan-terracotta/cardigan-terracotta-v2.svg` | `9c9dc3ec72c8fa13053a978889cec7081a1b2cf2897676222e4542ea3175d129` | Existing floor-game figure. |
| `apartment-scenes/compose-ren-apartment.mjs` | `3d8797c70adc7255ddff13ad197908cd8e8112f8922f6c1cdb5e9c241328399c` | Exact placement/layering and board recipe; latest group commit `fc1fc7ad66743a7e1b05e390e487b455d19fd889`. Its temporary mutation of `ROOM_SPECS` is not a reusable API. |
| `apartment-scenes/scenes/ren-couch-medium.svg` | `152759a5a7b161e18c183f0316df585ce405d9bdcc5905240ad7d1fb5725385a` | Couch comparison original, viewBox `536 100 400 225`; sofa foreground covers body cut. |
| `apartment-scenes/scenes/ren-floor-game-night.svg` | `c1a90b5acb0814d3022831c162ee26003a1c4d4e7d568d297ea4059aae9dd23c` | Floor comparison original, **wide** `0 0 960 540`; table hides body cut, duck on blue magazine/book faces board. Unreviewed. A close crop is an explicitly identified derived framing, not a pre-existing reviewed original. |

`src/assets/apartment/` last observed change `9bf443288c355403eba77dadb29d7d23598c356b`. Its `renderScene` accepts required prefix and `duck:false`, but does not expose item injection, sorting, surface/anchor override or foreground occlusion; `rooms/scene.mjs` reads shared `ROOM_SPECS`. The Plan 24 manifest/gallery and its documented overlay and browser-size limits inform comparison, not a claim of Ren fidelity. Existing source and report files stay read-only.

## Proposed bounded interface

- `renderRen({idPrefix, expression = 'warm', framing = 'bust', decorative = false})` returns `{svg, meta}`. Required unique prefix; expression enum `warm`, `laugh`, `tease`, `not-tonight`, `long-day`, `listening`; initial framing is only the existing avatar crop or complete 240×300 bust, with explicit names and viewBoxes. No arbitrary outfit/face combinations are asserted without source evidence. `meta` identifies source, viewBox, front-facing pose, complexion A and pencil placement.
- `renderRenScene({idPrefix, scene, decorative = false})` returns `{svg, meta}` for explicit `door`, `couch-close`, `floor-game-night` only. Scene is required; no hidden fallback. Door and couch use their pinned framing; floor uses the original wide comparison and a separately named derived close crop if its geometry can meet the frame/occlusion rule. Its unreviewed candidate status remains in metadata/gallery. No free-form text is necessary; any label option must be bounded and escaped.
- Begin with the complete source-supported looks used by these compositions. Additional kept outfit, hair and pencil variants can be enumerated only as faithful self-contained existing looks, not arbitrary interchangeable pieces or implied selected rotation; omitted variants and exact candidates are listed. Single pencil per supported look; no neck tattoo; arm tattoo only where exposed. No random choice, counters, host state, animation or global mutation. The host owns unique prefix and any future cosmetic choice. Unknown keys and values throw.
- Make Ren layers and composition recipes local modules, preserving original geometry and ordering. For rooms, use an isolated local composition based on existing apartment camera/props and copied spec data or another proven pure local adapter; never mutate shared `ROOM_SPECS`. Include metadata describing cut edge, foreground occluder, duck contact surface, viewBox and candidate status. Check exact room implementation against the pinned original before settling the recipe; do not claim `renderScene({duck:false})` alone supports insertion.
- Namespace every SVG definition and all `href`/`url(#...)` references consistently per instance, including apartment IDs; validate the prefix and reject unsafe markup, external URLs, scripts and event attributes. Keep no report imports at runtime. Render two distinct instances together and prove unique/resolving references.

## Gaps, fidelity and review

No verified approved gifted-shelf prop, side/turned pose, or complete body is identified; report these as gaps, not new drawing. Exclude bedhead, old neck-tattoo and superseded old door. The kept context-only hair/outfits do not become ordinary rotation. Vest v3 and latest dust/floor are candidates, not silently approved. Existing floor source is wide; any close crop requires a direct original-vs-derived visual inspection for S49, with no invented anatomy.

Compare the pinned baseline against extraction structurally after only documented ID/serialization changes; include negative controls and two-instance references. A local gallery presents original and extracted six faces at avatar and bust sizes, door and couch, floor original and derived close framing, plus enlarged cut/occlusion and supported duck. Inspect desktop and narrow viewports and useful enlargement where the coordinated browser slot permits; separately state actual zoom, device and assistive-technology limits. Source equality is not visual acceptance. Pin any additional exact selected source and hash before extracting it, record attribution/license evidence and changes, and report unverified provenance honestly. No production mount or package dependency.

**Gate:** root/QP Orch approves this exact source/API proposal before extraction. Following that approval ordinary extraction and test fixes proceed to one authorized read-only Terra-medium review, then root technical review and owner gallery acceptance. No packet status change, push or deployment.


