# Pilot brief 1 — paid versus unpaid rent

**Status:** Proposed; execute only after root clears the exact batch.

## Starts

- `plan35.rent-paid-zero.v1` — captured at the ordinary `d2_afternoon_rent` view with $15.00 cash after declining the starter offer.
- `plan35.rent-unpaid-escalation.v1` — captured at the same view with $14.01 cash after buying the real starter offer.

Both starts are pre-Pay. Neither is expected to contain a rent `expense_due` event, rent `activeBill`, or escalation modal yet. Those are outcomes of the review action.

## Action and look-fors

Use one fresh isolated context per start. Confirm the normal rent page displays the actual $15 amount and the correct current cash. Activate the visible Pay button once through pointer hit-testing.

For the $15 start, confirm the real `expense_due` and `expense_paid` records occur once, cash reaches $0, the bill is settled, no unpaid `activeBill` or debt is created, and the actual zero-cash prompt appears.

For the $14.01 start, confirm the real `expense_due` occurs once, cash remains $14.01, the rent bill becomes the actual unpaid active bill, and the displayed escalation choices match engine eligibility. Do not accept an escalation choice in this brief.

## Evidence to record

Record fixture/source/loader/brief hashes, exact mounted text, button selector and hit-test result, before/after envelope hashes, state and log deltas, chain heads, cash/bill/debt fields, viewport, one action, setup/continuation elapsed time, and cleanup. Distinguish recorded mechanical events from visible presentation.

## Stop conditions

Stop on source/fixture staleness, wrong cash or boundary, an unexpected pre-existing bill event, missing/wrong visible control, unexpected event count/order, state/log mismatch, timeout, or cleanup uncertainty. Keep the failed candidate and bounded comparison evidence.
