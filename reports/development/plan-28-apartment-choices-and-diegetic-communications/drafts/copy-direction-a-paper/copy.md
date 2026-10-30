# Direction A: Paper and Objects, player-facing copy draft

## Conventions

- Placeholders: {cash}, {shortfall}, {debt}, {health}, {duck_name}. Example values assume the no-purchase path unless marked "starter pack".
- Each paper has: scene, paper type, heading, body, labeled buttons, screen-reader line (SR), and a confirmation line (DONE), shown only after a click.
- Food is charged on scene entry. The paper states it in past tense ("taken"). Its button only acknowledges. Nothing is "due" or "will be taken" for food.
- {duck_name} never speaks. No lines are attributed to it.

## (a) Day 1 breakfast (kitchen counter, after gacha opening)

- Paper: handwritten meal note on a notepad, pencil.
- Heading: "Groceries, sort of"
- Body: "Eggs, toast, the last of the coffee. Food: $5.00 taken today. Cash now: $10.00."
- Button: "Eat breakfast. Food $5.00 already taken. Health unchanged."
- SR: "Kitchen meal note. Breakfast. Food cost $5.00, already taken. Cash $10.00."
- DONE: "Ate breakfast. Food: $5.00 spent. Cash: $10.00. Health: 100."

## (b) Day 2 morning breakfast (kitchen counter)

- Paper: second page torn from the same pad.
- Heading: "Still groceries"
- Body: "Coffee again. Food today: $5.00 taken. Cash now: {cash}."
- Button: "Eat breakfast. Food $5.00 already taken. Health unchanged."
- SR: "Kitchen meal note. Breakfast. Food cost $5.00, already taken. Cash {cash}."
- DONE: "Ate breakfast. Food: $5.00 spent. Cash: {cash}."

## (c) Day 2 rent due (door mat, envelope; bill then sits on desk)

- Paper: landlord envelope, typed notice.
- Heading: "Rent, Unit 4B"
- Body: "Rent for this month: $15.00, due today. Cash on hand: {cash}."
- Button: "Pay rent ($15.00). Health unchanged."
- SR: "Rent bill for $15.00, due today. Button: pay rent."
- DONE (only when paid in full, see d): "Paid $15.00 rent. Cash: $0.00."
- Note: clicking the button with less than $15.00 does not show "Paid". It opens (e).

## (d) PAID-ZERO aftermath (desk; rent receipt stamped PAID beside the schedule card)

- Paper: rent receipt with a neutral PAID stamp.
- Heading: "Rent paid in full"
- Body: "$15.00 paid today. Cash on hand: $0.00. Your $10.00 evening wage arrives tonight."
- Buttons:
  1. "Continue to evening. No change to cash or health."
  2. "Work an extra night shift (+$10.00 cash, -15 health)."
  3. "Sell the couch (+$10.00 cash, health unchanged). Only if not sold."
- SR: "Rent receipt, paid in full. Cash $0.00. Choices: continue to evening, extra night shift for $10.00 and 15 health, or sell the couch for $10.00."
- DONE 1: "Continued to evening. Cash stays $0.00 until the $10.00 wage arrives tonight."
- DONE 2: "Worked an extra night shift. +$10.00 cash. Health: 85. Cash: $10.00."
- DONE 3: "Sold the couch for $10.00. Cash: $10.00. Health: 100."

## (e) UNPAID escalation (desk; short-by slip laid over the rent bill)

Starter pack path: cash is $14.01, shortfall $0.99. Each offer appears alone. Rent is paid automatically once cash reaches $15.00.

- Slip heading: "You are {shortfall} short"
- Slip body: "Rent is $15.00. Cash on hand: {cash}. Rent is paid automatically once cash reaches $15.00."

1. Extra shift (shown only if health > 20)
   - Body: "Extra night shift: +$10.00 cash, -15 health."
   - Accept: "Work an extra night shift (+$10.00 cash, -15 health)."
   - Decline: "Not this one. Show next option (no change)."
   - DONE: "Worked an extra night shift. +$10.00 cash. Health: 85. Rent paid automatically: $15.00. Cash: $9.01."

2. Sell couch (couch listing card on the couch)
   - Body: "Couch listing: sell for $10.00. The couch leaves the room."
   - Accept: "Sell the couch (+$10.00 cash, health unchanged)."
   - Decline: "Not this one. Show next option (no change)."
   - DONE: "Sold the couch for $10.00. Rent paid automatically: $15.00. Cash: $9.01."

3. Sell TV (TV listing card on the TV)
   - Body: "TV listing: sell for $15.00. The TV leaves the room."
   - Accept: "Sell the TV (+$15.00 cash, health unchanged)."
   - Decline: "Not this one. Show next option (no change)."
   - DONE: "Sold the TV for $15.00. Rent paid automatically: $15.00. Cash: $14.01."

4. Credit card (last offer; shown only if debt < $50)
   - Body: "Card cash advance: +$15.00 cash, and $15.00 added to your card balance (debt)."
   - Accept: "Take the cash advance (+$15.00 cash, +$15.00 debt, health unchanged)."
   - Decline: "Not this one. End here (no change)."
   - DONE: "Cash advance taken. +$15.00 cash, debt {debt}. Rent paid automatically: $15.00. Cash: $14.01."

Final decline (after the last offer's decline):
- Heading: "Leave the rent unpaid?"
- Body: "Rent of $15.00 stays unpaid. Cash on hand: {cash}. This ends the run and opens your receipt."
- Buttons: "End the run (rent unpaid, no change)" / "Go back to the offers."
- DONE: "Run ended. Rent unpaid. Opening your receipt."

## (f) Day 3 breakfast (kitchen counter)

- Paper: meal note, third page.
- Heading: "Last of the eggs"
- Body: "Food today: $5.00 taken. Cash now: {cash}."
- Button: "Eat breakfast. Food $5.00 already taken. Health unchanged."
- SR: "Kitchen meal note. Breakfast. Food cost $5.00, already taken. Cash {cash}."
- DONE: "Ate breakfast. Food: $5.00 spent. Cash: {cash}."

## (g) Return-from-gacha greeting (desk; sticky note on the lamp)

Phone rotates back to portrait. The apartment greeting appears first, then the kitchen paper for the day.

- Day 1: Heading "Back at the desk." Body: "{duck_name} is where you left it. Cash: $15.00. Health: 100."
  - Button: "Go to the kitchen (no change)."
  - DONE: "Back at the apartment. Cash: $15.00. Health: 100."
- Day 2: Heading "Day 2." Body: "Cash: {cash}. Rent of $15.00 is due this afternoon."
  - Button: "Go to the kitchen (no change)."
  - DONE: "Back at the apartment. Cash: {cash}. Health: {health}."
- Day 3: Heading "Day 3." Body: "Cash: {cash}. Food for today: $5.00."
  - Button: "Go to the kitchen (no change)."
  - DONE: "Back at the apartment. Cash: {cash}. Health: {health}."

## Rent envelope tone alternatives (same amounts and buttons)

Landlord-formal:
> NOTICE OF RENT DUE. Unit 4B: $15.00, payable today.
> Please remit the full amount. Balances unpaid after today will be reviewed.
> Management

Landlord-friendly neighbor:
> Hi neighbor! Rent's $15.00 this month, due today.
> No rush through the day. Get it in when you can.
> Hope the eggs are holding up.

## Copy risks

1. Atmosphere hiding amounts: a rent bill or meal note with no dollar figure, or "a bit short" wording. Always print $15.00, cash, and shortfall.
2. $0.00 read as failure: avoid "broke", "empty", red stamps, or alarm icons on PAID-ZERO. Use a neutral PAID stamp and plain "Cash: $0.00".
3. Implied pre-click payment: never "due" or "will be taken" for food. The rent button must not show "Paid" until the payment completes.
4. Moralizing on the card offer: avoid "debt trap", "easy money", or "you should have". State only the amount and the balance change.
5. Guilt on decline: no "give up on your home?" or "are you sure?" wording. The final confirm stays factual.
6. Gated options: extra shift (health > 20) and card (debt < $50) disappear silently when gated. Never reference a missing option.
7. Couch repeats: the ladder spec does not say whether a sold couch is removed from the ladder. Confirm before build.
8. Route name: "running on empty" stays out of live paper. It belongs only on the Receipt.
