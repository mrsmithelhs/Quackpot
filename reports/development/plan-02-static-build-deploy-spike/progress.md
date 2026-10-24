# Progress Report: Plan 02 — Static Build and Pages Deployment Spike

**Packet ID:** `plan-02`  
**Date:** 2026-10-24  
**Author/Implementer:** Implementer Thread (Antigravity)  
**Status:** Complete — Ready for Orchestrator Review (Frontmatter status left untouched per guardrail)  

---

## 1. Executive Summary

Plan 02 has successfully proven the static build and GitHub Pages deployment path for Quackpot:
- **Build Engine:** Vite 8.3.5 is configured via `vite.config.mjs` and installed as a development dependency with zero runtime dependencies.
- **CommonJS Preservation:** Root CommonJS behavior is preserved (omitting `"type": "module"` from `package.json`), ensuring existing packet tooling (`scripts/dev/plan-status.js` and tests) continues to run without modification.
- **Static Output & Zero Network Requests:** Production build compiles to `dist/` in under 50ms. Static asset inspection and live headless browser network tracing confirm zero runtime external CDN requests, zero tracking/telemetry, and zero third-party fonts (Hard Constraints #2 and #7).
- **Subpath Handling:** Configured for the GitHub Pages project subpath `/Quackpot/`. All HTML links, module scripts, stylesheets, and SVG asset imports resolve correctly to `/Quackpot/assets/...`.
- **Live Browser Verification:** Verified through an automated CDP-driven headless Chrome test (`scripts/dev/smoke-browser.mjs`), asserting document load, DOM mounting, SVG graphic decoding (`naturalWidth = 120`), console logging, cache-aware reload (200/304), and trailing-slash behavior.
- **Plan 01 Isolation:** Concurrency boundaries were respected throughout. No files in `sim/` or `reports/development/plan-01-seeded-economy-simulation/` were touched, staged, or modified.

---

## 2. Advisor Consultation Declaration

- **Selected Branch:** **Branch C — degraded mode (orchestrator-gate-only)**.
- **Rationale & Evidence:**
  The provider registry in `advisor-capable-providers.json` was inspected. The active platform (Google Antigravity) is not an entry in `advisor-capable-providers.json`. While the active thread's tool surface exposes `invoke_subagent` with a model parameter allowing `'pro'`, self-reported or callable aliases alone do not establish a verified higher tier or platform read-only structural enforcement under the registry definitions. Following Step 1 fail-closed rules, this thread treats itself as not advisor-capable and operates under Branch C (orchestrator-gate-only).

---

## 3. Review Corrections Addressed

All six corrections from `reports/development/plan-02-static-build-deploy-spike/prebuild-review-01.md` have been fully incorporated:

1. **Preserve Root CommonJS Behavior:** Omitted `"type": "module"` from root `package.json`. Configured Vite via `vite.config.mjs`. Verified that both `scripts/dev/plan-status.test.js` (143/143 passing) and all simulation tests (`sim/*.test.mjs`, 45/45 passing) pass cleanly under Node 26.
2. **Record Reproducible Dependencies:** Committed `package-lock.json`. Documented that Vite `8.3.5` was selected and installed, fully satisfying Node `>=22.12.0` engine constraints (running on Node `v26.7.0`). Configured unified `npm test` as well as granular `test:status`, `test:sim`, and `test:smoke` scripts.
3. **Keep Assets Sourced from SVG and Base-Aware:** Authored `src/assets/duck-placeholder.svg` as a pure SVG vector graphic. Omitted binary `.ico` files; used SVG `<link rel="icon">`. In `src/main.js`, imported the SVG asset through Vite's pipeline so emitted URLs are base-aware (`/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg`).
4. **Observe the Built Page in a Real Browser:** Implemented `scripts/dev/smoke-browser.mjs` using headless Chrome 155 driven via Chrome DevTools Protocol (CDP) against `vite preview` on `http://127.0.0.1:4173/Quackpot/`. Evaluated rendered DOM, decoded SVG image dimensions, captured console logs, and verified requests on initial load and reload.
5. **Keep Remote Evidence Bounded:** Recorded the `gh api repos/mrsmithelhs/Quackpot/pages` HTTP 404 response honestly as an observed response that does not distinguish unconfigured Pages from token permissions. Made zero remote changes, configuration updates, or pushes.
6. **Accurate Advisor Capability:** Explicitly reported Branch C with precise rationale and tool surface observation above.

---

## 4. Files Created and Staged

| File | Purpose |
|---|---|
| `.gitignore` | Excludes `node_modules/`, `dist/`, `.vite/`, logs, and OS artifacts |
| `package.json` | Root package definition (CommonJS mode), build/test scripts, and Vite devDependency |
| `package-lock.json` | Pinned dependency tree for reproducible builds |
| `vite.config.mjs` | Vite build configuration specifying `/Quackpot/` base path, `dist/` outDir, and strict ports |
| `index.html` | Minimal static HTML entry point referencing SVG favicon and `src/main.js` |
| `src/main.js` | Browser application entry; mounts spike container, imports SVG and styles |
| `src/style.css` | Minimal static CSS styling (no external font imports or CDN links) |
| `src/assets/duck-placeholder.svg` | Authored SVG rubber duck silhouette |
| `scripts/dev/smoke-browser.mjs` | Headless Chrome CDP automated smoke verification script |
| `reports/development/plan-02-static-build-deploy-spike/progress.md` | This progress report |

### Disjoint Scope Verification
- `sim/`: Untouched. Existing uncommitted edits in `sim/event-log.mjs`, `sim/receipt.mjs`, and `sim/receipt.test.mjs` belong to Plan 01 Repair 01 and were left completely unstaged.
- `reports/development/plan-01-seeded-economy-simulation/`: Untouched.
- `docs/development/plan-02-static-build-deploy-spike.md`: Frontmatter status remains `in-progress` (implementers never set status).

---

## 5. Build and Validation Evidence

### A. Local Static Build
Command:
```powershell
cmd /c npm run build
```
Output:
```text
vite v8.3.5 building client environment for production...
transforming...
✓ 6 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                            0.52 kB │ gzip: 0.33 kB
dist/assets/duck-placeholder-Mhd15Sdp.svg  1.01 kB │ gzip: 0.51 kB
dist/assets/index-Cp6rZ_gj.css             1.76 kB │ gzip: 0.79 kB
dist/assets/index-C8MpopLe.js              2.41 kB │ gzip: 1.05 kB │ map: 2.62 kB

✓ built in 43ms
```

### B. Static Output Audit (Hard Constraints #2 & #7)
Inspected `dist/index.html` and generated chunks:
- `dist/index.html` references:
  - `<link rel="icon" type="image/svg+xml" href="/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg" />`
  - `<script type="module" crossorigin src="/Quackpot/assets/index-C8MpopLe.js"></script>`
  - `<link rel="stylesheet" crossorigin href="/Quackpot/assets/index-Cp6rZ_gj.css">`
- `findstr /S /I /C:"http://" /C:"https://" dist\*` revealed only one occurrence:
  `xmlns="http://www.w3.org/2000/svg"` inside the SVG graphic.
- Zero external CDN URLs, zero analytics scripts, zero external fonts.

### C. Headless Browser Subpath Smoke Verification
Command:
```powershell
node scripts/dev/smoke-browser.mjs
```
Observed Log and Traces:
- **Server Endpoint:** `http://127.0.0.1:4173/Quackpot/`
- **Initial Load Requests (5 total, all HTTP 200 OK):**
  1. `http://127.0.0.1:4173/Quackpot/` (Document, `text/html`, 200)
  2. `http://127.0.0.1:4173/Quackpot/assets/index-C8MpopLe.js` (Script, `text/javascript`, 200)
  3. `http://127.0.0.1:4173/Quackpot/assets/index-Cp6rZ_gj.css` (Stylesheet, `text/css`, 200)
  4. `http://127.0.0.1:4173/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg` (Image, `image/svg+xml`, 200)
  5. `http://127.0.0.1:4173/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg` (Favicon, `image/svg+xml`, 200)
- **Rendered DOM Assertions:**
  - `hasApp`: `true`
  - `h1`: `"Quackpot Static Spike"`
  - `duckComplete`: `true`
  - `duckNaturalWidth`: `120px` (confirms SVG was parsed, decoded, and rendered)
  - `badgeCount`: `4` (all `PASS`)
- **Console Output:**
  - `[Quackpot Spike] App mounted successfully at base path: /Quackpot/`
  - `[Quackpot Spike] Zero external network requests initiated.`
- **Page Reload:**
  - Executed `Page.reload`. Recorded 5 requests: Document (200), JS chunk (304 Not Modified), CSS chunk (304 Not Modified), SVG (200). App mounted cleanly with zero errors.
- **Trailing-Slash Behavior:**
  - `http://127.0.0.1:4173/Quackpot` (without trailing slash) returns HTTP 404 on Vite preview server, because Vite's local static server strictly matches the exact base path `/Quackpot/`.
  - In production GitHub Pages, GitHub's HTTP frontend handles `/<repo>` with an automatic `301 Moved Permanently` redirecting to `/<repo>/`.

### D. Test Suite and Tooling Checks
- `npm test` runs both suites:
  - `scripts/dev/plan-status.test.js`: 143 passed, 0 failed.
  - `sim/*.test.mjs`: 45 passed, 0 failed.
- `node scripts/dev/plan-status.js lint`: `lint: OK (no violations)`.
- `node scripts/dev/plan-status.js check plan-02`: `RUNNABLE`.

---

## 6. Proposed Repository Layout and Plan 01 Wiring (For Owner Ratification)

The founding project-seed sketch (`docs/project-seed.md`) proposed:
```text
site-root/
assets/
  svg/
  rendered/
game/
sim/
tests/
docs/founding/
```

### Recommendation Based on Build Findings

Vite works cleanest when `index.html` sits at the repository root and application modules reside in `src/`. This avoids extra subdirectory routing flags in Vite configuration and keeps root build commands standard.

We recommend the following layout for owner ratification:

```text
quackpot/
├── index.html                 # Root web entry for Vite and GitHub Pages
├── vite.config.mjs            # Vite configuration (base: '/Quackpot/', dist output)
├── package.json               # Root scripts, devDependencies, CommonJS mode
├── package-lock.json
├── .gitignore                 # Ignores node_modules/, dist/, .vite/
├── src/                       # Browser game application source (Plan 03 onwards)
│   ├── main.js                # Game bootstrap entry point
│   ├── style.css              # Game UI styling
│   ├── core/                  # [Recommended migration for Plan 01 domain modules]
│   │   ├── prng.mjs           # Seedable PRNG (used by both game and sim)
│   │   ├── event-log.mjs      # Append-only run event logger
│   │   └── receipt.mjs        # Truthful Receipt projection
│   ├── ui/                    # Views (Shop, Pull theater, Pond Race, Receipt)
│   └── assets/
│       └── svg/               # Authored SVG source (duck rig, accessories, backgrounds)
├── sim/                       # Headless simulation & analysis (Plan 01)
│   ├── model.mjs              # Headless economy model
│   ├── strategies.mjs         # Strategy agents
│   ├── run-experiments.mjs    # Experiment batch runner
│   └── tests/ (or *.test.mjs) # Simulation regression tests
├── dist/                      # Ignored static build output (published to gh-pages)
├── docs/                      # Documentation hub (never used as publish output)
├── reports/                   # Orchestration and packet progress reports
└── scripts/
    └── dev/                   # Dev console, packet status tooling, and smoke tests
```

### Plan 01 Simulation Relocation and Import Wiring
Currently, Plan 01 files reside in `sim/` (`prng.mjs`, `event-log.mjs`, `receipt.mjs`, `model.mjs`, `strategies.mjs`, `run-experiments.mjs`).

To allow Plan 03 to use the PRNG and event log without duplicating code:
- **Phase 1 (Immediate / Plan 03 bootstrap):** Without moving any Plan 01 files before Plan 01 Repair is complete, Vite can import directly across directories (e.g. `import { Prng } from '../sim/prng.mjs'`) or via a path alias in `vite.config.mjs`:
  ```javascript
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'sim'),
    },
  }
  ```
- **Phase 2 (Post-Plan-01 Ratification):** Once Plan 01 is approved and closed, move the three pure domain modules (`prng.mjs`, `event-log.mjs`, `receipt.mjs`) into `src/core/`. Update `sim/model.mjs` and `sim/*.test.mjs` to import from `../src/core/`. Because these are pure ES modules with zero DOM dependencies, they run identically in Node.js headless tests and in Vite browser bundles.

---

## 7. Remaining Risks and Follow-ups

1. **Owner Ratification of Folder Layout:** Requires owner approval of the proposed layout above before Plan 03 creates game modules.
2. **Remote GitHub Pages Enablement:** When the owner is ready to deploy, GitHub Pages should be enabled on repository `mrsmithelhs/Quackpot` via GitHub Actions targeting branch `main` or a `gh-pages` publish workflow. Zero remote changes were made in this packet.

---

## 8. Completion Check & Orchestrator Gate

- [x] Local build and subpath smoke results recorded with file and request evidence.
- [x] Build output contains only static local assets and zero app-authored runtime network calls.
- [x] Publish source is `dist/` (strictly outside `docs/`); no live deployment or remote configuration attempted.
- [x] Proposed layout includes migration/wiring for Plan 01 and remains labelled proposed until ratified.
- [x] Required artifacts, tests, and progress report exist; no unrelated files changed.

**Ready for orchestrator review:** YES.
