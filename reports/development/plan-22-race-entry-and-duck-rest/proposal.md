# Plan 22 mechanism, lifecycle, evidence, and ownership proposal

**Date:** 2026-10-27  
**Stage:** Gate-approved Plan 22 implementation candidate; packet status remains in-progress pending orchestration/owner disposition.  
**Packet preflight:** `node scripts/dev/plan-status.js check plan-22` → `RUNNABLE: plan-22 is ready to implement`.

## Pre-implementation source facts

- `GameEngine.runRace()` resolves and serializes before mutation, returns an existing attempt on repeat calls, and distinguishes unresolved attempts from finished results. Only a finished result pays Gems, consumes a committed trial, and updates `completedRaces`.
- The accepted resolver receives an explicit `playerBaseSpeed`, applies the selected trial multiplier to that base input, then uses the shared `8.25 + 0.5 × rating` adapter. The current engine sets `restFactor: 1` as the reserved Plan 22 input.
- The append-only `race_result` event contains the selected duck identity. The current story has two race events. Save schema 2 validates race attempts, result-log reconciliation, and serialized resolver inputs; schema 1 migration preserves summary-only races as legacy records.
- The current race entry has a duck dropdown, stance radios, and an optional trial checkbox, submitted together. Its view callbacks record what was offered and commit once. The design describes the race as resolving after “one pre-race choice”; this proposal treats the existing submitted form as one atomic commitment and adds no rest choice. Confirm that interpretation before UI changes.

## Proposed rest mechanism

Rest belongs to the digital duck identity, not a physical copy. Derive it from completed, identity-bearing `race_result` events in append-only order:

| Completed races by other identities since this identity last raced | Rest factor | Display state |
|---:|---:|---|
| Never raced | 1.00 | Rested |
| 0 | 0.50 | Tired; 50% base-speed penalty |
| 1 | 0.75 | Tired; 25% base-speed penalty |
| 2 or more | 1.00 | Rested |

For the committed choice, pass `playerBaseSpeed = authoredDuckRating × restFactor`; leave `trialCommitted` and the accepted `1.05` trial multiplier as the resolver already expects. The resolver then composes trial and rest before its shared global mapping. Stance continues to affect the accepted variance behavior only. Do not round or clamp the displayed effective input differently from the actual resolver input.

Candidate cards sort by actual effective input descending, then authored rating descending, then stable roster order/identity. Thus a tired rating-20 duck at factor 0.75 (effective base 15) outranks a rested rating-10 duck (effective base 10). All owned candidates remain available. Cards reuse each owned duck’s accepted digital-rig SVG and unique SVG IDs. Learner-facing copy uses speed/race ratings and concise Rested/Needs rest labels, explains the 50%/25%/rested cadence, and discloses any history-limited baseline in one note. A recommendation is only a recommendation, never a predicted or guaranteed winner. No set bonus, recovery purchase, fatigue meter, choice-obscuring language, or per-identity tuning is added.

## Save, commit, and restore lifecycle

1. Before any new-policy exposure or attempt, append one `race_rest_policy_activated` mechanical boundary record. Its payload records policy version and tracking-baseline sequence. This is not a displayed cue.
2. Existing identity-bearing completed `race_result` history informs future rest, including pre-policy results, but their recorded factor-1 resolutions remain accepted and are never rewritten or retroactively rejected.
3. If a completed historical race lacks a usable identity, set a deterministic history-limited tracking baseline immediately after the last unknown completed result. Do not infer the identity or claim it never raced. At that baseline, available identities start rested; subsequent known completed results count normally. Record this limitation in policy evidence and Receipt wording as relevant.
4. At actual entry render, record candidate identities, actual rendered rest/effective values, recommendation/order, and trial state through exposure records with distinct exposure identity/signature when state changes. Mere recomputation, hidden, inactive, or offscreen candidates are not exposure. Same-state rerenders deduplicate; trial purchase refresh records new values once shown.
5. On submit, snapshot selected identity, stance, trial selection, policy version, prior completed-history ordinal/basis, authored rating, factor, effective base input, and serialized resolver inputs. Resolve and serialize with those inputs before wallet, trial, progression, or log mutation, preserving Plan 23’s resolve-once boundary.
6. Every post-boundary attempt, finished or unresolved, carries required consistent rest evidence in append-only mechanical history, action, event payload, cached attempt/result, and encoded resolution inputs. Storage validation rejects missing, stripped, or downgraded evidence after the activation boundary. Pre-boundary attempts remain valid without rest fields.
7. An unresolved result records the attempted input/resolution honestly but does not advance rest, consume the trial, or pay a reward. It remains non-retryable under the current attempt contract. Only a completed result advances rest history.
8. Repeat commit, reload, or presentation replay returns/uses the stored attempt and serialized resolution. It cannot advance the ordinal, consume the trial again, or duplicate a reward. Restore recomputes derived rest from completed result events.

No separate mutable rest counter is proposed. Schema 1 summary-only migration and old schema 2 resolved records remain honest and valid; migration invents no event, action, display, identity, or policy activation. A focused schema 3 label plus `raceRestEvidenceVersion: 1` marker is used because otherwise a save can relabel/remove the activation event and bypass the new-policy consistency checks. Legacy schema 1/2 remains accepted when it contains no new-policy evidence. The validator also rejects legacy-labeled saves retaining rest-policy exposures/caches or a resolver rest factor below 1. This is a consistency boundary, not an offline anti-tamper guarantee; a fully rewritten, internally consistent save is outside scope.

## Matched resolver screen

I ran a report-only, deterministic comparison through the accepted `src/core/race-resolver.mjs`, holding the seed set, `R02`, field rating 12, steady stance, no trial, experiment, and drama arm constant. For each of three production roster ratings (10, 14, 20), each rest factor used the same 30 seeds (`plan22-matched-01` through `plan22-matched-30`). No race code or fixture was edited. All 270 resolutions finished; this is a bounded diagnostic screen, not a population guarantee or a whole-run balance claim.

| Authored rating | Rest factor | Effective base rating | First / 30 | Top-three / 30 | Median place | Median player crossing (s) |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 1.00 | 10.0 | 2 | 11 | 4 | 21.435 |
| 10 | 0.75 | 7.5 | 0 | 0 | 6 | 21.968 |
| 10 | 0.50 | 5.0 | 0 | 0 | 6 | 23.530 |
| 14 | 1.00 | 14.0 | 29 | 30 | 1 | 20.880 |
| 14 | 0.75 | 10.5 | 4 | 19 | 3 | 21.320 |
| 14 | 0.50 | 7.0 | 0 | 0 | 6 | 22.109 |
| 20 | 1.00 | 20.0 | 30 | 30 | 1 | 20.560 |
| 20 | 0.75 | 15.0 | 28 | 30 | 1 | 20.780 |
| 20 | 0.50 | 10.0 | 2 | 11 | 4 | 21.440 |

The selected penalties materially change outcomes in this matched screen: the rating-10 duck had no podium finishes at either tired factor, while rating-14 fell from 29 wins to 4 at 0.75 and none at 0.50. Rating-20 retained first place in 28/30 cases at 0.75 but only 2/30 at 0.50. This supports the conclusion that the selected rest values remain consequential under Plan 23’s shared mapping. It also flags a balance question for broader cadence/roster evidence: with the current six-duck roster and an effective rating of 5, the weakest duck had no podiums in this sample. That is not evidence a podium is impossible. Do not alter the owner-selected factors or tune individuals; report roster-level consequences for owner review.

The story itself contains only two races. Later-cycle behavior is checked with engine-generated completed-history fixtures, labeled as synthetic longer-history coverage rather than story content. The reproducible runner and raw results are `screen-runner.mjs` and `screen-results.json`; they preserve the initial 270 cases and add 288 cases across synthetic one-, two-, and three-identity histories, stance, and trial combinations. In the one-identity repeat fixture, factor 0.50 produced zero podiums and zero Gems across 48 cases versus 21 podiums/470 Gems at factor 1. In the two-identity/one-intervening-race fixture, factor 0.75 yielded 27 podiums/720 Gems versus 48/2,220 at factor 1. The three-identity fixture had two intervening races and factor 1, so treatment and baseline matched exactly. The 12-seed paired cells report mean, sample SD, and range for place, payout, player-crossing, and winner-crossing deltas in the JSON. Winner and last crossings are separate; all 558 calls finished. These small seeded screens are diagnostic and do not establish population balance or impossibility; no factor changes are proposed.

## Proposed exact write ownership after gate

| File | Assigned responsibility |
|---|---|
| `src/core/race-rest.mjs` (new) | Pure history projection and identity-level rest factor/effective-input calculation. |
| `src/core/game-engine.mjs` | Apply the derived factor once; persist it with the committed race decision/result; preserve unresolved, trial, reward, and resolve-once boundaries. |
| `src/core/storage.mjs` | Validate new rest evidence against completed log events, enforce the schema 3 evidence marker, reject policy facts under legacy schema labels, and accept pre-policy schema 1/2 saves without those fields. |
| `src/core/receipt.mjs` | Project the selected duck and applied rest factor from logged facts; keep unresolved attempts distinct from finished races. |
| `src/main.js` | Narrow changes at both existing race entry exposure callbacks only if required to persist the actual candidate options shown. No broader controller refactor. |
| `src/ui/race-view.js` | Replace the dropdown with visual, keyboard-operable candidate selection using accepted digital-rig art; show concise, factual rest/race-rating reasons; keep existing submit as the atomic race commitment. |
| `src/ui/race-entry.css` (new) | Scoped race-entry presentation; do not extend global `src/style.css`. |
| `src/core/race-rest.test.mjs` (new), `src/core/game-engine.test.mjs`, `src/core/storage.test.mjs`, `src/core/receipt.test.mjs`, `src/ui/race-view.test.mjs` (new if no existing entry-view suite) | Rule, commit/restore, save compatibility/tamper consistency, Receipt, and actual rendered-choice coverage. |
| `package.json` | TEST-SCRIPT-LIST ONLY: wire meaningful new tests into `npm test`; no dependency, build, or other script changes. |

Do not modify `src/core/race-resolver.mjs`, shared digital-rig sources, Plan 24/26 files, report previews, art/audio, or packet status. QP Orch approved this ownership and the compatible atomic-form interpretation in `reports/orchestration/plan-22-mechanism-gate-01.md`; apply its binding corrections above. Root review later authorized the narrow schema 3/version-marker correction described here and found the Receipt legacy-exposure claims that must remain evidence-bounded. An initial sandboxed isolated-browser launch failed before page load with a Chrome Crashpad named-pipe error (exit `4294930433`); its profile was removed and the error was preserved in `browser-results-restricted.json`. A later permission-backed run of the dedicated profile reached the approved local URL and passed desktop/narrow/reduced-motion entry checks, scroll-based candidate exposure, trial refresh, and an actual story race-one-to-race-two tired-duck selection/commit. Screenshots, exact DOM observations and profile cleanup evidence are in `browser-results.json`. The repository's existing full smoke journey also passed. No owner Chrome/native profile was used.

## Commands and limits

- `node scripts/dev/plan-status.js check plan-22` — passed (`RUNNABLE`).
- `node reports/development/plan-22-race-entry-and-duck-rest/screen-runner.mjs` — wrote 558 reproducible accepted-resolver cases, with 30-seed initial sets and 12-seed synthetic cadence/stance/trial sets; raw inputs/results and summaries are saved in `screen-results.json`.
- At proposal stage there were no production edits, tests, build, browser session, packet-status mutation, commit, push, or deployment.
