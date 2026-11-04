// Report-local visual studies, redrawn from qualified consultant concepts.
// All geometry is presentation-only and has no game outcome.
const wrap=(name,body)=>`<svg class="${name}" viewBox="0 0 256 256" aria-hidden="true">${body}</svg>`;
const amount=p=>Math.max(0,Math.min(1,p*5,(1-p)*5));
export function wideAlternative(phase,style='a'){
 const v=amount(phase);
 return style==='a'?wrap('wide-alt-a',`<g fill="none" stroke-linecap="round" opacity="${v}"><g stroke="#254f5a" stroke-width="12"><path d="M165 91 Q205 120 165 150"/><path d="M180 77 Q238 120 180 164"/></g><g stroke="#eff9f0" stroke-width="6"><path d="M165 91 Q205 120 165 150"/><path d="M180 77 Q238 120 180 164"/></g></g>`):wrap('wide-alt-b',`<g opacity="${v}" fill="#e3f8f3" stroke="#285762" stroke-width="5"><path d="M163 121 Q179 89 198 91 Q208 96 201 107 Q222 101 226 116 Q227 126 215 130 Q228 137 219 147 Q207 155 195 143 Q190 159 177 150 Q169 143 163 121 Z"/><path d="M173 121 Q188 114 200 107 M173 121 Q194 121 215 130 M173 121 Q187 135 195 143" fill="none" stroke-width="3"/></g>`);
}
export function aheadAlternative(phase,style='a'){
 const v=amount(phase);
 return style==='a'?wrap('ahead-alt-a',`<g opacity="${v}" fill="none" stroke="#2d626d" stroke-linecap="round"><path d="M83 185 Q128 197 173 185" stroke-width="9"/><path d="M94 185 Q128 192 162 185" stroke="#e7faf4" stroke-width="4"/></g>`):wrap('ahead-alt-b',`<g opacity="${v}" fill="none" stroke-linecap="round"><g stroke="#285762" stroke-width="12"><path d="M158 110 Q185 119 195 138"/><path d="M171 98 Q201 109 213 130"/></g><g stroke="#e7f8f4" stroke-width="6"><path d="M158 110 Q185 119 195 138"/><path d="M171 98 Q201 109 213 130"/></g></g>`);
}
// Stage-coordinate paths explicitly link the leader and follower; no arrowheads.
export function draftAlternative(phase,style,layer,geometry){
 const {width,height,leaderX,followerX,y,duckWidth}=geometry;const v=amount(phase);const sign=leaderX<followerX?-1:1;
 const from=leaderX-sign*duckWidth*.25,to=followerX+sign*duckWidth*.27,mid=(from+to)/2;
 let paths;
 if(style==='a')paths=layer==='back'?`<path d="M${from} ${y-8} Q${mid} ${y-19} ${to} ${y-8}"/><path d="M${from} ${y-1} Q${mid} ${y-11} ${to} ${y-1}"/>`:`<path d="M${from} ${y+12} Q${mid} ${y+18} ${to} ${y+12}"/>`;
 else {const far=followerX-sign*duckWidth*.60;paths=layer==='back'?`<path d="M${from} ${y-10} Q${mid} ${y-28} ${far} ${y-20} Q${far-sign*duckWidth*.12} ${y-11} ${far} ${y-4}"/>`:`<path d="M${from} ${y+12} Q${mid} ${y+26} ${far} ${y+20} Q${far-sign*duckWidth*.12} ${y+12} ${far} ${y+5}"/>`;}
 return `<svg class="draft-alt-${style} draft-${layer}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><g opacity="${v}" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#315e69" stroke-width="7">${paths}</g><g stroke="#e0f7f1" stroke-width="3.5">${paths}</g></g></svg>`;
}
export function aerodynamicPose(phase){const v=amount(phase);return {dx:v?-3*v:0,dy:2*v,angle:v?-9*v:0,bridge:v};}
