// Five-slot financial policy. Pure transition helpers; GameEngine owns publication and cash.
export const FINANCE_POLICY_ID = 'five-slot-v1';
const slots = ['morning','midday','early-evening','evening','late-evening'];
const copy = value => structuredClone(value);
const bad = reason => ({ok:false,reason});
const cents = value => Number.isSafeInteger(value) && value >= 0;
const compare = (a,b) => a.day-b.day || slots.indexOf(a.slot)-slots.indexOf(b.slot);
const position = value => value && Number.isSafeInteger(value.day) && value.day > 0 && slots.includes(value.slot);
export function initialFinance() {
  return {policyId:FINANCE_POLICY_ID,revision:0,nextLoanId:1,completed:{},
    rents:[{id:'rent-1',amountCents:17000,due:{day:4,slot:'morning'},status:'pending',latched:false},
      {id:'rent-2',amountCents:40000,due:{day:14,slot:'morning'},status:'pending',latched:false}],loans:[]};
}
export function latchDue(finance, now) {
  if(!position(now)) throw new TypeError('invalid position');
  const result=copy(finance); let changed=false;
  for(const bill of [...result.rents,...result.loans]) {
    if(bill.status==='pending' && !bill.latched && compare(now,bill.due)>=0){bill.latched=true;changed=true;}
  }
  if(changed) result.revision++;
  return result;
}
export function dueObligations(finance, cashCents) {
  if(!cents(cashCents)) throw new TypeError('invalid cash');
  const bills=[...finance.rents,...finance.loans].filter(x=>x.status==='pending'&&x.latched);
  const totalCents=bills.reduce((sum,x)=>sum+(x.amountCents??x.totalCents),0);
  return {bills:copy(bills),cashCents,totalCents,shortfallCents:Math.max(0,totalCents-cashCents)};
}
export function prepareFinance(finance, cashCents, now, intent) {
  if(!finance || finance.policyId!==FINANCE_POLICY_ID || !cents(cashCents) || !position(now) || !intent || typeof intent.id!=='string' || !intent.id || ['__proto__','constructor','prototype'].includes(intent.id)) return bad('invalid_input');
  if(Object.hasOwn(finance.completed,intent.id)) return bad('duplicate_operation');
  const bill=finance.rents.find(x=>x.id===intent.billId), loan=finance.loans.find(x=>x.id===intent.loanId);
  let cashDeltaCents=0, effect=null;
  if(intent.type==='accept_loan') {
    if(!bill||bill.status!=='pending'||!bill.latched) return bad('rent_not_due');
    if(finance.loans.some(x=>x.status==='pending')) return bad('active_loan');
    const principalCents=Math.max(0,bill.amountCents-cashCents);
    if(!principalCents) return bad('no_shortfall');
    const feeCents=Math.ceil(principalCents/2);
    effect={type:'loan_accepted',loan:{id:`loan-${finance.nextLoanId}`,rentId:bill.id,principalCents,feeCents,totalCents:principalCents+feeCents,accepted:copy(now),due:{day:now.day+5,slot:'midday'},status:'pending',latched:false}};
    cashDeltaCents=principalCents;
  } else if(intent.type==='pay_rent') {
    if(!bill||bill.status!=='pending'||!bill.latched)return bad('rent_not_due');
    if(cashCents<bill.amountCents)return bad('insufficient_cash');
    cashDeltaCents=-bill.amountCents;effect={type:'rent_paid',billId:bill.id,amountCents:bill.amountCents};
  } else if(intent.type==='repay_loan') {
    if(!loan||loan.status!=='pending')return bad('loan_unavailable');
    if(cashCents<loan.totalCents)return bad('insufficient_cash');
    cashDeltaCents=-loan.totalCents;effect={type:'loan_repaid',loanId:loan.id,amountCents:loan.totalCents,early:compare(now,loan.due)<0};
  } else if(intent.type==='leave_unpaid') {
    const target=bill??loan;if(!target||target.status!=='pending'||!target.latched)return bad('obligation_not_due');
    if(intent.optionsDisclosed!==true||intent.confirmed!==true)return bad('confirmation_required');
    const amount=target.amountCents??target.totalCents, solvent=cashCents>=amount;
    const reason=bill ? `${bill.id==='rent-1'?'first':'later'}_rent_${solvent?'withheld':'unaffordable'}` : `loan_${solvent?'refused':'unaffordable'}`;
    effect={type:'financial_default',obligationId:target.id,reason,route:bill&&bill.id!=='rent-1'?'housing_loss':'running_on_empty',outstandingCents:amount};
  } else return bad('unknown_intent');
  return {ok:true,proposal:{revision:finance.revision,cashCents,now:copy(now),intent:copy(intent),cashDeltaCents,effect}};
}
export function commitFinance(finance,cashCents,now,proposal) {
  if(!proposal?.intent)return bad('invalid_proposal');
  const checked=prepareFinance(finance,cashCents,now,proposal.intent);
  if(!checked.ok)return checked;
  if(JSON.stringify(checked.proposal)!==JSON.stringify(proposal))return bad('stale_proposal');
  const next=copy(finance),effect=copy(proposal.effect);
  if(effect.type==='loan_accepted'){next.loans.push(effect.loan);next.nextLoanId++;}
  if(effect.type==='rent_paid') next.rents.find(x=>x.id===effect.billId).status='paid';
  if(effect.type==='loan_repaid') next.loans.find(x=>x.id===effect.loanId).status='paid';
  if(effect.type==='financial_default') {const target=[...next.rents,...next.loans].find(x=>x.id===effect.obligationId);target.status='defaulted';}
  next.completed[proposal.intent.id]=true;next.revision++;
  return {ok:true,finance:next,cashDeltaCents:proposal.cashDeltaCents,events:[effect]};
}
