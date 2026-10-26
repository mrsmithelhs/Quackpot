# Plan 13 bounded race and pacing proposal

**Date:** 2026-10-25. **Stage:** isolated review preview implemented after owner approval; production mechanics and final pacing remain unselected. This document recommends a comparison, it does not select production rules or final pacing.

## Decision requested

Approve one small, source-isolated comparison of race durations (12, 20, and 30 seconds) using the same oval, racers, choice, race seed, event rules, viewport, and visual assets, plus a static-camera control and reduced-motion equivalent. Compare two distinct outcome models rather than blending them:

1. **Seeded mechanical beats (recommended for investigation):** resolve fixed, scheduled race beats from a dedicated deterministic race stream. Eligible bounded events can change progress and therefore the finish. Each cause is recorded before it is presented. The existing pre-race choice and racer stats establish the baseline; any new causal event/effect remains a proposal requiring owner approval before implementation.
2. **Resolved outcome, staged replay:** compute the finish once from the accepted race inputs, then stage only camera, lane position and non-causal performance that stays consistent with that finish. This is the lower-risk choice if new causal rules are not approved. It cannot claim a random upset, contact penalty, fatigue, or narrow finish that did not occur in the resolved data.

Do not combine model 1's random causal beats with model 2's post-hoc result. I recommend using model 1 only as a bounded review prototype after approval, with model 2 as its explicit control. Neither is a production adoption. Plan 17 remains exactly: **3 Down buys +5% base speed for one race, does not stack, and is consumed once on race commit**. This proposal does not change price, effect, scope, or lifecycle.

## Matched comparison

Use the same six-racer field, oval track fitted inside a rectangular viewport, player duck, race choice, model, and rules for all durations. Use the current finale rival in lane 1 as a fixed participant in the matched comparison; the preview must not assume a newly seeded event-deck trigger. A 20-second pass is the center reference; 12 and 30 seconds test readability and fatigue from waiting. Camera cuts and close views may be evaluated at the same normalized beats (start, 40%, 70%, finish), but camera randomness must not affect or consume race-outcome draws. Keep one camera-wide/close treatment, a locked wide camera, and a reduced-motion/static equivalent. Show an understandable start and finish; return wide after any close shot. Keep Uninstall continuously reachable.

At each duration inspect player tracking, readable lane changes/overtakes, visible cause-to-effect chronology, result comprehension, and repeat-race tolerance. No collision or pileup is in this first causal model; defer contact until a lane/proximity rule is separately defined. No engineered photo finish or narrow-ending guarantee. These comparisons are proposals; no motion/readability claim is measured yet.

## Progressive single-choice comparison

Keep one mutually exclusive race-entry decision per race. This proposal compares how that same decision grows from a simple opening to one later-unlocked option; it does not add a separate duck-selection decision or independent item selection.

| Stage | What the player sees and chooses | Visible introduction / trigger | Trade-off in the candidate model |
|---|---|---|---|
| Opening race | Two entry cards for the duck already offered for this race: **Steady** or **Sprint**. This is the one race-entry choice; there is no second independent duck/stance choice. Steady uses the current resolver's `S × (1 + (2u−1)×0.05)` performance rule. Sprint uses `S × 1.10 × (1 + (2u−1)×0.20)`. `u` is that committed entrant's deterministic race-stream draw in `[0,1)`. | On the tutorial race screen, introduce only these two labeled options with their outcome ranges stated plainly. | Steady has ±5% variation around base speed. Sprint targets +10% but varies ±20%, so its actual result can be below Steady. No menu-position trick or fatigue-obscuring behavior is implied. |
| Later race | Add **Drafting** as a third mutually exclusive entry card, alongside Steady and Sprint. It uses the same ±5% performance formula as Steady, then can earn the bounded clean-draft event only while within the defined gap of the racer ahead. | Unlock after the first race is completed, whether it is a win or loss. On the next race screen, introduce it with a short neutral explanation and its conditional eligibility rule. | Drafting has no +10% Sprint target; if out of range, it receives no event benefit. It is not a permanent upgrade and may be worse than Steady or Sprint on a given seed. |

The values and unlock are comparison inputs, not adopted options or a settled unlock schedule. Do not add an obvious upgrade ladder or balance individual cosmetic variants. The same chosen card must feed the same progress model and trace fields below. A future owner decision may keep only the opening options or choose a different later introduction.

**Preview finding requiring owner selection:** the implemented deterministic check confirms that Drafting currently has exactly the same player speed formula and event rules as Steady. The proposed label therefore creates no mechanically distinct choice. Do not imply a trade-off or unlock value. The owner can remove Drafting from the progressive comparison or define a concrete, balanced distinction for later investigation; this preview does not invent one.

## Outcome, event, RNG, and log boundaries

For the recommended mechanical-beat model, use this explicit candidate contract. It is intentionally a small investigation model, not production balance:

- **Commit and baseline:** Commit the one mutually exclusive choice first. Snapshot six entrants, lane IDs, base speed inputs, choice, rules version, and trial eligibility. Use the current resolver's exact deterministic performance formulas to produce baseline speeds: player Steady/Drafting `S × (1 +(2u−1)×0.05)`; player Sprint `S × 1.10 × (1 +(2u−1)×0.20)`; each AI `fieldBaseSpeed × (1 +(2u−1)×0.05)`. Consume performance draws in fixed lane order from the mechanical race stream and record each `u`. For Plan 17, apply the accepted `×1.05` base-speed multiplier once before the selected performance formula, only if the 3-Down trial was committed; it is never stacked. `P_i = 100 × s_i` is each entrant's baseline finish progress in points. At normalized race position `t`, before events, progress is `P_i × t` for `t` from 0 to 1. This normalized mechanical time is identical at 12/20/30 seconds; playback duration only maps the normalized timeline to wall-clock seconds.
- **Beat schedule and roll order:** Start at 0%; resolve one event opportunity at 40% and one at 70%; finish at 100%. At each beat, first freeze the ranking and gaps at the start of that beat. Then, in fixed lane order, draw one race-stream value `r ∈ [0,1)` per entrant and evaluate eligibility from the frozen ranking. Use the value once: `r < 0.05` causes a bobble (−2% of that entrant's baseline `P_i`); otherwise, if the entrant is not leading and is within 2% of their own `P_i` from the racer immediately ahead, `0.05 ≤ r < 0.25` causes a clean draft (+2% of `P_i`); otherwise no event. This gives a 5% bobble chance and, when draft-eligible, a 20% draft chance, with no double event on one entrant at one beat. Ineligible draft rolls still resolve to no event. Apply all beat offsets simultaneously after the lane draws; the next beat uses the newly ranked progress. No contact/pileup event is part of this first proof.
- **Bounds and order:** Apply each event as a cumulative progress offset at its beat; two same-type successes can therefore change finish progress by at most ±4% of `P_i`. Re-rank after all entrants at a beat are processed; eligibility at the next beat uses the resulting order and gap. This is a symmetric rule for all racers, including the player and rival. Event order, lane order, draw count, and offset arithmetic are fixed. The player does not get special event odds.
- **Finish, ties and payout:** At 100%, final score is `P_i + cumulative event offsets`. Sort descending by score; on an exact score tie, player ranks before AI, then lower lane ID ranks before higher, matching the current resolver's unique-order rule. Award the existing payout by unique place (1st 50 Gems, 2nd 20, 3rd 10, otherwise 0); no shared-place payout is introduced. The resolved-result control uses the current resolver's already-computed unique place and payout, then stages a compatible path without new random mechanical events.
- **RNG/log separation:** Derive a deterministic mechanical stream from run seed and race sequence in a race-only domain. This stream must not advance gacha, event-deck, or presentation draws. A separate camera/presentation stream is also domain-separated; cuts, reduced motion, skip, pause, save/reload, or repeat rendering cannot alter mechanical outputs or draw counts. Log `race_committed` (inputs, choice, effective speeds, trial state, rules version); for each scheduled beat and racer log eligibility, lane order, roll, event/no-event reason, progress before/after and offset; log `race_result` (final scores, unique placements, payout and trial consumption). Existing Receipt projection integration is not in this preview scope, but these fields define what a future integration must be able to project truthfully.
- **Duration and control:** The normalized mechanic resolves before playback begins. Timed play remains fixed-duration with no reflex input; controls only affect presentation. Under each model, identical seed, entrants, choice, trial and rules must reproduce identical mechanics across duration and presentation settings. The two different models are not expected to yield identical results to each other.

### Worked seeded traces (illustrative fixtures, not executed evidence)

These hand-calculations prove that the proposed rules can yield a derivable order. Values are comparison fixtures, not adopted roster stats, balance, or actual PRNG outputs. The formula's baseline fixture draws are listed so the example is reproducible: player S=11.7, Steady `u=.5` gives 11.7; AI field base is set to 11.5 for this comparison fixture, and lane draws A `.9347826` → 12.0, B `.7608696` → 11.8, C `.4130435` → 11.4, D `.2391304` → 11.2, E `.0652174` → 11.0. These values are fixture draws, not asserted output from a named seed. The current engine applies one shared finale field base speed; the fixture's lane speeds are within the formula's ±5% spread around 11.5, but they do not claim production roster behavior. Lane 1 AI A=12.0, lane 2 player P=11.7, lane 3 AI B=11.8, lane 4 AI C=11.4, lane 5 AI D=11.2, lane 6 AI E=11.0. Baseline scores `P_i = 100 × speed` are A=1200, B=1180, P=1170, C=1140, D=1120, E=1100. At this scale a successful offset is ±2% of `P_i`: A=24.0, B=23.6, P=23.4, C=22.8, D=22.4, E=22.0.

1. **No-event control:** At both 40% and 70%, each lane's fixture roll is `0.80`. No one bobbles; no draft triggers. Scores remain A=1200, B=1180, P=1170, C=1140, D=1120, E=1100. Finish: A 1st, B 2nd, P 3rd, C 4th, D 5th, E 6th. Existing payouts: P receives 10 Gems (3rd). This is the control ordering.
2. **Event-driven overtake:** At 40%, lane rolls A=.80, P=.10, B=.80, C=.80, D=.80, E=.80. A has no event. P is 10 points behind A, inside its 23.4-point draft gap, so `.05 ≤ .10 < .25` gives P +23.4 and progress 1193.4. B and others have no events. At 70%, rolls A=.02, P=.80, B=.80, C=.80, D=.80, E=.80. A bobbles for −24, ending at 1176; P has no second event and remains 1193.4; B remains 1180. Finish: P 1st (1193.4), B 2nd (1180), A 3rd (1176), then C 1140, D 1120, E 1100. This overtake follows exactly from one eligible draft and one bobble; no camera event supplies the cause. P receives 50 Gems for 1st.
3. **Non-player event plus exact tie:** For this tie-control fixture only, lane 1 A and lane 2 P both have baseline speed 12.0 (scores 1200); other lanes are B=11.8, C=11.4, D=11.2, E=11.0. At both beats all rolls are `.80` except lane 3 B rolls `.02` at 40%, causing B's bobble (−23.6). No other events occur. Final A=1200 and P=1200 exactly; B=1156.4; C=1140; D=1120; E=1100. Tie rule gives P 1st, A 2nd, B 3rd, then C/D/E. P receives 50 Gems and A receives the unique second-place payout of 20; no shared place. This confirms that a non-player cause is logged and exact ties still resolve uniquely.

In each trace the draw sequence is fixed at lanes 1–6 at 40%, then lanes 1–6 at 70%. In trace 2, the progress changes at 40% are applied after the scheduled normalized movement to that beat; at 70% they apply as final score offsets. Changing 12/20/30-second playback, disabling cuts, reducing motion, skipping the replay, or reloading presentation must preserve the fixture's mechanical entries and finish order. The fixtures are arithmetic examples, not simulation or replay evidence.

## Day and run pacing toward the floor

The roughly 15-minute target includes setup and the Receipt. These ordered day maps are sample player experiences inside the earlier illustrative ten-day budget, not an adopted day count or economy. There is no mandatory idle timer. Shop windows have visible game-time labels and are live-clock segments; reveals, tutorials, results and companion scenes pause the running clock. The race itself has a fixed playback duration. A real classroom timing study is still needed.

| Segment in a representative floor run | Count and active work | Budget |
|---|---|---:|
| Setup | Choose save mode, customize starter duck, understand first controls/currencies | 90 sec |
| Ordinary days | 7 days × 55 sec: wage/expense summary, one legible shop or gacha decision on selected days, concise transition; not every action repeated every day | 385 sec |
| Consequential days | 3 days × 95 sec: banner/shop trade-off, race choice plus a 20-second race on race days, meaningful expense/escalation or story beat | 285 sec |
| Receipt and ending | Ending transition, scan displayed cues/actions/outcomes, optional reflection prompt and export choice | 120 sec |
| Recovery / orientation | Short non-idle allowance for reading a new rule or resuming a save; cut/redistribute if not needed | 20 sec |
| **Total** |  | **900 sec (15 min)** |

This allocation includes three 20-second races (60 seconds) inside the consequential-day budget, not on top. It allows repeated race exposure without forcing a race every day. A 12-second variant frees 24 seconds across three races for another active decision or shorter scenes; a 30-second variant adds 30 seconds and takes the representative run to 15:30 if all else stays fixed. This is why race duration should be judged against the whole-run floor, not as an isolated spectacle. The 20-second center case is a comparison anchor, not a selected duration.

The optional 1- or 2-second slow-motion highlight is additional wall time, visibly included in the preview's total. If used on all three races, it adds 3 or 6 seconds to the 900-second illustrative budget; it does not compress or alter mechanical race time. Warm lighting is a static, low-intensity presentation option with no flashes. Static/reduced-motion mode omits lane movement, zoom and lighting treatment while retaining the same displayed result.

### Ordered day examples

The maps below match the 55-second familiar ordinary-day and 95-second consequential-day allocations above. Scene timings are estimates for active play and transition, not player input deadlines. Paused scenes may take longer at the player's pace and can extend the overall run above fifteen minutes.

| Ordinary day (55 sec total) | Time | Decisions / waits / clock |
|---|---:|---|
| Wage and bill summary; review current balances | 8 sec | 0 decisions; running day flow; no wait |
| Familiar companion line and transition | 5 sec | 0; scene pauses clock; no wait |
| Open optional gacha/shop choices and read prices/balance | 12 sec | 1 active spend-or-save decision; live shop window is visible and labeled; no forced wait |
| Make the chosen pull or decline; reveal is skippable | 15 sec | 0 new decisions after commitment; reveal pauses clock; one familiar reveal, not repeated between every action |
| Close day, show expense settlement and next-day transition | 15 sec | 0; settlement/story presentation pauses where needed; no idle timer |

New-rule comprehension allowance: 0–5 seconds for a familiar ordinary day; if something genuinely new appears, count its explanation in the segment and remove equal time elsewhere rather than silently extending every day. Active decisions: 1. Repeated waits: 0.

| Consequential day (95 sec total) | Time | Decisions / waits / clock |
|---|---:|---|
| Wage and upcoming expense cue | 8 sec | 0; running flow; no wait |
| New option introduction after first completed race | 12 sec | 0; paused instructional card explains Drafting's trigger/trade-off; first-time comprehension allowance, dismiss/continue at player pace |
| Shop window with visible time label; compare race ticket/trial or save resources | 20 sec | 1 active decision; live hybrid-clock segment; no forced waiting to fill the window |
| Race-entry cards; choose one mutually exclusive option | 10 sec | 1 active decision; fixed entry choice, no reflex input; no deadline tricks |
| Fixed 20-second race with 40%/70% beats and wide return | 20 sec | 0 input decisions after commit; fixed-duration active presentation; no hold-to-watch gate |
| Result, payout and short companion reaction | 10 sec | 0; reveal/result pauses running clock; results can be acknowledged immediately |
| Expense settlement and next-day transition | 15 sec | 0; show consequences and pause for any high-drama choice; no idle timer |

New-rule comprehension allowance: the 12-second paused introduction for any genuinely adopted later option (longer if the player needs it); this preview found no distinct Drafting trade-off, so its introduction is not evidence for retaining an unlock. The budget is an estimate, not a forced reading speed. Active decisions: 2 (shop action, race entry). Repeated waits: 0. Across the representative run use this consequential map three times, with later days swapping a new-rule introduction for an already-understood story or expense beat of comparable active length.

Measure at least one ordinary and one consequential day end-to-end, along with setup, repeated races and Receipt. Record wall time by segment, number of active decisions, repeated waits, and time to understand each new rule. Separate observed preview timings from classroom play; neither the hand budget nor lab-computer observation establishes how a class will spend discussion time. High-drama choices can extend play. Do not stretch every day or race to force the floor. The short Plan 03 trial and Plan 01 provisional simulation are not evidence that a production run meets it. Preserve the recorded Skip Lunch settlement follow-up before any later implementation makes food shortfall reachable.

## Recommendation and open owner choices

Recommend approval of the two-model, 12/20/30-second isolated comparison and the 20-second center-case pacing observation. If causal beats are selected for the review prototype, approve their candidate effects, event ordering, tie rule, log fields, deterministic stream boundaries, and the fact that new race causal rules are still being investigated. Otherwise select the resolved-outcome control and constrain all movement to its finish. In either case, decide the prebuild scope before any preview code is written. No final race duration, causal mechanic, camera language, day count, economy, trial alteration, production integration, or classroom-suitability finding is requested by this proposal.

## Source and evidence limits

Read-only references reviewed: canonical design (race, time, Receipt, immersion), GATE-53B owner triage, DECISION-006/013 and related decision-log entries, Plan 01 results, Plan 03 mechanism packet and owner play feedback, Plans 04/09/11, and the Plan 13 packet. Plan 03 owner feedback specifically asks for slower oval races, camera moves and rectangular framing while leaving duration/collisions as proposals. Plan 04's accepted rig is a digital base proof, not production race motion. Plan 09 motion candidates and Plan 11 compositions do not establish race behavior. No source, rig, simulation, package, or shared file was modified. No preview, image generation, classroom timing, device compatibility, or runtime behavior was tested.
