# Owner repair 05 — launch message and reply, 2026-10-31

Source, implementation note and isolated browser harness: `134e1dd`. The morning phone now displays the in-world launch message, offers Reply “LAUNCH” or Put it down, and preserves an outgoing reply and incoming acknowledgment for later inspection. Everyone may claim the existing ten-draw welcome pull when the game opens; replying grants nothing immediately and is not required. Evening entry no longer fabricates an installation event. `owner-repair-05-mechanism.md` specifies the event order, presentation boundary and historical-save compatibility. Furniture remains gated by actual entry; historical installs are not relabeled as replies. Invitation, reply and acknowledgment are separately recorded observations; none claims an effect on the player.

The final Vite build passed. A bounded serial set of 116 engine, life progression, storage, Receipt and routing tests passed (4.46s, sampled peak 150 MB, no cleanup note). Tests include ordered new reply/ack facts, unchanged cash/Gems/life/RNG on reply, one welcome commitment on both choices, an install-bearing policy-1 history validated after entry and sale, and new no-install histories validated after entry and the welcome pull. These are synthetic histories, not every historical save. Isolated browser walks used separate temporary profiles/ports: desktop replied and narrow put the phone down; each later committed exactly ten draws. The reply route inspected outgoing and acknowledgment messages after reopening and reload, and checked Settings and Uninstall/Stay did not duplicate acknowledgment. Both walked through actual entry, sales gate, same-session committed-card resume and immediate uninstall. Initial browser harness needed its post-reload room navigation corrected; both final walks passed, with Chrome extension-registry warnings and no runner cleanup issue. These examples are not comprehensive assistive technology, device or legacy-save coverage.

QP Orch owns integrated and owner experience review; no additional advisor was requested. Owner browser storage and the existing server were not touched. The build was refreshed, with no packet-status change, push or deployment by the implementer.

---

# Integrated review follow-up — session navigation and hub impressions, 2026-10-31

QP Orch requested two bounded lifecycle repairs after review of repair 03. Source and regression harness are in `0f9b74d`. Successful phase changes clear the saved phone return destination; same-session suspension still resumes it, while a restored save with no active session opens the hub. Pending committed cards remain available from the hub. The hub records one shop/welcome exposure per visible hub instance: Settings and retention overlays do not generate impressions, a restored covered hub waits until actually uncovered, and a visible reload or actual re-entry may produce a new exposure. Historical log records are not rewritten.

The build passed. The serial life progression/routing set passed 51 tests, including a synthetic suspended race-result return across rejected and confirmed work departure. `browser-owner-repair-04.mjs` passed in an isolated desktop browser: Settings, Uninstall/Stay, reload while retention covers the hub, visible reload and actual re-entry were checked against event counts; a committed pull resumed in the same session, then survived put-down, phase advancement, next-day work departure, reload and later reopening through the hub. This browser route uses committed cards rather than a played race result; the race-result destination is covered by the focused engine test, not a browser race replay. Initial test attempts exposed a harness room-navigation mistake and a synthetic Day 1 session fixture mistake; both were corrected before the passing runs. Chrome reported extension-registry warnings. No new advisor consultation was requested; QP Orch performs integrated review. Its preview server and owner storage were not touched; no packet status, push or deployment changes were made.

---

# Owner experience repair 03 — integrated review handoff, 2026-10-31

Source and review evidence: `f7eb74c`. QP Orch authorized the bounded repair in `reports/orchestration/plan-38-owner-experience-repair-03.md`; the pre-write mechanism is `owner-repair-03-mechanism.md`. The repair is ready for orchestrator integrated review and subsequent owner review; packet status and owner acceptance are not implementer decisions. QP Orch owns coordination of the existing preview server and review window. The preceding delivery and server statements below are historical, not current server status.

The kitchen is one room with breakfast/dinner and the rent notice; on Day 1 the notice becomes active and receives focus after breakfast is resolved. Room navigation is separated from advancement controls. Going to work reserves one afternoon shift, whose explicit completion pays $60 once. A single desk phone offers the fictional morning installation and opens the game directly when available; install and first entry are factual, deduplicated log evidence, with legacy actual-entry evidence recognized. Sales do not appear or commit before actual entry. The companion is positioned on room surfaces and remains present after couch sale and in recovery. The day-one shift returns to the kitchen for dinner. New unsurfaced overdue rent takes precedence; recovery continuation returns to the bedroom or due rent as appropriate. No new persisted life defaults or retroactive changes to historical intents were introduced.

Verification: the named serial bounded core/storage/Receipt/routing compatibility set passed 132 tests; a later focused set passed 61. They include synthetic old policy-1 history and old-schema fixtures, entry ordering, no double wage, suspended-session confirmation, and overdue-rent handling. The final Vite build passed. Isolated browser walks on the final build at desktop 1280 ordinary motion and narrow 390 reduced motion exercised breakfast buy/skip, notice focus, invitation/install or direct install-and-open, work and mid-work reload, dinner, one-click entry, put-down and resumption of a committed pull, post-entry couch sale, and uninstall. Screenshots `owner03-*-1280.png` and `owner03-*-390.png` capture those rooms. Independent desktop/narrow recovery walks reached overdue rent and zero health, verified one recovery and continuation after reload; the bedroom images were captured after the bedroom positioning repair but before the final navigation-only styling. A separate real Tab/Enter narrow walk covered setup, breakfast skip, departure and shift completion. The final desktop/narrow walks were rerun after the navigation grouping, and the narrow kitchen screenshot was inspected. Chrome emitted extension-registry warnings; an initial unprivileged Chrome launch failed, followed by successful bounded runs. A prior bounded run reported a survivor-termination access-denied cleanup note; subsequent process inspection found no remaining Node/Chrome/Edge processes. The owner preview server was not stopped or restarted by these checks.

These are isolated browser and synthetic compatibility examples, not proof for every historical save or device. Physical devices, comprehensive assistive technology and keyboard paths, whole-run balance and the 30-minute pacing target remain unverified. Owner judgment of the room composition and flow is still needed. No new advisor consultation was run for this authorized repair; the existing orchestrator review is the delivery gate. No push or deployment was performed.

---

# Current Plan 38 handoff — 2026-10-31

New runs use the integrated policy-1 progression. The owner-selected working budget is **$80 starting cash, $60 per completed scheduled shift, $6 per meal, and $170 remaining rent**. Source/evidence commits: `c266a20`, `15a8c53`, `603610b`, `ed28b54`, and `9d3f9d2`; the integrated evidence record is `06cd95a`; narrow repairs and the finite preview script are in `38fd89f`. The later “Codex integration delivery” section describes the actual route and review dispositions. QP Orch is reviewing the source and evidence; owner acceptance and packet closure are pending.

The integrated named bounded test set passed 118 tests; the later focused repair set passed 65 tests, and the Vite build passed after repairs. Isolated desktop ordinary-motion and narrow reduced-motion Day1–4 walks covered a mid-work reload, phone return, committed race reload, Day4 affordable rent withholding, and Receipt; an independent shortfall/recovery route and an engine-level Day4 collapse trace are recorded below. Narrow Tab/Enter covered the opening and shift agreement only. Exact-zero and deadline-collision cases have engine evidence, not browser evidence; physical-device, comprehensive keyboard/screen-reader, whole-run balance and 30-minute pacing remain unverified.

**No review server is currently running.** The isolated test URL was `http://127.0.0.1:4187/Quackpot/`; it must not be treated as live. An optional owned, loopback-only, finite Python static preview of the existing `dist/` build can be launched from the repository root with the command below. The report-local server prints its PID, stops after 15 minutes by default, refuses an occupied port, maps `/Quackpot/` into `dist/`, and checks resolved path containment. It does not watch or rebuild. The server has not been launched for owner review; QP Orch coordinates that window.

```powershell
python reports/development/plan-38-apartment-life-production-integration/preview_server.py --port 4187 --seconds 900
```

## Historical Plan 28/38 implementation record

The following older Opus record, including its owner-review readiness, port 5173 and $15 Day2 scenarios, is retained as historical evidence and does **not** describe the current integrated route.
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

## Codex implementation work in progress — 2026-10-31

**Not ready for orchestrator or owner review.** Intermediate commits `c266a20`, `15a8c53`, and `603610b` stage a new-policy transition/configuration and replay foundation, plus partial adaptations of the existing kitchen and rent-notice views. New runs still use the legacy policy: the new progression is not activated. The staged breakfast and rent surfaces are not yet connected into a complete controller route. The briefly drafted generic action panel was removed because it replaced accepted apartment object/held/decision interactions.

The foundation has opt-in schema-4 life intents, work acceptance/completion, meal and health effects, session allowance, rent outcomes, pending recovery, paid pulls, repeat race IDs, replay validation and log-derived Receipt changes. It is not a verified complete implementation: commits/outcomes still need integrated lifecycle and adversarial review; in particular, free room/phone/Dex navigation, phase-specific warnings, debt/escalation/sales, presentation and saved phone/race re-entry require end-to-end integration. The staged view adapters are incomplete, and a UI path must be built around the accepted objects and held-message grammar. Do not enable the new policy on this evidence.

Bounded test evidence: the named engine, storage, Receipt, life routing/decision and progression set passed 101 tests before the latest adapter work; subsequently the focused progression/routing/decision set passed 39 tests and the routing set passed 19 after the rent adapter. A local Vite build passed before the latest view edits. An earlier failed test was corrected and rerun. None of these runs is a Day1–4 browser walkthrough, accessibility check, integrated owner review, or proof of old-save behavior across all supported cases. No browser run or review URL was established. One Terra-medium pre-delivery review is authorized but has not run; this is incomplete work, with orchestrator-gate-only posture until the actual behavioral implementation is ready for its requested review.

The unchanged Plan25 launcher was used for the recorded Node tests/build. One initial preflight status check was run directly before the launcher requirement was read; it was repeated through the launcher and returned RUNNABLE. CIM process enumeration was unavailable; Get-Process preflight found no Node/Chrome/Edge processes. The Plan32 preview directory and Plan41 concept directory are unrelated and untouched. Packet status, push, and deployment were not changed.

## Codex integration delivery for root review — 2026-10-31

This section supersedes the earlier incomplete-work notice. Source/evidence savepoints: `c266a20`, `15a8c53`, `603610b`, `ed28b54`, `9d3f9d2`. New runs now select policy 1; legacy schema 1/2/3 runs retain legacy progression. Ready for **root technical review and integrated owner review**, not owner acceptance or packet closure. The new work/evening presentation is modest and remains an owner look-for before any Plan40 visual adoption.

### Behavior and factual traces

- One saved life phase drives clock and daily routing. Morning breakfast, Afternoon scheduled work, Evening dinner/work/leisure/phone, and optional Late Night use engine-owned intents. Agreeing to work does not pay; completion credits the selected $60 once. Three missed scheduled shifts end that work lane, without adding an ending or post-termination job.
- The selected provisional budget is $80 start, $6 meals, $170 unpaid remaining rent, and $60 completed shift. Root-cleared working effects are +25 bedrest, up to +10 leisure, −15 overtime, and −10 next-morning fatigue only after an active Late Night pull/race. Meal skips lose up to 5 HP. No 70/30 threshold or invented social consequence is activated.
- The new session grants one pull action and one race per phase; the welcome ten-pull counts as one pull. Putting the phone down preserves a session, whereas Finish advances. Extension requires confirmation and names a directly displaced shift or Late Night fatigue. Draws/races resolve before presentation; saved re-entry uses committed outcomes. Actual shop and welcome terms shown by the phone are logged.
- Day4 arrival latches remaining rent regardless of notice inspection. Affordable Pay and Hold are distinct; hold retains cash and records overdue status, and a shortfall becomes overdue automatically. Early payment and exactly-zero cash are tested at engine level. A due decision survives zero HP and reload; recovery cannot advance past it. Existing couch/TV values are reused for voluntary one-time sales and the room state follows the sale; relationship effects remain a separate open Plan41 question.
- A fresh isolated browser path, at 1280 desktop ordinary motion and 390 narrow reduced motion, used breakfast, separate work agreement/completion, welcome pull, phone down/re-entry, a real race, dinner, Days2–3 work and meals, and Day4 Hold then Uninstall/Receipt. Observed cash: $80 start → $74 after breakfast → $134 after shift → $128 after dinner → $176 Day3 arrival → $224 Day4 arrival/hold. Work was reloaded while agreed, race was reloaded after commitment, and Day4 was reloaded before the rent choice. The shortfall scenario used actual skipped meals/missed shifts: $80 and 70HP at Day4; at Day10 evening HP reached zero, recovery was performed, reloaded at 25HP and continued with rent still overdue. This latter scenario is not the same as collapse at the deadline; a separate executable engine trace reaches zero on Day4 via three days of skipped meals/overtime/Late Night play, validates the due obligation, reload, and the recovery/hold ordering.
- The browser scripts use isolated temporary Chrome profiles and loopback Vite preview; no owner save was read or modified. `browser-day1.mjs` and `browser-recovery.mjs` are repeatable local harnesses. `browser-keyboard.mjs --narrow` used actual Tab/Enter for setup, skipped breakfast, and work agreement; it is not a full keyboard/assistive-technology audit. `rent-1280.png` and `rent-390.png` are synthetic review screenshots; desktop capture preceded final small cue-recording changes, narrow capture is from the final route. The preview used `http://127.0.0.1:4187/Quackpot/` only while each bounded run was active; it is **not currently running**. Root must coordinate an owner review server or run the unchanged bounded launcher with `node.exe node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4187 --strictPort`; its 90-second limit makes it a short-lived preview.

### Validation and compatibility

The final named serial bounded set passed **118 tests**: new progression, engine, storage, Receipt, apartment routing/decisions and four existing legacy/Plan35 save cases. It includes once-only work and welcome, session allowance/extension, holding/shortfall/zero-cash payment, signed health, asset sale, deterministic repeat races, reachable Day4 collapse and terminal-before-Receipt restore, plus corruption and storage-failure checks. These are focused checks, not a full suite. Final Vite build passed. Desktop normal-motion, narrow reduced-motion and narrow keyboard opening were separately run; on the final build the narrow Day1–4 route passed after the cue-logging additions. The normal-motion and keyboard runs preceded those small additions and are not claimed as final-artifact retests. Chrome emitted environment extension/updater diagnostics but the named runs exited 0; Chrome failed to start inside the sandbox due to crash-server access and the isolated runs used the approved escalated launcher. No watchers, installs, production data, push or deployment.

Schema 4 binds the known configuration to run-start evidence and replays life transitions; schema 3 race-rest evidence remains recognized and older saves are not assigned a new life phase or reseeded. Four legacy examples were loaded through existing tests; no Plan35 fixture or attestation was rewritten. Storage read denial, write/quota and serialization failure use explicit warning/preservation paths; a crash before a successful save can restore the previous durable snapshot. This is not an atomic durable transaction guarantee.

### Read-only review and disposition

One requested `gpt-6.1-terra` / medium child reviewed the then-current implementation under instruction-read-only posture. The child reported its actual model/effort could not be independently observed. Parent status inspection after the review showed the expected owned work and unrelated Plan32/41 untracked artifacts; because parent edits continued during review, this is not a structural read-only guarantee. One finding had two parts: **accepted** the Day1 notice incorrectly saying rent was overdue before Day4; corrected copy to identify the prospective balance and verified the early-notice browser route. **Rejected** the claim that the paid notice offers a Pay action: independent inspection shows paid notices are marked done and do not open a decision; no change was needed for that part. Review took one child turn and roughly several minutes. Small follow-up changes (Late Night fatigue only on active commitment, storage getter handling, cue logging, UI wording and associated tests) were made and independently checked after the review; no second advisor was run.

### Owner look-fors and remaining limits

Review the work-agree/doing/complete presentation, dinner and voluntary sales, Day1 invitation and free phone return, the session extension warning, and Day4 Pay/Hold/shortfall with its remaining-rent language. Values and placeholder work/evening treatment are working inputs, not final balance/visual approval. Ordinary 30-minute pacing, broader economy balance, physical devices, full keyboard/screen-reader access, all motion transitions and the exact-zero and collision cases in a real browser are not established. The Plan41 social consequences and post-termination overtime remain unresolved; no new social or lending terms were invented. Packet status is unchanged; no push/deploy. The untracked Plan32 preview and Plan41 concepts remain untouched.

## Root review repair — 2026-10-31

`reports/orchestration/plan-38-progression-delivery-review-01.md` requested two bounded repairs. Source/evidence commit `38fd89f` adds once-only factual pending-work and active-session interruption records before terminal, without a wage or missed-shift consequence. The Receipt now reports work agreement and an unfinished shift. Both Uninstall/Leave and Finish are checked, including repeat requests and terminal-before-Receipt restore. Overtime completion now reports the signed HP delta from the committed effect; the focused regression checks normal −15 and clamped 5→0 (−5), recovery creation, and duplicate completion rejection.

The named bounded repair set passed **65 tests** (progression, Receipt, storage and decision tests). The final Vite build passed. Two isolated browser probes on the rebuilt artifact verified unfinished-shift Receipt after Uninstall and normal overtime result text `Health changed by -15 HP (100 → 85)`. The clamped 5→0 case is engine/view-model evidence, not a browser run. One test launcher returned `CleanupNotes: survivor termination: Access is denied.` even though its root exited 0; a subsequent process check found no remaining Node, Chrome or Edge process. No additional advisor ran.

`preview_server.py` and `preview_server_test.py` are report-local. Pure path-prefix/containment and JavaScript MIME checks passed; the symlink-escape test was skipped because this host could not create the link. No preview server was launched in this repair turn, so bind behavior, served bytes and owner access are not claimed as observed. The command above is for root's coordinated review window. The earlier inline Python command and earlier preview instructions below are historical and superseded. No packet status, push, deployment, owner save or unrelated Plan32/41 artifacts were changed.