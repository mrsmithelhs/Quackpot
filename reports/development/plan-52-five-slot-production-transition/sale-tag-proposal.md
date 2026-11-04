# Plan 52: sale-tag presentation amendment

Historical proposal: root cleared the selected rule and implementation subsequently proceeded; see `sale-tag-repair.md` for current status and evidence.

Owner direction: show smaller, partially transparent sale tags beside the owned couch and TV; use the tag itself as the sale interaction, leaving the TV screen for a future music feature. Offer tags when the player is low on money or near a major bill, reducing unnecessary sale pressure. Existing $30 couch / $40 TV sales, Ren disclosure, transaction log, save/replay and recovery rules are unchanged. The owner clarified that the expense trigger includes any shortfall and up to $50 surplus, not a symmetric $50 window.

Proposed calculation is display eligibility only. Use integer cents and scheduler positions: five slots per day, `position = 5 * (day - 1) + slotIndex`. A pending rent or payday-loan obligation counts as a major expense; paid/defaulted entries do not. The horizon contains all pending rent/loan amounts whose due position is at most five slots ahead (including an unpaid overdue obligation). Add amounts due within that horizon; if several occur together or within the window, compare available cash to their combined amount. This is an explicit proposed aggregation, not a forecast of future income or an instruction to spend. A tag is offered for each unsold item, subject to recovery, if cash is strictly below 6000 cents or the horizon total is nonzero and cash is at most 5000 cents above that total. Any shortfall qualifies. Preview cash and obligation amounts are current canonical state, not speculative external prices.

| Situation | Proposed tag display |
|---|---|
| $59.99 available, no bill in horizon | Both unsold tags, subject to recovery |
| $60.00 available, no bill in horizon | No tags |
| $170 rent exactly five slots away, cash $120 or $220 | Tags: shortfall or inclusive $50 surplus |
| Same bill, cash $119.99 | Tags: any shortfall qualifies |
| Same bill, cash $220.01 | No tags by proximity |
| $170 rent already due, cash $100 | Tags: $70 shortfall qualifies |
| $170 rent and $99 loan both in horizon, cash $220 | Tags: $49 short of combined $269 |
| Recovery active | No sales or tags until recovery clears |
| Couch or TV already sold | No corresponding tag |
| Any due shortfall | Tags: matches currently advertised sale rescue choices |

Use one compact transparent tag per item, separate from furniture, with accessible name identifying the specific item and its sale purpose; retain a usable touch/keyboard hit area around the visible tag, without occupying the TV screen. On focus/hover increase opacity and provide visible focus; on narrow viewport ensure tag and labels remain legible and do not cover navigation, TV, Ren, or other targets. Reuse the existing sale confirmation, exact sale transaction and couch seating disclosure. Re-evaluate after any cash, bill, time, sale, recovery or reload change; don't persist an extra availability flag.

Before code: root reviews final truth table, exact UI/pure-helper and due-disclosure seams, all outstanding owner choices, and browser/resource turn. Test boundary cents/positions, same-horizon aggregation, pending/paid and recovery, sold-item cases, no free-standing furniture hotspot, due display/action consistency, actual sale once and couch disclosure, keyboard/touch and narrow/desktop placement. User's preserved profile is never used for automation. Existing 13 checkpoints remain stale until feedback stabilizes. The proposal itself was not source-write authority; root subsequently cleared the bounded implementation.
