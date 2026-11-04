import {createRng} from '../../../src/core/prng.mjs';
const ACTIVE=new Set(['rising','airborne','landing']);
export function phaseAt(startTick,atTick){if(startTick===null||startTick===undefined)return 'idle';if(!Number.isFinite(startTick)||!Number.isFinite(atTick))throw RangeError('invalid phase time');const t=atTick-startTick;return t<0?'idle':t<2?'rising':t<12?'airborne':t<14?'landing':'idle'}
export function canContact(a,b){if(!['idle','rising','airborne','landing'].includes(a)||!['idle','rising','airborne','landing'].includes(b))throw RangeError('invalid phase');return (a==='airborne')===(b==='airborne')}
export function contactDecision({id,seed,raceId,contactId,stance,phase,hasBounce,protection,injured,actualParticipant}){
 if(!['steady','sprint'].includes(stance)||!['partial','full','none'].includes(protection)||!['idle','rising','airborne','landing'].includes(phase)||typeof hasBounce!=='boolean'||typeof injured!=='boolean'||typeof actualParticipant!=='boolean')throw RangeError('invalid contact inputs');
 if(!actualParticipant||injured)return null;
 const base=stance==='steady'?.05:.1,applies=hasBounce&&ACTIVE.has(phase),factor=!applies||protection==='none'?1:protection==='partial'?.5:0;
 const probability=base*factor,key=`plan55-susceptibility/v1/${raceId}/${contactId}/${id}/injury`,value=createRng(seed).fork(key).next();return {id,base,phase,protection:applies?protection:'none',factor,probability,key,value,injured:value<probability};
}
// Fractional tie contract for candidate-phase events; finish-first terminal exclusion follows the accepted adapter.
export function eventOrder(events,crossedIds=[]){const crossed=new Set(crossedIds);return events.filter(e=>!(e.type==='contact'&&e.participants.some(id=>crossed.has(id)))).sort((a,b)=>a.fraction-b.fraction||({finish:0,phase:1,contact:2})[a.type]-({finish:0,phase:1,contact:2})[b.type]||a.id.localeCompare(b.id))}
