// Isolated sequencing witness only; this is not the mounted scheduler or save schema.
import test from 'node:test';
import assert from 'node:assert/strict';

function prepare(before,entryDay){
  const elapsed=entryDay-before.day;if(!Number.isInteger(elapsed)||elapsed<0)throw new RangeError('invalid admission');
  const recoveryBefore=structuredClone(before.recovery);
  const entryRecovery=Object.fromEntries(Object.entries(recoveryBefore).map(([id,days])=>[id,Math.max(0,days-elapsed)]));
  return {schema:'day-order-study/v1',dayBefore:before.day,entryDay,elapsed,recoveryBefore,entryRecovery};
}
function commit(before,draft,{newInjuries=[],extensions=[]}){
  const recovery=structuredClone(draft.entryRecovery);
  for(const id of newInjuries)if(!recovery[id])recovery[id]=2;
  for(const id of extensions){if(!(draft.entryRecovery[id]>0))throw new RangeError('extension requires injured entry');recovery[id]++;}
  return {day:draft.entryDay,recovery,evidence:draft};
}
test('cross-day recovery precedes frozen entry; new injury is not immediately decremented',()=>{
  const before={day:1,recovery:{A:1,B:2,C:0}},draft=prepare(before,2);
  assert.deepEqual(draft.entryRecovery,{A:0,B:1,C:0});
  const after=commit(before,draft,{newInjuries:['C'],extensions:['B']});
  assert.deepEqual(after.recovery,{A:0,B:2,C:2});assert.deepEqual(before,{day:1,recovery:{A:1,B:2,C:0}});
  assert.deepEqual(JSON.parse(JSON.stringify(after.evidence)),draft);
  assert.throws(()=>commit(before,draft,{extensions:['C']}),RangeError);
});
test('cancellation publishes no draft and elapsed recovery applies once per day',()=>{
  const before={day:4,recovery:{A:2,B:1}},draft=prepare(before,6);
  assert.deepEqual(draft.entryRecovery,{A:0,B:0});assert.deepEqual(before,{day:4,recovery:{A:2,B:1}});
  assert.deepEqual(prepare(before,4).entryRecovery,before.recovery);assert.throws(()=>prepare(before,3),RangeError);
});
