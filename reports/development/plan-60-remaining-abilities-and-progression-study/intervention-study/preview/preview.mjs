import { parseWitness,sharedBounds,frameAtOrBefore,DT,CONTACT_TICK,WINDOW } from './preview-data.mjs';

const labels={'none':'No ability','quick-recovery':'Quick Recovery','straight-shooter':'Straight Shooter'};
const colors={'none':'#526b75','quick-recovery':'#087c70','straight-shooter':'#9a5615'};
const status=document.querySelector('#status'),panels=document.querySelector('#panels'),time=document.querySelector('#time'),timeValue=document.querySelector('#time-value'),play=document.querySelector('#play');
let rows=[],mode='whole',playing=false,lastTime=null,playTick=0,canvasByArm=new Map();

function addText(parent,tag,text) {const node=document.createElement(tag);node.textContent=text;parent.append(node);return node;}
function buildPanel(row) {
  const section=document.createElement('article');section.className='panel';panels.append(section);
  addText(section,'h2',labels[row.arm]);
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=400;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${labels[row.arm]}: recorded player-duck path; factual details follow.`);
  section.append(canvas);canvasByArm.set(row.arm,canvas);
  const facts=document.createElement('ul');facts.className='facts';section.append(facts);
  addText(facts,'li','Contact with A: processing tick 259. Exact impact time and location were not retained.');
  addText(facts,'li',row.arm==='none'?'Ability activation: none.':`Ability activation: tick ${row.starts[0].tick}.`);
  addText(facts,'li','Recorded injury for this duck: no.');
  addText(facts,'li',`Individual finish: ${row.finishSeconds.toFixed(2)} seconds, place ${row.place}.`);
}
function drawPath(ctx,frames,map,tick,stroke,width,modeFilter) {
  ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.beginPath();let started=false;
  for(const f of frames){if(f.tick>tick)break;if(modeFilter&&(f.tick<WINDOW[0]||f.tick>WINDOW[1]))continue;const point=map(f);if(!started){ctx.moveTo(point.x,point.y);started=true;}else ctx.lineTo(point.x,point.y);}
  if(started)ctx.stroke();
}
function draw(row,tick,bounds) {
  const canvas=canvasByArm.get(row.arm),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,pad=24;
  ctx.clearRect(0,0,w,h);
  const scale=Math.min((w-2*pad)/(bounds.maxX-bounds.minX),(h-2*pad)/(bounds.maxY-bounds.minY));
  const centerX=(bounds.minX+bounds.maxX)/2,centerY=(bounds.minY+bounds.maxY)/2;
  const map=f=>({x:w/2+(f.x-centerX)*scale,y:h/2-(f.y-centerY)*scale});
  ctx.save();ctx.beginPath();ctx.rect(pad,pad,w-2*pad,h-2*pad);ctx.clip();
  drawPath(ctx,row.frames,map,Infinity,'#d2e0dc',3,mode==='contact');
  drawPath(ctx,row.frames,map,tick,colors[row.arm],5,mode==='contact');
  if(mode==='whole'||(tick>=WINDOW[0]&&tick<=WINDOW[1])) {
    const frame=frameAtOrBefore(row.frames,tick),point=map(frame);
    ctx.beginPath();ctx.arc(point.x,point.y,8,0,Math.PI*2);ctx.fillStyle=colors[row.arm];ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.stroke();
    ctx.beginPath();ctx.moveTo(point.x,point.y);ctx.lineTo(point.x+16*Math.cos(frame.heading),point.y-16*Math.sin(frame.heading));ctx.lineWidth=3;ctx.strokeStyle=colors[row.arm];ctx.stroke();
  }
  ctx.restore();
}
function render() {
  const tick=Number(time.value),bounds=sharedBounds(rows,mode);
  timeValue.textContent=`${(tick*DT).toFixed(2)} s (tick ${tick})`;
  const message=tick===CONTACT_TICK?'Recorded contact processing tick; exact impact time is unavailable.':mode==='contact'&&(tick<WINDOW[0]||tick>WINDOW[1])?'Move the slider into the contact window to see the current duck.':'The three panels share one clock and camera scale.';
  if(status.textContent!==message)status.textContent=message;
  for(const row of rows)draw(row,tick,bounds);
}
function animate(now) {
  if(!playing)return;
  if(lastTime!==null){const advance=(now-lastTime)/1000/DT;playTick=Math.min(Number(time.max),playTick+advance);time.value=String(Math.round(playTick));render();}
  lastTime=now;if(Number(time.value)>=Number(time.max)){playing=false;play.textContent='Play';lastTime=null;return;}requestAnimationFrame(animate);
}
play.addEventListener('click',()=>{playing=!playing;play.textContent=playing?'Pause':'Play';lastTime=null;if(playing){if(Number(time.value)>=Number(time.max))time.value='0';playTick=Number(time.value);requestAnimationFrame(animate);}});
time.addEventListener('input',()=>{playing=false;play.textContent='Play';lastTime=null;render();});
document.querySelectorAll('input[name=view]').forEach(input=>input.addEventListener('change',()=>{if(input.checked){mode=input.value;render();}}));
try {
  const response=await fetch('../screen-000-004.jsonl');if(!response.ok)throw Error(`Source returned ${response.status}`);
  rows=parseWitness(await response.text());
  time.max=String(Math.max(...rows.map(row=>row.frames.at(-1).tick)));
  for(const row of rows)buildPanel(row);render();
} catch(error) {status.textContent=`Could not load the recorded example: ${error.message}`;play.disabled=true;time.disabled=true;}
