---
id: plan-66
title: Gacha Uninstall route and retention copy
status: draft
depends_on: []
gate: "Owner selects placement and copy after a route audit. Root verifies no progression dead ends before clearing source writes and reviews the live route before owner acceptance."
superseded_by: null
resolution: null
summary: >-
  Move the fictional Uninstall and retention experience into Quackpot's gacha
  UI. Compare in-character copy and verify that tutorial, financial and
  ordinary-life progression still offer coherent routes to endings.
---

# Plan 66 — Gacha Uninstall route and retention copy

## Packet Metadata

- Packet id: `plan-66`
- Packet title: Gacha Uninstall route and retention copy
- Status: (see frontmatter)
- Owner/model: Codex implementer, with optional bounded Sonnet copy consultation
- Date: 2026-11-06
- Packet type: feature
- Mutation level: source-data after the owner gate
- Approval gate: Owner selects placement and copy and root clears the route audit before production writes
- Depends on: none
- Expected artifacts: compact route and copy proposal, scoped production patch after approval, and focused verification

## Goal

Give the fictional app ownership of its Uninstall control and retention screen. Make the offer sound like Quackpot marketing and keep the Receipt responsible for explaining the tactic.

## Non-goals

New endings or cinematics, repricing the offer, general gacha navigation redesign, Receipt redesign, usage export, save format changes, or deployment.

## Depends on

No blocking packet for the investigation. Before editing shared source, coordinate the header, modal, Messages and race seams with orchestration. Preserve Plan 63's removal of the global End Run shortcut.

## Why this packet exists

The global Uninstall button sits outside the fictional app, and “Play out the trap!” has the app describe its own manipulation. Moving the control also exposes a real policy question. Players can be outside the gacha before launch, during recovery or while a financial decision blocks play.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, the Uninstall and Receipt provisions in `docs/founding/design.md`, and `docs/workflows/production-integration-review.md`. Trace the HUD and modal wiring in `src/main.js`, `src/ui/hud.js`, `src/ui/modals.js` and the engine and Receipt paths before proposing a replacement. DECISION-095 selects Uninstall only inside Quackpot and supersedes the always-visible placement and universal best-ending policy. Preserve immediate Receipt access after confirming Uninstall inside the app.

## Scope

Compare one or two discoverable in-app locations, such as an app menu, and two or three concise promotional lines. Cover the offer available and already claimed states. After selection, change only the approved entry points, presentation, and necessary routing and evidence. Preserve the existing one-time 80 Gems rule, the Uninstall ending and other ending routes, seeded outcomes, and offline operation.

## Implementation Requirements

1. **Audit routes before removing the header control.** Trace prelaunch tutorial, recovery, affordable and unaffordable due bills, terminal financial routes, and active gacha presentation. Separately trace a solvent run that never opens the app, one that never spends, and one that plays once and leaves the app behind. Distinguish a progression dead end from an open-ended route with no ordinary conclusion. Show whether each can reach the Receipt and flag any missing ending as a separate design dependency. Escalate gaps before production writes. Keep Uninstall inside the app and do not weaken life gates or add a global finish shortcut.
2. **Keep the choice legible.** Present Stay and Uninstall as distinct actions with the actual offer terms. Avoid self-identifying teaching copy, deceptive button labels, timed waits and any mandatory presentation between confirming Uninstall and seeing the Receipt. Define keyboard access, focus return on dismissal, and reduced-motion behavior.
3. **Preserve actual evidence.** Pin the current replacement seam and surrounding routes. Reuse authoritative outcomes and record the retention cue only when displayed. Cover the first offer, repeat visit, staying and leaving. Preserve historical replay and Receipt rendering without fabricating an offer or reclassifying an old run. Check that the new Receipt copy neither treats Uninstall as financial resolution nor judges it the universal best ending.

## Validation Checklist

- [ ] Owner approves placement and copy and root clears the route audit before production writes.
- [ ] Targeted checks cover the selected routes, keyboard/focus behavior, single reward, honest Receipt evidence and reload/interruption.
- [ ] Root inspects state-bound before/after production renders and checks neighboring Settings, Messages and Return to apartment access. Owner reviews the integrated route.
- [ ] Preserve supported historical replay and report exact validation limits.

## Stop Conditions

Stop at the owner gate. Escalate if an approved route requires a new ending or save policy, breaks historical replay, or overlaps an active shared source turn.

## Progress Report

Record the proposal, selected policy, source pins, actual route evidence and remaining limits in `reports/development/plan-66-gacha-uninstall-route/progress.md`.
