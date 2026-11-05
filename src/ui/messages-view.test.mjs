import test from 'node:test';
import assert from 'node:assert/strict';
import { isMessageVisible } from './messages-view.mjs';
const rect=(left,top,right,bottom)=>({left,top,right,bottom,width:right-left,height:bottom-top});
test('visibility requires connected uncovered content in both scroll and visual viewport',()=>{
 const base={connected:true,visibleDocument:true,uncovered:true,content:rect(5,5,20,20),scroll:rect(0,0,100,100),viewport:rect(0,0,100,100)};
 assert.equal(isMessageVisible(base),true);
 for(const key of ['connected','visibleDocument','uncovered']) assert.equal(isMessageVisible({...base,[key]:false}),false);
 assert.equal(isMessageVisible({...base,content:rect(5,120,20,140)}),false);
 assert.equal(isMessageVisible({...base,viewport:rect(0,40,100,100)}),false);
 assert.equal(isMessageVisible({...base,content:rect(5,5,5,20)}),false);
});
