/**
 * @file duck-rig.mjs
 * Pure functional SVG duck rig composition module for Quackpot.
 * Implements the E2 layered paper-cut duck rig with visible cardstock construction,
 * stepped wing layers, seam contact shadows, motion-ready hierarchy, and multi-instance ID namespacing.
 */

export const PALETTES = Object.freeze({
  'classic-yellow': Object.freeze({
    id: 'classic-yellow',
    name: 'Classic Yellow',
    bodyFill: '#fbbf24',
    bodyShadow: '#d97706',
    billFill: '#f97316',
    billShadow: '#c2410c',
    wingFill: '#fcd34d',   // Top wing card (brightest)
    wingMid: '#f59e0b',    // Mid wing card (intermediate step)
    wingShadow: '#b45309', // Under wing base (darkest backing)
    accent: '#ef4444'
  }),
  'mallard-green': Object.freeze({
    id: 'mallard-green',
    name: 'Mallard Green',
    bodyFill: '#047857',
    bodyShadow: '#064e3b',
    billFill: '#f59e0b',
    billShadow: '#b45309',
    wingFill: '#10b981',   // Emerald 500
    wingMid: '#059669',    // Emerald 600
    wingShadow: '#064e3b', // Emerald 900
    accent: '#fbbf24'
  }),
  'bubblegum-pink': Object.freeze({
    id: 'bubblegum-pink',
    name: 'Bubblegum Pink',
    bodyFill: '#f472b6',
    bodyShadow: '#db2777',
    billFill: '#fb923c',
    billShadow: '#ea580c',
    wingFill: '#fbcfe8',   // Pink 200
    wingMid: '#ec4899',    // Pink 500
    wingShadow: '#9d174d', // Pink 800
    accent: '#a855f7'
  })
});

export const HATS = Object.freeze(['none', 'tiny-top-hat', 'sailor-cap']);
export const ACCESSORIES = Object.freeze(['none', 'bow-tie', 'monocle']);
export const PAPER_MODES = Object.freeze(['geometric', 'hybrid', 'baseline', 'none']);

// Backwards compatibility alias for shadowMode
export const SHADOW_MODES = PAPER_MODES;

const PREFIX_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Validates cosmetic composition options.
 * @param {Object} options 
 * @returns {Object} normalized options
 */
export function validateOptions(options = {}) {
  const prefix = options.prefix || 'duck';
  if (!PREFIX_REGEX.test(prefix)) {
    throw new Error(`Invalid prefix "${prefix}". Must match /^[a-zA-Z0-9_-]+$/`);
  }

  const paletteId = options.palette || 'classic-yellow';
  if (!PALETTES[paletteId]) {
    throw new Error(`Invalid palette "${paletteId}". Supported: ${Object.keys(PALETTES).join(', ')}`);
  }

  const hat = options.hat || 'none';
  if (!HATS.includes(hat)) {
    throw new Error(`Invalid hat "${hat}". Supported: ${HATS.join(', ')}`);
  }

  const accessory = options.accessory || 'none';
  if (!ACCESSORIES.includes(accessory)) {
    throw new Error(`Invalid accessory "${accessory}". Supported: ${ACCESSORIES.join(', ')}`);
  }

  // Handle paperMode / legacy shadowMode (default is Mode C 'hybrid' per owner selection)
  let paperMode = options.paperMode || options.shadowMode || 'hybrid';
  if (paperMode === 'offset') paperMode = 'geometric';
  if (paperMode === 'filter') paperMode = 'hybrid';

  if (!PAPER_MODES.includes(paperMode)) {
    throw new Error(`Invalid paperMode "${paperMode}". Supported: ${PAPER_MODES.join(', ')}`);
  }

  return {
    prefix,
    paletteId,
    palette: PALETTES[paletteId],
    hat,
    accessory,
    paperMode,
    shadowMode: paperMode
  };
}

function renderHatMarkup(prefix, hat) {
  if (hat === 'tiny-top-hat') {
    return `
      <!-- Tiny Top Hat (carried by head group) -->
      <g id="${prefix}-hat-top-hat" data-anchor-x="46" data-anchor-y="22">
        <path d="M 34 23 C 42 24 50 23 58 21 C 52 23 44 24 34 23 Z" fill="#0f172a" opacity="0.4" />
        <path d="M 33 22.5 C 41 23.5 49 22.5 57 20.5 C 57.5 21.5 56.5 22.5 55 23 C 47 24.5 39 24.5 33 22.5 Z" fill="#1e293b" />
        <path d="M 38 22 C 45 22.5 51 21.5 53 20.5 L 51.5 9.5 C 46.5 10 41.5 10.5 37 11 L 38 22 Z" fill="#1e293b" />
        <ellipse cx="44.2" cy="10.2" rx="7.2" ry="1.4" fill="#334155" />
        <path d="M 38 22 C 45 22.5 51 21.5 53 20.5 L 52.7 18 C 47 19 42 19.5 37.8 19 L 38 22 Z" fill="#ef4444" />
      </g>`;
  }

  if (hat === 'sailor-cap') {
    return `
      <!-- Sailor Cap (carried by head group) -->
      <g id="${prefix}-hat-sailor-cap" data-anchor-x="46" data-anchor-y="22">
        <path d="M 34 23.5 C 42 23.5 50 22 58 20 C 56.5 22 49 23.5 34 25 Z" fill="#1e3a8a" />
        <path d="M 34.5 22.5 C 33 16 43 11.5 56 12 C 61 12.5 60 19 57.5 20 C 50 22 42 22.5 34.5 22.5 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.6" />
        <circle cx="45" cy="17" r="1.6" fill="#f59e0b" />
        <path d="M 57 19.5 C 62 20 67 22 70 26 L 68 27 C 65 24 61 22 56 21 Z" fill="#1e3a8a" />
      </g>`;
  }

  return '';
}

function renderEyeAccessoryMarkup(prefix, accessory) {
  if (accessory === 'monocle') {
    return `
      <!-- Monocle (head/eye attached at 40, 33) -->
      <g id="${prefix}-acc-monocle">
        <circle cx="40" cy="33" r="5.2" fill="none" stroke="#f59e0b" stroke-width="1.1" />
        <path d="M 37.5 30.5 L 42.5 35.5" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" opacity="0.6" />
        <path d="M 44.5 35 C 47.5 42 46.5 51 42 57" fill="none" stroke="#d97706" stroke-width="0.65" stroke-dasharray="1.2,1.2" />
      </g>`;
  }

  return '';
}

function renderNeckAccessoryMarkup(prefix, accessory) {
  if (accessory === 'bow-tie') {
    return `
      <!-- Bow Tie (body/neck attached at 41, 60) -->
      <g id="${prefix}-acc-bow-tie">
        <path d="M 41 60 L 32 54.5 C 31 59 31 62 32 65.5 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="0.6" />
        <path d="M 33 56 C 36 58 39 59 41 60 C 39 61 36 62 33 64 Z" fill="#b91c1c" opacity="0.35" />
        <path d="M 41 60 L 50 54.5 C 51 59 51 62 50 65.5 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="0.6" />
        <path d="M 49 56 C 46 58 43 59 41 60 C 43 61 46 62 49 64 Z" fill="#b91c1c" opacity="0.35" />
        <circle cx="41" cy="60" r="2.2" fill="#b91c1c" />
        <circle cx="40.5" cy="59.3" r="0.8" fill="#fca5a5" />
      </g>`;
  }

  return '';
}

/**
 * Historical Mode A baseline composer snapshot (from Repair 01)
 */
function renderBaselineMarkup(prefix, palette, hatMarkup, eyeAccMarkup, neckAccMarkup) {
  return `
    <!-- BODY GROUP -->
    <g id="${prefix}-body-group">
      <path id="${prefix}-tail-shadow" d="M 78 63 C 85 61 91 53 93 47 C 91 55 87 63 81 67 Z" fill="var(--duck-body-shadow)" />
      <path id="${prefix}-tail-base" d="M 76 61 C 82 58 88 51 91 46 C 89 53 85 61 79 65 Z" fill="var(--duck-body-fill)" />
      <path id="${prefix}-body-shadow" d="M 32 77 C 36 84 50 87 66 85 C 78 84 85 76 89 65 C 84 72 73 80 58 80 C 44 80 36 75 32 77 Z" fill="var(--duck-body-shadow)" />
      <path id="${prefix}-body-base" d="M 38 54 C 29 60 25 70 29 78 C 33 84 47 86 63 85 C 75 84 83 76 87 65 C 89 60 87 56 83 56 C 80 56 78 60 75 62 C 67 55 57 52 47 52 C 43 52 40 53 38 54 Z" fill="var(--duck-body-fill)" />
      <g id="${prefix}-wing-group" data-pivot-x="52" data-pivot-y="56">
        <path id="${prefix}-wing-under" d="M 50 56 C 59 55 73 61 77 69 C 71 71 61 71 52 68 Z" fill="var(--duck-wing-shadow)" />
        <path id="${prefix}-wing-mid" d="M 51 56 C 61 56 71 62 74 70 C 67 73 57 71 49 66 Z" fill="var(--duck-wing-fill)" />
        <path id="${prefix}-wing-top" d="M 52 56 C 63 56 69 62 71 68 C 64 71 55 69 49 64 C 48 59 50 56 52 56 Z" fill="var(--duck-wing-fill)" stroke="var(--duck-wing-shadow)" stroke-width="0.8" />
      </g>
      <g id="${prefix}-slot-neck" data-x="41" data-y="60">${neckAccMarkup}</g>
    </g>
    <!-- HEAD GROUP -->
    <g id="${prefix}-head-group" data-pivot-x="48" data-pivot-y="46">
      <path id="${prefix}-head-shadow" d="M 37 46 C 43 52 55 52 63 48 C 59 53 51 55 45 54 C 41 53 38 50 37 46 Z" fill="var(--duck-body-shadow)" />
      <path id="${prefix}-head-base" d="M 36 40 C 32 34 36 24 46 22 C 58 20 66 28 66 38 C 66 48 58 54 48 54 C 40 54 36 46 36 40 Z" fill="var(--duck-body-fill)" />
      <g id="${prefix}-bill-group">
        <path id="${prefix}-bill-shadow" d="M 20 44 C 25 45 31 45 37 44 C 34 47 26 47 20 44 Z" fill="var(--duck-bill-shadow)" />
        <path id="${prefix}-bill-base" d="M 37 36 C 30 36 22 38 16 40 C 15 41 16 43 19 43 C 26 44 32 43 37 44 Z" fill="var(--duck-bill-fill)" />
        <path id="${prefix}-bill-accent" d="M 30 39 C 28 39 27 40 28 41" stroke="var(--duck-bill-shadow)" stroke-width="0.75" stroke-linecap="round" fill="none" />
      </g>
      <g id="${prefix}-eye-group" data-pivot-x="40" data-pivot-y="33">
        <circle id="${prefix}-eye-sclera" cx="40" cy="33" r="4.2" fill="#ffffff" />
        <circle id="${prefix}-eye-pupil" cx="39.5" cy="33" r="3.2" fill="#1e293b" />
        <circle id="${prefix}-eye-highlight" cx="38.5" cy="31.8" r="1.1" fill="#ffffff" />
        <g id="${prefix}-slot-eye" data-x="40" data-y="33">${eyeAccMarkup}</g>
      </g>
      <g id="${prefix}-slot-hat" data-x="46" data-y="22">${hatMarkup}</g>
    </g>`;
}

/**
 * Composes a full SVG duck rig markup string.
 * Supports Mode A (baseline), Mode B (geometric paper construction), and Mode C (hybrid local soft seams).
 * @param {Object} rawOptions 
 * @returns {string} Composed SVG string
 */
export function composeDuckSvg(rawOptions = {}) {
  const { prefix, palette, hat, accessory, paperMode } = validateOptions(rawOptions);

  const isHybrid = paperMode === 'hybrid';
  const isBaseline = paperMode === 'baseline';
  const isNone = paperMode === 'none';

  // CSS variables style
  const styleString = `--duck-body-fill: ${palette.bodyFill}; --duck-body-shadow: ${palette.bodyShadow}; --duck-bill-fill: ${palette.billFill}; --duck-bill-shadow: ${palette.billShadow}; --duck-wing-fill: ${palette.wingFill}; --duck-wing-mid: ${palette.wingMid}; --duck-wing-shadow: ${palette.wingShadow}; --duck-accent: ${palette.accent};`;

  const hatMarkup = renderHatMarkup(prefix, hat);
  const eyeAccMarkup = renderEyeAccessoryMarkup(prefix, accessory);
  const neckAccMarkup = renderNeckAccessoryMarkup(prefix, accessory);

  if (isBaseline) {
    return `<svg id="${prefix}-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-label="Digital Duck (Baseline Control) - ${palette.name} with ${hat} and ${accessory}">
  <g id="${prefix}-root" style="${styleString}">
${renderBaselineMarkup(prefix, palette, hatMarkup, eyeAccMarkup, neckAccMarkup)}
  </g>
</svg>`;
  }

  // --- Mode B & Mode C: Stronger Geometric Paper Separation ---
  // Mode C introduces a subtle local drop-shadow filter attached to the head and wing groups,
  // casting soft contact drop shadows over the body and wing sublayers.
  const defsMarkup = isHybrid ? `
    <defs>
      <!-- Localized contact drop shadow for head and wing groups -->
      <filter id="${prefix}-seam-shadow" x="-15%" y="-15%" width="135%" height="135%">
        <feDropShadow dx="0.6" dy="1.0" stdDeviation="0.8" flood-color="#0f172a" flood-opacity="0.32" />
      </filter>
    </defs>` : '';

  const seamFilterAttr = isHybrid ? ` filter="url(#${prefix}-seam-shadow)"` : '';

  // Mode B/C Seam Shadows and Exposed Cardstock Edges
  const shadowOpacity = isNone ? '0' : '1';

  return `<svg id="${prefix}-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-label="Digital Duck - ${palette.name} with ${hat} and ${accessory}">${defsMarkup}
  <g id="${prefix}-root" style="${styleString}">

    <!-- ========================================== -->
    <!-- 1. BODY & TAIL PAPER ASSEMBLY              -->
    <!-- ========================================== -->
    <g id="${prefix}-body-group">

      <!-- Tail Under-Cardstock & Perky Tail Base -->
      <g id="${prefix}-tail-assembly" opacity="${shadowOpacity}">
        <!-- Exposed Tail Backing Card Edge (offset down-right) -->
        <path id="${prefix}-tail-backing" d="M 78 63 C 85 61 91 53 93 47 C 91 55 87 63 81 67 Z" fill="var(--duck-body-shadow)" />
      </g>
      <!-- Tail Foreground Cardstock -->
      <path id="${prefix}-tail-base" d="M 76 61 C 82 58 88 51 91 46 C 89 53 85 61 79 65 Z" fill="var(--duck-body-fill)" />

      <!-- Body Backing Cardstock Edge (Upper-Left Lighting -> Exposed Bottom-Right Rim) -->
      <g id="${prefix}-body-backing" opacity="${shadowOpacity}">
        <path id="${prefix}-body-backing-rim" d="M 31 79 C 35 85 48 87 64 86 C 76 85 84 77 88 66 L 86.5 64.5 C 82.5 75 74.5 83.5 62.5 84.5 C 46.5 85.5 32.5 83.5 28.5 77.5 Z" fill="var(--duck-body-shadow)" />
        <!-- Bottom Belly Seam Shadow -->
        <path id="${prefix}-body-belly-shadow" d="M 32 78 C 36 84 50 86.5 65 85 C 77 84 84 76 88 65 C 83.5 71.5 73 78.5 58 78.5 C 44 78.5 36 74.5 32 78 Z" fill="var(--duck-body-shadow)" />
      </g>

      <!-- Main Plump Body Cardstock Cutout -->
      <path id="${prefix}-body-base" d="M 38 54 C 29 60 25 70 29 78 C 33 84 47 86 63 85 C 75 84 83 76 87 65 C 89 60 87 56 83 56 C 80 56 78 60 75 62 C 67 55 57 52 47 52 C 43 52 40 53 38 54 Z" fill="var(--duck-body-fill)" />

      <!-- Wing-to-Body Contact Paper Shadow (cast onto flank beneath wing) -->
      <path id="${prefix}-seam-wing-shadow" d="M 48 57 C 49 64 54 71 63 73 C 58 72 52 69 48 64 Z" fill="var(--duck-body-shadow)" opacity="${shadowOpacity}" />

      <!-- ========================================== -->
      <!-- 2. WING ASSEMBLY (3 Stepped Paper Layers)   -->
      <!-- Common Pivot: (52, 56)                      -->
      <!-- ========================================== -->
      <g id="${prefix}-wing-group" data-pivot-x="52" data-pivot-y="56"${seamFilterAttr}>
        <!-- PIECE 1: Under-Wing Base Feather (Broadest Card, Darkest Tone) -->
        <path id="${prefix}-wing-under" d="M 50 56 C 59 54 75 61 79 71 C 71 73 59 73 49 69 Z" fill="var(--duck-wing-shadow)" />

        <!-- Contact Shadow cast by Mid-Wing onto Under-Wing -->
        <path id="${prefix}-wing-under-seam" d="M 50 56 C 59 55 69 61 74 69 C 72 70 64 71 50 68 Z" fill="#0f172a" opacity="${isNone ? '0' : '0.25'}" />

        <!-- PIECE 2: Mid-Wing Feather (Stepped inward, Intermediate Tone) -->
        <path id="${prefix}-wing-mid" d="M 51 56 C 60 55 70 61 74 69 C 67 71.5 57 70.5 50 65.5 Z" fill="var(--duck-wing-mid)" />

        <!-- Contact Shadow cast by Top-Wing onto Mid-Wing -->
        <path id="${prefix}-wing-mid-seam" d="M 52 56 C 61 56 65 61 68 66 C 63 67.5 55 66.5 49 63 Z" fill="#0f172a" opacity="${isNone ? '0' : '0.22'}" />

        <!-- PIECE 3: Top-Wing Cover (Stepped inward, Brightest Tone, Crisp Seam) -->
        <path id="${prefix}-wing-top" d="M 52 56 C 62 55.5 66 61 68 66 C 62 68.5 54 67 48 62.5 C 48 58 50 56 52 56 Z" fill="var(--duck-wing-fill)" stroke="var(--duck-wing-mid)" stroke-width="0.6" />
      </g>

      <!-- Slot for Neck Accessories (e.g. Bow Tie) -->
      <g id="${prefix}-slot-neck" data-x="41" data-y="60">${neckAccMarkup}
      </g>
    </g>

    <!-- ========================================== -->
    <!-- 3. HEAD & ACCESSORY GROUP                  -->
    <!-- Parent-Relative Pivot: (48, 46)            -->
    <!-- ========================================== -->
    <g id="${prefix}-head-group" data-pivot-x="48" data-pivot-y="46"${seamFilterAttr}>

      <!-- Head Backing Cardstock Edge (Exposed Bottom-Right Rim) -->
      <path id="${prefix}-head-backing-rim" d="M 58 22 C 67 29 67 39 67 40 C 65.5 40 64.5 31 56 24 Z" fill="var(--duck-body-shadow)" opacity="${shadowOpacity}" />

      <!-- Head-to-Body Contact Seam Shadow (cast from lower jaw onto chest) -->
      <path id="${prefix}-seam-head-shadow" d="M 37 46 C 43 51.5 55 51.5 63 47.5 C 59 52.5 51 54.5 45 53.5 C 41 52.5 38 49.5 37 46 Z" fill="var(--duck-body-shadow)" opacity="${shadowOpacity}" />

      <!-- Main Squat Head Cardstock Cutout -->
      <path id="${prefix}-head-base" d="M 36 40 C 32 34 36 24 46 22 C 58 20 66 28 66 38 C 66 48 58 54 48 54 C 40 54 36 46 36 40 Z" fill="var(--duck-body-fill)" />

      <!-- Subtle Light-Facing Top-Left Rim Accent (Cardstock highlight) -->
      <path id="${prefix}-head-light-edge" d="M 36 34 C 38 27 44 22.5 49 22" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.38" />

      <!-- BILL GROUP (Sits in front of face card) -->
      <g id="${prefix}-bill-group">
        <!-- Bill-to-Face Seam Shadow (cast onto cheek) -->
        <path id="${prefix}-seam-bill-shadow" d="M 36 36 C 35 39.5 35 43 37 44.5 C 36 43 36 38 37 36 Z" fill="var(--duck-body-shadow)" opacity="${shadowOpacity}" />

        <!-- Lower Bill Under-Card -->
        <path id="${prefix}-bill-shadow" d="M 20 44 C 25 45 31 45 37 44 C 34 47 26 47 20 44 Z" fill="var(--duck-bill-shadow)" />

        <!-- Upper Bill Main Card -->
        <path id="${prefix}-bill-base" d="M 37 36 C 30 36 22 38 16 40 C 15 41 16 43 19 43 C 26 44 32 43 37 44 Z" fill="var(--duck-bill-fill)" />

        <!-- Bill Nostril / Crease -->
        <path id="${prefix}-bill-accent" d="M 30 39 C 28 39 27 40 28 41" stroke="var(--duck-bill-shadow)" stroke-width="0.75" stroke-linecap="round" fill="none" />
      </g>

      <!-- EYE GROUP (Sits in front of head card, Pivot 40, 33) -->
      <g id="${prefix}-eye-group" data-pivot-x="40" data-pivot-y="33">
        <!-- Paper Sclera Disk -->
        <circle id="${prefix}-eye-sclera" cx="40" cy="33" r="4.2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.4" />
        <!-- Paper Pupil Disk -->
        <circle id="${prefix}-eye-pupil" cx="39.5" cy="33" r="3.2" fill="#1e293b" />
        <!-- Cutout Highlight Disk -->
        <circle id="${prefix}-eye-highlight" cx="38.5" cy="31.8" r="1.1" fill="#ffffff" />
        <!-- Slot for Eye Accessories (e.g. Monocle) -->
        <g id="${prefix}-slot-eye" data-x="40" data-y="33">${eyeAccMarkup}
        </g>
      </g>

      <!-- Slot for Crown / Hat Accessories (carried by head group) -->
      <g id="${prefix}-slot-hat" data-x="46" data-y="22">${hatMarkup}
      </g>
    </g>

  </g>
</svg>`;
}

/**
 * Renders the canonical master SVG asset for the repository.
 * Directly corresponds to src/assets/svg/duck-rig.svg (Authoritative Mode C Hybrid Paper Rig).
 * @returns {string} Master SVG markup
 */
export function getCanonicalMasterSvg() {
  return composeDuckSvg({
    prefix: 'duck',
    palette: 'classic-yellow',
    hat: 'none',
    accessory: 'none',
    paperMode: 'hybrid'
  });
}
