import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { distinctMotionAt } from '../gallery/distinct-motion.mjs';
import { fixtures, stateAt } from '../gallery/fixtures.mjs';

test('motion families differ and remain inside a shared full-motion cue box',()=>{
  for(const kind of ['pop','tear','fragments'])for(let i=0;i<85;i++)for(const piece of distinctMotionAt(kind,i/100)){
    assert.ok(Math.abs(piece.x)+piece.width*piece.scaleX/2<=.500001, `${kind} x extent`);
    assert.ok(Math.abs(piece.y)+piece.width*piece.scaleY/2<=.500001, `${kind} y extent`);
    assert.ok(piece.opacity>=0&&piece.opacity<=1);
  }
  assert.equal(distinctMotionAt('pop',.84).length,0);
  assert.ok(distinctMotionAt('tear',.1)[0].x<0&&distinctMotionAt('tear',.5)[0].x>0);
  assert.equal(distinctMotionAt('fragments',.3).length,4);
  assert.deepEqual(distinctMotionAt('fragments',.1,true),distinctMotionAt('fragments',.7,true));
  assert.deepEqual(distinctMotionAt('pop',-.01),[]);assert.deepEqual(distinctMotionAt('tear',.85),[]);
});
test('collision motion does not create injury and seek reconstructs independently',()=>{
  assert.equal(stateAt(fixtures.neither.events,1.2).injured.size,0);
  assert.equal(stateAt(fixtures.first.events,1.2).injured.has('A'),true);
  assert.equal(stateAt(fixtures.first.events,.8).injured.size,0);
  assert.equal(stateAt(fixtures.repeated.events,1.8).contacts.length,2);
});
test('derived SVGs change only the common family viewport and match manifest',async()=>{
  const base='reports/development/plan-57-race-collision-and-injury-visual-study/art/',sha=text=>createHash('sha256').update(text).digest('hex');
  const manifest=JSON.parse(await readFile(base+'distinct-motion-normalized/manifest.json','utf8'));
  for(const [family,names] of Object.entries({pop:['pop'],tear:['tear'],fragments:['chip1','chip2','chip3','chip4']}))for(const name of names){
    const raw=await readFile(`${base}distinct-motion-original/${name}.svg`,'utf8'),derived=await readFile(`${base}distinct-motion-normalized/${name}.svg`,'utf8'),entry=manifest.families[family];
    assert.equal(derived,raw.replace(/viewBox=(['"])0 0 256 256\1/,`viewBox='${entry.viewBox}'`));
    assert.equal(sha(raw),entry.components[name].original);assert.equal(sha(derived),entry.components[name].derived);
  }
});
test('Codex-authored pop is a distinct local vector, not a rewritten model original',async()=>{
  const base='reports/development/plan-57-race-collision-and-injury-visual-study/art/';
  const original=await readFile(base+'distinct-motion-original/pop.svg','utf8'),candidate=await readFile(base+'distinct-motion-codex/pop.svg','utf8');
  assert.notEqual(candidate,original);assert.match(candidate,/viewBox="13 9 225 225"/);
  assert.doesNotMatch(candidate,/<script|\bon\w+\s*=|\bhref\s*=|url\s*\(/i);
});
