---
id: plan-22
title: Visual race entry and soft two-race duck rest
status: draft
depends_on: [plan-13, plan-20]
gate: "Owner/orchestrator approves race-entry, rest lifecycle and simulation evidence before integration; owner rendered acceptance follows."
superseded_by: null
resolution: null
summary: >-
  Implement selected two-race rest penalties with eligible small-roster fallback
  and foregrounded effective-speed candidates in race preparation.
---
# Plan 22: Visual race entry and soft two-race duck rest

## Packet Metadata

- Packet id: `plan-22`
- Status: (see frontmatter)
- Date: 2026-10-26
- Type: mechanics/lifecycle investigation then bounded integration
- Owner/model: one implementer; owner/orchestrator gates
- Expected artifacts: report-folder mechanism/lifecycle proposal, matched evidence and progress.md

## Selected rule and first proposal

Owner selects soft rest for owned digital ducks: reuse with zero intervening races gives50% speed penalty, with one gives25%, with two or more none; never-raced duck is rested. Tired ducks remain selectable. This rule supersedes unselected simulator fatigue assumptions for future integration, not existing evidence. No paid recovery, forced purchase or special per-variant recovery. Draft only: read AGENTS/design/decision log, Plan13 accepted outcome/commit contract, Plan17 trial, Plan20 reusable art, engine/storage/log/Receipt and actual entry UI; check plan-22 after assignment. Propose first and wait before coding.

Define intervening committed race ordinal, identity versus physical-copy semantics (duplicates currently convert), and exactly-once advancement/consumption. Recommend identity-level history; calculate from last race ordinal so repeat/cancel/reload cannot reduce rest or advance recovery improperly. Present candidate composition with accepted +5% trial, stance and later effects: apply rest to base speed once, show actual effective inputs and disclose caps/no-effect cases. Do not increase penalty or reopen Plan17 rules. Zero/one/many eligible roster remains playable; no-duck condition must be traced to current valid engine behavior, not invented free assets.

Race prep should show visual candidate cards with factual recommendation reasons and availability/rest status, sorted/foregrounded using actual effective race inputs. Full owned roster remains reachable and tired entries selectable. Clear50%/25% explanation and next-rest state, no manipulative math-analysis panel. Reconcile existing duck dropdown plus stance controls with canonical single pre-race-choice requirement before adding independent options. Recommendation is not guaranteed winner. Reuse Plan21 collection cards if accepted; do not require its unfinished UI or edit overlapping modules concurrently.

## Evidence and boundaries

Compare no-rest baseline against adopted penalties across 1/2/3+identity rosters and race cadence, checking strategy dominance, reward/income, repeat feasibility and interaction with strongest roster/soft recovery. Current slice has only two races, so use honest engine-generated fixtures for longer histories; don't claim three-race rotation observed in current story. Preserve valid historical saves via proposed migration/default, no fabricated past race/display events. Test commit/cancel/reload/duplicate replay/terminal exits, penalty progression after other identities race, trial consumed once and Receipt evidence of actual available/displayed options/actions/effects. Browser-inspect real selection and return paths at desktop/narrow with reduced motion; coordinator owns browser turns.

No unapproved fatigue-obscuring text/click targets, new in-race choices, odds/pity/cost changes, extra race schedule, set bonuses, paid rest or deployment. Production changes after Plan13 semantics/Plan20 source handoff and approved file ownership only. Commit scoped work/final report with reviewer declaration; no packet status changes or push.
