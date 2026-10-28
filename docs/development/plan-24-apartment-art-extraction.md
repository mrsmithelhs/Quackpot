---
id: plan-24
title: Apartment art extraction and comparison gallery
status: in-progress
depends_on: [plan-10]
gate: "Orchestrator approves extraction interfaces and ownership before source writes; owner reviews visual fidelity before production integration."
summary: >-
  Extract selected Sonnet physical-duck, apartment, prop and lighting SVG sources
  into focused reusable modules and prove fidelity in a separate comparison gallery.
---
# Plan 24: Apartment art extraction and comparison gallery

## Packet Metadata

- Packet id: `plan-24`
- Packet title: Apartment art extraction and comparison gallery
- Status: (see frontmatter)
- Owner/model: existing Sonnet art-authoring thread, bounded Haiku workers, root review
- Date: 2026-10-27
- Packet type: migration / art tooling
- Mutation level: source-data / scripts / generated-local
- Approval gate: root interface/ownership proposal, then owner visual fidelity review
- Depends on: Plan10 owner-accepted artwork investigation
- Expected artifacts: `src/assets/apartment/`, isolated Plan24 gallery, extraction manifest, source/visual evidence and progress report

## Goal and rationale

Preserve the successful Plan10 Sonnet art while separating reusable static SVG generators from its large report preview. Deliver an importable art kit and a comparison gallery, not a newly styled apartment or production game integration. The owner assigns this to the same Sonnet thread to retain its art/camera context and permits bounded Haiku extraction work.

## Authority and contracts

Read AGENTS, decision log, development index, repo structure, Plan10 session-log/sonnet-view-repair/preview/duck-views and `reports/orchestration/plan-10-art-inventory-and-use-proposals.md`. Run `check plan-24` before work. Owner accepts Plan10 investigation; recorded weaknesses are not erased. SVG source, no runtime external requests/dependencies, physical-prop immobility, static/reduced equivalents, factual provenance and HTML ordinary text remain binding. No digital paper motion on this duck. No runtime imports from reports.

## Scope and proposal gate

Own only NEW `src/assets/apartment/` and `reports/development/plan-24-apartment-art-extraction/`. Existing Plan10 source, runtime entry/views/global CSS/core/storage, packet/status/canonical docs and other reports are read-only. Put any meaningful focused tests with the new modules and invoke directly; do not change package scripts. No dependency changes. New source modules are not imported into production in this packet.

First write a concise proposal: module/file ownership, dependencies, exported interface, scene/view/state/lighting inputs, camera/scale contract, instance-ID strategy, text escaping/accessibility responsibilities, and source-to-output manifest. Recommend separate duck/views, reusable props, rooms, desk scenes, lighting/defs and composition entry points, with shared helpers only where they reduce actual coupling. Do not create a framework or split every SVG path into a file. Wait for root approval before extraction source writes. Continue read-only analysis while waiting; owner need not repeat the assignment approval.

## Implementation requirements

1. Freeze the source baseline by commit/hash; retain the existing Plan10 preview unchanged. Inventory selected five views plus overhead duck, two desks, three rooms, lighting and combined sold-state. Exclude diagnostic candidates/reference PNGs from the reusable kit. Archive the session's authoring/render helpers under the NEW report folder if still available, with inputs, usage, outputs and non-runtime status; report unavailable helpers honestly. No need to recreate them to finish extraction.
2. Extract appearance-preserving modules. Preserve viewBox/landmarks, paint order, proportions, camera/framing, material/shadows and lighting. Document intentional unsupported combinations/fallbacks rather than silently showing a different view under the same label. No new rooms, props, accessories or redrawing under this packet; report repair recommendations separately.
3. Interfaces accept explicit trusted scene state and unique instance prefixes. Separate game-state mapping from art: render visibility inputs, never decide sales, rewards, story state or player progression. Bound supported options, safely escape any labels and keep IDs/references unique across repeated scenes. Export static SVG/string or DOM interfaces with clear ownership and no hidden global mutation/observers/timers.
4. Gallery imports ONLY the new kit, outside production runtime. Offer the original baseline comparison, view/contact sheet, selected room/frame/light states, desks, sold-state and repeated-instance stress. Baseline can be the unchanged Plan10 page plus reproducible reference screenshots; do not copy its whole app as the new architecture. Document which combinations actually exist; no combinatorial validation claims.
5. Haiku budget: up to FOUR bounded extraction assignments, at most TWO concurrent; use disjoint owned subfolders/files defined in the approved proposal. Suitable split: duck views; props; rooms; desk/lighting with careful shared ownership. Sonnet alone integrates shared APIs/gallery and resolves differences. No nested delegation or independent browser tabs by workers. Workers must preserve others' edits and report exact source mapping/limits. Unused budget need not be spent. Additional fan-out/scope needs root approval.

## Work plan and validation

1. Read/check, freeze baseline, submit interface/ownership proposal and wait.
2. Extract with bounded ownership, then Sonnet integrates.
3. Syntax/import/XML checks; repeated-instance ID/reference integrity, valid supported options, absence of external URLs/runtime report imports, bounded output for each scene family. Prefer objective interface tests over path snapshots that merely mirror implementation.
4. Coordinate isolated browser slot with root. Compare new gallery to frozen baseline at desktop/narrow: all six duck representations, two desks, each room medium/wide, sold variant and selected neutral/warm/window modes. Inspect meaningful close crops, furniture occlusion and lighting. Record actual matrix coverage and differences; close art review matters more than counts. Actual browser zoom only if supported, otherwise unverified. Preserve the whole game's build after extraction without claiming unused art was production-tested.
5. Report source-to-module mapping, APIs, fidelity evidence, measured known differences, authoring-method availability and remaining limits. Root uses Terra-medium independent review before owner selection. No implementer reviewer budget beyond explicitly authorized Haiku extraction tasks; declare consultation posture under current owner policy.

## Stop conditions and delivery

**Root implementation gate, 2026-10-27:** Proposal `b2ed380` is approved with binding clarifications in `reports/orchestration/plan-24-extraction-gate-01.md`. Independent couch/TV flags, baked lighting, report-local frozen-baseline tooling and bounded escaped phone copy are selected. Use explicit `.mjs`, complete actual-view fallback metadata, verify source hashes and fidelity negative controls, and compare final baked lighting to the original CSS-overlay composite. Mixed sale states are new unbaselined combinations. Existing four-Haiku/two-concurrent ownership is approved after shared interfaces are published. No further owner gate before source extraction; owner fidelity acceptance remains open.

Stop for incompatible interfaces requiring runtime changes, settled-rule changes, new pipeline/dependencies or unexplained visual drift. Do not edit runtime to make gallery pass. You may not set packet status, edit root dispositions or declare owner acceptance/shipping. Report readiness against appearance preservation and separability, not test count. Commit explicit owned files, progress report last; never push.

Report: `reports/development/plan-24-apartment-art-extraction/progress.md`. Checklist: approved proposal; mapped sources; isolated reusable modules; gallery; repeated IDs/refs checked; rendered baseline comparison with honest limits; no unrelated changes; final report and scoped commits; root/owner gates preserved.
