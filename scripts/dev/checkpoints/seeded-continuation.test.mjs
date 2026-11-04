import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validateSeededContinuation,validateSeededDrawArithmetic,validateContinuationDispatch} from './seeded-continuation.mjs';
const base='reports/development/plan-52-five-slot-production-transition/meal-flow-browser-attempt3/';
const load=x=>JSON.parse(readFileSync(base+x,'utf8'));
const before=load('day2-before-play.save.json'),after=load('day2-play-started.save.json');
const args=()=>({id:'plan52.independent-day.v1',policy:'seeded-gameplay-v1',recipe:'reports/development/plan-52-five-slot-production-transition/meal-checkpoint-refresh.mjs',parent:structuredClone(before),child:structuredClone(before),continued:structuredClone(after)});
test('real draw-started capture matches arithmetic oracle but is not a completed session',()=>{assert.deepEqual(validateSeededDrawArithmetic(args()),[]);assert.ok(validateSeededContinuation(args()).includes('session completion boundary missing'));});
test('seeded continuation rejects invalid identity, version, prefixes, RNG and draw outcomes',()=>{
 for(const mutate of [x=>x.id='plan52.fresh-tutorial.v1',x=>x.policy='seeded-gameplay-v2',x=>x.recipe='other',x=>x.child.prngStreams.draw='bad',x=>x.continued.prngStreams.draw='bad',x=>x.continued.eventLog.splice(x.continued.eventLog.findIndex(e=>e.type==='draw_committed'),1),x=>x.continued.eventLog.push(structuredClone(x.continued.eventLog.find(e=>e.type==='draw_committed'))),x=>x.continued.eventLog.find(e=>e.type==='draw_committed').payload.identity='forged',x=>x.continued.eventLog[0].payload.seed='forged']){const x=args();mutate(x);assert.notDeepEqual(validateSeededDrawArithmetic(x),[]);}
});


test('fixture dispatch cannot bypass seeded replay by deleting or forging policy metadata',()=>{
 const recipe='reports/development/plan-52-five-slot-production-transition/meal-checkpoint-refresh.mjs';
 const valid={id:'plan52.independent-day.v1',recipe,policy:'seeded-gameplay-v1',result:{continuationPolicy:'seeded-gameplay-v1',unchangedRng:false}};
 assert.equal(validateContinuationDispatch(valid),true);
 for(const mutate of [x=>delete x.policy,x=>x.policy='unknown',x=>x.result.unchangedRng=true,x=>delete x.result.continuationPolicy,x=>x.id='plan52.fresh-tutorial.v1',x=>x.recipe='historical.mjs']){const x=structuredClone(valid);mutate(x);assert.equal(validateContinuationDispatch(x),false);}
 assert.equal(validateContinuationDispatch({id:'plan52.fresh-tutorial.v1',recipe,policy:undefined,result:{unchangedRng:true}}),true);
 assert.equal(validateContinuationDispatch({id:'plan52.independent-day.v1',recipe:'historical.mjs',policy:undefined,result:{unchangedRng:true}}),true);
 assert.equal(validateContinuationDispatch({id:'plan52.independent-day.v1',recipe,policy:undefined,result:{unchangedRng:true}}),false);
});
