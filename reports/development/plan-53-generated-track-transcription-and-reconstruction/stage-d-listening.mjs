import {selectedPatches} from '../plan-43-apartment-music-styles-and-motif-intrusion-study/selected-drum-arrangement.mjs';

const $=id=>document.getElementById(id), status=$('status'), audio=$('source');
const buttons=['original','stock','curated'].map($); let active=null, exported=null;
const track=new URLSearchParams(location.search).get('track'); if(!['m3','m5'].includes(track)) throw Error('Choose M3 or M5');
const folder=`local/stage-d/${track}/`; $('title').textContent=track.toUpperCase()+' · transcription comparison';
audio.src=folder+'original.wav'; for(const [id,file] of Object.entries({events:'events.json',raw:'raw-events.json',timing:'timing.json',midi:'derived-midi.mid'})) $(id).href=folder+file;
const assert=(condition,message)=>{if(!condition) throw Error(message)};

function validate(data){
  assert(Array.isArray(data.notes)&&data.notes.length>0&&data.notes.length<=2000,'Invalid event count');
  const recent=new Map();
  for(const n of [...data.notes].sort((a,b)=>a.start-b.start)){
    assert(Object.hasOwn(data.programs,n.part)&&Number.isInteger(n.pitch)&&n.pitch>=0&&n.pitch<=127&&
      Number.isFinite(n.start)&&Number.isFinite(n.end)&&n.start>=0&&n.end>n.start&&n.end<=26&&n.velocity===85,'Invalid note');
    if(n.part==='drums') assert(n.pitch>=35&&n.pitch<=81,'Unsupported TinySynth drum pitch');
    if(n.part!=='drums') { const key=n.part+':'+n.pitch; assert((recent.get(key)??0)<=n.start,'Overlapping same-pitch notes need separate treatment');recent.set(key,n.end); }
  }
  return data;
}
const data=await fetch(folder+'events.json').then(r=>{if(!r.ok)throw Error('Local event data unavailable');return r.json()}).then(validate).catch(e=>{status.textContent=String(e);return null});
const partChecks=new Map(), channels=new Map();
if(data){ let ch=0; for(const [name,program] of Object.entries(data.programs)){ const label=document.createElement('label'), input=document.createElement('input');input.type='checkbox';input.checked=true;input.dataset.part=name;label.append(input,document.createTextNode(' '+name.replaceAll('_',' ')));$('parts').append(label);partChecks.set(name,input);if(name==='drums'){assert(program===null,'Invalid drum mapping');channels.set(name,9)}else{if(ch===9)ch++;assert(ch<16&&Number.isInteger(program)&&program>=0&&program<=127,'Invalid program mapping');channels.set(name,ch++)}} $('mapping').textContent='Model group → zero-based GM program: '+Object.entries(data.programs).map(([name,program])=>name+' → '+(program===null?'drum channel 10':program)).join('; '); if(!channels.has('drums')){$('curated').disabled=true;$('curated').title='No predicted drum events; curated drums are not applicable.'} status.textContent=`Ready: ${data.notes.length} playable notes; ${data.omitted.length} omitted. ${channels.has('drums')?'':'No predicted drums; curated drum comparison is not applicable.'}`; }

function pcm16(channels,rate){
  const frames=channels[0].length, bytes=new ArrayBuffer(44+frames*4), v=new DataView(bytes);
  const str=(off,s)=>[...s].forEach((c,i)=>v.setUint8(off+i,c.charCodeAt(0)));
  str(0,'RIFF');v.setUint32(4,36+frames*4,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,rate,true);v.setUint32(28,rate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,frames*4,true);
  for(let i=0;i<frames;i++)for(let c=0;c<2;c++){const x=Math.max(-1,Math.min(1,channels[c][i]));v.setInt16(44+4*i+2*c,x<0?x*32768:x*32767,true)}
  return new Blob([bytes],{type:'audio/wav'});
}
function stop(){audio.pause();audio.currentTime=0;if(active)active.cancelled=true}
$('stop').onclick=stop;
$('original').onclick=async()=>{if(active){status.textContent='Stop the current reconstruction first.';return}stop();try{await audio.play();status.textContent='Playing original excerpt (source 00:20–00:45).'}catch(e){status.textContent='Original playback failed: '+e.message}};

async function reconstruct(curated){
 if(!data||active)return;stop();const state=active={cancelled:false};buttons.forEach(b=>b.disabled=true);for(const c of partChecks.values())c.disabled=true;let frame, synth, ctx, capture, timer;const chunks=[[],[]];let frames=0,scheduled=0;
 try{
  frame=document.createElement('iframe');frame.hidden=true;document.body.append(frame);const win=frame.contentWindow, script=win.document.createElement('script');script.src=new URL('../plan-43-apartment-music-styles-and-motif-intrusion-study/vendor/webaudio-tinysynth.js',location.href).href;
  await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(Error('TinySynth failed to load'));win.document.head.append(script)});
  if(state.cancelled)throw Error('Stopped');
  synth=new win.WebAudioTinySynth({quality:1,useReverb:0,voices:96});ctx=synth.getAudioContext();await ctx.resume();synth.setTsMode(0);synth.setMasterVol(.22);for(const [name,program] of Object.entries(data.programs))if(name!=='drums')synth.setProgram(channels.get(name),program);
  if(curated)for(const note of [38,42])synth.setTimbre(1,note,JSON.parse(JSON.stringify(selectedPatches[note])));
  capture=ctx.createScriptProcessor(4096,2,2);synth.comp.connect(capture);capture.connect(ctx.destination);capture.onaudioprocess=e=>{for(let c=0;c<2;c++){const x=e.inputBuffer.getChannelData(c);chunks[c].push(new Float32Array(x))}frames+=e.inputBuffer.length};
  const notes=data.notes.filter(n=>partChecks.get(n.part).checked);assert(notes.length,'Select at least one part');
  const events=[];for(const n of notes){const ch=channels.get(n.part);events.push({time:n.start,on:true,n,ch});if(ch!==9)events.push({time:n.end,on:false,n,ch})}
  events.sort((a,b)=>a.time-b.time||Number(a.on)-Number(b.on));const start=ctx.currentTime+.15;let index=0,stolen=false;const original=synth._pruneNote;
  synth._pruneNote=function(note){if(note.e>ctx.currentTime)stolen=true;return original.call(this,note)};
  status.textContent='Playing '+(curated?'curated drums':'upstream baseline')+'; recording WAV locally…';
  await new Promise((resolve,reject)=>{const tick=()=>{try{if(state.cancelled)throw Error('Stopped');const now=ctx.currentTime;while(index<events.length&&start+events[index].time<=now+.1){const e=events[index++];assert(start+e.time>=now-.05,'Audio scheduling fell behind');if(e.on){synth.noteOn(e.ch,e.n.pitch,e.n.velocity,start+e.time);scheduled++}else synth.noteOff(e.ch,e.n.pitch,start+e.time);assert(!stolen,'Voice limit pruned an active note')}if(index===events.length&&now>=start+26.5){resolve();return}timer=setTimeout(tick,20)}catch(e){reject(e)}};tick()});
  assert(scheduled===notes.length,'Scheduled note count mismatch');assert(frames>=ctx.sampleRate*25&&frames<=ctx.sampleRate*30,'Capture length outside bounds');capture.onaudioprocess=null;
  const capturedChannels=chunks.map(parts=>{const a=new Float32Array(frames);let offset=0;for(const part of parts){a.set(part,offset);offset+=part.length}return a});
  let peak=0;for(const channel of capturedChannels)for(const sample of channel){assert(Number.isFinite(sample),'Non-finite audio sample');peak=Math.max(peak,Math.abs(sample))}assert(peak>1e-6&&peak<1,'Captured audio is silent or clipping');
  if(exported)URL.revokeObjectURL(exported);exported=URL.createObjectURL(pcm16(capturedChannels,ctx.sampleRate));$('wav').href=exported;$('wav').hidden=false;
  status.textContent=`Finished: ${scheduled} note-on events scheduled; no active voice pruning detected; captured peak ${peak.toFixed(3)}. WAV includes capture/start latency. Audible correctness remains unverified.`;
 }catch(e){status.textContent='Playback stopped: '+e.message}
 finally{clearTimeout(timer);if(capture){capture.onaudioprocess=null;try{capture.disconnect()}catch{}}if(synth){for(let ch=0;ch<16;ch++)try{synth.allSoundOff(ch)}catch{}try{synth.lfo.stop()}catch{}}if(ctx)await ctx.close().catch(()=>{});if(frame)frame.remove();active=null;buttons.forEach(b=>b.disabled=false);if(!channels.has('drums'))$('curated').disabled=true;for(const c of partChecks.values())c.disabled=false}
}
$('stock').onclick=()=>reconstruct(false);$('curated').onclick=()=>reconstruct(true);
