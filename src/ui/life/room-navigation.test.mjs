import test from 'node:test';
import assert from 'node:assert/strict';
import {renderRoomNavigation} from './room-navigation.mjs';
test('room renderer accepts only unique known destinations and makes navigation controls',()=>{
 const original=globalThis.document,created=[];
 globalThis.document={createElement:()=>({dataset:{},addEventListener(type,fn){this.handler=fn}})};
 try {const container={append:x=>created.push(x)},seen=[];renderRoomNavigation(container,['desk-phone','living'],x=>seen.push(x));assert.deepEqual(created.map(x=>x.dataset.roomDestination),['desk-phone','living']);created[0].handler();assert.deepEqual(seen,['desk-phone']);for(const bad of [['purchase'],['living','living'],[null]])assert.throws(()=>renderRoomNavigation(container,bad,()=>{}));} finally {globalThis.document=original;}
});
