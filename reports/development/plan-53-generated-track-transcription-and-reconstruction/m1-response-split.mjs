// A bounded audition heuristic, not recovered musical-voice identification.
export function splitResponse(schedule){
 if(!schedule||!Array.isArray(schedule.events)||schedule.channels?.acoustic_piano!==1||schedule.programs?.[1]!==0||Object.values(schedule.channels).includes(5)||Object.hasOwn(schedule.programs,5))throw Error('unexpected channels');
 const notes=schedule.events.filter(e=>e.on&&e.n.part==='acoustic_piano'&&e.n.start>=38&&e.n.start<50).map(e=>e.n).sort((a,b)=>a.start-b.start||a.index-b.index);const chosen=new Set();
 for(let i=0;i<notes.length;){const anchor=notes[i].start;let j=i+1;while(j<notes.length&&notes[j].start-anchor<=0.03+1e-10)j++;const group=notes.slice(i,j).sort((a,b)=>b.pitch-a.pitch||a.index-b.index);chosen.add(group[0].index);i=j}
 if(!chosen.size)throw Error('no candidate notes');const counts=new Map();const events=schedule.events.map(e=>{if(!chosen.has(e.n.index))return {...e};if(e.n.part!=='acoustic_piano'||e.ch!==1)throw Error('selected note mismatch');const k=e.n.index;const c=counts.get(k)||{on:0,off:0};c[e.on?'on':'off']++;counts.set(k,c);return {...e,ch:5}});for(const id of chosen){const c=counts.get(id);if(!c||c.on!==1||c.off!==1)throw Error('unpaired selected note')}return {...schedule,programs:{...schedule.programs,5:12},events,selected:[...chosen].sort((a,b)=>a-b)}
}
