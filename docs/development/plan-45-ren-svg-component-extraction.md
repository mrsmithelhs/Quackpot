---
id: plan-45
title: Ren SVG component extraction and fidelity gallery
status: complete
resolution: "Owner accepts selected Ren hand and raised couch framing, retaining original wide floor scene. Root reviewed unmounted kit promotion, scoped source changes and rendered comparisons; social mounting remains separate."
depends_on: [plan-41]
gate: "Owner assigns Codex2026-11-01. Root approves exact source/API map before extraction. One read-only Terra-medium pre-delivery reviewer authorized. Owner accepts fidelity/gallery before any production mounting; genuinely new drawing remains separately gated."
summary: >-
  Extract selected existing Ren SVG concepts into reusable unmounted source components, preserving artwork and proving identity, layering and scene-composition fidelity without inventing new drawings.
---
# Plan45: Ren SVG component extraction

## Packet Metadata

- Packet id: plan-45
- Packet title: Ren SVG component extraction and fidelity gallery
- Status: (see frontmatter)
- Owner/model: owner-assigned Codex engineering implementer
- Date: 2026-10-31
- Packet type: feature / asset extraction
- Mutation level: source assets and report-local comparison; no runtime mounting
- Approval gate: source/API checkpoint, technical fidelity and owner gallery acceptance
- Expected artifacts: pinned source map, modular SVG renderers, fidelity checks/gallery, provenance, integration contract and progress

## Goal and why this exists

Plan41 produced substantial existing SVG art and compositions through owner/Sonnet iteration. Extract those components as a reusable kit for later social integration; avoid importing monolithic report pages or redrawing approved art. This is engineering, not an automatic Sonnet drawing assignment. Preserve the existing rendered appearance while creating explicit, testable interfaces.

## Non-goals and dependencies

Depends on closed Plan41 for owner selections. No new faces/poses, wardrobe designs, scene art, image generation, animation, social rules, story/HP/event/save fields, game mounting or production audio. Side/turned poses remain later work under S51. Do not assume missing art is authorized just because the study mentioned a shelf or door. Plan46 mechanism design may proceed in parallel against the proposed interface; mounting requires an accepted kit.

## Authority and contracts

Read AGENTS.md, current design/source map/decision log, Plan41 owner ledger S1–S58, reconciled03–06/09 and root delivery review; actual concepts and composition script, existing apartment renderScene/duck:false contract, Plan24 extraction evidence and source API. Ledger choices supersede historical concept pages. Selected: soft-flat style, complexion A, six expressions, no neck tattoo, arm tattoo only when exposed, one pencil placement, first-build front-facing, close couch/floor/door compositions and static physical companion. Report-only generated raster references do not ship. Preserve SVG/source provenance and exact source licenses; no network or new dependency.

## Scope and first checkpoint

Own new src/assets/ren/ modules/tests/README and reports/development/plan-45-ren-svg-component-extraction/. Existing Plan41 artwork, research and historical pages are read-only. Shared apartment source, global styles, controller and other src are read-only unless root explicitly clears a tiny necessary extraction seam. You are not alone; coordinate source/commit/browser turns.

Before extraction, pin exact selected source files/commit hashes and identify authoritative components: bust/six faces; outfit/hair/pencil layers actually kept; door/hallway existing composition; selected close couch and floor-game-night scenes with duck on blue book; shelf prop if an existing approved source actually exists. Exclude owner-dropped bedhead and superseded neck-tattoo/old-door sources. Vest-v3 and latest dust/floor visual acceptance remain open where recorded: gallery may show them clearly marked candidates, never silently promote them. Keep context-only looks out of ordinary rotation. Do not require all wardrobe permutations to ship.

Map proposed pure rendering APIs and output metadata, supported explicit options/defaults, viewBoxes/contact/occlusion, instance ID namespace and caller-owned cosmetic choice. Avoid hidden random selection, mutable room-kit globals, counters/timers or reads from game state. Caller supplies stable options; a future social host owns cosmetic seed choice and replay. Reject unsupported options rather than imply a nonexistent pose. Scope/selection/API checkpoint goes to root; then ordinary extraction fixes may proceed through delivery without repetitive gates.

## Implementation requirements

Extract/reuse existing SVG geometry and established composition recipes. A pure option-driven renderer may assemble layers or include existing SVG fragments, but may not quietly modify anatomy/expression/perspective. Fixing IDs, encapsulation and deterministic composition is allowed; materially changing the drawing needs a separate art brief, preferably Sonnet. If a door, shelf, hand/side pose or other missing view requires invention, deliver a named gap instead of pretending it was extracted. It need not block the rest of the kit.

Preserve required layer order: figures behind table/board and within frame, objects supported by surfaces, companion static. No floating bust in an uncut room. Existing apartment art should be composed through explicit data/metadata rather than patching live shared source. If the current recipe depends on global mutation, replace the glue with bounded pure local composition and show its fidelity separately; do not redesign the entire apartment kit.

Require per-instance idPrefix and consistent rewriting of id/url/href references, unique resolvable IDs for multiple instances. Local safe text only; no embedded remote URLs, scripts, event handlers or foreign runtime assets. Keep ordinary text in HTML where appropriate. Source modules remain unmounted and reports are not runtime dependencies.

## Validation Checklist

- Selected-source inventory/hashes/provenance and explicit gaps/candidate labels exist.
- Deterministic render/option validation, no source imports of report files, no runtime mount and two-instance ID/reference checks.
- Compare pinned originals versus extracted output structurally and at relevant avatar/bust/door/room sizes; explain intentional serialization-only differences. Code equality alone does not prove composition fidelity.
- Isolated gallery contrasts originals/extracted views, close couch/floor/door, hidden body edge/occlusion and current complexion. Check actual desktop/narrow and useful zoom; do not claim real browser zoom if unavailable.
- No missing art is invented, all kept looks are distinguished from selected first-shipping assets, owner visual acceptance remains explicit.
- Progress reports commands/actual inspected cases, reviewer findings, source footprint, limits and future mounting contract.

## Execution, stop conditions and delivery

Node uses unchanged Plan25 bounded launcher after resource preflight: serial named tests,1GiB heap/2GiB sampled owned tree/90s; finite outputs, no watcher/install/unknown process termination. Coordinate browser/finite server with root, isolated state, preserve owner services. Owner/root authorize one read-only default-role gpt-6.1-terra reviewer with explicit medium effort after implementation and before delivery for component API/fidelity risks; no pre-proposal call or automatic repeat allowance. Cold brief, requested/observed settings and finding dispositions must be recorded; report unavailable settings rather than silently substituting. Bounded helpers follow single-writer discipline. Concurrent Plan47 owns work/evening production integration; do not modify its core/controller/life UI scope or its reports.

Stop for new drawing, selection conflict, production/shared ownership expansion or dependency/resource changes. Ordinary extraction/test/copy fixes after clearance proceed to coherent delivery. Commit explicit source/evidence paths, progress last, never packet status/push/deploy. Final root technical and owner gallery review precede closure; no automatic art mounting. Report path: reports/development/plan-45-ren-svg-component-extraction/progress.md.
