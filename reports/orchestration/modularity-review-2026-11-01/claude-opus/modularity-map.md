# Modularity map (observed at baseline `96c1b96`; proposals marked)

## Responsibility and semantic ownership

| Concern | Owner today | Notes / coupling | Health |
|---|---|---|---|
| Rules, outcomes, events | `src/core/game-engine.mjs` (`applyLifeIntent` 156-171 gates and appends `life_intent`) | Engine is the only outcome writer | Healthy, keep |
| Life phase/obligation transitions | `src/core/life-progression.mjs` (`transitionLife`, pure) | Single phase authority; no UI phase machine | Healthy, keep |
| Life config / policy identity | `life-config.mjs` + `life-validation.mjs:10` | **Exact equality** to current `LIFE_CONFIG`; `initialLife()` replays using current config, so tuning ⇒ every existing schema-4 save rejected → corrupt-save modal (`main.js:129-149`) | **Hazard** (packet A) |
| Save envelope | `storage.mjs` (schema 1-4, `validateLifeHistory` at 250) | Legacy vs life branched by `state.life` null-check, not policy version | OK |
| RNG | `prng.mjs`, streams in engine | Plan47 requires no draw/race perturbation | Healthy |
| Event log → Receipt | `event-log.mjs`, `receipt.mjs`, `receipt-presentation.mjs` | Projection from evidence only | Healthy, keep |
| **Step / surface routing** | `main.js` `renderApp` 298-661 (13 branches, 24 writes to `engine.state.step`, 28 `currentStep` assignments) **and** `life-routing.lifeSurface` 113-121 **and** `life-phone-context` (presentation kind) | Three deciders; controller step machine parallels engine phase; legacy and new-policy day paths coexist in one controller | **Main coupling cost** |
| Callbacks / engine calls | `main.js` `lifeCallbacks` 700-831; `maybeAutosave` 53 call sites | Every life feature edits this block | Hotspot |
| Life presentation | `src/ui/life/*` (view 29 `.phase` reads, decisions, art, copy, framing, phone view) | Pure routing/decisions tested | Mostly healthy |
| Gacha / race / Dex presentation | `gacha-view.js`, `race-*`, `duck-dex-view`, `acquisition-queue` | Accepted; reached by new-policy runs via `life_gacha`/`life_race` | Healthy |
| Global styles | `style.css` (197 class selectors) shared `.btn-gold/.banner-*` across gacha, modals, life hub | New surfaces reuse classes but not containers/layout → bare hub | Watch |
| Motion/animation | per-feature controllers (duck, race, weather, ambient glow) with pause/visibility/reduced-motion | Consistent lifecycle pattern | Healthy, reuse for audio |
| Assets | `src/assets/*` kits, unmounted Ren (Plan45), weather helpers unmounted (Plan34) | Fingerprint tests | Healthy |

## Representative change paths (footprint)
- **Add a phone-hub action:** life-phone-view + main.js callbacks + engine intent + progression + validation + Receipt adapter + layout witness: 6–7 files; 2 are shared hotspots (main.js, progression). Appropriate except main.js routing.
- **Change one life number (e.g. leisure HP):** 1 line in config **but** breaks save validation for all existing runs. Inappropriate coupling (config doubles as identity).
- **Restyle a surface:** scoped CSS (`life-phone.css`) — small. Healthy (e6d15d3 proved it: 35 + 14 lines).

## Upcoming-feature stress paths
| Feature | Touchpoints | Appropriate | Avoidable / precondition |
|---|---|---|---|
| Plan47 work/evening | life-view, new work/evening helpers, progression (leisure kinds), config (+5), events, Receipt, main.js callbacks | content/render helpers new; progression edit | config versioning (A); anchor semantics (C) |
| Plan48 gigs | progression (decouple from `employed`, `shiftMiss` 38-43), overtime overlap (`overtimeWage` = `scheduledWage` = 60), anchor, config, events | progression + content | C before writes; serialize after 47 |
| Plan45/46 Ren | 45: assets only (disjoint, safe). 46: engine events, progression (visit vs anchor; "introduction without anchor"), sale context (`life-routing.mjs:21` living), door/phone renderers, main.js, Receipt | social events in engine | C; A; checkpoints (B) for review |
| Weather mounting | Plan34 helpers into life-view/life-art; needs day/phase → weather mapping; flash arbiter; reduced motion | presentation-only if weather is seeded from existing day | decide whether weather is evidence (Receipt) or pure presentation before mounting |
| Audio / room acoustics | no production audio module; needs lifecycle like motion controllers, Settings mute, no autoplay | new controller | Settings surface is in main.js modal — small seam needed |
| Plan36 late disorientation | crosses gacha imagery into apartment: life-view, gacha-view, stage-transition; must log displayed cues honestly | presentation + cue evidence | design-only; depends on route table if it alters navigation |

## Proposed (not current) seams
1. `LIFE_CONFIGS[policyVersion]` registry; validation replays with saved version (packet A).
2. Evening-activity contract: `anchorKind ∈ {leisure:<kind>, overtime, gig, visit}` with per-kind effects from config (packet C).
3. Later: declarative route table `step → surface renderer`, with `lifeSurface` as the only life decider and `main.js` keeping boot/autosave/modals.
