# Plan26 A/B rain/controller delivery review

2026-10-28. Root reviewed interface/controller and delivery section8 including commits3c452bc/e4c8385, with independent read-only Terra-medium review. Root independently ran39 animation tests,151 daylight checks and311 weather checks successfully. Tests establish source/state invariants, not the whole rendered experience. No root browser was driven in this review.

The glass-observer correction is appropriate for rain: if the window is fully outside the crop, continuing its rain is wasted work. Browser evidence supports eventual pause after the callback; the recorded ~1s pane lag does not establish immediate response. Scene fallback without a glass node remains documented.

## Required small repair before technical acceptance

`animation/controller.mjs` registers IntersectionObserver but starts with no visibility blocker and reconciles immediately. Until the first asynchronous callback, a newly mounted offscreen/fully cropped window starts rain and the fake flash path can accept a request. This contradicts created-blocked lifecycle behavior. Initialize a pending-visibility/offscreen blocker whenever an observer is used; clear/update only when the first observation establishes intersection. If no observer exists, retain the documented visible fallback. Pending must refuse flash without consuming cooldown; known-visible callback must not override user pause, inactive, reduced or stopped state.

Add focused delayed-first-callback tests: no animation/modified still before observation; nonintersecting remains blocked; intersecting starts only if other blockers clear; missing-observer fallback remains; teardown before first callback cannot revive state. Existing tests that assume visible should explicitly deliver a known-visible observation rather than bypassing the new guard. Do not weaken other lifecycle/still tests. No kit, still art or lightning visual changes, no added reviewer.

Root authorizes this narrow repair within the existing animation folder. Rerun affected animation/source checks. One brief own-harness browser check may verify delayed initial/cropped/visible behavior if available; preserve owner tabs/server and independent-controller coordination. Do not repeat seam/visual matrix unless code changes affect those paths. Record exact final-source coverage and lag honestly, commit scoped repair/progress last, return for review. This is continuation of the already authorized rain work, not StageC approval.

## Remaining gates

Owner still-weather look is accepted. Rain motion/seam/speed is still an owner visual gate unless explicitly accepted separately. Real hidden-page browser behavior, actual OS media preference and representative-device/compositor performance are recorded limitations; simulated events/options must not be called those real observations. A/B acceptance is distinct from lightning art/composite and production promotion. Future lightning may need its own visibility definition (room-light effect versus glass-only rain); do not generalize the current glass observer into an unreviewed flash rule.
