# Plan 28: validation for the Direction A prototype

Status at `10a9e90`: the cleared batch **stopped at preflight** because the evidence log lacks capacity (section 1). No
Node, test, server or browser process has run for this prototype.

## Prototype files

All files are under `comparison/`:

| File | Role |
|---|---|
| `index.html`, `prototype.css` | Page shell. The player view comes first, then a labelled HUD stand-in. The reviewer panel is visually separate and marked "not student UI". |
| `prototype.js` | Mounts view-models and drives the real engine in memory, in the same call order as `src/main.js`. It guards against duplicate and stale clicks with a token and a busy flag, and it disables controls on first activation. It reuses the production `createStageTransition`. A `?motion-off` reviewer switch is available. |
| `life-model.mjs` | Pure code. It holds the source-grounded `ROUTES` table and `lifeLocation`, `furnishingsFrom` and `sceneFor` (the travelling-duck baseline, plus one open framing toggle). It also holds `ledgerFacts` (a projection of the log) and the clone-based engine previews `previewZeroCash` and `previewLadder`. |
| `views.mjs` | The selected copy (Harbor Court Property Office; Marisol at Harbor Street Diner) and view-models. Every amount on a control comes from the `escalation_result` event the engine appends on a clone. No amount is a constant. |
| `fixtures.mjs` | Loads the Plan 35 rent fixtures in memory. The checks are against the pins in `fixture-validation-index.json`: bytes, SHA-256, recorded `valid`, event count and chain head. They also run `validateSave` and check the catalog boundary. On any mismatch it stops and shows expected and actual values. There is no synthetic fallback. |
| `serve-bounded.py` | Finite, loopback-only static server for the browser gate. It serves the repo root and stops itself after at most 900 s (section 2). It has not been run. |
| `plan28.test.mjs` | `node:test` checks. Fixture pins, plus a negative control with one tampered byte. H1: routing for both the table and the states reached by real actions, including Uninstall Stay and Leave over the ladder. H2: all four furnishing combinations, checked against the rendered SVG markers and the real `assetsSold` after actual sales. Semantic cases: the ledger has no mutation; Pay does not show as paid; paid-zero choices disclose their actual effects and never end the run; each unpaid decline's "ends the run" flag matches the real outcome; each accept discloses its actual effect and whether rent was paid; the evening order produces the Day 3 ledger. |

Read-only imports:
- `src/core/game-engine.mjs`
- `src/core/storage.mjs` (`validateSave` only)
- `src/assets/apartment/index.mjs`
- `src/ui/stage-transition.js`
- `src/ui/stage-transition.css`

Nothing in `src/` imports the report. No storage, IndexedDB or service-worker APIs are used. All reads are same-origin `fetch`es of the three Plan 35 JSON files.

## 1. Cleared serial batch (root source review 02): **stopped at preflight, nothing run**

Root cleared three commands, to be run serially through the unchanged Plan 25 launcher:
- `checkpoint-proof.mjs fixture` for `plan35.rent-paid-zero.v1`
- `checkpoint-proof.mjs fixture` for `plan35.rent-unpaid-escalation.v1`
- `plan28.test.mjs`

The preflight was taken on 2026-10-30 at source revision `10a9e90`.

**Processes.**
- Nine `node.exe` processes were running. All were Codex runtime processes (`codex-primary-runtime` and `cua_node`
  `server.mjs`). None was a Quackpot validation run.
- The largest was 101 MB private, and the total was about 306 MB. Both are under the 1 GiB and 2 GiB stop
  thresholds.
- No `python.exe` was running.

**Evidence log** (`reports/development/plan-35-checkpoint-catalog-and-targeted-review-pilot/pilot-results.jsonl`):
- Size: 806,905 bytes, with 241,671 bytes free under the 1 MiB guard.
- SHA-256: `610a080c…cdd5`.
- 6 rows.
- This matches the size root recorded at delivery.

**Why it stops.** The log does not have room for both canonical checks:
- `fixture()` appends a `fixture-preflight` record. That record includes `validateAndHydrate(...)`, which returns the
  full `envelope.state` (`scripts/dev/checkpoints/envelope.mjs:17`), plus `freshness` and the negative controls.
- In the existing log the same `state` field is 176,841 bytes (row 0, `result.validation.state`). The current
  fixtures' `state` serialises to 176,901 bytes.
- Each fixture append is therefore at least about 178 KB, and plausibly 180–195 KB.
- The first append would fit. The second would fail the 1 MiB check (`checkpoint-proof.mjs:20`) before it writes.

Root's clearance says to stop when capacity is inadequate rather than rotate attestation-pinned logs. So **no command
in the batch was run**, and `plan28.test.mjs` was not run on its own either. The batch is ordered, and the canonical
checks are meant to come first.

**Options for root.** Each is outside my write scope or authority:
- (a) Authorise a Plan 35-owned archive or rotation of `pilot-results.jsonl`, under whatever rule keeps its existing
  pins verifiable.
- (b) Authorise a Plan 35 change so that `fixture` preflight records the state hash instead of the full state.
- (c) Clear `plan28.test.mjs` alone, with the canonical freshness check deferred and that limit stated.
- (d) Clear only the first canonical check, plus `plan28.test.mjs` for the paid-zero cases. This is the least useful
  option.

The commands below are unchanged and ready once root decides:

```powershell
$L = './reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1'
& $L -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','fixture','plan35.rent-paid-zero.v1')
& $L -Executable node.exe -ArgumentVector @('scripts/dev/checkpoints/checkpoint-proof.mjs','fixture','plan35.rent-unpaid-escalation.v1')
& $L -Executable node.exe -ArgumentVector @('--test','--test-concurrency=1','reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/plan28.test.mjs')
```

Stop on the first non-zero `ExitCode` or any non-null `StopReason`. Keep the launcher JSON as evidence. The
launcher's caps are 2 GiB sampled owned-tree memory and a 90 s wall per command.

## 2. Revised server proposal (browser execution remains gated)

**Option A: reuse a root-approved existing server.**
- First identify its owner, its PID, and the exact URL. A base of `/Quackpot/` gives
  `<origin>/Quackpot/reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/index.html`.
- I do not start, stop or change a server I don't own.

**Option B: a finite server I own.**
- `comparison/serve-bounded.py` binds to 127.0.0.1 only and serves the repository root. It uses Python, not Node.
- It exits by itself at its deadline, clamped to at most 900 s, even if its parent dies.
- Run it with `python -I` so nothing from the served tree is imported.
- It overrides the MIME types for `.js`, `.mjs`, `.json` and `.css`. Otherwise Windows registry mappings can break
  module loading.

The PowerShell wrapper registers the owned PID and always cleans up in `finally`:

```powershell
$port = 5228
if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { throw "port $port busy" }
$srv = Start-Process -FilePath python -PassThru -WindowStyle Hidden `
  -ArgumentList '-I','reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/serve-bounded.py',"$port",'900' `
  -RedirectStandardOutput "$env:TEMP\p28-serve.out" -RedirectStandardError "$env:TEMP\p28-serve.err"
"owned pid $($srv.Id)"
$deadline = (Get-Date).AddSeconds(905)
try {
  while (-not $srv.HasExited -and (Get-Date) -lt $deadline) { Start-Sleep -Seconds 2 }
} finally {
  if (-not $srv.HasExited) { Stop-Process -Id $srv.Id -Force }
  $srv.WaitForExit(5000) | Out-Null
  if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { "WARNING: port $port still listening" } else { "port $port closed" }
}
```

- This runs as one background command for the duration of the browser turn, which is 15 minutes at most.
- The page is `http://127.0.0.1:5228/reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/index.html`.
- The server's access log and the cleanup line are kept as evidence.

## 3. Revised browser checklist (one browser turn, root-coordinated)

**Context.**
- Use one new tab in the Claude in-app browser. It is separate from the owner's Chrome.
- Use the origin `http://127.0.0.1:5228`, which nothing else uses. The real game's origin and storage are never
  opened or inspected.
- Close the tab and reset the viewport at the end.

**Storage evidence.** This is separate from the no-API claim, which rests on source inspection:
`grep` finds no `localStorage`, `sessionStorage`, `indexedDB` or `serviceWorker` in `comparison/`.
1. Before the prototype loads, navigate the tab to `http://127.0.0.1:5228/robots.txt` on the same origin; a 404 is
   fine. Then snapshot:
   - every `localStorage` and `sessionStorage` key with the SHA-256 of its value;
   - `indexedDB.databases()` names and versions. This is the list only, not the contents;
   - `caches.keys()`;
   - `navigator.serviceWorker.getRegistrations()` count.
2. Repeat the snapshot at the end, after navigating back to `robots.txt`.
3. The two snapshots must be identical. If the database list is identical, that shows no database was created; it
   does not verify any database's contents.

**Checks.** Run each at 1280×720, then again at 390×844.
1. **Fixture panel.** Every row passes for both rent scenarios. The panel note states that this lightweight loader is
   not Plan 35's full freshness loader.
2. **Paid-zero, keyboard only.**
   - Walk ledger → bill → Pay. The bill must not say paid before Pay. Then reach paid-zero, which shows Rent paid in
     full, PAID and $0.00 with no failure wording.
   - Take each of the three choices on a fresh reset:
     - Continue leads to the Day 3 ledger, which shows "Balance after breakfast: $5.00".
     - The extra shift leads to the desk-side message.
     - Selling the couch leads to the living room with the couch visibly gone.
   - After each render, focus must be on the card heading.
3. **Insufficient cash, keyboard only.**
   - The heading reads "Rent unpaid · you need $0.99 more" with "Nothing has been taken".
   - Decline through all four offers. Only the credit-card decline carries the ending label, and it leads to the
     Receipt stand-in.
   - Reset, decline once, and accept the couch. The living room shows it removed, and the outcome reads "Rent paid in
     full: $15.00."
4. **Double activation, checked per clicked action.**
   - Pressing Enter twice quickly on Pay must append exactly one `expense_due`.
   - Pressing Enter twice quickly on Accept must append exactly one `escalation_result`.
   - Count both from the reviewer event list.
5. **Scenario switching.**
   - Change the scenario while the phone transition is animating. The final card must belong to the newest scenario.
   - With `?fail-load=unpaid`: select "unpaid" alone, and a blocked card must appear. Select "unpaid" and then
     quickly "paid-zero", and the paid-zero ledger must remain, not the injected error. Record the console output.
6. **Scene changes.**
   - Check the morning framing in both medium and wide.
   - Return from the gacha: Open Quackpot → stand-in → Return. The event list must show nothing new.
7. **Motion.**
   - Run once with `?motion-off`. This checks that meaning survives without animation, but it is **not** evidence of
     real OS reduced motion.
   - The in-app browser can emulate the colour scheme only, so prefers-reduced-motion stays **unverified** unless
     root names a harness that can emulate it.
8. **Narrow layout.** At 390 px the card sits below the scene, nothing scrolls horizontally, and controls are at least
   44 px tall.

**Recording.**
- Write `browser-gate.md` with pass or fail for each check, and state what each observation shows.
- In-app screenshots are viewed, not saved, so the record must not claim saved screenshot artifacts.
- No screenshot tooling is installed.
- Saving, Settings, Uninstall and the Receipt are stand-ins; nothing here is production lifecycle evidence.

## What these checks do not show

- Production behavior is not shown. No HUD Save, Settings or Uninstall integration, save or reload, or real Shell A routing is exercised; the HUD strip is a stand-in.
- The routing table is a proposal tested as pure code. It is not reload integration.
- The proposed display cues in the reviewer panel are projections and were never recorded.
- There is no screen-reader, real-device or classroom coverage.
