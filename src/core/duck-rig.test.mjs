import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PALETTES,
  HATS,
  ACCESSORIES,
  PAPER_MODES,
  SHADOW_MODES,
  validateOptions,
  composeDuckSvg
} from './duck-rig.mjs';

describe('duck-rig — option validation', () => {
  test('validates and applies defaults', () => {
    const opts = validateOptions();
    assert.equal(opts.prefix, 'duck');
    assert.equal(opts.paletteId, 'classic-yellow');
    assert.equal(opts.hat, 'none');
    assert.equal(opts.accessory, 'none');
    assert.equal(opts.paperMode, 'geometric');
  });

  test('maps legacy shadowMode offset to geometric and filter to hybrid', () => {
    const optsOffset = validateOptions({ shadowMode: 'offset' });
    assert.equal(optsOffset.paperMode, 'geometric');

    const optsFilter = validateOptions({ shadowMode: 'filter' });
    assert.equal(optsFilter.paperMode, 'hybrid');
  });

  test('rejects invalid instance prefix', () => {
    assert.throws(() => validateOptions({ prefix: 'invalid prefix with spaces!' }), /Invalid prefix/);
    assert.throws(() => validateOptions({ prefix: 'duck<script>' }), /Invalid prefix/);
  });

  test('rejects uncataloged palette', () => {
    assert.throws(() => validateOptions({ palette: 'neon-cyberpunk' }), /Invalid palette/);
  });

  test('rejects uncataloged hat', () => {
    assert.throws(() => validateOptions({ hat: 'wizard-hat' }), /Invalid hat/);
  });

  test('rejects uncataloged accessory', () => {
    assert.throws(() => validateOptions({ accessory: 'sunglasses' }), /Invalid accessory/);
  });

  test('rejects uncataloged paper mode', () => {
    assert.throws(() => validateOptions({ paperMode: 'raytraced' }), /Invalid paperMode/);
  });
});

describe('duck-rig — hierarchy and attachment points', () => {
  test('hat attachment is strictly nested inside head group', () => {
    const svg = composeDuckSvg({ prefix: 'pfx', hat: 'tiny-top-hat' });

    const headGroupIndex = svg.indexOf('id="pfx-head-group"');
    const slotHatIndex = svg.indexOf('id="pfx-slot-hat"');
    const topHatIndex = svg.indexOf('id="pfx-hat-top-hat"');
    
    assert.ok(headGroupIndex !== -1, 'head group must exist');
    assert.ok(slotHatIndex !== -1, 'slot-hat must exist');
    assert.ok(topHatIndex !== -1, 'top-hat markup must exist');
    assert.ok(headGroupIndex < slotHatIndex, 'slot-hat must appear after head-group start tag');
    assert.ok(slotHatIndex < topHatIndex, 'top-hat markup must be placed inside slot-hat');
  });

  test('monocle attachment is nested inside eye group under head group', () => {
    const svg = composeDuckSvg({ prefix: 'pfx', accessory: 'monocle' });

    const headGroupIndex = svg.indexOf('id="pfx-head-group"');
    const eyeGroupIndex = svg.indexOf('id="pfx-eye-group"');
    const slotEyeIndex = svg.indexOf('id="pfx-slot-eye"');
    const monocleIndex = svg.indexOf('id="pfx-acc-monocle"');

    assert.ok(headGroupIndex < eyeGroupIndex, 'eye group must be inside head group');
    assert.ok(eyeGroupIndex < slotEyeIndex, 'slot-eye must be inside eye group');
    assert.ok(slotEyeIndex < monocleIndex, 'monocle markup must be inside slot-eye');
  });

  test('bow tie is nested inside neck slot under body group', () => {
    const svg = composeDuckSvg({ prefix: 'pfx', accessory: 'bow-tie' });

    const bodyGroupIndex = svg.indexOf('id="pfx-body-group"');
    const slotNeckIndex = svg.indexOf('id="pfx-slot-neck"');
    const bowTieIndex = svg.indexOf('id="pfx-acc-bow-tie"');

    assert.ok(bodyGroupIndex < slotNeckIndex, 'slot-neck must be inside body group');
    assert.ok(slotNeckIndex < bowTieIndex, 'bow-tie markup must be inside slot-neck');
  });

  test('wing group has defined pivot point and contains 3 stepped sublayers', () => {
    const svg = composeDuckSvg({ prefix: 'wing-test', paperMode: 'geometric' });

    assert.match(svg, /id="wing-test-wing-group"[^>]*data-pivot-x="52"[^>]*data-pivot-y="56"/);
    assert.match(svg, /id="wing-test-wing-under"/);
    assert.match(svg, /id="wing-test-wing-mid"/);
    assert.match(svg, /id="wing-test-wing-top"/);
    assert.match(svg, /id="wing-test-wing-under-seam"/, 'Must contain contact shadow between stepped wing cards');
  });
});

describe('duck-rig — multi-instance independence', () => {
  test('multiple instances in the same DOM do not share IDs or filter references', () => {
    const duck1 = composeDuckSvg({ prefix: 'duck-one', palette: 'classic-yellow', paperMode: 'hybrid' });
    const duck2 = composeDuckSvg({ prefix: 'duck-two', palette: 'bubblegum-pink', paperMode: 'hybrid' });

    const idRegex = /id="([^"]+)"/g;
    const ids1 = new Set([...duck1.matchAll(idRegex)].map(m => m[1]));
    const ids2 = new Set([...duck2.matchAll(idRegex)].map(m => m[1]));

    assert.ok(ids1.size > 0);
    assert.ok(ids2.size > 0);

    for (const id of ids1) {
      assert.ok(!ids2.has(id), `ID "${id}" from duck1 was also found in duck2`);
    }

    // Filter references must match their own prefix
    assert.match(duck1, /url\(#duck-one-seam-shadow\)/);
    assert.doesNotMatch(duck1, /url\(#duck-two-seam-shadow\)/);
    assert.match(duck2, /url\(#duck-two-seam-shadow\)/);
    assert.doesNotMatch(duck2, /url\(#duck-one-seam-shadow\)/);
  });
});

describe('duck-rig — paper construction modes (A/B/C)', () => {
  test('geometric mode (Mode B) uses stepped cardstock, seam shadows, and no SVG filter', () => {
    const svg = composeDuckSvg({ prefix: 'pfx-geom', paperMode: 'geometric' });
    assert.match(svg, /id="pfx-geom-seam-head-shadow"/, 'Must contain head seam shadow');
    assert.match(svg, /id="pfx-geom-seam-wing-shadow"/, 'Must contain wing flank seam shadow');
    assert.match(svg, /id="pfx-geom-seam-bill-shadow"/, 'Must contain bill cheek seam shadow');
    assert.match(svg, /id="pfx-geom-body-backing-rim"/, 'Must contain body cardstock backing rim');
    assert.doesNotMatch(svg, /<feDropShadow/, 'Geometric mode must not use feDropShadow filter');
  });

  test('hybrid mode (Mode C) includes local seam-shadow filter applied specifically at joins', () => {
    const svg = composeDuckSvg({ prefix: 'pfx-hyb', paperMode: 'hybrid' });
    assert.match(svg, /<filter id="pfx-hyb-seam-shadow"/);
    assert.match(svg, /id="pfx-hyb-head-group"[^>]*filter="url\(#pfx-hyb-seam-shadow\)"/);
    assert.match(svg, /id="pfx-hyb-wing-group"[^>]*filter="url\(#pfx-hyb-seam-shadow\)"/);
  });

  test('baseline mode (Mode A) reproduces historical baseline snapshot', () => {
    const svg = composeDuckSvg({ prefix: 'pfx-base', paperMode: 'baseline' });
    assert.match(svg, /id="pfx-base-tail-shadow"/);
    assert.match(svg, /id="pfx-base-body-shadow"/);
    assert.doesNotMatch(svg, /id="pfx-base-body-backing-rim"/);
  });

  test('none mode hides paper seam shadows', () => {
    const svg = composeDuckSvg({ prefix: 'pfx-none', paperMode: 'none' });
    assert.doesNotMatch(svg, /<feDropShadow/);
    assert.match(svg, /id="pfx-none-tail-assembly" opacity="0"/);
  });
});

describe('duck-rig — cosmetics independence from stats', () => {
  test('rig returns pure markup and accepts no stat mutations', () => {
    const svg = composeDuckSvg({
      prefix: 'stat-test',
      palette: 'mallard-green',
      hat: 'sailor-cap',
      accessory: 'bow-tie'
    });

    assert.equal(typeof svg, 'string');
    assert.ok(svg.startsWith('<svg'));
    assert.ok(svg.endsWith('</svg>'));
  });
});
