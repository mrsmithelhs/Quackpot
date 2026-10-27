# Apartment portrait-phone presence — integration gap

Date: 2026-10-26. Owner observed the production opening and asked for the portrait phone to remain part of non-dialogue apartment presentation, carrying the game invitation before entry. This records direction and a proposed bounded follow-up, not implemented behavior or a new packet assignment.

Current source `src/ui/desk-view.js` renders companion art, narrative text, setup form and launch button. It contains no portrait phone object or screen. Plan19's `src/ui/stage-transition.js` creates a temporary phone overlay for entry/return and removes it afterward. The Plan14 production handoff describes returning into the apartment portrait view, but its implementation/review concentrated on transition geometry and lifecycle. Thus the persistent apartment endpoint was omitted; the Plan21 delivery did not remove a previously implemented phone from desk-view.

Recommended next bounded UI task: compose a simple portrait phone alongside the static physical companion; put the fictional invitation in its screen at first entry, and a suitable resume screen after returning. Preserve companion setup/saving choices and keyboard entry. Make the existing turn/expand and reverse transition visually connect to that same position/object, with static equivalents and narrow/short viewport handling. No finished apartment background, new game rules, audio or 3D work is required. Keep essential text readable as HTML and record invitation cues only after visible. Do not globally animate the physical companion.

This is separate from Plan21's Duck-Dex repair and Plan23's race production integration. Use an explicit small follow-up scope before modifying shared desk/main/transition files; do not silently reopen the already accepted Shell A selection.

## Delegation attempt and working-tree hold — 2026-10-26

Owner authorized a Luna-high implementation subagent only if disjoint from active Plans21/23. Root reserved `src/ui/desk-view.js`, new `src/ui/desk-phone.css`, a top-level stylesheet import in `src/ui/shell.css`, and this report. Shared main/engine/Dex/gacha/race/transition files were excluded. Plan23 was notified of the reservation. No additional reviewer was spawned.

The subagent reported applying phone markup/CSS and passing a build, then finding both tracked source files back at baseline and the new stylesheet absent. Root independently confirmed that current source contains no phone addition. Neither root nor the subagent issued a restore/cleanup. Cause is unverified; this is not evidence that another implementer removed the work. Root stopped further source edits pending coordination. The transient build result does not verify a delivered implementation. No browser check or production acceptance occurred.

Recoverable direction: static portrait phone beside the physical companion; first visit shows the fictional invitation, return shows a resume screen; retain existing form IDs, one-activation callback and autosave choices; HTML-escape returning companion names; isolate responsive styling. Exact-position animation hookup remains deferred because it touches the separately shared transition lifecycle. Reinspect ownership and source state before resuming. The phone follow-up remains unfinished.
