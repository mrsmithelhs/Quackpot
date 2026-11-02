# Quackpot: Ren, first writing batch (candidates for owner review)

**Fact slots (engine-supplied only):** `{evening}`, `{new_evening}`, `{conflict_activity}`, `{hp_gain}` (shown HP, engine-capped), `{repair_item}`, `{game}`. Everything about Ren's life or objects beyond what was supplied is a candidate, not established.

---

## 1. First introduction and channel opening (day 2, optional, free)

*Note: no time is reserved. The portrait is the door-with-box kit as is.*

**Narration:** Someone down the hall has their door open and a box on their hip.

**Ren:** oh. hi. i'm ren, down the hall. we keep passing each other, figured i'd say hi before it got weird.

**Buttons:** [Nice to meet you] [What's in the box?]

*If "What's in the box?"*
**Ren:** parts. it's always parts. i fix things, build things. mostly fix. if it's broken it's usually a lamp.

*If "Nice to meet you"*
**Ren:** same. i fix and build stuff if you ever need a hand. usually it's a lamp.

**Notice (channel opening):** Ren is now in your Messages. Reading and replying are free and don't use up an Evening.

**Ren (first message):** leave a note anytime. if i've got something i'll leave one back. no rush on either end.

**Buttons:** [Sounds good] [Close]

---

## 2. Invitation and acceptance for {evening}

*Note: the commit moment is the accept button.*

**Message from Ren:** i'm doing {game} on {evening}. you could come by. or not, that's fine too.

**Notice (shown with the invitation):** Visiting Ren would be your Evening activity on {evening}. Dinner is separate.

**Buttons:** [Accept for {evening}] [Not this time] [Another evening]

*After accept:*
**Ren:** cool. {evening}. i'll leave the door unlatched.
**Notice:** Plan set: visit Ren on {evening}.

---

## 3. Ordinary decline and kind response

**Button pressed:** [Not this time]

**Ren:** all good. the offer's not going anywhere. enjoy the evening.

*Variation, if the player also leaves it unanswered and the invite simply lapses: no message. Silence is fine here (see critique).*

---

## 4. One reschedule and acknowledgment

**Button pressed:** [Another evening] → picks `{new_evening}`

**Ren:** works. {new_evening}, then. i'll move my stuff around.

**Notice:** Moved to {new_evening}.

*Note: if the player tries a second move, a disabled option could read "Already moved once. You can still go, or tell Ren you can't."*

---

## 5. Reminder and explicit conflict choice

*Note: the reminder is free and reserves nothing. The conflict only appears if `{conflict_activity}` is chosen for the same Evening.*

**Reminder (Ren):** reminder to self and you: {evening}, my place.

**Conflict notice:** You've got a plan with Ren on {evening}, and you've picked {conflict_activity} for that Evening. You can only do one.

**Buttons:**
- [Tell Ren I can't] — Cancels the plan and sends Ren a note.
- [Continue anyway] — You'll do {conflict_activity}. The plan with Ren stays as is, and Ren won't be told.
- [Go back] — Change your Evening pick.

*Ren's reply if "Tell Ren I can't":*
**Ren:** ok. thanks for telling me. another time.

---

## 6. Door and shared-activity arrival, short completion

**Narration:** Ren answers the door, box already on the shelf.

**Ren:** hey. come in. mind the cable.

*Variation A: game night on the couch (this scene establishes the shared seating that #9 depends on):*
**Ren:** couch is yours for the evening. i'll take the other end. controllers are right there.
**Narration:** You and Ren settle on the couch with {game}.

*Variation B: any other shared activity:*
**Ren:** pull up a stool. bring-your-own-snack policy is strictly enforced.
**Narration:** You and Ren spend the evening on {game}.

*Optional duck beat (the duck never answers):*
**Ren:** *(to the duck)* you're on quality control. try not to quack under pressure.

**Completion:**
**Ren:** good one. same again sometime.
**Notice:** Visit complete. +{hp_gain} HP.

---

## 7. Canceled plan, unmet commitment, later reconnecting opening

**Canceled by telling Ren:** (see #5 reply) — no follow-up needed.

**Unmet, the player never told Ren** (shown at the next opening of the channel):
**Ren:** didn't see you {evening}. i ended up soldering something. no big deal.
**Buttons:** [Sorry, I couldn't] [Okay]

**Ren (if "Sorry, I couldn't"):** noted. door's there.

**Later reconnecting opening** (player opens the channel; Ren doesn't ask for a new plan):
**Ren:** hey. bench is a mess but there's room if you've got something to fix.
**Buttons:** [Ask Ren for a hand] [Just reading]

*Note: this is a statement of availability, not an invitation, so it should not count as one.*

---

## 8. Player-initiated repair and completed repair

**Player taps:** [Ask Ren for a hand]
**Message:** I've got {repair_item}. Could you help?

**Ren:** yeah. bring it by {evening}. i'll find the tape.
**Buttons:** [Set it for {evening}] [Not now]

**Ren (if "Not now"):** ok. no pressure.

*Variation, if Ren can't that Evening:*
**Ren:** not tonight. i'm in the middle of something. try {new_evening}?

**Arrival and completion:**
**Narration:** Ren clears a corner of the bench for {repair_item}.
**Ren:** ok. hand me the small screwdriver. no, the other small one.
**Ren:** it works. mostly. it's a repair, not a miracle.
**Notice:** Repair complete. +{hp_gain} HP.

---

## 9. Couch sold while game night is pending

*Note: only shown if a prior scene (#6A) established couch seating for the pending plan.*

**Notice:** The couch is gone. Your game night with Ren on {evening} was planned for the couch. Floor seating is possible.

**Buttons:**
- [Floor's fine, confirm] — Keep the plan with floor seating.
- [Tell Ren I can't] — Cancel the plan and send Ren a note.
- [Go back]

**Ren (after "Floor's fine, confirm"):** floor works. i've sat on worse.

**Ren (after "Tell Ren I can't"):** ok. thanks for letting me know. another time.

**Visit (uses the wide floor composition):**
**Narration:** You and Ren settle on the floor with {game}.
**Ren:** low seats, high ground. i'll take it.
**Notice:** Visit complete. +{hp_gain} HP.

---

## 10. Optional neutral TV-is-gone line

**Ren (at the door):** tv's gone, huh. okay.

*Alt:* **Ren:** no tv. less to dust.

---

# Experience critique

**Confusing transitions:**
- **"Repair" is overloaded.** It is a leisure anchor (fixing something) and the route back to Ren. A label like "fix-it evening" or "bring something to fix" on buttons avoids implying friendship repair.
- **"Continue anyway" needs honesty without naming states.** My helper text says the plan stays but the player won't be there and Ren isn't told. Check the owner is comfortable that this is plain enough.
- **Silence after strain.** If Ren stops initiating, players may think Ren left. The reconnecting line in #7 helps but must not read as an invitation.
- **Couch notice timing.** It needs to appear when the sale happens, or at the next opportunity before the Evening, not only on arrival.
- **Missing beats:** no wording for the every-other-Evening limit, for a second reschedule attempt, or for Ren's own "not tonight" beyond one variant.

**Suggested policy vs. wording:**
- *Policy:* that Ren says "not tonight" in #8, that a lapsed invitation gets no message, and that the reconnecting line doesn't count as an invitation are all policy proposals.
- *Wording:* everything else is phrasing only.

**Questions for the lead/owner:**
1. Does "repair" mean fixing an object only, or also the reconnection route? Should the UI label differ?
2. Is Ren told automatically about the couch sale, or only when the player confirms or cancels?
3. Should the Receipt or any screen show an HP gain line, or only the in-scene notice?
4. Where is the rubber duck in these scenes? The duck joke assumes it is present.
5. Are the invented details (box contents, lamps, soldering, tape) approved, or should they become slots?
6. May Ren decline a player-initiated request on the spot (#8 variant)?