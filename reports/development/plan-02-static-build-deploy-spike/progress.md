# Progress Report: Plan 02 — Static Build and Pages Deployment Spike

**Packet ID:** `plan-02`  
**Date:** 2026-10-24  
**Author/Implementer:** Implementer Thread (Antigravity)  
**Status:** Delivered — Ready for Orchestrator Review (Frontmatter status left untouched per guardrail)  

---

## 1. Executive Summary

Plan 02 has produced trustworthy local static build and subpath deployment spike evidence for Quackpot:
- **Build Engine & CommonJS Preservation:** Vite 8.3.5 is configured via `vite.config.mjs` and installed as a development dependency with zero runtime dependencies. Root CommonJS behavior is preserved (omitting `"type": "module"` from `package.json`), enabling existing packet tooling (`scripts/dev/plan-status.js` and tests) to run without disruption.
- **Static Output & Zero Network Requests (Hard Constraints #2 & #7):** Production build compiles to `dist/` in under 60ms. Static asset inspection and live headless browser network tracing confirm zero runtime external CDN requests, zero tracking/telemetry calls, and zero third-party font requests.
- **Subpath Handling:** Configured for the project subpath `/Quackpot/`. Generated HTML links, module scripts, stylesheets, and SVG asset imports resolve correctly to `/Quackpot/assets/...`. Root `/assets/...` requests are strictly rejected by the validator.
- **Robust Process Ownership & Browser Isolation (Repair 01):** The smoke runner verifies that ports 4173 and 9222 are free before spawning child processes, catches child spawn errors and premature exits, and launches headless Chrome with a dedicated temporary browser profile created in `os.tmpdir()`. A pre-registered cleanup handler guarantees that only processes and profile directories created by this run are terminated and safely deleted.
- **Bounded Load & HTTP Waits (Repair 02):** Replaced unbounded promise awaiting with `waitForCdpEvent`, bounding both initial load and reload events (8000ms timeout) with immediate rejection on CDP socket closure and automatic listener/timer cleanup. Bounded all HTTP readiness and metadata probes via `fetchWithTimeout` (1500ms per request), preventing hung sockets from bypassing loop timeouts.
- **Fresh-Build Smoke Entry & Asset Freshness (Repair 02):** Configured `pretest:smoke` to run `vite build` automatically prior to `test:smoke`. In addition, `smoke-browser.mjs` verifies that `dist/index.html` exists, extracts the current build's hashed chunk filenames, and verifies that the browser requests those exact chunk filenames during execution. Direct script invocation (`node scripts/dev/smoke-browser.mjs`) is verified and documented as requiring a prior fresh build.
- **Dual Load & Reload Assertion:** The smoke test exercises both initial load and reload, evaluating DOM mounting, decoded SVG dimensions (`naturalWidth = 120`), response status codes (200 on initial load; 200/304 on reload), and asserting zero runtime exceptions and zero console errors across both phases.
- **Auditable Artifacts & Failure Boundary Testing:** Emitted machine-readable observations to `smoke-observations.json`. Authored a factored validator (`smoke-validator.mjs`) with 18 unit tests (`smoke-validator.test.mjs`) exercising failure cases: occupied port collision, external origin, root `/assets/`, null status, 404/500 responses, undecoded SVG, runtime exceptions, directory traversal guardrails, event arrival, event timeout, session closure, and non-responding HTTP endpoints.
- **Neutral Page Specifications:** Removed self-certifying "PASS" badges and false networking assertions from `src/main.js`. The page describes configuration neutrally; pass/fail evidence is supplied exclusively by the external smoke observer.
- **Plan 01 Isolation:** Concurrency boundaries were maintained throughout. No files in `sim/` or `reports/development/plan-01-seeded-economy-simulation/` were touched, staged, or modified.

---

## 2. Advisor Consultation Declaration

- **Selected Branch:** **Branch C — degraded mode (orchestrator-gate-only)**.
- **Rationale & Evidence:**
  The provider capability registry in `advisor-capable-providers.json` was examined. The active platform (Google Antigravity) is not an entry in `advisor-capable-providers.json`. While the active thread's tool surface exposes `invoke_subagent` with a model parameter allowing `'pro'`, self-reported or callable aliases alone do not establish a verified higher tier or platform read-only structural enforcement under the registry definitions. Following Step 1 fail-closed rules, this thread treats itself as not advisor-capable and operates under Branch C (orchestrator-gate-only).

---

## 3. Review & Repair Corrections Addressed

### Pre-Build Review Corrections (prebuild-review-01.md)
1. **Preserve Root CommonJS Behavior:** Omitted `"type": "module"` from `package.json`. Configured Vite via `vite.config.mjs`. Confirmed that `scripts/dev/plan-status.test.js` passes 143/143 tests and simulation tests pass 45/45 tests under Node 26.
2. **Record Reproducible Dependencies:** Committed `package-lock.json`. Selected Vite `8.3.5` (supporting Node `>=22.12.0`, running on `v26.7.0`). Configured unified `npm test` as well as granular `test:status`, `test:validator`, `test:sim`, and `test:smoke` scripts.
3. **Keep Assets Sourced from SVG and Base-Aware:** Authored `src/assets/duck-placeholder.svg` as pure SVG vector source. Omitted binary `.ico` files. Emitted URLs are base-aware (`/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg`).
4. **Observe the Built Page in a Real Browser:** Automated headless Chrome 155 via CDP over `vite preview` on `http://127.0.0.1:4173/Quackpot/`.
5. **Keep Remote Evidence Bounded:** Recorded the `gh api repos/mrsmithelhs/Quackpot/pages` HTTP 404 response as an observed response that does not distinguish unconfigured Pages from access/token permissions. Made zero remote changes or pushes.
6. **Accurate Advisor Capability:** Explicitly reported Branch C with precise tool surface observations.

### Repair 01 Corrections (repair-01.md)
1. **Verify Process Ownership & Browser Isolation:**
   - Pre-flight port availability check (`assertPortFree`) for ports 4173 and 9222 before child process launch; fails promptly on port collision.
   - Dedicated temporary browser profile created in `os.tmpdir()` (`quackpot-smoke-profile-XXXX`).
   - Listeners for child `error` and premature `exit` events; fails promptly on launch failure.
   - Pre-registered cleanup handlers (`process.on('SIGINT')`, `process.on('uncaughtException')`, `finally`) guarantee that only processes and profile created by this run are cleaned up.
   - Temporary profile directory deletion is safety-gated: resolves path and asserts it is strictly inside `os.tmpdir()` with retry logic to allow Windows child process file locks to release cleanly.
   - CDP WebSocket rejects pending callbacks if connection closes.
2. **Assert Both Load and Reload Behavior:**
   - Evaluated DOM, duck image decode, request origin, subpath prefix, and HTTP status codes for both initial load (Phase 1) and reload (Phase 2).
   - Verified that root `/assets/...` does NOT satisfy the `/Quackpot/` subpath check (covered by dedicated unit test in `smoke-validator.test.mjs`).
   - Verified runtime exceptions (`Runtime.exceptionThrown`) and console errors (`console.error`).
3. **Report Trailing Slash as Observed:**
   - Observed that local `http://127.0.0.1:4173/Quackpot` returns HTTP 404 on Vite preview, whereas `http://127.0.0.1:4173/Quackpot/` returns HTTP 200.
   - Removed unsupported claim that local test proved GitHub Pages 301 redirect. Deployed slash behavior is explicitly marked **unverified** until an authorized live deployment.
4. **Remove Self-Certifying Page Claims:**
   - Updated `src/main.js` and `src/style.css` to present neutral specification and configuration information.
   - Removed literal "PASS" badges and "Zero external network requests initiated" text. Pass/fail evidence is supplied exclusively by the external smoke observer.
5. **Correct Report & Illustrative Wiring:**
   - Marked folder layout as a recommendation awaiting owner ratification.
   - Corrected illustrative PRNG export to `createRng` (from `sim/prng.mjs`) and Receipt export to `projectReceipt` (from `sim/receipt.mjs`).
   - Noted direct relative imports or `new URL(..., import.meta.url)` avoiding `__dirname` in ESM.
   - Replaced "Complete" / "proven deployment" assertions with delivered local-spike evidence and open owner gates.

### Repair 02 Corrections (repair-02.md)
1. **Bounded Event and HTTP Waits:**
   - Implemented `waitForCdpEvent(cdp, eventName, timeoutMs)` in `smoke-validator.mjs`. Bounded `initialLoadPromise` and `reloadPromise` for `Page.loadEventFired` to 8000ms. If the load event stalls or the CDP session terminates early, the helper rejects promptly and removes all event listeners and timeout handles.
   - Implemented `fetchWithTimeout(url, options, timeoutMs)` using `AbortSignal.timeout(timeoutMs)`. Bounded all polling in `waitForEndpoint` (1500ms per attempt) as well as Chrome CDP target creation and version queries.
   - Added 4 dedicated unit tests in `smoke-validator.test.mjs` verifying:
     - Event arrival within timeout.
     - Event timeout rejection when event does not arrive.
     - Early session close rejection when CDP closes before event.
     - Non-responding local HTTP endpoint rejection and prompt loop bounding.
2. **Supported Fresh-Build Smoke Command & Asset Verification:**
   - Added `"pretest:smoke": "vite build"` to `package.json`, ensuring that running `npm run test:smoke` automatically compiles a fresh production build to `dist/` before testing.
   - Added build artifact verification in `smoke-browser.mjs`: parses `dist/index.html` to find the current build's hashed chunk names (e.g. `index-y2BSSTqE.js`, `index-BkZiZGSR.css`, `duck-placeholder-Mhd15Sdp.svg`) and asserts that the browser requested those exact asset filenames during execution.
   - Direct invocation (`node scripts/dev/smoke-browser.mjs`) verifies that `dist/index.html` exists and was built, failing with clear instructions if missing.

---

## 4. Files Created and Staged

| File | Purpose |
|---|---|
| `.gitignore` | Excludes `node_modules/`, `dist/`, `.vite/`, logs, and OS artifacts |
| `package.json` | Root package definition (CommonJS mode), build/test scripts including `pretest:smoke`, and Vite devDependency |
| `package-lock.json` | Pinned dependency tree for reproducible builds |
| `vite.config.mjs` | Vite build configuration specifying `/Quackpot/` base path, `dist/` outDir, and strict ports |
| `index.html` | Minimal static HTML entry point referencing SVG favicon and `src/main.js` |
| `src/main.js` | Browser application entry; renders neutral spike specifications |
| `src/style.css` | Minimal static CSS styling (no external font imports or CDN links) |
| `src/assets/duck-placeholder.svg` | Authored SVG rubber duck silhouette |
| `scripts/dev/smoke-validator.mjs` | Factored validation logic for requests, DOM state, console errors, bounded CDP event waits, bounded HTTP fetches, and safe profile cleanup |
| `scripts/dev/smoke-validator.test.mjs` | 18 unit tests exercising validator failure cases, boundary rules, and bounded wait behaviors |
| `scripts/dev/smoke-browser.mjs` | Headless Chrome CDP smoke runner with process ownership, isolated profile, bounded waits, and build asset verification |
| `reports/development/plan-02-static-build-deploy-spike/smoke-observations.json` | Machine-readable auditable observation record from browser smoke run |
| `reports/development/plan-02-static-build-deploy-spike/progress.md` | This progress report |

### Disjoint Scope Verification
- `sim/`: Untouched.
- `reports/development/plan-01-seeded-economy-simulation/`: Untouched.
- `docs/development/plan-02-static-build-deploy-spike.md`: Frontmatter status remains untouched (orchestrator-owned).

---

## 5. Build and Validation Evidence

### A. Supported Fresh-Build Smoke Execution
Command:
```powershell
cmd /c npm run test:smoke
```
Output:
```text
npm notice run quackpot@0.1.0 pretest:smoke
npm notice run vite build
vite v8.3.5 building client environment for production...
transforming...
✓ 6 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                            0.52 kB │ gzip: 0.33 kB
dist/assets/duck-placeholder-Mhd15Sdp.svg  1.01 kB │ gzip: 0.51 kB
dist/assets/index-BkZiZGSR.css             1.74 kB │ gzip: 0.78 kB
dist/assets/index-y2BSSTqE.js              2.36 kB │ gzip: 1.11 kB │ map: 2.47 kB

✓ built in 50ms
npm notice run quackpot@0.1.0 test:smoke
npm notice run node scripts/dev/smoke-browser.mjs
=== Plan 02 Headless Browser Subpath Smoke Test (Isolated) ===
Browser binary found: C:/Program Files/Google/Chrome/Application/chrome.exe
Verified build artifacts to observe from current build: {
  js: 'index-y2BSSTqE.js',
  css: 'index-BkZiZGSR.css',
  svg: 'duck-placeholder-Mhd15Sdp.svg'
}
Checking port availability...
Ports 4173 and 9222 verified free.
Created dedicated browser profile: C:\Users\orion\AppData\Local\Temp\quackpot-smoke-profile-7N3fyI
Spawning Vite preview: C:\AI\Quackpot\node_modules\vite\bin\vite.js on 127.0.0.1:4173...
Spawning Chrome with CDP port 9222...
Waiting for Preview endpoint (bounded)...
Vite preview ready at http://127.0.0.1:4173/Quackpot/
Waiting for Chrome CDP endpoint (bounded)...
Chrome CDP ready: Chrome/155.0.8059.81
Target created: 36A27807E98019CD948E0F02CB3E9C30
CDP connected.

--- Phase 1: Navigating to http://127.0.0.1:4173/Quackpot/ ---
[Browser Console info] [Quackpot Spike] App mounted successfully at base path: /Quackpot/
Phase 1 recorded 5 requests:
┌─────────┬───────────────────────────────────────────────────────────────────────┬────────┬──────────────┬────────┬───────────────────┐
│ (index) │ url                                                                   │ method │ type         │ status │ mimeType          │
├─────────┼───────────────────────────────────────────────────────────────────────┼────────┼──────────────┼────────┼───────────────────┤
│ 0       │ 'http://127.0.0.1:4173/Quackpot/'                                     │ 'GET'  │ 'Document'   │ 200    │ 'text/html'       │
│ 1       │ 'http://127.0.0.1:4173/Quackpot/assets/index-y2BSSTqE.js'             │ 'GET'  │ 'Script'     │ 200    │ 'text/javascript' │
│ 2       │ 'http://127.0.0.1:4173/Quackpot/assets/index-BkZiZGSR.css'            │ 'GET'  │ 'Stylesheet' │ 200    │ 'text/css'        │
│ 3       │ 'http://127.0.0.1:4173/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg' │ 'GET'  │ 'Image'      │ 200    │ 'image/svg+xml'   │
│ 4       │ 'http://127.0.0.1:4173/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg' │ 'GET'  │ 'Other'      │ 200    │ 'image/svg+xml'   │
└─────────┴───────────────────────────────────────────────────────────────────────┴────────┴──────────────┴────────┴───────────────────┘
✓ Phase 1 observed asset filenames match this run's build.
Phase 1 DOM evaluation: {
  hasApp: true,
  h1: 'Quackpot Static Spike',
  duckSrc: 'http://127.0.0.1:4173/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg',
  duckComplete: true,
  duckNaturalWidth: 120,
  duckNaturalHeight: 120,
  specItemsCount: 4
}
✓ Phase 1 initial load validation passed.

--- Phase 2: Page Reload Verification ---
[Browser Console info] [Quackpot Spike] App mounted successfully at base path: /Quackpot/
Phase 2 recorded 5 requests on reload:
┌─────────┬───────────────────────────────────────────────────────────────────────┬────────┬──────────────┬────────┬───────────────────┐
│ (index) │ url                                                                   │ method │ type         │ status │ mimeType          │
├─────────┼───────────────────────────────────────────────────────────────────────┼────────┼──────────────┼────────┼───────────────────┤
│ 0       │ 'http://127.0.0.1:4173/Quackpot/'                                     │ 'GET'  │ 'Document'   │ 200    │ 'text/html'       │
│ 1       │ 'http://127.0.0.1:4173/Quackpot/assets/index-y2BSSTqE.js'             │ 'GET'  │ 'Script'     │ 304    │ 'text/javascript' │
│ 2       │ 'http://127.0.0.1:4173/Quackpot/assets/index-BkZiZGSR.css'            │ 'GET'  │ 'Stylesheet' │ 304    │ 'text/css'        │
│ 3       │ 'http://127.0.0.1:4173/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg' │ 'GET'  │ 'Image'      │ 200    │ 'image/svg+xml'   │
│ 4       │ 'http://127.0.0.1:4173/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg' │ 'GET'  │ 'Other'      │ 200    │ 'image/svg+xml'   │
└─────────┴───────────────────────────────────────────────────────────────────────┴────────┴──────────────┴────────┴───────────────────┘
✓ Phase 2 reload asset filenames match this run's build.
Phase 2 DOM evaluation after reload: {
  hasApp: true,
  h1: 'Quackpot Static Spike',
  duckSrc: 'http://127.0.0.1:4173/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg',
  duckComplete: true,
  duckNaturalWidth: 120,
  duckNaturalHeight: 120,
  specItemsCount: 4
}
✓ Phase 2 reload validation passed.

--- Phase 3: Trailing Slash Check (http://127.0.0.1:4173/Quackpot) ---
Trailing slash result: {
  requestedUrl: 'http://127.0.0.1:4173/Quackpot',
  statusCode: 404,
  locationHeader: null,
  note: 'Observed 404 on local Vite preview server. Production GitHub Pages 301 redirect is a remote deployment property and is not established or claimed by this local test.'
}
Saved machine-readable observations to: C:\AI\Quackpot\reports\development\plan-02-static-build-deploy-spike\smoke-observations.json

=============================================================
SMOKE TEST VERIFICATION RESULTS
=============================================================
  [PASS] Isolated process ownership & port check
  [PASS] Dedicated temporary browser profile
  [PASS] Build freshness & chunk filename verification
  [PASS] Initial load under /Quackpot/ (bounded event wait, all 200 OK)
  [PASS] DOM mounted and SVG decoded (naturalWidth: 120, naturalHeight: 120)
  [PASS] Reload verification (bounded event wait, DOM + 200/304 cache requests)
  [PASS] Zero runtime exceptions, zero console errors, zero external requests
  [INFO] Trailing slash /Quackpot returned 404 locally on Vite preview
  [UNVERIFIED] GitHub Pages deployed 301 redirect (requires live deployment)
=============================================================

Running cleanup...
Cleaned up dedicated browser profile directory.
```

### B. Static Output Audit (Hard Constraints #2 & #7)
Inspected `dist/index.html` and generated chunks:
- `dist/index.html` references:
  - `<link rel="icon" type="image/svg+xml" href="/Quackpot/assets/duck-placeholder-Mhd15Sdp.svg" />`
  - `<script type="module" crossorigin src="/Quackpot/assets/index-y2BSSTqE.js"></script>`
  - `<link rel="stylesheet" crossorigin href="/Quackpot/assets/index-BkZiZGSR.css">`
- Scanned `dist/` for `http://` and `https://`:
  The only occurrence is `xmlns="http://www.w3.org/2000/svg"` inside the SVG graphic.
- Zero external CDN URLs, zero analytics scripts, zero external fonts.

### C. Validator Failure Case & Bounded Wait Unit Tests
Command:
```powershell
node --test scripts/dev/smoke-validator.test.mjs
```
Output:
```text
✔ assertPortFree: throws when port is already occupied (24.1978ms)
✔ validateRequests: accepts valid local subpath requests with 200 (0.2935ms)
✔ validateRequests: rejects external origin requests (Constraint #2) (0.1741ms)
✔ validateRequests: root /assets/... does NOT satisfy /Quackpot/ subpath (0.191ms)
✔ validateRequests: rejects uncompleted or null status requests (0.1384ms)
✔ validateRequests: rejects failed HTTP responses (404/500) (0.1305ms)
✔ validateRequests: reload accepts 304, rejects 500 (0.1485ms)
✔ validateDomState: validates rendered elements and decoded SVG (0.3113ms)
✔ validateDomState: rejects missing #app or wrong title (0.1366ms)
✔ validateDomState: rejects undecoded or broken SVG image (naturalWidth = 0) (0.1572ms)
✔ validateDomState: rejects image src referencing wrong subpath (0.1483ms)
✔ validateConsoleAndErrors: catches console errors and runtime exceptions (0.1577ms)
✔ safeCleanupTempDir: refuses deletion outside parent directory (0.2053ms)
✔ safeCleanupTempDir: successfully removes directory inside parent (1.1106ms)
✔ waitForCdpEvent: resolves when event arrives within timeout (0.7602ms)
✔ waitForCdpEvent: rejects when event does not arrive before timeout (154.1574ms)
✔ waitForCdpEvent: rejects promptly when connection closes before event (0.369ms)
✔ fetchWithTimeout / waitForEndpoint: bounds request and rejects promptly on nonresponding local HTTP endpoint (1067.3688ms)
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

### D. Unified Test Suite Checks
Command:
```powershell
cmd /c npm test
```
Result:
- `scripts/dev/plan-status.test.js`: 143 passed, 0 failed.
- `scripts/dev/smoke-validator.test.mjs`: 18 passed, 0 failed.
- `sim/*.test.mjs`: 45 passed, 0 failed (note: simulation tests include active working-tree repairs from Plan 01).
- Total tests passed: 206 passed, 0 failed.
- `node scripts/dev/plan-status.js lint`: `lint: OK (no violations)`.
- `node scripts/dev/plan-status.js check plan-02`: `RUNNABLE`.

---

## 6. Proposed Repository Layout & Simulation Wiring (For Owner Ratification)

The seed sketch in `docs/project-seed.md` proposed an unratified structure. Based on measured Vite behavior and test results, we recommend the following layout for owner review:

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
│   │   ├── prng.mjs           # Seedable PRNG (exports createRng)
│   │   ├── event-log.mjs      # Append-only run event logger
│   │   └── receipt.mjs        # Truthful Receipt projection (exports projectReceipt)
│   ├── ui/                    # Game views (Shop, Pull theater, Pond Race, Receipt)
│   └── assets/
│       └── svg/               # Authored SVG source (duck rig, accessories, backgrounds)
├── sim/                       # Headless simulation & analysis (Plan 01)
│   ├── model.mjs              # Headless economy model
│   ├── strategies.mjs         # Strategy agents
│   ├── run-experiments.mjs    # Experiment batch runner
│   └── *.test.mjs             # Simulation regression tests
├── dist/                      # Ignored static publish artifact; workflow undecided
├── docs/                      # Documentation hub (never used as publish output)
├── reports/                   # Orchestration and packet progress reports
└── scripts/
    └── dev/                   # Dev console, packet status tooling, and smoke tests
```

### Plan 01 Simulation Relocation & Import Wiring
In Plan 01, domain modules reside in `sim/`:
- `sim/prng.mjs` (exports `createRng`)
- `sim/event-log.mjs` (exports `EventLog`)
- `sim/receipt.mjs` (exports `projectReceipt`)

To connect these to Plan 03 without duplication:
- **Separately Bounded Post-Plan-01 Integration (Recommended):** After Plan 01 acceptance and owner layout ratification, move the three pure domain modules (`prng.mjs`, `event-log.mjs`, `receipt.mjs`) into `src/core/`. Update `sim/model.mjs` and simulation tests to import from `../src/core/` via standard relative imports.
- **Interim Phase 1 (if Plan 03 begins before relocation):** Plan 03 can import directly via relative path (e.g. `import { createRng } from '../sim/prng.mjs'`) or via a path alias in `vite.config.mjs` derived without `__dirname` (e.g. using `new URL('./sim', import.meta.url)`). No shared-module move was performed in this repair.

---

## 7. Remaining Risks and Owner Decisions

1. **Owner Ratification of Folder Layout:** Requires owner approval of the proposed layout above before Plan 03 establishes game source modules.
2. **GitHub Pages Deployment Strategy:** The target publish workflow (e.g., GitHub Actions deploying `dist/` to GitHub Pages) and target branch remain an owner decision. Zero remote changes or pushes have been made.

---

## 8. Completion Check & Orchestrator Gate

- [x] Process ownership verified and browser isolated in dedicated temporary profile.
- [x] Bounded load event waits and bounded HTTP readiness/metadata probes implemented.
- [x] Supported `npm run test:smoke` command incorporates fresh `vite build` (`pretest:smoke`).
- [x] Browser observed asset filenames verified against the current build's emitted hashed chunks.
- [x] Dual load and reload assertions pass (DOM, SVG dimensions, request origin/subpath, status 200/304, zero errors).
- [x] Trailing slash reported as observed (local 404; deployed 301 marked unverified).
- [x] Factored validator with 18 unit tests exercising failure boundaries and bounded wait scenarios.
- [x] Machine-readable audit artifact (`smoke-observations.json`) recorded.
- [x] Illustrative wiring (`projectReceipt`, `createRng`) and undecided publish workflow preserved.
- [x] Active Plan 01 files left completely untouched.

**Ready for orchestrator review:** YES.
