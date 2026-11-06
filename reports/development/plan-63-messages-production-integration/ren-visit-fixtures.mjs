// Synthetic current-policy visit fixtures built from the verified engine-generated offer.
import {readFile,writeFile} from 'node:fs/promises';
import {GameEngine} from '../../../src/core/game-engine.mjs';
import {validateSchema6WithCandidates} from '../../../src/core/life-replay.mjs';
import {lifeSurface} from '../../../src/ui/life/life-routing.mjs';
const base='reports/development/plan-63-messages-production-integration/';process.chdir('C:/AI/Quackpot');
const raw=JSON.parse(await readFile(base+'ren-v2-owner-start-02.json','utf8'));if(validateSchema6WithCandidates(raw,[]).length)throw Error('source history invalid');const e=GameEngine.fromEnvelope(raw);let n=0;
const s=action=>{const r=e.applyFiveSlotSocialAction({operationId:`visit-check:${++n}`,action},e.log.length);if(!r.ok)throw Error(JSON.stringify({action,result:r}));};
const id=e.state.life.social46.pending.id;s({type:'social46_offer_shown',id});if(!e.readMessage(e.log.entries.find(x=>x.type==='message_delivered'&&x.payload.kind==='ren').payload.id,1))throw Error('Ren read');s({type:'social46_reply',id,choice:'accept'});s({type:'social46_visit_knock_shown',id});s({type:'social46_visit_open',id});s({type:'social46_visit_arrival_shown',id,lookVersion:1});e.state.step=lifeSurface(e);
async function save(name){const env=e.toEnvelope(),errors=validateSchema6WithCandidates(env,[]);if(errors.length)throw Error(JSON.stringify(errors));await writeFile(base+name,JSON.stringify(env,null,2)+'\n',{flag:'wx'});return {name,events:env.eventLog.length,slot:e.state.life.schedule.slot,step:e.state.step};}
const results=[await save('ren-visit-arrival-start-01.json')];s({type:'social46_begin',id,dialogueVersion:1,arrivalVersion:1});e.state.step=lifeSurface(e);results.push(await save('ren-visit-active-start-01.json'));console.log(JSON.stringify(results));
