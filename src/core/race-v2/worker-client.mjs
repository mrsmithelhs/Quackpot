// Owned worker lifecycle; the eventual engine must revalidate its real state before claiming.
import { validateInput, decodeResult, stableStringify, deepFreeze } from './codec.mjs';
import { compactFromEnvelope } from './persistence.mjs';

const keys=['runId','operationId','revision','logLength','stateIdentity'];
const verifiedCandidates=new WeakSet();
export const isVerifiedWorkerCandidate=value=>Boolean(value&&verifiedCandidates.has(value));
function validContext(context){return context&&typeof context==='object'&&!Array.isArray(context)&&Object.keys(context).sort().join(',')===[...keys].sort().join(',')
  &&keys.every(k=>typeof context[k]==='string'&&context[k].length>0&&context[k].length<=128)
  &&/^(?:0|[1-9]\d*)$/.test(context.revision)&&/^(?:0|[1-9]\d*)$/.test(context.logLength);}
export function createRaceWorkerClient(){
  let sequence=0,active=null,closed=false;
  function stop(reason){if(!active)return;const prior=active;active=null;prior.worker.terminate();if(!prior.settled){prior.settled=true;prior.reject(new Error(reason));}}
  return {
    prepare({mode,input,record,context}){
      if(closed)throw new Error('client closed');if(active)throw new Error('operation already active');
      if(!validContext(context)||!['resolve','restore'].includes(mode))throw new RangeError('invalid operation');
      const frozenContext=structuredClone(context),snapshot=mode==='resolve'?validateInput(input):structuredClone(record);
      if(mode==='resolve'&&snapshot.rules!=='integer-working/v1')throw new RangeError('unsupported rules');
      const requestId=String(++sequence);let worker;
      try{worker=new Worker(new URL('./race-worker.mjs',import.meta.url),{type:'module'});}catch{throw new Error('worker startup failed');}
      return new Promise((resolve,reject)=>{
        const operation={worker,requestId,context:frozenContext,reject,settled:false,candidate:null};active=operation;
        worker.onmessage=async({data})=>{
          if(active!==operation||operation.settled||operation.decoding)return;
          if(!data||data.requestId!==requestId||!validContext(data.context)||stableStringify(data.context)!==stableStringify(frozenContext)){stop('stale worker reply');return;}
          if(data.kind==='failure'){stop(data.error?.name==='RangeError'?'invalid race record':'worker unavailable');return;}
          if(data.kind!=='complete'||!data.candidate||Object.keys(data.candidate).sort().join(',')!=='compact,envelope'||typeof data.candidate.envelope!=='string'){stop('worker unavailable');return;}
          operation.decoding=true;
          try{const decoded=await decodeResult(data.candidate.envelope);
            if(active!==operation||operation.settled)return;
            if(decoded.rules!=='integer-working/v1')throw new RangeError('unsupported rules');
            if(mode==='resolve'&&stableStringify(decoded.inputIdentity)!==stableStringify(snapshot))throw new RangeError('input mismatch');
            const compact=await compactFromEnvelope(data.candidate.envelope);
            if(active!==operation||operation.settled)return;
            if(stableStringify(compact)!==stableStringify(data.candidate.compact)
              || (mode==='restore'&&stableStringify(compact)!==stableStringify(snapshot)))throw new RangeError('compact mismatch');
            operation.candidate=deepFreeze(structuredClone(data.candidate));verifiedCandidates.add(operation.candidate);operation.settled=true;worker.terminate();resolve({ready:true});
          }catch{stop('invalid worker result');}
        };
        worker.onerror=()=>stop('worker error');worker.onmessageerror=()=>stop('worker message error');
        try{worker.postMessage({requestId,context:frozenContext,mode,...(mode==='resolve'?{input:snapshot}:{record:snapshot})});}catch{stop('worker dispatch failed');}
      });
    },
    claim(context){if(!active||!active.settled||!active.candidate)return null;
      if(!validContext(context)||stableStringify(context)!==stableStringify(active.context)){stop('stale state');return null;}
      const value=active.candidate;active=null;return value;},
    cancel(){stop('operation canceled');},
    close(){stop('client closed');closed=true;}
  };
}
