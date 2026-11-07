import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPilot,dispatch} from './plan-67-actions.mjs';
import {run} from './plan-67-routes.mjs';
test('retention choices require exposed modal and early exit is terminal',()=>{
 const c=createPilot('plan67-pilot-001'); assert.equal(c.engine.state.step,'life_breakfast'); assert.equal(dispatch(c,'leave').reason,'not_exposed_by_pilot');
 assert.equal(dispatch(c,'uninstall').ok,true); assert.equal(dispatch(c,'leave').ok,true);assert.equal(c.engine.state.terminalRoute,'uninstall');
});
test('default requires due options and routes repeat and resume',()=>{
 const c=createPilot('plan67-pilot-001');const r=c.engine.prepareFiveSlotAction({domain:'finance',action:{type:'leave_unpaid',billId:'rent-1',id:'illegal',confirmed:true,optionsDisclosed:true}});assert.equal(r.reason,'default_evidence_required');
 for(const mode of ['exit','default','solvent']) {const a=run('plan67-pilot-001',mode), b=run('plan67-pilot-001',mode,120,true);assert.deepEqual(a.rows,b.rows);const x=a.envelope,y=b.envelope;delete x.savedAt;delete y.savedAt;assert.deepEqual(x,y);}
});

test('clean checkpoint validates, round trips and rejects altered state or RNG', async()=>{
 const {GameEngine}=await import('../../src/core/game-engine.mjs');
 const {validateSave}=await import('../../src/core/storage.mjs');
 const opts={experimentalFiveSlot:true,requireFiveSlotTutorial:true};
 const e=new GameEngine('plan67-pilot-001',{lifePolicy:'five-slot-v1',tutorialShift:true});e.start();
 const a=e.toEnvelope(),b=GameEngine.fromEnvelope(a).toEnvelope();assert.equal(validateSave(a,opts).valid,true);
 const comparable=structuredClone(a);delete comparable.savedAt;delete b.savedAt;assert.deepEqual(comparable,b);
 const badCash=structuredClone(a);badCash.state.cash++;
 const badRng=structuredClone(a);badRng.prngStreams.draw='invalid';
 const badHistory=structuredClone(a);badHistory.eventLog[0].payload.seed='altered';
 for(const [value,expected] of [[badCash,/cash/i],[badRng,/PRNG|RNG/i],[badHistory,/verifyChain/i]]) {const result=validateSave(value,opts);assert.equal(result.valid,false);assert.match(result.errors.join(' '),expected);}
});


