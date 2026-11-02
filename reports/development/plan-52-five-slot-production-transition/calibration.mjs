import { createSchedule, inspect, commit, BASELINE } from '../../../src/core/life-schedule/index.mjs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const fee = principal => { if (!Number.isSafeInteger(principal) || principal < 0) throw Error('invalid principal'); return Math.floor((principal + 1) / 2); };
export function financial(state, id, kind, cents) {
  if (state.ids.has(id)) throw Error('duplicate financial operation');
  if (!Number.isSafeInteger(cents)) throw Error('invalid cents');
  if (state.cash + cents < 0) throw Error('insufficient cash');
  state.ids.add(id); state.cash += cents; state.ledger.push({id,kind,cents,cash:state.cash});
}
const cents = n => { const x=Math.round(n*100); if (!Number.isFinite(n) || Math.abs(x/100-n)>1e-7) throw Error('non-cent scheduler delta'); return x; };
export function run({script='steady',interval=7,rent=300,control=null,collision=false}={}) {
  const policy={...BASELINE,rentStudy:true,hypotheticalRentContinuation:false,employmentStudy:true,overtimeStudy:true,recoveryConsumesSlot:true};
  const calendar=Object.fromEntries(Array.from({length:19},(_,i)=>[String(i+1),true]));
  let s=createSchedule(policy,calendar), hp=100, n=0, first=false, loan=null, second=false, stopped=null, plan=false;
  const f={cash:8000,ids:new Set(),ledger:[]}; const events=[]; let steps=0;
  const record=(type,extra={})=>events.push({day:s.day,slot:s.slot,type,cash:f.cash,hp,...extra});
  const act=(intent,opts={})=>{
    const id=`op-${++n}`; intent={...intent,operationId:id}; const ctx=intent.type==='play'?{operationAvailable:true}:{};
    const p=inspect(s,{cash:f.cash/100,health:hp},intent,ctx); if(!p.ok) { stopped=`${intent.type}:${p.reason}`; record('blocked',{reason:stopped}); return false; }
    const op={confirmed:true, conflictChoice:'notice',...opts}; if(intent.type==='play') Object.assign(op,{success:true,operationId:id,resultRef:`symbolic-${intent.kind}`});
    const r=commit(s,{cash:f.cash/100,health:hp},p.proposal,op,intent.type==='play'?ctx:null); if(!r.ok){stopped=`commit:${r.reason}`;record('blocked',{reason:stopped});return false;}
    const from={day:s.day,slot:s.slot}; s=r.state; hp+=r.balanceDeltas.health; const delta=cents(r.balanceDeltas.cash);
    financial(f,`sched-${id}`,'scheduler',delta); record('scheduler',{from,intent:intent.type,kind:intent.kind??intent.choice??null,delta,events:r.events}); return true;
  };
  const change=(id,kind,delta)=>{financial(f,id,kind,delta);record(kind,{delta});};
  const play=(kind,cost=0)=>{if(f.cash<cost){stopped='symbolic_purchase_unaffordable';return false;} if(!act({type:'play',kind}))return false; if(cost) change(`purchase-${n}`,'symbolic_purchase',-cost); return act({type:'complete',activityId:s.active.id});};
  while(!stopped && s.day<19 && ++steps<500) {
    if(s.recovery){if(!act({type:'recover'}))break;continue;}
    if(s.day===4 && s.slot==='morning' && !first){
      if(control!==null){const target=control; change('synthetic-control','synthetic_start_balance_adjustment',target-f.cash);record('synthetic_control',{target});}
      if(f.cash<17000){if(!act({type:'rent',choice:'acknowledge-shortfall'}))break;
        if(script==='no-job'){stopped='first_rent_refused_loan';break;}
        if(script==='sales-loan'){change('sale-couch','sale_couch',3000);change('sale-tv','sale_tv',4000);}
        if(f.cash<17000){const principal=17000-f.cash;loan={principal,fee:fee(principal),acceptDay:s.day,acceptSlot:s.slot,dueDay:s.day+5,paid:false};change('loan','loan_accepted',principal);}
      }
      if(!act({type:'rent',choice:'pay'}))break; first=true;continue;
    }
    if(first && s.slot==='morning'){
      const loanDue=loan&&!loan.paid&&s.day>=loan.dueDay, secondDue=!second&&s.day>=4+interval;
      if(loanDue&&secondDue){stopped='deadline_priority_unselected';record('deadline_collision');break;}
      if(loanDue){const amount=loan.principal+loan.fee;if(f.cash<amount){stopped='loan_default_unresolved';record('loan_unaffordable',{amount});break;}change('loan-repay','loan_repaid',-amount);loan.paid=true;}
      if(secondDue){const amount=rent*100;if(f.cash<amount){stopped='second_rent_unaffordable';record('rent_unaffordable',{amount});break;}change('second-rent','second_rent_paid',-amount);second=true;}
    }
    if(script==='discretionary'&&s.day===5&&s.slot==='morning'&&!plan){if(!act({type:'reserve',planId:'ren',day:6,slot:'evening'}))break;plan=true;continue;}
    if(s.slot==='morning'||s.slot==='early-evening'){if(!act({type:'meal',choice:f.cash>=600?'buy':'skip'}))break;continue;}
    if(s.slot==='midday'){
      if((script==='missed'||script==='no-job')&&[2,3,4].includes(s.day)&&(script==='no-job'||s.day<4)){if(!play('pull'))break;continue;}
      const kind=s.employment.employed?'work':'quiet';if(!act({type:'start',kind}))break;if(!act({type:'complete',activityId:s.active.id}))break;continue;
    }
    if(s.slot==='evening'){
      if(script==='discretionary'&&s.day===6&&plan){if(!act({type:'start',kind:'social',planId:'ren'}))break;if(!act({type:'complete',activityId:s.active.id}))break;continue;}
      if((script==='discretionary'&&[2,5].includes(s.day))||(script==='sales-loan'&&[2,3].includes(s.day))){if(!play('pull',3000))break;continue;}
      if(!act({type:'start',kind:'quiet'}))break;if(!act({type:'complete',activityId:s.active.id}))break;continue;
    }
    if(s.slot==='late-evening') {if((script==='late'||script==='missed')&&s.day%2===0){if(!play('race'))break;} else if(!act({type:'sleep'}))break;continue;}
    stopped='unknown_slot';
  }
  if(steps>=500) stopped='step_cap';
  return {script,interval,rent,control,collision,stopped,final:{day:s.day,slot:s.slot,cash:f.cash,hp,firstRent:s.rent.status,secondPaid:second,employment:s.employment,loan},ledger:f.ledger,events};
}
export function all(){const routes=[];for(const interval of [7,10])for(const rent of [300,400,500])for(const script of ['steady','late','missed','discretionary','sales-loan','no-job'])routes.push(run({script,interval,rent}));routes.push(run({control:0}),run({control:12000}),run({control:12000,interval:5,collision:true}));return {protocol:'stage-a-proposal.md published fixed calibration protocol',routes};}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){const data=JSON.stringify(all());if(Buffer.byteLength(data)>10*1024*1024)throw Error('result exceeds 10MiB');writeFileSync(new URL('./calibration-results.json',import.meta.url),data+'\n');process.stdout.write(`wrote ${Buffer.byteLength(data)} bytes\n`);}
