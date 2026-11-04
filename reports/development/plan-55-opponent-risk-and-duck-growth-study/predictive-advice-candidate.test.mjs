import test from 'node:test';import assert from 'node:assert/strict';
import {selectPredictedThreat,shouldFollowAdvice} from './predictive-advice-candidate.mjs';
const own={id:'P',progress:0,x:0,y:0,vx:0,vy:0};
const neighbor=(patch={})=>({id:'A',progress:1,x:2,y:0,vx:-3,vy:0,active:true,ground:true,...patch});
test('predicts only closing, near-course threats inside horizon',()=>{
 assert.equal(selectPredictedThreat(own,[neighbor()],100).id,'A');
 for(const patch of [{vx:1},{vx:0},{vx:-1},{y:2},{progress:20},{active:false},{ground:false}])assert.equal(selectPredictedThreat(own,[neighbor(patch)],100),null);
});
test('picks lowest separation then stable ID',()=>{assert.equal(selectPredictedThreat(own,[neighbor({id:'B'}),neighbor({id:'A'})],100).id,'A')});
test('risk changes follow threshold without altering draw',()=>{assert.deepEqual(shouldFollowAdvice('steady',.5),{probability:.75,follow:true});assert.deepEqual(shouldFollowAdvice('sprint',.5),{probability:.35,follow:false});assert.throws(()=>shouldFollowAdvice('other',.5));});
