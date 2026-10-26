# Plan 09 paper-layer refinement proposal

**Stage:** Proposal only. No animation or source changes are included in this amendment.

## Request and boundary

Owner feedback on the delivered comparison is positive about the three close-view performances and asks for a small refinement: show the existing stacked paper edges separating and re-settling on impact, with gentler internal layer motion during paddling and graceful bobbing. This proposal adds only that visual articulation to the existing isolated gallery. It retains the accepted `paddle`, `graceful-bob`, `impact-recover-demo`, and `still-control` IDs, timing, start/one-shot semantics, and user controls. It does not choose production motion, change race dynamics, add game events or anatomy, alter the accepted base artwork, animate the physical companion, or touch Plan 13.

## Read-only rig inspection

`src/core/duck-rig.mjs` composes the same paper-layer hierarchy as `src/assets/svg/duck-rig.svg`. With the gallery prefix, existing elements are addressable as `gallery-duck-*`. The body and head groups are siblings, as are the body and wing groups; the body group is not an ancestor of the head or wing.

Existing layer candidates:

- Body: `gallery-duck-body-backing-rim` is the exposed cardstock backing behind `gallery-duck-body-base`. `gallery-duck-body-backing` also contains `gallery-duck-body-belly-shadow`; animate the rim path alone so the belly contact shape stays registered.
- Tail: `gallery-duck-tail-backing` is behind `gallery-duck-tail-base`; these can show a small backing edge without moving the body, neck slot, or bow tie.
- Head: `gallery-duck-head-backing-rim` sits behind `gallery-duck-head-base`. The bill group, eye group, hat slot, and monocle/hat contents are nested under `gallery-duck-head-group`; keep them together and do not animate their parts independently.
- Wing: `gallery-duck-wing-under`, `gallery-duck-wing-mid`, and `gallery-duck-wing-top` form the existing three stepped layers. `gallery-duck-wing-under-seam` is the contact shape associated with the mid layer; `gallery-duck-wing-mid-seam` is associated with the top layer. Pair each seam path with the layer motion that casts it.

The wing stack already has a common `(52,56)` pivot on `gallery-duck-wing-group`; the head assembly retains `(48,46)`. The individual path layers have no independent pivot metadata or wrapper groups. Small translations need no new source grouping. If a small layer rotation is used, define its transform box/origin report-locally in SVG view-box coordinates, using `(52,56)` for the wing pieces. Do not rotate the backing rim or tail around invented pivots; translate those slivers only.

## Proposed relative motion

These amplitudes are starting values in the SVG's 100 × 100 viewBox, not final tuned values. One viewBox unit renders as approximately 0.72 screen pixels at the 72 px race view and 3.4 pixels at the 340 px card view. Inspect both scales after approval; do not increase these amounts without rendered evidence because the existing overlap is already doing important silhouette work.

| Existing shapes | Paddling and graceful bob | Impact / recovery |
|---|---|---|
| Wing mid plus `wing-under-seam` | Mid layer peaks around 0.35–0.45 units of translation and at most 0.3° relative rotation; lag 60–100 ms behind the primary wing stroke. | Mid layer peaks around 0.7–0.9 units and 0.5° around the root dip, then returns before the top layer fully settles. |
| Wing top plus `wing-mid-seam` | Top layer peaks around 0.55–0.7 units and at most 0.5°; lag another 40–80 ms, creating a slight fan while the under layer remains the visual anchor. | Top layer peaks around 1.0–1.2 units and 0.8° after the mid layer; then re-seats 60–100 ms after the mid layer. |
| Body backing rim and tail backing | Each moves no more than 0.25–0.4 units, in a short phase lag with the body bob. No independent body-base motion. | Body rim separates by at most 0.6–0.8 units, with tail backing at most 0.5 units; they follow the root dip, then settle ahead of the head rim. |
| Head backing rim | Optional accent only: at most 0.2–0.3 units, delayed about 120 ms from the head bob. Keep it so small that the face silhouette does not appear to split. | At most 0.4–0.5 units, delayed about 100–140 ms from the dip, then last to return flush by the existing one-shot end. |

For both repeating clips, use the same existing 1.6 s and 2.4 s cycles and 15 s bounded user-started sample. Keep all layer offsets zero at each cycle boundary. The paddling fan follows the stronger wing stroke; graceful bob uses about half the paddling layer amplitude and smoother, later motion. Existing whole-rig/head/wing choreography remains the main readable movement; layer separation is a restrained cardstock accent.

For the existing ~1.1 s impact one-shot, do not change the manual trigger, duration, root/head/wing performance, or completion behavior. Proposed order: root dip begins; body/tail backing slivers start to open; wing mid moves, followed roughly 50–80 ms later by wing top; the head backing rim follows the head lag. Let the wing mid re-seat first, top follow shortly after, body/tail backing re-seat during the recovery, and head rim finish last. Any tiny settle overshoot must damp to exact zero transforms by the current one-shot completion. There is no repeated impact and no collision, damage, stamina, or race-event meaning.

## Shadows, attachment, and limits

Keep the current Mode C `duck-seam-shadow` filter on the complete `head-group` and `wing-group`. It should preserve the broad group contact shadow as each child path moves; it will not create a separate shadow per cardstock sliver. The existing paired wing seam paths provide the local overlap cue. Do not add a second per-layer drop shadow in the first pass: that may double-darken the paper edges and soften the stacked look. Browser inspection should decide whether the current complete-group filter remains convincing at card and 72 px scales. If it smears, clips, or visually fuses the separated pieces, report that evidence and request an owner decision before adding any preview-only filter or shared-rig treatment.

Keep `gallery-duck-seam-head-shadow`, bill/eye groups, accessory slots, and the body neck slot in their current attachments. Animate only the backing rim paths called out above, never the bill, eye, hat, monocle, bow-tie, or the parent `body-group`. The head cap/monocle therefore remain carried by the intact head/eye assemblies; the bow tie remains in its neck slot and is not displaced with a body backing sliver. Existing source has no per-layer pivots or wrapper pairs, but direct transforms on its stable path IDs appear sufficient for this bounded preview. No shared source/rig change is requested.

The impact demo's slight separation should remain visibly connected: do not create a gap at the neck, bill-to-face join, or wing root. No piece disappears, rotates edge-on, or detaches. If those constraints cannot coexist with a legible effect at 72 px, keep the current accepted assembly choreography and report the limitation rather than enlarging motion or changing the rig.

## Static and reduced-motion representation

Still control retains the exact neutral Mode C artwork with every layer transform cleared. In reduced motion, preserve the existing user-stepped Neutral → articulated pose → Neutral pattern, with no tween or automatic advance. Its single articulated snapshot may show the proposed internal layer offsets at one restrained held pose; returning to either neutral step clears all layer, head, wing, and wrapper transforms. Keep text descriptions clear that this is a paper-layer pose, and retain the existing Start/Pause/Resume/cancel semantics. Reduced motion must not change the appearance of odds, costs, outcomes, or race state.

## Implementation gate

Approval requested for this small report-local refinement: the named existing targets and paired seam paths; the provisional amplitude/lag ranges and impact settle order; preserving the complete-group filters initially; and the neutral/static/reduced-motion behavior above. After approval, implementation should remain in this report folder, reuse the current animation cancellation/pause bookkeeping, clear every added transform on Still/neutral, and receive focused rendered checks at card and 72 px sizes plus the existing accessory and interruption checks. Shared rig changes would require separate explicit approval. No implementation is included in this proposal.
