# Flash initial creative consultation

Requested model: gemini-3.8-flash-medium, medium effort. Final JSON did not report model identity, effective effort, tool actions, permission denials or image-read trace. The provider response is advisory and is not owner selection or proof of mechanics.

# Quackpot Race-Ability Visual Consultation

Based on inspection of `race.png` and `pair.png`, ducks are 2.5D layered-paper cutouts (body, wing layer, bill, eye, tail) with floating upright badges above their heads, navigating a pool surface under variable drama lighting and facing directions.

---

### 1. Shared Visual Vocabulary

* **Z-Elevation & Shadow:** Air states disconnect the duck cut-out from its water footprint, casting a soft, decoupled ground shadow directly below. Submerged states tuck the body under a tinted water cutout layer.
* **Paper-Layer Articulation:** Ability expressions rely on mechanical paper deformations—hinged wing flutters, slight accordion squashes, or stepped tilts—preserving the base silhouette and leaving hats/accessories undisturbed.
* **Hydro/Aero Cutouts:** Wake lines, splashes, and wind accents are flat die-cut paper crescents or geometric ripples that register in normal and dim lighting.
* **Label Decoupling:** Name badges never rotate, tint, or bounce with the body; cues attach to the waterline, flanks, or a small badge pip, keeping participant tracking clear.
* **Static / Text Accessibility:** Every state includes an adjacent high-contrast geometric pip on the badge (e.g., `▲` for airborne, `»` for surge, `■` for firm/guard) alongside screen-reader state tokens, preventing color-only dependency.

---

### 2. Critical Pairwise Distinctions

* **Bounce vs. Flap Ahead:** *Bounce* occurs strictly post-collision, showing an abrupt vertical pop upward with a static ground footprint below. *Flap Ahead* is proactive, level forward gliding with horizontal paper wind streaks and no preceding contact pop.
* **Draft vs. Crowd Surge:** *Draft* draws a directional slipstream link between duck and a single leader. *Crowd Surge* displays a radial water churn originating from density, independent of lane heading or a specific target.
* **Quick Recovery vs. Straight Shooter:** *Straight Shooter* resists rotation entirely during impact (gliding on rails). *Quick Recovery* allows the impact wobble/tilt, then rapidly snaps the duck back to neutral trim.
* **Guard vs. Injury:** *Guard* is an intentional, crisp outward bristling of paper wings (braced stance). *Injury* reads as passive crumpling, dropped trim, or an asymmetrical sag.
* **Wide Flap vs. Collision:** *Wide Flap* generates intentional, outward-propagating concentric paper ripples from synchronized wing beats. Collisions produce sharp, irregular contact creases at the point of impact.

---

### 3. Ability Candidates Summary Table

| Candidate | Primary Layer Motion | Water / Air Accent | Role & Scope | Static Pip / Text |
| :--- | :--- | :--- | :--- | :--- |
| **Burst** | Rapid horizontal vibration (paper shudder) | Tightly paired twin trailing wake lines | Speed proxy; stays grounded | `[+]` Spd |
| **Guard** | Wings splay slightly outward, firming posture | Faint paper perimeter rim line | Post-collision bracing stance | `[■]` Grd |
| **Wide Flap** | Symmetrical wing extension and downbeat | Dual lateral arc ripples shoving outward | Local lateral displacement cue | `[<>]` Flp |
| **Dive** | Duck slides beneath oval water cut; eye visible | Concentric concentric entry rings | Submerged transit | `[▼]` Div |
| **Flap Ahead** | Level forward glide, elevated above water plane | Horizontal trailing streamline cutouts | Proactive air transit forward | `[^>]` Fly |
| **Draft** | Level glide locked behind leader | Dashed paper wake thread to front duck | Single-leader pacing | `[==]` Drf |
| **Straight Shooter**| Rigid planar alignment; zero yaw on contact | Clean linear keel line cutting wake | Contact trajectory preservation | `[\|]` Str |
| **Bounce** | Post-impact vertical loft above traffic | Circular drop shadow detaches below | Upward clearance after contact | `[▲]` Bnc |
| **Quick Recovery**| Brief spin/tilt snap-snapping to neutral | Rapid twin splash flecks | Shortened disorientation window| `[↺]` Rcv |
| **Crowd Surge** | Rapid cadence paddle bob in dense traffic | Choppy clustered perimeter wake flecks | Density-driven acceleration | `[»]` Crw |
| **Steady Nerves** | Damped side-to-side oscillation | Symmetrical twin stabilizer wake | Self-wobble attenuation | `[~]` Stb |
| **Wake Break** | Slight forward bill flare | Disrupted, feathered trailing wash | Follower drag disruption | `[≠]` Brk |

---

### 4. Detailed Directional Studies

#### Bounce

##### Direction 1: Accordion Spring-Hop
* **Shape & Motion:** Upon real collision contact, duck squashes 15% vertically on the water plane, then releases straight up along the Z-axis. The body floats level while the detached ground shadow stays on the water surface.
* **Accents & Lifecycle:** *Start:* Contact ripple. *Active:* Elevated paper layer over circular shadow. *End:* Smooth descending squash back into the waterline.
* **Limits & Failures:** At 2.5rem, vertical displacement must be at least 40% duck height to avoid looking like a rendering jitter. *No-trigger:* Standard contact rebound without lift. *Cancellation:* Immediate drop-down with a small splash ring if interrupted. *Static/Text:* `[▲] Airborne`.

##### Direction 2: Water-Surface Pop (Trampoline Arc)
* **Shape & Motion:** Contact tilts the duck back by 10 degrees as if glancing off the water tension, snapping upward in a shallow parabolic jump before righting itself.
* **Accents & Lifecycle:** *Start:* Angled splash spray. *Active:* Tilted wing silhouette elevated over water. *End:* Clean hydrodynamic wake re-entry.
* **Limits & Failures:** Must not obscure duck behind or duck label above. *No-trigger:* Flat lateral drift. *Cancellation:* Mid-arc flattening. *Static/Text:* `[⤹] Hop`.

---

#### Crowd Surge

##### Direction 1: Bow-Wave Compression (Wedging Prow)
* **Shape & Motion:** Duck dips its bill forward 5 degrees into the waterline, holding tight horizontal trim while surging forward through proximate neighbors.
* **Accents & Lifecycle:** *Start:* White paper bow-wave wedge appears at the breast. *Active:* High-contrast trailing V-wake cutting past adjacent ducks. *End:* Wedge fades into normal ripple.
* **Limits & Failures:** Multiple ducks in a crowd surging at once must not create overlapping wake clutter; accents remain clipped to the duck's immediate hull. *No-trigger:* Passive drafting wash. *Cancellation:* Immediate flattening of bow wedge. *Static/Text:* `[»] Surge`.

##### Direction 2: Rapid Paddle Churn (Flurry Cadence)
* **Shape & Motion:** Duck remains horizontal but undergoes rapid micro-bobbing (vertical frequency increase) representing furious paddling beneath the surface.
* **Accents & Lifecycle:** *Start:* Flurry of circular white droplet cutouts at tail flank. *Active:* Frothing paper churn around base. *End:* Froth elongates into standard glide wake.
* **Limits & Failures:** Micro-bobbing can blur under low frame rates or dim displays; churn must rely on high-contrast paper flakes. *No-trigger:* Smooth coasting in pack. *Cancellation:* Abrupt cessation of churn. *Static/Text:* `[≈] Churn`.

---

#### Overlap Treatment: Bounce + Crowd Surge

* **Choreography:** When Crowd Surge triggers or persists while Bounce activates, the duck executes the **Accordion Spring-Hop** (rising above the traffic pack) while carrying the **Paddle Churn Froth** trailing directly from its detached ground shadow.
* **Readability:** Elevation clears the crowded water surface, reducing cluster visual noise, while the ground shadow retains the forward churn flecks, clearly communicating elevated bypass combined with active acceleration without falsely implying collision immunity.

---

### 5. Readability & Environmental Considerations

* **Facing Flips:** Ducks mirror across the Y-axis when changing headings. Lateral cues (wakes, bill wedges) must anchor to local duck space, while name labels and accessibility glyphs stay screen-aligned and fixed.
* **Accessories & Palettes:** Because ducks feature varied body hues (e.g., Duck A gold, B green, C pink) and accessories (Duck C's sailor cap), cues must avoid relying on color tinting. Use stark die-cut white foam rims and dark shadow offsets that contrast against all base tones.
* **Dim Drama Lighting:** Rely on silhouette deformation (height above shadow, wing angles) and high-value rim highlights rather than saturation changes.

---

### 6. Ambiguous Promises, Merges, and Deferrals

* **Misleading Promises:**
  * *Bounce* can easily look like flight or damage immunity; keeping the ground shadow dark and responsive prevents implying invincibility.
  * *Guard* visuals risk implying absolute damage negation rather than an injury-mitigating posture.
* **Consolidation / Merges:**
  * **Draft** and **Crowd Surge:** Consider merging into a unified "Slipstream" system, where draft handles single-file alignment and surge handles multi-duck clusters.
  * **Straight Shooter** and **Steady Nerves:** High visual redundancy (both signify linear stabilization); consolidate into one directional stability cue.
* **Deferrals:**
  * Defer **Air-to-Air Contact** and **Landing Stumbles** until Plan 55/57 resolves collision physics and persistent injury frameworks.
