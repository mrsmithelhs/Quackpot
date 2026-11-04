// Report-local candidate effects. Phases are authored presentation, not game rules.
const wrap=(kind,body)=>`<svg class="${kind}" viewBox="0 0 256 256" aria-hidden="true">${body}</svg>`;
export function guardCue(phase,style='tab',still=false){
 const v=still?1:Math.min(1,phase*5);
 return style==='tab'
  ?wrap('guard-cue',`<g opacity="${v}"><path d="M178 74 L225 84 L225 138 L178 148 Z" fill="#f6efd9" stroke="#294553" stroke-width="7"/><path d="M189 94 L213 99 M189 112 L213 117 M189 130 L213 135" stroke="#438c86" stroke-width="6" stroke-linecap="round"/></g>`)
  :wrap('guard-cue',`<g opacity="${v}" fill="none" stroke="#f6efd9" stroke-width="10" stroke-linecap="round"><path d="M190 76 Q226 108 190 146"/><path d="M201 86 Q226 110 201 135" stroke="#294553" stroke-width="4"/></g>`);
}
export function recoveryCue(phase,style='arc',still=false){
 const v=still ? .65 : phase;
 return style==='arc'
  ?wrap('recovery-cue',`<path d="M200 178 Q176 218 95 205" fill="none" stroke="#f6efd9" stroke-width="11" stroke-linecap="round" stroke-dasharray="70 30" stroke-dashoffset="${-v*60}"/><path d="M113 192 L95 205 L116 211" fill="none" stroke="#294553" stroke-width="5"/>`)
  :wrap('recovery-cue',`<g fill="none" stroke="#f6efd9" stroke-width="9" stroke-linecap="round"><path d="M192 180 Q153 ${210-v*12} 105 197"/><path d="M185 195 Q152 ${220-v*12} 112 212"/></g>`);
}
export function diveCue(phase,style='ring',still=false){
 const scale=still?1:.9+.1*Math.sin(phase*Math.PI);
 return wrap('dive-cue',`<g transform="translate(128 180) scale(${scale}) translate(-128 -180)"><ellipse cx="128" cy="180" rx="86" ry="20" fill="#6ab4b1" fill-opacity=".72" stroke="#245d68" stroke-width="6"/><path d="M59 177 Q128 163 197 177" fill="none" stroke="#f1f7ee" stroke-width="5"/>${style==='marker'?'<path d="M125 133 L113 150 H121 V163 H129 V150 H137 Z" fill="#f6efd9" stroke="#245d68" stroke-width="4"/>':'<ellipse cx="128" cy="180" rx="48" ry="10" fill="none" stroke="#d6f2ea" stroke-width="4"/>'}</g>`);
}
