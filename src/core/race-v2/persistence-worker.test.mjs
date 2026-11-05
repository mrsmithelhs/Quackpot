import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compactFromEnvelope,compressedFromEnvelope,inflateEnvelope,reconstruct,MAX_COMPRESSED_BYTES} from './persistence.mjs';
import {createRaceWorkerClient} from './worker-client.mjs';
import {fixedInput} from './fixtures.mjs';
const source=new URL('../../../reports/development/plan-59-race-growth-injury-and-ability-integration/numeric-feasibility/integrated/frozen-comparison/results-01/node/pair-0-mixed.json',import.meta.url);
const envelope=JSON.parse(readFileSync(source,'utf8')).envelope;
const context={runId:'run',operationId:'race',revision:'1',logLength:'2',stateIdentity:'state'};

test('compact and compressed records reconstruct the exact original, reject meaningful tampering',async()=>{
  const compact=await compactFromEnvelope(envelope),compressed=await compressedFromEnvelope(envelope);
  assert.equal(await inflateEnvelope(compressed),envelope);
  assert.equal((await reconstruct(compact)).envelope,envelope);assert.equal((await reconstruct(compressed)).envelope,envelope);
  for(const mutate of [r=>r.digest='0'.repeat(64),r=>r.facts.injuries[0].injured=!r.facts.injuries[0].injured,r=>r.input.seed='changed']){
    const value=structuredClone(compact);mutate(value);await assert.rejects(reconstruct(value),RangeError);
  }
  await assert.rejects(inflateEnvelope({...compressed,uncompressedBytes:'2097153'}),RangeError);
  await assert.rejects(inflateEnvelope({...compressed,uncompressedBytes:'1'}),RangeError);
  await assert.rejects(inflateEnvelope({...compressed,data:compressed.data.slice(0,-4)}),RangeError);
  await assert.rejects(inflateEnvelope({...compressed,data:'?==='}),RangeError);
  await assert.rejects(inflateEnvelope({...compressed,data:'A'.repeat(Math.ceil(MAX_COMPRESSED_BYTES/3)*4+4)}),RangeError);
  const gzip=new Blob([new Uint8Array(2097153)]).stream().pipeThrough(new CompressionStream('gzip'));
  const binary=new Uint8Array(await new Response(gzip).arrayBuffer());const encoded=btoa(String.fromCharCode(...binary));
  await assert.rejects(inflateEnvelope({schema:'race-v2-gzip/v1',uncompressedBytes:'2097152',data:encoded}),RangeError);
});

test('worker lifecycle invalidates stale, canceled, duplicate, startup and error paths',async()=>{
  const original=globalThis.Worker,instances=[];
  class FakeWorker {constructor(){this.terminated=false;instances.push(this);}postMessage(data){this.sent=data;}terminate(){this.terminated=true;}}
  globalThis.Worker=FakeWorker;
  try{
    const client=createRaceWorkerClient();let pending=client.prepare({mode:'resolve',input:fixedInput('pair-0',{mixed:true}),context});
    let w=instances.at(-1);w.onmessage({data:{kind:'complete',requestId:w.sent.requestId,context,candidate:{envelope}}});
    w.onmessage({data:{kind:'complete',requestId:w.sent.requestId,context,candidate:{envelope}}});
    assert.deepEqual(await pending,{ready:true});assert.equal(w.terminated,true);assert.equal(client.claim({...context,revision:'2'}),null);assert.equal(client.claim(context),null);
    pending=client.prepare({mode:'resolve',input:fixedInput('pair-0',{mixed:true}),context});w=instances.at(-1);
    w.onmessage({data:{kind:'complete',requestId:w.sent.requestId,context,candidate:{envelope}}});await pending;
    assert.equal(client.claim(context).envelope,envelope);assert.equal(client.claim(context),null);
    pending=client.prepare({mode:'resolve',input:fixedInput('pair-0',{mixed:true}),context});w=instances.at(-1);client.cancel();await assert.rejects(pending,/canceled/);
    w.onmessage({data:{kind:'complete',requestId:w.sent.requestId,context,candidate:{envelope}}});assert.equal(client.claim(context),null);
    pending=client.prepare({mode:'resolve',input:fixedInput('pair-0'),context});w=instances.at(-1);
    w.onmessage({data:{kind:'complete',requestId:'stale',context,candidate:{envelope}}});await assert.rejects(pending,/stale/);
    pending=client.prepare({mode:'resolve',input:fixedInput('pair-0'),context});w=instances.at(-1);w.onerror();await assert.rejects(pending,/worker error/);
    pending=client.prepare({mode:'resolve',input:fixedInput('pair-0'),context});w=instances.at(-1);w.onmessageerror();await assert.rejects(pending,/message error/);
    assert.throws(()=>client.prepare({mode:'resolve',input:fixedInput('pair-0',{diagnostic:true}),context}),RangeError);
    client.close();assert.throws(()=>client.prepare({mode:'resolve',input:fixedInput('pair-0'),context}),/closed/);
    globalThis.Worker=class {constructor(){throw new Error('start');}};
    assert.throws(()=>createRaceWorkerClient().prepare({mode:'resolve',input:fixedInput('pair-0'),context}),/startup/);
  }finally{globalThis.Worker=original;}
});
