# Plan 09 motion gallery proposal

**Stage:** Prebuild proposal for owner/orchestrator review. No gallery or production motion has been built.

## Scope

Compare the accepted Plan 04 Mode C hybrid paper duck in three short clips—paddling, graceful bobbing, and a labeled impact/distress-to-recovery demonstration—alongside a still control. This first batch is deliberately smaller than the packet backlog. It does not animate the physical metagame duck, change gameplay or race rules, add collision/damage/stamina, alter outcomes, or integrate motion into the production game.

The preview should be a local, isolated gallery with one selected duck at a time, motion labels and approximate duration, start/pause/replay controls, a still/reduced-motion control, and stable selectable motion IDs for owner notes. The impact button should read **Play impact demo** (or similarly explicit fixture wording); it is a user-triggered presentation cue, not a simulated race event. A report-only wrapper transform around the composed SVG may supply whole-duck root motion; no shared rig edits are proposed.

## Proposed clips

| ID | Performance and layers | Duration / trigger | Read and trade-off |
|---|---|---|---|
| `paddle` | Give the entire rig a gentle vertical bob through the wrapper. Add a more pronounced alternating wing stroke around `(52,56)` and a small counter-rotation of the head around `(48,46)`. | 1.6 s cycle, available as a user-started 15 s repeat sample; Start is explicit. | The wing's repeated stroke should read more rhythmic and energetic than the graceful bob. The rig has no leg/paddle shapes, so it cannot show literal feet stroking water without new artwork. This comparison tests whether upper-body motion alone suggests paddling; an unclear result is a valid negative finding, not permission to add anatomy. |
| `graceful-bob` | Give the entire rig a slow, small vertical bob through the wrapper. Add a smaller, delayed head counter-rotation around `(48,46)` and a restrained wing settle around `(52,56)`. | 2.4 s cycle, available as a user-started 15 s repeat sample; Start is explicit. | Quiet, composed motion with lower amplitude and slower wing movement than `paddle`, so the candidates are visibly distinct. Compare initial viewing with the bounded repeat sample for comfort/repetition. |
| `impact-recover-demo` | On manual trigger, make a quick whole-rig dip/tilt through the wrapper, fold the wing slightly, and let the head lag into a brief lowered/distressed pose; return the wrapper, head, and wing to neutral. Keep recovery readable and avoid a prolonged “injured” state. | About 1.1 s one-shot; triggered only by the clearly labeled gallery button; Replay restarts it. | Demonstrates a brief visual reaction. It represents no collision, damage, stamina loss, race penalty, or gameplay event. If major paper-assembly motion cannot communicate the beat, report the limitation rather than expanding scope. |
| `still-control` | Same Mode C duck, with no animated transform or transition. | Persistent control; selecting it cancels the current clip and resets to neutral. | Establishes the reference appearance and provides an immediate static result. |

The durations are comparison starting points, not selected production timings. Repeat samples run only after the user starts them and stop after 15 seconds unless paused or canceled sooner; there is no page-load autoplay, mandatory wait, or full shelf animation. Pause freezes the current pose. Selecting another clip or Still cancels every prior animation callback, resets the duck to neutral, and does not resume the old clip. Replay starts the selected clip from neutral.

## Rig mapping and limitations

Read-only inspection of `src/core/duck-rig.mjs` and `src/assets/svg/duck-rig.svg` found these useful existing groups:

- `body-group` contains body, tail, and neck accessory (`bow-tie`) content, but does not parent the head or wing. It and the tail have no declared motion pivot.
- `head-group` declares pivot `(48,46)` and contains the bill, eyes, hat slot, and head-attached eye accessory slot.
- `eye-group` declares pivot `(40,33)`; the monocle is nested in its eye slot.
- `wing-group` declares pivot `(52,56)` and contains the three stepped wing paper shapes.
- The bow-tie is in the body/neck slot at `(41,60)`; the hat is in the head slot at `(46,22)`.

Mode C applies a drop-shadow filter to the complete head and wing groups. Rotation should therefore keep each group and its filter together; inspect for clipping, shadow drift, or a softened paper edge at wide, close, and thumbnail sizes. The existing pivots support head and wing articulation, but no leg/paddle layers, no independently hinged wing paper layers, and no explicit body/tail pivots are provided. The first proposal avoids requiring new rig anatomy or source changes. If those omissions prevent a clear comparison, pause and return the limitation for a separately approved source-change request.

Transform ownership matters because the rig groups are siblings rather than one nested articulated skeleton. Apply any whole-duck root motion at a report-only wrapper around the composed SVG. That root motion carries body, tail, and neck accessory together; head, hat, eye and monocle inherit root motion plus the head counter-motion; wing inherits root motion plus its local stroke. Do not transform `body-group` as if it were the parent of head/wing, which would detach the neck accessory from the rest of the duck. Wing/head rotation moves each major paper assembly, but does not articulate the three internal wing paper shapes independently; the proposal makes no claim of internal feather hinges.

## Accessories and close inspection

After owner approval, compare a no-accessory duck and a representative attached look such as sailor cap plus monocle, then a body-attached bow-tie case. Check that the hat follows head rotation, the monocle stays with the eye, and the bow-tie follows the body; record any transform/pivot mismatch rather than patching the shared rig. Inspect the shadow-filter boundary and overlap at a wide view, close view, and small thumbnail.

## Static and reduced-motion behavior

The gallery must honor the browser reduced-motion preference even if Start is clicked while it is active. Instead of tweening, present three user-controlled discrete pose steps: **Neutral → articulated pose → Neutral**. The steps do not advance automatically; no timing or outcome depends on motion. This preserves the candidate's articulation for comparison while providing no moving transition. Keep the same labels and motion IDs available, visibly indicate reduced motion, and let Still reset directly to neutral. No information or outcome depends on motion.

## Post-approval browser evidence plan

Once the mechanism proposal is approved and the gallery exists, use the already-running local Vite preview if it is reachable; coordinate with its owner if it is unavailable. Record the actual browser, URL, and viewport(s) observed. Inspect wide, close, and thumbnail framing; still versus each clip; no-accessory, head/eye accessory, and body accessory attachment; the Mode C shadow edge; OS reduced-motion behavior; and impact-demo trigger/replay. Interrupt a repeat sample and the one-shot with Pause, change selection during motion, and return to Still to verify Pause freezes the pose, cancellation clears prior callbacks, and Replay starts from neutral. Run the user-started 15-second repeat sample without requiring a wait to interact. Confirm OS reduced motion remains honored after Start is clicked and the three manual pose steps never tween or auto-advance. Report actual clip durations and any visible clipping, jitter, accessory drift, focus/label issue, or untested condition. This is a browser observation plan, not a physical classroom-hardware or assistive-technology claim.

## Approval requested before implementation

Please approve or revise the proposed three clips, rough durations and triggers, wrapper/head/wing transform ownership, use of existing pivots without adding paddle anatomy, the accessory checks, cancellation behavior, and the discrete reduced-motion pose steps. Implementation and browser inspection will begin only after this mechanism proposal is approved. No image generation, package change, production integration, Plan 13 edit, or packet-status change is included.
