// Test-only checker: navigation can record only the existing shown-door lifecycle.
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function navigationErrors(before,after,destination){
 const errors=[];if(!same(before.prngStreams,after.prngStreams)||!same(before.state.life.schedule,after.state.life.schedule)||!same(before.state.life.finance,after.state.life.finance)||before.state.cash!==after.state.cash||before.state.health!==after.state.health||before.state.gems!==after.state.gems||!same(before.state.owned,after.state.owned)||!same(before.state.assetsSold,after.state.assetsSold)||before.state.down!==after.state.down||before.state.debt!==after.state.debt)errors.push('navigation changed gameplay');
 if(!same(after.eventLog.slice(0,before.eventLog.length),before.eventLog))errors.push('prior log changed');
 const suffix=after.eventLog.slice(before.eventLog.length);let i=0;
 while(i<suffix.length){
  if(destination!=='door'){errors.push('non-door navigation recorded events');break;}
  const intent=suffix[i++],action=intent?.payload?.intent?.action,id=intent?.payload?.intent?.operationId;
  if(intent?.type!=='life52_social_intent'||!['social46_activate','social46_knock_shown','social46_visit_knock_shown'].includes(action?.type)){errors.push('unexpected door action');break;}
  if(action.type!=='social46_activate'){
   const effect=suffix[i++],expected=action.type==='social46_knock_shown'?'knock':'visit_knock';
   if(effect?.type!=='life52_effect'||effect.payload?.effect?.type!=='social46_display'||effect.payload.effect.payload?.kind!==expected||effect.payload.effect.payload?.id!==(action.id??'intro'))errors.push('unexpected door display');
  }
  const commit=suffix[i++];if(commit?.type!=='life52_commit'||commit.payload?.domain!=='social'||commit.payload.operationId!==id||commit.payload.cashDeltaCents!==0||commit.payload.healthDelta!==0)errors.push('unexpected door commit');
 }
 return errors;
}
