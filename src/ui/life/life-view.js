import { saleTagsAvailable } from './sale-visibility.mjs';
import { renderRoomNavigation } from './room-navigation.mjs';
// src/ui/life/life-view.js
// Apartment life view (Plan 38, the Plan 28 selected mix). Three layers:
//   1 in the room: world objects are real buttons (halo, decorative chip) and the still duck gazes at the target;
//   2 held: the rent letter or the phone, readable; the institution's letter has no controls;
//   3 decide: a collapsed "Decide" panel beside the held item, or a confirm anchored at the object (a sheet under
//     the room on narrow screens). Only layer 3 commits, and it states the exact consequence first.
// The view never calls engine mutators: every commit goes through `callbacks`, with the engine log length captured
// when the decision was built (a null return means stale). No storage, no remote assets, no new engine events.

import { renderScene } from '../../assets/apartment/index.mjs';
import { renderStory47 } from './life-story-view.mjs';
import { renderRenScene46 } from './ren-scene-view.mjs';
import { renderRenChannel46 } from './ren-channel-view.mjs';
import { renderRenDoor46 } from './ren-door-view.mjs';
import { breakfastFraming, breakfastObjectBox } from './life-framing.mjs';
import { GAME_CONSTANTS } from '../../core/game-engine.mjs';
import { callMomScheduled } from '../../core/life-progression.mjs';
import { social46DisplayText, social46NeedsSaleDisclosure, social46VisitAtDoor } from '../../core/life-social.mjs';
import { hasEnteredQuackpot } from '../../core/life-entry.mjs';
import { lifePhoneKind, lifePhoneScreen, lifePhoneResolved } from './life-phone-context.mjs';
import {
  RENT_STEPS, availablePlaces, breakfastState, currentOffer, isBreakfastStep, optionalOpen, placeFor, rentState, fiveSlotSocialView, fiveSlotLabel,
} from './life-routing.mjs';
import {
  breakfastDecision, ladderDecision, optionalCouchDecision, optionalShiftDecision, payRentDecision, shortfallDecision, workCompletionLines, fiveSlotDueDecision,
} from './life-decisions.mjs';
import { BREAKFAST_AMOUNT, RENT_AMOUNT, furnishingsFrom, outcomeView } from './life-preview.mjs';
import { cardApp, chips, marisolThread, money, noticeLetter, rentDueText, rentNoticeCorrections, fiveSlotRentNotice, results, worldLabels } from './life-copy.mjs';
import {
  bakeryBag, duckPoseHtml, emptyPlate, headingToward, leanToward, saleTag, tapedNotice, workKeysTray,
} from './life-art.mjs';

const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let seq = 0;
const uid = (p) => `${p}${++seq}`;

// ---------- room layout (percent of the 16:9 room) ----------

const NOTICE = { x: 3.6, y: 25, w: 9.5 };
const NOTICE_AT = { x: 8.4, y: 33 };
const SHELF_BY_FRIDGE = { name: 'wallShelf', width: 120, x: 18, y: 40, w: 8 };
const SHELF_SEAT = { x: 22, y: 43.3 };
const PHONE_SPOT = { x: 63, y: 17, w: 17.5, h: 58 };
const COUCH_SPOT = { x: 65, y: 33, w: 34, h: 46 };
const TV_SPOT = { x: 1, y: 21, w: 26, h: 30 };

const warmLife = e => e.state.life?.policyVersion==='five-slot-v1' ? ['early-evening','evening','late-evening'].includes(e.state.life.schedule.slot) : ['evening','lateNight'].includes(e.state.life?.phase);
const SCENES = {
  'kitchen-notice': (e) => ({ area: 'kitchen', framing: 'wide', light: e.state.life?.policyVersion==='five-slot-v1' && warmLife(e) ? 'warm' : 'neutral' }),
  'kitchen-breakfast': (e) => ({ area: 'kitchen', framing: e.state.life ? 'wide' : breakfastFraming(e.state.day), light: warmLife(e) ? 'warm' : 'window' }),
  'desk-phone': (e, offered) => ({ area: 'desk-side', light: e.state.life && !warmLife(e) ? 'window' : 'warm',
    ...(e.state.life ? { phone: lifePhoneScreen(e.state.life, e.state.tenPullCommitted, e.log.entries) }
      : offered ? { phone: { status: '6:40 PM', brand: 'MESSAGES', heading: ['Marisol'], body: ['Shift tonight?'], note: '' } } : {}) }),
  'desk-card': () => ({ area: 'desk-side', light: 'warm',
    phone: { status: '6:55 PM', brand: 'HARBOR CARD', heading: ['Cash', 'advance'], body: ['Available now'], note: '' } }),
  bedroom: (e) => ({ area: 'bedroom', light: e.state.life?.policyVersion==='five-slot-v1' && warmLife(e) ? 'warm' : 'neutral' }),
  living: (e) => ({ area: 'living', framing: 'wide', light: warmLife(e) ? 'warm' : 'neutral', furnishings: furnishingsFrom(e.state.assetsSold) }),
};

const WHEN = {
  'kitchen-notice': 'Day 2 · afternoon', 'desk-phone': 'Day 2 · late afternoon', 'desk-card': 'Day 2 · evening',
  living: 'Day 2 · late afternoon',
};
const PLACE_LABEL = {
  'kitchen-notice': 'The kitchen notice', 'kitchen-breakfast': 'The kitchen', 'desk-phone': 'The desk', living: 'The living room', bedroom: 'The bedroom', door: 'The door',
};

// ---------- posed duck ----------

const sideGaze = (base, target, { facing, size, perch, wedge } = {}) => ({
  view: 'side', facing: facing ?? (target.x < base.x ? 'left' : 'right'),
  lean: wedge ? leanToward(base, target, 25, 1) : 0, wedge, size, x: base.x, y: base.y, perch,
});

/** Where the kit would have drawn its own duck (base point and width, percent of the room), read from the SVG text. */
function kitBox(svg) {
  const fallback = { x: 50, y: 70, w: 10 };
  const vb = svg.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);
  const m = svg.match(/<svg\s+x="(-?[\d.]+)"\s+y="(-?[\d.]+)"\s+width="([\d.]+)"\s+height="([\d.]+)"\s+viewBox="0 0 360 270"/);
  if (!vb || vb.length < 4 || !m) return fallback;
  const [x, y, w, h] = m.slice(1).map(Number);
  return { x: ((x + (w * 176) / 360 - vb[0]) / vb[2]) * 100, y: ((y + (h * 250) / 270 - vb[1]) / vb[3]) * 100, w: (w / vb[2]) * 100 };
}

function poseFor(place, engine, kit, offer, ui) {
  switch (place) {
    case 'kitchen-notice': return sideGaze(SHELF_SEAT, NOTICE_AT, { size: 4, perch: SHELF_BY_FRIDGE });
    case 'desk-phone':
    case 'desk-card': return sideGaze(kit, { x: 71, y: 38 }, { facing: 'right', size: kit.w });
    case 'living': return engine.state.life
      ? engine.state.assetsSold.includes('couch')
        ? sideGaze({ x: 75, y: 52 }, { x: 14, y: 36 }, { facing: 'left', size: 8, perch: { name: 'wallShelf', width: 120, x: 68, y: 52, w: 18 } })
        : sideGaze({ x: 66.8, y: 47.4 }, { x: 14, y: 36 }, { facing: 'left', size: 8 })
      : offer === 'sell_tv' ? sideGaze(kit, { x: 14, y: 36 }, { facing: 'left', size: kit.w })
        : sideGaze({ x: 21, y: 63.5 }, { x: 80, y: 55 }, { facing: 'right', size: kit.w * 1.05 });
    case 'kitchen-breakfast': return sideGaze(kit, ui.noticeFocus ? NOTICE_AT : breakfastObjectBox(engine.state.life ? 1 : engine.state.day, { x: 28, y: 70, w: 0 }), { facing: ui.noticeFocus ? 'left' : 'right', size: kit.w });
    case 'bedroom': return sideGaze({ ...kit, y: kit.y + 5.5 }, { x: 50, y: 50 }, { facing: 'left', size: kit.w });
    default: return null;
  }
}

// ---------- view ----------

export function renderLifeView(container, engine, ui, callbacks, { active = true } = {}) {
  let destroyed = false;
  let busy = false;
  let committed = false;
  let closing = false;
  let heldEl = null;
  let popEl = null;
  let current = null; // { obj, hold } for the open held item or popover
  const timers = new Set();
  const anims = new Set();
  const reduced = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const root = document.createElement('div');
  root.className = 'life-view';
  container.innerHTML = '';
  container.append(root);
  const $ = (s, scope = root) => scope.querySelector(s);

  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!destroyed) fn(); }, ms); timers.add(t); return t; };
  const announce = (text) => { const el = $('.life-status'); if (el) el.textContent = text; };

  // ----- objects (layer 1) -----

  const offerOf = () => { try { return currentOffer(engine); } catch { return null; } };
  const offerDecision = () => { try { return ladderDecision(engine); } catch { return null; } };
  const rentAmount = () => engine.state.life?.policyVersion === 'five-slot-v1'
    ? (engine.checkDueObligations().bills.find(bill => bill.id.startsWith('rent-'))?.amountCents ?? 17000) / 100
    : engine.state.life?.config.rentAmount ?? RENT_AMOUNT;
  const noticeBeforeBreakfast = life => life?.policyVersion==='five-slot-v1'
    ? life.schedule.day===1 && life.schedule.slot==='morning' && !life.schedule.obligations['1:breakfast']
    : Boolean(life && life.day===1 && life.phase==='morning' && !life.meals['d1-breakfast']);
  const keysAvailable = (life) => {
    if(life?.policyVersion==='five-slot-v1') {
      const s=life.schedule,due=engine.checkDueObligations().bills;
      const rescue=s.overtimeReservation?.status==='reserved' && s.day<=s.overtimeReservation.day && due.some(bill=>bill.id===s.overtimeReservation.rentId) && !due.some(bill=>bill.id.startsWith('loan-'));
      return Boolean(s.slot==='midday' && s.employment.employed && s.workCalendar[String(s.day)] && !s.active && !s.recovery && !life.story47 && (!due.length || rescue));
    }
    return Boolean(life && life.phase === 'morning' && life.employed && life.meals[`d${life.day}-breakfast`] && !life.work && !life.recovery && life.rent.status !== 'due' && (life.rent.status !== 'overdue' || life.rentSurfaced));
  };

  function objectsFor(place) {
    const r = rentState(engine);
    const offer = offerOf();
    const out = [];
    if (engine.state.life && ['kitchen-notice', 'kitchen-breakfast'].includes(place)) {
      const life = engine.state.life;
      const five=life.policyVersion==='five-slot-v1';
      const available = five ? engine.prepareFiveSlotActivityStory('call_mom',`activity-preview:${engine.log.length}`).ok : callMomScheduled(life.day) && life.phase === 'evening' && !life.anchor && !life.work && !life.story47 && !life.recovery && life.meals[`d${life.day}-dinner`] && life.rent.status !== 'due' && (life.rent.status !== 'overdue' || life.rentSurfaced);
      const noteReason = five?'not available now':life.phase !== 'evening' || !callMomScheduled(life.day) ? 'not available now' : life.anchor ? 'evening activity already chosen' : life.recovery ? 'resolve recovery first' : life.rent.status === 'due' || (life.rent.status === 'overdue' && !life.rentSurfaced) ? 'resolve rent first' : !life.meals[`d${life.day}-dinner`] ? 'available after dinner' : 'not available now';
      out.push({ id: 'mom-note', x: 7, y: 50, w: 7, svg: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M5 8 L94 5 L96 91 L10 96 Z" fill="#f7de83" stroke="#685629" stroke-width="3"/><path d="M12 10 L89 8" stroke="#d8bb62" stroke-width="8"/><text x="50" y="48" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#392f20">Call</text><text x="50" y="70" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#392f20">Mom</text></svg>`,
        label: available ? 'Call Mom, available this evening, up to 5 health' : `Call Mom note, ${noteReason}`, chip: available ? 'Call Mom' : null, disabled: !available,
        hold: { mode: 'popover', side: 'right', kind: 'life-call-mom' } });
    }
    if (place === 'bedroom' && engine.state.life?.policyVersion==='five-slot-v1' && (engine.state.life.schedule.recovery || (engine.state.life.schedule.slot==='evening' && (!engine.state.life.schedule.active || engine.state.life.schedule.active.kind==='early-bed')) || (engine.state.life.schedule.slot==='late-evening' && !engine.state.life.schedule.active))) {
      const recovering=Boolean(engine.state.life.schedule.recovery), sleeping=engine.state.life.schedule.slot==='late-evening' && !recovering;
      out.push({id:'bed',hotspot:true,x:56,y:61,w:37,h:25,label:recovering?'Bed: recover':sleeping?'Bed: go to sleep':'Bed: turn in early',chip:recovering?'Rest':sleeping?'Sleep':'Turn in',done:false,
        hold:{mode:'popover',side:'left',kind:recovering?'five-slot-recovery':sleeping?'five-slot-sleep':'five-slot-bed'}});
    } else if (place === 'bedroom' && engine.state.life?.recovery) {
      out.push({ id: 'bed', hotspot: true, x: 56, y: 61, w: 37, h: 25, label: 'Bed', chip: 'Rest', done: false,
        hold: { mode: 'popover', side: 'left', kind: 'life-recovery' } });
    } else if (place === 'kitchen-notice') {
      const inactive=noticeBeforeBreakfast(engine.state.life);
      out.push({ id: 'notice', svg: tapedNotice({ idPrefix: uid('lfn'), state: r.paid ? 'paid' : r.owing ? 'read' : 'unread' }), ...NOTICE,
        label: inactive?'Rent notice, available after breakfast':worldLabels.rentNotice, chip: chips.rentNotice, disabled:inactive, done: r.paid || (!engine.state.life && r.owing),
        hold: engine.state.life?.policyVersion==='five-slot-v1' && engine.checkDueObligations().bills.length
          ? {mode:'five-due'} : { mode: 'held', kind: r.cash < rentAmount() ? 'shortfall' : 'rent', variant: 'letter' } });
    } else if (place === 'desk-phone') {
      if (engine.state.life) {
        const life = engine.state.life;
        const pendingLoan=life.policyVersion==='five-slot-v1' && life.finance.loans.find(loan=>loan.status==='pending');
        if(pendingLoan && !life.schedule.recovery) {
          out.push({id:'phone',hotspot:true,...PHONE_SPOT,label:'Phone: payday loan statement',chip:'Loan statement',done:false,hold:{mode:'five-payment',variant:'life-loan'}});
        } else {
          const context = lifePhoneKind(life);
          const work = context === 'work', unlocked = context === 'app';
          const kind = work ? 'life-work' : unlocked ? 'life-phone' : 'life-invite';
          out.push({ id: 'phone', hotspot: true, ...PHONE_SPOT,
            label: work ? 'Phone: work messages' : worldLabels.phone,
            chip: work ? 'Work' : unlocked ? 'Open Quackpot' : 'Launch invitation',
            done: lifePhoneResolved(life, engine.log.entries), hold: { mode: kind === 'life-phone' ? 'direct-phone' : 'held', kind, variant: kind } });
        }
        const phone = out.find(item => item.id === 'phone');
        if (life.policyVersion === 'five-slot-v1' && (life.social46?.revision === 1 || life.social46?.introShown) && !life.schedule.recovery && phone) {
          phone.hold = { mode: 'phone-menu', primary: phone.hold, primaryLabel: phone.chip || 'Open phone', primaryDisabled: Boolean(phone.done) };
          phone.label = 'Phone: choose an action'; phone.chip = 'Phone'; phone.done = false;
        }
        const schedule = life.schedule;
        const overtimeActive = life.policyVersion === 'five-slot-v1' && schedule.active?.kind === 'overtime';
        const overtimeReady = life.policyVersion === 'five-slot-v1' && schedule.slot === 'evening' && !schedule.active && schedule.overtimeReservation?.status === 'reserved' && schedule.overtimeReservation.day === schedule.day;
        const workKeysReady = keysAvailable(life), keyKind = overtimeActive ? 'five-overtime-finish' : overtimeReady ? 'five-overtime-start' : workKeysReady ? 'life-depart-keys' : null;
        if (keyKind || life.policyVersion === 'five-slot-v1') {
          const label = overtimeActive ? 'Keys: complete extra shift' : overtimeReady ? 'Keys: start extra shift' : 'Keys: leave for scheduled work';
          out.push({ id: 'work-keys', svg: workKeysTray(), x: 33.5, y: 70, w: 12.5, h: 9.5,
            ...(keyKind ? { label, chip: overtimeActive ? 'Complete extra shift' : overtimeReady ? 'Extra shift' : 'Work keys', hold: { mode: 'popover', side: 'right', kind: keyKind } } : { decorative: true, done: true }) });
        }
        if (life.policyVersion === 'five-slot-v1' && schedule.active?.kind === 'quiet') {
          const scene=renderScene({idPrefix:uid('lfquietactive'),...SCENES['desk-phone'](engine,false),duckView:'side',duck:true});
          const kit=kitBox(scene.svg);
          out.push({id:'active-quiet-duck',hotspot:true,x:Math.max(0,kit.x-kit.w/2),y:Math.max(0,kit.y-kit.w*1.5),w:kit.w,h:kit.w*1.5,label:'Duck: finish quiet time',chip:'Finish quiet time',hold:{mode:'popover',side:'left',kind:'five-quiet-finish'}});
        }
        if (life.policyVersion==='five-slot-v1' ? engine.prepareFiveSlotActivityStory('sit_duck',`activity-preview:${engine.log.length}`).ok : life.phase === 'evening' && !life.anchor && !life.recovery && life.meals[`d${life.day}-dinner`]) {
          const scene = renderScene({ idPrefix: uid('lfquiet'), ...SCENES['desk-phone'](engine, false), duckView: 'side', duck: true });
          const kit = kitBox(scene.svg);
          out.push({ id: 'quiet-duck', hotspot: true, x: Math.max(0, kit.x - kit.w / 2), y: Math.max(0, kit.y - kit.w * 1.5), w: kit.w, h: kit.w * 1.5,
            label: 'Sit with your duck, up to 5 health', chip: 'Sit with Duck · +5 HP', hold: { mode: 'popover', side: 'left', kind: 'life-quiet' } });
        }
        if (life.policyVersion==='five-slot-v1' && engine.fiveSlotQuietFallback().ok) {
          const scene=renderScene({idPrefix:uid('lffallback'),...SCENES['desk-phone'](engine,false),duckView:'side',duck:true});
          const kit=kitBox(scene.svg);
          out.push({id:'fallback-duck',hotspot:true,x:Math.max(0,kit.x-kit.w/2),y:Math.max(0,kit.y-kit.w*1.5),w:kit.w,h:kit.w*1.5,
            label:'Take a quiet break with your duck',chip:'Quiet break',hold:{mode:'popover',side:'left',kind:'five-slot-quiet-fallback'}});
        }
        return out;
      }
      const kind = offer === 'extra_shift' ? 'ladder' : 'shift';
      const ok = kind === 'ladder' ? !!offerDecision() : !!optionalShiftDecision(engine);
      if (ok) out.push({ id: 'phone', hotspot: true, ...PHONE_SPOT, label: worldLabels.phone, chip: chips.phone, done: false,
        hold: { mode: 'held', kind, variant: 'shift' } });
    } else if (place === 'desk-card') {
      out.push({ id: 'phone', hotspot: true, ...PHONE_SPOT, label: 'Phone: card offer', chip: 'Card offer', done: offer !== 'credit_card',
        hold: { mode: 'held', kind: 'ladder', variant: 'card' } });
    } else if (place === 'living') {
      if (engine.state.life) {
        const life = engine.state.life;
        if(life.policyVersion==='five-slot-v1') {
          if(life.schedule.recovery)return out;
          if (saleTagsAvailable(life,engine.state.cash)) {
            if(!life.sold.includes('couch'))out.push({id:'couch-sale',saleTag:true,x:68.5,y:66.5,w:5,h:10,label:'Sell the couch',svg:saleTag({idPrefix:uid('lft')}),done:false,hold:{mode:'popover',side:'left',kind:'life-sell-couch'}});
            if(!life.sold.includes('tv'))out.push({id:'tv-sale',saleTag:true,x:20,y:64,w:5,h:10,label:'Sell the TV',svg:saleTag({idPrefix:uid('lft')}),done:false,hold:{mode:'popover',side:'right',kind:'life-sell-tv'}});
          }
          return out;
        }
        if (life.recovery || life.rent.status === 'due' || (life.rent.status === 'overdue' && !life.rentSurfaced)) return out;
        const canSell = hasEnteredQuackpot(engine.log.entries);
        if (canSell && !life.sold.includes('couch')) out.push({ id: 'couch-sale', hotspot: true, ...COUCH_SPOT, w: COUCH_SPOT.w / 2,
          label: 'Couch: consider selling', chip: 'Couch', tag: saleTag({ idPrefix: uid('lft') }), done: false,
          hold: { mode: 'popover', side: 'left', kind: 'life-sell-couch' } });
        if (canSell && !life.sold.includes('tv')) out.push({ id: 'tv-sale', hotspot: true, ...TV_SPOT, label: 'TV: consider selling', chip: 'TV',
          tag: saleTag({ idPrefix: uid('lft') }), done: false, hold: { mode: 'popover', side: 'right', kind: 'life-sell-tv' } });
        return out;
      }
      if (offer === 'sell_couch' || (!offer && optionalOpen(engine) && optionalCouchDecision(engine))) {
        out.push({ id: 'couch', hotspot: true, ...COUCH_SPOT, label: worldLabels.couch, chip: chips.couch, tag: saleTag({ idPrefix: uid('lft') }), done: false,
          hold: { mode: 'popover', side: 'left', kind: offer ? 'ladder' : 'couch' } });
      }
      if (offer === 'sell_tv') {
        out.push({ id: 'tv', hotspot: true, ...TV_SPOT, label: 'The TV', chip: 'TV', tag: saleTag({ idPrefix: uid('lft') }), done: false,
          hold: { mode: 'popover', side: 'right', kind: 'ladder' } });
      }
    } else if (place === 'kitchen-breakfast') {
      if (engine.state.life) {
        const inactive=noticeBeforeBreakfast(engine.state.life);
        out.push({ id: 'notice', svg: tapedNotice({ idPrefix: uid('lfn'), state: r.paid ? 'paid' : r.owing ? 'read' : 'unread' }), ...NOTICE,
          label: inactive ? 'Rent notice, available after breakfast' : worldLabels.rentNotice, chip: chips.rentNotice,
          disabled: inactive, done: r.paid && !r.owing, hold: engine.state.life.policyVersion==='five-slot-v1' && engine.checkDueObligations().bills.length
            ? {mode:'five-due'} : { mode: 'held', kind: r.cash < rentAmount() ? 'shortfall' : 'rent', variant: 'letter' } });
      }
      const five=engine.state.life?.policyVersion==='five-slot-v1',schedule=five?engine.state.life.schedule:null;
      const mealAvailable = !engine.state.life || (five?['morning','early-evening'].includes(schedule.slot):['morning', 'evening'].includes(engine.state.life.phase));
      if (!mealAvailable) return out;
      const settled = breakfastState(engine).settled;
      const mealName = (five?schedule.slot==='early-evening':engine.state.life?.phase === 'evening') ? 'Dinner' : 'Breakfast';
      const mealBlocked = five?!engine.prepareFiveSlotAction({domain:'schedule',action:{type:'meal',choice:'skip',operationId:`meal-preview:${engine.log.length}`}}).ok
        :engine.state.life && (engine.state.life.rent.status === 'due' || (engine.state.life.rent.status === 'overdue' && !engine.state.life.rentSurfaced));
      const skipped = five?schedule.obligations[breakfastState(engine).billId]==='skip' : engine.state.life ? engine.state.life.meals[breakfastState(engine).billId] === 'skip'
        : engine.log.entries.some((entry) => entry.type === 'action' && entry.payload?.kind === 'breakfast_skipped'
          && entry.payload.billId === breakfastState(engine).billId);
      out.push(settled
        ? { id: 'bag', svg: skipped ? emptyPlate({ idPrefix: uid('lfb') }) : bakeryBag({ idPrefix: uid('lfb') }), ...breakfastObjectBox(engine.state.life ? 1 : engine.state.day, { x: 26, y: 50, w: 7 }), label: skipped ? `${mealName} skipped` : 'Meal bag', done: true }
        : { id: 'plate', svg: emptyPlate({ idPrefix: uid('lfp') }), ...breakfastObjectBox(engine.state.life ? 1 : engine.state.day, { x: 21, y: 66, w: 14 }), label: engine.state.life ? `${mealName} plate` : worldLabels.plate, chip: engine.state.life ? mealName : chips.plate, done: false, disabled: Boolean(mealBlocked),
          hold: { mode: 'popover', side: 'right', kind: offer && offerDecision() ? 'ladder' : 'breakfast' } });
    }
    return out;
  }

  // ----- decisions (layer 3): every commit goes through callbacks with the log length captured here -----

  const snapshot = () => ({ cash: engine.state.cash, health: engine.state.health, debt: engine.state.debt, assetsSold: [...engine.state.assetsSold], events: engine.log.length });
  const endedResult = () => ({ heading: 'This run has ended', lines: [`Rent stays ${money(RENT_AMOUNT)} unpaid. Your Receipt is next.`], ends: true });

  function decisionFor(kind) {
    const expectLog = engine.log.length;
    if(kind==='five-slot-recovery')return {spec:{heading:'Rest and recover?',lines:[`Rest restores up to ${engine.state.life.config.recoveryHealth} HP and takes this time slot.`],confirm:'Rest',back:'Not now'},accept:()=>{const result=callbacks.onFiveSlotRecover(expectLog);return result?.ok?{heading:'Rested',lines:[`Health: ${engine.state.health} HP.`]}:null;}};
    if(kind==='five-slot-sleep')return {spec:{heading:'Go to sleep?',lines:['Sleep until tomorrow morning.'],confirm:'Go to sleep',back:'Not now'},accept:()=>{callbacks.onFiveSlotSleep(expectLog);return null;}};
    if(kind==='five-slot-bed')return {spec:{heading:'Turn in early?',lines:[`Resting now restores up to ${engine.state.life.config.earlyBedHealth} HP and moves to morning.`],confirm:'Turn in',back:'Not now'},accept:()=>{const result=callbacks.onFiveSlotBed(expectLog);return result?.ok?{heading:'A new morning',lines:[`Health: ${engine.state.health} HP.`]}:null;}};
    if (kind === 'life-depart-keys') {
      return { spec: { heading: 'Head to work?', lines: [`Your scheduled shift pays ${money(engine.state.life.config.scheduledWage)} after completion.`, 'Leaving now begins the shift.'], confirm: 'Take the keys and go', back: 'Not now' },
        accept: () => { callbacks.onDepartWork(expectLog); return null; } };
    }
    if (kind === 'life-call-mom') {
      return { spec: { heading: 'Call Mom?', lines: ['This evening activity restores up to 5 HP after you finish.'], confirm: 'Call Mom', back: 'Not now' },
        accept: () => { callbacks.onBeginStoryActivity(expectLog, 'call_mom'); return null; } };
    }
    if (kind === 'five-slot-quiet-fallback') {
      return {spec:{heading:'Take a quiet break?',lines:['Spend this time slot quietly with your duck.'],confirm:'Take a break',back:'Not now'},
        accept:()=>{callbacks.onFiveSlotQuiet(expectLog);return null;}};
    }
    if (kind === 'five-quiet-finish') return {spec:{heading:'Finish your quiet break?',lines:['Finish this time slot.'],confirm:'Finish quiet time',back:'Not now'},accept:()=>{callbacks.onFiveSlotFinishQuiet(expectLog);return null;}};
    if (kind === 'five-overtime-start') return {spec:{heading:'Start your extra shift?',lines:[`Your reserved shift pays ${money(engine.state.life.config.overtimeWage)} when completed.`],confirm:'Start extra shift',back:'Not now'},accept:()=>{callbacks.onFiveSlotOvertime(expectLog);return null;}};
    if (kind === 'five-overtime-finish') return {spec:{heading:'Complete your extra shift?',lines:[`Complete the shift to earn ${money(engine.state.life.config.overtimeWage)}.`],confirm:'Complete extra shift',back:'Not now'},accept:()=>{callbacks.onFiveSlotFinishOvertime(expectLog);return null;}};
    if (kind === 'life-quiet') {
      return { spec: { heading: 'Sit with Duck?', lines: ['This evening activity restores up to 5 HP after you finish.'], confirm: 'Sit with Duck', back: 'Not now' },
        accept: () => { callbacks.onBeginStoryActivity(expectLog, 'sit_duck'); return null; } };
    }
    if (kind === 'life-leisure') {
      return { spec: { heading: 'Take a break?', lines: [`This is your evening activity and restores up to ${engine.state.life.config.leisureHealth} HP.`], confirm: 'Take a break', back: 'Not now' },
        accept: () => { const result = callbacks.onLeisure(expectLog); return result?.ok ? { heading: 'Break complete', lines: [`Health: ${engine.state.health} HP.`] } : null; } };
    }
    if (kind === 'life-sell-couch' || kind === 'life-sell-tv') {
      const asset = kind === 'life-sell-couch' ? 'couch' : 'tv'; const five=engine.state.life.policyVersion==='five-slot-v1';const amount = five?(asset==='couch'?30:40):(asset === 'couch' ? 10 : 15);
      const p = engine.state.life.social46?.pending;
      const context = asset === 'couch' && engine.state.life.social46?.couchContext && p?.committed && p.activity === 'game';
      const lines = [`Receive ${money(amount)}. This item will leave the apartment.`];
      if (context) lines.push(social46DisplayText('sale_disclosure', null, p.day, 0, five?engine.state.life.schedule.day:engine.state.life.day));
      return { spec: { heading: `Sell the ${asset === 'tv' ? 'TV' : asset}?`, lines, confirm: `Sell for ${money(amount)}`, back: 'Keep it' },
        accept: () => { const result = callbacks.onSell(expectLog, asset); return result?.ok ? { heading: 'Sale complete', lines: [`Cash on hand: ${money(engine.state.cash)}.`] } : null; } };
    }
    if (kind === 'life-recovery') {
      const life = engine.state.life;
      const done = life.recovery.recovered;
      return { spec: { heading: done ? 'Rest complete' : 'Rest for this phase',
        lines: [done ? 'Your recovery is complete. Continue when you are ready.' : `Recover up to ${life.config.recoveryHealth} HP. This uses the current phase.`],
        confirm: done ? 'Continue' : 'Rest', back: 'Not now' },
      accept: () => { const result = done ? callbacks.onFinishRecovery(expectLog) : callbacks.onRecover(expectLog);
        return result?.ok ? { heading: done ? 'Ready to continue' : 'Rested', lines: [`Health: ${engine.state.health} HP.`] } : null; } };
    }
    if (kind === 'life-work') {
      const life = engine.state.life;
      if(life.policyVersion==='five-slot-v1') {
        const active=life.schedule.active?.kind==='work';
        return {spec:{heading:'Scheduled shift',lines:[active?'Your shift is underway. Continue the work story to finish it.':`Your scheduled Midday shift pays ${money(life.config.scheduledWage)} after completion. Take the keys to leave for work.`],confirm:null,back:'Put it down'}};
      }
      const doing = Boolean(life.work);
      const overtime = doing ? life.work.kind === 'overtime' : life.phase === 'evening';
      const pay = overtime ? life.config.overtimeWage : life.config.scheduledWage;
      const spec = doing
        ? { heading: 'Your shift', lines: [`Finish your shift to receive ${money(pay)}.${overtime ? ` Overtime costs up to ${life.config.overtimeHealth} HP.` : ''}`], confirm: 'Complete shift', back: 'Put it down' }
        : { heading: overtime ? 'Evening overtime' : 'Scheduled shift', lines: [`Agree to work ${overtime ? 'this evening' : 'this afternoon'}. The shift pays ${money(pay)} after completion.${overtime ? ` It costs up to ${life.config.overtimeHealth} HP.` : ''}`], confirm: 'Agree to the shift', back: 'Put it down' };
      const unlocked = life.day > 1 || ['evening', 'lateNight'].includes(life.phase);
      if (unlocked) spec.decline = { label: 'Open Quackpot instead', endsRun: false };
      return { spec, ...(unlocked ? { decline: () => {
        const result = callbacks.onOpenPhone(expectLog);
        return result?.ok ? { heading: 'Opening Quackpot', lines: [] } : null;
      } } : {}), accept: () => {
        const result = doing ? callbacks.onCompleteWork(expectLog, life.work.id) : callbacks.onAgreeWork(expectLog, overtime ? 'overtime' : 'scheduled');
        if (!result?.ok) return null;
        return doing ? { heading: 'Shift complete', lines: workCompletionLines(result, engine.state, pay, overtime) }
          : { heading: 'Shift agreed', lines: ['Your shift is ready. Return to the message to complete it and receive pay.'] };
      } };
    }
    if (kind === 'life-invite') {
      const replied = engine.log.entries.some(e => e.type === 'action' && e.payload?.kind === 'launch_reply');
      return { spec: { heading: 'Quackpot launches tonight', lines: replied ? ['You’re on the list! Come back tonight for your free 10-pull.'] : ['Reply LAUNCH to get 10 free ducks when the pond opens.'], confirm: replied ? null : 'Reply “LAUNCH”', back: 'Put it down' },
        accept: () => {
          if (!replied && !callbacks.onReplyLaunch(expectLog)?.ok) return null;
          return { heading: 'Message sent', lines: ['You replied LAUNCH. Quackpot opens tonight.'] };
        } };
    }
    if (kind === 'rent' || kind === 'shortfall') {
      if(engine.state.life?.policyVersion==='five-slot-v1') {
        const rent=engine.state.life.finance.rents.find(bill=>bill.status==='pending');
        return {spec:{heading:rent?'Rent notice':'Rent paid',lines:rent
          ? [`${money(rent.amountCents/100)} is due on Day ${rent.due.day}.`]
          : ['No further rent is scheduled in this playtest.'],confirm:null,back:'Put it down'}};
      }
      if (engine.state.life) {
        const amount = rentAmount();
        const affordable = engine.state.cash >= amount;
        const due = engine.state.life.rent.status === 'due';
        const spec = affordable ? {
          heading: `Remaining rent: ${money(amount)}`,
          lines: [`The balance is ${rentDueText(engine.state.life)}.`, `Cash on hand: ${money(engine.state.cash)}. Paying leaves ${money(engine.state.cash - amount)}.`],
          confirm: `Pay ${money(amount)}`, back: 'Put it down',
          ...(due ? { decline: { label: 'Hold cash and leave rent unpaid', endsRun: false } } : {}),
        } : { heading: engine.state.life.rent.status === 'pending' ? 'Remaining rent balance' : due ? 'Rent due' : 'Rent is overdue',
          lines: [`The balance is ${rentDueText(engine.state.life)}: ${money(amount)}. You are currently ${money(amount - engine.state.cash)} short.`], confirm: engine.state.life.rent.status === 'pending' ? null : 'Continue', back: 'Put it down' };
        return { spec,
          accept: () => {
            if (!affordable) return { heading: engine.state.life.rent.status === 'pending' ? 'Rent remains unpaid' : due ? 'Rent is due' : 'Rent remains overdue', lines: ['You may pay when you have enough cash.'] };
            const result = callbacks.onPayRent(expectLog);
            if (!result?.ok) return null;
            return { heading: 'Rent paid', lines: [`Paid ${money(amount)}. Cash on hand: ${money(engine.state.cash)}.`] };
          },
          ...(due && affordable ? { decline: () => {
            const result = callbacks.onHoldRent(expectLog);
            return result?.ok ? { heading: 'Rent overdue', lines: [`Your ${money(engine.state.cash)} remains on hand.`] } : null;
          } } : {}),
        };
      }
      const spec = kind === 'rent' ? payRentDecision(engine) : shortfallDecision(engine);
      return { spec, accept: () => {
        if (callbacks.onPayRent(expectLog) === null) return null;
        const r = rentState(engine);
        return r.paid
          ? results.rentPaid({ amount: RENT_AMOUNT, cashAfter: engine.state.cash, wage: GAME_CONSTANTS.WAGE_DAILY })
          : { heading: `Rent unpaid · you need ${money(r.short)} more`, lines: ['Nothing has been taken.', 'Your first option to cover it is next.'] };
      } };
    }
    if (kind === 'ladder') {
      const spec = ladderDecision(engine);
      const before = snapshot();
      const foodBill = engine.state.activeBill?.kind === 'food';
      return { spec,
        accept: () => {
          if (callbacks.onLadderAccept(expectLog) === null) return null;
          if (foodBill) return {
            heading: engine.state.activeBill ? 'Breakfast still unresolved' : spec.step === 'skip_lunch' ? 'Going without breakfast' : 'Breakfast paid',
            lines: [`Health ${before.health} → ${engine.state.health}.`, `Cash on hand: ${money(engine.state.cash)}.`,
              engine.state.activeBill ? `Food bill still unpaid: ${money(engine.state.activeBill.amount)}.` : 'The food bill is resolved.'],
            ends: engine.isTerminal(),
          };
          const v = outcomeView(engine, { choice: spec.step, before });
          const lines = [...v.card.lines];
          const ends = engine.isTerminal();
          if (ends) lines.push('This run has ended. Your Receipt is next.');
          return { heading: v.card.heading, lines, ends };
        },
        decline: () => {
          if (callbacks.onLadderDecline(expectLog) === null) return null;
          if (engine.isTerminal()) return foodBill
            ? { heading: 'This run has ended', lines: ['The food bill remains unpaid. Your Receipt is next.'], ends: true }
            : endedResult();
          if (foodBill) return { heading: 'Turned down', lines: ['Breakfast remains unresolved. Your next option is waiting.'] };
          return { heading: 'Turned down', lines: [`Rent is still ${money(rentState(engine).short)} short. Your next option is waiting.`] };
        } };
    }
    if (kind === 'shift') {
      const spec = optionalShiftDecision(engine);
      return { spec, accept: () => {
        if (callbacks.onOptional(expectLog, 'extra_shift') === null) return null;
        return results.shiftTaken({ pay: spec.preview.effect.cash || spec.preview.delta.cash, healthAfter: engine.state.health, cashAfter: engine.state.cash });
      } };
    }
    if (kind === 'couch') {
      const spec = optionalCouchDecision(engine);
      return { spec, accept: () => {
        if (callbacks.onOptional(expectLog, 'sell_couch') === null) return null;
        return results.couchSold({ gain: spec.preview.effect.cash || spec.preview.delta.cash, cashAfter: engine.state.cash });
      } };
    }
    const isDinner=engine.state.life?.policyVersion==='five-slot-v1' ? engine.state.life.schedule.slot==='early-evening' : engine.state.life?.phase==='evening';
    const spec = breakfastDecision(engine);
    return { spec, decline: () => {
      const result = callbacks.onSkipBreakfast(expectLog);
      if (result === null || (!result.skipped && !result.alreadySettled)) return null;
      if (engine.state.life?.day === 1 && engine.state.life.phase === 'morning' && result.skipped) ui.pendingNoticeFocus = true;
      return { heading: isDinner ? 'Dinner skipped' : 'Breakfast skipped', lines: [`No cash spent. Health −${result.healthLost ?? 0} HP.`, `Cash on hand: ${money(engine.state.cash)}.`] };
    }, accept: () => {
      const res = callbacks.onBreakfast(expectLog);
      if (res === null) return null;
      if (engine.state.life?.day === 1 && engine.state.life.phase === 'morning' && res?.paid) ui.pendingNoticeFocus = true;
      return res?.paid || breakfastState(engine).settled
        ? isDinner ? { heading: 'Dinner bought', lines: [`Paid ${money(engine.state.life.config.mealCost)}. Cash on hand: ${money(engine.state.cash)}.`] }
          : results.breakfastBought({ amount: engine.state.life?.config.mealCost ?? BREAKFAST_AMOUNT, cashAfter: engine.state.cash })
        : { heading: 'Nothing bought', lines: ['There is not enough cash for breakfast. Nothing was taken.', `Cash on hand: ${money(engine.state.cash)}.`] };
    } };
  }

  const factLines = (lines) => lines.map((l) => `<p class="life-fact">${esc(l)}</p>`).join('');
  const actionsHtml = (spec) => `<div class="life-decide-actions">
      ${spec.confirm ? `<button type="button" class="life-btn" data-act="confirm">${esc(spec.confirm)}</button>` : ''}
      ${spec.decline ? `<button type="button" class="life-btn life-secondary${spec.decline.endsRun ? ' life-ends-run' : ''}" data-act="decline">${esc(spec.decline.label)}</button>` : ''}
      <button type="button" class="life-btn life-secondary" data-act="back">${esc(spec.back)}</button>
    </div>`;

  function guardedCommit(scope, which) {
    if (busy || committed || !current) return;
    busy = true;
    for (const b of scope.querySelectorAll('button')) b.disabled = true;
    let res;
    try {
      res = which === 'decline' ? current.dec.decline?.() : current.dec.accept();
    } catch (err) {
      console.error(err);
      res = null;
    }
    busy = false;
    if (destroyed) return;
    if (res === null || res === undefined) { ui.held = null; callbacks.onRefresh(); return; }
    committed = true;
    showResult(scope, res);
  }

  function showResult(scope, res) {
    const isPop = scope.classList.contains('life-popover');
    const done = isPop || res.ends ? 'Done' : 'Put it down';
    const hid = uid('lfh');
    const html = `<h3 id="${hid}" tabindex="-1">${esc(res.heading)}</h3>${factLines(res.lines)}
      <div class="life-decide-actions"><button type="button" class="life-btn" data-act="done">${esc(done)}</button></div>`;
    if (isPop) {
      scope.innerHTML = html;
      scope.setAttribute('aria-labelledby', hid);
    } else {
      scope.innerHTML = `<div class="life-decide-body life-result-body">${html}</div>`;
      scope.classList.add('life-result');
      if (current.hold.variant === 'life-invite') {
        const body = $('.life-phone-body', heldEl);
        if (body && !body.querySelector('.life-you')) body.insertAdjacentHTML('beforeend', '<p class="life-bubble life-you">LAUNCH</p><p class="life-bubble">You’re on the list! Come back tonight for your free 10-pull.</p>');
        if (active) callbacks.onLaunchAcknowledgmentShown();
      }
      if (rentState(engine).paid) $('.life-letter', heldEl)?.classList.add('life-stamped');
      if (current.hold.variant === 'shift' && !res.ends && /thank/i.test(res.heading)) {
        $('.life-phone-body', heldEl)?.insertAdjacentHTML('beforeend', '<p class="life-bubble life-you">I can cover it.</p><p class="life-bubble">thank you!!</p>');
      }
    }
    $('h3', scope).focus();
    announce(res.heading);
    renderDayBar(ui.place, { statusOnly: true }); // amounts reflect the committed state; moving on waits for Done
  }

  /** After a commit: clear what is held and let the controller render the new state. */
  function finish() {
    const ret = current ? { id: current.obj.id, place: ui.place } : null;
    const openedPhone = Boolean(engine.state.life && ['life_phone', 'life_gacha', 'life_race', 'life_race_result'].includes(engine.state.step));
    ui.held = null;
    ui.returnFocus = ret;
    if (ui.pendingNoticeFocus) {
      ui.pendingNoticeFocus = false; ui.noticeFocus = true; ui.fadeIn = true; ui.returnFocus = { id: 'notice', place: 'kitchen-breakfast' };
      if (!reduced()) { root.classList.add('life-focus-fade-out'); later(() => callbacks.onRefresh(), 140); return; }
    }
    callbacks.onRefresh();
    if (openedPhone) callbacks.onPhoneTransition();
  }

  // ----- motion -----

  function flip(fromEl, toEl, reverse = false) {
    if (reduced() || !fromEl || !toEl || !toEl.animate) return Promise.resolve();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    if (!a.width || !b.width) return Promise.resolve();
    const dx = a.left + a.width / 2 - (b.left + b.width / 2);
    const dy = a.top + a.height / 2 - (b.top + b.height / 2);
    const s = Math.max(0.05, a.width / b.width);
    const away = { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(-4deg)`, opacity: 0.2 };
    const cs = getComputedStyle(toEl).transform;
    const home = { transform: cs === 'none' ? 'none' : cs, opacity: 1 };
    const ms = reverse ? 220 : 320;
    const anim = toEl.animate(reverse ? [home, away] : [away, home], { duration: ms, easing: 'cubic-bezier(.2,.8,.2,1)', fill: reverse ? 'forwards' : 'backwards' });
    anims.add(anim);
    // A page that is not being drawn may never finish an animation; never let that block putting something down.
    const timeout = new Promise((resolve) => later(resolve, ms + 120));
    return Promise.race([anim.finished.catch(() => {}), timeout]).then(() => anims.delete(anim));
  }

  // ----- layer 2: held -----

  const letterHtml = (l, hid) => {
    const paragraph = (value, i) => {
      if (i !== 0 || !l.corrections?.length) return esc(value);
      const [before, after] = value.split('three');
      if (after === undefined) return esc(value);
      const readable = `Original three crossed out. Handwritten changes: ${l.corrections.join(', ')}.`;
      const additions = l.corrections.map((part, index) => `<span class="${index < l.corrections.length - 1 ? 'life-rent-crossed' : 'life-rent-written'}">${esc(part)}</span>`).join(' ');
      return `${esc(before)}<span class="life-visually-hidden">${esc(readable)}</span><span class="life-rent-crossed life-rent-printed" aria-hidden="true">three</span>${esc(after)} <span aria-hidden="true">${additions}</span>`;
    };
    return `<article class="life-letter">
      <p class="life-sender">${esc(l.sender)}</p>
      <h2 id="${hid}">${esc(l.heading)}</h2>
      ${l.paragraphs.map((p, i) => `<p>${paragraph(p, i)}</p>`).join('')}
      <footer>${esc(l.footer)}</footer>
    </article>`;
  };

  const phoneHtml = ({ status, app, body }, hid) => `<div class="life-phone-held"><div class="life-phone-screen">
      <div class="life-phone-status" aria-hidden="true"><span>${esc(status)}</span><span>● ● ●</span></div>
      <h2 class="life-phone-app-bar" id="${hid}">${esc(app)}</h2>
      <div class="life-phone-body">${body}</div>
    </div></div>`;

  function heldObjectHtml(hold, dec, hid) {
    if (hold.variant === 'letter') {
      if(engine.state.life?.policyVersion==='five-slot-v1') {
        return letterHtml(fiveSlotRentNotice(engine.state.life),hid);
      }
      return letterHtml(noticeLetter({ amount: rentAmount(), unit: '4B', dueText: engine.state.life ? 'due in three days' : rentDueText(null), corrections: rentNoticeCorrections(engine.state.life) }), hid);
    }
    if (hold.variant.startsWith('life-')) {
      const life = engine.state.life;
      const body = hold.variant === 'life-work'
        ? `<p class="life-bubble">${life.policyVersion==='five-slot-v1' ? (life.schedule.active?.kind==='work'?'Your shift is underway.':`Your scheduled Midday shift pays ${esc(money(life.config.scheduledWage))} when completed.`) : life.work ? 'Your shift is underway.' : life.phase === 'evening' ? `An evening shift pays ${esc(money(life.config.overtimeWage))} on completion.` : `Your scheduled afternoon shift pays ${esc(money(life.config.scheduledWage))} when completed.`}</p>`
        : hold.variant === 'life-invite' ? `<p class="life-bubble">Quackpot launches tonight! Reply LAUNCH to get 10 free ducks when the pond opens.</p>${engine.log.entries.some(e => e.type === 'action' && e.payload?.kind === 'launch_reply') ? '<p class="life-bubble life-you">LAUNCH</p><p class="life-bubble">You’re on the list! Come back tonight for your free 10-pull.</p>' : ''}` : '<p class="life-bubble">Quackpot is ready when you are.</p>';
      return phoneHtml({ status: life.policyVersion==='five-slot-v1'?life.schedule.slot:life.phase, app: hold.variant === 'life-work' ? 'Harbor Street Diner' : 'Messages', body }, hid);
    }
    if (hold.variant === 'card') {
      const c = cardApp({ available: dec.spec.preview.accept.effect.cash, owedNow: engine.state.debt });
      const body = `${c.rows.map(([k, v]) => `<div class="life-row"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}<p class="life-note">${esc(c.note)}</p>`;
      return phoneHtml({ status: '6:55 PM', app: c.app, body }, hid);
    }
    const pay = dec.spec.preview.accept?.effect.cash ?? dec.spec.preview.effect.cash;
    const body = marisolThread({ pay }).map((t) => `<p class="life-bubble${t.from === 'You' ? ' life-you' : ''}">${esc(t.text)}</p>`).join('');
    return phoneHtml({ status: '6:40 PM', app: 'Marisol · Harbor Street Diner', body }, hid);
  }

  const heldLabel = (hold) => (hold.variant === 'letter' ? 'Rent notice, held'
    : hold.variant === 'card' ? 'Phone, held: card app'
      : hold.variant?.startsWith('life-') ? 'Phone, held' : 'Phone, held: messages from Marisol');

  function focusHeldHeading(heading) {
    // Keep the beginning of a held object below the sticky HUD without letting
    // browser focus scrolling hide it behind that header on short viewports.
    heading.focus({preventScroll:true});
    const top=root.getBoundingClientRect().top;
    const hudBottom=document.querySelector('#hud-container')?.getBoundingClientRect().bottom ?? 0;
    if(top<hudBottom)window.scrollTo({top:Math.max(0,window.scrollY+top-hudBottom-8),behavior:'auto'});
  }

  const phoneSubviewKey = hold => `${hold?.mode ?? ''}:${hold?.kind ?? ''}:${hold?.variant ?? ''}`;

  function openHeld(obj, { instant = false, focus = true } = {}) {
    const dec = decisionFor(obj.hold.kind);
    if (!dec.spec) { ui.held = null; return; }
    const hold = obj.hold;
    current = { obj, hold, dec };
    committed = false;
    closing = false;
    ui.held = { obj: obj.id, place: ui.place, ...(obj.id === 'phone' ? { phoneSubview: phoneSubviewKey(hold) } : {}) };
    const hid = uid('lfh');
    const bodyId = uid('lfd');
    const expanded = !!ui.decideOpen;
    heldEl = $('.life-held');
    heldEl.classList.remove('life-payment-held');
    heldEl.innerHTML = `<div class="life-held-object">${heldObjectHtml(hold, dec, hid)}</div>
      <section class="life-decide">
        <button type="button" class="life-decide-toggle" data-act="toggle" aria-expanded="${expanded}" aria-controls="${bodyId}">Decide<span class="life-visually-hidden">: ${esc(dec.spec.heading)}</span></button>
        <div class="life-decide-body" id="${bodyId}"${expanded ? '' : ' hidden'}>
          <h3>${esc(dec.spec.heading)}</h3>${factLines(dec.spec.lines)}${actionsHtml(dec.spec)}
        </div>
      </section>`;
    heldEl.hidden = false;
    heldEl.setAttribute('role', 'dialog');
    heldEl.setAttribute('aria-modal', 'false');
    heldEl.setAttribute('aria-labelledby', hid);
    heldEl.removeAttribute('aria-label');
    if (active && hold.variant === 'life-invite') {
      callbacks.onInvitationShown();
      if (engine.log.entries.some(e => e.type === 'action' && e.payload?.kind === 'launch_reply')) callbacks.onLaunchAcknowledgmentShown();
      current.dec = decisionFor(hold.kind);
    }
    root.classList.add('life-is-held');
    $('.life-stage').inert = true;
    const heading = $(`#${hid}`, heldEl);
    heading.setAttribute('tabindex', '-1');
    if (!instant) flip(obj.el, heldEl.querySelector('.life-held-object > *'));
    if (focus) focusHeldHeading(heading);
  }

  // Rent and loan choices use the same held-object / Decide surface as other
  // apartment interactions. The due latch remains authoritative when closed.
  function openFivePayment(obj,{focus=true}={}) {
    const due=fiveSlotDueDecision(engine),loan=engine.state.life.finance.loans.find(item=>item.status==='pending');
    if(!due && !loan)return;
    const hid=uid('lfpayment'),isPhone=obj.hold.variant==='life-loan';
    const title=due ? due.heading : 'Payday loan statement';
    const lines=due ? due.lines : [`Outstanding balance: ${money(loan.totalCents/100)}.`, `Due Midday on Day ${loan.due.day}, before work.`, 'You may repay the full amount early.'];
    const object=isPhone
      ? phoneHtml({status:fiveSlotLabel(engine.state.life.schedule.slot),app:title,body:`<p class="life-bubble">${esc(money(loan.totalCents/100))}</p>`},hid)
      : letterHtml(fiveSlotRentNotice(engine.state.life),hid);
    current={obj,hold:obj.hold,dec:null};committed=false;closing=false;ui.held={obj:obj.id,place:ui.place,...(isPhone?{phoneSubview:phoneSubviewKey(obj.hold)}:{})};ui.fiveDueHidden=false;
    heldEl=$('.life-held');heldEl.classList.add('life-payment-held');
    heldEl.innerHTML=`<div class="life-held-object">${object}</div><section class="life-decide"><div class="life-decide-body"><h3>${esc(title)}</h3>${factLines(lines)}<div class="life-decide-actions"></div></div></section>`;
    heldEl.hidden=false;heldEl.setAttribute('role','dialog');heldEl.setAttribute('aria-modal','false');heldEl.setAttribute('aria-labelledby',hid);heldEl.removeAttribute('aria-label');
    root.classList.add('life-is-held');$('.life-stage').inert=true;
    const actions=$('.life-decide-actions',heldEl);
    const button=(label,handler,disabled=false)=>{const b=document.createElement('button');b.type='button';b.className='life-btn';b.textContent=label;b.disabled=!active||disabled;b.addEventListener('click',()=>{if(b.disabled)return;b.disabled=true;handler();});actions.append(b);};
    if(due) {
      for(const bill of due.bills) {
        button(`Pay ${bill.label} · ${money(bill.amountCents/100)}`,()=>{ui.returnFocus={place:ui.place,id:obj.id};callbacks.onFiveSlotPay(engine.log.length,bill.id);callbacks.onRefresh();},!bill.canPay);
        if(due.loanRentIds.includes(bill.id))button(`See loan terms for ${bill.label}`,()=>{callbacks.onFiveSlotLoan(engine.log.length,bill.id);callbacks.onRefresh();});
        button(`Leave ${bill.label} unpaid`,()=>{callbacks.onFiveSlotLeaveUnpaid(engine.log.length,bill.id);callbacks.onRefresh();});
      }
      if(due.overtimeAvailable) {
        const rent=due.bills.find(bill=>bill.id.startsWith('rent-')),label=document.createElement('label');label.textContent='Extra shift evening: ';
        const select=document.createElement('select');select.setAttribute('aria-label','Extra shift evening');const schedule=engine.state.life.schedule;
        for(let day=schedule.day;day<=schedule.day+7;day++) {
          const probe=engine.prepareFiveSlotAction({domain:'schedule',action:{type:'reserve-overtime',rentId:rent.id,day,reservationId:`rent-shift:${rent.id}`,operationId:`shift-preview:${day}`}});
          if(probe.ok){const option=document.createElement('option');option.value=String(day);option.textContent=`Day ${day} Evening`;select.append(option);}
        }
        label.append(select);actions.append(label);button('Reserve extra shift',()=>{callbacks.onFiveSlotReserve(engine.log.length,rent.id,Number(select.value));callbacks.onRefresh();},!select.options.length);
      }
      if(due.saleOptions.length)button('Inspect furniture in the living room',()=>{ui.held=null;ui.fiveDueHidden=true;ui.place='living';render();});
    } else if(loan)button(`Repay loan · ${money(loan.totalCents/100)}`,()=>{ui.returnFocus={place:ui.place,id:obj.id};callbacks.onFiveSlotEarlyRepay(engine.log.length,loan.id);callbacks.onRefresh();},Math.round(engine.state.cash*100)<loan.totalCents);
    if(isPhone)button('Open Quackpot',()=>{const result=callbacks.onOpenPhone(engine.log.length);if(result?.ok){ui.held=null;callbacks.onRefresh();callbacks.onPhoneTransition();}});
    button('Put it down',()=>{ui.fiveDueHidden=true;putDown();});
    if(active && due)callbacks.onFiveSlotDueShown();
    const heading=$(`#${hid}`,heldEl);heading.setAttribute('tabindex','-1');if(due && !isPhone)heading.setAttribute('aria-label',`Payment due: ${heading.textContent}`);if(focus)focusHeldHeading(heading);
  }

  async function putDown({ instant = false } = {}) {
    if (!heldEl || heldEl.hidden || closing) return;
    if (committed) { finish(); return; }
    closing = true;
    const held = heldEl, obj = current?.obj;
    const el = obj?.el;
    ui.held = null;
    if (!instant && !reduced()) await flip(el, held.querySelector('.life-held-object > *'), true);
    if (destroyed || heldEl !== held) return;
    heldEl.hidden = true;
    heldEl.innerHTML = '';
    heldEl.classList.remove('life-payment-held');
    root.classList.remove('life-is-held');
    $('.life-stage').inert = false;
    current = null;
    closing = false;
    if (active) (el && root.contains(el) ? el : $('.life-obj'))?.focus();
  }

  // ----- layer 3 (anchored): confirm at the object -----

  function openPopover(obj, { focus = true } = {}) {
    closePopover();
    let dec = decisionFor(obj.hold.kind);
    if (!dec.spec) return;
    current = { obj, hold: obj.hold, dec };
    committed = false;
    ui.held = { obj: obj.id, place: ui.place };
    const hid = uid('lfh');
    const side = obj.hold.side;
    const box = $('.life-box').getBoundingClientRect();
    const r = obj.el.getBoundingClientRect();
    const pop = document.createElement('section');
    pop.className = `life-popover life-arrow-${side === 'right' ? 'left' : 'right'}`;
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'false');
    pop.setAttribute('aria-labelledby', hid);
    pop.innerHTML = `<h3 id="${hid}" tabindex="-1">${esc(dec.spec.heading)}</h3>${factLines(dec.spec.lines)}${actionsHtml(dec.spec)}`;
    pop.style.top = `${Math.max(0, r.top - box.top - 8)}px`;
    if (side === 'right') pop.style.left = `${r.right - box.left + 14}px`;
    else pop.style.right = `${box.right - r.left + 14}px`;
    $('.life-popover-layer').append(pop);
    popEl = pop;
    const socialDisclosure = active && obj.hold.kind === 'life-sell-couch' && social46NeedsSaleDisclosure(fiveSlotSocialView(engine));
    if (socialDisclosure) {
      callbacks.onSocialShown({ type: 'social46_sale_shown', id: engine.state.life.social46.pending.id });
      dec = decisionFor(obj.hold.kind); current.dec = dec;
    }
    if (!socialDisclosure && !reduced() && pop.animate && focus) {
      const a = pop.animate([{ opacity: 0, transform: `translateX(${side === 'right' ? -8 : 8}px)` }, { opacity: 1, transform: 'none' }], { duration: 160, easing: 'ease-out' });
      anims.add(a);
    }
    if (focus) $('h3', pop).focus();
  }

  function closePopover({ refocus = false } = {}) {
    if (!popEl) return;
    const obj = current?.obj;
    popEl.remove();
    popEl = null;
    current = null;
    committed = false;
    ui.held = null;
    if (refocus && active && obj?.el && root.contains(obj.el)) obj.el.focus();
  }

  // ----- day bar -----

  function renderDayBar(place, { statusOnly = false } = {}) {
    const bar = $('.life-day-bar');
    const e = engine;
    const step = e.state.step;
    const r = rentState(e);
    const dueBills=e.state.life?.policyVersion==='five-slot-v1'?e.checkDueObligations().bills:[];
    const when = e.state.life?.policyVersion === 'five-slot-v1' ? `Day ${e.state.life.schedule.day} · ${fiveSlotLabel(e.state.life.schedule.slot)}`
      : e.state.life ? `Day ${e.state.life.day} · ${e.state.life.phase === 'lateNight' ? 'Late Night' : e.state.life.phase}`
      : place ? (isBreakfastStep(step) ? `Day ${e.state.day} · morning` : WHEN[place]) : `Day ${e.state.day}`;
    const status = dueBills.length>1 ? 'Payments due' : dueBills[0]?.id.startsWith('loan-') ? 'Loan payment due' : r.owing && e.state.life?.policyVersion === 'five-slot-v1' ? `Rent due · ${money(rentAmount())} unpaid`
      : r.owing && e.state.life ? `Rent ${e.state.life.rent.status === 'overdue' ? 'overdue' : 'due'} · ${money(rentAmount())} unpaid`
      : r.owing ? `Rent unpaid · ${money(r.short)} short`
      : RENT_STEPS.includes(step) ? (r.paid ? 'Rent paid' : `Rent due · ${money(rentAmount())}`)
        : null;
    bar.innerHTML = `<span class="life-when">${esc(when)}</span>${status ? `<span class="life-day-status">${esc(status)}</span>` : ''}`;
    if (place !== 'desk-phone' && keysAvailable(e.state.life)) { const cue = document.createElement('span'); cue.className = 'life-day-status'; cue.textContent = 'Your work keys are on the desk.'; bar.append(cue); }
    if (statusOnly) return;
    const rooms = document.createElement('div');
    rooms.className = 'life-room-nav';
    rooms.setAttribute('aria-label', 'Rooms');
    const actions = document.createElement('div');
    actions.className = 'life-day-actions';
    bar.append(rooms, actions);
    const control = (label, onClick, extra = '', group = actions) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `life-btn life-day-next${extra}`;
      btn.textContent = `${label} →`;
      btn.addEventListener('click', () => { if (busy) return; btn.disabled = true; onClick(btn); });
      group.append(btn);
      return btn;
    };
    const navigateRoom = (p) => {
      if (busy || !availablePlaces(e).includes(p) || p === place) return;
      ui.place = p; ui.held = null; ui.decideOpen = false; ui.noticeFocus = false;
      render();
      if (active) ($('.life-obj:not([aria-disabled])') ?? $('.life-day-bar button'))?.focus();
    };
    if (e.state.life?.policyVersion === 'five-slot-v1') renderRoomNavigation(rooms, availablePlaces(e).filter(p => p !== place && PLACE_LABEL[p]), navigateRoom);
    else for (const p of availablePlaces(e)) {
      if (p !== place && PLACE_LABEL[p]) control(PLACE_LABEL[p], () => navigateRoom(p), '', rooms);
    }
    if(e.state.life?.policyVersion==='five-slot-v1') {
      const schedule=e.state.life.schedule,expectLog=e.log.length;
      return;
    }
    if (e.state.life && ['life_work', 'life_evening'].includes(step)) {
      const expectLog = e.log.length;
      if (e.state.life.phase === 'evening') {
        const blocked = Boolean(e.state.life.anchor || e.state.life.recovery || !e.state.life.meals[`d${e.state.life.day}-dinner`]);
        const reason = e.state.life.anchor ? 'Evening activity already chosen.' : e.state.life.recovery ? 'Resolve recovery first.' : 'Choose dinner first.';
        // At the desk the duck itself is the active target; elsewhere this navigates to it.
        if (blocked || place !== 'desk-phone') {
          const duck = control('Sit with Duck · up to +5 HP', () => {
            ui.place = 'desk-phone'; ui.held = null; render();
            if (active) $('.life-obj[data-obj="quiet-duck"]')?.focus();
          });
          if (blocked) { duck.disabled = true; duck.title = reason; }
        }
        if (blocked) { const message = document.createElement('span'); message.className = 'life-activity-note'; message.textContent = reason; actions.append(message); }
      }
      if (place === 'desk-phone' && e.state.life.phase === 'evening' && e.state.life.employed && (!e.state.life.anchor || e.state.life.work?.kind === 'overtime')) {
        control('Work messages', (button) => {
          const phone = $('.life-obj[data-obj="phone"]');
          if (phone) openHeld({ id: 'phone', el: phone, hold: { mode: 'held', kind: 'life-work', variant: 'life-work' } });
          button.disabled = false;
        });
      }
      if (place === 'desk-phone' && (e.state.life.social46?.revision === 1 || e.state.life.social46?.introShown) && !e.state.life.recovery) {
        control('Messages: Ren', () => {
          const result = callbacks.onSocialOpen(e.log.length);
          if (result?.ok) { ui.renOpen = true; render(); }
        });
      }
      control(step === 'life_work' ? 'Continue to evening' : e.state.life.phase === 'lateNight' ? 'Finish Late Night' : 'Turn in for the night', () => { callbacks.onLifeAdvance(expectLog); ui.held = null; callbacks.onRefresh(); });
      if (e.state.life.phase === 'evening') control('Stay up for Late Night', () => { callbacks.onLateNight(expectLog); ui.held = null; callbacks.onRefresh(); });
      if (e.state.life.day >= 4) control('Finish run', () => { callbacks.onFinishLife(expectLog); ui.held = null; callbacks.onRefresh(); });
    }
    if (e.state.life && step === 'life_breakfast' && (e.state.life.social46?.revision === 1 || e.state.life.social46?.introShown) && place === 'desk-phone' && !e.state.life.recovery) {
      control('Messages: Ren', () => {
        const result = callbacks.onSocialOpen(e.log.length);
        if (result?.ok) { ui.renOpen = true; render(); }
      });
    }
    if (isBreakfastStep(step) && optionalOpen(e)) {
      const expectLog = e.log.length;
      control('Continue', () => { callbacks.onContinue(expectLog); ui.held = null; callbacks.onRefresh(); });
    }
    if (step === 'life_breakfast' && breakfastState(e).settled) {
      const expectLog = e.log.length;
      if (!e.state.life.employed || (e.state.life.day === 1 && !e.tutorialShiftVersion)) {
        control('Continue to afternoon', () => { callbacks.onContinue(expectLog); ui.held = null; callbacks.onRefresh(); });
      }
    }
    if (step === 'life_rent' && e.state.life.rent.status !== 'due') {
      const expectLog = e.log.length;
      control('Continue', () => { callbacks.onRentContinue(expectLog); ui.held = null; callbacks.onRefresh(); });
    } else if (RENT_STEPS.includes(step) && r.paid) {
      const expectLog = e.log.length;
      control('Go to work', () => { callbacks.onGoToWork(expectLog); ui.held = null; callbacks.onRefresh(); });
    }
  }

  // A committed phone session remains active until the player chooses to end it.
  function showPhoneSessionDecision() {
    const life = engine.state.life, schedule = life?.schedule;
    if (life?.policyVersion !== 'five-slot-v1' || schedule?.active?.kind !== 'session'
        || schedule.recovery || engine.checkDueObligations().bills.length) return false;
    const pending = engine.state.pendingReveals.some(draw => !draw.revealed);
    const slots = ['morning', 'midday', 'early-evening', 'evening', 'late-evening'];
    const nextIndex = (slots.indexOf(schedule.slot) + 1) % slots.length;
    const nextDay = schedule.day + (nextIndex === 0 ? 1 : 0);
    const held = $('.life-held');
    const titleId = uid('phone-session-decision');
    held.innerHTML = `<section class="life-decide"><div class="life-decide-body"><h3 id="${titleId}">Done with Quackpot?</h3><p>${pending ? 'Finish revealing your ducks before putting the phone away.' : `Putting the phone away moves to Day ${nextDay} · ${esc(fiveSlotLabel(slots[nextIndex]))}.`}</p><div class="life-decide-actions"><button type="button" class="life-btn" data-phone-session="return">Back to Quackpot</button>${pending ? '' : '<button type="button" class="life-btn" data-phone-session="finish">Put the phone away</button>'}</div></div></section>`;
    held.hidden = false;
    held.setAttribute('role', 'dialog'); held.setAttribute('aria-modal', 'false'); held.setAttribute('aria-labelledby', titleId);
    root.classList.add('life-is-held'); $('.life-stage').inert = true;
    const back = held.querySelector('[data-phone-session="return"]');
    const finish = held.querySelector('[data-phone-session="finish"]');
    back.disabled = !active;
    back.addEventListener('click', () => { if (back.disabled) return; back.disabled = true; const result = callbacks.onOpenPhone(engine.log.length); if (result?.ok) { callbacks.onRefresh(); callbacks.onPhoneTransition(); } else back.disabled = false; });
    if (finish) { finish.disabled = !active; finish.addEventListener('click', () => { if (finish.disabled) return; finish.disabled = true; callbacks.onFiveSlotFinishSession(engine.log.length); callbacks.onRefresh(); }); }
    if (active) back.focus();
    return true;
  }

  // ----- render -----

  function render() {
    popEl = null;
    heldEl = null;
    current = null;
    committed = false;
    closing = false;
    for (const a of anims) a.cancel?.();
    anims.clear();
    if(engine.state.life?.policyVersion==='five-slot-v1') {
      const bills=engine.checkDueObligations().bills,key=`${engine.state.life.schedule.recovery?'recovery:':''}${bills.map(bill=>bill.id).join('|')}`;
      if(key!==ui.fiveDueKey){ui.fiveDueKey=key;ui.fiveDueHidden=false;ui.held=null;
        if(bills.length && !engine.state.life.schedule.recovery){const loanDue=bills.some(bill=>bill.id.startsWith('loan-'));ui.place=loanDue?'desk-phone':'kitchen-breakfast';ui.held={obj:loanDue?'phone':'notice',place:ui.place};}}
    }
    ui.place = engine.state.life?.policyVersion === 'five-slot-v1' && engine.state.life.story47
      ? (ui.place || 'kitchen-breakfast') : placeFor(engine, ui.place);
    const place = ui.place;
    const offer = engine.state.life?.policyVersion === 'five-slot-v1' && engine.state.life.story47 ? null : offerOf();
    root.classList.remove('life-is-held');
    if (engine.state.life?.story47) {
      const story = engine.state.life.story47;
      renderStory47(root, story, {
        health: () => engine.state.health,
        day: () => engine.state.life.schedule?.day ?? engine.state.life.day,
        wage: (id) => engine.log.entries.find(e => e.type === 'income' && e.payload.kind === 'wage' && e.payload.transactionId === id)?.payload.amount,
        shown: (current) => callbacks.onStoryShown(current),
        advance: (current) => { callbacks.onStoryAdvance(engine.log.length, current); ui.held = null; callbacks.onRefresh(); },
      }, active);
      root.inert = !active;
      return;
    }
    if (engine.state.life?.social46?.scene) {
      const scene = engine.state.life.social46.scene;
      renderRenScene46(root, scene, {
        health: () => engine.state.health,
        tvSold: () => engine.state.life.sold.includes('tv'),
        shown: current => callbacks.onSocialShown({ type: 'social46_scene_shown', id: current.id }),
        advance: (current, choice) => {
          const type = current.stage !== 'scene' ? 'social46_dismiss' : current.dialogueVersion === 1 ? (choice === 'finish' ? 'social46_complete' : 'social46_scene_next') : current.beat < 2 ? 'social46_scene_next' : 'social46_complete';
          callbacks.onSocialAction(engine.log.length, { type, id: current.id, ...(choice ? { choice } : {}) });
          ui.renOpen = false; callbacks.onRefresh();
        },
      }, active);
      root.inert = !active;
      return;
    }
    if (ui.renOpen && engine.state.life?.social46) {
      renderRenChannel46(root, fiveSlotSocialView(engine), {
        shown: intent => callbacks.onSocialShown(intent),
        action: intent => { callbacks.onSocialAction(engine.log.length, intent); callbacks.onRefresh(); },
        close: () => {
          ui.renOpen = false; ui.returnFocus = { place: 'desk-phone', id: 'phone' }; callbacks.onRefresh();
        },
        goDoor: () => { ui.renOpen = false; ui.place = 'door'; render(); root.querySelector('.ren46-door-knock')?.focus(); },
      }, active);
      root.inert = !active;
      return;
    }
    if (place === 'door') {
      if (active && !engine.state.life.social46) callbacks.onDoorActivate(engine.log.length);
      let socialLife=fiveSlotSocialView(engine);
      const social = engine.state.life.social46;
      if (active && social?.revision === 2 && !social.introShown && !social.intro.open && !social.intro.node && social.intro.knockDay !== socialLife.day && social.intro.ignoredDay !== socialLife.day) {
        callbacks.onSocialShown({ type: 'social46_knock_shown' });
      }
      if (active && social46VisitAtDoor(socialLife) && !engine.state.life.social46.pending.arrival) {
        callbacks.onSocialShown({ type: 'social46_visit_knock_shown', id: engine.state.life.social46.pending.id });
      }
      socialLife=fiveSlotSocialView(engine);
      renderRenDoor46(root, socialLife, {
        action: intent => {
          callbacks.onSocialAction(engine.log.length, intent);
          render();
          if (active) root.querySelector('.ren46-door-decide button:not(:disabled), .ren46-door-knock:not(:disabled)')?.focus();
        },
        kitchen: () => { ui.place = 'kitchen-breakfast'; render(); root.querySelector('.life-obj:not([aria-disabled])')?.focus(); },
      }, active);
      renderDayBar(place);
      const intro = engine.state.life.social46?.intro;
      if (active && intro?.open && intro.node && !intro.shown.includes(intro.node)) callbacks.onSocialShown({ type: 'social46_intro_line_shown' });
      const pending = engine.state.life.social46?.pending;
      if (active && social46VisitAtDoor(socialLife) && pending?.arrival?.open && !pending.arrival.lineShown) callbacks.onSocialShown({ type: 'social46_visit_arrival_shown', id: pending.id, lookVersion: 1 });
      if (active && social46VisitAtDoor(socialLife) && pending?.arrival?.open && !pending.seatingConfirmed && pending.floorPromptDay !== socialLife.day) callbacks.onSocialShown({ type: 'social46_floor_shown', id: pending.id });
      root.inert = !active;
      return;
    }
    if (!place || !SCENES[place]) {
      root.innerHTML = '<div class="life-stage"><p class="life-empty">Nothing to do here right now.</p><div class="life-day-bar"></div></div><p class="life-status life-visually-hidden" role="status" aria-live="polite"></p>';
      renderDayBar(null);
      root.inert = !active;
      return;
    }
    const offered = place === 'desk-phone' && (offer === 'extra_shift' || (!offer && optionalOpen(engine)));
    const opts = SCENES[place](engine, offered);
    const { svg } = renderScene({ idPrefix: uid('lfs'), ...opts, duck: false });
    const objects = objectsFor(place);
    let duck = '';
    {
      const kit = place === 'kitchen-notice' ? { x: 50, y: 70, w: 10 } : kitBox(renderScene({ idPrefix: uid('lfk'), ...opts, duckView: 'side', duck: true }).svg);
      let pose = poseFor(place, engine, kit, offer, ui);
      // Conscience at ease: with nothing left to do here, the duck turns to face you where it sits.
      if (pose && objects.every((o) => o.done)) pose = { ...pose, view: 'front', lean: 0, wedge: undefined, facing: 'left' };
      duck = pose ? duckPoseHtml(pose, uid('lfd')) : '';
    }
    root.innerHTML = `<div class="life-stage">
        <div class="life-room" data-place="${esc(place)}">
          <div class="life-box">
            <div class="life-scene">${svg}</div>
            <div class="life-duck-layer">${duck}</div>
            <div class="life-objects"></div>
          </div>
          <div class="life-popover-layer"></div>
        </div>
        <div class="life-day-bar"></div>
      </div>
      <div class="life-held" hidden></div>
      <p class="life-status life-visually-hidden" role="status" aria-live="polite"></p>`;
    if (ui.fadeIn) { root.classList.add('life-focus-fade-in'); ui.fadeIn = false; }
    const layer = $('.life-objects');
    if (objects.some(o => o.saleTag)) {
      const lines = `${objects.some(o => o.id === 'tv-sale' && o.saleTag) ? '<line x1="22" y1="51" x2="20" y2="64" />' : ''}${objects.some(o => o.id === 'couch-sale' && o.saleTag) ? '<line x1="65.5" y1="60" x2="68.5" y2="66.5" />' : ''}`;
      layer.insertAdjacentHTML('beforeend', `<svg class="life-sale-leaders" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>`);
    }
    for (const o of objects) {
      if (o.decorative) {
        const decoration = document.createElement('span');
        decoration.className = 'life-obj life-inactive';
        decoration.dataset.decoration = o.id;
        decoration.setAttribute('aria-hidden', 'true');
        Object.assign(decoration.style, { left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, pointerEvents: 'none' });
        decoration.innerHTML = o.svg;
        layer.append(decoration);
        continue;
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `life-obj${o.saleTag ? ' life-sale-tag' : ''}${o.hotspot ? ' life-hotspot' : ''}${o.done ? ' life-done' : ''}${o.disabled ? ' life-inactive' : ''}${o.id === 'notice' && ui.noticeFocus ? ' life-notice-focus' : ''}`;
      b.dataset.obj = o.id;
      Object.assign(b.style, { left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, ...(o.h ? { height: `${o.h}%` } : {}) });
      b.setAttribute('aria-label', o.done ? `${o.label} (done)` : o.label);
      b.innerHTML = `${o.svg ?? ''}${o.tag ? `<span class="life-tag" aria-hidden="true">${o.tag}</span>` : ''}${o.chip && !o.done && !(o.id === 'notice' && o.disabled) ? `<span class="life-chip" aria-hidden="true">${esc(o.chip)}</span>` : ''}`;
      // Resolved one-time targets remain visible, but no longer invite another interaction.
      if (o.done || o.disabled || !o.hold) { b.setAttribute('aria-disabled', 'true'); b.disabled = true; }
      else b.addEventListener('click', () => { if (!busy && !closing && !committed) activate(o); });
      o.el = b;
      layer.append(b);
    }
    renderDayBar(place);
    root.inert = !active;

    if (showPhoneSessionDecision()) return;

    // Restore a held view (after Uninstall→Stay or Settings close) instantly, without animation.
    if (ui.held && ui.held.place === place) {
      const o = objects.find((x) => x.id === ui.held.obj && !x.done && x.hold);
      if (o) {
        if (o.hold.mode === 'phone-menu' && !ui.fiveDueHidden && engine.checkDueObligations().bills.length && o.hold.primary.mode === 'five-payment') openFivePayment({...o,hold:o.hold.primary},{focus:active});
        else if (o.hold.mode === 'phone-menu' && ui.held.phoneSubview === phoneSubviewKey(o.hold.primary) && o.hold.primary.mode === 'five-payment') openFivePayment({...o,hold:o.hold.primary},{focus:active});
        else if (o.hold.mode === 'phone-menu' && ui.held.phoneSubview === phoneSubviewKey(o.hold.primary) && o.hold.primary.mode === 'held') openHeld({...o,hold:o.hold.primary},{instant:true,focus:active});
        else if (o.hold.mode === 'phone-menu') openPhoneMenu(o,{focus:active});
        else if (['five-due','five-payment'].includes(o.hold.mode)) openFivePayment(o,{focus:active});
        else if (o.hold.mode === 'popover') openPopover(o, { focus: active });
        else openHeld(o, { instant: true, focus: active });
      } else ui.held = null;
    } else ui.held = null;
    // Focus lands on the object after a commit's refresh, only when the player just acted here.
    if (ui.returnFocus) {
      const rf = ui.returnFocus;
      ui.returnFocus = null;
      if (active && !ui.held) {
        ((rf.place === place ? $(`.life-obj[data-obj="${rf.id}"]:not([aria-disabled])`) : null) ?? $('.life-obj:not([aria-disabled])') ?? $('.life-day-bar button'))?.focus();
      }
    }
  }

  function openPhoneMenu(obj, { focus = true } = {}) {
    closePopover();
    current = { obj, hold: obj.hold }; ui.held = { obj: obj.id, place: ui.place };
    const box = $('.life-box').getBoundingClientRect(), r = obj.el.getBoundingClientRect(), pop = document.createElement('section'), hid = uid('lfphone-menu');
    pop.className = 'life-popover life-arrow-right'; pop.setAttribute('role','dialog'); pop.setAttribute('aria-modal','false'); pop.setAttribute('aria-labelledby',hid);
    pop.innerHTML = `<h3 id="${hid}" tabindex="-1">Phone</h3><div class="life-decide-actions"><button type="button" class="life-btn" data-phone-menu="primary">${esc(obj.hold.primaryLabel)}</button><button type="button" class="life-btn" data-phone-menu="ren">Messages: Ren</button><button type="button" class="life-btn life-secondary" data-phone-menu="back">Put it down</button></div>`;
    pop.style.top = `${Math.max(0,r.top-box.top-8)}px`; pop.style.right = `${box.right-r.left+14}px`; $('.life-popover-layer').append(pop); popEl = pop;
    const primary=pop.querySelector('[data-phone-menu=primary]'); primary.disabled = !active || obj.hold.primaryDisabled;
    primary.addEventListener('click',()=>{if(primary.disabled)return;const original={...obj,hold:obj.hold.primary};closePopover();activate(original);});
    const ren=pop.querySelector('[data-phone-menu=ren]');ren.disabled=!active;ren.addEventListener('click',()=>{if(ren.disabled)return;ren.disabled=true;const result=callbacks.onSocialOpen(engine.log.length);if(result?.ok){ui.held=null;ui.renOpen=true;callbacks.onRefresh();}else ren.disabled=false;});
    pop.querySelector('[data-phone-menu=back]').addEventListener('click',()=>closePopover({refocus:true}));
    if(focus && active)pop.querySelector('h3').focus();
  }

  function activate(o) {
    if (o.id === 'notice') { ui.noticeFocus = false; o.el?.classList.remove('life-notice-focus'); }
    if(o.hold.mode==='phone-menu') openPhoneMenu(o);
    else if(['five-due','five-payment'].includes(o.hold.mode)) openFivePayment(o);
    else if (o.hold.mode === 'direct-phone') {
      const result = callbacks.onOpenPhone(engine.log.length);
      if (result?.ok) { callbacks.onRefresh(); callbacks.onPhoneTransition(); }
    } else if (o.hold.mode === 'popover') openPopover(o);
    else openHeld(o);
  }

  // ----- events -----

  root.addEventListener('click', (ev) => {
    if (!active) return;
    const held = $('.life-held');
    if (held && ev.target === held && !busy) { putDown(); return; } // clicking the dimmed backdrop puts it down
    const actEl = ev.target.closest?.('[data-act]');
    const act = actEl?.dataset.act;
    if (act) {
      const scope = actEl.closest('.life-popover') ?? actEl.closest('.life-decide');
      if (act === 'toggle') {
        const open = actEl.getAttribute('aria-expanded') !== 'true';
        actEl.setAttribute('aria-expanded', String(open));
        const body = $('.life-decide-body', scope);
        body.hidden = !open;
        ui.decideOpen = open;
        if (open) { const h = $('h3', body); h.setAttribute('tabindex', '-1'); h.focus(); }
      } else if (act === 'back') {
        if (popEl) closePopover({ refocus: true }); else putDown();
      } else if (act === 'confirm') guardedCommit(scope, 'accept');
      else if (act === 'decline') guardedCommit(scope, 'decline');
      else if (act === 'done') finish();
      return;
    }
    // Clicking away from an open anchored confirm closes it; nothing is committed.
    if (popEl && !popEl.contains(ev.target) && !ev.target.closest('.life-obj') && !committed) closePopover({ refocus: false });
  });

  const onKeydown = (ev) => {
    if (ev.key !== 'Escape' || !active || destroyed || busy) return;
    if (ui.renOpen) {
      ev.preventDefault(); ui.renOpen = false; ui.returnFocus = { place: 'desk-phone', id: 'phone' }; callbacks.onRefresh();
    } else if (heldEl && !heldEl.hidden) { ev.preventDefault(); putDown(); }
    else if (popEl) {
      ev.preventDefault();
      if (committed) finish(); else closePopover({ refocus: true });
    }
  };
  document.addEventListener('keydown', onKeydown);

  render();

  return {
    destroy() {
      destroyed = true;
      document.removeEventListener('keydown', onKeydown);
      for (const t of timers) clearTimeout(t);
      timers.clear();
      for (const a of anims) a.cancel?.();
      anims.clear();
      root.remove();
    },
  };
}
