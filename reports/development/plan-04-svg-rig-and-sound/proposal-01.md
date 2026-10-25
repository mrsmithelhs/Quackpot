### Plan 04 Pre-Implementation Mechanism & Asset Proposal

Before authoring SVG paths or synthesizer code, here is the architectural and asset specification for **Plan 04** per Step 1 of the work plan and Approval Gate (*"mechanism/asset outline before coding; wait for mechanism approval before building"*).

---

### 1. Understanding & Scope Summary

- **Current Task:** Plan 04 (`docs/development/plan-04-svg-rig-and-sound.md`) — SVG duck rig and synthesized sound spike.
- **Goal:**
  - Author an authored SVG digital gacha duck rig based on the owner-selected **E2 layered-paper** direction (Plan 08, 2026-10-24).
  - Prove discrete paper layers (silhouette, body, head, bill, eye, and multi-piece wing sublayers) with defined attachment anchors and rotation pivots for future articulation (Plan 09).
  - Provide CSS variable-driven palette recoloring and modular hat/accessory layering without creating separate identities or changing duck stats.
  - Test static base readability across sizes (32px, 64px, 128px, 256px) and contrasting backgrounds (dark, light, pond blue), comparing flat offset shadows vs. SVG `<feDropShadow>` filters.
  - Implement a zero-dependency, local parameter-synthesized sound prototype (jsfxr/ZzFX style) stored as text, with lazy user-gesture audio startup and silent fallback.
  - Provide an isolated, interactive local preview gallery (`reports/development/plan-04-svg-rig-and-sound/preview.html`) and unit test coverage.
- **Non-Goals:**
  - No complete roster production or full game balance.
  - No raster texture embedding or PNG conversion (keep pure vector).
  - No production race animations (motion comparison is reserved for Plan 09).
  - No background music or external audio file loading (Hard Constraint #2).
  - No modification to existing placeholder assets (`src/assets/duck-placeholder.svg`), ensuring Plan 02/03 browser smoke tests remain undisturbed.
- **Physical vs. Digital Boundary:**
  - The digital gacha rig strictly follows E2. The physical desk companion (D2) remains static and separate; its cinematic views and lighting belong to Plan 10.

---

### 2. Proposed Asset Paths & Code Architecture

| File Path | Role & Purpose |
|---|---|
| `src/assets/svg/duck-rig.svg` | Standalone SVG master template defining paper layers, anchor markers, and default styling. |
| `src/core/duck-rig.mjs` | Pure functional composition module: accepts `{ palette, hat, accessory, shadowMode }` and returns composed SVG markup with metadata. |
| `src/core/duck-rig.test.mjs` | Node unit test verifying layer composition, palette styling, anchor validity, and stat separation. |
| `src/audio/synth.mjs` | Zero-dependency Web Audio micro-synthesizer: parses text parameter arrays/objects, handles user-gesture activation, and falls back silently in headless/unsupported environments. |
| `src/audio/synth.test.mjs` | Node unit test verifying audio parameter validation, frequency/envelope calculations, and graceful headless fallback. |
| `reports/development/plan-04-svg-rig-and-sound/preview.html` | Self-contained local review gallery displaying multi-scale sizing, contrasting backgrounds, shadow comparison, cosmetic permutations, and audio playback. |
| `reports/development/plan-04-svg-rig-and-sound/progress.md` | Formal implementer progress report and advisor consultation declaration. |

---

### 3. Layer Interface & Paper-Cut Rig Architecture

The rig uses a standardized `100x100` view box. Layers are arranged in back-to-front stacking order:

```
[Root SVG: viewBox="0 0 100 100"]
  ├── <defs>: Optional drop-shadow filter definitions (<feDropShadow>)
  ├── <g id="duck-root" style="--duck-body-fill: ...">
  │     ├── <g id="layer-tail">: Perky upturned tail paper cut + underside shadow
  │     ├── <g id="layer-body">: Squat, wide E2 body silhouette + lower shadow shape
  │     ├── <g id="anchor-neck" data-x="42" data-y="62">: Attachment point for neckwear
  │     ├── <g id="layer-wing" data-pivot-x="50" data-pivot-y="58">:
  │     │     ├── <path id="wing-sublayer-under">: Base dark feather shadow
  │     │     ├── <path id="wing-sublayer-mid">: Secondary paper feather layer
  │     │     └── <path id="wing-sublayer-top">: Primary wing silhouette
  │     ├── <g id="layer-head">:
  │     │     ├── <path id="head-base">: Rounded squat head paper cut
  │     │     ├── <path id="head-shadow">: Lower jaw/neck crease shadow
  │     │     ├── <g id="layer-eye">: Paper sclera, pupil, and cutout highlight
  │     │     └── <g id="layer-bill">: Flat orange paper beak (upper, lower, crease)
  │     ├── <g id="anchor-hat" data-x="46" data-y="24">: Stable crown attachment point
  │     └── <g id="anchor-chest" data-x="36" data-y="68">: Attachment point for badges / medals
  ├── <g id="layer-accessory">: Slotted under or over based on item type
  └── <g id="layer-hat">: Slotted onto head crown
```

#### Palette System (CSS Variables)
Colors are driven by CSS variables on the root container, allowing instant palette swapping without duplicating SVG geometry:
- `--duck-body-fill`, `--duck-body-shadow`
- `--duck-bill-fill`, `--duck-bill-shadow`
- `--duck-wing-fill`, `--duck-wing-shadow`
- `--duck-accent`

**Representative Palettes to Prove:**
1. *Classic Yellow* (`#FBBF24` / `#D97706`)
2. *Mallard Green* (`#047857` / `#065F46`)
3. *Bubblegum Pink* (`#F472B6` / `#DB2777`)
4. *Midnight Ink* (`#334155` / `#1E293B`)
5. *Golden Gacha* (`#F59E0B` / `#B45309` with metallic accent)

**Representative Hats & Accessories to Prove:**
- Hats: *Tiny Top Hat*, *Propeller Beanie*, *Sailor Cap*
- Accessories: *Red Bow Tie*, *Monocle*, *Gold Medal*

#### Shadow Comparison:
The preview will feature a toggle between:
1. **Flat Offset Paper Shadows** (duplicate shapes with darker fill and `(dx: +1.5, dy: +2.5)` offset — zero filter overhead, crisp down to 32px).
2. **SVG `<feDropShadow>` Filter** (`dx="1" dy="2" stdDeviation="1.5" flood-opacity="0.25"` — softer tactile paper feel, higher rasterization cost).

---

### 4. Synthesized Sound Approach (Text-Stored Parameters)

Sound effects are synthesized dynamically using the Web Audio API without loading external audio files or CDN dependencies.

#### Parameter Format
Each sound is represented as a compact text parameter array/object:
```javascript
{
  name: "quack",
  waveform: "sawtooth", // 'sine' | 'triangle' | 'square' | 'sawtooth'
  frequency: 340,       // Base pitch (Hz)
  pitchBend: -140,      // Pitch slide (Hz)
  attack: 0.03,         // Seconds
  decay: 0.12,          // Seconds
  sustain: 0.05,        // Sustain volume ratio (0-1)
  release: 0.08,        // Seconds
  modulationFreq: 18,   // FM/vibrato frequency
  noiseMix: 0.05        // Subtle rasp/breath
}
```

#### Representative Effects to Prove:
1. `QUACK_SHORT`: Perky satirical duck voice for interactions.
2. `COIN_DROP`: Clean two-tone metallic chirp for pulls/purchases.
3. `POND_SPLASH`: Filtered noise burst for water/race beats.

#### Audio Engine Lifecycle & Fallback:
- **User-gesture startup:** `AudioContext` initializes or resumes only after the first user click/touch, fully complying with modern browser autoplay policies.
- **Silent Fallback:** If `window.AudioContext` / `webkitAudioContext` is missing or throwing (e.g. headless tests or audio device disabled), the engine logs a structured diagnostic and resolves silently without errors or crashes.

---

### 5. Verification Plan

1. **Automated Unit Tests:**
   - Run `node scripts/dev/plan-status.js check plan-04` and `node scripts/dev/plan-status.js lint`.
   - Run `cmd.exe /c "npm test"` including new test suites for duck composition and audio synthesis.
2. **Interactive Preview Gallery:**
   - Inspect `reports/development/plan-04-svg-rig-and-sound/preview.html` across 32px, 64px, 128px, 256px scales.
   - Test background contrast: Dark Ground (`#0F172A`), Light Ground (`#F8FAFC`), Pond Blue (`#0284C7`).
   - Test interactive audio buttons with gesture unlocking and silent fallback mode.

---

Please let me know if this mechanism and asset outline is approved so I may proceed with building the SVG duck rig, sound synthesizer, preview gallery, and tests.
