import {historyMessages,projectMessages} from './messages-projection.mjs';
import {renOfferId,renCurrentIds} from './messages-policy.mjs';
import {social46DisplayText,social46When} from './life-social.mjs';
import {REN_RESPONSE_CHOICES,REN_RESPONSE_LINES} from './life-social-dialogue.mjs';
// Called on the live engine only; replay is the authority for restored histories.
export function messagesForEngine(engine) {
  if(engine.messagesPolicy!=='messages-v1')return {deliveries:[],readKeys:[],projection:projectMessages([])};
  const life=engine.state.life, deliveries=[];
  const events=engine.log.entries, started=events[0];
  const replied=events.find(e=>e.type==='action' && e.payload?.kind==='launch_reply');
  const shown=events.some(e=>e.type==='offer_shown' && e.payload?.kind==='launch_reply_invitation');
  const windowOpen=life.schedule.day===1 && ['morning','midday','early-evening'].includes(life.schedule.slot);
  deliveries.push({threadId:'launch',messageId:'launch:invitation',deliveryId:'launch:invitation:1',revision:1,sequence:started.seq,sender:'Quackpot',time:'Day 1',preview:'Launch invitation',text:'Quackpot launches tonight! Reply LAUNCH to get 10 free ducks when the pond opens.',historical:false,sourceDisplay:true,unreadEligible:windowOpen || shown,status:replied?'Answered':windowOpen?'':'Expired',actionable:windowOpen && !replied,actionLabel:'Reply LAUNCH'});
  if(replied) deliveries.push({threadId:'launch',messageId:'launch:ack',deliveryId:'launch:ack:1',revision:1,sequence:replied.seq,sender:'Quackpot',time:`Day ${replied.clock.day}`,preview:'Open message',text:'You’re on the list! Come back tonight for your free 10-pull.',historical:false,sourceDisplay:true});
  const social=life.social46,renId=renOfferId(life),renCurrent=new Set(renCurrentIds(life)),renEvent=events.find(e=>e.type==='message_delivered'&&e.payload?.kind==='ren'&&renCurrent.has(e.payload.id));
  if(social?.introShown && (social.revision!==2 || social.intro?.numberShared))
    deliveries.push({threadId:'ren',messageId:'ren:contact',deliveryId:'ren:contact:1',revision:1,sequence:4,sender:'Ren',time:'Contact',text:'Open your contact with Ren.',historical:true,system:true,actionable:(!renEvent || Boolean(social.pending?.committed)) && !social.scene,actionLabel:'Open contact'});
  for(const event of events.filter(e=>e.type==='message_delivered'&&e.payload?.kind==='ren')) {
    const match=/^ren:offer:(ren-[1-9]\d*):([1-9]\d*):(door|game|repair):(suggested|original)$/.exec(event.payload.id);if(!match)continue;
    const [,planId,dayText,activity,variant]=match,day=Number(dayText),current=event.payload.id===renId,p=current?social.pending:null;
    const actions=current?[{label:`Accept ${social46When(p.day,life.schedule.day)}`,choice:'accept'},{label:'Not this time',choice:'decline'}]:[];
    if(current && !p.rescheduled)actions.push({label:'Another evening',choice:'reschedule'});
    if(current && social.revision===2 && p.initiator==='ren' && !p.replied && !p.suggested && ['door','game'].includes(p.activity))actions.push({label:p.activity==='door'?'Suggest game night instead':'Suggest a chat instead',choice:'suggest'});
    const blocked=current && (Boolean(life.schedule.recovery) || engine.checkDueObligations().bills.length>0);
    deliveries.push({threadId:'ren',messageId:`ren:offer:${planId}`,deliveryId:event.payload.id,revision:1,sequence:event.seq,sender:'Ren',time:`Day ${event.clock.day}`,preview:'A plan from Ren',text:social46DisplayText(variant==='suggested'?'suggestion_response':'invitation',activity,day,0,event.clock.day).replace(/^Ren:\s*/,''),historical:false,sourceDisplay:!blocked,displayBlocked:blocked,unreadEligible:current,status:current?'':'No longer active',actionable:current && !blocked,actions});
  }
  for(const event of events.filter(e=>e.type==='message_delivered'&&e.payload?.kind==='ren')) {
    const id=event.payload.id,current=renCurrent.has(id),pieces=id.split(':'),kind=pieces[1];let text,actions=[],system=false;
    if(kind==='ack' && /^ren-[1-9]\d*$/.test(pieces[2]) && /^[1-9]\d*$/.test(pieces[3])) {
      text=social46DisplayText('accepted',null,Number(pieces[3]),0,event.clock.day);
      if(current){const p=social.pending;actions.push({label:'Tell Ren I can’t make it',choice:'cancel'});if(!p.rescheduled && p.seatingConfirmed)actions.push({label:'Suggest another evening',choice:'plan-reschedule'});}
    } else if(kind==='floor' && /^ren-[1-9]\d*$/.test(pieces[2]) && /^[1-9]\d*$/.test(pieces[3])) {
      text=social46DisplayText('floor_reconfirmation',null,Number(pieces[3]),0,event.clock.day);system=true;if(current)actions.push({label:'Confirm floor seating',choice:'floor'});
    } else if(kind==='response' && REN_RESPONSE_CHOICES[pieces[3]]) {
      text=social46DisplayText(pieces[3]);if(current && social.revision===2 && !social.response.reply)actions=REN_RESPONSE_CHOICES[pieces[3]].map(([choice,label])=>({choice:`response-${choice}`,label}));
      if(current && (!social.response.reply || social.response.reply.shown))actions.push({choice:'response-dismiss',label:'Close message'});
    } else if(kind==='response-reply' && REN_RESPONSE_LINES[pieces[3]]?.[pieces[4]]) {
      text=`Ren: ${REN_RESPONSE_LINES[pieces[3]][pieces[4]]}`;if(current)actions.push({choice:'response-dismiss',label:'Close message'});
    } else continue;
    if(!text)continue;const blocked=current && (Boolean(life.schedule.recovery) || engine.checkDueObligations().bills.length>0);deliveries.push({threadId:'ren',messageId:id,deliveryId:id,revision:1,sequence:event.seq,sender:'Ren',time:`Day ${event.clock.day}`,preview:'Open message',text:text.replace(/^Ren:\s*/,''),historical:false,system,sourceDisplay:!blocked,displayBlocked:blocked,unreadEligible:current,status:current?'':'No longer active',actionable:actions.length>0 && !blocked,actions});
  }
  for(const e of engine.log.entries) {
    if(e.type!=='message_delivered')continue;
    const p=e.payload;
    if(p.kind==='work') deliveries.push({threadId:'work',messageId:'work:shift',deliveryId:p.id,revision:p.revision,sequence:e.seq,sender:'Work',time:`Day ${e.clock.day}`,text:`Your scheduled Midday shift pays $${life.config.scheduledWage} after completion. Take the keys to leave for work.`,historical:false});
    if(p.kind==='loan') {
      const loan=life.finance.loans.find(x=>p.id===`loan:statement:${x.id}`);if(!loan)continue;
      deliveries.push({threadId:'loan',messageId:p.id,deliveryId:p.id,revision:p.revision,sequence:e.seq,sender:'Lender',time:`Day ${e.clock.day}`,text:`Your loan statement totals $${(loan.totalCents/100).toFixed(2)}. You may repay the full amount early.`,historical:false,status:loan.status==='pending'?'Outstanding':'Resolved',actionable:loan.status==='pending' && !life.schedule.recovery && engine.checkDueObligations().bills.length===0 && Math.round(engine.state.cash*100)>=loan.totalCents,actionLabel:'Review repayment'});
    }
  }
  deliveries.push(...historyMessages());
  const readKeys=engine.log.entries.filter(e=>e.type==='message_read').map(e=>`${e.payload.id}@${e.payload.revision}`);
  return {deliveries,readKeys,projection:projectMessages(deliveries,readKeys)};
}
