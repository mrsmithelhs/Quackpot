import test from 'node:test';
import assert from 'node:assert/strict';
import { historyMessages, messageKey, projectMessages, validateReadAtPrefix } from './messages-projection.mjs';
const delivery=(id,sequence,revision=1)=>({threadId:'loan',messageId:`loan:statement:${id}`,deliveryId:`loan:statement:${id}`,revision,sequence,sender:'Lender',text:'A statement',historical:false});
test('delivery order, deduplication, read independent from due and history',()=>{
 const a=delivery('a',1), b=delivery('b',2), h=historyMessages();
 const result=projectMessages([a,b,a,...h],[messageKey(a)]);
 assert.equal(result.threads[0].messages[0].deliveryId,b.deliveryId);
 assert.equal(result.threads[0].messages[1].unread,false);
 assert.equal(result.unreadThreads,1);
 assert.equal(result.threads.length,5);
 assert.ok(result.threads.slice(1).every(t=>!t.unread));
 assert.throws(()=>projectMessages([a,{...a,text:'conflict'}]));
});
test('prefix read rejects unknown, future, duplicate, stale and oversized facts',()=>{
 const old=delivery('a',1), next=delivery('a',1,2), p={deliveryId:old.deliveryId,revision:1};
 assert.equal(validateReadAtPrefix(p,[old],[]),true);
 assert.equal(validateReadAtPrefix(p,[],[]),false);
 assert.equal(validateReadAtPrefix(p,[next],[]),false);
 assert.equal(validateReadAtPrefix(p,[old,next],[]),false);
 assert.deepEqual(projectMessages([old,next]).threads[0].messages.map(m=>m.revision),[2]);
 assert.equal(validateReadAtPrefix(p,[old],[messageKey(old)]),false);
 assert.equal(validateReadAtPrefix({...p,text:'x'},[old],[]),false);
 assert.equal(validateReadAtPrefix({deliveryId:'a'.repeat(129),revision:1},[old],[]),false);
});

