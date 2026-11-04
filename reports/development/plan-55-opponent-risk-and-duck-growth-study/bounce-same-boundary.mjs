export function sameBoundaryContact({event,pairState,playerId,otherId,boundaryTick}){
 if(!event||!pairState||!Number.isInteger(boundaryTick)||typeof playerId!=='string'||typeof otherId!=='string'||playerId===otherId)return false;
 const ids=[playerId,otherId].sort(), participants=Array.isArray(event.participants)?[...event.participants].sort():[];
 return event.type==='duck-contact'&&event.tick===boundaryTick&&event.studyContactFraction===1&&event.studyContactPhases?.[playerId]==='landing'&&participants.length===2&&participants.every((x,i)=>x===ids[i])&&pairState.tick===boundaryTick&&pairState.separated===false;
}
