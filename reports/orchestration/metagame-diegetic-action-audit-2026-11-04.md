# Metagame action surfaces: navigation-only day bar

Owner requests a read-only Terra-medium investigation, 2026-11-04. Requested `gpt-6.1-terra`/medium; the child could not independently attest runtime identity. Root inspected the current renderer and the Plan52 bed repair. No new mechanics are selected by the audit. Findings describe this checkout, not all future branches.

## Current five-slot violations and proposed homes

Source: `src/ui/life/life-view.js`, `renderDayBar`, approximately lines 756–791 after the current bed repair.

| Below-scene action | Why it is an action | Proposed existing scene/object seam |
|---|---|---|
| Messages: Ren | `onSocialOpen` may create an offer/log evidence; not mere room navigation | Distinct accessible phone message target or phone contact menu. Preserve invitation/work/app/loan access; do not replace the phone's existing purpose. |
| Finish quiet time | Completes an active activity and changes the schedule | Physical duck, with a completion interaction for an already-active quiet state. Start normally completes immediately, but restored/rare active states still need an exit. |
| Start extra shift | Starts a reserved activity | Desk keys or existing work-message object, with reserved-shift identity and current confirmation. |
| Complete extra shift | Completes work and affects outcome/time | Existing work-story completion surface if present; otherwise the same work object with an explicit current-state completion. Do not make an unrelated return-home object silently award wages. |
| Finish run, Day4+ | Ends the experience with confirmation | Needs deliberate placement: global experience-ending control alongside existing exit utilities, or a separately approved in-scene closing object. Do not silently remove the exit or reinterpret it as an in-world event. |

Room controls currently go into `.life-room-nav`, while these controls use `.life-day-actions`. Styling does not make the latter navigational. Status text below the scene is not a violation.

## Already diegetic and scope boundaries

Meals use the plate; rent/loan actions use the notice/phone; furniture sales use furniture; scheduled work uses keys; Call Mom uses its note; sitting with the duck uses the companion. Held-object confirmation buttons are appropriate extensions of these objects, not below-scene violations. Ren dialogue and work-story controls are embedded in their scenes. Phone-session ending is in a held-phone overlay. Global Save, Settings and Uninstall are intentionally outside the fiction and outside this audit's bottom-bar restriction.

The Plan52 repair puts Late Evening sleep on the bedroom bed, keeping recovery and early-bed priority and using the existing authoritative sleep callback. Root viewed actual `bed-target`, `bed-decision` and `morning-reload` captures in `reports/development/plan-52-five-slot-production-transition/bed-witness-attempt1/`. The target and confirmation are visible; the gameplay/reload claims rely on the recorded isolated witness, not screenshots alone. It does not repair the remaining five actions.

Legacy/non-five-slot branches at roughly lines 793–847 also append work messages, Ren, time-advance, late-night, work and finish controls. The legacy Sit with Duck shortcut navigates despite its action-like label. Inventory their actual reachability before deletion or claims of universal coverage. No old-development-save compatibility is required, but current tutorial/non-life states must not be assumed unreachable merely from a branch name.

## Enforcement proposal

1. Give the below-scene renderer a navigation-only interface accepting validated available room destinations and a room-change handler. It should not accept arbitrary engine/action callbacks. Keep action availability and scene-object rendering separate; an action registry by itself does not enforce placement.
2. Render the actual UI in a bounded DOM/browser fixture matrix: normal morning/evening/late-evening; introduced Ren; recovery; rent/loan due; reserved and active overtime; restored active quiet; Day4+; active/returned phone session. Include cases with multiple simultaneously available objects.
3. Assert that every interactive descendant of the entire `.life-day-bar` is a valid available room control. Check buttons, links and focusable role-based controls; do not inspect only the known `.life-room-nav` container. Assert expected nonzero controls so an empty render cannot pass vacuously.
4. Activate each navigation control and assert only room/view/focus changes: scheduler, event log, finance, health, inventory and RNG are unchanged. Mere navigation may close an uncommitted held view; it must not commit an action. Verify moved actions still exist via accessible name/role and invoke their intended guarded transaction once, including cancel, repeat-click, keyboard and reload cases.
5. Add a small test of the restriction itself: a deliberately injected non-navigation control or schedule-changing navigation handler must fail the contract checker. Do not test only the same descriptor list the renderer already filters.

Pure unit tests can verify destination/action classification and free-navigation invariants. Rendered DOM/browser checks verify placement; neither can fully judge natural composition, overlap or discoverability. Existing bounded browser infrastructure can do this without adding a new DOM library. An allowlisted `navigation` label is not proof of an inert callback; behavior tests supply the second check. Root/owner visual review remains necessary.

## Recommended next boundary

Finish and commit the already-tested bed repair independently. Then prepare one consolidated UI-only action-placement/enforcement repair in Plan52 or a bounded follow-on, preserving existing engine callbacks, eligibility, outcomes and exit access. Use existing objects where possible; raise the Finish-run home as a real experience decision. Avoid another engine rewrite, new economics, unreviewed art or automatic deletion of rare-state controls. No broad implementation is authorized by this report alone.
