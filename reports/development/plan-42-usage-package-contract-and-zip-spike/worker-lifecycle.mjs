// Host worker lifetime; injectable worker and deadline support finite synthetic controls.
export function launchImport(file,limit,{WorkerClass=Worker,timeoutMs=10000}={}) {
 const worker=new WorkerClass('./import-worker.mjs',{type:'module'});let settled=false,timer,rejectPromise;
 const promise=new Promise((resolve,reject)=>{rejectPromise=reject;const finish=(ok,value)=>{if(settled)return;settled=true;clearTimeout(timer);worker.terminate();ok?resolve(value):reject(value)};timer=setTimeout(()=>finish(false,Error('deadline exceeded')),timeoutMs);worker.onmessage=e=>{const data=e.data;finish(data.ok,data.ok?data.result:Object.assign(Error(data.error),{expanded:data.expanded}))};worker.onerror=()=>finish(false,Error('worker failure'));worker.postMessage({file,limit})});
 return {promise,cancel(){if(settled)return;settled=true;clearTimeout(timer);worker.terminate();rejectPromise(Error('cancelled'))}};
}
