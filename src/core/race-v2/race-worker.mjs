// One request per owned module worker; it never publishes game state.
import { resolveIntegerRace } from './integer-kernel.mjs';
import { getReferenceTable } from './reference-policy.mjs';
import { validateInput, encodeResult } from './codec.mjs';
import { compactFromEnvelope, compressedFromEnvelope, reconstruct } from './persistence.mjs';

self.addEventListener('message',async({data})=>{
  try{
    let candidate;
    if(data.mode==='resolve'){
      const input=validateInput(data.input);if(input.rules!=='integer-working/v1')throw new RangeError('unsupported rules');
      const envelope=await encodeResult(resolveIntegerRace(input,getReferenceTable()));
      candidate={envelope,compact:await compactFromEnvelope(envelope),compressed:await compressedFromEnvelope(envelope)};
    }else if(data.mode==='restore')candidate=await reconstruct(data.record);
    else throw new RangeError('unsupported worker mode');
    self.postMessage({kind:'complete',requestId:data.requestId,context:data.context,candidate});
  }catch(error){self.postMessage({kind:'failure',requestId:data?.requestId,context:data?.context,error:{name:error?.name??'Error',message:'Race preparation failed'}});}
});
