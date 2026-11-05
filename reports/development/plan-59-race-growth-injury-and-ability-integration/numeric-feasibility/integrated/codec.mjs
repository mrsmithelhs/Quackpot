import { sha256 } from './sha256.mjs';
import { createRng } from '../../../../../src/core/prng.mjs';
import { checked, parseCanonicalInteger } from '../integer-math.mjs';

const encoder = new TextEncoder();
export const MAX_BYTES = 2 * 1024 * 1024;
const safe = (s) => typeof s === 'string' && s.length > 0 && encoder.encode(s).length <= 64
  && !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(s);
export function key(parts) {
  if (!Array.isArray(parts) || parts.length < 1 || parts.length > 16) throw new RangeError('invalid key');
  return parts.map((s) => { if (!safe(s)) throw new RangeError('invalid key component'); const b=encoder.encode(s);
    return `${b.length}:${Array.from(b,(x)=>x.toString(16).padStart(2,'0')).join('')}`; }).join('');
}
export function draw(seed,raceId,domain,parts) {
  const identity=key(['integer-race/v1',seed,raceId,domain,...parts]);
  return {key:identity,value:BigInt(createRng(identity).next()*4294967296)};
}
export function canonical(value) {
  if (typeof value === 'bigint') return checked(value).toString();
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k)=>[k,canonical(value[k])]));
  throw new RangeError('invalid canonical value');
}
export const stableStringify = (value) => JSON.stringify(canonical(value));
const exact = (o,keys) => o && typeof o==='object' && !Array.isArray(o)
  && Object.keys(o).sort().join(',') === [...keys].sort().join(',');
const deepFreeze = (v) => { if(v && typeof v==='object' && !Object.isFrozen(v)) { for(const x of Object.values(v)) deepFreeze(x); Object.freeze(v); } return v; };

/** Strict immutable entry snapshot, checked before any random draw. */
export function validateInput(input) {
  if(!exact(input,['schema','rules','numericPolicy','course','seed','raceId','choice','entrants'])
    || input.schema!=='integer-race-input/v1' || !['integer-working/v1','integer-diagnostic-no-injury/v1'].includes(input.rules)
    || input.numericPolicy!=='integer-q62-micros/v1' || input.course!=='integer-oval/v1'
    || !safe(input.seed)||!safe(input.raceId)||!['steady','sprint'].includes(input.choice)
    || !Array.isArray(input.entrants)||input.entrants.length!==6) throw new RangeError('invalid input');
  const ids=new Set(),slots=new Set();let players=0;
  for(const e of input.entrants) {
    if(!exact(e,['id','player','lane','row','baseRating','restFactor','downFactor','entryInjury','ability','stance'])
      || typeof e.id!=='string'||!/^[A-Za-z0-9_-]{1,32}$/.test(e.id)||ids.has(e.id)
      || typeof e.player!=='boolean'||typeof e.entryInjury!=='boolean'||![null,'bounce','crowd'].includes(e.ability)
      || !['steady','sprint'].includes(e.stance)||(e.player&&e.stance!==input.choice)
      || (input.rules==='integer-diagnostic-no-injury/v1'&&(e.entryInjury||e.ability!==null))) throw new RangeError('invalid entrant');
    const lane=parseCanonicalInteger(e.lane),row=parseCanonicalInteger(e.row),rating=parseCanonicalInteger(e.baseRating);
    const rest=parseCanonicalInteger(e.restFactor),down=parseCanonicalInteger(e.downFactor),slot=`${lane}:${row}`;
    if(![1n,2n].includes(lane)||![0n,1n,2n].includes(row)||slots.has(slot)||rating<=0n||rating>100000000n
      || ![500000n,750000n,1000000n].includes(rest)||![1000000n,1050000n].includes(down)) throw new RangeError('invalid entrant bounds');
    ids.add(e.id);slots.add(slot);players+=Number(e.player);
  }
  if(players!==1)throw new RangeError('one player required');
  return deepFreeze(structuredClone(input));
}

export async function encodeResult(result) {
  const payload=canonical(result), text=stableStringify(payload);
  const envelope=stableStringify({schema:'integer-race-envelope/v1',payload,digest:await sha256(text)});
  if (encoder.encode(envelope).length > MAX_BYTES) throw new RangeError('envelope size');
  return envelope;
}
export async function decodeResult(text) {
  if(typeof text!=='string' || encoder.encode(text).length>MAX_BYTES) throw new RangeError('envelope size');
  let env; try { env=JSON.parse(text); } catch { throw new RangeError('invalid JSON'); }
  if (!exact(env,['schema','payload','digest']) || env.schema!=='integer-race-envelope/v1' || !/^[a-f0-9]{64}$/.test(env.digest)
      || !exact(env.payload,['schema','rules','numericPolicy','inputIdentity','status','clock','entrants','events','crossings','trajectory','unresolved'])
      || env.payload.schema!=='integer-race-result/v1' || !['finished','unresolved'].includes(env.payload.status)
      || !Array.isArray(env.payload.entrants) || env.payload.entrants.length!==6 || !Array.isArray(env.payload.events) || env.payload.events.length>512
      || !Array.isArray(env.payload.crossings) || env.payload.crossings.length>6 || !Array.isArray(env.payload.trajectory) || env.payload.trajectory.length>801)
    throw new RangeError('invalid result envelope');
  validateInput(env.payload.inputIdentity);
  const clock=parseCanonicalInteger(env.payload.clock);
  if(clock<0n||clock>40000000n||env.payload.rules!==env.payload.inputIdentity.rules||env.payload.numericPolicy!==env.payload.inputIdentity.numericPolicy)
    throw new RangeError('invalid result identity');
  if(env.payload.status==='finished' ? env.payload.unresolved!==null
    : !exact(env.payload.unresolved,['reason','time','guardEvidence']) || !safe(env.payload.unresolved.reason)
      || parseCanonicalInteger(env.payload.unresolved.time)!==clock
      || (env.payload.unresolved.guardEvidence!==null && (!['pendingCrossings','contactDepth,pendingCrossings'].includes(Object.keys(env.payload.unresolved.guardEvidence).sort().join(','))
        || !Array.isArray(env.payload.unresolved.guardEvidence.pendingCrossings) || !env.payload.unresolved.guardEvidence.pendingCrossings.every(safe))))
    throw new RangeError('invalid unresolved evidence');
  const depth=env.payload.unresolved?.guardEvidence?.contactDepth;
  if(depth) {
    const snap=(e)=>exact(e,['id','progress','lateral','speed','heading','airborne','ability','phase','abilityStart','opportunity'])
      &&safe(e.id)&&typeof e.airborne==='boolean'&&[null,'bounce','crowd'].includes(e.ability)&&['idle','rising','airborne','landing'].includes(e.phase)
      &&['progress','lateral','speed','heading','opportunity'].every(k=>{parseCanonicalInteger(e[k]);return true;})
      &&(e.abilityStart===null||typeof parseCanonicalInteger(e.abilityStart)==='bigint');
    if(!exact(depth,['participants','separation','penetration','travelBound','margin','atContact','stage','stepStart','dt','tick','pre','retained'])
      || !Array.isArray(depth.participants)||depth.participants.length!==2||!depth.participants.every(safe)
      || !['step-start','endpoint'].includes(depth.stage)||!exact(depth.retained,['time','entrants'])
      || ![depth.atContact,depth.pre,depth.retained.entrants].every(a=>Array.isArray(a)&&a.length===2&&a.every(snap)))throw new RangeError('invalid contact guard evidence');
    for(const k of ['separation','penetration','travelBound','margin','stepStart','dt','tick'])parseCanonicalInteger(depth[k]);
    parseCanonicalInteger(depth.retained.time);
  }
  const ids=new Set(env.payload.inputIdentity.entrants.map((e)=>e.id)), outputIds=new Set();
  const position=(e)=>{const p=parseCanonicalInteger(e.progress),l=parseCanonicalInteger(e.lateral),s=parseCanonicalInteger(e.speed),h=parseCanonicalInteger(e.heading);
    return p>=-32000000n&&p<=512000000n&&l>=-6000000n&&l<=6000000n&&s>=0n&&s<=1000000000n&&h>=0n&&h<4294967296n;};
  for(const e of env.payload.entrants) {
    if(!exact(e,['id','entryInjury','injured','progress','lateral','speed','heading','finished']) || !safe(e.id)
       || typeof e.entryInjury!=='boolean' || typeof e.injured!=='boolean' || typeof e.finished!=='boolean') throw new RangeError('invalid entrant result');
    if(!ids.has(e.id)||outputIds.has(e.id))throw new RangeError('entrant identity mismatch');outputIds.add(e.id);
    const original=env.payload.inputIdentity.entrants.find(x=>x.id===e.id);
    if(!position(e)||e.entryInjury!==original.entryInjury||(e.entryInjury&&!e.injured))throw new RangeError('invalid entrant state');
  }
  const eventIds=new Set(),injuryChecks=new Set(),injuredEvents=new Set();let lastTime=0n;
  const events=env.payload.events;
  for(const [i,e] of events.entries()) {
    if(!exact(e,['id','kind','time','participants','details']) || !safe(e.id) || !safe(e.kind)
      || !Array.isArray(e.participants) || e.participants.length>2 || !e.participants.every(safe)
      || !Array.isArray(e.details) || e.details.length>16 || !e.details.every(safe)) throw new RangeError('invalid event');
    const time=parseCanonicalInteger(e.time);
    if(eventIds.has(e.id)||time<lastTime||time>clock||!e.participants.every((id)=>ids.has(id)))throw new RangeError('invalid event order or identity');
    eventIds.add(e.id);lastTime=time;
    if(e.kind==='injury-check'){
      if(e.participants.length!==1)throw new RangeError('invalid injury check');
      const contact=events.slice(0,i).reverse().find(x=>x.kind==='contact'&&x.time===e.time&&x.participants.includes(e.participants[0]));
      if(!contact||contact.participants.length!==2||contact.participants[0]===contact.participants[1])throw new RangeError('orphan injury check');
      const reference=JSON.stringify([contact.id,e.participants[0]]);if(injuryChecks.has(reference))throw new RangeError('duplicate injury check');injuryChecks.add(reference);
    }
    if(e.kind==='injury'){
      if(e.participants.length!==1||!env.payload.entrants.find(x=>x.id===e.participants[0])?.injured)throw new RangeError('invalid injury event');
      const prior=events[i-1];if(!prior||prior.kind!=='injury-check'||prior.time!==e.time||prior.participants[0]!==e.participants[0]
        ||!['5','10'].includes(prior.details[0])||injuredEvents.has(e.participants[0]))throw new RangeError('orphan injury event');
      injuredEvents.add(e.participants[0]);
    }
  }
  const crossed=new Set();let previousCrossing=null;
  for(const [index,e] of env.payload.crossings.entries()) {
    if(!exact(e,['id','time','stepStart','stepDuration','numerator','denominator','place']) || !safe(e.id)) throw new RangeError('invalid crossing');
    for(const k of ['time','stepStart','stepDuration','numerator','denominator']) parseCanonicalInteger(e[k]);
    const time=parseCanonicalInteger(e.time),start=parseCanonicalInteger(e.stepStart),duration=parseCanonicalInteger(e.stepDuration);
    const numerator=parseCanonicalInteger(e.numerator),denominator=parseCanonicalInteger(e.denominator);
    if(!ids.has(e.id)||crossed.has(e.id)||start<0n||time>clock||duration<=0n||start+duration!==time||numerator<=0n||denominator<numerator
      || (env.payload.status==='finished'?e.place!==String(index+1):e.place!==null))throw new RangeError('invalid crossing evidence');
    const instant=start*denominator+duration*numerator;
    if(previousCrossing){const left=instant*previousCrossing.denominator,right=previousCrossing.instant*denominator;
      if(left<right||(left===right&&e.id<previousCrossing.id))throw new RangeError('crossing order');}
    previousCrossing={instant,denominator,id:e.id};
    const matches=events.filter(x=>x.kind==='crossing'&&x.participants.length===1&&x.participants[0]===e.id);
    if(matches.length!==1||matches[0].time!==e.time||JSON.stringify(matches[0].details)!==JSON.stringify([e.stepStart,e.stepDuration,e.numerator,e.denominator]))throw new RangeError('crossing event mismatch');
    crossed.add(e.id);
  }
  if(env.payload.status==='finished'&&crossed.size!==6)throw new RangeError('incomplete finish');
  if(events.filter(e=>e.kind==='crossing').length!==crossed.size||env.payload.entrants.some(e=>e.finished!==crossed.has(e.id)))throw new RangeError('finish flags mismatch');
  let previousTick=-1n;
  for(const sample of env.payload.trajectory) {
    if(!exact(sample,['tick','entrants']) || !Array.isArray(sample.entrants) || sample.entrants.length!==6) throw new RangeError('invalid trajectory');
    const tick=parseCanonicalInteger(sample.tick);if(tick<0n||tick>800n||tick<=previousTick||tick*50000n>clock)throw new RangeError('invalid sample time');previousTick=tick;
    const sampleIds=new Set();for(const e of sample.entrants) { if(!exact(e,['id','progress','lateral','speed','heading']) || !ids.has(e.id)||sampleIds.has(e.id)||!position(e)) throw new RangeError('invalid sample');sampleIds.add(e.id); }
  }
  if (await sha256(stableStringify(env.payload))!==env.digest || stableStringify(env)!==text) throw new RangeError('digest or canonical mismatch');
  return deepFreeze(env.payload);
}
export { deepFreeze, exact, safe };
