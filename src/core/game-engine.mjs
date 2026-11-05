import { availableDueOptions, displayedDueOptions } from './life-due-display.mjs';
// src/core/game-engine.mjs
// Core Game Engine and State Machine for Quackpot Plan 03 Mechanism Slice.
// Fully implements the ratified Revision 3 contract and Repair 01 specifications:
// - Persisted learner progression state (step, activeModal, interruptedContext, completedRaces, raceResults)
// - Guarded one-time mutations (promotional pull, races, starter pack, companion setup)
// - Solvent zero-cash options (continue, extra shift, sell couch) separate from unpaid bill escalations
// - Frozen terminal state: no retention modal or gameplay mutations after terminal route / Receipt presentation
// - Truthful repeated retention modal messaging
// - Strict Receipt presentation logging boundary

import { createRng, restoreRng } from './prng.mjs';
import { EventLog, verifyCompleteness } from './event-log.mjs';
import { projectReceipt } from './receipt.mjs';
import { resolveSeededRace, serializeRaceResolution, restoreRaceResolution } from './race-resolver.mjs';
import { RACE_REST_POLICY_VERSION, deriveRaceRestBoundary, makeRaceRestEvidence, stableExposureSignature } from './race-rest.mjs';
import { initialLife, transitionLife } from './life-progression.mjs';
import { selectWorkStory } from './life-story-content.mjs';
import { TUTORIAL_SHIFT_VERSION, tutorialShiftBlock } from './tutorial-shift.mjs';
import { hasEnteredQuackpot, hasInstalledQuackpot } from './life-entry.mjs';
import { PRODUCTION, PLAYTEST_WORK_CALENDAR, createSchedule } from './life-schedule/index.mjs';
import { quietFallbackEligibility } from './life-schedule/quiet-fallback.mjs';
import { initialFinance, latchDue, dueObligations } from './life-finance.mjs';
import { inspectLifeTransaction, classifyDueScheduleCommitment, classifyDueSocialCommitment, commitLifeTransaction, stageSocialTransition, stageWorkStory, prepareActivityStory, stageActivityStory } from './life-coordinator.mjs';
import { social46NeedsSaleDisclosure, social46CouchSold } from './life-social.mjs';
import { initialRaceProgress, recoverRaceDays, buildRaceV2Input, applyRaceV2Facts, assignRaceAbility, raceCandidateFacts, RACE_CANDIDATE_EVIDENCE_VERSION } from './race-progression.mjs';
import { decodeResult } from './race-v2/codec.mjs';
import { createRaceWorkerClient } from './race-v2/worker-client.mjs';
import { deliveryPayloads,renCurrentIds,renMessageShown } from './messages-policy.mjs';

const NEXT_RESERVATION = Symbol('private-next-reservation');
const SOCIAL_RESERVATION = Symbol('private-social-reservation');
const FIVE_SLOT_RACE = Symbol('private-five-slot-race');
const fiveSlotAppOpened = entries => entries.some(e => e.type==='action' && e.payload?.kind==='quackpot_opened' && e.payload.app==='Quackpot');

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export const BANNER_1_ROSTER = [
  { id: 'duck-0', name: 'Puddle Quacker', tier: 'common', speed: 10.0 },
  { id: 'duck-1', name: 'Rubber Mallard', tier: 'common', speed: 10.0 },
  { id: 'duck-2', name: 'Pond Rocket', tier: 'rare', speed: 14.0 },
  { id: 'duck-3', name: 'Bath Cadet', tier: 'common', speed: 10.0 },
  { id: 'duck-4', name: 'Turbo Drake', tier: 'rare', speed: 14.0 },
  { id: 'duck-5', name: 'Biblically Accurate Duck', tier: 'legendary', speed: 20.0 },
];

export const DUCK_COSMETICS = Object.freeze({
  'duck-0': Object.freeze({ palette: 'classic-yellow', hat: 'none', accessory: 'none' }),
  'duck-1': Object.freeze({ palette: 'mallard-green', hat: 'none', accessory: 'none' }),
  'duck-2': Object.freeze({ palette: 'bubblegum-pink', hat: 'sailor-cap', accessory: 'none' }),
  'duck-3': Object.freeze({ palette: 'classic-yellow', hat: 'sailor-cap', accessory: 'none' }),
  'duck-4': Object.freeze({ palette: 'mallard-green', hat: 'tiny-top-hat', accessory: 'bow-tie' }),
  'duck-5': Object.freeze({ palette: 'bubblegum-pink', hat: 'tiny-top-hat', accessory: 'monocle' }),
});

export const GAME_CONSTANTS = {
  START_CASH: 15.00,
  START_HEALTH: 100,
  WAGE_DAILY: 10.00,
  FOOD_DAILY: 5.00,
  BREAKFAST_SKIP_HEALTH_COST: 5,
  RENT_DAY2: 15.00,
  STARTER_PRICE: 0.99,
  STARTER_GEMS: 240,
  RETENTION_GEMS: 80,
  PULL_SINGLE_COST: 160,
  PULL_TEN_COST: 1600,
  DOWN_PER_DUPLICATE: { common: 1, rare: 5, legendary: 20 },
  DOWN_GEM_VALUE: 0.02,
  RACE_TRIAL_COST: 3,
  RACE_TRIAL_SPEED_MULTIPLIER: 1.05,
  TUTORIAL_FIELD_SPEED: 8.0,
  FINALE_FIELD_SPEED: 11.2,
};

/** Pre-draw odds calculation matching linear pity model */
export function calculatePreDrawOdds(pityCount, softPityStart = 35, hardPity = 50) {
  const n = pityCount + 1;
  const baseLegendary = 0.02;
  let pL = baseLegendary;

  if (n >= hardPity) {
    pL = 1.0;
  } else if (n >= softPityStart) {
    const span = hardPity - softPityStart + 1; // 16
    const progress = (n - softPityStart + 1) / span;
    pL = baseLegendary + (1 - baseLegendary) * progress;
  }

  const rest = 1 - pL;
  const rareShare = 0.18 / (0.18 + 0.80);
  return {
    common: rest * (1 - rareShare),
    rare: rest * rareShare,
    legendary: pL,
  };
}

export class GameEngine {
  #v2Enabled = false;
  #v2RecoveryDay = null;
  #v2Pending = false;
  #v2Generation = 0;
  #v2SessionResults = new Map();
  #v2VerifiedCandidates = new Map();
  #v2Worker = null;
  constructor(seed = String(Date.now()), { lifePolicy = false, tutorialShift = false, raceV2 = false, messagesPolicy = false } = {}) {
    this.#v2Enabled = raceV2 === true;
    if (messagesPolicy && (!this.#v2Enabled || lifePolicy !== 'five-slot-v1')) throw new Error('Messages policy requires a new five-slot schema-6 run');
    this.messagesPolicy = messagesPolicy ? 'messages-v1' : null;
    this.tutorialShiftVersion = lifePolicy && tutorialShift ? TUTORIAL_SHIFT_VERSION : null;
    this.seed = String(seed);
    this.log = new EventLog();

    this.rng = createRng(this.seed);
    this.rngDraw = this.rng.fork('draw');
    this.rngRace = this.rng.fork('race');
    this.rngEvent = this.rng.fork('event');

    this.autosaveEnabled = true;

    this.state = {
      day: 1,
      clock: { day: 1, label: 'day 1 morning' },
      phase: 'setup', // 'setup' | 'playing' | 'escalation' | 'terminal' | 'receipt_presented'
      step: 'desk',   // Exact persisted progression step
      activeModal: null, // null | 'starter' | 'zerocash' | 'escalation' | 'retention'
      interruptedContext: null, // { step, activeModal } saved during retention interruption
      cash: GAME_CONSTANTS.START_CASH,
      gems: 0,
      health: GAME_CONSTANTS.START_HEALTH,
      debt: 0,
      down: 0,
      pityCount: 0,
      physicalCompanion: { name: 'Professor Quacks', style: 'classic-yellow', pawned: false },
      owned: [], // array of duck id strings
      seenDexEntries: [], // array of duck id strings whose Dex acquisition was presented or skipped
      pendingReveals: [], // queue of committed unrevealed draws
      lastRacedId: null,
      tenPullCommitted: false,
      completedRaces: [], // array of completed race numbers: [1, 2]
      raceResults: {},    // raceNumber -> outcome object
      raceAttempts: {},   // raceNumber -> immutable finished/unresolved attempt summary
      raceResolutions: {}, // stable raceId -> versioned lossless resolution envelope
      raceTrialAvailable: false,
      lastRaceResult: null,
      billsSettled: [],   // array of settled bill IDs: ['d1_food', 'd2_rent', ...]
      assetsSold: [],     // array of sold asset strings: ['couch', 'tv']
      starterOffered: false,
      starterBought: false,
      retentionOffered: false,
      retentionUsed: false,
      terminalRoute: null,
      activeBill: null,   // pending unpaid bill during escalation
      escalationStepIndex: 0,
    };
    if (lifePolicy) {
      this.state.life = lifePolicy === 'five-slot-v1'
        ? { policyVersion: PRODUCTION.id, config: { ...PRODUCTION }, schedule: createSchedule(PRODUCTION, PLAYTEST_WORK_CALENDAR),
          finance: initialFinance(), social46: null, socialRevision: 0, socialOperationIds: {}, sold: [], story47: null }
        : initialLife();
      this.state.cash = this.state.life.config.startCash;
      this.state.health = this.state.life.config.startHealth;
    }
    if (this.#v2Enabled) this.state.raceGrowth=initialRaceProgress();
  }

  isTerminal() {
    return this.state.phase === 'terminal' || this.state.phase === 'receipt_presented';
  }

  // Development seam for the coordinated five-slot engine. The browser is not
  // switched to this policy until its controller and schema-5 replay are ready.
  #fiveSlotContext() {
    const life = this.state.life, schedule = life.schedule;
    const finance = latchDue(life.finance, { day: schedule.day, slot: schedule.slot });
    const due = dueObligations(finance, Math.round(this.state.cash * 100));
    const rent = due.bills.find(bill => bill.id.startsWith('rent-'));
    return { schedule: { overtimeReservation: structuredClone(schedule.overtimeReservation),
      rentObligation: rent ? { id: rent.id, status: 'due' } : null },
      optionsDisclosed: this.#fiveSlotDueOptionsWereShown() };
  }

  checkDueObligations() {
    const life = this.state.life;
    if (life?.policyVersion !== 'five-slot-v1') return null;
    const finance = latchDue(life.finance, { day: life.schedule.day, slot: life.schedule.slot });
    return dueObligations(finance, Math.round(this.state.cash * 100));
  }

  #fiveSlotDueOptions() {
    const life = this.state.life;
    if (this.isTerminal() || life?.policyVersion !== 'five-slot-v1' || life.schedule.recovery) return null;
    const due = this.checkDueObligations();
    if (!due.bills.length) return null;
    return displayedDueOptions(life, due);
  }

  // Call only when the due obligations and available choices are actually shown.
  previewFiveSlotDueOptions() {
    return structuredClone(this.#fiveSlotDueOptions());
  }

  recordFiveSlotDueOptionsShown() {
    const options = this.#fiveSlotDueOptions();
    if (!options) return null;
    return this.log.append('life52_due_options_shown', options, this.state.clock);
  }

  #fiveSlotDueOptionsWereShown() {
    const options = this.#fiveSlotDueOptions();
    const legacy = options && availableDueOptions(this.state.life, this.checkDueObligations());
    return Boolean(options && this.log.entries.some(event => event.type === 'life52_due_options_shown'
      && (JSON.stringify(event.payload) === JSON.stringify(options) || JSON.stringify(event.payload) === JSON.stringify(legacy))));
  }

  fiveSlotDueOptionsWereShown() {
    return this.#fiveSlotDueOptionsWereShown();
  }

  sellFiveSlotAsset(asset, expectedLogLength) {
    const life = this.state.life;
    if (this.isTerminal() || life?.policyVersion !== 'five-slot-v1' || life.schedule.recovery
      || !['couch', 'tv'].includes(asset) || life.sold.includes(asset)) return { ok: false, reason: 'unavailable' };
    if (!Number.isSafeInteger(expectedLogLength) || expectedLogLength !== this.log.length) return { ok: false, reason: 'stale_callback' };
    const socialView = { social46: life.social46, day: life.schedule.day, sold: life.sold };
    if (asset === 'couch' && social46NeedsSaleDisclosure(socialView)) return { ok: false, reason: 'social_sale_disclosure_required' };
    const draft = this.#transactionDraft();
    const amount = asset === 'couch' ? 30 : 40;
    draft.state.life.sold.push(asset);
    if (asset === 'couch') social46CouchSold({ social46: draft.state.life.social46 });
    draft.state.assetsSold = [...draft.state.life.sold];
    draft.state.cash = Math.round((draft.state.cash + amount) * 100) / 100;
    draft.log.append('income', { kind: 'asset_sale', asset, amount, cashAfter: draft.state.cash }, draft.state.clock);
    this.#publishTransaction(draft);
    return { ok: true, asset, amount };
  }

  #fiveSlotLoanTerms(billId) {
    const life = this.state.life;
    if (this.isTerminal() || life?.policyVersion !== 'five-slot-v1' || life.schedule.recovery
      || life.finance.loans.some(loan => loan.status === 'pending')) return null;
    const cashCents = Math.round(this.state.cash * 100);
    const bill = this.checkDueObligations().bills.find(item => item.id === billId && item.id.startsWith('rent-'));
    if (!bill || cashCents >= bill.amountCents) return null;
    const principalCents = bill.amountCents - cashCents;
    const feeCents = Math.ceil(principalCents / 2);
    return { billId, cashCents, principalCents, feeCents, totalCents: principalCents + feeCents,
      due: { day: life.schedule.day + 5, slot: 'midday' }, scheduleRevision: life.schedule.revision,
      financeRevision: life.finance.revision };
  }

  // The view calls this only after the exact loan terms have actually appeared.
  previewFiveSlotLoanTerms(billId) {
    return structuredClone(this.#fiveSlotLoanTerms(billId));
  }

  recordFiveSlotLoanTermsShown(billId) {
    const terms = this.#fiveSlotLoanTerms(billId);
    if (!terms) return null;
    return this.log.append('life52_loan_terms_shown', terms, this.state.clock);
  }

  #fiveSlotLoanTermsWereShown(billId) {
    const terms = this.#fiveSlotLoanTerms(billId);
    if (!terms) return false;
    return this.log.entries.some(event => event.type === 'life52_loan_terms_shown'
      && JSON.stringify(event.payload) === JSON.stringify(terms));
  }

  prepareFiveSlotAction(intent) {
    const life = this.state.life;
    if (this.isTerminal() || life?.policyVersion !== 'five-slot-v1') return { ok: false, reason: 'unavailable' };
    if (this.tutorialShiftVersion && intent?.domain==='schedule' && intent.action?.type==='start' && intent.action?.kind==='work') return {ok:false,reason:'story_work_required'};
    if (intent?.domain==='schedule' && intent.action?.type==='start' && intent.action?.kind==='quiet') {
      const fallback=this.fiveSlotQuietFallback(intent.action.operationId);
      if (!fallback.ok) return fallback;
    }
    // Real pull/race outcomes and consequence-bearing defaults need their own
    // engine-owned operations and actual displayed-option evidence.
    if (intent?.domain === 'schedule' && intent.action?.type === 'play') return { ok: false, reason: 'gameplay_operation_required' };
    if (intent?.domain === 'finance' && intent.action?.type === 'leave_unpaid' && !this.#fiveSlotDueOptionsWereShown()) return { ok: false, reason: 'default_evidence_required' };
    if (intent?.domain === 'finance' && intent.action?.type === 'accept_loan' && !this.#fiveSlotLoanTermsWereShown(intent.action.billId)) return { ok: false, reason: 'loan_terms_not_shown' };
    return inspectLifeTransaction(life, { cashCents: Math.round(this.state.cash * 100), health: this.state.health }, intent, this.#fiveSlotContext());
  }

  // UI-only inspection: does not create a schedulable proposal or bypass the
  // finance gate. Special operations retain their engine-owned prerequisites.
  classifyFiveSlotDueCommitment(request) {
    const life=this.state.life;
    if(this.isTerminal() || life?.policyVersion!=='five-slot-v1' || this.state.activeModal || this.state.interruptedContext || !request)return {ok:false,reason:'unavailable'};
    const context=this.#fiveSlotContext(), operationId=`default-preview:${this.log.length}`;
    let action;
    if(request.kind==='social')return classifyDueSocialCommitment(life,{cashCents:Math.round(this.state.cash*100),health:this.state.health},{operationId,action:request.action},context);
    if(request.kind==='schedule') {
      action={...request.action,operationId};
      // Quiet has an engine-owned fallback rule, and work has a story wrapper.
      if(action.kind==='work' || action.type==='play')return {ok:false,reason:'special_operation_required'};
      if(action.kind==='quiet') {
        const quiet=this.#fiveSlotQuietFallback(operationId,true);
        if(!quiet.ok)return quiet;
      }
    } else if(request.kind==='work') {
      if(life.story47 || life.social46?.scene)return {ok:false,reason:'story_pending'};
      action={type:'start',kind:'work',operationId};
    } else if(request.kind==='activity') {
      if(!['call_mom','sit_duck'].includes(request.choice) || life.story47 || (request.choice==='call_mom' && (life.schedule.day-1)%5!==0))return {ok:false,reason:'activity_unavailable'};
      action={type:'start',kind:'activity47',operationId};context.allowActivityStory=true;
    } else if(request.kind==='story') {
      const story=life.story47;
      if(!story || story.id!==request.id || story.kind!==request.storyKind || !((story.kind==='work' && story.stage==='work') || (story.kind==='activity' && story.stage==='scene')) || !this.log.entries.some(event=>event.type==='story47_shown' && event.payload?.id===story.id && event.payload?.stage===story.stage))return {ok:false,reason:'story_unavailable'};
      action={type:'complete',activityId:story.id,operationId};context.allowWorkStory=true;context.allowActivityStory=true;
    } else if(request.kind==='play') {
      if(!fiveSlotAppOpened(this.log.entries) || this.state.pendingReveals.some(draw=>!draw.revealed))return {ok:false,reason:'unavailable'};
      if(request.play==='pull') {
        if(request.promotion ? this.state.tenPullCommitted : ![1,10].includes(request.count) || this.state.gems<(request.count===1?GAME_CONSTANTS.PULL_SINGLE_COST:GAME_CONSTANTS.PULL_TEN_COST))return {ok:false,reason:'pull_unavailable'};
      } else if(request.play==='race') {
        const next=Math.max(0,...Object.keys(this.state.raceAttempts).map(Number))+1;
        if(request.raceNumber!==next || !['safe','sprint'].includes(request.stance) || !BANNER_1_ROSTER.some(duck=>duck.id===request.duckId) || !this.state.owned.includes(request.duckId) || typeof request.useTrial!=='boolean' || (request.useTrial && !this.state.raceTrialAvailable))return {ok:false,reason:'race_unavailable'};
      } else return {ok:false,reason:'invalid_play'};
      const active=life.schedule.active,extend=Boolean(active?.kind==='session' && active[`${request.play}Used`]);
      action={type:'play',kind:request.play,operationId,...(extend?{extend:true}:{})};context.schedule.operationAvailable=true;
    } else return {ok:false,reason:'invalid_request'};
    return classifyDueScheduleCommitment(life,{cashCents:Math.round(this.state.cash*100),health:this.state.health},{domain:'schedule',action},context);
  }

  // Live eligibility is rechecked at the transaction boundary. Historical
  // replay deliberately uses the original coordinator contract for old logs.
  fiveSlotQuietFallback(operationId = `quiet-preview:${this.log.length}`) {
    return this.#fiveSlotQuietFallback(operationId,false);
  }

  #fiveSlotQuietFallback(operationId,duePreview) {
    const life=this.state.life;
    if(this.isTerminal() || life?.policyVersion!=='five-slot-v1' || this.state.activeModal || this.state.interruptedContext)return {ok:false,reason:'unavailable'};
    const balances={cashCents:Math.round(this.state.cash*100),health:this.state.health}, context=this.#fiveSlotContext(),s=life.schedule;
    const inspect=(action,extra=context)=>{
      const intent={domain:'schedule',action}, normal=inspectLifeTransaction(life,balances,intent,extra);
      if(!duePreview || normal.reason!=='financial_obligation_due')return normal;
      const classified=classifyDueScheduleCommitment(life,balances,intent,extra);
      return classified.ok?{ok:true,proposal:{schedule:{conflicts:classified.hasConflicts?['conflict']:[],rentWorkConflict:classified.rentWorkConflict}}}:classified;
    };
    const quiet=inspect({type:'start',kind:'quiet',operationId});
    if(!quiet.ok)return quiet;
    const available=[];let n=0;
    const probe=(action,extra=context)=>inspect({...action,operationId:`fallback-check:${this.log.length}:${++n}`},extra);
    const add=availableNow=>available.push({available:Boolean(availableNow),free:true});
    // Explicit meal skipping is a tutorial choice only; it is not a free
    // alternative once later days rely on another activity to displace meals.
    if(s.day===1)add(probe({type:'meal',choice:'skip'}).ok);
    add(probe({type:'start',kind:'work'}).ok);
    add(probe({type:'start',kind:'early-bed'}).ok);
    add(probe({type:'sleep'}).ok);
    for(const choice of ['sit_duck','call_mom']) {
      const p=prepareActivityStory(life,balances,{choice,operationId:`fallback-check:${this.log.length}:${choice}`},context);
      add(p.ok || (duePreview && p.reason==='financial_obligation_due' && this.classifyFiveSlotDueCommitment({kind:'activity',choice}).ok));
    }
    const reservation=s.overtimeReservation;
    if(reservation?.status==='reserved')add(probe({type:'start',kind:'overtime',reservationId:reservation.id}).ok);
    const ren=life.social46?.pending;
    if(ren?.committed)add(probe({type:'start',kind:'social',planId:ren.id}).ok);
    // Opening the app is free. Existing Gems, the promotion, and owned ducks
    // provide play; purchasing Gems with cash does not count as a free option.
    const appOpenable=!(s.day===1 && !['evening','late-evening'].includes(s.slot));
    const pending=this.state.pendingReveals.some(draw=>!draw.revealed);
    const freePull=!pending && (!this.state.tenPullCommitted || this.state.gems>=GAME_CONSTANTS.PULL_SINGLE_COST);
    const race=this.state.owned.length>0;
    const playContext={...context,schedule:{...context.schedule,operationAvailable:true}};
    if(appOpenable && freePull)add(probe({type:'play',kind:'pull'},playContext).ok);
    if(appOpenable && race)add(probe({type:'play',kind:'race'},playContext).ok);
    return quietFallbackEligibility({quiet,alternatives:available});
  }

  // Called only after the view actually presents these exact consequences.
  recordFiveSlotScheduleWarningShown(proposal) {
    if(proposal?.domain!=='schedule' || !proposal.schedule?.disclosures?.length)return null;
    const current=this.prepareFiveSlotAction(proposal.intent);
    if(!current.ok || JSON.stringify(current.proposal)!==JSON.stringify(proposal))return null;
    return this.log.append('life52_schedule_warning_shown',{proposal:structuredClone(proposal)},this.state.clock);
  }

  prepareFiveSlotPlay(kind, {operationId,extend=false}={}) {
    if(this.isTerminal() || this.state.life?.policyVersion!=='five-slot-v1' || !['pull','race'].includes(kind)
      || typeof operationId!=='string' || !operationId || !fiveSlotAppOpened(this.log.entries))return {ok:false,reason:'unavailable'};
    const context=this.#fiveSlotContext();context.schedule.operationAvailable=true;
    return inspectLifeTransaction(this.state.life,{cashCents:Math.round(this.state.cash*100),health:this.state.health},
      {domain:'schedule',action:{type:'play',kind,operationId,...(extend?{extend:true}:{})}},context);
  }

  recordFiveSlotPlayWarningShown(proposal) {
    if(proposal?.intent?.action?.type!=='play' || !proposal.schedule?.disclosures?.length)return null;
    const action=proposal.intent.action,current=this.prepareFiveSlotPlay(action.kind,{operationId:action.operationId,extend:action.extend===true});
    if(!current.ok || JSON.stringify(current.proposal)!==JSON.stringify(proposal))return null;
    return this.log.append('life52_schedule_warning_shown',{proposal:structuredClone(proposal)},this.state.clock);
  }

  #fiveSlotWarningWasShown(proposal) {
    const events=this.log.entries,shown=events.findLastIndex(event=>event.type==='life52_schedule_warning_shown' && JSON.stringify(event.payload?.proposal)===JSON.stringify(proposal));
    const cancelled=events.findLastIndex(event=>event.type==='life52_schedule_warning_cancelled' && event.payload?.operationId===proposal?.intent?.action?.operationId);
    return shown>=0 && shown>cancelled;
  }

  recordFiveSlotWarningCancelled(proposal) {
    if(!this.#fiveSlotWarningWasShown(proposal))return null;
    const action=proposal.intent.action,current=action.type==='play'
      ? this.prepareFiveSlotPlay(action.kind,{operationId:action.operationId,extend:action.extend===true})
      : this.prepareFiveSlotAction(proposal.intent);
    if(!current.ok || JSON.stringify(current.proposal)!==JSON.stringify(proposal))return null;
    return this.log.append('life52_schedule_warning_cancelled',{operationId:proposal.intent.action.operationId},this.state.clock);
  }

  commitFiveSlotAction(proposal, operation = {}) {
    const life = this.state.life;
    if (this.isTerminal() || life?.policyVersion !== 'five-slot-v1' || !proposal?.intent) return { ok: false, reason: 'unavailable' };
    if (this.tutorialShiftVersion && proposal.intent.domain==='schedule' && proposal.intent.action?.type==='start' && proposal.intent.action?.kind==='work') return {ok:false,reason:'story_work_required'};
    if (proposal.intent.domain === 'schedule' && proposal.intent.action?.type === 'play') return { ok: false, reason: 'gameplay_operation_required' };
    if (proposal.intent.domain==='schedule' && proposal.intent.action?.type==='start' && proposal.intent.action?.kind==='quiet') { const fallback=this.fiveSlotQuietFallback(proposal.intent.action.operationId); if(!fallback.ok)return fallback; }
    if (proposal.intent.domain === 'finance' && proposal.intent.action?.type === 'leave_unpaid' && !this.#fiveSlotDueOptionsWereShown()) return { ok: false, reason: 'default_evidence_required' };
    if (proposal.intent.domain === 'finance' && proposal.intent.action?.type === 'accept_loan' && !this.#fiveSlotLoanTermsWereShown(proposal.intent.action.billId)) return { ok: false, reason: 'loan_terms_not_shown' };
    if (this.tutorialShiftVersion && proposal.domain==='schedule' && proposal.schedule?.disclosures?.length
      && !this.#fiveSlotWarningWasShown(proposal)) return {ok:false,reason:'warning_not_shown'};
    const draft = this.#transactionDraft();
    const balances = { cashCents: Math.round(draft.state.cash * 100), health: draft.state.health };
    const result = commitLifeTransaction(draft.state.life, balances, proposal, operation, draft.#fiveSlotContext());
    if (!result.ok) return result;
    const cashCents = balances.cashCents + result.cashDeltaCents;
    const health = balances.health + result.healthDelta;
    if (!Number.isSafeInteger(cashCents) || cashCents < 0 || !Number.isFinite(health) || health < 0 || health > PRODUCTION.maxHealth) return { ok: false, reason: 'invalid_result' };
    const recordedOperation = Object.fromEntries(['confirmed', 'kind', 'conflictChoice', 'overtimeChoice']
      .filter(key => operation[key] !== undefined).map(key => [key, operation[key]]));
    draft.log.append('life52_intent', { intent: structuredClone(proposal.intent), operation: recordedOperation }, draft.state.clock);
    for (const event of result.events) draft.log.append('life52_effect', { effect: event }, draft.state.clock);
    draft.log.append('life52_commit', { domain: proposal.intent.domain,
      operationId: proposal.intent.action.operationId ?? proposal.intent.action.id,
      cashDeltaCents: result.cashDeltaCents, healthDelta: result.healthDelta }, draft.state.clock);
    draft.state.life = result.state; draft.state.cash = cashCents / 100; draft.state.health = health;
    draft.state.debt = result.state.finance.loans.filter(loan => ['pending', 'defaulted'].includes(loan.status))
      .reduce((sum, loan) => sum + loan.totalCents, 0) / 100;
    draft.state.day = result.state.schedule.day;
    draft.state.clock = { day: result.state.schedule.day, label: `day ${result.state.schedule.day} ${result.state.schedule.slot}` };
    const defaultEvent = result.events.find(event => event.type === 'financial_default');
    if (defaultEvent) {
      draft.state.phase = 'terminal'; draft.state.terminalRoute = 'running_on_empty';
      draft.state.step = 'receipt'; draft.state.activeModal = null;
      draft.log.append('terminal', { route: 'running_on_empty', reason: defaultEvent.reason,
        obligationId: defaultEvent.obligationId, outstandingCents: defaultEvent.outstandingCents,
        housingLost: defaultEvent.route === 'housing_loss' }, draft.state.clock);
    }
    this.#publishTransaction(draft);
    return { ok: true, cashDeltaCents: result.cashDeltaCents, healthDelta: result.healthDelta, events: result.events };
  }

  applyFiveSlotSocialAction(intent, expectedLogLength) {
    if (this.isTerminal() || this.state.life?.policyVersion !== 'five-slot-v1') return { ok: false, reason: 'unavailable' };
    if (!Number.isSafeInteger(expectedLogLength) || expectedLogLength !== this.log.length) return { ok: false, reason: 'stale_callback' };
    const draft = this.#transactionDraft();
    const balances = { cashCents: Math.round(draft.state.cash * 100), health: draft.state.health };
    const result = stageSocialTransition(draft.state.life, balances, intent, draft.#fiveSlotContext());
    if (!result.ok) return result;
    const cashCents = balances.cashCents + result.cashDeltaCents;
    const health = balances.health + result.healthDelta;
    if (!Number.isSafeInteger(cashCents) || cashCents < 0 || !Number.isFinite(health) || health < 0 || health > PRODUCTION.maxHealth) return { ok: false, reason: 'invalid_result' };
    draft.log.append('life52_social_intent', { intent: structuredClone(intent) }, draft.state.clock);
    for (const event of result.events) draft.log.append('life52_effect', { effect: event }, draft.state.clock);
    draft.log.append('life52_commit', { domain: 'social', operationId: intent.operationId,
      cashDeltaCents: result.cashDeltaCents, healthDelta: result.healthDelta }, draft.state.clock);
    draft.state.life = result.state; draft.state.cash = cashCents / 100; draft.state.health = health;
    draft.state.day = result.state.schedule.day;
    draft.state.clock = { day: result.state.schedule.day, label: `day ${result.state.schedule.day} ${result.state.schedule.slot}` };
    this.#publishTransaction(draft);
    return { ok: true, cashDeltaCents: result.cashDeltaCents, healthDelta: result.healthDelta, events: result.events };
  }

  applyFiveSlotWorkStory(intent, expectedLogLength) {
    if(this.isTerminal() || this.state.life?.policyVersion!=='five-slot-v1')return {ok:false,reason:'unavailable'};
    if(this.state.activeModal || this.state.interruptedContext)return {ok:false,reason:'presentation_covered'};
    if(!Number.isSafeInteger(expectedLogLength) || expectedLogLength!==this.log.length)return {ok:false,reason:'stale_callback'};
    const draft=this.#transactionDraft(),balances={cashCents:Math.round(draft.state.cash*100),health:draft.state.health};
    const shownStages=draft.log.entries.filter(event=>event.type==='story47_shown').map(event=>`${event.payload.id}:${event.payload.stage}`);
    const context={...draft.#fiveSlotContext(),seed:draft.seed,shownStages};
    const result=stageWorkStory(draft.state.life,balances,intent,context);if(!result.ok)return result;
    const cashCents=balances.cashCents+result.cashDeltaCents,health=balances.health+result.healthDelta;
    if(!Number.isSafeInteger(cashCents) || cashCents<0 || !Number.isFinite(health) || health<0 || health>PRODUCTION.maxHealth)return {ok:false,reason:'invalid_result'};
    draft.log.append('life52_work_story_intent',{intent:structuredClone(intent)},draft.state.clock);
    for(const event of result.events)draft.log.append('life52_effect',{effect:event},draft.state.clock);
    draft.log.append('life52_commit',{domain:'work_story',operationId:intent.operationId,cashDeltaCents:result.cashDeltaCents,healthDelta:result.healthDelta},draft.state.clock);
    draft.state.life=result.state;draft.state.cash=cashCents/100;draft.state.health=health;
    draft.state.day=result.state.schedule.day;draft.state.clock={day:result.state.schedule.day,label:`day ${result.state.schedule.day} ${result.state.schedule.slot}`};
    if(intent.type==='complete')draft.log.append('income',{kind:'wage',amount:result.cashDeltaCents/100,transactionId:intent.id,cashAfter:draft.state.cash,source:'five-slot-work-story'},draft.state.clock);
    this.#publishTransaction(draft);
    return {ok:true,cashDeltaCents:result.cashDeltaCents,healthDelta:result.healthDelta,events:result.events};
  }

  prepareFiveSlotActivityStory(choice,operationId) {
    if(this.isTerminal() || this.state.life?.policyVersion!=='five-slot-v1' || this.state.activeModal || this.state.interruptedContext)return {ok:false,reason:'unavailable'};
    return prepareActivityStory(this.state.life,{cashCents:Math.round(this.state.cash*100),health:this.state.health},{choice,operationId},this.#fiveSlotContext());
  }

  recordFiveSlotActivityWarningShown(choice,operationId,proposal) {
    const current=this.prepareFiveSlotActivityStory(choice,operationId);
    if(!current.ok || !current.proposal.schedule.disclosures.length || JSON.stringify(current.proposal)!==JSON.stringify(proposal))return null;
    return this.log.append('life52_activity_warning_shown',{choice,operationId,proposal:structuredClone(proposal)},this.state.clock);
  }

  recordFiveSlotActivityWarningCancelled(choice,operationId) {
    const prior=this.log.entries.findLast(e=>e.type==='life52_activity_warning_shown' && e.payload?.choice===choice && e.payload?.operationId===operationId);
    const cancelled=this.log.entries.findLast(e=>e.type==='life52_activity_warning_cancelled' && e.payload?.choice===choice && e.payload?.operationId===operationId);
    if(!prior || (cancelled && cancelled.seq>prior.seq))return null;
    return this.log.append('life52_activity_warning_cancelled',{choice,operationId},this.state.clock);
  }

  applyFiveSlotActivityStory(intent,expectedLogLength) {
    if(this.isTerminal() || this.state.life?.policyVersion!=='five-slot-v1' || this.state.activeModal || this.state.interruptedContext)return {ok:false,reason:'unavailable'};
    if(!Number.isSafeInteger(expectedLogLength) || expectedLogLength!==this.log.length)return {ok:false,reason:'stale_callback'};
    const draft=this.#transactionDraft(),balances={cashCents:Math.round(draft.state.cash*100),health:draft.state.health};
    const context=draft.#fiveSlotContext(),shownStages=draft.log.entries.filter(e=>e.type==='story47_shown').map(e=>`${e.payload.id}:${e.payload.stage}`);
    const preview=intent.type==='start'?prepareActivityStory(draft.state.life,balances,intent,context):null;
    const warningIndex=preview?.ok?draft.log.entries.findLastIndex(e=>e.type==='life52_activity_warning_shown' && JSON.stringify(e.payload)===JSON.stringify({choice:intent.choice,operationId:intent.operationId,proposal:preview.proposal})):-1;
    const cancelIndex=draft.log.entries.findLastIndex(e=>e.type==='life52_activity_warning_cancelled' && e.payload?.choice===intent.choice && e.payload?.operationId===intent.operationId);
    const warningShown=warningIndex>=0 && warningIndex>cancelIndex;
    const plan=draft.state.life.social46?.pending;
    const conflictShownKinds=draft.log.entries.filter(e=>e.type==='life52_effect' && e.payload?.effect?.type==='social46_display' && e.payload.effect.payload?.id===plan?.id && e.payload.effect.payload?.atDay===draft.state.life.schedule.day).map(e=>e.payload.effect.payload.kind);
    const result=stageActivityStory(draft.state.life,balances,intent,{...context,shownStages,warningShown,conflictShownKinds});if(!result.ok)return result;
    const cashCents=balances.cashCents+result.cashDeltaCents,health=balances.health+result.healthDelta;
    if(!Number.isSafeInteger(cashCents)||cashCents<0||!Number.isFinite(health)||health<0||health>PRODUCTION.maxHealth)return {ok:false,reason:'invalid_result'};
    draft.log.append('life52_activity_story_intent',{intent:structuredClone(intent)},draft.state.clock);
    for(const effect of result.events)draft.log.append('life52_effect',{effect},draft.state.clock);
    draft.log.append('life52_commit',{domain:'activity_story',operationId:intent.operationId,cashDeltaCents:result.cashDeltaCents,healthDelta:result.healthDelta},draft.state.clock);
    draft.state.life=result.state;draft.state.cash=cashCents/100;draft.state.health=health;
    draft.state.day=result.state.schedule.day;draft.state.clock={day:result.state.schedule.day,label:`day ${result.state.schedule.day} ${result.state.schedule.slot}`};
    this.#publishTransaction(draft);return {ok:true,cashDeltaCents:result.cashDeltaCents,healthDelta:result.healthDelta,events:result.events};
  }

  /** Starts the game run, logs run_started, and transitions to companion setup */
  start() {
    if (this.isTerminal()) throw new Error('Cannot start run: game is in terminal phase');
    if (this.log.entries.some((e) => e.type === 'run_started')) return;
    this.log.append('run_started', { seed: this.seed, ...(this.messagesPolicy ? { messagesPolicy: this.messagesPolicy } : {}), ...(this.state.life ? {
      lifePolicyVersion: this.state.life.policyVersion, lifeConfig: structuredClone(this.state.life.config),
      ...(this.tutorialShiftVersion ? { tutorialShiftVersion: this.tutorialShiftVersion } : {}),
    } : {}) }, this.state.clock);
    this.#deliverMessages();
    this.state.step = 'desk';
  }

  /** Commit a life intent and its factual effects as one in-memory snapshot. */
  applyLifeIntent(intent, privateToken = null) {
    if (intent?.type === 'phone_commit_next' && privateToken !== NEXT_RESERVATION) return { ok: false, reason: 'private_reservation' };
    if (this.isTerminal() || !this.state.life) return { ok: false, reason: 'unavailable' };
    if (this.state.life.policyVersion === 'five-slot-v1') return { ok: false, reason: 'five_slot_action_required' };
    if (intent?.type?.startsWith('social46_') && (this.state.activeModal || this.state.interruptedContext)) return { ok: false, reason: 'presentation_covered' };
    if (this.state.life.rent.status === 'overdue' && !this.state.life.rentSurfaced
      && !['rent', 'rent_surface', 'recover'].includes(intent?.type)) return { ok: false, reason: 'rent_notice_pending' };
    if (intent?.type === 'sell' || intent?.type === 'sell_after_open') {
      if (!hasEnteredQuackpot(this.log.entries)) return { ok: false, reason: 'app_not_opened' };
      intent = { type: 'sell_after_open', asset: intent.asset };
    }
    if (['depart_work_story47', 'agree_work_story47'].includes(intent?.type) && JSON.stringify(intent.story) !== JSON.stringify(selectWorkStory(this.seed, `work-${this.state.life.nextId}`))) return { ok: false, reason: 'invalid_story_selection' };
    const story = this.state.life.story47;
    if (story && ((intent?.type === 'work_story_step' && story.stage === 'commute') || (intent?.type === 'complete_work' && story.stage === 'work') || (intent?.type === 'complete_activity47' && story.stage === 'scene'))
      && !this.log.entries.some(e => e.type === 'story47_shown' && e.payload.id === story.id && e.payload.stage === story.stage)) return { ok: false, reason: 'story_not_shown' };
    const tutorialBlock = tutorialShiftBlock(this.tutorialShiftVersion, this.state.life, intent);
    if (tutorialBlock) return { ok: false, reason: tutorialBlock };
    const result = transitionLife(this.state.life, this.state, intent);
    if (!result.ok) return result;
    // Phone navigation belongs to the phase/session that produced it, not the next visit.
    if (result.life.day !== this.state.life.day || result.life.phase !== this.state.life.phase) {
      this.state.lifePhoneReturnStep = null;
    }
    this.log.append('life_intent', { intent: structuredClone(intent) }, this.state.clock);
    let eventClock = this.state.clock;
    for (const event of result.events) {
      if (event.type === 'life_phase_arrived') eventClock = { day: event.payload.day, label: `day ${event.payload.day} ${event.payload.phase}` };
      this.log.append(event.type, event.payload, eventClock);
    }
    this.state.life = result.life;
    this.state.assetsSold = [...result.life.sold];
    this.state.cash = result.cash;
    this.state.health = result.health;
    this.state.day = result.life.day;
    this.state.clock = { day: result.life.day, label: `day ${result.life.day} ${result.life.phase}` };
    this.log.append('life_transition', { intent: structuredClone(intent), life: structuredClone(result.life), cash: result.cash, health: result.health }, this.state.clock);
    return result;
  }

  /** Preview only: a next-phase commitment is never made by browsing. */
  previewNextLifePlay(kind, { socialContinue = false } = {}) {
    if (this.isTerminal() || !this.state.life) return { ok: false, reason: 'unavailable' };
    const intent = { type: 'phone_commit_next', version: 1, confirmed: true, kind };
    if (socialContinue) intent.socialConflict = 'continue';
    const gate = tutorialShiftBlock(this.tutorialShiftVersion, this.state.life, intent);
    if (gate) return { ok: false, reason: gate };
    if (this.state.life.rent.status === 'overdue' && !this.state.life.rentSurfaced) return { ok: false, reason: 'rent_notice_pending' };
    return transitionLife(this.state.life, this.state, intent);
  }

  needsNextLifePlay(kind) {
    const life = this.state.life;
    return Boolean(life && ((life.session && life.session[kind]) || (!life.session && life.anchor && life.phase === 'evening')));
  }

  // Transaction drafts keep game state, evidence and each RNG stream together.
  // A failed operation must never publish any part of its draft.
  #transactionDraft() {
    const draft = new GameEngine(this.seed,{raceV2:this.#v2Enabled});
    draft.messagesPolicy = this.messagesPolicy;
    draft.tutorialShiftVersion = this.tutorialShiftVersion;
    draft.autosaveEnabled = this.autosaveEnabled;
    draft.state = structuredClone(this.state);
    draft.log = EventLog.hydrate(this.log.entries);
    draft.rng = restoreRng(this.rng.serialize());
    draft.rngDraw = restoreRng(this.rngDraw.serialize());
    draft.rngRace = restoreRng(this.rngRace.serialize());
    draft.rngEvent = restoreRng(this.rngEvent.serialize());
    for (const name of ['resolveRaceCandidate', 'serializeRaceCandidate', 'sampleLifeDraw']) {
      if (Object.hasOwn(this, name)) draft[name] = this[name];
    }
    return draft;
  }

  #publishTransaction(draft) {
    const oldRenIds=new Set(renCurrentIds(this.state.life));
    if(this.#v2Enabled && draft.state.life?.schedule && draft.state.raceGrowth){
      const from=draft.#v2RecoveryDay??this.state.life.schedule.day,elapsed=draft.state.life.schedule.day-from;
      draft.state.raceGrowth=recoverRaceDays(draft.state.raceGrowth,elapsed);
    }
    this.state = draft.state; this.log = draft.log;
    this.rng = draft.rng; this.rngDraw = draft.rngDraw; this.rngRace = draft.rngRace; this.rngEvent = draft.rngEvent;
    this.#deliverMessages();
    if(this.messagesPolicy==='messages-v1' && !this.isTerminal())for(const id of renCurrentIds(this.state.life)) {
      if(!oldRenIds.has(id) && !this.log.entries.some(e=>e.type==='message_delivered' && e.payload?.id===id))this.log.append('message_delivered',{kind:'ren',id,revision:1},this.state.clock);
    }
  }

  #deliverMessages() {
    if (this.messagesPolicy !== 'messages-v1' || this.isTerminal()) return;
    for (const payload of deliveryPayloads(this.state.life)) {
      if (!this.log.entries.some(e => e.type === 'message_delivered' && e.payload?.id === payload.id))
        this.log.append('message_delivered', payload, this.state.clock);
    }
  }

  readMessage(id, revision) {
    if (this.messagesPolicy !== 'messages-v1' || this.isTerminal() || this.state.activeModal || this.state.interruptedContext || revision !== 1 || typeof id !== 'string' || id.length > 80) return false;
    const events=this.log.entries;
    const launchInvite=id==='launch:invitation:1';
    const launchAck=id==='launch:ack:1' && events.some(e=>e.type==='action' && e.payload?.kind==='launch_reply');
    if(id.startsWith('ren:') && !renMessageShown(this.state.life,id))return false;
    if (!launchInvite && !launchAck && !events.some(e => e.type === 'message_delivered' && e.payload?.id === id && e.payload.revision === revision)) return false;
    if(launchInvite && !events.some(e=>e.type==='offer_shown' && e.payload?.kind==='launch_reply_invitation'))return false;
    if(launchAck && !events.some(e=>e.type==='cue_shown' && e.payload?.kind==='launch_reply_acknowledgment'))return false;
    if (this.log.entries.some(e => e.type === 'message_read' && e.payload?.id === id && e.payload.revision === revision)) return false;
    this.log.append('message_read', {id, revision}, this.state.clock); return true;
  }

  showRenMessageHistory(id,revision) {
    if(this.messagesPolicy!=='messages-v1' || this.isTerminal() || this.state.activeModal || this.state.interruptedContext || revision!==1 || typeof id!=='string' || !id.startsWith('ren:') || id.length>80 || renCurrentIds(this.state.life).includes(id))return null;
    if(!this.log.entries.some(e=>e.type==='message_delivered' && e.payload?.kind==='ren' && e.payload.id===id && e.payload.revision===revision) || this.log.entries.some(e=>e.type==='message_history_shown' && e.payload?.id===id))return null;
    return this.log.append('message_history_shown',{id,revision},this.state.clock);
  }

  // Only confirmed next-phase actions use this owned draft. No storage, render, or live mutation before publication.
  #stageNextPlay(method, args, { next = true, social = false } = {}) {
    const draft = this.#transactionDraft();
    const options = { [NEXT_RESERVATION]: next, [SOCIAL_RESERVATION]: social };
    const result = method === 'runRace'
      ? draft.runRace(args[0], args[1], args[2], { ...args[3], ...options })
      : draft[method](...args, options);
    if (!result) return null;
    this.#publishTransaction(draft);
    return result;
  }
  /** Select independently of gameplay RNG, in the same transaction as the work commitment. */
  beginStoryWork(kind, confirmedSessionEnd = false) {
    if (!this.state.life) return { ok: false, reason: 'unavailable' };
    if(this.state.life.policyVersion==='five-slot-v1')return ['agree','depart'].includes(kind) ? this.applyFiveSlotWorkStory({type:'start',operationId:`work-story:${this.log.length}`,confirmed:true},this.log.length) : {ok:false,reason:'invalid_kind'};
    const id = `work-${this.state.life.nextId}`;
    const story = selectWorkStory(this.seed, id);
    return this.applyLifeIntent(kind === 'depart'
      ? { type: 'depart_work_story47', confirmedSessionEnd, story }
      : { type: 'agree_work_story47', kind: 'scheduled', story });
  }

  /** Record a story only after its current stage is actually mounted. */
  showLifeStory47(id, stage) {
    const story = this.state.life?.story47;
    if (this.isTerminal() || this.state.activeModal || !story || story.id !== id || story.stage !== stage) return null;
    if (this.log.entries.some(e => e.type === 'story47_shown' && e.payload.id === id && e.payload.stage === stage)) return null;
    const payload = { id, stage, version: 1 };
    if (story.kind === 'work' && stage === 'commute') payload.beats = [story.story.commute];
    else if (story.kind === 'work' && stage === 'work') payload.beats = [...story.story.work];
    else if (story.kind === 'activity' && stage === 'scene') payload.beats = [story.choice];
    else return null;
    return this.log.append('story47_shown', payload, this.state.clock);
  }

  /** Fictional preparation and entry are free; older entry evidence remains authoritative. */
  showLifeInvitation() {
    const life=this.state.life;
    const invitationWindow=life?.policyVersion==='five-slot-v1'
      ? life.schedule.day===1 && ['morning','midday','early-evening'].includes(life.schedule.slot)
      : life?.day===1 && ['morning','afternoon'].includes(life.phase);
    if (this.isTerminal() || !invitationWindow) return null;
    if (this.log.entries.some(e => e.type === 'offer_shown' && e.payload?.kind === 'launch_reply_invitation')) return null;
    return this.log.append('offer_shown', { kind: 'launch_reply_invitation', technique: 'launch_invitation', launch: 'day_1_evening' }, this.state.clock);
  }

  showExpiredLaunchHistory() {
    if(this.messagesPolicy!=='messages-v1' || this.isTerminal() || this.state.activeModal || this.state.interruptedContext)return null;
    const s=this.state.life.schedule,windowOpen=s.day===1 && ['morning','midday','early-evening'].includes(s.slot);
    if(windowOpen || this.log.entries.some(e=>(e.type==='offer_shown' && e.payload?.kind==='launch_reply_invitation') || (e.type==='cue_shown' && e.payload?.kind==='expired_launch_history')))return null;
    return this.log.append('cue_shown',{kind:'expired_launch_history',technique:'launch_invitation',launch:'day_1_evening',id:'launch:invitation:1',revision:1},this.state.clock);
  }

  replyLifeInvitation() {
    if (this.isTerminal() || !this.state.life || !this.log.entries.some(e => e.type === 'offer_shown' && e.payload?.kind === 'launch_reply_invitation')) return false;
    if (this.log.entries.some(e => e.type === 'action' && e.payload?.kind === 'launch_reply')) return true;
    if(this.messagesPolicy==='messages-v1') {const s=this.state.life.schedule;if(s.day!==1 || !['morning','midday','early-evening'].includes(s.slot))return false;}
    this.log.append('action', { kind: 'launch_reply', text: 'LAUNCH' }, this.state.clock);
    return true;
  }

  showLifeAcknowledgment() {
    if (this.isTerminal() || !this.log.entries.some(e => e.type === 'action' && e.payload?.kind === 'launch_reply')) return null;
    if (this.log.entries.some(e => e.type === 'cue_shown' && e.payload?.kind === 'launch_reply_acknowledgment')) return null;
    return this.log.append('cue_shown', { kind: 'launch_reply_acknowledgment' }, this.state.clock);
  }

  installLifeApp() {
    if (this.isTerminal() || !this.state.life) return false;
    if (hasInstalledQuackpot(this.log.entries)) return true;
    this.log.append('action', { kind: 'fictional_install', app: 'Quackpot' }, this.state.clock);
    return true;
  }

  openLifeApp() {
    if (this.isTerminal() || !this.state.life) return false;
    const life = this.state.life;
    if (life.policyVersion === 'five-slot-v1') {
      if (life.schedule.day === 1 && !['evening', 'late-evening'].includes(life.schedule.slot)) return false;
      if (!fiveSlotAppOpened(this.log.entries)) this.log.append('action', { kind: 'quackpot_opened', app: 'Quackpot' }, this.state.clock);
      return true;
    }
    if (life.day === 1 && !['evening', 'lateNight'].includes(life.phase)) return false;
    if (!hasEnteredQuackpot(this.log.entries)) this.log.append('action', { kind: 'quackpot_opened', app: 'Quackpot' }, this.state.clock);
    return true;
  }

  /** Styles and names the physical companion */
  setupCompanion(name = 'Professor Quacks', style = 'classic-yellow') {
    if (this.isTerminal()) throw new Error('Cannot setup companion: game is in terminal phase');
    this.state.physicalCompanion = { name, style, pawned: false };
    this.log.append('companion_styled', { name, style }, this.state.clock);
    this.state.phase = 'playing';
    this.state.step = this.state.life ? 'life_home' : 'd1_morning_gacha';
  }

  sampleLifeDraw() { return this.rngDraw.next(); }

  /**
   * Commits the promotional free 10-pull.
   * Guarded against repeated execution.
   */
  commitPromotionalTenPull(options = {}) {
    if (this.isTerminal()) throw new Error('Cannot pull: game is in terminal phase');
    if (this.state.tenPullCommitted) {
      return this.state.pendingReveals;
    }
    if (this.state.life?.policyVersion === 'five-slot-v1') return this.#stageFiveSlotPull(10, false, options);
    if (options.confirmNext === true || options.confirmSocial === true) return this.#stageNextPlay('commitPromotionalTenPull', [], { next: options.confirmNext === true, social: options.confirmSocial === true });
    const reservation = options[NEXT_RESERVATION] ? { type: 'phone_commit_next', version: 1, confirmed: true, kind: 'pull' } : { type: 'phone_commit', kind: 'pull' };
    if (options[SOCIAL_RESERVATION]) reservation.socialConflict = 'continue';
    if (this.state.life && !this.applyLifeIntent(reservation, options[NEXT_RESERVATION] ? NEXT_RESERVATION : null).ok) return null;

    return this.#commitDrawBatch(10, false);
  }

  /** A normal pull commits its cost and all outcomes before any reveal. */
  commitPaidPull(count, options = {}) {
    if (this.isTerminal() || !this.state.life || ![1, 10].includes(count)) return null;
    const cost = count === 1 ? GAME_CONSTANTS.PULL_SINGLE_COST : GAME_CONSTANTS.PULL_TEN_COST;
    if (this.state.gems < cost || this.state.pendingReveals.some(draw => !draw.revealed)) return null;
    if (this.state.life.policyVersion === 'five-slot-v1') return this.#stageFiveSlotPull(count, true, options);
    if (options.confirmNext === true || options.confirmSocial === true) return this.#stageNextPlay('commitPaidPull', [count], { next: options.confirmNext === true, social: options.confirmSocial === true });
    const reservationIntent = options[NEXT_RESERVATION] ? { type: 'phone_commit_next', version: 1, confirmed: true, kind: 'pull' } : { type: 'phone_commit', kind: 'pull' };
    if (options[SOCIAL_RESERVATION]) reservationIntent.socialConflict = 'continue';
    const reservation = this.applyLifeIntent(reservationIntent, options[NEXT_RESERVATION] ? NEXT_RESERVATION : null);
    if (!reservation.ok) return null;
    this.state.gems -= cost;
    this.log.append('purchase', { kind: count === 1 ? 'single_pull' : 'ten_pull', cost, price: 0, gemsAfter: this.state.gems }, this.state.clock);
    return this.#commitDrawBatch(count, true);
  }

  // The actual draw is generated on an owned draft; only its successful result
  // can be paired with the prepared scheduler action and published.
  #stageFiveSlotPull(count, paid, options) {
    if (!fiveSlotAppOpened(this.log.entries) || this.state.pendingReveals.some(draw => !draw.revealed)) return null;
    const draft = this.#transactionDraft();
    const balances = { cashCents: Math.round(draft.state.cash * 100), health: draft.state.health };
    const context = draft.#fiveSlotContext();
    context.schedule.operationAvailable = true;
    const operationId = options.operationId ?? `pull:${draft.log.length}`;
    const intent = { domain: 'schedule', action: { type: 'play', kind: 'pull', operationId,
      ...(options.confirmNext === true ? { extend: true } : {}) } };
    const prepared = inspectLifeTransaction(draft.state.life, balances, intent, context);
    if (!prepared.ok || prepared.proposal.schedule.recoveryInstead) return null;
    if(draft.tutorialShiftVersion && prepared.proposal.schedule.disclosures.length && !draft.#fiveSlotWarningWasShown(prepared.proposal))return null;
    if (prepared.proposal.schedule.disclosures.length && options.confirmConsequences !== true) return null;
    const conflictChoice=options.conflictChoice ?? (options.confirmSocial===true?'break':null);
    if (prepared.proposal.schedule.conflicts.length && !['notice','break'].includes(conflictChoice)) return null;
    draft.log.append('life52_intent', { intent: structuredClone(intent), operation: {
      confirmed: true, ...(conflictChoice ? { conflictChoice } : {}), ...(options.overtimeChoice ? {overtimeChoice:options.overtimeChoice} : {}) } }, draft.state.clock);
    if (paid) {
      const cost = count === 1 ? GAME_CONSTANTS.PULL_SINGLE_COST : GAME_CONSTANTS.PULL_TEN_COST;
      if (draft.state.gems < cost || draft.state.pendingReveals.some(draw => !draw.revealed)) return null;
      draft.state.gems -= cost;
      draft.log.append('purchase', { kind: count === 1 ? 'single_pull' : 'ten_pull', cost, price: 0, gemsAfter: draft.state.gems }, draft.state.clock);
    }
    const draws = draft.#commitDrawBatch(count, paid);
    const operation = { confirmed: true, success: true, operationId, resultRef: `draw:${draws[0].commitSeq}`,
      ...(conflictChoice ? { conflictChoice } : {}), ...(options.overtimeChoice ? {overtimeChoice:options.overtimeChoice} : {}) };
    const result = commitLifeTransaction(draft.state.life, balances, prepared.proposal, operation, context);
    if (!result.ok) return null;
    draft.state.life = result.state;
    draft.state.cash = (balances.cashCents + result.cashDeltaCents) / 100;
    draft.state.health = balances.health + result.healthDelta;
    for (const event of result.events) draft.log.append('life52_effect', { effect: event }, draft.state.clock);
    draft.log.append('life52_commit', { domain: 'schedule', operationId,
      cashDeltaCents: result.cashDeltaCents, healthDelta: result.healthDelta }, draft.state.clock);
    draft.state.day = result.state.schedule.day;
    draft.state.clock = { day: result.state.schedule.day, label: `day ${result.state.schedule.day} ${result.state.schedule.slot}` };
    this.#publishTransaction(draft);
    return draws;
  }

  #stageFiveSlotRace(raceNumber, duckId, stance, options) {
    if (this.isTerminal() || !fiveSlotAppOpened(this.log.entries)) return null;
    if (!Number.isSafeInteger(raceNumber) || raceNumber < 1) return null;
    const prior = this.getRaceAttempt(raceNumber);
    if (prior) return prior;
    const nextRace = Math.max(0, ...Object.keys(this.state.raceAttempts).map(Number)) + 1;
    if (raceNumber !== nextRace) return null;
    const draft = this.#transactionDraft();
    const balances = { cashCents: Math.round(draft.state.cash * 100), health: draft.state.health };
    const context = draft.#fiveSlotContext();
    context.schedule.operationAvailable = true;
    const operationId = options.operationId ?? `race:${raceNumber}:${draft.log.length}`;
    const intent = { domain: 'schedule', action: { type: 'play', kind: 'race', operationId,
      ...(options.confirmNext === true ? { extend: true } : {}) } };
    const prepared = inspectLifeTransaction(draft.state.life, balances, intent, context);
    if (!prepared.ok || prepared.proposal.schedule.recoveryInstead) return null;
    if(draft.tutorialShiftVersion && prepared.proposal.schedule.disclosures.length && !draft.#fiveSlotWarningWasShown(prepared.proposal))return null;
    if (prepared.proposal.schedule.disclosures.length && options.confirmConsequences !== true) return null;
    const conflictChoice=options.conflictChoice ?? (options.confirmSocial===true?'break':null);
    if (prepared.proposal.schedule.conflicts.length && !['notice','break'].includes(conflictChoice)) return null;
    draft.log.append('life52_intent', { intent: structuredClone(intent), operation: {
      confirmed: true, ...(conflictChoice ? { conflictChoice } : {}), ...(options.overtimeChoice ? {overtimeChoice:options.overtimeChoice} : {}) } }, draft.state.clock);
    const attempt = draft.runRace(raceNumber, duckId, stance, { useTrial: options.useTrial ?? false, [FIVE_SLOT_RACE]: true });
    if (!attempt || typeof attempt.resolutionDigest !== 'string') return null;
    const operation = { confirmed: true, success: true, operationId, resultRef: `race:${attempt.resolutionDigest}`,
      ...(conflictChoice ? { conflictChoice } : {}), ...(options.overtimeChoice ? {overtimeChoice:options.overtimeChoice} : {}) };
    const result = commitLifeTransaction(draft.state.life, balances, prepared.proposal, operation, context);
    if (!result.ok) return null;
    draft.state.life = result.state;
    draft.state.cash = (balances.cashCents + result.cashDeltaCents) / 100;
    draft.state.health = balances.health + result.healthDelta;
    for (const event of result.events) draft.log.append('life52_effect', { effect: event }, draft.state.clock);
    draft.log.append('life52_commit', { domain: 'schedule', operationId,
      cashDeltaCents: result.cashDeltaCents, healthDelta: result.healthDelta }, draft.state.clock);
    draft.state.day = result.state.schedule.day;
    draft.state.clock = { day: result.state.schedule.day, label: `day ${result.state.schedule.day} ${result.state.schedule.slot}` };
    this.#publishTransaction(draft);
    return attempt;
  }

  // Shared outcome generation for both promotional and paid draws. The caller
  // owns reservation, wallet checks, staging and publication.
  #commitDrawBatch(count, advancesPity) {
    const draws = [], owned = new Set(this.state.owned);
    for (let i = 0; i < count; i++) {
      const pityBefore = this.state.pityCount;
      const odds = calculatePreDrawOdds(pityBefore);
      const roll = this.sampleLifeDraw();
      const rarity = roll < odds.legendary ? 'legendary' : roll < odds.legendary + odds.rare ? 'rare' : 'common';
      const pool = BANNER_1_ROSTER.filter(duck => duck.tier === rarity);
      const chosen = pool[this.rngDraw.int(pool.length)];
      const duplicate = owned.has(chosen.id);
      const downGained = duplicate ? GAME_CONSTANTS.DOWN_PER_DUPLICATE[rarity] : 0;
      if (duplicate) this.state.down += downGained;
      else { owned.add(chosen.id); this.state.owned.push(chosen.id); }
      if (advancesPity) this.state.pityCount = rarity === 'legendary' ? 0 : pityBefore + 1;
      const payload = { drawIndex: i + 1, of: count, pityBefore, drawNumberInWindow: pityBefore + 1,
        odds, rarity, identity: chosen.id, duplicate, downGained, advancesPity };
      const entry = this.log.append('draw_committed', payload, this.state.clock);
      draws.push({ ...payload, commitSeq: entry.seq, revealed: false });
    }
    this.state.pendingReveals = draws;
    if (!advancesPity) this.state.tenPullCommitted = true;
    return draws;
  }
  buyLifeBundle(gems) {
    if (this.isTerminal() || !this.state.life) return false;
    if (this.state.life.policyVersion === 'five-slot-v1') {
      const price = new Map([[60, 0.99], [330, 4.99], [1090, 14.99]]).get(gems);
      if (!fiveSlotAppOpened(this.log.entries) || price === undefined || this.state.cash < price
        || this.state.life.schedule.recovery || this.checkDueObligations().bills.length) return false;
      const draft = this.#transactionDraft();
      draft.state.cash = Math.round((draft.state.cash - price) * 100) / 100;
      draft.state.gems += gems;
      draft.log.append('purchase', { kind: 'bundle', bundleGems: gems, price, gemsAfter: draft.state.gems, cashAfter: draft.state.cash, banner: 0 }, draft.state.clock);
      this.#publishTransaction(draft);
      return true;
    }
    if (this.state.life.rent.status === 'due'
      || (this.state.life.rent.status === 'overdue' && !this.state.life.rentSurfaced) || this.state.life.recovery) return false;
    const price = new Map([[60, 0.99], [330, 4.99], [1090, 14.99]]).get(gems);
    if (price === undefined || this.state.cash < price) return false;
    this.state.cash = Math.round((this.state.cash - price) * 100) / 100;
    this.state.gems += gems;
    this.log.append('purchase', { kind: 'bundle', bundleGems: gems, price, gemsAfter: this.state.gems, cashAfter: this.state.cash, banner: 0 }, this.state.clock);
    return true;
  }

  /**
   * Reveals a committed draw card at a specific index.
   * Appends reveal_shown to the event log.
   */
  revealDrawAtIndex(idx) {
    if (this.isTerminal()) throw new Error('Cannot reveal draw: game is in terminal phase');
    if (idx < 0 || idx >= this.state.pendingReveals.length) return null;

    const draw = this.state.pendingReveals[idx];
    if (draw.revealed) return draw; // Idempotent if already revealed

    draw.revealed = true;
    this.log.append('reveal_shown', {
      commitSeq: draw.commitSeq,
      rarity: draw.rarity,
      identity: draw.identity,
      duplicate: draw.duplicate,
      downGained: draw.downGained,
    }, this.state.clock);

    return draw;
  }

  /** Reveals the next unrevealed card in sequence */
  revealNextDraw() {
    const unrevealedIndex = this.state.pendingReveals.findIndex((d) => !d.revealed);
    if (unrevealedIndex === -1) return null;
    return this.revealDrawAtIndex(unrevealedIndex);
  }

  /** Reveal all remaining unrevealed draws in sequence */
  revealAllPending() {
    const revealed = [];
    for (let i = 0; i < this.state.pendingReveals.length; i++) {
      if (!this.state.pendingReveals[i].revealed) {
        revealed.push(this.revealDrawAtIndex(i));
      }
    }
    return revealed;
  }

  /** Returns the first actually revealed duplicate and its help-log state. */
  getDuplicateConversionHelpState() {
    const entries = this.log.entries;
    const commits = new Map(entries.filter((entry) => entry.type === 'draw_committed').map((entry) => [entry.seq, entry]));
    const firstReveal = entries.find((entry) => {
      if (entry.type !== 'reveal_shown' || entry.payload?.duplicate !== true) return false;
      const commit = commits.get(entry.payload.commitSeq);
      return !!commit && commit.seq < entry.seq && commit.payload.duplicate === true
        && commit.payload.identity === entry.payload.identity
        && commit.payload.rarity === entry.payload.rarity
        && commit.payload.downGained === entry.payload.downGained;
    });
    if (!firstReveal) return null;
    const cue = entries.find((entry) => entry.type === 'cue_shown'
      && entry.payload?.cueId === 'duplicate_conversion_help'
      && entry.payload?.sourceRevealSeq === firstReveal.seq
      && entry.payload?.identity === firstReveal.payload.identity
      && entry.payload?.rarity === firstReveal.payload.rarity
      && entry.payload?.downGained === firstReveal.payload.downGained);
    const dismissed = !!cue && entries.some((entry) => entry.type === 'action'
      && entry.payload?.kind === 'duplicate_help_dismissed'
      && entry.seq > cue.seq
      && entry.payload?.sourceCueSeq === cue.seq);
    return { reveal: firstReveal, cue: cue ?? null, dismissed };
  }

  /** Records help only for the first duplicate that was actually revealed. */
  showDuplicateConversionHelp(sourceRevealSeq) {
    if (this.isTerminal()) return null;
    const existing = this.getDuplicateConversionHelpState();
    if (!existing || existing.reveal.seq !== sourceRevealSeq || existing.cue || existing.dismissed) return null;
    const reveal = existing.reveal;
    const expectedDown = GAME_CONSTANTS.DOWN_PER_DUPLICATE[reveal.payload.rarity];
    if (expectedDown === undefined || reveal.payload.downGained !== expectedDown) return null;
    return this.log.append('cue_shown', {
      cueId: 'duplicate_conversion_help',
      sourceRevealSeq: reveal.seq,
      identity: reveal.payload.identity,
      rarity: reveal.payload.rarity,
      downGained: reveal.payload.downGained,
      conversionRates: { ...GAME_CONSTANTS.DOWN_PER_DUPLICATE },
      copy: `Duplicate ducks are automatically returned and converted to Down. This ${reveal.payload.rarity} duplicate awarded ${reveal.payload.downGained} Down. Common duplicates award 1, Rare 5, and Legendary 20.`,
    }, this.state.clock);
  }

  /** Records an explicit dismissal for the one displayed duplicate-help cue. */
  dismissDuplicateConversionHelp(sourceCueSeq) {
    if (this.isTerminal()) return null;
    const state = this.getDuplicateConversionHelpState();
    if (!state?.cue || state.cue.seq !== sourceCueSeq || state.dismissed) return null;
    return this.log.append('action', {
      kind: 'duplicate_help_dismissed',
      sourceCueSeq: state.cue.seq,
    }, this.state.clock);
  }

  /** Returns pure collection and set progress state for the Duck-Dex shelf */
  getDexCollectionState() {
    const ownedSet = new Set(this.state.owned || []);
    const seenSet = new Set(this.state.seenDexEntries || []);

    // Secrecy protection: Any duck newly acquired in the current pending batch that has NOT had ANY
    // of its cards revealed (neither the original acquisition card nor any duplicate card) must remain
    // completely concealed on the Duck-Dex shelf as an unowned silhouette.
    // As soon as ANY card of that identity is revealed (original-first OR duplicate-first), it is discovered.
    const reveals = this.state.pendingReveals || [];
    const revealedIdentitiesInBatch = new Set(reveals.filter((d) => d.revealed).map((d) => d.identity));
    const newlyAcquiredInBatch = new Set(reveals.filter((d) => !d.duplicate).map((d) => d.identity));

    const roster = BANNER_1_ROSTER.map((duck) => {
      const isConcealedSecret = newlyAcquiredInBatch.has(duck.id) && !revealedIdentitiesInBatch.has(duck.id);
      const isDiscovered = ownedSet.has(duck.id) && !isConcealedSecret;
      return {
        ...duck,
        cosmetics: DUCK_COSMETICS[duck.id] || { palette: 'classic-yellow', hat: 'none', accessory: 'none' },
        owned: isDiscovered,
        authoritativeOwned: ownedSet.has(duck.id),
        seen: seenSet.has(duck.id),
      };
    });

    const totalDucks = BANNER_1_ROSTER.length;
    const discoveredCount = roster.filter((d) => d.owned).length;
    const isComplete = discoveredCount >= totalDucks;
    const sets = [
      {
        id: 'pond_of_destiny',
        name: 'Pond of Destiny',
        banner: 1,
        owned: discoveredCount,
        total: totalDucks,
        complete: isComplete,
        effectText: 'None active (standard banner set)',
      },
    ];
    return {
      roster,
      totalDucks,
      ownedCount: discoveredCount,
      authoritativeOwnedCount: this.state.owned.length,
      isComplete,
      sets,
    };
  }

  /**
   * Records a voluntary Duck-Dex inspection action.
   * Emits a completion_pressure cue if any sets remain incomplete.
   */
  recordDexViewed(source = 'hud') {
    if (this.isTerminal()) return null;
    const action = this.log.append('action', {
      kind: 'duck_dex_viewed',
      source,
    }, this.state.clock);

    let cue = null;
    const state = this.getDexCollectionState();
    if (!state.isComplete) {
      cue = this.log.append('cue_shown', {
        cueId: 'completion_pressure',
        technique: 'completion_pressure',
        setProgress: state.sets.map((s) => ({ set: s.name, owned: s.owned, total: s.total })),
        incompleteSets: state.sets.filter((s) => !s.complete).length,
      }, this.state.clock);
    }
    return { action, cue };
  }

  /** Marks a newly acquired duck identity as seen in the Duck-Dex */
  markDexEntrySeen(duckId) {
    if (!Array.isArray(this.state.seenDexEntries)) {
      this.state.seenDexEntries = [];
    }
    if (!this.state.seenDexEntries.includes(duckId)) {
      this.state.seenDexEntries.push(duckId);
    }
  }

  /** Records a real presentation cue for a newly acquired duck entry */
  recordAcquisitionCue(duckId, { focusMs = 2000, transitionMs = 2500, isStatic = false } = {}) {
    if (this.isTerminal()) return null;
    this.markDexEntrySeen(duckId);
    const duck = BANNER_1_ROSTER.find((d) => d.id === duckId);
    return this.log.append('cue_shown', {
      cueId: isStatic ? 'duck_dex_acquisition_static' : 'duck_dex_acquisition',
      identity: duckId,
      rarity: duck?.tier || 'common',
      focusMs: isStatic ? 0 : focusMs,
      transitionMs: isStatic ? 0 : transitionMs,
    }, this.state.clock);
  }

  /** Records an explicit player skip of the acquisition presentation sequence */
  skipAcquisitionPresentation(remainingCount = 0) {
    if (this.isTerminal()) return null;
    return this.log.append('action', {
      kind: 'acquisition_presentation_skipped',
      remainingCount,
    }, this.state.clock);
  }

  raceIdFor(raceNumber) {
    if (!Number.isSafeInteger(raceNumber) || raceNumber < 1 || (!this.state.life && raceNumber > 2)) throw new RangeError(`Unsupported race number: ${raceNumber}`);
    return `R${String(raceNumber).padStart(2, '0')}`;
  }

  getRaceAttempt(raceNumber) {
    return deepFreeze(this.state.raceAttempts?.[raceNumber] ?? null);
  }

  getRaceResolution(raceNumber) {
    const attempt = this.getRaceAttempt(raceNumber);
    const encoded = attempt ? this.state.raceResolutions?.[attempt.raceId] : null;
    return encoded ? restoreRaceResolution(encoded) : null;
  }

  activateRaceRestPolicy() {
    const existing = this.log.entries.find((entry) => entry.type === 'race_rest_policy_activated');
    if (existing) return existing;
    const boundary = deriveRaceRestBoundary(this.log.entries);
    return this.log.append('race_rest_policy_activated', {
      policyVersion: RACE_REST_POLICY_VERSION,
      historyBaselineSeq: boundary.boundarySeq,
      historyLimited: boundary.historyLimited,
      rule: { interveningCompletedRaces: [0, 1, '2+'], restFactors: [0.5, 0.75, 1] },
    }, this.state.clock);
  }

  /** Record the pre-race controls only after the entry form has actually rendered. */
  recordRaceChoicesShown(raceNumber, { candidates, duckId, fieldBaseSpeed, trialState = {}, exposureId } = {}) {
    this.activateRaceRestPolicy();
    const renderedIds = Array.isArray(candidates) ? candidates.map((item) => item.duckId) : [];
    if(this.#v2Enabled){
      if(!renderedIds.length||new Set(renderedIds).size!==renderedIds.length||!renderedIds.every(id=>this.state.owned.includes(id)))return null;
      const day=this.state.life.schedule.day,available=Boolean(this.state.raceTrialAvailable),selected=available&&trialState.selected===true;
      const shown=renderedIds.map(id=>{const duck=BANNER_1_ROSTER.find(d=>d.id===id),rest=makeRaceRestEvidence(this.log.entries,id,duck.speed);
        return raceCandidateFacts({duckId:id,baseRating:duck.speed,restFactor:rest.restFactor,historyLimited:rest.historyLimited,recoveryDays:this.state.raceGrowth.ducks[id]?.recoveryDays??0,referenceDay:day,upgradeAvailable:available,upgradeSelected:selected});});
      shown.sort((a,b)=>Number(b.effectiveRatingMicros)-Number(a.effectiveRatingMicros)||b.authoredRating-a.authoredRating||this.state.owned.indexOf(a.duckId)-this.state.owned.indexOf(b.duckId)||(a.duckId<b.duckId?-1:a.duckId>b.duckId?1:0));
      if(renderedIds.some((id,i)=>id!==shown[i].duckId)||(duckId&&!renderedIds.includes(duckId)))return null;
      const verifiedTrialState={available,selected,multiplier:GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER};
      const selectedDuckId=duckId??shown[0].duckId;
      const signature=stableExposureSignature({candidateEvidenceVersion:RACE_CANDIDATE_EVIDENCE_VERSION,candidates:shown,fieldBaseSpeed,trialState:verifiedTrialState,duckId:selectedDuckId});
      const stableExposureId=`race-choice-${raceNumber}-${signature}`;if(this.log.entries.some(e=>e.type==='race_choice_offered'&&e.payload?.exposureId===stableExposureId))return null;
      return this.log.append('race_choice_offered',{raceNumber,candidateEvidenceVersion:RACE_CANDIDATE_EVIDENCE_VERSION,referenceDay:day,exposureId:stableExposureId,signature,
        options:{safe:{label:'Steady pace',detail:'More consistent pacing'},sprint:{label:'Variable pace',detail:'Wider swings in pacing'}},selectedDuckId,foregroundedDuckId:shown[0].duckId,candidates:shown,fieldBaseSpeed,trialAvailable:available,trialState:verifiedTrialState},this.state.clock);
    }
    const inputCandidates = Array.isArray(candidates) ? candidates : [];
    const renderedCandidates = inputCandidates.map((item) => {
      const duck = BANNER_1_ROSTER.find((definition) => definition.id === item.duckId);
      if (!duck || !this.state.owned.includes(duck.id)) return null;
      const evidence = makeRaceRestEvidence(this.log.entries, duck.id, duck.speed);
      return {
        duckId: duck.id,
        authoredRating: duck.speed,
        restFactor: evidence.restFactor,
        historyLimited: evidence.historyLimited,
        effectiveBaseInput: evidence.effectiveBaseInput,
        effectiveWithTrialInput: evidence.effectiveBaseInput * (trialState.selected ? GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER : 1),
        rendered: true,
      };
    }).filter(Boolean);
    renderedCandidates.sort((a, b) => b.effectiveBaseInput - a.effectiveBaseInput || b.authoredRating - a.authoredRating
      || this.state.owned.indexOf(a.duckId) - this.state.owned.indexOf(b.duckId) || a.duckId.localeCompare(b.duckId));
    if (renderedIds.length && (renderedIds.length !== renderedCandidates.length || renderedIds.some((id, index) => id !== renderedCandidates[index]?.duckId))) return null;
    if (!renderedCandidates.length && duckId) {
      const duckDef = BANNER_1_ROSTER.find((duck) => duck.id === duckId);
      if (duckDef && this.state.owned.includes(duckId)) {
        const evidence = makeRaceRestEvidence(this.log.entries, duckId, duckDef.speed);
        renderedCandidates.push({
          duckId, authoredRating: duckDef.speed, restFactor: evidence.restFactor, historyLimited: evidence.historyLimited,
          effectiveBaseInput: evidence.effectiveBaseInput,
          effectiveWithTrialInput: evidence.effectiveBaseInput * (trialState.selected ? GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER : 1),
          rendered: true,
        });
      }
    }
    if (!renderedCandidates.length) return null;
    const verifiedTrialState = { available: Boolean(this.state.raceTrialAvailable), selected: Boolean(trialState.selected && this.state.raceTrialAvailable), multiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER };
    const signaturePayload = { candidates: renderedCandidates, fieldBaseSpeed, trialState: verifiedTrialState, duckId };
    const signature = stableExposureSignature(signaturePayload);
    const stableExposureId = `race-choice-${raceNumber}-${signature}`;
    if (this.log.entries.some((entry) => entry.type === 'race_choice_offered' && entry.payload?.exposureId === stableExposureId)) return null;
    return this.log.append('race_choice_offered', {
      raceNumber,
      exposureId: stableExposureId,
      signature,
      options: {
        safe: { label: 'Steady pace', detail: 'More consistent pacing' },
        sprint: { label: 'Variable pace', detail: 'Wider swings in pacing' },
      },
      selectedDuckId: duckId ?? renderedCandidates[0]?.duckId ?? null,
      foregroundedDuckId: renderedCandidates[0]?.duckId ?? null,
      candidates: renderedCandidates,
      fieldBaseSpeed,
      trialAvailable: Boolean(this.state.raceTrialAvailable),
      trialState: verifiedTrialState,
    }, this.state.clock);
  }

  recordRaceTrialOfferShown(raceNumber, costDown = GAME_CONSTANTS.RACE_TRIAL_COST, exposureId = `race-trial-${raceNumber}`) {
    this.activateRaceRestPolicy();
    if (this.log.entries.some((entry) => entry.type === 'race_trial_offer_shown' && entry.payload?.exposureId === exposureId)) return null;
    return this.log.append('race_trial_offer_shown', {
      raceNumber,
      exposureId,
      costDown,
      availableDown: this.state.down,
      alreadyPurchased: Boolean(this.state.raceTrialAvailable),
    }, this.state.clock);
  }

  recordRacePlaybackAction(raceNumber, action, details = {}) {
    if (this.isTerminal()) return null;
    if (!['pause', 'resume', 'skip', 'replay', 'checkpoint', 'seek', 'pause-podium-motion', 'resume-podium-motion'].includes(action)) return null;
    return this.log.append('race_playback_action', { raceNumber, raceId: this.raceIdFor(raceNumber), action, ...details }, this.state.clock);
  }

  recordRaceCueDisplayed(raceNumber, cue) {
    if (this.isTerminal()) return null;
    if (!cue || typeof cue.cueId !== 'string' || !cue.cueId) return null;
    return this.log.append('race_cue_displayed', {
      raceNumber,
      raceId: this.raceIdFor(raceNumber),
      cueId: cue.cueId,
      eventId: cue.eventId ?? null,
      text: String(cue.text ?? ''),
      timeSeconds: Number.isFinite(cue.timeSeconds) ? cue.timeSeconds : null,
      seek: Boolean(cue.seek),
    }, this.state.clock);
  }

  purchaseRaceTrial() {
    const cost = GAME_CONSTANTS.RACE_TRIAL_COST;
    if (this.isTerminal() || this.state.raceTrialAvailable || this.state.down < cost) return false;
    if (this.state.life?.policyVersion==='five-slot-v1' && (this.state.life.schedule.recovery || this.checkDueObligations().bills.length)) return false;
    const downBefore = this.state.down;
    this.state.down -= cost;
    this.state.raceTrialAvailable = true;
    this.log.append('action', {
      kind: 'race_trial_purchased', costDown: cost, downBefore, downAfter: this.state.down,
      speedMultiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER,
    }, this.state.clock);
    return true;
  }

  /** One named seam for the pure, deterministic resolver; kept side-effect free. */
  resolveRaceCandidate(input) {
    return resolveSeededRace(input);
  }

  serializeRaceCandidate(resolution) { return serializeRaceResolution(resolution); }

  /** Prepare on an owned worker and publish only after the exact draft epoch remains current. */
  async runRaceV2(raceNumber,duckId,stance='safe',options={}){
    if(!this.#v2Enabled||this.#v2Pending||this.isTerminal()||this.state.life?.policyVersion!=='five-slot-v1')return null;
    const prior=this.getRaceAttempt(raceNumber);if(prior)return prior;
    if(!Number.isSafeInteger(raceNumber)||raceNumber!==Math.max(0,...Object.keys(this.state.raceAttempts).map(Number))+1)return null;
    const duck=BANNER_1_ROSTER.find(e=>e.id===duckId),useTrial=options.useTrial??false;
    if(!duck||!this.state.owned.includes(duckId)||!['safe','sprint'].includes(stance)||typeof useTrial!=='boolean'||(useTrial&&!this.state.raceTrialAvailable)
      ||!fiveSlotAppOpened(this.log.entries)||this.state.pendingReveals.some(e=>!e.revealed))return null;
    const capture=()=>JSON.stringify({state:this.state,events:this.log.entries,root:this.rng.serialize(),draw:this.rngDraw.serialize(),race:this.rngRace.serialize(),event:this.rngEvent.serialize()});
    const epoch=capture(),draft=this.#transactionDraft(),raceId=this.raceIdFor(raceNumber);
    const balances={cashCents:Math.round(draft.state.cash*100),health:draft.state.health},context=draft.#fiveSlotContext();context.schedule.operationAvailable=true;
    const operationId=options.operationId??`race:${raceNumber}:${draft.log.length}`;
    const intent={domain:'schedule',action:{type:'play',kind:'race',operationId,...(options.confirmNext===true?{extend:true}:{})}};
    const prepared=inspectLifeTransaction(draft.state.life,balances,intent,context);if(!prepared.ok||prepared.proposal.schedule.recoveryInstead)return null;
    if(draft.tutorialShiftVersion&&prepared.proposal.schedule.disclosures.length&&!draft.#fiveSlotWarningWasShown(prepared.proposal))return null;
    if(prepared.proposal.schedule.disclosures.length&&options.confirmConsequences!==true)return null;
    const conflictChoice=options.conflictChoice??(options.confirmSocial===true?'break':null);
    if(prepared.proposal.schedule.conflicts.length&&!['notice','break'].includes(conflictChoice))return null;
    const common={confirmed:true,success:true,operationId,...(conflictChoice?{conflictChoice}:{}),...(options.overtimeChoice?{overtimeChoice:options.overtimeChoice}:{})};
    const admitted=commitLifeTransaction(draft.state.life,balances,prepared.proposal,{...common,resultRef:'race:pending'},context);if(!admitted.ok)return null;
    const entryDay=admitted.state.schedule.day,oldDay=draft.state.life.schedule.day;
    draft.state.raceGrowth=recoverRaceDays(draft.state.raceGrowth,entryDay-oldDay);draft.#v2RecoveryDay=entryDay;
    draft.log.append('life52_intent',{intent:structuredClone(intent),operation:{confirmed:true,...(conflictChoice?{conflictChoice}:{}),...(options.overtimeChoice?{overtimeChoice:options.overtimeChoice}:{})}},draft.state.clock);
    draft.activateRaceRestPolicy();
    const restEvidence=makeRaceRestEvidence(draft.log.entries,duckId,duck.speed),trialCommitted=Boolean(useTrial&&draft.state.raceTrialAvailable);
    const evidence={...restEvidence,trialCommitted,trialMultiplier:GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER};
    const input=buildRaceV2Input({seed:draft.seed,raceId,duckId,baseRating:duck.speed,fieldRating:raceNumber===1?GAME_CONSTANTS.TUTORIAL_FIELD_SPEED:GAME_CONSTANTS.FINALE_FIELD_SPEED,
      restFactor:restEvidence.restFactor,trialCommitted,stance,progress:draft.state.raceGrowth});
    const workerContext={runId:this.seed,operationId,revision:String(this.state.life.schedule.revision),logLength:String(this.log.length),stateIdentity:raceId};
    const generation=++this.#v2Generation;this.#v2Pending=true;const client=createRaceWorkerClient();this.#v2Worker=client;
    try{
      await client.prepare({mode:'resolve',input,context:workerContext});
      if(this.#v2Generation!==generation||this.isTerminal()||capture()!==epoch)return null;
      const candidate=client.claim(workerContext);if(!candidate)return null;
      const result=await decodeResult(candidate.envelope);if(this.#v2Generation!==generation||capture()!==epoch)return null;
      const effects=applyRaceV2Facts(draft.state.raceGrowth,{seed:draft.seed,raceId,duckId},result);
      const records=Object.values(draft.state.raceResolutions),size=new TextEncoder().encode(JSON.stringify(candidate.compact)).byteLength;
      if(records.length>=128||size>128*1024||records.reduce((n,r)=>n+new TextEncoder().encode(JSON.stringify(r)).byteLength,0)+size>1024*1024)return null;
      const finished=result.status==='finished',crossings=result.crossings,order=finished?crossings.map((e,i)=>({id:e.id,place:i+1,payout:[50,20,10,0,0,0][i]})):null;
      const commonAttempt={raceNumber,raceId,duckId,status:finished?'finished':'unresolved',resolutionStatus:result.status,resolutionDigest:candidate.compact.digest,restEvidence:evidence,
        entryDay,entryInjury:effects.enteredInjured,raceGrowthAfter:effects.progress,extensionRoll:effects.extensionRoll,extension:effects.extension};
      const attempt=finished?{...commonAttempt,place:effects.place,payoutGems:effects.payoutGems,rivalPlace:raceNumber===2?order.find(e=>e.id==='A').place:null,
        playerPerf:null,winner:crossings[0].id,finishTimeSeconds:Number(crossings[0].time)/1000000,lastFinishTimeSeconds:Number(crossings.at(-1).time)/1000000,
        finishOrder:order,trialConsumed:trialCommitted}
        :{...commonAttempt,unresolvedReason:result.unresolved.reason,guardEvidence:result.unresolved.guardEvidence,knownCrossings:crossings.map(e=>({id:e.id,crossingTimeSeconds:Number(e.time)/1000000})),trialAvailable:Boolean(draft.state.raceTrialAvailable),trialCommitted};
      draft.log.append('action',{kind:'race_choice',stance,duckId,raceId,trialCommitted,restEvidence:evidence},draft.state.clock);
      draft.state.raceResolutions[raceId]=candidate.compact;draft.state.raceGrowth=effects.progress;
      if(finished){const gemsAfter=draft.state.gems+effects.payoutGems;draft.log.append('race_result',{...attempt,stance,gemsAfter},draft.state.clock);
        if(trialCommitted)draft.log.append('action',{kind:'race_trial_consumed',raceId,multiplier:GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER},draft.state.clock);
        if(effects.payoutGems>0)draft.log.append('reward',{kind:'race_gems',gems:effects.payoutGems,gemsAfter,raceId},draft.state.clock);
        draft.state.gems=gemsAfter;draft.state.lastRacedId=duckId;draft.state.completedRaces.push(raceNumber);draft.state.raceResults[raceNumber]=deepFreeze(attempt);
        draft.state.lastRaceResult=draft.state.raceResults[raceNumber];if(trialCommitted)draft.state.raceTrialAvailable=false;
      }else draft.log.append('race_attempt_unresolved',attempt,draft.state.clock);
      draft.state.raceAttempts[raceNumber]=deepFreeze(attempt);draft.state.step='life_race_result';
      const committed=commitLifeTransaction(draft.state.life,balances,prepared.proposal,{...common,resultRef:`race:${candidate.compact.digest}`},context);
      if(!committed.ok||committed.state.schedule.day!==entryDay||this.#v2Generation!==generation||capture()!==epoch)return null;
      draft.state.life=committed.state;draft.state.cash=(balances.cashCents+committed.cashDeltaCents)/100;draft.state.health=balances.health+committed.healthDelta;
      for(const event of committed.events)draft.log.append('life52_effect',{effect:event},draft.state.clock);
      draft.log.append('life52_commit',{domain:'schedule',operationId,cashDeltaCents:committed.cashDeltaCents,healthDelta:committed.healthDelta},draft.state.clock);
      draft.state.day=entryDay;draft.state.clock={day:entryDay,label:`day ${entryDay} ${committed.state.schedule.slot}`};
      if(this.#v2Generation!==generation||this.isTerminal()||capture()!==epoch)return null;
      this.#publishTransaction(draft);this.#v2SessionResults.set(raceId,candidate.envelope);this.#v2VerifiedCandidates.set(raceId,candidate);return this.state.raceAttempts[raceNumber];
    }finally{client.close();if(this.#v2Generation===generation&&this.#v2Worker===client){this.#v2Worker=null;this.#v2Pending=false;}}
  }
  cancelRaceV2(){this.#v2Generation++;const worker=this.#v2Worker;this.#v2Worker=null;this.#v2Pending=false;worker?.cancel();}
  assignRaceV2Ability(duckId,ability){
    if(!this.#v2Enabled||this.#v2Pending||this.isTerminal()||!this.state.owned.includes(duckId))return false;
    const draft=this.#transactionDraft();try{draft.state.raceGrowth=assignRaceAbility(draft.state.raceGrowth,duckId,ability);}catch{return false;}
    draft.log.append('action',{kind:'race_ability_assigned',duckId,ability},draft.state.clock);this.#publishTransaction(draft);return true;
  }
  getRaceV2SessionEnvelope(raceId){return this.#v2SessionResults.get(raceId)??null;}
  getRaceV2VerifiedCandidate(raceId){return this.#v2VerifiedCandidates.get(raceId)??null;}

  /** Resolve and commit one deterministic race attempt. Re-entry returns its stored attempt. */
  runRace(raceNumber, duckId, stance = 'safe', options = {}) {
    if(this.#v2Enabled)throw new Error('Schema-6 races require asynchronous preparation');
    const { useTrial = false } = options;
    if (this.state.life?.policyVersion === 'five-slot-v1' && !options[FIVE_SLOT_RACE]) {
      return this.#stageFiveSlotRace(raceNumber, duckId, stance, options);
    }
    if (options.confirmNext === true || options.confirmSocial === true) return this.#stageNextPlay('runRace', [raceNumber, duckId, stance, { useTrial }], { next: options.confirmNext === true, social: options.confirmSocial === true });
    if (this.isTerminal()) throw new Error('Cannot race: game is in terminal phase');
    const raceId = this.raceIdFor(raceNumber);
    const priorAttempt = this.getRaceAttempt(raceNumber);
    if (priorAttempt) return priorAttempt;
    if (!['safe', 'sprint'].includes(stance)) throw new RangeError(`Unsupported race stance: ${stance}`);
    const duckDef = BANNER_1_ROSTER.find((duck) => duck.id === duckId);
    if (!duckDef || !this.state.owned.includes(duckId)) throw new RangeError('Selected racer must be an owned roster duck');
    if (typeof useTrial !== 'boolean') throw new TypeError('useTrial must be boolean');
    if (useTrial && !this.state.raceTrialAvailable) throw new RangeError('No purchased race trial is available');
    const raceReservation = options[NEXT_RESERVATION] ? { type: 'phone_commit_next', version: 1, confirmed: true, kind: 'race' } : { type: 'phone_commit', kind: 'race' };
    if (options[SOCIAL_RESERVATION]) raceReservation.socialConflict = 'continue';
    if (this.state.life && this.state.life.policyVersion !== 'five-slot-v1' && !transitionLife(this.state.life, this.state, raceReservation).ok) return null;

    this.activateRaceRestPolicy();
    const fieldBaseSpeed = raceNumber === 1 ? GAME_CONSTANTS.TUTORIAL_FIELD_SPEED : GAME_CONSTANTS.FINALE_FIELD_SPEED;
    const trialCommitted = Boolean(useTrial && this.state.raceTrialAvailable);
    const restEvidence = makeRaceRestEvidence(this.log.entries, duckId, duckDef.speed);
    const restFactor = restEvidence.restFactor;
    const effectivePlayerRating = restEvidence.effectiveBaseInput;
    const resolverInput = {
      seed: this.seed,
      raceId,
      authoredPlayerRating: duckDef.speed,
      playerBaseSpeed: effectivePlayerRating,
      restFactor,
      fieldBaseSpeed,
      choice: stance === 'safe' ? 'steady' : 'sprint',
      trialCommitted,
      trialMultiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER,
      experiment: 'weave-rank-strong-contact',
      dramaArm: 'R2combined-risk-only',
      studySprintMean: 1,
    };

    // Compute and serialize before any wallet, trial, progression, or log mutation.
    const resolution = this.resolveRaceCandidate(resolverInput);
    const saved = this.serializeRaceCandidate(resolution);
    if (this.state.life && this.state.life.policyVersion !== 'five-slot-v1' && !this.applyLifeIntent(raceReservation, options[NEXT_RESERVATION] ? NEXT_RESERVATION : null).ok) throw new Error('Race reservation changed during resolution');
    const player = resolution.finish.find((entrant) => entrant.id === 'P') ?? null;
    const rival = raceNumber === 2 ? resolution.finish.find((entrant) => entrant.id === 'A') : null;
    const isFinished = resolution.status === 'finished' && resolution.finish.length === 6 && player?.place;
    const nextStep = this.state.life ? 'life_race_result' : raceNumber === 1 ? 'd1_midday_race_result' : 'd3_midday_race_result';

    this.log.append('action', { kind: 'race_choice', stance, duckId, raceId, trialCommitted, restEvidence: { ...restEvidence, trialCommitted, trialMultiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER } }, this.state.clock);
    this.state.raceResolutions[raceId] = saved.encoded;

    if (!isFinished) {
      const attempt = {
        raceNumber,
        raceId,
        duckId,
        status: 'unresolved',
        resolutionStatus: resolution.status,
        resolutionDigest: saved.digest,
        unresolvedReason: resolution.unresolvedReason,
        guardEvidence: structuredClone(resolution.guardEvidence),
        knownCrossings: resolution.finishCrossings.map((crossing) => ({ id: crossing.id, crossingTimeSeconds: crossing.crossingTimeSeconds })),
        trialAvailable: Boolean(this.state.raceTrialAvailable),
        trialCommitted,
        restEvidence: { ...restEvidence, trialCommitted, trialMultiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER },
      };
      this.log.append('race_attempt_unresolved', attempt, this.state.clock);
      this.state.raceAttempts[raceNumber] = deepFreeze(attempt);
      this.state.step = nextStep;
      return this.state.raceAttempts[raceNumber];
    }

    const place = player.place;
    const payoutGems = player.payout;
    const outcome = {
      raceNumber,
      raceId,
      duckId,
      status: 'finished',
      resolutionStatus: resolution.status,
      place,
      payoutGems,
      rivalPlace: rival?.place ?? null,
      playerPerf: player.sampledPerformance,
      winner: resolution.winner,
      finishTimeSeconds: resolution.finishTimeSeconds,
      lastFinishTimeSeconds: resolution.lastFinishTimeSeconds,
      resolutionDigest: saved.digest,
      finishOrder: resolution.finish.map((entrant) => ({ id: entrant.id, place: entrant.place, payout: entrant.payout })),
      trialConsumed: trialCommitted,
      restEvidence: { ...restEvidence, trialCommitted, trialMultiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER },
    };
    const gemsAfter = this.state.gems + payoutGems;

    this.log.append('race_result', {
      ...outcome,
      duckId,
      stance,
      gemsAfter,
      finishOrder: outcome.finishOrder,
    }, this.state.clock);
    if (trialCommitted) {
      this.log.append('action', { kind: 'race_trial_consumed', raceId, multiplier: GAME_CONSTANTS.RACE_TRIAL_SPEED_MULTIPLIER }, this.state.clock);
    }
    if (payoutGems > 0) this.log.append('reward', { kind: 'race_gems', gems: payoutGems, gemsAfter, raceId }, this.state.clock);

    this.state.gems = gemsAfter;
    this.state.lastRacedId = duckId;
    this.state.completedRaces.push(raceNumber);
    const committedOutcome = deepFreeze(outcome);
    this.state.raceAttempts[raceNumber] = committedOutcome;
    this.state.raceResults[raceNumber] = committedOutcome;
    this.state.lastRaceResult = committedOutcome;
    if (trialCommitted) this.state.raceTrialAvailable = false;
    this.state.step = nextStep;
    return committedOutcome;
  }

  /** Displays the $0.99 Starter Pack offer */
  displayStarterOffer() {
    if (this.isTerminal()) throw new Error('Cannot display starter offer: game is in terminal phase');
    this.state.starterOffered = true;
    this.state.step = 'd1_afternoon_starter';
    this.state.activeModal = 'starter';
    this.log.append('offer_shown', {
      technique: 'anchoring',
      gems: GAME_CONSTANTS.STARTER_GEMS,
      price: GAME_CONSTANTS.STARTER_PRICE,
      anchorLabel: '400% value',
    }, this.state.clock);
  }

  /** Buys the Starter Pack for $0.99 */
  buyStarterPack() {
    if (this.isTerminal()) throw new Error('Cannot buy starter pack: game is in terminal phase');
    if (this.state.starterBought) return false;
    if (this.state.cash < GAME_CONSTANTS.STARTER_PRICE) return false;

    this.state.cash = Math.round((this.state.cash - GAME_CONSTANTS.STARTER_PRICE) * 100) / 100;
    this.state.gems += GAME_CONSTANTS.STARTER_GEMS;
    this.state.starterBought = true;
    this.state.activeModal = null;

    this.log.append('purchase', {
      kind: 'starter',
      price: GAME_CONSTANTS.STARTER_PRICE,
      bundleGems: GAME_CONSTANTS.STARTER_GEMS,
      gemsAfter: this.state.gems,
    }, this.state.clock);

    return true;
  }

  /** Declines the Starter Pack */
  declineStarterPack() {
    if (this.isTerminal()) throw new Error('Cannot decline starter pack: game is in terminal phase');
    this.state.activeModal = null;
    this.log.append('action', { kind: 'starter_declined' }, this.state.clock);
  }

  /** Displays the Gem Bundle Shop (exercises currency_obfuscation on Receipt) */
  displayGemShop() {
    if (this.isTerminal()) return;
    this.log.append('cue_shown', {
      technique: 'currency_obfuscation',
      bundles: [
        { gems: 60, price: 0.99 },
        { gems: 330, price: 4.99 },
        { gems: 1090, price: 14.99 },
      ],
      pullCost: GAME_CONSTANTS.PULL_SINGLE_COST,
    }, this.state.clock);
  }

  /** Record the terms actually displayed by the new-policy phone menu. */
  displayLifeGemShop() {
    if (this.isTerminal() || !this.state.life) return null;
    const cue = this.log.append('cue_shown', {
      technique: 'currency_obfuscation', bundles: [{ gems: 330, price: 4.99 }],
      pullCost: GAME_CONSTANTS.PULL_SINGLE_COST,
    }, this.state.clock);
    if (!this.state.tenPullCommitted) this.log.append('offer_shown', { technique: 'welcome_offer', kind: 'free_ten_pull', count: 10 }, this.state.clock);
    return cue;
  }

  /** Credits daily wage at end of day */
  creditWage() {
    if (this.isTerminal()) throw new Error('Cannot credit wage: game is in terminal phase');
    this.state.cash += GAME_CONSTANTS.WAGE_DAILY;
    this.state.cash = Math.round(this.state.cash * 100) / 100;
    this.log.append('income', { kind: 'wage', amount: GAME_CONSTANTS.WAGE_DAILY }, this.state.clock);
  }

  getBillId(kind) {
    return `d${this.state.day}_${kind}`;
  }

  /**
   * Attempts to pay an expense bill (food or rent).
   * Guarded against repeated execution: each day/kind bill occurrence is once-only (Repair 02, P1).
   * Updates state.step and state.activeModal atomically with the mutation.
   * Returns:
   * - { paid: true }: paid in cash immediately (or already settled)
   * - { paid: false, needsEscalation: true }: cash insufficient, active bill pending escalation
   */
  billExpense(kind, amount) {
    if (this.isTerminal()) throw new Error('Cannot bill expense: game is in terminal phase');
    if (!this.state.billsSettled) this.state.billsSettled = [];

    const billId = this.getBillId(kind);

    // 1. Idempotency guard: if this exact bill was already settled, return success without duplicating
    if (this.state.billsSettled.includes(billId)) {
      return { paid: true, needsEscalation: false, alreadySettled: true };
    }

    // 2. If this exact bill is already pending in activeBill, return needsEscalation without re-logging
    if (this.state.activeBill && this.state.activeBill.billId === billId) {
      return { paid: false, needsEscalation: true, alreadyPending: true };
    }

    this.log.append('expense_due', { kind, amount, cashBefore: this.state.cash, billId }, this.state.clock);

    if (this.state.cash >= amount) {
      this.state.cash = Math.round((this.state.cash - amount) * 100) / 100;
      this.state.billsSettled.push(billId);
      this.log.append('expense_paid', { kind, amount, cashAfter: this.state.cash, billId }, this.state.clock);

      // Check for zero-cash solvency tension if cash hits exactly $0
      if (this.state.cash === 0) {
        this.state.activeModal = 'zerocash';
        this.state.step = (kind === 'rent') ? 'd2_afternoon_zerocash' : this.state.step;
        this.log.append('escalation_offered', {
          step: 'zero_cash_check',
          billKind: kind,
          cashBefore: 0,
          healthBefore: this.state.health,
          billId,
        }, this.state.clock);
        return { paid: true, needsEscalation: false, zeroCash: true };
      }

      if (kind === 'rent') {
        this.state.step = 'd2_afternoon_rent_resolved';
        this.state.activeModal = null;
      }

      return { paid: true, needsEscalation: false };
    }

    // Cash insufficient: active escalation
    this.state.activeBill = { kind, amount, billId };
    this.state.phase = 'escalation';
    this.state.escalationStepIndex = 1;
    this.state.activeModal = 'escalation';
    this.state.step = (kind === 'rent') ? 'd2_afternoon_escalation' : this.state.step;
    return { paid: false, needsEscalation: true };
  }

  /** Resolve today's breakfast without payment, recording only the actual health lost. */
  skipBreakfast() {
    const day = this.state.day;
    const billId = `d${day}_food`;
    if (this.state.billsSettled?.includes(billId)) {
      return { skipped: false, alreadySettled: true };
    }
    if (this.isTerminal()) return { skipped: false, reason: 'terminal' };
    if (![1, 2, 3].includes(day) || this.state.step !== `d${day}_morning_breakfast`)
      return { skipped: false, reason: 'wrong_step' };
    if (this.state.activeBill || this.state.activeModal) return { skipped: false, reason: 'pending_modal' };
    if (!this.state.billsSettled) this.state.billsSettled = [];

    const healthLost = Math.min(GAME_CONSTANTS.BREAKFAST_SKIP_HEALTH_COST, Math.max(0, this.state.health));
    this.state.health -= healthLost;
    this.state.billsSettled.push(billId);
    this.log.append('action', {
      kind: 'breakfast_skipped', day, billId, healthLost, healthAfter: this.state.health,
    }, this.state.clock);
    return { skipped: true, alreadySettled: false, healthLost, healthAfter: this.state.health };
  }

  /**
   * Solvent zero-cash recovery options (Repair 01, P1).
   * Handles choices made at $0.00 cash after bills are paid in full.
   * Neither invents an unpaid bill nor sets running_on_empty.
   */
  chooseZeroCashOption(choice) {
    if (this.isTerminal()) throw new Error('Cannot choose zero-cash option: game is in terminal phase');
    if (choice === 'sell_couch' && this.state.assetsSold.includes('couch')) {
      throw new Error('Couch already sold');
    }
    if (this.state.cash !== 0) throw new Error(`Zero-cash option selected when cash is $${this.state.cash}`);

    if (choice === 'continue') {
      this.state.activeModal = null;
      this.state.step = 'd2_afternoon_rent_resolved';
      this.log.append('action', { kind: 'continue_to_wage' }, this.state.clock);
      return { resolved: true, choice: 'continue', cash: this.state.cash, health: this.state.health };
    }

    if (choice === 'extra_shift') {
      if (this.state.health <= 20) throw new Error('Health too low for extra shift');
      this.state.cash += 10.00;
      this.state.health -= 15;
      this.state.activeModal = null;
      this.state.step = 'd2_afternoon_rent_resolved';

      this.log.append('action', { kind: 'zero_cash_extra_shift' }, this.state.clock);
      this.log.append('escalation_result', {
        step: 'extra_shift',
        effects: { cashGained: 10, healthLost: 15 },
        cashAfter: this.state.cash,
        healthAfter: this.state.health,
      }, this.state.clock);

      return { resolved: true, choice: 'extra_shift', cash: this.state.cash, health: this.state.health };
    }

    if (choice === 'sell_couch') {
      if (this.state.assetsSold.includes('couch')) throw new Error('Couch already sold');
      this.state.assetsSold.push('couch');
      this.state.cash += 10.00;
      this.state.activeModal = null;
      this.state.step = 'd2_afternoon_rent_resolved';

      this.log.append('action', { kind: 'zero_cash_sell_couch' }, this.state.clock);
      this.log.append('escalation_result', {
        step: 'sell_couch',
        effects: { cashGained: 10 },
        cashAfter: this.state.cash,
        healthAfter: this.state.health,
      }, this.state.clock);

      return { resolved: true, choice: 'sell_couch', cash: this.state.cash, health: this.state.health };
    }

    throw new Error(`Unknown zero-cash choice: "${choice}"`);
  }

  /** Backward-compatible alias for continue to wage */
  continueToWage() {
    return this.chooseZeroCashOption('continue');
  }

  /** Returns the current eligible escalation step for an unpaid bill */
  getCurrentEscalationStep() {
    if (!this.state.activeBill) return null;
    const kind = this.state.activeBill.kind;

    // Steps: 1: skip_lunch (food only), 2: extra_shift, 3: sell_couch, 4: sell_tv, 5: credit_card
    const idx = this.state.escalationStepIndex;
    if (idx === 1) {
      if (kind === 'food' && this.state.health > 20) return 'skip_lunch';
      this.state.escalationStepIndex = 2;
    }
    if (this.state.escalationStepIndex === 2) {
      if (this.state.health > 20) return 'extra_shift';
      this.state.escalationStepIndex = 3;
    }
    if (this.state.escalationStepIndex === 3) {
      if (!this.state.assetsSold.includes('couch')) return 'sell_couch';
      this.state.escalationStepIndex = 4;
    }
    if (this.state.escalationStepIndex === 4) {
      if (!this.state.assetsSold.includes('tv')) return 'sell_tv';
      this.state.escalationStepIndex = 5;
    }
    if (this.state.escalationStepIndex === 5) {
      if (this.state.debt < 50.00) return 'credit_card';
    }
    return null;
  }

  /** Accepts the current escalation step for an unpaid bill */
  acceptEscalation() {
    if (this.isTerminal()) throw new Error('Cannot accept escalation: game is in terminal phase');
    const step = this.getCurrentEscalationStep();
    if (!step) return this.exhaustEscalation();

    this.log.append('action', { kind: 'escalation_accepted', step }, this.state.clock);

    const bill = this.state.activeBill;
    const eff = {};

    if (step === 'skip_lunch') {
      this.state.health -= 15;
      eff.healthLost = 15;
      eff.billWaived = bill.amount;
      this.log.append('escalation_result', {
        step,
        effects: eff,
        cashAfter: this.state.cash,
        healthAfter: this.state.health,
      }, this.state.clock);

      this.log.append('expense_paid', { kind: bill.kind, amount: 0, cashAfter: this.state.cash }, this.state.clock);
      this.state.activeBill = null;
      this.state.activeModal = null;
      this.state.phase = 'playing';
      return { resolved: true, route: null };
    }

    if (step === 'extra_shift') {
      this.state.cash += 10.00;
      this.state.health -= 15;
      eff.cashGained = 10.00;
      eff.healthLost = 15;
    } else if (step === 'sell_couch') {
      this.state.assetsSold.push('couch');
      this.state.cash += 10.00;
      eff.cashGained = 10.00;
    } else if (step === 'sell_tv') {
      this.state.assetsSold.push('tv');
      this.state.cash += 15.00;
      eff.cashGained = 15.00;
    } else if (step === 'credit_card') {
      this.state.cash += 15.00;
      this.state.debt += 15.00;
      eff.cashGained = 15.00;
      eff.debtAfter = this.state.debt;
    }

    this.state.cash = Math.round(this.state.cash * 100) / 100;

    this.log.append('escalation_result', {
      step,
      effects: eff,
      cashAfter: this.state.cash,
      healthAfter: this.state.health,
    }, this.state.clock);

    // If cash is now sufficient to pay the bill
    if (this.state.cash >= bill.amount) {
      this.state.cash = Math.round((this.state.cash - bill.amount) * 100) / 100;
      if (!this.state.billsSettled) this.state.billsSettled = [];
      if (bill.billId && !this.state.billsSettled.includes(bill.billId)) {
        this.state.billsSettled.push(bill.billId);
      }
      this.log.append('expense_paid', { kind: bill.kind, amount: bill.amount, cashAfter: this.state.cash, billId: bill.billId }, this.state.clock);
      this.state.activeBill = null;
      this.state.activeModal = null;
      this.state.phase = 'playing';
      this.state.step = 'd2_afternoon_rent_resolved';
      return { resolved: true, route: null };
    }

    // Still insufficient, advance to next step
    this.state.escalationStepIndex++;
    return { resolved: false, route: null };
  }

  /** Declines current escalation step and advances to the next */
  declineEscalation() {
    if (this.isTerminal()) throw new Error('Cannot decline escalation: game is in terminal phase');
    const step = this.getCurrentEscalationStep();
    this.log.append('action', { kind: 'escalation_declined', step }, this.state.clock);

    this.state.escalationStepIndex++;
    if (!this.getCurrentEscalationStep()) {
      return this.exhaustEscalation();
    }
    return { resolved: false, route: null };
  }

  /** Escalation exhausted or defaulted on unpaid bill */
  exhaustEscalation() {
    this.state.phase = 'terminal';
    this.state.terminalRoute = 'running_on_empty';
    this.state.step = 'receipt';
    this.state.activeModal = null;
    this.log.append('terminal', { route: 'running_on_empty' }, this.state.clock);
    return { resolved: false, route: 'running_on_empty' };
  }

  /**
   * Opens retention modal on clicking persistent Uninstall button.
   * Frozen terminal guard: impossible to call once terminal/Receipt presented.
   */
  clickUninstall() {
    if (this.isTerminal()) {
      throw new Error('Cannot uninstall after run is terminal or Receipt presented');
    }
    // Already asking: a repeated request keeps the original interrupted context and logs nothing (Plan 38).
    if (this.state.activeModal === 'retention') return;
    this.state.interruptedContext = {
      step: this.state.step,
      activeModal: this.state.activeModal,
    };
    this.state.activeModal = 'retention';
    this.state.retentionOffered = true;

    this.log.append('action', { kind: 'uninstall_chosen' }, this.state.clock);
    this.log.append('retention_modal_shown', {
      technique: 'exit_friction',
      gemsOffered: this.state.retentionUsed ? 0 : GAME_CONSTANTS.RETENTION_GEMS,
      stayLabel: 'play out the trap',
    }, this.state.clock);
  }

  /** Chooses 'Leave Anyway' from the retention modal */
  leaveUninstall() {
    if (this.isTerminal()) throw new Error('Cannot leave uninstall: game is already in terminal phase');
    this.log.append('action', { kind: 'leave_immediately' }, this.state.clock);
    this.recordPendingLifeInterruption();
    this.state.phase = 'terminal';
    this.state.terminalRoute = 'uninstall';
    this.state.step = 'receipt';
    this.state.activeModal = null;
    this.log.append('terminal', { route: 'uninstall' }, this.state.clock);
    return 'uninstall';
  }

  /**
   * Chooses 'Play Out The Trap' from retention modal.
   * Truthful repeat retention: only awards 80 gems once; restores previous context cleanly.
   */
  stayUninstall() {
    if (this.isTerminal()) throw new Error('Cannot stay: game is in terminal phase');
    if (!this.state.retentionUsed) {
      this.state.gems += GAME_CONSTANTS.RETENTION_GEMS;
      this.state.retentionUsed = true;
      this.log.append('action', { kind: 'play_out_the_trap' }, this.state.clock);
      this.log.append('reward', {
        kind: 'retention_gems',
        gems: GAME_CONSTANTS.RETENTION_GEMS,
        gemsAfter: this.state.gems,
      }, this.state.clock);
    } else {
      this.log.append('action', { kind: 'stay_without_reward' }, this.state.clock);
    }

    // Restore interrupted step and modal
    if (this.state.interruptedContext) {
      this.state.step = this.state.interruptedContext.step || this.state.step;
      this.state.activeModal = this.state.interruptedContext.activeModal || null;
      this.state.interruptedContext = null;
    } else {
      this.state.activeModal = null;
    }
  }

  /** Completes run normally at end of Day 3 */
  finishRunComplete() {
    if (this.isTerminal()) return this.state.terminalRoute;
    this.recordPendingLifeInterruption();
    this.state.phase = 'terminal';
    this.state.terminalRoute = 'run_complete';
    this.state.step = 'receipt';
    this.state.activeModal = null;
    this.log.append('terminal', { route: 'run_complete' }, this.state.clock);
    return 'run_complete';
  }

  /** Record unfinished commitments before terminal, without settling them or inventing consequences. */
  recordPendingLifeInterruption() {
    if (this.isTerminal() || !this.state.life) return;
    const life=this.state.life,{story47,social46}=life,active=life.schedule?.active;
    const work=life.policyVersion==='five-slot-v1' && ['work','overtime'].includes(active?.kind)
      ? {id:active.id,kind:active.kind==='work'?'scheduled':'overtime',status:'doing'} : life.work;
    const session=life.policyVersion==='five-slot-v1' && active?.kind==='session'
      ? {id:active.id,suspended:null,pull:active.pullUsed,race:active.raceUsed} : life.session;
    const day=life.schedule?.day??life.day;
    if (social46?.scene?.stage === 'scene' && !this.log.entries.some(e => e.type === 'social46_interrupted' && e.payload.id === social46.scene.id))
      this.log.append('social46_interrupted', { id: social46.scene.id, day }, this.state.clock);
    else if (!social46?.scene && social46?.pending?.committed && !this.log.entries.some(e => e.type === 'social46_plan_interrupted' && e.payload.id === social46.pending.id))
      this.log.append('social46_plan_interrupted', { id: social46.pending.id, day: social46.pending.day }, this.state.clock);
    if (story47?.kind === 'activity' && story47.stage === 'scene' && !this.log.entries.some(e => e.type === 'activity47_interrupted' && e.payload.id === story47.id))
      this.log.append('activity47_interrupted', { id: story47.id, choice: story47.choice, day }, this.state.clock);
    if (work?.status === 'doing' && !this.log.entries.some(e => e.type === 'work_interrupted' && e.payload.id === work.id))
      this.log.append('work_interrupted', { id: work.id, kind: work.kind, day }, this.state.clock);
    if (session && !this.log.entries.some(e => e.type === 'session_interrupted' && e.payload.id === session.id))
      this.log.append('session_interrupted', { id: session.id, suspended: session.suspended, pull: session.pull, race: session.race }, this.state.clock);
  }

  /**
   * Appends receipt_shown strictly upon actual visual presentation in the DOM.
   * Completes the terminal / receipt_shown tail pair required by verifyCompleteness().
   * Idempotent on reload: does not append duplicate events if already presented.
   */
  recordReceiptPresented() {
    if (!this.isTerminal()) {
      throw new Error(`Cannot record Receipt presentation in phase "${this.state.phase}" (must be terminal)`);
    }

    if (this.state.phase === 'terminal') {
      this.log.append('receipt_shown', { route: this.state.terminalRoute }, this.state.clock);
      this.state.phase = 'receipt_presented';
      this.state.step = 'receipt';
    }

    return projectReceipt(this.log.entries);
  }

  /** Backward-compatible alias */
  presentReceipt() {
    return this.recordReceiptPresented();
  }

  /** Advances clock day */
  advanceDay(dayNumber, label) {
    if (this.isTerminal()) throw new Error('Cannot advance day: game is in terminal phase');
    this.state.day = dayNumber;
    this.state.clock = { day: dayNumber, label: label ?? `day ${dayNumber} morning` };
  }

  /** Serializes complete game snapshot into storage envelope */
  toEnvelope() {
    return {
      schemaVersion: this.#v2Enabled ? 6 : this.state.life?.policyVersion === 'five-slot-v1' ? 5 : this.state.life ? 4 : 3,
      ...(this.messagesPolicy ? { messagesPolicy: this.messagesPolicy } : {}),
      raceRestEvidenceVersion: 1,
      savedAt: Date.now(),
      autosaveEnabled: this.autosaveEnabled,
      state: structuredClone(this.state),
      prngStreams: {
        root: this.rng.serialize(),
        draw: this.rngDraw.serialize(),
        race: this.rngRace.serialize(),
        event: this.rngEvent.serialize(),
      },
      eventLog: this.log.entries,
    };
  }

  /** Hydrates engine state from a validated storage envelope */
  static fromEnvelope(envelope) {
    const rootStreamObj = JSON.parse(envelope.prngStreams.root);
    const engine = new GameEngine(rootStreamObj.key,{raceV2:envelope.schemaVersion===6});
    engine.autosaveEnabled = envelope.autosaveEnabled ?? true;
    engine.state = structuredClone(envelope.state);

    engine.rng = restoreRng(envelope.prngStreams.root);
    engine.rngDraw = restoreRng(envelope.prngStreams.draw);
    engine.rngRace = restoreRng(envelope.prngStreams.race);
    engine.rngEvent = restoreRng(envelope.prngStreams.event);

    engine.log = EventLog.hydrate(envelope.eventLog);
    engine.messagesPolicy = engine.log.entries[0]?.payload?.messagesPolicy ?? null;
    engine.tutorialShiftVersion = engine.log.entries.find(e => e.type === 'run_started')?.payload?.tutorialShiftVersion ?? null;

    // Reconstruct / validate authoritative progression from event log (Repair 02, P1)
    if (!engine.state.completedRaces) engine.state.completedRaces = [];
    if (!engine.state.raceResults) engine.state.raceResults = {};
    if (!engine.state.raceAttempts) engine.state.raceAttempts = {};
    if (!engine.state.raceResolutions) engine.state.raceResolutions = {};
    if (typeof engine.state.raceTrialAvailable !== 'boolean') engine.state.raceTrialAvailable = false;
    if (!engine.state.billsSettled) engine.state.billsSettled = [];
    if (!Array.isArray(engine.state.seenDexEntries)) {
      engine.state.seenDexEntries = [...(engine.state.owned || [])];
    }

    for (const e of engine.log.entries) {
      if (e.type === 'race_result') {
        const rNum = e.payload.raceNumber;
        if (!engine.state.completedRaces.includes(rNum)) {
          engine.state.completedRaces.push(rNum);
        }
        if (!engine.state.raceResults[rNum]) {
          engine.state.raceResults[rNum] = {
            place: e.payload.place,
            payoutGems: e.payload.payoutGems,
            rivalPlace: e.payload.rivalPlace,
            playerPerf: e.payload.playerPerf,
          };
        }
        if (!engine.state.raceAttempts[rNum]) {
          engine.state.raceAttempts[rNum] = {
            ...engine.state.raceResults[rNum],
            raceNumber: rNum,
            raceId: e.payload.raceId ?? `legacy-race-${rNum}`,
            status: 'finished',
            resolutionDigest: e.payload.resolutionDigest ?? null,
            legacySummaryOnly: !e.payload.resolutionDigest,
            finishOrder: e.payload.finishOrder ?? null,
          };
        }
      }
      if (e.type === 'race_attempt_unresolved') {
        engine.state.raceAttempts[e.payload.raceNumber] = structuredClone(e.payload);
      }
      if (e.type === 'expense_paid' && e.payload?.billId) {
        if (!engine.state.billsSettled.includes(e.payload.billId)) {
          engine.state.billsSettled.push(e.payload.billId);
        }
      }
      if (e.type === 'action' && e.payload?.kind === 'breakfast_skipped' && e.payload.billId) {
        if (!engine.state.billsSettled.includes(e.payload.billId)) engine.state.billsSettled.push(e.payload.billId);
      }
    }

    for (const attempt of Object.values(engine.state.raceAttempts)) deepFreeze(attempt);
    for (const result of Object.values(engine.state.raceResults)) deepFreeze(result);
    deepFreeze(engine.state.lastRaceResult);
    for (const resolution of Object.values(engine.state.raceResolutions)) deepFreeze(resolution);

    // Step coherence against completed races
    if (!engine.state.life && engine.state.completedRaces.includes(1) && (engine.state.step === 'desk' || engine.state.step === 'd1_morning_gacha' || engine.state.step === 'd1_midday_race')) {
      engine.state.step = 'd1_midday_race_result';
    }
    if (!engine.state.life && engine.state.completedRaces.includes(2) && engine.state.step === 'd3_midday_race') {
      engine.state.step = 'd3_midday_race_result';
    }

    // Terminal phase coherence
    if (engine.log.entries.some((e) => e.type === 'terminal')) {
      const isPresented = engine.log.entries.some((e) => e.type === 'receipt_shown');
      engine.state.phase = isPresented ? 'receipt_presented' : 'terminal';
      engine.state.step = 'receipt';
      engine.state.activeModal = null;
    }

    return engine;
  }
}
