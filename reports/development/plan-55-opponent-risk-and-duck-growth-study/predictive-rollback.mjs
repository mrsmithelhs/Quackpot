const fields=[['assistEventRecord','events'],['leaderSlowdownEventRecord','events'],['assistAuditRecord','audits']];
export function captureReferenceIndices(entrant,events,audits){
 const result={};for(const [key,which] of fields){if(!Object.hasOwn(entrant,key)){result[key]={state:'absent'};continue}const ref=entrant[key];if(ref==null){result[key]={state:ref===null?'null':'undefined'};continue}const index=(which==='events'?events:audits).indexOf(ref);if(index<0)throw Error('unowned rollback reference: '+key);result[key]={state:'reference',index};}return result;
}
export function rebindSnapshotReferences(entrant,snapshot,events,audits,indices){
 for(const [key,which] of fields){const entry=indices[key];if(!entry)throw Error('missing reference index: '+key);if(entry.state==='absent'){delete entrant[key];continue}if(entry.state==='null'||entry.state==='undefined'){entrant[key]=entry.state==='null'?null:undefined;continue}const records=which==='events'?events:audits;if(entry.state!=='reference'||!Number.isInteger(entry.index)||entry.index<0||entry.index>=records.length)throw Error('invalid reference index: '+key);const ref=records[entry.index];if(firstDifference(ref,snapshot[key])!==null)throw Error('reference content mismatch: '+key);entrant[key]=ref;}
}
export function firstDifference(a,b,path='root'){
 if(Object.is(a,b))return null;
 if(!a||!b||typeof a!=='object'||typeof b!=='object')return {path,actual:a,expected:b};
 const keys=new Set([...Object.keys(a),...Object.keys(b)]);for(const key of keys){if(Object.hasOwn(a,key)!==Object.hasOwn(b,key))return {path:`${path}.${key}`,actualPresent:Object.hasOwn(a,key),expectedPresent:Object.hasOwn(b,key)};const d=firstDifference(a[key],b[key],`${path}.${key}`);if(d)return d}return null;
}
