# Door-first introduction: candidates for owner selection

All of this is candidate material, not decisions. Slots in `{braces}` are engine-supplied only. Ren holds a paper bag now; its contents are never stated.

---

## 1. Staging recommendations (bubble + Decide panel)

**Option A (recommended): bubble on the wall, panel stays below the picture.**
- Place the bubble in the open tan wall beside the doorway, upper left or right, with its tail aimed at Ren. It never overlaps Ren's face, torso or the bag.
- The Decide panel stays where it is now, below the image, so nothing covers the scene.
- On narrow screens, keep the image full width at its normal aspect ratio and cap its height so the first replies are visible without scrolling. The bubble becomes a short caption pinned to the top edge of the wall area, 2–3 lines max.

**Option B: bubble above Ren, Decide as a bottom sheet on narrow screens only.**
- Desktop is the same as A. On narrow screens the Decide panel overlays the lowest part of the scene, below Ren's hands, with a fixed maximum height and stacked buttons.
- This keeps more of the image on screen, but it risks covering the bag and lower doorway.

**Legibility and focus risks (both options):**
- Tan wall behind the bubble: check text contrast and use a solid bubble fill, not translucent.
- Long lines will push the bubble onto Ren. Keep each bubble to about 90 characters and split the rest across exchanges.
- When Open is pressed, move focus once to the first reply. Don't move focus again as the bubble updates; announce the bubble text politely to screen readers.
- Keep "Close door" reachable at every step, with no timed advances.
- Don't make the knock indicator motion-only. Add a visible text or icon cue as well, and respect reduced motion.
- The door hit area should never be the only way to Open or Ignore. The buttons must work alone.

---

## 2. Introduction dialogue tree

**Closed-door state**
*Author note: the knock is shown on the door itself, e.g. "knock knock".*
**Buttons:** [Open] [Ignore]

**R1 (after Open; Ren centered, holding the bag)**
**Ren:** oh. hi. i'm ren, down the hall. we keep passing each other, figured i'd say hi before it got weird.
**Decide:** [Nice to meet you] [What's in the bag?] [Not a great time] · always: [Close the door]

**R2a (Nice to meet you)**
**Ren:** same. i fix and build things, so if something of yours acts up, i'm around.
**Decide:** [Good to know] [What do you build?] · [Close the door]

**R2b (What's in the bag?)**
**Ren:** nothing exciting. i can't walk down a hallway empty-handed.
**Decide:** [Fair] [What do you do?] · [Close the door]

**R2c (Not a great time)**
**Ren:** no problem. another time.
*Ends the conversation and closes the door.*

**R3 ("What do you build?" / "What do you do?")**
**Ren:** whatever comes up. mostly fixing. sometimes a lamp.
**Decide:** [Good to know] · [Close the door]

**R4 (the number offer; reached from "Good to know")**
**Ren:** want my number? for when something breaks. or you just feel like saying hi.
**Decide:** [Sure] [Maybe later] [I'm good]

**R5 responses**
- *Sure:* **Ren:** cool. it's yours. **Notice:** Ren shared their number. (No digits shown.)
- *Maybe later:* **Ren:** sure. i'm down the hall.
- *I'm good:* **Ren:** all good. door's still where it is.

**R6 (close)**
**Ren:** ok. see you around.
*Author note: no plan, time or Evening is reserved here. The conversation is free.*

---

## 3. Later branches (door or phone, same nodes)

*Author note: the nodes are the same whether Ren arrives by knock or the player reaches Ren by phone. Delivery is an open question (see 4).*

**Invitation**
**Ren:** i was thinking {game} at yours on {evening}. you in? no worries if not.
**Notice:** Ren coming by would be your Evening activity on {evening}. Dinner is separate.
**Decide:** [Accept for {evening}] [Another evening] [Not this time]

- *Accept:* **Ren:** cool. {evening}. i'll knock.
- *Not this time:* **Ren:** all good. offer stands.
- *Another evening:* **Ren:** {new_evening}? could work. **Notice:** Proposed: {new_evening}. Not set until you confirm. **Decide:** [Confirm {new_evening}] [Go back]. After confirm, **Ren:** ok. {new_evening}. i'll knock.

**Reminder and conflict**
**Ren:** reminder: i'm coming by {evening}.
**Notice (if `{conflict_activity}` is picked):** You have a plan with Ren on {evening}, and you've picked {conflict_activity}. You can only do one.
**Decide:**
- [Tell Ren I can't] — cancels the plan and sends Ren a note.
- [Continue anyway] — You'll do {conflict_activity}. The plan with Ren won't be kept, and Ren won't be told.
- [Go back]

**Cancel reply:** **Ren:** ok. thanks for telling me. another time.

**Visit arrival (closed door → Open → Ren at the door)**
**Ren:** hey. thanks for having me.
*Seating:* couch/floor lines from batch 2 stay valid, and the couch notices from that batch are unchanged.
*Optional duck line, only when `{duck_present}`; the duck never responds:* **Ren:** *(to the duck)* you're on quality control.
**Completion:** **Ren:** good one. same again sometime. **Notice:** Visit complete. +{hp_gain} HP.

**Unmet commitment (player never told Ren; shown at next contact)**
**Ren:** {evening} didn't happen. that's okay.
**Decide:** [Sorry, I couldn't] [Okay] → **Ren:** noted. ask whenever.

**Reconnecting opening and repair (player-initiated)**
**Ren:** hey. if something needs fixing, i'm around.
**Decide:** [Ask Ren for a hand] [Just reading]
- *Ask:* player: "Could you help me fix {repair_item}?" **Ren:** yeah. i'll come by {evening} and we'll look at it. **Decide:** [Set it for {evening}] [Not now]
- *Not now:* **Ren:** ok. no pressure.
- *Variation, if Ren can't:* **Ren:** not tonight. {new_evening}, maybe? **Notice:** Proposed: {new_evening}. Not set until you confirm.
- *Arrival:* **Ren:** ok. let's see {repair_item}.
- *Completion:* **Ren:** works. mostly. it's a repair, not a miracle. **Notice:** Repair complete. +{hp_gain} HP.

---

## 4. Open choices for the owner (no rules proposed)

1. **Knock timing on day 2.** Which phase does the first knock appear in? Does it use any time, or only sit on the Door location?
2. **What Ignore does.** Does the knock return later, or does Ren introduce themself another way? Neutral candidate copy for Ignore: "You let it go. The knocking stops." It avoids saying whether Ren heard anything.
3. **Ignored knocks vs. commitments.** The intro knock isn't an invitation, and these lines never treat it as one. Should a knock on an accepted-plan arrival even offer Ignore, or only Open?
4. **Repeat encounters.** After the intro, does every knock open on a short greeting, or skip straight to the invitation? If the player skipped the intro, should the first later meeting reuse the R1 line unchanged?
5. **Delivery of later invitations.** Door knock, phone message, or both? The owner rejected Messages-first for the introduction only.
6. **The phone number.** Does "Ren shared their number" add a contact or any in-game channel? I haven't claimed any behavior beyond the notice.
7. **Player-initiated repair.** Where does the player start it, given visits happen only at the apartment? A phone/contact screen is the likely candidate but is unconfirmed.