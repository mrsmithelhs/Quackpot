# Plan 04 Pre-Implementation Mechanism & Asset Proposal (Revised)

**Date:** 2026-10-24  
**Status:** Approved under `prebuild-review-01.md` with controlling conditions incorporated.

---

## 1. Scope & Proof Boundaries

- **Current Task:** Plan 04 (`docs/development/plan-04-svg-rig-and-sound.md`) — SVG duck rig and synthesized sound spike.
- **Goal:**
  - Author a layered SVG digital gacha duck rig based on the owner-selected **E2 layered-paper** direction (Plan 08, 2026-10-24).
  - Structure a motion-ready hierarchy where accessories attach to their logical parent (hat and monocle under head group; bow tie under body/neck group) with local coordinates and pivots for future articulation (Plan 09).
  - Provide safe multi-instance namespacing (`prefix`) so multiple ducks render cleanly in the same DOM without ID, filter, or clip-path collisions.
  - Keep cosmetics strictly separate from finite collectible identity and stats.
  - Test static base readability across sizes (32px, 64px, 128px, 256px) and contrasting backgrounds (Dark Ground `#0F172A`, Light Ground `#F8FAFC`, Pond Blue `#0284C7`), comparing flat offset paper shadows vs. SVG `<feDropShadow>` filters.
  - Implement a zero-dependency, local parameter-synthesized sound prototype with exactly one effect (`QUACK_SHORT`) stored as text parameters, with conservative gain, lazy user-gesture activation, and silent fallback.
  - Provide an isolated, interactive local preview gallery (`preview.html`) openable directly via `file://` with no module/fetch origin restrictions.
- **Non-Goals:**
  - No complete roster production, broad asset expansion, or game balance changes.
  - No raster textures, PNG embedding, or CDN dependencies.
  - No production race animation or articulated motion (deferred to Plan 09).
  - No multi-sound audio engine or music.
  - No game integration into `src/main.js` or UI in this packet.
  - No changes to `src/assets/duck-placeholder.svg` or Plan 02/03 smoke test assets.
- **Physical vs. Digital Distinction:**
  - Digital gacha rig follows E2 paper-puppet. Physical desk companion (D2) remains static and separate; its cinematic 2D study belongs to Plan 10.

---

## 2. Bounded File Ownership

The implementation is strictly bounded to:
- `src/assets/svg/duck-rig.svg` — Authored master SVG asset template.
- `src/core/duck-rig.mjs` — Pure functional composition module with strict option validation and namespaced ID prefixes.
- `src/core/duck-rig.test.mjs` — Unit tests for duck composition, multi-instance namespacing, anchor verification, and stat separation.
- `src/audio/synth.mjs` — Compact Web Audio synthesizer for text parameters with user-gesture handling and silent fallback.
- `src/audio/synth.test.mjs` — Unit tests for parameter parsing, synthesis math, and headless fallback.
- `package.json` — Only adding the two new test files to `npm test`.
- `reports/development/plan-04-svg-rig-and-sound/` (`proposal-01.md`, `preview.html`, `progress.md`).

All other files (existing placeholder, `src/main.js`, game UI, simulation files) remain untouched.

---

## 3. Layer Hierarchy & Motion-Ready Interface

The rig uses a standardized `0 0 100 100` viewBox. All IDs and filter references are namespaced via an instance prefix (e.g. `pfx-`).

```text
[Root SVG: viewBox="0 0 100 100"]
  ├── <defs>: Optional drop-shadow filter (<filter id="${prefix}-drop-shadow">)
  ├── <g id="${prefix}-duck-root" style="--duck-body-fill: ...">
  │     ├── <g id="${prefix}-body-group">:
  │     │     ├── <path id="${prefix}-tail">: Perky upturned paper tail
  │     │     ├── <path id="${prefix}-tail-shadow">: Tail underside shadow
  │     │     ├── <path id="${prefix}-body-base">: Squat, wide E2 body silhouette
  │     │     ├── <path id="${prefix}-body-shadow">: Lower body shadow shape
  │     │     ├── <g id="${prefix}-wing-group" data-pivot-x="52" data-pivot-y="56">:
  │     │     │     ├── <path id="${prefix}-wing-under">: Wing shadow / under-feather
  │     │     │     ├── <path id="${prefix}-wing-mid">: Secondary paper feather layer
  │     │     │     └── <path id="${prefix}-wing-top">: Primary wing paper layer
  │     │     └── <g id="${prefix}-slot-neck" data-x="42" data-y="62">:
  │     │           └── [Attachment slot for Neckwear / Bow Tie]
  │     └── <g id="${prefix}-head-group" data-pivot-x="48" data-pivot-y="46">:
  │           ├── <path id="${prefix}-head-base">: Rounded squat head paper cut
  │           ├── <path id="${prefix}-head-shadow">: Lower jaw/neck crease shadow
  │           ├── <g id="${prefix}-bill-group">: Flat orange paper beak (upper, lower, crease)
  │           ├── <g id="${prefix}-eye-group" data-pivot-x="36" data-pivot-y="34">:
  │           │     ├── <circle id="${prefix}-eye-sclera">: Eye paper backing
  │           │     ├── <circle id="${prefix}-eye-pupil">: Dark pupil
  │           │     ├── <circle id="${prefix}-eye-highlight">: Cutout highlight
  │           │     └── <g id="${prefix}-slot-eye">: [Attachment slot for Monocle]
  │           └── <g id="${prefix}-slot-hat" data-x="46" data-y="24">:
  │                 └── [Attachment slot for Hats: carried by head group]
```

### Key Architectural Traits
1. **Logical Parenting:** Hats and eye accessories reside *inside* `<g id="${prefix}-head-group">`. Any future head rotation or translation in Plan 09 automatically carries the hat and monocle without coordinate recalculation.
2. **Wing Common Pivot:** Wing sublayers (under, mid, top) are grouped under `<g id="${prefix}-wing-group" data-pivot-x="52" data-pivot-y="56">`, enabling synchronized wing paddling/flapping motion around a single anchor.
3. **Multi-Instance Independence:** All element IDs, filter references (`url(#${prefix}-...)`), and clip paths use the prefix. Two or more ducks rendered on the same HTML page will never interfere with each other's filters or styling.
4. **Option Validation:** The composer validates option values against an explicit whitelist; invalid inputs throw descriptive errors rather than allowing arbitrary markup injection.

---

## 4. Exact Proof Set

### Palettes (Exactly 3)
1. **Classic Yellow** (`classic-yellow`):
   - Body: `#FBBF24` (amber-400), Shadow: `#D97706` (amber-600)
   - Bill: `#F97316` (orange-500), Bill Shadow: `#C2410C` (orange-700)
   - Wing: `#F59E0B` (amber-500), Wing Shadow: `#B45309` (amber-700)
2. **Mallard Green** (`mallard-green`):
   - Body: `#047857` (emerald-700), Shadow: `#064E3B` (emerald-900)
   - Bill: `#F59E0B` (amber-500), Bill Shadow: `#B45309` (amber-700)
   - Wing: `#059669` (emerald-600), Wing Shadow: `#047857` (emerald-700)
3. **Bubblegum Pink** (`bubblegum-pink`):
   - Body: `#F472B6` (pink-400), Shadow: `#DB2777` (pink-600)
   - Bill: `#FB923C` (orange-400), Bill Shadow: `#EA580C` (orange-600)
   - Wing: `#EC4899` (pink-500), Wing Shadow: `#BE185D` (pink-700)

### Hats (Exactly 2)
1. **Tiny Top Hat** (`tiny-top-hat`): Perched on crown at `(46, 24)` with paper brim and ribbon band.
2. **Sailor Cap** (`sailor-cap`): Tilted white paper cup with blue ribbon band.

### Accessories (Exactly 2)
1. **Monocle** (`monocle`): Head/eye-attached at `(36, 34)` with delicate gold rim and hanging cord.
2. **Bow Tie** (`bow-tie`): Body/neck-attached at `(42, 62)` with crisp layered paper ribbon and center knot.

### Shadow Modes (2 Modes Compared)
1. **Flat Offset Paper Shadows** (`offset`): Explicit geometry filled with shadow tone and offset by `(dx: +1.5, dy: +2.5)`. Fast, crisp, zero filter overhead.
2. **SVG Filter Shadows** (`filter`): Uses `<feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-opacity="0.3"/>`. Softer depth, tested across zoom levels.

---

## 5. Sound Parameter Approach (`QUACK_SHORT`)

Per condition 3, exactly one sound effect is produced: **`QUACK_SHORT`**.

### Text Parameter Contract
```javascript
export const QUACK_SHORT = Object.freeze({
  name: 'QUACK_SHORT',
  waveform: 'sawtooth',    // Rich harmonic base
  frequency: 340,          // Base fundamental pitch (Hz)
  pitchBend: -140,         // Descending chirpy inflection (-140 Hz over duration)
  attack: 0.02,            // 20ms attack
  decay: 0.12,             // 120ms decay
  sustain: 0.05,           // Low sustain floor
  release: 0.08,           // 80ms release
  modulationFreq: 22,      // Subtle nasal vibrato (Hz)
  modulationDepth: 35,     // Modulation intensity
  gain: 0.15               // Conservative peak gain (avoids clipping/blasting)
});
```

### Engine Behavior
- Zero runtime dependencies; pure Web Audio API.
- **User-Gesture Activation:** `AudioContext` is only instantiated or resumed upon an explicit click or touch event.
- **Silent Fallback:** When `AudioContext` is not present (Node environments, headless tests, or disabled audio hardware), the function resolves gracefully without error and emits a silent fallback notification.

---

## 6. Preview Launch Method

`reports/development/plan-04-svg-rig-and-sound/preview.html` is constructed as a **fully self-contained, directly openable review page**:
- **Direct file launch:** Opens directly via `file:///C:/AI/Quackpot/reports/development/plan-04-svg-rig-and-sound/preview.html` in any browser without requiring an HTTP server or triggering file-origin CORS/module restrictions.
- **Implementation Reuse:** Contains the shared pure composition logic and SVG asset markup directly so that the visual output matches `src/core/duck-rig.mjs` identically.
- **Interactive Controls:**
  - Scale switcher: 32px, 64px, 128px, 256px, and 1000px enlarged inspection.
  - Background contrast switcher: Dark Ground (`#0F172A`), Light Ground (`#F8FAFC`), Pond Blue (`#0284C7`).
  - Shadow mode toggle: Flat Offset vs. Filtered vs. None.
  - Multi-instance gallery: Displays distinct combinations simultaneously in the same DOM.
  - Interactive Sound Player: Click button to trigger `QUACK_SHORT`, demonstrating user-gesture unlock and silent fallback indicator.
