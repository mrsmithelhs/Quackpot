import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';

import {
  PALETTES,
  HATS,
  ACCESSORIES,
  composeDuckSvg,
  getCanonicalMasterSvg
} from '../../src/core/duck-rig.mjs';

import {
  QUACK_SHORT,
  QUACK_A_CONTROL,
  QUACK_B_SYNTH_ADSR,
  QUACK_C_FORMANT_NOISE,
  QUACK_CANDIDATES,
  playSynthesizedSound
} from '../../src/audio/synth.mjs';

function computeSha256(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

describe('plan-04 parity — master SVG derivation', () => {
  test('src/assets/svg/duck-rig.svg matches getCanonicalMasterSvg() identically', () => {
    const masterSvgPath = path.resolve('src/assets/svg/duck-rig.svg');
    assert.ok(fs.existsSync(masterSvgPath), 'Master SVG asset must exist');

    const fileContent = fs.readFileSync(masterSvgPath, 'utf8').trim();
    const canonical = getCanonicalMasterSvg().trim();

    assert.equal(fileContent, canonical, 'Master SVG must be 100% derived from duck-rig.mjs without manual drift');
  });

  test('canonical master SVG contains accessible labels, root group, and Mode C hybrid paper elements', () => {
    const canonical = getCanonicalMasterSvg();
    assert.match(canonical, /viewBox="0 0 100 100"/);
    assert.match(canonical, /role="img"/);
    assert.match(canonical, /aria-label="Digital Duck - Classic Yellow with none and none"/);
    assert.match(canonical, /<filter id="duck-seam-shadow"/);
    assert.match(canonical, /id="duck-head-group"[^>]*filter="url\(#duck-seam-shadow\)"/);
    assert.match(canonical, /id="duck-wing-group"[^>]*filter="url\(#duck-seam-shadow\)"/);
    assert.match(canonical, /<g id="duck-root"/);
    assert.match(canonical, /id="duck-wing-under"/);
    assert.match(canonical, /id="duck-wing-mid"/);
    assert.match(canonical, /id="duck-wing-top"/);
    assert.match(canonical, /id="duck-seam-head-shadow"/);
    assert.match(canonical, /id="duck-seam-wing-shadow"/);
    assert.match(canonical, /id="duck-seam-bill-shadow"/);
    assert.match(canonical, /id="duck-body-backing-rim"/);
  });
});

describe('plan-04 parity — preview gallery provenance and drift', () => {
  const previewPath = path.resolve('reports/development/plan-04-svg-rig-and-sound/preview.html');
  const duckRigPath = path.resolve('src/core/duck-rig.mjs');
  const synthPath = path.resolve('src/audio/synth.mjs');

  test('preview.html embeds current source file SHA-256 hashes', () => {
    assert.ok(fs.existsSync(previewPath), 'preview.html must exist');
    const previewContent = fs.readFileSync(previewPath, 'utf8');

    const duckRigHash = computeSha256(duckRigPath);
    const synthHash = computeSha256(synthPath);

    assert.ok(
      previewContent.includes(duckRigHash.slice(0, 12)),
      `preview.html must embed current duck-rig.mjs hash (${duckRigHash.slice(0, 12)})`
    );
    assert.ok(
      previewContent.includes(synthHash.slice(0, 12)),
      `preview.html must embed current synth.mjs hash (${synthHash.slice(0, 12)})`
    );
  });

  test('bundled DuckRig in preview.html produces byte-identical output to src/core/duck-rig.mjs', () => {
    const previewContent = fs.readFileSync(previewPath, 'utf8');

    const duckRigBundleMatch = previewContent.match(/<script id="bundle-duck-rig">([\s\S]*?)<\/script>/);
    assert.ok(duckRigBundleMatch, 'preview.html must contain bundle-duck-rig script tag');

    const bundleCode = duckRigBundleMatch[1];
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(bundleCode, sandbox);

    assert.ok(sandbox.window.DuckRig, 'DuckRig must be exported on window');
    assert.equal(typeof sandbox.window.DuckRig.composeDuckSvg, 'function');

    // Compare output across modes
    const testOptions = [
      { prefix: 'inst-1', palette: 'classic-yellow', hat: 'tiny-top-hat', accessory: 'monocle', paperMode: 'geometric' },
      { prefix: 'inst-2', palette: 'mallard-green', hat: 'sailor-cap', accessory: 'bow-tie', paperMode: 'hybrid' },
      { prefix: 'inst-3', palette: 'bubblegum-pink', hat: 'none', accessory: 'none', paperMode: 'baseline' }
    ];

    for (const opts of testOptions) {
      const sourceOutput = composeDuckSvg(opts);
      const bundleOutput = sandbox.window.DuckRig.composeDuckSvg(opts);
      assert.equal(bundleOutput, sourceOutput, `Bundled output for ${opts.prefix} must match source output identically`);
    }
  });

  test('bundled DuckSynth in preview.html matches source candidate contracts', () => {
    const previewContent = fs.readFileSync(previewPath, 'utf8');
    const synthBundleMatch = previewContent.match(/<script id="bundle-duck-synth">([\s\S]*?)<\/script>/);
    assert.ok(synthBundleMatch, 'preview.html must contain bundle-duck-synth script tag');

    const bundleCode = synthBundleMatch[1];
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(bundleCode, sandbox);

    assert.ok(sandbox.window.DuckSynth, 'DuckSynth must be exported on window');
    assert.deepEqual({ ...sandbox.window.DuckSynth.QUACK_A_CONTROL }, { ...QUACK_A_CONTROL });
    assert.deepEqual({ ...sandbox.window.DuckSynth.QUACK_B_SYNTH_ADSR }, { ...QUACK_B_SYNTH_ADSR });
    assert.deepEqual({ ...sandbox.window.DuckSynth.QUACK_C_FORMANT_NOISE }, { ...QUACK_C_FORMANT_NOISE });
  });
});

describe('plan-04 parity — real source sound lifecycle and fallback across candidates', () => {
  test('exercises user-gesture resume and audio node scheduling with conservative gain', async () => {
    let resumed = false;
    let masterPeakGain = 0;
    let startFreq = 0;

    const destination = { isDestination: true };
    const mockCtx = {
      state: 'suspended',
      currentTime: 100.0,
      destination,
      resume: async () => {
        resumed = true;
        mockCtx.state = 'running';
      },
      createGain: () => {
        let nodePeak = 0;
        return {
          gain: {
            value: 0,
            setValueAtTime: () => {},
            linearRampToValueAtTime: (val) => {
              if (val > nodePeak) nodePeak = val;
            },
            exponentialRampToValueAtTime: () => {}
          },
          connect: (dest) => {
            if (dest === destination) {
              masterPeakGain = nodePeak;
            }
          }
        };
      },
      createOscillator: () => ({
        type: 'sine',
        frequency: {
          value: 0,
          setValueAtTime: (val) => {
            if (!startFreq) startFreq = val;
          },
          linearRampToValueAtTime: () => {}
        },
        connect: () => {},
        start: () => {},
        stop: () => {}
      })
    };

    const res = await playSynthesizedSound(QUACK_A_CONTROL, { audioContext: mockCtx });

    assert.equal(res.played, true);
    assert.equal(resumed, true, 'Suspended audio context must be resumed');
    assert.equal(masterPeakGain, 0.15, 'Master peak gain must strictly match conservative 0.15 parameter');
    assert.equal(startFreq, 340, 'Starting carrier frequency must be 340 Hz');
  });

  test('exercises silent fallback on unavailable or failing context without throwing', async () => {
    // 1. Completely absent context
    const resAbsent = await playSynthesizedSound(QUACK_C_FORMANT_NOISE, {
      audioContext: null,
      AudioContextClass: null
    });
    assert.equal(resAbsent.played, false);
    assert.equal(resAbsent.fallback, 'silent');

    // 2. Failing context (throws on resume or createGain)
    const brokenCtx = {
      state: 'suspended',
      resume: async () => {
        throw new Error('NotAllowedError: user gesture required');
      }
    };
    const resFailing = await playSynthesizedSound(QUACK_C_FORMANT_NOISE, { audioContext: brokenCtx });
    assert.equal(resFailing.played, false);
    assert.equal(resFailing.fallback, 'silent');
  });
});
