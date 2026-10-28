# Proposal: strong daylight, rain and storm for the apartment art kit

Status: **proposal only**. No code, no kit changes, no browser use. Written after Plan 24's rendered comparison; the kit (`src/assets/apartment/`) and Plan 10 baseline are untouched. Needs owner decisions (section 8) and a coordinated browser slot before any visual phase.

## 1. Why

- The current `window` light is a flat 24%-opacity pale-yellow wash fading by 58% across the frame at 115° (`lighting/modes.mjs`). It is not tied to a window, does not move any shadow, and at most a faint tint separates it from `neutral` (the owner's observation that it is not earning its keep; I did not measure window against neutral). It does not read as daylight.
- High-drama story beats would benefit from weather: rain at the window, a storm with lightning, with the warm lamp as the contrast.
- Plan 24 made scenes composable (pure functions, per-instance id scoping). This proposal checks what that buys us and what is still missing.

## 2. Scope and guardrails

- **Adds options; changes no existing output.** New options default to off, so `renderScene` with today's arguments stays byte-identical and the Plan 24 harness (`tools/fidelity-check.mjs`, 89 checks) and tests still pass untouched. `light: 'window'` stays as is (legacy), not removed.
- Pure string output, no JavaScript in the kit, no timers, no dependencies. Animation is declarative CSS inside the scene's scoped `<style>`.
- Stays under the existing size bounds (scene <64 KiB; today's scenes are 16–35 KiB).
- Built first as an **experiment** outside `src/assets/apartment/`, calling the kit read-only; promoted into the kit only after the owner likes the look and the small hooks in section 5 are agreed.
- Art stays in the house style (flat shapes, dark-brown outline, simple gradients). The duck and furniture are not redrawn.

## 3. What the kit gives us today (verified in source)

| Fact | Where | Consequence |
|---|---|---|
| Every room has a back-wall window in world mm: living X −150 (900×800), kitchen X 1700 (600×800, green-grey sky), bedroom X 500 (800×800, purple sky) | `rooms/specs.mjs` | Window position is data; floor patches, rain clip rects and shadow direction can be projected with `proj`/`put` |
| Scenes are painted in a fixed order: wall → floor → rug → per-item ground shadow then item (far to near) → surfaces → table objects → duck → lamp glows | `rooms/scene.mjs` | Clear insertion points for sun patch (after rug), directional shadows (replacing the ground ellipse), tint and flash (after everything) |
| Window glass is inside the furniture markup, not returned | `props/decor.mjs` `windowMm` | Weather needs the window rectangle exposed (hook H1) |
| Item shadows are ground ellipses (`g-soft`), not directional; desks use `cast`/`cast-amb`/`cast-lamp` groups toggled by CSS | `scene.mjs`, `desk/*.mjs`, `lighting/modes.mjs` | Directional shadows replace the room ellipses; desks already have a lamp-direction shadow mechanism to extend |
| The lamp is an independent set of `lamp-on lamp-pool` layers using `mix-blend-mode: screen` | `scene.mjs`, `modes.mjs` | A storm room with the lamp on is composition, not new lamp code |
| Light is one enum `neutral | window | warm` | `index.mjs` | Daylight and weather should be separate options (H3) |
| Ids are prefixed by a final `scopeIds` pass; CSS animation names are **not** scoped | `core/ids.mjs` | Two storm scenes on one page would share keyframe names (H4) |
| Desk scenes have no window | `desk/*.mjs` | Desks get daylight from an implied off-frame window, not weather glass |

## 4. Part A: daylight (ideas 1 + 2 + 3)

Optional `daylight: 'off' | 'sun'` (default `off`), independent of `light`. Three layers, all inside the scene viewBox so medium framing crops them automatically.

1. **Directional shadows.** For each room item with a `shadow`, draw a blurred, skewed shadow cast away from the window instead of the symmetric ellipse: longer and crisper than ambient, tinted cool (about `#2a3a5a` at 30–40%). Length scales with item height; the duck gets a matching one. The ambient ellipse remains a short contact shadow so objects stay grounded.
2. **Sun patch.** A soft-edged parallelogram on the floor/rug, projected from the window rectangle with `proj`, with a window-frame cross shadow inside it (mullion lines), blended with `screen`/`soft-light` like the lamp pool. Painted after the rug and before items so furniture shadows and legs sit on it. A faint matching spill on the wall below the window.
3. **Warm/cool split.** A cool blue-grey `multiply` tint over the whole scene (the shade) plus a warm lift inside the sun patch and a short bloom around the window, with the panes drawn near-white. Contrast between warm sun and cool shade is the main "this is daylight" signal.

Rooms: living first, then kitchen and bedroom (windows already exist). Desks: a sun stripe across the desk and matching shadows from an implied window on one side, no weather glass.

Parameters (kept small): `sunFrom: 'left' | 'right'` (default: the side the window is on), fixed elevation per area. Time-of-day presets (morning/midday/golden) are a later option, not part of the first pass.

Medium framing: the window may be outside the crop; the sun patch and shadows still show, the window bloom may not. This is a framing property to check, not to fix.

## 5. Part B: weather

Optional `weather: 'clear' | 'overcast' | 'rain' | 'storm'` (default `clear`), `motion: 'css' | 'still'` (default `css`). Weather replaces the window sky and adds scene-wide ambience; it works with or without `daylight` and with or without the warm lamp.

| Weather | Window glass | Scene |
|---|---|---|
| `overcast` | cool grey sky, soft cloud shapes | cool, low-contrast tint; sun patch off; shadows soft |
| `rain` | dim sky, a clipped layer of falling streaks, a few droplets that slide down and stop | cooler tint, faint streak shadows in the sun-patch area if daylight is on |
| `storm` | darker sky, wind-slanted dense streaks, branch/foliage silhouette sway optional | darker ambient, stronger cool tint, **lightning flash** layers (below) |

Animation model (declarative, cheap): opacity and transform keyframes only; rain is a few pattern strips translated in a loop, clipped to the window rect; droplets are small ellipses with staggered delays; no filters inside animated groups (filters stay on static layers). Scene-wide effects are single full-box rects.

**Lightning.** A short pulse of (a) the window panes to white, (b) a brief whole-scene brightness lift and cool-blue cast, (c) the sky layer's darkening reversed for one beat. The idle loop uses long, uneven intervals. Safety rules: never more than one flash per 2 seconds, small luminance step, no red/high-contrast strobing; `motion: 'still'` and `@media (prefers-reduced-motion: reduce)` (emitted in the scoped style) show a single still frame with no flash.

**Host control.** Story beats should time thunder to a flash. Without JavaScript in the kit, the host triggers a flash by toggling a documented class on the scene root (`apt-flash`), which restarts one non-looping keyframe. The kit's idle loop and the host trigger can both be enabled or the loop disabled by option.

**Still frames.** `motion: 'still'` yields a static composition of each weather for screenshots, reduced motion and tests.

Sound, particles beyond the window, rain splashes on the sill and exterior scenery are out of scope.

## 6. Hooks needed in the kit (small, additive, later)

| # | Hook | Why |
|---|---|---|
| H1 | Return `meta.windows`: rectangle(s) in scene coordinates for each room | weather clipping, bloom, sun-patch projection, host effects |
| H2 | Named insertion points in `buildRoomScene` (after rug; per-item shadow; after glows) via an `effects` layer list | add layers without string surgery |
| H3 | New options `daylight`, `weather`, `motion` validated like existing options, reported in `meta` and `meta.ignored` (e.g. weather on a desk scene is ignored with a reason) | consistent API and honest reporting |
| H4 | Scope CSS animation names with the instance prefix (`apt-<prefix>-…`) in the same final pass that scopes ids | safe repeated instances |
| H5 | A tiny `effects/` module family: `daylight.mjs`, `weather.mjs`, `lightning.mjs`, each returning layer strings | keeps `scene.mjs` readable |

For the experiment, none of these are needed: a wrapper module can recompute the window rectangle from `ROOM_SPECS` and splice layers into the returned SVG string at known points, accepting that this is string-level and not the final shape.

## 7. How easy is it? (honest assessment)

- **Easy:** window geometry, projection maths, layer ordering, lamp coexistence, medium-crop handling, multiple instances (ids), and no runtime/dependency change. The pixel-comparison tool from Plan 24 (`tools/browser-pixel-compare.js`) can prove that default output is unchanged.
- **Moderate:** directional shadows (replace ellipses without losing grounding), a sun patch that looks right in perspective on the rug and floor, warm/cool balance that looks like daylight and not a filter. These are art-direction problems; they need looking, so they need browser slots and iteration.
- **Needs deliberate design:** animation controls (still, reduced motion, host flash trigger), photosensitivity limits for lightning, keyframe name scoping, and how weather and `light` modes combine in the API.
- **Still blocked outside this work:** desk scenes have no window; Plan 25's real desk/phone integration decides how scenes sit in the game, which affects whether animation runs in an `<img>`, inline SVG or a canvas-composited layer. CSS animation does not run in an SVG used as an `<img>` source in every embedding; the host must inline the SVG (as the gallery does).

## 8. Decisions needed from the owner

1. **Go/no-go** for an experiment folder (suggested: `reports/development/apartment-daylight-weather-experiment/`), kit read-only. Plan number and QP Orch review route are the owner's call.
2. Replace `light: 'window'` eventually or keep both? (Suggested: keep both until the new daylight is approved.)
3. Lightning: allow a looping idle flash, host-triggered only, or both? (Suggested: both, loop optional.)
4. Rooms for the first prototype (suggested: living room only, then the other two).
5. Is one browser slot per visual phase acceptable, with one tab and no Haiku browser use, as in Plan 24?

## 9. Staged plan (each phase ends with checks and a stop)

| Phase | Deliverable | Checks |
|---|---|---|
| 0 | Owner decisions above; browser slot for phases 2+ | — |
| 1 | Experiment scaffold: wrapper that reproduces today's output exactly | Plan 24 harness equal; numeric pixel diff 0 vs the kit |
| 2 | Living-room daylight (A1–A3), still, side by side with `window` and `neutral` in a gallery | owner look; numeric diff limited to the intended layers; both widths (1200 and 375 baseline) and wide/medium |
| 3 | Kitchen, bedroom, desk daylight | same, plus window-out-of-crop cases |
| 4 | Still weather frames: overcast, rain, storm × daylight on/off × lamp on/off | owner look; pixel checks that lamp layers are unchanged |
| 5 | Animation: rain loop, droplets, lightning loop and host flash, reduced-motion and `still` | recorded frame sequence at fixed times; flash-rate check; repeated-instance keyframe scoping test; performance check (count animated nodes, no animated filters) |
| 6 | If approved: promote H1–H5 into `src/assets/apartment/` with tests and manifest rows; keep `light: 'window'` | Node harness + interface tests + rendered comparison as in Plan 24 |

Haiku, if allowed: bounded, disjoint experiments only (variants of rain streak/droplet art and cloud shapes as standalone SVG files in separate subfolders); no integration code and no browser tabs.

## 10. Risks

- **Blend modes and tints can wash out the flat house style.** Mitigation: keep default `daylight: off`; tune against neutral at both widths; owner approval gate.
- **Perf of animated SVG on low-end devices.** Mitigation: animate opacity/transform only, no animated filters, cap node counts, `still` mode.
- **Photosensitivity.** Mitigation: rate cap, small luminance step, reduced-motion handling, host-triggered default.
- **Scope drift into scenery/sound.** Mitigation: out of scope above.
- **Stage-anchoring drift** (as found for the warm lamp overlay in Plan 24): all daylight and weather layers are in scene coordinates, so they follow the scene; hosts must not expect stage-percentage anchoring.
