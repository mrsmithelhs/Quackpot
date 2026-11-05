import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveIntegerRace, encodeResult, decodeResult, getReferenceTable } from './index.mjs';
import { fixedInput } from './fixtures.mjs';

const evidence=new URL('../../../reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/results-01/node/',import.meta.url);
for(const [seed,arm] of [['pair-0','control'],['pair-0','mixed'],['pair-0','half'],['pair-1','diagnostic']]) {
  test(`promoted ${seed}/${arm} matches frozen canonical bytes`,async()=>{
    const record=JSON.parse(readFileSync(new URL(`${seed}-${arm}.json`,evidence),'utf8'));
    assert.equal(record.id,`${seed}/${arm}`);
    const input=fixedInput(seed,{mixed:arm==='mixed',diagnostic:arm==='diagnostic',named:arm==='diagnostic'});
    const actual=await encodeResult(resolveIntegerRace(input,getReferenceTable(),{travelLimit:arm==='half'?125000n:250000n}));
    assert.deepEqual(Buffer.from(actual,'utf8'),Buffer.from(record.envelope,'utf8'));
    assert.equal(await encodeResult(await decodeResult(actual)),actual);
  });
}

test('reference accessor supplies independent copies without mutating the pinned policy',()=>{
  const first=getReferenceTable(),second=getReferenceTable();first.atan_turns[0]++;
  assert.notEqual(first.atan_turns[0],second.atan_turns[0]);
  assert.throws(()=>resolveIntegerRace(fixedInput('pair-0'),first),RangeError);
});
