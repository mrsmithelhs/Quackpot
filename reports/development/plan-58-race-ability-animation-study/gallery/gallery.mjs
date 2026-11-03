import { createDigitalDuckSvg } from '../../../../src/ui/duck-rig-view.mjs';
import { scenarios, stateAt } from './fixtures.mjs';

const racers=[['A','classic-yellow',37,45],['B','mallard-green',50,45],['C','bubblegum-pink',69,28],['D','classic-yellow',24,75],['E','mallard-green',53,73],['F','bubblegum-pink',78,66]];
let serial=0;
const icon = name => `<img class="motif motif-${name}" src="../art/haiku-${name}.svg" alt="">`;
export function mount(host,context="race"){
 const instance=++serial, large=context!=='race'; host.className=`study ${large?'large':''}`;
 const selected=large ? racers.slice(0,1):racers;
 host.innerHTML=`<h2>${context==='race'?'Six-duck race-scale comparison':context==='dex'?'Duck-Dex inspection example':'Racer selection example'}</h2><p>${large?'Optional explanation: When a collision seems imminent, this duck may prepare and bounce. In a crowd it may activate a separate acceleration cue.':'Synthetic six-duck scene; placements, timing and paths are authored for visual comparison.'}</p><div class="controls"><label>Scene <select data-scene>${Object.entries(scenarios).filter(([k])=>!large||k!=='control').map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label><label>Bounce <select data-bounce><option value="arc">Spring arc</option><option value="disc">Rebound pad</option></select></label><label>Crowd <select data-crowd><option value="wedge">Bow wedge</option><option value="folds">Paddle folds</option></select></label><label><input type="checkbox" data-static> Still / reduced motion</label><label>Facing <select data-facing><option value="left">Left</option><option value="right">Right</option><option value="turn">Turn</option></select></label><label><input type="checkbox" data-drama> Drama lighting</label><button type="button" data-play>Play</button><button type="button" data-replay>Replay</button><label>Time <input data-time type="range" min="0" max="4" value="0" step="0.01"></label></div><div class="stage" aria-label="Synthetic ability demonstration">${selected.map(([id,palette,x,y])=>`<div class="runner" data-id="${id}" style="left:${large?50:x}%;top:${large?68:y}%"><div class="shadow"></div><div class="body">${createDigitalDuckSvg({prefix:`p58-${instance}-${id}`,label:`Duck ${id}`,palette,hat:id==='C'?'sailor-cap':'none'})}</div><div class="cue"></div><span class="name">Duck ${id}</span></div>`).join('')}</div><p class="status" aria-live="polite"></p><p class="legend">Unselected Haiku motifs and placeholder event marks; predicted threat, activation and contact are separately authored events; contact positions are illustrative. Timing, air interaction, landing, targeting and effects remain undecided.</p>`;
 const el=n=>host.querySelector(`[data-${n}]`), stage=host.querySelector('.stage'), duck=host.querySelector('[data-id="A"]');
 let playing=false, raf=0, last=null, disposed=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function render(){
  const t=Number(el('time').value), active=stateAt(scenarios[el('scene').value].events,t), bounce=active.find(e=>e.type==='bounce'), crowd=active.find(e=>e.type==='crowd'), contact=active.find(e=>e.type==='contact'), threat=active.find(e=>e.type==='threat');
  const still=el('static').checked||reduced.matches;
  const other=host.querySelector('[data-id="B"]'); if(other){other.style.left=contact?`calc(37% + ${duck.getBoundingClientRect().width * .8}px)`:'50%';other.querySelector('.name').style.bottom=contact?`calc(100% + ${duck.querySelector('.name').offsetHeight+4}px)`:'';}
  const lift=bounce?(still?0.65:Math.sin(Math.PI*bounce.phase)):0;
  duck.querySelector('.body').style.transform=`translateY(${-lift*38}%) perspective(180px) rotateY(${el('facing').value==='right'?180:el('facing').value==='turn'?65:0}deg)`;
  duck.querySelector('.cue').style.transform=el('facing').value==='right'?'scaleX(-1)':el('facing').value==='turn'?'scaleX(.55)':'scaleX(1)';
  duck.querySelector('.name').style.bottom=`${100+lift*40}%`;
  // Water accents end while airborne: overlap uses text, not imaginary paddling.
  let contents=''; if(threat)contents+='<span class="threat-mark" aria-hidden="true">⌃</span>'; if(contact&&!large)contents+='<span class="contact-mark" aria-hidden="true"></span>';
  if(bounce)contents+=icon(el('bounce').value); if(crowd&&!bounce)contents+=icon(el('crowd').value);
  duck.querySelector('.cue').innerHTML=contents; stage.classList.toggle('drama',el('drama').checked);
  host.querySelector('.status').textContent=active.length?active.map(e=>e.type==='contact'?`Contact: ${e.source} and ${e.targets.join(', ')}`:e.type==='threat'?`${e.source}: predicted threat near ${e.targets.join(', ')}`:`${e.source}: ${e.type==='crowd'?'crowd acceleration':'Bounce'} active`).join(' · '):'No authored event active.';
 }
 function tick(now){if(!playing||disposed)return;if(last!==null)el('time').value=Math.min(4,Number(el('time').value)+(now-last)/1000);last=now;render();if(Number(el('time').value)>=4){playing=false;el('play').textContent='Play';return;}raf=requestAnimationFrame(tick);}
 function pause(){playing=false;last=null;cancelAnimationFrame(raf);el('play').textContent='Play';}
 function play(){if(reduced.matches||el('static').checked)return;if(Number(el('time').value)>=4)el('time').value=0;playing=true;last=null;el('play').textContent='Pause';raf=requestAnimationFrame(tick);}
 el('play').addEventListener('click',()=>playing?pause():play()); el('replay').addEventListener('click',()=>{pause();el('time').value=0;render();play();});
 for(const name of ['scene','bounce','crowd','static','drama','facing','time'])el(name).addEventListener('input',()=>{if(name==='time'||name==='static')pause();render();});
 const onReduced=()=>{if(reduced.matches)pause();render();};reduced.addEventListener('change',onReduced);render();
 return ()=>{disposed=true;pause();reduced.removeEventListener('change',onReduced);host.replaceChildren();};
}
