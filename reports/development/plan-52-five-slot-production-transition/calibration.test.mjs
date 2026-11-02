import test from 'node:test';
import assert from 'node:assert/strict';
import {fee,financial,run} from './calibration.mjs';
test('half-cent rounds up; transactions reject duplicate and unaffordable',()=>{assert.equal(fee(1),1);assert.equal(fee(17000),8500);const s={cash:100,ids:new Set(),ledger:[]};financial(s,'a','sale',10);assert.throws(()=>financial(s,'a','sale',10));assert.throws(()=>financial(s,'b','payment',-111));assert.equal(s.cash,110);});
test('first-rent guard uses real acknowledgement and payment and reconciles ledger',()=>{const r=run({control:0});assert.equal(r.final.firstRent,'paid');assert.equal(r.final.loan.principal,17000);assert.equal(8000+r.ledger.reduce((n,e)=>n+e.cents,0),r.final.cash);assert.ok(r.events.some(e=>e.kind==='acknowledge-shortfall'));assert.ok(r.events.some(e=>e.kind==='pay'));});
test('deadline collision is explicit and loan not auto-paid',()=>{const r=run({control:12000,interval:5,collision:true});assert.equal(r.stopped,'deadline_priority_unselected');assert.equal(r.final.loan.paid,false);});
