import { historyMessages } from '../../../src/core/messages-projection.mjs';
import { mountMessages } from '../../../src/ui/messages-view.mjs';
const host=document.querySelector('#host'), open=document.querySelector('#open');
let deliveries=[{threadId:'loan',messageId:'loan:statement:fixture',deliveryId:'loan:statement:fixture',revision:1,sequence:2,sender:'Lender',text:'Fixture statement: a decision remains available.',historical:false,actionable:true},
{threadId:'work',messageId:'work:shift',deliveryId:'work:shift:2',revision:1,sequence:1,sender:'Work',text:'Fixture shift message.',historical:false},...historyMessages()];
let reads=[], instance, covered=false;
open.addEventListener('click',()=>{ instance=mountMessages(host,{deliveries,readKeys:reads,onRead:async id=>{reads.push(`${id.deliveryId}@${id.revision}`);return true;},onAction:()=>{},onClose:()=>open.focus(),isUncovered:()=>!covered}); });
window.fixture={get reads(){return reads;}, cover(value){covered=value; instance?.refresh();}, revise(){deliveries=deliveries.map(m=>m.threadId==='loan'?{...m,revision:2,text:'Revised fixture statement.'}:m);instance?.update(deliveries,reads);}, destroy(){instance?.destroy();}};
