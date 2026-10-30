# Plan 28: proposed validation for the Direction A prototype (needs root clearance)

Nothing in this file has been run. The prototype and the tests were written and then reviewed statically only.

## Prototype files

All files are under `comparison/`:

| File | Role |
|---|---|
| `index.html`, `prototype.css` | Page shell. The player view comes first, then a labelled HUD stand-in. The reviewer panel is visually separate and marked "not student UI". |
| `prototype.js` | Mounts view-models and drives the real engine in memory, in the same call order as `src/main.js`. It guards against duplicate and stale clicks with a token and a busy flag, and it disables controls on first activation. It reuses the production `createStageTransition`. A `?motion-off` reviewer switch is available. |
| `life-model.mjs` | Pure code. It holds the source-grounded `ROUTES` table and `lifeLocation`, `furnishingsFrom` and `sceneFor` (the travelling-duck baseline, plus one open framing toggle). It also holds `ledgerFacts` (a projection of the log) and the clone-based engine previews `previewZeroCash` and `previewLadder`. |
| `views.mjs` | The selected copy (Harbor Court Property Office; Marisol at Harbor Street Diner) and view-models. Every amount on a control comes from the `escalation_result` event the engine appends on a clone. No amount is a constant. |
| `fixtures.mjs` | Loads the Plan 35 rent fixtures in memory. The checks are against the pins in `fixture-validation-index.json`: bytes, SHA-256, recorded `valid`, event count and chain head. They also run `validateSave` and check the catalog boundary. On any mismatch it stops and shows expected and actual values. There is no synthetic fallback. |
| `plan28.test.mjs` | `node:test` checks. Fixture pins, plus a negative control with one tampered byte. H1: routing for both the table and the states reached by real actions, including Uninstall Stay and Leave over the ladder. H2: all four furnishing combinations, checked against the rendered SVG markers and the real `assetsSold` after actual sales. Semantic cases: the ledger has no mutation; Pay does not show as paid; paid-zero choices disclose their actual effects and never end the run; each unpaid decline's "ends the run" flag matches the real outcome; each accept discloses its actual effect and whether rent was paid; the evening order produces the Day 3 ledger. |

Read-only imports:
- `src/core/game-engine.mjs`
- `src/core/storage.mjs` (`validateSave` only)
- `src/assets/apartment/index.mjs`
- `src/ui/stage-transition.js`
- `src/ui/stage-transition.css`

Nothing in `src/` imports the report. No storage, IndexedDB or service-worker APIs are used. All reads are same-origin `fetch`es of the three Plan 35 JSON files.

## 1. Preflight (PowerShell, read-only)

```powershell
Get-Process node, python -ErrorAction SilentlyContinue |
  Select-Object Id, ProcessName, @{n='PrivMB';e={[int]($_.PrivateMemorySize64/1MB)}}, StartTime
Get-NetTCPConnection -State Listen -LocalPort 4173,5181,5228 -ErrorAction SilentlyContinue
```

## 2. Serial bounded test batch (one Node process)

```powershell
& './reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1' `
  -Executable node.exe `
  -ArgumentVector @('--test','--test-concurrency=1','reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/plan28.test.mjs')
```

Budget:
- The launcher's own caps apply: 2 GiB owned-tree private memory and a 90 s wall.
- Expected use is under 10 s and well under 300 MB. Each test loads two to six 170 KB fixtures and clones the engine.
- Stop on the first non-zero exit or launcher stop reason, and report the output.

## 3. Browser gate (one isolated tab, root-coordinated)

Pick a server, in this order of preference:
1. **A root-approved existing Vite dev server.** Open
   `<origin>/Quackpot/reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/index.html`.
2. **Otherwise, a bounded static server.** This uses Python, not Node, and is loopback only. It runs for the gate only
   (at most 30 minutes) and is stopped explicitly afterwards:

```powershell
$srv = Start-Process -FilePath python -ArgumentList '-m','http.server','5228','--bind','127.0.0.1','--directory','C:/AI/Quackpot' -PassThru -WindowStyle Hidden
# page: http://127.0.0.1:5228/reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/index.html
# ...browser checks...
Stop-Process -Id $srv.Id
```

The page has no bare module specifiers, so a plain static server is enough. Vite is not required. The server must
serve the **repository root**, because the page imports `src/` and reads Plan 35 files from there. Serving only
`comparison/`, or opening the page via `file://`, fails at load. In that case the page shows a blocked card.

Checks, run at 1280×720 and then at 390×844:
1. **Storage baseline.**
   - Before loading, record `Object.keys(localStorage)` and `await indexedDB.databases()` for the origin.
   - Repeat at the end. Both must be unchanged.
2. **Fixture panel.** Every check row passes for both rent scenarios.
3. **Paid-zero, keyboard only** (Tab, Enter or Space):
   - Walk ledger → bill → Pay → paid-zero.
   - Reset and take each of the three choices once: Continue reaches the Day 3 ledger, the extra shift shows the desk-side message, and the couch sale shows the living room with the couch removed.
   - Focus lands on each new card heading.
   - The engine-event panel matches the expected event types.
4. **Unpaid, keyboard only.**
   - Decline through all four offers. Only the last decline is labelled as ending the run, and it does end it (Receipt stand-in).
   - Reset, decline once, and accept the couch. The living room shows the couch removed, and the outcome says rent was paid.
5. **Duplicate activation.** Press Enter twice quickly on Pay and on Accept. Exactly one `expense_due` and one `escalation_result` must be appended per action.
6. **Morning framing toggle.** Compare the medium and wide kitchen views. This is the open question for the owner.
7. **Return-from-gacha.** Open Quackpot → stand-in → Return. The scene goes back to the desk-side view, and the event panel shows nothing new.
8. **Motion.**
   - Repeat step 3 once with `?motion-off`, to confirm the meaning is intact without animation.
   - If the browser can emulate `prefers-reduced-motion`, also run once with it to exercise the production static overlay. The Claude in-app browser offers colour-scheme emulation only, so if that is the browser used, record this as not tested.
9. **Narrow layout.** At 390 px the card sits below the scene with no horizontal page scroll, and the controls are at least 44 px tall.

Recording:
- Observations go to `browser-gate.md`, with pass or fail for each check and anything surprising.
- Screenshots from the in-app browser are viewed, not saved. If root wants saved images, it should name a capture method.

Close the tab, reset the viewport, and stop the server.

## What these checks do not show

- Production behavior is not shown. No HUD Save, Settings or Uninstall integration, save or reload, or real Shell A routing is exercised; the HUD strip is a stand-in.
- The routing table is a proposal tested as pure code. It is not reload integration.
- The proposed display cues in the reviewer panel are projections and were never recorded.
- There is no screen-reader, real-device or classroom coverage.
