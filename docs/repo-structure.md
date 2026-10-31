# Repository structure

**Owner-ratified paths:** 2026-10-24, following Plan 02's independently verified local build/subpath spike. Live publication is separately gated.

| Path | Role |
|---|---|
| `index.html`, `vite.config.mjs`, package/lock files | Root web entry and build configuration; preserve CommonJS behavior for existing Node `.js` tooling |
| `src/` | Playable Plan 03 browser mechanism slice plus accepted standalone rig/audio proofs |
| `src/core/` | Current game engine, canonical pure PRNG/log/Receipt modules, browser storage and digital rig composer |
| `src/assets/svg/` | Authored SVG source; accepted Mode C rig. Digital cards and races use the accepted rig through focused render/motion helpers; physical companion assets remain separate |
| `sim/` | Separate headless model, strategies, experiments and tests; PRNG/log/Receipt entry files re-export canonical `src/core` modules |
| `scripts/dev/` | Development, packet and smoke tooling |
| ignored `dist/` | Static build artifact, outside documentation; publication workflow remains undecided |
| `docs/` | Documentation and packets; never the Pages publish source |
| `reports/` | Evidence and owner-review artifacts; generated concept images may live here and do not ship |

## Current source map (initial map2026-10-25; selected status/pointer reconciliation2026-10-31)

| Source | Responsibility |
|---|---|
| `src/main.js` | Browser boot/restore, view/navigation orchestration, event callbacks, autosave and storage warning presentation |
| `src/core/game-engine.mjs` | Game state/rules, guarded one-time actions, deterministic outcome streams and event emission; no DOM rendering |
| `src/core/life-config.mjs`, `life-progression.mjs`, `life-validation.mjs` | Plan38 new-policy configuration, pure phase/action/obligation transitions and replay validation. New runs use policy1/schema4; old schemas retain legacy continuation. Integrated delivery awaits owner acceptance; no claim of complete whole-run balance |
| `src/core/prng.mjs`, `event-log.mjs`, `receipt.mjs` | Canonical deterministic RNG, append-only integrity/completeness and log-derived Receipt projection |
| `src/core/storage.mjs` | Local save envelopes, validation, backup/corruption handling and temporary-memory fallback |
| `src/ui/hud.js`, `desk-view.js`, `gacha-view.js`, `race-view.js`, `modals.js`, `receipt-view.js` | DOM views from engine state plus callbacks. Some import roster/constants; these are pragmatic renderers, not a formal independent view-model layer |
| `src/style.css` | Existing global presentation rules; coordinate edits here rather than letting parallel packets overlap |
| `src/core/duck-rig.mjs`, `src/assets/svg/duck-rig.svg` | Mode C rig source, now used by revealed digital gacha cards through Plan20's rig view; physical companion remains separate |
| `src/ui/duck-rig-view.mjs`, `duck-motion-controller.mjs`, `duck-motion.css` | Accepted Plan20 revealed-card rendering, cosmetic keyed loops and per-instance pause/visibility/reduced-motion/cleanup |
| `src/ui/duck-dex-view.mjs`, `acquisition-queue.mjs`, `duck-dex.css` | Accepted Plan21 collection/inspector and first-owned reveal presentation; engine owns discovery evidence and persistent seen state. Catalog growth and copy refinement remain separate follow-ups |
| `src/ui/desk-phone.css`, `desk-view.js` | Persistent static portrait phone alongside physical companion; existing stage-transition helper remains a separate presentation lifecycle |
| `src/ui/life/` (`life-routing.mjs`, `life-decisions.mjs`, `life-preview.mjs`, `life-copy.mjs`, `life-art.mjs`, `life-view.js`, `life.css`) | Plan38 apartment life surfaces (Plan28 selected mix): breakfast tap, rent notice, phone-native shift/card offers, object confirms, day bar and the still posed duck. Routing/decisions are pure and read engine state only; `main.js` owns every engine call. Paired `*.test.mjs` files |
| `src/audio/synth.mjs` | Accepted standalone synthesis proof; production audio integration remains pending |

Data flow: player action → controller callback → engine mutation/outcome/event → rendered view. Saving serializes state, log and RNG into a validated envelope. Terminal Receipt uses the event projection, never inference from final state. The physical companion and digital roster remain separate.

## Review artifacts and future integration

`reports/development/*/wireframes.html` and audition pages are isolated review artifacts. The production Vite entry is root `index.html` → `src/main.js`; reports are not imported or published as game pages. Wireframe file size does not itself increase the game bundle.

Implement approved behavior through a bounded integration packet, using existing source roles and small feature helpers where justified. Read the selected-decision handoff first; inspect only relevant mockup portions when needed. Keep prototype controls, fake service labels and review commentary out of production. Do not add mock game rules, duplicate an engine/synth or import report assets without the relevant selection/provenance gate.

Historical file-size observations are not current measurements or automatic refactor thresholds. Controller, engine and global styles remain coordination hotspots; use focused ownership/lifecycle boundaries rather than a framework migration or whole-tree rewrite. Plan19 shell integration is implemented and owner-closed. Plan38 now integrates new-policy progression, engine/storage/Receipt and accepted apartment routing; owner experience review remains. Legacy save routes intentionally remain separate, not a second new-policy clock. Plan40 work/evening visual adoption and later narrative expansion remain separate.
