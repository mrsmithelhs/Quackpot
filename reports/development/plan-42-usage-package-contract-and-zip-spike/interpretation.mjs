const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
// Compare only selected synthetic submissions. IDs do not prove identity or authorship.
export class SubmittedRuns {
 #seen=new Map(); eligible=0;unknown=0;duplicates=0;
 add(usage){const serialized=JSON.stringify(canonical(usage)),previous=this.#seen.get(usage.runId);if(previous!==undefined){this.duplicates++;return {kind:previous===serialized?'possible-repeat':'same-id-different-content'}}this.#seen.set(usage.runId,serialized);this.eligible++;if(usage.evidence!=='complete')this.unknown++;return {kind:'eligible'}}
}
