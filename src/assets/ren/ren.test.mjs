import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRen, renderRenScene, REN_EXPRESSIONS } from './index.mjs';
test('explicit deterministic expressions and strict options', () => {
  for (const expression of REN_EXPRESSIONS) {
    const o = { idPrefix: 'one', expression, framing: 'avatar' };
    assert.deepEqual(renderRen(o), renderRen(o));
    assert.match(renderRen(o).svg, /viewBox="46 30 148 148"/);
  }
  for (const options of [{}, {idPrefix:'one', expression:'other'}, {idPrefix:'one', framing:'side'}, {idPrefix:'one', extra:true}, {idPrefix:'bad prefix'}]) assert.throws(() => renderRen(options));
  assert.throws(() => renderRenScene({idPrefix:'one', scene:'floor'}));
});
test('distinct instances have unique and resolvable local references', () => {
  const output = [renderRen({idPrefix:'a'}).svg, renderRen({idPrefix:'b',expression:'listening'}).svg, renderRenScene({idPrefix:'c',scene:'door'}).svg].join('');
  const ids = [...output.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of output.matchAll(/(?:href="#|url\(#)([^"\)]+)/g)) assert.ok(ids.includes(match[1]), match[1]);
  assert.doesNotMatch(output, /<script\b|\son\w+=|(?:href|src)="(?:https?:|\/\/)/i);
});
test('living-scene patches apply without mutable room data', async () => {
  const { renderFloorCandidate } = await import('./index.mjs');
  const a=renderRenScene({idPrefix:'couch',scene:'couch-close'});
  const b=renderFloorCandidate({idPrefix:'floor'});
  assert.equal(a.meta.bodyEdge,'sofa foreground');
  assert.equal(b.meta.duckSupport,'blue magazine');
  const output=a.svg+b.svg;
  const ids=[...output.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const m of output.matchAll(/(?:href="#|url\(#)([^"\)]+)/g)) assert.ok(ids.includes(m[1]),m[1]);
  assert.equal(a.svg,renderRenScene({idPrefix:'couch',scene:'couch-close'}).svg);
});
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { renderScene } from '../apartment/index.mjs';
import { patches } from './scene-patches.mjs';
const concept = new URL('../../../reports/development/plan-41-ren-friend-character-and-social-life-study/concepts/',import.meta.url);
const sha=b=>createHash('sha256').update(b).digest('hex');
test('pinned room originals match localized patch before ID/class isolation', () => {
 for (const [id,hash] of [['ren-couch-medium','152759a5a7b161e18c183f0316df585ce405d9bdcc5905240ad7d1fb5725385a'],['ren-floor-game-night','c1a90b5acb0814d3022831c162ee26003a1c4d4e7d568d297ea4059aae9dd23c']]) {
  const bytes=readFileSync(new URL(`apartment-scenes/scenes/${id}.svg`,concept)); assert.equal(sha(bytes),hash);
  let baseline=renderScene({area:'living',idPrefix:id,framing:'wide',light:'window',furnishings:id==='ren-floor-game-night'?{couch:'removed',tv:'present'}:undefined,duckView:'side',decorative:false,label:'baseline'}).svg;
  const patch=patches[id]; assert.equal(baseline.length,patch.length);
  for(const op of patch.ops) {assert.equal(baseline.slice(op.start,op.end),op.old);assert.equal(baseline.slice(Math.max(0,op.start-40),op.start),op.before);assert.equal(baseline.slice(op.end,op.end+40),op.after)}
  for(const op of [...patch.ops].reverse())baseline=baseline.slice(0,op.start)+op.value+baseline.slice(op.end);
  assert.equal(baseline,bytes.toString('utf8').replace(/\r\n/g,'\n'));
 }
});
test('six figure definitions and door stay tied to pinned originals', async () => {
 const {figureDefs,doorSource}=await import('./source.mjs');
 const round=readFileSync(new URL('round-04-faces-and-door.html',concept));
 assert.equal(sha(round),'4a3824ad4b3c819d5701d1931bdfd9116fbae78d00cabb352bae20ebb147ba63');
 assert.ok(round.toString('utf8').replace(/\r\n/g,'\n').includes(figureDefs));
 const door=readFileSync(new URL('door-scene-v2.svg',concept));
 assert.equal(sha(door),'891ea0e26b5be21f4492a23375dd56ca0c7a62b6672b4996d61b9afcd6fc50b4');
 assert.equal(door.toString('utf8').replace(/\r\n/g,'\n'),doorSource);
});
test('per-instance references resolve internally, fingerprints detect drift, patch data is frozen', async () => {
 const {baselineFingerprint,renderFloorCandidate} = await import('./index.mjs');
 for (const svg of [renderRen({idPrefix:'left'}).svg,renderRen({idPrefix:'right',expression:'listening'}).svg,renderRenScene({idPrefix:'door',scene:'door'}).svg,renderRenScene({idPrefix:'couch',scene:'couch-close'}).svg,renderFloorCandidate({idPrefix:'floor'}).svg]) {
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]); assert.equal(ids.length,new Set(ids).size);
  for(const ref of svg.matchAll(/(?:href="#|url\(#)([^"\)]+)/g)) assert.ok(ids.includes(ref[1]),ref[1]);
 }
 const raw=renderScene({area:'living',idPrefix:'ren-couch-medium',framing:'wide',light:'window',duckView:'side',decorative:false,label:'baseline'}).svg;
 const changed=raw.slice(0,1000)+(raw[1000]==='X'?'Y':'X')+raw.slice(1001);
 assert.equal(changed.length,raw.length); assert.notEqual(baselineFingerprint(changed),baselineFingerprint(raw));
 assert.throws(()=>{patches['ren-couch-medium'].ops[0].value='altered'});
});
