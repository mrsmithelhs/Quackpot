import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validateSeededContinuation,validateContinuationDispatch} from './seeded-continuation.mjs';
const base='reports/development/plan-52-five-slot-production-transition/', recipe=base+'meal-checkpoint-refresh.mjs';
for(const [chunk,name] of [['first','independent-day'],['second','rent-paid-zero']]){
 test(`${name}: genuine completed UI continuation passes oracle and rejects dispatch bypass`,()=>{
  const trace=JSON.parse(readFileSync(`${base}meal-checkpoint-refresh-v2-${chunk}/trace.json`,'utf8')),result=trace.results.find(x=>x.name===name),id=`plan52.${name}.v1`;
  const read=p=>JSON.parse(readFileSync(p,'utf8'));const args={id,recipe,policy:'seeded-gameplay-v1',parent:read(result.parent),child:read(result.fixture),continued:read(result.continued)};
  assert.equal(validateContinuationDispatch({id,recipe,policy:args.policy,result}),true);assert.deepEqual(validateSeededContinuation(args),[]);
  for(const bad of [{policy:undefined,result},{policy:'seeded-gameplay-v1',result:{...result,unchangedRng:true}},{policy:'unknown-v2',result}])assert.equal(validateContinuationDispatch({id,recipe,...bad}),false);
 });
}
