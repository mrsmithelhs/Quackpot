import test from 'node:test';
import assert from 'node:assert/strict';
import { rainMotionSpec, segmentsAt, visibleSegments, keyframesFor, dropKeyframes, MOTION_LOOK, TILE_COPIES } from '../rain-motion.mjs';
import { WEATHER_LOOK } from '../../study/weather.mjs';

const key = s => s.map(n => n.toFixed(3)).join(',');
const sorted = list => list.map(key).sort();

test('overcast has no rain motion; unknown weathers throw', () => {
  assert.equal(rainMotionSpec('overcast'), null);
  assert.throws(() => rainMotionSpec('hail'), RangeError);
  assert.throws(() => rainMotionSpec('clear'), RangeError);
});

test('spec is deterministic and has far, near and drop layers', () => {
  for (const w of ['rain', 'storm']) {
    const a = rainMotionSpec(w), b = rainMotionSpec(w);
    assert.deepEqual(a, b);
    assert.deepEqual(a.layers.map(l => l.name), ['rain-far', 'rain-near', 'drops']);
    assert.deepEqual(a.hide, ['rain-streaks', 'droplets']);
  }
});

test('streak tile: loop vector follows the still slant; tile taller than the glass and the overhang', () => {
  for (const w of ['rain', 'storm']) {
    const spec = rainMotionSpec(w), slant = WEATHER_LOOK[w].rain.slant * Math.PI / 180;
    for (const layer of spec.layers.filter(l => l.type === 'streaks')) {
      assert.ok(layer.tileHeight > spec.glass.h + 20, 'H exceeds glass height');
      const overhang = Math.max(...layer.segments.map(([, y1, , y2]) => y2 - y1));
      assert.ok(layer.tileHeight > overhang + 10, 'H exceeds streak overhang');
      assert.equal(layer.vector.dy, layer.tileHeight);
      assert.ok(Math.abs(layer.vector.dx / layer.vector.dy + Math.tan(slant)) < 2e-3, 'v is along the streak direction');
      for (const [x1, y1, x2, y2] of layer.segments) assert.ok(Math.abs((x1 - x2) / (y2 - y1) - Math.tan(slant)) < .04, 'each streak has the still slant');
      assert.deepEqual(layer.copies, TILE_COPIES);
    }
  }
});

test('seam: the visible streak set at phase 1 equals the set at phase 0 (loop is seamless)', () => {
  for (const w of ['rain', 'storm']) {
    const spec = rainMotionSpec(w);
    for (const layer of spec.layers.filter(l => l.type === 'streaks')) {
      const at0 = visibleSegments(layer, 0, spec.glass), at1 = visibleSegments(layer, 1, spec.glass);
      assert.ok(at0.length > 10);
      assert.deepEqual(sorted(at1), sorted(at0), `${w}/${layer.name}`);
    }
  }
});

test('coverage: no phase starves the glass; left, middle and right thirds all stay populated', () => {
  for (const w of ['rain', 'storm']) {
    const spec = rainMotionSpec(w), b = spec.glass;
    for (const layer of spec.layers.filter(l => l.type === 'streaks')) {
      const base = visibleSegments(layer, 0, b).length, thirds = [0, 1, 2].map(i => ({ x: b.x + b.w * i / 3, w: b.w / 3 }));
      for (const u of [0, .13, .25, .5, .75, .9, .999]) {
        const vis = visibleSegments(layer, u, b);
        assert.ok(vis.length >= base * .55 && vis.length <= base * 1.6, `${w}/${layer.name} count at ${u}: ${vis.length} vs ${base}`);
        for (const th of thirds) {
          const n = vis.filter(([x1, , x2]) => Math.max(x1, x2) >= th.x && Math.min(x1, x2) <= th.x + th.w).length;
          assert.ok(n >= 2, `${w}/${layer.name} third at x=${th.x.toFixed(0)} u=${u}: ${n}/${vis.length}`);
        }
      }
    }
  }
});

test('the copy that is off-frame at each end of the loop really is off-frame', () => {
  for (const w of ['rain', 'storm']) {
    const spec = rainMotionSpec(w), b = spec.glass;
    for (const layer of spec.layers.filter(l => l.type === 'streaks')) {
      const touches = (u, k) => segmentsAt({ ...layer, copies: [k] }, u).some(([x1, y1, x2, y2]) => Math.max(y1, y2) >= b.y && Math.min(y1, y2) <= b.y + b.h && Math.max(x1, x2) >= b.x && Math.min(x1, x2) <= b.x + b.w);
      assert.equal(touches(0, -2), false, 'copy -2 at phase 0');
      assert.equal(touches(1, 0), false, 'copy 0 at phase 1');
    }
  }
});

test('rain is calmer than storm: slower, fewer streaks, thinner; near is faster and heavier than far', () => {
  const r = rainMotionSpec('rain'), s = rainMotionSpec('storm');
  const L = spec => Object.fromEntries(spec.layers.filter(l => l.type === 'streaks').map(l => [l.name, l]));
  for (const n of ['rain-far', 'rain-near']) {
    assert.ok(L(r)[n].speed < L(s)[n].speed);
    assert.ok(L(r)[n].segments.length < L(s)[n].segments.length);
  }
  assert.ok(L(r)['rain-far'].speed < L(r)['rain-near'].speed && L(s)['rain-far'].speed < L(s)['rain-near'].speed);
  assert.ok(L(s)['rain-far'].style['stroke-width'] < L(s)['rain-near'].style['stroke-width']);
  assert.equal(r.layers[2].drops.length, WEATHER_LOOK.rain.drops);
  assert.equal(s.layers[2].drops.length, WEATHER_LOOK.storm.drops);
});

test('keyframes touch only transform and opacity; durations match speed; drops are phase-staggered and fade at the wrap', () => {
  const allowed = new Set(['transform', 'opacity', 'offset']);
  for (const w of ['rain', 'storm']) {
    for (const layer of rainMotionSpec(w).layers) {
      if (layer.type === 'streaks') {
        const { keyframes, options } = keyframesFor(layer);
        for (const kf of keyframes) for (const k of Object.keys(kf)) assert.ok(allowed.has(k), k);
        assert.equal(options.iterations, Infinity); assert.equal(options.easing, 'linear');
        assert.ok(Math.abs(options.duration / 1000 * layer.speed - Math.hypot(layer.vector.dx, layer.vector.dy)) < layer.speed * .001 + 1);
        assert.equal(keyframes[1].transform, `translate(${layer.vector.dx}px, ${layer.vector.dy}px)`);
      } else {
        for (const d of layer.drops) {
          const { keyframes, options } = dropKeyframes(d);
          for (const kf of keyframes) for (const k of Object.keys(kf)) assert.ok(allowed.has(k), k);
          assert.equal(keyframes[0].opacity, 0); assert.equal(keyframes.at(-1).opacity, 0);
          assert.ok(options.delay <= 0 && -options.delay <= options.duration);
        }
        assert.ok(new Set(layer.drops.map(d => d.delayMs)).size > 1, 'staggered');
      }
    }
  }
  assert.ok(MOTION_LOOK.rain && MOTION_LOOK.storm && !MOTION_LOOK.overcast);
});

test('drops stay inside the glass for their whole slide', () => {
  for (const w of ['rain', 'storm']) {
    const spec = rainMotionSpec(w), b = spec.glass;
    for (const d of spec.layers[2].drops) {
      assert.ok(d.cx - d.rx >= b.x && d.cx + d.rx <= b.x + b.w);
      assert.ok(d.cy - d.ry >= b.y && d.cy + d.travel + d.ry <= b.y + b.h, `drop at ${d.cy} + ${d.travel}`);
    }
  }
});
