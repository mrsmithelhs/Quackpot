// Synthetic presentation events; these times and trajectories are not race rules.
export const scenarios = {
  bounce: { label:'Predicted threat, then Bounce', events:[{id:'threat',type:'threat',at:.65,end:1.35,source:'A',targets:['B']},{id:'bounce',type:'bounce',at:1.35,end:3.2,source:'A',targets:[]}] },
  crowd: { label:'Crowd acceleration', events:[{id:'surge',type:'crowd',at:.8,end:3,source:'A',targets:[]}] },
  combo: { label:'Independent overlap', events:[{id:'surge',type:'crowd',at:.55,end:2.7,source:'A',targets:[]},{id:'threat',type:'threat',at:.8,end:1.55,source:'A',targets:['B']},{id:'bounce',type:'bounce',at:1.55,end:3.4,source:'A',targets:[]}] },
  control: { label:'Threat, no activation; actual contact', events:[{id:'threat',type:'threat',at:.55,end:1.2,source:'A',targets:['B']},{id:'hit',type:'contact',at:1.2,end:1.7,source:'A',targets:['B']}] },
  guard: { label:'Guard: contact then possible response', events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']},{id:'guard',type:'guard',at:1.3,end:2.9,source:'A',targets:[]}] },
  'guard-control': { label:'Guard control: contact, no response', events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']}] },
  recovery: { label:'Quick Recovery: contact with persistent injury', events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']},{id:'injury',type:'injury',at:1.15,end:4.01,source:'A',targets:[]},{id:'recovery',type:'recovery',at:1.5,end:3.2,source:'A',targets:[]}] },
  'recovery-control': { label:'Recovery control: contact and injury, no response', events:[{id:'hit',type:'contact',at:1,end:1.55,source:'A',targets:['B']},{id:'injury',type:'injury',at:1.15,end:4.01,source:'A',targets:[]}] },
  dive: { label:'Dive: submerge and resurface', events:[{id:'dive',type:'dive',at:.8,end:3.3,source:'A',targets:[]}] },
  'dive-control': { label:'Dive control: no activation', events:[] },
};
export function stateAt(events,time) { return events.filter(e=>time>=e.at && time<e.end).map(e=>({...e,phase:(time-e.at)/(e.end-e.at)})); }
