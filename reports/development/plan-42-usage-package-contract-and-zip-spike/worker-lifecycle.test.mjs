import assert from 'node:assert/strict';import {launchImport} from './worker-lifecycle.mjs';
let created=[];class FakeWorker{constructor(){this.terminated=0;created.push(this)}postMessage(){}terminate(){this.terminated++}}
const stalled=launchImport({},100,{WorkerClass:FakeWorker,timeoutMs:20});await assert.rejects(stalled.promise,/deadline/);assert.equal(created[0].terminated,1);created[0].onmessage({data:{ok:true,result:'stale'}});assert.equal(created[0].terminated,1);
const cancelled=launchImport({},100,{WorkerClass:FakeWorker,timeoutMs:200});cancelled.cancel();await assert.rejects(cancelled.promise,/cancelled/);assert.equal(created[1].terminated,1);
const next=launchImport({},100,{WorkerClass:FakeWorker,timeoutMs:200});created[2].onmessage({data:{ok:true,result:'ok'}});assert.equal(await next.promise,'ok');assert.equal(created[2].terminated,1);console.log('PASS stalled deadline, termination, stale callback, cancellation and subsequent success');
