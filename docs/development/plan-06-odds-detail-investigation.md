---
id: plan-06
title: Optional odds-detail investigation
status: draft
depends_on: []
gate: "Owner approves the proposed optional detail and wording before implementation."
superseded_by: null
resolution: null
summary: >-
  Specify candidate information for an optional odds-detail button without
  hiding the Receipt's actual pity-adjusted pre-draw odds.
---
# Plan 06: Optional odds-detail investigation

## Packet Metadata

- Packet id: `plan-06`
- Packet title: Optional odds-detail investigation
- Status: (see frontmatter)
- Owner/model: investigator; orchestrator and owner review
- Date: 2026-10-23
- Packet type: investigation
- Mutation level: docs-only
- Approval gate: owner choice on content, placement and wording
- Depends on: none
- Expected artifacts: `reports/development/plan-06-odds-detail-investigation/progress.md`

## Goal

Propose what a player gains by opening optional odds detail while keeping the Receipt's conditional pre-draw odds accurate and visible.

## Non-goals

No UI implementation, changed rarity/pity value, invented guarantee rule, or hiding of odds behind the optional control.

## Depends on

None. Plan 01 may supply numerical examples; if its results are unavailable, use labelled hypothetical examples and defer final numbers.

## Why this packet exists

The owner selected an optional button but did not choose its contents. Ambiguous wording could make a 2% base rate appear to describe a pity-adjusted draw or obscure banner carry/reset.

## Authority and contracts

Read `AGENTS.md`, `docs/decision-log.md`, `docs/development/README.md`, `docs/founding/design.md` (Pity, Odds navigation, Receipt), and owner triage D3/T6/T7. Preserve O1's three registers and actual conditional pre-draw odds on every applicable Receipt entry.

## Investigation plan

**Owner interview integration, 2026-10-25:** DECISION-008 accepts visible odds and progressive, on-demand necessary context. Keep mathematical/manipulation-analysis helper panels out of live gacha; critical reflection belongs to the Receipt/debrief. Necessary conditional odds, prices and purchase terms remain accessible. This boundary narrows presentation, but does not select the optional button's exact contents or waive its owner gate.

1. Run `check plan-06`. Write rival hypotheses with falsifiers: base rates plus pity schedule suffice; a per-next-draw explanation improves understanding; or the detail adds confusion. Design a comparison where predictions differ.
2. Draft two concise button-content options with example states before soft pity, during soft pity, at a guarantee, and around a banner transition. Label unresolved carry/reset policy rather than choosing one.
3. Specify what remains visible without a click, button label/disclosure behavior for keyboard and screen reader, and events needed to distinguish availability, opening, and displayed content on the Receipt.
4. Recommend one option with trade-offs and a short comprehension check for owner review. Leave all content unadopted until the owner chooses.

## Validation Checklist

- [ ] Examples separate base rarity, current conditional odds and unresolved banner policy.
- [ ] Receipt odds stay visible regardless of button use; event evidence supports any disclosure claim.
- [ ] Rival hypotheses, falsifiers and a discriminating check are documented.
- [ ] No gameplay or canonical design was changed.
- [ ] `reports/development/plan-06-odds-detail-investigation/progress.md` exists; no unrelated files changed.

## Stop Conditions and report

Stop if a proposal depends on a pity rule the owner has not approved. Do not set status, edit orchestrator notes, or call a recommendation decided. Report exact text proposals and owner choices needed. Commit the scoped report; never push.
