# Plan 10 proposal — physical duck views and staging

## Reference and constraints

The selected D2 reference is a solid yellow rubber toy with a rounded body, orange molded beak, dark brown outlines, and graphic highlights and shadows. The physical companion remains inanimate. It may be repositioned between compositions by the character, but it has no autonomous eye, beak, wing, breathing, or squash/stretch motion. E2 layered-paper articulation belongs to the separate digital gacha ducks.

## Coherent model sheet

Build five static SVG projections from one fixed physical-object design: front three-quarter, side profile, rear three-quarter, high angle, and low angle. Keep the silhouette, material, eye placement, beak shape, molded wing placement, and outline treatment consistent. Treat each as a view of the same duck, not a redraw with a different expression.

The side profile, rear three-quarter, and low-angle close crops are the strongest checks of whether this authored 2D set stays coherent when features overlap or recede. If a view fails, record the specific geometry limitation for owner review; this proposal does not select a 3D source pipeline.

## Static views

1. **Front three-quarter:** Primary view for proportions and face placement.
2. **Side profile:** Check eye, beak, and body proportions under compressed depth.
3. **Rear three-quarter:** Check body contour and molded-wing placement as the face recedes.
4. **High angle:** Check head/body overlap and recognizable silhouette from above.
5. **Low angle:** Check underside contour, beak occlusion, and outline consistency.

## Apartment compositions for one conversation beat

Use one short player dialogue beat in the fixed apartment setting, without adding story mechanics or treating dialogue as canonical copy. Review captions can be clearly labeled as placeholders.

1. **Wide:** Duck on a table near the window, with quiet negative space around it.
2. **Medium:** Eye-level front three-quarter view against the familiar apartment background.
3. **Close:** Low table-level crop on the face and beak; framing or a restrained light shift carries the pause.

Static cuts are sufficient for this comparison. A character may reposition the prop between views; the object itself does not move autonomously.

## SVG layers and lighting

Use separate SVG groups for body silhouette, far-side features, near-side features, molded wing, outlines, and highlights/shadows. Preserve D2's rubber-toy material using restrained gradients or flat shadow shapes. Compare neutral lighting with light and dark apartment treatments. Lighting can suggest a reaction without changing the duck's expression or geometry.

## Close-up and zoom checks

After approval, inspect the same selected views at wide, medium, and close framing; several rendered pixel sizes; and actual browser zoom at 100%, 200%, and 400%. Check silhouette, eye and beak placement, occlusion, outline weight, highlight edges, gradient bands, material, and stroke consistency. Prioritize the front three-quarter face, rear-wing overlap, side-profile face, and low-angle underside. Record which browser zoom levels were actually observed; viewport changes or CSS scaling do not substitute for browser zoom. Vector edge sharpness alone is not a successful close-up result.

## Assumptions and gate

D2 supplies the physical duck's material and silhouette direction. The five projections are to be authored as a coherent 2D set; apartment staging may shift the camera and lighting while preserving the fixed diegetic setting. This proposal requests approval to author the isolated report preview. It does not authorize production integration, a 3D pipeline, new dependencies, or new story mechanics.

## Owner visual repair plan (2026-10-27)

Use the four supplied Tinkercad captures only as orientation and proportion witnesses: the front view establishes the large round head, short beak, and paired side wings; the rear view establishes a head centered over a broad body, with near and far wings on opposite sides; the right-side view shows the beak receding behind the head and the near wing overlapping the body; the high rear view shows the top of the head/body and wing placement as the whole toy turns. Keep the D2 toy material and authored SVG style.

For the repair, align each drawing to shared head, body, beak, wing-attachment, and tail landmarks. Rear three-quarter will turn head and body together, show the nape and back, offset the near wing over the body, and let the beak/eye recede at the far contour. High angle will foreshorten the head/body vertically and expose the upper surfaces; low angle will expose more underside and raise the head/beak silhouette. The paired wings must change scale, overlap, and separation with the turn rather than remain a front-view wing pasted on. The five-view sheet is the check for these landmarks and feature occlusion.

Keep the same apartment. Draw sofa/table back legs behind their solid furniture surfaces, with front legs joining below the surfaces. Reframe the close composition as a tabletop study: the static duck sits beside a supported portrait phone with blank invitation space, plus generic pen, papers, keys, and lip-balm tube. Other apartment areas remain future proposals; no room catalog is part of this repair.

For Dark, add a visible desk lamp and a strong warm pool centered over the duck and tabletop props, with gradual falloff, contact shadows, and subdued room edges. Compare neutral and warm lamp at the same desk composition; maintain one lamp direction across all objects and keep the duck details legible. This is a report-only staging repair; source and packet ownership remain unchanged.

## Whole-object view redraw — geometry approach (2026-10-27, Sonnet handoff)

**Diagnosis.** Earlier views were one front-view body silhouette reused with features moved: the body path barely changed between front/rear/high/low, the head was only translated, and the rear view kept both wings and a face-side head over an unturned body. Nothing fixed a camera, so "high" and "low" differed from "front" by shifting paths rather than by changing which surfaces face the viewer.

**Convention.** One landmark model (see `sonnet-view-repair.md`: squat body, head sphere about as wide as the body, spatula bill below the eye line, side-set eyes, side-moulded wings, raised tail) and one camera: azimuth from the duck's front toward its left, elevation above the table. Front = az 35°/el +12°; side = 90°/+5°; rear = 148°/+16°; high = 35°/+52°; low = 35°/−16° (high and low keep the front azimuth, so only elevation differs). Each view's silhouettes, near/far wing, eye visibility, underside visibility and painter order follow from that camera rather than from redrawing by eye.

**Occlusion rules used.** Head paints over body when the camera is above the body top (front, side, rear, high) and under the body edge when the camera is below it (low). The near wing paints over the head's lower flank in profile and from behind; the far wing paints before the body. An eye is drawn only when its surface faces the camera (rear: none; side: one). The bill is drawn after the head when it points toward the camera and before it when it points away (rear: only a sliver clears the head). The tail is behind the body from the front and in front of it from behind. Underside shading appears only when the camera sees the underside (low).

This is an authored 2D set; the projection was used as a drafting aid and baked into static SVG. No 3D source pipeline is adopted or proposed here.

## Desk cameras (2026-10-27, owner-authorized preview change)

The old desk close-up mixed cameras (upright phone in side elevation beside flat top-down papers/pen/keys). Replaced by two single-camera compositions: a horizontal eye-level side view (tabletop as a band with a front edge, upright objects drawn front-on, lamp at the left) and a straight-overhead view (every object a footprint, shadows away from an upper-left lamp). Each carries a different object collection so the two desks do not look like copies. The phone follows the game's 9:17 desk-phone proportions and screen regions. The top-down duck is an extra overhead drawing, not a sixth model-sheet view. See `desk-references.md`.
