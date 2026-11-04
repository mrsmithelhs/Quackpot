// Report-local animation geometry adapted/redrawn from Sonnet revision iteration-02.
// Explicit phase input comes from authored presentation fixtures, not race physics.
const wrap = (kind, body) => `<svg class="${kind}" viewBox="0 0 256 256" aria-hidden="true">${body}</svg>`;
export function padAndForce(phase, still=false){
 const rise=still?1:Math.min(1,Math.max(0,Math.sin(Math.PI*phase)*1.5));
 const arrow=`<path d="M-6 0 V-34 H-13 L0 -50 L13 -34 H6 V0 Z" fill="#ff684c" stroke="#4a140c" stroke-width="3"/>`;
 return wrap('force', `<ellipse cx="128" cy="218" rx="58" ry="13" fill="#8a6a3a" stroke="#4a3a20" stroke-width="4"/><g opacity="${.35+.65*rise}" transform="translate(0 ${8*(1-rise)})"><g transform="translate(92 215)">${arrow}</g><g transform="translate(128 215) scale(1 1.2)">${arrow}</g><g transform="translate(164 215)">${arrow}</g></g><ellipse cx="128" cy="218" rx="46" ry="9" fill="#f6efd9" stroke="#4a3a20" stroke-width="3"/><ellipse cx="128" cy="218" rx="25" ry="5" fill="none" stroke="#ef6a1a" stroke-width="3"/>`);
}
export function bowWave(phase,still=false){
 const ripple=still?0:Math.sin(phase*Math.PI*4)*5;
 return wrap('wave', `<g transform="translate(0 ${ripple})"><path d="M20 213 Q30 166 60 171 Q82 174 103 213 Z" fill="#9fe0d8" stroke="#256f7c" stroke-width="5"/><path d="M28 215 Q46 185 65 192 Q80 196 96 215 Z" fill="#5bbcb8" stroke="#256f7c" stroke-width="4"/><path d="M42 217 Q55 199 69 204 Q80 207 89 217 Z" fill="#2f8f99" stroke="#256f7c" stroke-width="3"/><path d="M28 202 Q50 177 72 188" fill="none" stroke="#f4fbf4" stroke-width="6" stroke-linecap="round"/></g>`);
}
export function airCurrents(phase,still=false){
 const offset=still?0:-phase*90;
 const paths=['M235 120 C216 54 126 23 65 68 C50 78 36 92 24 110','M235 151 C190 92 119 78 65 112 C49 121 37 131 25 145'];
 return wrap('air', paths.map(d=>`<path d="${d}" fill="none" stroke="#1f4a78" stroke-width="12" stroke-linecap="round" stroke-dasharray="100 22" stroke-dashoffset="${offset}"/><path d="${d}" fill="none" stroke="#bfe8ff" stroke-width="7" stroke-linecap="round" stroke-dasharray="100 22" stroke-dashoffset="${offset}"/>`).join('')+'<path d="M35 99 L24 110 L21 95 M37 134 L25 145 L27 130" fill="none" stroke="#bfe8ff" stroke-width="6" stroke-linecap="round"/>');
}
