# Plan 13 bounded race and pacing proposal

**Date:** 2026-10-25. **Stage:** prebuild proposal; no preview has been built. **Authority:** owner approval is required before the isolated preview. This document recommends a comparison, it does not select production rules or final pacing.

## Decision requested

Approve one small, source-isolated comparison of race durations (12, 20, and 30 seconds) using the same oval, racers, choice, race seed, event rules, viewport, and visual assets, plus a static-camera control and reduced-motion equivalent. Compare two distinct outcome models rather than blending them:

1. **Seeded mechanical beats (recommended for investigation):** resolve fixed, scheduled race beats from a dedicated deterministic race stream. Eligible bounded events can change progress and therefore the finish. Each cause is recorded before it is presented. The existing pre-race choice and racer stats establish the baseline; any new causal event/effect remains a proposal requiring owner approval before implementation.
2. **Resolved outcome, staged replay:** compute the finish once from the accepted race inputs, then stage only camera, lane position and non-causal performance that stays consistent with that finish. This is the lower-risk choice if new causal rules are not approved. It cannot claim a random upset, contact penalty, fatigue, or narrow finish that did not occur in the resolved data.

Do not combine model 1's random causal beats with model 2's post-hoc result. I recommend using model 1 only as a bounded review prototype after approval, with model 2 as its explicit control. Neither is a production adoption. Plan 17 remains exactly: **3 Down buys +5% base speed for one race, does not stack, and is consumed once on race commit**. This proposal does not change price, effect, scope, or lifecycle.

## Matched comparison

Use the same six-racer field, oval track fitted inside a rectangular viewport, player duck, rival-whale lane 1 when that already-eligible seeded event is present, same entry choice and same Plan 17 state. A 20-second pass is the center reference; 12 and 30 seconds test readability and fatigue from waiting. Camera cuts and close views may be evaluated at the same normalized beats (start, 40%, 70%, finish), but camera randomness must not affect or consume race-outcome draws. Keep one camera-wide/close treatment, a locked wide camera, and a reduced-motion/static equivalent. Show an understandable start and finish; return wide after any close shot. Keep Uninstall continuously reachable.

At each duration inspect player tracking, readable lane changes/overtakes, any seeded contact, visible cause-to-effect chronology, result comprehension, and repeat-race tolerance. Only depict contact when a contact event exists in the model; contact itself must not imply a cost unless that cost is modeled and logged. No engineered photo finish or narrow-ending guarantee. A bump may be recorded as an approved mechanical event, otherwise it is only non-causal visual proximity and must not be presented as the cause of an outcome. These comparisons are proposals; no motion/readability claim is measured yet.

## Outcome, event, RNG, and log boundaries

For the recommended mechanical-beat model:

- Commit the single race choice first, including any accepted trial effect. At commit, snapshot participating identities, the applicable stats, trial eligibility/effect, and rules version. The Plan 17 boost applies exactly once to this committed race and never stacks.
- Derive a race-only deterministic stream from the run seed and race sequence (for example, a domain-separated `race:<raceId>` substream). It must not advance the gacha draw stream, event-deck stream, or cosmetic/camera stream. The exact derivation is a preview implementation detail pending approval.
- Evaluate a fixed beat schedule: start, mid-race at 40%, late-race at 70%, finish. Resolve event eligibility and mechanical effects in a stable order. Candidate event vocabulary for the comparison: clean draft (bounded progress gain), bobble (bounded progress loss), and contact (bounded progress loss only if the modeled contact eligibility succeeds). Lane changes may be causal only if explicitly part of an approved event; camera cuts are never causal. The candidate rules do not exist in the game yet.
- Resolve every beat and final ranking before animating that beat. Ties use a documented stable rule (shared place, then deterministic racer-id ordering for display only); the exact ranking rule is open for owner approval. Event eligibility, roll/outcome, affected racer, before/after progress and rules version are immutable local race-log entries. The final race result records chosen duck, effective stats, trial consumption, placements, payout and race ID. Existing Receipt projection changes are out of scope; later integration must ensure the log contains enough evidence to explain the displayed outcome.
- The camera/presentation stream is separately derived and may be skipped, paused, reduced-motion rendered, saved/reloaded or replayed without changing mechanical outputs or consuming outcome draws. Timed racing remains fixed-duration and has no reflex input.

For the resolved-outcome control, make one mechanical resolution from the accepted input and do not generate post-resolution random events. Store the result; presentation can interpolate a plausible path that reaches it. Both modes must reproduce identical mechanical records for the same seed, choice, rules and trial state regardless of presentation settings.

### Worked seeded trace (illustrative contract, not executed evidence)

This hand-worked fixture shows the trace fields and cause/result relationship to test after approval. Values are deliberately explicit example inputs, not adopted game balance or actual PRNG output. Example run seed `QK-13-EXAMPLE`, race `R03`; six racers; player selects `best`; the player duck has base speed 12.0 and an already committed Plan 17 trial makes effective base speed 12.6 for this race only. Trial is consumed at commit. Example beat-stream values below are fixture values (`0.18`, `0.74`, `0.31`), not claimed outputs of the repository PRNG. The comparison implementation must replace them with and capture real deterministic draws.

| Beat | Eligible event and fixture draw | Mechanical resolution | Logged evidence / staged view |
|---|---|---|---|
| Commit / 0% | No event roll | Snapshot six entrants and stats; player effective speed 12.6; mark the committed trial consumed once. | `race_committed`: raceId, choice, entrants/stats, trial item/effect, rulesVersion. Wide start and lane assignments. |
| 40% | `draft` eligible; roll 0.18 selects player's clean draft under illustrative threshold `<0.25` | Player progress +1.0; no other racer changes. | `race_event`: beat 1, event `clean_draft`, affected player, roll, threshold, progress before/after. Show the player duck drafting past one rival; no camera-created cause. |
| 70% | `bobble` eligible; roll 0.74 maps to no bobble under illustrative threshold `<0.20` | No progress change. | Record eligibility and no-event result so replay/debug can account for the scheduled beat. Camera may cut close, but does not consume this draw. |
| 85% | `contact` eligible only for adjacent lanes and overlap; roll 0.31 fails illustrative contact threshold `<0.10` | No contact and no penalty. | Record `contact_ineligible` or failed event with reason; do not show a bump. Return to wide. |
| Finish / 100% | No further outcome draw | Apply fixed distance and stable tie rule. Example final progress ranks player 2nd, rival A 1st, others 3rd–6th. | `race_result`: placements, final progress, payout, trial consumed; show a non-photo finish consistent with second place. |

Under this trace, changing 12/20/30-second duration, disabling camera moves, reducing motion, skipping the replay or reloading a saved presentation must leave event records and placements byte-for-byte identical. The trace is a proposed test oracle shape, not evidence that those mechanics, stream derivation, or tie semantics have been implemented.

## Day and run pacing toward the floor

The roughly 15-minute target includes setup and the Receipt. The following is an investigation budget for active scenes, choices, reading and transitions; it is not a day-count or economy decision. It contains no mandatory idle timer. Shop windows and other live hybrid-clock decisions can be observed with visible game-time labels; dramatic reveals and companion scenes pause that clock. A real classroom timing study is still needed.

| Segment in a representative floor run | Count and active work | Budget |
|---|---|---:|
| Setup | Choose save mode, customize starter duck, understand first controls/currencies | 90 sec |
| Ordinary days | 7 days × 55 sec: wage/expense summary, one legible shop or gacha decision on selected days, concise transition; not every action repeated every day | 385 sec |
| Consequential days | 3 days × 95 sec: banner/shop trade-off, race choice plus a 20-second race on race days, meaningful expense/escalation or story beat | 285 sec |
| Receipt and ending | Ending transition, scan displayed cues/actions/outcomes, optional reflection prompt and export choice | 120 sec |
| Recovery / orientation | Short non-idle allowance for reading a new rule or resuming a save; cut/redistribute if not needed | 20 sec |
| **Total** |  | **900 sec (15 min)** |

This allocation includes three 20-second races (60 seconds) inside the consequential-day budget, not on top. It allows repeated race exposure without forcing a race every day. A 12-second variant frees 24 seconds across three races for another active decision or shorter scenes; a 30-second variant adds 30 seconds and takes the representative run to 15:30 if all else stays fixed. This is why race duration should be judged against the whole-run floor, not as an isolated spectacle. The 20-second center case is a comparison anchor, not a selected duration.

Measure at least one ordinary and one consequential day end-to-end, along with setup, repeated races and Receipt. Record wall time by segment, number of active decisions, repeated waits, and time to understand each new rule. Separate observed preview timings from classroom play; neither the hand budget nor lab-computer observation establishes how a class will spend discussion time. High-drama choices can extend play. Do not stretch every day or race to force the floor. The short Plan 03 trial and Plan 01 provisional simulation are not evidence that a production run meets it. Preserve the recorded Skip Lunch settlement follow-up before any later implementation makes food shortfall reachable.

## Recommendation and open owner choices

Recommend approval of the two-model, 12/20/30-second isolated comparison and the 20-second center-case pacing observation. If causal beats are selected for the review prototype, approve their candidate effects, event ordering, tie rule, log fields, deterministic stream boundaries, and the fact that new race causal rules are still being investigated. Otherwise select the resolved-outcome control and constrain all movement to its finish. In either case, decide the prebuild scope before any preview code is written. No final race duration, causal mechanic, camera language, day count, economy, trial alteration, production integration, or classroom-suitability finding is requested by this proposal.

## Source and evidence limits

Read-only references reviewed: canonical design (race, time, Receipt, immersion), GATE-53B owner triage, DECISION-006/013 and related decision-log entries, Plan 01 results, Plan 03 mechanism packet and owner play feedback, Plans 04/09/11, and the Plan 13 packet. Plan 03 owner feedback specifically asks for slower oval races, camera moves and rectangular framing while leaving duration/collisions as proposals. Plan 04's accepted rig is a digital base proof, not production race motion. Plan 09 motion candidates and Plan 11 compositions do not establish race behavior. No source, rig, simulation, package, or shared file was modified. No preview, image generation, classroom timing, device compatibility, or runtime behavior was tested.
