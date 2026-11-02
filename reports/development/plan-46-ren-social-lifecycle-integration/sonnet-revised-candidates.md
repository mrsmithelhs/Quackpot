# Revised passages

Scenes 3 (decline) and 10 (TV line) are unchanged. New or changed slots: `{duck_present}` (engine fact, optional) and `{repair_item}` (optional). If no repair item is supplied, copy says "it" or "something".

---

## 1. First introduction and channel opening (revised)

*Author note: Ren is at the player's door, matching the door portrait with the box. No time is reserved.*

**Narration:** There's a knock. A neighbor from down the hall is at your door, box on their hip.

**Ren:** oh. hi. i'm ren, down the hall. we keep passing each other, figured i'd say hi before it got weird.

**Buttons:** [Nice to meet you] [What's in the box?]

*If "What's in the box?"*
**Ren:** just carrying it somewhere. i fix and build things, so there's usually a box.

*If "Nice to meet you"*
**Ren:** same. i fix and build things if you ever want a hand.

**Notice:** Ren is now in your Messages. Reading and replying are free and don't use up an Evening.

**Ren:** leave a note anytime. if i've got something i'll leave one back. no rush either way.

**Buttons:** [Sounds good] [Close]

---

## 2. Invitation and acceptance (revised)

*Author note: Ren visits the player's apartment. The commit moment is the accept button.*

**Message from Ren:** i could come by {evening} for {game}. or not, that's fine too.

**Notice:** Ren coming by would be your Evening activity on {evening}. Dinner is separate.

**Buttons:** [Accept for {evening}] [Not this time] [Another evening]

*After accept:*
**Ren:** cool. {evening}. i'll knock.
**Notice:** Plan set: Ren visits on {evening}.

---

## 4. Reschedule as a proposal (revised)

*Author note: the new time is only a proposal until it is expressly accepted. Who accepts is an open question below.*

**Button pressed:** [Another evening] → proposes `{new_evening}`

**Ren:** {new_evening}? could work.

**Notice:** Proposed: {new_evening}. Not set until you confirm.

**Buttons:** [Confirm {new_evening}] [Go back]

*After confirm:*
**Ren:** ok. {new_evening}. i'll knock.
**Notice:** Moved to {new_evening}.

---

## 5. Reminder and conflict choice (revised)

**Reminder (Ren):** reminder to self and you: i'm coming by {evening}.

**Conflict notice:** You have a plan with Ren on {evening}, and you've picked {conflict_activity} for that Evening. You can only do one.

**Buttons:**
- [Tell Ren I can't] — Cancels the plan and sends Ren a note.
- [Continue anyway] — You'll do {conflict_activity}. The plan with Ren won't be kept, and Ren won't be told.
- [Go back] — Change your Evening pick.

*If "Tell Ren I can't":*
**Ren:** ok. thanks for telling me. another time.

---

## 6. Arrival and shared activity (revised)

**Narration:** Ren is at your door, box in hand.

**Ren:** hey. thanks for having me.

*Variation A: game night on the couch (establishes the shared seating that #9 depends on):*
**Ren:** couch? i'll take the far end.
**Narration:** You and Ren settle on your couch with {game}.

*Variation B: other shared activity:*
**Narration:** You and Ren spend the evening on {game}.

*Optional duck line, only when `{duck_present}` is true. The duck never responds:*
**Ren:** *(to the duck)* you're on quality control.

**Completion:**
**Ren:** good one. same again sometime.
**Notice:** Visit complete. +{hp_gain} HP.

---

## 7. Canceled plan, unmet commitment, reconnecting opening (revised)

**Canceled by telling Ren:** unchanged (see #5 reply).

**Unmet, the player never told Ren** (shown at the next opening of the channel):
**Ren:** {evening} didn't happen. that's okay.
**Buttons:** [Sorry, I couldn't] [Okay]

**Ren (if "Sorry, I couldn't"):** noted. ask whenever.

**Later reconnecting opening** (player opens the channel; no new invitation):
**Ren:** hey. if something needs fixing, i'm around.
**Buttons:** [Ask Ren for a hand] [Just reading]

---

## 8. Player-initiated repair and completed repair (revised)

*Author note: no tools or benches. The repair happens in the player's apartment, and `{repair_item}` is named only if the engine supplies it.*

**Player taps:** [Ask Ren for a hand]
**Message:** Could you help me fix {repair_item}?

**Ren:** yeah. i'll come by {evening} and we'll look at it.
**Buttons:** [Set it for {evening}] [Not now]

**Ren (if "Not now"):** ok. no pressure.

*Variation, if Ren can't that Evening:*
**Ren:** not tonight. {new_evening}, maybe?
**Notice:** Proposed: {new_evening}. Not set until you confirm.

**Arrival and completion:**
**Narration:** Ren is at your door.
**Ren:** ok. let's see {repair_item}.
**Ren:** works. mostly. it's a repair, not a miracle.
**Notice:** Repair complete. +{hp_gain} HP.

---

## 9. Couch sale (revised)

*Author note: this applies only if a prior scene (#6A) established couch seating for the pending plan. The disclosure comes before the sale, and the reconfirmation comes after it.*

**9a. Before the sale (neutral seating-impact notice):**
**Notice:** Game night with Ren on {evening} is planned for the couch. Selling the couch changes the seating.
**Buttons:** [Continue with sale] [Go back]

**9b. After the sale (reconfirmation):**
**Notice:** The couch is gone. Game night with Ren on {evening} was planned for the couch.
**Buttons:**
- [Floor seating's fine, confirm]
- [Tell Ren I can't] — Cancels the plan and sends Ren a note.
- [Go back]

**Ren (after confirm):** floor works. i've sat on worse.
**Ren (after "Tell Ren I can't"):** ok. thanks for telling me. another time.

**9c. Visit (wide floor composition):**
**Narration:** You and Ren settle on the floor with {game}.
**Ren:** low seats, high ground. i'll take it.
**Notice:** Visit complete. +{hp_gain} HP.

---

## Questions for the owner

1. **Reschedule acceptance.** Does the player confirm Ren's counter, or does Ren confirm the player's proposal? What stands for the original {evening} while the proposal is open?
2. **"Not tonight" in #8.** Should Ren's counter ({new_evening}) be allowed, or should Ren simply decline?
3. **Couch notice timing.** Should #9a appear at every sale attempt while a plan is pending, or only the first?
4. **Optional lines.** Is a plain "it" acceptable when no `{repair_item}` slot is supplied?