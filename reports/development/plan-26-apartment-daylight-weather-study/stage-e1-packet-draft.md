---
id: plan-NN
title: Weather motion runtime extraction (E1, unmounted)
status: draft
depends_on: [plan-26]
gate: "Owner and root accept the extracted runtime, tests and contract; E2 (mounting) is a separate packet"
superseded_by: null
resolution: null
summary: >-
  Move the Plan 26 weather-motion and bright-lightning runtime out of the report folder into small, tested `src/` feature helpers, not mounted anywhere,
  with no kit, save, settings or user-facing change. It is the extraction half of Stage E; mounting on a production surface is a separate gated packet.
---
> **DRAFT BRIEF, NOT A PACKET.** Prepared by the Plan 26 implementer at the owner's request ("open it") and left in the Plan 26 report folder. The id is a placeholder: I did not allocate one, did not create anything under `docs/development/`, and ran no `plan-status` command. Allocating the id, moving this file into `docs/development/` and setting its status belong to the orchestrator and owner. Source of truth for the reasoning: `stage-e-proposal.md` (same folder) and `progress.md` sections 9.1-9.7.

# Plan NN: Weather motion runtime extraction (E1, unmounted)

## Packet Metadata

- Packet id: `plan-NN` (placeholder)
- Packet title: Weather motion runtime extraction (E1, unmounted)
- Status: (see frontmatter)
- Owner/model: implementer (single); Sonnet suits it (SVG and controller work it already knows)
- Date: 2026-10-28 (draft)
- Packet type: feature (extraction; no user-facing change)
- Mutation level: new unmounted `src/` modules and tests, one edit to the `npm test` file list; nothing user-facing
- Approval gate: owner and root review of the extracted modules, tests and DOM contract; work stops there and reports
- Depends on: `plan-26` evidence accepted (Stages A-D); root approval of the proposal's file list, API and layer option (R1-R3); a bounded Node-run authorisation (R4)
- Expected artifacts: listed under Requirement 1

## Goal

Make the weather-motion runtime a maintained part of the codebase without changing what the game does: extract the arbiter, rain spec, motion controller and bright-lightning effect, and a guarded weather-still layer module, into `src/` with their tests, **mounted nowhere**, so that a later packet (E2) can mount them on a chosen surface.

## Non-goals

- Mounting anything: no change to `src/main.js`, `src/ui/desk-view.js`, `src/ui/apartment-view.mjs`, `src/ui/settings-modal.js`, `src/style.css` or any view.
- Any change to the Plan 24 kit (`src/assets/apartment/`), the save envelope, `storage.mjs`, the Receipt log, or Plan 25's accepted art and glow controller.
- Visual retuning of rain, lightning or the weather still; the selected visuals are preserved exactly.
- Audio, thunder, TV or music, other rooms, idle or timed flashes, and any new trigger.
- Promoting the gallery, the measurement tools, the restrained lightning look (unless owner decision D8 asks for it) or any report tool.
- Choosing the production surface, defaults, persistence, triggers or credits wording (owner decisions D1-D8).
- Any flash-safety, red-flash or performance claim.

## Depends on

`plan-26` (the investigation and its evidence). Root decisions R1-R5 and the owner's D-decisions that bear on extraction (D8: bright only, or bright plus restrained) should be settled first; D1-D7 do not block E1.

## Why this packet exists

The study's runtime exists only under `reports/`, where it is not part of the game and cannot be imported by it (`docs/repo-structure.md`: reports are not imported). Extracting it is mechanical and fully verifiable in Node and an isolated browser, and it needs none of the open owner decisions about where weather appears (production mounts only the desk-side area today). Doing it separately keeps the later, riskier mounting change small and keeps this one reviewable.

## Authority and contracts

Required reading: `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/repo-structure.md`, `reports/development/plan-26-apartment-daylight-weather-study/stage-e-proposal.md` and `progress.md`, `animation/interface.md`, `animation/lightning-mechanism.md`, and (read-only precedent) `src/ui/ambient-glow-controller.mjs` and its test.

Contracts to preserve:

- The kit stays read-only and pinned (commit `5237a2a4f58922ff713240a9e4c7221ab89e6c62`); a missing anchor in the kit output yields the plain kit scene, never an error.
- No runtime network request, no CDN, no new dependency; static build output; SVG-sourced art.
- No module-level state in the runtime; the flash arbiter is created by the host and injected; no arbiter means flash refused.
- The selected visuals and curves are unchanged: rain art and speeds; bright lightning curve (0 at 0 ms, peak 40 ms, scene white gone by 300 ms, window white gone by 800 ms; scene white `#ffffff` peak 0.9, window `#f4f8ff` peak 1.0; one pulse per accepted event; >= 4000 ms between accepted pulses).
- Weather and lightning never write to the Receipt log; they touch no duck node (`data-duck-motion`) and no lamp layer.

## Scope

### In scope

- New files under `src/ui/` (flat, beside the existing controllers) and `src/assets/apartment-weather/` (beside, not inside, the kit), each with its test, plus a test-only DOM helper.
- One edit to `package.json`: add the new test files to the explicit `npm test` list.
- A `README.md` in `src/assets/apartment-weather/` stating the DOM contract, the kit pin, authorship and the no-certification disclosure.
- A report-folder progress file and, if useful, an isolated-browser witness script under `reports/` (not shipped).

### Out of scope

- Everything under Non-goals; and edits to `docs/repo-structure.md`, `docs/decision-log.md`, packet status or `AGENTS.md` (the implementer proposes wording; the orchestrator applies it).

## Implementation Requirements

### Requirement 1: extract the files

| Study source | New file | Change allowed |
|---|---|---|
| `animation/arbiter.mjs` | `src/ui/weather-flash-arbiter.mjs` | none to the logic |
| `animation/rain-motion.mjs` | `src/ui/weather-rain-spec.mjs` | none to art or numbers |
| `animation/controller.mjs` | `src/ui/weather-motion-controller.mjs` | Requirement 2 only |
| `animation/lightning-bright.mjs` | `src/ui/weather-lightning-effect.mjs` | none to the curve or colours; export names adapted |
| `study/weather.mjs` plus the minimum of `study/daylight.mjs`, `anchors.mjs`, `options.mjs`, `scene.mjs`, `pin.mjs` | `src/assets/apartment-weather/layers.mjs` and `README.md` | weather subset only; guarded insertion with a kit pin or anchor test (layer option A) |
| `animation/tests/*`, `fake-dom.mjs` | `src/ui/weather-*.test.mjs`, `src/assets/apartment-weather/layers.test.mjs`, a test-only DOM helper | ported with their assertions |

### Requirement 2: the policy edits (from the proposal, section 5)

- Missing `IntersectionObserver` means **static** (match `ambient-glow-controller`), replacing the study's "treated as visible" fallback; update its tests.
- Add `flashEnabled` (default `false`) as its own refusal `flash-off`, consuming no budget and independent of rain; add `setMotionEnabled`, `setFlashEnabled`, `pause`, `resume`, keep `setActive`, `subscribe`, `destroy` (idempotent).
- Rename the DOM roles from `data-p26*` to a stable `data-weather-*` namespace in one mechanical, tested change.
- Keep the live reduced-motion handling, the pending-visibility start, the glass-only visibility gate, independent blockers, the accepted-then-cancelled start-failure ticket and the `watchdog` reason exactly as in the study.

### Requirement 3: tests

- Port the study's runtime tests (arbiter, rain spec, controller, bright lightning including the injected-failure cases, and the still-fingerprint check where it applies); the flash-measurement maths and its tests (`flash-metrics`, the saturated-red tracker) are report tools and stay in `reports/`. Adapt only what Requirement 2 changes. (The study's last verified full run was 73 of 73 across all of these files; the red-tracker test added afterwards is unrun.)
- Add contract tests against the **production** kit output: roles present, the pane clip present, duck and lamp subtrees byte-identical during and after a pulse, no module-level state, arbiter injection required, a kit pin or anchor test that fails loudly if the kit changes.
- Add the new test files to the explicit `npm test` list; run them only through the established bounded launcher (serial, 1 GiB heap, 2 GiB sampled, 90 s, short output); no watcher, no mutation run, no full-suite sweep unless the orchestrator asks.

### Requirement 4: nothing mounted

Prove it: a test or grep check that no existing file imports the new modules, and `npm run build` output is unchanged in behaviour (bundle size delta of the unused modules recorded; they should tree-shake out).

## Validation Checklist

- [ ] New files exist at the paths above and nothing else under `src/` changed except the `npm test` list in `package.json`.
- [ ] Ported and contract tests pass through the bounded launcher; counts and the exact command are reported.
- [ ] The selected curves and colours match the study byte for byte (a test compares the constants).
- [ ] No existing file imports the new modules; `npm run build` and `npm test` results reported.
- [ ] Kit untouched (`git status` clean for `src/assets/apartment/`), Plan 25 files untouched.
- [ ] Progress report exists at `reports/development/plan-NN-weather-motion-runtime-extraction/progress.md`.
- [ ] Approval gate honoured: stop and report; do not mount, do not start E2.

## Stop Conditions

Stop and report to the orchestrator if: the kit's anchors or pin no longer match; extraction would need an edit to the kit, `main.js`, a view, the settings modal, `style.css`, `storage.mjs` or the save format; a test fails in a way that changes scope; any change to a curve, colour or opacity seems necessary; Node runs misbehave (memory or time); or an owner decision (D1-D8) turns out to be needed for extraction.

## Progress Report

`reports/development/plan-NN-weather-motion-runtime-extraction/progress.md`. Minimum contents: overall summary, files changed, artifacts produced, commands run (exact bounded-launcher invocations), validation performed, problems encountered, remaining risks, ready for orchestrator review yes or no.

---

## Decision routing (what the owner and root still need to answer)

| # | Decision | Needed before | My recommendation |
|---|---|---|---|
| D8 | Bright only, or bright plus the earlier restrained look as a setting | E1 (scope of one file) | Bright only in E1; add restrained later only if D4 asks for an intensity setting |
| R1 | Accept the two-part boundary (E1 extraction, E2 mount) | E1 | Accept |
| R2 | Layer option A (wrapper beside the kit), B (kit hooks) or C (stills only) | E1 | A |
| R3 | Flat `src/ui/weather-*` or a subfolder | E1 | Flat, matching the existing controllers |
| R4 | Authorise bounded Node runs for E1 | E1 | Bounded launcher only, as in Stage D |
| R5 | Whether any W3C-method flash analysis is wanted before any default-on use | E2 | Yes if any default-on use is considered; otherwise keep the disclosed limitation |
| D1 | Which production view shows a window with weather (the living room is not mounted today; see also draft packets 28 and 31 for apartment surfaces) | E2 | Owner's choice |
| D2 | Defaults (rain, lightning) | E2 | Rain as the owner prefers; **lightning off by default** until device and comfort gates pass |
| D3 | Persistence | E2 | Session-only, like `animatePhoneGlow`; no save-schema change |
| D4 | Classroom or projector acceptability and an intensity setting | E2 | Decide after the teacher-machine live viewing and the projector question |
| D5 | Which named beats may request rain or a pulse | E2 | Few, named, never tied to offers or pulls |
| D6 | Receipt boundary (decoration outside the log) | E2 | Confirm |
| D7 | Credits wording and disclosures | E2 | As in the proposal, section 10 |

## E2 in one paragraph (not a packet yet)

Mount the weather scene and controller on the owner-chosen surface; pass the one arbiter and the preferences down from `main.js`; add settings toggles and a visible pause control; wire only the owner-selected triggers; add the credits line; re-run the lifecycle witness, the Stage D matrix and the composite flash measurement **on the production build**; and carry the owner and device checklist results (teacher machine, slower student or lab machine, second browser, a person watching a true-speed pulse including a projector, the actual OS reduced-motion setting) into explicit pass or fail criteria. It is written only after E1 is accepted and the D-decisions are in.
