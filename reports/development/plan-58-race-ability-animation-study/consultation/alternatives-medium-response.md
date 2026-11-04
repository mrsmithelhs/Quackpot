# Sonnet-medium creative response (sanitized)

# Alternatives consultation: Wide Flap, Flap Ahead, Draft

All ducks in the stills face left. "Forward" means screen-left in these stills, and everything mirrors when the heading reverses.

## What I saw in the stills

- **Wide Flap:** The cue is two pale arcs beside a small wing. They are low-contrast against the pale-green ellipse and look like generic sound waves. At race scale (`wide-small.png`) the wing and arcs disappear, and A and B read as two adjacent ducks.
- **Flap Ahead:** A is stacked on B and the two silhouettes merge. The raised wing is the only cue, and it's small. At 40–84px it reads as one lumpy duck, not "A passes over B".
- **Draft:** The pale streaks sit between the ducks on the ellipse, with almost no contrast and no outline. They are hidden when the ducks are close, and nothing names B as the leader.
- **Owner-selected controls to stay away from:**
  - Bounce uses red up-arrows on a ground pad. Avoid red, arrows and ground pads.
  - Crowd uses horizontal pale-blue outlined air bars plus a teal rippling bow wave. Avoid long horizontal blue bars and teal mounds.

## Shared rules

- Use a dark outline (about 2px at race scale) on every new cue, as Bounce and Crowd do.
- Pair color with a distinct shape. Meaning never depends on color alone.
- Keep labels and faces clear. Cues go behind or beside the duck and never cross the eye or beak.
- Cues are one-shot or slow, with no flashing. Nothing flickers faster than about 2 Hz.

## Aerodynamic pose: shared note

**Rig caveat (assumption):** I'm not assuming a deformable neck. The pose is built from rigid swaps and transforms:
- Swap in a pre-drawn "head-forward" head sprite.
- Rotate the whole duck about 8–12° nose-down.
- Squash the body about 6% in height and stretch it about 6% in length.
- Add a neck "bridge" shape in body color, drawn behind the head and in front of the body, so no gap shows at the join.

**Rubber-duck rules:**
- Keep the head round and the beak unchanged.
- Never stretch the head or beak.
- Keep the eye fully visible, and don't tilt the head past about 15° or let it overlap the body outline.
- If a hat is worn, it rides on the head sprite and tilts with it, so it never detaches.

**Telling Draft from Flap Ahead:**

| | Draft | Flap Ahead |
|---|---|---|
| Pose | Low, tucked: head and rotation lowered, wings folded flat, body skimming the water | High, extended: nose-down but lifted, wings spread, feet and body clear of the water |
| Motion | Stays on the water line | Arcs up and over |
| Cue | Tether to a leader | Shadow and a landing mark |

- **Flap Ahead keeps the head level with the body line**, giving a "diving glide" with a lift.
- **Draft drops the head below the body line**, giving a "tucked crouch" with the beak pointing at the leader's tail.
- Their silhouettes differ strongly: Draft is a low wedge, Flap Ahead a tall arc.

## 1. Wide Flap

**Upgrade:**
- Make the wing larger, and add a bold outlined "wing-sweep" crescent in the wing's color.
- Set the arcs in white with a dark-blue outline, three nested and thickening outward, starting at the wing tip.
- Add a short dashed line from the arc's outer edge to the named target's label chip, so the relationship to B is explicit.
- Draw the arcs in front of A and behind B so B's face stays clear.
- **Start:** The wing rises, then the sweep draws in.
- **Active:** The arcs hold, with B's body leaning slightly away.
- **End:** The arcs fade and the dashed line retracts.
- **Failure risk:** Arcs could be confused with Crowd's air bars. The dashed link and the nested crescent shape are what separate them.

**Distinct alternative, "Wing-Fan Gust":**
- **Pose:** A rears slightly upright with both wings spread wide, in a frontal-ish "open cloak" shape.
- **Graphics:** A big fan-shaped paper-feather wedge, 4–5 chunky overlapping feather shapes in A's color, projects from A toward B. Small 3-dot "puffs" travel along the wedge.
- **Layers:**
  - Back: a soft wedge-shaped shadow on the ground under the wedge.
  - Front: the feather tips overlap A's own wing only.
  - B stays unobstructed.
- **Start:** The wedge unfolds like a hand fan.
- **Active:** The wedge holds still while the puffs move.
- **End:** The wedge folds back.
- **Heading reversal:** The wedge mirrors and always points at the named duck, even if that duck is behind A.
- **Target relationship:** The wedge's tip lands on B, and B's label chip gets a small matching feather icon.
- **Race scale (40–84px):** The wedge reads as a bold fan silhouette. The puffs are dropped, and only a 3-feather version is shown. Enlarged, the full detail and puffs appear.

**Static/reduced-motion:** The fan wedge is shown fully open, with a feather icon on B's chip and the dashed link.

## 2. Flap Ahead

**Upgrade:**
- Add a ground shadow that separates from A as it rises and shrinks.
- Add a small "takeoff" water-splash ring at A's start point and a landing ring at the end (about 3 chunky droplets each).
- Fan A's wings fully open and enlarge them.
- Offset A clearly above B so the silhouettes separate, with a gap of at least about half a body height.
- Draw A in front of everything, and leave B visible below.
- **Risk:** Rings could be mistaken for Crowd's ripples, so use circular and dashed shapes, not mounds.

**Distinct alternative, "Arc Trail":**
- **Pose:** The aerodynamic Flap Ahead pose: head level, wings spread, nose slightly down.
- **Graphics:**
  - A thick, solid, curved parabola ribbon, in the duck's color with a dark outline, arcs from the takeoff point to the landing point.
  - A small "X" or ring marks the landing spot.
  - A small ring marks takeoff.
  - The ground shadow stays on the water line as a separate dark oval.
- **Layers:**
  - Back: the arc ribbon and the shadow.
  - Front: A.
  - B and other grounded ducks pass under the ribbon without being obscured, because the ribbon stays above head height.
- **Start:** The takeoff ring pops and A lifts.
- **Active:** A follows the arc, and the shadow slides underneath along the water.
- **End:** A lowers, the landing ring appears, and the ribbon fades.
- **Heading reversal:** The arc and wing pose mirror, and the landing mark stays at the leading end.
- **Target relationship:** None needed. Overflown ducks are simply passed under the arc. Airborne contact and landing effects are left open and not shown.
- **Race scale:** The arc ribbon and the shadow gap carry the meaning. The splash droplets drop out. Enlarged, the full detail appears.

**Static/reduced-motion:** A is held at the apex, with the full arc ribbon, the shadow separated beneath, and the landing mark.

## 3. Draft

**Upgrade:**
- Replace the streaks with a **tether**: two outlined curved bands running from B's tail to A's beak, in the leader's color.
- Draw the bands **on top of the water, and in front of B's tail but behind A's head**, so they are never hidden by either duck.
- Add a small matching "leader chevron" icon on B's label chip.
- **Start:** The bands stretch out from B.
- **Active:** The bands hold, with a slow dash flow.
- **End:** The bands snap and retract toward B, which marks disengagement. Where possible, A's pose releases at the same moment.
- **Risk:** The bands could look like Crowd's horizontal bars. Curve and taper them, and make them colored in B's color.

**Distinct alternative, "Slipstream Pocket":**
- **Pose:** The Draft pose: head dropped, wings folded flat, tight to the leader.
- **Graphics:**
  - A rounded wedge, like a rounded tapering "V", in the leader's color trails behind B and ends at A's beak, so A sits inside the pocket.
  - Chunky chevron "<" marks inside it point toward B.
  - A small leader-color ring marks B's tail.
- **Layers:**
  - Back: the pocket floor, a flat shape on the water line.
  - Front: only a thin outline rim, the outer edge, drawn above both ducks' feet but never over faces.
  - Faces and labels stay unobstructed.
- **Start:** The wedge grows from B's tail until it reaches A.
- **Active:** The chevrons slide toward B slowly.
- **End:** The wedge detaches from A, pulls back into B and shrinks away. A's head lifts back to neutral.
- **Heading reversal:** The wedge, chevrons and poses all mirror. The pocket always trails from B's tail.
- **Target relationship:** The shared leader color links B, the wedge and A, and B's label chip shows a matching chevron.
- **Race scale:** The wedge silhouette and the head-down pose carry the meaning. The chevrons simplify to 2. Enlarged, all chevrons and the rim detail appear.

**Static/reduced-motion:** The wedge is drawn at full length, A is in the pocket with its head down, and B has its ring and chevron icon.

## Ambiguities and at-scale risks

- Multiple ducks nearby make it unclear which is the target or leader. This is mitigated by the dashed link, the leader color and the chip icons.
- The pale-green ellipse background washes out light cues. Always use dark outlines.
- Wide Flap's arcs and Draft's bands could be confused with Crowd's air. The shapes above differ, but test them side by side.
- Squashing and rotating the duck changes its silhouette. Verify the eye and beak stay legible at 40px.
- A mirrored head sprite means any hat or asymmetric marking must also be mirrored.

## Recommended direction for Sonnet-high

| Ability | Direction |
|---|---|
| Wide Flap | **Wing-Fan Gust**: a fan wedge pointing at the named duck, with a feather icon on its chip |
| Flap Ahead | **Arc Trail**: a solid parabola ribbon, a separated shadow, and takeoff and landing rings |
| Draft | **Slipstream Pocket**: a leader-colored wedge, a head-down pose, and a matching chevron on the leader's chip |

Draw the three poses as rigid sprite swaps and state the fallbacks. Then produce all three at 40, 84 and enlarged sizes, in start, active, end and static versions, and in both heading directions.

**Assumptions:**
- Rigid-sprite poses, since I'm not assuming a deformable neck.
- Label chips can take small icons.
- Leader color can be sourced from the duck's own palette.
- The authored scenes only show examples, not mechanics.
