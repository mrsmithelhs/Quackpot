# Initial apartment arrangements: two options

I read the four captures. Observations that affect the design:
- The desk popover covers the phone and part of the room navigation.
- The kitchen capture shows "Sit with Duck" in the footer, and a duck on the counter.
- The living room shows no sale affordances.
- The "Rent overdue" chip duplicates the rent notice.

I added no rules, amounts or slots. Where microcopy needs a number, it shows the game's existing disclosed value.

## Shared principles (both arrangements)
- **Footer:** shrinks to room navigation plus a one-line status. Navigation stays free and costs no life time. Save, Settings and Uninstall stay in the global header, and Uninstall stays immediate.
- **Docked object note:** inspecting an object opens a note docked under the scene, in the same place every time. It replaces floating popovers and never covers navigation or the object.
- **Inspect, confirm, dismiss:**
  1. **Inspect:** tap, click, or focus plus Enter. This only reads, and it costs nothing.
  2. **Confirm:** one plain button inside the note that states the consequence ("Buy dinner · cost shown").
  3. **Dismiss:** "Not now", Esc, or tapping elsewhere. Focus returns to the object and nothing changes.
- **Unavailable treatment:** the object looks like ordinary furniture, with no halo and no chip. It stays out of the Tab order unless inspecting it gives useful information. Blocked transitions are the exception: they are inspectable and give a plain reason.
  - A blocked transition names the blocker ("Rent is unpaid") but does not highlight the blocking object.
  - The fridge note has no target while inactive.
- **Nonvisual and keyboard route:**
  - Each room has a "Things here" list in the same order as the visual targets, followed by the room-navigation list.
  - Tab or arrow keys move between targets. Enter inspects. Enter on the confirm button commits. Esc dismisses.
  - A live region announces results, such as "Dinner bought. Health updated."
  - Unavailable items are omitted, except for blocked transitions and any item the owner chooses to describe.

### Shared action table

| Action | Object | Microcopy (inspect → confirm) | Notes |
|---|---|---|---|
| Breakfast/dinner buy or skip | Plate (kitchen) | "Dinner. Cost and health effect shown." Buttons: "Buy dinner" / "Skip dinner" | The plate art is unclear in the capture, so it needs a clearer prop. |
| Rent | Rent notice (fridge) | "Rent due. Amount and deadline shown." Button: "Pay rent" | The overdue chip becomes the notice's own state. A rent obligation blocks transition. |
| Mom call | Fridge note | "Call Mom." Button: "Call", then a scene completes (up to 5 HP) | Active only on scheduled evenings after dinner, if other guards allow. Otherwise no target. |
| Duck sit | Stationary duck (desk) | "Sit quietly with the duck · up to +5 HP." Button: "Sit" | The duck is inanimate and never sold or animated. After use, inspect reads "You've sat with it this evening." |
| Work | Keys/tray (desk) | "Head to work? Pays the disclosed wage on completion. Leaving begins the shift." Buttons: "Take the keys" / "Not now" | Eligible after breakfast. Wage is paid on completion, not departure. |
| Phone | Phone (desk) | Opens the invitation, work, or Quackpot as appropriate | Browsing and re-entry are free. A pull or race commits the phase session. After prior use, a further action asks for confirmation using the existing phase/fatigue wording. |
| Sale | Couch, TV (living) | "Sell the couch? Proceeds and removal shown." Button: "Sell" | Only after entering the game, and only if eligible and unsold. |
| Recovery | Bed (bedroom) | "Recover. Uses this phase." Button: "Recover" | A distinct guarded action, available only when recovery is pending. |
| Finish run | Wall calendar | "Finish the run? Ends the run." | Appears from Day 4, always with a confirm step. |

## Arrangement A: Rooms do their own jobs (distributed)

**Mapping:**
- **Morning → Evening:** wall clock in the kitchen ("Move on to evening").
- **Stay up for Late Night:** desk lamp ("Keep the lamp on").
- **Turn in for the night / Finish Late Night:** the bed, labelled by phase ("Turn in" in Evening, "Finish Late Night" in Late Night).
- **Recovery:** also the bed, as its own row with its own confirm.
- **Finish run:** kitchen calendar.

**Warnings and blocks:**
- An unworked scheduled shift gets an explicit warning on the clock ("You haven't worked your shift. Move on anyway?").
- Obligations and commitments block the clock and bed with a plain reason.

**Discoverability:** the bed is the universally understood sleep object, and the lamp is paired with it.

**Route and presentation changes required:**
- **Route change:** the bedroom must become reachable in ordinary Evening and Late Night, not only for pending recovery. This is a new route, not an existing capability.
- **Presentation changes:** the bed gets two kinds of rows, and the footer buttons are retired.
- **Existing rules unchanged:** recovery, turn-in, fatigue and blocking all work as they do now.

**Missing art and collisions:**
- **Kitchen:** clock, calendar and a clearer plate. The rent notice and Call Mom note overlap on the fridge, and the counter duck conflicts with the single stationary duck.
- **Desk:** the desk popover covers navigation.
- **Bedroom:** an ordinary-evening bed state, and the bedside lamp is cropped at the right edge.
- **Living room:** sale tags and empty-spot art for the couch and TV. The duck on the armrest would vanish if the couch were sold, and the TV is cropped at the left edge.
- **Bedroom shelf:** the toy duck looks like the real duck and should change.

**Evening trace (Day N):**
1. **Dinner:** in the kitchen, the player inspects the plate, sees the cost and health effect, and taps "Buy dinner".
2. **Duck sit:** at the desk, the player taps the duck and "Sit". The scene completes and health is restored (up to 5). The duck's inspect now reads "Already sat tonight", with no halo.
3. **Free browsing:** the player opens the phone and browses at no cost.
4. **First pull:** one pull commits the Evening session.
5. **Further action:** a second pull opens the existing confirmation. It says this enters Late Night and commits there, and that fatigue applies next morning. The wording is the existing text, not new rules.
6. **Turning in:** in the bedroom, the player taps the bed, then "Finish Late Night". Without step 5, the label would be "Turn in for the night". Morning follows.

## Arrangement B: Desk as the day's control (centralized)

**Mapping:**
- **Continue to evening, Stay up, Turn in, Finish Late Night:** all live on the desk. The wall clock handles morning→evening. The lamp card lists only eligible rows: "Turn in for the night", "Stay up for Late Night", or "Finish Late Night".
- **Finish run:** desk calendar.
- **Recovery:** unchanged. The bed remains reachable only when recovery is pending.

**Route changes:** none for ordinary sleep. The ordinary bedroom route is not needed, and the bedroom stays recovery-only exactly as now.

**Missing art:**
- Desk clock, calendar and lamp states.
- The same living-room sale tags and empty-spot art as A.

**Collisions:**
- The desk becomes crowded: keys, phone, duck, lamp, clock and calendar.
- The bedside lamp is decorative.
- The bed is visible but inert in ordinary Evening, so its inspect text should say plainly "Recovery only right now".

**Evening trace (Day N):** the same steps as A, except steps 2 and 3 happen at the desk without a room change.
1. **Dinner:** same as A.
2. **Duck sit:** same as A.
3. **Free browsing:** same as A.
4. **First pull:** same as A.
5. **Further action:** same as A.
6. **Turning in:** the player taps the lamp, then "Finish Late Night" (or "Turn in for the night" without step 5).

## Challenges and cross-cutting issues
- **Redundant non-actions:** "Continue without departing" and "Continue to evening" duplicate each other. The "Rent overdue" chip duplicates the notice. Room-navigation chips and door objects would duplicate each other, so use one.
- **Mixed metaphors:**
  - The capture's bed label "Rest" is really recovery. "Rest", "Turn in" and "Recover" must stay distinct.
  - In B, turning in at a desk lamp is a weaker metaphor than the bed.
  - Selling furniture inside your own home needs a framing (tag, listing, phone), which I have not chosen.
- **Work:** the keys are the only way to leave. The wage is paid on completion, never on departure.
- **Rent:** the player pays explicitly, with the amount and deadline shown. Unpaid rent blocks transition.
- **Sales:** inspect shows proceeds and removal, then a confirm. After a sale the object is gone.
- **Ren and gigs:** these are hypothetical, and I choose no rules. Reserve no controls. If the owner later wants them, candidates are a phone thread or a second chair. Their rules are for the owner to define.
- **Recovery plus turn-in:** I don't know whether both can be pending on the bed at once. The source should be checked before the bed card shows two rows.

## Recommendation
Recommend **Arrangement A**.

- **Gains:**
  - The bed is the most legible object for sleep.
  - Each room has a clear job.
  - Desk crowding goes away.
- **Costs:**
  - It needs a route change (ordinary bedroom access), new art in three rooms, and a clock and calendar.
  - It adds room travel at night, which is free in time but adds steps.
- **If the route change is rejected,** B delivers most of the benefit with no route change. The cost is a crowded desk and a weaker metaphor for ending the night.

## Decisions for the owner
1. Approve ordinary bedroom access (A) or keep it recovery-only (B).
2. Choose the metaphor for day-advance (clock) and run-end (calendar).
3. Choose the framing for sales (tag, listing or phone).
4. Choose how a blocked transition names its blocker.
5. Decide whether inactive-but-persistent objects, such as the fridge note, appear in the nonvisual list.
6. Decide where the single duck lives, and remove or change the lookalike ducks elsewhere.
7. Decide whether Ren and gigs get reserved spots now.