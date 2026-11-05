import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LIMIT, Q, TURN, cordic, isqrt, roundEven } from '../integer-math.mjs';
import { BEND, integerFrame } from '../course-probe.mjs';
import { ceilDiv, control, curveSpeed, turnCap, velocity } from './course.mjs';
import { correctPair, distance, impulsePair, wall } from './contact.mjs';
import { bouncePhase, contactInjuries, crowdEligible, ratedTop } from './abilities.mjs';
import { decodeResult, encodeResult, stableStringify, validateInput } from './codec.mjs';
import { sha256 } from './sha256.mjs';
import { fixedInput } from './fixtures.mjs';
import { advanceIntegerStep, checkpointTick, resolveIntegerRace } from './integer-kernel.mjs';
import { LENGTH } from './course.mjs';

const table=JSON.parse(readFileSync(new URL('../reference-v1.json',import.meta.url),'utf8'));
const entrant=(id,progress,lateral=0n)=>({id,progress,lateral,speed:8000000n,heading:0n,finishCorrection:0n,finished:false,airborne:false,
  wallConstrained:false,wallEpisode:false,ability:null,abilityStart:null,injured:false,stance:'steady',sampledRating:10000000n,restFactor:1000000n,downFactor:1000000n});

test('fixed math, joins, ceil microseconds and integer controller caps',()=>{
  assert.deepEqual([roundEven(5n,2n),roundEven(7n,2n),roundEven(-5n,2n),roundEven(-7n,2n)],[2n,4n,-2n,-4n]);
  assert.equal(ceilDiv(500001n,10n),50001n); assert.throws(()=>ceilDiv(1n,0n),RangeError);
  for(const n of [0n,1n,2n,3n,4n,15n,16n,LIMIT]){const r=isqrt(n);assert.ok(r*r<=n&&(r+1n)*(r+1n)>n);}
  for(const p of [0n,30000000n,30000000n+BEND,90000000n+BEND]) {const f=integerFrame(p,0n,table);assert.ok(typeof f.x==='bigint');}
  assert.equal(turnCap(8000000n),50000000n);assert.ok(curveSpeed(20000000n)>0n);
  for(const angle of [0n,TURN/4n,TURN/2n,TURN-1n]) {const c=cordic(angle,table);assert.ok(c.cos<=Q+100000000000n&&c.sin<=Q+100000000000n);}
});

test('integer contact correction and impulse preserve caller and reject unsafe depth',()=>{
  const initial=[entrant('A',0n),entrant('B',900000n)];
  const corrected=correctPair(initial,['A','B'],table,250000n,245663706n);
  assert.equal(corrected.ok,true);assert.ok(distance(...corrected.entrants,table)>=1000000n);
  assert.equal(initial[0].progress,0n);assert.equal(corrected.entrants[0].progress-corrected.entrants[0].finishCorrection,0n);
  assert.equal(correctPair([entrant('A',0n),entrant('B',500000n)],['A','B'],table,250000n,245663706n).reason,'contact-depth');
  const moving=[entrant('A',0n),{...entrant('B',1000000n),speed:0n}];
  assert.equal(impulsePair(moving,['A','B'],table).ok,true);
});

test('integer wall reflection, crowd and landing protection are participant-specific',()=>{
  for(const side of [-1n,1n]) {
    const e={...entrant('A',0n,side*6000001n),heading:side>0n?TURN/4n:3n*TURN/4n};
    const r=wall(e,table,250000n);assert.equal(r.ok,true);assert.ok(velocity(r.entrant,table).across*side<0n);
  }
  const a={...entrant('A',0n),ability:'bounce',abilityStart:0n};
  assert.equal(bouncePhase(a,12n),'landing');
  const others=[a,entrant('B',2000000n),entrant('C',3000000n)];assert.equal(crowdEligible(a,others,table),true);
  const injury=contactInjuries([a,entrant('B',1000000n)],['A','B'],0n,12n,'seed','race',false);
  assert.equal(injury.entrants[0].injured,false);
  assert.equal(injury.events.find((e)=>e.participants[0]==='A').details[0],'protected');
  assert.equal(ratedTop({...a,injured:true,restFactor:500000n}).rating,4500000n);
});

test('continuing wall confinement has no second impact and resets inside the corridor',()=>{
  for(const side of [-1n,1n]) {
    const source={...entrant('A',0n,side*6000001n),heading:side>0n?TURN/4n:3n*TURN/4n};
    const first=wall(source,table,250000n);assert.equal(first.event,'wall-impact');
    const again=wall({...first.entrant,lateral:side*6000001n,heading:source.heading},table,250000n);
    assert.equal(again.event,null);assert.ok(velocity(again.entrant,table).across*side<=0n);
    const reset=wall({...again.entrant,lateral:side*5949999n},table,250000n);
    assert.equal(reset.entrant.wallEpisode,false);
    assert.equal(wall({...reset.entrant,lateral:side*6000001n,heading:source.heading,speed:source.speed},table,250000n).event,'wall-impact');
  }
});

test('canonical envelope rejects tamper, extra fields, malformed input and size overflow',async()=>{
  const input=fixedInput('pair-0');validateInput(input);
  assert.throws(()=>validateInput({...input,extra:true}),RangeError);
  assert.throws(()=>validateInput({...input,entrants:input.entrants.map((e,i)=>i===0?{...e,baseRating:'-0'}:e)}),RangeError);
  const result={schema:'integer-race-result/v1',rules:input.rules,numericPolicy:input.numericPolicy,inputIdentity:input,status:'unresolved',clock:0n,
    entrants:input.entrants.map((e)=>({id:e.id,entryInjury:false,injured:false,progress:0n,lateral:0n,speed:0n,heading:0n,finished:false})),
    events:[],crossings:[],trajectory:[],unresolved:{reason:'fixture',time:0n,guardEvidence:null}};
  const encoded=await encodeResult(result),restored=await decodeResult(encoded);assert.equal(restored.status,'unresolved');assert.ok(Object.isFrozen(restored));
  assert.equal(await encodeResult(restored),encoded);
  await assert.rejects(decodeResult(encoded.replace('fixture','tampered')),RangeError);
  await assert.rejects(decodeResult(encoded.replace('"schema":"integer-race-envelope/v1"','"extra":1,"schema":"integer-race-envelope/v1"')),RangeError);
  await assert.rejects(decodeResult('x'.repeat(2*1024*1024+1)),RangeError);
  const modified=JSON.parse(encoded);modified.payload.entrants[1].id=modified.payload.entrants[0].id;
  modified.digest=await sha256(stableStringify(modified.payload));
  await assert.rejects(decodeResult(stableStringify(modified)),RangeError);
  assert.equal(await sha256('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('integer endpoint failure discards pending interior crossing and preserves earlier committed facts',()=>{
  const a=entrant('A',LENGTH-1n),b=entrant('B',0n),c=entrant('C',500000n),d={...entrant('D',LENGTH),finished:true};
  const priorEvent={id:'event-0',kind:'injury',time:0n,participants:['D'],details:['previous']};
  const priorCrossing={id:'D',time:0n,stepStart:-1n,stepDuration:1n,numerator:1n,denominator:1n,place:null};
  const state={time:0n,entrants:[a,b,c,d],events:[priorEvent],crossings:[priorCrossing],pairs:{},sequence:1n};
  const result=advanceIntegerStep(state,1n,table,{seed:'seed',raceId:'race',travelBound:1n,tick:1n});
  assert.equal(result.ok,false);assert.equal(result.reason,'contact-depth');
  assert.deepEqual(result.guardEvidence.pendingCrossings,['A']);
  assert.deepEqual(result.state,state);assert.deepEqual(result.state.events,[priorEvent]);assert.deepEqual(result.state.crossings,[priorCrossing]);
  const retry=advanceIntegerStep(state,1n,table,{seed:'seed',raceId:'race',travelBound:1n,tick:1n});
  assert.deepEqual(retry,result);
});

test('checkpoint phase uses the retained integer time rather than the pending tick',()=>{
  const bounced={...entrant('A',0n),ability:'bounce',abilityStart:55n};
  assert.equal(checkpointTick(3300000n),66n);assert.equal(bouncePhase(bounced,checkpointTick(3300000n)),'airborne');
  assert.equal(checkpointTick(3300001n),67n);assert.equal(bouncePhase(bounced,checkpointTick(3300001n)),'landing');
});

test('integer real crossing evidence stays inside committed microsecond step',()=>{
  const state={time:0n,entrants:[entrant('A',LENGTH-1n)],events:[],crossings:[],pairs:{},sequence:0n};
  const result=advanceIntegerStep(state,1n,table,{seed:'seed',raceId:'race',travelBound:20n,tick:1n});
  assert.equal(result.ok,true);assert.equal(result.state.crossings.length,1);
  const c=result.state.crossings[0];assert.equal(c.stepStart,0n);assert.equal(c.stepDuration,1n);
  assert.equal(c.time,1n);assert.ok(c.numerator>0n&&c.numerator<=c.denominator);
  assert.equal(result.state.entrants[0].finished,true);assert.equal(state.entrants[0].finished,false);
});

test('integer invalid input rejects before race draws',()=>{
  const input=fixedInput('pair-0');assert.throws(()=>resolveIntegerRace({...input,unknown:true},table),RangeError);
  assert.throws(()=>resolveIntegerRace({...input,numericPolicy:'unknown'},table),RangeError);
  const modified=structuredClone(table);modified.atan_turns[5]++;
  assert.throws(()=>resolveIntegerRace(input,modified),RangeError);
  const wrongUnits=structuredClone(table);wrongUnits.angle_units='degrees';
  assert.throws(()=>resolveIntegerRace(input,wrongUnits),RangeError);
});

test('rehashed finished-result contradictions are rejected without claiming replay validation',async()=>{
  const input=fixedInput('pair-0'),ids=input.entrants.map(e=>e.id);
  const result={schema:'integer-race-result/v1',rules:input.rules,numericPolicy:input.numericPolicy,inputIdentity:input,status:'finished',clock:1n,
    entrants:ids.map(id=>({id,entryInjury:false,injured:false,progress:LENGTH,lateral:0n,speed:1n,heading:0n,finished:true})),
    events:ids.map((id,i)=>({id:`event-${i}`,kind:'crossing',time:1n,participants:[id],details:['0','1','1','1']})),
    crossings:ids.map((id,i)=>({id,time:1n,stepStart:0n,stepDuration:1n,numerator:1n,denominator:1n,place:BigInt(i+1)})),
    trajectory:[{tick:0n,entrants:ids.map(id=>({id,progress:0n,lateral:0n,speed:1n,heading:0n}))}],unresolved:null};
  const encoded=await encodeResult(result);await decodeResult(encoded);
  const changes=[p=>p.entrants[0].speed='-1',p=>p.entrants[0].heading='4294967296',p=>p.entrants[0].finished=false,
    p=>p.crossings[0].time='2',p=>p.crossings.reverse(),p=>p.events[0].participants=['E1'],
    p=>p.trajectory[0].entrants[0].id='missing',p=>p.trajectory[0].entrants[1].id='E0',p=>p.trajectory[0].tick='1',
    p=>p.events.push({id:'event-6',kind:'injury',time:'1',participants:['E0'],details:['1']})];
  for(const change of changes){const envelope=JSON.parse(encoded);change(envelope.payload);envelope.digest=await sha256(stableStringify(envelope.payload));
    await assert.rejects(decodeResult(stableStringify(envelope)),RangeError);}
});

test('previously recorded mixed landing outputs satisfy stricter structural checks',async()=>{
  for(const seed of ['pair-0','pair-1']){
    const encoded=readFileSync(new URL(`./landing-${seed}-attempt-02/result.json`,import.meta.url),'utf8');
    const decoded=await decodeResult(encoded);assert.equal(decoded.status,'finished');assert.equal(await encodeResult(decoded),encoded);
  }
});

test('occupied nonclosing landing commits protected contact at the starting boundary',()=>{
  const a={...entrant('A',0n),speed:0n,ability:'bounce',abilityStart:0n};
  const b={...entrant('B',1000000n),speed:0n};
  const state={time:0n,entrants:[a,b],events:[],crossings:[],pairs:{},sequence:0n};
  const result=advanceIntegerStep(state,1n,table,{seed:'seed',raceId:'race',travelBound:1n,tick:12n});
  assert.equal(result.ok,true);assert.equal(result.state.events.filter(e=>e.kind==='contact').length,1);
  assert.equal(result.state.events[0].time,0n);assert.equal(result.state.events[0].details[1],'0');
  assert.ok(result.state.events.some(e=>e.kind==='injury-check'&&e.participants[0]==='A'&&e.details[0]==='protected'));
});

test('full event capacity rejects a crossing atomically',()=>{
  const events=Array.from({length:512},(_,i)=>({id:`event-${i}`,kind:'prior',time:0n,participants:[],details:[]}));
  const state={time:0n,entrants:[entrant('A',LENGTH-1n)],events,crossings:[],pairs:{},sequence:512n};
  const result=advanceIntegerStep(state,1n,table,{seed:'seed',raceId:'race',travelBound:20n,tick:1n});
  assert.equal(result.ok,false);assert.equal(result.reason,'event-cap');assert.deepEqual(result.state,state);
});

test('exact endpoint contact occurs before an endpoint-tied genuine crossing',()=>{
  const a={...entrant('A',LENGTH-1n),speed:1000000n};
  const b={...entrant('B',LENGTH-1n,1000001n),speed:1000000n,heading:3n*TURN/4n,ability:'bounce',abilityStart:0n};
  const state={time:0n,entrants:[a,b],events:[],crossings:[],pairs:{},sequence:0n};
  const result=advanceIntegerStep(state,1n,table,{seed:'seed',raceId:'race',travelBound:20n,tick:12n});
  assert.equal(result.ok,true);assert.deepEqual(result.state.events.filter(e=>['contact','crossing'].includes(e.kind)).map(e=>e.kind),['contact','crossing']);
  assert.equal(result.state.crossings[0].numerator,result.state.crossings[0].denominator);
});

test('reserved final event permits ability closeout with the crossing',()=>{
  const events=Array.from({length:510},(_,i)=>({id:`event-${i}`,kind:'prior',time:0n,participants:[],details:[]}));
  const a={...entrant('A',LENGTH-1n),ability:'crowd',abilityStart:0n};
  const state={time:0n,entrants:[a],events,crossings:[],pairs:{},sequence:510n};
  const result=advanceIntegerStep(state,1n,table,{seed:'seed',raceId:'race',travelBound:20n,tick:1n});
  assert.equal(result.ok,true);assert.equal(result.state.events.length,512);
  assert.deepEqual(result.state.events.slice(-2).map(e=>e.kind),['crossing','ability-end']);
});

test('direct controller accelerates within cap and wall sends both sides inward',()=>{
  const e={...entrant('A',0n),assignedLaneOffset:0n,steering:null};
  const next=control(e,13000000n,table);assert.equal(next.speed,8150000n);
  assert.ok(next.heading<TURN);assert.equal(turnCap(next.speed),49250000n);
  for(const side of [-1n,1n]){const r=wall({...e,lateral:side*6000001n,heading:side>0n?TURN/4n:3n*TURN/4n},table,250000n);
    assert.equal(r.event,'wall-impact');assert.ok(velocity(r.entrant,table).across*side<0n);}
});

test('landing-only body budget separates deep occupied pairs symmetrically, including mirrored walls and reversed IDs',()=>{
  for(const side of [-1n,1n])for(const reversed of [false,true]){
    const a=entrant(reversed?'B':'A',0n,side*6000000n),b=entrant(reversed?'A':'B',0n,side*5500000n);
    const original=[a,b],ids=[a.id,b.id],r=correctPair(original,ids,table,250000n,LENGTH,{landing:true});
    assert.equal(r.ok,true);assert.ok(distance(...r.entrants,table)>=1000000n);
    assert.ok(r.entrants.every(e=>e.lateral<=6000000n&&e.lateral>=-6000000n));
    assert.ok(r.displacements.every(d=>d<=1001000n));assert.equal(r.correctionBudget,1001000n);
    assert.ok(r.entrants.every((e,i)=>e.progress-e.finishCorrection===original[i].progress));
    assert.equal(correctPair(original,ids,table,250000n,LENGTH).reason,'contact-depth');
  }
  assert.equal(correctPair([entrant('A',0n),entrant('B',0n)],['A','B'],table,250000n,LENGTH,{landing:true}).reason,'contact-depth');
});

test('landing correction refuses third-party overlap and finish credit',()=>{
  const a=entrant('A',0n),b=entrant('B',500000n),c=entrant('C',1400000n);
  assert.equal(correctPair([a,b,c],['A','B'],table,250000n,LENGTH,{landing:true}).reason,'correction-third-party');
  const near=[entrant('A',LENGTH-1000n),entrant('B',LENGTH-501000n)];
  assert.equal(correctPair(near,['A','B'],table,250000n,LENGTH,{landing:true}).reason,'correction-finish');
});

test('fresh occupied landing commits one protected episode; event failure rolls it back',()=>{
  const a={...entrant('A',0n),speed:0n,ability:'bounce',abilityStart:0n},b={...entrant('B',500000n),speed:0n};
  const state={time:0n,entrants:[a,b],events:[],crossings:[],pairs:{},sequence:0n};
  const options={seed:'seed',raceId:'race',travelBound:1n,tick:12n,freshLanding:['A']};
  const result=advanceIntegerStep(state,1n,table,options);
  assert.equal(result.ok,true);assert.equal(result.state.events.filter(e=>e.kind==='contact').length,1);
  assert.equal(result.state.events.filter(e=>e.kind==='landing-correction').length,1);
  assert.equal(result.state.events.find(e=>e.kind==='injury-check'&&e.participants[0]==='A').details[0],'protected');
  assert.equal(result.state.events.find(e=>e.kind==='contact').details[1],'0');
  assert.equal(advanceIntegerStep(state,1n,table,{...options,freshLanding:[]}).reason,'contact-depth');
  const crowded={...state,events:Array.from({length:510},(_,i)=>({id:`event-${i}`,kind:'prior',time:0n,participants:[],details:[]})),sequence:510n};
  const failed=advanceIntegerStep(crowded,1n,table,options);
  assert.equal(failed.ok,false);assert.equal(failed.reason,'event-cap');assert.deepEqual(failed.state,crowded);
});

test('landing boundary recomputes a positive bounded microstep after speed changes',()=>{
  const a={...entrant('A',0n),ability:'bounce',abilityStart:0n};
  const state={time:0n,entrants:[a],events:[],crossings:[],pairs:{},sequence:0n};
  const result=advanceIntegerStep(state,10n,table,{seed:'seed',raceId:'race',travelBound:20n,tick:12n,freshLanding:['A']});
  assert.equal(result.ok,true);assert.equal(result.duration,1n);assert.equal(result.state.time,1n);
  assert.equal(result.state.entrants[0].progress,8n);assert.equal(state.time,0n);
});
