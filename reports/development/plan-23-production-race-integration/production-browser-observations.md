# Plan 23 production browser observations

**Observed:** 2026-10-27, isolated in-app browser against `http://127.0.0.1:5181/Quackpot/`. All browser turns were coordinated with QP Orch; each tab was closed and each explicit viewport override reset afterward. The existing Vite server and owner Chrome tabs were left untouched.

## Responsive presentation

- At **1280×720**, the selected player finished first in the deterministic test run. The accepted actual result showed `1st place! +50 Gems`; the podium placed second / player-first / third from left to right, with `(you!)` attached to the player's place label. The browser screenshot was captured in the coordinated CUA session; this text file records the verifiable observation because no local PNG was materialized.
- At **390×844**, `Opening Pond Trial` stayed left and `Tutorial event` right on one responsive header row. The player payout banner and all three large podium ducks were visible in the same view. Document width was 375 CSS px, below the 390 px viewport, with no horizontal overflow.
- The whole shared course/camera layer, including pond/shore, finish markings and runners, computed to `brightness(0.43) saturate(0.75)` in both the accepted slowdown highlight and settled podium reveal. Podium cards, labels and the payout banner remained bright/readable above that layer.

## Playback and controls

- Normal-motion playback advanced the recorded clock and runner geometry; between samples the player's course position changed `61.96% → 58.99%` and the duck shell/wing computed transforms changed. This is rendered playback evidence, not an inference from the animation source.
- The final production-route check observed Continue disabled at `0.02 s` while Skip was enabled. Natural playback reached its settled result (`22.54 s` recorded course time), showed the result summary and actual player payout, then enabled Continue and disabled Skip.
- Replay restored the unsettled state. Explicit Skip then settled the same committed result, enabled Continue, and did not change the Gems balance or payout.
- Seeking actual recorded events showed `Biblically Accurate Duck lost speed briefly while leading.` for `leader-wobble-slowdown`, and `Rival B touched the wall and recovered.` for `wall-impact`. Event and checkpoint entries remained combined in chronological order.
- Shared Pause held the podium duck's exact computed transform over 550 ms; Resume continued the same ambient loop. Reduced-motion lifecycle and settled static state were verified by focused controller tests; an operating-system reduced-motion preference was not changed for browser rendering.
- No browser console warnings or errors were observed in the production IAB checks.

## Automated smoke-harness limitation

`npm run test:smoke` was attempted twice, serially after the coordinated browser slots were released. The pretest Vite build passed on both attempts and Vite Preview started on `127.0.0.1:4173`; before the harness connected to Chrome CDP or ran page assertions, its dedicated Chrome process exited with Windows code `2147483651` (`0x80000003`). The harness cleaned up its dedicated profile each time. This is a browser-process launch failure, not a page assertion result. The smoke harness was not changed to hide the launch failure; isolated production UI checks above are separately recorded evidence, not a substitute claim that the smoke test passed.
