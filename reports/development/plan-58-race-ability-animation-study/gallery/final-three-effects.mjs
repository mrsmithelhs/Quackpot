// Report-local motion studies: authored presentation, not race mechanics.
const clamp=p=>Math.max(0,Math.min(1,p));
const envelope=p=>Math.min(1,clamp(p)*5,(1-clamp(p))*5);
const wrap=(name,body)=>`<svg class="${name}" viewBox="0 0 256 256" aria-hidden="true">${body}</svg>`;
export function straightCue(p,style){const v=envelope(p),offset=(1-clamp(p))*54;
 if(style==='a')return wrap('straight-a',`<g fill="none" stroke-linecap="round" opacity="${v}"><g stroke="#294d5c" stroke-width="11" stroke-dasharray="42 14" stroke-dashoffset="${offset}"><path d="M11 151 H84"/><path d="M11 178 H84"/></g><g stroke="#f4f8df" stroke-width="5" stroke-dasharray="42 14" stroke-dashoffset="${offset}"><path d="M11 151 H84"/><path d="M11 178 H84"/></g></g>`);
 return wrap('straight-b',`<g opacity="${v}" fill="none" stroke-linecap="round"><path d="M178 157 Q198 ${172-12*p} 186 194" stroke="#31586c" stroke-width="13"/><path d="M178 157 Q198 ${172-12*p} 186 194" stroke="#e5f4eb" stroke-width="6"/><path d="M153 196 Q173 207 190 198" stroke="#31586c" stroke-width="7"/></g>`);
}
export function steadyCue(p,style,layer){const v=envelope(p),r=66-17*clamp(p);
 if(style==='a'){const top=layer==='back'?`M${128-r} 184 A${r} 17 0 0 1 ${128+r} 184`:`M${128-r} 184 A${r} 17 0 0 0 ${128+r} 184`;return wrap(`steady-a steady-${layer}`,`<g opacity="${v}" fill="none" stroke-linecap="round"><path d="${top}" stroke="#463f79" stroke-width="11"/><path d="${top}" stroke="#e5d7f7" stroke-width="5"/></g>`);}
 const x=layer==='back'?75:182;return wrap(`steady-b steady-${layer}`,`<g opacity="${v}" fill="none" stroke-linecap="round"><path d="M${x} 104 Q${x+(layer==='back'?-12:12)*(1-p)} 145 ${x} 183" stroke="#564479" stroke-width="12"/><path d="M${x} 104 Q${x+(layer==='back'?-12:12)*(1-p)} 145 ${x} 183" stroke="#eee0fb" stroke-width="5"/></g>`);
}
export function wakeCue(p,style,layer){const v=envelope(p),q=clamp(p),drift=15*q;
 if(style==='a'){const cy=layer==='back'?173:195;return wrap(`wake-a wake-${layer}`,`<g opacity="${v}" fill="#e5f8ee" stroke="#235c67" stroke-width="5"><circle cx="${176+drift}" cy="${cy}" r="13"/><circle cx="${198+drift}" cy="${cy-4}" r="10"/><circle cx="${216+drift}" cy="${cy+3}" r="7"/></g>`);}
 const cy=layer==='back'?168:196;return wrap(`wake-b wake-${layer}`,`<g opacity="${v}" transform="rotate(${q*(layer==='back'?100:-100)} 195 ${cy})" fill="none" stroke-linecap="round"><path d="M195 ${cy} C181 ${cy-14} 173 ${cy+7} 187 ${cy+13} C202 ${cy+21} 214 ${cy+4} 209 ${cy-8}" stroke="#255e6c" stroke-width="12"/><path d="M195 ${cy} C181 ${cy-14} 173 ${cy+7} 187 ${cy+13} C202 ${cy+21} 214 ${cy+4} 209 ${cy-8}" stroke="#daf5ee" stroke-width="5"/></g>`);
}
// Starts with the same wobble; post-activation examples differ by authored presentation.
export function wobbleAngle(time,activated){const age=Math.max(0,time-.65);if(age===0||age>=2.55)return 0;const attenuation=activated&&time>1.2?Math.max(.22,1-(time-1.2)*.45):1;return Math.sin(age*Math.PI*2)*10*attenuation;}
export function straightAngle(time){const age=Math.max(0,time-1);if(age===0||age>=1.2)return 0;return Math.sin(Math.PI*age/1.2)*11;}
