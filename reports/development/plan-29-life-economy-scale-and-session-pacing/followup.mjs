import fs from 'node:fs';
import assert from 'node:assert/strict';
const configs=[{name:'control',initial:1500,wage:1000,meal:250,rent:1500},{name:'higher60',initial:8000,wage:6000,meal:600,rent:17000},{name:'higher90',initial:10000,wage:9000,meal:800,rent:23000}];
const strategies=['no_purchases','repeat_small','mixed','missed_work','fatigue_recovery','sale_credit'];
function run(c,strategy,raceReward=120){
 let s={cash:c.initial,hp:100,gems:0,wages:0,meals:0,purchases:0,sale:0,paid:0,strikes:0,bedrests:0,grantPulls:10,paidPulls:0,raceGems:0,gemSpend:0,late:false,starter:false,days:[],gemLedger:[]};
 const collapse=()=>{if(s.hp>0)return false;s.hp=25;s.bedrests++;return true};
 function meal(skip){if(skip||s.cash<c.meal){s.hp-=5}else{s.cash-=c.meal;s.meals+=c.meal}collapse()}
 function buy(price,gems,label,day){if(s.cash>=price){s.cash-=price;s.purchases+=price;s.gems+=gems;s.gemLedger.push({day,action:label,cashCost:price,gemsAdded:gems})}}
 function play(day){
   if(!s.starter && ['repeat_small','mixed','missed_work','sale_credit'].includes(strategy)){buy(99,240,'starter',day);s.starter=true}
   if((strategy==='repeat_small'||strategy==='missed_work')&&(day===2||day===3))buy(499,330,'bundle',day);
   if(strategy==='sale_credit'&&day===2)buy(499,330,'bundle',day);
   let pulls=Math.min(2,Math.floor(s.gems/160));s.gems-=pulls*160;s.gemSpend+=pulls*160;s.paidPulls+=pulls;
   s.gemLedger.push({day,action:'paid singles',pulls,gemsSpent:pulls*160,gemsRemaining:s.gems});
   if(day<=2 && strategy!=='mixed' || strategy==='mixed'&&(day===1||day===3)) {s.gems+=raceReward;s.raceGems+=raceReward;s.gemLedger.push({day,action:'illustrative race reward',gemsAdded:raceReward,gemsRemaining:s.gems})}
 }
 let deadline;
 for(let day=1;day<=7;day++){
   let arrival=s.cash;
   if(s.late){s.hp-=10;s.late=false} collapse();
   let skip=strategy==='fatigue_recovery'&&(day===2||day===3);
   meal(skip);
   if(day===4){
     let afterBreakfast=s.cash, shortfall=Math.max(0,c.rent-s.cash);
     deadline={arrivalCash:arrival,afterBreakfast,liability:c.rent,reserve:s.cash-c.rent,shortfall,
       payBranch:s.cash>=c.rent?{cash:s.cash-c.rent,paid:true,overdue:false}:null,
       holdBranch:s.cash>=c.rent?{cash:s.cash,paid:false,overdue:true,escalation:'immediate; treatment unspecified'}:null,
       creditBranch:shortfall?{cash:0,paid:true,debt:shortfall,interest:'not modeled'}:null};
     if(s.cash>=c.rent){s.cash-=c.rent;s.paid=c.rent}
   }
   if(day<=6){let missed=(strategy==='missed_work'&&day===2)||(strategy==='sale_credit'&&(day===2||day===3));
     if(s.strikes<3){if(missed)s.strikes++;else{s.cash+=c.wage;s.wages+=c.wage}}}
   meal(skip);
   if(day<=3){if(strategy==='fatigue_recovery'){s.late=true}else if(strategy!=='no_purchases'&&!(strategy==='mixed'&&day===2))play(day)}
   if((strategy==='mixed'&&day===2)||(strategy==='fatigue_recovery'&&day>=4))s.hp=Math.min(100,s.hp+10);
   if(strategy==='sale_credit'&&day===3){s.cash+=4000;s.sale+=4000}
   assert.equal(s.cash,c.initial+s.wages+s.sale-s.meals-s.purchases-s.paid);
   assert.ok(s.cash>=0&&s.gems>=0);
   s.days.push({day,cash:s.cash,hp:s.hp,wages:s.wages,meals:s.meals,purchases:s.purchases,sale:s.sale,paid:s.paid,strikes:s.strikes,bedrests:s.bedrests});
 }
 assert.equal(s.gems,s.gemLedger.reduce((n,x)=>n+(x.gemsAdded||0)-(x.gemsSpent||0),0));
 assert.equal(s.grantPulls,10);return {config:c.name,strategy,raceReward,deadline,days:s.days,gemLedger:s.gemLedger,gemSummary:{grantPulls:s.grantPulls,paidPulls:s.paidPulls,raceGems:s.raceGems,gemSpend:s.gemSpend,remaining:s.gems,affordableSingles:Math.floor(s.gems/160),affordableTenPulls:Math.floor(s.gems/1600)},cashPurchases:s.purchases};
}
const scenarios=[];for(const c of configs)for(const strategy of strategies)scenarios.push(run(c,strategy));
const sensitivity=configs.map(c=>{let reserve=c.initial+3*c.wage-7*c.meal-c.rent;return {config:c.name,reserve,repeatPackCapacity:Math.max(0,Math.floor(reserve/499)),oneMissReserve:reserve-c.wage,oneMissPackCapacity:Math.max(0,Math.floor((reserve-c.wage)/499))}});
const gemSensitivity=[0,120,240].map(reward=>run(configs[1],'repeat_small',reward).gemSummary);
assert.equal(sensitivity[0].reserve,1250);assert.equal(sensitivity[1].reserve,4800);assert.equal(sensitivity[2].reserve,8400);
const sample=scenarios.find(x=>x.config==='higher60'&&x.strategy==='no_purchases');assert.equal(sample.deadline.payBranch.cash,4800);assert.equal(sample.deadline.holdBranch.cash,21800);assert.equal(sample.deadline.holdBranch.overdue,true);
const short=scenarios.find(x=>x.config==='higher60'&&x.strategy==='missed_work');assert.ok(short.deadline.shortfall>0&&short.deadline.creditBranch.debt===short.deadline.shortfall);
function recoveryProbe(c){let cash=0,hp=5,bedrests=0,trace=[];for(let day=1;day<=4;day++){if(cash>=c.meal)cash-=c.meal;else hp-=5;if(hp<=0){hp=25;bedrests++}cash+=c.wage;if(cash>=c.meal)cash-=c.meal;else hp-=5;hp=Math.min(100,hp+10);trace.push({day,cash,hp,bedrests})}return {config:c.name,trace}}
const recovery=[recoveryProbe(configs[1]),recoveryProbe(configs[2])];assert.equal(recovery[0].trace[0].bedrests,1);assert.ok(recovery[0].trace[3].cash>0&&recovery[0].trace[3].hp>25);
fs.writeFileSync('reports/development/plan-29-life-economy-scale-and-session-pacing/followup-results.json',JSON.stringify({configs,scenarios,sensitivity,gemSensitivity,recovery,wageOnlyControlReserve:{wage10:1250,wage60:16250,wage90:25250},assertions:'passed'},null,2)+'\n');
console.log('18 deterministic scenarios, 7 days; cash and Gem conservation and deadline branch probes passed.');

