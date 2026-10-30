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
