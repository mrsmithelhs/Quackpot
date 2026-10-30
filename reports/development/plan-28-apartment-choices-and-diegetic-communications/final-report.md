# Plan 28: final delivery

**Apartment choices and diegetic communications.** Date: 2026-10-30. Delivered by the Claude lead under clearance 04
(Branch C, no advisor).

This delivery contains the refined Direction A prototype, the owner's decisions, the actual validation evidence, and
the production-integration proposal. It is returned to root for **one** decision: whether to assign a cohesive
implementation packet. See `integration-proposal.md` §0.

## What Plan 28 delivers

Ordinary apartment life (meals, bills, work and possessions) appears in the apartment as paper, bills and messages.
Gacha-style buttons are gone. Engine rules are unchanged: every amount, health cost, debt, ladder step and ending
comes from the existing engine.

## Owner decisions (`owner-direction-2026-10-30.md`)

| # | Decision |
|---|---|
| D1 | Direction A, "Things in their places". |
| D2 | The duck stays still within a scene and appears in each scene. |
| D3 | Styled HTML paper. |
| D4 | Guidance relaxes over the run. |
| D5 | Optional lanes are wanted (Plan 37). |
| D6 | Rent comes from Harbor Court Property Office. |
| D7 | Action-based time is approved (rules in Plan 37). |
| D8 | Morning framing: wide on Day 1, then medium. |
| D9 | **Tap to pay breakfast.** No skip control; skipping is Plan 37's rule. |
| D10 | No display logging of life surfaces on the Receipt in the first integration. |

## Before and after (short)

| Moment | Before | After (prototype) |
|---|---|---|
| Breakfast | Charged silently at phone or evening transitions. | Kitchen note: "Breakfast: $5.00, not paid yet. Cash on hand: $X." Then **Pay for breakfast**, then "Balance after breakfast: $Y." |
| Rent due | A phone screen with a Pay button. | Harbor Court Property Office bill on the desk: "Status: not yet paid." |
| Paid with exactly $15 | A zero-cash modal. | "Rent paid in full", PAID stamp, $0.00. The wage still arrives, and two optional choices state their exact effects. |
| Paid short | An escalation modal. | "Rent unpaid · you need $0.99 more. Nothing has been taken." Marisol's shift message appears at the desk, and the couch and TV sales happen in the living room, where the sold item disappears. Only the final card-advance decline says that the run ends. |
| Return from gacha | Desk view. | Desk-side note with the day's cash, health and what's due next. |

## Prototype

- **URL**, when served by the owned finite server:
  `http://127.0.0.1:5228/reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/index.html`
- **Reviewer switches:** `?motion-off` and `?fail-load=<scenario>`.
- **Files:** `comparison/`, which contains `index.html`, `prototype.css`, `prototype.js`, `life-model.mjs`,
  `views.mjs`, `fixtures.mjs`, `serve-bounded.py` and `plan28.test.mjs`.
- **Stand-ins, disclosed in the UI:** Save, Settings, Uninstall, the Receipt, races and the gacha.
- **Day 1 and Day 2:** these come from Plan 35 fixtures captured under the current automatic breakfast charge, so they
  show a past-tense ledger. The live breakfast tap is shown on Day 3.

## Evidence

Each item is attributed to whoever produced it.

- **Root:**
  - Read-only canonical fixture preflight: passed.
  - `plan28.test.mjs`: 12/12 passed, then 12/12 again after the Luna-assisted B1–B3 repairs (`928ea02`).
- **Lead:** `plan28.test.mjs`, 13/13, through the Plan 25 launcher. It now includes the breakfast-tap test and the
  framing test. Exit 0, 1.16 s, peak 128 MB.
- **Lead, browser gate session 1** (`browser-gate.md`):
  - Everything a student sees passed at 1280×720 and 390×844, driven by real keys: both rent branches, the real sale
    disappearing, the final decline, heading focus, one event per double activation, stale and error scenario
    switching, return from the gacha, and motion-off.
  - Findings B1–B3 were recorded.
- **Lead, browser gate session 2:**
  - B1–B3 were confirmed fixed. B1's remaining cause was found and fixed: the event-list JSON text.
  - One failed attempt (`contain: paint`) was reverted.
  - The D9 tap was checked by keyboard: a double Enter gave one charge.
  - The D8 framing was confirmed.
  - The 390 px layout passed.
- **Cleanup:**
  - Both owned servers (PIDs 22224 and 45384) were stopped and confirmed exited, with probes refused.
  - A leftover `LISTENING` entry owned by PID 0 is explained in session 2's cleanup note.
  - Storage before and after was identical and empty in both sessions.
  - The Plan 35 log is unchanged.

## Limits

- Real OS reduced motion is unverified.
- No screen reader, real device or classroom coverage.
- Screenshots were viewed, not saved.
- The second half of session 2 was script-driven, because the pane stopped drawing.
- Integration behavior (reload, Settings, Uninstall, Receipt) was reasoned from source, not exercised.

## Production integration

See `integration-proposal.md`. In summary:
- **New modules:** six focused modules under `src/ui/life/`.
- **`main.js`:** the rent screen and the zero-cash/escalation modal branches are replaced by one life-surface mount,
  and the three automatic food charges move to the breakfast tap.
- **No engine rule changes and no new event types.**
- **Migration:** state-derived routing for reload and Uninstall. Plan 35 needs compatible re-attestation, not
  recapture.
- **Validation:** proportionate.

## Remaining risks

- Tutorial pacing of a Day 1 breakfast before the phone opens.
- One more tap each morning.
- HUD reachability while a bill is showing; root to decide.
- Preview clone cost, not yet measured.
- A latent Uninstall-from-retention defect, read from source and not reproduced.
- Plan 37 decides skip and optional lanes, Plan 29 the numbers, and Plan 36 the distortions.
