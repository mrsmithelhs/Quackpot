# Revision 02: title treatments and ambience advice

**What I observed.** I viewed `paper-room.png` and `paper-desk.png` earlier in this conversation and did not re-read them for this brief. In both, the upper right is open paper-toned negative space. The desk, a still outlined duck and a phone sit lower left. A window, a lamp and a TV or couch area sit mid-left. The baked "Quackpot" in `paper-desk.png` is a yellow bubble wordmark with a brown outline and an orange under-shadow. I took only its layering idea, not its lettering. I did not see the Plan 25 desk or any rotating or animated phone art.

**Untested caveat.** I could not render anything. The letterforms are hand-built monoline paths: the stroke is drawn three times, wide to narrow, to fake cut-paper layers. Check readability visually before adopting any of them. All three use the same skeleton in different dress. If the owner wants truly different lettering, that needs a designer's pass.

## Title treatments

All three are inert: vector paths and `<use>` of an internal id, no text, fonts, scripts, images, links or events. Ids are prefixed per treatment, so all three can sit on one page.

**A. Cut-paper stack.** Brown outline, orange offset shadow and yellow face. It is the closest to the concept art.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 190" aria-hidden="true" focusable="false">
  <defs>
    <path id="qa-w" fill="none" d="M11 70a34 42 0 1 0 68 0a34 42 0 1 0 -68 0M60 96L86 124M104 62V100C104 114 114 120 126 120C140 120 148 112 148 100M148 62V120M159 90a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M217 62V120M280 72A29 29 0 1 0 280 108M306 20V120M334 62L306 94M318 80L338 120M358 62V150M358 91a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M433 90a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M524 32V102Q524 120 540 120H548M508 62H548"/>
  </defs>
  <g transform="translate(20 10)" stroke-linecap="round" stroke-linejoin="round">
    <use href="#qa-w" stroke="#4a2b18" stroke-width="32" transform="translate(0 6)"/>
    <use href="#qa-w" stroke="#e27a2f" stroke-width="22" transform="translate(0 6)"/>
    <use href="#qa-w" stroke="#f4be2e" stroke-width="16"/>
    <use href="#qa-w" stroke="#fde9a0" stroke-width="3" stroke-opacity=".8" transform="translate(-3 -3)"/>
  </g>
</svg>
```

**B. Stitched leaf-green label.** A cream face, a dark-green outline and an orange stitch line, on a paper tab that carries its own contrast. It harmonizes with the foliage.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 190" aria-hidden="true" focusable="false">
  <defs>
    <path id="qb-w" fill="none" d="M11 70a34 42 0 1 0 68 0a34 42 0 1 0 -68 0M60 96L86 124M104 62V100C104 114 114 120 126 120C140 120 148 112 148 100M148 62V120M159 90a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M217 62V120M280 72A29 29 0 1 0 280 108M306 20V120M334 62L306 94M318 80L338 120M358 62V150M358 91a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M433 90a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M524 32V102Q524 120 540 120H548M508 62H548"/>
  </defs>
  <rect x="4" y="4" width="592" height="182" rx="34" fill="#f6e3c3" stroke="#6b4a2a" stroke-width="4"/>
  <g transform="translate(20 10)" stroke-linecap="round" stroke-linejoin="round">
    <use href="#qb-w" stroke="#2f4a2c" stroke-width="28"/>
    <use href="#qb-w" stroke="#fff3d6" stroke-width="18"/>
    <use href="#qb-w" stroke="#e27a2f" stroke-width="3" stroke-dasharray="1 9"/>
  </g>
</svg>
```

**C. Dusk-blue tilt with a ripple underline.** A cooler option that echoes the window sky and the blue books. The slight tilt and ripple are the point of difference.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" aria-hidden="true" focusable="false">
  <defs>
    <path id="qc-w" fill="none" d="M11 70a34 42 0 1 0 68 0a34 42 0 1 0 -68 0M60 96L86 124M104 62V100C104 114 114 120 126 120C140 120 148 112 148 100M148 62V120M159 90a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M217 62V120M280 72A29 29 0 1 0 280 108M306 20V120M334 62L306 94M318 80L338 120M358 62V150M358 91a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M433 90a29 29 0 1 0 58 0a29 29 0 1 0 -58 0M524 32V102Q524 120 540 120H548M508 62H548"/>
  </defs>
  <g transform="translate(20 14) rotate(-3 290 90)" stroke-linecap="round" stroke-linejoin="round">
    <use href="#qc-w" stroke="#2c3f66" stroke-width="30" transform="translate(0 5)"/>
    <use href="#qc-w" stroke="#fff1c9" stroke-width="17"/>
    <path d="M40 172q20-14 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#3b6fb0" stroke-width="6"/>
  </g>
</svg>
```

**Placement.** On desktop, put it in the upper negative space, right of center, at about `clamp(280px, 38vw, 560px)` wide. The real `<h1>Quackpot</h1>` is the accessible heading, in flow or visually hidden, and the SVG is `aria-hidden`. The HTML menu sits directly beneath. On narrow screens, center it above the menu at about 86vw, up to 420px, on a plain paper-toned field.

**One small refinement.** Add a soft contact shadow (a blurred brown ellipse behind the wordmark at low opacity) so the title sits on the paper layer and does not float. In B this is already provided by the tab.

## Phone

- A full rotation would expose a phone back and edge that don't exist in the references. I recommend a slow **sway of about ±25–30°** instead, with a dwell near upright. That avoids needing new art and avoids a sliver view of the screen.
- If the owner wants a full turn, the screen content should be a separate layer that stays upright and unmirrored. Never show it mirrored when back-facing.
- **Avoiding a jump:**
  - Build the loop from equal keyframe segments, with the end value identical to the start value (for example 0 to 360°, or a symmetric sway).
  - Ease in and out at each dwell.
  - Keep the screen's content, brightness and glare constant across the loop.
  - Never restart the animation on resume. Pause with `animation-play-state` so it continues from where it was.
- **Failure modes:** a glare or gradient that snaps at the wrap, the screen shrinking so the small duck on it becomes unreadable, and a spinning phone drawing the eye away from Start. Keep the amplitude slow (a period of about 12 s or more) and the contrast low.

## Naming glow

- Make the glow a **separate steady layer behind the physical duck**, with a dim overlay between the room layers and the duck layer. Do not apply a filter or glow to the duck art. That keeps the duck's outline and color exactly as accepted and keeps it still.
- Steady means no pulsing. Fade the glow in with the dim, and fade it out when naming ends.
- **Failure modes:**
  - A square or clipped halo edge.
  - A glow that tints the yellow toward green or orange.
  - Dim so heavy that the room disappears, or so light that the name card has to fight the room.
  - Name-card contrast depends on the glow. It should have its own opaque backing.

## Ambient motion

- **Digital duck groups:**
  - Two or three small flat silhouettes, in a different style and scale from the physical duck.
  - Drift one way, slowly, in the upper band only. Keep them behind or clear of the title and well away from the physical duck.
  - Use uneven spacing and speed within a group, and long, irregular gaps between groups.
  - No lanes, finish line, ranking or leader, which would read as a fake race.
  - Fixed, deterministic timings are easier to test than random ones.
- **TV and couch fades:**
  - Use a fixed list of irregular 3–7 s durations, for example 3.4, 5.9, 4.2, 6.8 and 5.1 s. Offset the TV and couch so they aren't in sync.
  - Keep the opacity swing modest, for example between about 0.8 and 1.0, so it reads as breathing and not flicker.
- **Pausing:** one root `ambient-paused` state should pause everything: phone, ducks, TV and couch, and any drift. Set it when Settings or Credits is open, when the page is hidden, and during naming. On resume nothing should restart or jump.
- **Reduced motion:** a stable still with the phone upright, the TV and couch at full opacity, and no digital ducks. A frozen duck group would look stuck. Menu, title and naming are identical in function.
- **Menu legibility:** the ambience must never move behind the menu card. Keep the menu on its own opaque or near-opaque backing.

## Observable checks

- Pause at a random moment and resume. Nothing should jump.
- Capture frames at several moments with the menu present. Start and the title must remain the clearest elements.
- Confirm the physical duck's pixels are identical across frames.
- Confirm the reduced-motion still shows the same layout and legibility.

*This is advisory. The owner chooses.*
