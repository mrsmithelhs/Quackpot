# Plan 26 Stage E proposal: weather motion and lightning runtime

**Status: PROPOSAL ONLY, aspirational by design.** Nothing here is built, decided or authorised. No kit, production, `src/`, `package.json`, `docs/repo-structure.md`, packet-status or save-format change is made or implied by writing it. Everything described under "proposed" is a recommendation for root and the owner to accept, change or reject. Facts about production below are read from the current source (file references given); everything about the study is from `reports/development/plan-26-apartment-daylight-weather-study/` (progress sections 1-9.7).

## 1. Recommendation: a separate, bounded runtime-integration packet, in two parts

Plan 26 was a report-only investigation. Taking its result into the game is a different kind of work (runtime ownership, save and preference boundaries, a mounted surface, device gates), and one production fact makes that clear:

- **Production does not currently show the living room at all.** `src/ui/apartment-view.mjs` renders `area: 'desk-side'` only (`buildApartmentDesk`); the weather study is living-room only (the kit's `living` area with a window). So there is **no production surface that can show weather today**. Choosing and building that surface is an owner decision and a separate piece of work from extracting the runtime.

So I recommend closing the investigation as bounded evidence and opening **one new integration packet with two gated parts**:

| Part | What | Needs before it starts |
|---|---|---|
| **E1 Runtime extraction** | Move the already-tested pure modules into `src/` as feature helpers with their tests, **not mounted anywhere**, no UI, no kit change, no save change. Verifiable entirely in Node and in an isolated browser harness. | Root approval of this proposal's file list and API (sections 4-5); a bounded Node-run authorisation. |
| **E2 Mount on a surface** | Mount the weather still and controller on one chosen production surface, with settings, a visible pause control, triggers, credits, and re-run of the device matrix on the production build. | Owner decisions D1-D8 (section 12) and the owner/device checklist results (section 11). Not started until E1 is accepted and those are in. |

Keeping Plan 26 open to do this would grow the investigation indefinitely; a separate packet keeps each gate small. **Plan 25 stays separate:** its accepted desk/phone art, `apartment-view`, and `ambient-glow-controller` are only read as precedent here, and E1/E2 must not edit them (section 13).

## 2. Production facts this proposal rests on (read from source)

| Fact | Where |
|---|---|
| Views return a handle and `main.js` destroys and rebuilds them on every `renderApp()` (`deskViewHandle?.destroy?.()` and the other view handles), so any controller is created and destroyed often; **anything that must persist (the flash arbiter, preferences) has to live in `main.js` scope**, as `stageTransition` (created once at boot) and `animatePhoneGlow` (a `let`) already do. | `src/main.js` (renderApp, `stageTransition`, `animatePhoneGlow`) |
| The accepted precedent for an animated, reduced-motion-aware effect is `createAmbientGlowController(container, {active, animateEnabled, matchMedia, documentRef, IntersectionObserverRef})` returning `{setActive, setEnabled, destroy}`: it stops on destroy, inactive, disabled, `prefers-reduced-motion`, hidden page, or not visible, and **falls back to a static halo when no `IntersectionObserver` exists**. The study's controller has the same blocker set and pending-visibility start, with two differences listed in section 5. | `src/ui/ambient-glow-controller.mjs`, `src/ui/desk-view.js` |
| The only motion preference today is the session-only "Animate phone glow" toggle: a module-level variable in `main.js`, passed to the view and the settings modal; **it is not in the save envelope** (`STORAGE_KEY = 'quackpot_save_v1'`, `CURRENT_SCHEMA_VERSION = 3`, with migrations and validation). | `src/main.js`, `src/ui/settings-modal.js`, `src/core/storage.mjs` |
| The duck is animated by its own controller on its own shells (`data-duck-motion`, a domain-hashed motion selection). Weather must never target it. | `src/ui/duck-motion-controller.mjs` |
| `npm test` lists test files explicitly (a new test file must be added to that list); UI controllers sit flat in `src/ui/` with a `.test.mjs` beside them; the kit is `src/assets/apartment/` and is pinned and read-only for Plan 26. | `package.json`, `src/ui/`, `reports/.../pinned-kit.json` (kit commit `5237a2a4f58922ff713240a9e4c7221ab89e6c62`) |
| Hard constraints that bind this feature: no runtime network or CDN; static build; SVG-sourced art; saving stays in browser storage; keep analysis panels out of the live experience; the Receipt is built from displayed cues, player actions and pre-draw odds. | `AGENTS.md` section 5, `docs/founding/design.md` (cited there) |

## 3. Runtime ownership (who owns what)

| Concern | Owner (proposed) | Notes |
|---|---|---|
| The ONE page-wide flash arbiter (>= 4000 ms, refuse not queue) | `main.js`, created once at boot, injected into every view and controller | Independent of audio. No per-controller scheduler. Recreating a view or controller can never reset it. |
| Preferences (rain on/off, lightning on/off) | `main.js` variables passed down, like `animatePhoneGlow` | Persistence is decision D3; the proposal's default keeps them out of the save envelope. |
| Weather still markup | a new weather-layer module next to, not inside, the kit (section 5) | The kit stays read-only and pinned. |
| One controller instance per mounted weather scene | the view that mounts the scene (created in render, `destroy()` in its handle) | Same pattern as the glow controller. |
| Triggers (when lightning may be requested) | game/story code in `main.js` calling `controller.requestFlash({requester})` at explicitly named beats | Nothing is wired in E1; E2 wires only what the owner selects (D5). |
| Credits and provenance | settings modal credits `<details>` plus `README` beside the layer module | Section 10. |
| Measurement and gallery tools | stay report-only under `reports/`; **not promoted** | `gallery.*`, `tools/*`, `stage-d-*`, the restrained look unless D8 says otherwise. |

## 4. Candidate runtime files and extraction boundary (proposed; none created)

Study source to production candidate, with sizes so root can judge the scale (about 430 lines of runtime, about 1,800 lines of tests and fixtures):

| Study file (lines) | Proposed production file | Changes during extraction |
|---|---|---|
| `animation/arbiter.mjs` (48) | `src/ui/weather-flash-arbiter.mjs` | None to the logic. |
| `animation/rain-motion.mjs` (97) | `src/ui/weather-rain-spec.mjs` | None to the art or numbers (selected visuals are preserved); local seeded generator stays local. |
| `animation/controller.mjs` (207) | `src/ui/weather-motion-controller.mjs` | Policy edits in section 5 (flash gate, IO fallback, role names). |
| `animation/lightning-bright.mjs` (79) | `src/ui/weather-lightning-effect.mjs` | The owner-selected bright look only. The restrained look (`lightning.mjs`, 73) is not ported unless D8 asks for an intensity option. |
| `study/weather.mjs` (79) plus the minimum of `study/daylight.mjs`, `anchors.mjs`, `options.mjs`, `scene.mjs`, `pin.mjs` | `src/assets/apartment-weather/layers.mjs` plus `README.md` | See "layer boundary" below. A weather-only subset; the sun/daylight layers are not part of this proposal. |
| `animation/tests/*.test.mjs` and `fake-dom.mjs` (about 1,780 lines) | `src/ui/weather-*.test.mjs`, `src/assets/apartment-weather/layers.test.mjs`, a test-only DOM helper | Ported with their assertions; added to the explicit `npm test` list. |
| `gallery.html`, `gallery.js`, `tools/*`, `lightning-mechanism.md`, `stage-d-*` | stay in `reports/` | Not imported by the game. |

**Layer boundary (the one real design choice in extraction).** The weather still is currently produced by *inserting markup into the kit's output at regex anchors* (`study/scene.mjs`: after the rug, after the window item, before the first lamp glow), guarded by a kit pin. Three options:

- **A (recommended): a production wrapper next to the kit** (`src/assets/apartment-weather/layers.mjs`) that does the same guarded insertion, with a test that fails if the kit's anchors or pin change. The kit is untouched; a missing anchor yields the plain kit scene, not an error.
- **B: kit hooks** (the kit emits named weather insertion points). Cleaner long-term but changes the Plan 24 kit, which this proposal does not authorise and which needs its own owner decision.
- **C: ship stills only** (no weather motion), if the device gates fail.

Public DOM contract the controller depends on (renamed from the study's `data-p26-*` to a stable `data-weather-*` namespace in a mechanical, tested change): roles `sky`, `rain-streaks`, `droplets`, `window-spill`, the pane clip group's `clip-path`, and one inline `<svg>` root; the duck subtree and lamp layers are untouched and covered by contract tests run against the **production** markup.

**Public API (proposed, signatures only):**

```
createFlashArbiter({ now = () => performance.now(), cooldownMs = 4000 }) -> { request({requester}), snapshot(), cooldownMs }
createWeatherMotionController(root, { weather, arbiter, active = true, motionEnabled = true, flashEnabled = false,
                                      flashEffect, env /* tests only */ })
  -> { state(), setActive(b), setMotionEnabled(b), setFlashEnabled(b), pause(), resume(), requestFlash({requester}), subscribe(fn), destroy() }
createBrightLightningEffect({ schedule })   // injected as flashEffect by the host
```

`requestFlash` keeps the study's contract: an accepted ticket (`done` resolves `finished` or `cancelled` with a reason) or `{status:'refused', reason}`; all refusals that precede the arbiter consume no budget; a start failure after acceptance returns the accepted ticket already cancelled (`effect-start-failed`) with the budget spent. These outcomes are what a future audio or story host could synchronise to; **no audio is wired here**.

## 5. Policy edits the extraction must make (where the study and production precedent differ)

1. **Missing `IntersectionObserver` becomes static.** The study treats "no observer" as visible (a documented fallback); production's accepted glow controller treats it as static. Adopt the production behaviour.
2. **A separate flash switch.** Add `flashEnabled` (default `false`) as its own refusal, `flash-off`, that consumes no budget and does not affect rain. Rain on/off (`setMotionEnabled`, the study's stop/start) and flash on/off are independent preferences.
3. **Keep `reducedMotion` live and keep the study's rule that an option cannot override the user's preference.** The `'reduce'` option stays test-only.
4. **No module-level state; the arbiter is injected, never created inside a controller.** A controller built without one fails closed (flash refused).
5. **Rebuild cost.** Because `renderApp()` recreates views, a weather scene rebuilt on every render would restart the rain tile each time and sit blocked until its first visibility callback. E2 must either keep the weather host element across renders or accept and test the restart; this is a design risk to settle in E2, not assumed away here.

## 6. Lifecycle (production wiring, proposed)

| Event | Behaviour |
|---|---|
| View renders the weather scene | Create the controller with the injected arbiter and current preferences; it starts blocked (pending visibility) on the unchanged still. |
| First visibility callback | Visible: rain starts if nothing else blocks it. Cropped or off-screen glass: stays on the still. (The glass-only visibility gate is kept.) |
| `renderApp()` rebuild / route change | `destroy()` (idempotent) cancels animations and any live pulse to neutral, restores the exact still; the arbiter is untouched, so the cooldown survives. `setActive(false)` while a scene is retained but not current. |
| Hidden tab, off-screen, inactive, user pause | Rain freezes in place; a live pulse is cancelled to neutral and never resumed; flash requests refused. |
| User "show still" (motion off), live `prefers-reduced-motion`, destroy | Exact approved still restored; flash refused. |
| Preference toggled in settings | `setMotionEnabled` / `setFlashEnabled` apply live, no reload. |
| Animation API or observer unavailable, animate throws | Still stays; error recorded; flash refused (`motion-unavailable`). |

## 7. Preferences versus transient state

| Item | Class | Proposed handling |
|---|---|---|
| Rain phase, tile position, pulse progress, blockers, pending visibility, arbiter budget | transient | Never saved. Rebuilt every mount. |
| Rain motion on/off, flash on/off, paused | preference | **Default: session-only in `main.js`, exactly like `animatePhoneGlow`; not in the save envelope.** Alternatives for D3: a separate small preferences key (needs its own validation and an in-memory fallback), or a save-schema bump (not recommended: `CURRENT_SCHEMA_VERSION = 3` has migrations and Receipt evidence tied to it). |
| Weather/lightning events | **never in the append-only Receipt log** | They are decoration. If an effect were ever tied to an offer, odds screen or time-pressure moment it would become a displayed cue and need a Receipt decision first (D6). |

## 8. Triggers (explicit selection still required)

Proposed rules, regardless of which beats the owner picks: weather is **an explicit scene state**, never the real date or random; lightning only on a **named host request**, one pulse per accepted event, **no idle or timed flashes**, never tied to gacha pulls, offers, odds or purchase prompts without a separate owner and Receipt decision; reduced motion and the flash switch always win. E1 wires **no** trigger. E2 wires only the beats the owner names in D5 (examples to choose from, not selected: a rainy-day establishing view; a single storm beat in a story scene). No audio or thunder: a separate gate that would consume the arbiter's `done` outcomes.

## 9. Versioning and fallback

The module exports a `WEATHER_MOTION_VERSION = 1`; any change to the DOM contract bumps it and the layer module's contract test. Feature detection: no Web Animations, no `matchMedia`, no `IntersectionObserver`, or a missing anchor in the kit output all resolve to **the plain still**, never an error. Rollback is removing one mount call in the view (the still and the arbiter remain). A kit pin test (hash or anchors) fails loudly if the kit changes under the layer module.

## 10. Source, provenance and credits

All runtime code and art would be original to this repository, written for Plan 26 under owner direction (generated with Claude Code, Sonnet 5.5, in this session's work); no third-party code, fonts, images or network request is used. The kit dependency is pinned to commit `5237a2a4f58922ff713240a9e4c7221ab89e6c62`. E2 adds a short line to the settings modal's credits `<details>` and a `README` beside the layer module stating authorship, the kit pin, the lightning look's owner-selected status and the no-certification disclosure. This follows the repository's public-repo asset and privacy rules (`AGENTS.md` guardrail 8); the exact wording is D7.

## 11. Validation plan, and the owner/device checklist mapped to acceptance criteria

**Automated and harness validation (E1, then repeated on the production build in E2):**
1. The ported unit and contract tests run through the bounded Node launcher (serial, 1 GiB heap, 2 GiB sampled, 90 s); the contract tests run against the production-built scene (duck and lamp untouched, roles present, no module state, arbiter injection).
2. A kit pin or anchor test.
3. An isolated-browser lifecycle witness on the production build, as Plan 25 did (real hidden page, browser-emulated reduced motion, pending visibility, destroy and rebuild without leaked animations, preference toggles, cooldown surviving a rebuild).
4. The Stage D matrix re-run on the production build (still, rain, storm + lamp, one pulse, 3 s windows).
5. `npm test`, `npm run build`, `npm run test:smoke`, plus a recorded bundle-size delta.
6. **Composite and flash evidence re-measured on the production composition** (a new surface is a new measurement; the study's numbers do not transfer). Red-flash assessment stays unresolved (9.7): if the owner wants any flash-safety statement, that needs the W3C method (peaks and valleys, linearised RGB, CIE 1976 chromaticity distance) and is a separate approval; otherwise it remains a disclosed limitation.

**Owner checklist (`animation/stage-d-owner-checklist.md`) mapped to proposed pre-promotion criteria.** The numeric thresholds are **proposals for root and the owner to ratify**, not safety thresholds. Unavailable hardware stays **pending**; local desktop numbers and throttling are not substitutes.

| Checklist item | Pending evidence | Proposed acceptance criterion |
|---|---|---|
| 0, 1 Teacher machine, frame timing | Chrome console probe, three 3 s windows (still, rain, storm + lamp); optional DevTools trace | Median frame <= 1.25x the display interval; p95 <= 2x; frames over 50 ms <= 1% per window; no long task over 100 ms; timeline/wall ratio 0.9-1.1; main-thread time for one scene <= 25% of the frame budget at that machine's refresh rate. |
| 0, 1 Representative slower student/lab machine | Same probe, that machine's real browser | Same criteria. **If they fail:** rain default off for that class of device, lower density, or ship stills only (option C); the decision is the owner's. |
| 2 Pulse felt at true speed (teacher and lab) | A person watches one pulse on each; optional timestamp probe | Flash starts at once, whole-scene white then quick fade, window lingers about half a second, no stutter, tearing or stuck pulse (no `watchdog` cancel); **plus the owner's comfort judgement, including on a classroom projector or large display, where a whole-scene white flash fills far more of the field of view (D4)**. |
| 3 Real hidden page | Switch tabs on each browser used | Scene shows paused/hidden, flash refused, resumes on return. |
| 4 Actual OS reduced-motion setting | Turn the OS setting on, reload and toggle live | Stays on the still, flash refused, live toggle works without reload, on every OS the owner names. |
| 5 Second browser | Repeat 1-3 | Same criteria in each browser the owner names. |

## 12. Open decisions

**Owner (D):**
- **D1 Surface:** which production view shows a window with weather (the living room is not currently mounted), and whether that is a new view or an addition elsewhere.
- **D2 Defaults:** rain motion default on or off; **lightning default off recommended** until the device and comfort gates pass.
- **D3 Persistence:** session-only (recommended, as phone glow), a separate preferences key, or a save-schema change (not recommended).
- **D4 Classroom and projector context:** whether a whole-scene bright flash is acceptable in front of a class; whether to restrict it, label it, or offer the restrained look as an intensity setting.
- **D5 Triggers:** which named story or weather beats may request rain and which, if any, may request a pulse; confirmation that nothing is tied to offers or pulls.
- **D6 Receipt boundary:** confirmation that weather and lightning are decoration outside the Receipt log, or a design decision if any would accompany a cue.
- **D7 Credits wording and disclosures.**
- **D8 Intensity options:** bright only, or bright plus the earlier restrained look as a setting.

**Root (R):** R1 accept the two-part packet boundary; R2 layer option A, B or C; R3 flat `src/ui/weather-*` naming versus a subfolder; R4 Node-run authorisations for E1 (bounded launcher only); R5 whether any W3C-method flash analysis is wanted before any default-on use.

## 13. Coordination and non-goals

- **Plan 25:** accepted desk, phone and light-spill art stay as they are; this work reads `ambient-glow-controller`, `apartment-view` and `desk-view` as precedent and edits none of them. `main.js`, `style.css` and the settings modal are shared growth hotspots, so E2 changes there must be small, rebase-friendly and kept separate from any Plan 25 change; they are not bundled with Plan 25, Plan 18 audio or any other packet.
- **Plan 18 / audio:** no audio, thunder or TV or music. If sound is later wanted it is its own gated packet using the arbiter's outcomes, not a new scheduler.
- **Not proposed:** other rooms, kit hooks (option B), idle or timed flashes, brightness retuning, red-tooling beyond a separately approved W3C-method analysis, production promotion of any report tool.

## 14. What this proposal does not claim

It is not a certificate or readiness claim. The study's evidence is one fast laptop and one headless Chrome (progress 9.5); human true-speed viewing, the teacher and slower machines, a second browser and the actual OS reduced-motion setting are pending (section 11). The bright look is a large-area, high-contrast flash chosen by the owner (progress 9.3); its general-flash character, the unresolved red-flash assessment and the unmeasured production composition are limitations a promotion decision must carry forward.
