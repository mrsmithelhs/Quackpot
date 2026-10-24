# Plan 02 pre-build mechanism review

**Date:** 2026-10-24

**Disposition:** Mechanism approved with the corrections below. The implementer may proceed to the local scaffold/build and smoke evidence after applying these corrections. A substantially different mechanism returns for review. Final folder ratification and live publication remain owner gates.

## Corrections to the submitted outline

1. **Preserve root CommonJS behavior.** Omit root `"type":"module"`; existing `scripts/dev/plan-status.js` and its test use `require` and would fail under that package setting. Use `vite.config.mjs`. Browser `src/main.js` can remain an HTML module script without changing Node's root package mode. Run existing packet tooling and the simulation tests after creating the package file.
2. **Record reproducible dependencies.** Include `package-lock.json` in the owned outputs and commit it. Verify the selected Vite release and Node support against official documentation at implementation time; report the installed version. Vite remains a development dependency with zero runtime dependencies fetched from a CDN. If adding an `npm test` script, include the existing simulation tests as well as packet tooling, or name a narrower script honestly.
3. **Keep assets sourced from SVG and base-aware.** A placeholder SVG is appropriate; omit the proposed `.ico` unless it is derived from committed SVG source with an explained need. A static SVG favicon suffices if one is needed. Use Vite-processed imports or a base-aware public-asset URL so the placeholder works under `/Quackpot/`; do not assume a raw `/placeholder-duck.svg` points to the project subpath.
4. **Observe the built page in a browser.** HTTP 200s and text searches alone do not prove runtime behavior. Load the built page through a static subpath server, inspect rendered content and console, and capture requests through initial load and reload. Expected local document/script/style/SVG requests are normal site delivery; the constraint prohibits app-authored runtime requests/telemetry and external dependencies. Report observed requests and scan limits precisely. Verify `/Quackpot` trailing-slash behavior; no SPA route system is needed for this one-page placeholder.
5. **Keep remote evidence bounded.** A Pages API 404 alone does not distinguish unconfigured Pages from unavailable access. Report the response as observed and avoid declaring the remote configuration proved. No remote configuration, push or live Pages publication is approved by this mechanism review.
6. **Use the actual advisor capability.** Recheck the registry against the thread's callable tools; an unlisted harness name alone does not establish unavailability. Conversely, a callable `pro` alias/self-reported model alone does not establish a higher tier. Record the actual capability and any degraded-mode rationale without treating unverified model identity as platform evidence.

## Scope and next gate

Own root `index.html`, `package.json`, lockfile, `.gitignore`, `vite.config.mjs`, minimal `src/` and `public/` placeholder assets, and this Plan 02 report folder. Ignore `node_modules/` and `dist/`. Leave `sim/`, Plan 01 reports/results, packet status/index, and canonical structural docs untouched. The proposed root entry, `src/`, SVG asset locations, and ignored `dist/` are approved for the spike; they are not yet the ratified project layout. Propose shared-module imports/moves in the report rather than making them during Plan 01 repair.

Run `check plan-02` before building, then produce the packet's local build/subpath evidence and exact final layout recommendation. Commit only owned files, with the progress report last; never push. The owner reviews layout ratification and any requested live publication after the evidence exists.
