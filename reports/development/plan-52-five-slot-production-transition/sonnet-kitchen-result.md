## Early Evening kitchen overlay candidate

I only read the four reference images. I haven't rendered this over the real kitchen, so the coordinates below come from my reading of the 960×540 frames and are untested.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" pointer-events="none" role="presentation" aria-hidden="true">
  <defs>
    <!-- right-to-left low-sun wash: amber at the window side, slightly dusky at the far left -->
    <linearGradient id="ev-wash" x1="1" y1="0.2" x2="0" y2="0.8">
      <stop offset="0" stop-color="#ffbf66" stop-opacity=".22"/>
      <stop offset=".5" stop-color="#ffcf8a" stop-opacity=".08"/>
      <stop offset="1" stop-color="#4a3350" stop-opacity=".12"/>
    </linearGradient>
    <radialGradient id="ev-glow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#ffd48a" stop-opacity=".42"/>
      <stop offset=".55" stop-color="#ffbd6a" stop-opacity=".16"/>
      <stop offset="1" stop-color="#ffbd6a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ev-shaft" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd890" stop-opacity=".16"/>
      <stop offset=".7" stop-color="#ffd890" stop-opacity=".05"/>
      <stop offset="1" stop-color="#ffd890" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="ev-patch" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd27d" stop-opacity=".36"/>
      <stop offset="1" stop-color="#ffc263" stop-opacity=".18"/>
    </linearGradient>
    <radialGradient id="ev-dim" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#2e1d2a" stop-opacity=".16"/>
      <stop offset="1" stop-color="#2e1d2a" stop-opacity="0"/>
    </radialGradient>
    <filter id="ev-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1 0.6"/></filter>
    <filter id="ev-soft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".5 .3"/></filter>
  </defs>

  <!-- 1. gentle directional wash (not a full-screen orange tint) -->
  <rect x="0" y="0" width="100" height="100" fill="url(#ev-wash)"/>

  <!-- 2. dusk edge: slight dimming at far left (fridge side), well clear of duck and mug -->
  <ellipse cx="2" cy="45" rx="20" ry="60" fill="url(#ev-dim)"/>

  <!-- 3. window side: warm glass and halo on the back wall -->
  <ellipse cx="93.5" cy="35" rx="20" ry="46" fill="url(#ev-glow)"/>
  <rect x="87.6" y="14.6" width="12.4" height="39" fill="#ffcf80" opacity=".2"/>

  <!-- 4. faint haze shaft from the window toward lower-left (very low opacity) -->
  <polygon points="87.3,17.5 87.3,53.5 62.5,80.5 49,64" fill="url(#ev-shaft)" filter="url(#ev-soft)"/>

  <!-- 5. warm counter-edge catch-light on the right half of the counter and the window-side jars -->
  <rect x="64" y="57.7" width="20.5" height="1.6" fill="#ffd890" opacity=".28" filter="url(#ev-soft2)"/>

  <!-- 6. sun patches on the bar top, split into two panes by the window mullion, slanting left as they come forward -->
  <g filter="url(#ev-soft2)" fill="url(#ev-patch)">
    <polygon points="58.3,81.2 68.7,81.2 59.4,96 49,96"/>
    <polygon points="70.8,81.2 83.3,81.2 74,96 61.5,96"/>
  </g>
</svg>
```

## Assumptions

- **Sun direction:** the low sun enters through the back-wall window at world X=1700, z=3700, Y=1000, which is screen right (about x 840–960, y 78–290). It travels toward the camera and toward screen left. The back wall faces away from it, so nothing lands on the wall except a glow near the window.
- **What gets lit:** the light lands on the bar top and the right-hand counter edge. The bar patches are placed at roughly x 450–800, y 435–520 in the 960×540 frame. I split them in two because a window mullion would break the light, and slanted them left as they come forward.
- **Clearance:** the patches stop short of the duck (about x 355–420) and the mug. The fridge notice area, the left side and the pendant are not brightened.
- **Pendant:** it stays off. The look is daylight dimming, not a lamp turning on.

## Difference from existing modes

| Mode | What it does |
|---|---|
| `window` | A pale 115° wash over the whole frame, with no source, no patches and no sense of time of day. |
| `warm` | Pendant on, a strong orange pool around it, and the surroundings, including the window, darkened heavily. |
| This candidate | The window side stays bright and golden, the room stays readable, and the left edge dims only slightly. The warm color comes from the window rather than the pendant, so the lamp-lit Evening still looks clearly different. |

## Limitations

- **Not physical shadows:** these are soft alpha shapes. The bar patches suggest a window-shaped beam but cast no shadows from the mug, fruit or duck, and I'm not claiming physically coherent shadows.
- **Not a stencil:** I drew the patches by eye from the frame, not by solving the room projection. The integrator should check the slant and landing zone against the real bar polygon.
- **Washed-out risk:** I did not render it over the kitchen. The haze shaft crosses the toaster and kettle area faintly (opacity at most .16) and could look dirty on top of the tile lines. If it does, drop element 4 first.
- **Blur units:** the blur is stretched by `preserveAspectRatio="none"`, so its horizontal and vertical softness differ from what I intended.
- **Comparison needed:** the dinner-to-Evening distinction should be judged side by side against the real `window` and `warm` renders. This candidate is not an approved appearance.