// Unmounted version-specific persistence study. Reconstruction belongs in a worker.
import { validateInput, encodeResult, decodeResult, stableStringify, MAX_BYTES } from './codec.mjs';
import { resolveIntegerRace } from './integer-kernel.mjs';
import { getReferenceTable } from './reference-policy.mjs';

export const MAX_COMPRESSED_BYTES=512*1024, MAX_COMPACT_BYTES=128*1024;
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const working=input=>{const validated=validateInput(input);if(validated.rules!=='integer-working/v1')throw new RangeError('unsupported rules');return validated;};
const bytes=text=>enc.encode(text).length;
function facts(payload){return {status:payload.status,clock:payload.clock,crossings:payload.crossings,
  injuries:payload.entrants.map(({id,entryInjury,injured})=>({id,entryInjury,injured})),
  events:payload.events.filter(e=>['contact','injury-check','injury','ability-opportunity','ability-start','ability-end','crossing'].includes(e.kind)),
  unresolved:payload.unresolved};}
export async function compactFromEnvelope(envelope){
  const p=await decodeResult(envelope);working(p.inputIdentity);
  const record={schema:'race-v2-compact/v1',input:p.inputIdentity,facts:facts(p),digest:JSON.parse(envelope).digest};
  if(bytes(stableStringify(record))>MAX_COMPACT_BYTES)throw new RangeError('compact limit');return record;
}
async function collect(stream,limit){const reader=stream.getReader(),chunks=[];let length=0;
  try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();throw new RangeError('stream limit');}chunks.push(value);}}
  finally{reader.releaseLock();}
  const output=new Uint8Array(length);let offset=0;for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.byteLength;}return output;
}
function toBase64(data){let result='';for(let i=0;i<data.length;i+=16384)result+=String.fromCharCode(...data.subarray(i,i+16384));return btoa(result);}
function fromBase64(text){if(typeof text!=='string'||text.length>Math.ceil(MAX_COMPRESSED_BYTES/3)*4||text.length%4!==0||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text))throw new RangeError('invalid base64');
  const raw=atob(text);if(raw.length>MAX_COMPRESSED_BYTES)throw new RangeError('compressed limit');return Uint8Array.from(raw,c=>c.charCodeAt(0));}
export async function compressedFromEnvelope(envelope){
  if(typeof envelope!=='string'||bytes(envelope)>MAX_BYTES)throw new RangeError('envelope limit');
  const payload=await decodeResult(envelope);working(payload.inputIdentity);
  const compressed=await collect(new Blob([enc.encode(envelope)]).stream().pipeThrough(new CompressionStream('gzip')),MAX_COMPRESSED_BYTES);
  return {schema:'race-v2-gzip/v1',uncompressedBytes:String(bytes(envelope)),data:toBase64(compressed)};
}
export async function inflateEnvelope(record){
  if(!exact(record,['schema','uncompressedBytes','data'])||record.schema!=='race-v2-gzip/v1'||typeof record.uncompressedBytes!=='string'||!/^(?:0|[1-9]\d*)$/.test(record.uncompressedBytes))throw new RangeError('invalid compressed record');
  const length=Number(record.uncompressedBytes);if(!Number.isSafeInteger(length)||length<1||length>MAX_BYTES)throw new RangeError('decompressed limit');
  const compressed=fromBase64(record.data);let output;
  try{output=await collect(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')),MAX_BYTES);}catch(e){if(e instanceof RangeError)throw e;throw new RangeError('invalid gzip');}
  if(output.length!==length)throw new RangeError('declared length mismatch');
  let text;try{text=dec.decode(output);}catch{throw new RangeError('invalid UTF-8');}await decodeResult(text);return text;
}
export async function reconstruct(record){
  let original=null,compact;
  if(record?.schema==='race-v2-gzip/v1'){original=await inflateEnvelope(record);compact=await compactFromEnvelope(original);}
  else {
    if(!exact(record,['schema','input','facts','digest'])||record.schema!=='race-v2-compact/v1'||typeof record.digest!=='string'||!/^[a-f0-9]{64}$/.test(record.digest)||bytes(stableStringify(record))>MAX_COMPACT_BYTES)throw new RangeError('invalid compact record');
    working(record.input);compact=record;
  }
  const actual=await encodeResult(resolveIntegerRace(working(compact.input),getReferenceTable()));
  const rebuilt=await compactFromEnvelope(actual);
  if(stableStringify(rebuilt)!==stableStringify(compact)||(original!==null&&actual!==original))throw new RangeError('semantic reconstruction mismatch');
  return {envelope:actual,compact:rebuilt};
}
