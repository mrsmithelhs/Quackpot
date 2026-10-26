---
id: plan-17
title: Down exchange and whole-wallet validation
status: delivered
depends_on: [plan-01, plan-03, plan-12]
gate: "Owner reviews the 3/6 Down calibration consequences and selects unresolved ticket/item rules before production integration."
summary: >-
  Validate owner-selected Down prices and odd-bundle examples using actual
  duplicate payouts, pity rules and whole-wallet balances before shop integration.
---
# Plan 17: Down exchange and whole-wallet validation

**Date:** 2026-10-25. **Type:** bounded investigation/model evidence. **Owner/model:** one investigator; owner rules gate. **Mutation:** proposal/evidence first, isolated headless checks after a bounded mechanism outline is approved. **Expected artifacts:** `reports/development/plan-17-down-exchange-and-wallet-validation/proposal.md`, small reproducible trace/results table and `progress.md`. All owned scenario scripts/tests stay within this report folder; no shared `sim/`, `src/`, package or other packet changes. Existing modules are read-only inputs. This disjoint scope permits investigation alongside Plan 04 Repair 02 and Plan 14.

## Goal and authority

**Repair 01 acceptance, 2026-10-25:** `7325541` passes bounded technical review (`review-02.md`): seven tests, independent mass/censor checks and complete runner reproduction (excluding timestamp). Prior evidence blockers are resolved; no further implementer repair. Recommend owner closure with scenario/roster/finite-horizon and lifecycle/Receipt limits explicit. Packet remains delivered pending final owner acceptance; no production integration is adopted.

**Scenario delivery review, 2026-10-25:** `5df68de` returned for bounded Repair 01 (`review-01.md`/`repair-01.md`). Five tests pass and main affordability/race/expected-draw values reproduce, but terminal mass is discarded, capped live runs are counted as terminal and empty/partial dynamic coverage is missing. Correct within report folder; no new pricing/rule gate or production implementation. Lifecycle/Receipt statements must remain explicit integration obligations. Packet delivered pending repair dispatch.

**Outline review, 2026-10-25:** Report-folder `preflight-review-01.md` recommends T1 A / T2 A (including Legendary reset) / T3 A / I1 for owner selection as scenario inputs. These recommendations are not adopted rules. Opening distribution is independently reproduced; pooled-bank proof, some traces/race claims and Receipt wording need correction in the next evidence pass. Use the review and independent `preflight-checks-01.mjs`; no production or scenario gate is passed by this annotation. Packet remains in-progress at the owner mechanism gate.

The Plan 12 owner interview selects prices of 3 Down for a minor temporary speed item and 6 Down for a single-pull ticket, plus the 1750 odd-bundle example. These choices should produce usable but lossy recycling. Existing Plan 01 evidence did not model this exact exchange. Read `AGENTS.md`, canonical design and owner triage, DECISION-008, `reports/orchestration/plan-12-owner-integration.md`, Plan 01 evidence limits and actual game/simulation draw/Down code. Run `check plan-17`; stop if blocked. Own this report folder and, only after the approved bounded outline, a disjoint scenario script/tests. No production rules, historical evidence regeneration, game UI, packet status or arbitrary repricing.

## Bounded work

**Owner clarification, 2026-10-25:** Preserve the smaller ticket price as the target. The intended experience includes occasional recoveries and a feeling of almost catching up, not a shop dismissed as unusable. Include representative windfall/recovery trajectories and how often a bank affords another ticket alongside long-run lossiness; don't equate transient recovery with a profitable loop or claim a modeled path establishes a player's feelings. Outcomes remain seeded and unrigged. See DECISION-009.

1. Reconcile current six-identity probabilities and tier-weighted 1/5/20 Down payouts. Report opening duplicate-card distribution separately from Down; give probabilities of reaching 3 and 6 and representative low/median/high/windfall traces. Keep current small-roster evidence separate from a future larger roster. Do not force a convenient opening or claim the static fixture is typical.
2. Propose the unresolved rules needed to test ticket recycling: whether ticket draws award Down, advance pity, carry across banners and stack with other rewards; when a ticket is redeemed and logged; and how an unused bank is accounted for. Show alternatives where these change predictions and obtain owner selection before assuming a production rule. Separate acquisition cost in Down from gem spend/free promotional draws in Receipt accounting.
3. With the selected rules, test finite starting banks, empty/partial/full ownership, base and pity-adjusted windows and high-rarity payout bursts. Report recycling length/survival and net value with truncation/censoring visible. Do not call a long run infinite from a guard limit or call a finite mean proof that no profitable/self-funding case exists. Preserve no-per-variant balancing and outcome RNG independence.
4. Propose the 3-Down item's exact small effect/duration/stacking and comparison to a ticket. A temporary speed item must map to actual race resolution and presentation; test whether the benefit is observable without inventing winning guarantees. Do not adopt the wireframe's sample +0.5%/one-race value by implication.
5. Recalculate the 1750/1600 and starter/160 examples using actual wallet balances and the intended purchase point, including prior race rewards and Down-ticket use. Keep bundle-only arithmetic separate. Identify which paths really leave a shortfall and which already allow another pull.

## Return and gate

Provide a small recommendation with assumptions, counterexamples, unresolved choices and exact reproducible traces; no broad whole-game balancing sweep. Keep owner prices as requested targets; if consequences conflict with lossiness/playability, return the specific conflict and options to the owner. Do not silently reprice or change rarity/pity/roster. No source data or student exports. Commit scoped artifacts and final progress/consultation declaration, never push or set status. A separately bounded integration follows approved rules/evidence.
