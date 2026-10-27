# Plan 21 progress

**Date:** 2026-10-26  
**Stage:** Bounded report-only proposal and standalone flow/queue simulation delivered for owner/orchestrator gate approval. No production code has been modified.

---

## 1. Overall Summary

Completed the read-only architectural investigation and standalone flow/queue verification for Plan 21 (Duck-Dex inspection and first-owned entry presentation). 

The proposal establishes:
1. **Voluntary Duck-Dex Inspection:** Dedicated `🦆 Duck-Dex` canopy control in the fictional phone stage, returning cleanly to the prior context (`previousStep`). A curio shelf displays all 6 banner identities, rendering discovered ducks in the accepted Mode C hybrid SVG rig with canonical cosmetic assignments, and missing ducks as distinct dark-cardstock silhouettes. Factual attribute inspection exposes real speed and pre-draw rarity rates without fabricated resale prices or power scores. An explicit set banner displays "Pond of Destiny" progress (`X / 6 Owned`) and plainly states the canonical set-effect gap (`"Set Bonus: None active (investigation only — no mechanical bonus applied)"`), logging `completion_pressure` cues compliant with `src/core/receipt.mjs`.
2. **First-Owned Card Reveal Presentation Queue:** Connects revealed cards to a sequential 2.0s shelf focus + 2.5s silhouette-to-color transition (with subtle background glow). Pure commit-time duplicate checking (`duplicate === false`) guarantees that batch duplicates convert to Down without spawning duplicate acquisition presentations. Unrevealed cards remain hidden. Ten new identities require 45.5s, explicitly acknowledging the drama extension in the run-pacing budget without claiming an unchanged 15-minute floor.
3. **Fast-Pull and Free Skip Paths:** Hitting `⏭️ Skip Presentation` or clicking the existing `btn-reveal-all` ("Reveal All") immediately colorizes the shelf slots and bypasses the 45.5s spectacle in 0ms without fee, gems, or Down costs.
4. **Reduced Motion & Accessibility:** Disables camera animation and timed waits under `prefers-reduced-motion: reduce`, executing discrete static state transitions with ARIA live announcements.
5. **Persistence & Log Schema:** Proposes backward-compatible `seenDexEntries` state and honest append-only event logging for `duck_dex_acquisition`, `acquisition_presentation_skipped`, and `completion_pressure`.

An executable simulation runner (`flow-queue-analysis.mjs`) verified all 8 core lifecycle behaviors and outputted machine-readable evidence (`flow-queue-results.json`).

---

## 2. Files Changed and Artifacts Produced

- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/proposal.md`  
  Comprehensive architecture proposal detailing voluntary collection navigation, shelf visual layout, factual value mapping, acquisition queue lifecycle, Fast-Pull bypass, reduced-motion parity, storage schema, and proposed production file ownership.
- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/flow-queue-analysis.mjs`  
  Standalone Node.js verification script executing 8 automated test suites covering batch duplicate handling, pacing budget calculation, skip resolution, reduced motion, reload idempotency, outcome concealment, and Receipt projection conformance.
- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/flow-queue-results.json`  
  Machine-readable test output recording 8/8 passing verification suites.
- **Artifact:** `reports/development/plan-21-duck-dex-and-new-entry-presentation/progress.md` (this report).

*Note on working tree isolation:* Uncommitted changes related to Plan 23 and other plans (`AGENTS.md`, `docs/agent-starting-prompts/orchestrator-prompt.md`, `docs/development/README.md`, `docs/development/plan-21-duck-dex-and-new-entry-presentation.md`, `docs/development/plan-23-production-race-integration.md`, `docs/founding/design.md`) were observed in the tree and left untouched. Only Plan 21 report artifacts will be staged and committed.

---

## 3. Commands Run and Results

- `node scripts/dev/plan-status.js check plan-21`:  
  Exit code 0: `RUNNABLE: plan-21 is ready to implement`.
- `cmd /c "npm test"`:  
  Exit code 0: 140 passing tests across 11 test suites; 0 failures.
- `cmd /c "npm run build"`:  
  Exit code 0: Clean Vite build yielding static assets in `dist/`.
- `node reports/development/plan-21-duck-dex-and-new-entry-presentation/flow-queue-analysis.mjs`:  
  Exit code 0: 8/8 verification cases passed:
  1. `batch_duplicates_produce_unique_acquisitions`: PASS (0 duplicate acquisitions; 3 unique queued).
  2. `pacing_budget_ten_new_identities`: PASS (45.5s exact, within 40–50s target band).
  3. `fast_pull_instant_resolution`: PASS (0ms delay, skip actions logged).
  4. `mid_sequence_skip_resolution`: PASS (first presented honestly, remaining resolved immediately).
  5. `reduced_motion_discrete_state`: PASS (0ms delay, static state transition).
  6. `reload_idempotency_no_duplicate_presentation`: PASS (persisted seen entries prevent re-animation).
  7. `unrevealed_draws_stay_hidden`: PASS (unrevealed cards never enter presentation queue).
  8. `completion_pressure_receipt_projection_conformance`: PASS (matches `src/core/receipt.mjs` line 128).

---

## 4. Problems Encountered and Resolutions

- **Direct `npm` execution in PowerShell:** PowerShell execution policies restricted running `npm.ps1`. Resolved by wrapping execution in `cmd /c "npm ..."` as directed in `AGENTS.md`.
- **Set Bonus Boundary:** Canonical design includes completion pressure but explicitly bounds set bonus mechanics as unadopted investigation items. Resolved in proposal by making set-effect gaps explicit on the shelf card (`"Set Bonus: None active (investigation only — no mechanical bonus applied)"`), avoiding speculative balancing while preserving authentic completion pressure.
- **Pacing Budget Alignment:** Plan 21 noted that 10 new identities could add 40–50s. The simulation validated that 10 new identities require 45.5s (2.0s focus + 2.5s color transition each + 0.5s return). The proposal clearly notes that the floor run time expands by up to ~50s for newly discovered rosters, avoiding false claims of an unchanged 15-minute floor.

---

## 5. Remaining Risks and Follow-Ups

- **Owner Visual Selection:** Exact color dissolve easing, background glow radius, and shelf card borders require owner visual review during browser implementation.
- **Plan 22 Rest Alignment:** Effective speed currently equals base speed; the factual inspector card has an explicit hook ready to display soft fatigue penalties once Plan 22 is integrated.
- **Production File Ownership Gate:** Implementation will proceed only after QP Orch / Owner approves the proposed file ownership and architecture.

---

## 6. Advisor Consultation

**Branch C — Not advisor-capable / degraded mode by user instruction (orchestrator-gate-only).**  
The user explicitly instructed: *"No advisor calls authorized, run as Branch C."*  
In strict compliance with this instruction, no advisor subagents were spawned. The proposal and standalone verification evidence are submitted directly for the standard orchestrator/owner gate.

---

## 7. Ready for Orchestrator Review

**YES.** The proposal, queue analysis script, and machine-readable verification evidence are delivered and ready for orchestrator and owner gate review. No production code has been modified, awaiting gate approval.
