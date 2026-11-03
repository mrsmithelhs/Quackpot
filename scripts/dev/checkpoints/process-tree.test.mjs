import {test} from 'node:test';
import assert from 'node:assert/strict';
import {snapshotOwnedTree,startOwnedProcessMonitor} from './process-tree.mjs';
import {sampledCleanup,signalOriginalChild} from './process-cleanup-policy.mjs';
test('unbound root snapshots fail closed before a process query',async()=>{
 await assert.rejects(snapshotOwnedTree(10,2500),/Bound root PID and UTC creation ticks/);
 await assert.rejects(snapshotOwnedTree(10,2500,'not-a-tick'),/Bound root PID and UTC creation ticks/);
});
test('stop during initial capture waits and preserves observed root',async()=>{
 let resolve;const gate=new Promise(r=>{resolve=r;});
 const monitor=startOwnedProcessMonitor(10,{captureRoot:async()=>{await gate;return {pid:10,created:'100',root:true};},snapshot:async()=>[{pid:10,ppid:1,created:'100',root:true}]});
 let finished=false;const stop=monitor.stop().then(x=>{finished=true;return x;});await Promise.resolve();assert.equal(finished,false);resolve();await monitor.ready;assert.equal((await stop)[0].created,'100');
});
test('failed inspection reports failure and never certifies coverage',async()=>{
 const monitor=startOwnedProcessMonitor(10,{captureRoot:async()=>{throw Error('inspection failed');}});
 await assert.rejects(monitor.ready,/inspection failed/);await assert.rejects(monitor.stop(),/inspection failed/);
 assert.equal(sampledCleanup({rootExited:true,remainingCount:0,inspectionFailed:true}).uncertainty,true);
});
test('sampled empty set still retains profile and cannot certify unseen orphans',()=>{
 assert.deepEqual(sampledCleanup({rootExited:true,remainingCount:0,inspectionFailed:false}),{rootExited:true,observedProcessesExited:true,inspectionFailed:false,coverage:'sampled-only',uncertainty:true,profileRetained:true,treeTerminationConfirmed:false});
});
test('shutdown signals only the supplied original child handle',()=>{
 let calls=0;const child={kill(){calls++;return true;}};assert.equal(signalOriginalChild(child),true);assert.equal(calls,1);assert.throws(()=>signalOriginalChild({}),/Original spawned child handle/);
});
