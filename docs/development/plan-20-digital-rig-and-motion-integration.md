---
id: plan-20
title: Digital rig and accepted motion integration
status: draft
depends_on: [plan-04, plan-09, plan-19]
gate: "Owner approves focused source/lifecycle and trigger mapping before implementation; rendered production acceptance follows. Race-event integration awaits Plan 13's accepted event contract."
superseded_by: null
resolution: null
summary: >-
  Integrate the accepted Mode C digital rig and factor-four motion controller
  through focused source modules; preserve the physical companion and defer
  race-event wiring until its mechanics are accepted.
---
# Plan 20: Digital rig and accepted motion integration

## Packet Metadata

- Packet id: `plan-20`
- Status: (see frontmatter)
- Date: 2026-10-26
- Owner/model: one implementation writer; orchestrator review and owner gates
- Type: bounded production integration
- Mutation: focused production view/motion modules and relevant checks after outline approval
- Expected artifacts: `reports/development/plan-20-digital-rig-and-motion-integration/proposal.md`, implementation evidence and `progress.md`

## Goal and why now

Plans 04 and 09 supply an accepted Mode C rig and motion set, while production still uses a placeholder. Port the selected construction into maintainable reusable source, with correct per-instance animation lifecycle, rather than importing the report gallery. Owner approved Plan09's factor-four paper-layer result; this packet is draft and not assigned by that closure.

## Required reading and preflight

Read AGENTS.md, docs/repo-structure.md, docs/decision-log.md, canonical design Assets/Immersion/Receipt and two-duck boundary, Plan09 proposal/refinement/gallery and reviews02–05, Plan19 accepted lifecycle, current src/main.js and relevant UI views, rig composer and SVG hierarchy. Run `node scripts/dev/plan-status.js check plan-20` after assignment; stop if blocked. Read current Plan13 event status before proposing race hooks.

## First return: source and trigger proposal

Inspect actual digital duck placements and physical companion rendering. Map exactly which placeholder uses are digital; never replace/animate the physical companion globally because a shared asset URL is reused. Propose focused rig-view and animation-controller modules, scoped CSS, per-instance unique SVG IDs/filter references and cleanup ownership. Identify exact render/unmount/navigation/Settings/Uninstall/save/reload boundaries. Keep main/global styles small; no broad engine refactor.

Propose a small placement matrix: static digital collection/selection views; at most one active inspected duck with owner-approved gentle motion; race-ready paddle and impact/recovery controller entry points. Do not animate a full shelf continuously. The owner-approved set is the reference, not permission to invent rarity cues or autoplay every clip. Return exact default triggers, duration, interruption/replay and static equivalents for owner approval before coding.

## Implementation boundary after outline gate

Own the production-writing lane only after assignment and explicit file ownership. Plan13 owns its isolated reports and may continue in parallel. Port the accepted factor-four local paper transforms, matched seams, existing parent motion and durations into reusable modules; no production imports from reports or cloned game rules. Preserve hats/accessories, shadows, view-scale readability and complete transform resets. Support multiple instances, replay cancellation and stale-callback protection. Honor system reduced-motion changes as well as static alternatives; no forced tweening on manual activation when reduced motion applies.

Engine outcomes/log/RNG and storage remain authoritative. Presentation has no mechanical randomness, extra rewards, draw costs or save-schema changes. Record displayed cues honestly if they become Receipt evidence; never label a scheduled/skipped effect as shown. Leave costs/odds/terms and immediate exit available.

**Race dependency boundary:** Build reusable motion capability without adopting Plan13 prototype mechanics. No production collision trigger, recovery duration, race choreography or outcome model is authorized here. After Plan13 event semantics are accepted, a separate bounded follow-on or explicit packet amendment maps event IDs/participants/timing to paddle/impact/recovery and reduced-motion race views. Until then, runtime race-event wiring is deferred; do not fire impact animations arbitrarily to demonstrate integration. Production-representative local fixtures may exercise the controller with clearly labeled synthetic triggers outside student flow.

No audio selection/integration, new anatomy/variant stats, environment art, reveal anticipation/near-miss mechanics, physical-companion animation, economy, export schema, framework migration, package dependency expansion or deployment. Ask before shared rig structural changes, rather than compensating with silent art edits.

## Verification and delivery

Check build, relevant repository tests and smoke paths appropriate to changed UI. Add meaningful lifecycle/multi-instance tests for cancellation, neutral cleanup, ID isolation and reduced-motion switching; do not merely mirror constants. Browser-inspect actual production integration on desktop/narrow views, selected attachments, multiple visible ducks, static/reduced mode, navigation/Uninstall during animation and save/reload, with exact viewport/evidence limits. Use coordinated QP Orch browser turns. Confirm game requests remain local and production has no report dependency. Present rendered result to owner; commit scoped implementation and final report with required consultation declaration. No implementer packet-status changes, push or deployment.
