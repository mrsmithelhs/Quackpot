---
id: plan-51
title: Five-slot scheduler contract and calibration
status: in-progress
depends_on: [plan-29, plan-37, plan-49]
gate: "Owner accepts five-slot direction 2026-11-02. Root clears concrete mechanism before shared pure source; owner/root review complete traces and working parameters before Plan52 production integration. No old-save compatibility requirement; no runtime mount."
summary: >-
  Specify and simulate the accepted five-slot day with slot-consuming meals, one shared pure scheduler, staged guidance and coherent obligation transactions before production integration.
---
# Plan 51: Five-slot scheduler contract and calibration

## Packet Metadata

- Packet id: `plan-51`
- Packet title: Five-slot scheduler contract and calibration
- Status: (see frontmatter)
- Owner/model: Codex engineering lead; owner decides unresolved experience and working values
- Date: 2026-11-02
- Packet type: investigation / schema / simulation
- Mutation level: docs, unmounted pure source, simulation and tests
- Approval gate: concrete mechanism and ownership through root; then owner/root accepted traces and working parameters, not production adoption
- Expected artifacts: transition/action contract, shared pure scheduler, bounded simulator/results, documentation reconciliation, Plan52 handoff, progress

## Goal and why this exists

Replace the maintenance-meal/phase-anchor design with Morning, Midday, Early Evening, Evening and Late Evening. Meals occupy their slot. Establish one implementable authority for commitment, completion, slot advancement, obligations and guidance; quantify consequences before porting the live game. Current Ren dinner/arrival fixes expose the cost of independent local scheduling rules. A rename-only port or another simulator whose rules diverge from the eventual game would not meet the objective.

## Non-goals

No playable-app mount, production state mutation, old-save migration/dual scheduler, broad architecture rewrite, final economy promise, weekends, new endings/gigs/relationship system, music integration, art redesign, forced play duration, deployment or owner storage access. Do not close/reopen old investigations to rewrite their evidence.

## Depends on

Closed Plans29/37/49 supply calibration and accepted action directions. Plan46 completion is deliberately **not** a dependency: pin its latest committed implementation and preserve its selected feature contracts; scheduler-dependent work is held, not erased or falsely accepted. Root must verify its stable savepoint and shared ownership before source work. Plan52 depends on acceptance/closure of this packet.

## Authority and contracts

Read `AGENTS.md`, `docs/README.md`, `docs/decision-log.md` DECISION-072, `docs/five-slot-life-schedule.md`, the current time/life sections of `docs/founding/design.md`, `docs/repo-structure.md`, `docs/open-questions.md`, and `docs/workflows/production-integration-review.md`. Read relevant current engine/life/config/validation and sim modules, Plan49 integration brief, Plan46 final progress/phone-arrival proposal, Plan35 checkpoint tooling contracts, and Plan52 before designing the seam. Historical compatibility instructions are superseded by the explicit owner waiver for this transition.

Preserve local/static runtime, seeded game RNG, no telemetry, free reading/navigation, immediate Uninstall, actual displayed/action evidence, accepted race/roster/economy effects unless a working calibration change is explicitly adopted. Guidance changes presentation/disclosure; it does not independently invent outcomes.

## Scope and ownership

- Report folder: `reports/development/plan-51-five-slot-scheduler-and-calibration/`.
- Propose one small unmounted pure production-intended subtree, preferably `src/core/life-schedule/`, with interface/contract tests. Root clears exact files/API first. The browser must not import it in this packet. Plan52 will use it directly; report files are never runtime dependencies.
- Bounded headless study under `sim/` imports that same scheduler. Reuse pure price/health/event rules where possible; explicitly audit any necessary adapter rather than copy another full GameEngine. Initial old/new comparison pins old code/config; do not require old-save support to compare historical traces.
- Current design docs/open questions may be reconciled for genuinely selected decisions; decision-log/packet status changes remain root-owned. Source map describes the new modules as unmounted, not integrated. Existing live engine/UI/storage/accepted assets and other report folders remain read-only.

## Work plan and requirements

1. Pin current source/config, enumerate concrete activities/intents and all phase/meal/session/obligation callers. Identify unresolved decisions in a compact contract and ownership proposal; root reviews before source creation. Use one selected/context/placeholder/deferred table, not another competing ledger.
2. Specify the five-slot transition table and common inspect → commit/reserve → present/resume → complete/advance lifecycle. Distinguish current-slot use, future reservations, meal/window closure, normal/early bedtime, qualifying Late Evening activity, session allowance and extension. One activity uses one slot; other-slot play requires another commitment. No wall-clock expiry or timer-driven penalties.
3. Supply concrete proposals for no-cash/no-job/no-gacha routes, Day1 required shift/launch, explicit tutorial skip and later nonspending progression, work schedule as data, rent due/escalation, overtime, recovery/zero HP, early-bed recovery, interrupted presentations and pending Ren plans. Do not force food purchase, gacha, reading-as-time, or a filler activity merely to make a state machine terminate. Owner decides new meaningful activities/values; routine mechanism decisions may be cleared by root.
4. Implement a deterministic pure scheduler and consequence-planning interface. A prepared action must expose exact eligible destination, displaced obligations, costs/health, warnings and conflict requirements. Commit is atomic at the specific successful operation. Canceled/failed pre-commit attempts produce no gameplay effects or RNG advance, while actual displayed warnings and cancellation evidence remain recorded. Successful starts reserve the slot; successful purchases/pulls/races and their RNG/outcomes persist exactly once through later interruption or abandonment. Specify interruption/completion/abandonment per activity, never roll back an entire session to fake neutrality. Duplicate/stale attempts cannot repeat outcomes. Model once-only completion explicitly. All relevant displayed warnings and actual effects need distinct proposed event shapes.
5. Model guidance separately: Day1 guided; working N=5 gives Days2–6 confirmations and Day7+ familiar routine warning fade. Always preserve required costs/terms, exits, new-consequence context and materially escalated consequences. Define supported meal-related withdrawal from an unstarted Ren visit without inventing a second opportunity, unwanted commitment break or reward. Keep ordinary communicated cancellation distinct from uncommunicated break; any new penalty needs owner decision.
6. Run bounded named policy traces and seeded cohorts using current working $80 start/$60 shift/$6 meals/$170 remaining rent, existing 5HP skip, current recovery/fatigue as baselines. Compare meal/work/social/gacha/sleep opportunities and cash/HP trajectories; propose working changes rather than silently compensating. Early-bed amount and other unselected numbers remain candidates until adopted. No seed filtering, event duplication, hidden per-route subsidy or claim that more named slots automatically means more spare play.
7. Report at least balanced eating/work/social/sleep; early bedtime; breakfast/dinner replaced by play; missed work; repeated play and Late Evening; insufficient cash/unemployment; rent/recovery/0HP; canceled/failed actions and interrupted Ren/session cases. Cross Day1→2 and Day6→7. Include game actions and illustrative reading/scene/race times, keeping playtime assumptions distinct from measured simulation time. Ordinary engaged target remains roughly30+ minutes, never enforced waits.
8. Produce the Plan52 port map: exact shared interface, selected parameters, source ownership, new save-policy identity proposal, all current synthetic/checkpoint/smoke dependencies, and minimal targeted preview states. Bring owner unresolved choices in coherent batches; root review occurs at mechanism and final calibration gates, not every command.

## Synthetic evidence and compatibility

Do not build backward compatibility or migration for old game saves. Propose clear rejection/reset behavior for unsupported development saves without automatically deleting owner data. New-policy saves must replay accurately. Inventory every active fixture/generator/pin/catalog/brief/evidence consumer, including Plan16/35 and Plan46 synthetic routes, and state exactly what Plan52 must regenerate. Old output remains historical, not a current oracle. This packet may create model-level new-policy traces; it must not relabel old GameEngine save envelopes as valid new checkpoints.

## Validation and review

- [ ] Compact contract/decision trace and source pin match owner direction; meaningful gaps resolved or explicitly block Plan52.
- [ ] Shared pure scheduler is unmounted; simulation imports the same authority without live UI/engine replacements.
- [ ] Tests cover transition topology, slot use/completion/duplicate/failure neutrality, guidance boundaries, actual missed obligation once, normal versus early sleep, Late Evening fatigue, 0HP and competing commitments.
- [ ] Fixed published seed/config cohorts and named route ledgers report outcomes, opportunity counts, balance/pacing assumptions and uncertainty; no proxy-only success claim.
- [ ] Proposed parameters, unresolved issues and concrete Plan52 fixture/doc/integration map are reviewable.
- [ ] Current design/open questions/source map accurately distinguish selected, tested and implemented; no new app authority inferred from reports.
- [ ] One read-only Terra-medium pre-delivery reviewer may be used after implementation, under root judgment; record requested/observed identity and disposition. No automatic repeated repair reviewer or paid consultant expansion.

Before every Node run, inspect resources; use unchanged `reports/development/plan-25-desk-phone-art-integration/bounded-node-run.ps1`, 1GiB heap/2GiB sampled owned tree/90s, serial exact named commands, no watchers or parallel cohorts. If workload needs more, estimate/chunk and ask root before launch. Do not kill unrelated processes. No browser required for model truth. Preserve failures and resource/cleanup limits honestly.

## Stop conditions and delivery

Stop for changed selected mechanics, shared writer conflict, new uncontrolled resource/dependency requirement, or load-bearing unresolved route. Ordinary reversible coding/test repairs within cleared scope do not require a fresh owner relay. Single writer; no nested implementation fan-out. Commit explicit owned paths, no push, progress report last at `reports/development/plan-51-five-slot-scheduler-and-calibration/progress.md`. Implementer never changes packet completion status. Final owner/root acceptance closes the design/calibration gate; it does not ship the scheduler.
