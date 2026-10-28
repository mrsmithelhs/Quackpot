# Archived authoring helpers (Plan 10 session) — historical, non-runtime

These scripts were used while authoring the Plan 10 artwork. They are archived for method transparency, **not** as a reproducible build: the final artwork is the SVG source (`duck-views.js`, `preview.html`, and now `src/assets/apartment/`). Nothing in `src/` or the game imports these files.

**Environment when used:** Windows 11, Git Bash, Node 20+ (ES modules, run as `.mjs` or with a loose `.mjs` import), Python 3 with Pillow and NumPy (only `render_svg.py`, `assemble.py`, `grid.py`). No dependency was installed for them.

**Disclosed changes made when archiving** (`tools/archive-authoring-tools.py`): only machine-path redactions. The session scratchpad directory became `<SCRATCH>`, the repo root `<REPO>` and any user-profile prefix `<HOME>` (seed.mjs 1, final-check.mjs 1, grid.py 1, assemble.py 3 replacements; the others contained none). Edit those placeholders (and the hard-coded `plan-10-metagame-duck-cinematography` folder layout they read) before running anything. No secrets or private session data were present.

| Script | Inputs | Outputs | Role |
|---|---|---|---|
| `gen-guides.mjs <outdir>` | none (landmark model and camera table are constants inside) | `guide-{front,side,rear,high,low}.svg`, `guides.json` | Projects a simple ellipsoid/sphere landmark model (see `sonnet-view-repair.md`: azimuth/elevation table, perspective distance 330) into silhouette guides used as tracing aids for the Haiku experiments. |
| `build-views.mjs <outdir>` | none | `styled-{view}.svg` (five views plus an `top` overhead draft), `styled.json` | Same model, with shading, painter order and underside bands: the projection-baked Sonnet drafts (`sonnet-candidates/`). |
| `render_svg.py` | `in.svg out.png [scale]` or `--sheet out.png a.svg b.svg …` | PNG | Approximate offline rasteriser (Pillow). Supports paths, ellipses, clipPath, translate and the old class styles; **not a browser** (no gradients, filters, masks, blend modes). Used only to iterate on drawings. |
| `seed.mjs` | frozen `duck-views.js` | `start.svg` files for the "improve a copy" Haiku experiments | Experiment seeding. |
| `assemble.py` | selected Haiku `duck.svg` files | `selected.json` | Re-wraps the chosen drawing per view with the shared header and normalises its bounding box (bottom y ≈ 249, centred). |
| `emit-sel.mjs <dir> <dest>` | `selected.json` | `duck-views.js` | Emits the five-view module (note strings are embedded in the script). |
| `emit-js.mjs <dir> <dest>` | `styled.json` | `duck-views.js` | Earlier emitter for the projection-baked drafts (superseded by `emit-sel.mjs`). |
| `final-check.mjs <outdir>` | `duck-views.js` | id-uniquified per-view SVGs | Parse/ID check helper. |
| `grid.py` | `styled-*.svg`, Haiku `duck.svg` files | candidate comparison grid PNG | Review aid. |

## What this archive does **not** make reproducible

- The two note strings for the side and rear views in the committed `duck-views.js` were edited by hand after `emit-sel.mjs` ran.
- **Rooms, desks, props and lighting have no generator.** They were authored directly in `preview.html` through a series of one-off patch scripts and direct edits (not archived: they only record how that page was patched). The frozen `preview.html` and the extracted kit are the source of truth for them.
- The Haiku experiment agents wrote their own helper scripts in their scratch areas; those are not archived (their final `duck.svg` files are in `haiku-experiments/`).
- Scripts were last run in the original session; they were not re-run for this archive.
