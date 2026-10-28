# Apartment art kit (Plan 24)

Static, dependency-free SVG-string generators for the physical rubber duck, its apartment and desk scenes, extracted from the accepted Plan 10 report artwork. **Not imported by the game.** Nothing here decides game state, sales, rewards or story; inputs are presentation facts. The duck is an inanimate prop: no animation.

All source is ES modules with the `.mjs` extension (explicit Node imports, no package `type` change). Modules are pure: no DOM, timers, observers, module-level counters or global mutation. Output is deterministic for the same inputs and caller-supplied `idPrefix`.

## Module graph (acyclic; arrows are imports)

```
core/constants.mjs   core/svg.mjs   core/ids.mjs
lighting/defs.mjs    lighting/modes.mjs
props/prims.mjs  <-  props/{decor,living,kitchen,bedroom,toys}.mjs   (props never import ducks/rooms/desks)
duck/{views,overhead}.mjs  <-  duck/index.mjs
rooms/camera.mjs, rooms/specs.mjs (-> props, core/constants), rooms/scene.mjs (-> camera, specs, duck, lighting/defs)
desk/phone.mjs (-> core/svg), desk/side.mjs, desk/top.mjs (-> duck, lighting/defs, phone, core/constants)
index.mjs            public API; validation, id scoping, light baking
```

## Raw builder contracts (internal; used by `index.mjs`)

Raw builders return the **baseline markup** (fixed local ids, class-driven light hooks, the original root `<svg>` opening tag). They do not scope ids, validate options for the public API or bake lighting; `index.mjs` does that.

- `rooms/camera.mjs`: `proj(sc, X, z, Y = 0)`, `put(sc, X, z, Y, mm, cls = '')`.
- `rooms/specs.mjs`: `ROOM_SPECS` (`living`, `kitchen`, `bedroom`); every `items(furnishings)` takes `furnishings = { couch: 'present' | 'removed', tv: 'present' | 'removed' }` (ignored outside `living`).
- `rooms/scene.mjs`: `buildRoomScene({ area, duckView, framing, furnishings }) -> { svg, lamp }`; `duckView` is already resolved to `front|side|rear`.
- `desk/phone.mjs`: `DEFAULT_PHONE_TEXT`, `phoneFace(w, h, text = DEFAULT_PHONE_TEXT)`.
- `desk/side.mjs`: `buildSideDeskScene({ duckView, phone }) -> svg`; `desk/top.mjs`: `buildTopDeskScene({ phone }) -> svg` (`phone` = fully resolved, validated text object).

Provenance of every extracted symbol is recorded in the Plan 24 extraction manifest; frozen baseline blobs are listed in `reports/development/plan-24-apartment-art-extraction/tools/baseline.mjs`.
