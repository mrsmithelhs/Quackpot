import test from 'node:test';
import assert from 'node:assert/strict';
import { isMessageVisible, messageRelativeTime } from './messages-view.mjs';
const rect=(left,top,right,bottom)=>({left,top,right,bottom,width:right-left,height:bottom-top});
test('visibility requires connected uncovered content in both scroll and visual viewport',()=>{
 const base={connected:true,visibleDocument:true,uncovered:true,content:rect(5,5,20,20),scroll:rect(0,0,100,100),viewport:rect(0,0,100,100)};
 assert.equal(isMessageVisible(base),true);
 for(const key of ['connected','visibleDocument','uncovered']) assert.equal(isMessageVisible({...base,[key]:false}),false);
 assert.equal(isMessageVisible({...base,content:rect(5,120,20,140)}),false);
 assert.equal(isMessageVisible({...base,viewport:rect(0,40,100,100)}),false);
 assert.equal(isMessageVisible({...base,content:rect(5,5,5,20)}),false);
});

test('relative labels use simulated delivery day without inventing dates',()=>{
 assert.equal(messageRelativeTime('Day 4',4),'Today');
 assert.equal(messageRelativeTime('Day 3',4),'Yesterday');
 assert.equal(messageRelativeTime('Day 1',4),'3 days ago');
 assert.equal(messageRelativeTime('Contact',4),'Earlier');
 assert.equal(messageRelativeTime('Day 5',4),'');
 assert.equal(messageRelativeTime('Day 4',null),'Earlier');
});
