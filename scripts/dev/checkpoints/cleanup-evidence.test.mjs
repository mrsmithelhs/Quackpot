import {test} from 'node:test';
import assert from 'node:assert/strict';
import {acceptsPlan52Cleanup} from './cleanup-evidence.mjs';
const sampled={rootExited:true,observedProcessesExited:true,inspectionFailed:false,residual:false,coverage:'sampled-only',uncertainty:true,treeTerminationConfirmed:false,profileRetained:true};
test('explicit sampled policy accepts only the complete observed vector',()=>{
 assert.equal(acceptsPlan52Cleanup(sampled,'sampled-observation-v1'),true);
 for(const [key,value] of Object.entries({rootExited:false,observedProcessesExited:false,inspectionFailed:true,residual:true,coverage:'complete',uncertainty:false,treeTerminationConfirmed:true,profileRetained:false})) assert.equal(acceptsPlan52Cleanup({...sampled,[key]:value},'sampled-observation-v1'),false,key);
 for(const key of Object.keys(sampled)){const missing={...sampled};delete missing[key];assert.equal(acceptsPlan52Cleanup(missing,'sampled-observation-v1'),false,key);}
});
test('unknown policies fail and legacy strict policy remains strict',()=>{
 for(const invalid of [undefined,null,{}, {residual:false}, {residual:false,uncertainty:0}]) assert.equal(acceptsPlan52Cleanup(invalid),false);
 assert.equal(acceptsPlan52Cleanup(sampled,'unknown-v2'),false);assert.equal(acceptsPlan52Cleanup(sampled),false);assert.equal(acceptsPlan52Cleanup(sampled,'strict-v1'),false);assert.equal(acceptsPlan52Cleanup({residual:false,uncertainty:false}),true);
});
