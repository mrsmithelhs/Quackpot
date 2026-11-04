import { createDigitalDuckSvg } from '../../../src/ui/duck-rig-view.mjs';
import { completionValid } from './injury-motion-gate.mjs';
const $=s=>document.querySelector(s),status=$('#status'),viewer=$('#viewer'),seed=$('#seed'),arm=$('#arm'),track=$('#ducks'),range=$('#time'),clock=$('#clock'),events=$('#events'),finish=$('#finish'),play=$('#play'),current=$('#current');
const base='./injury-motion-replay-output/';
let data={},active=null,playing=false,last=0,raf=0,duckEls={};
async function sha256(bytes){const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function verified(){
 const failed=await fetch(base+'failure.json',{cache:'no-store'});if(failed.ok || failed.status!==404)throw Error('failure marker or unknown publication state');
 const pending=await fetch(base+'complete.pending',{cache:'no-store'});if(pending.ok || pending.status!==404)throw Error('publication is incomplete');
 const res=await fetch(base+'complete.json',{cache:'no-store'});if(!res.ok)throw Error('four-case verification manifest not available');
 const m=await res.json();if(!completionValid(m,false,false))throw Error('invalid four-case manifest');
 const loaded={};for(const entry of m.cases){const r=await fetch(base+entry.name,{cache:'no-store'});if(!r.ok)throw Error('replay file unavailable');const bytes=await r.arrayBuffer();if(bytes.byteLength!==entry.bytes||await sha256(bytes)!==entry.sha256)throw Error('replay hash mismatch');const obj=JSON.parse(new TextDecoder().decode(bytes));if(obj.version!=='plan55-injury-motion/v1'||`${obj.seed}-${obj.arm}.json`!==entry.name||!Array.isArray(obj.trajectory)||!obj.trajectory.length)throw Error('invalid replay data');loaded[entry.name]=obj;}return loaded;
}
function sample(frames,tick){let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].tick<=tick)lo=mid;else hi=mid-1;}const a=frames[lo],b=frames[Math.min(lo+1,frames.length-1)],f=b.tick===a.tick?0:Math.max(0,Math.min(1,(tick-a.tick)/(b.tick-a.tick)));return a.entrants.map(x=>{const y=b.entrants.find(e=>e.id===x.id)??x;return {id:x.id,x:x.x+(y.x-x.x)*f,y:x.y+(y.y-x.y)*f};});}
function setTime(seconds){if(!active)return;const t=Math.max(0,Math.min(Number(range.max),seconds)),tick=t/active.dt;range.value=String(t);clock.textContent=`${t.toFixed(2)} s`;const positions=sample(active.trajectory,tick),contacts=active.case.contacts;
 for(const p of positions){const el=duckEls[p.id];if(!el)continue;el.style.left=`${Math.max(0,Math.min(100,(p.x+52)/104*100))}%`;el.style.top=`${Math.max(0,Math.min(100,(p.y+32)/64*100))}%`;el.classList.toggle('contact',contacts.some(e=>e.participants.includes(p.id)&&tick>=e.tick&&tick<e.tick+8));el.classList.toggle('injured',contacts.some(e=>tick>=e.tick&&e.rolls.some(q=>q.id===p.id&&q.injured)));}
}
function stop(){playing=false;play.textContent='Play';if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
function frame(now){if(!playing)return;if(last)setTime(Number(range.value)+(now-last)/1000);last=now;if(Number(range.value)>=Number(range.max)){stop();return;}raf=requestAnimationFrame(frame);}
function activate(){stop();active=data[`${seed.value}-${arm.value}.json`];track.replaceChildren();duckEls={};for(const d of active.trajectory[0].entrants){if(!['P','A','B','C','D','E'].includes(d.id))throw Error('invalid entrant');const div=document.createElement('div');div.className='duck';div.innerHTML=createDigitalDuckSvg({prefix:`preview-${d.id}`,label:`Duck ${d.id}`})+`<span class="label">${d.id}</span><span class="injury">injured</span>`;track.append(div);duckEls[d.id]=div;}
 events.replaceChildren();for(const e of active.case.contacts){const li=document.createElement('li'),button=document.createElement('button');const injured=e.rolls.filter(x=>x.injured).map(x=>x.id);button.type='button';button.textContent=`${(e.tick*active.dt).toFixed(2)} s — contact ${e.participants.join(' + ')}; ${injured.length?'injury: '+injured.join(', '):'no new injury recorded'}`;button.addEventListener('click',()=>{stop();setTime(e.tick*active.dt);current.textContent=button.textContent;});li.append(button);events.append(li);}
 finish.textContent='Actual finish: '+active.case.crossings.map((x,i)=>`${i+1}. ${x.id} (${x.time.toFixed(2)} s)`).join(' · ');range.max=String(active.trajectory.at(-1).tick*active.dt);current.textContent='Choose an event to see a still; the list provides a non-moving review.';setTime(0);
}
seed.addEventListener('change',activate);arm.addEventListener('change',activate);range.addEventListener('input',()=>{stop();setTime(Number(range.value));});$('#reset').addEventListener('click',()=>{stop();setTime(0);});play.addEventListener('click',()=>{if(playing){stop();return;}if(Number(range.value)>=Number(range.max))setTime(0);playing=true;play.textContent='Pause';raf=requestAnimationFrame(frame);});
try{data=await verified();status.textContent='All four replay files match the completed verification manifest.';viewer.hidden=false;activate();}catch(error){stop();status.textContent=`Replay unavailable: ${error.message}. Use the saved event timeline instead.`;}



