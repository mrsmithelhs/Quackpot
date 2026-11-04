// Report-local raw-event normalization; no model or MIDI export.
export const PROGRAMS=Object.freeze({acoustic_piano:0,electric_bass:33,acoustic_guitar:24,clean_electric_guitar:27,string_ensemble:48,drums:null});
export function normalize(events){
 if(!Array.isArray(events)||!events.length)throw Error('empty event stream');
 const open=new Map(),seen=new Set(),notes=[],omitted=[],counts={};
 for(const e of events){
  if(!e||typeof e!=='object')throw Error('invalid event');
  if(e.type==='progress') {if(!Number.isInteger(e.completed)||!Number.isInteger(e.total)||e.total<=0||e.completed<0||e.completed>e.total)throw Error('invalid progress');continue}
  if(e.type==='start'){
   if(!Number.isInteger(e.index)||e.index<0||seen.has(e.index)||!Object.hasOwn(PROGRAMS,e.instrument)||!Number.isInteger(e.pitch)||e.pitch<0||e.pitch>127||!Number.isFinite(e.start_time)||e.start_time<0||e.start_time>25||(e.instrument==='drums'&&(e.pitch<35||e.pitch>81)))throw Error('invalid start');
   seen.add(e.index);open.set(e.index,e);counts[e.instrument]=(counts[e.instrument]??0)+1;
  } else if(e.type==='end'){
   if(!Number.isInteger(e.start_event_index)||!open.has(e.start_event_index)||!Number.isFinite(e.end_time))throw Error('invalid end reference');
   const start=open.get(e.start_event_index);open.delete(e.start_event_index);
   if(e.end_time<start.start_time||e.end_time>26)throw Error('invalid end time');
   if(e.end_time===start.start_time)omitted.push({index:start.index,reason:'zero duration; no audible duration inferred'});
   else notes.push({index:start.index,part:start.instrument,pitch:start.pitch,start:start.start_time,end:e.end_time,velocity:85});
  } else throw Error('unknown event type');
 }
 if(open.size||!notes.length)throw Error('unclosed or empty notes');
 const latest=new Map();for(const n of [...notes].sort((a,b)=>a.start-b.start)){const k=n.part+':'+n.pitch;if(n.part!=='drums'&&(latest.get(k)??0)>n.start)throw Error('overlapping same-pitch events');latest.set(k,n.end)}
 const programs=Object.fromEntries(Object.keys(counts).sort().map(k=>[k,PROGRAMS[k]]));
 return {schema:1,notes,omitted,programs,counts,channel_policy:'Drums channel 10; other groups distinct channels.',velocity:'Assigned constant 85/127; dynamics not recovered.',alignment:'Raw seconds relative to 00:20 source crop; no MIDI bar offset.',source_order:'Input read in original order; notes emitted on paired end events.'};
}
