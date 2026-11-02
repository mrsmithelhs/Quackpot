import { renderRenScene } from '../../assets/ren/index.mjs';
import { REN_INTRO_CHOICES, REN_INTRO_LINES } from '../../core/life-social-door.mjs';

// Apartment door: the dialogue and its actions remain normal HTML over the local SVG.
export function renderRenDoor46(root, life, callbacks, active) {
  const s = life.social46, intro = s?.revision === 2 ? s.intro : null;
  const scene = intro?.open && intro.node ? 'door' : 'closed-door';
  const stage = document.createElement('div'); stage.className = 'life-stage ren46-door-stage';
  const room = document.createElement('div'); room.className = 'life-room ren46-door-room';
  const box = document.createElement('div'); box.className = 'life-box ren46-door-box';
  const art = document.createElement('div'); art.className = 'life-scene';
  art.innerHTML = renderRenScene({idPrefix:'ren46door',scene,decorative:true}).svg; box.append(art);
  const action = (label, intent, container) => {
    const b=document.createElement('button'); b.type='button'; b.className='life-btn'; b.textContent=label; b.disabled=!active;
    b.addEventListener('click',()=>{b.disabled=true;callbacks.action(intent);}); container.append(b);
  };
  if (intro?.open && intro.node) {
    const bubble=document.createElement('div'); bubble.className='ren46-door-bubble'; bubble.setAttribute('role','status');
    const speaker=document.createElement('strong'); speaker.textContent='Ren'; const text=document.createElement('span'); text.textContent=REN_INTRO_LINES[intro.node]; bubble.append(speaker,text); box.append(bubble);
    const panel=document.createElement('section'); panel.className='ren46-door-decide'; panel.setAttribute('aria-label','Decide');
    const heading=document.createElement('strong'); heading.textContent='Decide';panel.append(heading);
    for (const [choice,label] of REN_INTRO_CHOICES[intro.node] ?? []) action(label,{type:'social46_intro_choose',choice},panel);
    if (intro.node !== 'later') action('Close for now',{type:'social46_intro_close'},panel);
    room.append(box,panel);
  } else {
    if (intro && !s.introShown && (intro.node || (intro.knockDay === life.day && intro.ignoredDay !== life.day))) {
      const knock=document.createElement('button'); knock.type='button'; knock.className='ren46-door-knock';
      const cue=document.createElement('span'); cue.textContent=intro.node ? 'Continue with Ren' : 'Someone is knocking'; knock.append(cue); knock.disabled=!active;
      knock.addEventListener('click',()=>{knock.hidden=true; choices.hidden=false; choices.querySelector('button')?.focus();}); box.append(knock);
      const choices=document.createElement('section'); choices.className='ren46-door-decide'; choices.hidden=true; choices.setAttribute('aria-label','Decide');
      const heading=document.createElement('strong'); heading.textContent='Decide';choices.append(heading);
      action('Open the door',{type:'social46_door_open'},choices);
      if (!intro.node) action('Ignore',{type:'social46_knock_ignore'},choices);
      room.append(box,choices);
    } else room.append(box);
  }
  stage.append(room); const bar=document.createElement('div');bar.className='life-day-bar';stage.append(bar); root.replaceChildren(stage);
}
