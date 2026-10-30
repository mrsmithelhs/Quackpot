# Student read: apartment rent sequences (Plan 28)

Source: `comparison/views.mjs` copy as written. Effect amounts (shift cash, health, couch/TV prices, card debt) come from engine previews that were not read here, so checks use the fixed figures ($15.00 rent, $14.01 cash, $0.99 short) and the labels as written.

**Summary:** A 15-year-old can mostly tell what each click costs, since money and health appear on every button. The unpaid path is the weak spot: "rent then paid", the debt sign, and the auto-pay wording leave real doubt about what was paid and what is still owed.

## A. Paid-zero path (Day 2 morning, Pay, three choices)

1. Mostly yes. "Cash on hand: $0.00" after Pay shows where the student stands, and the wage line says money arrives tonight. "Continue to evening" clearly costs nothing.
2. "Work an extra night shift (+$X cash, −15 health)" is readable. Nothing says why $0.00 cash matters, so the two extra buttons may look like required work.
3. Nothing scolding. "Rent paid in full" with the PAID stamp is neutral.
4. Missing: whether $0.00 cash has a cost later (for example, tomorrow's breakfast), and a plain "these are optional."

## B. Unpaid path (bill, Pay, four offers, final decline)

1. Partly. After Pay, nothing says whether the $14.01 was taken. It still shows as cash, so the student has to infer that nothing was paid.
2. Misreadings:
   - "rent then paid" leaves the order and timing unclear, and it is not clear whether the "+" cash figure is before or after the $15.00.
   - "+$Y debt" on the card advance reads like gaining money.
   - "Rent is paid as soon as you have $15.00" suggests the wage will pay it automatically.
   - "Not this one — show the next option" sounds like a menu, not a skip.
   - The couch and TV cards say "a buyer will pay … this afternoon," but "rent then paid" implies the rent clears now.
3. Tone: "Rent not paid · $0.99 short" is blunt and close to scolding. "This run ends" is stark. Nothing preachy.
4. Missing: that a sold couch or TV is gone for good; what health and debt do later; that the run-ending decline leads to a Receipt, and what it will show.

## C. Accept the extra shift on the unpaid path (outcome card)

1. Mostly yes: cash, health and rent are all named. But "Health now N" gives no starting value, and "rent then paid" repeats "Rent paid: $15.00". The heading "Thanks for covering tonight." never states the rent status, so the student has to read the lines to learn the bill is cleared. The still-unpaid case has no line at all.
2. The student cannot check the arithmetic unless they know the "+$X" is before the rent is taken out.
3. No pressure beyond "It's a long one."
4. Missing: health before and after, and an explicit "rent cleared by this choice."

## Rewrites (current → proposed, max 6)

1. `…rent then paid` (every button and outcome line) → `+$10.00 cash, −15 health, then $15.00 rent paid`. Shows the order; the outcome line keeps "Rent paid" and drops the duplicate.
2. `+$10.00 debt` → `$10.00 more owed (now $Z)`. Removes the plus sign that reads as a gain.
3. `Rent not paid · $0.99 short` and `Rent is paid as soon as you have $15.00.` → `Rent unpaid: you need $0.99 more` and `It stays unpaid until you have $15.00 cash.`
4. `Not this one — show the next option` → `Skip this offer (rent still $0.99 short)`.
5. `Decline — rent stays unpaid and this run ends` → `Decline — rent stays $15.00 unpaid and this run ends. Your Receipt is next.`
6. Shift outcome heading `Thanks for covering tonight.` → `Rent paid in full · thanks for covering tonight.`, with the health line `Health −15, now N.`
