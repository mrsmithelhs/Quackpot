import {boundedRead,sha} from './predictive-stage-io.mjs';import {injuryPins,absent,exclusiveWrite,claimShard} from './injury-stage2-io.mjs';
const base='reports/development/plan-55-opponent-risk-and-duck-growth-study/',stage2='72b477187470c07fd206ba42642410e58791603d7464b777f8143c93d986b5aa';
export {absent,exclusiveWrite,claimShard};
export async function bouncePins(expected){if(!/^[a-f0-9]{64}$/.test(expected??''))throw Error('missing pin');await injuryPins(stage2);const b=await boundedRead(base+'bounce-study-pins.txt',32768);if(sha(b)!==expected)throw Error('bounce pin drift');for(const line of b.toString().trim().split(/\r?\n/)){const [h,p]=line.split('  ');if(sha(await boundedRead(p,2*1024*1024))!==h)throw Error('bounce source drift '+p)}}
