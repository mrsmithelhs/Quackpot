# Plan 28: Direction A browser gate (root clearance 03)

- **Date:** 2026-10-30, 13:38:42–13:44:33 local.
- **Source:** HEAD `6a932bb`. The prototype files are unchanged since `134b2d6`. No source was changed during the
  gate.
- **Run by:** the Claude lead, in one in-app browser tab. That browser is separate from the owner's Chrome.
- **Clearance:** `reports/orchestration/plan-28-tests-and-browser-clearance-03.md`. Root ran the tests and the
  fixture preflight before this gate, not the Claude lead; see `validation-plan.md` §1.

**Overall:** every player-facing check passed. There is one reviewer-panel layout failure (B1), recorded without a
repair. Real OS reduced motion stays unverified. Screenshots were viewed, not saved, so this file is the only record
of what they showed.

## Server and resource evidence

**Preflight**
- Nine `node.exe` processes were running, all Codex runtime. The largest used 101 MB private.
- No Python process was running.
- Nothing was listening on 5228.
- Python: `C:\Program Files\Python314\python.exe`, 3.14.7.

**Server start**
- The server was started from a background PowerShell wrapper with a hidden window. The wrapper's logic is the same
  as the wrapper in `validation-plan.md` §2. Its local copy was in the session scratchpad, not the repo.
- Command:
  `python -I reports/development/plan-28-apartment-choices-and-diegetic-communications/comparison/serve-bounded.py 5228 900`

**Owned process**
- PID 22224, started 13:38:42.
- Its startup line was: `pid=22224 root=C:\AI\Quackpot url=http://127.0.0.1:5228/ deadline_s=900`.
- `netstat` showed `127.0.0.1:5228 LISTENING 22224`, which means it was bound to loopback only.

**Requests**
- 100 GET requests in total: 90 returned 200 and 10 returned 404.
- The 404s were all `robots.txt` (the storage-snapshot page) or `favicon.ico`.
- stderr was empty.

**Shutdown**
- I stopped PID 22224 with `Stop-Process` at 13:44:33, after the closing snapshot and after closing the tab. That was
  about 6 minutes into its 15-minute deadline.
- The wrapper's `finally` then logged `exited=True exitcode=-1`. The exit code is -1 because the process was stopped,
  not because it hit its deadline.

**Cleanup discrepancy, resolved**
- The wrapper's port check ran immediately after the exit and printed `WARNING: port 5228 still listening`.
- About 20 s later, an independent re-check found:
  - no LISTENING socket on 5228 (`netstat -ano`);
  - an HTTP probe to 127.0.0.1:5228 was refused;
  - no Python process;
  - the node count unchanged at 9.
- My reading is that `Get-NetTCPConnection` returned a stale entry. Earlier in the run the same cmdlet had failed to
  see the live listener at all, while `netstat` saw it. So that cmdlet is an unreliable check here; use `netstat` or a
  probe instead.
- No other process was stopped.

**Other state**
- The Plan 35 log is unchanged: 806,905 bytes, SHA-256 `610a080c…cdd5`.
- The Browser pane's viewport was reset to desktop, and the tab was closed.

## Storage snapshots (origin `http://127.0.0.1:5228`, taken on `/robots.txt`)

| | localStorage | sessionStorage | IndexedDB list | caches | SW registrations |
|---|---|---|---|---|---|
| Before load | `{}` | `{}` | `[]` | `[]` | 0 |
| After all checks | `{}` | `{}` | `[]` | `[]` | 0 |

The two snapshots are identical:
- Each storage snapshot used SHA-256 hashes of the values, and both stores were empty.
- The IndexedDB list being empty both times shows that no database was created. It says nothing about any database's
  contents.
- The production game origin was never opened.
- Separately, source inspection still shows that `comparison/` uses no storage APIs.

## Checks

The column headers are the viewport sizes, 1280×720 and 390×844. "Keys" means real key presses (Tab, Enter and the
arrow keys) in the tab. "DOM" means a reviewer script called `.click()` or dispatched a `change` event. I say which
one each check used.

| # | Check | 1280×720 | 390×844 |
|---|---|---|---|
| 1 | Fixture panel | PASS: 15/15 rows agree for each fixture. paid-zero SHA `aacd26f3…`, 170,013 bytes, 46 events, head `eb597f89`. unpaid SHA `eafd6c2f…`. The note about the lightweight loader is visible. | n/a (same panel) |
| 2 | Paid-zero walk (keys) | PASS. Ledger "Balance after breakfast: $15.00." Then the bill: "Status: not yet paid." Then Pay leads to "Rent paid in full", PAID stamp, "Cash on hand: $0.00", with no failure wording. | PASS (keys to paid-zero) |
| 2a | Continue to evening | PASS. Day 3 ledger: "Balance after breakfast: $5.00." Events: `continue_to_wage`, wage +10, then food due and paid. | n/a |
| 2b | Extra shift | PASS. Desk-side scene, Marisol: "Thanks for covering tonight." The card states +$10.00 cash and −15 health, with health 100 → 85. | n/a |
| 2c | Sell couch | PASS. Living room shows the couch removed and the TV present. Sofa marker absent, ghost outline present. | PASS (DOM) |
| 2d | Focus after render | PASS. After each player action, focus lands on the card's `<h2>`. On first load, focus stays on `body`. After Reset, it stays on the Reset control. | PASS |
| 3 | Unpaid heading (keys) | PASS. "Rent unpaid · you need $0.99 more … Nothing has been taken." | PASS (DOM) |
| 3a | Decline all four (keys) | PASS. The first three decline buttons read "Skip this offer (rent still $0.99 short)". Only the card offer's decline reads "Decline — rent stays $15.00 unpaid and this run ends. Your Receipt is next." Then `terminal running_on_empty`, and the Receipt stand-in shows "This run has ended". | PASS (DOM) |
| 3b | Decline once, accept couch (keys) | PASS. The couch is removed, and the card reads "Rent paid in full: $15.00 … Cash on hand: $9.01." Events: accepted, then `escalation_result`, then `expense_paid`. | n/a |
| 4 | Double activation | PASS. Pay pressed with Enter twice gave 1 `expense_due`. Accept pressed with Enter twice gave 1 `escalation_result`. Two `.click()` calls in the same tick on Pay and on Accept each gave 1, plus 1 `expense_paid`. | n/a |
| 5 | Switch during transition (DOM) | PASS. While "Loading scenario… QUACKPOT" was showing with an animation running, I switched paid-zero to unpaid. The final card was the unpaid ledger ($14.01), and the panel showed the unpaid SHA. | n/a |
| 5a | `?fail-load=unpaid` (DOM) | PASS. Loading unpaid alone gives the blocked card "Injected load failure…". Loading unpaid and then, 100 ms later, paid-zero leaves the paid-zero ledger with Continue enabled once the stale failure fires at about 400 ms. The console showed only a favicon 404: no unhandled rejection or error. | n/a |
| 6 | Morning framing | Viewed in both framings; see the recommendation below. | Viewed in both framings |
| 6a | Return from gacha (keys) | PASS. Open Quackpot leads to the stand-in "Quackpot (landscape phone)". Return leads back to the Day 2 card. The event list stayed empty. | n/a |
| 7 | `?motion-off` (DOM) | PASS. The ledger, bill and paid-zero copy are identical to the animated run. `document.getAnimations()` peaked at 0. | n/a |
| 7a | OS reduced motion | **Unverified.** `prefers-reduced-motion` read `false`. The in-app browser can emulate only the colour scheme. | |
| 8 | Narrow layout | n/a | Player view PASS: the card sits below the scene (scene bottom 373, card top 383), and buttons are 44–84 px tall. **Page FAIL: B1.** |

## Findings (no repair made; the gate forbids source changes)

**B1. The reviewer panel's scenario `<select>` overflows the page horizontally.**
- At 1280 px, `scrollWidth` is 1453 against a `clientWidth` of 1265. At 390 px, `scrollWidth` is 564–772 against 390.
- The only element that overflows is `SELECT#scenario`. Its option labels are long, and the select has no `max-width`.
- This is reviewer-only UI, but at phone width the page scrolls sideways.
- Proposed one-line fix, for root to clear: `#scenario { max-width: 100%; }` in `prototype.css`, or shorter option
  labels.

**B2 (observation). At 1280×720 the card is an internal scroll region, so some content can be hidden.**
- On the paid-zero and unpaid cards, the lowest option sits below that region's fold. On the card-advance offer, the
  sender line is scrolled above it.
- Tab brings each control into view, so keyboard access works. A mouse user has to scroll the card.
- At 390×844 the card is in normal page flow and shows everything. Worth a look if Direction A moves toward
  production.

**B3 (observation).** In the injected-failure state, the reviewer panel's Moment and Scene rows still show the
previous scenario. This affects the reviewer panel only.

## Morning framing: recommendation for owner review

What I observed (screenshots viewed, not saved):
- **Medium** (close on the counter and oven):
  - The duck is large and clearly the subject at both widths.
  - At 1280 px the paper sits beside the duck without covering anything.
  - The kitchen reads as "a counter" more than "my apartment".
- **Wide** (whole kitchen):
  - Fridge, range hood, fruit bowl and mug establish a lived-in place.
  - The duck shrinks to about 10 px tall at 390 px and is easy to miss.
  - At 1280 px the paper covers part of the right-hand counter, where the fruit bowl is.

**Recommendation:** use **medium** as the default morning framing. The duck needs to stay readable as the companion
who travels between scenes, and most students will see this at phone width. Use **wide** once, as an establishing
shot on the first morning (Day 1). That gives the place to orient in before the routine starts, and it fits the owner's
"guidance relaxes over time" direction.

**Remaining owner choice:** one of these three:
- medium throughout;
- wide on Day 1 only, then medium (my recommendation);
- wide throughout.

## What this gate does not show

- **Production lifecycle.** Save, Settings, Uninstall and the Receipt are stand-ins, and so are the HUD and the races.
- **Real OS reduced motion.**
- **Assistive technology.** No screen reader or real device was used.
- **Storage contents.** The checks show that no database was created; they do not inspect any database's contents.
- **Retained images.** Screenshots were viewed during the gate; none were saved.
- **The earlier page.** The page the app opened on its own in Stage 2 is still not evidence.
