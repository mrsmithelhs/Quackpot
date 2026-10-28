# Weather motion: controller and arbiter interface, lifecycle table (Plan 26 Stages A/B)

Report-only. Host-side Web Animations API on an **inline** `<svg>` produced by the unchanged study wrapper. No controller means exactly the approved still. The kit, `study/*`, `gallery.*` and the still generators are not touched. Lightning is **not built**: only the page arbiter and the controller's refusal/cancel logic exist (tested with a fake effect); the flash art and composite evidence are a later gate.

## Files
| File | Role |
|---|---|
| `arbiter.mjs` | `createFlashArbiter({now, cooldownMs})`: the single page-wide flash budget, monotonic clock, refuse-not-queue |
| `rain-motion.mjs` | pure spec of the animation-only rain layers (seamless tile geometry, speeds, drops); no DOM |
| `controller.mjs` | `createWeatherMotion(root, options)`: blockers, build/restore, pause/resume, stop/start, destroy |
| `tests/*.test.mjs` | Node tests with a fake clock and a fake DOM (`node --test animation/tests/`) |
| `gallery.html`, `gallery.js`, `tools/browser-harness.js` | separate motion gallery and in-page measurement helpers (browser turn) |

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
m.state()      -> { weather, phase:'still'|'running'|'paused'|'destroyed', blockers:[...], motion, animations, flashActive, error }
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
| `offscreen` | `IntersectionObserver` not intersecting (absent observer: treated as on screen) | pause |
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

### Flash (logic only)
Refusal precedence: `destroyed` > `reduced-motion` > `stopped` > `blocked:<blockers>` > `flash-visual-not-built` > `no-arbiter` > arbiter refusals. The first five consume no cooldown. With an injected test `flashEffect` (`start(ctx) -> { finished: Promise, cancel() }`): accepted -> ticket; natural end -> `finished`; any blocker appearing, or destroy, while a flash runs -> effect cancelled to neutral, outcome `cancelled`; clearing the blocker never resumes that beat. Outcomes a future host can use: `refused` / `finished` / `cancelled`; no audio is wired.
