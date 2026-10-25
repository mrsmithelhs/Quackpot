---
id: plan-17
title: Down exchange and whole-wallet validation
status: draft
depends_on: [plan-01, plan-03, plan-12]
gate: "Owner reviews the 3/6 Down calibration consequences and selects unresolved ticket/item rules before production integration."
superseded_by: null
resolution: null
summary: >-
  Validate owner-selected Down prices and odd-bundle examples using actual
  duplicate payouts, pity rules and whole-wallet balances before shop integration.
---
# Plan 17: Down exchange and whole-wallet validation

**Date:** 2026-10-25. **Type:** bounded investigation/model evidence. **Owner/model:** one investigator; owner rules gate. **Mutation:** proposal/evidence first, isolated headless checks after a bounded mechanism outline is approved. **Expected artifacts:** `reports/development/plan-17-down-exchange-and-wallet-validation/proposal.md`, small reproducible trace/results table and `progress.md`.

## Goal and authority

The Plan 12 owner interview selects prices of 3 Down for a minor temporary speed item and 6 Down for a single-pull ticket, plus the 1750 odd-bundle example. These choices should produce usable but lossy recycling. Existing Plan 01 evidence did not model this exact exchange. Read `AGENTS.md`, canonical design and owner triage, DECISION-008, `reports/orchestration/plan-12-owner-integration.md`, Plan 01 evidence limits and actual game/simulation draw/Down code. Run `check plan-17`; stop if blocked. Own this report folder and, only after the approved bounded outline, a disjoint scenario script/tests. No production rules, historical evidence regeneration, game UI, packet status or arbitrary repricing.

## Bounded work

1. Reconcile current six-identity probabilities and tier-weighted 1/5/20 Down payouts. Report opening duplicate-card distribution separately from Down; give probabilities of reaching 3 and 6 and representative low/median/high/windfall traces. Keep current small-roster evidence separate from a future larger roster. Do not force a convenient opening or claim the static fixture is typical.
2. Propose the unresolved rules needed to test ticket recycling: whether ticket draws award Down, advance pity, carry across banners and stack with other rewards; when a ticket is redeemed and logged; and how an unused bank is accounted for. Show alternatives where these change predictions and obtain owner selection before assuming a production rule. Separate acquisition cost in Down from gem spend/free promotional draws in Receipt accounting.
3. With the selected rules, test finite starting banks, empty/partial/full ownership, base and pity-adjusted windows and high-rarity payout bursts. Report recycling length/survival and net value with truncation/censoring visible. Do not call a long run infinite from a guard limit or call a finite mean proof that no profitable/self-funding case exists. Preserve no-per-variant balancing and outcome RNG independence.
4. Propose the 3-Down item's exact small effect/duration/stacking and comparison to a ticket. A temporary speed item must map to actual race resolution and presentation; test whether the benefit is observable without inventing winning guarantees. Do not adopt the wireframe's sample +0.5%/one-race value by implication.
5. Recalculate the 1750/1600 and starter/160 examples using actual wallet balances and the intended purchase point, including prior race rewards and Down-ticket use. Keep bundle-only arithmetic separate. Identify which paths really leave a shortfall and which already allow another pull.

## Return and gate

Provide a small recommendation with assumptions, counterexamples, unresolved choices and exact reproducible traces; no broad whole-game balancing sweep. Keep owner prices as requested targets; if consequences conflict with lossiness/playability, return the specific conflict and options to the owner. Do not silently reprice or change rarity/pity/roster. No source data or student exports. Commit scoped artifacts and final progress/consultation declaration, never push or set status. A separately bounded integration follows approved rules/evidence.
