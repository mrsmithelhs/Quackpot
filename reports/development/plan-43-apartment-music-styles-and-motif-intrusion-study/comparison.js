/* Plan 43: bounded same-score comparison, report-local. No storage or network API. */
'use strict';
const P39=window.QUACKPOT_PLAN39_ENGINE;
const programIds={12:'GM-12-marimba',24:'GM-24-nylon-guitar',32:'GM-32-acoustic-bass'};
const events={
 mallet:[{p:12,n:60,t:.5,d:.5,v:90},{p:12,n:64,t:1.25,d:.5,v:90},{p:12,n:67,t:2,d:.8,v:90}],
 bass:[{p:32,n:36,t:.5,d:.65,v:90},{p:32,n:43,t:1.5,d:.65,v:90},{p:32,n:40,t:2.5,d:.8,v:90}],
 guitar:[{p:24,n:60,t:.5,d:.6,v:90},{p:24,n:55,t:1.5,d:1,v:90},{p:24,n:60,t:1.56,d:.94,v:90},{p:24,n:64,t:1.62,d:.88,v:90},{p:24,n:67,t:1.68,d:.82,v:90}],
 ensemble:[{p:32,n:36,t:.5,d:1,v:80},{p:24,n:55,t:.55,d:1.2,v:78},{p:24,n:60,t:.61,d:1.14,v:78},{p:24,n:64,t:.67,d:1.08,v:78},{p:12,n:67,t:2,d:.8,v:85},{p:12,n:64,t:3.2,d:.8,v:85},{p:32,n:41,t:5,d:1,v:80},{p:24,n:57,t:5.05,d:1.2,v:78},{p:24,n:60,t:5.11,d:1.14,v:78},{p:24,n:65,t:5.17,d:1.08,v:78},{p:12,n:69,t:7,d:.8,v:85},{p:12,n:67,t:8.2,d:1,v:85},{p:32,n:36,t:10,d:1.5,v:80},{p:12,n:64,t:11.5,d:1,v:85}]
};
let locked=false;
const specs=Object.freeze({mallet:9,bass:9,guitar:9,ensemble:20});
function assert(b,m){if(!b)throw Error(m);}
function score(name){const e=events[name];assert(e&&e.length<=15,'score or total-note bound');for(const x of e)assert(programIds[x.p]&&Number.isInteger(x.n)&&x.t>0&&x.d>0&&x.t+x.d<specs[name]&&x.v>0&&x.v<128,'invalid event');return e;}
function samples(buf){let peak=0,sum=0,last=0; const start=buf.length-buf.sampleRate;for(let c=0;c<2;c++){const a=buf.getChannelData(c);for(let i=0;i<a.length;i++){const v=a[i];peak=Math.max(peak,Math.abs(v));sum+=v*v;if(i>=start)last=Math.max(last,Math.abs(v));}}return {peak,rms:Math.sqrt(sum/(2*buf.length)),lastSecondPeak:last};}
async function upstream(name,e){
 const frame=document.createElement('iframe'); document.body.append(frame);let original,ctx,ticks=0;const errors=[];
 try {const w=frame.contentWindow,si=w.setInterval.bind(w);w.setInterval=(fn,ms)=>si(()=>{ticks++;fn()},ms);w.addEventListener('unhandledrejection',x=>errors.push(String(x.reason)));
 const s=w.document.createElement('script');s.src=new URL('vendor/webaudio-tinysynth.js',location.href).href;await new Promise((ok,no)=>{s.onload=ok;s.onerror=()=>no(Error('upstream load'));w.document.head.append(s)});
 const synth=new w.WebAudioTinySynth({quality:1,useReverb:0,voices:16});original=synth.getAudioContext();await original.close();ctx=new w.OfflineAudioContext(2,specs[name]*48000,48000);
 const own=Object.getOwnPropertyDescriptor(ctx,'resume'),identity=ctx.resume;let calls=0,active=true;
 try{Object.defineProperty(ctx,'resume',{configurable:true,writable:true,value:function(){assert(active&&this===ctx&&ctx.state==='suspended'&&++calls<=2,'unexpected resume');return Promise.resolve()}});synth.setAudioContext(ctx);assert(calls===2&&ctx.state==='suspended','init invariant')}finally{active=false;if(own)Object.defineProperty(ctx,'resume',own);else assert(delete ctx.resume,'restore');}
 const now=Object.getOwnPropertyDescriptor(ctx,'resume');assert(ctx.resume===identity&&((!own&&!now)||(own&&now&&['value','get','set','writable','enumerable','configurable'].every(k=>own[k]===now[k]))),'restore mismatch');
 synth.setTsMode(0);synth.setMasterVol(.5);const chans={12:0,24:1,32:2};for(const [p,c] of Object.entries(chans))synth.setProgram(c,Number(p));
 const messages=e.flatMap((x,i)=>[{t:x.t,on:true,x,i},{t:x.t+x.d,on:false,x,i}]).sort((a,b)=>a.t-b.t||Number(a.on)-Number(b.on));
 for(const m of messages){const c=chans[m.x.p];if(m.on)synth.noteOn(c,m.x.n,m.x.v,m.t);else synth.noteOff(c,m.x.n,m.t);}
 const table=synth.notetab.map(x=>({ch:x.ch,n:x.n,t:x.t,f:x.f,end:x.e}));assert(table.length===e.length+1&&table.length<=16,'voice table count');
 for(const x of e)assert(table.filter(n=>n.ch===chans[x.p]&&n.n===x.n&&n.t===x.t&&n.f===1).length===1,'voice mapping');
 const operators=e.reduce((sum,x)=>sum+synth.program[x.p].p.length,0);assert(operators<=80,'operator bound');
 const buffer=await ctx.startRendering();await new Promise(r=>setTimeout(r,200));assert(errors.length===0,'unhandled error '+errors.join(';'));
 return {buffer,info:{engine:'upstream with modified offline initialization interface',programs:chans,table,operators,initResumeCalls:calls,originalState:original.state,offlineState:ctx.state,errors}};
 }finally{if(original&&original.state!=='closed')await original.close();frame.remove();const before=ticks;await new Promise(r=>setTimeout(r,300));assert(ticks===before,'iframe timer continued');}
}
async function custom(name,e){
 const ctx=new OfflineAudioContext(2,specs[name]*48000,48000);const role={12:'lead',24:'chords',32:'bass'};const groups={lead:[],chords:[],bass:[]};
 for(const x of e)groups[role[x.p]].push({midi:x.n,frequencyHz:P39.midiToHz(x.n),startSeconds:x.t,durationSeconds:x.d,velocity:x.v/127,beat:0,durationBeats:1});
 const resolved={patchId:'TS-marimba-epiano',harmonyId:'H0-dry',leadProgramId:programIds[12],chordsProgramId:programIds[24],bassProgramId:programIds[32],leadEvents:groups.lead,chordEvents:groups.chords,bassEvents:groups.bass,roomAir:false,microGroove:false,shakerPulse:false,layerGains:{lead:1,chords:1,bass:1},leadPitchMultiplier:1};
 const operators=e.reduce((sum,x)=>sum+P39.getGmProgram(programIds[x.p]).operators.length,0);assert(operators<=80,'operator bound');
 const graph=P39.scheduleOnAudioContext(ctx,resolved,null,{baseTime:0,masterGain:.5});assert(graph.nodeCount<=512,'node bound');
 try{const buffer=await ctx.startRendering();return {buffer,info:{engine:'accepted Plan 39 custom',events:e.length,operators,nodeCount:graph.nodeCount,offlineState:ctx.state}};}finally{graph.stopAll();}
}
window.runComparison=async(name,which)=>{assert(!locked,'render locked');const e=score(name);assert(['upstream','custom'].includes(which),'engine');locked=true;try{const r=which==='upstream'?await upstream(name,e):await custom(name,e);const stats=samples(r.buffer);assert(stats.peak<1,'clipping');const wav=P39.encodePcm16Wav(r.buffer).arrayBuffer;const bytes=new Uint8Array(wav);let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return {name,which,events:e,info:r.info,stats,wav:btoa(binary)};}finally{locked=false}};
document.querySelector('#status').textContent='ready';

window.beginComparison=(name,which)=>{window.comparisonOutcome=null;window.runComparison(name,which).then(value=>window.comparisonOutcome={value},error=>window.comparisonOutcome={error:String(error&&error.stack||error)});};

