import { createDigitalDuckSvg } from '../../../../src/ui/duck-rig-view.mjs';
import { scenarios, stateAt, guardApproach, diveTravel } from './fixtures.mjs';
import { padAndForce, bowWave, airCurrents } from './revision-effects.mjs';
import { guardCue, recoveryCue, diveCue, diveLayer, diveStages } from './candidate-effects.mjs';

const racers=[['A','classic-yellow',37,45],['B','mallard-green',50,45],['C','bubblegum-pink',69,28],['D','classic-yellow',24,75],['E','mallard-green',53,73],['F','bubblegum-pink',78,66]];
let serial=0;
const icon = name => `<img class="motif motif-${name}" src="../art/haiku-${name}.svg" alt="">`;
export function mount(host,context="race"){
 const instance=++serial, large=context!=='race'; host.className=`study ${large?'large':''}`;
 const selected=large ? racers.slice(0,2):racers;
 host.innerHTML=`<h2>${context==='race'?'Six-duck race-scale comparison':context==='dex'?'Duck-Dex inspection example':'Racer selection example'}</h2><p data-explanation>${large?'Optional ability explanation.':'Synthetic six-duck scene; placements, timing and paths are authored for visual comparison.'}</p><div class="controls"><label>Scene <select data-scene>${Object.entries(scenarios).filter(([k])=>!large||k!=='control').map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label><label>Bounce <select data-bounce><option value="revised">Revised pad + flap</option><option value="arc">Earlier spring arc</option><option value="disc">Earlier rebound pad</option></select></label><label>Crowd <select data-crowd><option value="revised">Revised wave + airflow</option><option value="wedge">Earlier bow wedge</option><option value="folds">Earlier paddle folds</option></select></label><label>New cue <select data-candidate-style><option value="a">Treatment A</option><option value="b">Treatment B</option></select></label><label><input type="checkbox" data-static> Still / reduced motion</label><label>Facing <select data-facing><option value="left">Left</option><option value="right">Right</option><option value="turn">Turn</option></select></label><label><input type="checkbox" data-drama> Drama lighting</label><button type="button" data-play>Play</button><button type="button" data-replay>Replay</button><label>Time <input data-time type="range" min="0" max="4" value="0" step="0.01"></label></div><div class="stage" aria-label="Synthetic ability demonstration">${selected.map(([id,palette,x,y])=>`<div class="runner" data-id="${id}" ${large&&id==='B'?'hidden':''} style="left:${large?(id==='A'?50:70):x}%;top:${large?68:y}%"><div class="shadow"></div><div class="water-effects" aria-hidden="true"></div><div class="air-effects" aria-hidden="true"></div><div class="body">${createDigitalDuckSvg({prefix:`p58-${instance}-${id}`,label:`Duck ${id}`,palette,hat:id==='C'?'sailor-cap':'none'})}</div><div class="air-front-effects" aria-hidden="true"></div><div class="candidate-effects" aria-hidden="true"></div><div class="cue"></div><span class="name">Duck ${id}</span></div>`).join('')}</div><p class="status" aria-live="polite"></p><p class="legend">Bounce and crowd-air directions are owner-selected; Guard, Quick Recovery and Dive are candidate treatments; predicted threat, activation and contact are separately authored events; contact positions are illustrative. Timing, air interaction, landing, targeting and effects remain undecided.</p>`;
 const el=n=>host.querySelector(`[data-${n}]`), stage=host.querySelector('.stage'), duck=host.querySelector('[data-id="A"]');
 let playing=false, raf=0, last=null, disposed=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function render(){
  const t=Number(el('time').value), active=stateAt(scenarios[el('scene').value].events,t), bounce=active.find(e=>e.type==='bounce'), crowd=active.find(e=>e.type==='crowd'), contact=active.find(e=>e.type==='contact'), threat=active.find(e=>e.type==='threat'), guard=active.find(e=>e.type==='guard'), recovery=active.find(e=>e.type==='recovery'), dive=active.find(e=>e.type==='dive');
  const still=el('static').checked||reduced.matches;
  const partnerScenes=['guard','guard-control','recovery','recovery-control'];const scene=el('scene').value;const partnered=large&&partnerScenes.includes(scene);const base=large?(partnered?35:50):37;
  if(large){const explanation=scene.startsWith('guard')?'After contact, Guard may activate a response. Its exact effect remains open.':scene.startsWith('recovery')?'After contact, Quick Recovery may shorten the return to the lane. Injury is separate.':scene.startsWith('dive')?'Dive may submerge the duck. The candidate is slower and collision-immune while underwater.':'When a collision seems imminent, this duck may prepare and bounce. In a crowd it may activate a separate acceleration cue.';host.querySelector('[data-explanation]').textContent=explanation;}
  const displaced=scene==='recovery'?(recovery?4*(1-recovery.phase):(t>=1&&t<1.5?4:0)):(scene==='recovery-control'&&t>=1?4:0);
  duck.style.left=`${base+displaced+(scene==='dive'?diveTravel(t)*(el('facing').value==='right'?1:-1):0)}%`;
  const other=host.querySelector('[data-id="B"]'); if(other){if(large)other.hidden=!partnered;const guardScene=scene==='guard'||scene==='guard-control';const approach=guardScene?guardApproach(t):(contact?1:0);const otherBase=large?70:50;other.style.left=`calc(${otherBase+(base+displaced-otherBase)*approach}% + ${duck.getBoundingClientRect().width*(large?.7:.8)*approach}px)`;other.querySelector('.name').style.bottom=contact?`calc(100% + ${duck.querySelector('.name').offsetHeight+4}px)`:'';}
  const lift=bounce?(still?0.65:Math.sin(Math.PI*bounce.phase)):0;
  const underwater=!!dive && dive.phase>=.2 && dive.phase<.8;const immersion=dive?Math.max(0,Math.min(1,dive.phase/.2,(1-dive.phase)/.2)):0;const dip=22*immersion;
  duck.querySelector('.body').style.opacity=String(1-.58*immersion);
  duck.querySelector('.body').style.transform=`translateY(${dip-lift*38}%) perspective(180px) rotateY(${el('facing').value==='right'?180:el('facing').value==='turn'?65:0}deg)`;
  duck.querySelector('.cue').style.transform=el('facing').value==='right'?'scaleX(-1)':el('facing').value==='turn'?'scaleX(.55)':'scaleX(1)';
  const primaryName=duck.querySelector('.name');primaryName.textContent=underwater?'Duck A · underwater':'Duck A';primaryName.style.bottom=`${100+lift*40}%`;
  const direction=el('facing').value==='right'?'scaleX(-1)':el('facing').value==='turn'?'scaleX(.55)':'scaleX(1)';
  const water=duck.querySelector('.water-effects'), air=duck.querySelector('.air-effects'), airFront=duck.querySelector('.air-front-effects');water.style.transform=direction;air.style.transform=direction;airFront.style.transform=direction;
  water.innerHTML=(dive&&el('candidate-style').value==='a'?diveLayer(dive.phase,'behind'):'')+(bounce&&el('bounce').value==='revised'?padAndForce(bounce.phase,still):'')+(crowd&&!bounce&&el('crowd').value==='revised'?bowWave(crowd.phase,still):'');
  air.innerHTML=crowd&&el('crowd').value==='revised'?airCurrents(crowd.phase,still,'behind'):'';
  airFront.innerHTML=(crowd&&el('crowd').value==='revised'?airCurrents(crowd.phase,still,'front'):'')+(dive&&el('candidate-style').value==='a'?diveLayer(dive.phase,'front'):'');
  const wing=duck.querySelector('[id$="-wing-group"]');if(wing){wing.style.transformBox='view-box';wing.style.transformOrigin='52% 56%';const angle=bounce&&el('bounce').value==='revised'?(still?-28:Math.sin(bounce.phase*Math.PI*6)*32):0;wing.style.transform=`rotate(${angle}deg)`;}
  const style=el('candidate-style').value;const candidates=duck.querySelector('.candidate-effects');candidates.style.transform=direction;
  candidates.innerHTML=(guard?guardCue(guard.phase,style==='a'?'tab':'arc',still):'')+(recovery?recoveryCue(recovery.phase,style==='a'?'arc':'fold',still):'')+(dive&&style==='b'?diveCue(dive.phase,'marker',still):'');
  // Water accents end while airborne: overlap uses text, not imaginary paddling.
  let contents=''; if(threat)contents+='<span class="threat-mark" aria-hidden="true">⌃</span>'; if(contact&&(!large||partnerScenes.includes(scene)))contents+='<span class="contact-mark" aria-hidden="true"></span>';
  if(bounce&&el('bounce').value!=='revised')contents+=icon(el('bounce').value); if(crowd&&!bounce&&el('crowd').value!=='revised')contents+=icon(el('crowd').value);
  duck.querySelector('.cue').innerHTML=contents; stage.classList.toggle('drama',el('drama').checked);
  const descriptions={bounce:'Bounce active',crowd:'crowd acceleration active',guard:'Guard response active (candidate)',recovery:'Quick Recovery active (candidate)',injury:'injured (separate fixture)',dive:underwater?'underwater: candidate slower and collision-immune':diveStages(dive?.phase??0).stage};
  const ended=t>=3.3&&scene==='dive'?'A: resurfaced (fixture)':t>=2.9&&scene==='guard'?'A: Guard response ended':t>=3.2&&scene==='recovery'?'A: Quick Recovery ended':'';
  const status=active.length?active.map(e=>e.type==='contact'?`Contact: ${e.source} and ${e.targets.join(', ')}`:e.type==='threat'?`${e.source}: predicted threat near ${e.targets.join(', ')}`:`${e.source}: ${descriptions[e.type]}`).concat(ended?[ended]:[]).join(' · '):(ended||'No authored event active.');
  const statusNode=host.querySelector('.status');if(statusNode.textContent!==status)statusNode.textContent=status;
  // Candidate scenes use collision-aware, stage-clamped upright participant labels.
  // Accepted Bounce/crowd controls retain their prior label placement.
  if(partnerScenes.includes(scene)||scene==='dive'||scene==='dive-control'){
   const stageRect=stage.getBoundingClientRect(),occupied=[];const visibleRunners=[...host.querySelectorAll('.runner:not([hidden])')];const bodies=visibleRunners.map(r=>({runner:r,rect:r.querySelector('.body').getBoundingClientRect()}));
   const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
   for(const runner of visibleRunners){
    const label=runner.querySelector('.name');label.style.left='50%';label.style.top='auto';label.style.bottom='100%';label.style.transform='translateX(-50%)';
    const box=runner.getBoundingClientRect(),w=label.offsetWidth,h=label.offsetHeight,desired=box.left+box.width/2-w/2;
    label.classList.remove('contact-leader');
    if((scene==='guard'||scene==='guard-control')&&contact&&stageRect.width<400&&!large&&(runner.dataset.id==='A'||runner.dataset.id==='B')){const pair=visibleRunners.slice(0,2).map(r=>r.getBoundingClientRect()),mid=(pair[0].left+pair[0].width/2+pair[1].left+pair[1].width/2)/2,left=clamp(mid+(runner.dataset.id==='A'?-w-3:3),stageRect.left+2,stageRect.right-w-2),top=clamp(Math.min(pair[0].top,pair[1].top)-h-14,stageRect.top+2,stageRect.bottom-h-2);label.style.left=`${left-box.left}px`;label.style.top=`${top-box.top}px`;label.style.bottom='auto';label.style.transform='none';label.classList.add('contact-leader');occupied.push({left,top,right:left+w,bottom:top+h});continue;}
    const candidates=[];for(const y of [box.top-h-2,box.top-2*h-6,box.bottom+2,box.bottom+h+6,stageRect.top+2,stageRect.bottom-h-2])for(const dx of [0,-w*.6,w*.6,-w*1.2,w*1.2,-w*2,w*2]){
     const left=clamp(desired+dx,stageRect.left+2,stageRect.right-w-2),top=clamp(y,stageRect.top+2,stageRect.bottom-h-2),rect={left,top,right:left+w,bottom:top+h};
     rect.overlap=occupied.some(r=>rect.left<r.right+3&&rect.right+3>r.left&&rect.top<r.bottom+3&&rect.bottom+3>r.top)||bodies.some(({runner:owner,rect:r})=>owner!==runner&&rect.left<r.right&&rect.right>r.left&&rect.top<r.bottom&&rect.bottom>r.top);candidates.push(rect);
    }
    const chosen=candidates.find(r=>!r.overlap)||candidates[0];label.style.left=`${chosen.left-box.left}px`;label.style.top=`${chosen.top-box.top}px`;label.style.bottom='auto';label.style.transform='none';occupied.push(chosen);
   }
  }else for(const runner of host.querySelectorAll('.runner')){const label=runner.querySelector('.name');label.classList.remove('contact-leader');label.style.top='';label.style.left='';label.style.transform='';}

 }
 function tick(now){if(!playing||disposed)return;if(last!==null)el('time').value=Math.min(4,Number(el('time').value)+(now-last)/1000);last=now;render();if(Number(el('time').value)>=4){playing=false;el('play').textContent='Play';return;}raf=requestAnimationFrame(tick);}
 function pause(){playing=false;last=null;cancelAnimationFrame(raf);el('play').textContent='Play';}
 function play(){if(reduced.matches||el('static').checked)return;if(Number(el('time').value)>=4)el('time').value=0;playing=true;last=null;el('play').textContent='Pause';raf=requestAnimationFrame(tick);}
 el('play').addEventListener('click',()=>playing?pause():play()); el('replay').addEventListener('click',()=>{pause();el('time').value=0;render();play();});
 for(const name of ['scene','bounce','crowd','candidate-style','static','drama','facing','time'])el(name).addEventListener('input',()=>{if(name==='time'||name==='static')pause();render();});
 const onReduced=()=>{if(reduced.matches)pause();render();};reduced.addEventListener('change',onReduced);render();
 return ()=>{disposed=true;pause();reduced.removeEventListener('change',onReduced);host.replaceChildren();};
}
