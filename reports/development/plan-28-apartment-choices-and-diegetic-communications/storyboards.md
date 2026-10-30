# Plan 28 — Text storyboards and copy (lead-edited)

Sources: Haiku drafts in `drafts/copy-direction-a-paper/` and `drafts/copy-direction-b-phone/`, edited by the lead
against `src/core/game-engine.mjs`. Where this file and a draft differ, this file wins. Amounts follow the main route
(decline starter → paid-zero; buy $0.99 starter → $14.01 unpaid). Live copy reads actual state; `{cash}` etc. are slots.

## Draft dispositions

| Draft item | Disposition | Why |
|---|---|---|
| "Back to options" / "Go back to the offers" after the final decline (A and B) | **Rejected** | New rule; `declineEscalation()` ends the run immediately. Disclosure moves onto the decline label instead. |
| A: "Eat breakfast. Food $5.00 already taken." button | **Changed** to "Continue" | Click would claim the human ate; the charge already happened. |
| A: "Health unchanged" on every non-health button | **Trimmed** to choices where health could plausibly change | Noise lowers scanning. |
| A: Day 1 return greeting "Go to the kitchen" | **Rejected** | Return is not a navigation verb; mornings arrive by flow, not by a button. |
| B: bank "Your card can advance $15.00 today" as a push | **Changed** to appear only as the ladder's current offer, never unsolicited | Avoid notification pressure. |
| B: Quackpot icon "no badge" rule; A: neutral PAID stamp; both risk lists | **Adopted** | Matches baseline rules 4–5. |
| A open item "does a sold couch drop off the ladder?" | **Answered** | Yes: `getCurrentEscalationStep` skips `sell_couch` when `assetsSold` has `couch` (`game-engine.mjs:871-873`). |

## Shared strings (both directions)

- Paid-zero summary: **"Rent paid in full — $15.00. Cash on hand $0.00. Your $10.00 wage arrives tonight."**
- Paid-zero controls: **"Continue to evening"** (primary) · **"Work an extra night shift (+$10.00, −15 health)"** ·
  **"Sell the couch (+$10.00)"** (absent when sold — no disabled ghost button).
- Unpaid header: **"Rent $15.00 · Cash on hand {cash} · Short {shortfall}"**, plus "Rent is paid as soon as you have $15.00."
- Ladder Accept labels: "Work an extra night shift (+$10.00, −15 health)" · "Sell the couch (+$10.00)" ·
  "Sell the TV (+$15.00)" · "Take a card cash advance (+$15.00 cash, +$15.00 debt)".
- Ladder Decline label: **"Not this one — show the next option"**; on the last eligible option:
  **"Decline — rent stays unpaid and this run ends"**.
- Confirmations (after the click, past tense): "Paid $15.00 rent. Cash $0.00." · "Worked the extra shift. +$10.00.
  Health 85." · "Sold the couch. +$10.00." · "Rent paid automatically: $15.00. Cash {cash}."

## Direction A — Things in their places

**Return from gacha, Day 1 (desk-side, window light).** Sticky note beside the phone: "Day 1 · Cash $15.00". Phone:
existing "Welcome back / Open Quackpot".

**Morning ledger, Day 1 after the opening (cut to kitchen medium, window light, duck on the bar beside the mug).**
Paper note: *"Toast, the last of the coffee."* — "Breakfast $5.00 paid. Cash on hand $10.00." → **Continue** (to race 1
via `run('enter')`).

**Morning ledger, Day 2 (kitchen).** *"Coffee again."* — "Last night's wage +$10.00. Breakfast $5.00 paid. Cash on hand
$15.00." → **Continue** (to the rent bill; no phone turn).

**Rent due (cut to desk-top, window light: notepad, sticky note, coins; duck top view).** A typed bill from Harbor Court Property
Office lies on the notepad: "Unit 4B · Rent $15.00 · Due today". Below: "Cash on hand $15.00." → **Pay rent ($15.00)**.

**Paid-zero (same desk-top, light shifts to warm).** The bill now carries a plain PAID stamp. Shared paid-zero summary
and three choices. Hover/focus on "extra night shift" changes nothing visually; choosing it cuts to desk-side where the
portrait phone shows Marisol's message already accepted: "Thanks for covering tonight." Choosing "Sell the couch" cuts
to living wide → couch `removed` → "The couch is gone. +$10.00."

**Unpaid ladder ($14.01, short $0.99).** Desk-top bill + a small "short" slip. Each offer cuts to where it lives:
shift → desk-side phone message from Marisol ("Can you take tonight? $10.00 cash, it's a long one."); couch → living
wide with a paper listing card ("Couch — $10.00, buyer can collect tonight"); TV → living wide, TV listing ($15.00);
card → desk-top statement slip. Rent pays the moment cash ≥ $15.00, shown back on the desk-top bill.

**Mandatory return, Day 1 → Day 2 (after the starter offer resolves on the phone).** `run('return')`, then desk-side
for one beat with the sticky note "Day 2 · Rent $15.00 due this afternoon", then the Day 2 kitchen ledger. Voluntary
returns (HUD Return during the opening, race 1, or race 2) show the same desk-side sticky note for the current day and
change nothing.

**Day 3 morning (kitchen).** *"Last of the eggs."* — "Last night's wage +$10.00. Breakfast $5.00 paid. Cash on hand
{cash}." If the couch or TV was sold, the next living-room view keeps it removed; the kitchen is unchanged.

## Direction B — One desk, one phone

All moments at desk-side (duck side view); portrait phone content changes. Light: window mornings, warm evenings.

**Return from gacha (any day).** Portrait home: "Day {n} · Cash {cash} · Health {health}". App row: Today, Messages,
Quackpot. No badges, no counts.

**Morning ledger (Today app).** "Breakfast — $5.00 paid. Cash on hand $10.00." Day 2/3 add "Wage +$10.00 last night." →
**Continue**.

**Rent due (Messages · Ruth, building owner).** Ruth: *"Hi, dear — rent for 4B is $15.00 today. No fuss."* Status line
under the bubble: "Cash on hand $15.00." Quick reply: **Pay $15.00 rent**.

**Paid-zero.** Ruth: *"Got it, thank you. You're all set this month."* Then the shared paid-zero summary as a plain
bank line and the three choices as quick replies. Shift → diner chat (Marisol). Couch → building marketplace (Tomás,
3A: *"I can collect the couch tonight, $10.00."*); after accepting, the single cut to living wide with the couch
removed: "Tomás collected the couch. +$10.00."

**Unpaid ladder.** Ruth: *"Rent is $15.00 — you're $0.99 short. Here's what's possible today."* Offers arrive one at a
time in their own thread: Marisol (shift), Tomás (couch), Priya, 2B (TV $15.00), Pinecrest Bank (card advance, shown
only as the current offer). Rent pays itself in Ruth's thread when cash ≥ $15.00.

## Landlord voice options

**The owner chose the formal property office on 2026-10-30.** Direction A's rent bill uses the Harbor Court Property
Office wording below. Ruth is not used for rent. A named building owner remains available only as a future optional
character.

- **Friendly building owner (Ruth, 1st floor):** "Hi, dear. Rent's $15.00 today. Tap below when you're ready."
- **Formal management (Harbor Court Property Office):** "Rent for Unit 4B is due today: $15.00. Payment below."

## Copy risks carried into the comparison lint (H3)

Hidden amounts; $0.00 framed as failure; "Paid" before the click; moralizing on the card advance; guilt on decline;
notification pressure (badges, counts, sounds); "running on empty" in live copy (Receipt-only term).
