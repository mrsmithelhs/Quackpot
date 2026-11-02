# Experience comparison and owner selection

## Two arrangements considered

Sonnet's recovered proposal compares distributing actions across rooms with keeping phase actions at the desk. The proposals are not production behavior. On 2026-11-01 the owner selected ordinary Evening bedroom access and the bed as the direct **Turn in / Not now** target. After reviewing a later A/B comparison, the owner clarified that there should be no standalone “Stay up” action: the player should choose an activity, such as a Quackpot pull or race, that causes them to stay up. This is selected experience/policy direction for a future integration, not implemented behavior or production authorization. The owner did not select a new clock, calendar, lamp action, artwork, or a location for social/gig controls.

| | Bedroom direction — selected for focused preview | Desk direction — comparison |
| --- | --- | --- |
| Turning in | Navigate to existing bedroom and inspect bed; confirm the actual end-of-phase action. | Inspect desk lamp and choose turn-in there. |
| Strength | Bed has a familiar association with sleep; uses the existing room and gives it an ordinary purpose. | Avoids an extra room transition and does not require ordinary bedroom routing. |
| Cost / question | Needs a future change to `availablePlaces` and related route/focus behavior. Recovery at the same bed must remain distinct and take precedence when required. | The desk already has the duck, keys and phone; the lamp is a less direct metaphor and could compete for space. |
| Continued play | Owner subsequently selected an actual activity, such as phone play, to cause staying up; free browsing and the existing warned atomic pull/race remain distinct. | The desk-lamp Stay up proposal was not selected. |

## Corrected illustrative Evening trace

1. Dinner is explicitly purchased or skipped; inspecting does not pay or skip.
2. The player chooses to sit with the physical duck and completes the scene. This uses the Evening anchor and restores up to 5 HP under current applicable versioned behavior.
3. The player returns to the phone and browses for free. A subsequent pull or race is **further active play**: the existing confirmation explains the next-phase consequences and the confirmed operation can enter Late Night and commit the chosen action atomically. There is no additional first Evening session after the duck activity.
4. The player goes to the bedroom and inspects the bed. A turn-in confirmation would advance according to the existing phase and guards; in Late Night it finishes that phase. A preview cannot prove the production transition, save or logging behavior.

An alternative legitimate path is to turn in without further play. At baseline, a separate Stay up control can enter Late Night without itself setting fatigue; a Late Night pull/race sets pending fatigue. **The owner now rejects that standalone non-action.** Removing it intentionally removes the current ability to enter Late Night without choosing an activity. This is a semantic/access change, not a mere visual relocation. Existing warned phone play must remain available; future non-gacha late activities and their exact phase behavior are deferred. Do not implement that difference by inference or treat old saves already in Late Night as invalid.

## Integration boundary (not authorization)

- **Selected:** Bedroom as ordinary Evening destination, bed as direct turn-in affordance with Turn in/Not now, and activity-led staying up rather than standalone phase advance. The current prototype is illustrative and is not yet owner-accepted as an implementation.
- **Preserved context:** Existing meals, keys/work and wage completion, fridge reminder/cadence, rent guards and decisions, sales, phone browsing/commit, legacy/replay behavior, global Save/Settings/Uninstall, Receipt and current life resolver.
- **Placeholders:** Preview shell, scenario selector, sample prompts and synthetic states. Preview's buttons do not invoke the game; bedroom room navigation is proposed. No preview HUD/controller/engine may be ported as production authority.
- **Deferred:** Exact unavailable treatment, how any future non-gacha activities interact with Late Night, social/gig UI, supported popover/docked layout, any art changes and production integration. Plan46 owns social rules and integration; its current direction uses existing Evening anchors, free reading/contact, and an explicit conflict flow. Placement here is hypothetical.

Likely later seams are `src/ui/life/life-routing.mjs` for bedroom availability; `src/ui/life/life-view.js` for bed target, focus and current footer; and `src/main.js` for the existing phase callback, with engine/phone/Receipt/save neighbors reviewed for semantics and replay. This is a proposal for root's later integration review, not a file-ownership grant. Root must inspect actual before/after production evidence and relevant neighbors, plus targeted action/reload checks, before owner-ready delivery.

The future transaction review must preserve free opening/browsing and re-entry, cancel and failed-pull behavior, and atomic successful next-phase play. No failed or canceled action may consume a phase, create fatigue or silently break a Ren commitment. Preserve pending Late Night/old standalone-entry histories and their replay semantics; any version/dispatch or migration proposal requires root review. These are boundaries to verify, not a claim that a report fixture implements or validates them.
