import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base='reports/development/plan-57-race-collision-and-injury-visual-study/art/';
const sha=text=>createHash('sha256').update(text).digest('hex');
test('all four frames share family viewport and preserve original SVG geometry',async()=>{
  const manifest=JSON.parse(await readFile(base+'burst-normalized/manifest.json','utf8'));
  const expected={A:'18 25 138 138',B:'8 120 142 142',C:'86 0 158 158'};
  for(const [family,viewBox] of Object.entries(expected)){
    assert.equal(manifest.families[family].viewBox,viewBox);
    for(const frame of ['onset','expansion','breakup','settle']){
      const name=`${family}-${frame}.svg`,raw=await readFile(base+'burst-continuation/'+name,'utf8'),derived=await readFile(base+'burst-normalized/'+name,'utf8');
      assert.equal(derived,raw.replace('viewBox="0 0 256 256"',`viewBox="${viewBox}"`));
      assert.equal(sha(raw),manifest.families[family].frames[name].original);
      assert.equal(sha(derived),manifest.families[family].frames[name].derived);
    }
  }
});
