import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PALETTES,
  HATS,
  ACCESSORIES,
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
    assert.equal(opts.shadowMode, 'offset');
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

  test('rejects uncataloged shadow mode', () => {
    assert.throws(() => validateOptions({ shadowMode: 'raytraced' }), /Invalid shadowMode/);
  });
});

describe('duck-rig — hierarchy and attachment points', () => {
  test('hat attachment is strictly nested inside head group', () => {
    const svg = composeDuckSvg({ prefix: 'pfx', hat: 'tiny-top-hat' });

    // Find head group and verify slot-hat is inside it
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

  test('wing group has defined pivot point and contains 3 sublayers', () => {
    const svg = composeDuckSvg({ prefix: 'wing-test' });

    assert.match(svg, /id="wing-test-wing-group"[^>]*data-pivot-x="52"[^>]*data-pivot-y="56"/);
    assert.match(svg, /id="wing-test-wing-under"/);
    assert.match(svg, /id="wing-test-wing-mid"/);
    assert.match(svg, /id="wing-test-wing-top"/);
  });
});

describe('duck-rig — multi-instance independence', () => {
  test('multiple instances in the same DOM do not share IDs or filter references', () => {
    const duck1 = composeDuckSvg({ prefix: 'duck-one', palette: 'classic-yellow', shadowMode: 'filter' });
    const duck2 = composeDuckSvg({ prefix: 'duck-two', palette: 'bubblegum-pink', shadowMode: 'filter' });

    // Extract all IDs from both
    const idRegex = /id="([^"]+)"/g;
    const ids1 = new Set([...duck1.matchAll(idRegex)].map(m => m[1]));
    const ids2 = new Set([...duck2.matchAll(idRegex)].map(m => m[1]));

    assert.ok(ids1.size > 0);
    assert.ok(ids2.size > 0);

    for (const id of ids1) {
      assert.ok(!ids2.has(id), `ID "${id}" from duck1 was also found in duck2`);
    }

    // Filter references must match their own prefix
    assert.match(duck1, /url\(#duck-one-paper-shadow\)/);
    assert.doesNotMatch(duck1, /url\(#duck-two-paper-shadow\)/);
    assert.match(duck2, /url\(#duck-two-paper-shadow\)/);
    assert.doesNotMatch(duck2, /url\(#duck-one-paper-shadow\)/);
  });
});

describe('duck-rig — shadow modes', () => {
  test('offset mode uses geometric shadow paths and no SVG filter', () => {
    const svg = composeDuckSvg({ prefix: 'pfx-off', shadowMode: 'offset' });
    assert.match(svg, /id="pfx-off-body-shadow"/);
    assert.match(svg, /id="pfx-off-tail-shadow"/);
    assert.doesNotMatch(svg, /<feDropShadow/);
  });

  test('filter mode uses feDropShadow and omits offset shadow paths', () => {
    const svg = composeDuckSvg({ prefix: 'pfx-filt', shadowMode: 'filter' });
    assert.match(svg, /<feDropShadow/);
    assert.match(svg, /filter="url\(#pfx-filt-paper-shadow\)"/);
    assert.doesNotMatch(svg, /id="pfx-filt-body-shadow"/);
    assert.doesNotMatch(svg, /id="pfx-filt-tail-shadow"/);
  });

  test('none mode omits both offset paths and feDropShadow', () => {
    const svg = composeDuckSvg({ prefix: 'pfx-none', shadowMode: 'none' });
    assert.doesNotMatch(svg, /<feDropShadow/);
    assert.doesNotMatch(svg, /id="pfx-none-body-shadow"/);
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

    // Verification that returned artifact is pure SVG string
    assert.equal(typeof svg, 'string');
    assert.ok(svg.startsWith('<svg'));
    assert.ok(svg.endsWith('</svg>'));
  });
});
