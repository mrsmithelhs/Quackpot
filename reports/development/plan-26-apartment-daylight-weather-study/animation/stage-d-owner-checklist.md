# Plan 26 Stage D: owner-run checklist for the machines I could not test (result: PENDING for every row)

Why this exists: Stage D evidence in `progress.md` section 9.5 comes from **one fast laptop** (Ryzen 7 8845HS, Radeon 780M, 144 Hz) driving **one isolated headless Chrome 156**. No representative slower student or lab machine, no second browser and no actual OS reduced-motion setting were available to me. Nothing below has been run; do not read any number from section 9.5 as evidence for these machines, and do not substitute throttling or the desktop for them.

Run it on (1) the **teacher machine** and (2) a **representative slower student/lab machine**, with the browser that machine's users actually use. The gallery must be reachable from that machine (the owner's dev server, or any static copy of the report page); I did not build, deploy or serve anything.

## 0. Write down the machine (per device)
Model, CPU, RAM, GPU or "integrated", OS and version, browser and exact version, display refresh rate, power state (plugged in / on battery, power mode), other heavy apps open, window size.
Result: _pending_

## 1. Frame timing and cost (one foreground tab, nothing else happening, about 20 seconds total)
Open `animation/gallery.html` and keep the tab in front. Open the browser console and paste, in one go:
```js
await (0, eval)(await (await fetch('./tools/stage-d-page.js')).text());
const out = { env: __sd.env() };
await __sd.setup({ show: 'one', selected: 'stormlamp', still: true });  out.still = await __sd.measure(3000);
await __sd.setup({ show: 'one', selected: 'rain' });                    out.rain  = await __sd.measure(3000);
await __sd.setup({ show: 'one', selected: 'stormlamp' });               out.storm = await __sd.measure(3000);
copy(JSON.stringify(out, null, 1));
```
Paste the clipboard into a file and send it back. Read `framesPerSecond`, `medianMs`, `p95Ms`, `maxMs`, `over25ms`, `over50ms`, `longTasks`, `timelineVsWall` (should be near 1.0). If `framesPerSecond` is far below the display's refresh rate or `over50ms` is more than a handful, note it. For a fuller picture record a **3-second DevTools Performance trace** in the three states (Show still, rain, storm + lamp) and note main-thread time per frame and any dropped frames; the Chrome numbers I have show about 0.2 ms of main-thread time per frame for the still, 1.0 ms for one running scene and 2.2 ms for four, with a style recalculation and layout on every frame (these SVG animations run on the main thread), which is the number that grows on a slower CPU.
Result: _pending_

## 2. The real-time pulse, felt (this flashes once, on purpose)
Tick "enable lightning requests", click **Lightning (one pulse)** on the storm + lamp scene **once**, and watch at normal speed. Write down: did the flash appear at once; did the whole scene wash white then fade quickly; did the window stay light about half a second longer then fade; any stutter, late start, tearing or a pulse that never finished (the page cancels a stuck pulse after 2.3 s and says `cancelled (watchdog)` in the event log). Do not click again for at least four seconds; a second click inside that time is refused by design. For timestamps instead of impressions, paste instead:
```js
await __sd.setup({ show: 'one', selected: 'stormlamp' });
const p = await __sd.pulse('stormlamp', 3000); delete p.series; copy(JSON.stringify(p, null, 1));
```
(also flashes once). On this machine the pulse settled at 812.9 ms (nominal 800), the scene flash ended at 311.7 ms, the window at 805.3 ms (tail 493.6 ms), with no stale frame afterwards.
Result: _pending_

## 3. Hidden page (real)
With a storm scene running, switch to another browser tab for a few seconds and come back. Expected: the scene's status line reads `paused` with `hidden` while away and `running` after; a pulse cannot start while hidden. Note anything different (for example a different browser keeping the page "visible" in the background).
Result: _pending_

## 4. Actual OS reduced-motion setting (I changed no Windows setting)
Turn on the OS setting (Windows: Settings, Accessibility, Visual effects, Animation effects off; macOS: Reduce motion), reload the gallery, and check the scene stays on the still, the status line shows `reduced`, and the lightning buttons refuse (event log `reduced-motion`). Then **restore your setting**. Also try switching the setting while a scene is running and confirm it stops without a reload.
Result: _pending_

## 5. Second browser (optional, if the machine has one)
Repeat 1 to 3 in the other common browser and name it. I only drove Chrome.
Result: _pending_

## What a pass means
Nothing here certifies anything. It tells root and the owner whether the study's cost and behaviour on the machines that matter look acceptable before any promotion proposal (Stage E) is written.
