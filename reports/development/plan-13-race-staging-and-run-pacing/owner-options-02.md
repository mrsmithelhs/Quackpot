# Plan 13 owner options: collision response and finish contract

**Date:** 2026-10-26. **Purpose:** report findings and present choices only. This note does not authorize or adopt race-mechanic, result, duration, or payout changes.

## Current preview evidence

The browser page inspected was `http://127.0.0.1:5181/Quackpot/reports/development/plan-13-race-staging-and-run-pacing/preview.html`, initially set to baseline physics, R03, 20 seconds, close camera, no slow-motion, ordinary motion. Proposal 02's physics preview was explicitly authorized by the owner and is committed in `56325e7` plus progress commit `854063d`; the checkout's latest observed HEAD at this investigation was `1942dc2` after unrelated Plan 09 commits.

| Seeded control | Keyed mechanical draws | Mechanical event record | Contact evidence |
|---|---:|---|---|
| R03, baseline | 6 performance + 1 event = 7 | One duck contact, tick 126 / 6.30 s | C and E; one eligible pair |
| R03, catch-up only | 6 performance + 5 events = 11 | Same contact plus two sprint rolls with no effect | Same pair and contact response |
| R03, wobble only | 6 performance + 7 events = 13 | Same contact plus three wobble rolls with no effect | Same pair and contact response |
| R03, combined | 6 performance + 11 events = 17 | Same contact plus five no-effect assistance rolls | Same pair and contact response |
| R01, baseline | 6 performance + 0 event = 6 | No mechanical event | Useful no-contact seed control |

The R03 contact has a 0.592 m/s relative closing speed. The current equal-mass restitution impulse changes C from 9.875 to 10.246 m/s and E from 10.482 to 10.112 m/s. Each outgoing velocity is then rotated by 6 degrees in opposite pair-relative directions. The rotation itself preserves each post-impulse speed; restitution transfers speed, so it is inaccurate to say that both ducks lose speed. The event table lists both participants and both speeds. The narrative says their headings and speeds changed, then says recovery is recorded, but the event has no explicit recovery-duration field. The world model has a single duck-contact episode cap per race; later contacts/chain reactions are not resolved. The selectable physics treatments do not include a standalone collision toggle; use R03 for a contact and R01 for no contact.

A bounded 30-race baseline scan using the same named seed and race IDs S0–S29 found 26 races with a duck contact, zero wall impacts, zero wall-overlap clamps, and zero ticks with more than one eligible pair. This is a small candidate-seed sample, not a contact-frequency estimate. Wall bounce is represented by the arithmetic fixture only; it has not been demonstrated in a naturally evolving race.

## Collision choices for owner decision

The current **6-degree** result is the paired no-change control. If a stronger visible response is desired, the following remains a candidate for review, not implementation authority:

| Candidate element | Bounded experiment rule |
|---|---|
| Selection | Keep the existing frozen, canonically sorted eligible pair set and its one keyed pair-selection draw. Resolve at most one pair and one episode per race in this experiment. |
| Heading | Give each participant its own keyed draw for a 15–30 degree heading deflection. Use contact-normal sides so the ducks turn away from one another; magnitude is independent per participant. Compare against the current fixed 6-degree response. |
| Recovery | Let the existing speed-dependent steering cap return each heading toward the path tangent. At race speeds near 10 m/s the current rule allows about 40 degrees/second, so a 15–30 degree heading error takes roughly 0.38–0.75 s to steer back, if no second event interrupts it. Record initial deflection, per-tick heading error, and recovery ticks. Do not add a second collision-specific speed penalty in this comparison. |
| Other effects | Keep the existing equal-mass restitution and positional correction unchanged. A wall strike may still follow the physical deflection under current rules. A secondary duck contact is suppressed by the one-contact-per-race cap; no chain reaction is claimed. |
| Narration | Say both ducks turned away and recovered over the measured interval. Report each speed delta separately; restitution can increase one duck's speed while reducing the other's. Do not claim both slowed or that the contact caused a rank change without a matched result comparison. |

This option would change the simulated trajectory, possible wall contact, and finish ranking. It requires owner approval before implementation. A no-contact seed and the current 6-degree response should remain controls if approved.

## Finish location and race contract

The SVG finish marker is centered on the top straight at world `x=0, y=-20 m` (screen `x=450`, `y=104`). `frameAt()` maps unwrapped progress with `s = wrap(progress + 30, L)`, where `L = 2(60) + 2π(20) = 245.663706 m`. Progress zero begins at that marker for the lead row. The three staggered rows begin at progress 0, −4, and −8 m. A complete lap from the line requires reaching unwrapped progress `L`.

At the R03 20-second, tick-400 horizon, finish progress is P 206.743 m (1st), B 205.295 m (2nd), A 202.292 m (3rd), E 198.368 m (4th), C 191.104 m (5th), D 187.805 m (6th). None reaches `L`; their upper-left location at 100% is the accurate projection of those progress values. Here 100% means **all 400 simulation ticks elapsed**, not “crossed the finish.” The current `Finish · Player leads the fixed-horizon result` message is consistent with the model, while the track's physical START / FINISH marker can still suggest a line-crossing race.

| Option | Race/result meaning | Consequence for pacing and presentation |
|---|---|---|
| **A. Fixed-horizon distance contest** | Keep 12/20/30 seconds and rank by progress when time expires. The final camera state may be anywhere on the oval. | Preserves the existing fixed-duration comparison and current 20-second budget. A future owner-approved copy/visual treatment should distinguish elapsed horizon from line crossing; no racer is moved to the line. |
| **B. Fixed-lap finish-line race** | Continue the seeded physics until racers cross the actual line; rank by crossing time, with an explicit lap count and maximum-race guard. Retain every duck's shared world trajectory. | Simulation time becomes variable and longer than 20 seconds for this six-duck candidate. Reassess the fifteen-minute allocation. Presentation may use a declared global mapping of the authentic whole trajectory to a display duration, or preserve real-time duration; no per-duck time normalization and no forced simultaneous crossing. This requires an explicit amendment to the fixed-duration ranking contract before code changes. |

The owner has expressed an expectation of a physical finish-line crossing, while the already authorized preview implements the fixed-horizon contract. This report recommends keeping those as a deliberate A/B contract choice before changing ranking, horizon, or race pacing.

## Scope and evidence boundary

This is a report-only options addendum. It does not change the already committed race trajectory, event sequence, PRNG keys, collision severity, finish rank, durations, or payout. The renderer/control repairs proceed independently under the current authorization. Plan 17 remains unchanged; no production source, rig, Plan 09, packet status, or push is in scope.
