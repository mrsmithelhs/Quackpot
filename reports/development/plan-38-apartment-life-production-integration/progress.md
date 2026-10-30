# Plan 38 progress: apartment life production integration

- **Lead:** the existing Plan 28 Opus thread. Branch C, no advisor. Date: 2026-10-30.
- **Readiness:** `plan-status.js check plan-38` returned RUNNABLE (bounded launcher, exit 0).
- **Interface and ownership map:** `implementation-map.md`.

## Ready for owner review: yes

**Review URL** (the owner's running dev server): `http://localhost:5173/Quackpot/`
- **Use a fresh run.** That origin holds your real save, and the new flow will continue it.
- **To keep your save untouched**, open `http://[::1]:5173/Quackpot/` instead. It is a separate browser origin with its
  own storage. All lead browser evidence below was taken there, so your `localhost` storage was never read or written.

**Named scenarios to try**
1. **Fresh run, Day 1.** Name the duck. You go to the kitchen and buy breakfast from the bakery downstairs. Then Open
   Quackpot → gacha. Proceed now reads "Next: Midday Race".
2. **Rent short.** Buy the $0.99 starter pack on Day 1 afternoon. Day 2 goes breakfast → fridge notice → Decide →
   "Try to pay $15.00" (nothing is taken). Then the offers, each in its own place: Marisol's text, the couch tag, the
   TV tag, the card app. Only the card decline says the run ends.
3. **Paid with exactly $15.** Decline the starter. Paying rent leaves $0.00. The shift (desk) and the couch sale
   (living room) wait as optional places. Taking either closes the other. Go to work pays one wage.
4. **Interruptions.** While holding the letter or the phone, use Uninstall (twice if you like), then Stay: the same
   object is still in your hand. Settings over a confirm restores it on close. Reload anywhere.

## Before and after

| Beat | Before | After (selected mix, D20) |
|---|---|---|
| Breakfast ×3 | $5 charged silently at transitions (`main.js:342/651/661`) | Kitchen plate, "Buy breakfast for $5.00", charged only on that tap (D9) |
| Rent | Phone card with Pay | Fridge notice (T1): a held letter with no controls, plus a collapsed Decide panel |
| Rent short | Escalation modal | Each offer where it lives: phone (T2) for the shift and card, object confirm (T4) for couch and TV. Accept, turn down (recorded), or Not now (nothing recorded) |
| Paid with exactly $15 | Zero-cash modal with three buttons | Optional places plus the day bar's "Go to work" (D22: missable by design) |
| Companion | Kit duck | Still posed duck: gaze, perch, and tilt only on a paperback (D18, D21). It never moves |

## What changed (files)

| Owner | Files |
|---|---|
| Lead | `src/main.js`: life routing, the commit guard (`expectLog`), `goToWork`, breakfast moved, crash and unknown-step recovery. `src/ui/life/life-routing.mjs`. `src/core/game-engine.mjs`: the repeated-Uninstall idempotency fix only. `src/ui/modals.js`: retired the zero-cash and escalation renderers. `src/ui/gacha-view.js`: Proceed label. `package.json` test list. `docs/repo-structure.md`. Kit fingerprint re-pin in `src/assets/apartment-weather/kit-fingerprint.test.mjs`. One engine regression test. Post-review fixes in `life-view.js` |
| Haiku A | `src/assets/apartment/{index,rooms/scene,desk/side,desk/top}.mjs`, `apartment.test.mjs`, `README.md`: `renderScene({duck:false})`, which defaults to `true` |
| Haiku B | `src/ui/life/life-{preview,copy,decisions}.mjs`, `life-decisions.test.mjs` |
| Haiku C | `src/ui/life/life-art.mjs`, `life-art.test.mjs` |
| Haiku E | `src/ui/life/life-routing.test.mjs`, `compat/old-saves.test.mjs` (this folder) |
| Sonnet D | `src/ui/life/life-view.js`, `life.css` |

- No engine rule, constant, event type or schema changed.
- No life-surface display logging (D10).
- No `reports/` imports, remote URLs or storage APIs in the life modules or the bundle (checked).

## Evidence

All Node runs went through the unchanged Plan 25 bounded launcher, serially.

**Tests (lead runs)**
- `npm test`: 284/284, exit 0, 3.0 s, peak 337 MB.
- Kit, old-save compatibility and apartment-view suites: 26/26.
- `npm run build`: exit 0.

**Kit default output (lead)**
- Byte-identical to `HEAD` across 252 area × framing × light × duck view × furnishings combinations
  (scratch comparison against a `git archive` copy).
- With `duck:false`, the duck and its shadows are removed and ids stay scoped (kit tests).

**Kit fingerprint**
- The Plan 24 weather tripwire failed as designed after the kit edit.
- `layers.test.mjs` still passes, so the hashes of `index.mjs` and `rooms/scene.mjs` were re-pinned with a note.

**Preview cost** (`measure-preview.mjs`)
- Clone-based ladder preview: median 26 ms on the real Day 2 save (47 events, 166 KB), 63 ms with +3000 events.
- Memoized per log length, so it runs once per decision render. No engine preview helper was added.

**Old saves** (`compat/old-saves.test.mjs`)
- Read-only: Plan 16 pending-reveal and starter-offer saves, plus both Plan 35 rent fixtures.
- These are historical artifacts. The test does not re-attest them, and no fixture, catalog or attestation was changed.
- Their recorded source identity now predates this build. This compatibility evidence comes from fresh runs and
  old-save regressions, not from the historical fingerprints.

**Real app, lead browser checks**

Taken on `[::1]:5173` in the built-in browser. Desktop pane is about 470–1024 px wide; narrow is emulated 375×812.

| Check | Result |
|---|---|
| Fresh Day 1 | Plate confirm; Esc commits nothing and returns focus; double click charges once (`expense_due` + `expense_paid` for `d1_food`); Done returns focus to the desk's "Open Quackpot" |
| Day 2 breakfast reload | Still unpaid, nothing charged; buying moves on to the notice |
| Rent short | The letter has no controls; Decide starts collapsed; the HUD is not inert while the letter is held; double "Try to pay" records one `expense_due` and cash is unchanged; focus moves to the phone |
| Uninstall while holding the phone | Pressed twice, logged once. Stay restored `escalation`, re-opened the held phone, and gave +80 gems once |
| Full decline path | Phone, then couch, then TV, then card. Only the card turn-down warns that the run ends. The run reaches the Receipt with `running_on_empty` |
| Accepting partway | Not now records nothing; the turn-down is recorded; a double "Sell the couch" gives one sale and one rent payment ($9.01). A double Go to work credits one wage. Day 3 breakfast, race and Receipt (`run_complete`, 4 bills, $30, `sell_couch` escalation) |
| Paid with exactly $15 | Result says "Rent paid … $0.00"; optional places survive a reload. A double "Work the shift" applies once; the couch place closes; Go to work skips `continue` and pays one wage → Day 3 $20 |
| Settings over the plate confirm | Life view inert under Settings; the confirm is restored on close; focus returns to Settings |
| Keyboard | Shift+Tab from the confirm heading reaches the HUD's Uninstall |
| Narrow, 375 px | The plate confirm is a sheet under the room; no horizontal scroll; the held phone and Decide panel are readable |
| Historical Plan 16 pending-reveal save, loaded as a test-origin copy | Opens in the gacha with 10 unrevealed cards (no replay). Proceed reads "Next: Breakfast in the Kitchen". A double tap charges `d1_food` once, then `d1_midday_race` at "day 1 midday" with the collection unchanged |

**Fixed during validation**
- The controller replaced the shared UI object, so focus was lost after Done.
- Nested `<main>` landmark.
- Stale day-bar cash under a result; the day bar now shows status only until Done.
- Stale gacha label "Morning Breakfast Expense".
- While an offer was owed, the day bar showed an unreachable "The kitchen" (routing fixed, test added).
- Routing read the ladder through a normalizing getter (now restores the index).

## Limits (not verified)

- **Reduced motion.** Real OS reduced motion is unverified. The harness cannot emulate it, and the
  `prefers-reduced-motion` paths were checked in source only.
- **Assistive technology.** No screen reader was used.
- **Desktop width.** The pane gave about 470–1024 px. No 1280 px wide layout was checked this time.
- **Art.** Duck placement on kitchen and desk was viewed. The living-room composition after a sale was not
  screenshotted; the furnishing removal itself is covered by kit tests.
- **Unreachable breakfast branches.** A short breakfast (skip lunch at the plate) and breakfast to exactly $0
  ("Continue") are routed and unit-tested only. They are unreachable under current constants.
- **HUD clock label.** It still reads "day 2 morning" during Day 2 rent. That predates this change and is unchanged.

## Delegation and consultation record

| Model | Role |
|---|---|
| Opus (lead) | Map; routing; controller; engine fix; all validation, browser checks and integration review |
| Haiku ×4 | A: kit option. B: decision models. C: art and poses. E: routing and old-save tests |
| Sonnet ×1 | The view layer. It was the largest fidelity-sensitive port, so it went to one writer with no sub-helpers |

- No workers ran Node, git or a browser. Only the lead validated.
- No advisor or Terra call (Branch C).
- Workers' self-reports were not taken as acceptance. Each was rerun or reviewed by the lead.

## Not touched

- Untracked `reports/development/plan-32-…/motif-preview/previews/`.
- The new untracked `reports/development/plan-37-action-time-and-optional-life-lanes/` (foreign).
- Fixtures, catalogs, attestations and packet status.

Nothing was pushed or deployed. Packet status was not set.
