# Repository structure

**Owner-ratified paths:** 2026-10-24, following Plan 02's independently verified local build/subpath spike. Live publication is separately gated.

| Path | Role |
|---|---|
| `index.html`, `vite.config.mjs`, package/lock files | Root web entry and build configuration; preserve CommonJS behavior for existing Node `.js` tooling |
| `src/` | Browser game source; currently the local static placeholder |
| `src/core/` | Accepted destination for future pure shared PRNG/log/Receipt modules; relocation requires a bounded integration after Plan 01 acceptance |
| `src/assets/svg/` | Authored SVG source for game assets; the current placeholder remains in its existing path until scoped integration |
| `sim/` | Headless simulation, strategies, experiments and tests; shared modules are still here today |
| `scripts/dev/` | Development, packet and smoke tooling |
| ignored `dist/` | Static build artifact, outside documentation; publication workflow remains undecided |
| `docs/` | Documentation and packets; never the Pages publish source |
| `reports/` | Evidence and owner-review artifacts; generated concept images may live here and do not ship |

Future paths in this table are destinations, not claims that those modules exist. Keep any shared-module move separate from visual exploration and from another thread's simulation repair.
