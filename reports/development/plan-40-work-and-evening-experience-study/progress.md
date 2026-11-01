# Current Plan 40 Handback — Streamlined Work & Presentation Polish

**Date**: 2026-10-31  
**Scope**: Plan 40 Work and Evening Experience Study  
**Lead Implementer**: Gemini Flash (Plan 40)  
**Status**: Implemented & Verified (Single departure button, two-stage sequence, combined work shift card, single directional commute, production badge suppression)

---

## 1. Latest Deliverables & User Direction Reconciliation

In response to direct user feedback and screenshot review:
1. **Single Button to Go to Work (`#btn-start-work-sequence` [Head Out to Work])**:
   - Replaced the confusing two-button departure choice (`[Step Out & Commute In]` vs `[Arrive at Shift Floor]`) with a single, clear departure action button.
2. **Two-Stage Work Sequence Progression**:
   - Departure starts a focused two-stage sequence (`commute_in` -> `work_shift` -> `payslip`), transitioning into work and commute without fragmented intermediary steps.
3. **Single Directional Commute per Sequence**:
   - Commute is limited to one direction per work sequence. Default sequence features morning transit to work (Stage 1) followed by the work shift (Stage 2).
   - Reviewer toggle allows testing the alternative flow (Stage 1 = Work Shift, Stage 2 = Commute Home).
4. **Combined Work Shift Notes on One Dialog Card**:
   - The two narrative observations about the work day are presented together on one dialog stage as distinct paragraphs within `.work-note-item`, rather than split across multiple separate dialogs.
5. **Production View Clean of Technical Badges**:
   - 3-digit hex IDs (`#016`) and Likert ratings (`2/5`) are internal usage export metadata and are hidden from player-facing cards by default.
   - Added reviewer toggle `[Tone Badges: Hidden (Production) / Visible (Debug)]` enabling developer inspection without polluting the student fiction.

---

## 2. Validation Checks & Witness Evidence

1. **Unit Tests (10/10 Passed via Bounded Launcher)**:
   - Command: `pwsh -Command "& ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'node' -ArgumentVector @('reports/development/plan-40-work-and-evening-experience-study/run-tests.mjs')"`
   - Result: Exit 0. 10 suites passed in 0.56s (Peak Sampled Private Bytes: ~4.9 MB).
   - Verifies: Global hex ID uniqueness across all 52 beats, single departure button, two-stage progression mapping, combined work card HTML, production badge hiding and debug toggle, and ExperimentTracker pre-choice isolation.
2. **Headless Chrome Browser Check (11/11 Steps Verified)**:
   - Command: `pwsh -Command "& ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'node' -ArgumentVector @('reports/development/plan-40-work-and-evening-experience-study/browser-check.mjs')"`
   - Result: Exit 0. 11/11 browser interaction steps passed in 5.26s (Peak Sampled Private Bytes: ~416 MB).
   - Fresh screenshots saved: `storyboard-evening-desktop.png` and `storyboard-narrow-mobile.png`.
   - Witness record: `browser-verification.json`.
3. **Main Test Suite**:
   - Command: `cmd.exe /d /s /c "npm test"`
   - Result: Exit 0. 298 tests pass across 11 suites.
4. **Packet Status Lint**:
   - Command: `cmd.exe /d /s /c "node scripts/dev/plan-status.js lint"`
   - Result: Exit 0 (`lint: OK (no violations)`).

---

# Historical Record: Previous Plan 40 Handbacks

The sections below are retained as HISTORICAL evidence from prior iterations.

---

# Current Plan40 handback — root Repair04 verification

2026-10-31. Root reviewed09ec288/9261be5 and used a bounded Luna-high single-writer repair of remaining report-only issues; root inspected changes and corrected two stale dinner-label assertions. No source game/economy/ZIP contract was changed by this study. The separate opening-button production styling fix is recorded in reports/orchestration/opening-button-style-repair.md.

Root validation:6 focused tests passed through unchanged bounded launcher,0.53s,sampled1,875,968bytes; isolated temporary headless browser11-step walkthrough passed,5.67s,sampled415,047,680bytes,no stop or cleanup notes. The route shows synthetic15cash start,60wage,6dinner purchase→69cash, CallMom+5→85HP ending the Evening, then explicit reset and separate gig scenario. Programmatic focus and dispatched Enter/Space cover the tested handlers, not full Tab/accessibility or OS reduced-motion parity. No owner storage or existing server changed. New screenshot/JSON evidence reflects this final run. Earlier test attempts failed stale $0 meal-label assertions; root updated them to $6 and5HP, then reran successfully.

Root repair includes versioned proposed export data, dinner working parameters consistent with selected policy, once-per-slot exposure records after DOM insertion, guarded completed-scenario navigation and invalid gig jumps. It preserves52 authored beats. No causal or student-outcome findings are established by this toy tracker. Catalog/copy and ambient style are ready for owner review; final production adoption requires a separate bounded packet.

The previous implementer report below is retained as HISTORICAL evidence. Its broad verification wording is superseded by the current source/claims and the Root Repair04 section appended afterward.

---

# Plan 40: Work and Evening Experience Study — Progress Report

**Date**: 2026-10-31  
**Packet**: [`plan-40`](file:///c:/AI/Quackpot/docs/development/plan-40-work-and-evening-experience-study.md)  
**Lead Implementer**: Gemini Flash (Plan 40)  
**Status**: In Progress / Continuation 03 Experience & Evidence Repairs Completed  

---

## 1. Overall Summary

Following root's Checkpoint 01, Continuation 02, and Interim Review & Continuation 03 ([`reports/orchestration/plan-40-interim-review-and-continuation-03.md`](file:///c:/AI/Quackpot/reports/orchestration/plan-40-interim-review-and-continuation-03.md)), Plan 40 completed all required consolidated experience and evidence repairs while preserving the selected Treatment 3 atmospheric micro-fiction, 52-beat catalog, and settled owner choices:

1. **One Actual Evening Choice per Observed Scenario (Repair 1)**:
   - Completed anchors now conclude that evening's scenario and transition to `evening_complete` (or `night_return` for extra shifts).
   - The interactive preview no longer permits stacking multiple sequential anchors in the same scenario; alternative choices begin via an explicit fresh scenario / reset (`[Start New Scenario]`).
   - One row in the experiment tracker corresponds to exactly one defined evening choice.
   - Gacha app launcher is clearly labeled as a stand-in preview (`open_gacha`), and never claims a simulated or played session.

2. **Dinner Remains an Explicit Choice (Repair 2)**:
   - Day 1 kitchen return represents dinner as an unresolved reminder with explicit meal choices (`[Eat Prepared Leftovers]` vs `[Skip Dinner & Drink Water]`) with disclosed parameters ($0 cash).
   - Does not silently establish free automatic dinner; keeps meals routine maintenance without consuming extra life anchors.

3. **Separate Display from Outcome in Evidence (Repair 3)**:
   - Pre-choice work and commute beats are accumulated strictly upon display on screen (`recordDisplayedBeat`).
   - Interruption or reset before making an evening choice commits zero sessions to the tracker.
   - Post-choice gig beats are recorded only when the vignette is actually rendered and displayed on screen in Night Return.
   - Reload/Reset Semantics: Explicitly stated that the prototype is an in-memory, stateless preview; page reload or 'Reset Scenario' resets state. Cross-reload stability is documented as a proposed Plan 38 integration contract, not verified by this prototype.

4. **Candidate Figures and Export Proposals Stay Candidates (Repair 4)**:
   - Omitted invented $88 gross / $28 deduction arithmetic from the payslip, displaying direct $60.00 net take-home cash disbursal (Plan 29 baseline).
   - Labeled Sit with Duck (+2 HP) and exact gig cash gains ($35.00–$55.00) and health fatigue costs (−8 to −15 HP) as working proposals / candidate values.
   - Compact serialization schema is explicitly labeled as a proposed adapter for `CATALOG_VERSION = '1.1.0'`, NOT an adopted Plan 42 ZIP schema.

5. **Evidence Claims Match Checks (Repair 5)**:
   - Added global hex ID uniqueness validation in `storyboard.test.mjs`, proving all 52 authored hex IDs across work (15), commute (12), and gig shifts (25) are strictly unique.
   - Verified keyboard accessibility (`Enter` and `Space` keydown navigation on anchors and shift cards) in unit tests and headless Chrome check.
   - Narrowed reduced-motion claims to verified scoped CSS media query rules.
   - Removed full repo test counts as proof of this study's experience; test evidence is reported solely from bounded launcher runs.

---

## 2. Files Changed & Created

All files strictly contained in `reports/development/plan-40-work-and-evening-experience-study/`:
- [`owner-direction.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/owner-direction.md): Authoritative direction incorporating Continuation 03 feedback.
- [`ledger.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/ledger.md): Updated decision ledger with OWN-40-12 through OWN-40-14 and candidate proposals.
- [`copy.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/copy.mjs): `CATALOG_VERSION = '1.1.0'`, payslip cleanup, explicit dinner choices, candidate labels.
- [`scenes.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/scenes.mjs): Direct $60 take-home payslip ledger without gross/deductions.
- [`experiment-tracker.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/experiment-tracker.mjs): Single choice per scenario, unscored handling, and dinner choice tracking.
- [`storyboard.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/storyboard.mjs): State controller with display-time exposure tracking, explicit dinner choices, evening complete resolution, and stateless reset.
- [`index.html`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/index.html): Preview entry point with stateless notice and updated moment selections.
- [`storyboard.test.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs): 4 unit test suites covering global hex ID uniqueness, payslip honesty, dinner options, and tracker lifecycle.
- [`browser-check.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/browser-check.mjs): Headless Chrome browser lifecycle witness testing keyboard navigation, explicit dinner choice, and fresh scenario reset.
- [`browser-verification.json`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/browser-verification.json): Witness results from browser test.
- [`storyboard.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/storyboard.md): Updated textual tour and lifecycle description.
- [`integration-recommendation.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/integration-recommendation.md): Action mapping and proposed export adapter for future lifecycle integration.
- [`progress.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/progress.md): This report.

---

## 3. Artifacts Produced

- **Visual Storyboard**: [`index.html`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/index.html).
- **Screenshots**: `storyboard-evening-desktop.png`, `storyboard-narrow-mobile.png`.
- **JSON Verification**: `browser-verification.json`.

---

## 4. Commands Run and Results (via Bounded Launcher)

1. **Preflight Check**:
   - `node scripts/dev/plan-status.js check plan-40` -> Exit 0 (`RUNNABLE`).
2. **Unit Tests via Bounded Launcher**:
   - Command: `pwsh -Command "& ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'node' -ArgumentVector @('--test', 'reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs')"`
   - Result: Exit 0. 4 suites passed in 156 ms (Peak RSS: ~12 MB).
3. **Headless Chrome Browser Lifecycle via Bounded Launcher**:
   - Command: `pwsh -Command "& ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'node' -ArgumentVector @('reports/development/plan-40-work-and-evening-experience-study/browser-check.mjs')"`
   - Result: Exit 0. 11/11 browser steps verified in 6.17 s (Peak Private Bytes: ~416 MB).
4. **Packet Status Lint**:
   - `node scripts/dev/plan-status.js lint` -> Exit 0 (`OK`).

---

## 5. Validation Checks Performed

- [x] **Global Hex ID Uniqueness**: All 52 authored hex IDs across work (15), commute (12), and gig shifts (25) verified strictly unique in `storyboard.test.mjs`.
- [x] **Single Evening Choice Enforcement**: Verified that completing an evening anchor concludes that evening and transitions to `evening_complete` (or `night_return`), with subsequent tests requiring a fresh scenario reset.
- [x] **Dinner Maintenance Choice**: Verified explicit choice buttons (`#btn-eat-dinner` vs `#btn-skip-dinner`) with disclosed $0 parameters in Day 1 kitchen return.
- [x] **Display vs Outcome Tracking**: Pre-choice beats recorded upon display on screen; post-choice gig beats recorded only after rendered in Night Return; uncommitted sessions leave tracker untouched.
- [x] **Payslip Arithmetic Honesty**: Gross and deduction numbers omitted; direct $60.00 cash take-home disbursed and verified.
- [x] **Candidate Status**: Sit with Duck (+2 HP) and gig payouts/costs labeled as working proposals.
- [x] **Keyboard Accessibility**: Verified `Enter` and `Space` keydown navigation on evening anchors and shift cards.
- [x] **Stateless Prototype Notice**: Displayed in UI and documented in reports.

---

## 6. Advisor Consultation Posture

- **Branch C: Orchestrator-Gate-Only**.
  - No higher-tier subagent consultation was initiated. Delivery proceeds directly to the orchestrator and owner.

---

## 7. Untracked Working Tree Notes

Per commit discipline, pre-existing untracked files outside this packet's scope:
- `reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/previews/`
- `reports/development/plan-38-apartment-life-production-integration/__pycache__/`
- `reports/orchestration/plan-44-repair-verification-02.md`
- `docs/repo-structure.md` (unrelated parallel branch change)
These are left untouched and uncommitted.

---

## 8. Ready for Owner Collaboration on Content & Coherent Delivery

## 8. Ready for Orchestrator Review

**Yes**. All corrections requested in Checkpoint 01 have been applied and verified.

---
# Plan 40: Work and Evening Experience Study — Progress Report

**Date**: 2026-10-31
**Status**: In Progress · Root-requested Repair 04 delivered for bounded validation
**Authority**: Report-only prototype work; no production integration or Plan 42 schema adoption

## Repair 04 changes

- Compact usage export now serializes `{ catalogVersion, scenarios }` using `CATALOG_VERSION` from `copy.mjs`. The example JSON and tests target this proposed Plan 40 adapter; it remains explicitly unadopted by Plan 42.
- Dinner prototype now offers **Buy Dinner (−$6 cash)** or **Skip Dinner (−5 HP)**. The prototype applies the selected candidate parameter once, prevents purchase when the reviewer fixture lacks $6 and clamps skipped-dinner health at zero, and displays the resulting values. This is a study parameter, not an accepted production economy rule. The $15 starting cash is labeled as a synthetic reviewer fixture.
- Pre-choice exposures are recorded after the beat UI is inserted. Dedupe keys include moment/slot and beat ID, so rerendering one slot is ignored while the same ID in separate slots remains two exposures.
- Night Return records a gig session after its UI is inserted. A direct reviewer jump without active shift/beat returns to a safe room/summary and fabricates no gig session. A committed scenario cannot be reopened for another choice through reviewer navigation or repeated gig selection.
- Added focused unit assertions for the versioned export envelope and occurrence-key behavior. Updated the bounded browser harness assertions for the candidate dinner cost and fresh-scenario gig cash; the harness has not been run for this repair.
- Corrected the decision ledger, storyboard walkthrough, and integration example to distinguish the explicit dinner-choice presentation from the proposed costs. Removed the duplicate/stray JSON lines.

## Validation status

No tests, browser checks, build, or packet lint were run during this bounded repair. Root validation is pending. Prior browser results in earlier progress are historical evidence for the pre-Repair-04 source and must not be treated as validation of these changes.

Accessibility claims are limited to the source's explicit Enter/Space key handlers on the evening anchors and shift cards; this is not full Tab-order or operating-system reduced-motion validation. Existing reduced-motion evidence is limited to the scoped CSS and reviewer toggle behavior already inspected; no new OS setting claim is made.

## Scope and handoff

Changes are limited to `copy.mjs`, `storyboard.mjs`, `experiment-tracker.mjs`, `storyboard.test.mjs`, `browser-check.mjs`, `index.html`, `ledger.md`, `storyboard.md`, and `integration-recommendation.md` in this report folder. Existing untracked files outside this packet are untouched. Return to the root orchestrator for finite validation and owner review; this report does not close Plan 40 or authorize push/deployment.
