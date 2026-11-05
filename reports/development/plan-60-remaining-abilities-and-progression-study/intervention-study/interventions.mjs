// Report-local diagnostic interventions. Not a production dependency.
import { createRng } from '../../../../src/core/prng.mjs';

export const SETTINGS = Object.freeze({ probability: .75, activeTicks: 10, cooldownTicks: 40, guardSampleTicks: 5 });
export function initialState(arm) {
  if (!['none','guard','quick-recovery','straight-shooter'].includes(arm)) throw new RangeError('invalid study arm');
  return { arm, start:null, end:null, cooldownUntil:0, ordinal:0, latched:false, absent:0, episode:null, audit:[] };
}
export function expire(state, tick, reason='duration') {
  if (state.start === null) return null;
  const prior = { start:state.start, end:state.end, episode:state.episode };
  state.audit.push({ type:'end', tick, reason, scheduledEnd:state.end });
  state.start=null; state.end=null; state.episode=null; state.cooldownUntil=tick+SETTINGS.cooldownTicks;
  return prior;
}
export function tickState(state,tick,restore) {
  if (state.start !== null && tick >= state.end) { const prior=expire(state,state.end); if (restore) restore(prior); }
}
export function activate(state,{seed,raceId,id,tick,identity}) {
  if (state.start !== null || tick < state.cooldownUntil) { state.audit.push({type:'blocked',tick,identity,reason:'active-or-cooldown'}); return false; }
  const ordinal=++state.ordinal, key=`p60-intervention/v1/${raceId}/${id}/${state.arm}/${ordinal}`, draw=createRng(seed).fork(key).next();
  const activated=draw < SETTINGS.probability;
  state.audit.push({type:'opportunity',tick,identity,ordinal,key,draw,probability:SETTINGS.probability,activated});
  if (activated) { state.start=tick; state.end=tick+SETTINGS.activeTicks; state.audit.push({type:'start',tick,end:state.end,identity}); }
  return activated;
}
export function guardObservation(state,{seed,raceId,id,tick,threat}) {
  if (tick % SETTINGS.guardSampleTicks !== 0) throw new RangeError('invalid guard sample');
  if (!threat) { if (++state.absent >= 2) state.latched=false; return; }
  state.absent=0;
  if (state.latched) return;
  if (state.start !== null || tick < state.cooldownUntil) return;
  state.latched=true;
  activate(state,{seed,raceId,id,tick,identity:`guard-threat:${threat.id}:${tick}`});
}
export function guardFactor(state, contactTick) {
  return state?.arm === 'guard' && state.start !== null && state.start < contactTick && contactTick < state.end ? .5 : 1;
}
export function adjustedTopSpeed(sampledRating,injured) {
  if (!Number.isFinite(sampledRating) || sampledRating <= 0) throw new RangeError('invalid sampled rating');
  return 8.25 + .5 * sampledRating * (injured ? .9 : 1);
}
