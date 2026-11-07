import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {GameEngine} from '../../../src/core/game-engine.mjs';
import {validateSchema6WithCandidates} from '../../../src/core/life-replay.mjs';
import {renGraphNode} from '../../../src/core/life-social-dialogue.mjs';
const raw=JSON.parse(await readFile(new URL('./ren-visit-active-start-01.json',import.meta.url),'utf8')); let e=GameEngine.fromEnvelope(raw),n=0; const id=e.state.life.social46.scene.id;
function act(action){const result=e.applyFiveSlotSocialAction({operationId:`ack-validation:${++n}`,action},e.log.length);assert.equal(result.ok,true,JSON.stringify(result));}
for(let i=0;i<20;i++){const scene=e.state.life.social46.scene;const node=renGraphNode(scene.activity,scene.node,scene.seating,scene.hasUncommunicatedBreak);act({type:'social46_scene_shown',id});const choice=node.choices[0];act({type:choice.next===null?'social46_complete':'social46_scene_next',id,choice:choice.id});if(choice.next===null)break;}
assert.equal(e.state.life.social46.scene.stage,'ack'); const health=e.state.health; const ack=e.toEnvelope();assert.deepEqual(validateSchema6WithCandidates(ack,[]),[]);const completed=ack.eventLog.filter(x=>x.type==='life52_effect'&&x.payload.effect?.type==='social46_outcome'&&x.payload.effect.payload.kind==='completed').length; assert.equal(completed,1);e=GameEngine.fromEnvelope(ack);assert.equal(e.state.life.social46.scene.stage,'ack');assert.equal(e.state.health,health);act({type:'social46_dismiss',id});assert.equal(e.state.life.social46.scene,null);assert.equal(e.state.health,health);const after=e.toEnvelope();assert.deepEqual(validateSchema6WithCandidates(after,[]),[]);assert.equal(after.eventLog.filter(x=>x.type==='life52_effect'&&x.payload.effect?.type==='social46_outcome'&&x.payload.effect.payload.kind==='completed').length,completed);console.log(JSON.stringify({ackEvents:ack.eventLog.length,afterEvents:after.eventLog.length,completedOutcomes:completed,health,replay:'valid'}));


