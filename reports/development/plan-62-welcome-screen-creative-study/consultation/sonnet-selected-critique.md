# Critique: paper-room depth + quiet desk + existing still duck

**What I observed.** I viewed `paper-room.png` and `paper-desk.png` this turn. I also viewed the Plan 10 contact sheet earlier in this conversation. I did not view the Plan 25 desk image, so I can't judge how closely the concept desk matches the accepted desk. Comments on "recognizably existing" below are limited to the duck.

**What each concept does.**
- **paper-room.png** has real depth: framing foliage and scalloped curtains, a mid-ground room, and a far window. But it is crowded, with about 15 distinct props, a busy left half and a large empty right half.
- **paper-desk.png** is calmer and has a clear text zone. Its title is baked in and reads as a gacha logo.
- **Both** show a duck that is more cartoon-glossy than the accepted outlined one. The paper-desk duck is closer to it than the paper-room duck. Neither should substitute for the accepted art.

## 1. Depth without crowding

- Use **three layers, not five**: a near edge framing (one plant, one curtain edge), the desk plane with the duck, and one back wall with the window. Drop the second room, the sofa and the extra shelves.
- Keep the **desk-level props to four or fewer**: duck, lamp, phone, mug. Drop the stacked books, potted plant and second plant.
- Get depth from **soft contact shadows, a subtle paper-edge highlight and scale difference** on the framing layers. Do not add more objects.
- **The existing duck should be the sharpest, highest-contrast object**, with its dark outline. Soften the outlines of the framing layers so the duck wins the focus competition. The concepts do the opposite: the duck's outline is no stronger than the foliage's.
- The framing foliage must stay out of the title and menu area.

## 2. Desktop and narrow layout

- **Desktop:** desk and duck lower left, window upper left, and the title and menu in the open right-center area. The open space in both concepts is exactly this. Put the title as an HTML heading at top right. Stack Start, Continue, Settings and Credits beneath it as real buttons. The manual usage download and the autosave toggle go in a small footer row.
- Menu panel: Start is the primary action. Continue is secondary and appears only when a supported save exists. Use a semi-opaque paper-card backing so contrast does not depend on the illustration.
- **Narrow (portrait):** crop to the desk, duck and window in the top 45%, and put the title and menu stacked below on a plain paper-toned field. Don't scale the landscape art down. Use a different crop of the same layers.
- Don't use the baked title from paper-desk. If a logo treatment is wanted, make it an inline SVG with a real heading or `aria-label`, or style it with CSS text.

## 3. Skippable fresh-run transition to naming

- **Motion version (about 1 s or less):** the menu card fades out. The desk layer shifts slightly toward the viewer, the framing layers drift outward, and the duck stays still and centers in the frame. The name card with its prefilled default fades in below or beside the duck.
- **Skip:** any key or click, or Start pressed again, jumps straight to the end state. Focus lands in the name field and its text is selected. This must not wait on the animation.
- **Equivalent still:** the same end composition with no travel. It shows the desk cropped closer around the duck, framing layers at their outer positions, and the name card visible. Reduced-motion users see a plain crossfade or an instant swap to this still.

## 4. Settings and Credits interruption and focus risks

- **Pause on open:** drifting layers and any transition must pause, and a transition must neither complete nor restart on close. If Settings opens mid-transition, snap to the transition's end state or restore the start state. Pick one and test it.
- **Dismiss returns focus** to the button that opened it. Closing must not replay the intro.
- **Focus competition:** the lamp glow, bright window and phone screen are visual attractors. They should be lower in contrast than the Start button and the duck. The phone screen especially should be dim and non-specific.
- **Modal contrast:** Settings and Credits panels need an opaque backing, because the busy paper background shows through any translucent panel.
- **Autosave toggle:** put it in Settings as the canonical location, as I suggested before. A footer mirror is optional. If it appears in both places, both must show the same state.

## 5. Economical implementation approaches

- **A. CSS transform parallax on 3–4 stacked SVG or PNG layers.** Use `translate3d` driven by a slow idle loop or a transition class, with `prefers-reduced-motion` removing it. This is cheap, easy to pause (`animation-play-state`) and simple to skip by setting the end state.
- **B. Pointer or scroll-free static layering plus one CSS transition.** There is no idle motion. Only the Start transition moves. This is the lowest-risk option, and depth comes from the layers and shadows alone.

**What a still image cannot validate:**
- Skip timing and whether Start or Continue ever feels delayed.
- Pause and resume behavior under Settings and Credits.
- Focus order and focus visibility.
- Reduced-motion equivalence.
- Narrow-screen reflow at real viewport sizes.
- Whether idle motion distracts from the menu.

## Most consequential tradeoff

**Depth versus legibility of the menu and the duck.** More paper layers make the scene richer, but each one competes with the title and buttons. I recommend choosing the sparse option when in doubt.

**Observable check:** render the welcome at 1440×900 and at about 390×844 with the real HTML menu over it. Then check three things:
- (a) At a quick glance, or squinting with the image blurred, the Start button and the title are still the first things you notice.
- (b) The measured text contrast of the menu labels meets WCAG AA over the art.
- (c) The duck is still identifiable at the narrow size.

If any of these fail, remove layers before adjusting anything else.

*This is advice only. The owner's selection stands.*
