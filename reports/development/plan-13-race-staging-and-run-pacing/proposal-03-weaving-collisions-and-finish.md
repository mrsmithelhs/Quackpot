# Plan 13 Proposal 03: rank-weighted weaving, contact recovery, and line finish

**Date:** 2026-10-26. **Disposition requested:** QP Orch review before any preview mechanic is changed. This is a proposal and hand-worked pacing analysis, not implementation evidence or approval to repair the preview.

## Recommendation

Keep three matched-seed treatments for the first weaving comparison: **no weaving**, **symmetric weaving**, and **rank-weighted weaving**. All six entrants are eligible in both weaving treatments. The symmetric treatment is the no-rank-weighting control; the rank-weighted treatment increases the event cadence while an entrant is in the frozen front half. Use the same racer statistics, course, choice, trial state, starting rows, contact rules, seed, and race ID in each comparison. Do not enable the existing catch-up sprint or leader-wobble assists in these runs; they would confound the effect of weaving. Do not add variant-specific speed or handling stats.

Treat the event as a short, seeded lateral steering disturbance: choose a signed 10–16 degree heading offset, hold its path-relative target for at least 0.5 seconds, then steer back toward the current course tangent under the existing speed-dependent steering cap. Start with a 12-degree magnitude as the hand-worked reference. This keeps the requested minimum visible deviation while bounding exposure: at 10 m/s, a 12-degree offset held for 0.5 seconds produces about 1.04 m of lateral travel before recovery. Eighteen or thirty-degree holds would be a later severity comparison, not the first candidate.

Retain the current steering cap in the first collision comparison. Compare the existing 6-degree response with a separate 15-degree contact-normal heading response held for 0.5 seconds, then a capped return to tangent. Test any added collision speed loss in its own matched-seed comparison after the heading response is reviewed. Do not bundle a turn-rate reduction, yaw hold, and speed penalty in one treatment.

Adopt the owner-selected **first real forward finish-line crossing** as the proposed race result boundary. Interpolate crossing time within the 0.05-second tick; at that instant stop the shared simulation and rank every entrant by unwrapped progress, using the existing deterministic tie order. Do not move any duck to the line. The present oval and speed cap do not fit the nominal 20-second target; course/stat pacing must be calibrated globally before a preview claims a roughly 20-second line race.

## Weaving contract candidate

| Rule | Candidate contract for QP Orch review |
|---|---|
| Comparison A | No weave events. Existing course, performance draws, collisions, and race choices remain the baseline. |
| Comparison B | Every entrant uses the same seeded 3.0-second event cadence, regardless of rank. This is the symmetric-weaving control. |
| Comparison C | Every entrant remains eligible. While in the frozen front half, use a 3.0-second cadence; while in the frozen rear half, use a 6.0-second cadence. Rank affects frequency only, not event size, speed, reward, or base stats. |
| Rank snapshot | At each due-time checkpoint, sort by unwrapped progress using the existing stable tie order and freeze the order before selecting any entrant's event. A rank change during movement affects a later due-time checkpoint, never the event already selected. |
| Schedule | Each entrant's first due phase is a stable keyed draw from its seed/race/entrant schedule key. Later due checks use the frozen rank's 3.0- or 6.0-second interval, evaluated on the 0.05-second simulation ticks. Missed or ineligible events are logged as no-effect/skipped; do not backfill a burst. |
| Weave draw | At an eligible due check, use independent keys for sign and magnitude, derived from `(seed, raceId, tick, eventType, entrantId, episode)`. Sign is equiprobable left/right; magnitude is uniform 10–16 degrees. The three treatments use separate event namespaces, leaving the baseline performance draws unchanged. Rendering, zoom, lighting, slow motion, and narration consume no race RNG. |
| Heading | The target is `current course tangent + signed offset`, recalculated from the entrant's current progress during every movement substep. It is not a stale world-space angle. Hold that relative target for 0.5 seconds (10 ticks), then target the current tangent. Apply the normal turn cap at every tick; record time to return within 1 degree of tangent. |
| Limits and priority | One active weave per entrant; do not overlap a new weave with an active hold or recovery. The existing 64-event record cap remains a safety guard, and reaching it is a failed/incomplete comparison, not silent event deletion. A collision cancels that entrant's weave target and takes steering priority; log the cancellation and collision before resuming tangent recovery. Resolve all same-tick weave eligibility from the frozen pre-movement rank snapshot in stable entrant-ID order. |
| Finish proximity | Do not force a reversal or schedule a special event near the finish. Only already-due seeded events can occur. A race terminates on the interpolated first forward crossing. |

The cadence is a candidate, not an accepted balance. The 3.0/6.0-second intervals give a clear frequency contrast while allowing entrants to move between rank buckets. The same entrant can be front-half eligible in one interval and rear-half eligible in another. A rank-weighted outcome is not presumed to help or hurt the player; report results across seeds.

## Contact response candidate

The current model has a 0.05-second step, current steering cap `max(30°, 90° − 5° × speed_m/s)`, a fixed 6-degree opposite post-impulse heading rotation, and at most one duck-contact episode per race. At 10 m/s that cap is 40°/s, so the current 6-degree offset can recover in about 0.15 seconds if no other event intervenes. Preserve that cap in the initial comparison: a 20 m turn at 10 m/s needs about 28.6°/s, leaving only about 11.4°/s of steering margin. Lowering the global cap could prevent ordinary turn negotiation and would mix a course-feasibility change into the contact test.

1. **Control:** current restitution and positional correction, fixed 6-degree paired response, no additional speed penalty.
2. **Heading treatment:** keep restitution/position correction; turn both participants away from the contact normal, with an independent keyed 12–18 degree magnitude for each and 15 degrees as the reference. Hold the contact-relative heading target for 0.5 seconds, then recover under the current cap. Record each participant's heading error, speed delta, wall strike, and return-to-tangent time.
3. **Separate speed-loss treatment:** only after reviewing the heading comparison, repeat its accepted heading rule with an additional symmetric 5% target-speed reduction for 0.5 seconds applied to each contacted duck. Do not alter restitution or yaw in this treatment. Compare against the exact same seed/input set without the added penalty.

The existing one-contact-per-race cap means this first proof cannot demonstrate chain reactions or a second duck contact. It can show a collision leading to a wall response if the resulting trajectory reaches a wall. If multiple contacts or cascades are later desired, they need their own eligibility, ordering, per-tick/event caps, and tests; do not describe the current cap as chain-reaction mechanics. The collision event must identify both actual participants, and the renderer should orient each duck from its simulated heading plus the oval-facing transform. The accessible narrative should describe the two participants and the measured recovery; never claim both lost speed because restitution can accelerate one while slowing the other.

## Finish-line rule and pacing fit

The owner selected a real forward line crossing. The candidate rule is:

1. Keep each entrant's shared world progress and the three existing staggered rows (0, −4, −8 m). A completed lap is the first tick interval where an entrant moves from progress below course length to progress at or above it.
2. Interpolate the crossing fraction as `(L − progressBefore) / (progressAfter − progressBefore)` and derive the crossing time within that 0.05-second tick. This is the winner; the crossing is not inferred from a fixed display percentage.
3. Stop every entrant at the same crossing instant using interpolation within that tick. Rank all six by unwrapped progress at that instant, then apply the existing deterministic tie rule and unique-place payouts. Do not teleport followers to the finish. A finish that never crosses the line before a computation watchdog is unresolved evidence, not a fabricated winner or a 20-second cutoff.

The current course length is `2 × 60 + 2π × 20 = 245.664 m`. At the 12 m/s speed ceiling, even an impossible instant-at-top-speed lap takes 20.47 seconds, before acceleration, turn handling, staggered starts, or weaving. In the recorded R03 fixed-horizon trace, the leader is at 206.743 m after 20 seconds (400 ticks), which is 38.921 m short. A simple constant-average extrapolation suggests about 23.8 seconds to cover that remaining distance, but it is only an estimate and not a seeded finish-time result. The 20-second target's ±15% band is 17–23 seconds; the trace is therefore not evidence that the current geometry and speed rules meet it.

Recommendation: calibrate course dimensions and/or shared global speed/acceleration once against a named seed set so ordinary first-crossing times center near 20 seconds, then freeze those settings across all comparison variants. Do not tune each variant to the target. Preserve plausible turn negotiation when shortening or rescaling the course. Record actual finish-time distribution; the ±15% band is a target, not a hard cutoff. If the chosen shared rules cannot meet the target without breaking handling, report the pacing mismatch to QP Orch for a separate decision. The longer line-race estimate should also replace the old illustrative 20-second-per-race assumption in the 900-second run budget before claiming the fifteen-minute floor is unchanged.

## Matched-seed evidence plan

Run the same named seeds and race IDs, opening choice, field speed inputs, trial state, course, start rows, and contact response through each weaving treatment. Use both R01 (no contact in the recorded baseline) and R03 (recorded C/E contact) as fixed example controls, then an explicitly reported broader seed set after mechanics approval. Keep the random stream keyed by mechanism so the six baseline performance draws remain identical across treatments; variant-only weave events must not shift any unrelated draw. No per-variant stats, payouts, awards, or concealed player advantage.

Report, per seed and treatment: whether and when each weave activated; frozen rank bucket, sign, magnitude, hold and recovery duration; time and distance off tangent; duck and wall contacts; participants and speed deltas; first crossing time; crossing order and any tie; player place/reward; and count of no-effect or canceled events. Summaries should include median and range, plus how often rank or reward changed against the no-weave control. Include no-contact seeds and no-effect event controls. Do not claim random weaving guarantees sign alternation, a pass, a close finish, or an upset.

Presentation evidence is separate from mechanical evidence: simulated heading changes affect duck orientation; camera framing eases around the recorded event; background dimming, participant glow, and scene-frame accent are cosmetic cues; reduced-motion and accessible narrative expose the same committed event facts. None of these may draw from the mechanical PRNG or alter the world trajectory.

## Gate and preserved boundaries

This proposal asks QP Orch to review the cadence, heading/recovery, separate collision comparisons, finish interpolation/tie contract, and global pacing recalibration approach. It does not authorize preview code or production integration. No Plan 13 mechanics, source, rig, Plan 09, Plan 19, packet status, or remote state is changed here. Plan 17 remains exactly the accepted 3 Down / +5% base speed / one race / non-stacking / consume-once-on-commit trial; use the same trial input in every matched comparison and do not reopen its rules.

