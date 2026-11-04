import assert from 'node:assert/strict';
import { resolveSeededRace as original } from '../../../src/core/race-resolver.mjs';
import { resolveSeededRace as follow } from './follow-on-adapter.mjs';
const base=i=>({seed:`follow-parity-${i}`,raceId:'R01',playerBaseSpeed:10,restFactor:1,fieldBaseSpeed:8,choice:i%2?'sprint':'steady',trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1});
const onsetOnly=process.argv[2]==='onset-only';
if(process.argv[2] && !onsetOnly) throw Error('unsupported mode');
let calls=0,contacts=0,targets=0;
for(let i=0;i<(onsetOnly?0:4);i++){const x=base(i);calls++;const a=original(x);calls++;const b=follow(x);assert.deepEqual(b,a);}
for(let i=0;i<2;i++){
 const x=base(i);const entrants=Object.fromEntries(['P','A','B','C','D','E'].map(id=>[id,{stance:id==='P'?x.choice:'steady',guard:id==='P',injuredBefore:false}]));
 calls++;const a=follow({...x,followOn:{mode:'post-race',entrants}});calls++;const b=follow({...x,followOn:{mode:'same-race',entrants}});
 const ca=a.eventRecords.filter(e=>e.type==='duck-contact'),cb=b.eventRecords.filter(e=>e.type==='duck-contact');
 assert.ok(a.eventRecords.filter(e=>e.type.startsWith('wall-')).every(e=>e.injury===undefined));
 assert.ok(b.eventRecords.filter(e=>e.type.startsWith('wall-')).every(e=>e.injury===undefined));
 const common=list=>list.map(e=>e.injury.map(({id,probability,key,value,injured,onsetTick})=>({id,probability,key,value,injured,onsetTick})));
 assert.deepEqual(common(ca),common(cb));
 for(const e of ca) for(const item of e.injury) assert.equal(item.sameRaceApplied,false);
 for(const e of cb) for(const item of e.injury) assert.equal(item.sameRaceApplied,item.injured && !entrants[item.id].injuredBefore);
 contacts+=ca.length;targets+=Object.keys(b.injuryTargets).length;
 for(const [id,w] of Object.entries(b.injuryTargets)){const event=cb.find(e=>e.injury.some(p=>p.id===id&&p.sameRaceApplied));assert.ok(event);assert.equal(w.tick,event.tick+1);assert.equal(w.afterTarget,w.beforeTarget*.95);}
}
process.stdout.write(JSON.stringify({calls,parityPairs:onsetOnly?0:4,onsetPairs:2,contacts,targets})+'\n');


