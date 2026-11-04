# Ability concept discussion — owner review

2026-11-03. The owner pauses the Common-only progression study and asks for a bounded rarity and ability-combination comparison, beginning with at least six additional ability concepts and owner review. This is a concept menu for discussion, not a selected catalog, implementation, numerical rule or authority to run an experiment. Existing Burst/Guard study isolates one choice; no lifetime ability limit is implied. No player reflex timing is required: activation is seeded and automatic under explainable conditions.

## Owner's four examples, restated for review

| Concept | What the duck does | Distinct trade-off and open contract |
| --- | --- | --- |
| **Wide Flap** | Pushes nearby ducks aside, changing their angles like collision deflection. | The flap itself causes no injury; shifted paths could lead to real subsequent collisions. Define affected area, simultaneous participants, actual contact evidence and recovery; do not treat the push as an injury-causing collision. |
| **Dive** | Goes underwater for a period, moves more slowly and is immune to collisions until resurfacing. | Gives up speed for protection. Define submergence/resurfacing boundaries, interaction with airborne ducks, and what happens if the resurfacing location overlaps another duck. |
| **Flap Ahead** | Flies over other ducks briefly, colliding only with ducks also in midair, and slows on landing. | Gains an aerial passing opportunity but pays a landing slowdown. This could become the actual brief Burst rather than the prior whole-race rating proxy. Define landing overlap, air-to-air contact and honest crossing. |
| **Draft** | Follows a faster duck temporarily, potentially exceeding the usual speed limit, with less collision chance while drafting. | Requires an eligible nearby leader; the benefit can end when that leader changes path or finishes. Define gaps, contact reduction, physical speed-cap exception and what happens when the lead duck is unavailable. |

## Six further concepts for the owner to consider

| Concept | What it contributes | Cost or limiting condition |
| --- | --- | --- |
| **Straight Shooter** | Briefly resists being turned away from its intended lane after a duck-to-duck bump. | Helps preserve a line, not prevent injury or erase momentum; it may miss a passing opportunity while recentering. |
| **Bounce** | A duck may automatically prepare to bounce over traffic just before a predicted imminent collision. | The temporary state could increase its willingness to stay near other ducks. Define prediction uncertainty, takeoff, actual contact/injury eligibility, airborne interaction and safe landing. |
| **Quick Recovery** | Shortens the time needed to return toward the lane after a real collision deflection. | Does not prevent contact or persistent injury; recovery still follows actual movement and cannot teleport the duck. |
| **Crowd Surge** (working name) | Automatically accelerates the duck for a short period when it is in a crowd. | Does not require Draft; define what counts as a crowd, available path and how additional speed affects actual collision risk. |
| **Steady Nerves** | Once per race, reduces the size of a self-generated wobble when one actually occurs. | Has no effect if the relevant wobble does not occur; it does not protect against another duck's collision. |
| **Wake Break** | When closely followed, creates a brief wake that slightly reduces a trailing duck's acceleration. | Depends on an actual nearby follower and does not directly injure or move it; it could make close racing harder for both ducks to read. |

These names, conditions, durations, speeds, odds, collision geometry and interaction priorities are examples, not chosen rules. Each has to respect actual race events, independent automatic activation, honest individual finish crossings, accessible presentation and truthful saved evidence. Some concepts overlap in purpose and may not all deserve a place in a final catalog.

## Example combinations

- **Wide Flap + Bounce:** a duck can disrupt nearby paths and may prepare to bounce when a collision looks imminent. Define what actually happens and keep the push itself non-injuring.
- **Draft + Crowd Surge:** a duck can follow a faster rival and independently accelerate in a crowd. Their speed and duration effects must not silently stack into an unlimited speed loop.
- **Dive + Steady Nerves:** one ability trades speed for collision immunity and the other moderates a self-generated wobble. Define whether a wobble can occur while submerged and show only the events that actually happen.

A rarer duck might begin with a small ability, have capacity for a more interesting combination, or gain more development potential and a wider risk spectrum. Those are separate possible rarity axes; the owner has not chosen slot counts, exact rarity mapping, ability loadouts or whether all abilities operate at once. Equal starting base speed does not make starting abilities or extra options powerless. Common ducks need meaningful paths, and combinations must be reachable in a realistic nonspending run.

## Gate and next step

The owner reviews and selects or revises concepts before a bounded comparison is designed. Once that feedback is available, QP Orch reviews a small protocol that compares a few meaningful combinations and Common/rarity paths without testing every pairing. Define activation/overlap and collision ordering, seeded forks, finite opportunity budgets, observed outcomes, controls and resource limits before any runnable experiment. The current Common-only Stage B is paused. No production source, graphics, new art, or simulation run follows from this menu.

## Trigger, presentation and resolver scope notes

Every trigger below is a candidate seeded automatic opportunity once its stated condition exists, not a player reflex action or guarantee. Visible cues and static/reduced-motion equivalents must report only actual events; their design belongs to separate visual work.

| Concept | Candidate opportunity and role | Possible visible cue and modeling scope |
| --- | --- | --- |
| Wide Flap | Nearby entrant on either side; disruptive/offensive. | Wings and nearby path deflection; requires new area-effect selection and path/overlap semantics. |
| Dive | Approaching traffic or contact risk; defensive. | Submerge/resurface state plus a persistent underwater indicator; requires collision layers, immunity timing and safe resurfacing semantics. |
| Flap Ahead | An entrant ahead and a viable path; passing/offensive. | Takeoff, airborne state and landing; requires altitude layers, air-to-air collision and landing semantics. |
| Draft | Faster entrant ahead within a defined gap; positioning. | Visible tether/wake or concise status; requires following/gap behavior, conditional speed-cap exception and collision treatment. |
| Straight Shooter | A real duck contact has deflected this duck; defensive positioning. | Brief straightening cue; modifies subsequent steering recovery and must retain actual contact/injury. |
| Bounce | A predicted imminent collision and a temporary seeded activation opportunity; defensive. | Preparatory cue and duck bouncing over traffic; requires prediction, temporary vertical state, actual contact eligibility and landing/overlap semantics. |
| Quick Recovery | A real collision has started lane recovery; defensive. | Brief recovery cue; modifies the existing recovery controller, never erases the contact. |
| Crowd Surge (working name) | This duck is in a defined crowd and a seeded activation succeeds; offensive. | Brief acceleration accent; requires crowd detection and bounded speed/contact behavior independently of Draft. |
| Steady Nerves | A real self-generated wobble is due; defensive. | Smaller wobble and an accessible factual cue; changes weave magnitude under a seeded opportunity. |
| Wake Break | A trailing entrant is close enough; disruptive. | Local wake and trailing response; requires a new proximity/acceleration effect and clear participant attribution. |

The first four restate the owner's examples; the following six are alternatives for review, not a request to implement a ten-ability catalog. Role, timing, effects, rarity access and any combination remain open. Capacity/starting ability, trained ceiling and per-race risk are separate axes; numerical rarity counts are not selected.


## Owner review — 2026-11-03

Owner replaces Soft Landing with Bounce: an automatically and temporarily activated ability after a collision makes the duck bounce over others instead of into them, reducing pileups and follow-on collisions. The initiating collision remains an actual event; exact injury/vertical/landing ordering is open. Owner replaces Draft-dependent Slipstream Release with an independently triggered crowd-acceleration ability (working name Crowd Surge). The owner says the other ideas are good; that feedback is not selection of exact mechanics, rarity assignments, odds or production implementation. Owner notes every ability needs an animation, either on the duck and/or in surrounding effects like wake and draft; orchestration is asked to route this work to Plan57 or a future plan. Accessibility, static/reduced motion and factual cue evidence remain part of later design.

## Owner follow-up: anticipatory Bounce

The owner suggests activating Bounce just before an imminent collision, making preparation visible and potentially changing the duck's risk tolerance while the ability is active. This revises the earlier after-contact concept for further investigation, not an adopted timing threshold or numerical rule. A prediction can be wrong: activation or a near approach is not proof a collision would otherwise have occurred. Define an automatic seeded opportunity and the visible preparatory cue, prediction horizon/geometry, when altitude changes collision eligibility, interruption/failed activation, landing and actual injury evidence. If a contact occurs before immunity begins, record its actual consequences; if Bounce activates in time there may be no initiating contact. Candidate risk-tolerance changes apply only while active, should interact explicitly with crowd advice and risk profile, and must be measured rather than assumed. Never require reflex input, fabricate an avoided collision, or infer that all activations prevent injury. Preserve the earlier after-contact study proposals as historical and superseded for the next Bounce contract.

