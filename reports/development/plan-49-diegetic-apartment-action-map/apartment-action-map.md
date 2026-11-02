# Apartment-wide working action map

This is a study proposal, not a production specification. The owner selected bedroom access in ordinary Evening and the bed for turning in, with a left-shifted shelf in the report preview. Other proposed placements remain open. The source inventory is pinned to `9d6093a4f61c2a4ccf1b3b6c82c6d727ab8c6c86`; Plan46 is concurrently developing its own social interface, which this map cannot adopt or change by inference.

| Player intent | Existing or proposed home | What remains explicit | Status |
| --- | --- | --- | --- |
| Eat or skip breakfast/dinner | Kitchen plate | Inspect before buying or skipping; disclose cost or health consequence; preserve meal/obligation guards. | Existing. |
| Check/pay rent | Kitchen notice | Inspect letter; disclose amount, deadline and cash result; explicitly pay or use the currently allowed due-time alternatives. An unpaid balance is not by itself a universal block. | Existing. |
| Call Mom | Fridge note | Scheduled evening and other existing guards; inactive note has no misleading chip; confirm and complete scene separately. | Existing selected presentation. |
| Leave for scheduled work | Desk keys | Preview pay on completed shift; confirm leaving; preserve first-shift and session-end distinctions. | Existing selected presentation. |
| Work message/overtime and complete work | Desk phone and work story | Preserve phone context, completion before payment and disclosed health effects; do not replace actual phone entry with a generic chooser. | Existing; exact coexistence with other phone actions needs a real-route neighbor check. |
| Sit with physical duck | Desk companion | Explicit evening activity, then scene completion; up to 5 HP for current version; distinguish free inspection from commitment. | Existing; other-room navigation shortcut is not a separate activity. |
| Sell furniture | Living-room couch or TV | Show proceeds and removal, confirm or keep; preserve availability and sold-state behavior. | Existing. Ren-specific established commitments may later require Plan46's conflict flow. |
| Browse or play Quackpot | Desk phone; app remains inside phone | Browsing/re-entry is free; actual pulls/races are guarded and use existing confirmations and transaction path. | Existing; must not be replaced by study phone copy. |
| Recover when required | Bedroom bed | Separate recovery heading and confirmation; its actual phase/obligation semantics remain authoritative. | Existing recovery route. |
| Turn in / finish Late Night | Bedroom bed | Inspection then explicit phase transition; applicable commitments/obligations remain; bedroom route must be deliberately added in a future integration. | Owner-selected study direction; not production. |
| Stay up without playing | Desk lamp **or** bed choices in two preview candidates | Explicit Late Night entry, no play/fatigue merely from entering; preserve guards and accessible path. Further confirmed phone action remains a separate existing path. | Owner choice open. Either proposal moves access from a footer available across rooms, so changed reach must be considered. |
| Continue an afternoon or conclude a run | Current plain controls; do not assign an arbitrary object solely to disguise them. | Preserve missed-shift warning, finish confirmation and existing availability. Exact placement, deduplication and equivalent routes need owner/technical review. | Unresolved; not silently removed. |
| Navigate rooms / use Save, Settings, Uninstall | Navigation and global shell | Room travel and reading cost no life time; immediate Uninstall stays available. | Preserved context, not a diegetic action target. |
| Ren messages, visits, repair | Plan46 owns active source integration; phone/door are its provisional surfaces. | Free reading/contact, dinner independent and existing selected Evening anchor/conflict rules; any shared seam must be reconciled through root. | Context only; no Plan49 rule or source authority. |
| Future gigs | No allocated target. | Draft proposal only; no schedule, effect, artwork or price implied. | Deferred. |

The consultant's proposed common docked panel and removal of persistent phase controls are experience ideas, not blanket acceptance. In particular, a changed location can increase navigation burden or make an action harder to discover even if the underlying life rule is preserved. Retire a control only after the owner chooses the experience and a later integration verifies equivalent routes, focus and guards.

## Remaining phase controls: source-checked implications

At the pinned baseline, `life-view.js` shows **Continue to evening** during `life_work`, and `main.js` warns before advancing an employed player who has not completed that day's scheduled shift. The resolver records a missed shift on this transition and can end employment after repeated misses. This is therefore a real decision with consequences, not merely a dismiss button. A future location must preserve that warning and give an unemployed player a sensible way onward. Morning's **Continue to afternoon** is a distinct conditional route for unemployed players and specified historical tutorial states; it must not disappear in a visual cleanup.

**Finish run** appears in `life_work`/`life_evening` from Day 4 at this baseline and asks for confirmation before opening the Receipt. It is an explicit metagame end control with different meaning from immediate Uninstall; don't describe it as available on every screen or hide it behind a fictional object without owner agreement. A compact operational control may be more honest than inventing a clock, lamp or calendar metaphor. Exact placement remains a proposal for discussion, not a decision or permission to change production.

Two presentation directions to discuss after the night comparison:

1. **Small day/phase line:** Keep the applicable continuation as an explicit text action alongside the phase indicator in every available apartment room. Disclose a missed shift before confirmation. Keep Finish run visually separate as an operational end action when eligible.
2. **Room-specific transition:** Place an explicit continuation in one chosen apartment location, reached through free room navigation. This might reduce repeated controls, but adds travel and needs a convincing stable support that still exists after sales. The current art does not by itself establish such an object or make the affordance obvious; inventing a clock or calendar is not required or approved.

The first direction is the lead's provisional recommendation because it keeps the real decision legible without requiring a questionable object metaphor. It is not an owner selection. Neither direction proposes eliminating the morning legacy/unemployed continuation, altering work or firing rules, or making Uninstall less immediate.
