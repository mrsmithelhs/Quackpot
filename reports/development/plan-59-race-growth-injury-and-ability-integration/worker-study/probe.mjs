import {createRaceWorkerClient} from '../../../../src/core/race-v2/worker-client.mjs';
import {fixedInput} from '../../../../src/core/race-v2/fixtures.mjs';
const context={runId:'run',operationId:'race',revision:'1',logLength:'2',stateIdentity:'state'};
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const bytes=value=>new TextEncoder().encode(JSON.stringify(value)).length;
window.study={done:false,result:null,error:null};
window.beginStudy=()=>{setTimeout(async()=>{
  const OriginalWorker=window.Worker;let terminated=0,ticks=0,maxGap=0,last=performance.now(),settings=0,exits=0;
  const timer=setInterval(()=>{const now=performance.now();maxGap=Math.max(maxGap,now-last);last=now;ticks++;},20);
  document.querySelector('#settings').onclick=()=>settings++;document.querySelector('#exit').onclick=()=>exits++;
  try{
    class TrackedWorker extends OriginalWorker{terminate(){terminated++;return super.terminate();}}window.Worker=TrackedWorker;
    const client=createRaceWorkerClient(),input=fixedInput('pair-0',{mixed:true});
    let start=performance.now();const pending=client.prepare({mode:'resolve',input,context});
    setTimeout(()=>{document.querySelector('#settings').click();document.querySelector('#exit').click();},100);
    await pending;const resolveMs=performance.now()-start,candidate=client.claim(context);ensure(candidate&&client.claim(context)===null,'resolve/claim');
    const reference=await (await fetch('../numeric-feasibility/integrated/frozen-comparison/results-01/node/pair-0-mixed.json')).json();
    ensure(candidate.envelope===reference.envelope,'frozen byte mismatch');
    start=performance.now();const compactPending=client.prepare({mode:'restore',record:candidate.compact,context});
    setTimeout(()=>{document.querySelector('#settings').click();document.querySelector('#exit').click();},100);await compactPending;const compactMs=performance.now()-start;
    ensure(client.claim(context).envelope===candidate.envelope,'compact restore mismatch');
    start=performance.now();const compressedPending=client.prepare({mode:'restore',record:candidate.compressed,context});
    setTimeout(()=>{document.querySelector('#settings').click();document.querySelector('#exit').click();},100);await compressedPending;const compressedMs=performance.now()-start;
    ensure(client.claim(context).envelope===candidate.envelope,'compressed restore mismatch');
    const canceled=client.prepare({mode:'resolve',input,context});setTimeout(()=>client.cancel(),30);let canceledOk=false;try{await canceled;}catch{canceledOk=true;}
    ensure(canceledOk&&client.claim(context)===null,'cancel');client.close();
    let fake;class FakeWorker{constructor(){fake=this;}postMessage(value){this.sent=value;}terminate(){this.stopped=true;}}
    window.Worker=FakeWorker;const fakeClient=createRaceWorkerClient();
    let p=fakeClient.prepare({mode:'resolve',input,context});fake.onmessage({data:{kind:'complete',requestId:fake.sent.requestId,context,candidate}});fake.onmessage({data:{kind:'complete',requestId:fake.sent.requestId,context,candidate}});await p;
    ensure(fakeClient.claim({...context,revision:'2'})===null&&fakeClient.claim(context)===null,'stale state');
    p=fakeClient.prepare({mode:'resolve',input,context});fake.onmessage({data:{kind:'complete',requestId:'old',context,candidate}});let stale=false;try{await p;}catch{stale=true;}ensure(stale,'stale reply');
    p=fakeClient.prepare({mode:'resolve',input,context});fake.onerror();let failure=false;try{await p;}catch{failure=true;}ensure(failure,'worker error');fakeClient.close();
    window.Worker=class {constructor(){throw Error('startup');}};let startup=false;try{createRaceWorkerClient().prepare({mode:'resolve',input,context});}catch{startup=true;}ensure(startup,'startup');
    ensure(settings===3&&exits===3&&ticks>0&&terminated>=4,'responsive controls or termination');
    const noOverflow=document.documentElement.scrollWidth<=innerWidth;ensure(noOverflow,'overflow');
    window.study.result={viewport:{width:innerWidth,height:innerHeight,noOverflow},resolveMs,compactRestoreMs:compactMs,compressedRestoreMs:compressedMs,
      canonicalBytes:new TextEncoder().encode(candidate.envelope).length,compactRecordBytes:bytes(candidate.compact),compressedRecordBytes:bytes(candidate.compressed),
      compressedBase64Bytes:candidate.compressed.data.length,settingsClicks:settings,exitClicks:exits,timerTicks:ticks,maxTimerGapMs:maxGap,
      realWorkerTerminates:terminated,exactGolden:true,compactExact:true,compressedExact:true,realCancel:true,fakeStale:true,fakeDuplicate:true,fakeError:true,fakeStartup:true};
  }catch(e){window.study.error={name:e.name,message:e.message};}finally{clearInterval(timer);window.Worker=OriginalWorker;window.study.done=true;}
},0);return true;};
