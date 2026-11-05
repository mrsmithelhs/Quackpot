import {historyMessages,projectMessages} from './messages-projection.mjs';
// Called on the live engine only; replay is the authority for restored histories.
export function messagesForEngine(engine) {
  if(engine.messagesPolicy!=='messages-v1')return {deliveries:[],readKeys:[],projection:projectMessages([])};
  const life=engine.state.life, deliveries=[];
  for(const e of engine.log.entries) {
    if(e.type!=='message_delivered')continue;
    const p=e.payload;
    if(p.kind==='work') deliveries.push({threadId:'work',messageId:'work:shift',deliveryId:p.id,revision:p.revision,sequence:e.seq,sender:'Work',time:`Day ${e.clock.day}`,text:`Your scheduled Midday shift pays $${life.config.scheduledWage} after completion. Take the keys to leave for work.`,historical:false});
    if(p.kind==='loan') {
      const loan=life.finance.loans.find(x=>p.id===`loan:statement:${x.id}`);if(!loan)continue;
      deliveries.push({threadId:'loan',messageId:p.id,deliveryId:p.id,revision:p.revision,sequence:e.seq,sender:'Lender',time:`Day ${e.clock.day}`,text:`Your loan statement totals $${(loan.totalCents/100).toFixed(2)}. You may repay the full amount early.`,historical:false,actionable:loan.status==='pending'});
    }
  }
  deliveries.push(...historyMessages());
  const readKeys=engine.log.entries.filter(e=>e.type==='message_read').map(e=>`${e.payload.id}@${e.payload.revision}`);
  return {deliveries,readKeys,projection:projectMessages(deliveries,readKeys)};
}
