import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GameEngine} from '../../../src/core/game-engine.mjs';
const load=async name=>GameEngine.fromEnvelope(JSON.parse(await readFile('reports/development/plan-52-five-slot-production-transition/'+name,'utf8')));
const startQuiet=(e,id)=>e.prepareFiveSlotAction({domain:'schedule',action:{type:'start',kind:'quiet',operationId:id}});

test('unrevealed pending draws alone do not force a player to reveal or buy Gems to leave a later meal slot',async()=>{
 const e=await load('checkpoint-independent/day7-morning.save.json');
 // Synthetic availability probe, not a valid exported run or gacha outcome.
 e.state.life.schedule.day=2;e.state.life.schedule.slot='morning';e.state.tenPullCommitted=true;
 e.state.pendingReveals=[{revealed:false}];e.state.owned=[];e.state.gems=0;e.state.cash=0;
 const p=startQuiet(e,'pending-reveal-free-path');assert.equal(p.ok,true,JSON.stringify(p));assert.ok(p.proposal.schedule.disclosures.includes('breakfast'));
});
