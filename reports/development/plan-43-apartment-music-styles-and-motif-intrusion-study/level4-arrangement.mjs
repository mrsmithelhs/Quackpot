/* Report-local study score: guitar mixed voicings, and selected Plan39 bass + shaker. */
import {mixed} from './guitar-register.mjs';
export const guitarEvents=mixed;
export const bassEvents=Object.freeze([
 {midi:36,start:.3,duration:.6},{midi:43,start:1.5,duration:.6},
 {midi:33,start:2.7,duration:.6},{midi:40,start:3.9,duration:.6},
 {midi:29,start:5.1,duration:.6},{midi:36,start:6.3,duration:.6},
 {midi:31,start:7.5,duration:.6},{midi:38,start:8.7,duration:.6}
].map(e=>Object.freeze({...e,velocity:.65})));
export const rhythm=Object.freeze({tempoBpm:100,totalBeats:16,secondsPerBeat:.6,shakerBeats:[1,3,5,7,9,11,13,15]});
export function validateArrangement(bass=bassEvents,beatSpec=rhythm){
 if(!Array.isArray(bass)||bass.length!==8||beatSpec.tempoBpm!==100||beatSpec.totalBeats!==16||beatSpec.secondsPerBeat!==.6||JSON.stringify(beatSpec.shakerBeats)!==JSON.stringify([1,3,5,7,9,11,13,15]))throw Error('arrangement event bound');
 const bounds=[];for(const e of bass){if(!Number.isInteger(e.midi)||e.midi<0||e.midi>127||!Number.isFinite(e.start)||e.start<0||!Number.isFinite(e.duration)||e.duration<=0||e.start+e.duration+.5>12||!Number.isFinite(e.velocity)||e.velocity<=0||e.velocity>1)throw Error('invalid bass event');bounds.push({t:e.start,d:1},{t:e.start+e.duration+.5,d:-1});}
 bounds.sort((a,b)=>a.t-b.t||a.d-b.d);let active=0,maxBass=0;for(const x of bounds){active+=x.d;maxBass=Math.max(maxBass,active);}if(maxBass>8)throw Error('bass concurrency');
 const shakerCount=beatSpec.shakerBeats.length,plan39NodesUpper=4+bass.length*(1+2*3)+shakerCount*3,guitarNodesUpper=1+15*2;
 if(shakerCount!==8||plan39NodesUpper+guitarNodesUpper>512)throw Error('preallocation graph bound');return {bassCount:bass.length,maxBass,shakerCount,plan39NodesUpper,guitarNodesUpper,totalNodesUpper:plan39NodesUpper+guitarNodesUpper};
}
