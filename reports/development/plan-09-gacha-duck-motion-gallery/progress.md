# Plan 09 progress report

## Scope and result

Implemented a standalone motion comparison gallery at `reports/development/plan-09-gacha-duck-motion-gallery/index.html`. It imports and reads the accepted Mode C digital duck rig through `composeDuckSvg`; the shared rig, production app, physical metagame duck, packages, and packet status were not changed.

The gallery compares `paddle`, `graceful-bob`, `impact-recover-demo`, and `still-control`. It presents the same composed duck at card (340 px), close (460 px), and race-sprite (72 px) scales. The broader packet motion list remains backlog. The impact/recovery control is explicitly a manually started display fixture and does not introduce collision, damage, stamina, or race-event behavior.

## Motion construction

- The root `.duck-shell` wrapper moves the entire paper assembly for bob, dip, and slight whole-body tilt. The bow tie remains in the body slot and follows that wrapper.
- The existing Mode C head group rotates around `(48, 46)`; the existing wing group rotates around `(52, 56)`. Hat and monocle are composed into the head/eye assembly and follow its transform. Each group retains its existing whole-group shadow.
- Paddling uses a 1.6-second repeated cycle: a pronounced alternating wing swing, opposing head tilt, and a larger root bob. The sample is user-started and ends after 15 seconds of active playback.
- Graceful bob uses a 2.4-second repeated cycle with a smaller root rise/fall, delayed head counter-motion (180 ms), and more restrained wing settle (320 ms); it also ends after 15 seconds of active playback.
- Impact/recovery is a manually started ~1.1-second one-shot with a root dip/tilt, lagging head drop, and wing fold, then a return to neutral. It has no automatic trigger.
- Pause freezes the current pose and preserves the remaining sample time; Resume continues it. Replay starts from neutral. Choosing another motion or Still cancels and resets. Still control has no animation.
- System `prefers-reduced-motion` and a manual preview override suppress tweening. The alternate is a user-stepped neutral → articulated pose → neutral sequence, with no automatic advance. A textual pose description accompanies the preview.

## Browser inspection

Inspected in Chrome at `http://127.0.0.1:5181/Quackpot/reports/development/plan-09-gacha-duck-motion-gallery/index.html`, using the already-running Vite server. The screenshot viewport appeared approximately 1508 × 719 pixels; exact CSS `innerWidth`/`innerHeight` was not queried. The gallery rendered without an apparent load error. At card and close sizes, the paper duck remained within its stage, and the existing shadows did not visibly break during the observed poses.

At 72 px, the wing stroke and whole-duck bob were visible across successive observations, but the motion did not unambiguously read as literal paddling. The accepted rig has no leg/paddle layers; this gallery deliberately does not add anatomy or change the shared rig. The comparison therefore exposes a real small-sprite legibility limit for this rig. Card-scale viewing makes the relative wing/head/root articulation easier to distinguish. This is observed evidence, not a claim that players will interpret the motion identically in every race or pull context.

The head sailor-cap + monocle configuration stayed attached to the head/eye during the inspected motion; the separate neck bow-tie configuration stayed attached to the body during root motion. These were checked as separate configurations because the rig composer accepts one accessory enum at a time.

The reduced-motion preview override was exercised at race size. The articulated pose was held without tweening and its status/pose description identified the next discrete step to neutral. The browser's system reduced-motion preference was false during inspection, so OS-level preference switching, hardware/browser variation, and assistive-technology behavior were not established. Pause/resume was exercised: after pausing, the status reported 13 seconds remaining; after resuming, the sample completed after 15 seconds of active playback and returned to neutral. The one-shot returned to neutral, and selecting Still canceled a running sample. These are direct browser observations from this session, not a broad compatibility claim.

## Review consultation and dispositions

One explicit read-only review consultation ran before delivery of the implemented artifact, in line with the Plan 09 reviewer budget. Requested setting: `gpt-6-sol`, low. The reviewer self-reported only “GPT-6”; exact variant and effort were not exposed and therefore are unverified. The consultation was conducted under an instruction-read-only posture; no reviewer write was observed. The review did not inspect the browser or shared rig, so those findings above are primary-thread observations.

Accepted findings and changes:

1. Reduced-motion Start status could imply a tween. Updated the status to explain that the articulated pose is currently shown and the next pose returns to neutral without tweening or automatic advance.
2. Pause lacked a continuation path. Added Resume and remaining-time tracking; browser-checked the paused 13-second remainder and successful 15-active-second completion.
3. The visual pose had no text equivalent. Added a live textual pose description linked to the preview group and confirmed its presence in the browser accessibility tree.

No findings were rejected. The review was one turn, roughly a few minutes; exact elapsed time was not measured.

## Validation and handoff

- `node scripts/dev/plan-status.js check plan-09` → `RUNNABLE: plan-09 is ready to implement` (checked before implementation and again before report completion).
- `git diff --cached --check -- reports/development/plan-09-gacha-duck-motion-gallery/index.html` completed without whitespace errors.
- No test suite was run; the requested validation for this artifact was browser inspection.
- Implementation commit: `c22890d` (`Add Plan 09 duck motion comparison gallery`).
- No Plan 09 packet status was changed, no production integration or asset selection was performed, and nothing was pushed.

Ready for orchestrator review. The build approval covered this comparison artifact; selecting or integrating production motions remains an owner/orchestrator decision.

## Repair 01 — focused verification

Review `review-01.md` identified a reduced-motion neutral-state defect and an unavailable Pause control during the impact one-shot. Both were repaired in the gallery source:

- `applyReducedPose()` now clears the root, head, and wing transforms before applying any requested reduced-motion pose. This makes both explicit neutral entries restore the exact untransformed rig groups.
- The impact one-shot now refreshes its action-button state after creating its three animations, enabling Pause while it runs.

Focused verification used the running Chrome page at `http://127.0.0.1:5181/Quackpot/reports/development/plan-09-gacha-duck-motion-gallery/index.html`; Plan 13's tab was left untouched. For `paddle`, `graceful-bob`, and `impact-recover-demo`, I exercised Next → Next, Previous, Previous to neutral, and Return to neutral. The articulated states had the intended non-empty inline transforms. At each neutral state, `#duck-shell`, `#gallery-duck-head-group`, and `#gallery-duck-wing-group` all had empty inline transforms, and the readout announced neutral. Still control kept Next disabled.

Impact playback exposed an enabled Pause while the status read “Playing demo.” Pause exposed Resume and “Paused”; Resume returned to “Resumed,” and a later fresh accessibility snapshot showed “Complete. Demo recovered to neutral. No gameplay event occurred.” I also started the impact demo, selected and started paddling, then waited beyond the old one-shot's 1.1-second duration. The page still reported “Playing sample,” with Pause enabled and `paddle` selected; the prior completion callback did not reset the newer sample. I paused/resumed that loop (status reported 13 seconds remaining) and selected Still. The status remained “Ready. Still pose; no animation is running” after waiting beyond the former clip deadline, and all three rig transforms were empty.

The current Chrome media preference was observed as `prefers-reduced-motion: false`. Browser capability discovery listed only viewport and tab-management capabilities, with no reduced-motion media emulation. I did not change the user's Windows/browser preference; therefore the actual system-preference-true event branch remains unverified. Manual reduced-motion sequences above are verified, but they do not establish system preference event coverage. No broad test suite was run.

Repair commit: `05c3c05` (`Repair Plan 09 motion gallery controls`).
