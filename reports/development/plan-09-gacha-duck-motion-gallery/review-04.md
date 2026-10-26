# Plan 09 doubled-layer magnitude review

Date: 2026-10-26. Verdict: technically accepted for owner rendered selection; not closed or integrated.

Owner explicitly authorized doubled paper-layer separation in QP Orch as well as the implementer chat. Root inspected `092603f` and final evidence `67a27cb`: the common `paperTransform` helper multiplies local paper-path translations and rotations by two across looping clips, one-shot peak/settle/rebound and manually stepped poses. Parent root/head/wing choreography, timing and phases remain unchanged; identity transforms and reset/cancellation paths are preserved. Only gallery/report files changed in these commits.

The implementer held an explicitly coordinated browser turn and reported doubled top-wing/seam impact pose values of `translate(2.2px, .7px) rotate(-1.6deg)` with unchanged parent rotations, card-scale layer/shadow appearance, Pause/Still and static neutral reset. These are implementer browser observations, not a new root browser rerun. Root's prior neutral/cancel checks plus the narrow common-helper change justify no broader test or duplicate browser run for this adjustment.

Limits remain explicit: fine 72px edge/shadow quality was not established because that screenshot timed out; actual system reduced-motion=true remains unverified. The owner must judge whether the stronger separation is preferable. No additional reviewer, source/rig change, production adoption, push or deployment. Browser slot is released.
