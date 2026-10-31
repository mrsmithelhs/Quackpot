# Plan 40: Work and Evening Experience Study — Progress Report

**Date**: 2026-10-31  
**Packet**: [`plan-40`](file:///c:/AI/Quackpot/docs/development/plan-40-work-and-evening-experience-study.md)  
**Lead Implementer**: Gemini Flash (Plan 40)  
**Status**: Delivered for Orchestrator Review  

---

## 1. Overall Summary

In direct collaboration with the project owner, Plan 40 investigated and prototyped the lived transition between ordinary daytime work, an optional extra shift, returning home, and first-evening life in the apartment:
- **Treatment Selected**: The owner selected **Treatment 3 (Atmospheric Micro-Fiction & Commute Vignette)**, capturing the bodily rhythm of shift work and commute transit through evocative, non-punitive prose and clean SVG cards, with the explicit option to later draw up dedicated visual scenes for work and commute.
- **Behavioral Experiment Tracked**: In response to the owner's direction, the prototype implements an interactive research tracker investigating whether engaging work and pleasant commute conditions reduce compensatory gacha indulgence and foster restorative choices (Calling Mom, resting).
- **Evening Activity Grounding**: The owner selected a **minor restorative** effect (**+5 HP**) for **Call Mom**, establishing a warm, non-transactional human connection that contrasts with digital gacha isolation (strictly distinct from the deferred "Borrow from Mom" mechanic).
- **Extra Shift Decoupling**: Extra shifts feature flat cash rewards across multiple shift types (Diner cover, Warehouse night stock, Courier run) with explicit health fatigue costs; accepting an extra shift grants cash directly and **never** silently auto-pays rent.
- **Isolated Storyboard & Bounded Verification**: Built an interactive HTML/CSS/JS preview in `reports/development/plan-40-work-and-evening-experience-study/` importing accepted apartment SVGs read-only. Verified 100% of unit contracts and an 11-step headless Chrome browser lifecycle witness via the Plan 25 bounded launcher.

---

## 2. Files Changed & Created

All work strictly authored within the assigned report directory:
- [`reports/development/plan-40-work-and-evening-experience-study/owner-direction.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/owner-direction.md): Authoritative record of owner choices.
- [`reports/development/plan-40-work-and-evening-experience-study/ledger.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/ledger.md): Decision ledger distinguishing verified owner choices, interpretations, and working proposals.
- [`reports/development/plan-40-work-and-evening-experience-study/copy.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/copy.mjs): Vignette texts, payslip data, Mom's dialogue, and extra shift offers.
- [`reports/development/plan-40-work-and-evening-experience-study/scenes.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/scenes.mjs): Scene builder integrating accepted apartment SVG art kit read-only, SVG vignette icons, and payslip markup.
- [`reports/development/plan-40-work-and-evening-experience-study/experiment-tracker.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/experiment-tracker.mjs): Live tracker and cohort analysis for the work/commute vs gacha indulgence hypothesis.
- [`reports/development/plan-40-work-and-evening-experience-study/storyboard.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/storyboard.mjs): Interactive state controller with reviewer jumps, synthetic state, and keyboard support.
- [`reports/development/plan-40-work-and-evening-experience-study/storyboard.css`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/storyboard.css): Scoped styles, responsive 16:9 and 390px mobile layouts, and reduced motion styling.
- [`reports/development/plan-40-work-and-evening-experience-study/index.html`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/index.html): Primary preview entry point.
- [`reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs): Unit tests for data contracts, scene SVGs, and experiment tracking.
- [`reports/development/plan-40-work-and-evening-experience-study/browser-check.mjs`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/browser-check.mjs): Automated headless Chrome browser lifecycle witness.
- [`reports/development/plan-40-work-and-evening-experience-study/storyboard.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/storyboard.md): Detailed textual and architectural selected-flow tour.
- [`reports/development/plan-40-work-and-evening-experience-study/integration-recommendation.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/integration-recommendation.md): Concrete mapping to Plan 38 Codex progression engine and Receipt reflection.
- [`reports/development/plan-40-work-and-evening-experience-study/progress.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/progress.md): This report.

---

## 3. Artifacts Produced

- **Visual Storyboard**: [`index.html`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/index.html).
- **Desktop Screenshot Witness**: `storyboard-evening-desktop.png` (304 KB).
- **Narrow Mobile Screenshot Witness**: `storyboard-narrow-mobile.png` (87 KB).
- **JSON Browser Verification Record**: `browser-verification.json`.

---

## 4. Commands Run and Results

1. **Packet Preflight Check**:
   - `node scripts/dev/plan-status.js check plan-40` -> Exit 0 (`RUNNABLE`).
2. **Unit Tests via Bounded Launcher**:
   - Command: `pwsh -Command "& ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'node' -ArgumentVector @('--test', 'reports/development/plan-40-work-and-evening-experience-study/storyboard.test.mjs')"`
   - Result: Exit 0. 3 tests passed in 93 ms (Peak RSS: ~4 MB).
3. **Headless Chrome Browser Lifecycle via Bounded Launcher**:
   - Command: `pwsh -Command "& ./reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1 -Executable 'node' -ArgumentVector @('reports/development/plan-40-work-and-evening-experience-study/browser-check.mjs')"`
   - Result: Exit 0. 11/11 browser steps verified in 4.59 s (Peak Private Bytes: ~396 MB, well under 2 GiB limit).

---

## 5. Validation Checks Performed

- [x] **Plan 29 Numeric Baseline**: Net take-home wage verified at exactly **$60.00**.
- [x] **Plan 37 / Plan 38 Decoupling**: Verified that accepting extra shifts credits cash directly without mutating or auto-paying rent obligations.
- [x] **Health Mechanics**: Verified Call Mom check-in adds +5 HP (80 -> 85 HP); extra shift deducts −15 HP (85 -> 70 HP).
- [x] **Asset Provenance**: 100% pure SVG rendering via accepted apartment kit read-only; no external raster dependencies, no CDN calls, no tracking.
- [x] **Responsive Parity**: Verified 16:9 desktop stage and 390px mobile narrow viewport.
- [x] **Accessibility**: High-contrast text, clear focus rings, keyboard navigation (<kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>Escape</kbd>), and `@media (prefers-reduced-motion: reduce)` toggle verified.

---

## 6. Problems Encountered and How Resolved

1. **PowerShell .NET Compatibility**: Running `bounded-node-run.ps1` with Windows PowerShell 5.1 failed on `ProcessStartInfo.ArgumentList`. Resolved by executing via PowerShell 7 (`pwsh`), which runs .NET Core and supports `ArgumentList` and `Process.Kill(bool)` cleanly.
2. **Import Path Depth**: Initial relative import in `scenes.mjs` was 4 levels instead of 3. Corrected to `../../../src/assets/apartment/index.mjs`, verified by unit and browser suites.

---

## 7. Remaining Risks and Follow-Ups

- **Art Expansion Gate**: The owner approved Treatment 3 with the option to later commission or draw dedicated illustrated scenes for work and commute (e.g. breakroom, bus window, street trees). These can be added as pure SVGs in a future scoped authoring task without changing the mechanics or copy contracts.
- **Plan 38 Integration**: Production wiring of these beats is owned by Plan 38 Codex progression engine. Plan 40 supplies the exact UI/copy/event specifications in [`integration-recommendation.md`](file:///c:/AI/Quackpot/reports/development/plan-40-work-and-evening-experience-study/integration-recommendation.md).

---

## 8. Advisor Consultation Posture

- **Branch C: Orchestrator-Gate-Only**.
  - In accordance with the Plan 40 assignment handoff ("No premium advisor is implied; record actual consultation/delegation posture and use root for technical review at delivery"), no higher-tier subagent consultation was initiated. Delivery proceeds directly to the orchestrator and owner.

---

## 9. Untracked Working Tree Notes

Per commit discipline, the repository contained pre-existing untracked files outside this packet's scope:
- `reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/previews/`
- `reports/development/plan-38-apartment-life-production-integration/__pycache__/`
These were left untouched and uncommitted.

---

## 10. Ready for Orchestrator Review

**Yes**. All deliverables, storyboards, tests, browser witnesses, and integration documentation for Plan 40 are complete and ready for orchestrator and owner review.
