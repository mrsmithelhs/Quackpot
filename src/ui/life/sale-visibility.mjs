// Presentation eligibility only. Financial outcomes remain owned by the engine.
import { SLOTS } from '../../core/life-schedule/policy.mjs';
const position = value => Number.isSafeInteger(value?.day) && value.day > 0 && SLOTS.includes(value.slot) ? (value.day - 1) * SLOTS.length + SLOTS.indexOf(value.slot) : null;
export function saleTagsAvailable(life, cash) {
 if (life?.policyVersion !== 'five-slot-v1' || life.schedule?.recovery || !Number.isFinite(cash) || cash < 0) return false;
 const now=position(life.schedule), cents=Math.round(cash*100); if(now===null || !Number.isSafeInteger(cents))return false;
 if(cents<6000)return true;
 const bills=[...(life.finance?.rents??[]),...(life.finance?.loans??[])];
 const total=bills.filter(b=>b.status==='pending' && position(b.due)!==null && position(b.due)<=now+SLOTS.length).reduce((sum,b)=>sum+(b.amountCents??b.totalCents??0),0);
 return Number.isSafeInteger(total) && total>0 && cents<=total+5000;
}
