---
id: plan-02
title: Static build and Pages deployment spike
status: in-progress
depends_on: []
gate: "Owner approves the proposed folder layout and any live Pages publication or remote configuration."
superseded_by: null
resolution: null
summary: >-
  Prove a local Vite static build and Pages-compatible output, then propose
  ratification of the source, asset, simulation, test, and publish folders.
---
# Plan 02: Static build and Pages deployment spike

## Packet Metadata

- Packet id: `plan-02`
- Packet title: Static build and Pages deployment spike
- Status: (see frontmatter)
- Owner/model: one implementer; orchestrator and owner review
- Date: 2026-10-23
- Packet type: tooling and prototype
- Mutation level: scripts and generated-local; external publication only after owner approval
- Approval gate: mechanism/layout outline before build; owner approval for folder ratification and any live deployment
- Depends on: none
- Expected artifacts: minimal Vite source/build configuration and local smoke evidence, layout recommendation, `reports/development/plan-02-static-build-deploy-spike/progress.md`

## Goal

Prove the build and Pages path with a minimal non-game page, then recommend a concrete repository layout and publish directory. Establish where Plan 03 can safely build.

## Non-goals

No gameplay, economy implementation, public release, publishing from `docs/`, runtime CDN, telemetry, accounts, or surprise GitHub repository settings.

## Depends on

None. May run beside Plan 01 only with disjoint write scopes; Plan 02 owns build configuration and scaffold, while Plan 01 owns simulation code and evidence.

## Why this packet exists

The `site-root/`, `assets/`, `game/`, `sim/`, `tests/` sketch is expressly unratified. A route or asset layout chosen before verifying the Pages base path could force rework or publish documentation by mistake.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/founding/design.md` (constraints #2, #7 and Technology), and `docs/project-seed.md`. No game-authored runtime network calls; bundle local dependencies/assets. Static output must be HTML/CSS/JS/local assets. Never choose `docs/` as the publish source.

## Scope and work plan

1. Run `check plan-02`; inspect existing files, Git remote, Pages configuration if accessible, and available Node tooling. Present a proposed entry point, source/output paths, base-path handling, and exact files to the orchestrator; **wait for mechanism approval before building**.
2. Create the smallest Vite scaffold that builds a static placeholder from local source. Keep build output ignored and separate from documentation. Avoid touching Plan 01-owned modules.
3. Build locally, serve the built output at a representative repository subpath, and inspect generated references and browser requests. Verify refresh/direct entry behavior relevant to the chosen route model. Record exact commands and observations. A live Pages publish/configuration change requires a separate owner approval with the proposed artifact and settings visible first.
4. Compare the project-seed sketch to the measured build path. Recommend final source, SVG asset, optional rendered asset, game, simulation, test and output locations, including how Plan 01's provisional files move or are imported. Send the layout decision to the owner; update structural docs only after owner ratification.

## Validation Checklist

- [ ] Local build and subpath smoke results are recorded with file and request evidence.
- [ ] Build output contains only static local assets and has no app-authored runtime requests.
- [ ] Publish source is outside `docs/`; no live deployment occurred without owner approval.
- [ ] Proposed layout includes migration/wiring for Plan 01 and remains labelled proposed until ratified.
- [ ] Required artifacts and `reports/development/plan-02-static-build-deploy-spike/progress.md` exist; no unrelated files changed.

## Stop Conditions and report

Stop for owner choice if the Pages path requires a remote change, a public URL, or a layout decision; stop if evidence contradicts constraint #2 or #7. Do not set packet status, edit orchestrator notes, or claim production readiness. Report the built files inspected, smoke results, unresolved platform assumptions and exact approval needed. Commit scoped work and report; never push without explicit authorization.
