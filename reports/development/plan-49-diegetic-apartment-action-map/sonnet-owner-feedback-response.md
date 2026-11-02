# Apartment arrangement: corrected map and Stay up options

## Corrections to my earlier proposal
- **Phone sessions:** I described a first Evening pull that commits an Evening session after the anchor. That was wrong. Once Sit with Duck has used the Evening anchor, the next pull or race is already further active play. Its existing confirmation can atomically enter Late Night and commit the action.
- **Late Night entry:** Entering Late Night is a separate action that stays available and applies no fatigue. Fatigue is set for the next morning only when a pull or race is played in Late Night.
- **Rent:** Unpaid rent does not universally block transitions. The due and overdue guards differ, and I won't paraphrase them. Any blocked transition should quote its own existing guard.
- **Art and ducks:** The historical captures did not show missing art, duplicated ducks, or a need for a clock or calendar. I withdraw those claims and the clock/calendar suggestions.
- **Owner decisions:** Nothing I suggested earlier counts as an owner decision. The decisions on record are ordinary Evening bedroom access, the bed as the place to turn in, and the shelf preview as an experience selection. The shelf preview is not production authorization.

## Apartment-wide map

**Shared handling**
- **Navigation:** Room navigation, reading and browsing are free, and Save, Settings and Uninstall stay global.
- **Sequence:** Inspect only reads. Confirm is one button that states the consequence. Dismiss is "Not now", Esc, or tapping away, and it changes nothing.
- **Unavailable objects:** They look like ordinary furniture, with no halo and no chip. A blocked transition is the only exception, because it explains itself in the existing guard's words.

| Intent | Place and object | Guard, confirmation and consequence (all existing) |
|---|---|---|
| Eat or skip | Kitchen, plate | Breakfast or dinner, buy or skip, with cost and health disclosed. |
| Pay rent | Kitchen, rent notice | Amount and deadline are shown and payment is explicit. The due and overdue guards stay as they are. |
| Mom's note | Kitchen, fridge note | Active only on scheduled evenings after dinner, if other guards allow. No target while inactive. A call confirmation, then scene completion, restores up to 5 HP. |
| Go to work | Desk, keys and tray | Available after breakfast. The shift's wage is paid on completion, not departure. Not moved. |
| Phone | Desk, phone | Routes to the invitation, work or Quackpot. Browsing and re-entry are free. |
| Sit quietly | Desk, the physical duck | Sits during an eligible Evening and uses the Evening anchor. Up to 5 HP on completion. The duck is never animated or sold. |
| Sell | Living room, couch and TV | Only after entering the game and if eligible and unsold. Proceeds and removal are disclosed. |
| Recover | Bedroom, bed | A distinct guarded action that uses the phase. Own heading, own confirm. |
| Turn in | Bedroom, bed | Needs the ordinary Evening route the owner chose. In Late Night the same row reads "Finish Late Night". An unworked scheduled shift gets the existing explicit warning. Obligations and commitments block as they do now. |
| Stay up | See the two candidates below | Evening only. |
| Continue to evening | One plain text control | See the first awkward metaphor note below. |
| Finish run (Day 4 on) | One plain text control | Keeps its existing confirmation. |

**Awkward metaphors and art limits**
- **Continue to evening and Finish run:** No existing apartment object clearly means either. I'd keep them as plain text on one small day line that shows only what is currently eligible, rather than invent an object. A new object would be new art, outside this study.
- **Footer "Go to work":** It duplicates the keys. Retiring it is only equivalent if it shares the keys' guard. If the footer ever offers work where the keys don't, removing it would remove access and is outside this study.
- **Fridge:** The rent notice and the Call Mom note sit very close on the fridge in the kitchen capture. They need separate, non-overlapping hit areas and a fixed keyboard order.
- **Couch:** The capture shows the duck on the couch arm. I can't tell how the art handles that after a sale.
- **Ducks:** I don't know whether the captured ducks in different rooms are the same companion. The sit target remains the desk duck per the baseline.

## Two ways to make Stay up discoverable

Both need the ordinary Evening bedroom route. Neither changes any rule.

### Candidate A: the desk lamp, beside the phone
- **Sees:** The existing desk lamp, with the usual halo only in Evening.
- **Inspects:** "Leave the lamp on and stay up for Late Night. Nothing is used until you play."
- **Confirms:** "Stay up". Late Night begins and no fatigue is applied.
- **Dismisses:** "Not yet", and nothing changes.
- **Later play:** A pull or race in Late Night sets next-morning fatigue. I don't know whether Late Night play asks again, and I'm not claiming it does.
- **Phone:** Its direct entry is untouched.
- **Nonvisual path:** The desk's "Things here" list reads "Desk lamp: stay up for Late Night (Evening only)". Enter reads the note, Enter on the button commits, and Esc dismisses. The live region says "Late Night begun. Tiredness applies only if you play tonight." The wording is a suggestion and should follow the game's own text.
- **Unavailable:** Outside Evening, and once Late Night has begun, the lamp is ordinary furniture with no halo.
- **Tradeoffs:**
  - Gain: It sits where Late Night play happens, and it uses existing art.
  - Cost: The desk already holds keys, the duck and the phone, and the lamp is a larger, less obvious target.
  - Cost: Night choices are split, with the bed in one room and the lamp in another.
  - Cost: Treating a lamp as a button is a mild metaphor stretch.
- **Reach:** Stay up leaves the footer and is no longer reachable from every room. That is a change in reach, not a rule change. Room navigation is free.

### Candidate B: a night-choices note on the bed
- **Sees:** The bed target covers the visible bed, as the owner asked.
- **Inspects:** A docked note lists only the rows that currently apply:
  - "Turn in for the night" (Evening)
  - "Stay up for Late Night" (Evening)
  - "Finish Late Night" (Late Night)
- **Recovery:** If recovery is pending, "Recover" appears as a separate section with its own heading and its own confirm. It must never sit beside or look like Turn in.
- **Confirms:** Each row has its own confirmation.
- **Dismisses:** Esc or "Not now" changes nothing.
- **Phone:** Its direct entry is untouched.
- **Nonvisual path:** The bedroom list has one entry, "Bed". Opening it reads the rows in order, so there is one decision point for the night.
- **Unavailable:** Rows that don't apply are absent from the note. The bed stays a normal, inspectable object.
- **Tradeoffs:**
  - Gain: There is no new target, and all night decisions live in one place.
  - Cost: Going to the bed to say you aren't sleeping is an awkward metaphor.
  - Cost: Stay up becomes invisible until the player opens the bed, so it is less discoverable than a lamp.
  - Cost: Several rows on one object raise the risk of mistaken taps.
  - Cost: I haven't verified whether recovery and turn-in can be eligible together, so the source should be checked before this note is built.
- **Reach:** Like A, Stay up is reachable only from the bedroom.

I considered a third option, adding a "stay up first" row to the phone note. I don't recommend it, because it blurs free browsing with something that changes phase.

## The existing warned further-action path
After Sit with Duck has used the Evening anchor, the player browses the phone freely, and browsing commits nothing. The next pull or race shows the existing confirmation. Confirming atomically enters Late Night and commits that action, so next-morning fatigue follows because play occurred in Late Night. Dismissing leaves the player in Evening with nothing changed. This path is separate from Stay up, and it stays whichever candidate is chosen.

## Corrected traces

**Trace 1: anchor used, then further play**
1. **Dinner:** The player buys dinner at the plate.
2. **Sit:** The player sits with the duck, which uses the Evening anchor. Health is restored, up to 5.
3. **Browse:** The player browses the phone freely. Nothing is committed.
4. **Pull:** The player pulls, and the existing confirmation appears.
5. **Confirm:** Confirming enters Late Night and commits that pull.
6. **Turn in:** At the bed the row reads "Finish Late Night". Confirming advances to morning with fatigue applying.
7. **Guards:** An unworked-shift warning or an obligation block appears only if one applies.

**Trace 2: staying up without playing**
1. **Dinner and sit:** Same as steps 1 and 2 above.
2. **Stay up:** The player stays up via A's lamp or B's bed row. Late Night begins, with no fatigue and no play.
3. **Browse:** The player browses the phone freely.
4. **Finish:** At the bed the player confirms "Finish Late Night". Morning follows with no fatigue, because nothing was pulled.
5. **Alternative:** If the player pulls or races instead, fatigue is set for the next morning.

## Ren and gig placeholders (not designed)
Nothing is reserved, no targets appear, and no schedule or consequences are implied. Any future object, place or rule is for the owner to define, and it would be a separate study.

## Truly unresolved owner decisions
1. Choose Stay up in A (desk lamp) or B (bed note), or reject both.
2. Accept plain text on one day line for Continue to evening and Finish run, or want objects, which would be new art outside this study.
3. Approve retiring the footer "Go to work" only after the guard parity check.
4. Decide whether the shelf preview goes to production, which is a separate decision.

I'd lean toward A, since a visible lamp is easier to discover and keeps the bed to sleep and recovery only. That is a recommendation, not a decision.