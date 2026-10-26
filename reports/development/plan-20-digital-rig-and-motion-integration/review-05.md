# Plan 20 visible speech-bubble tail review

Date: 2026-10-26. Verdict: pointer repair technically accepted for owner rendered review; no closure.

Root inspected `f0cd77b`/`5af086a` source and directly viewed all three committed PNG witnesses: desktop side, narrow below and narrow above. The triangle is visibly present, joined to the bubble and pointing toward the source card in each screenshot. This corrects review04's overreliance on reported/computed pointer evidence, which did not establish a visible tail.

Cause: the same callout element hosted negative-offset pseudo triangles and overflow-y:auto, which computed horizontal overflow to auto and clipped the protrusion. The fix keeps the outer shell overflow-visible and limits scrolling to a new inner body. Safe placement bounds include the11pxpointer protrusion. No card, motion, currency or logging behavior was redefined.

Implementer reports successful build/diff checks and matching hover/focus pointer fill/borders; no new full suite or reviewer was run for this bounded visual repair. Root's direct image review establishes the requested shape in the captured conditions, not arbitrary zoom/viewport/media conformance. Prior layout/help evidence and limits remain. No extra reviewer, owner-profile/server mutation, race/Dex/rest scope, push or deployment. Browser released. Owner can review actual production appearance; Plan23 production handoff remains pending acceptance.
