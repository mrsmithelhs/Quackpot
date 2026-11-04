import test from 'node:test';import assert from 'node:assert/strict';import {lateralReach,chooseClearanceTarget} from './clearance-target-candidate.mjs';
const own={x:0,y:0,vx:2,vy:0,speed:2,lateral:0},normal={nx:0,ny:1},arg={own,normal,turnDegreesPerSecond:90,neighbors:[{x:2,y:0,vx:0,vy:0}]};
test('reach follows turn-rate bound in radians and zero rate gives zero',()=>{assert.equal(lateralReach(2,0,1),0);assert.ok(Math.abs(lateralReach(2,90,1)-4/Math.PI)<1e-10);assert.throws(()=>lateralReach(-1,90,1))});
test('candidate chooses deterministic side for equal clearance',()=>{const r=chooseClearanceTarget(arg);assert.ok(r.selected);assert.ok(r.selected.offset<0);assert.ok(r.selected.score-r.baseline>=.1)});
test('initial sample permits legitimate no improvement',()=>{const r=chooseClearanceTarget({...arg,neighbors:[{x:0,y:0,vx:0,vy:0}]});assert.equal(r.selected,null);assert.equal(r.reason,'insufficient-improvement')});
test('corridor filters unreachable target choices',()=>{const r=chooseClearanceTarget({...arg,own:{...own,lateral:5.8}});assert.ok(r.candidates.filter(c=>c.offset>0).every(c=>!c.feasible));assert.ok(r.candidates.filter(c=>c.offset<0).every(c=>c.feasible))});
test('no neighbors produces an explicit no-op',()=>assert.equal(chooseClearanceTarget({...arg,neighbors:[]}).reason,'no-neighbors'));
