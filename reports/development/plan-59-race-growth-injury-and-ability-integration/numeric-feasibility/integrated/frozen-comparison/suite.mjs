// The same eleven inputs and negative cases are executed in both runtimes.
import { resolveIntegerRace } from '../integer-kernel.mjs';
import { fixedInput } from '../fixtures.mjs';
import { encodeResult, decodeResult, stableStringify } from '../codec.mjs';
import { sha256 } from '../sha256.mjs';
export const cases=Object.freeze(['pair-0/control','pair-0/mixed','pair-0/half','pair-0/diagnostic',
  'pair-1/control','pair-1/mixed','pair-1/half','pair-1/diagnostic','pair-2/control','pair-2/mixed','pair-2/diagnostic']);
export async function runCase(id,table) {
  if(!cases.includes(id))throw new RangeError('unlisted case');
  const [seed,arm]=id.split('/'),input=fixedInput(seed,{mixed:arm==='mixed',diagnostic:arm==='diagnostic',named:arm==='diagnostic'});
  const envelope=await encodeResult(resolveIntegerRace(input,table,{travelLimit:arm==='half'?125000n:250000n}));
  const decoded=await decodeResult(envelope);if(await encodeResult(decoded)!==envelope)throw Error('roundtrip mismatch');
  const rejected=[];
  async function negative(name,text){try{await decodeResult(text);rejected.push({name,outcome:'accepted'});}catch(e){rejected.push({name,outcome:e.name});}}
  const corrupt=JSON.parse(envelope);corrupt.digest=(corrupt.digest[0]==='0'?'1':'0')+corrupt.digest.slice(1);
  await negative('digest-corruption',stableStringify(corrupt));
  const changed=JSON.parse(envelope);changed.payload.entrants[1].id=changed.payload.entrants[0].id;
  changed.digest=await sha256(stableStringify(changed.payload));
  await negative('rehashed-duplicate-id',stableStringify(changed));
  const extra=JSON.parse(envelope);extra.payload.unexpected=true;extra.digest=await sha256(stableStringify(extra.payload));
  await negative('rehashed-unknown-field',stableStringify(extra));
  const speed=JSON.parse(envelope);speed.payload.entrants[0].speed='-1';speed.digest=await sha256(stableStringify(speed.payload));
  await negative('rehashed-negative-speed',stableStringify(speed));
  const flags=JSON.parse(envelope);flags.payload.entrants[0].finished=!flags.payload.entrants[0].finished;flags.digest=await sha256(stableStringify(flags.payload));
  await negative('rehashed-finish-flag',stableStringify(flags));
  const altered=structuredClone(table);altered.atan_turns[5]++;
  try{resolveIntegerRace(input,altered);rejected.push({name:'altered-reference-table',outcome:'accepted'});}catch(e){rejected.push({name:'altered-reference-table',outcome:e.name});}
  if(rejected.some(e=>e.outcome!=='RangeError'))throw Error('negative validation failed');
  return {id,envelope,negative:rejected};
}
