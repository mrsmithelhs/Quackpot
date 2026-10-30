# Plan 28 — Progress

## Overall summary

**Stage 1 (mechanism and experience proposal) has been delivered for root review.** No executable comparison, browser,
server or Node run has happened beyond the bounded packet check. Stopped at the gate: the handoff requires root
clearance before prototypes. This record was written 2026-10-30 (system date). Lead: Claude Opus 5.5 in the Claude Code
desktop app. The owner chose the model at assignment.

## Files (all owned, under this folder)

- `proposal.md`: shared baseline, two directions (A "Things in their places", B "One desk, one phone"), routing
  diagram, owner decision questions, provisional lean (A), proposed comparison files/APIs/hypotheses/validation,
  lifecycle handling, and open questions.
- `current-mapping.md`: the current trigger → engine → display → log mapping for each life moment, with line
  references. It also lists absences and current-copy defects.
- `storyboards.md`: lead-edited copy and moment-by-moment storyboards for both directions, plus draft dispositions.
- `drafts/copy-direction-a-paper/copy.md`, `drafts/copy-direction-b-phone/copy.md`: Haiku drafts, kept as sources.
  `storyboards.md` supersedes them.

Commits: `8efd5c1` (proposal, mapping, storyboards, drafts), then this report.

## Commands run

- Inspected existing Node processes before launching. There were nine, the largest 101 MB private. None were touched.
- Bounded launcher (unchanged Plan 25 script): `plan-status.js check plan-28` returned exit 0,
  `RUNNABLE: plan-28 is ready to implement`, peak sampled private memory 15.3 MB, 0.6 s.
- Read-only `git`, `grep` and `sed` only. No npm, no tests, no build, no server, no browser.

## What was verified and how

- The life-event flow, log events, restore logic, transitions and modal copy were read directly in `src/main.js`,
  `src/core/game-engine.mjs`, `src/ui/modals.js`, `gacha-view.js`, `desk-view.js`, `apartment-view.mjs`,
  `stage-transition.js` and `src/core/receipt.mjs`. Line references in `current-mapping.md` were re-checked with
  `grep -n`, and three ranges were corrected.
- Subagent claims checked against source before use:
  - `renderScene` options and enums: `src/assets/apartment/index.mjs:18-36, 84-100`.
  - No envelope, letter, door or plate prop: grep.
  - Kitchen bar surface and props: `rooms/specs.mjs:40-46`.
  - design.md:129-135 (still duck, pawn scene) and :156-158 (immersion: objects and messages, the apartment empties).
  - DECISION-031 (decision-log.md:307).
- **Not verified:**
  - Any rendered appearance. No scene in this proposal has been rendered.
  - Plan 35 fixture contents beyond the catalog summary.
  - The discrepancy the Plan 35 researcher reported between the catalog `productionSourceFingerprint` and the
    fingerprints cited in run logs. This was reported to me and not checked; it is relevant only if fixtures are used
    in §6.

## Haiku delegation (actual use)

Five Haiku subagents. The first three ran concurrently and were read-only. The two writers ran concurrently in
separate draft folders.

1. Art-kit API inventory, read-only. This helped: it established that the kit has no envelope, bill or plate art. It
   also confirmed that couch and TV `removed` states exist, and that production mounts only `desk-side`. It noted
   README drift ("Not imported by the game", which is no longer true). I did not chase that drift further.
2. Accepted-decision synthesis, read-only. This helped: it confirmed that the life-event values are trial values only,
   and it found the design.md immersion rule and DECISION-031.
3. Plan 35 rent checkpoint summary, read-only. This helped: it supplied the fixture ids and the in-memory loading
   constraints used in §6.
4. Copy writer, Direction A (paper), output in `drafts/copy-direction-a-paper/`.
5. Copy writer, Direction B (phone), output in `drafts/copy-direction-b-phone/`.

Both writers produced usable voice, risk lists and correct arithmetic. Both also invented a "back to the offers" step
after the final decline. I rejected it as a new rule. The other dispositions are in `storyboards.md`.

No higher-tier subagent and no recursive fan-out was used.

## Problems and resolutions

- The art kit has no paper props. Direction A therefore proposes CSS/HTML paper. This is raised as an owner question
  (Q2), not a new drawing.
- The current location restore (`phoneOpen = step !== 'desk'`) would put life moments back in the phone after a
  reload. §2.2 proposes a derived `lifeLocation` instead of new persisted UI state.
- Current-copy defects were found and recorded, not fixed:
  - The final ladder decline ends the run without saying so.
  - The paid-zero state uses alarm styling.
  - The breakfast is named but never shown.
  - A latent food-shortfall modal sync issue, not reachable at current values.

## Consultation posture

**Branch B: advisor consultation not warranted.** This delivery is docs and proposal only and has no behavioral
surface. The orchestrator gate applies. If the comparison is cleared, it will contain report-local code. Whether any
advisor applies then is for root to state; this assignment authorizes no higher tier.

## Foreign work in the tree

`reports/development/plan-32-gacha-music-hook-and-arrangement-prototypes/motif-preview/previews/` was untracked before
this session started. It was left alone and not committed.

## Owner and root decisions still needed

- Root:
  - Clear the §6 comparison files, imports, fixture use and Node hypotheses.
  - Schedule one shared browser turn on the existing dev server.
- Owner:
  - Q1: direction and landlord voice.
  - Q2: CSS paper versus a future SVG-prop proposal.
  - Q3: display-only morning ledger versus click-to-charge breakfast.
  - Q4: life-display `cue_shown` evidence. This is outside this packet.
  - Q5: pawn scene seam only.

## Remaining risks

- The provisional lean toward A is untested. Several camera cuts in one afternoon may feel busy once rendered.
- Fixture use depends on the Plan 35 fingerprint discrepancy being benign. Fallback: synthetic states clearly labeled
  as display-only.
- The extra return and enter transition around the Day 1 morning ledger adds two short animations. Its feel is
  unmeasured.

## Owner direction folded in (2026-10-30, direct conversation)

Recorded in `owner-direction-2026-10-30.md`, and `proposal.md` §0, §2.7, §5 and §8 were updated:

- Direction A is selected.
- The duck may travel between scenes but stays still within each composition.
- Styled HTML paper is acceptable.
- Guidance should relax over the run.
- Optional lanes are wanted, such as missed meals, skipped shifts and possibly being fired.

The lanes are new rules. They are listed with scope flags and a routing question; none are implemented or authorized
by this record.

I explained the "landlord voice" question to the owner. My recommendation was an institutional rent bill, with named
people kept for optional lanes. **The owner chose the property office** (D6). The proposed A-only build therefore
compares duck placement only.

**For root:** the owner's choice changes what the next build should compare. I propose an A-only build that compares
duck placement instead of A versus B (owner-direction §4). This needs root's agreement because the
packet text asks for two directions.

## Stage 2: Direction A prototype authored (2026-10-30)

Authority: root prebuild review `reports/orchestration/plan-28-prebuild-review-01.md` (`e7cf2a0`) and the amended
packet. The owner approved continuing and recorded D7 (owner-direction file). **Authoring only.** The review cleared no
Node or browser run, and none was made. The exception is one slip, recorded under Commands run below.

### Files

All files are under `comparison/`. Roles and read-only imports are listed in
[validation-plan.md](validation-plan.md):
- `index.html`, `prototype.css`, `prototype.js`
- `life-model.mjs`, `views.mjs`, `fixtures.mjs`
- `plan28.test.mjs`

Also added: `validation-plan.md`, `drafts/static-review/notes.md` and `drafts/student-read/notes.md`.
`owner-direction-2026-10-30.md` gains D7.

### How each review requirement is met

1. **Ownership and imports.**
   - All writes are in this folder.
   - The imports are read-only: `GameEngine`, `GAME_CONSTANTS`, `validateSave`, `renderScene`, and
     `createStageTransition` with its CSS.
   - Each scene gets a unique `p28-s<n>` idPrefix.
   - I read the kit API in `index.mjs:18-143` and used no anchors it lacks. The travelling duck uses each area's
     existing anchor.
2. **Direction A with the selected communications.**
   - Rent is a Harbor Court Property Office bill. The shift arrives as a desk-side message from Marisol. Sales use
     living-room listings, and the card advance is a desk-top statement.
   - The meal and wage ledger states past-tense facts projected from the log. Its only control is Continue.
   - The engine call order matches `main.js`, including `proceedToDay2Evening` at 658-665.
   - Reviewer controls sit in a separate dark panel labelled "not student UI".
3. **Fixtures.**
   - `fixtures.mjs` checks each fixture against the Plan 35 validation-index pins: bytes, SHA-256, recorded
     `valid`, event count and chain head. It also checks the catalog status and boundary, and runs `validateSave`.
   - It does not re-derive capture origin.
   - On any mismatch it shows expected and actual values and stops. There is no synthetic fallback.
   - Synthetic content is limited to the Day 1 ledger (a log projection) and the return composition, which is
     labelled display-only.
4. **No storage.**
   - No storage, IndexedDB or service-worker API appears anywhere in `comparison/`. Only same-origin `fetch` reads
     are used.
   - The browser gate compares storage keys before and after.
5. **H1 routing.**
   - `ROUTES` is a table grounded in source, with line citations.
   - It names one controller-only step (`duck_dex`) and one future row (food shortfall).
   - The tests reach states only through real actions, including Uninstall Stay and Leave over the ladder. Engine
     history is never edited.
   - The test header says that this does not prove production reload, focus or transition integration.
6. **H2 furnishings.**
   - All four combinations are checked against rendered SVG markers: sofa `#6d6d64`, TV screen `#15191f` and ghost
     `#c9c3b8`. Each marker occurs once in the kit (grep). The checks also use the real `assetsSold` after actual
     couch and TV sales.
   - Visual confirmation is part of browser-gate step 4.
7. **The H3 regex gate is replaced by semantic cases.**
   - The amount on every control comes from the `escalation_result` event a clone appends.
   - The tests take the real action and compare the label with the actual effect.
   - Pay is never shown as paid before the click.
   - The run-ending decline flag must equal the real outcome, and exactly the last decline carries it.
   - Paid-zero never ends the run.
8. **Clicks and cues.**
   - A token plus a generation-owned busy flag disables controls on first activation. The engine is unchanged.
   - Actual engine events and the proposed display cues are listed separately, and the cues are labelled as
     projections that were never recorded.
9. **Lifecycle claims.**
   - The HUD is a labelled stand-in, with "not functional here".
   - The validation plan lists what is not shown: production HUD, save and reload, Shell A routing, screen readers
     and devices.

### Seams left for Plan 37 and Plan 29

None of these is implemented:
- `ledgerFacts`/`ledgerView` read past-tense facts from the log, so a future "meal missed while in Quackpot" event
  would add a line without new UI.
- `ROUTES` has explicit `future` rows.
- `sceneFor` maps a moment to a place.
- The card kinds already cover note, bill, message, listing and statement.

### Haiku delegation (Stage 2)

Two Haiku tasks ran concurrently, with disjoint output folders:
1. **Static code review (source only).**
   - It confirmed the imports, `renderScene` arguments and phone-text limits.
   - It confirmed the engine signatures and the fixture pins. It traced the SHA-256 values, byte counts and chain
     tails against the files.
   - It found two real bugs in `prototype.js`: a stale async action could overwrite a newer scenario, and the old
     card stayed clickable during load. It also found an unhandled scenario-load rejection, an unresolved accept
     mapped to the wrong moment, an impure preview contrary to its comment, a wrong citation, duplicate cues, and
     busy-flag ownership.
   - **All were fixed except one.** For the impure preview I corrected the comment rather than the call, because
     `previewLadder` deliberately calls the live `getCurrentEscalationStep()` exactly as `modals.js:90` does.
2. **First-time student read of the copy.**
   - **Adopted:** "then $15.00 rent paid" instead of "rent then paid"; "$15.00 more owed" instead of "+$15.00 debt";
     "Rent unpaid · you need $0.99 more" and "Nothing has been taken"; "Skip this offer (rent still $0.99 short)";
     "this run ends. Your Receipt is next."; "gone for good" on listings; an "optional" line on paid-zero; health
     shown as before → after; and the rent status shown first in outcomes.
   - **Not adopted:** explanations of later effects of health or debt. Those would assert future rules that belong to
     Plan 29 or Plan 37.

### Commands run (Stage 2)

- Read-only `git`, `grep`, `sed` and Python JSON inspection only.
- **Slip:** one command included a trivial `node -e "1"` outside the bounded launcher. It is not cleared by the review;
  it evaluates a constant and exits. No other Node, npm, test or server process was started.
- The desktop app auto-opened `comparison/index.html` in its Browser pane after the file was first written, probably
  via `file://`, where ES modules cannot load. I did not drive, inspect or rely on that pane. It is not browser-gate
  evidence.

### Consultation posture (Stage 2)

**Branch C: orchestrator-gate-only, no advisor call**, by explicit owner instruction (prebuild review). This is an owner
routing exception, not a capability failure. The Haiku static review is a lead-reviewed draft aid, not an advisor
consultation.

### Not verified

- Nothing has executed. The tests and the page are statically reviewed only.
- No visual layout, focus behavior or furnishing visuals have been seen.
- `validateSave` acceptance of the fixtures is expected from Plan 35's recorded `valid: true`, but it has not been
  run here.
- The Stage 1 "fingerprint discrepancy" risk is superseded. Root's read-only SHA comparison found no differences, and
  the loader now uses Plan 35's explicit validation pins.

## Stage 2b: source-review corrections and the cleared batch (2026-10-30)

Authority: root `reports/orchestration/plan-28-source-review-02.md` (`84d0148`). Branch C still applies, so no advisor
call was made.

**Corrections** (commit `10a9e90`):
1. `runScenario` now captures the scenario generation at launch. Its catch ignores a rejection from an older load, so
   a stale load can no longer set `busy` or replace a newer card.
2. The ledger now reads "Balance after breakfast: $X". This is the historic `cashAfter` value, no longer labelled as
   current "Cash on hand". The test expectations were updated and now assert that no ledger line starts with "Cash on
   hand". Fixtures were not changed.
3. Following the review's boundary note, `fixtures.mjs` and the reviewer panel now say this is a lightweight loader.
   It does not recompute source closure or validation-loader identity, and it is not Plan 35's freshness loader.

**Cleared batch: stopped at preflight. No Node command was run.**
- The processes were fine: all were Codex runtime, with a maximum of 101 MB and a total of about 306 MB.
- The Plan 35 evidence log has only 241,671 of its 1 MiB free.
- Each `checkpoint-proof.mjs fixture` append embeds the full save `state`, which is about 177 KB (measured from the
  identical existing field). So the second canonical check would hit the 1 MiB guard.
- Root said to stop rather than rotate the pinned log, so I stopped. Details and options (a)–(d) for root are in
  `validation-plan.md` §1.
- `plan28.test.mjs` therefore has **still never run**.

**Revised server/browser proposal** (`validation-plan.md` §2–3; browser execution is still gated):
- **Server.** Either reuse a verified root-approved server, or run `comparison/serve-bounded.py`. That script is
  finite and serves the repo root on 127.0.0.1 only. It exits by itself at a deadline of at most 900 s and overrides
  the module MIME types. A PowerShell wrapper registers the owned PID and stops it in `finally`.
- **Storage evidence.** Snapshot key/value hashes for localStorage and sessionStorage, the IndexedDB database list
  (the list only, not contents), the cache keys, and the service-worker registration count. Take one snapshot on the
  unique origin before load and one after, in a new in-app tab. The game's storage is never inspected.
- **Double activation.** Check one append of the specific event per clicked action: `expense_due` for Pay and
  `escalation_result` for Accept.
- **Scenario switching.** Switch during the transition. Also use the new reviewer-only `?fail-load=<scenario>` fault
  injection to exercise the stale-failure path.
- **Reduced motion.** `?motion-off` is not equivalent evidence. Real OS reduced motion remains unverified unless root
  names a harness that can emulate it.

**Haiku use (Stage 2b):** none. These corrections were two small, precisely specified edits, and delegating them
would not have helped.

## Stage 3: root test evidence and the single browser gate (2026-10-30)

**Root's runs (not the Claude lead's).** Clearance `reports/orchestration/plan-28-tests-and-browser-clearance-03.md`:
- Root substituted a read-only canonical fixture preflight, `reports/orchestration/plan-28-fixture-readonly-check.mjs`.
  It calls the existing Plan 35 checks and has no append.
- Root ran it and `plan28.test.mjs` serially through the Plan 25 launcher:
  - fixture preflight: exit 0;
  - tests: **12/12 passed**, exit 0;
  - in both runs `StopReason` was null and stderr was empty.
- The Plan 35 log is unchanged: 806,905 bytes, `610a080c…`. Nothing was rotated or appended.
- Details are in `validation-plan.md` §1. The Stage 2b note that `plan28.test.mjs` had "still never run" is now out of
  date.

**Browser gate (run by the Claude lead, once).** The full record is in `browser-gate.md`.
- **Server.** `serve-bounded.py` ran as PID 22224 on 127.0.0.1:5228 from 13:38:42 to 13:44:33. It served 100 GETs:
  90 returned 200, and 10 returned 404 for `robots.txt` or `favicon.ico`.
- **Cleanup.**
  - I stopped the owned PID myself.
  - The wrapper's immediate port check printed a stale "still listening".
  - An independent re-check found no listener in `netstat`, a refused probe, and no Python process.
  - No other process was touched.
- **Storage.** The before and after snapshots on the disposable origin were identical, and all empty.
- **Player-facing checks.** All passed at 1280×720 and 390×844:
  - fixture panel;
  - the paid-zero and unpaid branches;
  - the real couch disappearance;
  - the final-decline disclosure and the Receipt stand-in;
  - focus on the card heading;
  - one event per double activation, by keys and in the same tick;
  - switching scenario during the transition;
  - the `?fail-load` stale-failure race;
  - return from the gacha appending nothing;
  - `?motion-off`.
- **Findings, none repaired.**
  - B1: the reviewer `<select>` overflows the page horizontally at both widths. A one-line CSS fix is proposed.
  - B2: at 1280×720 the card scrolls internally. This is an observation.
  - B3: the reviewer panel goes stale in the injected-failure state. This is an observation.
- **Unverified.** Real OS reduced motion is unverified, because the harness can't emulate it. Screenshots were
  viewed, not saved.
- **Morning framing.** I recommend medium by default, with wide once as the Day 1 establishing shot. At 390 px the
  wide frame shrinks the duck to about 10 px.

**Haiku use (Stage 3):** none. The gate was a single serial browser session that only the lead could drive.

## Ready for orchestrator review

Yes:
- Root's tests passed.
- The single cleared browser gate is complete, and every player-facing check passed.
- The owned server is confirmed closed.

Still open:
- **Root:** whether to clear the B1 one-line CSS fix (reviewer panel only).
- **Owner:** the morning framing. The options are medium throughout, wide on Day 1 only then medium (recommended),
  or wide throughout.
