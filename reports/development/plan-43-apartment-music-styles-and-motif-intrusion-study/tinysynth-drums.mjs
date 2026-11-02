/* Plan43 synthetic GM drum audition events; times in seconds, no student data. */
export const drumPrograms=Object.freeze({kick:36,snare:38,hat:42});
export const drumIsolates=Object.freeze(Object.fromEntries(Object.entries(drumPrograms).map(([k,n])=>[k,Object.freeze([{note:n,time:.5,velocity:100},{note:n,time:1.5,velocity:80},{note:n,time:2.5,velocity:60}].map(Object.freeze))])));
export const drumArrangement=Object.freeze([
 ...[.3,2.7,5.1,7.5].map(time=>({note:36,time,velocity:95})),
 ...[1.5,3.9,6.3,8.7].map(time=>({note:38,time,velocity:85})),
 ...[.3,1.5,2.7,3.9,5.1,6.3,7.5,8.7].map(time=>({note:42,time,velocity:65}))
].sort((a,b)=>a.time-b.time||a.note-b.note).map(Object.freeze));
// Upstream q1 pinned tables: bass drum and snare first operator d=.05; closed hat defaults to .01.
export const operatorCounts=Object.freeze({36:2,38:3,42:1});
export const durations=Object.freeze({36:.175,38:.175,42:.035});
export function validateDrums(events,lengthSeconds){
 if(!Array.isArray(events)||events.length<1||events.length>16||![4,12].includes(lengthSeconds))throw Error('drum count/duration bound');
 let operators=0;const edges=[];
 for(const e of events){if(!Number.isInteger(e.note)||!operatorCounts[e.note]||!Number.isFinite(e.time)||e.time<=0||!Number.isInteger(e.velocity)||e.velocity<1||e.velocity>127||e.time+durations[e.note]>lengthSeconds)throw Error('invalid drum event');operators+=operatorCounts[e.note];edges.push({t:e.time,d:1},{t:e.time+durations[e.note],d:-1});}
 edges.sort((a,b)=>a.t-b.t||a.d-b.d);let count=0,concurrent=0;for(const e of edges){count+=e.d;concurrent=Math.max(concurrent,count);}if(concurrent>4||operators>48)throw Error('drum voice/operator bound');
 return {events:events.length,concurrent,operators,operatorNodeUpper:operators*2,sourceLifetimeSeconds:durations};
}
