// Frozen shared inputs for finite Node/Chromium probe comparison only.
import { LIMIT, TURN, checked, cordic, isqrt, parseCanonicalInteger, roundEven, squareDistanceContact, vectorAngle, wrapTurns } from '../integer-math.mjs';
import { boundaryDecision, ratingTarget } from '../decision-probe.mjs';
import { BEND, integerFrame } from '../course-probe.mjs';
import { decodeProbeState, encodeProbeState, probeDraw } from '../canonical-probe.mjs';

const canonical = (value) => JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v));
export function runFixedProbes(data) {
  const records = [];
  const record = (id, fn) => { try { records.push({ id, outcome: 'value', value: canonical(fn()) }); }
    catch (error) { records.push({ id, outcome: 'exception', category: error?.name ?? 'unknown' }); } };
  for (const [i,v] of data.vectors.entries()) {
    record(`rotation/${i}`, () => cordic(BigInt(v.angle),data));
    record(`vectoring/${i}`, () => vectorAngle(BigInt(v.cos_q62),BigInt(v.sin_q62),data));
  }
  for (const [name,x,y] of [['east',1n,0n],['north',0n,1n],['west',-1n,0n],['south',0n,-1n],
    ['ne',1n,1n],['nw',-1n,1n],['sw',-1n,-1n],['se',1n,-1n]]) record(`axis/${name}`,()=>vectorAngle(x,y,data));
  for (const n of [0n,1n,2n,3n,4n,15n,16n,LIMIT]) record(`isqrt/${n}`,()=>isqrt(n));
  for (const [n,d] of [[5n,2n],[7n,2n],[-5n,2n],[-7n,2n]]) record(`round/${n}/${d}`,()=>roundEven(n,d));
  record('wrap/minus-one',()=>wrapTurns(-1n)); record('checked/overflow',()=>checked(LIMIT+1n));
  record('vector/zero',()=>vectorAngle(0n,0n,data)); record('vector/oversize',()=>vectorAngle(1n<<101n,1n,data));
  record('isqrt/negative',()=>isqrt(-1n));
  for (const s of ['-0','+1','01','1.0','9'.repeat(41)]) record(`integer/${s}`,()=>parseCanonicalInteger(s));
  for (const p of [0n,30000000n,30000000n+BEND,90000000n+BEND]) record(`frame/${p}`,()=>integerFrame(p,0n,data));
  record('frame/outside',()=>integerFrame(0n,6000001n,data));
  for (const [p,q] of [[0n,1000000n],[40000000n,41000000n],[40000000n,41010000n]]) record(`course-contact/${p}/${q}`,()=>{
    const a=integerFrame(p,0n,data), b=integerFrame(q,0n,data);
    return { a,b,contact:squareDistanceContact(b.x-a.x,b.y-a.y,1000000n) };
  });
  for (const distance of [999999n,1000000n,1000001n]) record(`contact/${distance}`,()=>squareDistanceContact(distance,0n,1000000n));
  for (const finishDelta of [499999n,500000n,500001n]) record(`finish/${finishDelta}`,()=>boundaryDecision({dx:1000001n,dy:0n,diameter:1000000n,finishDelta,velocity:10000000n,dtMicros:50000n}));
  record('boundary/exact-tie',()=>boundaryDecision({dx:1000000n,dy:0n,diameter:1000000n,finishDelta:500000n,velocity:10000000n,dtMicros:50000n}));
  record('boundary/no-progress',()=>boundaryDecision({dx:2000000n,dy:0n,diameter:1000000n,finishDelta:1n,velocity:1n,dtMicros:1n}));
  record('rating/injury-rest',()=>ratingTarget(10000000n,500000n,1000000n,true));
  record('rating/down-injury',()=>ratingTarget(10000000n,1000000n,1050000n,true));
  const state={id:'P',progress:10n,lateral:-2n,angle:3n};
  record('serialization/canonical',()=>({bytes:encodeProbeState(state),decoded:decodeProbeState(encodeProbeState(state))}));
  for (const [name,value] of [['missing','{}'],['invalid-json','{'],['oversized','x'.repeat(4097)],
    ['negative-zero','{"schema":"numeric-probe/v1","id":"P","progress":"-0","lateral":"0","angle":"0"}']]) record(`serialization/${name}`,()=>decodeProbeState(value));
  record('serialization/overflow',()=>encodeProbeState({...state,progress:LIMIT+1n}));
  for (const [domain,id] of [['injury','A'],['injury','B'],['activation','A'],['injury','A']]) record(`draw/${domain}/${id}/${records.length}`,()=>probeDraw('seed',domain,id));
  record('draw/unpaired-surrogate',()=>probeDraw('seed','injury','\ud800'));
  return { schema:'plan59.cross-runtime-probe/v1', encoding:'json-utf8-bigint-decimal/v1', turn:TURN.toString(), records };
}
