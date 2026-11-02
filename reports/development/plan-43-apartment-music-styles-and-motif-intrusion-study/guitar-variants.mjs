/* Plan 43 variant study: unchanged baseline model, one controlled change per voice. */
import {validateEvents} from './guitar-pluck.mjs';
export function synthesizeVariant(event,config,variant){
 if(!['baseline','soft-excitation','slow-decay'].includes(variant))throw Error('invalid variant');
 const checked=validateEvents([{midi:event.midi,velocity:event.velocity,start:event.start,duration:event.duration,seed:event.seed}],config).events[0];
 if(checked.samples!==event.samples||checked.delay!==event.delay)throw Error('event differs from validated batch');
 const out=new Float32Array(checked.samples),line=new Float32Array(checked.delay);let state=checked.seed>>>0,previous=0;
 for(let i=0;i<line.length;i++){state^=state<<13;state^=state>>>17;state^=state<<5;const current=((state>>>0)/4294967296*2-1)*checked.velocity;line[i]=variant==='soft-excitation'?0.35*current+0.65*previous:current;previous=current;}
 const decay=variant==='slow-decay'?.9985:config.decay,damping=config.damping;let cursor=0;const gate=checked.duration*config.sampleRate,fade=Math.round(.08*config.sampleRate);
 for(let i=0;i<out.length;i++){const a=line[cursor],b=line[(cursor+1)%line.length];line[cursor]=decay*(damping*a+(1-damping)*b);cursor=(cursor+1)%line.length;out[i]=a*(i<gate?1:Math.max(0,1-(i-gate)/fade));}
 return out;
}
