# Plan 28: final delivery

**Apartment choices and diegetic communications.** Revised delivery after root's composition revision 05, dated
2026-10-30. Delivered by the Claude lead under clearance 04 (Branch C, no advisor).

It is returned to root for **one** decision: whether to assign a cohesive implementation packet for the selected mix.
That decision includes one small Plan 25 kit change and the ordering and exposure changes the owner needs to confirm
(`integration-proposal.md` Part A, A0 and A9).

The earlier delivery, which used the floating-card treatment, follows below as history. Revision 05 did not select
that treatment.

## Selected experience

The owner's decisions are in `owner-direction-2026-10-30.md` §6–8 (D11–D21). The interaction language has three layers:
1. **In the room:** objects in their places. The attention signal is a halo, a marker chip and the duck's gaze. It
   fades with guidance but never disappears, because the duck is the character's conscience.
2. **Held:** the player picks up a letter or the phone and reads it freely.
3. **Decide:** the game's own panel, which starts collapsed, or an honest app button, or a confirm attached to the
   object. It is the only place anything is committed, and it states the exact consequence.

**The mix (D20):**
- **T1** for paper: the rent notice on the fridge.
- **T2** for phone-native beats: Marisol's shift and the card advance.
- **T4** for quick object actions: selling the couch or TV, and breakfast from the bakery downstairs.

Top-down desk interactions are reserved for future moments.

**Duck:**
- It is posed from the kit's own artwork: facing left or right, top-down at any heading, or on perches (D18).
- It tilts only when propped on a believable object, by at least 12° (D21).
- It turns to face you once the moment's responsibilities are done.

## Before and after

| Beat | Before (production today) | After (selected) |
|---|---|---|
| Rent due | A phone screen with a Pay button | A notice taped to the fridge, picked up and read, then Decide and "Pay $15.00" |
| Rent short | An escalation modal | The panel says "$0.99 short; nothing will be taken" and offers "Try to pay". Each offer then appears where it lives: Marisol's text, the couch or TV sale tag, the card app. Each can be accepted, turned down (recorded) or left for now (nothing recorded). Only the final turn-down says the run ends. |
| Paid with exactly $15 | A zero-cash modal with two option buttons | The paid notice is stamped. The optional shift and couch sale wait in their places, and the day bar offers "Later that afternoon" and "Go to work". |
| Breakfast | Charged silently at the evening transitions | A plate on the counter, then "Buy breakfast for $5.00" from the bakery downstairs |

## Prototype

- **Where:** `gallery/`, opened through your dev server (D17):
  `http://localhost:5173/Quackpot/reports/development/plan-28-apartment-choices-and-diegetic-communications/gallery/index.html?m=MIX-unpaid`
  Use `?m=MIX-paid` for the other branch. The T1–T4 moments remain as reference.
- **Stand-ins (disclosed):** Save, Settings, Uninstall, the Receipt, races and the gacha.
- **History:** `comparison/` holds the earlier floating-card prototype.

## Evidence

Each item is attributed to whoever produced it.

**Tests (lead)**
- `gallery/gallery.test.mjs`: 7 of 7 passed through the Plan 25 bounded launcher. Exit 0, 0.55 s, `StopReason` null.
- `comparison/plan28.test.mjs` is unchanged since its 13/13 run.

**Browser (lead, on the owner's dev server)**

All four gallery sessions are recorded in `gallery/README.md`. What they showed:
- **Flows:**
  - both mix branches end to end;
  - the full unpaid decline path, ending in `terminal`;
  - accepting partway, where a double click charged once;
  - "Not now" and Esc recording nothing;
  - the keyboard walk with focus following into each new place.
- **Layout:** no horizontal scroll at 390 px in six moments, after two layout fixes. The narrow confirm became a sheet
  under the room, and halos are clipped to the room.

**Owner-reported bugs:** the T3 notepad couldn't be put down, and "Go to work" after the extra shift did nothing. Both
are fixed and verified.

## Limits

- **Storage:** no snapshots on the dev origin, because it is the real game's origin and its storage is never read.
  The gallery uses no storage APIs (source evidence only).
- **Reduced motion:** real OS reduced motion is unverified.
- **Evidence form:** screenshots were viewed, not saved. Pose review used an in-page zoom for inspection.
- **Duck placement:** the duck is drawn by removing the kit's duck in the page. Production needs the A2.3 kit option.
- **Art:** the sketch props and perches are not final art.

## Remaining risks

- Optional beats are less exposed (A9.2).
- More taps per beat.
- Scene cuts on the ladder.
- The preview cost and the Uninstall-from-retention defect carried over from before.

---

# Earlier delivery (floating-card treatment, not selected by revision 05), kept as history


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
  - The record covers the rent branches, real sale disappearance, final decline, focus, duplicate activation,
    scenario/error switching, return and motion-off using a mix of real keys and DOM scripts. The per-case table
    distinguishes which checks ran at each viewport; it is not full keyboard coverage of every case at both widths.
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
- **Compatibility:** state-derived routing needs explicit handling of old pre-breakfast and interrupted saves.
  Plan35's current tool rejects changed production-source closures; compatible reuse needs a reviewed policy,
  not automatic re-attestation or wholesale recapture. Root corrected the integration proposal accordingly.
- **Validation:** proportionate.

## Remaining risks

- Tutorial pacing of a Day 1 breakfast before the phone opens.
- One more tap each morning.
- HUD reachability while a bill is showing; root to decide.
- Preview clone cost, not yet measured.
- A latent Uninstall-from-retention defect, read from source and not reproduced.
- Plan 37 decides skip and optional lanes, Plan 29 the numbers, and Plan 36 the distortions.
