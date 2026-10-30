# Plan 28 interaction gallery (report-local)

- **Purpose.** This compares four treatments of notice → inspect → choose → consequence, judged in the room. It
  answers root's revision 05 and owner decisions D11–D16.
- **The earlier prototype.** `../comparison/` is kept unchanged as history. Its floating-card treatment was **not**
  selected.
- **What the gallery is not.** It is not the game, not production, and nothing in it is saved.

**URL**, under the owned finite server:
`http://127.0.0.1:5228/reports/development/plan-28-apartment-choices-and-diegetic-communications/gallery/index.html`

Options:
- `?m=<moment>` opens a given moment, for example `?m=T2-shift`.
- `?motion-off` is the reviewer's no-animation switch. It is not evidence of real OS reduced motion.

## The three-layer language

1. **In the room.**
   - Each object sits where it would really be, at its real scale.
   - The attention signal is a halo, a marker chip and the duck's gaze (D14). Under "early run" guidance the halo
     pulses and the chip is always shown. Under "later run" the halo is faint and still, and the chip appears only on
     hover or focus. The halo never disappears.
   - Each object is a real button in tab order, with an accessible name.
2. **Held.**
   - Activating an object brings the paper, phone or notepad into the foreground: a dimmed room behind it, focus on
     its heading, and Esc or "Put it down" to return focus to the object.
   - Reading costs nothing.
3. **Decide.**
   - The game's own slate panel. It starts collapsed with "Decide" (D13) and is never locked behind scrolling.
   - Alternatively, an honest app button on the held phone (T2), or a short confirm attached to the object (T4).
   - Its confirm button is the only commitment, and it states the amount with cash before and after.
   - "Not now" or "Put it down" returns with no events.

| Moment (`?m=`) | Treatment | Scene and object | Engine call at commitment |
|---|---|---|---|
| `T1-rent` | Held paper + panel | Kitchen wide; notice taped to the fridge (the duck faces it) | `billExpense('rent', 15)` |
| `T1-breakfast` | Held paper + panel | Kitchen wide, Day 3; bakery flyer on the fridge | `billExpense('food', 5)` |
| `T2-rent` | Paper, then phone | Desk top; envelope by the notepad, which leads to the office's payment page on the held phone | `billExpense('rent', 15)` (app button) |
| `T2-shift` | Phone | Desk side; the phone's own screen shows Marisol | `chooseZeroCashOption('extra_shift')` |
| `T3-list` | Notes to self | Desk top; your notepad (the duck faces it): pay rent, then (after rent) cover the shift | rent, then extra shift |
| `T4-rent` | Confirm at the object | Fridge notice | rent |
| `T4-couch` | Confirm at the object | Living room; couch with a sale tag | `chooseZeroCashOption('sell_couch')` |
| `T4-breakfast` | Confirm at the object | Kitchen medium, Day 3; empty plate (the duck faces it), replaced by a bakery bag afterwards | food |
| `MIX-day` | Recommended mix | T1 rent, then T2 shift, then the day control, then T4 breakfast | as above |

Every moment loads the real Plan 35 `rent-paid-zero` fixture into memory, with the same lightweight loader as
`comparison/`. Any scripted setup, such as paying rent before the couch sale, is listed in the reviewer panel. Every
amount shown comes from an engine clone of the action about to run.

## Files

| File | Contents |
|---|---|
| `index.html`, `gallery.css`, `gallery.js` | Written by the lead |
| `copy.mjs` | Haiku draft, reviewed. The lead corrected an invented "collected tonight" sale timing and a preachy "$0.00 is not a failure" line. |
| `props.mjs` | Haiku draft, reviewed visually in the browser: taped notice (unread, read, paid), envelope, plate, bakery bag, sale tag and phone glow. These are sketch props, not adopted kit art. |

The originals are kept under `../drafts/gallery-copy/` and `../drafts/gallery-props/`. A layout aid,
`../drafts/contact-sheet/`, renders the kit scenes with a 10% grid.

## Gallery session evidence (2026-10-30, 15:31:54–15:44:50, lead)

**Server**
- `serve-bounded.py`, PID 26188, served 112 GETs. The only non-200s were `favicon.ico` and `robots.txt`.
- I stopped it at 15:44:50. Afterwards the probe was refused and no Python process remained.
- The wrapper printed the usual leftover `LISTENING` entry owned by PID 0; see `../browser-gate.md` session 2.

**Storage**
- No snapshots were taken this session.
- `gallery/` uses no storage APIs (a grep for localStorage, sessionStorage, indexedDB, serviceWorker and `caches.`
  finds nothing). That is source evidence only.

**T1 rent, at 1280×720, by keyboard**
- Tab to the notice, then Enter: the letter is held and focus is on its heading.
- Tab, then Enter: Decide expands to show "Pay rent, $15.00?" and "Cash on hand: $15.00 → $0.00".
- Enter pressed twice on Pay gave exactly one `expense_due`, one `expense_paid` and one `escalation_offered`.
- The held letter took the PAID stamp. After putting it down, the fridge notice is stamped and its halo is out.

**The other moments, script-driven (DOM clicks)**

| Moment | What happened |
|---|---|
| T2 rent | Envelope, then "Use your phone", then the "Harbor Court · Pay rent" page. Two same-tick clicks on Pay gave one charge. Done returned focus to the envelope. |
| T2 shift | The panel stated "+$10.00, Health 100 → 85 (−15), cash after $10.00", and confirming appended `action` and `escalation_result`. |
| T3 | "after rent" was correctly marked as later until rent was paid. Then rent was ticked and the shift enabled, and the events were rent, then shift. |
| T4 couch | The confirm appended one `escalation_result`, and the couch is gone from the rendered scene. |
| T4 breakfast | "Not now" appended no events and returned focus to the plate. |
| T1 breakfast | The panel copy matched the engine preview ($10.00 → $5.00). |

No page errors or unhandled rejections were seen.

**At 390×844**
- The held letter fills the width, the collapsed Decide bar sits directly below it, and there is no horizontal scroll.

**Defects found and fixed during the session**
- The held object stretched across the screen; this was a percentage width inside a flex parent.
- The pickup animation overrode the paper's tilt.
- Putting something down could hang when the pane wasn't drawing animations, so a timed fallback was added.
- Done objects lost focus because they were disabled; they now use `aria-disabled`.

**Not done yet:** the full keyboard walk of T2, T3 and T4; real reduced motion; and unit tests for the gallery. Those
wait until a treatment is selected, so effort goes into the chosen design.

## Lead observations for the owner

- **T1** reads most clearly: the letter is unmistakably a letter, and the panel is unmistakably the game. It costs
  three steps: pick up, Decide, Pay.
- **T2** makes the phone really useful. The payment page's button is honest. A text thread can't state a health cost,
  though, so the shift still needs the game's panel next to the phone. That is a principle: the game states the
  consequences the in-world object wouldn't.
- **T3** gives the character a voice and naturally shows order ("after rent"). It is the most personal, but it's a
  third object to learn, and handwriting fonts vary by device.
- **T4** is fastest and suits possessions and meals. It's weak for anything that should be read first, such as rent.
- **The duck's gaze** works for the fridge, the notepad and the plate. It does not work for the phone or the couch:
  the kit's side-view duck faces left in every scene, and mirroring the scene mirrors the duck too.

## Proposed art needs (not built, not in scope)

- **Apartment kit:** a mirrored side-view duck option, or a right-facing pose, so gaze can point at the phone on the
  desk and the couch in the living room. This is a Plan 25/kit change.
- **Final props:** final-quality versions of the taped notice, envelope, plate, bakery bag and sale tag, plus a front
  door with an under-door slip, if the owner wants notices delivered there.
- **Held phone:** the frame should match the kit's phone drawing more closely.

## Session 2: owner bug reports and duck poses (2026-10-30, lead, on the owner's Vite dev server, D17)

**Fixes**
- **T3 notepad.** Choosing an item replaced the slot that held "Put it down". The button now sits outside the decision
  area and is always present. Verified: it's there after rent and after the shift, it closes the notepad, and focus
  returns to "Your notepad (done)".
- **Any held view.** Clicking the dimmed room now puts the object down. Verified: closing appended no events.
- **Mix, go to work after the extra shift.**
  - The gallery's evening step always called the zero-cash `continue`. After an extra shift, the engine has already
    closed that choice with cash at $10, so the call threw and the error was swallowed.
  - It now calls `continue` only while the zero-cash choice is open.
  - Verified: rent, then the shift, then "Go to work (extra shift, then home)" reaches Day 3 morning with $20.00 and
    health 85. The last events are the shift result and then `income` (wage). Breakfast is not charged until its tap.
  - No page errors.

**Duck poses (D18)**
- `duck-layer.mjs` removes the kit's duck in the page and draws a posed one from the kit's own artwork:
  - side view facing left or right;
  - side view leaning, so its gaze tilts toward the target;
  - top-down at the heading toward the target;
  - front view once the moment's responsibilities are done (the conscience at ease).
- `perches.mjs` is a Haiku draft, reviewed visually: a wall shelf, a book stack, a crate and a window ledge.

| Moment | Where the duck is | What it looks at |
|---|---|---|
| T1 and T4 rent, T1 breakfast | On a small wall shelf beside the fridge, smaller (farther away) | The notice |
| T2 rent | Top-down on the desk, turned | The envelope. The envelope moved to clear desk space so it no longer overlaps the kit's tape roll. |
| T3 | Top-down | The notepad |
| T2 shift | At the kit's spot, facing right, leaning back | The phone, past the mug |
| T4 couch | On the TV console, facing right | The couch |
| T4 breakfast | At the kit's spot | Down toward the plate |

**Checks**
- I looked at each pose by scaling the room up on the page for inspection; nothing was saved.
- At 390×844 there's no horizontal scroll, and the duck scales with the room.

**Not yet covered:** the crate, book stack and ledge perches aren't placed in any moment yet, and there are no unit
tests for `headingToward` or `leanToward`.

## Session 3: selection and the tilt rule (2026-10-30, lead, owner's Vite dev server)

- **Owner selection (D20):** the recommended mix. Top-down desk moments (T3, T2 rent) stay as a reserved option for
  future moments where turning the duck to any heading suits the choice.
- **Tilt rule (D21), enforced in `duck-layer.mjs`.**
  - A side-view duck tilts only when `pose.wedge` names an object under its raised end, and only by at least
    `MIN_TILT` (12°). Otherwise it sits level.
  - Looking up pivots on the tail, with the chest on the wedge. Looking down pivots on the chest, with the tail on the
    wedge.
  - The wedge's thickness is computed from the tilt, so the raised end rests on it.
  - With a wedge, the duck aims straight at its target, capped at 25°.
- **New wedge.** `paperback` in `perches.mjs`, added by the lead.
- **Where tilts happen now.** Only on the desk-side phone moment: the duck faces right with its chest on a paperback,
  tilted 25° toward Marisol's message. Every other moment is level: the fridge shelf, the TV console, and the counter
  by the plate.
- **Checked:** both poses, by looking at the room scaled up on the page, at 1280×720.

## Session 4: the selected mix through both rent branches (2026-10-30, lead, owner's Vite dev server)

**New**
- `mix-model.mjs`: pure routing (`placeFor`, `rentState`, `optionalOpen`, `OFFER_PLACE`) and decision view-models
  (`shortfallDecision`, `ladderDecision`).
- `MIX-paid` and `MIX-unpaid` moments, which replace the earlier chain.
- A recorded "turn it down" in both the panel and the confirm.
- The card-advance place.
- The paid flow's optional couch step.

**Tests (lead):** `gallery.test.mjs`, 7 of 7 through the Plan 25 launcher. Exit 0, 0.55 s, peak 2.9 MB sampled,
`StopReason` null, stderr empty.

**Browser**

| Check | Method | Result |
|---|---|---|
| Unpaid, every offer turned down | Script | "Try to pay" recorded `expense_due` only; cash stayed $14.01. The offers appeared in order: phone, then couch, then TV, then card. The first three turn-downs said "(rent still $0.99 short)", and only the card's turn-down said the run ends. The run ended in `terminal`, then the Receipt stand-in. No page errors. |
| Unpaid, accepting partway | Script | "Not now" on the phone recorded nothing. Turning down the shift, then selling the couch, with a same-instant double click, gave one `escalation_result` and one `expense_paid`, leaving $9.01. Day 3 started with $19.01. |
| Paid flow | Script | Notice, then "Later" to the phone, then "Later" to the couch. The sale left $10.00, and Day 3 had $20.00 with breakfast pending. |
| Unpaid start | Keyboard, at 1280 with `?motion-off` | A double Enter on "Try to pay" gave one `expense_due`, with focus on the result heading. Putting the notice down moved focus to the phone in the new place. Enter, then Esc, recorded nothing and returned focus to the phone. |
| Layout at 390×844 | Measurement | The sale confirm covered the room. Fixed: below 760 px it is a sheet under the room. A 1 px overflow came from a halo pseudo-element past the room edge; fixed by clipping `.objects` to the room. Afterwards there was no horizontal scroll in T4-couch, MIX-unpaid, MIX-paid, T1-rent, T2-shift and T4-breakfast. Desktop confirms still sit beside their object. |
| Compositions | Viewed | The duck faces the TV from the floor by the plant. The card app sits beside the game panel, with the red-bordered final decline. |

**Limits**
- No storage snapshots on this origin, because the dev server shares the real game's origin. The no-storage claim is
  source-only.
- Real reduced motion is unverified.

