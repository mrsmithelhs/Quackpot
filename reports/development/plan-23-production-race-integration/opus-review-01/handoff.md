# Claude Opus handoff — independent Plan 23 design review

You are an independent Claude Opus reviewer for Quackpot, a static browser duck-collecting gacha game used in a high-school game-design course. The owner wants a fresh assessment of the current race-integration proposal and its calibration tensions. Your job is to recommend what would make a better, understandable and interesting game—not merely make the current experiment pass its timing checks.

This is an **investigation and recommendation assignment**, not production implementation. The owner explicitly authorizes you to question previously selected race design choices for this review, including broader alternatives than the Plan23 implementer was allowed to tune. Explain each proposed departure and its consequences. Nothing you recommend becomes adopted until the owner and orchestrator review it. Do not rewrite canonical decisions or implement a changed game.

## 1. Read the current situation

Repository: `C:/AI/Quackpot`. Read `AGENTS.md` first. Respect its hard architecture, privacy, static/local-only, asset, saving, immediate-exit and Receipt constraints. Read the relevant current-source map in `docs/repo-structure.md`.

Then read:

- `docs/development/plan-23-production-race-integration.md`.
- `reports/development/plan-23-production-race-integration/proposal.md`.
- `reports/development/plan-23-production-race-integration/adapter-analysis.md` and `progress.md`. Earlier conclusions remain as history; distinguish them from the latest comparisons.
- The experiment scripts `linear-speed-comparison.mjs` and `track-length-comparison.mjs` and their matching `*-results.json` files in that folder. Inspect relevant aggregates/cells rather than loading all large JSON into every subagent's context.
- Relevant race, tuning, time, collection/rest, saving and Receipt sections of `docs/founding/design.md`; DECISION-013, 018 and 019 and relevant later entries in `docs/decision-log.md`.
- `docs/development/plan-22-race-entry-and-duck-rest.md` for future rest/selection scope.
- Accepted reference `reports/development/plan-13-race-staging-and-run-pacing/race-physics.mjs`, `preview-model.mjs`, `preview-guide.md` and focused review findings as needed. The report code is a reference, not a production dependency.
- Current production `src/core/game-engine.mjs`, `src/core/storage.mjs`, `src/core/receipt.mjs`, `src/ui/race-view.js` and relevant `src/main.js` race callbacks only as needed to evaluate integration risk. These may be changing during Plan21 repair: record the baseline you actually inspected and do not attribute concurrent changes to your review.

Run `node scripts/dev/plan-status.js check plan-23` before packet investigation. If nonzero, report the reason before proceeding; do not bypass a blocked packet. Plan23 is currently in-progress for report-only work. Your review is separate from its implementer's experiments.

## 2. Goals and evidence so far

We want visually interesting seeded races with readable advantages and disadvantages: stronger ducks should generally be advantageous; the selected pre-race choice should matter; a purchased one-race boost should have a real effect; and future rest should make roster depth useful. None should guarantee a win. There is no reflex input during a race. Random weaving, contacts, recoveries and dramatic presentation should support uncertainty without rendering pre-race choices meaningless.

Currently selected reference model:

- Combined rank-weighted weave plus seeded15–20-degree duck contact; genuine first completed-lap forward finish-line crossing. Classify other entrants at that same instant, without teleporting them to the finish. The two-second slow-motion highlight is presentation only.
- Course straight length60 and curve radius20 (circumference about245.664 internal units). Reference sampled topSpeed clamp8–12 clashes with production ratings10/14/20 and modifiers. Later comparisons remove that sampled clamp while preserving the reference corner-target search bound. Inspect the actual model: naming a constant `maxSpeed` does not prove it caps every movement stage.
- Reference recovery, rank-weighted weave, steering/turn limits, acceleration/braking, contact eligibility, diagnostic/event guards and placement rules all interact. One duck-contact episode per race is a reference limit. Distinguish steering behavior, speed targets and presentation effects.
- Reproducible seed/configuration results; the run PRNG and immutable mechanical outcome must be separate from presentation. Resolve/commit once; replay/seek/skip/reload must not redraw or repay.
- Reduced-motion direction: five static checkpoints, plus event-linked stills/seeking, with equivalent results and truthful information; no forced cinematic motion.

Input rules currently selected, but not all implemented:

- Roster base ratings10/14/20; tutorial/finale rival-field bases8/11.2. No per-cosmetic-variant balancing.
- Safe sampling approximately±5%; Sprint has1.10 target multiplier and approximately±20%. Check exact sampling/application in code.
- Plan17 boost:3 Down buys+5% base Speed for one race, non-stacking and consumed once at commit. The separate6-Down pull ticket is outside this race review.
- Future Plan22 soft rest: zero intervening races applies50% rating penalty; one applies25%; two or more none. Never-raced ducks rested; tired ducks remain selectable. No paid recovery. Investigate effects without claiming rest history is implemented.
- Modifier application order must be explicit and exactly once. Current proposal is base→rest→trial→stance/random sample→global conversion→physics.

Owner timing target: median simulated first-crossing time17–23s, with at most5% finishing strictly later than23s. A substantial faster tail is acceptable;23s is not a cutoff. Report unresolved/watchdog cases separately and conservatively. Report the+2s cinematic playback overhead separately. This is part of a roughly15-minute floor experience, not a mandate for every race to last exactly20s.

Latest comparison, to independently assess rather than take on trust:

- Affine candidate `internalSpeed=8.25+0.5*ratingInput`, original track: held-out1440 attempts, median21.006s, p9521.769s, range20.109–21.893s, zero late/unresolved. Matched72 equally weighted cells and20 validation seeds reused across cells;1440 attempts are not1440 independent seed draws. Attempt-level Wilson upper bound0.266% assumes independence and is not a population guarantee.
- It preserves half the raw absolute rating gaps, but the intercept compresses relative effects. Rating10→10.5 maps13.25→13.5, only+1.89% internal topSpeed; rating10→5 maps13.25→10.75, an18.87% reduction. Outcome effects can differ from top-speed changes because of the rest of the physics.
- Affine rest groups had mean place/win rate: rested1.315/84.6%; one intervening race2.052/60.4%; zero intervening races3.823/24.6%. These are balanced-matrix observations, not production population win predictions. Race duration measures the first finisher, not the selected duck's arrival time.
- Identity conversion on original track had median22.313s but30.49% validation finishes over23s. A bounded geometry screen with8 calibration seeds per72 cells tested straight40 (median18.814s,13.37% late) and straight20 (median15.446s,0 late,82.81% under17). Neither met both selected targets, so neither received held-out validation. These two samples do not prove no intermediate or broader alternative can work.
- Prior sqrt mapping fit timing but compressed modifiers more strongly. Orchestrator currently recommends the affine candidate, **but the owner has not adopted it**. It must be a serious baseline, not an answer your review is expected to endorse.

The owner has accepted a simple presentation direction: show **Speed** ratings, higher meaning faster; show Base Speed and adjusted Race Speed when relevant, with Tired/Recovering/Boosted descriptors and an optional comparison bar. No need to expose the conversion algorithm. Do not describe rating percentages as exact percentages of physical travel speed, or invent win probabilities. This presentation agreement is not approval of affine calibration.

## 3. Your latitude

Begin with a causal diagnosis: which tensions are intrinsic, and which come from an accidental mismatch of units, reference fixtures, curve handling, recovery, sampling, race-end definition or target metrics? Is a simple shared conversion sufficient, or does the physics make most nominal speed advantages disappear in practice?

You may propose broader alternatives: different shared track geometry/scale; acceleration or cornering models; clearer separation of locomotion pace from advantage; heading/recovery treatment; weaving/contact schedules; different Safe/Sprint risk structures; alternative rest or boost expressions; or another small coherent race-resolution model that produces comparable visual drama. You may discuss a changed timing target if that is the honest best trade-off. Do not be confined to affine-vs-sqrt or to preserving every reference constant.

For every departure from a selected rule, clearly name **the current decision, proposed replacement, expected benefit, cost, evidence and owner approval needed**. You may investigate it in isolated experiments; you may not adopt it. Hard constraints still apply: no runtime networking/telemetry, per-identity special tuning, fabricated Receipt evidence, forced winners/crossings or seed filtering to manufacture success. No reflex controls or paid accessibility/recovery. Do not secretly normalize trajectories, durations or outcomes. You may recommend openly defined alternative mechanics, but explain if they replace rather than simulate the existing race model.

Favor a small comprehensible model over an accumulation of corrective coefficients. Meaningful trade-offs, maintainability and predictable integration matter alongside excitement and timing. A practical recommendation to retain the affine proposal is as welcome as a justified replacement.

## 4. Haiku delegation and experiment boundaries

The owner explicitly authorizes **Haiku researcher subagents** for read-only context questions and **separate Haiku experiment subagents** to build small research probes. This is the specific review's delegation permission; it does not authorize additional Opus/Sonnet reviewers or production implementation. Verify requested/observed model identity when the harness supports it; do not silently substitute a more expensive model. If Haiku is unavailable, report that and work inline rather than claiming it ran.

Keep briefs cold-start and self-contained: exact files, hypothesis, baseline, allowed outputs, stop conditions and expected findings. Do not pass the whole repository/context to each child. Prefer a few decisive experiments over broad combinatorial sweeps. Start with a diagnosis, choose a small number of competing hypotheses, and stop or narrow an uninformative branch.

**All your writes must stay under:**

`C:/AI/Quackpot/reports/development/plan-23-production-race-integration/opus-review-01/`

Root authored `handoff.md` here; treat it as read-only. Suggested structure:

```text
opus-review-01/
  handoff.md                 # this root-authored prompt; do not edit
  baseline.md                # inspected versions/hashes and tree state
  review.md                  # your final recommendation
  delegation-log.md          # requested/observed Haiku identity, scope, findings
  experiments/
    01-<hypothesis>/         # one experiment writer owns only its directory
      README.md             # hypothesis, commands, controls, limitations
      run.mjs
      results.json
    02-<hypothesis>/
      ...
```

Read-only researchers may work in parallel. Serialize experiment writers, each owning a separate numbered folder; do not let them edit each other's work or fan out further. Opus owns the synthesis and reviews their code/results. If an isolated worktree would require creation/registration or copying active work, stop and use this bounded report subtree instead. Do not switch the shared branch or stash/restore concurrent work.

Production `src/`, `sim/`, canonical docs, packet statuses/index, the accepted Plan13 reference and existing Plan23 reports/scripts/results are all **read-only**. Plan21 is actively repairing shared main/engine/storage/Dex/gacha files. Plan23's implementer has separate report-only work. Do not clean up unfamiliar changes or remove untracked files. No dependency installs, lockfile changes, remote services, deployment or push. Scope your own commits to new review artifacts only, inspect staged paths, coordinate any shared-index contention and never remove an index lock. Do not commit if another agent has files staged; report the need for a commit window.

Experiments may import read-only pure modules or use a clearly labeled local copy/adapter under your experiment folder; retain source hashes and document every substitution. Never mutate imported source on disk. Do not rerun existing scripts in place if they overwrite another agent's results. Emit all new outputs inside your own folder. Preserve experiment candidates, failure cases and denominators; distinguish calibration from held-out validation and configuration coverage from seed coverage. Use newly named seed sets for fresh validation, with candidate parameters frozen beforehand. Report data dependence rather than treating crossed cells as independent samples.

No browser automation is authorized by this handoff. Headless Node research is sufficient for this review. If rendered evidence becomes necessary, return a precise browser-slot request through the owner; do not take over the shared browser. Avoid expanding this into an asset, audio or environment study. External research is optional; if used, cite direct primary sources, separate their applicability from your inference, and do not substitute examples from commercial games for evidence that our model works.

## 5. Evidence to prioritize

- Paired identical-seed/configuration comparisons for tier, stance, boost and rest; magnitude, direction and variation, not just monotonic formula ordering. Report finishing position/win changes and relevant entrant movement metrics as well as the first-finisher clock. Do not require every random seed to favor a stronger input.
- A balanced test matrix is a stress test, not an estimate of actual player-state frequencies. Separate current production cases from future rest cases; disclose opponent-stat assumptions and how robust recommendations are to them.
- Interaction effects: does a bonus survive cornering/turn limits? Do random turns, rank dependence and contacts dominate, nullify or reverse pre-race choices? Are intended risk/benefit differences visible without per-variant patches?
- Genuine crossing, unresolved bounds and narrative/presentation truth. State whether changing mechanics would require a new event schema, migration, replay contract or altered receipt language.
- Reduced/static parity, no extra player actions during races, committed-result idempotency and feasible local storage. Do not implement the production lifecycle merely to test a hypothesis.
- Simplicity: how many new rules/constants, how easily another implementer can reproduce the behavior, and how much already accepted work the option would discard.

## 6. Deliverable and stop point

Write `review.md` with:

1. A direct verdict: retain current proposal, retain with bounded changes, or replace a specified part. Lead with what the owner should do and why.
2. Verified defects, design concerns and open questions distinguished explicitly. Cite local files/lines and reproducible experiment evidence. State what you did not test.
3. A short comparison of the current affine baseline and your strongest alternatives, including timing, meaningful advantage/disadvantage, drama, complexity and integration cost. Do not promote a weakly tested alternative as proven.
4. Exact recommended rules/constants or a genuinely bounded next experiment if a load-bearing question remains. Include an honest failure/uncertainty account; no endless tuning backlog.
5. Owner decisions required, especially where you propose reopening Plan13/17/22 selections or timing constraints. No claim that your recommendation is an owner decision.
6. A small proposed implementation/repair sequence for the orchestrator to consider after approval, with concurrency boundaries and preservation/migration needs.

Record delegated scopes, model identity evidence, findings and Opus dispositions in `delegation-log.md`. Commit only your own review subtree after a clear commit window, with the final review as your last scoped work. If committing is unavailable or conflicted, preserve artifacts and report that instead. Do not set packet status.

Return a concise owner-facing summary plus absolute paths to the review and experiment evidence. Stop for the owner to route it back to QP Orch. No bidirectional messaging to other Codex threads or external recipients is granted by this handoff.
