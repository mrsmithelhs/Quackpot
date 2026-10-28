# Weather motion: controller and arbiter interface, lifecycle table (Plan 26 Stages A/B)

Report-only. Host-side Web Animations API on an **inline** `<svg>` produced by the unchanged study wrapper. No controller means exactly the approved still. The kit, `study/*`, `gallery.*` and the still generators are not touched. Stage C adds a single-pulse lightning study (`lightning.mjs`, mechanism and measurement method in `lightning-mechanism.md`); the browser composite evidence is a later step of the same stage.

## Files
| File | Role |
|---|---|
| `arbiter.mjs` | `createFlashArbiter({now, cooldownMs})`: the single page-wide flash budget, monotonic clock, refuse-not-queue |
| `rain-motion.mjs` | pure spec of the animation-only rain layers (seamless tile geometry, speeds, drops); no DOM |
| `controller.mjs` | `createWeatherMotion(root, options)`: blockers, build/restore, pause/resume, stop/start, destroy |
| `tests/*.test.mjs` | Node tests with a fake clock and a fake DOM (`node --test animation/tests/`) |
| `lightning.mjs` | Stage C: `createLightningEffect()` (the injectable `flashEffect`), `LIGHTNING` constants, `pulseFactor`, keyframes |
| `lightning-mechanism.md` | Stage C mechanism note: curve, bounds, placement, interruption, measurement method |
| `gallery.html`, `gallery.js`, `tools/browser-harness.js`, `tools/flash-harness.js`, `tools/flash-metrics.mjs`, `tools/estimate-lightning.mjs` | separate motion gallery, in-page rain and flash measurement helpers (browser turn), pure luminance/flash maths (Node-tested), analytic estimate |

## Arbiter (host creates ONE per page and injects it)
```
const arbiter = createFlashArbiter({ now = () => performance.now(), cooldownMs = 4000 })
arbiter.request({ requester })  ->  { status:'accepted', id, requester, done, finish(), cancel(reason), outcome() }
                                  | { status:'refused', reason:'cooldown'|'active', retryAfterMs }
arbiter.snapshot()  ->  { cooldownMs, activeId, lastStartedAt, nextAllowedAt, stats }
ticket.done  ->  Promise<{ status:'finished'|'cancelled', id, reason? }>   (first settle wins; repeats return the first outcome)
```
- Cooldown is measured on a monotonic high-water mark from the **start** of the accepted pulse. A clock that steps backwards is ignored (no time passes). Cancelling or finishing does not shorten the cooldown. A refused request never extends it and is never queued or replayed.
- `active` refusal: a pulse is still unsettled (a long pulse can outlast the cooldown).
- `cooldownMs` below 4000 throws (4000 is the approved design value, not a safety threshold). The arbiter is independent of every controller: destroying or recreating a scene cannot reset it.
- Nothing here claims to cover flash producers outside it (other page animation, video, other tabs). That must be listed before any promotion.

## Controller
```
const m = createWeatherMotion(root, { weather, arbiter, env, reducedMotion:'auto'|'reduce', startPaused, startStopped, active, flashEffect })
m.state()      -> { weather, phase:'still'|'running'|'paused'|'destroyed', blockers:[...], motion, animations, flashActive, visibilityPending, error }
m.pause() / m.resume()      user freeze in place (WCAG 2.2.2 control, free)
m.stop()  / m.start()       user "show the still": removes motion, restores the approved composition
m.setActive(bool)           host: scene selected/active or not
m.requestFlash({requester}) -> accepted ticket | { status:'refused', reason }   (no visual exists yet; see below)
m.subscribe(fn) -> unsubscribe;  m.targets() -> animated elements (for tests);  m.destroy()  idempotent
```
`root` is the inline `<svg>`; the weather must match the scene (rain/storm streak groups must exist, else `TypeError`). `overcast` has no rain motion: the controller is valid and permanently `still`. `env` supplies `document`, `matchMedia`, `IntersectionObserver`, `createSvg(tag, attrs)`; the default is derived from `root.ownerDocument`. No module-level state: any number of controllers may share a page.

### Independent blockers
Each blocker is its own flag; the scene moves only when the set is empty. Clearing one never clears another.

| Blocker | Set by | Class |
|---|---|---|
| `user-pause` | `pause()` / `startPaused` | pause (freeze in place) |
| `hidden` | `document.visibilityState === 'hidden'` (live `visibilitychange`) | pause |
| `offscreen` | `IntersectionObserver` not intersecting on the glass (scene box if no glass). **Set from creation while an observer exists** (`visibilityPending: true`) and cleared only when its first callback reports intersection, so nothing animates and no flash is accepted before visibility is known; absent observer: treated as on screen, never pending | pause |
| `inactive` | `setActive(false)` / `active:false` | pause |
| `user-stop` | `stop()` / `startStopped` | **still** |
| `reduced` | `(prefers-reduced-motion: reduce)` live OR option `reducedMotion:'reduce'` (an option cannot override the user's preference) | **still** |
| (destroyed) | `destroy()` | **still**, permanent |

### Lifecycle table (after every change the controller reconciles to exactly one row)
| Blocker set | Never built | Built (motion on screen) |
|---|---|---|
| empty | build: hide original `rain-streaks`/`droplets`, insert animation-only layers, run | resume all animations (phase kept) |
| only pause-class | **stay on the approved still** (nothing built until first unblocked) | pause all animations in place |
| any still-class (or destroyed) | still | cancel animations, remove inserted layers, restore the original attributes exactly -> approved still |
| still-class cleared, pause-class remains | still | still (a rebuild waits until the set is empty) |
| still-class cleared, set empty | build (phase restarts at tile start) | n/a |

Restore is checked on the final DOM (serialisation before start equals after stop/reduced/destroy), not on source bytes. The original rain drawing is hidden with `display="none"` only while motion is active; its previous attribute value is put back.

### Animation-only layers (see `rain-motion.mjs`)
Inside the existing pane-clipped group, after the original droplets: `g[data-p26-motion=rain]` holding far streaks, near streaks and sliding drops. Streak layers are three copies of one tile (one `<path>` each, offsets `k*v` for k = -2, -1, 0) in a group animated by `transform` translate by exactly one tile vector `v` along the streak direction, linear, infinite. Only `transform` and `opacity` are animated. Nothing animates the duck, its ancestors or the lamp layers; no cloud drift.

### Flash (Stage C)
`m.requestFlash({requester})` -> accepted ticket | `{status:'refused', reason}`. Refusal precedence, none of which touches the arbiter except the last: `destroyed` > `reduced-motion` > `stopped` > `blocked:<blockers>` (includes pending visibility and a cropped-out glass) > `motion-unavailable` (rain failed to build) > `flash-visual-not-built` > `no-arbiter` (fails closed) > the effect's own `canStart` reason (`not-storm`, `no-glass`, `no-room-anchor`, `flash-nodes-present`; skipped while this scene's own pulse runs, so that case reads `active`) > arbiter refusals (`active`, `cooldown`). `effect-start-failed` after acceptance rolls the overlay back and settles the ticket `cancelled`; that attempt still counts against the budget (conservative).
Effect contract (`flashEffect`): `canStart({root, weather, createSvg}) -> reason|null`, `start(ctx) -> { finished, cancel(), animations, targets }`. The lightning effect adds two animation-only overlay nodes (`window-lift`, `room-lift`), animates only their `opacity` once (600 ms), and removes them when it finishes or is cancelled. A natural end -> `finished`; any blocker or destroy while it runs -> cancelled to neutral, outcome `cancelled`, never resumed; a watchdog (nominal end + 1500 ms) cancels a pulse that never settles. Outcomes a host sees: `refused` / `finished` / `cancelled` (via `ticket.done`). `m.flashAnimations()` / `m.flashTargets()` expose the running pulse for tests and measurement only. No audio is wired. Other page flash producers are outside this coverage.
