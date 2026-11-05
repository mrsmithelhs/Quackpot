### Visual References Observed
* **Observed directly:** `paper-room.png` (deep layered diorama with cut-paper cloud header/proscenium, receding living area behind the desk, and right-hand wall clearance) and `paper-desk.png` (flatter desk plane, baked novelty title logo, and wall plane).
* **Not supplied / text-only boundary:** Plan 25 desk and Plan 10 duck art files were not provided in this turn; critique references them strictly as the established canonical SVG assets.

---

### 1. Paper-Layer Depth Without Theatrical Clutter
* **The Failure Mode in `paper-room.png`:** The ruffled cut-paper valance and cloud proscenium frame the room like a toy theatre or storybook stage, which risks signaling fantasy or juvenile parody rather than an ordinary lived-in student apartment.
* **Economical Grounding:** Retain the *receding planes* of `paper-room.png` (foreground desk $\rightarrow$ midground sofa/window $\rightarrow$ distant city skyline), but strip the decorative top/bottom cloud curtains.
* **Protecting Desk & Duck:** Keep the existing canonical SVG desk silhouette and inanimate physical duck as the sharp, un-shadowed foreground plane. Depth should come from 2–3 muted, desaturated SVG backplanes (window wall, living-room alcove) using subtle drop shadows (`filter: drop-shadow(...)` on layer groups or crisp flat tone shifts) rather than photorealistic paper textures. The physical duck stays unmistakably static, grounded on the desk surface next to the lamp.

---

### 2. Desktop & Narrow Composition: Immediate Menu Legibility
* **Desktop (16:9 / Wide):**
  * Anchor the desk props and the physical duck strictly to the lower-left third (similar to `paper-room.png`).
  * Reserve the right-hand wall opening exclusively for the **real HTML UI column**: clean typographical Title (`<h1>Quackpot</h1>`), primary buttons (`Start`, `Continue`), and subtle secondary links (`Settings`, `Credits`, `Download usage`).
  * Avoid baking any lettering into the graphic (unlike the chunky paper logo in `paper-desk.png`). Real HTML text preserves crisp rendering, user zoom, and contrast compliance against a calm, low-contrast wall plane.
* **Narrow Screens (Mobile / Portrait):**
  * In a vertical stack, background depth collapses: the deep living-room view crops out or tucks behind a translucent scrim.
  * The top 35–40% frames the desk surface, lamp, and static duck.
  * The bottom 60% holds the accessible HTML menu card in ordinary document flow with explicit touch targets ($\ge 44\text{px}$). No controls overlap the duck or the lamp.

---

### 3. Fresh-Run Transition to Naming (and Equivalent Still)
* **Transition:** On `Start`, the camera performs a brief (250–350ms), linear or soft-ease CSS transform zoom focusing directly on the physical duck and desk surface; background living-room layers fade or blur slightly. An accessible HTML naming card smoothly replaces the main menu:
  * Input field with the editable default name pre-filled and pre-selected.
  * `Confirm` and `Skip` actions.
  * Clicking `Skip` or pressing `Enter` immediately proceeds without waiting for animations.
* **Static / Reduced-Motion Equivalent:** Zero camera movement. On `Start`, the main menu simply unmounts and the naming card renders in place, with the duck remaining in its exact static desk position.

---

### 4. Risks Around Settings / Credits Interruption
* **Visual Focus & Layer Traps:** If Settings or Credits are rendered as floating cards inside the simulated "paper" depth layers, focus rings and tab order become disorienting.
* **Resolution:** Treat Settings and Credits as standard, high-priority semantic modal overlays (`<dialog>` or inert backdrop overlay) that sit strictly *in front* of the entire SVG canvas.
* **State Cleanliness:** Opening either modal immediately halts any background ambient CSS transitions; dismissing them restores exact focus to the triggering button on the welcome card without reloading or shifting the backdrop planes.

---

### 5. Economical SVG/CSS Approaches & Validation Limits
* **Implementation Technique:**
  * **Layered Vector Groups:** Structure the scene as a single responsive `<svg>` container with 3 distinct `<g>` layers (`#sky-city`, `#apartment-shell`, `#desk-foreground`), using vector-based flat fills and CSS variable-driven lighting shifts.
  * **HTML Overlay Grid:** Lay out the UI via CSS Grid directly over the SVG canvas, ensuring menu cards rest on empty SVG coordinates without absolute pixel brittleness.
* **What a Still Image Cannot Validate:**
  1. *Aspect Ratio Flexing:* How the negative wall space scales when transitioning from ultrawide (21:9) down to squarish tablets (4:3) without pinching the menu into the desk lamp.
  2. *Refocus / Tap Target Conflicts:* Whether clicking around the phone/mug on narrow screens triggers mis-clicks against adjacent buttons.
  3. *Perceived Inanimacy:* Whether the composition makes the duck look like an active character waiting to talk versus an ordinary inanimate bath toy sitting quietly in the room.

---

### Most Consequential Tradeoff & Observable Check
* **Consequential Tradeoff:** Sacrificing decorative environmental charm for menu utility. Cutting the cozy theatrical borders and props from `paper-room.png` keeps the UI clean and the apartment believable, but risks feeling like a standard flat web form if the backplane depth is overly flattened.
* **Observable Check:** Viewport resize test at **$360 \times 640\text{px}$** (mobile portrait) with $125\%$ browser font scaling. *Pass condition:* The primary `Start`/`Continue` buttons and the physical rubber duck are both fully visible without vertical scrolling, and the menu text maintains $\ge 4.5:1$ contrast against the apartment backdrop.


