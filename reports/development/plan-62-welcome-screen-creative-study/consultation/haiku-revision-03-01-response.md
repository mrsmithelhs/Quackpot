Both SVGs are below. They use hand-built stroke paths rather than font glyphs, and they are proposals for the owner, not final art. I didn't write any files.

**Proposal A: duck head as the Q**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" aria-hidden="true" focusable="false">
  <defs>
    <g id="ia-word">
      <path d="M92 72 a34 39 0 1 0 0 78 a34 39 0 1 0 0 -78 M116 139 L134 164"/>
      <path d="M64 100 L42 111 L64 122"/>
      <path d="M146 92 V128 Q146 150 168 150 Q190 150 190 128 V92 M190 92 V150"/>
      <path d="M202 121 a24 29 0 1 0 48 0 a24 29 0 1 0 -48 0 M250 92 V150"/>
      <path d="M318 106 Q306 92 290 92 Q270 92 270 121 Q270 150 290 150 Q306 150 318 136"/>
      <path d="M336 46 V150 M336 122 L384 92 M350 108 L390 150"/>
      <path d="M412 121 a24 29 0 1 0 48 0 a24 29 0 1 0 -48 0 M412 92 V196"/>
      <path d="M473 121 a24 29 0 1 0 48 0 a24 29 0 1 0 -48 0"/>
      <path d="M552 60 V142 Q552 150 562 150 H580 M536 96 H578"/>
    </g>
  </defs>
  <g transform="translate(0 12)">
    <use href="#ia-word" y="8" fill="none" stroke="#4a2a14" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#ia-word" fill="none" stroke="#4a2a14" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#ia-word" y="5" fill="none" stroke="#e0701a" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#ia-word" fill="none" stroke="#f6b932" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#ia-word" x="-2" y="-3" fill="none" stroke="#ffe48a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="100" cy="102" r="4.5" fill="#3a2212"/>
  </g>
</svg>
```

The duck head takes the place of the Q's bowl, with a small beak and eye, so the letter stays readable as "Q" while carrying the duck detail. The tradeoff is that the beak and eye are the first details to fill in or disappear at small sizes, and the Q becomes a stronger character accent than the other letters.

**Proposal B: whole duck perched on the lettering**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" aria-hidden="true" focusable="false">
  <defs>
    <g id="ib-word">
      <path d="M92 72 a34 39 0 1 0 0 78 a34 39 0 1 0 0 -78 M116 139 L134 164"/>
      <path d="M146 92 V128 Q146 150 168 150 Q190 150 190 128 V92 M190 92 V150"/>
      <path d="M202 121 a24 29 0 1 0 48 0 a24 29 0 1 0 -48 0 M250 92 V150"/>
      <path d="M318 106 Q306 92 290 92 Q270 92 270 121 Q270 150 290 150 Q306 150 318 136"/>
      <path d="M336 46 V150 M336 122 L384 92 M350 108 L390 150"/>
      <path d="M412 121 a24 29 0 1 0 48 0 a24 29 0 1 0 -48 0 M412 92 V196"/>
      <path d="M473 121 a24 29 0 1 0 48 0 a24 29 0 1 0 -48 0"/>
      <path d="M552 60 V142 Q552 150 562 150 H580 M536 96 H578"/>
    </g>
  </defs>
  <g transform="translate(0 12)">
    <use href="#ib-word" y="8" fill="none" stroke="#4a2a14" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#ib-word" fill="none" stroke="#4a2a14" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#ib-word" y="5" fill="none" stroke="#e0701a" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#ib-word" fill="none" stroke="#f6b932" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <use href="#ib-word" x="-2" y="-3" fill="none" stroke="#ffe48a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="#4a2a14" stroke-width="3.5" stroke-linejoin="round">
      <path d="M220 64 Q204 58 204 46 Q216 52 224 60 Z" fill="#e8ad28"/>
      <ellipse cx="252" cy="68" rx="34" ry="18" fill="#f6b932"/>
      <path d="M226 68 Q244 52 268 64 Q250 74 226 68 Z" fill="#e8ad28" stroke-width="2.5"/>
      <circle cx="280" cy="48" r="15" fill="#f6b932"/>
      <path d="M292 46 L308 52 L292 57 Z" fill="#e0701a" stroke-width="2.5"/>
      <circle cx="285" cy="43" r="2.6" fill="#3a2212" stroke="none"/>
    </g>
  </g>
</svg>
```

The whole duck sits on the x-height of "a" and "c", so every letter stays fully visible and the spelling "Quackpot" is unchanged. The tradeoff is that the duck adds height and visual weight above the title, so it needs layout room and could compete with the plain wordmark on smaller screens.
