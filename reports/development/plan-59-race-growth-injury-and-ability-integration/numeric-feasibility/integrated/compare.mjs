// Predeclared per-seed report-only comparison. Each completed arm is exclusive.
import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { resolveRaceV2, DIAGNOSTIC_RULES } from '../../../../../src/core/race-kernel-v2.mjs';
import { resolveSeededRace } from '../../../../../src/core/race-resolver.mjs';
import { resolveIntegerRace } from './integer-kernel.mjs';
import { encodeResult, decodeResult } from './codec.mjs';
import { fixedInput } from './fixtures.mjs';

const [seed, directory] = process.argv.slice(2);
if (!['pair-0','pair-1','pair-2'].includes(seed) || !directory) throw new RangeError('expected predeclared seed and exclusive output directory');
const table=JSON.parse(readFileSync(new URL('../reference-v1.json',import.meta.url),'utf8'));
const arms=[['control',{}],['mixed',{mixed:true}],...(seed==='pair-2'?[]:[['half',{half:true}]]),['diagnostic',{diagnostic:true,named:true}]];
const counts=(events,key)=>Object.fromEntries([...new Set(events.map(e=>e[key]))].sort().map(k=>[k,events.filter(e=>e[key]===k).length]));
for (const [arm,options] of arms) {
  const input=fixedInput(seed,options),started=performance.now();
  const first=await encodeResult(resolveIntegerRace(input,table,{travelLimit:options.half?125000n:250000n}));
  const elapsedMs=performance.now()-started,repeat=await encodeResult(resolveIntegerRace(input,table,{travelLimit:options.half?125000n:250000n}));
  if(first!==repeat)throw new Error('same-runtime canonical repeat mismatch');
  const restored=await decodeResult(first);if(await encodeResult(restored)!==first)throw new Error('roundtrip bytes mismatch');let tamperRejected=false;
  try {await decodeResult(first.replace('integer-race-result/v1','integer-race-result/v2'));} catch {tamperRejected=true;}
  if(!tamperRejected)throw new Error('tamper was accepted');
  const nativeInput={schema:'quackpot.race-input/v2',rules:options.diagnostic?DIAGNOSTIC_RULES:'plan59-working/v1',numericPolicy:'native-float-experimental/v1',course:'plan23-oval/v1',seed,raceId:'paired',choice:'steady',entrants:input.entrants.map(e=>({...e,lane:Number(e.lane),row:Number(e.row),baseRating:Number(e.baseRating)/1e6,restFactor:Number(e.restFactor)/1e6,downFactor:Number(e.downFactor)/1e6}))};
  const native=resolveRaceV2(nativeInput,{substepScale:options.half?0.5:1});
  const record={label:'same-input reference behavior; keyed streams and numerical policies differ',seed,arm,elapsedMs,bytes:Buffer.byteLength(first),canonicalRepeat:true,restore:true,tamperRejected,integer:JSON.parse(first),native:{status:native.status,unresolved:native.unresolved,crossings:native.crossings,counts:counts(native.events,'kind'),trajectory:[native.trajectory[0],native.trajectory[Math.floor((native.trajectory.length-1)/2)],native.trajectory.at(-1)]}};
  if(options.diagnostic){const v1=resolveSeededRace({seed,raceId:'paired',playerBaseSpeed:10,fieldBaseSpeed:10,restFactor:1,choice:'steady',trialCommitted:false,trialMultiplier:1.05,experiment:'weave-rank-strong-contact',dramaArm:'R2combined-risk-only',studySprintMean:1});record.v1={status:v1.status,unresolvedReason:v1.unresolvedReason,crossings:v1.finishCrossings,counts:counts(v1.eventRecords,'type'),trajectory:[v1.trajectory[0],v1.trajectory[Math.floor((v1.trajectory.length-1)/2)],v1.trajectory.at(-1)]};}
  writeFileSync(`${directory}/${seed}-${arm}.json`,JSON.stringify(record,null,2),{flag:'wx'});
  console.log(JSON.stringify({seed,arm,status:restored.status,unresolved:restored.unresolved,crossings:restored.crossings,elapsedMs,bytes:record.bytes,canonicalRepeat:true,tamperRejected}));
}
