# Plan 28 — Current apartment life-event mapping (as implemented)

Inspected 2026-10-30 at `c67cac3`. Lead-verified by direct reading of the named lines; nothing here was executed in a browser.
"Absent" means not implemented, not "broken".

## 1. Where each life moment lives today

| Moment | Controller trigger (`src/main.js`) | Engine call (`src/core/game-engine.mjs`) | What the player sees | Stage |
|---|---|---|---|---|
| Day 1 breakfast | Gacha completion button `#btn-gacha-proceed` "Next: Morning Breakfast Expense ($5.00) ➔" (`src/ui/gacha-view.js:62-64`) → `onProceed` (`main.js:341-348`) | `billExpense('food', 5)` at clock `day 1 morning`, then `advanceDay(1,'day 1 midday')` | Nothing. The button names the expense; the next screen is race 1. | Phone (landscape) |
| Day 1 wage | `proceedToDay1Evening()` (`main.js:648-656`) after starter Buy/Decline | `creditWage()` +$10 | Nothing | — |
| Day 2 breakfast | same function | `advanceDay(2)`, `billExpense('food', 5)` | Nothing | — |
| Day 2 rent due | `currentStep` `d2_afternoon_rent` (`main.js:405-456`) | none until click | `.stage-transition-card` "Day 2: Rent Due Date", "Your landlord arrives…$15.00", cash, status, `#btn-pay-rent` | **Inside the phone stage** (`phoneOpen` stays true) |
| Pay rent | `#btn-pay-rent` (`main.js:432-449`) | `billExpense('rent', 15)` (`game-engine.mjs:739-791`) | → zero-cash modal, escalation modal, or straight to Day 2 evening | Phone |
| Paid, $0.00 left | `activeModal === 'zerocash'` (`main.js:527-556`) | `chooseZeroCashOption('continue'|'extra_shift'|'sell_couch')` (`:798-848`) | Modal "WALLET NOTICE • $0.00 CASH / Rent Paid, But Wallet is Empty!" with 3 buttons (`src/ui/modals.js:45-85`) | Modal over phone |
| Unpaid rent | `activeModal === 'escalation'` (`main.js:557-594`) | `getCurrentEscalationStep` / `acceptEscalation` / `declineEscalation` (`:857-981`) | Modal "CRITICAL EXPENSE OVERDUE", one step at a time, Accept / "Decline / Consider Next Option" (`modals.js:87-150`) | Modal over phone |
| Day 2 wage + Day 3 breakfast | `proceedToDay2Evening()` (`main.js:658-665`) | `creditWage()`, `advanceDay(3)`, `billExpense('food', 5)` | Nothing | — |
| Return from gacha | HUD Return (`main.js:210-217`) → `stageTransition.run('return')` → `phoneOpen=false` | none | Desk-side scene; phone "Welcome back / Your game is ready when you are." (`src/ui/apartment-view.mjs:15-17`); "Back at Your Apartment" | Apartment desk |
| Furniture sale | Only inside zero-cash / escalation modals | `assetsSold.push('couch'|'tv')` | Button label only. **No visual change**: production renders `desk-side` only and never passes `furnishings` (`apartment-view.mjs:7-14`). | — |
| Physical duck pawn | — | **Absent** (design.md:135 describes it; no engine method) | — | — |

Reachability at current values (start $15, wage $10, food $5, rent $15): food is always affordable on the main route, so the
food escalation (`skip_lunch`) is not reachable in ordinary play. The rent branch hinges on the $0.99 starter pack:
decline → $15.00 at rent → paid-zero; buy → $14.01 → unpaid ladder (confirmed by Plan 35 fixtures
`plan35.rent-paid-zero.v1` / `plan35.rent-unpaid-escalation.v1`, `scripts/dev/checkpoints/catalog.json`).

## 2. Log evidence per moment

| Moment | Events appended | Displayed-cue evidence |
|---|---|---|
| Breakfast (each day) | `expense_due {kind:'food', amount, cashBefore, billId}` + `expense_paid` | **Absent** — no record that anything was shown, because nothing is |
| Wage | `income {kind:'wage', amount}` | Absent (nothing shown) |
| Rent screen shown | none | **Absent** — no `cue_shown` when the rent card renders |
| Pay rent, enough cash | `expense_due` + `expense_paid` | — |
| Pay rent → exactly $0 | + `escalation_offered {step:'zero_cash_check'}` | Appended inside `billExpense`, i.e. at mutation time, before the modal paints |
| Zero-cash choice | `action {continue_to_wage | zero_cash_extra_shift | zero_cash_sell_couch}` (+ `escalation_result` for shift/couch) | — |
| Pay rent, short | `expense_due` only; `activeBill` set | Ladder steps are **not** individually recorded as displayed; only `action {escalation_accepted|escalation_declined, step}` |
| Ladder exhausted / last decline | `terminal {route:'running_on_empty'}` | — |

The Receipt reads displayed evidence only from `cue_shown / offer_shown / retention_modal_shown` (`src/core/receipt.mjs:4,37`).
Life-event displays therefore contribute to "You did" (expenses, escalations) but not "We displayed". Plan 28 does
not propose new event types; adding any would be a log/export schema change (DECISION-031 forbids rewriting them
without authority) and is listed as an owner/root question.

## 3. Lifecycle facts a redesign must respect

- **Location is derived, not saved.** On restore, `phoneOpen = currentStep !== 'desk'` (`main.js:146-148`). A player who
  returned to the desk at rent and reloads comes back inside the phone. Any apartment location for life moments must be
  a pure function of persisted `state.step`/`activeModal`/`activeBill`, not new UI state.
- **No step whitelist** in storage; only race/terminal reconciliation (`src/core/storage.mjs:517-565`). New step ids
  would still be a save-shape change for old builds and are avoided in this proposal.
- **Duplicate-click safety** is currently by synchronous re-render plus engine guards: `billExpense` is idempotent per
  `d{day}_{kind}` (`:746-756`); `chooseZeroCashOption` throws if cash ≠ 0 or couch sold (`:799-803`). A presentation
  that animates *before* re-render (e.g. envelope slide) must disable controls on first activation.
- **Uninstall** stores `{step, activeModal}` in `interruptedContext` and restores both on Stay (`:990-1052`); the
  retention modal replaces the life modal in `#modal-container`.
- **Settings** renders into the same modal container after the life modal (`main.js:616-638`) and pauses glow/motion.
- **Transitions** never mutate state (`src/ui/stage-transition.js:3`); reduced motion uses a static overlay for one frame.

## 4. Current-copy defects relevant to the redesign (not fixed here)

1. The last eligible ladder step's decline button reads "Decline / Consider Next Option" but `declineEscalation()`
   ends the run when no step remains (`game-engine.mjs:964-984`). The label does not disclose the ending.
2. "Rent Paid, But Wallet is Empty!" / "WALLET NOTICE" frames a safe, fully-paid state with alarm styling; the body
   correctly says the run is safe.
3. The gacha button names a breakfast that is never shown; food on Days 2–3 is charged silently.
4. "Your landlord arrives" is depicted on a phone card, so the communication and its place disagree.
5. Both the zero-cash and escalation renderers rely on `engine.state` reads at render time; no stale-state problem was
   found, but `onProceed`'s food `billExpense` ignores its return value (`main.js:342`), so a future food shortfall
   would set `engine.state.activeModal='escalation'` without updating the controller's local `activeModal` until reload.
   Not reachable at current values; recorded for the later integration packet (relates to DECISION-007's food follow-up).
