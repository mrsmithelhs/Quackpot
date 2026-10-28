# Proposal: bounded animated rain and story-triggered lightning (document only)

Status: **proposal for orchestration/owner review. No code, no art change, no browser use, no kit change.** Written after the owner approved the still weather cells. Animated rain and lightning were explicitly retained as future options, not selected. The still SVGs stay the source of truth and are unchanged by anything here.

## 1. Goal and non-goals

Goal: decide whether, and how, the approved living-room weather stills could move for a few deliberately staged dire beats: rain that moves, and lightning that happens when the story says so.

Non-goals: ambient lightning on a timer, thunder or any audio, other rooms, new art, kit hooks, production wiring, Plan 25 integration, any claim that a flash effect is photosensitivity-safe. The physical duck stays immobile and is never animated.

## 2. What the current stills give us

- Layers are already grouped by role in the SVG: `data-p26="sky"`, `clouds`, `rain-streaks`, `droplets`, plus `weather-tint`, `weather-vignette`, `window-spill` and (storm + lamp) `lamp-spill`. All sit inside the scene's own viewBox; the window panes are a `clipPath`, so moving rain cannot leak outside the glass.
- Streaks are one seeded `<path>` per weather. They are random over the glass box, so they are **not a seamless loop** today.
- The scene is a plain string. Animation would not need to change it: elements can be addressed by their roles.
- The kit scopes ids per instance but does **not** scope CSS animation names (that was hook H4 in the earlier proposal).
- The storm cell has no flash layer and the checks assert no animation or flash constructs exist. That check would stay for the still output.

## 3. Options for how motion is driven

| Option | How | For | Against |
|---|---|---|---|
| A. CSS keyframes inside the SVG | `@keyframes` in the scoped `<style>` | declarative; no JS | restarting or cancelling one flash needs class toggling with a forced reflow (a toggle alone does not prove restart); keyframe names collide across instances unless the kit's scoping is extended (H4); reduced-motion needs a media query baked in; hard to enforce one global flash budget |
| B. Host-side controller using the Web Animations API on the still SVG | JS attaches `element.animate(...)` to the role groups of an inline `<svg>` | exact start, pause, resume, cancel, finish events; no keyframe-name scoping at all; one scheduler can own the aggregate flash rule; reduced-motion decided in code; teardown is `cancel()` | needs inline SVG in the DOM and a small piece of host JavaScript outside the kit |
| C. SMIL | `<animate>` in the SVG | declarative | weak control (restart/pause), uneven tooling, not recommended |

**Recommendation: B.** The kit and the still strings stay pure and unchanged. A separate host-layer controller adds motion on top, and "no controller" is exactly the approved still. Story-triggered lightning needs host code to decide when anyway, so a controller is not extra architecture.

Embedding consequence (stated narrowly, to be verified in a browser phase, not assumed): the controller can only reach an SVG that is inline in the page. If a host shows the same scene as `<img>` or a CSS background, it shows the still. I make no claim about how any browser treats animation inside SVG images because option B does not rely on it.

## 4. Proposed behaviour (if approved)

### 4.1 Rain
- Two to three layers moving by `transform` only: far streaks (slow), near streaks (faster), droplets (slow slide, fade). Cloud drift is optional and very slow.
- Intensities map to the existing weathers: `rain` and `storm` set speed and density (same art, same slant). Overcast has no rain motion.
- Seamless loop needs a **tile**: the streak path regenerated as a repeating tile of known height, drawn twice and translated by exactly one tile. This is the only art-side change, and it must leave the still unchanged (the still would use the first tile only, or be proven pixel-identical).
- Only `transform` and `opacity` are animated. No filter, blend-mode or clip-path property is animated.

### 4.2 Lightning
Story-triggered only. No idle flashes, no timers started by the kit or the controller.
- A flash is a brief brightening of the window sky plus a small, low-contrast cool lift of the room, then decay: at most two pulses in an event, each well under one second.
- **One owner for the aggregate rule:** all flashes go through one scheduler in the controller. Whatever called it (story beat, test, developer button), a request inside a cool-down is refused and reported (`{ accepted: false, reason }`), not queued. Default cool-down and per-event pulse count are parameters to fix at review; the starting proposal is one event per four seconds, two pulses per event. That keeps any rolling one-second window at three or fewer flashes by construction.
- Restart and cancel semantics are explicit: an event is an `Animation` object; `cancel()` ends it; a new event only starts when the scheduler accepts it. No reliance on class toggling.
- The flash area and step are bounded by design (small window area; room lift kept low in relative luminance) and **measured, not asserted** (see section 6). I will not call this safe; it needs an informed review before any shipping decision.

### 4.3 Reduced motion and still behaviour
- Default `reducedMotion: 'auto'`: if the user prefers reduced motion, the controller starts nothing (the approved still remains) and refuses flashes. The owner may instead choose a single slow, non-flashing brightness fade for the beat; that is a decision (section 8).
- `motion off` and "no controller" are the same still image, byte for byte.

### 4.4 Pause, visibility, teardown
- Pause all motion when the page is hidden (`visibilitychange`) and when a scene is off screen (`IntersectionObserver`); resume on return.
- Provide `pause()` / `resume()` for the host UI. Ambient motion that lasts more than a few seconds should have a user-reachable way to stop it; whether the game UI offers that control is an owner/host decision.
- `destroy()` is idempotent: cancels every animation, disconnects observers and listeners, removes anything it added. A scene that is re-rendered or removed must be destroyed first. Tests assert no animation, observer or listener survives it.

### 4.5 Repeated instances
Option B has no named keyframes, so two or more scenes on a page cannot collide. Each controller is bound to one root element and holds no module-level state. A test mounts several scenes with different prefixes and checks independence (pausing, destroying or flashing one does not touch the others, and the shared flash budget is per host decision, see section 8).

### 4.6 Duck, lamp and the rest
The controller targets only the role groups named above. It never touches the duck subtree or any ancestor transform of it, and a check asserts that no animation targets the duck or its ancestors. The kit's lamp layers are not animated. A flash that lifts the room also lifts the lamp area slightly; that is part of the measured composite, not a lamp change.

## 5. Performance

- Budget: a handful of animated elements per scene (roughly two rain layers, one droplet group, one cloud group, one flash rect, one flash sky rect), `transform` and `opacity` only.
- Known risk: the scene already uses `mix-blend-mode` (lamp pool, sun/weather tints) and blurred filters on static layers. Animating content that sits under or over blended or filtered layers can force repeated recompositing. Measure it; do not assume.
- Measurement plan: record per-frame cost with the Performance APIs while the controller runs on the storm and storm + lamp cells, with one and with several scenes, and compare with the still. Frame sampling cannot use `requestAnimationFrame` in a hidden pane (it does not fire there), so the measurement needs a visible pane or an owner-run check. No claim about low-end devices can be made from this machine; the owner would need to name target devices.

## 6. Verification (deterministic where possible)

1. **Pure logic tests in Node:** scheduler cool-down, per-event pulse count, refusal reasons, pause/resume/destroy state machine, reduced-motion decision, using a fake clock and a fake element that records `animate()` calls. No browser needed.
2. **Still invariants:** still SVG output is unchanged byte for byte; the existing no-animation checks still pass for the still strings.
3. **Deterministic flash curve:** drive each flash animation by setting `currentTime` in steps (for example 1/60 s) with the animation paused, rasterise the scene at each step with the existing in-page rasteriser, and compute a luminance-versus-time series. Evaluate it against an explicit flash definition (relative-luminance change and flashed-area thresholds in the style of WCAG 2.3.1) and report the numbers. Approximate, and not a certification.
4. **Browser pass (one coordinated slot):** visual review of rain and storm motion at 1280×720 and 390×844 in wide and medium framing, loop seam check, pause on hidden tab, off-screen pause, teardown, two simultaneous instances, a visible performance measurement, and the reduced-motion path through the controller option (the pane cannot emulate the OS setting, so that is stated as a limit).
5. **Duck and lamp guard:** no animation targets the duck or its ancestors; lamp markup unchanged.

## 7. Staged plan (each stage stops for review)

| Stage | Deliverable | Checks |
|---|---|---|
| A | Controller spec and the pure logic with fake-clock tests (no art, no browser) | Node tests; still output byte-identical |
| B | Seamless rain/storm tile generated report-locally; loop motion for rain layers; gallery demo with pause/resume/destroy | still unchanged; browser pass for motion, seam, lifecycle, two instances |
| C | Lightning scheduler and flash art; deterministic luminance-curve evidence; host-trigger demo button in the gallery | curve numbers vs the flash definition; cool-down refusal; owner look |
| D | Performance measurement and the owner's target-device question | recorded numbers and limits |
| E (only if separately approved) | Promotion shape: where the controller lives, how Plan 25 embeds scenes, any kit hooks | separate proposal |

## 8. Decisions needed from the owner

1. Approve option B (host-side controller, still SVG unchanged) over CSS keyframes in the SVG?
2. Is ambient rain motion wanted at all, or only inside deliberately staged beats? (Affects the pause/stop control question.)
3. Lightning policy: host-triggered only (proposed), cool-down default of four seconds with two pulses per event, refuse-not-queue. Agreed, or different numbers?
4. Reduced motion: still image and no flash (proposed), or a single slow non-flashing fade for the beat?
5. Is the cool-down per scene or per page when several scenes are mounted? (Proposed: per page.)
6. Who needs to review photosensitivity before anything ships, and what are the target devices and browsers for the performance check?
7. Confirm audio and thunder remain out of scope; the controller would only expose an event or promise when a flash finishes so a later audio stage could synchronise.

## 9. Risks and what this proposal does not claim

- No claim of photosensitivity safety, standards compliance or low-end performance; each is a measured or reviewed gate.
- The seamless tile changes how streaks are generated; it must reproduce the approved still exactly or the still is re-approved.
- Host code outside the kit is a new kind of artifact for this project; its home (report, host UI, or a future module) is deliberately undecided until Plan 25 settles how scenes are embedded.
- The shared dev server hot-reloads on other agents' edits, which resets running animation state in a review browser; later browser passes would keep that coordination.
- Story beats may want more flashes than a rate cap allows; that is a conflict to resolve in review, not by loosening the cap silently.
