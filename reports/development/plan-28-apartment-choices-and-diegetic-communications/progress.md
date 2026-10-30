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

## Ready for orchestrator review

Yes, for the Stage 1 proposal. No prototype exists yet.
