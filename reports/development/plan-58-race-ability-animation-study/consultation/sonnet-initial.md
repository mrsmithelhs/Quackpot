# Sonnet initial creative consultation

Requested and CLI-reported model: claude-sonnet-5-5; medium effort requested, effective effort unverified. Final JSON did not expose image-read trace. The provider response is advisory and is not owner selection or proof of mechanics.

I read both images. `race.png` shows six ducks (yellow A and D, green B and E, pink C and F, with a sailor hat on C) at about 50–60 px wide on a 947 px scene. The water is a muted sage-teal with a pale oval and a dark vignette. White pill labels sit above each duck. `pair.png` is a tighter crop of A and B facing each other. I'm drawing on only what is visible: the green duck's contrast against the teal water is low, the labels are the clearest high-contrast element, and nothing here shows motion or lighting changes.

## Shared vocabulary

- **Channel per meaning, always paired with a shape, never color alone.**
  - Ground or water events use a ripple or ring under the duck.
  - Air events use an arc and a drop shadow on the water.
  - Speed events use chevrons in the wake.
  - Protection or response events use a small paper tab or badge at the duck's flank.
- **Contrast.** Every cue is a cream paper cut-out with a dark navy outline, so it reads on the light oval, the dark vignette and dim lighting. Hue is only a secondary tint.
- **Label stays untouched.** Cues live below or beside the body, never over the pill. A small state glyph can sit at the pill's edge. Its text twin is a short status in the race log or label suffix, for example "Duck C: Bounce".
- **Phases.**
  - Start: a short anticipation, such as a ring or tab appearing.
  - Active: a held, low-motion state.
  - End: the cue settles or fades back into the water.
  - None of these is compulsory. Reduced-motion users get the static start/active/end poses.
- **Body turns.** Anchor cues in world space (the water or the shadow), not the beak direction. Mirror them only where direction is meaningful, such as chevrons.
- **No-trigger.** Show nothing. Optionally show a faint, non-promissory "ready" tick only in the Duck-Dex or choosing view.
- **Cancellation.** The cue folds flat and fades without a flourish, with no success or failure sting.
- **Contact is a separate visual.** The collision itself is Plan 55/57's and is not part of any ability cue.

## Candidates

| Candidate | Shape / layer motion | Water or air accent | Start → active → end | Participants / limits at race scale |
|---|---|---|---|---|
| **Burst** | Triple chevron tail tab. Tail layer stays trailing, no lift. | Long thin wake streaks | Chevrons appear → hold → shorten | Self only. It is a whole-race rating, so show it in the Duck-Dex or choosing view only, not as an in-race event. |
| **Guard** | Small paper shield tab at the flank, after a real collision. | Faint inner ring on the water | Tab slides in after contact → rests → slides out | Self. It must not imply immunity. Show it as "response", with no sparkle. Keep it visually unlike any injury mark. |
| **Wide Flap** | Wing layers fan out sideways, flat on the water. | Two side ripple arcs, no impact star | Wings spread → hold → fold | Self and nearby ducks. Pushed ducks get only a lean or a drift line. No hit mark, so it can't read as a collision. |
| **Dive** | Body layer sinks under a water-colored paper strip. | Closed ring, bubbles | Ring → body mostly hidden, label stays → resurfacing ring | Self. The label must stay visible. Keep a small beak or head-tip silhouette so the duck is still locatable. |
| **Flap Ahead** | Wings up, body lifted a small step. Shadow offset below. | Round shadow on water, no rings | Wing lift → hold → shadow re-merges | Self over other ducks. The landing is unresolved, so end on a neutral touchdown ring. |
| **Draft** | Follower tucked behind a leader, with a thin tether line of chevrons. | Narrow wake channel | Line forms → holds → line thins | Follower and leader. It needs two participants and must not imply a guaranteed gain. |
| **Straight Shooter** | A straight thin arrow bar through the body axis. | Straight wake line | Bar appears after contact → holds → shortens | Self. Pair it with a visible contact moment. It must not imply speed. |
| **Bounce** | See the two treatments below. | See below | After a real collision and a successful activation | Self. |
| **Quick Recovery** | A curved "return" arc that comes back to the lane center. | Soft ring that tightens | Arc → short hold → arc closes | Self. Differs from Straight Shooter by the curve and the lane-centering motion. |
| **Crowd Surge** | See the two treatments below. | See below | When in a crowd | Self. |
| **Steady Nerves** | The body wobble is damped, with small calm brackets either side of the body. | Slim, even ripple | Brackets → hold → fade | Self. The wobble is subtle at 2.5 rem, so rely on the text status. |
| **Wake Break** | A V notch cut into the wake behind the duck. | Wake split in two | Notch → hold → closes | Self and the close follower. It needs a visible follower, and its limit is that it reads close to Draft. |

## Bounce: two treatments

**Bounce A, "Spring arc."**
- *Shape and layers.* The body layer rises along a short parabolic arc, with the shadow layer left behind on the water. The arc is drawn as a dotted paper path.
- *Accent.* A contact ring remains where the real collision happened, then a second smaller ring appears beneath the rise.
- *Phases.* Start is a quick squash after the contact. Active is a brief lift. End is a landing ring.
- *Participants.* Self only. The ducks it passes over get no mark.
- *Limits.* At 2.5 rem the lift is small, so the shadow gap does the work. It reads closely to Flap Ahead.

**Bounce B, "Rebound pad."**
- *Shape and layers.* A paper lily-pad disc pops up under the duck. The duck's body rises on it a little, and the disc shrinks away.
- *Accent.* The disc's own shadow stays on the water.
- *Phases.* Start is the pad popping out after contact. Active is the lift. End is the pad sinking.
- *Participants.* Self only.
- *Limits.* The pad can be mistaken for a pickup. It is more distinct from Flap Ahead because it has no wings and no forward travel.

**Distinguishing Bounce from Flap Ahead:** Bounce always follows a visible collision, rises in place and leaves a ring. Flap Ahead has open wings, moves forward and casts a detached shadow. Both use a lift, so the status text should name each one.

## Crowd Surge: two treatments

**Crowd Surge A, "Pack chevrons."**
- *Shape and layers.* A cluster of small chevrons floats at the duck's back edge, each tied to a neighboring duck as a faint dotted line.
- *Accent.* Short wake streaks.
- *Phases.* Start is the chevrons gathering. Active is a held cluster. End is the chevrons dispersing.
- *Participants.* Self, plus the crowd as context.
- *Limits.* At race scale only the cluster survives. It reads closely to Draft unless the lines go to several ducks.

**Crowd Surge B, "Ripple ring."**
- *Shape and layers.* A ring of small paper dots surrounds the duck, one dot per nearby duck, and tightens into a halo.
- *Accent.* The dots shine against the water.
- *Phases.* Start is the dots appearing. Active is the halo holding. End is the dots fading.
- *Participants.* Self and neighbors.
- *Limits.* The dots are tiny at race size, so the text count ("3 near") carries the meaning.

**Distinguishing Draft from Crowd Surge:** Draft is one tether to one leader, ahead of the duck, with a narrow channel. Crowd Surge has several light ties or dots around the duck and no leader.

## Overlap: Bounce with Crowd Surge

Because Crowd Surge triggers independently of Draft and of Bounce, both can overlap.
- Use layers rather than a merged symbol. Keep Bounce's arc or pad on the body and shadow (vertical layers). Keep Crowd Surge's chevrons or dots on the wake side (horizontal layers).
- Order the starts by when they occur and don't synchronize them. The contact ring comes first. The Bounce rise follows. The Crowd Surge chevrons appear whenever the crowd condition is met.
- The ends are independent. Each cue ends on its own.
- Static and text: "Duck C: Bounce + Crowd Surge". The two glyphs sit side by side at the pill edge, never stacked into a new icon.
- A limit: at 2.5 rem both together are busy. Cap it at two cues per duck and drop the weaker accent (the ring), never the glyph or the label.

## Specific distinctions

- **Quick Recovery vs Straight Shooter.** Quick Recovery is a curved arc that closes back to the lane. Straight Shooter is a straight bar along the heading.
- **Guard vs injury.** Guard is a cream tab with a navy outline and no red or cross. Any injury artwork from Plan 57 should use a different shape family, and the two should never share a glyph.
- **Wide Flap vs collision.** Wide Flap uses soft sideways arcs with no impact mark. Collisions have a central contact mark. Pushed ducks only lean.

## Readability

- **Facing and turns.** World-anchored accents survive turns. Chevrons mirror with heading. The label never rotates.
- **Accessories.** Keep cues below or at the flank so hats like C's sailor cap are never covered. Place a cue away from a hat or wing that sits in the same spot.
- **Colors.** The green duck on teal water has the weakest contrast in these images. The cream-plus-navy outline fixes this without hue.
- **Dim lighting.** Keep the cream fill. Raise outline weight, not brightness. No glow, flash or strobe.

## Ambiguous promises, merges and deferrals

- **Promises:**
  - Guard's shield reads as protection.
  - Burst shows speed it can't guarantee in a given race.
  - Draft and Crowd Surge chevrons imply gain.
  - Straight Shooter's bar implies certainty.
  - A Bounce rise might look like it erased the collision. Keep the contact ring visible.
- **Merge candidates:**
  - Draft and Wake Break share one wake-channel family, as the follower and leader sides of one relationship.
  - Quick Recovery and Straight Shooter could share an "after contact" tab with two variants, if mechanics allow it.
  - Flap Ahead and Bounce share a lift family, kept distinct by wings, shadow and ring.
- **Deferral candidates:**
  - Burst, which is not a flight or race-time event, goes to the Duck-Dex only.
  - Steady Nerves, which is too small to show.
  - Guard, until Plan 57's injury art is settled.
- **Creative suggestions, not assumptions:** the lily-pad pad, the dotted halo and the notch in the wake are memorable ideas. The assumptions are that cues can anchor to the shadow layer, that the status text is available, and that two cues can show at once.
- **Not demonstrated:** these images show neither motion nor dim lighting. They also don't show balance or the real track, so I checked nothing about how these cues look when they move.
