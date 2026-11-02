/* Plan 43 contextual phrase: existing timbres plus explicitly combined parameters. */
import {validateEvents} from './guitar-pluck.mjs';
import {synthesizeVariant} from './guitar-variants.mjs';
export const phrase=Object.freeze([
 {midi:48,start:.3,duration:.8},{midi:55,start:.36,duration:.74},{midi:60,start:.42,duration:.68},{midi:64,start:1.5,duration:.5},
 {midi:45,start:2.7,duration:.8},{midi:52,start:2.76,duration:.74},{midi:57,start:2.82,duration:.68},{midi:60,start:3.9,duration:.5},
 {midi:41,start:5.1,duration:.8},{midi:48,start:5.16,duration:.74},{midi:53,start:5.22,duration:.68},{midi:57,start:6.3,duration:.5},
 {midi:43,start:7.5,duration:.7},{midi:50,start:7.56,duration:.64},{midi:55,start:7.62,duration:.58}
].map((e,i)=>Object.freeze({...e,velocity:85/127,seed:i+1})));
export function synthesizePhraseNote(event,config,variant){
 if(variant!=='combined')return synthesizeVariant(event,config,variant);
 const c=validateEvents([{midi:event.midi,start:event.start,duration:event.duration,velocity:event.velocity,seed:event.seed}],config).events[0];
 if(c.samples!==event.samples||c.delay!==event.delay)throw Error('event differs from validated batch');
 const out=new Float32Array(c.samples),line=new Float32Array(c.delay);let state=c.seed>>>0,previous=0;
 for(let i=0;i<line.length;i++){state^=state<<13;state^=state>>>17;state^=state<<5;const current=((state>>>0)/4294967296*2-1)*c.velocity;line[i]=.35*current+.65*previous;previous=current;}
 let cursor=0;const gate=c.duration*config.sampleRate,fade=Math.round(.08*config.sampleRate);
 for(let i=0;i<out.length;i++){const a=line[cursor],b=line[(cursor+1)%line.length];line[cursor]=.9985*(config.damping*a+(1-config.damping)*b);cursor=(cursor+1)%line.length;out[i]=a*(i<gate?1:Math.max(0,1-(i-gate)/fade));}
 return out;
}
