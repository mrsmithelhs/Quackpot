/* Plan 43 report-local procedural pluck. No game RNG, samples or dependencies. */
export const LIMITS=Object.freeze({sampleRate:48000,maxEvents:16,maxConcurrent:8,maxSeconds:3,maxRenderSeconds:9,maxPcmBytes:9216000,minMidi:40,maxMidi:84});
const finite=(x)=>Number.isFinite(x);
export function validateEvents(events,options={}) {
 const sr=options.sampleRate??LIMITS.sampleRate, decay=options.decay??0.996, damping=options.damping??0.5;
 if(sr!==LIMITS.sampleRate || !Array.isArray(events) || !events.length || events.length>LIMITS.maxEvents)throw Error('invalid rate or event count');
 if(!finite(decay)||decay<=0||decay>=1||!finite(damping)||damping<0||damping>1)throw Error('unstable decay or damping');
 let totalBytes=0;const endpoints=[];
 const parsed=events.map((e,i)=>{
  if(!Number.isInteger(e.midi)||e.midi<LIMITS.minMidi||e.midi>LIMITS.maxMidi||!finite(e.velocity)||e.velocity<=0||e.velocity>1||!finite(e.start)||e.start<0||!finite(e.duration)||e.duration<=0||e.duration>LIMITS.maxSeconds||!Number.isInteger(e.seed)||e.seed<1||e.seed>0xffffffff)throw Error('invalid note '+i);
  const samples=Math.ceil((Math.min(LIMITS.maxSeconds,e.duration+0.3))*sr),frequency=440*2**((e.midi-69)/12);
  // Averaging adjacent ring samples advances the effective loop by about half a sample at damping=0.5.
  const groupDelay=1-damping,delay=Math.round(sr/frequency+groupDelay);
  if(!Number.isSafeInteger(samples)||samples<2||samples>LIMITS.maxSeconds*sr||!Number.isSafeInteger(delay)||delay<2||delay>sr)throw Error('invalid buffer or delay');
  if(e.start+samples/sr>LIMITS.maxRenderSeconds)throw Error('note exceeds render');
  totalBytes+=(samples+delay)*4;if(!Number.isSafeInteger(totalBytes)||totalBytes>LIMITS.maxPcmBytes)throw Error('PCM budget exceeded');
  endpoints.push({t:e.start,delta:1},{t:e.start+samples/sr,delta:-1});
  return {...e,samples,frequency,delay,estimatedHz:sr/(delay-groupDelay),estimatedCents:1200*Math.log2((sr/(delay-groupDelay))/frequency)};
 });
 endpoints.sort((a,b)=>a.t-b.t||a.delta-b.delta);let concurrent=0,maxConcurrent=0;for(const x of endpoints){concurrent+=x.delta;maxConcurrent=Math.max(maxConcurrent,concurrent);}if(maxConcurrent>LIMITS.maxConcurrent)throw Error('simultaneous voice limit');
 return {events:parsed,totalBytes,maxConcurrent,sampleRate:sr,decay,damping};
}
export function synthesize(validatedEvent,config) {
 // All allocations are derived from an already validated batch; revalidate this event too.
 const checked=validateEvents([{midi:validatedEvent.midi,velocity:validatedEvent.velocity,start:validatedEvent.start,duration:validatedEvent.duration,seed:validatedEvent.seed}],config).events[0];
 if(checked.samples!==validatedEvent.samples||checked.delay!==validatedEvent.delay)throw Error('event differs from validated parameters');
 const out=new Float32Array(checked.samples),line=new Float32Array(checked.delay);let state=checked.seed>>>0;
 for(let i=0;i<line.length;i++){state^=state<<13;state^=state>>>17;state^=state<<5;line[i]=((state>>>0)/4294967296*2-1)*checked.velocity;}
 let cursor=0;const decay=config.decay??0.996,damping=config.damping??0.5,gate=checked.duration*config.sampleRate,fade=Math.max(1,Math.round(.08*config.sampleRate));
 for(let i=0;i<out.length;i++){const a=line[cursor],b=line[(cursor+1)%line.length];line[cursor]=decay*(damping*a+(1-damping)*b);cursor=(cursor+1)%line.length;const level=i<gate?1:Math.max(0,1-(i-gate)/fade);out[i]=a*level;}
 return out;
}



