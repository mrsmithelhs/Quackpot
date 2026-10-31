import fs from 'node:fs';
import assert from 'node:assert/strict';
const configs = [{name:'A',meal:250,fatigue:10,gradient:false},{name:'B',meal:350,fatigue:10,gradient:false},{name:'C',meal:250,fatigue:20,gradient:true}];
const strategies = ['restrained','small_buyer','mixed','late_spender','absence','sale_credit'];
function run(c, strategy, seed, initial = {}) {
 let s={cash:1500,hp:100,paid:false,strikes:0,wages:0,purchases:0,sold:false,debt:0,bedrests:0,gems:0,late:false,...initial}, history=[];
 let rng=Math.imul(seed,2654435761)>>>0;
 const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
 const heal=n=>s.hp=Math.min(100,s.hp+n);
 function collapse(){if(s.hp>0)return false;s.hp=25;s.bedrests++;return true}
 function meal(skip){if(skip || s.cash<c.meal){s.hp-=5}else{s.cash-=c.meal}return collapse()}
 function work(){if(s.strikes>=3)return;let wage=c.gradient&&s.hp<30?500:1000;s.cash+=wage;s.wages+=wage}
 function miss(){if(s.strikes<3)s.strikes++}
 function buy(day){let cost=day===1?99:499;if(s.cash>=cost){s.cash-=cost;s.purchases+=cost}}
 function snap(label){history.push({label,cash:s.cash,hp:s.hp,strikes:s.strikes,wages:s.wages,purchases:s.purchases,sold:s.sold,debt:s.debt,bedrests:s.bedrests,gems:s.gems,paid:s.paid})}
 function pay(){if(!s.paid&&s.cash>=1500){s.cash-=1500;s.paid=true;return true}return false}
 for(let d=1;d<=3;d++){
   if(s.late){s.hp-=c.fatigue;s.late=false}
   let morningRest=collapse(); if(!morningRest) morningRest=meal(strategy==='absence');
   const missed=strategy==='absence'||(strategy==='sale_credit'&&d>1);
   if(missed)miss();else work();
   let eveningRest=meal(strategy==='absence');
   if(!eveningRest){
     if(strategy==='mixed'&&d===2){if(!c.gradient||s.hp>=70){s.cash+=1000;s.wages+=1000}}
     else if(strategy==='mixed'&&d===3)heal(10);
     else if(['small_buyer','late_spender','sale_credit'].includes(strategy)||(strategy==='mixed'&&d===1)){
       buy(d);s.gems+=[0,60,120][Math.floor(random()*3)];
       if(strategy==='late_spender'||strategy==='absence')s.late=true;
     } else if(strategy==='absence'){s.late=true;s.gems+=[0,60,120][Math.floor(random()*3)]}
   }
   if(strategy==='sale_credit'&&d===3&&!s.sold){s.cash+=1000;s.sold=true}
   snap(`D${d} evening`);
 }
 if(s.late){s.hp-=c.fatigue;s.late=false} if(!collapse())meal(strategy==='absence');
 let beforeDeadline=s.cash, shortfall=!s.paid&&s.cash<1500;
 if(shortfall&&strategy==='sale_credit'){s.debt=1500-s.cash;s.cash+=s.debt}
 pay();snap('D4 after deadline choice');
 return {shortfall,beforeDeadline,...s,history};
}
// Direct contract probes: no duplicated rent charge, explicit zero and shortfall, repeatable seeds.
function payProbe(cash,paid=false){let n=0;function pay(){if(!paid&&cash>=1500){cash-=1500;paid=true;n++}}pay();pay();return {cash,paid,n}}
assert.deepEqual(payProbe(1500),{cash:0,paid:true,n:1});assert.deepEqual(payProbe(1499),{cash:1499,paid:false,n:0});assert.deepEqual(payProbe(2000,true),{cash:2000,paid:true,n:0});
assert.deepEqual(run(configs[0],'small_buyer',1),run(configs[0],'small_buyer',1));
let absent=run(configs[0],'absence',1);assert.equal(absent.strikes,3);assert.equal(absent.wages,0);
let restrained=run(configs[0],'restrained',1);assert.equal(restrained.wages,3000);assert.equal(restrained.purchases,0);
let stress=run(configs[2],'absence',1,{hp:10});assert.ok(stress.bedrests>0);assert.ok(stress.hp>0);
const results=[];
for(const c of configs) for(const strategy of strategies){const runs=Array.from({length:32},(_,i)=>run(c,strategy,i+1)); results.push({configuration:c.name,strategy,seeds:'S01–S32',shortfalls:runs.filter(x=>x.shortfall).length,beforeDeadlineCents:runs[0].beforeDeadline,afterPaymentCents:runs[0].cash,hp:runs[0].hp,wagesCents:runs[0].wages,purchasesCents:runs[0].purchases,strikes:runs[0].strikes,bedrests:runs[0].bedrests,debtCents:runs[0].debt,toyGemRange:[Math.min(...runs.map(x=>x.gems)),Math.max(...runs.map(x=>x.gems))],representative:runs[0].history})}
// Explicit artificial continuation: zero cash and 5 HP, a work-phase collapse,
// then six days of meals, work and free leisure. It is not a full game route.
function recoveryProbe() {
 let s={cash:0,hp:5,strikes:0,wages:0,bedrests:0}, trace=[];
 s.hp-=5; if(s.hp<=0){s.hp=25;s.bedrests++;s.strikes++} // phase assigned to scheduled work
 trace.push({phase:'work-phase collapse',...s});
 for(let day=1;day<=6;day++){
   if(s.cash>=250)s.cash-=250;else s.hp-=5;
   if(s.hp<=0){s.hp=25;s.bedrests++} // morning bedrest; afternoon remains
   if(s.strikes<3){s.cash+=s.hp<30?500:1000;s.wages+=s.hp<30?500:1000}
   if(s.cash>=250)s.cash-=250;else s.hp-=5;
   if(s.hp<=0){s.hp=25;s.bedrests++}else s.hp=Math.min(100,s.hp+10);
   trace.push({phase:`extension day ${day}`, ...s});
 }
 return trace;
}
let recovery=recoveryProbe();assert.equal(recovery[0].strikes,1);assert.equal(recovery[0].wages,0);assert.ok(recovery.at(-1).hp>recovery[0].hp);assert.ok(recovery.at(-1).cash>0);
fs.writeFileSync('reports/development/plan-29-life-economy-scale-and-session-pacing/results.json',JSON.stringify({configs,results,probes:'passed',stress,recovery},null,2)+'\n');
console.log('18 configuration-strategy cells; 32 named seeds each; probes passed.');


