/* User-directed report-local variations for genuine upstream setTimbre; not upstream bank. */
export const revisedDrums=Object.freeze({
 36:Object.freeze([{w:'triangle',t:0,f:95,v:.85,d:.09,h:.02,p:.8,q:.06},{w:'n0',g:0,t:0,f:850,v:.13,d:.025,h:0,r:.02,p:1}].map(Object.freeze)),
 38:Object.freeze([{w:'n0',g:0,t:0,f:550,v:.60,d:.075,h:.01,r:.02,p:1},{w:'triangle',g:0,t:0,f:180,v:.10,d:.035,h:0,r:.02,p:1}].map(Object.freeze)),
 42:Object.freeze([{w:'n0',g:0,t:0,f:1250,v:.20,d:.08,h:0,r:.02,p:1}].map(Object.freeze))
});
export const revisedStopSeconds=Object.freeze({36:.315,38:.2625,42:.28});
export function validateRevisions(programs=revisedDrums){for(const n of [36,38,42]){const p=programs[n];if(!Array.isArray(p)||p.length<1||p.length>3)throw Error('operator bound');for(const op of p){if(!['triangle','n0'].includes(op.w)||!Number.isFinite(op.f)||op.f<0||op.f>2000||!Number.isFinite(op.v)||op.v<=0||op.v>1||!Number.isFinite(op.d)||op.d<=0||op.d>.1||!Number.isFinite(op.t)||op.t!==0)throw Error('invalid revised timbre');for(const [key,max] of [['g',10],['h',1],['r',1],['p',2],['q',1]])if(op[key]!==undefined&&(!Number.isFinite(op[key])||op[key]<0||op[key]>max||(key==='g'&&!Number.isInteger(op[key]))))throw Error('invalid operator parameter');}if(Math.abs(p[0].d*3.5-revisedStopSeconds[n])>1e-9)throw Error('stop duration mismatch');}return {programs:[36,38,42],maxOperators:3,maxStopSeconds:.315};}
