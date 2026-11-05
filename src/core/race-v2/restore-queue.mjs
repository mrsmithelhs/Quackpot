// Serial, cancelable semantic reconstruction. Does not publish a game state.
import { createRaceWorkerClient } from './worker-client.mjs';
import { stableStringify } from './codec.mjs';
import { MAX_COMPACT_BYTES } from './persistence.mjs';

export const MAX_SCHEMA6_BYTES=2*1024*1024, MAX_SCHEMA6_RACES=128, MAX_COMBINED_RECORD_BYTES=1024*1024;
const encoder=new TextEncoder();
export function parseSchema6Raw(raw){
  if(typeof raw!=='string'||encoder.encode(raw).byteLength>MAX_SCHEMA6_BYTES)throw new RangeError('schema-6 envelope limit');
  let envelope;try{envelope=JSON.parse(raw);}catch{throw new RangeError('invalid schema-6 JSON');}
  if(!envelope||envelope.schemaVersion!==6||!envelope.state||!Array.isArray(envelope.eventLog)||envelope.eventLog.length>100000
    ||!envelope.state.raceResolutions||typeof envelope.state.raceResolutions!=='object'||Array.isArray(envelope.state.raceResolutions))throw new RangeError('invalid schema-6 shape');
  const records=Object.values(envelope.state.raceResolutions);
  if(records.length>MAX_SCHEMA6_RACES)throw new RangeError('race count limit');
  let total=0;
  for(const record of records){
    if(!record||record.schema!=='race-v2-compact/v1'||!Array.isArray(record.input?.entrants)||record.input.entrants.length!==6
      ||!Array.isArray(record.facts?.events)||record.facts.events.length>512||!Array.isArray(record.facts?.crossings)||record.facts.crossings.length>6)throw new RangeError('race record shape');
    const recordBytes=encoder.encode(stableStringify(record)).byteLength;
    if(recordBytes>MAX_COMPACT_BYTES)throw new RangeError('individual race record limit');
    total+=recordBytes;if(total>MAX_COMBINED_RECORD_BYTES)throw new RangeError('combined race record limit');
  }
  return envelope;
}
export function createRestoreQueue(){
  let serial=0,current=null;
  return {
    cancel(){serial++;if(current)current.cancel();},
    async reconstruct(records,{context,deriveInput,onResult=()=>{},onProgress=()=>{}}){
      if(current)throw new Error('restore already active');
      if(!Array.isArray(records)||records.length>MAX_SCHEMA6_RACES||typeof deriveInput!=='function')throw new RangeError('invalid restore request');
      const epoch=++serial,client=createRaceWorkerClient();current=client;const results=[];
      try{
        for(let index=0;index<records.length;index++){
          if(epoch!==serial)throw new Error('restore canceled');
          const item=records[index],expected=deriveInput(index,item);
          if(stableStringify(expected)!==stableStringify(item.input))throw new RangeError('stored race input disagrees with history');
          const operation={...context,operationId:`restore:${index}`};
          await client.prepare({mode:'restore',record:item,context:operation});
          if(epoch!==serial)throw new Error('restore canceled');
          const candidate=client.claim(operation);if(!candidate)throw new Error('restore candidate stale');
          onResult(index,candidate);results.push(candidate);onProgress({completed:index+1,total:records.length});
          await new Promise(resolve=>setTimeout(resolve,0));
        }
        return results;
      }finally{client.close();if(current===client)current=null;}
    }
  };
}
