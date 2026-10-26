# Plan 09 delivery review 01

Date: 2026-10-26. Verdict: bounded repair required before owner motion selection.

Reviewed implementation `c22890d` and report `c46aaae`. Root opened the actual gallery through Chrome Browser Use on the authorized 127.0.0.1:5181 HTTP origin and exercised controls. Independent read-only Luna-high source review found no blocking defect, but flagged missing system-preference and one-shot pause coverage; root browser checks then established the defects below. A static review's absence of findings is not runtime proof.

## Required repair

1. **Reduced-motion neutral does not restore head/wing.** `index.html:343` clears the wrapper but only writes head/wing transforms for articulated pose 1. Root clicked Reduced motion, Next pose, Next pose. The page announced “Pose 3 of 3: neutral” and “The duck is still,” while read-only live DOM inspection still showed head `rotate(6deg)` and wing `rotate(-24deg)`. Clear all local transforms before applying each pose, including Previous/Return to neutral and every motion candidate. Verify exact transforms and visible pose agree.
2. **Impact one-shot cannot be paused.** `startSample` creates its animations and returns before the later `updateActionButtons()` call used by loops. Root clicked Play impact demo and observed Playing demo with Pause still disabled. Update enabled state after creating one-shot animations; verify Pause freezes, Resume continues and completion resets once. Ensure cancellation/selection cannot allow a prior completion callback to reset a newer clip.

## Focused verification

Exercise all three discrete pose sequences, previous/neutral controls, one-shot Pause/Resume and interruption, loop pause/remaining-time behavior and Still/reset. Inspect or emulate the actual prefers-reduced-motion media preference through a supported browser capability if available; manual toggle alone does not verify that branch. If unavailable, retain the explicit coverage limit. Correct report claims to match actual evidence. No broad test suite is necessary for this isolated gallery; focused actual browser checks are required.

Preserve the first set, existing anatomy, read-only shared rig and Plan 13 boundaries. Small repair: no additional implementer reviewer, no status change, no push. Commit scoped fixes and final evidence. Paddling legibility at small scale remains a valid negative investigation finding, not authority to add artwork.
