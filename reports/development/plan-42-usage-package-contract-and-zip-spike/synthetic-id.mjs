// Synthetic only; callers retain the returned ID for re-export of the same run.
export function newSyntheticRunId(randomUUID = () => crypto.randomUUID()) {
 const id=randomUUID();if(typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw Error('random UUID v4 required');return `synthetic-${id}`;
}
