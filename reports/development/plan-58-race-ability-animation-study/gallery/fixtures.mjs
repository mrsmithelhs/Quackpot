// Synthetic presentation events; these times and trajectories are not race rules.
export const scenarios = {
  bounce: { label:'Predicted threat, then Bounce', events:[{id:'threat',type:'threat',at:.65,end:1.35,source:'A',targets:['B']},{id:'bounce',type:'bounce',at:1.35,end:3.2,source:'A',targets:[]}] },
  crowd: { label:'Crowd acceleration', events:[{id:'surge',type:'crowd',at:.8,end:3,source:'A',targets:[]}] },
  combo: { label:'Independent overlap', events:[{id:'surge',type:'crowd',at:.55,end:2.7,source:'A',targets:[]},{id:'threat',type:'threat',at:.8,end:1.55,source:'A',targets:['B']},{id:'bounce',type:'bounce',at:1.55,end:3.4,source:'A',targets:[]}] },
  control: { label:'Threat, no activation; actual contact', events:[{id:'threat',type:'threat',at:.55,end:1.2,source:'A',targets:['B']},{id:'hit',type:'contact',at:1.2,end:1.7,source:'A',targets:['B']}] },
};
export function stateAt(events,time) { return events.filter(e=>time>=e.at && time<e.end).map(e=>({...e,phase:(time-e.at)/(e.end-e.at)})); }
