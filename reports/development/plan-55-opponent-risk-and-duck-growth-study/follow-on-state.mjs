import { createRng } from '../../../src/core/prng.mjs';
const draw=(seed,raceId,id,kind)=>createRng(seed).fork(`plan55-follow/v1/${raceId}/${id}/${kind}`).next();
export function selectFavorite(ducks, favorite) {
  const rank=id=>ducks[id].rating*ducks[id].rest*(ducks[id].injured?0.9:1);
  const ids=Object.keys(ducks), sort=(a,b)=>rank(b)-rank(a)||(a===favorite?-1:b===favorite?1:a.localeCompare(b));
  const healthy=ids.filter(id=>!ducks[id].injured && ducks[id].rest===1);
  return (healthy.length?healthy:ids).sort(sort)[0];
}
export function updateAfterRace(state, { status, seed, raceId, field, contact }) {
  const next=structuredClone(state);
  if(status!=='finished')return next;
  next.committed ??= [];
  if(next.committed.includes(raceId)) throw new Error('race already committed');
  next.committed.push(raceId);
  for(const [id,duck] of Object.entries(next.ducks)) {
    if(!field.includes(id)) { if(duck.injured) { duck.injured=false; next.events.push({raceId,id,previous:true,extended:false,newInjury:false,injured:false,recoveredAbsent:true}); } continue; }
    const previous=duck.injured;
    const extended=previous && draw(seed,raceId,id,'extension')<0.5;
    const newInjury=contact?.find(x=>x.id===id)?.injured===true;
    duck.injured=Boolean(extended || newInjury);
    next.events.push({raceId,id,previous,extended,newInjury,injured:duck.injured});
  }
  return next;
}
export function chooseRivals(ducks, rotation) {
  const ordered=rotation.filter(id=>Object.hasOwn(ducks,id));
  if(ordered.length!==6)throw new Error('six rivals required');
  return [...ordered.filter(id=>!ducks[id].injured),...ordered.filter(id=>ducks[id].injured)].slice(0,5);
}


