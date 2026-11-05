import test from 'node:test';import assert from 'node:assert/strict';import {initial,unread,ordered,deliver,markShown,showRevision} from './state.mjs';
test('counts unread threads and orders independently',()=>{const t=initial();assert.equal(unread(t),1);t[1].read=0;assert.equal(unread(t),2);assert.equal(ordered(t)[0].id,'ren')});
test('duplicate and delayed read preserve newer revision',()=>{const t=initial()[0];assert.equal(deliver(t,2,5),true);assert.equal(deliver(t,2,9),false);markShown(t,1);assert.equal(t.read,1);assert.equal(unread([t]),1);markShown(t,2);markShown(t,1);assert.equal(t.read,2)});

test('message sender is explicit for consecutive incoming and outgoing history',()=>{const t=initial();assert.deepEqual(t[0].messages.map(m=>m.from),['sender','sender']);assert.deepEqual(t[3].messages.map(m=>m.from),['sender','player'])});

test('historical exchanges start read and have no action',()=>{for(const t of initial().filter(x=>x.historical)){assert.equal(t.read,t.revision);assert.equal(t.action,undefined);assert.ok(t.messages.length>=2)}});

test('failed or disconnected content mount leaves unread revision unchanged',()=>{const t=initial()[0];assert.equal(showRevision(t,1,()=>false),false);assert.equal(showRevision(t,1,()=>{throw Error('mount failed')}),false);assert.equal(t.read,0);assert.equal(showRevision(t,1,()=>true),true);assert.equal(t.read,1)});
