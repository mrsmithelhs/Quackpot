# Direction B: Portrait Phone Life (draft copy)

Conventions: every money line states the amount and the cash on hand after it. Examples use the baseline path (start cash $15.00, health 100, no extra shifts or sales). Live copy must read the actual balance. "Cash" means cash on hand.

## 1. Moment-by-moment copy

### (a) Day 1 breakfast
- **App:** Notes, "Today" list
- **Note text:** "Breakfast: $5.00 charged automatically. Nothing to do here."
- **Button:** "Got it" (no money effect)
- **Screen reader:** "Notes: breakfast charged $5.00 automatically. Cash $10.00."
- **After click:** "Noted. Cash: $10.00."

### (b) Day 2 morning breakfast
- **App:** Notes, "Today" list
- **Note text:** "Breakfast: $5.00 charged automatically. Wage of $10.00 came in last night."
- **Button:** "Got it" (no money effect)
- **Screen reader:** "Notes: breakfast charged $5.00 automatically. Cash $15.00."
- **After click:** "Noted. Cash: $15.00."

### (c) Day 2 rent due (afternoon)
- **App:** Messages, thread "Ruth (Building Owner)"
- **Bubble:** "Hi! Rent for 4B is due today: $15.00. Tap below whenever you're ready."
- **Status line under bubble:** "Cash on hand: $15.00."
- **Button:** "Pay $15.00 rent. Health unchanged."
- **Screen reader:** "Messages from Ruth: rent $15.00 due today. Cash on hand $15.00. Button: pay $15.00 rent, health unchanged."
- **After click (PAID-ZERO):** "Paid $15.00 rent. Cash: $0.00."
- **Note:** The rent status must not change until the tap. The button says "Pay," never "Paid." If cash is short, the tap opens (e) instead.

### (d) PAID-ZERO aftermath (three choices)
- **Thread:** Ruth, Messages, first bubble: "Thanks, 4B is all set for this month."
- **Bank notification (Pinecrest Bank):** "Cash: $0.00. Your $10.00 wage arrives this evening."

Choices, each as its own quick-reply:
1. **Button:** "Keep going. Wage +$10.00 tonight. Health unchanged."
   - Screen reader: "Keep going: no action, wage of $10.00 arrives tonight."
   - After click: "Continuing. Wage of $10.00 arrives this evening. Cash: $0.00."
2. **Sender:** Harbor Street Diner group chat, Marisol (shift lead). Bubble: "Double shift tonight if you want it. It's a long one, but it's $10.00 cash."
   - **Button:** "Take extra night shift: +$10.00 cash, -15 health."
   - Screen reader: "Diner chat from Marisol: extra night shift, $10.00 cash, 15 health lost."
   - After click: "Extra shift done. +$10.00 cash. Cash: $10.00. Health: 85."
3. **Sender:** Tomas (3A), building marketplace. Bubble: "Still have the couch? I'll take it for $10.00 cash and can pick it up tonight."
   - **Button:** "Sell couch: +$10.00 cash, health unchanged."
   - Screen reader: "Marketplace message from Tomas: buy the couch for $10.00 cash."
   - After click: "Sold the couch for $10.00. Cash: $10.00."
   - Shown only while the couch is unsold.

### (e) UNPAID escalation (cash $14.01, short $0.99)
Tapping "Pay $15.00 rent" opens Ruth's thread:
- **Bubble:** "Rent is $15.00 and you have $14.01 on hand, so $0.99 is short. Here's one option at a time."
- Each offer appears alone. Declining moves to the next one still available.

**Offer 1, extra shift (Diner chat, Marisol)**
- Bubble: "Could use someone tonight. It's $10.00 cash, but it's a long one."
- **Accept button:** "Accept: extra shift, +$10.00 cash, -15 health."
- **Decline button:** "Decline: see next option. No change."
- Shown only while health is above 20.
- After accept: "Extra shift done. +$10.00. Rent $15.00 paid. Cash: $9.01. Health: 85."

**Offer 2, sell couch (Tomas, marketplace)**
- Bubble: "Still selling the couch? $10.00 cash, I'll come by tonight."
- **Accept button:** "Accept: sell couch, +$10.00 cash, health unchanged."
- **Decline button:** "Decline: see next option. No change."
- After accept: "Couch sold for $10.00. Rent $15.00 paid. Cash: $9.01."

**Offer 3, sell TV (Priya, 2B, marketplace)**
- Bubble: "Would you sell the TV? I can give you $15.00 cash this afternoon."
- **Accept button:** "Accept: sell TV, +$15.00 cash, health unchanged."
- **Decline button:** "Decline: see next option. No change."
- After accept: "TV sold for $15.00. Rent $15.00 paid. Cash: $14.01."

**Offer 4, card advance (Pinecrest Bank)**
- Notification: "Your card can advance $15.00 today. This adds $15.00 to your debt, which is $0.00 now."
- **Accept button:** "Accept: advance $15.00 cash, debt +$15.00, health unchanged."
- **Decline button:** "Decline. No change."
- After accept: "Advanced $15.00 on your card. Rent $15.00 paid. Cash: $14.01. Debt: $15.00."

**Final decline confirmation (only after the last offer is declined)**
- Sheet title: "End this run?"
- Body: "Rent is still $0.99 short, with $14.01 on hand. Ending the run opens your Receipt."
- Buttons: "End run and open Receipt" / "Back to options"

### (f) Day 3 breakfast
- **App:** Notes, "Today" list
- **Note text:** "Breakfast: $5.00 charged automatically."
- **Button:** "Got it" (no money effect)
- **Screen reader:** "Notes: breakfast charged $5.00 automatically. Cash $5.00."
- **After click:** "Noted. Cash: $5.00."

### (g) Return from the gacha, portrait home screen
The phone sits upright on the desk beside Professor Quacks. Rotating back to portrait gives a plain home screen. No money changes on return. The header line reads: "Settings / Save / Uninstall Quackpot," always visible.

- **Day 1:** Header "Day 1. Cash $10.00. Health 100." Notes shows breakfast charged $5.00. Quackpot icon has no badge.
  - Screen reader: "Home screen, day 1. Cash $10.00, health 100."
  - After rotating back: "Back at the apartment. Quackpot is ready to reopen."
- **Day 2:** Header "Day 2. Cash $15.00. Health 100." Notes shows breakfast charged $5.00. Ruth's rent message arrives in the afternoon, not on return.
  - Screen reader: "Home screen, day 2. Cash $15.00, health 100."
  - After rotating back: "Back at the apartment. Quackpot is ready to reopen."
- **Day 3:** Header "Day 3. Cash $5.00. Health 100." Notes shows breakfast charged $5.00.
  - Screen reader: "Home screen, day 3. Cash $5.00, health 100."
  - After rotating back: "Back at the apartment. Quackpot is ready to reopen."

## 2. Landlord voice alternatives

**Formal property manager (Harbor Court Property Office)**
> Notice: rent for Unit 4B is due today, $15.00.
> Payment is below. Please reply only with questions about your account.
> Harbor Court Property Office.

**Friendly older neighbor (Ruth, building owner)**
> Hi, dear. Rent's $15.00 today, just a gentle nudge.
> Tap below when you're ready, no fuss. The kettle's on downstairs if you want to drop by.
> Ruth, 1st floor.

## 3. Copy risks

- **Hidden amounts:** "A little extra," "quick cash," or "shift pay" would hide the number. Every money offer states the amount and the cash on hand.
- **$0.00 read as failure:** "Cash: $0.00" after paying rent must be a neutral confirmation with no red text, warning, or "broke" language.
- **Moralizing in chat:** Neither the diner, marketplace, nor landlord lines should comment on borrowing, the starter pack, or the choices.
- **Notification pressure:** No badges, countdowns, "limited time," or "rent at risk" alerts. The Quackpot icon stays unmarked, so it doesn't mimic the gacha's pull prompts.
- **Payment before the click:** The rent button says "Pay," and the rent status changes only after the tap. Food notes describe charges that already happened, not pending ones.
- **Funnel feel:** Escalation offers appear one at a time and never repeat or stack, and no sound or vibration marks each step.
- **Card advance framing:** The debt line must sit in the same sentence as the cash line. Avoid "free," "instant," or "no strings."
- **Hidden exits:** Settings, Save, and Uninstall stay in the persistent header, so nobody has to find the way out.
