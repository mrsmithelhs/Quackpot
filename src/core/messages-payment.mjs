// A deliberate Pay click commits only the amount and log prefix shown in the Messages view.
import {earlyRepaymentEligibility} from './messages-policy.mjs';
export function payMessageLoan(engine,loanId,expectedTotal,expectedLogLength) {
  if(!Number.isSafeInteger(expectedTotal) || !earlyRepaymentEligibility(engine,loanId,expectedTotal,expectedLogLength))return {ok:false,reason:'loan_unavailable'};
  const p=engine.prepareFiveSlotAction({domain:'finance',action:{type:'repay_loan',loanId,id:`repay-ui:${engine.log.length}`}});
  return p.ok?engine.commitFiveSlotAction(p.proposal):p;
}

// Apartment repayment keeps its separate confirmation and revalidates afterwards.
export function confirmApartmentLoan(engine,loanId,confirmPayment) {
  const eligible=earlyRepaymentEligibility(engine,loanId);if(!eligible)return {ok:false,reason:'loan_unavailable'};
  const epoch=engine.log.length,amount=eligible.totalCents;
  if(!confirmPayment(amount))return {ok:false,reason:'cancelled'};
  return payMessageLoan(engine,loanId,amount,epoch);
}
