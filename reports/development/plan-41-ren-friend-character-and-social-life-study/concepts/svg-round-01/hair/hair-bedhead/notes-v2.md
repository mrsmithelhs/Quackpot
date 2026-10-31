# hair-bedhead-v2

- Drew: bedhead on waking, revised from v1. The viewer's left stays flattened close to the skull. The viewer's right is a wide, low, uneven bulge that spreads sideways past the ear line. The crown and side carry 5 short pointed tufts at different angles, and 2 small stray curls sit on the outside of the side bulge.
- Construction: one shared group in `<defs>` (`hair-bedhead-v2-mass`) holds a flattened cap path, 3 crown clumps, 5 right-side curl clumps (circles of varied radius) and 5 pointed tufts. It is drawn with `class="hair l3"`, then the 2 stray curls (dark 2 px outline with a `var(--hair)` inner stroke) sit between the passes, then the same group is drawn again with `class="hair" stroke="none"` on top. The curls tuck under the fill pass where they meet the mass.
- Height: the highest point is the crown tufts at about y 30, against about y 34 for the base template hair. Nothing stacks above the crown. The right bulge tops out near y 56 and sits lower than the crown.
- Template lines removed: none in this revision beyond v1 (the template `base-hs-shapes` group is no longer used inside LAYER-hair; it remains in `<defs>` unchanged). Tattoo, earrings, ears, face, neck and torso are unchanged, and the pencil stays on top of the hair.
- Not drawn exactly as specified: none.
- At a glance: it reads as messy, sleep-flattened hair with a lopsided side, and it no longer reads as a tall ponytail or single bun. The right-side circle clumps with curled tips still hint at a low side puff at small size.
