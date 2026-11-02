import {validateEvents,synthesize} from './guitar-pluck.mjs';
const P39=globalThis.QUACKPOT_PLAN39_ENGINE;
const same=[{midi:60,start:.5,duration:.6},{midi:55,start:1.5,duration:1},{midi:60,start:1.56,duration:.94},{midi:64,start:1.62,duration:.88},{midi:67,start:1.68,duration:.82}].map((e,i)=>({...e,velocity:90/127,seed:i+1}));
const performance=[{midi:60,start:.5,duration:.6},{midi:48,start:1.5,duration:.52},{midi:55,start:1.54,duration:.48},{midi:60,start:1.58,duration:.44},{midi:64,start:1.62,duration:.40}].map((e,i)=>({...e,velocity:90/127,seed:i+1}));
let locked=false;
function measure(buffer){let peak=0,sum=0,last=0;for(let c=0;c<2;c++){const a=buffer.getChannelData(c);for(let i=0;i<a.length;i++){const x=a[i];peak=Math.max(peak,Math.abs(x));sum+=x*x;if(i>=a.length-48000)last=Math.max(last,Math.abs(x));}}return {peak,rms:Math.sqrt(sum/(buffer.length*2)),lastSecondPeak:last};}
async function render(kind){if(locked)throw Error('render locked');if(!['pluck-same','performance-A'].includes(kind))throw Error('invalid probe');locked=true;let ctx,graph;const nodes=[];
 try{
  const events=kind==='pluck-same'?same:performance;const validation=validateEvents(events,{sampleRate:48000,decay:.996,damping:.5});
  const audioBufferBytes=validation.events.reduce((n,e)=>n+e.samples*4,0);
  const offlineBytes=432000*2*4,wavBytes=44+432000*2*2,transportBytes=Math.ceil(wavBytes*4/3)*4;
  const estimatedBytes=validation.totalBytes+audioBufferBytes+offlineBytes+wavBytes+transportBytes;
  if(!Number.isSafeInteger(estimatedBytes)||estimatedBytes>40000000)throw Error('preallocation byte bound');
  ctx=new OfflineAudioContext(2,432000,48000);let info;
  if(kind==='pluck-same'){
   const master=ctx.createGain();nodes.push(master);master.gain.value=.25;master.connect(ctx.destination);
   for(const e of validation.events){const samples=synthesize(e,validation),buf=ctx.createBuffer(1,samples.length,48000);buf.copyToChannel(samples,0);const source=ctx.createBufferSource();nodes.push(source);const gain=ctx.createGain();nodes.push(gain);source.buffer=buf;gain.gain.value=1;source.connect(gain);gain.connect(master);source.start(e.start);source.stop(e.start+e.samples/48000);}
   info={engine:'original sample-domain plucked-string',masterGain:.25,pcmAndDelayBytes:validation.totalBytes,audioBufferBytes,offlineBytes,wavBytes,transportBytes,estimatedBytes,maxConcurrent:validation.maxConcurrent,notes:validation.events.map(({midi,start,duration,velocity,seed,samples,delay,estimatedHz,estimatedCents})=>({midi,start,duration,velocity,seed,samples,delay,estimatedHz,estimatedCents})),nodeCount:nodes.length,gateFadeSeconds:.08,sourceBufferCapSeconds:3};
  }else{
   const chordEvents=events.map(e=>({midi:e.midi,frequencyHz:P39.midiToHz(e.midi),startSeconds:e.start,durationSeconds:e.duration,velocity:e.velocity,beat:0,durationBeats:1}));
   const resolved={patchId:'TS-marimba-epiano',harmonyId:'H0-dry',leadProgramId:'GM-12-marimba',chordsProgramId:'GM-24-nylon-guitar',bassProgramId:'GM-32-acoustic-bass',leadEvents:[],chordEvents,bassEvents:[],roomAir:false,microGroove:false,shakerPulse:false,layerGains:{lead:1,chords:1,bass:1},leadPitchMultiplier:1};
   graph=P39.scheduleOnAudioContext(ctx,resolved,null,{baseTime:0,masterGain:.5});if(graph.nodeCount>512)throw Error('graph limit');info={engine:'Plan 39 custom',masterGain:.5,nodeCount:graph.nodeCount,notes:events};
  }
  const buffer=await ctx.startRendering();const stats=measure(buffer);if(!Number.isFinite(stats.peak)||stats.peak>=1)throw Error('nonfinite or clipped float');
  const bytes=new Uint8Array(P39.encodePcm16Wav(buffer).arrayBuffer);let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return {kind,info,stats,contextState:ctx.state,wav:btoa(binary)};
 }finally{if(graph)graph.stopAll();for(const n of nodes){try{if(n instanceof AudioBufferSourceNode)n.stop()}catch{}try{n.disconnect()}catch{}}locked=false;}
}
window.beginGuitarProbe=kind=>{window.guitarOutcome=null;render(kind).then(value=>window.guitarOutcome={value},error=>window.guitarOutcome={error:String(error&&error.stack||error)});};
document.querySelector('#status').textContent='ready';


