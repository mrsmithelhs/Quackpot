// Synthetic presentation events; these times and trajectories are not race rules.
export const scenarios = {
  bounce: { label:'Predicted threat, then Bounce', events:[{id:'threat',type:'threat',at:.65,end:1.35,source:'A',targets:['B']},{id:'bounce',type:'bounce',at:1.35,end:3.2,source:'A',targets:[]}] },
  crowd: { label:'Crowd acceleration', events:[{id:'surge',type:'crowd',at:.8,end:3,source:'A',targets:[]}] },
  combo: { label:'Independent overlap', events:[{id:'surge',type:'crowd',at:.55,end:2.7,source:'A',targets:[]},{id:'threat',type:'threat',at:.8,end:1.55,source:'A',targets:['B']},{id:'bounce',type:'bounce',at:1.55,end:3.4,source:'A',targets:[]}] },
  control: { label:'Threat, no activation; actual contact', events:[{id:'threat',type:'threat',at:.55,end:1.2,source:'A',targets:['B']},{id:'hit',type:'contact',at:1.2,end:1.7,source:'A',targets:['B']}] },
  guard: { label:'Guard: contact then possible response', events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']},{id:'guard',type:'guard',at:1.3,end:2.9,source:'A',targets:[]}] },
  'guard-control': { label:'Guard control: contact, no Guard activation', events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']}] },
  recovery: { label:'Quick Recovery: contact with persistent injury', events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']},{id:'injury',type:'injury',at:1.15,end:4.01,source:'A',targets:[]},{id:'recovery',type:'recovery',at:1.5,end:3.2,source:'A',targets:[]}] },
  'recovery-control': { label:'Recovery control: contact and injury, no response', events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']},{id:'injury',type:'injury',at:1.15,end:4.01,source:'A',targets:[]}] },
  dive: { label:'Dive: submerge and resurface', events:[{id:'dive',type:'dive',at:.8,end:3.3,source:'A',targets:[]}] },
  'dive-control': { label:'Dive control: no activation', events:[] },
  wide: {label:'Wide Flap: nearby duck yields',events:[{id:'wide',type:'wide',at:.8,end:3.2,source:'A',targets:['B']}]},
  'wide-control': {label:'Wide Flap control: nearby, no activation',events:[]},
  ahead: {label:'Flap Ahead: airborne pass',events:[{id:'ahead',type:'ahead',at:.8,end:3.2,source:'A',targets:['B']}]},
  'ahead-control': {label:'Flap Ahead control: no activation',events:[]},
  draft: {label:'Draft: follow leader then disengage',events:[{id:'draft',type:'draft',at:.8,end:2.8,source:'A',targets:['B']}]},
  'draft-control': {label:'Draft control: leader, no activation',events:[]},
  straight: {label:'Straight Shooter: contact then possible response',events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']},{id:'straight',type:'straight',at:1.35,end:3.15,source:'A',targets:[]}]},
  'straight-control': {label:'Straight Shooter control: contact, no activation',events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']}]},
  steady: {label:'Steady Nerves: self-wobble with response',events:[{id:'wobble',type:'wobble',at:.65,end:3.2,source:'A',targets:[]},{id:'steady',type:'steady',at:1.2,end:3.2,source:'A',targets:[]}]},
  'steady-control': {label:'Steady Nerves control: self-wobble, no activation',events:[{id:'wobble',type:'wobble',at:.65,end:3.2,source:'A',targets:[]}]},
  wake: {label:'Wake Break: source A with follower B',events:[{id:'wake',type:'wake',at:.8,end:3.1,source:'A',targets:['B']}]},
  'wake-control': {label:'Wake Break control: follower, no activation',events:[]},
};
export function stateAt(events,time) { return events.filter(e=>time>=e.at && time<e.end).map(e=>({...e,phase:(time-e.at)/(e.end-e.at)})); }

// Continuous, authored comparison path: shared by Guard and its control.
export function guardApproach(time) {
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 return smooth((time-.5)/.5)*(1-smooth((time-1.55)/.5));
}
// Position is illustrative, phase-derived, and persists at the surfaced endpoint.
export function diveTravel(time) { return 12*Math.max(0,Math.min(1,(time-.8)/2.5)); }
