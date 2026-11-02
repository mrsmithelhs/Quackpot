import {revisedDrums,revisedStopSeconds,validateRevisions} from './drum-revisions.mjs';
const shorten=op=>Object.freeze(Object.fromEntries(Object.entries(op).map(([k,v])=>[k,['d','h','r'].includes(k)?v/2:v])));
export const shortDrums=Object.freeze({...revisedDrums,38:Object.freeze(revisedDrums[38].map(shorten)),42:Object.freeze(revisedDrums[42].map(shorten))});
export const shortStops=Object.freeze({...revisedStopSeconds,38:revisedStopSeconds[38]/2,42:revisedStopSeconds[42]/2});
export function validateShort(){validateRevisions();for(const n of [38,42])for(let i=0;i<shortDrums[n].length;i++)for(const [k,v] of Object.entries(revisedDrums[n][i]))if(shortDrums[n][i][k]!==(['d','h','r'].includes(k)?v/2:v))throw Error('short patch drift');for(const n of [38,42])if(Math.abs(shortDrums[n][0].d*3.5-shortStops[n])>1e-9)throw Error('stop drift');}
