import {shortDrums,shortStops,validateShort} from './drum-short.mjs';
const tighten=op=>Object.freeze(Object.fromEntries(Object.entries(op).map(([k,v])=>[k,['d','h','r'].includes(k)?v*.75:v])));
export const tighterDrums=Object.freeze({...shortDrums,38:Object.freeze(shortDrums[38].map(tighten))});
export const tighterStops=Object.freeze({...shortStops,38:shortStops[38]*.75});
export function validateTighter(){validateShort();for(let i=0;i<tighterDrums[38].length;i++)for(const [k,v] of Object.entries(shortDrums[38][i]))if(tighterDrums[38][i][k]!==(['d','h','r'].includes(k)?v*.75:v))throw Error('patch drift');if(Math.abs(tighterDrums[38][0].d*3.5-tighterStops[38])>1e-9)throw Error('stop drift');}
