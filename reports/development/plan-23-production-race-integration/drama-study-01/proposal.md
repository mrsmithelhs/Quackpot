# Plan 23 — bounded race-drama study proposal

**Date:** 2026-10-27
**Status:** report-only proposal; candidate rules and experiment are not approved or run.

## Purpose and boundary

Test whether position-conditioned assistance and stronger leader wobble episodes create more visible position reversals while preserving meaningful roster, stance, trial, and rest advantages. The player-favoring front-row start remains fixed during this comparison; this is a spectacle study, not a fairness/equal-win-rate study.

This proposal does not change production, the accepted Plan 13 reference, canonical decisions, Plan 20 rig/motion files, the Plan 23 packet, or the external `opus-review-01/` subtree. Do not run the proposed experiment until QP Orch/owner reviews this proposal. Production edits still require the approved source handoff, exact file ownership, and lifecycle/storage approval. No browser turn is requested here.

## Evidence carried into this proposal

- Opus review experiments support affine timing but identify a movement-envelope ceiling: ratings and small modifiers can have compressed effects after acceleration, corner-speed, and top-speed limits. Their experiments are comparisons, not proof of all production states.
- Increasing whole-race pace scaling made advantages larger but reduced lead changes and widened margins. That is not the proposed immediate remedy.
- The selected `weave-rank-strong-contact` reference schedules front-half weave opportunities every 60 ticks (3 s) and rear-half opportunities every 120 ticks (6 s). Opportunities during steering recovery or lane recentering are skipped. It has no explicit applied catch-up assist; a narration label is not a physics effect.
- The accepted combined model retains 15–20° seeded contact, real first crossing, and same-instant classification of remaining entrants. Neither completion nor presentation may force a rank swap or finish.
- Retain both timing criteria during the investigation: median finish remains in 17–23 s, and at most 5% finish strictly over 23 s. Faster finishes, including a substantial under-17 s tail, are acceptable; do not tune toward a symmetric distribution or quietly drop the median target. Report the 2 s highlight as playback overhead separately.

## Controlled arms

Use the same seed, entrant/input cell, fixed player-front-row fixture, current stance rules and sampling, contact setting, affine conversion candidate, event ordering, finish rules, and caps in all arms. The affine candidate is an experimental baseline, not an adopted production constant. Do not add randomized grid, risk-only Sprint, identity-specific rules, or conversion changes as hidden factors.

| Arm | Mechanics |
|---|---|
| A — baseline | Current affine candidate and selected rank-weighted weave + seeded strong contact. No new assistance or disruption. |
| B — rear assistance only | Baseline plus the provisional bounded acceleration assistance below. Existing weave profile unchanged. |
| C — leader disruption only | Baseline plus the provisional stronger leader-weave profile below. No rear assistance. |
| D — combined | Both provisional changes, with no additional tuning. |

## Candidate rules for a first, bounded probe

These constants are specific candidates to measure, not accepted mechanics. If implementation inspection shows they do not affect actual movement under the selected caps, record a null result and stop that candidate; do not silently substitute a different force or relax accepted limits.

### Rear assistance candidate

- At a seeded opportunity cadence of every 40 ticks (2 s), consider an entrant only when current rank is in the back half, it is at least 3 m behind the immediately preceding entrant, and a keyed 0.5 opportunity draw succeeds. The draw key includes race ID, entrant ID, and that entrant's opportunity index; no rerolls on navigation or retries.
- Freeze rank, immediate-predecessor gap, speed/headroom and curve/braking state from the start-of-tick snapshot before the existing weave processor runs. At each tick the existing weave opportunity is processed first from its unchanged keys; the assistance scheduler then evaluates the frozen snapshot before motion advances. An assistance start therefore cannot change that tick's eligibility, rank, gap or existing weave draw.
- An execution is allowed only on a straight, with `distanceToNextCurve - existingBrakingDistance >= 15 m`, current speed at least 0.25 below that entrant's unchanged `topSpeed`, and no active contact/weave/recovery steering episode in the frozen snapshot. The 15 m is a clear-distance buffer after the existing braking distance. Otherwise record why it was ineligible/blocked; the opportunity cadence remains every 40 ticks.
- When executed, temporarily use acceleration 5.0 m/s² instead of the existing 3.0 m/s² for at most 20 ticks (1 s). Keep the entrant's input-derived `topSpeed`, max-speed cap, curve braking, turn cap, steering, and recovery rules unchanged. End early at the curve-braking envelope or when the steering/recovery guard activates. Do not stack; apply an 80-tick cooldown and at most two executions per entrant per race.
- This candidate changes acceleration only while actual speed headroom exists. It does not rewrite sampled rating, top speed, base/rest/trial/stance effects, or progress. Its measured effect must be positive world progress or gap closure, not just a narration event.
- Record every scheduled opportunity in a separate study-sidecar (maximum 120 records = 6 entrants × 20 opportunities over the 800-tick watchdog) as eligible, blocked, chance-failed, executed, ended-early, or capped, with seed key, frozen rank/gap, headroom, curve/braking buffer, duration, and resulting progress delta. Do not consume or raise the accepted 84 weave-opportunity diagnostic cap for this audit. Actual new mechanical event records must remain within the existing 128-event cap and guard behavior.
- Because the acceleration-only rule is intentionally conservative and may be null or rare, report which identities/configurations actually qualify and whether it mostly benefits already-fast entrants. Do not infer meaningful catch-up from opportunity or event counts alone. If null or rare, report that as evidence; do not silently substitute a stronger force.

### Leader disruption candidate

- Reuse existing front-half weave opportunity timing and seeded eligibility/order; do not increase opportunity frequency. Apply the changed profile only when the entrant is rank 1 or 2 at the opportunity, including the player under the same rule.
- Candidate target deviation is 16–20° and the held phase is at most 15 ticks (0.75 s), compared with the selected reference's 12–16° and 10-tick hold. Keep the accepted steering acquisition timeout, turn cap, recovery/recentering behavior, and all contact angles unchanged.
- Allow at most two upgraded episodes per entrant per race. Existing active-recovery/recentering cases remain blocked and are logged; do not replace a blocked opportunity with another draw. If the larger profile causes wall/contact cascades or unresolved runs, report them without clipping, teleporting, or manufacturing a pass.
- Record scheduled, blocked, acquired, held, interrupted, recovered, wall/contact-overlap, and progress-delta facts. Distinguish opportunity count from episodes actually attained and held.

## Small comparison screen

Only after proposal approval, first verify Arm A exact parity with the current affine baseline on named witnesses, including `Quackpot Plan 13 named-seed example` and the stored affine witness set. Then run six named calibration seeds (`plan23-drama-cal-01` through `-06`) on the existing 72-cell comparison matrix, paired across all four arms: at most 1,728 race attempts. Publish the exact seed list and cell definitions before running. Identify current production-reachable two-race states separately from future-only rest combinations; do not treat an evenly weighted matrix as a player-frequency estimate. This is a gross-effect screen, not final validation or perception evidence. Do not tune on these seeds. No 20-seed validation is authorized yet; return this screen to root/owner for arm selection first.

If an arm is selected for follow-up, freeze its constants and compare it with baseline on a separately named set of 20 fresh validation seeds. No seed filtering, parameter search, per-identity tuning, forced ending, or post-hoc replacement of failed/unresolved attempts. Stop and return for owner review if the probe requires changing an accepted constraint.

## Measures and decision guardrails

Report paired outcomes by entrant/input cell and separately for production-reachable cases:

- First-crossing simulation finish time: median, p5, p95, p99, minimum, maximum, under-17 fraction, strictly-over-23 fraction, and unresolved count/denominator. Preserve the existing at-most-5%-over-23 goal while allowing a faster-skewed result.
- Genuine movement: bottom-two-to-top-three visits after the opening grid phase; front-two-to-bottom-three drops; passes that persist for at least 1 simulated second; lead changes after excluding ties/chatter; gain magnitude and duration; per-racer progress and gaps.
- Treat each race's event-gap changes as observed within-run evidence; use paired same-seed/configuration arm differences for causal attribution. Do not label an observed gap change as caused by assistance or disruption without the paired comparison.
- Advantage retention: paired tier, trial, rest, and stance changes in finish place, win share, finish margin, progress, and opportunity rate. Report changes; do not require equalization. A reversal proxy alone cannot establish that a better duck remains predictively advantageous or that the viewing experience feels exciting.
- Mechanics integrity: assistance/weave opportunities versus execution, blocking, caps, episode recovery, contacts, wall hits, guard diagnostics, and unresolved outcomes. Verify genuine first crossing and follower classification at that same instant.
- Report stronger-weave wall-contact cascades and overlap/recovery paths, along with blocked opportunities, successful acquisitions/holds, and lasting reversals.
- Report the 2-second slow-motion highlight and total playback wall duration separately from simulated finish time.

No acceptance threshold for “exciting” is established by this offline screen. Do not describe lead-change counts as a validated perception measure. If numerical evidence supports a candidate, seek owner selection and a coordinated visual-comparison browser slot before proposing canonical or production changes.

## Integration questions retained for the production proposal

This study does not supersede the existing Plan 23 integration boundary. The eventual proposal still needs a resolve-once engine boundary; versioned immutable race resolution and save/reload behavior; idempotent payout/trial consumption; bounded append-only mechanical and actually displayed evidence; a focused race view and simpler truthful commentary; five static checkpoints, reduced-motion parity, event-linked seeking, pause/skip/replay invariance, and the accepted digital rig mapping. Plan 22 owns rest penalties; Plan 23 must preserve a clean effective-speed input for that later handoff. Production may not import reports or experiment artifacts.

## Gate

QP Orch/owner: review this small proposal, including the candidate acceleration and wobble constants, before authorizing the experiment. Any approval should name the exact allowed study files and writer. Production source edits and browser use remain separately gated by the approved source handoff/file ownership and coordinated browser slot. Packet status remains orchestrator-owned.
