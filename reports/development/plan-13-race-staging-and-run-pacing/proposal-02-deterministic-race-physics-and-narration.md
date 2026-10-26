# Plan 13 follow-up proposal: deterministic race physics and accessible drama

**Date:** 2026-10-26. **Status:** proposal for QP Orch review; no implementation approval requested or assumed.

## Request

The owner asks whether the races can add acceleration, speed-dependent steering limits, duck-to-duck and wall impacts, a last-place sprint / leader-wobble rubber-band system, accessible text narration, event-linked dramatic lighting, and a future distress animation after duck collisions. This note proposes an investigation sequence and correctness boundaries. It does not select production rules, constants, race duration, or art.

## Current behavior: acceleration is not modeled

The production race in `src/core/game-engine.mjs` samples one random performance value for the player and each opponent, ranks those values, then records the finish and payout immediately. `src/ui/race-view.js` animates racers to preset horizontal positions over a short UI transition. Neither path models acceleration, turning, race-world positions, wall contact, duck contact, or a time-based velocity curve.

The Plan 13 preview is also not a physics simulation. Its candidate model samples one baseline performance speed per entrant and applies scheduled score offsets. The animated surges in `preview-controller.mjs` are presentation-only. A new simulation would therefore be a meaningful change to how a race outcome is produced, not a visual repair.

## Recommended investigation shape

Build a headless, seeded race simulation first, with a fixed simulation step and an explicit rule version. At race entry, resolve the whole race before playback and store the final outcome plus its ordered mechanical event record. The viewer then plays that committed record; camera, lighting, narration, reduced motion, pause, skip, replay, and browser frame rate cannot change the result or consume mechanical draws.

Use independently keyed random streams (or event-keyed draws) for initial performance, steering/wobbles, contacts, and catch-up effects. Give every draw a stable identity such as `(race, rules version, simulation tick, entrant, event type)`. Eligibility is computed from a frozen tick-start world state; candidate contacts are canonically ordered before any random selection. This avoids draw-count changes when rendering is slower, when an event is ineligible, or when the player opens the narrative panel. Record the seed/rule inputs, event eligibility, selected causes, applied effects, checkpoints, finish order and payout. Do not rely on the final score alone to explain what happened.

The physics candidate should represent position, heading, speed and acceleration in race-world coordinates. Ducks aim for a declared racing line. Maximum turn angle per second decreases as speed rises, so the path's curvature and available grip force a speed/handling trade-off. If a duck cannot turn tightly enough, it can cross the track boundary and hit a wall. Duck and wall impacts use comparable, bounded impulse and speed-loss rules; the exact model, units, and caps remain open for the simulation proposal. A collision-induced heading/speed change should have a visible recovery arc and be part of the same resolved world trajectory. It cannot be an animation-only sideways nudge that secretly changes later contact eligibility or finishing order.

## Candidate mechanics to compare

1. **Acceleration and cornering baseline.** Each entrant has a top speed, acceleration, braking/deceleration, and speed-dependent maximum steering rate. Compare a simple point-mass model with bounded lane/path following against a simplified kart-like model with lateral grip. Prefer the smallest model that produces readable corner choices and occasional, explainable passing without requiring reflex input.
2. **Contacts and walls.** At each fixed simulation tick, detect overlap/proximity from world positions and lane geometry. Resolve all eligible impacts in stable order, cap the number or total impulse per tick, and log participants, relative speed, impact type, pre/post velocity, recovery duration, and resulting position. Cover wall and duck impacts with comparable severity scales. Start with two-entrant contact; keep multi-duck chain reactions as a later comparison until the single impact is understandable.
3. **Rubber-band treatment.** Compare no assistance with a candidate where only the last two places at named checkpoints receive temporary acceleration toward, but never above, their own top speed. Separately compare a leader-wobble event: a small seeded heading perturbation of a few degrees with brief deceleration while the duck recovers. Specify whether these can occur in the same race, impose a combined effect cap, and record why each entrant qualified. Check that the results do not simply force a close finish or guarantee reversals.
4. **Drama presentation.** During the selected zoom/highlight and slowdown interval, dim only the environmental background and give racers involved in the recorded event a restrained glow. Preserve duck art, track boundaries, labels and controls at readable contrast. The effect must identify the event's actual participants; for example, a single-entrant wobble cannot imply a collision partner. Reduced-motion playback should keep the same event visible with a static highlight and text, without requiring animated glow or zoom. This follows the owner's preferred direction and still needs QP Orch review before implementation.
5. **Accessible race narrative.** Add a keyboard-operable show/hide button with an explicit accessible name, `aria-expanded` state and controlled narrative region. Events carry simulation timecodes and are keyboard-operable buttons: selecting one seeks the ordinary playback to its committed tick, shows the post-event state (including all contacts at the same tick), and pauses. During a race, expose only events already reached/revealed; after finish or explicit Skip to results, a clearly labeled full summary may expose every event. The narrative derives from the same mechanical event record and distinguishes event cause from player interpretation. It remains available in reduced-motion mode and after finish. A future distress animation may accompany a logged collision, but must not replace the text explanation or imply an impact that the record lacks.

## Event, RNG, log and presentation boundaries

| Concern | Proposed boundary |
|---|---|
| Race decision | One pre-race commit resolves a complete simulation using its seed, rules version and selected race choice. Plan 17's accepted 3 Down / +5% base speed / one race / non-stacking / consume-on-commit contract remains intact. |
| Time | Simulation advances on fixed ticks, independent of display refresh and the 12/20/30-second playback comparison. Slow motion changes playback timing only; no extra simulation ticks or event draws. |
| Randomness | Mechanical draws are isolated and stable by rule/event identity; no camera, lighting, audio, narrative or animation randomness enters the race model. Avoid conditional-stream drift by assigning event-keyed draws or a fixed per-tick/per-entrant schedule. |
| Contact ordering | Determine eligible pairs from one frozen world snapshot per tick. Use canonical unordered pair IDs and stable ordering; define how simultaneous contacts share capped effects. No silent rerolls or iteration-order advantage. |
| Event log | Record rule version, seed/input identity, tick/time, eligibility/reason, participant IDs, cause, bounded effect, pre/post state and any rank/reward consequence. Preserve event order so the narrative and Receipt-facing evidence can be derived honestly. |
| Playback | Render only the already committed trajectory and events. Camera projection, background dimming/glow, accessibility panel, reduced motion, save/restore, pause, skip and replay are presentation choices and cannot affect mechanics. |

## Evidence needed before proposing production integration

- Seed replay yields identical event ordering, world states, finish order and payouts across repeated runs; playback options leave them identical.
- A simple acceleration/turning case shows the expected speed-versus-cornering trade-off; wall impacts and duck contacts have bounded, explainable effects.
- Fixed-seed controls cover no contact, one contact, several eligible pairs, a wall strike, a last-two sprint, and a leader wobble. Report whether each changed an overtake, rank and reward; include at least one neutral/no-effect case so drama is not forced.
- Every visual impact and narrative line matches the logged cause, participants, timing and result. The show/hide control works by keyboard; reduced-motion text communicates the same events.
- Lighting maintains readable racers, course boundaries and UI in the ordinary and highlight states. Any later distress animation is an optional presentation of a recorded collision, not a new mechanic.
- Compare full race duration and three-race wall time against the Plan 13 pacing budget; physics runs before playback, but longer movement and recovery still have to fit the roughly fifteen-minute floor without mandatory idle time.

## Risks and owner/orchestrator decisions

- A true physics model substantially increases design, tuning and validation work. A bounded tick simulation is feasible and deterministic with a fixed seed, but it is larger than adding collision animations to the current preview.
- Last-place boosts and leader penalties can make rubber-banding conspicuous or obscure the value of the player's race choice. Compare them as a separately labeled candidate rule; do not silently combine them with existing clean-draft/bobble offsets or double-count an impact.
- “A few degrees,” top speed, acceleration, steering-rate curve, wall restitution, collision loss/recovery, checkpoint cadence, effect caps and event probabilities need explicit candidate values in the follow-on simulator, then owner review. This proposal intentionally does not invent adopted constants.
- Decide whether collision physics and rubber-banding belong in the same first proof. Recommended sequence: first acceleration/cornering plus bounded wall/duck contact in a headless simulator; then test catch-up rules against that baseline; only after mechanics are reproducible, add narrative and lighting presentation. Distress animation waits for the separately authorized animation study and approved base art.
- The canonical design promises one mutually exclusive pre-race choice and no timing taps. Do not add in-race player steering or an extra independent choice without an explicit design amendment. Plan 17's accepted trial rules are not reopened by this proposal.

## Requested QP Orch review

Please recommend whether to split the work into a deterministic-physics investigation followed by a separate rubber-band comparison, or to keep them in one simulation proposal; identify the smallest acceptable first mechanics slice; and review the proposed narrative and event/log boundaries. The owner favors dimmed environment plus racer glow during zoom/slow motion and a future collision-triggered distress animation. No implementation or asset-generation authority is requested pending orchestration review.

## QP Orch review and requested amendment (2026-10-26)

QP Orch found the proposal feasible but requested a narrower sequence and an explicit candidate contract before owner approval. This section incorporates that review. Every constant below is a proposed experiment input, not selected production balance.

### Staged experiment

Use one simple path-following point-mass model, not two competing engines:

1. Acceleration on the straight and steady baseline.
2. One cornering/braking and wall-response fixture.
3. One explicit two-duck contact fixture (A and B), at most one impact episode and no chain reaction.
4. Six-duck baseline racing with the frozen physics rules.
5. Paired-seed rubber-band variants: baseline only, catch-up sprint only, leader wobble only, then combined only if either isolated treatment merits it.

Use identical starting states and choices for paired comparisons. The first contact fixture selects A/B explicitly to inspect the response, not to claim fair field selection. A later multi-eligible-pair control must select from the canonically sorted eligible set with one keyed draw and no reroll; report the effect of order and selection. Keep the full proposal in this one investigation folder, but gate these as separate stages before any implementation expands scope.

### Candidate physics contract

| Parameter | Proposed experiment value / rule |
|---|---|
| Track | Stadium oval: two 60 m straights joined by 180-degree turns of 20 m centerline radius. Two path centerlines at ±0.6 m; corridor boundary at ±6 m from the centerline. Six ducks begin in two path lines and three staggered rows at unwrapped progress 0, −4, and −8 m. |
| Time step / horizon | Fixed `dt = 0.05 s` (20 Hz), exactly 400 ticks for the 20 s center-case horizon. Compare 12/20/30 s as separate fixed simulation-horizon candidates (240/400/600 ticks); map each committed trajectory to its intended playback presentation duration. Highlight extension is playback-only. Rank at the declared horizon by unwrapped course progress, then remaining lateral distance from the target line, then player-first/lower stable entrant ID. No per-duck time normalization. |
| State and update order | Position `(x,y)`, heading, forward speed and unwrapped path progress. At each tick: freeze start state; determine desired path tangent and event eligibility; apply event-keyed effects; choose acceleration/braking; cap steering; update speed, heading and position using semi-implicit Euler; resolve the first swept collision/boundary intersection; record post-state. Quantize stored position to 0.001 m, heading to 0.01 degree and speed to 0.001 m/s. |
| Speed | All entrants start at 6 m/s. Candidate top speed is 12 m/s. Base acceleration is 3 m/s²; braking is 6 m/s². Speed is clamped to `[0, 12]`; no cosmetic variant changes physics. Existing stat/safe/sprint performance draws must map once to top-speed input (provisionally `topSpeed = clamp(sampledPerformance, 8, 12)`); the trial's 1.05 multiplier applies to that base input once, not to every acceleration/handling parameter. |
| Steering | Maximum turn rate `ωmax(v) = max(30, 90 − 5v)` degrees/second for speed `v` in m/s. Desired heading follows the target path tangent; clamp each tick's heading change to `ωmax(v) × dt`. On the 20 m turn, required curvature rate is `v/R`: 12 m/s requires 34.38°/s, above the 30°/s cap, so a duck must brake below about 11.43 m/s or drift toward the boundary. |
| Corner braking | Before a corner, target speed is the greatest speed whose required turn rate fits `ωmax`; brake at up to 6 m/s² using stopping distance `(v² − vtarget²)/(2b)`. If the corner arrives before that distance, the steering cap applies and the duck may drift into the wall. |
| Duck contact | Candidate duck collision radius 0.5 m; collision begins at center separation ≤1.0 m, sustained overlap is one episode, and it is cleared only after separation >1.2 m. Use swept-circle checks per tick to limit tunneling. Candidate restitution `e=0.25`, equal masses; resolve along the contact normal with a symmetric impulse from frozen pre-impact velocities. Deflect headings by at most 6° away from the contact normal, with lower stable ID assigned the positive side. Resolve at most one impact episode in the initial proof. Zero normal closing speed produces no impulse and is logged as a non-impact overlap. |
| Wall impact | Treat course bounds as solid surfaces. Reflect the wall-normal velocity with the same candidate restitution `e=0.25`; damp tangential speed to 90%. Clamp repeated penetration to the first swept boundary intersection and resolve once per contact episode. Wall and duck contact use the same restitution and bounded impulse rule. |
| Lapped / disabled | No elimination in the baseline. A duck remains ranked even if stopped. Progress is unwrapped by lap count plus distance along course; ties at the horizon use the declared stable tie order. Validate maximum tick and event-record budgets before a race is accepted. |

An acceleration-derived trace should be mechanically reproducible. From 6 m/s on a straight, one second at 3 m/s² yields `v=9 m/s` and `s=7.5 m` (before any cap). At the 20 m curve, 9 m/s requires `25.78°/s`; the candidate cap is `45°/s`, so the duck can hold the line. At 12 m/s it requires `34.38°/s`; the cap is `30°/s`. A braking target of 11.43 m/s requires `((12²−11.43²)/(2×6)) = 1.11 m` of lead distance. Arriving later means the clamped heading falls behind the tangent, creating real lateral drift rather than a screen-space jump.

### Candidate collision trace

In the explicit A/B fixture, both ducks have unit mass and approach along their centerline at 8 m/s and 6 m/s. With a 2 m/s closing speed and restitution 0.25, the symmetric one-dimensional impulse gives post-impact speeds 6.75 m/s (A) and 7.25 m/s (B): A loses speed, B gains speed, and the normal relative speed reverses at 0.5 m/s. Apply the candidate 6° outward heading deflection, then resume path following under the same steering-rate cap. Log the contact tick, pair, normal, pre/post velocities, deflection, and resulting progress. For a 10 m/s normal wall impact, the same restitution leaves a 2.5 m/s outward normal bounce; tangential speed is multiplied by 0.9. These are candidate physics values for the fixture only.

### Rubber-band candidate and deterministic identity

At a frozen 50% progress checkpoint, rank by unwrapped progress. Entrants in the last two places are each eligible once for a sprint roll; candidate chance is 50%. On success, add 3 m/s² acceleration for one second, capped at that entrant's own top speed. Include a saturated-at-top-speed no-effect case. At frozen 50% and 75% checkpoints, each entrant in first or second is eligible once for a leader wobble roll; candidate chance is 10%. On success, add a signed 5° heading perturbation (sign from the keyed draw) and cap desired speed to 80% of top speed for 0.5 seconds. Both effects have one-use caps per entrant; combined treatment is a separate comparison. Freeze ranks before rolls, do not reroll when the effect is ineligible, and report resulting wall/contact cascades and total effect caps.

Use canonical keyed draws from the repository PRNG with keys `plan13/v2|<raceId>|<tick>|<eventKind>|<sorted-entrant-ids>|<episode>`. Initial performance, sprint, wobble and collision use distinct event kinds. Replays with the same rules/runtime must match the quantized state and events; cross-browser bit identity is not claimed until tested on supported browsers. Validate the seed/inputs and enforce the proposed 600-tick maximum plus a bounded event cap before committing a result. Store the immutable inputs, trajectory and event sequence once; presentation never re-simulates.

### Log, Receipt and narration amendment

Keep a bounded race artifact with quantized trajectory/checkpoints and detailed mechanics. Append compact immutable event summaries to the run log; do not append every eligible pair on every tick to localStorage. Record eligibility and reason, event outcome, participants, pre/post effect and whether the playback actually displayed that cue. This preserves the founding Receipt distinction between what was displayed, what the player did, and whether it affected them. If the player skips or exits early, do not claim unseen future simulation events were displayed; at the finish or skip, an explicitly labeled full-race summary may expose the committed result separately.

The toggleable narrative is plain sports-style narration backed by those summaries (for example, “A lost speed after contact; B moved ahead and finished third”), with no asserted emotion or causal counterfactual (“the contact cost A the win”) unless separately proven against a matched simulation. Narrative entries have stable event IDs and exact tick/timecode mappings. For simultaneous same-tick events, selecting any event shows the complete post-event tick state and captions all same-tick outcomes; do not expose an arbitrary ordering as if it were causal. Clicking an event is a player seek action, moves the playback cursor to that event's post-event state, and pauses. It cannot re-resolve mechanics, change rank/rewards, or consume RNG. Resume advances forward from the selected tick; Next advances to the next regular checkpoint strictly after that tick (if the event lies on a checkpoint, continue to the following checkpoint). Prev/Next browse the five regular reduced-motion checkpoints.

At the start of playback, list only reached/revealed events. Keep already revealed entries available when the viewer seeks backward; do not expose unreached future events until reached. At finish or explicit Skip to results, offer a visibly labeled complete event summary. Seeking does not erase prior display/action entries or imply the mechanical event occurred again: append separate presentation records for the event caption actually displayed, the event selection/seek action, and each replayed display where applicable. Maintain the founding Receipt distinction between committed mechanics and cues shown to the player.

Use a keyboard-operable narrative toggle with `aria-expanded` and `aria-controls`, no focus theft during updates, and return focus to the toggle if a user hides the panel while focus is inside it. When an event is selected, retain focus on its event control, expose an updated scene description accessibly, and provide a clear paused simulation-time/tick status plus Resume and Next affordances. Limit live announcements; make the completed narrative readable after the race and leave Uninstall unobstructed. It is not a mathematical helper panel or a manipulation-analysis surface.

Lighting candidate remains the owner's preferred single smooth dimming envelope on environmental decoration plus restrained static racer outline/glow, only for actual logged participants during the existing zoom/highlight. No flash or pulse, no added draw/tick/time extension; retain art/course/UI contrast.

### Reduced-motion race slideshow

Following the owner's direction, reduced motion uses a fixed five-view slideshow sampled from the same committed simulation, at 0%, 25%, 50%, 75%, and 100% of its fixed horizon. For the proposed 240/400/600 tick horizons, these map exactly to tick indices 0/60/120/180/240, 0/100/200/300/400, and 0/150/300/450/600. The tick-zero view uses the committed initial state; the final view uses the exact horizon state. No independent per-duck normalization or new RNG draw occurs. Each snapshot uses a fixed wide camera, with readable tick/time and progress labels.

Use simple discrete changes between views; no pan, zoom, fade, dramatic lighting, or slow-motion/time effect is required or shown in reduced-motion mode. Five checkpoints remain the default sequence. Manual Previous/Next controls are a reasonable accessible default; no forced waits. Keep Skip/results and Uninstall available. The short commentary for each interval may describe a collision and recovery that occur between snapshots, but must clearly be an event summary, not imply the collision itself was shown in a frame. Record which event cues the player actually visited/saw separately from the complete precomputed event record.

Limited event-linked seeking is in scope as a proposal capability. Each revealed event button seeks to its exact committed tick and shows an additional static still of the post-event state with the fixed wide camera; it has no animated transition, lighting, zoom or slow-time treatment. Selecting the event pauses and does not autoplay; show an accessible paused/time status and Resume/Next affordance. Event captions may explain an event even when it falls between the five regular stills, but must distinguish commentary from visual depiction. Preserve the selected event control's focus, and update the scene description for assistive technology. Arbitrary timeline sliders and frame-by-frame rewind remain out of scope.

If the user changes reduced-motion preference or display mode during playback, keep the same committed result and simulation position; switch presentation only. Snapshot selection and event seeking read the stored trajectory at their documented ticks and never resolve the race, reapply rewards, or consume RNG again. A user who resumes after seeking advances from that tick; the next regular checkpoint is the first checkpoint strictly after it. Switching back to ordinary motion resumes from the same paused event/checkpoint tick. This is an accessibility path over the same mechanics, not a second race mode.

### Follow-up routing and remaining gates

QP Orch routed the requested future collision-triggered distress animation to the later **Plan 09: Digital gacha duck motion comparison** (currently draft and blocked at its `plan-status.js check plan-09` gate). That remains Mode C digital duck motion only, with a recorded impact/recovery trigger, reduced-motion alternative, and intensity no stronger than the simulated impact warrants. No rig/art/animation edit or generation is authorized by this proposal.

Before any simulator build, the owner must select the fixed-horizon ranking contract and approve the investigative scope/constants as candidates. Before implementation expands from the physics baseline to contact or rubber-band stages, preserve those as explicit stage gates. Production integration, and verification of race event/Receipt/storage lifecycle and whole-run economy, remain separate owner decisions. Plan 17 is unchanged.

The owner has directed this reduced-motion and event-linked seeking direction for proposal review. It does not authorize implementation; return the amended proposal through the owner gate first.
