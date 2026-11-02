# Experience comparison and owner selection

## Two arrangements considered

Sonnet's recovered proposal compares distributing actions across rooms with keeping phase actions at the desk. The proposals are not production behavior. The owner selected the first direction's bedroom component on 2026-11-01: **make the existing bedroom available during ordinary Evening and use the bed to turn in**. The owner did not select a new clock, calendar, lamp action, artwork, new phase rule, or a location for social/gig controls.

| | Bedroom direction — selected for focused preview | Desk direction — comparison |
| --- | --- | --- |
| Turning in | Navigate to existing bedroom and inspect bed; confirm the actual end-of-phase action. | Inspect desk lamp and choose turn-in there. |
| Strength | Bed has a familiar association with sleep; uses the existing room and gives it an ordinary purpose. | Avoids an extra room transition and does not require ordinary bedroom routing. |
| Cost / question | Needs a future change to `availablePlaces` and related route/focus behavior. Recovery at the same bed must remain distinct and take precedence when required. | The desk already has the duck, keys and phone; the lamp is a less direct metaphor and could compete for space. |
| Continued play | Still under study. Free browsing remains free; the actual next pull/race must retain its existing warning, atomic transition and fatigue semantics. | Same existing rules. A lamp-based Stay up action is a proposal, not a selected rule. |

## Corrected illustrative Evening trace

1. Dinner is explicitly purchased or skipped; inspecting does not pay or skip.
2. The player chooses to sit with the physical duck and completes the scene. This uses the Evening anchor and restores up to 5 HP under current applicable versioned behavior.
3. The player returns to the phone and browses for free. A subsequent pull or race is **further active play**: the existing confirmation explains the next-phase consequences and the confirmed operation can enter Late Night and commit the chosen action atomically. There is no additional first Evening session after the duck activity.
4. The player goes to the bedroom and inspects the bed. A turn-in confirmation would advance according to the existing phase and guards; in Late Night it finishes that phase. A preview cannot prove the production transition, save or logging behavior.

An alternative legitimate path is to turn in without further play. The current separate Stay up control can enter Late Night without itself setting fatigue; a Late Night pull/race sets pending fatigue. Whether that separate control is useful and where it belongs remains an owner choice; eliminating it or moving it must not silently remove genuine access or retune rules.

## Integration boundary (not authorization)

- **Selected:** Bedroom as ordinary Evening destination, bed as turn-in affordance; inspect and explicit action remain distinct. The current prototype is illustrative and is not yet owner-accepted as an implementation.
- **Preserved context:** Existing meals, keys/work and wage completion, fridge reminder/cadence, rent guards and decisions, sales, phone browsing/commit, legacy/replay behavior, global Save/Settings/Uninstall, Receipt and current life resolver.
- **Placeholders:** Preview shell, scenario selector, sample prompts and synthetic states. Preview's buttons do not invoke the game; bedroom room navigation is proposed. No preview HUD/controller/engine may be ported as production authority.
- **Deferred:** Stay up placement, exact bed wording and unavailable state, social/gig UI, supported popover/docked layout, any art changes and production integration. Plan46 owns social rules and integration; its current direction uses existing Evening anchors, free reading/contact, and an explicit conflict flow. Placement here is hypothetical.

Likely later seams are `src/ui/life/life-routing.mjs` for bedroom availability; `src/ui/life/life-view.js` for bed target, focus and current footer; and `src/main.js` for the existing phase callback, with engine/phone/Receipt/save neighbors reviewed for semantics and replay. This is a proposal for root's later integration review, not a file-ownership grant. Root must inspect actual before/after production evidence and relevant neighbors, plus targeted action/reload checks, before owner-ready delivery.
