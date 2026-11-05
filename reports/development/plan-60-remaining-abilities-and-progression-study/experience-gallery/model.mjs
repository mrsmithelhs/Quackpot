// Authored illustration only: no resolver, physical simulation or selected timing values.
export const kinds=['none','guard','recovery','straight'];
export function frame(kind,scene,t){
 if(!kinds.includes(kind)||!['contact','open'].includes(scene)||!Number.isFinite(t)||t<0||t>100) throw Error('invalid frame');
 const collision=scene==='contact'; const after=Math.max(0,t-50); let offset=0;
 if(collision&&after>0){ const amplitude=kind==='straight'?15:32; const duration=kind==='recovery'?25:45; offset=amplitude*Math.max(0,1-Math.abs(after-duration/3)/(duration*2/3)); }
 const active=kind==='guard'?t>=30&&t<60:kind==='recovery'?collision&&t>=50&&t<75:kind==='straight'?collision&&t>=45&&t<70:false;
 const used=kind==='guard'?t>=30:kind==='recovery'?collision&&t>=50:kind==='straight'?collision&&t>=45:false;
 const state=kind==='none'?'No ability window':active?'Example window active':used?'Example cooldown':'Waiting for an opportunity';
 return {x:75+t*2.35,y:91+offset,rivalX:collision?182+t*1.0:200+t*1.0,rivalY:collision?91:45,active,state,contact:collision&&t>=50,heading:kind==='straight'?0:offset*.5};
}
