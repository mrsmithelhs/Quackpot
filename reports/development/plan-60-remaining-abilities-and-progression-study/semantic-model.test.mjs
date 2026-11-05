import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from './semantic-model.mjs';

const pred = (t=100, overrides={}) => ({type:'opportunity', ability:'guard', t, ...overrides});
const hit = (t=200, draws) => ({type:'contact', t, draws});
const run = (events, ability='guard', options={}) => simulate(events,{ability,...options});
const count = (r,type) => r.trace.filter(x => x.type===type).length;
const pair = (events,options={}) => [run(events,'none',options),run(events,'guard',options)];
const cases = {
  G1() { const [a,b]=pair([pred(),hit()]); assert.deepEqual([a.injured.A,b.injured.A,b.injured.B],[true,false,false]); },
  G2() { const [a,b]=pair([pred(),hit(200,{A:.025,B:.15})]); assert.equal(a.injured.A,true); assert.equal(b.injured.A,true); },
  G3() { const [a,b]=pair([pred(),hit(200,{A:.15,B:.15})]); assert.equal(a.injured.A,false); assert.equal(b.injured.A,false); },
  G4() { const b=run([pred(),hit()],'guard',{injuredA:true}); assert.equal(b.injured.A,true); assert.equal(count(b,'injury'),0); },
  G5() { const [a,b]=pair([pred(),hit(200,{A:.15,B:.15})],{risk:.2}); assert.deepEqual([a.injured.A,b.injured.A,b.injured.B],[true,false,true]); },
  G6() { assert.equal(run([pred(),hit(600)]).injured.A,true); },
  G7() { assert.equal(run([pred(),hit(800)]).injured.A,true); },
  G8() { const b=run([pred(100),hit(100)]); assert.equal(b.injured.A,true); assert.equal(b.trace[0].type,'contact'); },
  G9() { const b=run([pred()]); assert.equal(count(b,'activation'),1); assert.equal(count(b,'contact'),0); },
  Q1() { const events=[hit(),{type:'recovery',t:200}]; const a=run(events,'none'),b=run(events,'quick-recovery'); assert.equal(b.injured.A,a.injured.A); assert.equal(b.trace.at(-1).seconds,.7); },
  Q2() { const b=run([hit(),{type:'recovery',t:200}],'quick-recovery',{injuredA:true}); assert.equal(b.injured.A,true); assert.equal(b.trace.at(-1).seconds,.7); },
  Q3() { const b=run([],'quick-recovery'); assert.equal(count(b,'authored-recovery'),0); },
  S1() { const b=run([hit(),{type:'recovery',t:200}],'straight-shooter'); assert.equal(b.injured.A,true); assert.equal(b.trace.at(-1).seconds,1); /* heading physics unobserved */ },
  S2() { const b=run([hit(),{type:'obstacle',path:'original',t:201}],'straight-shooter'); assert.equal(b.trace.at(-1).type,'authored-obstacle-label'); },
  S3() { const b=run([hit(),{type:'obstacle',path:'off-line',t:201}],'straight-shooter'); assert.equal(count(b,'contact'),1); },
  D1() { const b=run([{type:'dive',t:100},hit()],'dive'); assert.equal(count(b,'contact'),0); },
  D2() { const b=run([{type:'dive',t:100},{type:'surface',t:400},hit(400)],'dive'); assert.equal(b.injured.A,true); assert.equal(count(b,'contact'),1); },
  D3() { const b=run([{type:'dive',t:100},{type:'crossing',t:300}],'dive'); assert.equal(count(b,'crossing-witness'),1); },
  F1() { const b=run([{type:'flight',t:100},hit()],'flap-ahead'); assert.equal(count(b,'contact'),0); },
  F2() { const b=run([{type:'flight',t:100},{type:'flight',t:100,who:'B'},hit()],'flap-ahead'); assert.equal(b.injured.A,true); },
  F3() { const b=run([{type:'flight',t:100},{type:'land',t:400},hit(400)],'flap-ahead'); assert.equal(b.injured.A,true); },
  W1() { const b=run([{type:'flap',t:100}],'wide-flap'); assert.equal(count(b,'authored-displacement'),0); },
  W2() { const b=run([{type:'flap',t:100,target:'B'},hit(300)],'wide-flap'); assert.equal(count(b,'authored-displacement'),1); assert.equal(count(b,'contact'),1); },
  DR1() { const b=run([{type:'opportunity',ability:'draft',target:'B',t:100},{type:'crowd',t:600}],'draft'); assert.equal(b.target,null); assert.equal(count(b,'window-ended'),1); },
  DR2() { const b=run([{type:'opportunity',ability:'draft',eligible:false,t:100}],'draft'); assert.equal(count(b,'activation'),0); },
  DR3() { const b=run([{type:'opportunity',ability:'draft',target:'B',t:100},{type:'finish',who:'B',t:300}],'draft'); assert.equal(b.target,null); },
  WB1() { const b=run([{type:'opportunity',ability:'wake-break',target:'B',t:100},{type:'crowd',t:600}],'wake-break'); assert.equal(b.target,null); assert.equal(count(b,'injury'),0); },
  WB2() { const b=run([{type:'opportunity',ability:'wake-break',target:'B',t:100},{type:'finish',who:'B',t:300}],'wake-break'); assert.equal(b.target,null); },
  N1() { const b=run([{type:'weave',t:200}],'steady-nerves'); assert.equal(b.trace[0].degrees,12); },
  N2() { const b=run([hit()],'steady-nerves'); assert.equal(b.injured.A,true); assert.equal(count(b,'authored-weave'),0); },
  X1() { const b=run([{type:'opportunity',ability:'bounce',t:100},hit(400,{A:.075,B:.05})],'bounce'); assert.deepEqual([b.injured.A,b.injured.B],[false,true]); },
  X2() { const b=run([{type:'crowd',t:100},{type:'opportunity',ability:'draft',target:'B',t:100}],'draft'); assert.equal(count(b,'independent-crowd-opportunity'),1); assert.equal(count(b,'activation'),1); },
  B1() { assert.equal(run([pred(100,{succeeds:false}),hit()]).injured.A,true); },
  B2() { const b=run([pred(),{type:'finish',t:300},hit(400)]); assert.equal(count(b,'contact'),0); assert.equal(b.injured.A,false); },
  B3() { const b=run([pred(),{type:'finish',t:300},hit(300)]); assert.equal(count(b,'contact'),0); },
  B4() { const b=run([pred(),pred(1599),pred(1600)]); assert.equal(count(b,'activation'),2); assert.equal(count(b,'no-activation'),1); },
};
for (const [id, fn] of Object.entries(cases)) test(id,fn);
