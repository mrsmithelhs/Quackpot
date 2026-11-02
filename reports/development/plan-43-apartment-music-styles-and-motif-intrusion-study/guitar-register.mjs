/* Plan 43 register study: original phrase transposed; separate mixed-register voicings. */
import {phrase,synthesizePhraseNote} from './guitar-phrase.mjs';
export const octave=Object.freeze(phrase.map(e=>Object.freeze({...e,midi:e.midi+12})));
export const mixed=Object.freeze([
 {midi:48,start:.3,duration:.8},{midi:55,start:.36,duration:.74},{midi:67,start:.42,duration:.68},{midi:72,start:1.5,duration:.5},
 {midi:45,start:2.7,duration:.8},{midi:52,start:2.76,duration:.74},{midi:69,start:2.82,duration:.68},{midi:72,start:3.9,duration:.5},
 {midi:41,start:5.1,duration:.8},{midi:48,start:5.16,duration:.74},{midi:65,start:5.22,duration:.68},{midi:69,start:6.3,duration:.5},
 {midi:43,start:7.5,duration:.7},{midi:50,start:7.56,duration:.64},{midi:67,start:7.62,duration:.58}
].map((e,i)=>Object.freeze({...e,velocity:85/127,seed:i+1})));
export function synthesizeRegisterNote(event,config){return synthesizePhraseNote(event,config,'combined');}
