import {renderScene} from '../../../src/assets/apartment/index.mjs';
import {tvUnit,sofa} from '../../../src/assets/apartment/props/living.mjs';
import {composeDuckSvg} from '../../../src/core/duck-rig.mjs';

const NS='http://www.w3.org/2000/svg';
export function screenCounterAngle(angle){const turns=Math.floor(angle/90),phase=((angle%90)+90)%90,start=70,t=Math.max(0,Math.min(1,(phase-start)/20)),ease=t*t*(3-2*t);return -90*(turns+ease);}
export function createStage(art,furnishings,digital){
 const options={area:'desk-side',duckView:'side',light:'neutral',overlay:'none',phone:{status:'',brand:'',heading:[],body:[],note:''}};
 const base=document.createElement('div');base.className='desk-base';base.innerHTML=renderScene({...options,idPrefix:'welcome-study'}).svg;const root=base.querySelector('svg');
 // The kit deliberately paints beyond its viewBox. Remove only its two known backdrop planes,
 // retaining the desk, window, lamp, phone and the exact physical-duck art.
 for(const y of ['-600','500']){const nodes=root.querySelectorAll(`:scope > rect[x="-900"][y="${y}"]`);if(nodes.length!==1)throw Error(`Desk backdrop anchor changed: ${y}`);nodes[0].remove();}
 const phones=root.querySelectorAll('[id$="-phone-side"]');if(phones.length!==1)throw Error('Desk phone anchor changed');const phoneAnchor=phones[0],phoneFaces=phoneAnchor.querySelectorAll(':scope > g[transform^="translate("]');if(phoneFaces.length!==1)throw Error('Phone face anchor changed');const phone=document.createElementNS(NS,'g');phone.classList.add('phone-rotator');phoneAnchor.append(phone);phone.append(phoneFaces[0]);
 // Screen overlay rotates independently of its casing. Coordinates derive from the kit's phone dimensions.
 const clip=document.createElementNS(NS,'clipPath');clip.id='welcome-phone-screen-clip';clip.innerHTML='<rect x="635" y="130" width="110" height="226" rx="14"/>';root.querySelector('defs').append(clip);const screenClipGroup=document.createElementNS(NS,'g');screenClipGroup.setAttribute('clip-path','url(#welcome-phone-screen-clip)');const screen=document.createElementNS(NS,'g');screen.setAttribute('class','phone-screen');screen.innerHTML='<rect x="570" y="128" width="240" height="240" fill="#1f2c38"/><text x="690" y="246" fill="#ffd15a" font-size="14" font-family="system-ui,sans-serif" font-weight="800" text-anchor="middle">QUACKPOT</text><path d="M672 274q0-14 15-14q10 0 12 8l8 4l-8 4q-3 10-14 10q-13 0-13-12z" fill="#f4bb31"/>';screenClipGroup.append(screen);phone.append(screenClipGroup);
 const focus=document.createElement('div');focus.className='focus-layer';focus.innerHTML=renderScene({...options,light:'warm',idPrefix:'welcome-focus'}).svg;const focusSvg=focus.querySelector('svg'),lamps=focusSvg.querySelectorAll(':scope > g[id$="-lamp-side"]'),ducks=focusSvg.querySelectorAll(':scope > svg[aria-label$="rubber duck on the desk"]');if(lamps.length!==1||ducks.length!==1)throw Error('Naming lamp/duck anchors changed');const lamp=lamps[0],duck=ducks[0];for(const child of [...focusSvg.children])if(!['defs','style'].includes(child.localName)&&child!==lamp&&child!==duck)child.remove();
 const dim=document.createElement('div');dim.className='scene-dim';art.replaceChildren(base,dim,focus);
 furnishings.innerHTML=`<svg class="furniture tv" viewBox="-700 -1250 1400 1300" aria-hidden="true">${tvUnit(false)}</svg><svg class="furniture couch" viewBox="-800 -900 1600 950" aria-hidden="true">${sofa(1500)}</svg>`;
 digital.innerHTML=[0,1,2].map(i=>`<span>${composeDuckSvg({prefix:`welcome-digital-${i}`,palette:['classic-yellow','mallard-green','bubblegum-pink'][i],paperMode:'hybrid'})}</span>`).join('');
 let paused=false,elapsed=0,last=null,animationFrameId=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function draw(now){if(last!==null&&!paused&&!reduced.matches)elapsed+=Math.min(now-last,100);last=now;const angle=reduced.matches?0:(elapsed/32000*360);const normalized=angle%360;phone.setAttribute('transform',`rotate(${normalized} 690 248.4)`);screen.setAttribute('transform',`rotate(${screenCounterAngle(normalized)} 690 248.4)`);animationFrameId=requestAnimationFrame(draw);}
 animationFrameId=requestAnimationFrame(draw);
 return {setPaused(value){paused=value;document.querySelector('#app').classList.toggle('ambient-paused',value);last=null;},setNaming(value){art.classList.toggle('naming',value);document.querySelector('#app').classList.toggle('is-naming',value);},dispose(){cancelAnimationFrame(animationFrameId);}};
}
