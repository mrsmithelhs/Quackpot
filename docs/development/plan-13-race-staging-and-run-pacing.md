---
id: plan-13
title: Race staging and run pacing investigation
status: draft
depends_on: [plan-03, plan-04]
gate: "Owner approves race staging, dramatic-event meaning and pacing before gameplay integration."
superseded_by: null
resolution: null
summary: >-
  Compare readable oval-course race drama and camera direction alongside a
  timed day/run beat map toward the roughly fifteen-minute floor.
---
# Plan 13: Race staging and run pacing investigation

**Date:** 2026-10-24. **Type:** investigation/prototype. **Mutation:** isolated local preview and reports. **Owner/model:** one investigator; owner gate. **Expected artifacts:** `reports/development/plan-13-race-staging-and-run-pacing/proposal.md`, staged race preview and `progress.md`.

## Boundary and required reading

Read `AGENTS.md`, canonical design Time/Immersion/Race/Receipt sections, owner triage, Plan 01 evidence limits, Plan 03 accepted trial, owner play feedback, and Plans 09/11. Run `check plan-13`; stop if blocked. Plan 04 supplies the accepted digital base; Plan 09 supplies candidate individual motions. Own only this report/preview folder. Propose the small comparison and wait for owner prebuild approval before coding. No production race changes, physics engine, final balance or new manipulation rule is authorized.

## First comparison

**Owner interview integration, 2026-10-25:** The owner selects a 3-Down minor temporary speed item as a calibration target; Plan 17 must resolve effect/duration/stacking and validate the trade-off before integration. Do not infer adoption of the wireframe's sample +0.5%/one-race rule or change race mechanics to make an untested item appear useful. Coordinate the eventual observable effect and accessible presentation with this packet. See DECISION-008.

**Owner direction, 2026-10-24:** Investigate races as short events with seeded internal beats rather than a constant-speed animation that discloses the result immediately. Propose a small timeline (start, mid-race developments, finish) with a few eligible event types and bounded effects. Distinguish a seeded mechanical race timeline that determines its own result from visual staging of an already resolved result. Recommend one approach with a worked trace before owner selection; do not mix two incompatible outcome models. An early lead need not predict the winner, but a dramatic reversal must have coherent recorded causes. Camera direction follows the timeline; it does not invent a collision/penalty after the fact. Avoid forcing every race to end narrowly.

Use a separate deterministic race-event stream from draw outcomes, and separate mechanical randomness from presentation/camera randomness. Replaying the same seed, choices and rules must reproduce mechanical events and finish. Reduced motion, camera cuts, pausing presentation, save/reload or skipping spectacle must not consume different outcome draws. Specify event eligibility, timing, affected racers, effects, tie handling and log fields, then test representative traces before building an outcome-changing mechanic.

**Progressive pre-race choices:** Compare an opening with one understandable decision against later unlocked options with explicit trade-offs. Preserve the canonical single pre-race choice by first considering richer mutually exclusive options in that decision; multiple independent selections would require an explicit owner-approved design amendment. Give each proposed unlock a visible introduction and trigger. Avoid an obvious upgrade ladder that permanently dominates earlier options, per-cosmetic stat balancing, and menus whose complexity arrives all at once. No new choice, collision rule or unlock schedule is adopted by this brief.

The existing normal race motion is 1.2 seconds plus about 0.3 seconds to show results. Propose a matched comparison around 12/20/30 seconds, then build only the owner-selected small batch. Test an oval course inside a rectangular viewport, overtaking/lane changes, occasional contact and camera-wide/close views. Include a static-camera control and reduced-motion alternative. Camera direction should make the player's duck and meaningful action readable; preserve an understandable start/finish and return to a wider view after close moments.

For each bump, pileup, apparent fatigue or narrow finish, state whether it represents an approved resolved event, is cosmetic performance, or proposes a new mechanic. Cosmetic staging cannot falsely imply an unrecorded collision cost, random upset or close finish; outcome, visual chronology and Receipt evidence must agree. New causal race mechanics and engineered near-miss rules require owner investigation gates. Preserve seeded reproducibility, fixed-duration/no-reflex-input racing and the no-per-variant-balancing bound. If outcomes are resolved first, stage a plausible path consistent with them rather than showing arbitrary impacts as their cause.

Test a flat paper turnaround around 0.5 seconds with the accepted rig/motion candidates; no volumetric duck or 3D engine is assumed. Readability/accessory attachment and camera motion need observation, not blanket compatibility claims.

## Day and run pacing

Produce a timed beat map for one ordinary day and one consequential day: metagame scene, gacha session, shop decision, race, expenses and transitions. Count active decisions, repeated waits and time to understand each new rule. Preserve the hybrid clock and paused reveals/story beats. Target the roughly 15-minute floor across the whole run, including setup and Receipt; do not attain it by stretching every day or race with mandatory idle time. This plan proposes pacing; it does not adopt final day count, costs or economy. Carry the recorded Skip Lunch settlement follow-up into any later implementation that makes food shortfall reachable.

## Evidence and gate

Compare repeated races as well as the first spectacle, inspect player tracking on narrow/wide layouts, reduced-motion clarity and uninterrupted access to Uninstall. Report measured preview timings separately from unmeasured classroom play. Return a small recommendation, alternatives and explicit mechanical versus visual changes for owner approval. A later bounded packet integrates the approved result. Commit owned artifacts/report, state the consultation branch, never push or set status.
