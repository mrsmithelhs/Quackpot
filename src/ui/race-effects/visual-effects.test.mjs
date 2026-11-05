import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { abilityVisual } from './ability-effects.mjs';
import { collisionVisual } from './collision-effects.mjs';
import { createTimeline, previewDurationMs } from '../../../reports/development/plan-59-race-growth-injury-and-ability-integration/visual-extraction/timeline-fixture.mjs';
import { padAndForce, bowWave, airCurrents } from '../../../reports/development/plan-58-race-ability-animation-study/gallery/revision-effects.mjs';
import { guardCue, recoveryCue, diveLayer } from '../../../reports/development/plan-58-race-ability-animation-study/gallery/candidate-effects.mjs';
import { wideAlternative, aheadAlternative, draftAlternative } from '../../../reports/development/plan-58-race-ability-animation-study/gallery/alternatives-effects.mjs';
import { straightCue, steadyCue, wakeCue } from '../../../reports/development/plan-58-race-ability-animation-study/gallery/final-three-effects.mjs';

const all = ['bounce','crowd','guard','recovery','dive','wide','ahead','draft','straight','steady','wake'];
const geometry = { width: 256, height: 256, leaderX: 55, followerX: 185, y: 170, duckWidth: 90 };
const body = (svg) => svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');

test('selected 11 ability treatments reproduce their source geometry and layers', () => {
  const p = .37, render = (kind) => abilityVisual({ kind, progress: p, idPrefix: `test-${kind}`, pose: { link: geometry } });
  const pairs = [
    [render('bounce').layers.water, padAndForce(p)], [render('crowd').layers.water, bowWave(p)],
    [render('crowd').layers.back, airCurrents(p,false,'behind')], [render('crowd').layers.front, airCurrents(p,false,'front')],
    [render('guard').layers.overlay, guardCue(p,'arc')], [render('recovery').layers.overlay, recoveryCue(p,'arc')],
    [render('dive').layers.back, diveLayer(p,'behind')], [render('dive').layers.front, diveLayer(p,'front')],
    [render('wide').layers.overlay, wideAlternative(p,'a')], [render('ahead').layers.water, aheadAlternative(p,'a')],
    [render('ahead').layers.overlay, aheadAlternative(p,'b')], [render('draft').layers.back, draftAlternative(p,'a','back',geometry)],
    [render('draft').layers.front, draftAlternative(p,'a','front',geometry)], [render('straight').layers.overlay, straightCue(p,'a')],
    [render('steady').layers.back, steadyCue(p,'a','back')], [render('steady').layers.front, steadyCue(p,'a','front')],
    [render('wake').layers.back, wakeCue(p,'b','back')], [render('wake').layers.front, wakeCue(p,'b','front')],
  ];
  for (const [actual, expected] of pairs) assert.equal(body(actual), body(expected));
  assert.equal(all.length, 11);
});

test('ability pose layers remain explicit, unique, inert and clearable', () => {
  const ids = [];
  for (const kind of all) {
    const render = (idPrefix) => abilityVisual({ kind, progress: .5, idPrefix, pose: { link: geometry } });
    const a = render(`a-${kind}`), b = render(`b-${kind}`);
    assert.equal(a.active, true);
    for (const visual of [a,b]) {
      for (const markup of [...Object.values(visual.layers),visual.wingArtwork,visual.headBridge]) {
        assert.doesNotMatch(markup, /<script|\son\w+=|(?:https?:)?\/\//i);
        ids.push(...[...markup.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
      }
    }
    const off = abilityVisual({ kind, progress: null, idPrefix: `off-${kind}` });
    assert.deepEqual(off.layers, {}); assert.equal(off.active, false);
    const stillA = abilityVisual({ kind, progress: .2, idPrefix: `still-${kind}`, pose: { still: true, link: geometry } });
    const stillB = abilityVisual({ kind, progress: .8, idPrefix: `still-${kind}`, pose: { still: true, link: geometry } });
    assert.deepEqual(stillA, stillB);
  }
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(abilityVisual({ kind:'dive', progress:.5, idPrefix:'dive' }).pose.underwater,true);
  assert.deepEqual(abilityVisual({ kind:'bounce', progress:.5, idPrefix:'facing', pose:{facing:'right'} }).orientation,
    { layerScaleX: -1, bodyRotateY: 180 });
  assert.notEqual(abilityVisual({ kind:'ahead', progress:.5, idPrefix:'ahead' }).wingArtwork,'');
  assert.throws(() => abilityVisual({ kind:'bounce', progress:.5 }), RangeError);
  assert.throws(() => abilityVisual({ kind:'bounce', progress:.5, idPrefix:'x" onload="x' }), RangeError);
  assert.throws(() => abilityVisual({ kind:'draft', progress:.5, idPrefix:'draft', pose:{link:{...geometry, y: Infinity}} }), RangeError);
});

test('selected collision frames and independent injury preserve exact source assets', () => {
  const hashes = {
    pop:'463e90ab1ab3baf8c57f55ce2590c6736b77c7c44f56947058d131c704b8747c',
    chip1:'18005d3d628a543b25a309db47735519debc14f3c3b63b20f98fcfb7dbd5e497',
    chip2:'ee42c215a36266fb2f43f63211464269d932b6e5e880d508723d9aca71439eb0',
    chip3:'d66050ca5dbf0f4382dc79e8fbe74a8d6b824133bff78e8da8d7d018f93fd851',
    chip4:'9d5a96b35d5c651d3e9c72491de5982ecd6e6f55b6df55bc530f2f2f4ffa6856',
    'A-onset':'2ec65052f1810989c356605dc2d6c62c39eccdb8b8138eebe1f37250029dcd25',
    'A-expansion':'9efad9cc32f99b2f76bbca7a98483767aacffd21b71c6ddbc46bcb5d859c26bb',
    'A-breakup':'ae003f071a224e9a62b3398bf1f74d7cb97079bdece99f499b91b04fdd01c827',
    'A-settle':'2c393e87358416a1ba1cfcfd2e375b3ac60707eb5a0726522e5529d79a14677c',
    'adhesive-bandage':'008179e47152fac72ea0496d383e6b3f534e666b34001a38d6920849ee2f69a1',
  };
  for (const [name,hash] of Object.entries(hashes)) {
    const bytes = readFileSync(fileURLToPath(new URL(`../../assets/svg/race-effects/${name}.svg`,import.meta.url)));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),hash);
    assert.doesNotMatch(bytes.toString(), /<script|<image|\bid=|\son\w+=|url\(/i);
  }
  const cue = (kind,progress) => collisionVisual({kind,progress,idPrefix:`fixture-${kind}`});
  assert.equal(cue('pop',0).frames[0].scaleX,.35);
  assert.equal(cue('fragments',.3).frames.length,4);
  assert.deepEqual([.06,.2,.41,.68].map((age) => cue('burst',age/.85).frames[0].frame),['onset','expansion','breakup','settle']);
  assert.equal(cue('injury',.5).frames[0].asset.endsWith('adhesive-bandage.svg'),true);
  assert.equal(cue('white-return',.5).whiteMix,.5);
  assert.deepEqual(cue('injury',null).frames,[]);
  assert.throws(() => collisionVisual({kind:'pop',progress:.5}),RangeError);
});

test('externally clocked timeline freezes, seeks, replays and disposes independently', () => {
  const a = [], b = [], first = createTimeline((p) => a.push(p)), second = createTimeline((p) => b.push(p));
  first.seek(.2); first.step(.2); assert.deepEqual(a,[.2]);
  first.play(); first.step(.3); first.pause(); first.step(.3); assert.deepEqual(a,[.2,.5]);
  first.seek(0); first.play(); first.step(.1); assert.equal(a.at(-1),.1);
  second.seek(.9); first.dispose(); first.dispose();
  assert.equal(a.at(-1),null); assert.deepEqual(b,[.9]);
  assert.throws(() => first.seek(.5),/disposed/);
  second.dispose(); assert.equal(b.at(-1),null);
  assert.equal(previewDurationMs('white-return'),1000);
  const white = []; const clock = createTimeline((p) => white.push(p));
  clock.play(); clock.step(500 / previewDurationMs('white-return'));
  assert.equal(collisionVisual({kind:'white-return',progress:white.at(-1),idPrefix:'white'}).whiteMix,.5);
  clock.step(500 / previewDurationMs('white-return'));
  assert.equal(collisionVisual({kind:'white-return',progress:white.at(-1),idPrefix:'white'}).whiteMix,0);
  clock.dispose();
});

test('runtime modules do not import reports or read ambient randomness', () => {
  for (const path of ['./ability-effects.mjs','./collision-effects.mjs']) {
    const source = readFileSync(new URL(path,import.meta.url),'utf8');
    assert.doesNotMatch(source, /(?:from\s*['"][^'"]*reports|Math\.random|localStorage|fetch\()/);
  }
});
